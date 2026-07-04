import type { ComponentChildren, JSX } from "preact";
import type { UserNode } from "../shared/types";
import { ProfilePic } from "./ProfilePic";
import { VerifiedBadge } from "./VerifiedBadge";

// Shared row shape for all three account lists (non-followers, whitelisted,
// unfollowers) so photo/name/username markup and styling stay identical; `meta`
// is whatever trailing content is specific to that list (a Remove button, a
// detected-at date, or nothing).
interface Props {
  account: UserNode | undefined;
  fallbackId: string;
  meta?: ComponentChildren;
}

export function AccountRow({ account, fallbackId, meta }: Props) {
  const profileUrl = account ? `https://www.instagram.com/${account.username}/` : null;

  function handleRowClick(e: JSX.TargetedMouseEvent<HTMLLIElement>) {
    if (!profileUrl) return;
    // Let the username link and any meta button (e.g. Remove) handle their own
    // click instead of also opening the profile.
    if ((e.target as HTMLElement).closest("a, button")) return;
    window.open(profileUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <li class={profileUrl ? "account-row clickable" : "account-row"} onClick={handleRowClick}>
      <ProfilePic url={account?.profilePicUrl ?? ""} />
      <div class="identity">
        <div class="full-name">
          {account?.fullName || account?.username || fallbackId}
          {account?.isVerified && <VerifiedBadge />}
        </div>
        {profileUrl && (
          <a class="username" href={profileUrl} target="_blank" rel="noreferrer">
            @{account?.username}
          </a>
        )}
      </div>
      {meta && <div class="meta">{meta}</div>}
    </li>
  );
}
