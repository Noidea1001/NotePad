'use client';

import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  FileText,
  Calendar,
  Sparkles,
  Heading1,
  Heading2,
  CheckSquare,
  Code,
  Quote,
  Minus,
  Save,
  Check,
} from 'lucide-react';
import { db } from '@/db/workspace-db';
import { useWorkspaceStore } from '@/stores/useWorkspaceStore';
import { WorkspacePage } from '@/types';

export const DocumentView: React.FC<{ page: WorkspacePage }> = ({ page }) => {
  const { widthPreference, setStorageStatus } = useWorkspaceStore();
  const [content, setContent] = useState(page.content || '');
  const [title, setTitle] = useState(page.title);
  const [isSaved, setIsSaved] = useState(true);

  // Sync state if active page changes
  useEffect(() => {
    setContent(page.content || '');
    setTitle(page.title);
    setIsSaved(true);
  }, [page.id, page.content, page.title]);

  const handleTitleChange = async (newTitle: string) => {
    setTitle(newTitle);
    setIsSaved(false);
    await db.pages.update(page.id, {
      title: newTitle,
      updatedAt: Date.now(),
    });
    setIsSaved(true);
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setIsSaved(false);
  };

  // Debounced auto-save content to Dexie IndexedDB
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!isSaved) {
        await db.pages.update(page.id, {
          content,
          updatedAt: Date.now(),
        });
        setIsSaved(true);
        setStorageStatus({ lastSavedAt: Date.now() });
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [content, isSaved, page.id, setStorageStatus]);

  const insertSnippet = (snippet: string) => {
    setContent((prev) => `${prev}\n\n${snippet}`);
    setIsSaved(false);
  };

  return (
    <div
      className={`h-full overflow-y-auto px-6 py-8 transition-all ${
        widthPreference === 'standard' ? 'max-w-[760px] mx-auto' : 'max-w-5xl mx-auto'
      }`}
    >
      {/* Header Info & Title */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-end">
          <div className="flex items-center gap-2 text-xs text-app-muted">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                {new Date(page.updatedAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </span>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-app-sidebar border border-app-border text-emerald-400">
              {isSaved ? (
                <>
                  <Check className="w-3 h-3" />
                  <span>Saved</span>
                </>
              ) : (
                <>
                  <Save className="w-3 h-3 animate-spin" />
                  <span>Saving...</span>
                </>
              )}
            </span>
          </div>
        </div>

        {/* Page Title Input */}
        <input
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Untitled Page"
          className="w-full text-3xl font-bold bg-transparent text-app-primary border-none outline-none placeholder:text-app-muted/50 tracking-tight"
        />

        {/* Slash Command Quick Format Bar */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-app-sidebar/60 border border-app-border text-xs text-app-muted overflow-x-auto">
          <span className="text-[11px] font-medium px-1.5 py-0.5 rounded bg-app-surface text-app-accent border border-app-border">
            Blocks:
          </span>
          <button
            onClick={() => insertSnippet('# Heading 1')}
            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-app-sidebarHover hover:text-app-primary transition-colors"
          >
            <Heading1 className="w-3.5 h-3.5" />
            <span>H1</span>
          </button>
          <button
            onClick={() => insertSnippet('## Heading 2')}
            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-app-sidebarHover hover:text-app-primary transition-colors"
          >
            <Heading2 className="w-3.5 h-3.5" />
            <span>H2</span>
          </button>
          <button
            onClick={() => insertSnippet('- [ ] Todo item')}
            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-app-sidebarHover hover:text-app-primary transition-colors"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Task</span>
          </button>
          <button
            onClick={() => insertSnippet('```typescript\n// Code snippet\nconst localDb = db;\n```')}
            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-app-sidebarHover hover:text-app-primary transition-colors"
          >
            <Code className="w-3.5 h-3.5" />
            <span>Code</span>
          </button>
          <button
            onClick={() => insertSnippet('> **Note**: Important local-first architecture note.')}
            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-app-sidebarHover hover:text-app-primary transition-colors"
          >
            <Quote className="w-3.5 h-3.5" />
            <span>Callout</span>
          </button>
          <button
            onClick={() => insertSnippet('---')}
            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-app-sidebarHover hover:text-app-primary transition-colors"
          >
            <Minus className="w-3.5 h-3.5" />
            <span>Divider</span>
          </button>
        </div>
      </div>

      {/* Markdown Content Canvas */}
      <div className="relative">
        <textarea
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder="Type markdown, press Enter for new line..."
          rows={22}
          className="w-full bg-transparent text-sm leading-relaxed text-app-primary outline-none resize-none border-none placeholder:text-app-muted/50 font-sans"
        />
      </div>

      {/* Live Preview Tip Footer */}
      <div className="mt-8 pt-4 border-t border-app-border/60 flex items-center justify-between text-xs text-app-muted">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-app-accent" />
          <span>Local Dexie.js Reactive Store active &bull; Auto-saved to IndexedDB</span>
        </span>
        <span>{content.length} characters &bull; {content.split(/\s+/).filter(Boolean).length} words</span>
      </div>
    </div>
  );
};
