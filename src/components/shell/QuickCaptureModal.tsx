'use client';

import React, { useState, useEffect } from 'react';
import { Zap, X, Save, ArrowRight, CornerDownLeft } from 'lucide-react';
import { db } from '@/db/workspace-db';
import { useWorkspaceStore } from '@/stores/useWorkspaceStore';

export const QuickCaptureModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState('');
  const { activePageId } = useWorkspaceStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt + Space to open Quick Capture from anywhere
      if (e.altKey && (e.code === 'Space' || e.key === ' ')) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSave = async () => {
    if (!content.trim() || !activePageId) return;

    try {
      const page = await db.pages.get(activePageId);
      if (page) {
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const appended = `${page.content || ''}\n\n- [ ] **[${timestamp}]**: ${content.trim()}`;
        await db.pages.update(activePageId, {
          content: appended,
          updatedAt: Date.now(),
        });
      }
      setContent('');
      setIsOpen(false);
    } catch (err) {
      console.error('Quick capture save error:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={() => setIsOpen(false)}
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150 select-none text-xs"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-2xl bg-app-surface border border-app-border shadow-2xl overflow-hidden flex flex-col text-app-primary animate-in zoom-in-95 duration-150"
      >
        <div className="px-4 py-2.5 bg-app-sidebar/80 border-b border-app-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-amber-500/15 text-amber-400">
              <Zap className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold text-app-primary">Quick Capture</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-app-surface border border-app-border text-app-muted font-mono">
              Alt + Space
            </span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded text-app-muted hover:text-app-primary"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="p-4">
          <textarea
            autoFocus
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                handleSave();
              }
            }}
            placeholder="Jot down a quick thought, bug note, or task... Appends to active page."
            className="w-full bg-transparent text-sm text-app-primary placeholder:text-app-muted/50 outline-none resize-none leading-relaxed"
          />

          <div className="flex items-center justify-between pt-3 border-t border-app-border/60 text-[11px] text-app-muted">
            <span className="flex items-center gap-1 font-mono">
              <kbd className="px-1.5 py-0.5 rounded bg-app-sidebar border border-app-border">Ctrl + Enter</kbd> to save
            </span>

            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-app-accent hover:bg-app-accentHover text-white font-medium shadow-sm transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Capture to Note</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
