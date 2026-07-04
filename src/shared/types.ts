// Confirmed field set on the live "following" query — we only ever fetch this
// one connection, so every field below is always present, none are conditional
// on which query returned them.
export interface UserNode {
  id: string;
  username: string;
  fullName: string;
  profilePicUrl: string;
  isVerified: boolean;
  isPrivate: boolean;
  followsViewer: boolean; // does this account (that I follow) follow me back
}

export interface ConnectionPage {
  count: number;
  hasNextPage: boolean;
  endCursor: string | null;
  nodes: UserNode[];
}

// A single overwritten row (not a growing history): just the diff base for the
// next scan's unfollower check. mutualIds is the subset of the following list
// where followsViewer was true last scan — tracking that set over time is how we
// notice someone I still follow stopped following me back (this only catches
// mutuals, not every follower). followingIds is the full list from that same
// scan; it exists so the options page can recompute "current non-followers"
// (followingIds minus mutualIds) on page load straight from storage, without
// re-hitting Instagram just to redisplay the last scan's result — the `accounts`
// store is an ever-growing cache and can't be used for this on its own since it
// never prunes accounts that drop out of a later scan.
export interface TrackerState {
  takenAt: number;
  followingIds: string[];
  mutualIds: string[];
}

// Single flat list, purely a non-followers-view display filter.
export interface WhitelistEntry {
  accountId: string;
  addedAt: number;
}

// Persistent, NOT derived on read. Keyed by accountId; a scan upserts (bumping
// detectedAt) rather than duplicating rows. Survives state reverting (a
// re-follow does not remove an existing entry) — only a manual clear/delete does.
export interface UnfollowerEntry {
  accountId: string;
  detectedAt: number;
}
