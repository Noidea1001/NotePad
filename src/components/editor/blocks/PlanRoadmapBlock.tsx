'use client';

import React from 'react';
import { Calendar, Plus, CheckSquare, Square, Trash2, Milestone } from 'lucide-react';
import { EditorBlock } from '../types';

interface PhaseItem {
  id: string;
  name: string;
  timeline: string;
  status: 'planned' | 'in_progress' | 'completed';
  tasks: Array<{ id: string; text: string; done: boolean }>;
}

interface PlanRoadmapBlockProps {
  block: EditorBlock;
  onUpdate: (data: Record<string, any>) => void;
}

export const PlanRoadmapBlock: React.FC<PlanRoadmapBlockProps> = ({ block, onUpdate }) => {
  const defaultPhases: PhaseItem[] = [
    {
      id: 'ph-1',
      name: 'Phase 1: Research & Discovery',
      timeline: 'Week 1 - 2',
      status: 'completed',
      tasks: [
        { id: 't-1', text: 'Gather core requirements & feedback', done: true },
        { id: 't-2', text: 'Draft initial architecture spec', done: true },
      ],
    },
    {
      id: 'ph-2',
      name: 'Phase 2: Core Implementation',
      timeline: 'Week 3 - 5',
      status: 'in_progress',
      tasks: [
        { id: 't-3', text: 'Implement flexible multi-column note editor', done: true },
        { id: 't-4', text: 'Build interactive diagram canvas & lines', done: true },
        { id: 't-5', text: 'Quality assurance & performance audit', done: false },
      ],
    },
    {
      id: 'ph-3',
      name: 'Phase 3: Rollout & Production Launch',
      timeline: 'Week 6',
      status: 'planned',
      tasks: [
        { id: 't-6', text: 'Desktop packaging with Tauri v2', done: false },
        { id: 't-7', text: 'Public release documentation', done: false },
      ],
    },
  ];

  const title = block.data?.title || 'Execution Roadmap & Milestones';
  const phases: PhaseItem[] = block.data?.phases || defaultPhases;

  const updateData = (updates: Record<string, any>) => {
    onUpdate({
      ...block.data,
      title,
      phases,
      ...updates,
    });
  };

  const handleToggleTask = (phaseIdx: number, taskIdx: number) => {
    const next = [...phases];
    next[phaseIdx].tasks[taskIdx].done = !next[phaseIdx].tasks[taskIdx].done;
    updateData({ phases: next });
  };

  const handleAddTask = (phaseIdx: number) => {
    const next = [...phases];
    next[phaseIdx].tasks.push({
      id: `t-${Date.now()}`,
      text: 'New milestone task...',
      done: false,
    });
    updateData({ phases: next });
  };

  const handleDeleteTask = (phaseIdx: number, taskIdx: number) => {
    const next = [...phases];
    next[phaseIdx].tasks = next[phaseIdx].tasks.filter((_, i) => i !== taskIdx);
    updateData({ phases: next });
  };

  const handleAddPhase = () => {
    const next = [
      ...phases,
      {
        id: `ph-${Date.now()}`,
        name: `Phase ${phases.length + 1}: Expansion`,
        timeline: 'Upcoming',
        status: 'planned' as const,
        tasks: [{ id: `t-${Date.now()}`, text: 'Initial deliverable...', done: false }],
      },
    ];
    updateData({ phases: next });
  };

  return (
    <div className="w-full my-3 p-3.5 rounded-xl border border-app-border bg-app-surface shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-app-border/40">
        <div className="flex items-center gap-2">
          <Milestone className="w-4 h-4 text-app-primary" />
          <input
            type="text"
            value={title}
            onChange={(e) => updateData({ title: e.target.value })}
            placeholder="Project Plan Title"
            className="font-bold text-xs bg-transparent text-app-primary border-none outline-none font-mono"
          />
        </div>
        <button
          onClick={handleAddPhase}
          className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs text-app-primary border border-app-border hover:bg-app-sidebar transition-colors"
        >
          <Plus className="w-3 h-3" />
          <span>Add Phase</span>
        </button>
      </div>

      {/* Phases Timeline Grid */}
      <div className="space-y-3">
        {phases.map((phase, pIdx) => {
          const completedCount = phase.tasks.filter((t) => t.done).length;
          const totalCount = phase.tasks.length;
          const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

          return (
            <div
              key={phase.id}
              className="p-3 rounded-lg border border-app-border bg-app-sidebar/40 space-y-2.5"
            >
              {/* Phase Meta Bar */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                  <input
                    type="text"
                    value={phase.name}
                    onChange={(e) => {
                      const next = [...phases];
                      next[pIdx].name = e.target.value;
                      updateData({ phases: next });
                    }}
                    className="font-bold text-xs text-app-primary bg-transparent border-none outline-none"
                  />
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-app-sidebar border border-app-border text-app-muted">
                    {phase.timeline}
                  </span>
                </div>

                <div className="flex items-center gap-3 shrink-0 text-xs">
                  {/* Progress Indicator */}
                  <div className="flex items-center gap-1.5">
                    <div className="w-20 h-1.5 rounded-full bg-app-border overflow-hidden">
                      <div
                        style={{ width: `${progressPercent}%` }}
                        className="h-full bg-app-primary rounded-full transition-all duration-300"
                      />
                    </div>
                    <span className="text-[10px] font-mono text-app-muted">{progressPercent}%</span>
                  </div>

                  {/* Status Tag */}
                  <select
                    value={phase.status}
                    onChange={(e) => {
                      const next = [...phases];
                      next[pIdx].status = e.target.value as any;
                      updateData({ phases: next });
                    }}
                    className="text-[10px] px-2 py-0.5 rounded bg-app-surface border border-app-border text-app-primary outline-none"
                  >
                    <option value="planned">Planned</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              {/* Tasks List */}
              <div className="space-y-1.5 pl-1">
                {phase.tasks.map((task, tIdx) => (
                  <div key={task.id} className="flex items-center gap-2 group text-xs">
                    <button
                      onClick={() => handleToggleTask(pIdx, tIdx)}
                      className="text-app-muted hover:text-app-primary transition-colors shrink-0"
                    >
                      {task.done ? (
                        <CheckSquare className="w-3.5 h-3.5 text-app-primary" />
                      ) : (
                        <Square className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <input
                      type="text"
                      value={task.text}
                      onChange={(e) => {
                        const next = [...phases];
                        next[pIdx].tasks[tIdx].text = e.target.value;
                        updateData({ phases: next });
                      }}
                      className={`w-full bg-transparent border-none outline-none text-xs ${
                        task.done ? 'line-through text-app-muted' : 'text-app-primary'
                      }`}
                    />
                    <button
                      onClick={() => handleDeleteTask(pIdx, tIdx)}
                      className="opacity-0 group-hover:opacity-100 p-0.5 text-app-muted hover:text-red-400 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Task Button */}
              <button
                onClick={() => handleAddTask(pIdx)}
                className="text-[11px] text-app-muted hover:text-app-primary flex items-center gap-1 pt-1 opacity-75 hover:opacity-100"
              >
                <Plus className="w-3 h-3" />
                <span>Add Task</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
