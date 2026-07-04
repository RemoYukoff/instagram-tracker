import type { UnfollowerEntry } from "../shared/types";
import { getDb } from "./db";

// Upsert: bump detectedAt on an existing entry rather than duplicating rows;
// never touched by anything except a new detection or a manual clear/delete, so
// a re-follow does not remove a prior entry.
export async function upsertUnfollowers(accountIds: string[], detectedAt: number): Promise<void> {
  if (accountIds.length === 0) return;
  const db = await getDb();
  const tx = db.transaction("unfollowers", "readwrite");
  for (const accountId of accountIds) {
    const entry: UnfollowerEntry = { accountId, detectedAt };
    await tx.store.put(entry);
  }
  await tx.done;
}

export async function listUnfollowers(): Promise<UnfollowerEntry[]> {
  const db = await getDb();
  return db.getAll("unfollowers");
}

export async function removeUnfollower(accountId: string): Promise<void> {
  const db = await getDb();
  await db.delete("unfollowers", accountId);
}

export async function clearUnfollowers(): Promise<void> {
  const db = await getDb();
  await db.clear("unfollowers");
}
