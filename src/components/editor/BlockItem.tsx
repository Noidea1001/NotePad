'use client';

import React, { useState } from 'react';
import {
  GripVertical,
  Plus,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  Repeat,
  Table as TableIcon,
  Columns2,
  Lightbulb,
  CheckSquare,
  Heading1,
  Heading2,
  Heading3,
  FileText,
  Quote,
  Code,
} from 'lucide-react';
import { EditorBlock, BlockType } from './types';
import { TextBlock } from './blocks/TextBlock';
import { MermaidBlock } from './blocks/MermaidBlock';
import { ErdBlock } from './blocks/ErdBlock';
import { ApiClientBlock } from './blocks/ApiClientBlock';
import { CodeTabsBlock } from './blocks/CodeTabsBlock';
import { SecretVaultBlock } from './blocks/SecretVaultBlock';
import { ColumnsBlock } from './blocks/ColumnsBlock';
import { CalloutBlock } from './blocks/CalloutBlock';
import { MatrixBlock } from './blocks/MatrixBlock';
import { PlanRoadmapBlock } from './blocks/PlanRoadmapBlock';
import { StickyBoardBlock } from './blocks/StickyBoardBlock';
import { DividerBlock } from './blocks/DividerBlock';
import { NotionTableBlock } from './blocks/NotionTableBlock';
import { CodeBlock } from './blocks/CodeBlock';
import { ToggleBlock } from './blocks/ToggleBlock';
import { SlashMenu } from './SlashMenu';

interface BlockItemProps {
  block: EditorBlock;
  index: number;
  totalBlocks: number;
  isOnlyBlock?: boolean;
  pageId?: string;
  isDragging?: boolean;
  dropPosition?: 'before' | 'after' | null;
  onUpdate: (id: string, updates: Partial<EditorBlock>) => void;
  onAddBlockAfter: (type: BlockType, afterId: string, initialData?: Record<string, any>) => void;
  onDelete: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onDragStart?: (index: number) => void;
  onDragOver?: (index: number, position: 'before' | 'after') => void;
  onDragLeave?: () => void;
  onDrop?: (index: number, position: 'before' | 'after') => void;
  onDragEnd?: () => void;
}

export const BlockItem: React.FC<BlockItemProps> = ({
  block,
  index,
  totalBlocks,
  isOnlyBlock,
  pageId,
  isDragging,
  dropPosition,
  onUpdate,
  onAddBlockAfter,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
}) => {
  const [slashMenuOpen, setSlashMenuOpen] = useState(false);
  const [slashQuery, setSlashQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [turnIntoOpen, setTurnIntoOpen] = useState(false);

  const handleTextChange = (content: string) => {
    // Check if user is typing a slash command (strip any HTML markup)
    const plain = content.replace(/<[^>]*>/g, '').trim();
    if (plain.startsWith('/')) {
      setSlashMenuOpen(true);
      setSlashQuery(plain);
    } else {
      if (slashMenuOpen) setSlashMenuOpen(false);
    }
    onUpdate(block.id, { content });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    const plain = (block.content || '').replace(/<[^>]*>/g, '').trim();
    if (e.key === 'Enter' && !e.shiftKey && !slashMenuOpen) {
      e.preventDefault();
      onAddBlockAfter('paragraph', block.id);
    } else if (e.key === 'Backspace' && plain === '' && !slashMenuOpen) {
      if (block.type !== 'paragraph') {
        e.preventDefault();
        onUpdate(block.id, { type: 'paragraph' });
      } else if (!isOnlyBlock) {
        e.preventDefault();
        onDelete(block.id);
      }
    }
  };

  const handleSelectSlashItem = (type: BlockType) => {
    setSlashMenuOpen(false);
    if (type === 'table') {
      onUpdate(block.id, {
        type: 'table',
        content: '',
        data: {
          rows: [
            ['Item / Task', 'Status', 'Notes'],
            ['Initial Planning', 'Done', 'Requirements defined'],
            ['Implementation', 'In Progress', 'Active execution'],
            ['Review', 'Pending', 'Peer sign-off'],
          ],
          hasHeaderRow: true,
          hasHeaderColumn: false,
          columnWidths: [180, 140, 260],
        },
      });
    } else {
      onUpdate(block.id, {
        type,
        content: '',
      });
    }
  };

  const isCustomBlock = [
    'table',
    'code',
    'toggle',
    'mermaid',
    'erd',
    'api',
    'code-tabs',
    'env',
    'columns-2',
    'columns-3',
    'callout',
    'matrix',
    'plan-roadmap',
    'sticky-board',
    'divider',
  ].includes(block.type);

  const handleContainerDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const isTop = e.clientY < rect.top + rect.height / 2;
    onDragOver?.(index, isTop ? 'before' : 'after');
  };

  const handleContainerDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const isTop = e.clientY < rect.top + rect.height / 2;
    onDrop?.(index, isTop ? 'before' : 'after');
  };

  return (
    <div
      onDragOver={handleContainerDragOver}
      onDragLeave={() => onDragLeave?.()}
      onDrop={handleContainerDrop}
      className={`relative group/block flex flex-col w-full transition-all ${
        isDragging ? 'opacity-40' : 'opacity-100'
      }`}
    >
      {/* Top Drop Indicator Line (Notion blue line) */}
      {dropPosition === 'before' && (
        <div className="w-full h-1 bg-blue-500 rounded-full my-0.5 shadow-sm animate-pulse" />
      )}

      <div className="flex items-start gap-1 py-1 w-full">
        {/* Left Block Handle & Action Triggers */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover/block:opacity-100 transition-opacity pt-1 select-none shrink-0 w-12 justify-end">
          <button
            onClick={() => onAddBlockAfter('paragraph', block.id)}
            title="Add block below"
            className="p-1 rounded text-app-muted hover:text-app-primary hover:bg-app-sidebar transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>

          {/* Draggable Grip Handle */}
          <div
            draggable={true}
            onDragStart={(e) => {
              e.dataTransfer.setData('text/plain', block.id);
              e.dataTransfer.effectAllowed = 'move';
              onDragStart?.(index);
            }}
            onDragEnd={() => onDragEnd?.()}
            onClick={() => setMenuOpen(!menuOpen)}
            title="Drag to reorder, or click for options"
            className="p-1 rounded text-app-muted hover:text-app-primary hover:bg-app-sidebar transition-colors cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="w-3.5 h-3.5" />
          </div>

          {/* Options Dropdown Menu (Notion-style) */}
          {menuOpen && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute left-8 top-6 z-50 w-52 rounded-xl bg-app-surface border border-app-border shadow-elevation py-1.5 text-xs text-app-primary animate-in fade-in zoom-in-95"
            >
              {/* Duplicate */}
              {onDuplicate && (
                <button
                  onClick={() => {
                    onDuplicate(block.id);
                    setMenuOpen(false);
                  }}
                  className="w-full px-3 py-1.5 flex items-center justify-between hover:bg-app-sidebar text-left"
                >
                  <span className="flex items-center gap-2">
                    <Copy className="w-3.5 h-3.5 text-app-muted" />
                    <span>Duplicate</span>
                  </span>
                  <span className="text-[10px] text-app-muted font-mono">Cmd+D</span>
                </button>
              )}

              {/* Move Up */}
              {index > 0 && onMoveUp && (
                <button
                  onClick={() => {
                    onMoveUp();
                    setMenuOpen(false);
                  }}
                  className="w-full px-3 py-1.5 flex items-center justify-between hover:bg-app-sidebar text-left"
                >
                  <span className="flex items-center gap-2">
                    <ArrowUp className="w-3.5 h-3.5 text-app-muted" />
                    <span>Move Up</span>
                  </span>
                  <span className="text-[10px] text-app-muted font-mono">Alt+↑</span>
                </button>
              )}

              {/* Move Down */}
              {index < totalBlocks - 1 && onMoveDown && (
                <button
                  onClick={() => {
                    onMoveDown();
                    setMenuOpen(false);
                  }}
                  className="w-full px-3 py-1.5 flex items-center justify-between hover:bg-app-sidebar text-left"
                >
                  <span className="flex items-center gap-2">
                    <ArrowDown className="w-3.5 h-3.5 text-app-muted" />
                    <span>Move Down</span>
                  </span>
                  <span className="text-[10px] text-app-muted font-mono">Alt+↓</span>
                </button>
              )}

              {/* Turn Into Submenu Toggle */}
              <div className="border-t border-app-border/40 my-1 pt-1">
                <button
                  onClick={() => setTurnIntoOpen(!turnIntoOpen)}
                  className="w-full px-3 py-1.5 flex items-center justify-between hover:bg-app-sidebar text-left text-app-secondary"
                >
                  <span className="flex items-center gap-2">
                    <Repeat className="w-3.5 h-3.5 text-app-muted" />
                    <span>Turn into...</span>
                  </span>
                  <span className="text-[10px] text-app-muted font-mono">
                    {turnIntoOpen ? '▲' : '▶'}
                  </span>
                </button>

                {turnIntoOpen && (
                  <div className="pl-4 pr-1 py-1 space-y-0.5 bg-app-sidebar/30">
                    <button
                      onClick={() => {
                        onUpdate(block.id, { type: 'paragraph' });
                        setMenuOpen(false);
                      }}
                      className="w-full px-2 py-1 flex items-center gap-2 rounded text-[11px] hover:bg-app-surface text-left"
                    >
                      <FileText className="w-3 h-3 text-app-muted" />
                      <span>Text</span>
                    </button>
                    <button
                      onClick={() => {
                        onUpdate(block.id, { type: 'h1' });
                        setMenuOpen(false);
                      }}
                      className="w-full px-2 py-1 flex items-center gap-2 rounded text-[11px] hover:bg-app-surface text-left"
                    >
                      <Heading1 className="w-3 h-3 text-app-muted" />
                      <span>Heading 1</span>
                    </button>
                    <button
                      onClick={() => {
                        onUpdate(block.id, { type: 'h2' });
                        setMenuOpen(false);
                      }}
                      className="w-full px-2 py-1 flex items-center gap-2 rounded text-[11px] hover:bg-app-surface text-left"
                    >
                      <Heading2 className="w-3 h-3 text-app-muted" />
                      <span>Heading 2</span>
                    </button>
                    <button
                      onClick={() => {
                        onUpdate(block.id, { type: 'task', checked: false });
                        setMenuOpen(false);
                      }}
                      className="w-full px-2 py-1 flex items-center gap-2 rounded text-[11px] hover:bg-app-surface text-left"
                    >
                      <CheckSquare className="w-3 h-3 text-app-muted" />
                      <span>To-do Task</span>
                    </button>
                    <button
                      onClick={() => {
                        handleSelectSlashItem('table');
                        setMenuOpen(false);
                      }}
                      className="w-full px-2 py-1 flex items-center gap-2 rounded text-[11px] hover:bg-app-surface text-left"
                    >
                      <TableIcon className="w-3 h-3 text-app-muted" />
                      <span>Table Grid</span>
                    </button>
                    <button
                      onClick={() => {
                        onUpdate(block.id, { type: 'callout' });
                        setMenuOpen(false);
                      }}
                      className="w-full px-2 py-1 flex items-center gap-2 rounded text-[11px] hover:bg-app-surface text-left"
                    >
                      <Lightbulb className="w-3 h-3 text-amber-400" />
                      <span>Callout Box</span>
                    </button>
                    <button
                      onClick={() => {
                        onUpdate(block.id, { type: 'columns-2' });
                        setMenuOpen(false);
                      }}
                      className="w-full px-2 py-1 flex items-center gap-2 rounded text-[11px] hover:bg-app-surface text-left"
                    >
                      <Columns2 className="w-3 h-3 text-app-muted" />
                      <span>2-Column Section</span>
                    </button>
                    <button
                      onClick={() => {
                        onUpdate(block.id, { type: 'code' });
                        setMenuOpen(false);
                      }}
                      className="w-full px-2 py-1 flex items-center gap-2 rounded text-[11px] hover:bg-app-surface text-left"
                    >
                      <Code className="w-3 h-3 text-emerald-400" />
                      <span>Code Block</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Delete Block */}
              <div className="border-t border-app-border/40 my-1 pt-1">
                <button
                  onClick={() => {
                    onDelete(block.id);
                    setMenuOpen(false);
                  }}
                  className="w-full px-3 py-1.5 flex items-center justify-between text-red-400 hover:bg-red-500/10 text-left"
                >
                  <span className="flex items-center gap-2">
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Block</span>
                  </span>
                  <span className="text-[10px] text-red-400/60 font-mono">Del</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Block Body Content */}
        <div className="flex-1 min-w-0 relative">
          {/* Basic Text Blocks */}
          {!isCustomBlock && (
            <TextBlock
              block={block}
              pageId={pageId}
              onChangeContent={handleTextChange}
              onToggleCheck={() => onUpdate(block.id, { checked: !block.checked })}
              onKeyDown={handleKeyDown}
            />
          )}

          {/* Interactive Code Lesson Block */}
          {block.type === 'code' && (
            <CodeBlock
              block={block}
              onUpdate={(updates) => onUpdate(block.id, updates)}
            />
          )}

          {/* Collapsible Toggle List Block */}
          {block.type === 'toggle' && (
            <ToggleBlock
              block={block}
              onUpdate={(data) => onUpdate(block.id, { data })}
            />
          )}

          {/* Notion Table Grid Block */}
          {block.type === 'table' && (
            <NotionTableBlock
              block={block}
              onUpdate={(data) => onUpdate(block.id, { data })}
            />
          )}

          {/* Layout & Design Blocks */}
          {(block.type === 'columns-2' || block.type === 'columns-3') && (
            <ColumnsBlock block={block} onUpdate={(data) => onUpdate(block.id, { data })} />
          )}
          {block.type === 'callout' && (
            <CalloutBlock block={block} onUpdate={(data) => onUpdate(block.id, { data })} />
          )}
          {block.type === 'matrix' && (
            <MatrixBlock block={block} onUpdate={(data) => onUpdate(block.id, { data })} />
          )}
          {block.type === 'plan-roadmap' && (
            <PlanRoadmapBlock block={block} onUpdate={(data) => onUpdate(block.id, { data })} />
          )}
          {block.type === 'sticky-board' && (
            <StickyBoardBlock block={block} onUpdate={(data) => onUpdate(block.id, { data })} />
          )}
          {block.type === 'divider' && <DividerBlock block={block} />}

          {/* Custom Developer Blocks */}
          {block.type === 'mermaid' && (
            <MermaidBlock
              data={block.data as any}
              onChange={(newData) => onUpdate(block.id, { data: newData })}
            />
          )}

          {block.type === 'erd' && (
            <ErdBlock
              data={block.data as any}
              onChange={(newData) => onUpdate(block.id, { data: newData })}
            />
          )}

          {block.type === 'api' && (
            <ApiClientBlock
              data={block.data as any}
              onChange={(newData) => onUpdate(block.id, { data: newData })}
            />
          )}

          {block.type === 'code-tabs' && (
            <CodeTabsBlock
              data={block.data as any}
              onChange={(newData) => onUpdate(block.id, { data: newData })}
            />
          )}

          {block.type === 'env' && (
            <SecretVaultBlock
              data={block.data as any}
              onChange={(newData) => onUpdate(block.id, { data: newData })}
            />
          )}

          {/* Floating Slash Menu */}
          {slashMenuOpen && (
            <div className="absolute left-0 top-8 z-50">
              <SlashMenu
                query={slashQuery}
                onSelect={handleSelectSlashItem}
                onClose={() => setSlashMenuOpen(false)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Bottom Drop Indicator Line */}
      {dropPosition === 'after' && (
        <div className="w-full h-1 bg-blue-500 rounded-full my-0.5 shadow-sm animate-pulse" />
      )}

      {/* Backdrop to close menu */}
      {menuOpen && (
        <div
          onClick={() => {
            setMenuOpen(false);
            setTurnIntoOpen(false);
          }}
          className="fixed inset-0 z-40"
        />
      )}
    </div>
  );
};
