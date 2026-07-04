import type { WhitelistEntry } from "../shared/types";
import { getDb } from "./db";

export async function addToWhitelist(accountId: string): Promise<void> {
  const db = await getDb();
  const entry: WhitelistEntry = { accountId, addedAt: Date.now() };
  await db.put("whitelist", entry);
}

export async function removeFromWhitelist(accountId: string): Promise<void> {
  const db = await getDb();
  await db.delete("whitelist", accountId);
}

export async function listWhitelist(): Promise<WhitelistEntry[]> {
  const db = await getDb();
  return db.getAll("whitelist");
}

// Called once per scan (run-scan.ts) with that scan's following list: drops any
// whitelist entry for an account no longer followed. Otherwise an unfollow +
// re-follow later would silently keep the old whitelisting in effect instead of
// letting the user decide again.
export async function pruneWhitelist(followingIds: string[]): Promise<void> {
  const keep = new Set(followingIds);
  const db = await getDb();
  const tx = db.transaction("whitelist", "readwrite");
  const stale = (await tx.store.getAll()).filter((entry) => !keep.has(entry.accountId));
  await Promise.all(stale.map((entry) => tx.store.delete(entry.accountId)));
  await tx.done;
}
