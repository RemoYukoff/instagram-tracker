// Read-side views recomputed from persisted storage -- not stored themselves, so
// a scan and a later options-page load always agree: both call these instead of
// duplicating the whitelist/mutual filtering logic.
import type { UserNode } from "../shared/types";
import { listAccounts } from "./accounts";
import { getState } from "./state";
import { listUnfollowers } from "./unfollowers";
import { listWhitelist } from "./whitelist";

// Current-state view: this scan's following list minus mutuals minus whitelist.
// Empty until a first scan has run (no TrackerState yet).
export async function getNonFollowers(): Promise<UserNode[]> {
  const state = await getState();
  if (!state) return [];

  const accounts = await listAccounts();
  const byId = new Map(accounts.map((account) => [account.id, account]));
  const mutualIds = new Set(state.mutualIds);
  const whitelistIds = new Set((await listWhitelist()).map((entry) => entry.accountId));

  const nonFollowers: UserNode[] = [];
  for (const id of state.followingIds) {
    if (mutualIds.has(id) || whitelistIds.has(id)) continue;
    const account = byId.get(id);
    if (account) nonFollowers.push(account);
  }
  return nonFollowers;
}

export interface UnfollowerView {
  accountId: string;
  detectedAt: number;
  account: UserNode | undefined;
}

// Durable accumulator view, joined with the accounts cache for display and
// sorted most-recently-detected first.
export async function getUnfollowerViews(): Promise<UnfollowerView[]> {
  const [entries, accounts] = await Promise.all([listUnfollowers(), listAccounts()]);
  const byId = new Map(accounts.map((account) => [account.id, account]));
  return entries
    .map((entry) => ({ accountId: entry.accountId, detectedAt: entry.detectedAt, account: byId.get(entry.accountId) }))
    .sort((a, b) => b.detectedAt - a.detectedAt);
}

export interface WhitelistView {
  accountId: string;
  addedAt: number;
  account: UserNode | undefined;
}

// A single flat list, joined with the accounts cache for display.
export async function getWhitelistViews(): Promise<WhitelistView[]> {
  const [entries, accounts] = await Promise.all([listWhitelist(), listAccounts()]);
  const byId = new Map(accounts.map((account) => [account.id, account]));
  return entries
    .map((entry) => ({ accountId: entry.accountId, addedAt: entry.addedAt, account: byId.get(entry.accountId) }))
    .sort((a, b) => b.addedAt - a.addedAt);
}
