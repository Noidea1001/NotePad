'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import * as Y from 'yjs';
import { IndexeddbPersistence } from 'y-indexeddb';
import { EditorBlock, BlockType } from './types';

interface DocEntry {
  doc: Y.Doc;
  provider: IndexeddbPersistence;
  synced: boolean;
}

const docRegistry = new Map<string, DocEntry>();

export function getOrCreateYDoc(pageId: string): DocEntry {
  if (docRegistry.has(pageId)) {
    return docRegistry.get(pageId)!;
  }

  const doc = new Y.Doc();
  const provider = new IndexeddbPersistence(`noteworkspace-ydoc-${pageId}`, doc);

  const entry: DocEntry = {
    doc,
    provider,
    synced: false,
  };

  provider.on('synced', () => {
    entry.synced = true;
  });

  docRegistry.set(pageId, entry);
  return entry;
}

export function getDefaultBlocksForPage(pageId: string): EditorBlock[] {
  // Only the pre-seeded offline architecture spec page gets the sample developer blocks
  if (pageId === 'doc-offline-spec') {
    return [
      {
        id: 'b-title',
        type: 'h1',
        content: 'Local-First Architecture Spec',
      },
      {
        id: 'b-intro',
        type: 'paragraph',
        content:
          'This workspace note is powered by Yjs CRDT and persistent local IndexedDB. Type "/" anywhere to insert live developer blocks like Mermaid diagrams, ERD schemas, or API clients.',
      },
      {
        id: 'b-variables',
        type: 'paragraph',
        content:
          'Live Two-Way Sheet Binding: Task 1 Status is {{B1}}, Estimate is {{F1}} pts, Budget is ${{G1}}. Edit them in the Sheet Grid or Kanban Board and watch this text update in real time!',
      },
      {
        id: 'b-mermaid',
        type: 'mermaid',
        content: '',
        data: {
          zoom: 1,
          code: `graph TD
  User((Client Browser)) -->|Local Keystroke| YJS[Yjs CRDT Engine]
  YJS -->|< 2ms Latency| IDB[(Browser IndexedDB)]
  YJS -.->|Optional WebRTC / WSS| Cloud[(Encrypted Vault)]
  style YJS fill:#3b82f6,stroke:#1d4ed8,color:#fff
  style IDB fill:#10b981,stroke:#047857,color:#fff`,
        },
      },
      {
        id: 'b-api',
        type: 'api',
        content: '',
        data: {
          method: 'GET',
          url: 'https://jsonplaceholder.typicode.com/todos/1',
          headers: [
            { id: 'h-1', key: 'Content-Type', value: 'application/json', enabled: true },
            { id: 'h-2', key: 'Accept', value: 'application/json', enabled: true },
          ],
          body: '{\n  "client": "NoteWorkspace",\n  "status": "ready"\n}',
          activeTab: 'params',
        },
      },
      {
        id: 'b-env',
        type: 'env',
        content: '',
        data: {
          globalRevealed: false,
          secrets: [
            { id: 'sec-1', key: 'DATABASE_URL', value: 'postgresql://postgres:pass@localhost:5432/noteworkspace_dev' },
            { id: 'sec-2', key: 'NEXTAUTH_SECRET', value: 'super-secret-production-entropy-key-256' },
            { id: 'sec-3', key: 'OPENAI_API_KEY', value: 'sk-proj-78f9210ab781c002f89a912e7834bc' },
          ],
        },
      },
      {
        id: 'b-code-tabs',
        type: 'code-tabs',
        content: '',
        data: {
          activeTabId: 'tab-1',
          tabs: [
            {
              id: 'tab-1',
              filename: 'schema.prisma',
              language: 'prisma',
              code: `datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Page {
  id        String   @id @default(uuid())
  title     String
  content   Json?
  updatedAt DateTime @updatedAt
}`,
            },
            {
              id: 'tab-2',
              filename: 'StorageEngine.ts',
              language: 'typescript',
              code: `import * as Y from 'yjs';
import { IndexeddbPersistence } from 'y-indexeddb';

export function createLocalStore(pageId: string) {
  const doc = new Y.Doc();
  const idb = new IndexeddbPersistence(pageId, doc);
  return { doc, idb };
}`,
            },
          ],
        },
      },
    ];
  }

  // All other pages (including any newly created page) start with a clean blank writing line
  return [
    {
      id: `b-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: 'paragraph',
      content: '',
    },
  ];
}

export function useYjsBlocks(pageId: string) {
  const [blocks, setBlocksState] = useState<EditorBlock[]>([]);
  const [isSynced, setIsSynced] = useState<boolean>(false);
  const entryRef = useRef<DocEntry | null>(null);

  useEffect(() => {
    const entry = getOrCreateYDoc(pageId);
    entryRef.current = entry;
    const { doc, provider } = entry;
    const yBlocksArray = doc.getArray<EditorBlock>('blocks');

    const updateFromYjs = () => {
      const current = yBlocksArray.toArray();
      if (current.length === 0 && entry.synced) {
        // Seed initial blocks if empty
        const initial = getDefaultBlocksForPage(pageId);
        doc.transact(() => {
          yBlocksArray.insert(0, initial);
        });
        setBlocksState(initial);
      } else if (
        pageId !== 'doc-offline-spec' &&
        current.length >= 4 &&
        current[0]?.id === 'b-title' &&
        current[0]?.content === 'Local-First Architecture Spec'
      ) {
        // Automatically cleanup erroneously seeded developer demo template on user's new pages
        const cleanInitial: EditorBlock[] = [
          {
            id: `b-${Date.now()}`,
            type: 'paragraph',
            content: '',
          },
        ];
        doc.transact(() => {
          yBlocksArray.delete(0, current.length);
          yBlocksArray.insert(0, cleanInitial);
        });
        setBlocksState(cleanInitial);
      } else {
        setBlocksState([...current]);
      }
    };

    const handleSynced = () => {
      setIsSynced(true);
      updateFromYjs();
    };

    if (entry.synced) {
      setIsSynced(true);
      updateFromYjs();
    } else {
      provider.on('synced', handleSynced);
    }

    yBlocksArray.observe(updateFromYjs);

    return () => {
      provider.off('synced', handleSynced);
      yBlocksArray.unobserve(updateFromYjs);
    };
  }, [pageId]);

  const updateBlock = useCallback((id: string, updates: Partial<EditorBlock>) => {
    if (!entryRef.current) return;
    const { doc } = entryRef.current;
    const yBlocksArray = doc.getArray<EditorBlock>('blocks');

    doc.transact(() => {
      const items = yBlocksArray.toArray();
      const index = items.findIndex((b) => b.id === id);
      if (index !== -1) {
        const existing = items[index];
        const updated: EditorBlock = {
          ...existing,
          ...updates,
          data: updates.data ? { ...existing.data, ...updates.data } : existing.data,
        };
        yBlocksArray.delete(index, 1);
        yBlocksArray.insert(index, [updated]);
      }
    });
  }, []);

  const addBlock = useCallback(
    (type: BlockType, afterId?: string, initialData?: Record<string, any>) => {
      if (!entryRef.current) return;
      const { doc } = entryRef.current;
      const yBlocksArray = doc.getArray<EditorBlock>('blocks');

      const newBlock: EditorBlock = {
        id: `block-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        type,
        content: '',
        data: initialData || {},
      };

      doc.transact(() => {
        const items = yBlocksArray.toArray();
        if (!afterId) {
          yBlocksArray.push([newBlock]);
        } else {
          const index = items.findIndex((b) => b.id === afterId);
          if (index !== -1) {
            yBlocksArray.insert(index + 1, [newBlock]);
          } else {
            yBlocksArray.push([newBlock]);
          }
        }
      });
      return newBlock.id;
    },
    []
  );

  const deleteBlock = useCallback((id: string) => {
    if (!entryRef.current) return;
    const { doc } = entryRef.current;
    const yBlocksArray = doc.getArray<EditorBlock>('blocks');

    doc.transact(() => {
      const items = yBlocksArray.toArray();
      // Keep at least one block
      if (items.length <= 1) return;
      const index = items.findIndex((b) => b.id === id);
      if (index !== -1) {
        yBlocksArray.delete(index, 1);
      }
    });
  }, []);

  const duplicateBlock = useCallback((id: string) => {
    if (!entryRef.current) return;
    const { doc } = entryRef.current;
    const yBlocksArray = doc.getArray<EditorBlock>('blocks');

    doc.transact(() => {
      const items = yBlocksArray.toArray();
      const index = items.findIndex((b) => b.id === id);
      if (index !== -1) {
        const source = items[index];
        const clone: EditorBlock = {
          id: `block-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          type: source.type,
          content: source.content,
          checked: source.checked,
          data: source.data ? JSON.parse(JSON.stringify(source.data)) : undefined,
        };
        yBlocksArray.insert(index + 1, [clone]);
      }
    });
  }, []);

  const moveBlock = useCallback((fromIndex: number, toIndex: number) => {
    if (!entryRef.current) return;
    const { doc } = entryRef.current;
    const yBlocksArray = doc.getArray<EditorBlock>('blocks');

    doc.transact(() => {
      const items = yBlocksArray.toArray();
      if (
        fromIndex < 0 ||
        fromIndex >= items.length ||
        toIndex < 0 ||
        toIndex >= items.length ||
        fromIndex === toIndex
      ) {
        return;
      }
      const [item] = items.splice(fromIndex, 1);
      items.splice(toIndex, 0, item);

      yBlocksArray.delete(0, yBlocksArray.length);
      yBlocksArray.insert(0, items);
    });
  }, []);

  return {
    blocks,
    isSynced,
    updateBlock,
    addBlock,
    duplicateBlock,
    deleteBlock,
    moveBlock,
  };
}
