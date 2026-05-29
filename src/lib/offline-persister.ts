import { get, set, del } from "idb-keyval";
import type { Persister } from "@tanstack/react-query-persist-client";

const IDB_KEY = "agrotech-query-cache-v1";

/**
 * IndexedDB persister for TanStack Query.
 * Stores query cache so data is available offline after first load.
 */
export const idbPersister: Persister = {
  persistClient: async (client) => {
    try {
      await set(IDB_KEY, client);
    } catch (err) {
      console.warn("[offline-persister] failed to persist", err);
    }
  },
  restoreClient: async () => {
    try {
      return await get(IDB_KEY);
    } catch {
      return undefined;
    }
  },
  removeClient: async () => {
    try {
      await del(IDB_KEY);
    } catch {
      /* noop */
    }
  },
};
