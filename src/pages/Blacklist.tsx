import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Ban,
  Globe,
  Shield,
  Calendar,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLogsStore } from '@/store/logsStore';
import { formatDate } from '@/utils/format';
import { fetchBlacklist } from '@/services/api';
import type { BlacklistEntry } from '@/types';

export function BlacklistPage() {
  const { blacklist, setBlacklist } = useLogsStore();

  useEffect(() => {
    fetchBlacklist().then((ips) => {
      if (ips.length === 0) return;
      const entries: BlacklistEntry[] = ips.map((ip, i) => ({
        id: `BL-${String(i + 1).padStart(3, '0')}`,
        ip,
        reason: 'IP sospechoso',
        date: new Date().toISOString(),
        status: 'active' as const,
        blockedBy: 'Prolog',
        attempts: 0,
        source: 'Blacklist',
      }));
      setBlacklist(entries);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Ban className="h-5 w-5 text-destructive" />
          <h2 className="text-lg font-semibold">Blacklist de IPs</h2>
          <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
            {blacklist.length} IPs
          </span>
        </div>
      </div>

      <Card className="border-border/50 bg-card/50">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full mt-5">
              <thead>
                <tr className="border-b border-border/50 bg-muted/20">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">IP</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Motivo</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Fecha</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Estado</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Intentos</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Origen</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {blacklist.map((entry, idx) => (
                    <motion.tr
                      key={entry.id}
                      layout
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: idx * 0.02 }}
                      className="border-b border-border/20 hover:bg-muted/10 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <span className="font-mono text-sm">{entry.ip}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground max-w-[250px] truncate">
                        {entry.reason}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(entry.date)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={entry.status === 'active' ? 'destructive' : 'secondary'}
                          className="text-[10px]"
                        >
                          {entry.status === 'active' ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm tabular-nums">{entry.attempts}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{entry.source}</td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
          {blacklist.length === 0 && (
            <div className="flex flex-col items-center py-12 text-muted-foreground">
              <Shield className="h-10 w-10 mb-2 opacity-30" />
              <p className="text-sm">No se encontraron IPs en la blacklist</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
