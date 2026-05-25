import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, File, X, AlertCircle, CheckCircle, Loader2, Table } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/store/appStore';
import { useLogsStore } from '@/store/logsStore';
import { useToast } from '@/components/ui/toast';
import { uploadCSV } from '@/services/api';
import { mapBackendResponse } from '@/utils/mapper';
import { cn } from '@/lib/utils';
import { isTauri, openFileDialog, readTextFile } from '@/services/tauri';

interface CSVModalProps {
  open: boolean;
  onClose: () => void;
}

export function CSVModal({ open, onClose }: CSVModalProps) {
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [file, setFile] = useState<{ name: string; size: number; records: number; preview: string[][] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<string>('');
  const { setCsvLoaded } = useAppStore();
  const { setLogs, setAlerts } = useLogsStore();
  const { addToast } = useToast();

  const processFile = useCallback(async () => {
    if (!file) return;
    setLoading(true);
    setProgress(0);

    try {
      for (let i = 10; i <= 90; i += 20) {
        await new Promise((r) => setTimeout(r, 80));
        setProgress(i);
      }

      const result = await uploadCSV(contentRef.current, file.name);

      setProgress(100);
      console.log('[processFile] uploadCSV OK:', result.records, 'registros,', result.alertCount, 'alertas');

      const mapped = mapBackendResponse(result);
      console.log('[processFile] mapped logs:', mapped.logs.length, 'alerts:', mapped.alerts.length);

      setLogs(mapped.logs);
      setAlerts(mapped.alerts);
      setCsvLoaded(true, file.name, result.records || file.records);

      const alertCount = mapped.alerts.length;
      addToast({ type: 'success', title: 'CSV procesado', message: `${mapped.logs.length} registros, ${alertCount} alertas generadas por Prolog.` });
      setTimeout(() => onClose(), 500);
    } catch (ex: any) {
      if (ex.name === 'AbortError') {
        setError('El servidor no respondio en 15 segundos. Asegurate de que el backend este corriendo (puerto 3001).');
      } else if (ex instanceof TypeError && ex.message.includes('fetch')) {
        setError('No se pudo conectar con el backend.');
      } else {
        setError(ex.message || 'Error al procesar el archivo. Verifica que el backend este corriendo.');
      }
      setLoading(false);
      setProgress(0);
    }
  }, [file, setLogs, setAlerts, setCsvLoaded, addToast, onClose]);

  const handleFile = useCallback(async (name: string, content: string) => {
    contentRef.current = content;
    try {
      const lines = content.split('\n').filter((l) => l.trim());
      if (lines.length < 2) {
        setError('El archivo CSV debe tener al menos un encabezado y una fila de datos.');
        return;
      }

      const rawHeaders = lines[0].split(',').map((h) => h.trim());
      const headers = rawHeaders.map((h) => h.toLowerCase());
      const expectedHeaders = ['timestamp', 'usuario', 'ip', 'estado', 'hora', 'puerto', 'pais'];

      const missingHeaders = expectedHeaders.filter((h) => !headers.includes(h));
      if (missingHeaders.length > 0) {
        setError('Faltan columnas requeridas: ' + missingHeaders.join(', ') + '. Formato esperado: timestamp,usuario,ip,estado,hora,puerto,pais');
        return;
      }

      const dataRows = lines.slice(1).map((l) => l.split(',').map((c) => c.trim()));
      const errors: string[] = [];

      for (let i = 0; i < dataRows.length; i++) {
        const row = dataRows[i];
        const rowNum = i + 2;

        if (row.length < 7) {
          errors.push('Fila ' + rowNum + ': ' + row.length + ' columnas, se esperaban 7');
          continue;
        }

        if (!row[0]) errors.push('Fila ' + rowNum + ': timestamp vacio');
        if (!row[1]) errors.push('Fila ' + rowNum + ': usuario vacio');
        if (!row[2]) errors.push('Fila ' + rowNum + ': ip vacio');
        if (row[4] && isNaN(Number(row[4]))) errors.push('Fila ' + rowNum + ': hora "' + row[4] + '" no es un numero');
        if (row[5] && isNaN(Number(row[5]))) errors.push('Fila ' + rowNum + ': puerto "' + row[5] + '" no es un numero');
      }

      if (errors.length > 0) {
        const msg = errors.slice(0, 5).join('. ') + (errors.length > 5 ? '. Y ' + (errors.length - 5) + ' errores mas.' : '');
        setError(msg);
        return;
      }

      const previewRows = dataRows.slice(0, 5);
      setFile({
        name,
        size: content.length,
        records: dataRows.length,
        preview: [rawHeaders, ...previewRows],
      });
      setError(null);
    } catch {
      setError('Error al procesar el archivo CSV. Verifica el formato.');
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile && droppedFile.name.endsWith('.csv')) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          if (ev.target?.result) handleFile(droppedFile.name, ev.target.result as string);
        };
        reader.readAsText(droppedFile);
      } else {
        setError('Por favor, selecciona un archivo CSV.');
      }
    },
    [handleFile]
  );

  const handleTauriOpen = async () => {
    if (!isTauri()) {
      inputRef.current?.click();
      return;
    }
    try {
      const path = await openFileDialog();
      if (path) {
        const content = await readTextFile(path);
        const fileName = path.split('\\').pop() || path.split('/').pop() || 'file.csv';
        await handleFile(fileName, content);
      }
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'No se pudo abrir el archivo.' });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) handleFile(selectedFile.name, ev.target.result as string);
      };
      reader.readAsText(selectedFile);
    }
  };

  const reset = () => {
    setFile(null);
    setError(null);
    setProgress(0);
    setLoading(false);
    contentRef.current = '';
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { reset(); onClose(); } }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            Cargar Archivo CSV
          </DialogTitle>
          <DialogDescription>
            Sube un archivo CSV con logs para procesar con el motor Prolog.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!file && !loading && (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              onClick={handleTauriOpen}
              className={cn(
                'flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-all',
                dragActive
                  ? 'border-primary bg-primary/5 shadow-[0_0_20px_hsl(142_76%_36%/0.1)]'
                  : 'border-border hover:border-primary/50 hover:bg-muted/20'
              )}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-3">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <p className="text-sm font-medium">
                {dragActive ? 'Suelta el archivo aquí' : 'Arrastra y suelta tu CSV aquí'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">o haz clic para seleccionar</p>
              <input
                ref={inputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleInputChange}
                aria-label="Seleccionar archivo CSV"
              />
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {loading && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                Enviando al motor Prolog...
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground text-right">{progress}%</p>
            </div>
          )}

          <AnimatePresence>
            {file && !loading && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between rounded-lg bg-muted/20 p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <File className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024).toFixed(1)} KB · {file.records} registros
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="iconSm" onClick={reset} aria-label="Eliminar archivo">
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Table className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">Vista previa</span>
                    <Badge variant="outline" className="text-[10px]">
                      {file.records} filas
                    </Badge>
                  </div>
                  <div className="overflow-x-auto rounded-lg border border-border/50">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-muted/30">
                          {file.preview[0]?.map((h, i) => (
                            <th key={i} className="px-2 py-1.5 text-left font-medium text-muted-foreground whitespace-nowrap">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {file.preview.slice(1).map((row, ri) => (
                          <tr key={ri} className="border-t border-border/20">
                            {row.map((cell, ci) => (
                              <td key={ci} className="px-2 py-1.5 text-muted-foreground whitespace-nowrap max-w-[120px] truncate">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-success">
                  <CheckCircle className="h-4 w-4" />
                  Archivo válido. Listo para procesar.
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => { reset(); onClose(); }}>
            Cancelar
          </Button>
          <Button
            disabled={!file || loading}
            onClick={processFile}
            className="gap-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {loading ? 'Procesando...' : 'Procesar CSV'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}