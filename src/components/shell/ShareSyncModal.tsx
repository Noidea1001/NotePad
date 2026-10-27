'use client';

import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  X,
  Share2,
  Copy,
  Check,
  GraduationCap,
  ExternalLink,
  Code2,
  Printer,
  Download,
  Upload,
  ShieldCheck,
  Globe,
  Eye,
  Sparkles,
} from 'lucide-react';
import { db } from '@/db/workspace-db';
import { useWorkspaceStore } from '@/stores/useWorkspaceStore';

export const ShareSyncModal: React.FC = () => {
  const {
    isShareModalOpen,
    setShareModalOpen,
    activePageId,
    setActivePageId,
    storageStatus,
  } = useWorkspaceStore();

  const [copiedLink, setCopiedLink] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [activeTab, setActiveTab] = useState<'students' | 'backup'>('students');

  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const activePage = useLiveQuery(
    () => (activePageId ? db.pages.get(activePageId) : undefined),
    [activePageId]
  );

  useEffect(() => {
    if (typeof window !== 'undefined' && activePageId) {
      setShareUrl(`${window.location.origin}/?share=${activePageId}`);
    }
  }, [activePageId]);

  if (!isShareModalOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleOpenStudentPreview = () => {
    setShareModalOpen(false);
    window.location.href = shareUrl;
  };

  const handleExportWorkspace = async () => {
    setIsExporting(true);
    try {
      const pages = await db.pages.toArray();
      const sheetRows = await db.sheetRows.toArray();
      const kanbanCards = await db.kanbanCards.toArray();
      const erdEntities = await db.erdEntities.toArray();

      const dump = {
        version: 1,
        exportedAt: new Date().toISOString(),
        data: { pages, sheetRows, kanbanCards, erdEntities },
      };

      const blob = new Blob([JSON.stringify(dump, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `workspace-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportWorkspace = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportStatus('Reading backup file...');
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      if (parsed.data && parsed.data.pages) {
        await db.transaction('rw', [db.pages, db.sheetRows, db.kanbanCards, db.erdEntities], async () => {
          await db.pages.clear();
          await db.sheetRows.clear();
          await db.kanbanCards.clear();
          await db.erdEntities.clear();

          if (parsed.data.pages?.length) await db.pages.bulkAdd(parsed.data.pages);
          if (parsed.data.sheetRows?.length) await db.sheetRows.bulkAdd(parsed.data.sheetRows);
          if (parsed.data.kanbanCards?.length) await db.kanbanCards.bulkAdd(parsed.data.kanbanCards);
          if (parsed.data.erdEntities?.length) await db.erdEntities.bulkAdd(parsed.data.erdEntities);
        });

        setImportStatus('Import successful! Reloading...');
        setTimeout(() => {
          setImportStatus(null);
          setShareModalOpen(false);
          window.location.reload();
        }, 800);
      } else {
        setImportStatus('Invalid backup schema file format.');
      }
    } catch (err) {
      setImportStatus('Failed to import JSON file.');
      console.error(err);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div
      onClick={() => setShareModalOpen(false)}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-2xl bg-app-surface border border-app-border shadow-2xl overflow-hidden flex flex-col text-app-primary animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-app-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-app-primary">
                Share Lesson & Workspace
              </h2>
              <p className="text-xs text-app-muted truncate max-w-[260px]">
                {activePage?.title || 'Active Document'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShareModalOpen(false)}
            className="p-1 rounded-md text-app-muted hover:text-app-primary hover:bg-app-sidebar transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center px-5 border-b border-app-border bg-app-sidebar/40 text-xs">
          <button
            onClick={() => setActiveTab('students')}
            className={`py-2.5 px-3 font-medium border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'students'
                ? 'border-app-accent text-app-primary font-semibold'
                : 'border-transparent text-app-muted hover:text-app-primary'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
            <span>Share to Students (Public Link)</span>
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`py-2.5 px-3 font-medium border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'backup'
                ? 'border-app-accent text-app-primary font-semibold'
                : 'border-transparent text-app-muted hover:text-app-primary'
            }`}
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Vault Backup / Restore</span>
          </button>
        </div>

        {/* Tab 1: Share to Students */}
        {activeTab === 'students' && (
          <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Notion-style Share to Web toggle banner */}
            <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-500/15 text-blue-400 shrink-0">
                <Globe className="w-4 h-4" />
              </div>
              <div className="text-xs space-y-1">
                <p className="font-semibold text-app-primary">
                  Published to Web &bull; Ready for Students
                </p>
                <p className="text-app-secondary leading-relaxed text-[11px]">
                  Anyone with this link can open and read the lesson, copy code snippets, and review interactive exercise solutions without needing an account.
                </p>
              </div>
            </div>

            {/* Public Link Box */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-app-muted mb-1.5">
                Shareable Student Web Link
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 px-3 py-2 rounded-lg bg-app-sidebar border border-app-border text-xs text-app-primary font-mono outline-none truncate"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2 rounded-lg bg-app-accent hover:bg-app-accentHover text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 shadow-sm"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Link Copied!' : 'Copy Link'}</span>
                </button>
              </div>
            </div>

            {/* Preview Button */}
            <div className="pt-1">
              <button
                onClick={handleOpenStudentPreview}
                className="w-full py-2 px-3 rounded-xl border border-app-border hover:bg-app-sidebar flex items-center justify-center gap-2 text-xs font-medium text-app-primary transition-colors group"
              >
                <Eye className="w-3.5 h-3.5 text-app-muted group-hover:text-app-primary" />
                <span>Open Student View Preview</span>
                <ExternalLink className="w-3 h-3 text-app-muted opacity-60" />
              </button>
            </div>

            {/* Student Feature Highlights */}
            <div className="p-3 rounded-xl bg-app-sidebar/40 border border-app-border text-[11px] space-y-2">
              <div className="font-semibold text-app-primary text-xs flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>What Students Can Do:</span>
              </div>
              <ul className="space-y-1 text-app-secondary pl-4 list-disc">
                <li>Read formatted lessons & technical specs on mobile or desktop</li>
                <li>1-click <b>Copy Code</b> & run JavaScript simulations directly</li>
                <li>Expand interactive <b>Toggle</b> accordions to reveal homework solutions</li>
                <li>Download or Print the lesson as <b>PDF (.pdf)</b> or <b>Markdown (.md)</b></li>
              </ul>
            </div>
          </div>
        )}

        {/* Tab 2: Vault Backup / Restore */}
        {activeTab === 'backup' && (
          <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="p-3.5 rounded-xl bg-app-sidebar border border-app-border flex items-start gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-xs space-y-1">
                <p className="font-semibold text-app-primary">100% Local-First Storage</p>
                <p className="text-app-secondary leading-relaxed text-[11px]">
                  All notes, databases, and boards are persistently saved in your browser IndexedDB. You can export a full JSON backup to move between computers.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleExportWorkspace}
                disabled={isExporting}
                className="p-3.5 rounded-xl border border-app-border hover:bg-app-sidebar flex flex-col items-center justify-center gap-2 text-xs font-medium text-app-primary transition-colors text-center"
              >
                <Download className="w-5 h-5 text-emerald-400" />
                <span>{isExporting ? 'Exporting...' : 'Export JSON Backup'}</span>
              </button>

              <label className="p-3.5 rounded-xl border border-app-border hover:bg-app-sidebar flex flex-col items-center justify-center gap-2 text-xs font-medium text-app-primary transition-colors cursor-pointer text-center">
                <Upload className="w-5 h-5 text-blue-400" />
                <span>{isImporting ? 'Importing...' : 'Restore JSON Backup'}</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportWorkspace}
                  className="hidden"
                />
              </label>
            </div>

            {importStatus && (
              <p className="mt-2 text-xs text-center text-app-accent font-medium">{importStatus}</p>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-app-border bg-app-sidebar/40 flex items-center justify-between text-xs text-app-muted">
          <span>Local IndexedDB: {storageStatus.itemCount} items saved</span>
          <button
            onClick={() => setShareModalOpen(false)}
            className="px-4 py-1.5 rounded-lg bg-app-sidebar hover:bg-app-sidebarHover text-app-primary border border-app-border font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
