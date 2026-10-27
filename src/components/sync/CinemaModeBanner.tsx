'use client';

import React, { useState, useEffect } from 'react';
import { Eye, X, Radio } from 'lucide-react';
import { DynamicSyncManager } from '@/sync/SyncProvider';

export const CinemaModeBanner: React.FC = () => {
  const [followingState, setFollowingState] = useState<{
    isFollowing: boolean;
    name: string;
    collaboratorId: string | null;
  }>({
    isFollowing: false,
    name: '',
    collaboratorId: null,
  });

  useEffect(() => {
    const handleCinemaChange = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setFollowingState(detail);
    };

    window.addEventListener('cinema-mode-change', handleCinemaChange);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && followingState.isFollowing) {
        DynamicSyncManager.stopFollowingTeammate();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('cinema-mode-change', handleCinemaChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [followingState.isFollowing]);

  if (!followingState.isFollowing) return null;

  return (
    <div className="w-full bg-app-surface border-b border-app-border px-4 py-1.5 flex items-center justify-between text-xs text-app-primary select-none z-30">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />

        <span className="font-semibold flex items-center gap-1.5 text-app-primary">
          <Eye className="w-3.5 h-3.5 text-app-muted" />
          <span>Following:</span>
        </span>

        <span className="text-app-secondary">
          <strong className="text-app-primary font-semibold">{followingState.name}</strong> &bull; Screen & view synced in real time
        </span>
      </div>

      <div className="flex items-center gap-2">
        <kbd className="hidden sm:inline px-1.5 py-0.5 rounded bg-app-sidebar text-[10px] text-app-muted border border-app-border font-mono">
          ESC to exit
        </kbd>

        <button
          onClick={() => DynamicSyncManager.stopFollowingTeammate()}
          className="flex items-center gap-1 px-2.5 py-0.5 rounded bg-app-sidebar hover:bg-app-sidebarHover text-app-primary text-[11px] font-medium transition-colors border border-app-border"
        >
          <X className="w-3 h-3" />
          <span>Stop Following</span>
        </button>
      </div>
    </div>
  );
};
