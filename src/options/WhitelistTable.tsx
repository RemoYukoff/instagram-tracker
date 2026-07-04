import type { WhitelistView } from "../storage/derived";
import { AccountRow } from "./AccountRow";
import { RemoveIcon } from "./icons/RemoveIcon";

interface Props {
  entries: WhitelistView[];
  onRemove: (accountId: string) => void;
}

export function WhitelistTable({ entries, onRemove }: Props) {
  if (entries.length === 0) {
    return <p class="empty">No whitelisted accounts.</p>;
  }
  return (
    <ul class="account-list">
      {entries.map((entry) => (
        <AccountRow
          key={entry.accountId}
          account={entry.account}
          fallbackId={entry.accountId}
          meta={
            <button
              class="icon-btn icon-btn--remove"
              title="Remove from whitelist"
              aria-label="Remove from whitelist"
              onClick={() => onRemove(entry.accountId)}
            >
              <RemoveIcon />
            </button>
          }
        />
      ))}
    </ul>
  );
}
