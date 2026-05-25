import { motion } from 'framer-motion';
import { ShieldAlert, Clock, User, Globe, AlertTriangle, CheckCircle, ShieldCheck, Skull } from 'lucide-react';
import * as Popover from '@radix-ui/react-popover';
import type { PopoverProps } from '@radix-ui/react-popover';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/utils/format';
import { useLogsStore } from '@/store/logsStore';
import type { Alert } from '@/types';

interface AlertCardProps {
  alert: Alert;
  index?: number;
}

const severityVariants: Record<string, { badge: 'critical' | 'high' | 'medium' | 'low' | 'info'; border: string; label: string }> = {
  critical: { badge: 'critical', border: 'border-l-destructive', label: 'Crítico' },
  high: { badge: 'high', border: 'border-l-orange-500', label: 'Alto' },
  medium: { badge: 'medium', border: 'border-l-yellow-500', label: 'Medio' },
  low: { badge: 'low', border: 'border-l-green-500', label: 'Bajo' },
  info: { badge: 'info', border: 'border-l-blue-500', label: 'Info' },
};

const statusConfig = {
  active: { label: 'Activa', className: 'bg-destructive/20 text-destructive' },
  investigating: { label: 'Investigando', className: 'bg-warning/20 text-warning' },
  resolved: { label: 'Resuelta', className: 'bg-success/20 text-success' },
};

export function AlertCard({ alert, index = 0 }: AlertCardProps) {
  const updateAlert = useLogsStore((s) => s.updateAlert);
  const variant = severityVariants[alert.severity] || severityVariants.medium;
  const status = statusConfig[alert.status];

  const handleClassify = (classification: 'seguro' | 'peligro') => {
    updateAlert(alert.id, {
      classification,
      status: classification === 'seguro' ? 'resolved' : 'investigating',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -2 }}
      className={cn(
        'group relative rounded-xl border border-border/50 bg-card p-5 transition-all duration-300 hover:border-primary/30 hover:shadow-lg border-l-4',
        variant.border,
        alert.severity === 'critical' && 'animate-pulse-critical'
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={cn(
            'flex h-8 w-8 items-center justify-center rounded-lg',
            alert.severity === 'critical' ? 'bg-destructive/20' : 'bg-primary/10'
          )}>
            <ShieldAlert className={cn(
              'h-4 w-4',
              alert.severity === 'critical' ? 'text-destructive' : 'text-primary'
            )} />
          </div>
          <div>
            <h3 className="text-sm font-semibold">{alert.title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{alert.description}</p>
          </div>
        </div>
        <Badge variant={variant.badge} className="shrink-0 ml-2">
          {variant.label}
        </Badge>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-3">
        <div className="flex items-center gap-1">
          <User className="h-3 w-3" />
          {alert.user}
        </div>
        <div className="flex items-center gap-1">
          <Globe className="h-3 w-3" />
          {alert.ip}
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {formatRelativeTime(alert.timestamp)}
        </div>
        <div className={cn('px-1.5 py-0.5 rounded text-[10px] font-medium', status.className)}>
          {status.label}
        </div>
        {alert.classification && (
          <div className={cn(
            'px-1.5 py-0.5 rounded text-[10px] font-medium',
            alert.classification === 'seguro'
              ? 'bg-success/20 text-success'
              : 'bg-destructive/20 text-destructive'
          )}>
            {alert.classification === 'seguro' ? 'Seguro' : 'Peligro'}
          </div>
        )}
      </div>

      <div className="rounded-lg bg-muted/20 p-2.5 mb-3">
        <code className="text-[10px] font-mono text-muted-foreground leading-relaxed block">
          <span className="text-primary">regla</span>: {alert.rule}
        </code>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <AlertTriangle className="h-3 w-3 text-warning" />
          <span className="text-xs text-muted-foreground">{alert.recommendation}</span>
        </div>

        <Popover.Root>
          <Popover.Trigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-xs"
              disabled={alert.classification === 'seguro'}
            >
              <CheckCircle className="h-3.5 w-3.5" />
              Revisado
            </Button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              side="top"
              align="end"
              sideOffset={8}
              className="z-50 min-w-[150px] rounded-xl border border-border/50 bg-popover p-1.5 shadow-lg backdrop-blur-xl"
            >
              <p className="px-2 py-1 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                Clasificar como
              </p>
              <button
                onClick={() => handleClassify('seguro')}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-success transition-colors hover:bg-success/10"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                Seguro
              </button>
              <button
                onClick={() => handleClassify('peligro')}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-destructive transition-colors hover:bg-destructive/10"
              >
                <Skull className="h-3.5 w-3.5" />
                Peligro
              </button>
              <Popover.Arrow className="fill-popover" />
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </div>
    </motion.div>
  );
}