'use client';

import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Table as TableIcon,
  GitBranch,
  Copy,
  Check,
  Download,
  Upload,
  Kanban,
  FunctionSquare,
  Search,
  Filter,
  ArrowRight,
  Code2,
  Layers,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useSheetData } from '@/components/sheet/useSheetData';
import { evaluateFormula, colIndexToLetter } from '@/components/sheet/FormulaEngine';
import { ColumnType, StatusValue, PriorityValue } from '@/components/sheet/types';
import { WorkspacePage } from '@/types';
import { useWorkspaceStore } from '@/stores/useWorkspaceStore';

export const SheetGridView: React.FC<{ page: WorkspacePage }> = ({ page }) => {
  const { setActiveView } = useWorkspaceStore();
  const {
    columns,
    rows,
    isReady,
    updateCell,
    addRow,
    deleteRow,
    addColumn,
    deleteColumn,
    importData,
  } = useSheetData(page.id);

  const [searchQuery, setSearchQuery] = useState('');
  const [copiedBranch, setCopiedBranch] = useState<string | null>(null);
  const [editingFormula, setEditingFormula] = useState<{ rowId: string; colId: string } | null>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [newColModalOpen, setNewColModalOpen] = useState(false);
  const [newColName, setNewColName] = useState('');
  const [newColType, setNewColType] = useState<ColumnType>('text');

  // Copy Git Branch checkout command
  const handleCopyGitBranch = (branchName: string) => {
    const cmd = `git checkout -b ${branchName}`;
    navigator.clipboard.writeText(cmd);
    setCopiedBranch(branchName);
    setTimeout(() => setCopiedBranch(null), 2000);
  };

  // Import JSON / SQL to table
  const handleParseImport = () => {
    setImportError(null);
    try {
      let parsed: any;
      const trimmed = importText.trim();
      if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
        parsed = JSON.parse(trimmed);
        if (!Array.isArray(parsed)) parsed = [parsed];
      } else if (trimmed.toUpperCase().includes('INSERT INTO') || trimmed.toUpperCase().includes('VALUES')) {
        // Simple SQL Insert value extractor
        const regex = /\(([^)]+)\)/g;
        const matches: RegExpExecArray[] = [];
        let match;
        while ((match = regex.exec(trimmed)) !== null) {
          matches.push(match);
        }
        parsed = matches.map((m, idx) => {
          const vals = m[1].split(',').map((v) => v.trim().replace(/^['"]|['"]$/g, ''));
          return {
            id: idx + 1,
            col1: vals[0] || '',
            col2: vals[1] || '',
            col3: vals[2] || '',
          };
        });
      } else {
        throw new Error('Please enter valid JSON array e.g. [{"task": "Spec", "points": 5}] or SQL INSERT statement.');
      }

      importData(parsed);
      setImportModalOpen(false);
      setImportText('');
    } catch (err: any) {
      setImportError(err.message || 'Failed to parse JSON/SQL data');
    }
  };

  const handleExportCSV = () => {
    if (rows.length === 0) return;
    const headers = columns.map((c) => `"${c.name}"`).join(',');
    const csvRows = rows.map((r, rIdx) => {
      return columns
        .map((col) => {
          let val = r.cells[col.id] ?? '';
          if (col.type === 'formula') {
            val = evaluateFormula(val, rows, columns, rIdx);
          }
          return `"${String(val).replace(/"/g, '""')}"`;
        })
        .join(',');
    });

    const csvContent = [headers, ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${page.title.toLowerCase().replace(/\s+/g, '-')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    const records = rows.map((r) => {
      const rec: Record<string, any> = {};
      columns.forEach((col) => {
        rec[col.name] = r.cells[col.id];
      });
      return rec;
    });

    const blob = new Blob([JSON.stringify(records, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${page.title.toLowerCase().replace(/\s+/g, '-')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredRows = rows.filter((r) => {
    if (!searchQuery) return true;
    return Object.values(r.cells).some((val) =>
      String(val).toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const getStatusBadgeStyle = (status: StatusValue) => {
    switch (status) {
      case 'Done':
        return 'bg-app-sidebar text-app-primary border-app-border font-medium';
      case 'In Progress':
        return 'bg-app-sidebar text-app-secondary border-app-border font-medium';
      case 'Blocked':
        return 'bg-app-sidebar text-app-muted border-app-border font-medium';
      default:
        return 'bg-app-sidebar text-app-muted border-app-border font-medium';
    }
  };

  const getPriorityBadgeStyle = (priority: PriorityValue) => {
    switch (priority) {
      case 'P0':
        return 'bg-app-sidebar text-app-primary border-app-border font-bold';
      case 'P1':
        return 'bg-app-sidebar text-app-secondary border-app-border font-semibold';
      case 'P2':
        return 'bg-app-sidebar text-app-muted border-app-border';
      default:
        return 'bg-app-sidebar text-app-muted border-app-border';
    }
  };

  return (
    <div className="h-full flex flex-col p-6 space-y-4 overflow-hidden">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-app-primary flex items-center gap-2">
              <TableIcon className="w-5 h-5 text-app-primary" />
              <span>{page.title}</span>
            </h1>
          </div>
          <p className="text-xs text-app-muted mt-0.5">
            {rows.length} items &bull; {columns.length} columns &bull; Synced with Kanban
          </p>
        </div>

        {/* Toolbar Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Switch to Kanban View */}
          <button
            onClick={() => setActiveView('kanban')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-app-border bg-app-sidebar/60 hover:bg-app-sidebar text-xs text-app-secondary hover:text-app-primary transition-colors"
          >
            <Kanban className="w-3.5 h-3.5 text-amber-400" />
            <span>Open as Kanban</span>
          </button>

          {/* Paste JSON / SQL to Table */}
          <button
            onClick={() => setImportModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-app-border bg-app-sidebar/60 hover:bg-app-sidebar text-xs text-app-secondary hover:text-app-primary transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-app-accent" />
            <span>Paste JSON / SQL</span>
          </button>

          {/* Export CSV / JSON */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-app-border bg-app-sidebar/60 hover:bg-app-sidebar text-xs text-app-secondary hover:text-app-primary transition-colors"
          >
            <Download className="w-3 h-3 text-emerald-400" />
            <span>CSV</span>
          </button>
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-app-border bg-app-sidebar/60 hover:bg-app-sidebar text-xs text-app-secondary hover:text-app-primary transition-colors"
          >
            <Code2 className="w-3 h-3 text-purple-400" />
            <span>JSON</span>
          </button>

          {/* Add Row Button */}
          <button
            onClick={() => addRow()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-app-accent hover:bg-app-accentHover text-white text-xs font-medium shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Row</span>
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center justify-between gap-3 p-2 rounded-xl bg-app-surface border border-app-border shrink-0">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-app-sidebar border border-app-border text-xs flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-app-muted" />
          <input
            type="text"
            placeholder="Search cells, branches, tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-app-primary placeholder:text-app-muted w-full text-xs"
          />
        </div>

        <button
          onClick={() => setNewColModalOpen(true)}
          className="flex items-center gap-1 text-xs text-app-accent hover:underline px-2"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Column</span>
        </button>
      </div>

      {/* Spreadsheet Grid Container */}
      <div className="flex-1 overflow-auto rounded-xl border border-app-border bg-app-surface shadow-card">
        <table className="w-full text-left border-collapse text-xs">
          {/* Header Row with Coordinate Letters (A, B, C...) */}
          <thead className="bg-app-sidebar sticky top-0 z-20 border-b border-app-border select-none">
            <tr>
              <th className="py-2 px-3 w-10 font-mono text-[10px] text-app-muted border-r border-app-border text-center bg-app-bg/50">
                #
              </th>
              {columns.map((col, cIdx) => (
                <th
                  key={col.id}
                  style={{ width: col.width || 160 }}
                  className="py-2.5 px-3 font-semibold text-app-primary border-r border-app-border relative group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-mono text-[10px] text-app-accent font-bold px-1 rounded bg-app-surface border border-app-border">
                        {colIndexToLetter(cIdx)}
                      </span>
                      <span className="truncate text-xs">{col.name}</span>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {columns.length > 1 && (
                        <button
                          onClick={() => deleteColumn(col.id)}
                          className="p-0.5 text-app-muted hover:text-red-400 rounded"
                          title="Delete column"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </th>
              ))}
              <th className="w-12 py-2 px-2 text-center text-app-muted"></th>
            </tr>
          </thead>

          {/* Table Body Rows */}
          <tbody className="divide-y divide-app-border/60">
            {filteredRows.map((row, rIdx) => (
              <tr
                key={row.id}
                className="group hover:bg-app-sidebar/40 transition-colors duration-100"
              >
                {/* Row Number Coordinate (1, 2, 3...) */}
                <td className="py-2 px-3 font-mono text-[10px] text-app-muted border-r border-app-border text-center bg-app-sidebar/20 select-none">
                  {rIdx + 1}
                </td>

                {/* Cells by Column */}
                {columns.map((col) => {
                  const val = row.cells[col.id] ?? '';

                  return (
                    <td
                      key={col.id}
                      className="py-1.5 px-2.5 border-r border-app-border/40 min-w-[120px]"
                    >
                      {/* TYPE 1: TEXT */}
                      {col.type === 'text' && (
                        <input
                          type="text"
                          value={val}
                          onChange={(e) => updateCell(row.id, col.id, e.target.value)}
                          className="w-full bg-transparent border-none outline-none text-app-primary font-medium hover:border-b hover:border-app-border focus:border-b focus:border-app-accent"
                        />
                      )}

                      {/* TYPE 2: NUMBER */}
                      {col.type === 'number' && (
                        <input
                          type="number"
                          value={val}
                          onChange={(e) => updateCell(row.id, col.id, parseFloat(e.target.value) || 0)}
                          className="w-full bg-transparent border-none outline-none font-mono text-xs text-app-primary text-right pr-2"
                        />
                      )}

                      {/* TYPE 3: FORMULA */}
                      {col.type === 'formula' && (
                        <div className="relative">
                          {editingFormula?.rowId === row.id && editingFormula?.colId === col.id ? (
                            <input
                              type="text"
                              autoFocus
                              value={val}
                              onChange={(e) => updateCell(row.id, col.id, e.target.value)}
                              onBlur={() => setEditingFormula(null)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') setEditingFormula(null);
                              }}
                              className="w-full px-1.5 py-0.5 rounded bg-app-bg border border-app-accent font-mono text-xs text-app-primary outline-none"
                            />
                          ) : (
                            <div
                              onClick={() => setEditingFormula({ rowId: row.id, colId: col.id })}
                              title={`Formula: ${val} (Click to edit)`}
                              className="w-full flex items-center justify-between font-mono text-xs text-emerald-400 cursor-pointer hover:bg-app-sidebar/60 px-1 py-0.5 rounded"
                            >
                              <span className="flex items-center gap-1 font-semibold">
                                <FunctionSquare className="w-3 h-3 text-app-muted" />
                                <span>{evaluateFormula(val, rows, columns, rIdx)}</span>
                              </span>
                              <span className="text-[9px] text-app-muted opacity-60">fx</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* TYPE 4: STATUS BADGE */}
                      {col.type === 'status' && (
                        <select
                          value={val}
                          onChange={(e) => updateCell(row.id, col.id, e.target.value)}
                          className={`w-full px-2 py-0.5 rounded text-[11px] font-medium border outline-none cursor-pointer ${getStatusBadgeStyle(
                            val as StatusValue
                          )}`}
                        >
                          <option value="To Do">To Do</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Done">Done</option>
                          <option value="Blocked">Blocked</option>
                        </select>
                      )}

                      {/* TYPE 5: PRIORITY */}
                      {col.type === 'priority' && (
                        <select
                          value={val}
                          onChange={(e) => updateCell(row.id, col.id, e.target.value)}
                          className={`w-full px-2 py-0.5 rounded text-[11px] font-mono border outline-none cursor-pointer ${getPriorityBadgeStyle(
                            val as PriorityValue
                          )}`}
                        >
                          <option value="P0">P0 (Urgent)</option>
                          <option value="P1">P1 (High)</option>
                          <option value="P2">P2 (Medium)</option>
                          <option value="P3">P3 (Low)</option>
                        </select>
                      )}

                      {/* TYPE 6: PROGRESS BAR */}
                      {col.type === 'progress' && (
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={Number(val) || 0}
                            onChange={(e) => updateCell(row.id, col.id, parseInt(e.target.value, 10))}
                            className="w-20 accent-blue-500 cursor-pointer"
                          />
                          <span className="font-mono text-[10px] text-app-muted w-8 text-right">
                            {Number(val) || 0}%
                          </span>
                        </div>
                      )}

                      {/* TYPE 7: GIT BRANCH */}
                      {col.type === 'gitBranch' && (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={val}
                            onChange={(e) => updateCell(row.id, col.id, e.target.value)}
                            placeholder="feat/..."
                            className="flex-1 bg-transparent font-mono text-[11px] text-indigo-400 outline-none"
                          />
                          {val && (
                            <button
                              onClick={() => handleCopyGitBranch(val)}
                              title={`Click to copy: git checkout -b ${val}`}
                              className="p-1 rounded bg-app-sidebar hover:bg-app-sidebarHover text-app-muted hover:text-app-primary transition-colors shrink-0"
                            >
                              {copiedBranch === val ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <GitBranch className="w-3 h-3 text-indigo-400" />
                              )}
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  );
                })}

                {/* Delete Row Button */}
                <td className="py-1 px-2 text-center">
                  <button
                    onClick={() => deleteRow(row.id)}
                    className="p-1 rounded text-app-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete row"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>

          {/* Footer Aggregations (SUM / AVG) */}
          <tfoot className="bg-app-sidebar/80 sticky bottom-0 z-10 border-t-2 border-app-border font-mono text-xs">
            <tr>
              <td className="py-2 px-3 text-center text-app-muted font-bold text-[10px]">
                Σ
              </td>
              {columns.map((col, cIdx) => {
                if (col.type === 'number') {
                  const sum = rows.reduce(
                    (acc, r) => acc + (parseFloat(r.cells[col.id]) || 0),
                    0
                  );
                  return (
                    <td key={col.id} className="py-2 px-3 text-right text-app-primary font-bold border-r border-app-border">
                      <span className="text-[10px] text-app-muted mr-1">SUM:</span>
                      <span>{Math.round(sum * 100) / 100}</span>
                    </td>
                  );
                }
                return (
                  <td key={col.id} className="py-2 px-3 text-app-muted text-[10px] border-r border-app-border">
                    {cIdx === 0 ? `${rows.length} records` : ''}
                  </td>
                );
              })}
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Paste JSON / SQL Modal */}
      {importModalOpen && (
        <div
          onClick={() => setImportModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl bg-app-surface border border-app-border shadow-2xl p-5 space-y-4 text-xs"
          >
            <div className="flex items-center justify-between pb-2 border-b border-app-border">
              <h3 className="text-sm font-semibold text-app-primary flex items-center gap-2">
                <Upload className="w-4 h-4 text-app-accent" />
                <span>Paste JSON / SQL to Populate Table</span>
              </h3>
            </div>

            <p className="text-app-muted text-xs leading-relaxed">
              Paste a JSON array of objects or SQL INSERT statements. Columns will be auto-generated and synced to Yjs.
            </p>

            <textarea
              rows={8}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder='[\n  { "Task": "Setup Auth", "Status": "Done", "Estimate": 5 },\n  { "Task": "WebRTC Sync", "Status": "In Progress", "Estimate": 8 }\n]'
              className="w-full p-3 rounded-lg bg-app-bg border border-app-border font-mono text-xs text-app-primary outline-none resize-none leading-relaxed"
            />

            {importError && (
              <p className="text-xs text-red-400 bg-red-500/10 p-2 rounded border border-red-500/20">
                {importError}
              </p>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-app-border">
              <button
                onClick={() => setImportModalOpen(false)}
                className="px-3 py-1.5 rounded-lg text-app-muted hover:text-app-primary"
              >
                Cancel
              </button>
              <button
                onClick={handleParseImport}
                className="px-4 py-1.5 rounded-lg bg-app-accent hover:bg-app-accentHover text-white font-medium"
              >
                Populate Table
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Column Modal */}
      {newColModalOpen && (
        <div
          onClick={() => setNewColModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-100"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-xl bg-app-surface border border-app-border p-4 shadow-2xl space-y-3 text-xs"
          >
            <h3 className="font-semibold text-app-primary">Add New Smart Column</h3>
            <input
              type="text"
              autoFocus
              placeholder="Column Name (e.g. Budget, QA Signoff)"
              value={newColName}
              onChange={(e) => setNewColName(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-app-sidebar border border-app-border text-app-primary outline-none"
            />

            <select
              value={newColType}
              onChange={(e) => setNewColType(e.target.value as ColumnType)}
              className="w-full px-3 py-1.5 rounded-lg bg-app-sidebar border border-app-border text-app-primary outline-none"
            >
              <option value="text">Text</option>
              <option value="number">Number</option>
              <option value="formula">Formula (=SUM, =AVG, fx)</option>
              <option value="status">Status Badge (To Do, In Progress, Done)</option>
              <option value="priority">Priority (P0, P1, P2)</option>
              <option value="progress">Progress Bar (0-100%)</option>
              <option value="gitBranch">Git Branch</option>
            </select>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setNewColModalOpen(false)}
                className="px-3 py-1.5 text-app-muted hover:text-app-primary"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (newColName.trim()) {
                    addColumn(newColName.trim(), newColType);
                    setNewColName('');
                    setNewColModalOpen(false);
                  }
                }}
                className="px-3.5 py-1.5 rounded-lg bg-app-accent hover:bg-app-accentHover text-white font-medium"
              >
                Create Column
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
