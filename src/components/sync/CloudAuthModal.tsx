'use client';

import React, { useState } from 'react';
import {
  X,
  Cloud,
  Lock,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  HardDrive,
  Github,
} from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useWorkspaceStore } from '@/stores/useWorkspaceStore';
import { DynamicSyncManager } from '@/sync/SyncProvider';

export const CloudAuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, login } = useAuthStore();
  const { activePageId } = useWorkspaceStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authMethod, setAuthMethod] = useState<'options' | 'email'>('options');

  if (!isAuthModalOpen) return null;

  const handleOAuthLogin = (provider: 'google' | 'github') => {
    setIsSubmitting(true);
    setTimeout(() => {
      login({
        id: `user-${Date.now()}`,
        name: provider === 'google' ? 'Alex R. (Google)' : 'AlexDev (GitHub)',
        email: provider === 'google' ? 'alex.rivera@gmail.com' : 'alex@github.com',
        color: provider === 'google' ? '#3b82f6' : '#8b5cf6',
        provider,
      });

      // Attach cloud sync dynamically without data loss
      if (activePageId) {
        DynamicSyncManager.connectCloudSync(activePageId);
      }
      setIsSubmitting(false);
    }, 600);
  };

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    setTimeout(() => {
      login({
        id: `user-${Date.now()}`,
        name: email.split('@')[0],
        email,
        color: '#10b981',
        provider: 'email',
      });

      if (activePageId) {
        DynamicSyncManager.connectCloudSync(activePageId);
      }
      setIsSubmitting(false);
    }, 600);
  };

  return (
    <div
      onClick={closeAuthModal}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl bg-app-surface border border-app-border shadow-2xl overflow-hidden flex flex-col text-app-primary animate-in zoom-in-95 duration-150 text-xs"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-app-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Cloud className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-app-primary">Cloud Sync & Collaboration</h2>
              <p className="text-[11px] text-app-muted">Local-first data with zero lock-in</p>
            </div>
          </div>
          <button
            onClick={closeAuthModal}
            className="p-1 rounded-md text-app-muted hover:text-app-primary hover:bg-app-sidebar transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {/* Privacy Guarantee Pill */}
          <div className="p-3 rounded-xl bg-app-sidebar/80 border border-app-border flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-semibold text-app-primary text-[11px]">Local-First Durability</p>
              <p className="text-[10px] text-app-secondary leading-relaxed">
                Signing in enables real-time peer presence and cloud backup. All your existing local IndexedDB notes remain safe on your device.
              </p>
            </div>
          </div>

          {authMethod === 'options' ? (
            <div className="space-y-2.5 pt-1">
              {/* Google Login */}
              <button
                onClick={() => handleOAuthLogin('google')}
                disabled={isSubmitting}
                className="w-full py-2 px-3 rounded-lg border border-app-border bg-app-card hover:bg-app-sidebar flex items-center justify-center gap-2 text-xs font-semibold text-app-primary transition-colors shadow-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* GitHub Login */}
              <button
                onClick={() => handleOAuthLogin('github')}
                disabled={isSubmitting}
                className="w-full py-2 px-3 rounded-lg border border-app-border bg-app-card hover:bg-app-sidebar flex items-center justify-center gap-2 text-xs font-semibold text-app-primary transition-colors shadow-sm"
              >
                <Github className="w-4 h-4 text-app-primary" />
                <span>Continue with GitHub</span>
              </button>

              <div className="relative py-2 flex items-center justify-center">
                <div className="border-t border-app-border w-full" />
                <span className="bg-app-surface px-2 text-[10px] text-app-muted absolute uppercase">
                  or
                </span>
              </div>

              {/* Email Login Button */}
              <button
                onClick={() => setAuthMethod('email')}
                className="w-full py-2 px-3 rounded-lg border border-app-border/80 bg-app-sidebar/40 hover:bg-app-sidebar flex items-center justify-center gap-2 text-xs text-app-secondary hover:text-app-primary transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Continue with Email & Password</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleEmailLogin} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-app-muted uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  autoFocus
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="developer@company.com"
                  className="w-full px-3 py-1.5 rounded-lg bg-app-sidebar border border-app-border text-xs text-app-primary outline-none focus:border-app-accent"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-app-muted uppercase tracking-wider mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-1.5 rounded-lg bg-app-sidebar border border-app-border text-xs text-app-primary outline-none focus:border-app-accent"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => setAuthMethod('options')}
                  className="text-[11px] text-app-muted hover:text-app-primary"
                >
                  &larr; Back to options
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 rounded-lg bg-app-accent hover:bg-app-accentHover text-white font-medium shadow-sm transition-colors"
                >
                  {isSubmitting ? 'Authenticating...' : 'Sign In & Sync'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-app-sidebar/40 border-t border-app-border flex items-center justify-between text-[11px] text-app-muted">
          <span className="flex items-center gap-1">
            <HardDrive className="w-3 h-3" />
            <span>Local Mode Available Forever</span>
          </span>
          <button
            onClick={closeAuthModal}
            className="hover:underline text-app-secondary"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
};
