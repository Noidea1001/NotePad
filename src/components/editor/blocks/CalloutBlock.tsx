'use client';

import React, { useState } from 'react';
import {
  Info,
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  Target,
  BarChart2,
  Palette,
} from 'lucide-react';
import { EditorBlock } from '../types';

interface CalloutBlockProps {
  block: EditorBlock;
  onUpdate: (data: Record<string, any>) => void;
}

const THEMES = {
  neutral: 'bg-app-sidebar/60 border-app-border text-app-primary',
  blue: 'bg-blue-500/10 border-blue-500/30 text-blue-900 dark:text-blue-200',
  emerald: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200',
  amber: 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200',
  purple: 'bg-purple-500/10 border-purple-500/30 text-purple-900 dark:text-purple-200',
  rose: 'bg-rose-500/10 border-rose-500/30 text-rose-900 dark:text-rose-200',
};

const ICONS = [
  { id: 'lightbulb', label: 'Idea / Insight', icon: Lightbulb },
  { id: 'target', label: 'Goal / Target', icon: Target },
  { id: 'chart', label: 'Analysis / Metric', icon: BarChart2 },
  { id: 'info', label: 'Important Note', icon: Info },
  { id: 'alert', label: 'Risk / Warning', icon: AlertTriangle },
  { id: 'check', label: 'Conclusion / Result', icon: CheckCircle2 },
];

export const CalloutBlock: React.FC<CalloutBlockProps> = ({ block, onUpdate }) => {
  const [showPicker, setShowPicker] = useState(false);

  const iconType = block.data?.iconType || 'lightbulb';
  const theme = (block.data?.theme as keyof typeof THEMES) || 'neutral';
  const title = block.data?.title || 'Key Analysis Insight';
  const content = block.data?.content || 'Summarize key takeaways, strategic assumptions, or critical observations here...';

  const CurrentIcon = ICONS.find((i) => i.id === iconType)?.icon || Lightbulb;

  const updateData = (updates: Record<string, any>) => {
    onUpdate({
      ...block.data,
      iconType,
      theme,
      title,
      content,
      ...updates,
    });
  };

  return (
    <div
      className={`w-full my-2.5 p-3.5 rounded-xl border ${THEMES[theme]} transition-all relative group select-none`}
    >
      <div className="flex items-start gap-3">
        {/* Icon & Picker Toggle */}
        <button
          onClick={() => setShowPicker(!showPicker)}
          title="Change icon & color theme"
          className="mt-0.5 p-1 rounded-lg hover:bg-app-surface/50 transition-colors shrink-0"
        >
          <CurrentIcon className="w-4 h-4" />
        </button>

        {/* Content Area */}
        <div className="flex-1 space-y-1 min-w-0">
          <input
            type="text"
            value={title}
            onChange={(e) => updateData({ title: e.target.value })}
            placeholder="Callout / Analysis Title"
            className="w-full font-bold text-xs bg-transparent border-none outline-none tracking-tight placeholder:opacity-50"
          />
          <div
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => updateData({ content: e.currentTarget.innerHTML })}
            dangerouslySetInnerHTML={{ __html: content }}
            className="text-xs leading-relaxed outline-none min-h-[30px] break-words select-text"
          />
        </div>
      </div>

      {/* Theme & Icon Selector Dropdown */}
      {showPicker && (
        <div className="absolute top-12 left-3 z-30 p-2.5 rounded-xl bg-app-surface border border-app-border shadow-2xl space-y-2 text-xs min-w-[200px]">
          <div>
            <span className="text-[10px] uppercase font-semibold text-app-muted block mb-1">
              Select Icon
            </span>
            <div className="grid grid-cols-6 gap-1">
              {ICONS.map((item) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      updateData({ iconType: item.id });
                      setShowPicker(false);
                    }}
                    title={item.label}
                    className="p-1.5 rounded-md hover:bg-app-sidebar flex items-center justify-center text-app-secondary hover:text-app-primary"
                  >
                    <IconComponent className="w-3.5 h-3.5" />
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <span className="text-[10px] uppercase font-semibold text-app-muted block mb-1">
              Accent Color
            </span>
            <div className="flex items-center gap-1.5">
              {(Object.keys(THEMES) as Array<keyof typeof THEMES>).map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    updateData({ theme: t });
                    setShowPicker(false);
                  }}
                  title={t}
                  className={`w-4 h-4 rounded-full border border-app-border ${
                    t === 'blue'
                      ? 'bg-blue-400'
                      : t === 'emerald'
                      ? 'bg-emerald-400'
                      : t === 'amber'
                      ? 'bg-amber-400'
                      : t === 'purple'
                      ? 'bg-purple-400'
                      : t === 'rose'
                      ? 'bg-rose-400'
                      : 'bg-app-sidebar'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
