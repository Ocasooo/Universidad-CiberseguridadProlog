import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  ScrollText,
  ShieldAlert,
  FileBarChart,
  Ban,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
  Activity,
  Terminal,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/appStore';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/logs', icon: ScrollText, label: 'Logs' },
  { to: '/alerts', icon: ShieldAlert, label: 'Alertas' },
  { to: '/reports', icon: FileBarChart, label: 'Reportes' },
  { to: '/blacklist', icon: Ban, label: 'Blacklist' },
  { to: '/settings', icon: Settings, label: 'Configuración' },
];

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, prologStatus } = useAppStore();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const statusColors = {
    connected: 'bg-success shadow-[0_0_8px_hsl(142_76%_36%/0.5)]',
    disconnected: 'bg-destructive shadow-[0_0_8px_hsl(0_84%_60%/0.5)]',
    error: 'bg-warning shadow-[0_0_8px_hsl(38_92%_50%/0.5)]',
  };

  const statusLabels = {
    connected: 'Conectado',
    disconnected: 'Desconectado',
    error: 'Error',
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-30 flex h-full flex-col border-r border-border bg-sidebar transition-all duration-300 ease-in-out',
        sidebarCollapsed ? 'w-16' : 'w-60'
      )}
      aria-label="Sidebar de navegación"
    >
      <div className="flex h-14 items-center justify-between border-b border-sidebar-border px-3">
        <AnimatePresence mode="wait">
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="flex items-center gap-2 overflow-hidden"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold leading-tight text-gradient">Cybersecurity</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {sidebarCollapsed && (
          <div className="flex w-full justify-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
              <Shield className="h-5 w-5 text-primary" />
            </div>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors"
          aria-label={sidebarCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
        >
          {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      <div className={cn('flex items-center gap-2 border-b border-sidebar-border px-3 py-2', sidebarCollapsed && 'justify-center')}>
        <div className={cn('h-2 w-2 rounded-full', statusColors[prologStatus])} />
        {!sidebarCollapsed && (
          <span className="text-xs text-muted-foreground">
            Motor Prolog: {statusLabels[prologStatus]}
          </span>
        )}
      </div>

      <nav className="flex-1 space-y-1 px-2 py-3" aria-label="Navegación principal">
        <TooltipProvider delayDuration={sidebarCollapsed ? 100 : 999999}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Tooltip key={item.to}>
                <TooltipTrigger asChild>
                  <NavLink
                    to={item.to}
                    onMouseEnter={() => setHoveredItem(item.label)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className={({ isActive }) =>
                      cn(
                        'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                        sidebarCollapsed && 'justify-center px-2',
                        isActive
                          ? 'bg-primary/10 text-primary shadow-[0_0_12px_hsl(142_76%_36%/0.15)]'
                          : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground'
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon className={cn('h-5 w-5 shrink-0 transition-transform', isActive && 'scale-110')} />
                        <AnimatePresence mode="wait">
                          {!sidebarCollapsed && (
                            <motion.span
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -10 }}
                              transition={{ duration: 0.15 }}
                            >
                              {item.label}
                            </motion.span>
                          )}
                        </AnimatePresence>
                        {isActive && (
                          <motion.div
                            layoutId="activeNav"
                            className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-primary shadow-[0_0_6px_hsl(142_76%_36%/0.5)]"
                          />
                        )}
                      </>
                    )}
                  </NavLink>
                </TooltipTrigger>
                {sidebarCollapsed && (
                  <TooltipContent side="right" className="ml-2">
                    {item.label}
                  </TooltipContent>
                )}
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </nav>

      <div className={cn('border-t border-sidebar-border p-3', sidebarCollapsed && 'flex flex-col items-center gap-2')}>
        <div className={cn('flex items-center gap-2', sidebarCollapsed && 'justify-center')}>
          <Activity className="h-4 w-4 text-success" />
          {!sidebarCollapsed && (
            <span className="text-xs text-muted-foreground">Sistema activo</span>
          )}
        </div>
        {!sidebarCollapsed && (
          <div className="mt-1 flex items-center gap-2">
            <Terminal className="h-3 w-3 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">v1.0.0 · Prolog Engine</span>
          </div>
        )}
      </div>
    </aside>
  );
}
