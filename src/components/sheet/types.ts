export type ColumnType =
  | 'text'
  | 'number'
  | 'formula'
  | 'status'
  | 'priority'
  | 'progress'
  | 'gitBranch';

export type StatusValue = 'To Do' | 'In Progress' | 'Done' | 'Blocked';
export type PriorityValue = 'P0' | 'P1' | 'P2' | 'P3';

export interface SheetColumn {
  id: string;
  name: string;
  type: ColumnType;
  width?: number;
}

export interface SheetRowData {
  id: string;
  order: number;
  cells: Record<string, any>;
}

export interface CellCoord {
  row: number;
  col: number;
  cellRef: string; // e.g. "B4"
}
