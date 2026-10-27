'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import * as Y from 'yjs';
import { getOrCreateYDoc } from '@/components/editor/YjsManager';
import { SheetColumn, SheetRowData, ColumnType } from './types';

export const DEFAULT_SHEET_COLUMNS: SheetColumn[] = [
  { id: 'col-task', name: 'Task / Feature', type: 'text', width: 220 },
  { id: 'col-status', name: 'Status', type: 'status', width: 140 },
  { id: 'col-priority', name: 'Priority', type: 'priority', width: 110 },
  { id: 'col-prog', name: 'Progress', type: 'progress', width: 150 },
  { id: 'col-branch', name: 'Git Branch', type: 'gitBranch', width: 190 },
  { id: 'col-points', name: 'Estimate (pts)', type: 'number', width: 120 },
  { id: 'col-budget', name: 'Budget ($)', type: 'number', width: 130 },
  { id: 'col-calc', name: 'Total + 10% Overhead', type: 'formula', width: 180 },
];

export const DEFAULT_SHEET_ROWS: SheetRowData[] = [
  {
    id: 'row-1',
    order: 0,
    cells: {
      'col-task': 'Implement CRDT Multi-peer Sync',
      'col-status': 'In Progress',
      'col-priority': 'P0',
      'col-prog': 75,
      'col-branch': 'feat/crdt-sync',
      'col-points': 8,
      'col-budget': 3200,
      'col-calc': '=G1 * 1.1',
    },
  },
  {
    id: 'row-2',
    order: 1,
    cells: {
      'col-task': 'Postgres SQL DDL Exporter',
      'col-status': 'Done',
      'col-priority': 'P1',
      'col-prog': 100,
      'col-branch': 'feat/sql-ddl',
      'col-points': 5,
      'col-budget': 2000,
      'col-calc': '=G2 * 1.1',
    },
  },
  {
    id: 'row-3',
    order: 2,
    cells: {
      'col-task': 'Secret Vault Blurred Screen-share',
      'col-status': 'Done',
      'col-priority': 'P2',
      'col-prog': 100,
      'col-branch': 'feat/masked-vault',
      'col-points': 3,
      'col-budget': 1200,
      'col-calc': '=G3 * 1.1',
    },
  },
  {
    id: 'row-4',
    order: 3,
    cells: {
      'col-task': 'WebRTC Peer Mesh Data Channels',
      'col-status': 'To Do',
      'col-priority': 'P0',
      'col-prog': 20,
      'col-branch': 'feat/webrtc-mesh',
      'col-points': 13,
      'col-budget': 5200,
      'col-calc': '=G4 * 1.1',
    },
  },
  {
    id: 'row-5',
    order: 4,
    cells: {
      'col-task': 'Tauri Window Controls Integration',
      'col-status': 'In Progress',
      'col-priority': 'P1',
      'col-prog': 60,
      'col-branch': 'feat/tauri-native',
      'col-points': 5,
      'col-budget': 2000,
      'col-calc': '=G5 * 1.1',
    },
  },
];

export const NORMAL_NOTE_COLUMNS: SheetColumn[] = [
  { id: 'col-task', name: 'Task / Item', type: 'text', width: 280 },
  { id: 'col-status', name: 'Status', type: 'status', width: 140 },
  { id: 'col-priority', name: 'Priority', type: 'priority', width: 120 },
  { id: 'col-notes', name: 'Notes', type: 'text', width: 240 },
];

export const NORMAL_NOTE_ROWS: SheetRowData[] = [
  {
    id: 'row-init-1',
    order: 0,
    cells: {
      'col-task': 'First note or task',
      'col-status': 'To Do',
      'col-priority': 'P1',
      'col-notes': 'Click to edit or add rows',
    },
  },
];

export function useSheetData(pageId: string) {
  const [columns, setColumns] = useState<SheetColumn[]>([]);
  const [rows, setRows] = useState<SheetRowData[]>([]);
  const [isReady, setIsReady] = useState(false);
  const entryRef = useRef<ReturnType<typeof getOrCreateYDoc> | null>(null);

  useEffect(() => {
    const entry = getOrCreateYDoc(pageId);
    entryRef.current = entry;
    const { doc, provider } = entry;

    const yColumns = doc.getArray<SheetColumn>('sheet-columns');
    const yRows = doc.getArray<SheetRowData>('sheet-rows');

    const updateState = () => {
      const cols = yColumns.toArray();
      const rws = yRows.toArray();

      const isBacklog = pageId === 'sheet-backlog';
      const targetDefaultCols = isBacklog ? DEFAULT_SHEET_COLUMNS : NORMAL_NOTE_COLUMNS;
      const targetDefaultRows = isBacklog ? DEFAULT_SHEET_ROWS : NORMAL_NOTE_ROWS;

      if (cols.length === 0 && entry.synced) {
        doc.transact(() => {
          yColumns.insert(0, targetDefaultCols);
        });
        setColumns(targetDefaultCols);
      } else {
        setColumns([...cols]);
      }

      if (rws.length === 0 && entry.synced) {
        doc.transact(() => {
          yRows.insert(0, targetDefaultRows);
        });
        setRows(targetDefaultRows);
      } else if (
        !isBacklog &&
        rws.length >= 2 &&
        rws[0]?.cells?.['col-task'] === 'Implement CRDT Multi-peer Sync'
      ) {
        // Auto-clean mistakenly seeded developer backlog tasks on regular note pages
        doc.transact(() => {
          yColumns.delete(0, yColumns.length);
          yColumns.insert(0, NORMAL_NOTE_COLUMNS);
          yRows.delete(0, yRows.length);
          yRows.insert(0, NORMAL_NOTE_ROWS);
        });
        setColumns(NORMAL_NOTE_COLUMNS);
        setRows(NORMAL_NOTE_ROWS);
      } else {
        setRows([...rws]);
      }

      setIsReady(true);
    };

    if (entry.synced) {
      updateState();
    } else {
      provider.on('synced', updateState);
    }

    yColumns.observe(updateState);
    yRows.observe(updateState);

    return () => {
      provider.off('synced', updateState);
      yColumns.unobserve(updateState);
      yRows.unobserve(updateState);
    };
  }, [pageId]);

  const updateCell = useCallback(
    (rowId: string, colId: string, value: any) => {
      if (!entryRef.current) return;
      const { doc } = entryRef.current;
      const yRows = doc.getArray<SheetRowData>('sheet-rows');

      doc.transact(() => {
        const currentRows = yRows.toArray();
        const index = currentRows.findIndex((r) => r.id === rowId);
        if (index !== -1) {
          const row = currentRows[index];
          const updatedRow: SheetRowData = {
            ...row,
            cells: {
              ...row.cells,
              [colId]: value,
            },
          };
          yRows.delete(index, 1);
          yRows.insert(index, [updatedRow]);
        }
      });
    },
    []
  );

  const addRow = useCallback((initialCells?: Record<string, any>) => {
    if (!entryRef.current) return;
    const { doc } = entryRef.current;
    const yRows = doc.getArray<SheetRowData>('sheet-rows');

    const newRowId = `row-${Date.now()}`;
    const newRow: SheetRowData = {
      id: newRowId,
      order: yRows.length,
      cells: initialCells || {
        'col-task': 'New Feature Spec',
        'col-status': 'To Do',
        'col-priority': 'P2',
        'col-prog': 0,
        'col-branch': 'feat/new-task',
        'col-points': 3,
        'col-budget': 1000,
        'col-calc': '=G' + (yRows.length + 1) + ' * 1.1',
      },
    };

    doc.transact(() => {
      yRows.push([newRow]);
    });
    return newRowId;
  }, []);

  const deleteRow = useCallback((rowId: string) => {
    if (!entryRef.current) return;
    const { doc } = entryRef.current;
    const yRows = doc.getArray<SheetRowData>('sheet-rows');

    doc.transact(() => {
      const currentRows = yRows.toArray();
      const index = currentRows.findIndex((r) => r.id === rowId);
      if (index !== -1) {
        yRows.delete(index, 1);
      }
    });
  }, []);

  const addColumn = useCallback((name: string, type: ColumnType) => {
    if (!entryRef.current) return;
    const { doc } = entryRef.current;
    const yColumns = doc.getArray<SheetColumn>('sheet-columns');

    const newCol: SheetColumn = {
      id: `col-${Date.now()}`,
      name: name.trim() || 'New Column',
      type,
      width: 150,
    };

    doc.transact(() => {
      yColumns.push([newCol]);
    });
  }, []);

  const deleteColumn = useCallback((colId: string) => {
    if (!entryRef.current) return;
    const { doc } = entryRef.current;
    const yColumns = doc.getArray<SheetColumn>('sheet-columns');

    doc.transact(() => {
      const currentCols = yColumns.toArray();
      if (currentCols.length <= 1) return;
      const index = currentCols.findIndex((c) => c.id === colId);
      if (index !== -1) {
        yColumns.delete(index, 1);
      }
    });
  }, []);

  const importData = useCallback((records: Record<string, any>[]) => {
    if (!entryRef.current || records.length === 0) return;
    const { doc } = entryRef.current;
    const yColumns = doc.getArray<SheetColumn>('sheet-columns');
    const yRows = doc.getArray<SheetRowData>('sheet-rows');

    const sample = records[0];
    const keys = Object.keys(sample);

    doc.transact(() => {
      // Build columns from keys if custom
      const newColumns: SheetColumn[] = keys.map((key, i) => {
        const val = sample[key];
        let type: ColumnType = 'text';
        if (typeof val === 'number') type = 'number';
        if (key.toLowerCase().includes('status')) type = 'status';
        if (key.toLowerCase().includes('priority')) type = 'priority';
        if (key.toLowerCase().includes('branch') || key.toLowerCase().includes('git')) type = 'gitBranch';
        if (key.toLowerCase().includes('progress')) type = 'progress';

        return {
          id: `col-import-${i}-${Date.now()}`,
          name: key,
          type,
          width: 160,
        };
      });

      const newRows: SheetRowData[] = records.map((record, rIdx) => {
        const cells: Record<string, any> = {};
        newColumns.forEach((col, cIdx) => {
          cells[col.id] = record[keys[cIdx]] ?? '';
        });
        return {
          id: `row-import-${rIdx}-${Date.now()}`,
          order: rIdx,
          cells,
        };
      });

      yColumns.delete(0, yColumns.length);
      yColumns.insert(0, newColumns);

      yRows.delete(0, yRows.length);
      yRows.insert(0, newRows);
    });
  }, []);

  return {
    columns,
    rows,
    isReady,
    updateCell,
    addRow,
    deleteRow,
    addColumn,
    deleteColumn,
    importData,
  };
}
