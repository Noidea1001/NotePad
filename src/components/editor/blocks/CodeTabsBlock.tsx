'use client';

import React, { useState } from 'react';
import {
  Code,
  Plus,
  X,
  Copy,
  Check,
  FileCode2,
  Edit2,
  Terminal,
} from 'lucide-react';
import { CodeTabsBlockData, CodeTabItem } from '../types';

interface CodeTabsBlockProps {
  data?: CodeTabsBlockData;
  onChange: (data: Partial<CodeTabsBlockData>) => void;
}

const DEFAULT_TABS: CodeTabItem[] = [
  {
    id: 'tab-1',
    filename: 'App.tsx',
    language: 'typescript',
    code: `import React from 'react';\nimport { DocumentEditorView } from '@/components/editor/DocumentEditorView';\n\nexport default function App() {\n  return (\n    <div className="h-screen w-screen">\n      <DocumentEditorView pageId="doc-welcome" />\n    </div>\n  );\n}`,
  },
  {
    id: 'tab-2',
    filename: 'Program.cs',
    language: 'csharp',
    code: `var builder = WebApplication.CreateBuilder(args);\nbuilder.Services.AddEndpointsApiExplorer();\nbuilder.Services.AddSwaggerGen();\n\nvar app = builder.Build();\napp.MapGet("/api/health", () => Results.Ok(new { status = "healthy", sync = "Yjs" }));\napp.Run();`,
  },
  {
    id: 'tab-3',
    filename: 'Dockerfile',
    language: 'dockerfile',
    code: `FROM node:20-alpine AS builder\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nRUN npm run build\n\nEXPOSE 3000\nCMD ["npm", "start"]`,
  },
];

export const CodeTabsBlock: React.FC<CodeTabsBlockProps> = ({ data, onChange }) => {
  const tabs = data?.tabs || DEFAULT_TABS;
  const activeTabId = data?.activeTabId || tabs[0]?.id || 'tab-1';
  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  const [copied, setCopied] = useState(false);
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const handleCopy = () => {
    if (!activeTab) return;
    navigator.clipboard.writeText(activeTab.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddTab = () => {
    const newId = `tab-${Date.now()}`;
    const newTab: CodeTabItem = {
      id: newId,
      filename: `file_${tabs.length + 1}.ts`,
      language: 'typescript',
      code: '// Type your code here\n',
    };
    const nextTabs = [...tabs, newTab];
    onChange({ tabs: nextTabs, activeTabId: newId });
  };

  const handleCloseTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tabs.length <= 1) return;
    const nextTabs = tabs.filter((t) => t.id !== id);
    const nextActive = activeTabId === id ? nextTabs[0].id : activeTabId;
    onChange({ tabs: nextTabs, activeTabId: nextActive });
  };

  const handleStartRename = (tab: CodeTabItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTabId(tab.id);
    setRenameValue(tab.filename);
  };

  const handleSaveRename = (id: string) => {
    if (renameValue.trim()) {
      const nextTabs = tabs.map((t) =>
        t.id === id ? { ...t, filename: renameValue.trim() } : t
      );
      onChange({ tabs: nextTabs });
    }
    setEditingTabId(null);
  };

  const handleUpdateCode = (newCode: string) => {
    const nextTabs = tabs.map((t) =>
      t.id === activeTabId ? { ...t, code: newCode } : t
    );
    onChange({ tabs: nextTabs });
  };

  const handleUpdateLanguage = (newLang: string) => {
    const nextTabs = tabs.map((t) =>
      t.id === activeTabId ? { ...t, language: newLang } : t
    );
    onChange({ tabs: nextTabs });
  };

  return (
    <div className="rounded-xl border border-app-border bg-app-surface overflow-hidden shadow-card transition-all text-xs">
      {/* Tab Navigation Header */}
      <div className="px-2 pt-2 bg-app-sidebar/80 border-b border-app-border flex items-center justify-between">
        <div className="flex items-center gap-1 overflow-x-auto max-w-[80%] pb-1.5">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTabId;
            const isEditing = editingTabId === tab.id;

            return (
              <div
                key={tab.id}
                onClick={() => onChange({ activeTabId: tab.id })}
                className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer border transition-colors select-none ${
                  isActive
                    ? 'bg-app-surface border-app-border text-app-primary font-medium shadow-sm'
                    : 'border-transparent text-app-muted hover:text-app-primary hover:bg-app-sidebar'
                }`}
              >
                <FileCode2 className="w-3.5 h-3.5 text-app-accent shrink-0" />

                {isEditing ? (
                  <input
                    type="text"
                    value={renameValue}
                    autoFocus
                    onChange={(e) => setRenameValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveRename(tab.id);
                      if (e.key === 'Escape') setEditingTabId(null);
                    }}
                    onBlur={() => handleSaveRename(tab.id)}
                    className="px-1 py-0.5 bg-app-bg border border-app-accent rounded font-mono text-[11px] outline-none w-24"
                  />
                ) : (
                  <span
                    onDoubleClick={(e) => handleStartRename(tab, e)}
                    className="font-mono text-[11px] truncate max-w-[120px]"
                    title="Double click to rename"
                  >
                    {tab.filename}
                  </span>
                )}

                {tabs.length > 1 && (
                  <button
                    onClick={(e) => handleCloseTab(tab.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-app-sidebar text-app-muted hover:text-red-400 transition-opacity"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
            );
          })}

          <button
            onClick={handleAddTab}
            className="p-1.5 rounded-lg text-app-muted hover:text-app-primary hover:bg-app-sidebar transition-colors"
            title="Add new file tab"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right Tools: Language Selector & Copy Button */}
        <div className="flex items-center gap-2 pb-1.5">
          <select
            value={activeTab?.language || 'typescript'}
            onChange={(e) => handleUpdateLanguage(e.target.value)}
            className="px-2 py-1 rounded bg-app-sidebar border border-app-border text-app-muted text-[10px] font-mono outline-none cursor-pointer"
          >
            <option value="typescript">TypeScript</option>
            <option value="javascript">JavaScript</option>
            <option value="csharp">C#</option>
            <option value="python">Python</option>
            <option value="go">Go</option>
            <option value="rust">Rust</option>
            <option value="sql">SQL</option>
            <option value="dockerfile">Dockerfile</option>
            <option value="json">JSON</option>
            <option value="bash">Bash</option>
          </select>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-app-sidebar border border-app-border hover:bg-app-sidebarHover text-app-secondary hover:text-app-primary transition-colors text-[11px]"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Editor Canvas Area */}
      <div className="bg-app-bg p-3 relative font-mono">
        <textarea
          value={activeTab?.code || ''}
          onChange={(e) => handleUpdateCode(e.target.value)}
          placeholder="Paste or type code snippet..."
          rows={9}
          className="w-full bg-transparent text-xs text-app-primary leading-relaxed outline-none resize-none font-mono selection:bg-app-accent/30"
          spellCheck={false}
        />
      </div>
    </div>
  );
};
