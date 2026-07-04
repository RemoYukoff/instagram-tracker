import { fetchFullFollowingList } from "../instagram-client";
import type { UserNode } from "../shared/types";
import { upsertAccounts } from "../storage/accounts";
import { getNonFollowers } from "../storage/derived";
import { getState, saveState } from "../storage/state";
import { upsertUnfollowers } from "../storage/unfollowers";
import { pruneWhitelist } from "../storage/whitelist";

export interface ScanResult {
  takenAt: number;
  followingCount: number;
  nonFollowers: UserNode[];
  unfollowerIds: string[];
}

// Only the following list is fetched (unfollower tracking is scoped to mutuals).
// Non-followers is recomputed wholesale from this scan's following list every time.
// Unfollowers is a
// plain diff of previous.mutualIds against this scan's mutualIds (read before it's
// overwritten) — anyone who was mutual last scan and isn't now gets flagged. This
// also flags accounts the user unfollowed themselves (a known, accepted trade-off:
// distinguishing "they unfollowed me" from "I unfollowed them, and they may have
// also removed me as a follower" would require a separate followers-list fetch to
// disambiguate, which was deliberately left out).
export async function runScan(
  onProgress?: (accountsFetched: number, page: number, totalCount: number) => void,
): Promise<ScanResult> {
  const following = await fetchFullFollowingList(onProgress);

  await upsertAccounts(following);

  const takenAt = Date.now();
  const followingIds = following.map((n) => n.id);
  const currentMutualIds = new Set(following.filter((n) => n.followsViewer).map((n) => n.id));

  // Drop whitelist entries for accounts no longer followed, so a later unfollow +
  // re-follow makes the user decide again instead of the old whitelisting silently
  // still applying.
  await pruneWhitelist(followingIds);

  const previous = await getState();

  let unfollowerIds: string[] = [];
  if (previous) {
    unfollowerIds = previous.mutualIds.filter((id) => !currentMutualIds.has(id));
    await upsertUnfollowers(unfollowerIds, takenAt);
  }

  await saveState({ takenAt, followingIds, mutualIds: [...currentMutualIds] });

  // Recomputed via the same storage-backed view the options page reloads on open
  // (storage/derived.ts) rather than filtered here again, so the two never drift.
  const nonFollowers = await getNonFollowers();

  return {
    takenAt,
    followingCount: following.length,
    nonFollowers,
    unfollowerIds,
  };
}
