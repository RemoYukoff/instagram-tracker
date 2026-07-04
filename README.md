# Instagram Tracker

A local-only browser extension that tells you who doesn't follow you back on Instagram, and
keeps a durable log of who unfollows you over time.

## Download & install

There's no Chrome Web Store listing — install it manually ("sideload"):

1. Go to the [Releases page](https://github.com/RemoYukoff/instagram-tracker/releases) and
   download `instagram-tracker-extension.zip` from the latest release.
2. Unzip it to a folder you'll keep around (don't delete it after installing — Chrome loads
   the extension from that folder).
3. Open `chrome://extensions` (or `edge://extensions` on Edge).
4. Turn on **Developer mode** (toggle in the top-right corner).
5. Click **Load unpacked** and select the unzipped folder.
6. Click the extension's icon in the toolbar to open the results page, then click
   **Scan now** while logged in to Instagram.

To update later: download the new release's zip, unzip it over the same folder, then hit the
reload icon for the extension on `chrome://extensions`.

## What it does

- Read-only: it only fetches your following list, it never follows or unfollows anyone.
- All data (scan results, whitelist, unfollower log) stays in your browser's IndexedDB —
  nothing is sent anywhere else.
- Uses Instagram's private, undocumented endpoints via your own logged-in session, which is
  against Instagram's Terms of Service even though it's read-only. Use at your own risk
  (temporary blocks, checkpoints, or suspension are possible). Not affiliated with
  Instagram/Meta.

## Development

```
npm install
npm run dev        # Vite dev server
npm run typecheck
npm run build       # outputs to dist/
```

Load `dist/` unpacked the same way as above to test local changes.
