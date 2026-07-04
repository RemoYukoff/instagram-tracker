import { useState } from "preact/hooks";
import type { UserNode } from "../shared/types";
import type { WhitelistView } from "../storage/derived";
import { NonFollowersTable } from "./NonFollowersTable";
import { WhitelistTable } from "./WhitelistTable";

interface Props {
  nonFollowers: UserNode[];
  whitelist: WhitelistView[];
  onAddToWhitelist: (accountId: string) => void;
  onRemoveFromWhitelist: (accountId: string) => void;
}

type Tab = "nonfollowers" | "whitelist";

// Non-followers and whitelisted share a column, switched by tab, rather than
// each getting their own -- the whitelist is really just "non-followers you've
// dismissed", so flipping between the two reads more like one lens than two
// separate lists.
export function SwitchableColumn({ nonFollowers, whitelist, onAddToWhitelist, onRemoveFromWhitelist }: Props) {
  const [tab, setTab] = useState<Tab>("nonfollowers");

  return (
    <section class={tab === "nonfollowers" ? "column column--amber" : "column column--olive"}>
      <div class="tabs">
        <button
          class={tab === "nonfollowers" ? "tab tab--nonfollowers tab--active" : "tab tab--nonfollowers"}
          onClick={() => setTab("nonfollowers")}
        >
          Non-followers <span class="count">{nonFollowers.length}</span>
        </button>
        <button
          class={tab === "whitelist" ? "tab tab--whitelist tab--active" : "tab tab--whitelist"}
          onClick={() => setTab("whitelist")}
        >
          Whitelisted <span class="count">{whitelist.length}</span>
        </button>
      </div>
      {tab === "nonfollowers" ? (
        <NonFollowersTable accounts={nonFollowers} onAddToWhitelist={onAddToWhitelist} />
      ) : (
        <WhitelistTable entries={whitelist} onRemove={onRemoveFromWhitelist} />
      )}
    </section>
  );
}
