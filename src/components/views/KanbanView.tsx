'use client';

import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Table,
  Kanban,
  GitBranch,
  Check,
  AlertCircle,
  Clock,
  CheckCircle2,
  Circle,
  Layers,
  Zap,
} from 'lucide-react';
import { useSheetData } from '@/components/sheet/useSheetData';
import { StatusValue, PriorityValue } from '@/components/sheet/types';
import { WorkspacePage } from '@/types';
import { useWorkspaceStore } from '@/stores/useWorkspaceStore';

const KANBAN_STAGES: { id: StatusValue; label: string; icon: React.ReactNode; color: string }[] = [
  { id: 'To Do', label: 'To Do', icon: <Circle className="w-3.5 h-3.5 text-app-muted" />, color: 'var(--text-muted)' },
  { id: 'In Progress', label: 'In Progress', icon: <Clock className="w-3.5 h-3.5 text-app-muted" />, color: 'var(--text-muted)' },
  { id: 'Done', label: 'Done', icon: <CheckCircle2 className="w-3.5 h-3.5 text-app-muted" />, color: 'var(--text-muted)' },
  { id: 'Blocked', label: 'Blocked', icon: <AlertCircle className="w-3.5 h-3.5 text-app-muted" />, color: 'var(--text-muted)' },
];

export const KanbanView: React.FC<{ page: WorkspacePage }> = ({ page }) => {
  const { setActiveView } = useWorkspaceStore();
  const { columns, rows, updateCell, addRow, deleteRow } = useSheetData(page.id);

  const [copiedBranch, setCopiedBranch] = useState<string | null>(null);
  const [addingInStage, setAddingInStage] = useState<StatusValue | null>(null);
  const [newCardTitle, setNewCardTitle] = useState('');

  // Identify key columns
  const statusCol = columns.find((c) => c.type === 'status') || columns[1] || { id: 'col-status' };
  const taskCol = columns.find((c) => c.type === 'text') || columns[0] || { id: 'col-task' };
  const priorityCol = columns.find((c) => c.type === 'priority');
  const progressCol = columns.find((c) => c.type === 'progress');
  const branchCol = columns.find((c) => c.type === 'gitBranch');
  const pointsCol = columns.find((c) => c.name.toLowerCase().includes('point') || c.type === 'number');

  const handleCopyBranch = (branch: string) => {
    navigator.clipboard.writeText(`git checkout -b ${branch}`);
    setCopiedBranch(branch);
    setTimeout(() => setCopiedBranch(null), 2000);
  };

  const handleCreateTask = (stage: StatusValue) => {
    if (!newCardTitle.trim()) {
      setAddingInStage(null);
      return;
    }

    addRow({
      [taskCol.id]: newCardTitle.trim(),
      [statusCol.id]: stage,
      ...(priorityCol ? { [priorityCol.id]: 'P1' } : {}),
      ...(progressCol ? { [progressCol.id]: stage === 'Done' ? 100 : 0 } : {}),
      ...(branchCol ? { [branchCol.id]: `feat/${newCardTitle.toLowerCase().replace(/\s+/g, '-')}` } : {}),
    });

    setNewCardTitle('');
    setAddingInStage(null);
  };

  const getPriorityStyle = (priority: PriorityValue) => {
    switch (priority) {
      case 'P0':
        return 'bg-app-sidebar text-app-primary border-app-border font-bold';
      case 'P1':
        return 'bg-app-sidebar text-app-secondary border-app-border font-medium';
      case 'P2':
        return 'bg-app-sidebar text-app-muted border-app-border';
      default:
        return 'bg-app-sidebar text-app-muted border-app-border';
    }
  };

  return (
    <div className="h-full flex flex-col p-6 space-y-4 overflow-hidden">
      {/* Header Bar */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-app-primary flex items-center gap-2">
              <Kanban className="w-5 h-5 text-app-primary" />
              <span>{page.title}</span>
            </h1>
          </div>
          <p className="text-xs text-app-muted mt-0.5">
            {rows.length} cards across 4 stages &bull; Drag cards or click to update
          </p>
        </div>

        {/* View Switcher to Sheet Grid */}
        <button
          onClick={() => setActiveView('sheet')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-app-border bg-app-sidebar/60 hover:bg-app-sidebar text-xs text-app-secondary hover:text-app-primary transition-colors"
        >
          <Table className="w-3.5 h-3.5 text-emerald-400" />
          <span>Switch to Sheet Grid</span>
        </button>
      </div>

      {/* Kanban Stages Grid */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-y-auto pb-4 select-none">
        {KANBAN_STAGES.map((stage) => {
          const stageRows = rows.filter((r) => (r.cells[statusCol.id] || 'To Do') === stage.id);
          const isAdding = addingInStage === stage.id;

          return (
            <div
              key={stage.id}
              className="flex flex-col rounded-xl bg-app-sidebar/40 border border-app-border overflow-hidden"
            >
              {/* Column Header */}
              <div className="p-3 border-b border-app-border flex items-center justify-between bg-app-sidebar/60">
                <div className="flex items-center gap-2">
                  {stage.icon}
                  <span className="text-xs font-semibold text-app-primary">{stage.label}</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-app-surface text-app-muted border border-app-border font-mono">
                    {stageRows.length}
                  </span>
                </div>

                <button
                  onClick={() => setAddingInStage(stage.id)}
                  className="p-1 rounded text-app-muted hover:text-app-primary hover:bg-app-sidebar transition-colors"
                  title={`Add task to ${stage.label}`}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Cards Container */}
              <div className="flex-1 p-2 space-y-2 overflow-y-auto">
                {/* Inline New Card Form */}
                {isAdding && (
                  <div className="p-3 rounded-lg bg-app-surface border border-app-accent shadow-card animate-in fade-in duration-100">
                    <textarea
                      autoFocus
                      rows={2}
                      value={newCardTitle}
                      onChange={(e) => setNewCardTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleCreateTask(stage.id);
                        }
                        if (e.key === 'Escape') setAddingInStage(null);
                      }}
                      placeholder="Enter task name..."
                      className="w-full bg-transparent text-xs text-app-primary placeholder:text-app-muted outline-none resize-none"
                    />
                    <div className="flex items-center justify-end gap-1.5 mt-2">
                      <button
                        onClick={() => setAddingInStage(null)}
                        className="px-2 py-1 text-[11px] rounded text-app-muted hover:text-app-primary"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleCreateTask(stage.id)}
                        className="px-2.5 py-1 text-[11px] rounded bg-app-accent text-white font-medium"
                      >
                        Add Task
                      </button>
                    </div>
                  </div>
                )}

                {/* Card Items */}
                {stageRows.map((row) => {
                  const title = row.cells[taskCol.id] || 'Untitled Task';
                  const priority = priorityCol ? (row.cells[priorityCol.id] as PriorityValue) : null;
                  const progress = progressCol ? Number(row.cells[progressCol.id]) || 0 : 0;
                  const branch = branchCol ? row.cells[branchCol.id] : null;
                  const points = pointsCol ? row.cells[pointsCol.id] : null;

                  return (
                    <div
                      key={row.id}
                      className="group p-3 rounded-lg bg-app-surface border border-app-border hover:border-app-accent/40 shadow-sm transition-all duration-150 flex flex-col gap-2.5 text-xs"
                    >
                      {/* Card Title & Delete */}
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-app-primary leading-snug">
                          {title}
                        </span>

                        <button
                          onClick={() => deleteRow(row.id)}
                          className="opacity-0 group-hover:opacity-100 p-0.5 text-app-muted hover:text-red-400 rounded transition-opacity"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Progress Bar */}
                      {progressCol && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] text-app-muted font-mono">
                            <span>Progress</span>
                            <span>{progress}%</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-app-sidebar overflow-hidden">
                            <div
                              style={{ width: `${progress}%` }}
                              className="h-full bg-app-accent rounded-full transition-all duration-300"
                            />
                          </div>
                        </div>
                      )}

                      {/* Git Branch Chip with Click-to-Copy */}
                      {branch && (
                        <div
                          onClick={() => handleCopyBranch(branch)}
                          title={`Click to copy: git checkout -b ${branch}`}
                          className="flex items-center gap-1.5 px-2 py-1 rounded bg-app-sidebar border border-app-border hover:border-app-accent/40 cursor-pointer font-mono text-[10px] text-indigo-400 transition-colors"
                        >
                          {copiedBranch === branch ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <GitBranch className="w-3 h-3" />
                          )}
                          <span className="truncate">{branch}</span>
                        </div>
                      )}

                      {/* Footer: Priority & Stage Mover */}
                      <div className="pt-2 border-t border-app-border/60 flex items-center justify-between text-[10px]">
                        <div className="flex items-center gap-1.5">
                          {priority && (
                            <span
                              className={`px-1.5 py-0.5 rounded font-mono text-[9px] border uppercase ${getPriorityStyle(
                                priority
                              )}`}
                            >
                              {priority}
                            </span>
                          )}

                          {points !== null && points !== undefined && (
                            <span className="px-1.5 py-0.5 rounded bg-app-sidebar border border-app-border text-app-muted font-mono">
                              {points} pts
                            </span>
                          )}
                        </div>

                        {/* Move Card between Stages */}
                        <select
                          value={row.cells[statusCol.id] || 'To Do'}
                          onChange={(e) =>
                            updateCell(row.id, statusCol.id, e.target.value as StatusValue)
                          }
                          className="bg-app-sidebar border border-app-border rounded px-1.5 py-0.5 text-[9px] text-app-muted outline-none cursor-pointer"
                        >
                          {KANBAN_STAGES.map((s) => (
                            <option key={s.id} value={s.id}>
                              Move: {s.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  );
                })}

                {stageRows.length === 0 && !isAdding && (
                  <div className="py-8 text-center text-[11px] text-app-muted border border-dashed border-app-border rounded-lg">
                    No tasks in {stage.label}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
