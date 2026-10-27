'use client';

import React, { useState } from 'react';
import { X, FileText, Table, Kanban, Network, FolderLock, Cloud, Terminal } from 'lucide-react';
import { db } from '@/db/workspace-db';
import { useWorkspaceStore } from '@/stores/useWorkspaceStore';
import { ViewType, WorkspaceType } from '@/types';

export const CreatePageModal: React.FC = () => {
  const { createModalState, closeCreateModal, setActivePageId, setActiveView } = useWorkspaceStore();
  const [title, setTitle] = useState('');
  const [viewType, setViewType] = useState<ViewType>('doc');
  const [workspaceType, setWorkspaceType] = useState<WorkspaceType>(createModalState.workspaceType);

  if (!createModalState.isOpen) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalTitle = title.trim() || 'Untitled Page';
    const newId = `page-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = Date.now();

    await db.pages.add({
      id: newId,
      parentId: createModalState.parentId,
      title: finalTitle,
      icon: viewType,
      workspaceType,
      viewType,
      widthPreference: viewType === 'doc' ? 'standard' : 'full',
      order: 99,
      createdAt: now,
      updatedAt: now,
      content: '',
    });

    if (viewType === 'sheet') {
      await db.sheetRows.add({
        id: `row-${Date.now()}`,
        pageId: newId,
        title: 'Initial Record',
        status: 'Todo',
        priority: 'Medium',
        assignee: 'Alex R.',
        estimate: '2 pts',
        tags: ['Sprint'],
        updatedAt: now,
      });
    }

    if (viewType === 'kanban') {
      await db.kanbanCards.add({
        id: `card-${Date.now()}`,
        pageId: newId,
        title: 'First Task Card',
        description: 'Drag this card between columns or click to modify details.',
        status: 'todo',
        priority: 'medium',
        assignee: { name: 'Alex R.', avatar: 'AR', color: '#3b82f6' },
        tags: ['Sprint'],
        order: 0,
        dueDate: 'Next Week',
      });
    }

    if (viewType === 'erd') {
      await db.erdEntities.add({
        id: `entity-${Date.now()}`,
        pageId: newId,
        name: 'new_table',
        description: 'Database table schema',
        color: '#3b82f6',
        x: 80,
        y: 60,
        fields: [
          { id: 'f-1', name: 'id', type: 'UUID', isPk: true, nullable: false },
          { id: 'f-2', name: 'created_at', type: 'TIMESTAMP', isPk: false, nullable: false },
        ],
      });
    }

    setActivePageId(newId);
    setActiveView(viewType);
    closeCreateModal();
    setTitle('');
  };

  const viewOptions: { id: ViewType; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: 'doc', label: 'Document', icon: <FileText className="w-4 h-4 text-app-primary" />, desc: 'Markdown notes & technical specs' },
    { id: 'sheet', label: 'Sheet Grid', icon: <Table className="w-4 h-4 text-app-primary" />, desc: 'Linear & spreadsheet tabular data' },
    { id: 'kanban', label: 'Kanban Board', icon: <Kanban className="w-4 h-4 text-app-primary" />, desc: 'Workflow board & sprint stages' },
    { id: 'erd', label: 'DB Schema (ERD)', icon: <Network className="w-4 h-4 text-app-primary" />, desc: 'Entity relationship visual modeler' },
  ];

  return (
    <div
      onClick={closeCreateModal}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150 text-xs"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-xl bg-app-surface border border-app-border shadow-2xl overflow-hidden flex flex-col text-app-primary animate-in zoom-in-95 duration-150"
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-app-border">
          <h2 className="text-sm font-semibold text-app-primary">
            {createModalState.parentId ? 'New Subpage' : 'Create Page'}
          </h2>
          <button
            onClick={closeCreateModal}
            className="p-1 rounded-md text-app-muted hover:text-app-primary hover:bg-app-sidebar transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleCreate} className="p-5 space-y-4">
          {/* Page Title */}
          <div>
            <label className="block text-[11px] font-semibold text-app-muted uppercase tracking-wider mb-1.5">
              Page Title
            </label>
            <input
              type="text"
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Sprint Planning, Architecture Spec, Task Matrix..."
              className="w-full px-3 py-2 rounded-lg bg-app-sidebar border border-app-border text-xs text-app-primary placeholder:text-app-muted outline-none focus:border-app-accent"
            />
          </div>

          {/* View Type Selection */}
          <div>
            <label className="block text-[11px] font-semibold text-app-muted uppercase tracking-wider mb-1.5">
              View Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {viewOptions.map((opt) => {
                const isSelected = viewType === opt.id;
                return (
                  <button
                    type="button"
                    key={opt.id}
                    onClick={() => setViewType(opt.id)}
                    className={`p-2.5 rounded-lg border text-left flex flex-col transition-all ${
                      isSelected
                        ? 'border-app-primary bg-app-card text-app-primary'
                        : 'border-app-border hover:bg-app-sidebar/60 bg-app-sidebar/30 text-app-secondary'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {opt.icon}
                      <span className="text-xs font-semibold">{opt.label}</span>
                    </div>
                    <span className="text-[11px] text-app-muted leading-tight">{opt.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Storage Vault Selection */}
          <div>
            <label className="block text-[11px] font-semibold text-app-muted uppercase tracking-wider mb-1.5">
              Parent Section
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setWorkspaceType('private')}
                className={`p-2 rounded-lg border flex items-center justify-center gap-1.5 text-xs font-medium transition-colors ${
                  workspaceType === 'private'
                    ? 'border-app-primary bg-app-card text-app-primary'
                    : 'border-app-border text-app-muted hover:bg-app-sidebar'
                }`}
              >
                <FolderLock className="w-3.5 h-3.5 text-app-muted" />
                <span>Private</span>
              </button>

              <button
                type="button"
                onClick={() => setWorkspaceType('shared')}
                className={`p-2 rounded-lg border flex items-center justify-center gap-1.5 text-xs font-medium transition-colors ${
                  workspaceType === 'shared'
                    ? 'border-app-primary bg-app-card text-app-primary'
                    : 'border-app-border text-app-muted hover:bg-app-sidebar'
                }`}
              >
                <Cloud className="w-3.5 h-3.5 text-app-muted" />
                <span>Shared</span>
              </button>

              <button
                type="button"
                onClick={() => setWorkspaceType('devtools')}
                className={`p-2 rounded-lg border flex items-center justify-center gap-1.5 text-xs font-medium transition-colors ${
                  workspaceType === 'devtools'
                    ? 'border-app-primary bg-app-card text-app-primary'
                    : 'border-app-border text-app-muted hover:bg-app-sidebar'
                }`}
              >
                <Terminal className="w-3.5 h-3.5 text-app-muted" />
                <span>Dev Tools</span>
              </button>
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-3 border-t border-app-border flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={closeCreateModal}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-app-muted hover:text-app-primary hover:bg-app-sidebar transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-app-accent hover:bg-app-accentHover text-white text-xs font-medium transition-colors shadow-sm"
            >
              Create Page
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
