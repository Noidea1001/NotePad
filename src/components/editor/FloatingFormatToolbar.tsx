'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Highlighter,
  Palette,
  Code,
  X,
  ChevronDown,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Indent,
  Outdent,
} from 'lucide-react';

interface FloatingFormatToolbarProps {
  containerRef: React.RefObject<HTMLElement>;
  onContentChange?: () => void;
}

const HIGHLIGHT_COLORS = [
  { name: 'Yellow', bg: 'rgba(254, 240, 138, 0.45)', border: '#fde047' },
  { name: 'Green', bg: 'rgba(187, 247, 208, 0.45)', border: '#86efac' },
  { name: 'Blue', bg: 'rgba(191, 219, 254, 0.45)', border: '#93c5fd' },
  { name: 'Pink', bg: 'rgba(251, 207, 232, 0.45)', border: '#f9a8d4' },
  { name: 'Purple', bg: 'rgba(233, 213, 255, 0.45)', border: '#d8b4fe' },
  { name: 'Orange', bg: 'rgba(254, 215, 170, 0.45)', border: '#fdba74' },
];

const TEXT_COLORS = [
  { name: 'Default', color: 'inherit' },
  { name: 'Gray', color: '#94a3b8' },
  { name: 'Red', color: '#ef4444' },
  { name: 'Blue', color: '#3b82f6' },
  { name: 'Green', color: '#10b981' },
  { name: 'Purple', color: '#a855f7' },
  { name: 'Amber', color: '#f59e0b' },
];

export const FloatingFormatToolbar: React.FC<FloatingFormatToolbarProps> = ({
  containerRef,
  onContentChange,
}) => {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [showHighlightMenu, setShowHighlightMenu] = useState(false);
  const [showColorMenu, setShowColorMenu] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
        setVisible(false);
        setShowHighlightMenu(false);
        setShowColorMenu(false);
        return;
      }

      // Check if selection is inside container
      const range = selection.getRangeAt(0);
      const commonAncestor = range.commonAncestorContainer;
      const element =
        commonAncestor.nodeType === Node.ELEMENT_NODE
          ? (commonAncestor as HTMLElement)
          : commonAncestor.parentElement;

      if (!element || !containerRef.current?.contains(element)) {
        setVisible(false);
        return;
      }

      // Selected text must have length > 0
      const text = selection.toString().trim();
      if (!text) {
        setVisible(false);
        return;
      }

      const rect = range.getBoundingClientRect();
      const top = Math.max(rect.top - 48, 10);
      const left = Math.max(rect.left + rect.width / 2 - 130, 20);

      setCoords({ top, left });
      setVisible(true);
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [containerRef]);

  const executeCommand = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    onContentChange?.();
  };

  const applyHighlight = (bgColor: string) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    if (range.collapsed) return;

    if (!bgColor) {
      // Remove highlight: unwrap marks
      document.execCommand('removeFormat', false);
    } else {
      const mark = document.createElement('mark');
      mark.style.backgroundColor = bgColor;
      mark.style.color = 'inherit';
      mark.style.padding = '1px 3px';
      mark.style.borderRadius = '3px';
      try {
        mark.appendChild(range.extractContents());
        range.insertNode(mark);
        selection.removeAllRanges();
        const newRange = document.createRange();
        newRange.selectNodeContents(mark);
        selection.addRange(newRange);
      } catch {
        document.execCommand('hiliteColor', false, bgColor);
      }
    }

    setShowHighlightMenu(false);
    onContentChange?.();
  };

  const applyTextColor = (color: string) => {
    document.execCommand('foreColor', false, color);
    setShowColorMenu(false);
    onContentChange?.();
  };

  if (!visible) return null;

  return (
    <div
      ref={toolbarRef}
      onMouseDown={(e) => e.preventDefault()} // Prevent losing selection
      style={{
        position: 'fixed',
        top: `${coords.top}px`,
        left: `${coords.left}px`,
        zIndex: 9999,
      }}
      className="flex items-center gap-0.5 p-1 rounded-lg bg-app-surface border border-app-border shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-100 text-xs select-none"
    >
      {/* Bold */}
      <button
        onClick={() => executeCommand('bold')}
        title="Bold (Cmd+B)"
        className="p-1.5 rounded hover:bg-app-sidebar text-app-secondary hover:text-app-primary transition-colors"
      >
        <Bold className="w-3.5 h-3.5" />
      </button>

      {/* Italic */}
      <button
        onClick={() => executeCommand('italic')}
        title="Italic (Cmd+I)"
        className="p-1.5 rounded hover:bg-app-sidebar text-app-secondary hover:text-app-primary transition-colors"
      >
        <Italic className="w-3.5 h-3.5" />
      </button>

      {/* Underline */}
      <button
        onClick={() => executeCommand('underline')}
        title="Underline (Cmd+U)"
        className="p-1.5 rounded hover:bg-app-sidebar text-app-secondary hover:text-app-primary transition-colors font-bold underline decoration-app-accent"
      >
        <Underline className="w-3.5 h-3.5" />
      </button>

      {/* Strikethrough */}
      <button
        onClick={() => executeCommand('strikeThrough')}
        title="Strikethrough"
        className="p-1.5 rounded hover:bg-app-sidebar text-app-secondary hover:text-app-primary transition-colors"
      >
        <Strikethrough className="w-3.5 h-3.5" />
      </button>

      {/* Code */}
      <button
        onClick={() => {
          const selection = window.getSelection();
          if (!selection || selection.rangeCount === 0) return;
          const range = selection.getRangeAt(0);
          const code = document.createElement('code');
          code.className = 'font-mono text-xs px-1.5 py-0.5 rounded bg-app-sidebar text-emerald-400 border border-app-border';
          code.appendChild(range.extractContents());
          range.insertNode(code);
          onContentChange?.();
        }}
        title="Inline Code"
        className="p-1.5 rounded hover:bg-app-sidebar text-app-secondary hover:text-app-primary transition-colors"
      >
        <Code className="w-3.5 h-3.5" />
      </button>

      <div className="w-[1px] h-4 bg-app-border mx-0.5" />

      {/* Alignment (Left, Center, Right) */}
      <button
        onClick={() => executeCommand('justifyLeft')}
        title="Align Left (Ctrl+L)"
        className="p-1.5 rounded hover:bg-app-sidebar text-app-secondary hover:text-app-primary transition-colors"
      >
        <AlignLeft className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => executeCommand('justifyCenter')}
        title="Align Center (Ctrl+E)"
        className="p-1.5 rounded hover:bg-app-sidebar text-app-secondary hover:text-app-primary transition-colors"
      >
        <AlignCenter className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => executeCommand('justifyRight')}
        title="Align Right (Ctrl+R)"
        className="p-1.5 rounded hover:bg-app-sidebar text-app-secondary hover:text-app-primary transition-colors"
      >
        <AlignRight className="w-3.5 h-3.5" />
      </button>

      <div className="w-[1px] h-4 bg-app-border mx-0.5" />

      {/* Indentation (Tab / Outdent) */}
      <button
        onClick={() => executeCommand('outdent')}
        title="Decrease Indent (Shift+Tab)"
        className="p-1.5 rounded hover:bg-app-sidebar text-app-secondary hover:text-app-primary transition-colors"
      >
        <Outdent className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => executeCommand('indent')}
        title="Increase Indent (Tab)"
        className="p-1.5 rounded hover:bg-app-sidebar text-app-secondary hover:text-app-primary transition-colors"
      >
        <Indent className="w-3.5 h-3.5" />
      </button>

      <div className="w-[1px] h-4 bg-app-border mx-0.5" />

      {/* Highlight Color Dropdown */}
      <div className="relative">
        <button
          onClick={() => {
            setShowHighlightMenu(!showHighlightMenu);
            setShowColorMenu(false);
          }}
          title="Highlight Color"
          className="flex items-center gap-0.5 p-1.5 rounded hover:bg-app-sidebar text-app-secondary hover:text-app-primary transition-colors"
        >
          <Highlighter className="w-3.5 h-3.5 text-amber-400" />
          <ChevronDown className="w-2.5 h-2.5 opacity-60" />
        </button>

        {showHighlightMenu && (
          <div className="absolute top-full left-0 mt-1 p-2 rounded-lg bg-app-surface border border-app-border shadow-xl grid grid-cols-4 gap-1.5 z-50 min-w-[120px]">
            <button
              onClick={() => applyHighlight('')}
              title="Remove Highlight"
              className="w-6 h-6 rounded flex items-center justify-center border border-app-border hover:bg-app-sidebar text-app-muted text-[10px]"
            >
              <X className="w-3 h-3" />
            </button>
            {HIGHLIGHT_COLORS.map((c) => (
              <button
                key={c.name}
                onClick={() => applyHighlight(c.bg)}
                title={`${c.name} Highlight`}
                style={{ backgroundColor: c.bg, borderColor: c.border }}
                className="w-6 h-6 rounded border hover:scale-110 transition-transform"
              />
            ))}
          </div>
        )}
      </div>

      {/* Text Color Dropdown */}
      <div className="relative">
        <button
          onClick={() => {
            setShowColorMenu(!showColorMenu);
            setShowHighlightMenu(false);
          }}
          title="Text Color"
          className="flex items-center gap-0.5 p-1.5 rounded hover:bg-app-sidebar text-app-secondary hover:text-app-primary transition-colors"
        >
          <Palette className="w-3.5 h-3.5 text-indigo-400" />
          <ChevronDown className="w-2.5 h-2.5 opacity-60" />
        </button>

        {showColorMenu && (
          <div className="absolute top-full left-0 mt-1 p-2 rounded-lg bg-app-surface border border-app-border shadow-xl grid grid-cols-4 gap-1.5 z-50 min-w-[120px]">
            {TEXT_COLORS.map((tc) => (
              <button
                key={tc.name}
                onClick={() => applyTextColor(tc.color)}
                title={tc.name}
                className="w-6 h-6 rounded border border-app-border flex items-center justify-center font-bold text-xs hover:scale-110 transition-transform"
                style={{ color: tc.color === 'inherit' ? 'var(--text-primary)' : tc.color }}
              >
                A
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
