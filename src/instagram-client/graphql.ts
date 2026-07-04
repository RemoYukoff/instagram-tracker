import type { ConnectionPage, UserNode } from "../shared/types";
import { HttpError, RateLimitedError, ResponseShapeError } from "./errors";

// Query hash live-verified 2026-07-03 against instagram.com. This is the one
// file to update if Instagram rotates/deprecates it. Only the
// "following" connection is fetched — unfollower tracking is scoped to mutuals
// (people I follow whose followsViewer flips false), so the separate "followers"
// query isn't needed.
const QUERY_HASH = "3dec7e2c57367ef3da3d987d89f9dbc8";
const EDGE_KEY = "edge_follow";
const PAGE_SIZE = 24; // Confirmed 24 live, not the reference repo's 50.

function buildUrl(viewerId: string, after: string | null): string {
  const variables: Record<string, unknown> = {
    id: viewerId,
    include_reel: false,
    fetch_mutual: false,
    first: PAGE_SIZE,
  };
  if (after) {
    variables.after = after;
  }
  const params = new URLSearchParams({
    query_hash: QUERY_HASH,
    variables: JSON.stringify(variables),
  });
  return `https://www.instagram.com/graphql/query/?${params.toString()}`;
}

function toUserNode(node: unknown): UserNode {
  if (typeof node !== "object" || node === null) {
    throw new ResponseShapeError("edge.node was not an object");
  }
  const n = node as Record<string, unknown>;
  if (typeof n.id !== "string" || typeof n.username !== "string") {
    throw new ResponseShapeError("node missing required id/username fields");
  }
  if (typeof n.follows_viewer !== "boolean") {
    throw new ResponseShapeError("node missing required follows_viewer field");
  }
  return {
    id: n.id,
    username: n.username,
    fullName: typeof n.full_name === "string" ? n.full_name : "",
    profilePicUrl: typeof n.profile_pic_url === "string" ? n.profile_pic_url : "",
    isVerified: n.is_verified === true,
    isPrivate: n.is_private === true,
    followsViewer: n.follows_viewer,
  };
}

export async function fetchFollowingPage(viewerId: string, after: string | null = null): Promise<ConnectionPage> {
  const url = buildUrl(viewerId, after);
  const response = await fetch(url, { credentials: "include" });

  if (response.status === 429) {
    throw new RateLimitedError(response.status);
  }
  if (!response.ok) {
    throw new HttpError(response.status, response.statusText);
  }

  const body = await response.json();
  const edge = body?.data?.user?.[EDGE_KEY];
  if (typeof edge !== "object" || edge === null) {
    throw new ResponseShapeError(`data.user.${EDGE_KEY} missing`);
  }

  const pageInfo = edge.page_info;
  if (typeof pageInfo?.has_next_page !== "boolean") {
    throw new ResponseShapeError("edge.page_info.has_next_page missing");
  }
  if (!Array.isArray(edge.edges)) {
    throw new ResponseShapeError("edge.edges is not an array");
  }

  return {
    count: typeof edge.count === "number" ? edge.count : edge.edges.length,
    hasNextPage: pageInfo.has_next_page,
    endCursor: typeof pageInfo.end_cursor === "string" ? pageInfo.end_cursor : null,
    nodes: edge.edges.map((e: unknown) => toUserNode((e as Record<string, unknown>)?.node)),
  };
}
