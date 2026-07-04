// At least as conservative as the reference tool's fetch-side defaults
// (timeBetweenSearchCycles + its per-cycle micro-pause, and a longer pause every
// 7th cycle), re-validated here rather than assumed still safe. Not yet exposed
// as user-configurable settings — these are hardcoded conservative defaults for
// now.
const BASE_DELAY_MS = 1000;
const BASE_JITTER_MIN = 1.0;
const BASE_JITTER_MAX = 1.3;
const MICRO_PAUSE_MIN_MS = 500;
const MICRO_PAUSE_MAX_MS = 2000;
const LONG_PAUSE_EVERY_N_CYCLES = 7;
const LONG_PAUSE_MS = 10_000;
const LONG_PAUSE_JITTER_MS = 5000;

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Call after fetching page `cycle` (1-indexed) and before fetching the next one.
export async function pacedDelay(cycle: number): Promise<void> {
  const base = BASE_DELAY_MS * randomBetween(BASE_JITTER_MIN, BASE_JITTER_MAX);
  const micro = randomBetween(MICRO_PAUSE_MIN_MS, MICRO_PAUSE_MAX_MS);
  await sleep(base + micro);

  if (cycle % LONG_PAUSE_EVERY_N_CYCLES === 0) {
    const jitter = randomBetween(-LONG_PAUSE_JITTER_MS, LONG_PAUSE_JITTER_MS);
    await sleep(LONG_PAUSE_MS + jitter);
  }
}
