import { motion } from 'framer-motion';
import {
  FileText,
  ShieldAlert,
  Ban,
  Swords,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { useAnimatedCounter } from '@/hooks/useAnimatedCounter';
import { cn } from '@/lib/utils';

const iconMap: Record<string, React.ElementType> = {
  FileText,
  ShieldAlert,
  Ban,
  Swords,
};

interface StatsCardProps {
  title: string;
  value: number;
  trend: number;
  icon: string;
  suffix?: string;
  delay?: number;
}

export function StatsCard({ title, value, trend, icon, suffix, delay = 0 }: StatsCardProps) {
  const Icon = iconMap[icon] || FileText;
  const countedValue = useAnimatedCounter(value, 1500);
  const isPositive = trend >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delay * 0.1 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className="group relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-card to-card/80 p-5 transition-all duration-300 hover:border-primary/30 hover:shadow-[0_0_24px_hsl(142_76%_36%/0.08)]"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {title}
          </p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tabular-nums">
              {countedValue.toLocaleString('es-ES')}
            </span>
            {suffix && (
              <span className="text-xs text-muted-foreground">{suffix}</span>
            )}
          </div>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/15 transition-colors duration-300">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </motion.div>
  );
}
