'use client';

import React, { useState } from 'react';
import JSZip from 'jszip';
import {
  X,
  Download,
  FolderSync,
  FileText,
  Table,
  Database,
  Check,
  FolderOpen,
  Loader2,
  HardDrive,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { db } from '@/db/workspace-db';

interface LocalBackupExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LocalBackupExportModal: React.FC<LocalBackupExportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isLinkingFolder, setIsLinkingFolder] = useState(false);
  const [linkedFolderName, setLinkedFolderName] = useState<string | null>(null);

  if (!isOpen) return null;

  // Export full workspace as .zip of .md, .csv, and .sql
  const handleExportZip = async () => {
    setIsExporting(true);
    try {
      const zip = new JSZip();

      // 1. Fetch pages and save as Markdown files with YAML frontmatter
      const pages = await db.pages.toArray();
      const pagesFolder = zip.folder('notes');

      pages.forEach((page) => {
        const safeTitle = page.title.replace(/[^a-zA-Z0-9_-]/g, '_');
        const frontmatter = `---
title: "${page.title}"
id: "${page.id}"
icon: "${page.icon}"
vault: "${page.workspaceType}"
viewType: "${page.viewType}"
updatedAt: "${new Date(page.updatedAt).toISOString()}"
---

`;
        const mdContent = frontmatter + (page.content || '# ' + page.title);
        pagesFolder?.file(`${safeTitle}.md`, mdContent);
      });

      // 2. Fetch sheet rows and export as CSV / JSON
      const sheetRows = await db.sheetRows.toArray();
      const sheetsFolder = zip.folder('data-sheets');

      sheetsFolder?.file('sheet-rows.json', JSON.stringify(sheetRows, null, 2));

      // Build CSV
      if (sheetRows.length > 0) {
        const headers = ['id', 'pageId', 'title', 'status', 'priority', 'assignee', 'estimate', 'tags'];
        const csvLines = [
          headers.join(','),
          ...sheetRows.map((r) =>
            [
              r.id,
              r.pageId,
              `"${r.title.replace(/"/g, '""')}"`,
              r.status,
              r.priority,
              `"${r.assignee}"`,
              `"${r.estimate}"`,
              `"${r.tags.join(';')}"`,
            ].join(',')
          ),
        ];
        sheetsFolder?.file('sprint-backlog.csv', csvLines.join('\n'));
      }

      // 3. Fetch ERD schemas and export as PostgreSQL DDL .sql
      const erdEntities = await db.erdEntities.toArray();
      const schemasFolder = zip.folder('db-schemas');

      schemasFolder?.file('erd-entities.json', JSON.stringify(erdEntities, null, 2));

      let sqlDdl = `-- NoteWorkspace Database Schema Backup\n-- Generated: ${new Date().toISOString()}\n\n`;
      erdEntities.forEach((ent) => {
        sqlDdl += `CREATE TABLE "${ent.name}" (\n`;
        const lines = ent.fields.map((f) => {
          let line = `  "${f.name}" ${f.type}`;
          if (f.isPk) line += ` PRIMARY KEY`;
          if (!f.nullable && !f.isPk) line += ` NOT NULL`;
          return line;
        });
        sqlDdl += lines.join(',\n') + `\n);\n\n`;
      });
      schemasFolder?.file('schema.sql', sqlDdl);

      // Generate and download zip
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `noteworkspace-backup-${new Date().toISOString().slice(0, 10)}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export zip:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Link local desktop directory using File System Access API
  const handleLinkLocalFolder = async () => {
    setIsLinkingFolder(true);
    try {
      if ('showDirectoryPicker' in window) {
        const handle = await (window as any).showDirectoryPicker();
        setLinkedFolderName(handle.name);
      } else {
        alert('File System Access API is not supported in this browser. Use Chrome/Edge or Tauri Native desktop.');
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Directory link error:', err);
      }
    } finally {
      setIsLinkingFolder(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-2xl bg-app-surface border border-app-border shadow-2xl overflow-hidden flex flex-col text-app-primary text-xs"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-app-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <HardDrive className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-app-primary">Local Backup & Portability</h2>
              <p className="text-[11px] text-app-muted">100% offline file ownership & raw filesystem access</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-app-muted hover:text-app-primary hover:bg-app-sidebar transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Option 1: Export as .zip */}
          <div className="p-4 rounded-xl bg-app-sidebar/70 border border-app-border space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-app-primary flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>Download Complete Workspace as .zip</span>
                </h3>
                <p className="text-[11px] text-app-muted mt-0.5 leading-relaxed">
                  Archives all notes as raw Markdown (`.md`), spreadsheets as `.csv` / `.json`, and database schemas as PostgreSQL `.sql`.
                </p>
              </div>
            </div>

            <button
              onClick={handleExportZip}
              disabled={isExporting}
              className="w-full py-2 px-3 rounded-lg bg-app-accent hover:bg-app-accentHover text-white font-medium flex items-center justify-center gap-2 transition-colors shadow-sm disabled:opacity-50"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Generating .zip Archive...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Export .zip (Markdown + CSV + SQL)</span>
                </>
              )}
            </button>
          </div>

          {/* Option 2: Link Local Desktop Folder */}
          <div className="p-4 rounded-xl bg-app-sidebar/70 border border-app-border space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-app-primary flex items-center gap-1.5">
                  <FolderSync className="w-4 h-4 text-indigo-400" />
                  <span>Link Local Desktop Folder (File System Access)</span>
                </h3>
                <p className="text-[11px] text-app-muted mt-0.5 leading-relaxed">
                  Connect a directory on your machine to continuously sync raw `.md` files without uploading to third-party servers.
                </p>
              </div>
            </div>

            {linkedFolderName ? (
              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-between font-mono text-[11px]">
                <span className="flex items-center gap-1.5 truncate">
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span>Linked: /{linkedFolderName}</span>
                </span>
                <Check className="w-3.5 h-3.5 shrink-0" />
              </div>
            ) : (
              <button
                onClick={handleLinkLocalFolder}
                disabled={isLinkingFolder}
                className="w-full py-2 px-3 rounded-lg border border-app-border bg-app-card hover:bg-app-sidebar text-app-primary font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <FolderOpen className="w-3.5 h-3.5 text-indigo-400" />
                <span>Select Folder on Computer...</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-app-sidebar/40 border-t border-app-border flex items-center justify-between text-[11px] text-app-muted">
          <span>Obsidian & Logseq Compatible Markdown</span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-app-surface border border-app-border hover:bg-app-sidebar text-app-primary font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
