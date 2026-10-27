'use client';

import React, { useState, useEffect } from 'react';
import {
  Download,
  FileText,
  Printer,
  Check,
  FileCode,
  HardDrive,
  FolderArchive,
  Sparkles,
  ChevronDown,
  Save,
} from 'lucide-react';
import { WorkspacePage } from '@/types';
import {
  getDocumentBlocks,
  convertBlocksToMarkdown,
  convertBlocksToPlainText,
  convertBlocksToHtml,
  downloadFile,
} from '@/utils/documentExport';
import { useWorkspaceStore } from '@/stores/useWorkspaceStore';

interface SaveExportMenuProps {
  activePage?: WorkspacePage;
}

export const SaveExportMenu: React.FC<SaveExportMenuProps> = ({ activePage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const { setBackupModalOpen, storageStatus, setStorageStatus } = useWorkspaceStore();

  // Handle Ctrl+S / Cmd+S global shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        triggerManualSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const triggerManualSave = () => {
    setJustSaved(true);
    setStorageStatus({ lastSavedAt: Date.now() });
    setTimeout(() => {
      setJustSaved(false);
    }, 2000);
  };

  const pageTitle = activePage?.title || 'Untitled';
  const safeFilename = pageTitle.toLowerCase().replace(/[^a-z0-9_-]/g, '_');

  const handleExportPdf = () => {
    setIsOpen(false);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  const handleExportMarkdown = () => {
    if (!activePage) return;
    const blocks = getDocumentBlocks(activePage.id, activePage.content);
    const md = convertBlocksToMarkdown(pageTitle, blocks);
    downloadFile(md, `${safeFilename}.md`, 'text/markdown');
    setIsOpen(false);
  };

  const handleExportPlainText = () => {
    if (!activePage) return;
    const blocks = getDocumentBlocks(activePage.id, activePage.content);
    const text = convertBlocksToPlainText(pageTitle, blocks);
    downloadFile(text, `${safeFilename}.txt`, 'text/plain');
    setIsOpen(false);
  };

  const handleExportHtml = () => {
    if (!activePage) return;
    const blocks = getDocumentBlocks(activePage.id, activePage.content);
    const html = convertBlocksToHtml(pageTitle, blocks);
    downloadFile(html, `${safeFilename}.html`, 'text/html');
    setIsOpen(false);
  };

  const handleOpenWorkspaceBackup = () => {
    setIsOpen(false);
    setBackupModalOpen(true);
  };

  return (
    <div className="relative select-none">
      {/* Top Navbar Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="Save & Export Options (Ctrl+S / ⌘S)"
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-all ${
          justSaved
            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
            : 'bg-app-surface hover:bg-app-sidebar border-app-border text-app-primary'
        }`}
      >
        {justSaved ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-400 animate-in zoom-in" />
            <span className="text-emerald-400">Saved</span>
          </>
        ) : (
          <>
            <Save className="w-3.5 h-3.5 text-app-muted" />
            <span>Save & Export</span>
            <ChevronDown className="w-3 h-3 text-app-muted opacity-70" />
          </>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-40"
          />

          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute right-0 top-full mt-1.5 w-72 rounded-xl bg-app-surface border border-app-border shadow-elevation p-1.5 z-50 text-xs text-app-primary animate-in fade-in zoom-in-95"
          >
            {/* Auto-Save Status Header */}
            <div className="p-2.5 rounded-lg bg-app-sidebar/60 border border-app-border/40 mb-1.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <div>
                  <div className="text-[11px] font-semibold text-app-primary flex items-center gap-1">
                    <span>Auto-Saved to Local</span>
                    <Check className="w-3 h-3 text-emerald-400" />
                  </div>
                  <div className="text-[10px] text-app-muted font-mono">
                    Zero loss &bull; IndexedDB sync
                  </div>
                </div>
              </div>

              <button
                onClick={triggerManualSave}
                title="Force Instant Save (Ctrl+S)"
                className="px-2 py-1 rounded bg-app-surface hover:bg-app-sidebar border border-app-border text-[10px] font-mono font-medium text-app-secondary hover:text-app-primary transition-colors"
              >
                Ctrl+S
              </button>
            </div>

            {/* Section 1: Export Current Document */}
            <div className="px-2 py-1 text-[10px] uppercase font-mono font-bold text-app-muted tracking-wider">
              Export Note
            </div>

            {/* 1. PDF */}
            <button
              onClick={handleExportPdf}
              className="w-full p-2 flex items-center gap-2.5 rounded-lg hover:bg-app-sidebar text-left transition-colors group"
            >
              <div className="w-7 h-7 rounded-md bg-red-500/10 text-red-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Printer className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-xs text-app-primary flex items-center justify-between">
                  <span>Export as PDF (.pdf)</span>
                  <span className="text-[10px] font-mono text-app-muted">Print</span>
                </div>
                <p className="text-[10px] text-app-muted truncate">
                  High-res print-ready PDF document
                </p>
              </div>
            </button>

            {/* 2. Markdown */}
            <button
              onClick={handleExportMarkdown}
              className="w-full p-2 flex items-center gap-2.5 rounded-lg hover:bg-app-sidebar text-left transition-colors group"
            >
              <div className="w-7 h-7 rounded-md bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <FileCode className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-xs text-app-primary flex items-center justify-between">
                  <span>Export as Markdown (.md)</span>
                  <span className="text-[10px] font-mono text-app-muted">.md</span>
                </div>
                <p className="text-[10px] text-app-muted truncate">
                  GitHub-ready markdown with tables & lists
                </p>
              </div>
            </button>

            {/* 3. Plain Text */}
            <button
              onClick={handleExportPlainText}
              className="w-full p-2 flex items-center gap-2.5 rounded-lg hover:bg-app-sidebar text-left transition-colors group"
            >
              <div className="w-7 h-7 rounded-md bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <FileText className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-xs text-app-primary flex items-center justify-between">
                  <span>Export as Plain Text (.txt)</span>
                  <span className="text-[10px] font-mono text-app-muted">.txt</span>
                </div>
                <p className="text-[10px] text-app-muted truncate">
                  Clean unformatted text for email or copy
                </p>
              </div>
            </button>

            {/* 4. HTML Web Page */}
            <button
              onClick={handleExportHtml}
              className="w-full p-2 flex items-center gap-2.5 rounded-lg hover:bg-app-sidebar text-left transition-colors group"
            >
              <div className="w-7 h-7 rounded-md bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Download className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-xs text-app-primary flex items-center justify-between">
                  <span>Export as HTML (.html)</span>
                  <span className="text-[10px] font-mono text-app-muted">.html</span>
                </div>
                <p className="text-[10px] text-app-muted truncate">
                  Standalone styled offline web page
                </p>
              </div>
            </button>

            {/* Section 2: Workspace Backup */}
            <div className="border-t border-app-border/40 mt-1 pt-1.5">
              <div className="px-2 py-0.5 text-[10px] uppercase font-mono font-bold text-app-muted tracking-wider">
                Full Workspace
              </div>
              <button
                onClick={handleOpenWorkspaceBackup}
                className="w-full p-2 flex items-center gap-2.5 rounded-lg hover:bg-app-sidebar text-left transition-colors group"
              >
                <div className="w-7 h-7 rounded-md bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <FolderArchive className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-xs text-app-primary flex items-center justify-between">
                    <span>Backup Entire Workspace</span>
                    <span className="text-[10px] font-mono text-amber-400">.ZIP</span>
                  </div>
                  <p className="text-[10px] text-app-muted truncate">
                    Export all notes, sheets, boards & schemas
                  </p>
                </div>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
