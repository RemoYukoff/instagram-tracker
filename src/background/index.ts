import type { ScanBroadcast, StartScanRequest, StartScanResponse } from "../shared/messages";
import { getSettings, SETTINGS_STORAGE_KEY } from "../storage/settings";
import { runScan } from "./run-scan";

// The options page is the real UI, so a toolbar-icon click opens it directly
// instead of just logging scan results to the service worker console.
chrome.action.onClicked.addListener(() => {
  chrome.runtime.openOptionsPage();
});

const DAILY_SCAN_ALARM = "auto-scan";

// Re-derives the alarm from current settings rather than diffing against the
// previous ones -- chrome.alarms.create overwrites any existing alarm of the
// same name, so this is idempotent and safe to call from multiple triggers
// (install, browser startup, settings change) without tracking prior state.
async function configureAutoScanAlarm(): Promise<void> {
  const settings = await getSettings();
  if (!settings.autoScanEnabled) {
    await chrome.alarms.clear(DAILY_SCAN_ALARM);
    return;
  }
  await chrome.alarms.create(DAILY_SCAN_ALARM, { periodInMinutes: settings.autoScanIntervalHours * 60 });
}

chrome.runtime.onInstalled.addListener(() => void configureAutoScanAlarm());
chrome.runtime.onStartup.addListener(() => void configureAutoScanAlarm());

// The options page writes settings straight to chrome.storage.local (no
// message round-trip) -- this is how the background picks up the change.
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && SETTINGS_STORAGE_KEY in changes) void configureAutoScanAlarm();
});

// Guards against two overlapping scans (e.g. the options page's button clicked
// twice, or the daily alarm firing mid manual-scan) -- there's no per-scan
// queue, just a single in-flight flag.
let scanning = false;

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name !== DAILY_SCAN_ALARM || scanning) return;
  scanning = true;
  void runScanAndBroadcast();
});

chrome.runtime.onMessage.addListener((message: StartScanRequest, _sender, sendResponse) => {
  if (message?.type !== "start-scan") return false;

  if (scanning) {
    sendResponse({ status: "already-running" } satisfies StartScanResponse);
    return false;
  }

  scanning = true;
  sendResponse({ status: "started" } satisfies StartScanResponse);
  void runScanAndBroadcast();
  return false;
});

function broadcast(message: ScanBroadcast): void {
  // Rejects with "Could not establish connection" when no extension page is open
  // to receive it -- harmless, the options page re-reads current state from
  // storage whenever it next opens.
  void chrome.runtime.sendMessage(message).catch(() => {});
}

async function runScanAndBroadcast(): Promise<void> {
  try {
    const result = await runScan((accountsFetched, page, totalCount) => {
      broadcast({ type: "scan-progress", page, accountsFetched, totalCount });
    });
    broadcast({
      type: "scan-complete",
      takenAt: result.takenAt,
      followingCount: result.followingCount,
      nonFollowerCount: result.nonFollowers.length,
      newUnfollowerCount: result.unfollowerIds.length,
    });
  } catch (err) {
    broadcast({ type: "scan-error", message: err instanceof Error ? err.message : String(err) });
  } finally {
    scanning = false;
  }
}
