import { create } from 'zustand';
import { ViewType, WidthPreference, WorkspaceType, Collaborator, StorageStatus } from '@/types';

interface WorkspaceState {
  // Navigation & Page
  activePageId: string;
  setActivePageId: (id: string) => void;
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
  widthPreference: WidthPreference;
  setWidthPreference: (width: WidthPreference) => void;
  toggleWidthPreference: () => void;

  // Sidebar
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  // Search & Modals
  isCommandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  isShareModalOpen: boolean;
  setShareModalOpen: (open: boolean) => void;
  isBackupModalOpen: boolean;
  setBackupModalOpen: (open: boolean) => void;
  isThemeModalOpen: boolean;
  setThemeModalOpen: (open: boolean) => void;
  isSettingsModalOpen: boolean;
  setSettingsModalOpen: (open: boolean) => void;

  // Page Creation
  createModalState: {
    isOpen: boolean;
    workspaceType: WorkspaceType;
    parentId: string | null;
  };
  openCreateModal: (workspaceType: WorkspaceType, parentId?: string | null) => void;
  closeCreateModal: () => void;

  // Collaborators Presence
  collaborators: Collaborator[];
  syncStatus: 'local' | 'synced' | 'syncing';
  setSyncStatus: (status: 'local' | 'synced' | 'syncing') => void;

  // Storage Stats
  storageStatus: StorageStatus;
  setStorageStatus: (status: Partial<StorageStatus>) => void;

  // Desktop Shell Detection
  isDesktopApp: boolean;
  setIsDesktopApp: (isDesktop: boolean) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  activePageId: 'doc-welcome',
  setActivePageId: (id) => set({ activePageId: id }),
  activeView: 'doc',
  setActiveView: (view) => set({ activeView: view }),
  widthPreference: 'standard',
  setWidthPreference: (width) => set({ widthPreference: width }),
  toggleWidthPreference: () =>
    set((state) => ({
      widthPreference: state.widthPreference === 'standard' ? 'full' : 'standard',
    })),

  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),

  isCommandPaletteOpen: false,
  setCommandPaletteOpen: (open) => set({ isCommandPaletteOpen: open }),

  isShareModalOpen: false,
  setShareModalOpen: (open) => set({ isShareModalOpen: open }),

  isBackupModalOpen: false,
  setBackupModalOpen: (open) => set({ isBackupModalOpen: open }),

  isThemeModalOpen: false,
  setThemeModalOpen: (open) => set({ isThemeModalOpen: open }),

  isSettingsModalOpen: false,
  setSettingsModalOpen: (open) => set({ isSettingsModalOpen: open }),

  createModalState: {
    isOpen: false,
    workspaceType: 'private',
    parentId: null,
  },
  openCreateModal: (workspaceType, parentId = null) =>
    set({
      createModalState: {
        isOpen: true,
        workspaceType,
        parentId,
      },
    }),
  closeCreateModal: () =>
    set({
      createModalState: {
        isOpen: false,
        workspaceType: 'private',
        parentId: null,
      },
    }),

  collaborators: [
    { id: '1', name: 'Alex R. (You)', initials: 'AR', color: '#3b82f6', status: 'online', currentView: 'Document' },
    { id: '2', name: 'Sarah K. (Tech Lead)', initials: 'SK', color: '#10b981', status: 'editing', currentView: 'Kanban' },
    { id: '3', name: 'Dave M. (DevOps)', initials: 'DM', color: '#8b5cf6', status: 'idle', currentView: 'ERD' },
  ],
  syncStatus: 'local',
  setSyncStatus: (status) => set({ syncStatus: status }),

  storageStatus: {
    itemCount: 16,
    dbSizeKB: 48,
    lastSavedAt: Date.now(),
    isSaving: false,
  },
  setStorageStatus: (status) =>
    set((state) => ({
      storageStatus: { ...state.storageStatus, ...status },
    })),

  isDesktopApp: false,
  setIsDesktopApp: (isDesktop) => set({ isDesktopApp: isDesktop }),
}));
