import type { UserNode } from "../shared/types";
import { AccountRow } from "./AccountRow";
import { ApproveIcon } from "./icons/ApproveIcon";

interface Props {
  accounts: UserNode[];
  onAddToWhitelist: (accountId: string) => void;
}

export function NonFollowersTable({ accounts, onAddToWhitelist }: Props) {
  if (accounts.length === 0) {
    return <p class="empty">No data yet — run a scan.</p>;
  }
  return (
    <ul class="account-list">
      {accounts.map((account) => (
        <AccountRow
          key={account.id}
          account={account}
          fallbackId={account.id}
          meta={
            <button
              class="icon-btn icon-btn--approve"
              title="Add to whitelist"
              aria-label="Add to whitelist"
              onClick={() => onAddToWhitelist(account.id)}
            >
              <ApproveIcon />
            </button>
          }
        />
      ))}
    </ul>
  );
}
