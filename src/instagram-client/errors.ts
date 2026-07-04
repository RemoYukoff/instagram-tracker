// The scanning layer must fail loudly and specifically rather than silently
// returning empty data, since Instagram's private API can change without notice.

export class NotLoggedInError extends Error {
  constructor() {
    super("No ds_user_id cookie found — user is not logged in to instagram.com in this browser.");
    this.name = "NotLoggedInError";
  }
}

export class RateLimitedError extends Error {
  constructor(public readonly status: number) {
    super(`Instagram responded with ${status} — likely rate-limited or checkpointed.`);
    this.name = "RateLimitedError";
  }
}

export class ResponseShapeError extends Error {
  constructor(detail: string) {
    super(`Unexpected response shape (endpoint likely changed): ${detail}`);
    this.name = "ResponseShapeError";
  }
}

export class HttpError extends Error {
  constructor(public readonly status: number, public readonly statusText: string) {
    super(`Instagram request failed: ${status} ${statusText}`);
    this.name = "HttpError";
  }
}
