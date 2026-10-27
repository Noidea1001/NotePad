'use client';

import React, { useState } from 'react';
import { ChevronRight, ChevronDown, HelpCircle, Eye } from 'lucide-react';
import { EditorBlock } from '../types';

interface ToggleBlockProps {
  block: EditorBlock;
  onUpdate: (data: Record<string, any>) => void;
}

export const ToggleBlock: React.FC<ToggleBlockProps> = ({ block, onUpdate }) => {
  const [isOpen, setIsOpen] = useState(block.data?.isOpen ?? false);
  const title = block.data?.title || 'Click to reveal exercise answer / solution...';
  const content = block.data?.content || 'Write the detailed solution or explanation here for students...';

  const handleToggle = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    onUpdate({
      ...block.data,
      isOpen: nextState,
    });
  };

  const handleTitleChange = (newTitle: string) => {
    onUpdate({
      ...block.data,
      title: newTitle,
    });
  };

  const handleContentChange = (newContent: string) => {
    onUpdate({
      ...block.data,
      content: newContent,
    });
  };

  return (
    <div className="w-full my-2.5 rounded-xl border border-app-border bg-app-surface/60 overflow-hidden shadow-xs transition-all">
      {/* Header bar / Toggle Button */}
      <div
        onClick={handleToggle}
        className="flex items-center gap-2 p-3 cursor-pointer hover:bg-app-sidebar/60 transition-colors select-none"
      >
        <button
          type="button"
          className="p-1 rounded text-app-muted hover:text-app-primary hover:bg-app-sidebar transition-transform"
        >
          {isOpen ? (
            <ChevronDown className="w-4 h-4 text-app-primary" />
          ) : (
            <ChevronRight className="w-4 h-4 text-app-muted" />
          )}
        </button>

        <input
          type="text"
          value={title}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Toggle Header (e.g., Click to reveal answer)..."
          className="font-medium text-xs bg-transparent text-app-primary border-none outline-none flex-1 min-w-0"
        />

        <span className="text-[10px] font-mono text-app-muted/60 shrink-0 px-2 py-0.5 rounded bg-app-sidebar border border-app-border">
          {isOpen ? 'Expanded' : 'Hidden'}
        </span>
      </div>

      {/* Collapsible Content */}
      {isOpen && (
        <div className="px-4 pb-3.5 pt-1 border-t border-app-border/40 bg-app-sidebar/20 animate-in fade-in duration-150">
          <div
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => handleContentChange(e.currentTarget.innerHTML)}
            dangerouslySetInnerHTML={{ __html: content }}
            className="text-xs text-app-secondary leading-relaxed bg-transparent outline-none min-h-[60px] select-text break-words whitespace-pre-wrap focus:text-app-primary"
          />
        </div>
      )}
    </div>
  );
};
