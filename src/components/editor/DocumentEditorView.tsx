'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Plus, LayoutGrid, Type } from 'lucide-react';
import { useYjsBlocks } from './YjsManager';
import { BlockItem } from './BlockItem';
import { FloatingFormatToolbar } from './FloatingFormatToolbar';
import { DocumentDesignToolbar } from './DocumentDesignToolbar';
import { WordFormattingBar } from './WordFormattingBar';
import { BlockType } from './types';
import { WorkspacePage } from '@/types';
import { db } from '@/db/workspace-db';
import { useWorkspaceStore } from '@/stores/useWorkspaceStore';

interface DocumentEditorViewProps {
  page: WorkspacePage;
}

export const DocumentEditorView: React.FC<DocumentEditorViewProps> = ({ page }) => {
  const { widthPreference, setStorageStatus } = useWorkspaceStore();
  const { blocks, updateBlock, addBlock, duplicateBlock, deleteBlock, moveBlock } = useYjsBlocks(page.id);

  const [title, setTitle] = useState(page.title);
  const [showWordFormatting, setShowWordFormatting] = useState(true);
  const [showDesignToolbar, setShowDesignToolbar] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dropTarget, setDropTarget] = useState<{ index: number; position: 'before' | 'after' } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (index: number, position: 'before' | 'after') => {
    if (draggedIndex === null || draggedIndex === index) return;
    setDropTarget({ index, position });
  };

  const handleDragLeave = () => {
    setDropTarget(null);
  };

  const handleDrop = (targetIndex: number, position: 'before' | 'after') => {
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDropTarget(null);
      return;
    }

    let finalIndex = targetIndex;
    if (position === 'after') {
      finalIndex = draggedIndex < targetIndex ? targetIndex : targetIndex + 1;
    } else {
      finalIndex = draggedIndex < targetIndex ? targetIndex - 1 : targetIndex;
    }

    finalIndex = Math.max(0, Math.min(blocks.length - 1, finalIndex));
    moveBlock(draggedIndex, finalIndex);

    setDraggedIndex(null);
    setDropTarget(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDropTarget(null);
  };

  // Keep title synced when active page changes
  useEffect(() => {
    setTitle(page.title);
  }, [page.id, page.title]);

  const handleTitleChange = async (newTitle: string) => {
    setTitle(newTitle);
    await db.pages.update(page.id, {
      title: newTitle,
      updatedAt: Date.now(),
    });
    setStorageStatus({ lastSavedAt: Date.now() });
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (blocks.length === 0) {
        addBlock('paragraph');
      } else {
        // Focus first textarea if present
        const firstInput = containerRef.current?.querySelector('textarea');
        firstInput?.focus();
      }
    }
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && blocks.length === 0) {
      addBlock('paragraph');
    }
  };

  const handleApplyTemplate = (templateName: 'analysis' | 'plan' | 'brainstorm' | 'coding-lesson') => {
    if (templateName === 'coding-lesson') {
      addBlock('callout', undefined, {
        iconType: 'target',
        theme: 'blue',
        title: 'Module 1: Asynchronous Programming & API Data Fetching',
        content: 'Goal: Learn how to handle async operations, Promises, and error handling in modern JavaScript & TypeScript.',
      });
      addBlock('h2');
      addBlock('paragraph');
      addBlock('code', undefined, {
        language: 'javascript',
        caption: '// lesson-01-async-fetch.js',
      });
      addBlock('callout', undefined, {
        iconType: 'lightbulb',
        theme: 'amber',
        title: 'Pro Tip: Error Boundaries & Network Resilience',
        content: 'Always wrap network requests in try...catch blocks to handle connection timeouts without crashing your user interface.',
      });
      addBlock('toggle', undefined, {
        isOpen: false,
        title: 'Practice Challenge: Can you fetch 2 endpoints in parallel? (Click to view solution)',
        content: '<b>Solution:</b><br/><code>const [users, posts] = await Promise.all([fetchUsers(), fetchPosts()]);</code><br/>Using <code>Promise.all()</code> runs both requests concurrently, cutting network wait time in half!',
      });
      addBlock('h3');
      addBlock('task');
      addBlock('task');
      addBlock('task');
    } else if (templateName === 'plan') {
      addBlock('callout', undefined, {
        iconType: 'target',
        theme: 'emerald',
        title: 'Project Scope & High-Level Objective',
        content: 'Define what this plan aims to achieve, key stakeholders, and success criteria.',
      });
      addBlock('columns-2', undefined, {
        columns: [
          {
            id: 'c1',
            title: 'Scope & Deliverables',
            content: '- Production-ready feature release<br/>- API documentation<br/>- User validation testing',
          },
          {
            id: 'c2',
            title: 'Dependencies & Risks',
            content: '- Cloud sync auth infrastructure<br/>- Review approval from engineering leads',
          },
        ],
      });
      addBlock('plan-roadmap');
    } else if (templateName === 'analysis') {
      addBlock('callout', undefined, {
        iconType: 'chart',
        theme: 'purple',
        title: 'Executive Summary & Analysis Goal',
        content: 'Document the problem statement, baseline metrics, and decision rationale.',
      });
      addBlock('matrix');
      addBlock('columns-2', undefined, {
        columns: [
          {
            id: 'c1',
            title: 'Key Data Findings',
            content: '- High user demand for flexible planning notes<br/>- Offline sync latency remains under 2ms',
          },
          {
            id: 'c2',
            title: 'Recommended Decisions',
            content: '- Introduce modular design blocks<br/>- Maintain clean, clutter-free note UI',
          },
        ],
      });
    } else if (templateName === 'brainstorm') {
      addBlock('callout', undefined, {
        iconType: 'lightbulb',
        theme: 'amber',
        title: 'Brainstorming Focus & Central Question',
        content: 'How might we make our workspace feel effortless, flexible, and lightning fast?',
      });
      addBlock('sticky-board');
      addBlock('columns-2', undefined, {
        columns: [
          {
            id: 'c1',
            title: 'Pros / Opportunities',
            content: '- Instant offline feedback<br/>- Flexible visual cards',
          },
          {
            id: 'c2',
            title: 'Cons / Watchouts',
            content: '- Avoid cognitive overload<br/>- Keep controls subtle',
          },
        ],
      });
    }
  };

  return (
    <div
      ref={containerRef}
      onClick={handleCanvasClick}
      className={`h-full overflow-y-auto px-6 sm:px-12 py-10 transition-all relative ${
        widthPreference === 'standard' ? 'max-w-[760px] mx-auto' : 'max-w-5xl mx-auto'
      }`}
    >
      {/* Floating Rich-Text Formatting Toolbar (Bold, Italic, Underline, Highlight, Text Colors) */}
      <FloatingFormatToolbar containerRef={containerRef} />

      {/* Notion-style Page Header: Clean Title & Hover Actions */}
      <div className="group/page-header mb-6">
        <div className="flex items-center justify-between mb-2 text-xs text-app-muted select-none">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowWordFormatting(!showWordFormatting)}
              title="Toggle Word-style text formatting ribbon"
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors text-[11px] ${
                showWordFormatting
                  ? 'bg-app-accent/15 text-app-accent font-medium border border-app-accent/30'
                  : 'hover:bg-app-sidebar hover:text-app-primary border border-transparent'
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              <span>{showWordFormatting ? 'Word Formatting Bar' : 'Show Word Ribbon'}</span>
            </button>

            <button
              onClick={() => setShowDesignToolbar(!showDesignToolbar)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors text-[11px] ${
                showDesignToolbar
                  ? 'bg-app-accent/15 text-app-accent font-medium border border-app-accent/30'
                  : 'hover:bg-app-sidebar hover:text-app-primary border border-transparent'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>{showDesignToolbar ? 'Hide Layout Tools' : 'Layout & Design Tools'}</span>
            </button>
          </div>

          <div className="text-[11px] font-mono text-app-muted/60 hidden sm:inline">
            Type &ldquo;/&rdquo; for commands &bull; Tab to indent
          </div>
        </div>

        {/* Word-style Formatting Ribbon */}
        {showWordFormatting && (
          <div className="no-print mb-2">
            <WordFormattingBar />
          </div>
        )}
      </div>

      {/* Optional Design Toolbar (collapsible, hidden by default to keep document clean) */}
      {showDesignToolbar && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-150 mb-6">
          <DocumentDesignToolbar
            onInsertBlock={(type, initialData) => {
              addBlock(type, undefined, initialData);
              setShowDesignToolbar(false);
            }}
            onApplyTemplate={(templateName) => {
              handleApplyTemplate(templateName);
              setShowDesignToolbar(false);
            }}
          />
        </div>
      )}

      {/* Blocks List */}
      <div className="space-y-1 min-h-[300px]">
        {blocks.map((block, index) => (
          <BlockItem
            key={block.id}
            block={block}
            index={index}
            totalBlocks={blocks.length}
            isOnlyBlock={blocks.length <= 1}
            pageId={page.id}
            isDragging={draggedIndex === index}
            dropPosition={dropTarget?.index === index ? dropTarget.position : null}
            onUpdate={updateBlock}
            onAddBlockAfter={addBlock}
            onDelete={deleteBlock}
            onDuplicate={duplicateBlock}
            onMoveUp={() => moveBlock(index, index - 1)}
            onMoveDown={() => moveBlock(index, index + 1)}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onDragEnd={handleDragEnd}
          />
        ))}
      </div>

      {/* Bottom Append Area - Clean and Subtle */}
      <div className="mt-8 pt-4 border-t border-app-border/40">
        <button
          onClick={() => addBlock('paragraph')}
          className="flex items-center gap-2 text-xs text-app-muted hover:text-app-primary transition-colors py-1.5 px-2.5 rounded-md hover:bg-app-sidebar"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Click to add a line, or type &ldquo;/&rdquo; for commands</span>
        </button>
      </div>
    </div>
  );
};
