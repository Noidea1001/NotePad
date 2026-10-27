'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  Search,
  FileText,
  Table,
  Kanban,
  Network,
  Palette,
  Maximize2,
  Share2,
  Plus,
  ArrowRight,
  Type,
  FolderLock,
  Cloud,
} from 'lucide-react';
import { db } from '@/db/workspace-db';
import { useWorkspaceStore } from '@/stores/useWorkspaceStore';
import { useThemeStore, THEME_PRESETS, FONT_PRESETS } from '@/stores/useThemeStore';
import { ThemeId, FontId, ViewType } from '@/types';

export const CommandPalette: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setCommandPaletteOpen,
    setActivePageId,
    setActiveView,
    toggleWidthPreference,
    setShareModalOpen,
    openCreateModal,
  } = useWorkspaceStore();

  const { setTheme, setFont } = useThemeStore();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const pages = useLiveQuery(() => db.pages.toArray(), []) || [];

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!isCommandPaletteOpen);
      }
      if (e.key === 'Escape' && isCommandPaletteOpen) {
        e.preventDefault();
        setCommandPaletteOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setCommandPaletteOpen]);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isCommandPaletteOpen]);

  // Command items construction
  const pageItems = pages
    .filter((p) => p.title.toLowerCase().includes(query.toLowerCase()))
    .map((p) => ({
      id: `page-${p.id}`,
      type: 'page',
      title: p.title,
      subtitle: `${p.workspaceType === 'shared' ? 'Shared' : 'Private'} &bull; ${p.viewType.toUpperCase()}`,
      icon: (
        <span className="text-app-muted">
          {p.viewType === 'doc' && <FileText className="w-4 h-4" />}
          {p.viewType === 'sheet' && <Table className="w-4 h-4" />}
          {p.viewType === 'kanban' && <Kanban className="w-4 h-4" />}
          {p.viewType === 'erd' && <Network className="w-4 h-4" />}
        </span>
      ),
      action: () => {
        setActivePageId(p.id);
        setActiveView(p.viewType);
        setCommandPaletteOpen(false);
      },
    }));

  const actionItems = [
    {
      id: 'act-new-doc',
      type: 'action',
      title: 'Create New Document Page',
      subtitle: 'Markdown block canvas in Private vault',
      icon: <FileText className="w-4 h-4 text-app-muted" />,
      action: () => {
        openCreateModal('private');
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'act-new-sheet',
      type: 'action',
      title: 'Create New Sheet Grid',
      subtitle: 'Linear / Notion style tabular data sheet',
      icon: <Table className="w-4 h-4 text-app-muted" />,
      action: () => {
        openCreateModal('private');
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'act-new-kanban',
      type: 'action',
      title: 'Create New Kanban Board',
      subtitle: 'Multi-column task and workflow board',
      icon: <Kanban className="w-4 h-4 text-app-muted" />,
      action: () => {
        openCreateModal('shared');
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'act-new-erd',
      type: 'action',
      title: 'Create New DB Schema (ERD)',
      subtitle: 'Entity Relationship Diagram modeler',
      icon: <Network className="w-4 h-4 text-app-muted" />,
      action: () => {
        openCreateModal('private');
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'act-toggle-width',
      type: 'action',
      title: 'Toggle Canvas Width',
      subtitle: 'Switch between Standard (760px) and Full Width',
      icon: <Maximize2 className="w-4 h-4 text-app-muted" />,
      action: () => {
        toggleWidthPreference();
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'act-share-sync',
      type: 'action',
      title: 'Open Share & Peer Sync Modal',
      subtitle: 'Inspect local storage, JSON export/import and cloud sync',
      icon: <Share2 className="w-4 h-4 text-app-muted" />,
      action: () => {
        setShareModalOpen(true);
        setCommandPaletteOpen(false);
      },
    },
  ].filter((a) => a.title.toLowerCase().includes(query.toLowerCase()));

  // Theme switch commands
  const themeItems = Object.values(THEME_PRESETS)
    .filter((t) => t.name.toLowerCase().includes(query.toLowerCase()) || query.toLowerCase().includes('theme'))
    .map((t) => ({
      id: `theme-${t.id}`,
      type: 'theme',
      title: `Theme: ${t.name}`,
      subtitle: t.description,
      icon: <Palette className="w-4 h-4 text-pink-400" />,
      action: () => {
        setTheme(t.id as ThemeId);
        setCommandPaletteOpen(false);
      },
    }));

  // Font switch commands
  const fontItems = Object.values(FONT_PRESETS)
    .filter((f) => f.name.toLowerCase().includes(query.toLowerCase()) || query.toLowerCase().includes('font'))
    .map((f) => ({
      id: `font-${f.id}`,
      type: 'font',
      title: `Font: ${f.name}`,
      subtitle: f.description,
      icon: <Type className="w-4 h-4 text-sky-400" />,
      action: () => {
        setFont(f.id as FontId);
        setCommandPaletteOpen(false);
      },
    }));

  const allItems = [...pageItems, ...actionItems, ...themeItems, ...fontItems];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (allItems.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + allItems.length) % (allItems.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (allItems[selectedIndex]) {
        allItems[selectedIndex].action();
      }
    }
  };

  if (!isCommandPaletteOpen) return null;

  return (
    <div
      onClick={() => setCommandPaletteOpen(false)}
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl mx-4 rounded-xl bg-app-surface border border-app-border shadow-2xl overflow-hidden flex flex-col text-app-primary animate-in zoom-in-95 duration-150"
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-app-border gap-3">
          <Search className="w-5 h-5 text-app-muted shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a page name, action, theme, or font..."
            className="w-full bg-transparent text-sm text-app-primary placeholder:text-app-muted outline-none"
          />
          <kbd className="px-2 py-0.5 rounded text-[10px] bg-app-sidebar border border-app-border text-app-muted font-mono">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto p-2 space-y-1">
          {allItems.length === 0 ? (
            <div className="p-8 text-center text-xs text-app-muted">
              No matching pages or commands found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            allItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-app-accent/15 border border-app-accent/30 text-app-primary'
                      : 'hover:bg-app-sidebarHover text-app-secondary border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-6 h-6 rounded flex items-center justify-center shrink-0">
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-app-primary truncate">
                        {item.title}
                      </p>
                      <p
                        className="text-[11px] text-app-muted truncate"
                        dangerouslySetInnerHTML={{ __html: item.subtitle }}
                      />
                    </div>
                  </div>

                  {isSelected && (
                    <ArrowRight className="w-3.5 h-3.5 text-app-accent shrink-0 ml-2" />
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-4 py-2 border-t border-app-border bg-app-sidebar/50 flex items-center justify-between text-[11px] text-app-muted">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1 py-0.5 rounded bg-app-surface border border-app-border">↑</kbd>{' '}
              <kbd className="px-1 py-0.5 rounded bg-app-surface border border-app-border">↓</kbd> to navigate
            </span>
            <span>
              <kbd className="px-1 py-0.5 rounded bg-app-surface border border-app-border">↵</kbd> to select
            </span>
          </div>
          <span>IndexedDB Instant Search</span>
        </div>
      </div>
    </div>
  );
};
