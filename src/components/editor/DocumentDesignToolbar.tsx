'use client';

import React, { useState } from 'react';
import {
  Table as TableIcon,
  Columns2,
  Columns3,
  Lightbulb,
  Grid,
  Milestone,
  StickyNote,
  Minus,
  Sparkles,
  LayoutTemplate,
  ChevronDown,
  Check,
  Plus,
  Code,
  GraduationCap,
} from 'lucide-react';
import { BlockType } from './types';

interface DocumentDesignToolbarProps {
  onInsertBlock: (type: BlockType, initialData?: Record<string, any>) => void;
  onApplyTemplate: (templateName: 'analysis' | 'plan' | 'brainstorm' | 'coding-lesson') => void;
}

export const DocumentDesignToolbar: React.FC<DocumentDesignToolbarProps> = ({
  onInsertBlock,
  onApplyTemplate,
}) => {
  const [showTemplates, setShowTemplates] = useState(false);

  return (
    <div className="w-full mb-6 p-2 rounded-xl bg-app-sidebar/50 border border-app-border flex items-center justify-between gap-2 flex-wrap text-xs select-none">
      {/* Design Tools Bar */}
      <div className="flex items-center gap-1 flex-wrap">
        <span className="text-[10px] uppercase font-mono font-bold text-app-muted px-2 py-0.5 rounded bg-app-surface border border-app-border shrink-0 mr-1">
          Layout & Design:
        </span>

        {/* Notion Table Grid */}
        <button
          onClick={() =>
            onInsertBlock('table', {
              rows: [
                ['Item / Task', 'Status', 'Notes'],
                ['Initial Planning', 'Done', 'Requirements defined'],
                ['Implementation', 'In Progress', 'Active execution'],
                ['Review', 'Pending', 'Peer sign-off'],
              ],
              hasHeaderRow: true,
              hasHeaderColumn: false,
              columnWidths: [180, 140, 260],
            })
          }
          title="Insert Notion-style Table Grid"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-app-primary bg-app-surface hover:bg-app-sidebar border border-app-border transition-colors font-medium shadow-xs"
        >
          <TableIcon className="w-3.5 h-3.5 text-blue-400" />
          <span>Table Grid</span>
        </button>

        {/* 2 Columns */}
        <button
          onClick={() => onInsertBlock('columns-2')}
          title="Insert 2-Column Section"
          className="flex items-center gap-1 px-2.5 py-1 rounded-md text-app-secondary hover:text-app-primary hover:bg-app-surface transition-colors"
        >
          <Columns2 className="w-3.5 h-3.5" />
          <span>2-Columns</span>
        </button>

        {/* 3 Columns */}
        <button
          onClick={() => onInsertBlock('columns-3')}
          title="Insert 3-Column Section"
          className="flex items-center gap-1 px-2.5 py-1 rounded-md text-app-secondary hover:text-app-primary hover:bg-app-surface transition-colors"
        >
          <Columns3 className="w-3.5 h-3.5" />
          <span>3-Columns</span>
        </button>

        {/* Callout Box */}
        <button
          onClick={() => onInsertBlock('callout')}
          title="Insert Analysis / Highlight Box"
          className="flex items-center gap-1 px-2.5 py-1 rounded-md text-app-secondary hover:text-app-primary hover:bg-app-surface transition-colors"
        >
          <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
          <span>Callout Box</span>
        </button>

        {/* 2x2 Matrix */}
        <button
          onClick={() => onInsertBlock('matrix')}
          title="Insert 2x2 SWOT / Analysis Matrix"
          className="flex items-center gap-1 px-2.5 py-1 rounded-md text-app-secondary hover:text-app-primary hover:bg-app-surface transition-colors"
        >
          <Grid className="w-3.5 h-3.5 text-indigo-400" />
          <span>2x2 Matrix</span>
        </button>

        {/* Plan Roadmap */}
        <button
          onClick={() => onInsertBlock('plan-roadmap')}
          title="Insert Project Plan & Milestones Roadmap"
          className="flex items-center gap-1 px-2.5 py-1 rounded-md text-app-secondary hover:text-app-primary hover:bg-app-surface transition-colors"
        >
          <Milestone className="w-3.5 h-3.5 text-emerald-400" />
          <span>Plan Roadmap</span>
        </button>

        {/* Sticky Board */}
        <button
          onClick={() => onInsertBlock('sticky-board')}
          title="Insert Brainstorm Sticky Notes Board"
          className="flex items-center gap-1 px-2.5 py-1 rounded-md text-app-secondary hover:text-app-primary hover:bg-app-surface transition-colors"
        >
          <StickyNote className="w-3.5 h-3.5 text-amber-400" />
          <span>Sticky Notes</span>
        </button>

        {/* Divider */}
        <button
          onClick={() => onInsertBlock('divider')}
          title="Insert Section Divider"
          className="flex items-center gap-1 px-2 py-1 rounded-md text-app-muted hover:text-app-primary hover:bg-app-surface transition-colors"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Templates Dropdown */}
      <div className="relative shrink-0">
        <button
          onClick={() => setShowTemplates(!showTemplates)}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-app-surface border border-app-border hover:bg-app-sidebar text-app-primary font-medium text-xs shadow-sm transition-colors"
        >
          <LayoutTemplate className="w-3.5 h-3.5 text-app-primary" />
          <span>Note Templates</span>
          <ChevronDown className="w-3 h-3 opacity-60" />
        </button>

        {showTemplates && (
          <div className="absolute top-full right-0 mt-1.5 p-1.5 rounded-xl bg-app-surface border border-app-border shadow-2xl z-40 min-w-[240px] space-y-0.5">
            <button
              onClick={() => {
                onApplyTemplate('coding-lesson');
                setShowTemplates(false);
              }}
              className="w-full text-left p-2 rounded-lg hover:bg-app-sidebar transition-colors"
            >
              <div className="font-semibold text-xs text-app-primary flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
                <span>Coding Lesson & Tutorial Template</span>
              </div>
              <p className="text-[10px] text-app-muted mt-0.5">
                Lesson Goal, Interactive Code Snippet, Hint Toggle & Quiz checklist.
              </p>
            </button>

            <button
              onClick={() => {
                onApplyTemplate('plan');
                setShowTemplates(false);
              }}
              className="w-full text-left p-2 rounded-lg hover:bg-app-sidebar transition-colors"
            >
              <div className="font-semibold text-xs text-app-primary flex items-center gap-1.5">
                <Milestone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Project Plan Template</span>
              </div>
              <p className="text-[10px] text-app-muted mt-0.5">
                Objective Callout, 2-Column deliverables, and Milestone Roadmap.
              </p>
            </button>

            <button
              onClick={() => {
                onApplyTemplate('analysis');
                setShowTemplates(false);
              }}
              className="w-full text-left p-2 rounded-lg hover:bg-app-sidebar transition-colors"
            >
              <div className="font-semibold text-xs text-app-primary flex items-center gap-1.5">
                <Grid className="w-3.5 h-3.5 text-indigo-400" />
                <span>Strategic Analysis Template</span>
              </div>
              <p className="text-[10px] text-app-muted mt-0.5">
                Key Findings Callout, 2x2 SWOT Matrix, and Action Steps.
              </p>
            </button>

            <button
              onClick={() => {
                onApplyTemplate('brainstorm');
                setShowTemplates(false);
              }}
              className="w-full text-left p-2 rounded-lg hover:bg-app-sidebar transition-colors"
            >
              <div className="font-semibold text-xs text-app-primary flex items-center gap-1.5">
                <StickyNote className="w-3.5 h-3.5 text-amber-400" />
                <span>Brainstorm & Ideas Template</span>
              </div>
              <p className="text-[10px] text-app-muted mt-0.5">
                Sticky Notes Canvas with Pros/Cons 2-Column discussion.
              </p>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
