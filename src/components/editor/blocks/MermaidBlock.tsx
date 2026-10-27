'use client';

import React, { useState, useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import {
  GitGraph,
  Play,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Copy,
  Check,
  AlertTriangle,
  Code2,
} from 'lucide-react';
import { MermaidBlockData } from '../types';

interface MermaidBlockProps {
  data?: MermaidBlockData;
  onChange: (data: Partial<MermaidBlockData>) => void;
}

const TEMPLATES = {
  flowchart: `graph TD
  Client[Web / Desktop App] -->|HTTPS / WSS| Gateway[API Gateway]
  Gateway --> Auth[Auth Service]
  Gateway --> Sync[CRDT Sync Engine]
  Sync --> DB[(PostgreSQL)]`,
  sequence: `sequenceDiagram
  autonumber
  actor User as Developer
  participant Client as Local Client (Dexie)
  participant Server as Sync Server (Yjs)
  User->>Client: Edit document block
  Client->>Client: Persist to IndexedDB (< 2ms)
  Client-->>Server: Broadcast binary delta vector
  Server-->>Client: Acknowledge sync`,
  gitGraph: `gitGraph
  commit id: "Initial Release"
  branch feature/erd
  checkout feature/erd
  commit id: "React Flow schema"
  commit id: "Add FK connectors"
  checkout main
  merge feature/erd id: "Merge PR #12"
  commit id: "v1.2.0 deploy"`,
};

export const MermaidBlock: React.FC<MermaidBlockProps> = ({ data, onChange }) => {
  const code = data?.code || TEMPLATES.flowchart;
  const zoom = data?.zoom ?? 1;

  const [svgHtml, setSvgHtml] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const renderId = useRef(`mermaid-${Math.random().toString(36).substring(2, 9)}`);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      themeVariables: {
        darkMode: true,
        background: '#181818',
        primaryColor: '#3b82f6',
        primaryTextColor: '#f3f4f6',
        lineColor: '#60a5fa',
        secondaryColor: '#10b981',
        tertiaryColor: '#8b5cf6',
      },
      securityLevel: 'loose',
    });
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const renderDiagram = async () => {
      try {
        setError(null);
        const uniqueId = `mmd-${Date.now()}`;
        const { svg } = await mermaid.render(uniqueId, code);
        if (!isCancelled) {
          setSvgHtml(svg);
        }
      } catch (err: any) {
        if (!isCancelled) {
          setError(err?.message || 'Invalid Mermaid syntax');
        }
      }
    };

    const timer = setTimeout(renderDiagram, 250);
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [code]);

  const handleZoom = (delta: number) => {
    const nextZoom = Math.min(Math.max(Number((zoom + delta).toFixed(1)), 0.5), 2.5);
    onChange({ zoom: nextZoom });
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-app-border bg-app-surface overflow-hidden shadow-card transition-all">
      {/* Top Header & Template Toolbar */}
      <div className="px-4 py-2.5 bg-app-sidebar/80 border-b border-app-border flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <GitGraph className="w-3.5 h-3.5 text-app-muted" />
          <span className="font-semibold text-app-primary">Mermaid.js Diagram</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-app-surface border border-app-border text-app-muted">
            Code to SVG
          </span>
        </div>

        {/* Template Quick Selectors */}
        <div className="flex items-center gap-1">
          <span className="text-[11px] text-app-muted mr-1 hidden sm:inline">Templates:</span>
          <button
            onClick={() => onChange({ code: TEMPLATES.flowchart })}
            className="px-2 py-0.5 rounded text-[11px] bg-app-surface border border-app-border text-app-secondary hover:text-app-primary hover:bg-app-sidebar transition-colors"
          >
            Flowchart
          </button>
          <button
            onClick={() => onChange({ code: TEMPLATES.sequence })}
            className="px-2 py-0.5 rounded text-[11px] bg-app-surface border border-app-border text-app-secondary hover:text-app-primary hover:bg-app-sidebar transition-colors"
          >
            Sequence
          </button>
          <button
            onClick={() => onChange({ code: TEMPLATES.gitGraph })}
            className="px-2 py-0.5 rounded text-[11px] bg-app-surface border border-app-border text-app-secondary hover:text-app-primary hover:bg-app-sidebar transition-colors"
          >
            GitGraph
          </button>

          <button
            onClick={handleCopyCode}
            className="p-1.5 rounded text-app-muted hover:text-app-primary hover:bg-app-sidebar transition-colors ml-1"
            title="Copy Mermaid Code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Split View: Left (Code Editor) | Right (Live SVG) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-app-border min-h-[300px]">
        {/* Left Side: Code Editor */}
        <div className="flex flex-col bg-app-bg/50">
          <div className="px-3 py-1.5 border-b border-app-border/60 bg-app-sidebar/40 flex items-center justify-between text-[11px] text-app-muted font-mono">
            <span className="flex items-center gap-1.5">
              <Code2 className="w-3 h-3 text-app-accent" />
              <span>mermaid.mmd</span>
            </span>
            <span>Live Sync</span>
          </div>

          <textarea
            value={code}
            onChange={(e) => onChange({ code: e.target.value })}
            placeholder="Write mermaid syntax here..."
            rows={12}
            className="w-full flex-1 p-3 bg-transparent font-mono text-xs text-app-primary outline-none resize-none leading-relaxed placeholder:text-app-muted/50"
            spellCheck={false}
          />

          {error && (
            <div className="p-2.5 bg-red-500/10 border-t border-red-500/20 text-red-400 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span className="truncate">{error}</span>
            </div>
          )}
        </div>

        {/* Right Side: Live SVG Canvas with Zoom / Pan */}
        <div className="relative flex flex-col bg-app-canvas/80 overflow-hidden">
          {/* Zoom controls float */}
          <div className="absolute top-2 right-2 z-10 flex items-center gap-1 p-1 rounded-lg bg-app-surface/90 border border-app-border shadow-md backdrop-blur-sm">
            <button
              onClick={() => handleZoom(-0.2)}
              className="p-1 rounded text-app-muted hover:text-app-primary hover:bg-app-sidebar"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono px-1 text-app-secondary">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => handleZoom(0.2)}
              className="p-1 rounded text-app-muted hover:text-app-primary hover:bg-app-sidebar"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onChange({ zoom: 1 })}
              className="p-1 rounded text-app-muted hover:text-app-primary hover:bg-app-sidebar"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          {/* SVG Container */}
          <div
            ref={containerRef}
            className="flex-1 flex items-center justify-center p-6 overflow-auto min-h-[260px]"
          >
            {svgHtml ? (
              <div
                style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
                className="transition-transform duration-100 flex items-center justify-center max-w-full"
                dangerouslySetInnerHTML={{ __html: svgHtml }}
              />
            ) : (
              <div className="text-xs text-app-muted font-mono animate-pulse">
                Rendering diagram...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
