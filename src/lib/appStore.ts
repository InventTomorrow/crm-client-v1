'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  type Lead, type Notification, type Workspace, type UserProfile,
  type TeamUser, type NotifSettings,
  INITIAL_NOTIFICATIONS, INITIAL_WORKSPACES, INITIAL_PROFILE,
  INITIAL_TEAM_USERS, INITIAL_NOTIF_SETTINGS,
} from '@/lib/mockData';

interface AppState {
  // Layout (not persisted)
  sidebarCollapsed: boolean;
  mobileMenuOpen: boolean;
  isFullScreen: boolean;

  // Overlay state (not persisted)
  escalatingLead: Lead | null;
  hotLead: Lead | null;

  // Workspace switching overlay (not persisted)
  isSwitchingWorkspace: boolean;
  switchingToWorkspaceName: string | null;

  // Persisted UI
  theme: 'light' | 'dark';
  leadsView: 'kanban' | 'list' | 'table';
  inventoryView: 'grid' | 'list';

  // Persisted data
  notifications: Notification[];
  workspaces: Workspace[];
  currentWorkspaceId: string;
  profile: UserProfile;
  teamUsers: TeamUser[];
  notifSettings: NotifSettings;

  // Actions
  toggleSidebar: () => void;
  setMobileMenuOpen: (open: boolean) => void;
  toggleFullScreen: () => void;
  setTheme: (t: 'light' | 'dark') => void;
  toggleTheme: () => void;
  setEscalatingLead: (lead: Lead | null) => void;
  setHotLead: (lead: Lead | null) => void;
  setLeadsView: (v: 'kanban' | 'list' | 'table') => void;
  setInventoryView: (v: 'grid' | 'list') => void;
  markNotificationRead: (id: string) => void;
  markAllRead: () => void;
  setCurrentWorkspace: (id: string) => void;
  setWorkspaceSwitching: (switching: boolean, name?: string) => void;
  addWorkspace: (ws: Workspace) => void;
  updateProfile: (p: Partial<UserProfile>) => void;
  saveTeamUser: (u: TeamUser) => void;
  toggleTeamUserStatus: (id: string) => void;
  deleteTeamUser: (id: string) => void;
  updateNotifSettings: (s: Partial<NotifSettings>) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      sidebarCollapsed: false,
      mobileMenuOpen: false,
      isFullScreen: false,
      escalatingLead: null,
      hotLead: null,
      isSwitchingWorkspace: false,
      switchingToWorkspaceName: null,
      theme: 'light',
      leadsView: 'kanban',
      inventoryView: 'grid',
      notifications: INITIAL_NOTIFICATIONS,
      workspaces: INITIAL_WORKSPACES,
      currentWorkspaceId: 'W1',
      profile: INITIAL_PROFILE,
      teamUsers: INITIAL_TEAM_USERS,
      notifSettings: INITIAL_NOTIF_SETTINGS,

      toggleSidebar: () => set(s => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
      toggleFullScreen: () => set(s => ({ isFullScreen: !s.isFullScreen })),
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set(s => ({ theme: s.theme === 'light' ? 'dark' : 'light' })),
      setEscalatingLead: (escalatingLead) => set({ escalatingLead }),
      setHotLead: (hotLead) => set({ hotLead }),
      setLeadsView: (leadsView) => set({ leadsView }),
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
      addWorkspace: (ws) => set(s => ({ workspaces: [...s.workspaces, ws] })),

      updateProfile: (p) => set(s => ({ profile: { ...s.profile, ...p } })),

      saveTeamUser: (u) => set(s => {
        const exists = s.teamUsers.find(x => x.id === u.id);
        return {
          teamUsers: exists
            ? s.teamUsers.map(x => x.id === u.id ? { ...x, ...u } : x)
            : [u, ...s.teamUsers],
        };
      }),
      toggleTeamUserStatus: (id) => set(s => ({
        teamUsers: s.teamUsers.map(u =>
          u.id === id ? { ...u, status: u.status === 'active' ? 'disabled' : 'active' } : u
        ),
      })),
      deleteTeamUser: (id) => set(s => ({ teamUsers: s.teamUsers.filter(u => u.id !== id) })),

      updateNotifSettings: (s) => set(st => ({ notifSettings: { ...st.notifSettings, ...s } })),
    }),
    {
      name: 'sf:app',
      partialize: (state) => ({
        theme: state.theme,
        leadsView: state.leadsView,
        inventoryView: state.inventoryView,
        notifications: state.notifications,
        workspaces: state.workspaces,
        currentWorkspaceId: state.currentWorkspaceId,
        profile: state.profile,
        teamUsers: state.teamUsers,
        notifSettings: state.notifSettings,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);
