import { supabase } from "@/integrations/supabase/client";

interface EventRow {
  event: string;
  properties?: Record<string, unknown>;
}

const DEV = import.meta.env.DEV;
const queue: EventRow[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;
const FLUSH_DELAY = 3000;
const MAX_BATCH = 25;

async function flush() {
  timer = null;
  if (queue.length === 0) return;
  const batch = queue.splice(0, MAX_BATCH);
  const { data } = await supabase.auth.getSession();
  const userId = data.session?.user.id ?? null;
  if (!userId) return; // only authenticated analytics for now (RLS)
  const url = typeof window !== "undefined" ? window.location.href : null;
  const rows = batch.map((e) => ({
    user_id: userId,
    event: e.event.slice(0, 100),
    properties: (e.properties ?? null) as any,
    url,
  }));
  try {
    await supabase.from("app_events").insert(rows);
  } catch {
    /* swallow */
  }
}

function schedule() {
  if (timer) return;
  timer = setTimeout(flush, FLUSH_DELAY);
}

export const analytics = {
  track: (event: string, properties?: Record<string, unknown>) => {
    if (DEV) console.debug("[analytics]", event, properties ?? "");
    queue.push({ event, properties });
    schedule();
  },
  page: (name?: string) => {
    analytics.track("page_view", {
      name: name ?? (typeof document !== "undefined" ? document.title : undefined),
      path: typeof window !== "undefined" ? window.location.pathname : undefined,
    });
  },
  flush,
};

if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => void flush());
}
