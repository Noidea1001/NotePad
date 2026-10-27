'use client';

import React, { useState } from 'react';
import {
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  HardDrive,
  Copy,
  Check,
  Plus,
  Trash2,
  Code2,
  Terminal,
} from 'lucide-react';
import { ApiClientBlockData, ApiHeader } from '../types';

interface ApiClientBlockProps {
  data?: ApiClientBlockData;
  onChange: (data: Partial<ApiClientBlockData>) => void;
}

export const ApiClientBlock: React.FC<ApiClientBlockProps> = ({ data, onChange }) => {
  const method = data?.method || 'GET';
  const url = data?.url || 'https://jsonplaceholder.typicode.com/todos/1';
  const headers = data?.headers || [
    { id: '1', key: 'Content-Type', value: 'application/json', enabled: true },
  ];
  const body = data?.body || '{\n  "title": "Local-First Workspace",\n  "completed": false\n}';
  const activeTab = data?.activeTab || 'body';
  const response = data?.response;

  const [isLoading, setIsLoading] = useState(false);
  const [copiedResponse, setCopiedResponse] = useState(false);

  const getMethodColor = (m: string) => {
    switch (m) {
      case 'GET':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'POST':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'PUT':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      case 'PATCH':
        return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
      case 'DELETE':
        return 'text-red-400 bg-red-500/10 border-red-500/30';
      default:
        return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };

  const handleSend = async () => {
    if (!url.trim()) return;

    setIsLoading(true);
    const startTime = performance.now();

    try {
      const headerObj: Record<string, string> = {};
      headers
        .filter((h) => h.enabled && h.key.trim())
        .forEach((h) => {
          headerObj[h.key.trim()] = h.value;
        });

      const options: RequestInit = {
        method,
        headers: headerObj,
      };

      if (['POST', 'PUT', 'PATCH'].includes(method) && body.trim()) {
        options.body = body;
      }

      const res = await fetch(url, options);
      const endTime = performance.now();
      const timeMs = Math.round(endTime - startTime);

      let responseData: any;
      const text = await res.text();
      try {
        responseData = JSON.parse(text);
      } catch {
        responseData = text;
      }

      const sizeBytes = new Blob([text]).size;

      onChange({
        response: {
          status: res.status,
          statusText: res.statusText || (res.ok ? 'OK' : 'Error'),
          timeMs,
          sizeBytes,
          data: responseData,
          ok: res.ok,
        },
      });
    } catch (err: any) {
      const endTime = performance.now();
      onChange({
        response: {
          status: 0,
          statusText: 'Network / CORS Error',
          timeMs: Math.round(endTime - startTime),
          sizeBytes: 0,
          data: {
            error: err?.message || 'Request failed or blocked by CORS browser policy',
            hint: 'For local or non-CORS APIs, use a backend proxy or test with a public JSON endpoint.',
          },
          ok: false,
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddHeader = () => {
    const newHeaders = [...headers, { id: `h-${Date.now()}`, key: '', value: '', enabled: true }];
    onChange({ headers: newHeaders });
  };

  const handleUpdateHeader = (id: string, updates: Partial<ApiHeader>) => {
    const newHeaders = headers.map((h) => (h.id === id ? { ...h, ...updates } : h));
    onChange({ headers: newHeaders });
  };

  const handleDeleteHeader = (id: string) => {
    onChange({ headers: headers.filter((h) => h.id !== id) });
  };

  const handleCopyResponse = () => {
    if (!response) return;
    navigator.clipboard.writeText(
      typeof response.data === 'string' ? response.data : JSON.stringify(response.data, null, 2)
    );
    setCopiedResponse(true);
    setTimeout(() => setCopiedResponse(false), 2000);
  };

  return (
    <div className="rounded-xl border border-app-border bg-app-surface overflow-hidden shadow-card transition-all text-xs">
      {/* Block Header */}
      <div className="px-4 py-2.5 bg-app-sidebar/60 border-b border-app-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-app-muted" />
          <span className="font-semibold text-app-primary">API Client</span>
        </div>
        <span className="text-[10px] text-app-muted">Direct Browser Fetch Engine</span>
      </div>

      {/* URL Input Bar */}
      <div className="p-3 bg-app-bg/50 border-b border-app-border flex items-center gap-2">
        {/* Method Select */}
        <select
          value={method}
          onChange={(e) => onChange({ method: e.target.value as any })}
          className={`px-2.5 py-1.5 rounded-lg border font-mono font-bold text-xs outline-none cursor-pointer ${getMethodColor(
            method
          )}`}
        >
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="PATCH">PATCH</option>
          <option value="DELETE">DELETE</option>
        </select>

        {/* URL Input */}
        <input
          type="text"
          value={url}
          onChange={(e) => onChange({ url: e.target.value })}
          placeholder="https://api.example.com/v1/resource"
          className="flex-1 px-3 py-1.5 rounded-lg bg-app-sidebar border border-app-border font-mono text-xs text-app-primary outline-none focus:border-app-accent"
        />

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-app-accent hover:bg-app-accentHover text-white font-medium shadow-sm transition-colors disabled:opacity-50 shrink-0"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Sending...</span>
            </>
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </>
          )}
        </button>
      </div>

      {/* Request Details Tabs */}
      <div className="px-3 pt-2 bg-app-sidebar/40 border-b border-app-border flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onChange({ activeTab: 'body' })}
            className={`px-3 py-1 rounded-t-lg font-medium transition-colors ${
              activeTab === 'body'
                ? 'bg-app-surface text-app-primary border-t border-x border-app-border font-semibold'
                : 'text-app-muted hover:text-app-primary'
            }`}
          >
            Body (JSON)
          </button>
          <button
            onClick={() => onChange({ activeTab: 'headers' })}
            className={`px-3 py-1 rounded-t-lg font-medium transition-colors ${
              activeTab === 'headers'
                ? 'bg-app-surface text-app-primary border-t border-x border-app-border font-semibold'
                : 'text-app-muted hover:text-app-primary'
            }`}
          >
            Headers ({headers.length})
          </button>
        </div>
      </div>

      {/* Request Tab Body */}
      <div className="p-3 bg-app-surface min-h-[120px]">
        {activeTab === 'body' && (
          <textarea
            value={body}
            onChange={(e) => onChange({ body: e.target.value })}
            placeholder='{\n  "key": "value"\n}'
            rows={5}
            className="w-full p-2.5 rounded-lg bg-app-bg border border-app-border font-mono text-xs text-app-primary outline-none resize-none leading-relaxed"
            spellCheck={false}
          />
        )}

        {activeTab === 'headers' && (
          <div className="space-y-1.5">
            {headers.map((h) => (
              <div key={h.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={h.enabled}
                  onChange={(e) => handleUpdateHeader(h.id, { enabled: e.target.checked })}
                  className="rounded border-app-border text-app-accent"
                />
                <input
                  type="text"
                  placeholder="Header Key (e.g. Authorization)"
                  value={h.key}
                  onChange={(e) => handleUpdateHeader(h.id, { key: e.target.value })}
                  className="flex-1 px-2.5 py-1 rounded bg-app-bg border border-app-border font-mono text-xs text-app-primary outline-none"
                />
                <input
                  type="text"
                  placeholder="Value (e.g. Bearer token)"
                  value={h.value}
                  onChange={(e) => handleUpdateHeader(h.id, { value: e.target.value })}
                  className="flex-1 px-2.5 py-1 rounded bg-app-bg border border-app-border font-mono text-xs text-app-primary outline-none"
                />
                <button
                  onClick={() => handleDeleteHeader(h.id)}
                  className="p-1 text-app-muted hover:text-red-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            <button
              onClick={handleAddHeader}
              className="flex items-center gap-1 text-[11px] text-app-accent hover:underline pt-1"
            >
              <Plus className="w-3 h-3" />
              <span>Add Header</span>
            </button>
          </div>
        )}
      </div>

      {/* Response Viewer Section */}
      {response && (
        <div className="border-t border-app-border bg-app-bg/80 p-3">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-app-border/60">
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] flex items-center gap-1 ${
                  response.ok
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'bg-red-500/10 text-red-400 border border-red-500/30'
                }`}
              >
                {response.ok ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                <span>{response.status} {response.statusText}</span>
              </span>

              <span className="flex items-center gap-1 text-[11px] text-app-muted font-mono">
                <Clock className="w-3 h-3" />
                <span>{response.timeMs} ms</span>
              </span>

              <span className="flex items-center gap-1 text-[11px] text-app-muted font-mono">
                <HardDrive className="w-3 h-3" />
                <span>{response.sizeBytes} B</span>
              </span>
            </div>

            <button
              onClick={handleCopyResponse}
              className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] text-app-muted hover:text-app-primary bg-app-sidebar border border-app-border transition-colors"
            >
              {copiedResponse ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedResponse ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <pre className="p-3 rounded-lg bg-app-surface/90 border border-app-border/80 font-mono text-[11px] text-emerald-400 overflow-auto max-h-[220px] leading-relaxed">
            {typeof response.data === 'string'
              ? response.data
              : JSON.stringify(response.data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
