import { get, set } from "idb-keyval";
import { logger } from "./logger";

const QUEUE_KEY = "agrotech-mutation-queue-v1";

export type QueuedMutation = {
  id: string;
  /** Stable identifier used by mutation handlers to dispatch on replay. */
  kind: string;
  /** Serializable payload — must be JSON-safe. */
  payload: unknown;
  createdAt: number;
};

async function read(): Promise<QueuedMutation[]> {
  return (await get(QUEUE_KEY)) ?? [];
}

async function write(items: QueuedMutation[]) {
  await set(QUEUE_KEY, items);
}

export const offlineQueue = {
  async enqueue(item: Omit<QueuedMutation, "id" | "createdAt">) {
    const items = await read();
    items.push({ ...item, id: crypto.randomUUID(), createdAt: Date.now() });
    await write(items);
  },
  async all() {
    return read();
  },
  async clear() {
    await write([]);
  },
  async remove(id: string) {
    const items = await read();
    await write(items.filter((i) => i.id !== id));
  },
  async size() {
    return (await read()).length;
  },
};

type Replayer = (m: QueuedMutation) => Promise<void>;
const replayers = new Map<string, Replayer>();

export function registerReplayer(kind: string, fn: Replayer) {
  replayers.set(kind, fn);
}

export async function replayQueue() {
  const items = await offlineQueue.all();
  if (!items.length) return;
  logger.info("offline.replay.start", { count: items.length });
  for (const item of items) {
    const fn = replayers.get(item.kind);
    if (!fn) continue;
    try {
      await fn(item);
      await offlineQueue.remove(item.id);
    } catch (err) {
      logger.error("offline.replay.failed", err, { kind: item.kind });
      // stop on first failure to preserve order
    } catch (err) {
      logger.error(err, "offline.replay", { kind: item.kind });
      // stop on first failure to preserve order
      break;
    }
