import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { analytics } from "@/lib/analytics";

/** Tracks a page_view event whenever the route changes. */
export function usePageTracking() {
  const location = useLocation();
  useEffect(() => {
    analytics.page();
  }, [location.pathname]);
}
