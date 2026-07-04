import type { UserNode } from "../shared/types";
import { getDb } from "./db";

export async function upsertAccounts(nodes: UserNode[]): Promise<void> {
  const db = await getDb();
  const tx = db.transaction("accounts", "readwrite");
  await Promise.all(nodes.map((node) => tx.store.put(node)));
  await tx.done;
}

export async function getAccount(id: string): Promise<UserNode | undefined> {
  const db = await getDb();
  return db.get("accounts", id);
}

// Every node ever seen across any scan -- an ever-growing cache, never pruned when
// an account drops out of a later scan (still needed to display who an old
// UnfollowerEntry refers to). Never used on its own to derive "current
// non-followers" -- see TrackerState.followingIds in shared/types.ts for why.
export async function listAccounts(): Promise<UserNode[]> {
  const db = await getDb();
  return db.getAll("accounts");
}
