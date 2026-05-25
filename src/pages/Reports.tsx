import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileBarChart,
  Download,
  FileText,
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ReportGenerator } from '@/components/ReportGenerator';
import { useLogsStore } from '@/store/logsStore';
import { formatDate, formatTimestamp } from '@/utils/format';
import { cn } from '@/lib/utils';

const statusVariants: Record<string, 'success' | 'warning' | 'destructive'> = {
  generated: 'success',
  pending: 'warning',
  error: 'destructive',
};

const statusLabels: Record<string, string> = {
  generated: 'Generado',
  pending: 'Pendiente',
  error: 'Error',
};

export function ReportsPage() {
  const { reports } = useLogsStore();
  const [reportModalOpen, setReportModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileBarChart className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Reportes de Seguridad</h2>
          <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
            {reports.length} reportes
          </span>
        </div>
        <Button onClick={() => setReportModalOpen(true)} className="gap-2">
          <FileBarChart className="h-4 w-4" />
          Generar Reporte
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {reports.map((report, idx) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/20 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-medium truncate">{report.title}</h4>
                      <div className="flex flex-wrap items-center gap-3 mt-1.5">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {formatDate(report.date)}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <AlertCircle className="h-3 w-3" />
                          {report.threatsDetected} amenazas
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {report.generatedBy}
                        </div>
                        <Badge variant={statusVariants[report.status]} className="text-[10px]">
                          {statusLabels[report.status]}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                        {report.summary}
                      </p>
                    </div>
                  </div>

                  {report.status === 'generated' && (
                    <Button variant="outline" size="sm" className="gap-1.5 shrink-0">
                      <Download className="h-3.5 w-3.5" />
                      Descargar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {reports.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <FileBarChart className="h-12 w-12 mb-3 opacity-30" />
          <p className="text-sm">No hay reportes generados aún</p>
          <Button variant="outline" className="mt-4" onClick={() => setReportModalOpen(true)}>
            Generar primer reporte
          </Button>
        </div>
      )}

      <ReportGenerator open={reportModalOpen} onClose={() => setReportModalOpen(false)} />
    </div>
  );
}
