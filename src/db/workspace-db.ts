import Dexie, { type Table } from 'dexie';
import { WorkspacePage, SheetRow, KanbanCard, ErdEntity, StorageStatus } from '@/types';

export class WorkspaceDatabase extends Dexie {
  pages!: Table<WorkspacePage, string>;
  sheetRows!: Table<SheetRow, string>;
  kanbanCards!: Table<KanbanCard, string>;
  erdEntities!: Table<ErdEntity, string>;

  constructor() {
    super('DevWorkspaceLocalDB_v1');
    this.version(1).stores({
      pages: 'id, parentId, workspaceType, viewType, order, updatedAt',
      sheetRows: 'id, pageId, status, priority, updatedAt',
      kanbanCards: 'id, pageId, status, order, priority',
      erdEntities: 'id, pageId, name',
    });
  }
}

export const db = new WorkspaceDatabase();

// Initial seed data to ensure instant out-of-the-box productivity
export async function seedInitialWorkspace(database: WorkspaceDatabase = db) {
  // Migrate any existing developer seed pages to devtools workspaceType if needed
  try {
    await database.pages
      .where('id')
      .anyOf(['erd-schema', 'doc-offline-spec', 'sheet-backlog'])
      .modify({ workspaceType: 'devtools' });
  } catch {}

  const existingCount = await database.pages.count();
  if (existingCount > 0) return;

  const now = Date.now();

  const seedPages: WorkspacePage[] = [
    // 1. Private Section (Clean Personal Notes - Notion Style)
    {
      id: 'doc-welcome',
      parentId: null,
      title: 'Welcome & Quickstart Guide',
      icon: 'doc',
      workspaceType: 'private',
      viewType: 'doc',
      widthPreference: 'standard',
      order: 0,
      createdAt: now - 3600000,
      updatedAt: now - 1800000,
      content: `<h1>Welcome to Your Workspace</h1><p>A clean, professional note-taking and workspace app inspired by <strong>Notion</strong>, built for high productivity and zero latency.</p><hr/><p>You can format text with <mark style="background: rgba(254, 240, 138, 0.45); padding: 1px 4px; border-radius: 3px;">highlight colors</mark>, <u>underlines</u>, <strong>bold</strong>, <em>italics</em>, and colors.</p><p>Type <code>/</code> anywhere to insert headings, bullet lists, to-do checklists, or developer blocks.</p>`,
    },
    {
      id: 'doc-meeting-notes',
      parentId: null,
      title: 'Weekly Team Sync & Notes',
      icon: 'doc',
      workspaceType: 'private',
      viewType: 'doc',
      widthPreference: 'standard',
      order: 1,
      createdAt: now - 3200000,
      updatedAt: now - 1500000,
      content: `<h1>Weekly Team Sync</h1><p><strong>Date:</strong> Monday Sync</p><p><strong>Key Highlights:</strong></p><p>- Review sprint goals and deliverables</p><p>- Finalize customer feedback notes</p><p>- Plan next week priority tasks</p>`,
    },

    // 2. Shared Section (Collaborative Group Pages)
    {
      id: 'kanban-roadmap',
      parentId: null,
      title: 'Q4 Product Roadmap',
      icon: 'kanban',
      workspaceType: 'shared',
      viewType: 'kanban',
      widthPreference: 'full',
      order: 0,
      createdAt: now - 1500000,
      updatedAt: now - 300000,
    },
    {
      id: 'doc-team-rfc',
      parentId: null,
      title: 'Product Requirements Document (PRD)',
      icon: 'doc',
      workspaceType: 'shared',
      viewType: 'doc',
      widthPreference: 'standard',
      order: 1,
      createdAt: now - 1000000,
      updatedAt: now - 100000,
      content: `<h1>Product Requirements Document (PRD)</h1><p><strong>Status:</strong> Approved</p><p><strong>Target:</strong> Q4 Launch</p><p>This document details the user journey, design requirements, and release milestones.</p>`,
    },

    // 3. Dev Tools Section (Dedicated Parent Section for Engineering)
    {
      id: 'erd-schema',
      parentId: null,
      title: 'Database Architecture (ERD)',
      icon: 'database',
      workspaceType: 'devtools',
      viewType: 'erd',
      widthPreference: 'full',
      order: 0,
      createdAt: now - 2500000,
      updatedAt: now - 600000,
    },
    {
      id: 'doc-offline-spec',
      parentId: null,
      title: 'Architecture Spec & Mermaid',
      icon: 'spec',
      workspaceType: 'devtools',
      viewType: 'doc',
      widthPreference: 'standard',
      order: 1,
      createdAt: now - 3000000,
      updatedAt: now - 1200000,
    },
    {
      id: 'sheet-backlog',
      parentId: null,
      title: 'Engineering Sprint Backlog',
      icon: 'sheet',
      workspaceType: 'devtools',
      viewType: 'sheet',
      widthPreference: 'full',
      order: 2,
      createdAt: now - 2000000,
      updatedAt: now - 400000,
    },
  ];

  await database.pages.bulkAdd(seedPages);

  // Seed Sheet Rows
  const seedRows: SheetRow[] = [
    {
      id: 'row-1',
      pageId: 'sheet-backlog',
      title: 'Implement Tauri Window Drag & Controls',
      status: 'Done',
      priority: 'High',
      assignee: 'Alex R.',
      estimate: '3 pts',
      tags: ['Desktop', 'Shell'],
      updatedAt: now - 360000,
    },
    {
      id: 'row-2',
      pageId: 'sheet-backlog',
      title: 'IndexedDB Schema Migration Engine',
      status: 'In Progress',
      priority: 'Urgent',
      assignee: 'Sarah K.',
      estimate: '5 pts',
      tags: ['Database', 'Dexie'],
      updatedAt: now - 240000,
    },
    {
      id: 'row-3',
      pageId: 'sheet-backlog',
      title: 'Command Palette Fuzzy Match Scoring',
      status: 'Done',
      priority: 'Medium',
      assignee: 'David M.',
      estimate: '2 pts',
      tags: ['UI', 'Search'],
      updatedAt: now - 180000,
    },
    {
      id: 'row-4',
      pageId: 'sheet-backlog',
      title: 'ERD Interactive SVG Connectors',
      status: 'In Progress',
      priority: 'High',
      assignee: 'Elena V.',
      estimate: '8 pts',
      tags: ['Canvas', 'SVG'],
      updatedAt: now - 90000,
    },
    {
      id: 'row-5',
      pageId: 'sheet-backlog',
      title: 'Zustand LocalStorage Theme Hydration',
      status: 'Done',
      priority: 'Low',
      assignee: 'Alex R.',
      estimate: '1 pt',
      tags: ['Theme'],
      updatedAt: now - 60000,
    },
    {
      id: 'row-6',
      pageId: 'sheet-backlog',
      title: 'End-to-End Encryption for Shared Vault',
      status: 'Todo',
      priority: 'Urgent',
      assignee: 'Sarah K.',
      estimate: '13 pts',
      tags: ['Security', 'Cloud'],
      updatedAt: now - 30000,
    },
  ];
  await database.sheetRows.bulkAdd(seedRows);

  // Seed Kanban Cards
  const seedCards: KanbanCard[] = [
    {
      id: 'card-1',
      pageId: 'kanban-roadmap',
      title: 'Offline Conflict Resolution UI',
      description: 'Modal showing three-way merge diff when remote cloud version clashes with local IndexedDB edit.',
      status: 'backlog',
      priority: 'high',
      assignee: { name: 'Sarah K.', avatar: 'SK', color: '#10b981' },
      tags: ['Sync', 'UX'],
      order: 0,
      dueDate: 'Nov 14',
    },
    {
      id: 'card-2',
      pageId: 'kanban-roadmap',
      title: 'Desktop Native Menus for macOS & Windows',
      description: 'Expose standard File, Edit, View, and Workspace menus through Tauri system tray.',
      status: 'todo',
      priority: 'medium',
      assignee: { name: 'David M.', avatar: 'DM', color: '#6366f1' },
      tags: ['Tauri', 'Desktop'],
      order: 0,
      dueDate: 'Nov 02',
    },
    {
      id: 'card-3',
      pageId: 'kanban-roadmap',
      title: 'Interactive ERD Visual Relationship Lines',
      description: 'Cubic bezier curved connectors linking primary keys to foreign key targets with arrow heads.',
      status: 'in_progress',
      priority: 'urgent',
      assignee: { name: 'Elena V.', avatar: 'EV', color: '#ec4899' },
      tags: ['Database', 'SVG'],
      order: 0,
      dueDate: 'Oct 29',
    },
    {
      id: 'card-4',
      pageId: 'kanban-roadmap',
      title: '4-Preset Theme Engine with CSS Variables',
      description: 'Flawless instant switching between VS Code Dark, Dracula, Glass Modern, and Minimal Paper.',
      status: 'done',
      priority: 'high',
      assignee: { name: 'Alex R.', avatar: 'AR', color: '#3b82f6' },
      tags: ['Design', 'Core'],
      order: 0,
      dueDate: 'Oct 26',
    },
    {
      id: 'card-5',
      pageId: 'kanban-roadmap',
      title: 'Subpage Drag-and-Drop Tree Nesting',
      description: 'Allow moving pages into child folders and reordering order indices within Dexie table.',
      status: 'in_progress',
      priority: 'medium',
      assignee: { name: 'Alex R.', avatar: 'AR', color: '#3b82f6' },
      tags: ['Sidebar', 'UX'],
      order: 1,
      dueDate: 'Nov 05',
    },
    {
      id: 'card-6',
      pageId: 'kanban-roadmap',
      title: 'Full-text Search indexing in Web Worker',
      description: 'Accelerate Ctrl+K query filtering over 10,000+ local documents with zero UI thread stutter.',
      status: 'backlog',
      priority: 'low',
      assignee: { name: 'David M.', avatar: 'DM', color: '#6366f1' },
      tags: ['Performance'],
      order: 1,
      dueDate: 'Nov 20',
    },
  ];
  await database.kanbanCards.bulkAdd(seedCards);

  // Seed ERD Entities
  const seedEntities: ErdEntity[] = [
    {
      id: 'entity-workspaces',
      pageId: 'erd-schema',
      name: 'workspaces',
      description: 'Multi-tenant isolation boundary for teams & individuals',
      color: '#3b82f6',
      x: 60,
      y: 40,
      fields: [
        { id: 'f-1', name: 'id', type: 'UUID', isPk: true, nullable: false },
        { id: 'f-2', name: 'slug', type: 'VARCHAR', isPk: false, nullable: false },
        { id: 'f-3', name: 'name', type: 'VARCHAR', isPk: false, nullable: false },
        { id: 'f-4', name: 'plan', type: 'VARCHAR', isPk: false, nullable: false },
        { id: 'f-5', name: 'created_at', type: 'TIMESTAMP', isPk: false, nullable: false },
      ],
    },
    {
      id: 'entity-pages',
      pageId: 'erd-schema',
      name: 'pages',
      description: 'Hierarchical documents, sheets, boards, and schemas',
      color: '#10b981',
      x: 420,
      y: 40,
      fields: [
        { id: 'p-1', name: 'id', type: 'UUID', isPk: true, nullable: false },
        { id: 'p-2', name: 'workspace_id', type: 'UUID', isPk: false, isFk: true, nullable: false, references: { table: 'workspaces', field: 'id' } },
        { id: 'p-3', name: 'parent_id', type: 'UUID', isPk: false, isFk: true, nullable: true, references: { table: 'pages', field: 'id' } },
        { id: 'p-4', name: 'title', type: 'VARCHAR', isPk: false, nullable: false },
        { id: 'p-5', name: 'view_type', type: 'VARCHAR', isPk: false, nullable: false },
        { id: 'p-6', name: 'content', type: 'TEXT', isPk: false, nullable: true },
        { id: 'p-7', name: 'updated_at', type: 'TIMESTAMP', isPk: false, nullable: false },
      ],
    },
    {
      id: 'entity-users',
      pageId: 'erd-schema',
      name: 'users',
      description: 'Collaborator identities and device keys',
      color: '#ec4899',
      x: 60,
      y: 350,
      fields: [
        { id: 'u-1', name: 'id', type: 'UUID', isPk: true, nullable: false },
        { id: 'u-2', name: 'email', type: 'VARCHAR', isPk: false, nullable: false },
        { id: 'u-3', name: 'display_name', type: 'VARCHAR', isPk: false, nullable: false },
        { id: 'u-4', name: 'public_key', type: 'VARCHAR', isPk: false, nullable: true },
        { id: 'u-5', name: 'role', type: 'VARCHAR', isPk: false, nullable: false },
      ],
    },
    {
      id: 'entity-sync-logs',
      pageId: 'erd-schema',
      name: 'sync_mutations',
      description: 'Append-only CRDT delta log for distributed replication',
      color: '#8b5cf6',
      x: 420,
      y: 380,
      fields: [
        { id: 's-1', name: 'id', type: 'UUID', isPk: true, nullable: false },
        { id: 's-2', name: 'page_id', type: 'UUID', isPk: false, isFk: true, nullable: false, references: { table: 'pages', field: 'id' } },
        { id: 's-3', name: 'actor_id', type: 'UUID', isPk: false, isFk: true, nullable: false, references: { table: 'users', field: 'id' } },
        { id: 's-4', name: 'version_vector', type: 'JSONB', isPk: false, nullable: false },
        { id: 's-5', name: 'delta_payload', type: 'JSONB', isPk: false, nullable: false },
        { id: 's-6', name: 'applied_at', type: 'TIMESTAMP', isPk: false, nullable: false },
      ],
    },
  ];
  await database.erdEntities.bulkAdd(seedEntities);
}

export async function getStorageStats(): Promise<StorageStatus> {
  try {
    const pageCount = await db.pages.count();
    const sheetCount = await db.sheetRows.count();
    const kanbanCount = await db.kanbanCards.count();
    const erdCount = await db.erdEntities.count();

    const totalItems = pageCount + sheetCount + kanbanCount + erdCount;
    // Estimate size based on record count and content
    const estimatedSizeKB = Math.round(totalItems * 2.8 + 14);

    return {
      itemCount: totalItems,
      dbSizeKB: estimatedSizeKB,
      lastSavedAt: Date.now(),
      isSaving: false,
    };
  } catch {
    return {
      itemCount: 0,
      dbSizeKB: 0,
      lastSavedAt: Date.now(),
      isSaving: false,
    };
  }
}
