import { useState, useMemo } from 'react';
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  AlertCircle,
} from 'lucide-react';
import { useLogsStore } from '@/store/logsStore';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatTimestamp, formatRelativeTime } from '@/utils/format';
import type { LogEntry, LogStatus, Severity } from '@/types';

const statusConfig: Record<LogStatus, { label: string; variant: 'success' | 'destructive' | 'warning' }> = {
  success: { label: 'Éxito', variant: 'success' },
  failure: { label: 'Fallo', variant: 'destructive' },
  suspicious: { label: 'Sospechoso', variant: 'warning' },
};

const severityConfig: Record<Severity, { label: string; variant: 'critical' | 'high' | 'medium' | 'low' | 'info' }> = {
  critical: { label: 'Crítico', variant: 'critical' },
  high: { label: 'Alto', variant: 'high' },
  medium: { label: 'Medio', variant: 'medium' },
  low: { label: 'Bajo', variant: 'low' },
  info: { label: 'Info', variant: 'info' },
};

const ROWS_PER_PAGE = 15;

export function LogsTable() {
  const { logs, severityFilter, setSeverityFilter } = useLogsStore();
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<keyof LogEntry | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const processedLogs = useMemo(() => {
    let result = [...logs];
    if (severityFilter !== 'all') {
      result = result.filter((l) => l.severity === severityFilter);
    }
    if (sortField) {
      result.sort((a, b) => {
        const aVal = String(a[sortField] ?? '');
        const bVal = String(b[sortField] ?? '');
        return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      });
    }
    return result;
  }, [logs, severityFilter, sortField, sortDir]);

  const totalPages = Math.ceil(processedLogs.length / ROWS_PER_PAGE);
  const pagedLogs = processedLogs.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);

  const handleSort = (field: keyof LogEntry) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('desc');
    }
    setPage(1);
  };

  const SortIcon = ({ field }: { field: keyof LogEntry }) => {
    if (sortField !== field) return <ChevronsUpDown className="h-3 w-3 opacity-50" />;
    return sortDir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">

        <Select value={severityFilter} onValueChange={(v) => { setSeverityFilter(v); setPage(1); }}>
          <SelectTrigger className="w-32 h-9">
            <SelectValue placeholder="Severidad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="critical">Crítico</SelectItem>
            <SelectItem value="high">Alto</SelectItem>
            <SelectItem value="medium">Medio</SelectItem>
            <SelectItem value="low">Bajo</SelectItem>
            <SelectItem value="info">Info</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground">
          {processedLogs.length} registros
        </span>
      </div>

      <div className="overflow-hidden rounded-xl border border-border/50 bg-card">
        <div className="overflow-x-auto">
          <table className="w-full" role="table">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                {[
                  { key: 'timestamp', label: 'Timestamp' },
                  { key: 'user', label: 'Usuario' },
                  { key: 'ip', label: 'IP' },
                  { key: 'status', label: 'Estado' },
                  { key: 'severity', label: 'Severidad' },
                  { key: 'rule', label: 'Regla Detectada' },
                  { key: 'action', label: 'Acción' },
                ].map(({ key, label }) => (
                  <th
                    key={key}
                    className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer select-none hover:text-foreground transition-colors"
                    onClick={() => handleSort(key as keyof LogEntry)}
                    aria-sort={sortField === key ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
                  >
                    <div className="flex items-center gap-1">
                      {label}
                      <SortIcon field={key as keyof LogEntry} />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pagedLogs.map((log) => (
                <tr
                  key={log.id}
                  className={cn(
                    'border-b border-border/20 transition-colors hover:bg-muted/20',
                    log.severity === 'critical' && 'border-l-2 border-l-destructive'
                  )}
                  role="row"
                >
                  <td className="px-4 py-3 text-xs font-mono text-muted-foreground whitespace-nowrap">
                    {formatTimestamp(log.timestamp)}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">{log.user}</td>
                  <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{log.ip}</td>
                  <td className="px-4 py-3">
                    <Badge variant={statusConfig[log.status].variant} className="text-[10px] px-2 py-0.5">
                      {statusConfig[log.status].label}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={severityConfig[log.severity].variant} className="text-[10px] px-2 py-0.5">
                      {severityConfig[log.severity].label}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground max-w-[200px] truncate">
                    {log.rule}
                  </td>
                  <td className="px-4 py-3 text-sm">{log.action}</td>
                </tr>
              ))}
              {pagedLogs.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle className="h-8 w-8 opacity-50" />
                      <p className="text-sm">No se encontraron logs con los filtros actuales</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-border/50 px-4 py-3">
          <span className="text-xs text-muted-foreground">
            Página {page} de {totalPages || 1}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="iconSm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              aria-label="Página anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const start = Math.max(1, Math.min(page - 2, totalPages - 4));
              const p = start + i;
              if (p > totalPages) return null;
              return (
                <Button
                  key={p}
                  variant={p === page ? 'default' : 'outline'}
                  size="iconSm"
                  onClick={() => setPage(p)}
                  aria-label={`Ir a página ${p}`}
                  className="text-xs"
                >
                  {p}
                </Button>
              );
            })}
            <Button
              variant="outline"
              size="iconSm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              aria-label="Página siguiente"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
