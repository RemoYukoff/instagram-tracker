import type { UserNode } from "../shared/types";
import { getDsUserId } from "./cookies";
import { fetchFollowingPage } from "./graphql";
import { pacedDelay } from "./rate-limiter";

// Hard cap enforced in code (not just a UI suggestion), guarding against a
// cursor/pagination bug looping forever. 250 pages * 24/page = 6000 accounts, well
// above any real personal account this tool is scoped for.
const MAX_PAGES_PER_SCAN = 250;

export class PageCapExceededError extends Error {
  constructor() {
    super(`Exceeded the ${MAX_PAGES_PER_SCAN}-page hard cap for a single scan.`);
    this.name = "PageCapExceededError";
  }
}

// Sequential, paced fetch of every page of the following list — no parallel
// fan-out. Any error from fetchFollowingPage (rate-limited, shape-changed, etc.)
// propagates immediately and halts the scan — no retry-into-a-block. onProgress
// fires after each page is appended, letting a caller surface scan progress in
// the UI; purely informational, no effect on the fetch itself.
// totalCount is Instagram's own edge.count from that page's response -- the same
// value on every page, just handy to pass along each time rather than separately.
export async function fetchFullFollowingList(
  onProgress?: (accountsFetched: number, page: number, totalCount: number) => void,
): Promise<UserNode[]> {
  const viewerId = await getDsUserId();
  const nodes: UserNode[] = [];
  let after: string | null = null;
  let cycle = 0;

  while (true) {
    cycle += 1;
    if (cycle > MAX_PAGES_PER_SCAN) {
      throw new PageCapExceededError();
    }

    const page = await fetchFollowingPage(viewerId, after);
    nodes.push(...page.nodes);
    onProgress?.(nodes.length, cycle, page.count);

    if (!page.hasNextPage) break;
    after = page.endCursor;
    await pacedDelay(cycle);
  }

  return nodes;
}
