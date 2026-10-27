'use client';

import React from 'react';
import { Columns2, Columns3, Plus, Trash2, Columns, LayoutGrid } from 'lucide-react';
import { EditorBlock } from '../types';

interface ColumnItem {
  id: string;
  title: string;
  content: string;
}

interface ColumnsBlockProps {
  block: EditorBlock;
  onUpdate: (data: Record<string, any>) => void;
}

export const ColumnsBlock: React.FC<ColumnsBlockProps> = ({ block, onUpdate }) => {
  const isThreeCol = block.type === 'columns-3';
  const defaultCols: ColumnItem[] = isThreeCol
    ? [
        { id: 'col-1', title: 'Context & Problem', content: 'Describe background and observations here...' },
        { id: 'col-2', title: 'Key Analysis', content: 'Break down findings, metrics, and insights...' },
        { id: 'col-3', title: 'Next Steps & Action', content: 'List immediate decisions and assignments...' },
      ]
    : [
        { id: 'col-1', title: 'Analysis & Findings', content: 'Document current state, challenges, and data...' },
        { id: 'col-2', title: 'Strategic Action Plan', content: 'Document solutions, owners, and targets...' },
      ];

  const columns: ColumnItem[] = block.data?.columns || defaultCols;

  const handleUpdateColumn = (index: number, updates: Partial<ColumnItem>) => {
    const next = columns.map((col, idx) => (idx === index ? { ...col, ...updates } : col));
    onUpdate({ ...block.data, columns: next });
  };

  const handleAddColumn = () => {
    if (columns.length >= 4) return;
    const newCol: ColumnItem = {
      id: `col-${Date.now()}`,
      title: `Column ${columns.length + 1}`,
      content: 'Write notes here...',
    };
    onUpdate({ ...block.data, columns: [...columns, newCol] });
  };

  const handleDeleteColumn = (index: number) => {
    if (columns.length <= 1) return;
    const next = columns.filter((_, idx) => idx !== index);
    onUpdate({ ...block.data, columns: next });
  };

  // Determine grid template class based on column count
  const getGridClass = () => {
    switch (columns.length) {
      case 1:
        return 'grid-cols-1';
      case 2:
        return 'grid-cols-1 md:grid-cols-2';
      case 3:
        return 'grid-cols-1 md:grid-cols-3';
      case 4:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
      default:
        return 'grid-cols-1 md:grid-cols-3';
    }
  };

  return (
    <div className="w-full my-2.5 p-3 rounded-xl border border-app-border bg-app-surface/60 shadow-sm group/cols">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-app-border/40 text-[11px] text-app-muted">
        <span className="flex items-center gap-1.5 font-medium text-app-primary">
          <LayoutGrid className="w-3.5 h-3.5 text-app-primary" />
          <span>{columns.length}-Column Grid Section</span>
          <span className="text-[10px] text-app-muted/60 font-mono">
            ({columns.length} columns)
          </span>
        </span>

        <div className="flex items-center gap-2">
          {columns.length < 4 && (
            <button
              onClick={handleAddColumn}
              className="flex items-center gap-1 text-[10px] text-app-muted hover:text-app-primary px-2 py-0.5 rounded hover:bg-app-sidebar border border-transparent hover:border-app-border transition-colors"
            >
              <Plus className="w-3 h-3" />
              <span>Add Column</span>
            </button>
          )}
          <span className="text-[10px] font-mono opacity-50">Notion Grid</span>
        </div>
      </div>

      <div className={`grid ${getGridClass()} gap-3`}>
        {columns.map((col, index) => (
          <div
            key={col.id || index}
            className="p-3 rounded-lg border border-app-border/80 bg-app-sidebar/40 flex flex-col space-y-2 focus-within:border-app-accent/80 transition-colors relative group/colitem"
          >
            <div className="flex items-center justify-between">
              <input
                type="text"
                value={col.title}
                onChange={(e) => handleUpdateColumn(index, { title: e.target.value })}
                placeholder={`Column ${index + 1} Title`}
                className="font-bold text-xs bg-transparent text-app-primary border-none outline-none tracking-tight placeholder:text-app-muted/40 font-mono w-full"
              />
              {columns.length > 1 && (
                <button
                  onClick={() => handleDeleteColumn(index)}
                  title="Delete column"
                  className="opacity-0 group-hover/colitem:opacity-100 p-1 text-app-muted hover:text-red-400 rounded hover:bg-red-500/10 transition-all shrink-0"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>

            <div
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => handleUpdateColumn(index, { content: e.currentTarget.innerHTML })}
              dangerouslySetInnerHTML={{ __html: col.content }}
              className="text-xs text-app-secondary leading-relaxed bg-transparent outline-none min-h-[80px] break-words empty:before:content-['Type_content_here...'] empty:before:text-app-muted/30 select-text"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
