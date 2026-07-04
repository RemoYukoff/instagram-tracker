// Extension-wide config: auto-scan schedule and rate-limiter timing. Lives in
// chrome.storage.local (not the IndexedDB in db.ts) -- it's plain key/value
// config, not data with its own schema, so it doesn't need the versioned
// object-store treatment the tracked data gets.

export interface ScanSettings {
  autoScanEnabled: boolean;
  autoScanIntervalHours: number;
  baseDelayMs: number;
  baseJitterMin: number;
  baseJitterMax: number;
  microPauseMinMs: number;
  microPauseMaxMs: number;
  longPauseEveryNCycles: number;
  longPauseMs: number;
  longPauseJitterMs: number;
}

// Same values as the previous hardcoded rate-limiter defaults -- at least as
// conservative as the reference tool's fetch-side defaults, re-validated here
// rather than assumed still safe.
export const DEFAULT_SETTINGS: ScanSettings = {
  autoScanEnabled: true,
  autoScanIntervalHours: 24,
  baseDelayMs: 1000,
  baseJitterMin: 1.0,
  baseJitterMax: 1.3,
  microPauseMinMs: 500,
  microPauseMaxMs: 2000,
  longPauseEveryNCycles: 7,
  longPauseMs: 10_000,
  longPauseJitterMs: 5000,
};

export const SETTINGS_STORAGE_KEY = "settings";

export async function getSettings(): Promise<ScanSettings> {
  const stored = await chrome.storage.local.get(SETTINGS_STORAGE_KEY);
  return { ...DEFAULT_SETTINGS, ...(stored[SETTINGS_STORAGE_KEY] as Partial<ScanSettings> | undefined) };
}

export async function saveSettings(settings: ScanSettings): Promise<void> {
  await chrome.storage.local.set({ [SETTINGS_STORAGE_KEY]: settings });
}
