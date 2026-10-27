export type BlockType =
  | 'paragraph'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'task'
  | 'quote'
  | 'code'
  | 'toggle'
  | 'table'
  | 'columns-2'
  | 'columns-3'
  | 'callout'
  | 'matrix'
  | 'plan-roadmap'
  | 'sticky-board'
  | 'divider'
  | 'mermaid'
  | 'erd'
  | 'api'
  | 'code-tabs'
  | 'env';

export interface EditorBlock {
  id: string;
  type: BlockType;
  content: string;
  checked?: boolean;
  data?: Record<string, any>;
}

export interface TableBlockData {
  rows: string[][];
  hasHeaderRow?: boolean;
  hasHeaderColumn?: boolean;
  columnWidths?: number[];
}

export interface SlashMenuItem {
  id: BlockType;
  title: string;
  description: string;
  category: 'Basic' | 'Developer';
  badge?: string;
  icon: string;
  keywords: string[];
}

// Mermaid block data
export interface MermaidBlockData {
  code: string;
  zoom: number;
}

// ERD Flow block data
export interface ErdColumn {
  id: string;
  name: string;
  type: 'UUID' | 'VARCHAR' | 'INT' | 'BIGINT' | 'BOOLEAN' | 'TIMESTAMP' | 'JSONB' | 'TEXT';
  isPk?: boolean;
  isFk?: boolean;
  nullable?: boolean;
}

export interface ErdTableNodeData {
  tableName: string;
  columns: ErdColumn[];
}

export interface ErdBlockData {
  nodes: Array<{
    id: string;
    type: string;
    position: { x: number; y: number };
    data: ErdTableNodeData;
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    sourceHandle?: string;
    targetHandle?: string;
    label?: string;
    animated?: boolean;
  }>;
}

// Mini API Client block data
export interface ApiHeader {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

export interface ApiClientBlockData {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string;
  headers: ApiHeader[];
  body: string;
  activeTab: 'body' | 'headers' | 'params';
  response?: {
    status: number;
    statusText: string;
    timeMs: number;
    sizeBytes: number;
    data: any;
    ok: boolean;
  } | null;
}

// Multi-File Code Tabs block data
export interface CodeTabItem {
  id: string;
  filename: string;
  language: string;
  code: string;
}

export interface CodeTabsBlockData {
  activeTabId: string;
  tabs: CodeTabItem[];
}

// Masked Secret Vault block data
export interface SecretItem {
  id: string;
  key: string;
  value: string;
  isRevealed?: boolean;
}

export interface SecretVaultBlockData {
  secrets: SecretItem[];
  globalRevealed: boolean;
}
