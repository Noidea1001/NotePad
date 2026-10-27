'use client';

import React from 'react';
import { StickyNote, Plus, Trash2, X } from 'lucide-react';
import { EditorBlock } from '../types';

interface StickyItem {
  id: string;
  text: string;
  color: 'yellow' | 'green' | 'blue' | 'purple' | 'pink';
}

interface StickyBoardBlockProps {
  block: EditorBlock;
  onUpdate: (data: Record<string, any>) => void;
}

const STICKY_STYLES = {
  yellow: 'bg-amber-500/10 border-amber-500/25 text-app-primary',
  green: 'bg-emerald-500/10 border-emerald-500/25 text-app-primary',
  blue: 'bg-blue-500/10 border-blue-500/25 text-app-primary',
  purple: 'bg-purple-500/10 border-purple-500/25 text-app-primary',
  pink: 'bg-rose-500/10 border-rose-500/25 text-app-primary',
};

export const StickyBoardBlock: React.FC<StickyBoardBlockProps> = ({ block, onUpdate }) => {
  const defaultNotes: StickyItem[] = [
    { id: 'st-1', text: 'Core objective: Build clean local-first workspace for daily note taking and planning.', color: 'yellow' },
    { id: 'st-2', text: 'Insight: Separate general notes from specialized engineering tools.', color: 'green' },
    { id: 'st-3', text: 'Action item: Test drag-and-drop schema canvas across desktop views.', color: 'blue' },
  ];

  const title = block.data?.title || 'Idea & Brainstorming Board';
  const notes: StickyItem[] = block.data?.notes || defaultNotes;

  const updateData = (updates: Record<string, any>) => {
    onUpdate({
      ...block.data,
      title,
      notes,
      ...updates,
    });
  };

  const handleAddNote = (color: StickyItem['color'] = 'yellow') => {
    const next = [
      ...notes,
      {
        id: `st-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        text: '',
        color,
      },
    ];
    updateData({ notes: next });
  };

  const handleUpdateText = (index: number, text: string) => {
    const next = notes.map((item, idx) => (idx === index ? { ...item, text } : item));
    updateData({ notes: next });
  };

  const handleDeleteNote = (index: number) => {
    const next = notes.filter((_, idx) => idx !== index);
    updateData({ notes: next });
  };

  return (
    <div className="w-full my-3 p-3.5 rounded-xl border border-app-border bg-app-surface shadow-sm space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-app-border/40 gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <StickyNote className="w-4 h-4 text-app-primary shrink-0" />
          <input
            type="text"
            value={title}
            onChange={(e) => updateData({ title: e.target.value })}
            placeholder="Board Title"
            className="font-bold text-xs bg-transparent text-app-primary border-none outline-none font-mono flex-1 min-w-0"
          />
        </div>

        {/* Add Note Color Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[10px] text-app-muted font-medium mr-1">Add:</span>
          {(['yellow', 'green', 'blue', 'pink', 'purple'] as Array<StickyItem['color']>).map((c) => (
            <button
              key={c}
              onClick={() => handleAddNote(c)}
              title={`Add ${c} card`}
              className={`w-3.5 h-3.5 rounded-full border border-app-border/80 hover:scale-125 transition-transform ${
                c === 'yellow'
                  ? 'bg-amber-400'
                  : c === 'green'
                  ? 'bg-emerald-400'
                  : c === 'blue'
                  ? 'bg-blue-400'
                  : c === 'pink'
                  ? 'bg-rose-400'
                  : 'bg-purple-400'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Sticky Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {notes.map((note, index) => (
          <div
            key={note.id}
            className={`p-3 rounded-lg border shadow-xs relative group flex flex-col justify-between min-h-[90px] transition-all hover:border-app-accent/40 ${
              STICKY_STYLES[note.color] || STICKY_STYLES.yellow
            }`}
          >
            <textarea
              value={note.text}
              onChange={(e) => handleUpdateText(index, e.target.value)}
              placeholder="Write note here..."
              rows={3}
              className="w-full bg-transparent border-none outline-none resize-none text-xs leading-relaxed text-app-primary placeholder:text-app-muted/40"
            />
            <button
              onClick={() => handleDeleteNote(index)}
              title="Delete card"
              className="opacity-0 group-hover:opacity-100 absolute top-2 right-2 p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 text-app-muted hover:text-app-primary transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
