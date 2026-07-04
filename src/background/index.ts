import type { ScanBroadcast, StartScanRequest, StartScanResponse } from "../shared/messages";
import { runScan } from "./run-scan";

// The options page is the real UI, so a toolbar-icon click opens it directly
// instead of just logging scan results to the service worker console.
chrome.action.onClicked.addListener(() => {
  chrome.runtime.openOptionsPage();
});

// Guards against two overlapping scans (e.g. the options page's button clicked
// twice) -- there's no per-scan queue, just a single in-flight flag.
let scanning = false;

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
