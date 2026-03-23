import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface StatCardProps {
  label: string;
  value: string | number;
  unit: string;
  icon: React.ElementType;
  delay?: number;
  colorClass?: string;
}

export default function StatCard({ 
  label, 
  value, 
  unit, 
  icon: Icon, 
  delay = 0,
  colorClass = "text-ocean-700 bg-ocean-50"
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="glass flex items-center gap-3 md:gap-5 p-4 md:p-6 rounded-xl md:rounded-2xl transition-all duration-300 hover:-translate-y-1"
    >
      <div className={cn("w-12 h-12 md:w-16 md:h-16 rounded-xl flex items-center justify-center text-xl md:text-2xl flex-shrink-0", colorClass)}>
        <Icon className="w-6 h-6 md:w-8 md:h-8" />
      </div>
      <div>
        <p className="text-[10px] md:text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-1">
          {label}
        </p>
        <p className="text-xl md:text-2xl font-bold text-slate-800">
          {value}
        </p>
        <span className="text-[10px] md:text-[11px] text-slate-400">
          {unit}
        </span>
      </div>
    </motion.div>
  );
}
