import type { UnfollowerView } from "../storage/derived";
import { AccountRow } from "./AccountRow";
import { RemoveIcon } from "./icons/RemoveIcon";

interface Props {
  entries: UnfollowerView[];
  onRemove: (accountId: string) => void;
  onClearAll: () => void;
}

export function UnfollowersList({ entries, onRemove, onClearAll }: Props) {
  return (
    <section class="column column--red">
      <h2>
        Unfollowers <span class="count">{entries.length}</span>
      </h2>
      {entries.length === 0 ? (
        <p class="empty">No unfollowers detected yet.</p>
      ) : (
        <>
          <button class="text-link" onClick={onClearAll}>
            Clear all
          </button>
          <ul class="account-list">
            {entries.map((entry) => (
              <AccountRow
                key={entry.accountId}
                account={entry.account}
                fallbackId={entry.accountId}
                meta={
                  <>
                    <span class="detected-at">{new Date(entry.detectedAt).toLocaleDateString()}</span>
                    <button
                      class="icon-btn icon-btn--remove"
                      title="Remove from unfollowers"
                      aria-label="Remove from unfollowers"
                      onClick={() => onRemove(entry.accountId)}
                    >
                      <RemoveIcon />
                    </button>
                  </>
                }
              />
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
