'use client';

import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  PanelLeft,
  FileText,
  Table,
  Kanban,
  Network,
  Share2,
  HardDrive,
  Cloud,
  ChevronRight,
  Maximize2,
  Minimize2,
  Download,
} from 'lucide-react';
import { db } from '@/db/workspace-db';
import { useWorkspaceStore } from '@/stores/useWorkspaceStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { DynamicSyncManager } from '@/sync/SyncProvider';
import { SaveExportMenu } from './SaveExportMenu';

export const TopNavbar: React.FC = () => {
  const {
    activePageId,
    setActivePageId,
    activeView,
    setActiveView,
    widthPreference,
    toggleWidthPreference,
    isSidebarOpen,
    toggleSidebar,
    collaborators,
    setShareModalOpen,
  } = useWorkspaceStore();

  const { isAuthenticated, openAuthModal } = useAuthStore();

  const handleShareClick = () => {
    setShareModalOpen(true);
  };

  const activePage = useLiveQuery(
    () => (activePageId ? db.pages.get(activePageId) : undefined),
    [activePageId]
  );

  const parentPage = useLiveQuery(
    () => (activePage?.parentId ? db.pages.get(activePage.parentId) : undefined),
    [activePage?.parentId]
  );

  const isShared = activePage?.workspaceType === 'shared';

  const [navTitle, setNavTitle] = React.useState(activePage?.title || '');

  React.useEffect(() => {
    if (activePage) {
      setNavTitle(activePage.title);
    }
  }, [activePage?.id, activePage?.title]);

  const handleNavTitleChange = async (newVal: string) => {
    setNavTitle(newVal);
    if (activePage) {
      await db.pages.update(activePage.id, {
        title: newVal,
        updatedAt: Date.now(),
      });
    }
  };

  return (
    <header className="h-12 w-full flex items-center justify-between px-3.5 bg-app-surface/90 backdrop-blur-md border-b border-app-border shrink-0 select-none transition-colors duration-150 z-20">
      {/* 1. Left: Sidebar Toggle & Dynamic Breadcrumbs */}
      <div className="flex items-center gap-2 min-w-0">
        {!isSidebarOpen && (
          <button
            onClick={toggleSidebar}
            title="Open Sidebar (Alt+B)"
            className="p-1.5 rounded-md text-app-muted hover:text-app-primary hover:bg-app-sidebarHover transition-colors mr-1"
          >
            <PanelLeft className="w-4 h-4" />
          </button>
        )}

        <div className="flex items-center gap-1.5 text-xs text-app-muted truncate">
          <span className="font-medium text-app-secondary hover:text-app-primary transition-colors cursor-pointer">
            {isShared ? 'Shared Cloud' : 'Device Vault'}
          </span>

          {parentPage && (
            <>
              <ChevronRight className="w-3 h-3 text-app-border shrink-0" />
              <button
                onClick={() => {
                  setActivePageId(parentPage.id);
                  setActiveView(parentPage.viewType);
                }}
                className="hover:text-app-primary truncate max-w-[120px] transition-colors"
              >
                {parentPage.title}
              </button>
            </>
          )}

          <ChevronRight className="w-3 h-3 text-app-border shrink-0" />

          <input
            type="text"
            value={navTitle}
            onChange={(e) => handleNavTitleChange(e.target.value)}
            placeholder="Untitled Document"
            title="Click to rename document"
            className="font-semibold text-app-primary bg-transparent border border-transparent hover:border-app-border focus:border-app-accent focus:bg-app-surface px-1.5 py-0.5 rounded text-xs outline-none max-w-[220px] transition-colors truncate"
          />
        </div>
      </div>

      {/* 2. Center: Workspace & Canvas Tools (Replaces old view switcher) */}
      <div className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded-xl bg-app-sidebar/80 border border-app-border text-xs">
        {/* Canvas Width Preference Toggle */}
        <button
          onClick={toggleWidthPreference}
          title={`Canvas Width: ${widthPreference === 'standard' ? 'Standard 760px' : 'Full Canvas (100%)'} [Alt+W]`}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-app-secondary hover:text-app-primary hover:bg-app-surface transition-colors"
        >
          {widthPreference === 'standard' ? (
            <Maximize2 className="w-3.5 h-3.5 text-app-muted" />
          ) : (
            <Minimize2 className="w-3.5 h-3.5 text-app-muted" />
          )}
          <span className="text-[11px] font-medium">
            {widthPreference === 'standard' ? '760px Width' : 'Full Canvas'}
          </span>
        </button>

        <div className="w-[1px] h-3.5 bg-app-border/80 my-auto" />

        {/* Current Active Canvas Indicator */}
        <div className="flex items-center gap-1.5 px-2 py-0.5 text-app-muted font-medium text-[11px]">
          {activeView === 'doc' && (
            <>
              <FileText className="w-3.5 h-3.5 text-app-primary" />
              <span className="text-app-secondary">Note Canvas</span>
            </>
          )}
          {activeView === 'sheet' && (
            <>
              <Table className="w-3.5 h-3.5 text-app-primary" />
              <span className="text-app-secondary">Sheet Grid</span>
            </>
          )}
          {activeView === 'kanban' && (
            <>
              <Kanban className="w-3.5 h-3.5 text-app-primary" />
              <span className="text-app-secondary">Kanban Board</span>
            </>
          )}
          {activeView === 'erd' && (
            <>
              <Network className="w-3.5 h-3.5 text-app-primary" />
              <span className="text-app-secondary">Design Canvas</span>
            </>
          )}
        </div>
      </div>

      {/* 3. Right: Sync Pill, Save & Export, Collaborator Avatars & Share */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Sync Status Pill */}
        <button
          onClick={() => setShareModalOpen(true)}
          title="Click to manage sync & replication settings"
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors ${
            isShared
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
              : 'bg-app-sidebar border-app-border text-app-muted hover:text-app-primary hover:bg-app-sidebarHover'
          }`}
        >
          {isShared ? (
            <>
              <Cloud className="w-3.5 h-3.5 text-emerald-400" />
              <span>Cloud Synced</span>
            </>
          ) : (
            <>
              <HardDrive className="w-3.5 h-3.5 text-amber-400" />
              <span>Local Only</span>
            </>
          )}
        </button>

        {/* Collaborators Presence Avatars */}
        <div className="hidden sm:flex items-center -space-x-1.5 pl-1">
          {collaborators.map((c) => (
            <div
              key={c.id}
              onClick={() => DynamicSyncManager.startFollowingTeammate(c.id, c.name)}
              title={`Follow ${c.name} (Cinema Mode)\nViewing: ${c.currentView || 'Document'}`}
              className="relative group cursor-pointer"
            >
              <div
                style={{ backgroundColor: c.color }}
                className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-app-surface ring-1 ring-black/20 uppercase transition-transform group-hover:scale-125"
              >
                {c.initials}
              </div>
              <span
                className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border border-app-surface ${
                  c.status === 'online'
                    ? 'bg-emerald-400'
                    : c.status === 'editing'
                    ? 'bg-amber-400'
                    : 'bg-gray-400'
                }`}
              />
            </div>
          ))}
        </div>

        {/* Save & Export Menu (PDF, Text, Markdown, HTML, Full Workspace Zip) */}
        <SaveExportMenu activePage={activePage} />

        {/* Share Button */}
        <button
          onClick={handleShareClick}
          className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-app-accent hover:bg-app-accentHover text-white text-xs font-medium shadow-sm transition-colors"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Share</span>
        </button>
      </div>
    </header>
  );
};
