'use client';

import React, { useState } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Indent,
  Outdent,
  Highlighter,
  Palette,
  List,
  ListOrdered,
  RemoveFormatting,
  Type,
  ChevronDown,
} from 'lucide-react';

interface WordFormattingBarProps {
  onContentChange?: () => void;
}

const FONT_SIZES = [
  { label: 'Small (12px)', value: '1', styleSize: '12px' },
  { label: 'Normal (14px)', value: '3', styleSize: '14px' },
  { label: 'Medium (16px)', value: '4', styleSize: '16px' },
  { label: 'Large (20px)', value: '5', styleSize: '20px' },
  { label: 'Title (28px)', value: '6', styleSize: '28px' },
];

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
  { name: 'Dark Gray', color: '#64748b' },
  { name: 'Blue', color: '#2563eb' },
  { name: 'Emerald', color: '#059669' },
  { name: 'Purple', color: '#9333ea' },
  { name: 'Rose', color: '#e11d48' },
  { name: 'Amber', color: '#d97706' },
];

export const WordFormattingBar: React.FC<WordFormattingBarProps> = ({ onContentChange }) => {
  const [showHighlight, setShowHighlight] = useState(false);
  const [showColor, setShowColor] = useState(false);
  const [showFontSize, setShowFontSize] = useState(false);
  const [currentSizeLabel, setCurrentSizeLabel] = useState('14px');

  const executeCommand = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    onContentChange?.();
  };

  const applyFontSize = (sizeVal: string, label: string) => {
    executeCommand('fontSize', sizeVal);
    setCurrentSizeLabel(label);
    setShowFontSize(false);
  };

  const applyHighlight = (bgColor: string) => {
    executeCommand('hiliteColor', bgColor);
    setShowHighlight(false);
  };

  const applyTextColor = (color: string) => {
    executeCommand('foreColor', color);
    setShowColor(false);
  };

  return (
    <div className="w-full mb-3 p-1.5 rounded-xl bg-app-sidebar/60 border border-app-border flex items-center gap-1 flex-wrap text-xs select-none shadow-xs">
      {/* Font Size Selector (Word style) */}
      <div className="relative">
        <button
          onClick={() => {
            setShowFontSize(!showFontSize);
            setShowHighlight(false);
            setShowColor(false);
          }}
          title="Font Size"
          className="flex items-center gap-1 px-2 py-1 rounded-md bg-app-surface hover:bg-app-sidebar border border-app-border text-app-primary font-medium text-[11px] transition-colors"
        >
          <Type className="w-3.5 h-3.5 text-app-muted" />
          <span>{currentSizeLabel}</span>
          <ChevronDown className="w-3 h-3 text-app-muted opacity-70" />
        </button>

        {showFontSize && (
          <div className="absolute top-full left-0 mt-1 w-36 rounded-lg bg-app-surface border border-app-border shadow-elevation p-1 z-50 text-xs">
            {FONT_SIZES.map((fs) => (
              <button
                key={fs.value}
                onClick={() => applyFontSize(fs.value, fs.styleSize)}
                className="w-full px-2.5 py-1 text-left rounded hover:bg-app-sidebar text-app-primary flex items-center justify-between text-[11px]"
              >
                <span>{fs.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="w-[1px] h-4 bg-app-border/70 mx-0.5" />

      {/* Basic Decorations: Bold, Italic, Underline, Strike */}
      <div className="flex items-center gap-0.5">
        <button
          onClick={() => executeCommand('bold')}
          title="Bold (Ctrl+B)"
          className="p-1.5 rounded-md text-app-secondary hover:text-app-primary hover:bg-app-surface transition-colors font-bold"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => executeCommand('italic')}
          title="Italic (Ctrl+I)"
          className="p-1.5 rounded-md text-app-secondary hover:text-app-primary hover:bg-app-surface transition-colors italic"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => executeCommand('underline')}
          title="Underline (Ctrl+U)"
          className="p-1.5 rounded-md text-app-secondary hover:text-app-primary hover:bg-app-surface transition-colors underline"
        >
          <Underline className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => executeCommand('strikeThrough')}
          title="Strikethrough"
          className="p-1.5 rounded-md text-app-secondary hover:text-app-primary hover:bg-app-surface transition-colors line-through"
        >
          <Strikethrough className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="w-[1px] h-4 bg-app-border/70 mx-0.5" />

      {/* Alignment (Word Style: Left, Center, Right, Justify) */}
      <div className="flex items-center gap-0.5 bg-app-surface/60 p-0.5 rounded-lg border border-app-border/50">
        <button
          onClick={() => executeCommand('justifyLeft')}
          title="Align Left (Ctrl+L)"
          className="p-1 rounded text-app-secondary hover:text-app-primary hover:bg-app-sidebar transition-colors"
        >
          <AlignLeft className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => executeCommand('justifyCenter')}
          title="Align Center (Ctrl+E)"
          className="p-1 rounded text-app-secondary hover:text-app-primary hover:bg-app-sidebar transition-colors"
        >
          <AlignCenter className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => executeCommand('justifyRight')}
          title="Align Right (Ctrl+R)"
          className="p-1 rounded text-app-secondary hover:text-app-primary hover:bg-app-sidebar transition-colors"
        >
          <AlignRight className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => executeCommand('justifyFull')}
          title="Justify (Ctrl+J)"
          className="p-1 rounded text-app-secondary hover:text-app-primary hover:bg-app-sidebar transition-colors"
        >
          <AlignJustify className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="w-[1px] h-4 bg-app-border/70 mx-0.5" />

      {/* Indentation (Tab & Outdent) */}
      <div className="flex items-center gap-0.5">
        <button
          onClick={() => executeCommand('outdent')}
          title="Decrease Indent (Shift+Tab)"
          className="p-1.5 rounded-md text-app-secondary hover:text-app-primary hover:bg-app-surface transition-colors"
        >
          <Outdent className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => executeCommand('indent')}
          title="Increase Indent / Tab Space (Tab)"
          className="p-1.5 rounded-md text-app-secondary hover:text-app-primary hover:bg-app-surface transition-colors"
        >
          <Indent className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="w-[1px] h-4 bg-app-border/70 mx-0.5" />

      {/* Lists */}
      <div className="flex items-center gap-0.5">
        <button
          onClick={() => executeCommand('insertUnorderedList')}
          title="Bullet List"
          className="p-1.5 rounded-md text-app-secondary hover:text-app-primary hover:bg-app-surface transition-colors"
        >
          <List className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => executeCommand('insertOrderedList')}
          title="Numbered List"
          className="p-1.5 rounded-md text-app-secondary hover:text-app-primary hover:bg-app-surface transition-colors"
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="w-[1px] h-4 bg-app-border/70 mx-0.5" />

      {/* Color Menus (Highlight & Text Color) */}
      <div className="flex items-center gap-1">
        {/* Highlight Color */}
        <div className="relative">
          <button
            onClick={() => {
              setShowHighlight(!showHighlight);
              setShowColor(false);
              setShowFontSize(false);
            }}
            title="Text Highlight Color"
            className="flex items-center gap-1 p-1.5 rounded-md text-app-secondary hover:text-app-primary hover:bg-app-surface transition-colors"
          >
            <Highlighter className="w-3.5 h-3.5 text-amber-400" />
            <ChevronDown className="w-2.5 h-2.5 opacity-60" />
          </button>

          {showHighlight && (
            <div className="absolute top-full left-0 mt-1 p-1.5 rounded-xl bg-app-surface border border-app-border shadow-elevation z-50 flex items-center gap-1.5">
              {HIGHLIGHT_COLORS.map((hc) => (
                <button
                  key={hc.name}
                  onClick={() => applyHighlight(hc.bg)}
                  title={hc.name}
                  style={{ backgroundColor: hc.bg, borderColor: hc.border }}
                  className="w-5 h-5 rounded-full border hover:scale-125 transition-transform"
                />
              ))}
              <button
                onClick={() => applyHighlight('transparent')}
                title="Remove Highlight"
                className="px-1.5 py-0.5 text-[10px] text-app-muted hover:text-app-primary rounded hover:bg-app-sidebar border border-app-border"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Text Color */}
        <div className="relative">
          <button
            onClick={() => {
              setShowColor(!showColor);
              setShowHighlight(false);
              setShowFontSize(false);
            }}
            title="Text Font Color"
            className="flex items-center gap-1 p-1.5 rounded-md text-app-secondary hover:text-app-primary hover:bg-app-surface transition-colors"
          >
            <Palette className="w-3.5 h-3.5 text-blue-400" />
            <ChevronDown className="w-2.5 h-2.5 opacity-60" />
          </button>

          {showColor && (
            <div className="absolute top-full left-0 mt-1 p-1.5 rounded-xl bg-app-surface border border-app-border shadow-elevation z-50 flex items-center gap-1.5">
              {TEXT_COLORS.map((tc) => (
                <button
                  key={tc.name}
                  onClick={() => applyTextColor(tc.color)}
                  title={tc.name}
                  style={{ backgroundColor: tc.color === 'inherit' ? '#888' : tc.color }}
                  className="w-5 h-5 rounded-full border border-app-border hover:scale-125 transition-transform"
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="w-[1px] h-4 bg-app-border/70 mx-0.5" />

      {/* Clear Formatting */}
      <button
        onClick={() => executeCommand('removeFormat')}
        title="Clear Formatting"
        className="p-1.5 rounded-md text-app-muted hover:text-app-primary hover:bg-app-surface transition-colors"
      >
        <RemoveFormatting className="w-3.5 h-3.5" />
      </button>

      {/* Click outside backdrop for dropdowns */}
      {(showHighlight || showColor || showFontSize) && (
        <div
          onClick={() => {
            setShowHighlight(false);
            setShowColor(false);
            setShowFontSize(false);
          }}
          className="fixed inset-0 z-40"
        />
      )}
    </div>
  );
};
