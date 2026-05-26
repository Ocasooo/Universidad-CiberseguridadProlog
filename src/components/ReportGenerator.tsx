import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileBarChart, Loader2, Download, FileText, AlertTriangle, Shield } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/toast';
import { useLogsStore } from '@/store/logsStore';
import { isTauri, saveFileDialog } from '@/services/tauri';
import { fetchReport } from '@/services/api';
interface ReportGeneratorProps {
  open: boolean;
  onClose: () => void;
}

export function ReportGenerator({ open, onClose }: ReportGeneratorProps) {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generated, setGenerated] = useState(false);
  const { logs, alerts, addReport } = useLogsStore();
  const { addToast } = useToast();

  const handleGenerate = async () => {
    setLoading(true);
    setProgress(0);

    let reportContent: string;
    try {
      reportContent = await fetchReport();
      setProgress(100);
    } catch (err) {
      addToast({ type: 'error', title: 'Error', message: err instanceof Error ? err.message : 'No se pudo generar el reporte desde el motor Prolog' });
      setLoading(false);
      return;
    }

    const reportTitle = title || `Reporte-${Date.now()}`;

    if (isTauri()) {
      try {
        const saved = await saveFileDialog(reportContent, `${reportTitle}.txt`);
        if (saved) {
          addReport({
            id: `RPT-${Date.now().toString(36).toUpperCase()}`,
            title: reportTitle,
            date: new Date().toISOString(),
            threatsDetected: alerts.filter((a) => a.status === 'active').length,
            status: 'generated',
            generatedBy: 'admin',
            summary: `Reporte generado automáticamente con ${alerts.length} alertas procesadas.`,
          });
          addToast({ type: 'success', title: 'Reporte generado', message: 'Reporte guardado exitosamente.' });
          setGenerated(true);
        }
      } catch {
        addToast({ type: 'error', title: 'Error', message: 'No se pudo guardar el reporte.' });
      }
    } else {
      const blob = new Blob([reportContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportTitle}.txt`;
      a.click();
      URL.revokeObjectURL(url);

      addReport({
        id: `RPT-${Date.now().toString(36).toUpperCase()}`,
        title: reportTitle,
        date: new Date().toISOString(),
        threatsDetected: alerts.filter((a) => a.status === 'active').length,
        status: 'generated',
        generatedBy: 'admin',
        summary: `Reporte generado automáticamente con ${alerts.length} alertas procesadas.`,
      });
      addToast({ type: 'success', title: 'Reporte generado', message: 'Descarga iniciada.' });
      setGenerated(true);
    }

    setLoading(false);
  };

  const handleClose = () => {
    setTitle('');
    setProgress(0);
    setGenerated(false);
    setLoading(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileBarChart className="h-5 w-5 text-primary" />
            Generar Reporte
          </DialogTitle>
          <DialogDescription>
            Genera un reporte detallado de seguridad con los datos actuales del sistema.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Título del reporte</label>
            <div className="relative">
              <FileText className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Ej: Reporte Diario - 21 Mayo 2026"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-10 pl-9 text-sm bg-muted/50"
                aria-label="Título del reporte"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-muted/20 p-3 border border-border/30">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                <FileText className="h-3.5 w-3.5" />
                Logs
              </div>
              <p className="text-lg font-bold">{logs.length}</p>
            </div>
            <div className="rounded-lg bg-muted/20 p-3 border border-border/30">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                Alertas activas
              </div>
              <p className="text-lg font-bold">{alerts.filter((a) => a.status === 'active').length}</p>
            </div>
          </div>

          {loading && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                Generando reporte desde motor Prolog...
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {generated && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 rounded-lg bg-success/10 p-3 text-sm text-success"
            >
              <Shield className="h-4 w-4" />
              Reporte generado exitosamente
            </motion.div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose}>
            {generated ? 'Cerrar' : 'Cancelar'}
          </Button>
          {!generated && (
            <Button onClick={handleGenerate} disabled={loading} className="gap-2">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {loading ? 'Generando...' : 'Generar y Descargar'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
