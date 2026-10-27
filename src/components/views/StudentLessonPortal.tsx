'use client';

import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  GraduationCap,
  Copy,
  Check,
  Printer,
  Download,
  BookOpen,
  ArrowLeft,
  Share2,
  ExternalLink,
  Code2,
} from 'lucide-react';
import { db } from '@/db/workspace-db';
import { useYjsBlocks } from '@/components/editor/YjsManager';
import { BlockItem } from '@/components/editor/BlockItem';
import { WorkspacePage } from '@/types';
import {
  getDocumentBlocks,
  convertBlocksToMarkdown,
  downloadFile,
} from '@/utils/documentExport';

interface StudentLessonPortalProps {
  pageId: string;
  onExitStudentView?: () => void;
}

export const StudentLessonPortal: React.FC<StudentLessonPortalProps> = ({
  pageId,
  onExitStudentView,
}) => {
  const page = useLiveQuery(() => db.pages.get(pageId), [pageId]);
  const { blocks, updateBlock } = useYjsBlocks(pageId);
  const [copiedLink, setCopiedLink] = useState(false);

  const pageTitle = page?.title || 'Coding Lesson';

  const handleCopyLink = () => {
    const url = `${window.location.origin}/?share=${pageId}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDownloadPdf = () => {
    window.print();
  };

  const handleDownloadMarkdown = () => {
    const rawBlocks = getDocumentBlocks(pageId, page?.content);
    const md = convertBlocksToMarkdown(pageTitle, rawBlocks);
    downloadFile(md, `${pageTitle.toLowerCase().replace(/\s+/g, '-')}.md`, 'text/markdown');
  };

  return (
    <div className="w-screen h-screen flex flex-col bg-app-canvas text-app-primary overflow-hidden select-text">
      {/* Student Portal Header Bar */}
      <header className="h-14 w-full flex items-center justify-between px-4 sm:px-8 bg-app-surface border-b border-app-border shadow-xs shrink-0 select-none z-30 no-print">
        {/* Left: Branding & Lesson Breadcrumb */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div className="min-w-0 hidden sm:block">
              <div className="text-xs font-bold text-app-primary tracking-tight">
                Course Lesson Portal
              </div>
              <div className="text-[10px] text-app-muted truncate">
                Interactive Student View &bull; Read-Only
              </div>
            </div>
          </div>

          <div className="h-4 w-[1px] bg-app-border mx-1 hidden sm:block" />

          <div className="text-xs font-semibold text-app-primary truncate max-w-[220px]">
            {pageTitle}
          </div>
        </div>

        {/* Right: Actions (Copy link, Download PDF, Switch to Editor) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleCopyLink}
            title="Copy Public Lesson Link for Students"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-app-sidebar hover:bg-app-surface border border-app-border text-xs font-medium text-app-primary transition-colors"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-app-muted" />
                <span className="hidden md:inline">Share Link</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownloadPdf}
            title="Print or Save Lesson as PDF"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-app-sidebar hover:bg-app-surface border border-app-border text-xs font-medium text-app-primary transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-app-muted" />
            <span className="hidden sm:inline">Save PDF</span>
          </button>

          <button
            onClick={handleDownloadMarkdown}
            title="Download Lesson as Markdown"
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-app-sidebar hover:bg-app-surface border border-app-border text-xs font-medium text-app-primary transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-app-muted" />
            <span>.MD</span>
          </button>

          {onExitStudentView && (
            <button
              onClick={onExitStudentView}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-app-accent hover:bg-app-accentHover text-white text-xs font-medium shadow-xs transition-colors ml-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exit to Editor</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Student Lesson Reading Canvas */}
      <main className="flex-1 overflow-y-auto px-6 sm:px-12 py-10 transition-all bg-app-canvas">
        <div className="max-w-[800px] mx-auto space-y-6">
          {/* Lesson Header Title (Only if named) */}
          {pageTitle && pageTitle !== 'Untitled' && (
            <div className="border-b border-app-border/40 pb-4">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-app-primary tracking-tight">
                {pageTitle}
              </h1>
            </div>
          )}

          {/* Lesson Blocks Content */}
          <div className="space-y-2 min-h-[300px]">
            {blocks.map((block, index) => (
              <BlockItem
                key={block.id}
                block={block}
                index={index}
                totalBlocks={blocks.length}
                pageId={pageId}
                onUpdate={updateBlock}
                onAddBlockAfter={() => {}}
                onDelete={() => {}}
              />
            ))}
          </div>

          {/* Student Footer Note */}
          <div className="mt-12 pt-6 border-t border-app-border text-center text-xs text-app-muted select-none no-print">
            <p className="flex items-center justify-center gap-1.5">
              <span>Created with NoteWorkspace Local-First Engine</span>
              <span>&bull;</span>
              <button
                onClick={handleDownloadPdf}
                className="text-app-accent hover:underline font-medium"
              >
                Download PDF Copy
              </button>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};
