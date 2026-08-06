'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  type Lead, type Notification, type Workspace, type UserProfile,
  type NotifSettings,
  INITIAL_NOTIFICATIONS, INITIAL_WORKSPACES, INITIAL_PROFILE,
  INITIAL_NOTIF_SETTINGS,
} from '@/lib/mockData';

interface AppState {
  // Layout (not persisted)
  sidebarCollapsed: boolean;
  mobileMenuOpen: boolean;

  // Overlay state (not persisted)
  escalatingLead: Lead | null;
  hotLead: Lead | null;

  // Workspace switching overlay (not persisted)
  isSwitchingWorkspace: boolean;
  switchingToWorkspaceName: string | null;

  // Full-screen branded loading during auth transitions (login/logout) — not persisted
  authTransition: boolean;

  // Persisted UI
  theme: 'light' | 'dark';
  leadsView: 'kanban' | 'list' | 'table';
  servicesView: 'grid' | 'table';
  inventoryView: 'grid' | 'list';

  // Persisted data
  notifications: Notification[];
  workspaces: Workspace[];
  currentWorkspaceId: string;
  profile: UserProfile;
  notifSettings: NotifSettings;

  // Actions
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setMobileMenuOpen: (open: boolean) => void;
  setTheme: (t: 'light' | 'dark') => void;
  toggleTheme: () => void;
  setEscalatingLead: (lead: Lead | null) => void;
  setHotLead: (lead: Lead | null) => void;
  setLeadsView: (v: 'kanban' | 'list' | 'table') => void;
  setServicesView: (v: 'grid' | 'table') => void;
  setInventoryView: (v: 'grid' | 'list') => void;
  markNotificationRead: (id: string) => void;
  markAllRead: () => void;
  setCurrentWorkspace: (id: string) => void;
  setWorkspaceSwitching: (switching: boolean, name?: string) => void;
  setAuthTransition: (v: boolean) => void;
  addWorkspace: (ws: Workspace) => void;
  updateProfile: (p: Partial<UserProfile>) => void;
  updateNotifSettings: (s: Partial<NotifSettings>) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      mobileMenuOpen: false,
      escalatingLead: null,
      hotLead: null,
      isSwitchingWorkspace: false,
      switchingToWorkspaceName: null,
      authTransition: false,
      theme: 'light',
      leadsView: 'kanban',
      servicesView: 'grid',
      inventoryView: 'grid',
      notifications: INITIAL_NOTIFICATIONS,
      workspaces: INITIAL_WORKSPACES,
      currentWorkspaceId: 'W1',
      profile: INITIAL_PROFILE,
      notifSettings: INITIAL_NOTIF_SETTINGS,

      toggleSidebar: () => set(s => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
      setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set(s => ({ theme: s.theme === 'light' ? 'dark' : 'light' })),
      setEscalatingLead: (escalatingLead) => set({ escalatingLead }),
      setHotLead: (hotLead) => set({ hotLead }),
      setLeadsView: (leadsView) => set({ leadsView }),
      setServicesView: (servicesView) => set({ servicesView }),
      setInventoryView: (inventoryView) => set({ inventoryView }),

      markNotificationRead: (id) =>
        set(s => ({ notifications: s.notifications.map(n => n.id === id ? { ...n, read: true } : n) })),
      markAllRead: () =>
        set(s => ({ notifications: s.notifications.map(n => ({ ...n, read: true })) })),

      setCurrentWorkspace: (currentWorkspaceId) => set({ currentWorkspaceId }),
      setWorkspaceSwitching: (switching, name) => set({
        isSwitchingWorkspace: switching,
        switchingToWorkspaceName: switching ? (name ?? null) : null,
      }),
      setAuthTransition: (authTransition) => set({ authTransition }),
      addWorkspace: (ws) => set(s => ({ workspaces: [...s.workspaces, ws] })),

      updateProfile: (p) => set(s => ({ profile: { ...s.profile, ...p } })),

      updateNotifSettings: (s) => set(st => ({ notifSettings: { ...st.notifSettings, ...s } })),
    }),
    {
      name: 'sf:app',
      partialize: (state) => ({
        theme: state.theme,
        leadsView: state.leadsView,
        servicesView: state.servicesView,
        inventoryView: state.inventoryView,
        notifications: state.notifications,
        workspaces: state.workspaces,
        currentWorkspaceId: state.currentWorkspaceId,
        profile: state.profile,
        notifSettings: state.notifSettings,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);
