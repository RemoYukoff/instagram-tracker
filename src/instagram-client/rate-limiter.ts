import type { ScanSettings } from "../storage/settings";

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Call after fetching page `cycle` (1-indexed) and before fetching the next one.
export async function pacedDelay(cycle: number, settings: ScanSettings): Promise<void> {
  const base = settings.baseDelayMs * randomBetween(settings.baseJitterMin, settings.baseJitterMax);
  const micro = randomBetween(settings.microPauseMinMs, settings.microPauseMaxMs);
  await sleep(base + micro);

  if (cycle % settings.longPauseEveryNCycles === 0) {
    const jitter = randomBetween(-settings.longPauseJitterMs, settings.longPauseJitterMs);
    await sleep(settings.longPauseMs + jitter);
  }
}
