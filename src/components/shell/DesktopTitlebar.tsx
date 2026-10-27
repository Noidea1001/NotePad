'use client';

import React, { useEffect } from 'react';
import { Minus, Square, X, Laptop } from 'lucide-react';
import { useWorkspaceStore } from '@/stores/useWorkspaceStore';

export const DesktopTitlebar: React.FC = () => {
  const { isDesktopApp, setIsDesktopApp } = useWorkspaceStore();

  useEffect(() => {
    // Check if running inside Tauri desktop environment
    if (typeof window !== 'undefined') {
      const isTauri = Boolean(
        (window as unknown as { __TAURI__?: unknown }).__TAURI__ ||
        (window as unknown as { __TAURI_METADATA__?: unknown }).__TAURI_METADATA__
      );
      if (isTauri) {
        setIsDesktopApp(true);
      }
    }
  }, [setIsDesktopApp]);

  // Window control mock handlers for Tauri / Desktop
  const handleMinimize = () => {
    try {
      const tauriWindow = (window as unknown as { __TAURI__?: { window?: { getCurrentWindow?: () => { minimize: () => void } } } }).__TAURI__?.window;
      tauriWindow?.getCurrentWindow?.()?.minimize();
    } catch {
      console.log('Window minimize triggered');
    }
  };

  const handleMaximize = () => {
    try {
      const tauriWindow = (window as unknown as { __TAURI__?: { window?: { getCurrentWindow?: () => { toggleMaximize: () => void } } } }).__TAURI__?.window;
      tauriWindow?.getCurrentWindow?.()?.toggleMaximize();
    } catch {
      console.log('Window toggle maximize triggered');
    }
  };

  const handleClose = () => {
    try {
      const tauriWindow = (window as unknown as { __TAURI__?: { window?: { getCurrentWindow?: () => { close: () => void } } } }).__TAURI__?.window;
      tauriWindow?.getCurrentWindow?.()?.close();
    } catch {
      console.log('Window close triggered');
    }
  };

  return (
    <header
      className={`h-8 w-full flex items-center justify-between px-3 select-none text-xs border-b border-app-border bg-app-bg tauri-drag-region transition-colors duration-200 ${
        isDesktopApp ? 'flex' : 'hidden'
      }`}
    >
      {/* Left: App Branding & Status */}
      <div className="flex items-center gap-2 tauri-no-drag">
        <div className="flex items-center gap-1.5 font-semibold text-app-primary">
          <span className="w-2.5 h-2.5 rounded-full bg-app-accent animate-pulse" />
          <span className="tracking-tight text-xs">NoteWorkspace</span>
        </div>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-app-sidebar text-app-muted border border-app-border">
          v1.0.0 (Local-First)
        </span>
      </div>

      {/* Center: Window Drag Title */}
      <div className="text-center text-app-muted font-medium text-[11px] truncate px-4 pointer-events-none">
        Developer Workspace &mdash; Zero Network Latency
      </div>

      {/* Right: Desktop Controls & Preview Toggle */}
      <div className="flex items-center gap-1 tauri-no-drag">
        {/* Toggle desktop frame simulation for testing in browser */}
        <button
          onClick={() => setIsDesktopApp(!isDesktopApp)}
          title={isDesktopApp ? "Desktop Titlebar: Native Tauri Active" : "Click to simulate Tauri Native Window Bar"}
          className={`px-1.5 py-0.5 text-[10px] rounded flex items-center gap-1 transition-colors ${
            isDesktopApp 
              ? 'bg-app-accent/20 text-app-accent border border-app-accent/30' 
              : 'text-app-muted hover:text-app-primary hover:bg-app-sidebar'
          }`}
        >
          <Laptop className="w-3 h-3" />
          <span>{isDesktopApp ? 'Tauri Native' : 'Desktop Bar'}</span>
        </button>

        {isDesktopApp && (
          <div className="flex items-center ml-2 border-l border-app-border pl-1">
            <button
              onClick={handleMinimize}
              className="w-7 h-6 flex items-center justify-center text-app-muted hover:text-app-primary hover:bg-app-sidebar rounded transition-colors"
              title="Minimize Window"
            >
              <Minus className="w-3 h-3" />
            </button>
            <button
              onClick={handleMaximize}
              className="w-7 h-6 flex items-center justify-center text-app-muted hover:text-app-primary hover:bg-app-sidebar rounded transition-colors"
              title="Maximize Window"
            >
              <Square className="w-2.5 h-2.5" />
            </button>
            <button
              onClick={handleClose}
              className="w-7 h-6 flex items-center justify-center text-app-muted hover:text-white hover:bg-red-500 rounded transition-colors"
              title="Close App"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
