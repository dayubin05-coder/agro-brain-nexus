import { WifiOff } from "lucide-react";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { AnimatePresence, motion } from "framer-motion";

export default function OfflineIndicator() {
  const online = useOnlineStatus();

  return (
    <AnimatePresence>
      {!online && (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed top-2 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/95 text-destructive-foreground shadow-lg backdrop-blur-md border border-destructive/50 text-sm font-medium"
          role="status"
          aria-live="polite"
        >
          <WifiOff className="w-4 h-4" />
          <span>Modo offline — alterações serão sincronizadas ao reconectar</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
