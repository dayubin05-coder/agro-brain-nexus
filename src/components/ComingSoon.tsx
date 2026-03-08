import { motion } from "framer-motion";
import { Construction } from "lucide-react";

interface ComingSoonProps {
  title: string;
  description?: string;
}

export default function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-4">
          <Construction className="w-8 h-8 text-accent-foreground" />
        </div>
        <h1 className="text-2xl font-display font-bold text-foreground">{title}</h1>
        <p className="text-muted-foreground text-sm mt-2 max-w-md">
          {description || "Este módulo está sendo desenvolvido. Em breve estará disponível com funcionalidades completas."}
        </p>
      </motion.div>
    </div>
  );
}
