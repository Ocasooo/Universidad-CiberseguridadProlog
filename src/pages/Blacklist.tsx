import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Ban,
  Search,
  Plus,
  Trash2,
  Globe,
  Shield,
  Calendar,
  AlertTriangle,
  Download,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useLogsStore } from '@/store/logsStore';
import { useToast } from '@/components/ui/toast';
import { formatDate } from '@/utils/format';
import { cn } from '@/lib/utils';
import { fetchBlacklist } from '@/services/api';
import type { BlacklistEntry } from '@/types';

export function BlacklistPage() {
  const { blacklist, setBlacklist, removeFromBlacklist, addToBlacklist } = useLogsStore();

  useEffect(() => {
    fetchBlacklist().then((ips) => {
      if (ips.length === 0) return;
      const entries: BlacklistEntry[] = ips.map((ip, i) => ({
        id: `BL-${String(i + 1).padStart(3, '0')}`,
        ip,
        reason: 'Bloqueada por regla Prolog',
        date: new Date().toISOString(),
        status: 'active' as const,
        blockedBy: 'Prolog',
        attempts: 0,
        source: 'Base de conocimiento',
      }));
      setBlacklist(entries);
    });
  }, []);
  const { addToast } = useToast();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newIp, setNewIp] = useState('');
  const [newReason, setNewReason] = useState('');

  const filtered = useMemo(() => {
    return blacklist.filter((entry) => {
      const matchSearch = !search ||
        entry.ip.toLowerCase().includes(search.toLowerCase()) ||
        entry.reason.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || entry.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [blacklist, search, statusFilter]);

  const handleDelete = (id: string) => {
    removeFromBlacklist(id);
    setDeleteConfirm(null);
    addToast({ type: 'success', title: 'IP eliminada', message: 'La IP fue eliminada de la blacklist.' });
  };

  const handleAdd = () => {
    if (!newIp) return;
    addToBlacklist({
      id: `BL-${Date.now().toString(36).toUpperCase()}`,
      ip: newIp,
      reason: newReason || 'Añadida manualmente',
      date: new Date().toISOString(),
      status: 'active',
      blockedBy: 'admin',
      attempts: 0,
      source: 'Manual',
    });
    setNewIp('');
    setNewReason('');
    setAddDialogOpen(false);
    addToast({ type: 'success', title: 'IP añadida', message: `${newIp} añadida a la blacklist.` });
  };

  const handleExport = () => {
    const content = blacklist
      .map((b) => `${b.ip},${b.reason},${b.date},${b.status},${b.blockedBy}`)
      .join('\n');
    const header = 'IP,Razón,Fecha,Estado,Bloqueado Por\n';
    const blob = new Blob([header + content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'blacklist-export.csv';
    a.click();
    URL.revokeObjectURL(url);
    addToast({ type: 'success', title: 'Exportado', message: 'Blacklist exportada como CSV.' });
  };

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
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Exportar
          </Button>
          <Button size="sm" className="gap-1.5" onClick={() => setAddDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Añadir IP
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar IP o motivo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 pl-9 text-sm bg-muted/50"
            aria-label="Buscar en blacklist"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32 h-9">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Activo</SelectItem>
            <SelectItem value="inactive">Inactivo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="border-border/50 bg-card/50">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50 bg-muted/20">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">IP</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Motivo</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Fecha</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Estado</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Intentos</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Origen</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Acción</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {filtered.map((entry, idx) => (
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
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="iconSm"
                          onClick={() => setDeleteConfirm(entry.id)}
                          className="text-muted-foreground hover:text-destructive"
                          aria-label={`Eliminar ${entry.ip}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="flex flex-col items-center py-12 text-muted-foreground">
              <Shield className="h-10 w-10 mb-2 opacity-30" />
              <p className="text-sm">No se encontraron IPs en la blacklist</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Confirmar eliminación
            </DialogTitle>
            <DialogDescription>
              ¿Estás seguro de eliminar esta IP de la blacklist? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancelar</Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Añadir IP a Blacklist
            </DialogTitle>
            <DialogDescription>
              Introduce la IP y el motivo del bloqueo.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Dirección IP</label>
              <Input
                placeholder="192.168.1.100"
                value={newIp}
                onChange={(e) => setNewIp(e.target.value)}
                aria-label="Dirección IP"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Motivo</label>
              <Input
                placeholder="Actividad maliciosa detectada"
                value={newReason}
                onChange={(e) => setNewReason(e.target.value)}
                aria-label="Motivo del bloqueo"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleAdd} disabled={!newIp}>Añadir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
