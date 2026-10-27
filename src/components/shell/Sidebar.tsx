'use client';

import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  Search,
  Plus,
  ChevronRight,
  ChevronDown,
  FileText,
  Table,
  Kanban,
  Network,
  FolderLock,
  Cloud,
  MoreVertical,
  Trash2,
  Edit2,
  PlusCircle,
  Palette,
  CloudUpload,
  HardDrive,
  Download,
  Boxes,
  PanelLeftClose,
  Sparkles,
  Terminal,
} from 'lucide-react';
import { db } from '@/db/workspace-db';
import { useWorkspaceStore } from '@/stores/useWorkspaceStore';
import { WorkspacePage, WorkspaceType, ViewType } from '@/types';

export const Sidebar: React.FC = () => {
  const {
    activePageId,
    setActivePageId,
    activeView,
    setActiveView,
    isSidebarOpen,
    toggleSidebar,
    setCommandPaletteOpen,
    setThemeModalOpen,
    setShareModalOpen,
    setBackupModalOpen,
    openCreateModal,
    storageStatus,
  } = useWorkspaceStore();

  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    'private-root': true,
    'shared-root': true,
    'doc-welcome': true,
  });

  const [renamingPageId, setRenamingPageId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState<string>('');
  const [menuOpenPageId, setMenuOpenPageId] = useState<string | null>(null);

  // Live query from Dexie IndexedDB
  const pages = useLiveQuery(async () => {
    return await db.pages.toArray();
  }, []) || [];

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSelectPage = (page: WorkspacePage) => {
    setActivePageId(page.id);
    setActiveView(page.viewType);
  };

  const handleStartRename = (page: WorkspacePage, e: React.MouseEvent) => {
    e.stopPropagation();
    setRenamingPageId(page.id);
    setRenameValue(page.title);
    setMenuOpenPageId(null);
  };

  const handleSaveRename = async (id: string) => {
    if (renameValue.trim()) {
      await db.pages.update(id, {
        title: renameValue.trim(),
        updatedAt: Date.now(),
      });
    }
    setRenamingPageId(null);
  };

  const handleDeletePage = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this page and its subpages?')) {
      // Find subpages
      const childPages = pages.filter((p) => p.parentId === id);
      for (const child of childPages) {
        await db.pages.delete(child.id);
      }
      await db.pages.delete(id);

      // If active page was deleted, switch to another page
      if (activePageId === id) {
        const remaining = pages.filter((p) => p.id !== id && p.parentId !== id);
        if (remaining.length > 0) {
          setActivePageId(remaining[0].id);
          setActiveView(remaining[0].viewType);
        }
      }
    }
    setMenuOpenPageId(null);
  };

  const getViewIcon = (viewType: ViewType) => {
    switch (viewType) {
      case 'doc':
        return <FileText className="w-3.5 h-3.5 text-app-muted" />;
      case 'sheet':
        return <Table className="w-3.5 h-3.5 text-app-muted" />;
      case 'kanban':
        return <Kanban className="w-3.5 h-3.5 text-app-muted" />;
      case 'erd':
        return <Network className="w-3.5 h-3.5 text-app-muted" />;
    }
  };

  const views: { id: ViewType; label: string; icon: React.ReactNode }[] = [
    { id: 'doc', label: 'Document', icon: <FileText className="w-3.5 h-3.5" /> },
    { id: 'sheet', label: 'Sheet Grid', icon: <Table className="w-3.5 h-3.5" /> },
    { id: 'kanban', label: 'Kanban', icon: <Kanban className="w-3.5 h-3.5" /> },
    { id: 'erd', label: 'DB Schema', icon: <Network className="w-3.5 h-3.5" /> },
  ];

  const handleViewChange = async (newView: ViewType) => {
    setActiveView(newView);
    if (activePageId) {
      await db.pages.update(activePageId, {
        viewType: newView,
        updatedAt: Date.now(),
      });
    }
  };

  // Render tree branch recursively
  const renderPageBranch = (parentId: string | null, workspaceType: WorkspaceType, depth: number = 0) => {
    const branchPages = pages.filter(
      (p) => p.parentId === parentId && p.workspaceType === workspaceType
    );

    if (branchPages.length === 0) return null;

    return (
      <div className="flex flex-col space-y-0.5">
        {branchPages.map((page) => {
          const hasChildren = pages.some((p) => p.parentId === page.id);
          const isExpanded = expandedNodes[page.id] ?? false;
          const isActive = activePageId === page.id;
          const isRenaming = renamingPageId === page.id;

          return (
            <div key={page.id} className="flex flex-col select-none">
              <div
                onClick={() => handleSelectPage(page)}
                style={{ paddingLeft: `${depth * 14 + 10}px` }}
                className={`group relative flex items-center justify-between py-1.5 pr-2 rounded-md text-xs cursor-pointer transition-colors duration-150 ${
                  isActive
                    ? 'bg-app-sidebarActive text-app-primary font-medium'
                    : 'text-app-secondary hover:bg-app-sidebarHover hover:text-app-primary'
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  {/* Expand / Collapse Chevron */}
                  <button
                    onClick={(e) => toggleExpand(page.id, e)}
                    className={`w-4 h-4 flex items-center justify-center rounded text-app-muted hover:text-app-primary transition-opacity ${
                      hasChildren ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-3 h-3" />
                    ) : (
                      <ChevronRight className="w-3 h-3" />
                    )}
                  </button>

                  {/* Icon */}
                  <span className="shrink-0 flex items-center mr-1">
                    {getViewIcon(page.viewType)}
                  </span>

                  {/* Title / Inline Rename */}
                  {isRenaming ? (
                    <input
                      type="text"
                      value={renameValue}
                      autoFocus
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveRename(page.id);
                        if (e.key === 'Escape') setRenamingPageId(null);
                      }}
                      onBlur={() => handleSaveRename(page.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="px-1 py-0.5 bg-app-canvas border border-app-accent rounded text-xs text-app-primary outline-none w-full"
                    />
                  ) : (
                    <span className="truncate text-[12px]">{page.title}</span>
                  )}
                </div>

                {/* Right Action Icons on Hover */}
                {!isRenaming && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span title={page.viewType.toUpperCase()} className="opacity-70">
                      {getViewIcon(page.viewType)}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openCreateModal(page.workspaceType, page.id);
                        setExpandedNodes((prev) => ({ ...prev, [page.id]: true }));
                      }}
                      title="Add nested subpage"
                      className="p-0.5 text-app-muted hover:text-app-primary hover:bg-app-sidebar rounded"
                    >
                      <Plus className="w-3 h-3" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpenPageId(menuOpenPageId === page.id ? null : page.id);
                      }}
                      className="p-0.5 text-app-muted hover:text-app-primary hover:bg-app-sidebar rounded"
                    >
                      <MoreVertical className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {/* Page Context Dropdown Menu */}
                {menuOpenPageId === page.id && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-2 top-8 z-50 w-44 rounded-lg bg-app-surface border border-app-border shadow-elevation py-1 text-xs text-app-primary animate-in fade-in zoom-in-95 duration-100"
                  >
                    <button
                      onClick={(e) => handleStartRename(page, e)}
                      className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-app-sidebarHover text-left"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-app-muted" />
                      <span>Rename page</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openCreateModal(page.workspaceType, page.id);
                        setMenuOpenPageId(null);
                      }}
                      className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-app-sidebarHover text-left"
                    >
                      <PlusCircle className="w-3.5 h-3.5 text-app-muted" />
                      <span>Add subpage</span>
                    </button>
                    <div className="h-px bg-app-border my-1" />
                    <button
                      onClick={(e) => handleDeletePage(page.id, e)}
                      className="w-full px-3 py-1.5 flex items-center gap-2 text-red-400 hover:bg-red-500/10 text-left"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete page</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Subpages Branch */}
              {isExpanded && renderPageBranch(page.id, workspaceType, depth + 1)}
            </div>
          );
        })}
      </div>
    );
  };

  if (!isSidebarOpen) return null;

  return (
    <aside className="w-64 min-w-[16rem] max-w-[16rem] h-full flex flex-col shrink-0 bg-app-sidebar border-r border-app-border select-none z-20 transition-all duration-200">
      {/* 1. Workspace Switcher Header */}
      <div className="p-3 border-b border-app-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-md bg-app-surface border border-app-border flex items-center justify-center text-app-primary shadow-sm">
              <Boxes className="w-4 h-4 text-app-primary" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs font-semibold text-app-primary truncate">Workspace</h2>
              <p className="text-[10px] text-app-muted truncate flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                Local Mode
              </p>
            </div>
          </div>

          <button
            onClick={toggleSidebar}
            title="Collapse Sidebar (Alt+B)"
            className="p-1 rounded text-app-muted hover:text-app-primary hover:bg-app-sidebarHover transition-colors"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        {/* Sign In to Sync CTA */}
        <button
          onClick={() => setShareModalOpen(true)}
          className="mt-2.5 w-full py-1.5 px-2.5 rounded-md bg-app-accent/10 hover:bg-app-accent/20 border border-app-accent/20 text-app-accent text-xs font-medium flex items-center justify-between transition-colors group"
        >
          <span className="flex items-center gap-1.5">
            <CloudUpload className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
            <span>Sign in to Sync</span>
          </span>
          <span className="text-[10px] uppercase font-semibold tracking-wider opacity-80">Free</span>
        </button>
      </div>

      {/* 2. Quick Search & Actions */}
      <div className="px-3 pt-2.5 pb-1">
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md bg-app-canvas/60 hover:bg-app-canvas border border-app-border text-xs text-app-muted hover:text-app-primary transition-all duration-150"
        >
          <span className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5" />
            <span>Search or jump...</span>
          </span>
          <kbd className="px-1.5 py-0.5 rounded text-[10px] bg-app-sidebar border border-app-border text-app-muted font-mono">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* 2.5 Active View Mode Switcher (Moved from Top Navbar) */}
      <div className="px-3 pt-1 pb-2 border-b border-app-border/40">
        <div className="text-[10px] font-semibold text-app-muted uppercase tracking-wider mb-1.5 flex items-center justify-between">
          <span>Active View</span>
          <span className="text-[9px] font-mono lowercase opacity-60">{activeView}</span>
        </div>
        <div className="grid grid-cols-2 gap-1 p-0.5 rounded-lg bg-app-sidebar/80 border border-app-border">
          {views.map((tab) => {
            const isActive = activeView === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleViewChange(tab.id)}
                className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md text-[11px] font-medium transition-all ${
                  isActive
                    ? 'bg-app-surface text-app-primary shadow-sm border border-app-border'
                    : 'text-app-muted hover:text-app-primary hover:bg-app-sidebarHover'
                }`}
              >
                <span className={isActive ? 'text-app-primary' : 'opacity-70'}>{tab.icon}</span>
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Split Folder Tree */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-4">
        {/* SECTION 1: PRIVATE */}
        <div>
          <div className="flex items-center justify-between px-2 py-1 text-[11px] font-semibold text-app-muted uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <FolderLock className="w-3.5 h-3.5 text-app-muted" />
              <span>Private</span>
            </span>
            <button
              onClick={() => openCreateModal('private')}
              title="Add Private Page"
              className="p-1 rounded text-app-muted hover:text-app-primary hover:bg-app-sidebarHover transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="mt-1">
            {renderPageBranch(null, 'private')}
          </div>
        </div>

        {/* SECTION 2: SHARED */}
        <div>
          <div className="flex items-center justify-between px-2 py-1 text-[11px] font-semibold text-app-muted uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Cloud className="w-3.5 h-3.5 text-app-muted" />
              <span>Shared</span>
            </span>
            <button
              onClick={() => openCreateModal('shared')}
              title="Add Shared Page"
              className="p-1 rounded text-app-muted hover:text-app-primary hover:bg-app-sidebarHover transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="mt-1">
            {renderPageBranch(null, 'shared')}
          </div>
        </div>

        {/* SECTION 3: DEV TOOLS */}
        <div>
          <div className="flex items-center justify-between px-2 py-1 text-[11px] font-semibold text-app-muted uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-app-muted" />
              <span>Dev Tools</span>
            </span>
            <button
              onClick={() => openCreateModal('devtools')}
              title="Add Dev Tool Page"
              className="p-1 rounded text-app-muted hover:text-app-primary hover:bg-app-sidebarHover transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="mt-1">
            {renderPageBranch(null, 'devtools')}
          </div>
        </div>
      </div>

      {/* 4. Bottom Storage Status Bar */}
      <div className="p-2.5 border-t border-app-border bg-app-sidebar/80 flex flex-col gap-1.5 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[11px] text-app-secondary font-medium">
              Saved Locally to IndexedDB
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setBackupModalOpen(true)}
              title="Backup Workspace (.zip) & Link Desktop Folder"
              className="p-1 text-app-muted hover:text-app-primary hover:bg-app-sidebarHover rounded transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
            </button>

            <button
              onClick={() => setThemeModalOpen(true)}
              title="Switch Theme & Typography"
              className="p-1 text-app-muted hover:text-app-primary hover:bg-app-sidebarHover rounded transition-colors"
            >
              <Palette className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] text-app-muted px-0.5">
          <span className="flex items-center gap-1">
            <HardDrive className="w-3 h-3" />
            <span>{storageStatus.itemCount} items &bull; {storageStatus.dbSizeKB} KB</span>
          </span>
          <span className="flex items-center gap-0.5 text-app-accent hover:underline cursor-pointer" onClick={() => setShareModalOpen(true)}>
            <Sparkles className="w-2.5 h-2.5" />
            <span>P2P Ready</span>
          </span>
        </div>
      </div>
    </aside>
  );
};
