import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ToastProvider } from '@/components/ui/toast';
import { MainLayout } from '@/layouts/MainLayout';
import { Dashboard } from '@/pages/Dashboard';
import { LogsPage } from '@/pages/Logs';
import { AlertsPage } from '@/pages/Alerts';
import { ReportsPage } from '@/pages/Reports';
import { BlacklistPage } from '@/pages/Blacklist';
import { SettingsPage } from '@/pages/Settings';

function App() {

  return (
    <BrowserRouter>
      <TooltipProvider delayDuration={300}>
        <ToastProvider>
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/logs" element={<LogsPage />} />
              <Route path="/alerts" element={<AlertsPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/blacklist" element={<BlacklistPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Routes>
        </ToastProvider>
      </TooltipProvider>
    </BrowserRouter>
  );
}

export default App;
