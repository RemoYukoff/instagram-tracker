// chrome.runtime messaging contract between the options page and the background
// service worker — the only network/scan trigger lives in the background, the
// UI only ever asks it to start a scan and listens for progress.

export interface StartScanRequest {
  type: "start-scan";
}

export interface StartScanResponse {
  status: "started" | "already-running";
}

export interface ScanProgressMessage {
  type: "scan-progress";
  page: number;
  accountsFetched: number;
  totalCount: number;
}

export interface ScanCompleteMessage {
  type: "scan-complete";
  takenAt: number;
  followingCount: number;
  nonFollowerCount: number;
  newUnfollowerCount: number;
}

export interface ScanErrorMessage {
  type: "scan-error";
  message: string;
}

// Broadcast from background to whichever extension pages are open -- the options
// page re-reads full result lists from storage on scan-complete rather than
// having them pushed in the message.
export type ScanBroadcast = ScanProgressMessage | ScanCompleteMessage | ScanErrorMessage;
