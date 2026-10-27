'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  Trash2,
  MoreHorizontal,
  ChevronDown,
  GripVertical,
  Check,
  Columns,
  Table as TableIcon,
  Copy,
  ArrowDown,
  ArrowUp,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import { EditorBlock, TableBlockData } from '../types';

interface NotionTableBlockProps {
  block: EditorBlock;
  onUpdate: (data: Record<string, any>) => void;
}

export const NotionTableBlock: React.FC<NotionTableBlockProps> = ({ block, onUpdate }) => {
  const defaultData: TableBlockData = {
    rows: [
      ['Item / Task', 'Status', 'Notes'],
      ['Initial Project Setup', 'Completed', 'IndexedDB and Yjs integration'],
      ['UI Grid & Note Design', 'In Progress', 'Notion-style interactive cells'],
      ['Testing & Validation', 'Pending', 'Cross-browser check'],
    ],
    hasHeaderRow: true,
    hasHeaderColumn: false,
    columnWidths: [180, 140, 260],
  };

  const tableData: TableBlockData = {
    rows: block.data?.rows && block.data.rows.length > 0 ? block.data.rows : defaultData.rows,
    hasHeaderRow: block.data?.hasHeaderRow !== undefined ? block.data.hasHeaderRow : defaultData.hasHeaderRow,
    hasHeaderColumn: block.data?.hasHeaderColumn !== undefined ? block.data.hasHeaderColumn : defaultData.hasHeaderColumn,
    columnWidths: block.data?.columnWidths || defaultData.columnWidths,
  };

  const [activeCell, setActiveCell] = useState<{ r: number; c: number } | null>(null);
  const [rowMenu, setRowMenu] = useState<{ index: number; x: number; y: number } | null>(null);
  const [colMenu, setColMenu] = useState<{ index: number; x: number; y: number } | null>(null);
  const [resizingCol, setResizingCol] = useState<{ index: number; startX: number; startWidth: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const cellRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const numRows = tableData.rows.length;
  const numCols = tableData.rows[0]?.length || 3;

  // Ensure columnWidths has correct length
  const columnWidths = [...(tableData.columnWidths || [])];
  while (columnWidths.length < numCols) {
    columnWidths.push(160);
  }

  // Update cell content
  const handleCellChange = (rIndex: number, cIndex: number, text: string) => {
    const newRows = tableData.rows.map((row, r) =>
      r === rIndex ? row.map((cell, c) => (c === cIndex ? text : cell)) : [...row]
    );
    onUpdate({
      ...tableData,
      rows: newRows,
    });
  };

  // Insert row
  const insertRow = (targetIndex: number) => {
    const newRow = new Array(numCols).fill('');
    const newRows = [...tableData.rows];
    newRows.splice(targetIndex, 0, newRow);
    onUpdate({
      ...tableData,
      rows: newRows,
    });
    setRowMenu(null);
    setTimeout(() => {
      focusCell(targetIndex, 0);
    }, 50);
  };

  // Delete row
  const deleteRow = (rIndex: number) => {
    if (numRows <= 1) return;
    const newRows = tableData.rows.filter((_, r) => r !== rIndex);
    onUpdate({
      ...tableData,
      rows: newRows,
    });
    setRowMenu(null);
  };

  // Insert column
  const insertColumn = (targetIndex: number) => {
    const newRows = tableData.rows.map((row) => {
      const copy = [...row];
      copy.splice(targetIndex, 0, '');
      return copy;
    });
    const newWidths = [...columnWidths];
    newWidths.splice(targetIndex, 0, 160);
    onUpdate({
      ...tableData,
      rows: newRows,
      columnWidths: newWidths,
    });
    setColMenu(null);
  };

  // Delete column
  const deleteColumn = (cIndex: number) => {
    if (numCols <= 1) return;
    const newRows = tableData.rows.map((row) => row.filter((_, c) => c !== cIndex));
    const newWidths = columnWidths.filter((_, c) => c !== cIndex);
    onUpdate({
      ...tableData,
      rows: newRows,
      columnWidths: newWidths,
    });
    setColMenu(null);
  };

  // Column resize handling
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!resizingCol) return;
      const delta = e.clientX - resizingCol.startX;
      const newWidth = Math.max(80, resizingCol.startWidth + delta);
      const nextWidths = [...columnWidths];
      nextWidths[resizingCol.index] = newWidth;
      onUpdate({
        ...tableData,
        columnWidths: nextWidths,
      });
    };

    const handleMouseUp = () => {
      if (resizingCol) {
        setResizingCol(null);
      }
    };

    if (resizingCol) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizingCol, columnWidths, tableData, onUpdate]);

  const focusCell = (r: number, c: number) => {
    setActiveCell({ r, c });
    const key = `${r}-${c}`;
    const el = cellRefs.current.get(key);
    if (el) {
      el.focus();
      // Place cursor at end
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(el);
      range.collapse(false);
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent, r: number, c: number) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      if (e.shiftKey) {
        // Shift + Tab -> Move left or wrap to previous row
        if (c > 0) {
          focusCell(r, c - 1);
        } else if (r > 0) {
          focusCell(r - 1, numCols - 1);
        }
      } else {
        // Tab -> Move right or wrap to next row
        if (c < numCols - 1) {
          focusCell(r, c + 1);
        } else if (r < numRows - 1) {
          focusCell(r + 1, 0);
        } else {
          // Last cell of last row: automatically append new row (Notion behavior!)
          insertRow(numRows);
        }
      }
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (r < numRows - 1) {
        focusCell(r + 1, c);
      } else {
        // Bottom row Enter: append new row below
        insertRow(numRows);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className="group/notion-table relative my-4 w-full select-text transition-all"
    >
      {/* Notion-style Top Controls Bar */}
      <div className="flex items-center justify-between pb-1.5 mb-1 text-[11px] text-app-muted select-none">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-medium text-app-primary">
            <TableIcon className="w-3.5 h-3.5 text-app-primary" />
            <span>Table Grid</span>
            <span className="text-[10px] text-app-muted font-mono ml-1">
              ({numRows} rows × {numCols} cols)
            </span>
          </div>

          <div className="flex items-center gap-2 pl-2 border-l border-app-border/40">
            <label className="flex items-center gap-1 cursor-pointer hover:text-app-primary transition-colors">
              <input
                type="checkbox"
                checked={tableData.hasHeaderRow}
                onChange={(e) =>
                  onUpdate({ ...tableData, hasHeaderRow: e.target.checked })
                }
                className="w-3 h-3 rounded border-app-border text-app-accent focus:ring-0"
              />
              <span>Header row</span>
            </label>

            <label className="flex items-center gap-1 cursor-pointer hover:text-app-primary transition-colors">
              <input
                type="checkbox"
                checked={tableData.hasHeaderColumn}
                onChange={(e) =>
                  onUpdate({ ...tableData, hasHeaderColumn: e.target.checked })
                }
                className="w-3 h-3 rounded border-app-border text-app-accent focus:ring-0"
              />
              <span>Header col</span>
            </label>
          </div>
        </div>

        {/* Quick action: Add Column */}
        <button
          onClick={() => insertColumn(numCols)}
          className="flex items-center gap-1 text-[10px] text-app-muted hover:text-app-primary px-2 py-0.5 rounded hover:bg-app-sidebar border border-transparent hover:border-app-border transition-colors"
        >
          <Plus className="w-3 h-3" />
          <span>Add Column</span>
        </button>
      </div>

      {/* Table Container with Overflow & Clean Notion Border */}
      <div className="relative overflow-x-auto rounded-lg border border-app-border bg-app-surface shadow-sm">
        <table className="w-full border-collapse text-xs">
          <thead>
            {/* Top Column Header Grips / Actions */}
            <tr className="bg-app-sidebar/40 border-b border-app-border">
              {/* Row handle gutter column */}
              <th className="w-8 p-1 text-center font-mono text-[9px] text-app-muted/40 select-none border-r border-app-border/40">
                #
              </th>

              {Array.from({ length: numCols }).map((_, cIndex) => (
                <th
                  key={`th-${cIndex}`}
                  style={{ width: `${columnWidths[cIndex]}px` }}
                  className="relative p-1 text-left font-normal select-none border-r border-app-border last:border-r-0 group/colheader"
                >
                  <div className="flex items-center justify-between px-1.5 py-0.5">
                    <span className="font-mono text-[10px] text-app-muted/60 uppercase">
                      Col {String.fromCharCode(65 + cIndex)}
                    </span>
                    <button
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setColMenu({ index: cIndex, x: rect.left, y: rect.bottom + 4 });
                        setRowMenu(null);
                      }}
                      title="Column options"
                      className="opacity-0 group-hover/colheader:opacity-100 p-0.5 rounded hover:bg-app-sidebar text-app-muted hover:text-app-primary transition-opacity"
                    >
                      <MoreHorizontal className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Draggable column resize handle */}
                  <div
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setResizingCol({
                        index: cIndex,
                        startX: e.clientX,
                        startWidth: columnWidths[cIndex],
                      });
                    }}
                    className="absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-blue-500/50 transition-colors z-10"
                  />
                </th>
              ))}

              {/* Add column header button */}
              <th className="w-8 p-1 text-center bg-app-sidebar/20 select-none">
                <button
                  onClick={() => insertColumn(numCols)}
                  title="Insert column"
                  className="p-1 rounded text-app-muted hover:text-app-primary hover:bg-app-sidebar transition-colors"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </th>
            </tr>
          </thead>

          <tbody>
            {tableData.rows.map((row, rIndex) => {
              const isHeaderRow = rIndex === 0 && tableData.hasHeaderRow;

              return (
                <tr
                  key={`row-${rIndex}`}
                  className={`border-b border-app-border last:border-b-0 group/row hover:bg-app-sidebar/20 transition-colors ${
                    isHeaderRow ? 'bg-app-sidebar/60 font-semibold' : ''
                  }`}
                >
                  {/* Row Handle Gutter */}
                  <td className="w-8 p-1 text-center border-r border-app-border/40 select-none relative">
                    <button
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setRowMenu({ index: rIndex, x: rect.left + 20, y: rect.top });
                        setColMenu(null);
                      }}
                      title="Row options"
                      className="opacity-0 group-hover/row:opacity-100 p-1 rounded hover:bg-app-sidebar text-app-muted hover:text-app-primary transition-opacity"
                    >
                      <GripVertical className="w-3 h-3" />
                    </button>
                    <span className="group-hover/row:hidden font-mono text-[9px] text-app-muted/50">
                      {rIndex + 1}
                    </span>
                  </td>

                  {/* Cells in Row */}
                  {row.map((cellText, cIndex) => {
                    const isHeaderCol = cIndex === 0 && tableData.hasHeaderColumn;
                    const cellKey = `${rIndex}-${cIndex}`;
                    const isFocused =
                      activeCell?.r === rIndex && activeCell?.c === cIndex;

                    return (
                      <td
                        key={`cell-${cellKey}`}
                        style={{ width: `${columnWidths[cIndex]}px` }}
                        className={`p-0 border-r border-app-border last:border-r-0 align-top ${
                          isHeaderCol ? 'bg-app-sidebar/40 font-semibold' : ''
                        } ${isFocused ? 'bg-blue-500/5' : ''}`}
                      >
                        <div
                          ref={(el) => {
                            if (el) cellRefs.current.set(cellKey, el);
                            else cellRefs.current.delete(cellKey);
                          }}
                          contentEditable
                          suppressContentEditableWarning
                          onFocus={() => setActiveCell({ r: rIndex, c: cIndex })}
                          onBlur={(e) =>
                            handleCellChange(rIndex, cIndex, e.currentTarget.innerText)
                          }
                          onKeyDown={(e) => handleKeyDown(e, rIndex, cIndex)}
                          className="px-2.5 py-1.5 outline-none min-h-[30px] text-xs text-app-primary leading-relaxed break-words empty:before:content-['...'] empty:before:text-app-muted/20"
                        >
                          {cellText}
                        </div>
                      </td>
                    );
                  })}

                  {/* Empty cell matching column add button */}
                  <td className="w-8 p-0 bg-transparent" />
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Bottom Bar: Add Row & Corner Expand Handle */}
        <div className="flex items-center justify-between border-t border-app-border/40 bg-app-sidebar/20 px-2 py-1 select-none">
          <button
            onClick={() => insertRow(numRows)}
            className="flex items-center gap-1.5 text-[11px] text-app-muted hover:text-app-primary py-0.5 px-2 rounded hover:bg-app-sidebar transition-colors"
          >
            <Plus className="w-3 h-3" />
            <span>Add Row</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-app-muted/50 font-mono">
              Press Tab on last cell to add row
            </span>
            <button
              onClick={() => {
                insertRow(numRows);
                insertColumn(numCols);
              }}
              title="Expand grid (+1 row & +1 column)"
              className="p-1 rounded text-app-muted hover:text-app-primary hover:bg-app-sidebar transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Column Options Popup Menu */}
      {colMenu && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{ top: `${colMenu.y}px`, left: `${colMenu.x}px` }}
          className="fixed z-50 w-44 rounded-lg bg-app-surface border border-app-border shadow-elevation py-1 text-xs text-app-primary animate-in fade-in zoom-in-95"
        >
          <div className="px-3 py-1 text-[10px] font-mono text-app-muted border-b border-app-border uppercase">
            Column {String.fromCharCode(65 + colMenu.index)}
          </div>
          <button
            onClick={() => insertColumn(colMenu.index)}
            className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-app-sidebar text-left"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-app-muted" />
            <span>Insert left</span>
          </button>
          <button
            onClick={() => insertColumn(colMenu.index + 1)}
            className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-app-sidebar text-left"
          >
            <ArrowRight className="w-3.5 h-3.5 text-app-muted" />
            <span>Insert right</span>
          </button>
          <button
            onClick={() => {
              const newRows = tableData.rows.map((row) =>
                row.map((cell, c) => (c === colMenu.index ? '' : cell))
              );
              onUpdate({ ...tableData, rows: newRows });
              setColMenu(null);
            }}
            className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-app-sidebar text-left text-app-muted"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear column</span>
          </button>
          {numCols > 1 && (
            <button
              onClick={() => deleteColumn(colMenu.index)}
              className="w-full px-3 py-1.5 flex items-center gap-2 text-red-400 hover:bg-red-500/10 text-left border-t border-app-border/40 mt-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete column</span>
            </button>
          )}
        </div>
      )}

      {/* Row Options Popup Menu */}
      {rowMenu && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{ top: `${rowMenu.y}px`, left: `${rowMenu.x}px` }}
          className="fixed z-50 w-40 rounded-lg bg-app-surface border border-app-border shadow-elevation py-1 text-xs text-app-primary animate-in fade-in zoom-in-95"
        >
          <div className="px-3 py-1 text-[10px] font-mono text-app-muted border-b border-app-border uppercase">
            Row {rowMenu.index + 1}
          </div>
          <button
            onClick={() => insertRow(rowMenu.index)}
            className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-app-sidebar text-left"
          >
            <ArrowUp className="w-3.5 h-3.5 text-app-muted" />
            <span>Insert above</span>
          </button>
          <button
            onClick={() => insertRow(rowMenu.index + 1)}
            className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-app-sidebar text-left"
          >
            <ArrowDown className="w-3.5 h-3.5 text-app-muted" />
            <span>Insert below</span>
          </button>
          {numRows > 1 && (
            <button
              onClick={() => deleteRow(rowMenu.index)}
              className="w-full px-3 py-1.5 flex items-center gap-2 text-red-400 hover:bg-red-500/10 text-left border-t border-app-border/40 mt-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete row</span>
            </button>
          )}
        </div>
      )}

      {/* Click outside to close menus */}
      {(rowMenu || colMenu) && (
        <div
          onClick={() => {
            setRowMenu(null);
            setColMenu(null);
          }}
          className="fixed inset-0 z-40"
        />
      )}
    </div>
  );
};
