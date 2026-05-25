import { create } from 'zustand';
import { LogEntry, Alert, BlacklistEntry, Report } from '@/types';

interface LogsState {
  logs: LogEntry[];
  filteredLogs: LogEntry[];
  alerts: Alert[];
  blacklist: BlacklistEntry[];
  reports: Report[];
  selectedLog: LogEntry | null;
  selectedAlert: Alert | null;
  drawerOpen: boolean;
  alertFilter: string;
  logSearch: string;
  severityFilter: string;
  sortField: keyof LogEntry | null;
  sortDirection: 'asc' | 'desc';

  setLogs: (logs: LogEntry[]) => void;
  addLog: (log: LogEntry) => void;
  setFilteredLogs: (logs: LogEntry[]) => void;
  setAlerts: (alerts: Alert[]) => void;
  addAlert: (alert: Alert) => void;
  updateAlert: (id: string, update: Partial<Alert>) => void;
  setBlacklist: (blacklist: BlacklistEntry[]) => void;
  addToBlacklist: (entry: BlacklistEntry) => void;
  removeFromBlacklist: (id: string) => void;
  setReports: (reports: Report[]) => void;
  addReport: (report: Report) => void;
  setSelectedLog: (log: LogEntry | null) => void;
  setSelectedAlert: (alert: Alert | null) => void;
  setDrawerOpen: (open: boolean) => void;
  setAlertFilter: (filter: string) => void;
  setLogSearch: (search: string) => void;
  setSeverityFilter: (filter: string) => void;
  setSortField: (field: keyof LogEntry | null) => void;
  setSortDirection: (direction: 'asc' | 'desc') => void;
  clearLogFilters: () => void;
}

export const useLogsStore = create<LogsState>((set, get) => ({
  logs: [],
  filteredLogs: [],
  alerts: [],
  blacklist: [],
  reports: [],
  selectedLog: null,
  selectedAlert: null,
  drawerOpen: false,
  alertFilter: 'all',
  logSearch: '',
  severityFilter: 'all',
  sortField: null,
  sortDirection: 'asc',

  setLogs: (logs) => set({ logs, filteredLogs: logs }),
  addLog: (log) => set((state) => ({ logs: [log, ...state.logs] })),
  setFilteredLogs: (logs) => set({ filteredLogs: logs }),
  setAlerts: (alerts) => set({ alerts }),
  addAlert: (alert) => set((state) => ({ alerts: [alert, ...state.alerts] })),
  updateAlert: (id, update) =>
    set((state) => ({
      alerts: state.alerts.map((a) => (a.id === id ? { ...a, ...update } : a)),
    })),
  setBlacklist: (blacklist) => set({ blacklist }),
  addToBlacklist: (entry) => set((state) => ({ blacklist: [entry, ...state.blacklist] })),
  removeFromBlacklist: (id) =>
    set((state) => ({ blacklist: state.blacklist.filter((b) => b.id !== id) })),
  setReports: (reports) => set({ reports }),
  addReport: (report) => set((state) => ({ reports: [report, ...state.reports] })),
  setSelectedLog: (log) => set({ selectedLog: log }),
  setSelectedAlert: (alert) => set({ selectedAlert: alert }),
  setDrawerOpen: (open) => set({ drawerOpen: open }),
  setAlertFilter: (filter) => set({ alertFilter: filter }),
  setLogSearch: (search) => set({ logSearch: search }),
  setSeverityFilter: (filter) => set({ severityFilter: filter }),
  setSortField: (field) => set({ sortField: field }),
  setSortDirection: (direction) => set({ sortDirection: direction }),
  clearLogFilters: () => set({ logSearch: '', severityFilter: 'all', sortField: null, sortDirection: 'asc' }),
}));
