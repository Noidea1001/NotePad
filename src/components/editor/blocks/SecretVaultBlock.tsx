'use client';

import React, { useState } from 'react';
import {
  Lock,
  Eye,
  EyeOff,
  Copy,
  Check,
  Plus,
  Trash2,
  Download,
  Upload,
  ShieldCheck,
  FileText,
  KeyRound,
} from 'lucide-react';
import { SecretVaultBlockData, SecretItem } from '../types';

interface SecretVaultBlockProps {
  data?: SecretVaultBlockData;
  onChange: (data: Partial<SecretVaultBlockData>) => void;
}

const DEFAULT_SECRETS: SecretItem[] = [
  { id: '1', key: 'DATABASE_URL', value: 'postgresql://postgres:root@localhost:5432/noteworkspace_dev' },
  { id: '2', key: 'JWT_SIGNING_KEY', value: 'super-secret-encryption-key-for-local-vault-token-3891' },
  { id: '3', key: 'STRIPE_SECRET_KEY', value: 'sk_live_51M0abcdef1234567890abcdefghijklmnopqrstuvwxyz' },
];

export const SecretVaultBlock: React.FC<SecretVaultBlockProps> = ({ data, onChange }) => {
  const secrets = data?.secrets || DEFAULT_SECRETS;
  const globalRevealed = data?.globalRevealed ?? false;

  const [copied, setCopied] = useState(false);
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [rawEnvText, setRawEnvText] = useState('');

  const toggleReveal = (id: string) => {
    setRevealedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleGlobalReveal = () => {
    const next = !globalRevealed;
    onChange({ globalRevealed: next });
    const allState: Record<string, boolean> = {};
    secrets.forEach((s) => {
      allState[s.id] = next;
    });
    setRevealedIds(allState);
  };

  const handleAddSecret = () => {
    const newSecret: SecretItem = {
      id: `sec-${Date.now()}`,
      key: 'NEW_ENV_KEY',
      value: 'secret_value',
    };
    onChange({ secrets: [...secrets, newSecret] });
  };

  const handleUpdateSecret = (id: string, updates: Partial<SecretItem>) => {
    const nextSecrets = secrets.map((s) => (s.id === id ? { ...s, ...updates } : s));
    onChange({ secrets: nextSecrets });
  };

  const handleDeleteSecret = (id: string) => {
    onChange({ secrets: secrets.filter((s) => s.id !== id) });
  };

  const handleCopyAsEnv = () => {
    const envText = secrets.map((s) => `${s.key}=${s.value}`).join('\n');
    navigator.clipboard.writeText(envText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImportEnv = () => {
    if (!rawEnvText.trim()) return;
    const lines = rawEnvText.split('\n');
    const imported: SecretItem[] = [];

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const value = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
        imported.push({
          id: `sec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          key,
          value,
        });
      }
    });

    if (imported.length > 0) {
      onChange({ secrets: [...secrets, ...imported] });
    }
    setRawEnvText('');
    setImportModalOpen(false);
  };

  return (
    <div className="rounded-xl border border-app-border bg-app-surface overflow-hidden shadow-card transition-all text-xs">
      {/* Top Header */}
      <div className="px-4 py-2.5 bg-app-sidebar/60 border-b border-app-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 text-app-muted" />
          <span className="font-semibold text-app-primary">Secret Vault (.env)</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-app-surface border border-app-border text-app-muted flex items-center gap-1">
            <ShieldCheck className="w-2.5 h-2.5 text-app-muted" />
            <span>Masked</span>
          </span>
        </div>

        {/* Global actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleGlobalReveal}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-app-surface border border-app-border text-app-secondary hover:text-app-primary text-[11px] transition-colors"
          >
            {globalRevealed ? (
              <>
                <EyeOff className="w-3 h-3 text-amber-400" />
                <span>Mask All</span>
              </>
            ) : (
              <>
                <Eye className="w-3 h-3 text-app-muted" />
                <span>Reveal All</span>
              </>
            )}
          </button>

          <button
            onClick={() => setImportModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-app-surface border border-app-border text-app-secondary hover:text-app-primary text-[11px] transition-colors"
          >
            <Upload className="w-3 h-3 text-blue-400" />
            <span className="hidden sm:inline">Import .env</span>
          </button>

          <button
            onClick={handleCopyAsEnv}
            className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-app-accent hover:bg-app-accentHover text-white text-[11px] font-medium shadow-sm transition-colors"
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied .env' : 'Copy as .env file'}</span>
          </button>
        </div>
      </div>

      {/* Secrets Table */}
      <div className="divide-y divide-app-border/60 bg-app-bg/50">
        {secrets.map((secret) => {
          const isRevealed = globalRevealed || revealedIds[secret.id];

          return (
            <div
              key={secret.id}
              className="group p-2.5 flex items-center gap-3 hover:bg-app-sidebar/40 transition-colors"
            >
              {/* Key Icon & Input */}
              <div className="flex items-center gap-2 w-1/3 min-w-[140px]">
                <KeyRound className="w-3 h-3 text-app-muted shrink-0" />
                <input
                  type="text"
                  value={secret.key}
                  onChange={(e) => handleUpdateSecret(secret.id, { key: e.target.value })}
                  placeholder="ENV_VARIABLE_NAME"
                  className="w-full bg-transparent border-none outline-none font-mono text-[11px] text-app-primary font-semibold uppercase tracking-wider"
                />
              </div>

              {/* Masked / Revealed Value Input */}
              <div className="flex-1 relative flex items-center">
                <input
                  type={isRevealed ? 'text' : 'password'}
                  value={secret.value}
                  onChange={(e) => handleUpdateSecret(secret.id, { value: e.target.value })}
                  placeholder="secret value"
                  className={`w-full px-2.5 py-1 rounded bg-app-surface border border-app-border/80 font-mono text-[11px] text-app-secondary outline-none transition-all ${
                    !isRevealed ? 'blur-[3px] select-none hover:blur-none' : 'text-emerald-400'
                  }`}
                />
              </div>

              {/* Row Action Buttons */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => toggleReveal(secret.id)}
                  title={isRevealed ? 'Mask value' : 'Reveal value'}
                  className="p-1 rounded text-app-muted hover:text-app-primary hover:bg-app-sidebar transition-colors"
                >
                  {isRevealed ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </button>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(secret.value);
                  }}
                  title="Copy secret value"
                  className="p-1 rounded text-app-muted hover:text-app-primary hover:bg-app-sidebar transition-colors"
                >
                  <Copy className="w-3 h-3" />
                </button>

                <button
                  onClick={() => handleDeleteSecret(secret.id)}
                  title="Delete secret"
                  className="p-1 rounded text-app-muted hover:text-red-400 hover:bg-app-sidebar opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Table Footer */}
      <div className="p-2.5 bg-app-sidebar/40 border-t border-app-border flex items-center justify-between">
        <button
          onClick={handleAddSecret}
          className="flex items-center gap-1.5 text-xs text-app-accent hover:underline font-medium px-1"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Secret Key</span>
        </button>

        <span className="text-[11px] text-app-muted font-mono">
          {secrets.length} secrets configured
        </span>
      </div>

      {/* Raw .env Import Modal */}
      {importModalOpen && (
        <div
          onClick={() => setImportModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-100"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-xl bg-app-surface border border-app-border p-4 shadow-2xl space-y-3"
          >
            <h3 className="text-xs font-semibold text-app-primary flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5 text-app-accent" />
              <span>Import Raw .env Text</span>
            </h3>

            <textarea
              autoFocus
              rows={8}
              value={rawEnvText}
              onChange={(e) => setRawEnvText(e.target.value)}
              placeholder="DATABASE_URL=postgres://...\nJWT_SECRET=abc...\nAPI_KEY=xyz..."
              className="w-full p-2.5 rounded-lg bg-app-bg border border-app-border font-mono text-xs text-app-primary outline-none resize-none leading-relaxed"
            />

            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setImportModalOpen(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-app-muted hover:text-app-primary"
              >
                Cancel
              </button>
              <button
                onClick={handleImportEnv}
                className="px-3.5 py-1.5 rounded-lg bg-app-accent hover:bg-app-accentHover text-white text-xs font-medium"
              >
                Parse & Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
