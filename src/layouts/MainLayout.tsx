import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { CSVModal } from '@/components/CSVModal';
import { ReportGenerator } from '@/components/ReportGenerator';
import { useAppStore } from '@/store/appStore';
import { cn } from '@/lib/utils';

export function MainLayout() {
  const { sidebarCollapsed } = useAppStore();
  const [csvModalOpen, setCsvModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />

      <main
        className={cn(
          'flex flex-1 flex-col overflow-hidden transition-all duration-300 ease-in-out',
          sidebarCollapsed ? 'ml-16' : 'ml-60'
        )}
      >
        <Topbar
          onOpenCSVModal={() => setCsvModalOpen(true)}
          onGenerateReport={() => setReportModalOpen(true)}
        />

        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <CSVModal open={csvModalOpen} onClose={() => setCsvModalOpen(false)} />
      <ReportGenerator open={reportModalOpen} onClose={() => setReportModalOpen(false)} />
    </div>
  );
}
