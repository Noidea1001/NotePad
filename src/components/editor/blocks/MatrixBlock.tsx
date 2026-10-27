'use client';

import React from 'react';
import { Grid, Plus, Trash2, CheckCircle } from 'lucide-react';
import { EditorBlock } from '../types';

interface Quadrant {
  id: string;
  label: string;
  sub: string;
  items: string[];
}

interface MatrixBlockProps {
  block: EditorBlock;
  onUpdate: (data: Record<string, any>) => void;
}

export const MatrixBlock: React.FC<MatrixBlockProps> = ({ block, onUpdate }) => {
  const defaultQuadrants: Quadrant[] = [
    {
      id: 'q1',
      label: 'Strengths / High Value',
      sub: 'Internal advantages & capabilities',
      items: ['Proprietary local CRDT architecture', 'High-speed offline performance (< 2ms)'],
    },
    {
      id: 'q2',
      label: 'Weaknesses / Challenges',
      sub: 'Internal limitations to resolve',
      items: ['Initial user onboarding curve', 'Browser IndexedDB storage limits on mobile'],
    },
    {
      id: 'q3',
      label: 'Opportunities / Growth',
      sub: 'External trends & expansion',
      items: ['Team real-time collaboration tier', 'Desktop native installers with Tauri'],
    },
    {
      id: 'q4',
      label: 'Threats / Risks',
      sub: 'External roadblocks & blockers',
      items: ['Incumbent competitors (Notion/Obsidian)', 'WebRTC connectivity across strict firewalls'],
    },
  ];

  const title = block.data?.title || '2x2 Strategic Analysis Matrix (SWOT)';
  const quadrants: Quadrant[] = block.data?.quadrants || defaultQuadrants;

  const updateData = (updates: Record<string, any>) => {
    onUpdate({
      ...block.data,
      title,
      quadrants,
      ...updates,
    });
  };

  const handleAddItem = (qIndex: number) => {
    const next = quadrants.map((q, idx) => {
      if (idx === qIndex) {
        return { ...q, items: [...q.items, 'New observation point...'] };
      }
      return q;
    });
    updateData({ quadrants: next });
  };

  const handleUpdateItem = (qIndex: number, itemIndex: number, text: string) => {
    const next = quadrants.map((q, idx) => {
      if (idx === qIndex) {
        const nextItems = [...q.items];
        nextItems[itemIndex] = text;
        return { ...q, items: nextItems };
      }
      return q;
    });
    updateData({ quadrants: next });
  };

  const handleDeleteItem = (qIndex: number, itemIndex: number) => {
    const next = quadrants.map((q, idx) => {
      if (idx === qIndex) {
        return { ...q, items: q.items.filter((_, i) => i !== itemIndex) };
      }
      return q;
    });
    updateData({ quadrants: next });
  };

  return (
    <div className="w-full my-3 p-3.5 rounded-xl border border-app-border bg-app-surface/80 shadow-sm space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-app-border/40">
        <div className="flex items-center gap-2">
          <Grid className="w-4 h-4 text-app-primary" />
          <input
            type="text"
            value={title}
            onChange={(e) => updateData({ title: e.target.value })}
            placeholder="Matrix Analysis Title"
            className="font-bold text-xs bg-transparent text-app-primary border-none outline-none font-mono"
          />
        </div>
        <span className="text-[10px] uppercase font-mono text-app-muted">Analysis Framework</span>
      </div>

      {/* 2x2 Quadrant Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {quadrants.map((quad, qIdx) => (
          <div
            key={quad.id}
            className="p-3 rounded-lg border border-app-border bg-app-sidebar/40 flex flex-col justify-between space-y-2 hover:border-app-border/90 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <input
                  type="text"
                  value={quad.label}
                  onChange={(e) => {
                    const next = [...quadrants];
                    next[qIdx].label = e.target.value;
                    updateData({ quadrants: next });
                  }}
                  className="font-bold text-xs bg-transparent text-app-primary border-none outline-none"
                />
                <button
                  onClick={() => handleAddItem(qIdx)}
                  title="Add point"
                  className="p-1 rounded text-app-muted hover:text-app-primary hover:bg-app-sidebar transition-colors"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
              <p className="text-[10px] text-app-muted leading-tight mb-2">{quad.sub}</p>

              {/* Items List */}
              <div className="space-y-1.5">
                {quad.items.map((item, itemIdx) => (
                  <div key={itemIdx} className="flex items-start gap-1.5 group text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-app-muted/60 mt-1.5 shrink-0" />
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => handleUpdateItem(qIdx, itemIdx, e.target.value)}
                      className="w-full bg-transparent border-none outline-none text-xs text-app-secondary focus:text-app-primary"
                    />
                    <button
                      onClick={() => handleDeleteItem(qIdx, itemIdx)}
                      className="opacity-0 group-hover:opacity-100 p-0.5 text-app-muted hover:text-red-400 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => handleAddItem(qIdx)}
              className="text-[11px] text-app-muted hover:text-app-primary flex items-center gap-1 pt-1 opacity-70 hover:opacity-100"
            >
              <Plus className="w-3 h-3" />
              <span>Add item</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
