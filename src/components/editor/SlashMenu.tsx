'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Heading1,
  Heading2,
  Heading3,
  CheckSquare,
  Code,
  Quote,
  GitGraph,
  Database,
  Terminal,
  Files,
  Lock,
  Sparkles,
  Columns2,
  Columns3,
  Lightbulb,
  Grid,
  Milestone,
  StickyNote,
  Minus,
  Table,
  ChevronRight,
} from 'lucide-react';
import { BlockType, SlashMenuItem } from './types';

const MENU_ITEMS: SlashMenuItem[] = [
  // Layout & Strategic Design Blocks
  {
    id: 'toggle',
    title: 'Toggle List (/toggle, /hint, /answer)',
    description: 'Collapsible accordion to hide exercise answers, solutions, and hints',
    category: 'Basic',
    badge: 'TOGGLE',
    icon: 'ChevronRight',
    keywords: ['toggle', 'accordion', 'hint', 'solution', 'answer', 'collapse', 'hide', 'exercise'],
  },
  {
    id: 'table',
    title: 'Table Grid (/table, /grid, /ក្រឡា)',
    description: 'Notion-style simple table with editable cells, add row/column (+), and headers',
    category: 'Basic',
    badge: 'TABLE',
    icon: 'Table',
    keywords: ['table', 'grid', 'cells', 'rows', 'columns', 'spreadsheet', 'ក្រឡា', 'តារាង', 'notion'],
  },
  {
    id: 'columns-2',
    title: '2 Columns (/columns, /2col)',
    description: 'Split section into 2 flexible side-by-side columns',
    category: 'Basic',
    badge: 'LAYOUT',
    icon: 'Columns2',
    keywords: ['columns', 'col', '2col', 'split', 'sidebyside', 'layout', 'grid'],
  },
  {
    id: 'columns-3',
    title: '3 Columns (/3col)',
    description: 'Split section into 3 flexible columns for multi-perspective notes',
    category: 'Basic',
    badge: 'LAYOUT',
    icon: 'Columns3',
    keywords: ['columns', '3col', 'layout', 'grid', 'triple'],
  },
  {
    id: 'callout',
    title: 'Callout / Analysis Box (/callout, /insight)',
    description: 'Visual analysis card with customizable icon, title, and color themes',
    category: 'Basic',
    badge: 'CARD',
    icon: 'Lightbulb',
    keywords: ['callout', 'box', 'card', 'insight', 'highlight', 'analysis', 'note', 'alert'],
  },
  {
    id: 'matrix',
    title: '2x2 Strategic Matrix (/matrix, /swot)',
    description: '4-quadrant strategic analysis grid for SWOT, Eisenhower, or Pros/Cons',
    category: 'Basic',
    badge: 'MATRIX',
    icon: 'Grid',
    keywords: ['matrix', 'swot', 'grid', 'analysis', 'quadrant', 'pros', 'cons', 'priority'],
  },
  {
    id: 'plan-roadmap',
    title: 'Plan Roadmap & Milestones (/roadmap, /plan)',
    description: 'Multi-phase project plan with progress bars, timelines, and tasks',
    category: 'Basic',
    badge: 'PLAN',
    icon: 'Milestone',
    keywords: ['roadmap', 'plan', 'milestone', 'phase', 'project', 'timeline', 'progress'],
  },
  {
    id: 'sticky-board',
    title: 'Sticky Notes Board (/sticky, /ideas)',
    description: 'Colorful sticky note cards for brainstorming and agile planning',
    category: 'Basic',
    badge: 'BOARD',
    icon: 'StickyNote',
    keywords: ['sticky', 'note', 'brainstorm', 'ideas', 'cards', 'board', 'postit'],
  },
  {
    id: 'divider',
    title: 'Divider Line (/divider, /hr)',
    description: 'Subtle section separator line for spacing',
    category: 'Basic',
    icon: 'Minus',
    keywords: ['divider', 'line', 'hr', 'separator', 'spacer'],
  },

  // Developer Blocks
  {
    id: 'mermaid',
    title: 'Mermaid Diagram (/mermaid)',
    description: 'Split-view code editor to live SVG diagram (Flowchart, Sequence, GitGraph)',
    category: 'Developer',
    badge: 'SVG',
    icon: 'GitGraph',
    keywords: ['mermaid', 'diagram', 'flowchart', 'sequence', 'gitgraph', 'graph', 'chart'],
  },
  {
    id: 'erd',
    title: 'DB Schema ERD (/erd)',
    description: 'React Flow canvas with Table nodes, foreign keys, and SQL/Prisma/EF export',
    category: 'Developer',
    badge: 'FLOW',
    icon: 'Database',
    keywords: ['erd', 'database', 'schema', 'table', 'sql', 'prisma', 'postgres', 'flow'],
  },
  {
    id: 'api',
    title: 'Mini API Client (/api)',
    description: 'Inline Postman with Method selector, JSON body, live send & latency badge',
    category: 'Developer',
    badge: 'POSTMAN',
    icon: 'Terminal',
    keywords: ['api', 'postman', 'fetch', 'http', 'rest', 'get', 'post', 'endpoint'],
  },
  {
    id: 'code-tabs',
    title: 'Multi-File Code Tabs (/code-tabs)',
    description: 'Group multiple code files into tabs with 1-click copy and syntax badge',
    category: 'Developer',
    badge: 'TABS',
    icon: 'Files',
    keywords: ['code-tabs', 'tabs', 'multifile', 'files', 'snippets', 'code'],
  },
  {
    id: 'env',
    title: 'Secret Vault (.env) (/env)',
    description: 'Masked key-value table for secrets with reveal toggle & 1-click copy .env',
    category: 'Developer',
    badge: 'VAULT',
    icon: 'Lock',
    keywords: ['env', 'secret', 'vault', 'environment', 'keys', 'tokens', 'password'],
  },

  // Basic Blocks
  {
    id: 'h1',
    title: 'Heading 1 (/h1)',
    description: 'Large section heading',
    category: 'Basic',
    icon: 'Heading1',
    keywords: ['h1', 'heading', 'title'],
  },
  {
    id: 'h2',
    title: 'Heading 2 (/h2)',
    description: 'Medium subsection heading',
    category: 'Basic',
    icon: 'Heading2',
    keywords: ['h2', 'heading', 'subtitle'],
  },
  {
    id: 'h3',
    title: 'Heading 3 (/h3)',
    description: 'Small subsection heading',
    category: 'Basic',
    icon: 'Heading3',
    keywords: ['h3', 'heading'],
  },
  {
    id: 'task',
    title: 'Task List (/task)',
    description: 'Interactive to-do checklist item',
    category: 'Basic',
    icon: 'CheckSquare',
    keywords: ['task', 'todo', 'checklist', 'checkbox'],
  },
  {
    id: 'code',
    title: 'Code Block (/code)',
    description: 'Single syntax-highlighted code block',
    category: 'Basic',
    icon: 'Code',
    keywords: ['code', 'snippet', 'syntax'],
  },
  {
    id: 'quote',
    title: 'Quote Callout (/quote)',
    description: 'Emphasized note or citation block',
    category: 'Basic',
    icon: 'Quote',
    keywords: ['quote', 'callout', 'blockquote', 'note'],
  },
  {
    id: 'paragraph',
    title: 'Text (/p)',
    description: 'Plain markdown paragraph',
    category: 'Basic',
    icon: 'FileText',
    keywords: ['text', 'paragraph', 'plain'],
  },
];

interface SlashMenuProps {
  query: string;
  onSelect: (type: BlockType) => void;
  onClose: () => void;
  position?: { top: number; left: number };
}

export const SlashMenu: React.FC<SlashMenuProps> = ({
  query,
  onSelect,
  onClose,
  position,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const cleanQuery = query.replace(/^\//, '').toLowerCase().trim();

  const filteredItems = MENU_ITEMS.filter((item) => {
    if (!cleanQuery) return true;
    return (
      item.title.toLowerCase().includes(cleanQuery) ||
      item.description.toLowerCase().includes(cleanQuery) ||
      item.keywords.some((k) => k.includes(cleanQuery))
    );
  });

  useEffect(() => {
    setSelectedIndex(0);
  }, [cleanQuery]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % (filteredItems.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          onSelect(filteredItems[selectedIndex].id);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredItems, selectedIndex, onSelect, onClose]);

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'ChevronRight':
        return <ChevronRight className="w-4 h-4 text-app-muted" />;
      case 'Table':
        return <Table className="w-4 h-4 text-blue-400" />;
      case 'Columns2':
        return <Columns2 className="w-4 h-4 text-app-primary" />;
      case 'Columns3':
        return <Columns3 className="w-4 h-4 text-app-primary" />;
      case 'Lightbulb':
        return <Lightbulb className="w-4 h-4 text-amber-400" />;
      case 'Grid':
        return <Grid className="w-4 h-4 text-indigo-400" />;
      case 'Milestone':
        return <Milestone className="w-4 h-4 text-emerald-400" />;
      case 'StickyNote':
        return <StickyNote className="w-4 h-4 text-amber-400" />;
      case 'Minus':
        return <Minus className="w-4 h-4 text-app-muted" />;
      case 'GitGraph':
        return <GitGraph className="w-4 h-4 text-app-primary" />;
      case 'Database':
        return <Database className="w-4 h-4 text-app-primary" />;
      case 'Terminal':
        return <Terminal className="w-4 h-4 text-app-primary" />;
      case 'Files':
        return <Files className="w-4 h-4 text-app-primary" />;
      case 'Lock':
        return <Lock className="w-4 h-4 text-app-primary" />;
      case 'Heading1':
        return <Heading1 className="w-4 h-4 text-app-muted" />;
      case 'Heading2':
        return <Heading2 className="w-4 h-4 text-app-muted" />;
      case 'Heading3':
        return <Heading3 className="w-4 h-4 text-app-muted" />;
      case 'CheckSquare':
        return <CheckSquare className="w-4 h-4 text-app-primary" />;
      case 'Code':
        return <Code className="w-4 h-4 text-app-muted" />;
      case 'Quote':
        return <Quote className="w-4 h-4 text-app-muted" />;
      default:
        return <FileText className="w-4 h-4 text-app-muted" />;
    }
  };

  return (
    <div
      ref={containerRef}
      className="z-50 w-80 rounded-xl bg-app-surface border border-app-border shadow-2xl overflow-hidden py-1.5 animate-in fade-in zoom-in-95 duration-100 select-none text-xs"
    >
      <div className="px-3 py-1.5 border-b border-app-border/60 text-[10px] uppercase font-bold tracking-wider text-app-muted flex items-center justify-between">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-app-accent" />
          <span>Insert Block</span>
        </span>
        <span>{filteredItems.length} options</span>
      </div>

      <div className="max-h-64 overflow-y-auto p-1 space-y-0.5">
        {filteredItems.length === 0 ? (
          <div className="p-4 text-center text-app-muted text-xs">
            No matching blocks found for &ldquo;/{cleanQuery}&rdquo;
          </div>
        ) : (
          filteredItems.map((item, idx) => {
            const isSelected = idx === selectedIndex;

            return (
              <div
                key={item.id}
                onClick={() => onSelect(item.id)}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`px-2.5 py-2 rounded-lg cursor-pointer flex items-center justify-between gap-2.5 transition-colors ${
                  isSelected
                    ? 'bg-app-accent/15 border border-app-accent/30 text-app-primary'
                    : 'text-app-secondary hover:bg-app-sidebarHover border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-md bg-app-sidebar flex items-center justify-center shrink-0 border border-app-border/60">
                    {renderIcon(item.icon)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-xs text-app-primary truncate">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-app-muted truncate">
                      {item.description}
                    </p>
                  </div>
                </div>

                {item.badge && (
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-app-sidebar border border-app-border/80 text-app-accent font-semibold shrink-0">
                    {item.badge}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="px-3 py-1 border-t border-app-border/60 bg-app-sidebar/40 text-[10px] text-app-muted flex items-center justify-between font-mono">
        <span>↑↓ to select</span>
        <span>↵ to insert</span>
      </div>
    </div>
  );
};
