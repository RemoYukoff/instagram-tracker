import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { TrackerState, UnfollowerEntry, UserNode, WhitelistEntry } from "../shared/types";

interface TrackerDB extends DBSchema {
  accounts: { key: string; value: UserNode };
  state: { key: string; value: TrackerState }; // single row, keyed by STATE_KEY (state.ts)
  whitelist: { key: string; value: WhitelistEntry };
  unfollowers: { key: string; value: UnfollowerEntry };
}

const DB_NAME = "instagram-tracker";
// Staying at 1 until the MVP is done -- schema changes during this phase mean
// manually deleting the IndexedDB database in DevTools (Application > IndexedDB)
// before testing, rather than bumping this and migrating.
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<TrackerDB>> | null = null;

export function getDb(): Promise<IDBPDatabase<TrackerDB>> {
  if (!dbPromise) {
    dbPromise = openDB<TrackerDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        db.createObjectStore("accounts", { keyPath: "id" });
        db.createObjectStore("state");
        db.createObjectStore("whitelist", { keyPath: "accountId" });
        db.createObjectStore("unfollowers", { keyPath: "accountId" });
      },
    });
  }
  return dbPromise;
}
