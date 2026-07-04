import { useCallback, useEffect, useState } from "preact/hooks";
import type { UserNode } from "../shared/types";
import type { ScanBroadcast } from "../shared/messages";
import {
  DEFAULT_SETTINGS,
  getNonFollowers,
  getSettings,
  getState,
  getUnfollowerViews,
  getWhitelistViews,
  saveSettings,
  type ScanSettings,
  type UnfollowerView,
  type WhitelistView,
} from "../storage";
import { clearUnfollowers, removeUnfollower } from "../storage/unfollowers";
import { addToWhitelist, removeFromWhitelist } from "../storage/whitelist";
import { SettingsIcon } from "./icons/SettingsIcon";
import { Settings } from "./Settings";
import { SwitchableColumn } from "./SwitchableColumn";
import { UnfollowersList } from "./UnfollowersList";

type ScanStatus =
  | { phase: "idle" }
  | { phase: "scanning"; page: number; accountsFetched: number; totalCount: number | null }
  | { phase: "error"; message: string };

export function App() {
  const [nonFollowers, setNonFollowers] = useState<UserNode[]>([]);
  const [unfollowers, setUnfollowers] = useState<UnfollowerView[]>([]);
  const [whitelist, setWhitelist] = useState<WhitelistView[]>([]);
  const [takenAt, setTakenAt] = useState<number | null>(null);
  const [scanStatus, setScanStatus] = useState<ScanStatus>({ phase: "idle" });
  const [settings, setSettings] = useState<ScanSettings>(DEFAULT_SETTINGS);
  const [showSettings, setShowSettings] = useState(false);

  const reload = useCallback(async () => {
    const [state, nf, uf, wl] = await Promise.all([
      getState(),
      getNonFollowers(),
      getUnfollowerViews(),
      getWhitelistViews(),
    ]);
    setTakenAt(state?.takenAt ?? null);
    setNonFollowers(nf);
    setUnfollowers(uf);
    setWhitelist(wl);
  }, []);

  useEffect(() => {
    void reload();
    void getSettings().then(setSettings);
  }, [reload]);

  useEffect(() => {
    function onMessage(message: ScanBroadcast) {
      if (message.type === "scan-progress") {
        setScanStatus({
          phase: "scanning",
          page: message.page,
          accountsFetched: message.accountsFetched,
          totalCount: message.totalCount,
        });
      } else if (message.type === "scan-complete") {
        setScanStatus({ phase: "idle" });
        void reload();
      } else if (message.type === "scan-error") {
        setScanStatus({ phase: "error", message: message.message });
      }
    }
    chrome.runtime.onMessage.addListener(onMessage);
    return () => chrome.runtime.onMessage.removeListener(onMessage);
  }, [reload]);

  const startScan = useCallback(async () => {
    setScanStatus({ phase: "scanning", page: 0, accountsFetched: 0, totalCount: null });
    await chrome.runtime.sendMessage({ type: "start-scan" });
    // Response ("started" vs "already-running") isn't branched on -- either way,
    // progress/complete broadcasts from the in-flight scan drive this status.
  }, []);

  const handleRemoveUnfollower = useCallback(
    async (accountId: string) => {
      await removeUnfollower(accountId);
      await reload();
    },
    [reload],
  );

  const handleClearUnfollowers = useCallback(async () => {
    if (!confirm(`Clear all ${unfollowers.length} unfollower entr${unfollowers.length === 1 ? "y" : "ies"}?`)) return;
    await clearUnfollowers();
    await reload();
  }, [reload, unfollowers.length]);

  const handleRemoveWhitelist = useCallback(
    async (accountId: string) => {
      await removeFromWhitelist(accountId);
      await reload();
    },
    [reload],
  );

  const handleAddToWhitelist = useCallback(
    async (accountId: string) => {
      await addToWhitelist(accountId);
      await reload();
    },
    [reload],
  );

  const handleSaveSettings = useCallback(async (next: ScanSettings) => {
    await saveSettings(next);
    setSettings(next);
    setShowSettings(false);
  }, []);

  const scanning = scanStatus.phase === "scanning";

  return (
    <main>
      <section class="scan-control">
        <button class="scan-btn" onClick={() => void startScan()} disabled={scanning}>
          {scanning ? "Scanning…" : "Scan now"}
        </button>
        {scanning && (
          <span class="status">
            Fetching page {scanStatus.page}… (
            {typeof scanStatus.totalCount === "number"
              ? `${scanStatus.accountsFetched}/${scanStatus.totalCount}`
              : scanStatus.accountsFetched}
            )
          </span>
        )}
        {scanStatus.phase === "error" && <span class="status status--error">Scan failed: {scanStatus.message}</span>}
        {takenAt !== null && <span class="status">Last scan {new Date(takenAt).toLocaleString()}</span>}
        <button
          class="icon-btn settings-toggle"
          title="Settings"
          onClick={() => setShowSettings(true)}
        >
          <SettingsIcon />
        </button>
      </section>

      {showSettings && (
        <Settings settings={settings} onSave={(s) => void handleSaveSettings(s)} onClose={() => setShowSettings(false)} />
      )}

      <div class="columns">
        <SwitchableColumn
          nonFollowers={nonFollowers}
          whitelist={whitelist}
          onAddToWhitelist={handleAddToWhitelist}
          onRemoveFromWhitelist={handleRemoveWhitelist}
        />
        <UnfollowersList entries={unfollowers} onRemove={handleRemoveUnfollower} onClearAll={handleClearUnfollowers} />
      </div>

      <p class="disclaimer">
        <span class="disclaimer__label">Notice</span>
        Reads your own logged-in Instagram session via private, undocumented endpoints — against
        Instagram's Terms of Service, at your account's own risk (temporary blocks, checkpoints, or
        suspension are possible). Read-only: no follow/unfollow action is ever taken.
      </p>
    </main>
  );
}
