'use client';

import React, { useRef, useEffect } from 'react';
import { CheckSquare, Square } from 'lucide-react';
import { EditorBlock } from '../types';
import { InlineVariablePill } from '@/components/sheet/InlineVariablePill';

interface TextBlockProps {
  block: EditorBlock;
  pageId?: string;
  onChangeContent: (content: string) => void;
  onToggleCheck?: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => void;
  autoFocus?: boolean;
}

export const TextBlock: React.FC<TextBlockProps> = ({
  block,
  pageId,
  onChangeContent,
  onToggleCheck,
  onKeyDown,
  autoFocus,
}) => {
  const editableRef = useRef<HTMLDivElement>(null);
  const isTypingRef = useRef(false);

  // Sync content into editable div without triggering cursor jump
  useEffect(() => {
    if (editableRef.current && !isTypingRef.current) {
      const currentHtml = editableRef.current.innerHTML;
      if (currentHtml !== (block.content || '')) {
        editableRef.current.innerHTML = block.content || '';
      }
    }
  }, [block.id, block.content]);

  useEffect(() => {
    if (autoFocus && editableRef.current) {
      editableRef.current.focus();
    }
  }, [autoFocus]);

  const handleInput = () => {
    if (!editableRef.current) return;
    isTypingRef.current = true;
    const html = editableRef.current.innerHTML;
    onChangeContent(html);
    setTimeout(() => {
      isTypingRef.current = false;
    }, 200);
  };

  const handleElementKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // 1. Tab & Shift+Tab indentation (Word standard)
    if (e.key === 'Tab') {
      e.preventDefault();
      if (e.shiftKey) {
        document.execCommand('outdent');
      } else {
        // Insert 4 non-breaking spaces or tab
        document.execCommand('insertText', false, '    ');
      }
      handleInput();
      return;
    }

    // 2. Keyboard shortcuts for quick styling (Word standard)
    const isCmdOrCtrl = e.metaKey || e.ctrlKey;
    if (isCmdOrCtrl) {
      const key = e.key.toLowerCase();
      if (key === 'b') {
        e.preventDefault();
        document.execCommand('bold', false);
        handleInput();
        return;
      }
      if (key === 'i') {
        e.preventDefault();
        document.execCommand('italic', false);
        handleInput();
        return;
      }
      if (key === 'u') {
        e.preventDefault();
        document.execCommand('underline', false);
        handleInput();
        return;
      }
      if (key === 'e') {
        // Word shortcut for Center alignment
        e.preventDefault();
        document.execCommand('justifyCenter', false);
        handleInput();
        return;
      }
      if (key === 'l') {
        // Word shortcut for Left alignment
        e.preventDefault();
        document.execCommand('justifyLeft', false);
        handleInput();
        return;
      }
      if (key === 'r') {
        // Word shortcut for Right alignment
        e.preventDefault();
        document.execCommand('justifyRight', false);
        handleInput();
        return;
      }
      if (key === 'j') {
        // Word shortcut for Justify alignment
        e.preventDefault();
        document.execCommand('justifyFull', false);
        handleInput();
        return;
      }
      if (key === 'h') {
        e.preventDefault();
        document.execCommand('hiliteColor', false, 'rgba(254, 240, 138, 0.45)');
        handleInput();
        return;
      }
    }

    onKeyDown(e);
  };

  const getStyleForType = () => {
    switch (block.type) {
      case 'h1':
        return 'text-2xl font-bold tracking-tight text-app-primary';
      case 'h2':
        return 'text-xl font-semibold tracking-tight text-app-primary mt-2';
      case 'h3':
        return 'text-base font-semibold text-app-primary mt-1';
      case 'quote':
        return 'italic text-app-secondary border-l-2 border-app-border pl-3 my-1';
      case 'code':
        return 'font-mono text-xs bg-app-sidebar/80 p-3 rounded-lg border border-app-border text-emerald-400';
      case 'task':
        return `text-sm ${block.checked ? 'line-through text-app-muted' : 'text-app-primary'}`;
      default:
        return 'text-sm text-app-primary leading-relaxed';
    }
  };

  const getPlaceholder = () => {
    switch (block.type) {
      case 'h1':
        return 'Heading 1';
      case 'h2':
        return 'Heading 2';
      case 'h3':
        return 'Heading 3';
      case 'quote':
        return 'Empty quote...';
      case 'code':
        return '// Write code here...';
      case 'task':
        return 'To-do item...';
      default:
        return "Write something, or press '/' for commands...";
    }
  };

  const isBlank =
    !block.content ||
    block.content === '' ||
    block.content === '<br>' ||
    block.content === '<div><br></div>';

  // Detect {{Cell}} or {{Variable}} bindings
  const variableMatches = (block.content || '').match(/\{\{([^}]+)\}\}/g);

  return (
    <div className="flex flex-col w-full py-0.5">
      <div className="flex items-start gap-2.5 w-full group">
        {/* Task Checkbox */}
        {block.type === 'task' && (
          <button
            onClick={onToggleCheck}
            className="mt-1 text-app-muted hover:text-app-accent transition-colors shrink-0"
          >
            {block.checked ? (
              <CheckSquare className="w-4 h-4 text-app-accent" />
            ) : (
              <Square className="w-4 h-4" />
            )}
          </button>
        )}

        {/* Heading Indicator on hover */}
        {block.type === 'h1' && (
          <span className="text-xs text-app-muted/40 font-mono select-none mt-2 hidden sm:inline">H1</span>
        )}
        {block.type === 'h2' && (
          <span className="text-xs text-app-muted/40 font-mono select-none mt-1.5 hidden sm:inline">H2</span>
        )}
        {block.type === 'h3' && (
          <span className="text-xs text-app-muted/40 font-mono select-none mt-1 hidden sm:inline">H3</span>
        )}

        <div className="relative w-full flex-1">
          {isBlank && (
            <span className="absolute left-0 top-0 pointer-events-none text-app-muted/40 select-none text-sm">
              {getPlaceholder()}
            </span>
          )}
          <div
            ref={editableRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            onKeyDown={handleElementKeyDown}
            className={`w-full bg-transparent border-none outline-none min-h-[1.5em] select-text break-words whitespace-pre-wrap ${getStyleForType()}`}
          />
        </div>
      </div>

      {/* Live Two-Way Bound Variable Pills */}
      {variableMatches && variableMatches.length > 0 && pageId && (
        <div className="flex items-center gap-1.5 flex-wrap pt-1 pl-1 select-none">
          <span className="text-[10px] text-app-muted uppercase font-mono font-semibold">
            Live Sheet Variables:
          </span>
          {variableMatches.map((vMatch, idx) => (
            <InlineVariablePill
              key={idx}
              pageId={pageId}
              variableRef={vMatch}
            />
          ))}
        </div>
      )}
    </div>
  );
};
