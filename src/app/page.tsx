'use client';

import React, { useEffect, useState } from 'react';
import { DesktopTitlebar } from '@/components/shell/DesktopTitlebar';
import { Sidebar } from '@/components/shell/Sidebar';
import { TopNavbar } from '@/components/shell/TopNavbar';
import { MainCanvas } from '@/components/MainCanvas';
import { CommandPalette } from '@/components/shell/CommandPalette';
import { ThemeSelectorModal } from '@/components/shell/ThemeSelectorModal';
import { ShareSyncModal } from '@/components/shell/ShareSyncModal';
import { CreatePageModal } from '@/components/shell/CreatePageModal';
import { QuickCaptureModal } from '@/components/shell/QuickCaptureModal';
import { CloudAuthModal } from '@/components/sync/CloudAuthModal';
import { CinemaModeBanner } from '@/components/sync/CinemaModeBanner';
import { LocalBackupExportModal } from '@/components/sync/LocalBackupExportModal';
import { StudentLessonPortal } from '@/components/views/StudentLessonPortal';
import { seedInitialWorkspace, getStorageStats } from '@/db/workspace-db';
import { useWorkspaceStore } from '@/stores/useWorkspaceStore';
import { useThemeStore } from '@/stores/useThemeStore';
import { ThemeId, FontId } from '@/types';

export default function WorkspaceAppPage() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [studentShareId, setStudentShareId] = useState<string | null>(null);
  const {
    toggleSidebar,
    toggleWidthPreference,
    setStorageStatus,
    isBackupModalOpen,
    setBackupModalOpen,
  } = useWorkspaceStore();
  const { setTheme, setFont } = useThemeStore();

  useEffect(() => {
    // Check if opened via share link (e.g. ?share=page-12345)
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const shareParam = params.get('share');
      if (shareParam) {
        setStudentShareId(shareParam);
      }
    }
  }, []);

  useEffect(() => {
    // 1. Restore persisted theme & font
    const savedTheme = localStorage.getItem('dev-workspace-theme') as ThemeId;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }

    const savedFont = localStorage.getItem('dev-workspace-font') as FontId;
    if (savedFont) {
      setFont(savedFont);
      document.documentElement.setAttribute('data-font', savedFont);
    }

    // 2. Initialize and seed local Dexie database
    const initDb = async () => {
      try {
        await seedInitialWorkspace();
        const stats = await getStorageStats();
        setStorageStatus(stats);
      } catch (err) {
        console.error('Dexie initialization error:', err);
      } finally {
        setIsInitialized(true);
      }
    };

    initDb();

    // 3. Register global utility shortcuts (Alt+B for sidebar, Alt+W for width)
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleSidebar();
      }
      if (e.altKey && e.key.toLowerCase() === 'w') {
        e.preventDefault();
        toggleWidthPreference();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [setTheme, setFont, toggleSidebar, toggleWidthPreference, setStorageStatus]);

  if (!isInitialized) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-app-bg text-app-muted">
        <div className="flex items-center gap-2 mb-2 font-semibold text-app-primary">
          <span className="w-3 h-3 rounded-full bg-app-accent animate-ping" />
          <span>Starting Local-First Engine...</span>
        </div>
        <span className="text-xs text-app-muted">Opening Dexie.js IndexedDB tables</span>
      </div>
    );
  }

  // Student Reading Mode (Activated via ?share=<pageId> or direct public link)
  if (studentShareId) {
    return (
      <StudentLessonPortal
        pageId={studentShareId}
        onExitStudentView={() => {
          window.history.replaceState({}, '', window.location.pathname);
          setStudentShareId(null);
        }}
      />
    );
  }

  return (
    <div className="w-screen h-screen flex flex-col bg-app-bg text-app-primary overflow-hidden">
      {/* Zone 1: Desktop Native Titlebar (Tauri / Window header) */}
      <DesktopTitlebar />

      {/* Real-Time "Follow Teammate" Cinema Mode Banner */}
      <CinemaModeBanner />

      {/* Main 3-Zone Content Shell */}
      <div className="flex-1 flex w-full h-full min-h-0 overflow-hidden">
        {/* Zone 2: Left Collapsible Sidebar */}
        <Sidebar />

        {/* Zones 3 & 4: Top Navbar & Main Canvas */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          {/* Zone 3: Top Collaboration Navbar */}
          <TopNavbar />

          {/* Zone 4: Main Workspace Canvas */}
          <MainCanvas />
        </div>
      </div>

      {/* Floating Interactive Modals & Overlays */}
      <CommandPalette />
      <ThemeSelectorModal />
      <ShareSyncModal />
      <CreatePageModal />
      <QuickCaptureModal />
      <CloudAuthModal />
      <LocalBackupExportModal
        isOpen={isBackupModalOpen}
        onClose={() => setBackupModalOpen(false)}
      />
    </div>
  );
}
