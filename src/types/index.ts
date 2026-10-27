export type ThemeId = 'vscode-dark' | 'dracula' | 'glass-modern' | 'minimal-paper';

export type FontId = 'sans' | 'mono' | 'bilingual';

export type WorkspaceType = 'private' | 'shared' | 'devtools';

export type ViewType = 'doc' | 'sheet' | 'kanban' | 'erd';

export type WidthPreference = 'standard' | 'full';

export interface WorkspacePage {
  id: string;
  parentId: string | null;
  title: string;
  icon: string;
  workspaceType: WorkspaceType;
  viewType: ViewType;
  widthPreference: WidthPreference;
  order: number;
  createdAt: number;
  updatedAt: number;
  content?: string;
  description?: string;
  tags?: string[];
  isExpanded?: boolean;
}

export interface SheetRow {
  id: string;
  pageId: string;
  title: string;
  status: 'Backlog' | 'Todo' | 'In Progress' | 'Done' | 'Blocked';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  assignee: string;
  estimate: string;
  tags: string[];
  updatedAt: number;
}

export type KanbanColumnId = 'backlog' | 'todo' | 'in_progress' | 'done';

export interface KanbanCard {
  id: string;
  pageId: string;
  title: string;
  description?: string;
  status: KanbanColumnId;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee: {
    name: string;
    avatar: string;
    color: string;
  };
  tags: string[];
  order: number;
  dueDate?: string;
}

export interface ErdField {
  id: string;
  name: string;
  type: 'UUID' | 'VARCHAR' | 'INT' | 'BIGINT' | 'BOOLEAN' | 'TIMESTAMP' | 'JSONB' | 'DECIMAL' | 'TEXT';
  isPk: boolean;
  isFk?: boolean;
  nullable: boolean;
  references?: {
    table: string;
    field: string;
  };
}

export interface ErdEntity {
  id: string;
  pageId: string;
  name: string;
  description?: string;
  fields: ErdField[];
  color?: string;
  x: number;
  y: number;
}

export interface Collaborator {
  id: string;
  name: string;
  initials: string;
  color: string;
  status: 'online' | 'editing' | 'idle';
  currentPageId?: string;
  currentView?: string;
  cursorPosition?: string;
}

export interface StorageStatus {
  itemCount: number;
  dbSizeKB: number;
  lastSavedAt: number;
  isSaving: boolean;
}
