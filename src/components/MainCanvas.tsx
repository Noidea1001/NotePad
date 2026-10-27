'use client';

import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/workspace-db';
import { useWorkspaceStore } from '@/stores/useWorkspaceStore';
import { DocumentEditorView } from '@/components/editor/DocumentEditorView';
import { SheetGridView } from '@/components/views/SheetGridView';
import { KanbanView } from '@/components/views/KanbanView';
import { ErdView } from '@/components/views/ErdView';
import { Loader2, FileQuestion } from 'lucide-react';

export const MainCanvas: React.FC = () => {
  const { activePageId, activeView } = useWorkspaceStore();

  const activePage = useLiveQuery(
    () => (activePageId ? db.pages.get(activePageId) : undefined),
    [activePageId]
  );

  if (activePage === undefined) {
    return (
      <div className="flex-1 flex items-center justify-center bg-app-canvas text-app-muted">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-app-accent" />
          <span className="text-xs">Accessing IndexedDB storage...</span>
        </div>
      </div>
    );
  }

  if (!activePage) {
    return (
      <div className="flex-1 flex items-center justify-center bg-app-canvas text-app-muted p-8 text-center">
        <div className="max-w-md space-y-3">
          <FileQuestion className="w-10 h-10 mx-auto text-app-muted" />
          <h2 className="text-sm font-semibold text-app-primary">No Page Selected</h2>
          <p className="text-xs leading-relaxed">
            Select a document, sheet, or board from the sidebar, or press <kbd className="px-1.5 py-0.5 rounded bg-app-surface border border-app-border font-mono">⌘K</kbd> to jump to an existing page.
          </p>
        </div>
      </div>
    );
  }

  // The active view tab from top navbar takes precedence, or page's default view
  const currentView = activeView || activePage.viewType;

  return (
    <main className="flex-1 min-h-0 h-full overflow-hidden bg-app-canvas">
      {currentView === 'doc' && <DocumentEditorView page={activePage} />}
      {currentView === 'sheet' && <SheetGridView page={activePage} />}
      {currentView === 'kanban' && <KanbanView page={activePage} />}
      {currentView === 'erd' && <ErdView page={activePage} />}
    </main>
  );
};
