import { NotLoggedInError } from "./errors";

const INSTAGRAM_URL = "https://www.instagram.com";

// Live testing in-page read ds_user_id via document.cookie. The background
// service worker has no `document`, so we read it via chrome.cookies instead —
// confirmed working from that context too.
export async function getDsUserId(): Promise<string> {
  const cookie = await chrome.cookies.get({ url: INSTAGRAM_URL, name: "ds_user_id" });
  if (!cookie?.value) {
    throw new NotLoggedInError();
  }
  return cookie.value;
}
