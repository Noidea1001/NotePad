'use client';

import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { getOrCreateYDoc } from '@/components/editor/YjsManager';
import { useWorkspaceStore } from '@/stores/useWorkspaceStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { Collaborator, ViewType } from '@/types';

export interface UserAwarenessState {
  user: {
    id: string;
    name: string;
    initials: string;
    color: string;
    activeView: ViewType;
    cursor?: { x: number; y: number; blockId?: string };
    lastActive: number;
  };
}

interface CloudSyncConnection {
  wsProvider: WebsocketProvider | null;
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  room: string;
}

const syncConnections = new Map<string, CloudSyncConnection>();

// Cinema Mode State (Following Teammate)
let activeFollowingId: string | null = null;
let followingCleanup: (() => void) | null = null;

export class DynamicSyncManager {
  /**
   * Connect a Y.Doc dynamically to a real-time Cloud WebSocket server (e.g. y-websocket / Hocuspocus).
   * Local edits in IndexedDB are preserved and merged seamlessly.
   */
  static connectCloudSync(
    pageId: string,
    wsServerUrl: string = 'wss://demos.yjs.dev/ws'
  ): WebsocketProvider {
    const existing = syncConnections.get(pageId);
    if (existing?.wsProvider && existing.status === 'connected') {
      return existing.wsProvider;
    }

    const { doc } = getOrCreateYDoc(pageId);
    const roomName = `noteworkspace-room-${pageId}`;

    useWorkspaceStore.getState().setSyncStatus('syncing');

    const wsProvider = new WebsocketProvider(wsServerUrl, roomName, doc, {
      connect: true,
      params: {
        auth: useAuthStore.getState().token || 'anonymous',
      },
    });

    const conn: CloudSyncConnection = {
      wsProvider,
      status: 'connecting',
      room: roomName,
    };
    syncConnections.set(pageId, conn);

    // Setup connection listeners
    wsProvider.on('status', (event: { status: string }) => {
      if (event.status === 'connected') {
        conn.status = 'connected';
        useWorkspaceStore.getState().setSyncStatus('synced');
      } else {
        conn.status = 'connecting';
        useWorkspaceStore.getState().setSyncStatus('syncing');
      }
    });

    wsProvider.on('connection-error', () => {
      conn.status = 'error';
      useWorkspaceStore.getState().setSyncStatus('local');
    });

    // Setup Awareness presence broadcasting
    const awareness = wsProvider.awareness;
    const currentUser = useAuthStore.getState().user || {
      id: 'local-dev-1',
      name: 'Developer (You)',
      color: '#3b82f6',
    };

    awareness.setLocalStateField('user', {
      id: currentUser.id,
      name: currentUser.name,
      initials: currentUser.name.slice(0, 2).toUpperCase(),
      color: currentUser.color || '#3b82f6',
      activeView: useWorkspaceStore.getState().activeView,
      lastActive: Date.now(),
    });

    // Listen for remote peers presence changes
    awareness.on('change', () => {
      const states = awareness.getStates();
      const collaborators: Collaborator[] = [];

      states.forEach((state: any, clientID: number) => {
        if (state.user) {
          collaborators.push({
            id: String(clientID),
            name: state.user.name,
            initials: state.user.initials || state.user.name.slice(0, 2).toUpperCase(),
            color: state.user.color || '#10b981',
            status: 'online',
            currentView: state.user.activeView || 'doc',
          });

          // Check if this peer is the one we are following in Cinema Mode
          if (activeFollowingId && (state.user.id === activeFollowingId || String(clientID) === activeFollowingId)) {
            if (state.user.activeView && state.user.activeView !== useWorkspaceStore.getState().activeView) {
              useWorkspaceStore.getState().setActiveView(state.user.activeView);
            }
          }
        }
      });

      if (collaborators.length > 0) {
        useWorkspaceStore.setState({ collaborators });
      }
    });

    return wsProvider;
  }

  /**
   * Disconnect from cloud websocket sync and return safely to 100% local-first IndexedDB mode.
   */
  static disconnectCloudSync(pageId: string) {
    const conn = syncConnections.get(pageId);
    if (conn?.wsProvider) {
      conn.wsProvider.disconnect();
      conn.wsProvider.destroy();
      syncConnections.delete(pageId);
      useWorkspaceStore.getState().setSyncStatus('local');
    }
  }

  /**
   * Update current user cursor / active view inside Awareness
   */
  static updateLocalAwareness(
    pageId: string,
    view: ViewType,
    cursor?: { x: number; y: number; blockId?: string }
  ) {
    const conn = syncConnections.get(pageId);
    if (!conn?.wsProvider) return;

    const awareness = conn.wsProvider.awareness;
    const current = awareness.getLocalState() || {};
    awareness.setLocalState({
      ...current,
      user: {
        ...(current.user || {}),
        activeView: view,
        cursor,
        lastActive: Date.now(),
      },
    });
  }

  /**
   * Cinema Mode: Follow a teammate's view in real time
   */
  static startFollowingTeammate(collaboratorId: string, name: string) {
    activeFollowingId = collaboratorId;

    // Dispatch global event for CinemaModeBanner
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('cinema-mode-change', {
          detail: { isFollowing: true, collaboratorId, name },
        })
      );
    }
  }

  static stopFollowingTeammate() {
    activeFollowingId = null;
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('cinema-mode-change', {
          detail: { isFollowing: false, collaboratorId: null, name: '' },
        })
      );
    }
  }
}
