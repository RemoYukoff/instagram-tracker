import type { TrackerState } from "../shared/types";
import { getDb } from "./db";

// Single overwritten row — not a growing history. Just the diff base for the
// next scan's unfollower check.
const STATE_KEY = "current";

export async function getState(): Promise<TrackerState | undefined> {
  const db = await getDb();
  return db.get("state", STATE_KEY);
}

export async function saveState(state: TrackerState): Promise<void> {
  const db = await getDb();
  await db.put("state", state, STATE_KEY);
}
