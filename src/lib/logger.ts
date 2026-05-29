import { supabase } from "@/integrations/supabase/client";

type Level = "debug" | "info" | "warn" | "error";

interface LogEntry {
  level: Level;
  message: string;
  context?: string;
  stack?: string;
  metadata?: Record<string, unknown>;
}

const DEV = import.meta.env.DEV;
const queue: LogEntry[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;
const FLUSH_DELAY = 2000;
const MAX_BATCH = 20;

async function flush() {
  flushTimer = null;
  if (queue.length === 0) return;
  const batch = queue.splice(0, MAX_BATCH);

  const { data } = await supabase.auth.getSession();
  const userId = data.session?.user.id ?? null;
  const url = typeof window !== "undefined" ? window.location.href : null;
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : null;

  // Only persist warn/error for signed-in users to keep volume low and satisfy RLS
  if (!userId) return;
  const rows = batch
    .filter((e) => e.level === "warn" || e.level === "error")
    .map((e) => ({
      user_id: userId,
      level: e.level,
      message: e.message.slice(0, 2000),
      context: e.context?.slice(0, 200) ?? null,
      stack: e.stack?.slice(0, 8000) ?? null,
      metadata: (e.metadata ?? null) as any,
      url,
      user_agent: ua,
    }));
  if (rows.length === 0) return;
  try {
    await supabase.from("app_logs").insert(rows);
  } catch {
    /* swallow: never let logging crash the app */
  }
}

function schedule() {
  if (flushTimer) return;
  flushTimer = setTimeout(flush, FLUSH_DELAY);
}

function push(entry: LogEntry) {
  if (DEV) {
    const fn =
      entry.level === "error" ? console.error :
      entry.level === "warn" ? console.warn :
      entry.level === "info" ? console.info : console.debug;
    fn(`[${entry.context ?? entry.level}]`, entry.message, entry.metadata ?? "");
  }
  queue.push(entry);
  schedule();
}

export const logger = {
  debug: (message: string, metadata?: Record<string, unknown>, context?: string) =>
    push({ level: "debug", message, metadata, context }),
  info: (message: string, metadata?: Record<string, unknown>, context?: string) =>
    push({ level: "info", message, metadata, context }),
  warn: (message: string, metadata?: Record<string, unknown>, context?: string) =>
    push({ level: "warn", message, metadata, context }),
  error: (error: unknown, context?: string, metadata?: Record<string, unknown>) => {
    const err = error instanceof Error ? error : new Error(String(error));
    push({
      level: "error",
      message: err.message,
      stack: err.stack,
      context,
      metadata,
    });
  },
  flush,
};

// Flush on page hide so we don't lose in-flight logs
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => void flush());
  window.addEventListener("error", (e) =>
    logger.error(e.error ?? e.message, "window.error"),
  );
  window.addEventListener("unhandledrejection", (e) =>
    logger.error(e.reason, "unhandledrejection"),
  );
}
