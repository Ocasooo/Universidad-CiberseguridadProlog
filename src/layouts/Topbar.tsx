import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Upload, FileBarChart, Bell, Home } from 'lucide-react';
import { useRealtimeClock } from '@/hooks/useRealtimeClock';
import { useAppStore } from '@/store/appStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/logs': 'Registro de Logs',
  '/alerts': 'Centro de Alertas',
  '/reports': 'Reportes',
  '/blacklist': 'Gestión de Blacklist',
  '/settings': 'Configuración',
};

const breadcrumbs: Record<string, string> = {
  '/': 'Dashboard',
  '/logs': 'Monitoreo / Logs',
  '/alerts': 'Seguridad / Alertas',
  '/reports': 'Auditoría / Reportes',
  '/blacklist': 'Seguridad / Blacklist',
  '/settings': 'Sistema / Configuración',
};

interface TopbarProps {
  onOpenCSVModal: () => void;
  onGenerateReport: () => void;
}

export function Topbar({ onOpenCSVModal, onGenerateReport }: TopbarProps) {
  const location = useLocation();
  const { timeString, dateString } = useRealtimeClock();
  const { globalSearch, setGlobalSearch, prologStatus, csvLoaded, activeAlerts } = useAppStore();

  const title = pageTitles[location.pathname] || 'Dashboard';
  const breadcrumb = breadcrumbs[location.pathname] || 'Dashboard';

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-4 border-b border-border bg-background/80 backdrop-blur-xl px-6">
      <div className="flex flex-1 items-center gap-4">
        <div className="flex flex-col">
          <motion.h1
            key={title}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-base font-semibold"
          >
            {title}
          </motion.h1>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Home className="h-3 w-3" />
            <span>/</span>
            <span>{breadcrumb}</span>
          </div>
        </div>
      </div>

      <div className="relative w-64">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar en logs, IPs, usuarios..."
          value={globalSearch}
          onChange={(e) => setGlobalSearch(e.target.value)}
          className="h-9 pl-9 text-sm bg-muted/50 border-muted focus:bg-background"
          aria-label="Búsqueda global"
        />
      </div>

      <div className="flex items-center gap-3 text-sm">

        <div className="text-right">
          <div className="text-sm font-mono font-medium">{timeString}</div>
          <div className="text-[10px] text-muted-foreground leading-tight">{dateString}</div>
        </div>



        <Button
          variant="default"
          size="sm"
          onClick={onOpenCSVModal}
          className="gap-1.5"
          aria-label="Cargar archivo CSV"
        >
          <Upload className="h-4 w-4" />
          Cargar CSV
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={onGenerateReport}
          className="gap-1.5"
          aria-label="Generar reporte"
        >
          <FileBarChart className="h-4 w-4" />
          Reporte
        </Button>
      </div>
    </header>
  );
}
