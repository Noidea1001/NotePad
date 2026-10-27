'use client';

import React from 'react';
import { X, Check, Palette, Type, Sparkles } from 'lucide-react';
import { useWorkspaceStore } from '@/stores/useWorkspaceStore';
import { useThemeStore, THEME_PRESETS, FONT_PRESETS } from '@/stores/useThemeStore';
import { ThemeId, FontId } from '@/types';

export const ThemeSelectorModal: React.FC = () => {
  const { isThemeModalOpen, setThemeModalOpen } = useWorkspaceStore();
  const { theme, font, setTheme, setFont } = useThemeStore();

  if (!isThemeModalOpen) return null;

  return (
    <div
      onClick={() => setThemeModalOpen(false)}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-2xl bg-app-surface border border-app-border shadow-2xl overflow-hidden flex flex-col text-app-primary animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-app-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-app-accent/15 border border-app-accent/30 flex items-center justify-center text-app-accent">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-app-primary">Theme & Style Engine</h2>
              <p className="text-xs text-app-muted">Constrained high-contrast color & font presets</p>
            </div>
          </div>
          <button
            onClick={() => setThemeModalOpen(false)}
            className="p-1 rounded-md text-app-muted hover:text-app-primary hover:bg-app-sidebar transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* 1. Theme Presets */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-app-muted mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-app-accent" />
              <span>Color Themes (4 Presets)</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {(Object.keys(THEME_PRESETS) as ThemeId[]).map((themeKey) => {
                const item = THEME_PRESETS[themeKey];
                const isSelected = theme === themeKey;

                return (
                  <button
                    key={themeKey}
                    onClick={() => setTheme(themeKey)}
                    className={`relative p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all duration-150 group ${
                      isSelected
                        ? 'border-app-accent ring-2 ring-app-accent/20 bg-app-card shadow-md'
                        : 'border-app-border hover:border-app-muted/60 bg-app-sidebar/40 hover:bg-app-sidebar'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-3">
                      {/* Theme preview swatch */}
                      <div className="flex items-center gap-1.5 p-1 rounded-md bg-black/20 border border-white/10">
                        <span
                          style={{ backgroundColor: item.previewBg }}
                          className="w-4 h-4 rounded-full border border-white/20"
                        />
                        <span
                          style={{ backgroundColor: item.previewAccent }}
                          className="w-4 h-4 rounded-full"
                        />
                      </div>

                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-app-accent flex items-center justify-center text-white">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-app-primary">{item.name}</p>
                      <p className="text-[11px] text-app-muted mt-0.5 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Font Presets */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-app-muted mb-3 flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-app-accent" />
              <span>Font Typography (3 Presets)</span>
            </h3>

            <div className="space-y-2">
              {(Object.keys(FONT_PRESETS) as FontId[]).map((fontKey) => {
                const item = FONT_PRESETS[fontKey];
                const isSelected = font === fontKey;

                return (
                  <button
                    key={fontKey}
                    onClick={() => setFont(fontKey)}
                    className={`w-full p-3 rounded-xl border flex items-center justify-between text-left transition-all ${
                      isSelected
                        ? 'border-app-accent ring-2 ring-app-accent/20 bg-app-card'
                        : 'border-app-border hover:border-app-muted/60 bg-app-sidebar/40 hover:bg-app-sidebar'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                          fontKey === 'mono' ? 'font-mono' : ''
                        } bg-app-surface border border-app-border`}
                      >
                        Aa
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-app-primary">{item.name}</p>
                        <p className="text-[11px] text-app-muted">{item.description}</p>
                      </div>
                    </div>

                    {isSelected && (
                      <Check className="w-4 h-4 text-app-accent stroke-[2.5]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-app-border bg-app-sidebar/40 flex justify-end">
          <button
            onClick={() => setThemeModalOpen(false)}
            className="px-4 py-1.5 rounded-lg bg-app-accent hover:bg-app-accentHover text-white text-xs font-medium transition-colors"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
