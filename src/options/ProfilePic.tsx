import { useEffect, useState } from "preact/hooks";
import { PersonIcon } from "./icons/PersonIcon";

// Instagram's CDN (cdninstagram.com / fbcdn.net) sends
// `Cross-Origin-Resource-Policy: same-origin`, which blocks a plain
// <img src="..."> from a chrome-extension:// origin outright -- CORP is enforced
// independently of CORS or referrer-policy, so no <img> attribute can work around
// it. host_permissions covering those domains (manifest.json) let a script-
// initiated `fetch()` from this page bypass CORS/CORP instead (the same mechanism
// that already lets instagram-client fetch the private GraphQL API), so we fetch
// the bytes ourselves and hand the <img> a blob: URL instead of the CDN URL.
// Cached process-wide (keyed by CDN URL) for the life of the options tab -- small
// thumbnails, and the same account can appear in multiple filtered views.
const cache = new Map<string, Promise<string | null>>();

async function loadBlobUrl(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch {
    return null;
  }
}

function getCached(url: string): Promise<string | null> {
  let entry = cache.get(url);
  if (!entry) {
    entry = loadBlobUrl(url);
    cache.set(url, entry);
  }
  return entry;
}

interface Props {
  url: string;
  size?: number;
}

// Always renders a size x size slot -- a plain placeholder while the fetch is in
// flight (or if there's no url / the fetch fails) -- so rows don't shift height/
// width once photos finish loading in.
export function ProfilePic({ url, size = 48 }: Props) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!url) {
      setBlobUrl(null);
      return;
    }
    let cancelled = false;
    setBlobUrl(null);
    getCached(url).then((result) => {
      if (!cancelled) setBlobUrl(result);
    });
    return () => {
      cancelled = true;
    };
  }, [url]);

  const style = { width: `${size}px`, height: `${size}px` };

  if (!blobUrl) {
    return (
      <div class="profile-pic-placeholder" style={style}>
        <PersonIcon />
      </div>
    );
  }
  return <img src={blobUrl} width={size} height={size} alt="" style={style} />;
}
