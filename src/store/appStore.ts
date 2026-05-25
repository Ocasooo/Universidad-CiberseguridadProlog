import { create } from 'zustand';
import { PrologStatus } from '@/types';

interface AppState {
  sidebarCollapsed: boolean;
  sidebarOpen: boolean;
  prologStatus: PrologStatus;
  csvLoaded: boolean;
  csvFileName: string | null;
  csvRecordCount: number;
  activeAlerts: number;
  globalSearch: string;
  theme: 'dark';
  notificationsEnabled: boolean;
  isMobile: boolean;

  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setPrologStatus: (status: PrologStatus) => void;
  setCsvLoaded: (loaded: boolean, fileName?: string, recordCount?: number) => void;
  setActiveAlerts: (count: number) => void;
  setGlobalSearch: (search: string) => void;
  incrementActiveAlerts: () => void;
  decrementActiveAlerts: () => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setIsMobile: (isMobile: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  sidebarCollapsed: false,
  sidebarOpen: false,
  prologStatus: 'connected',
  csvLoaded: false,
  csvFileName: null,
  csvRecordCount: 0,
  activeAlerts: 0,
  globalSearch: '',
  theme: 'dark',
  notificationsEnabled: true,
  isMobile: false,

  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setPrologStatus: (status) => set({ prologStatus: status }),
  setCsvLoaded: (loaded, fileName, recordCount) =>
    set({ csvLoaded: loaded, csvFileName: fileName ?? null, csvRecordCount: recordCount ?? 0 }),
  setActiveAlerts: (count) => set({ activeAlerts: count }),
  setGlobalSearch: (search) => set({ globalSearch: search }),
  incrementActiveAlerts: () => set((state) => ({ activeAlerts: state.activeAlerts + 1 })),
  decrementActiveAlerts: () => set((state) => ({ activeAlerts: Math.max(0, state.activeAlerts - 1) })),
  setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),
  setIsMobile: (isMobile) => set({ isMobile: isMobile }),
}));
