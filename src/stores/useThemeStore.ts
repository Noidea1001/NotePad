import { create } from 'zustand';
import { ThemeId, FontId } from '@/types';

interface ThemeDefinition {
  id: ThemeId;
  name: string;
  description: string;
  previewBg: string;
  previewAccent: string;
  isDark: boolean;
}

export const THEME_PRESETS: Record<ThemeId, ThemeDefinition> = {
  'vscode-dark': {
    id: 'vscode-dark',
    name: 'VS Code Dark',
    description: 'Deep slate #1e1e1e with electric blue accents',
    previewBg: '#1e1e1e',
    previewAccent: '#007acc',
    isDark: true,
  },
  'dracula': {
    id: 'dracula',
    name: 'Dracula Pro',
    description: 'Dark purple-gray #282a36 with neon pink & cyan accents',
    previewBg: '#282a36',
    previewAccent: '#ff79c6',
    isDark: true,
  },
  'glass-modern': {
    id: 'glass-modern',
    name: 'Glass Modern',
    description: 'Frosted glass with backdrop-blur-xl and luminous gradients',
    previewBg: '#0f172a',
    previewAccent: '#818cf8',
    isDark: true,
  },
  'minimal-paper': {
    id: 'minimal-paper',
    name: 'Minimal Paper',
    description: 'Warm daylight #fbfbfa with crisp high-contrast ink',
    previewBg: '#fbfbfa',
    previewAccent: '#2563eb',
    isDark: false,
  },
};

export const FONT_PRESETS: Record<FontId, { id: FontId; name: string; description: string; family: string }> = {
  'sans': {
    id: 'sans',
    name: 'Modern Sans',
    description: 'Inter / System typography for crisp readability',
    family: 'var(--font-sans)',
  },
  'mono': {
    id: 'mono',
    name: 'Developer Mono',
    description: 'JetBrains Mono / Code editor monospace feel',
    family: 'var(--font-mono)',
  },
  'bilingual': {
    id: 'bilingual',
    name: 'Bilingual (Kantumruy + Inter)',
    description: 'Harmonious Latin & Khmer dual typography',
    family: 'var(--font-bilingual)',
  },
};

interface ThemeState {
  theme: ThemeId;
  font: FontId;
  setTheme: (theme: ThemeId) => void;
  setFont: (font: FontId) => void;
  cycleTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'vscode-dark',
  font: 'sans',
  setTheme: (theme: ThemeId) => {
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('dev-workspace-theme', theme);
    }
    set({ theme });
  },
  setFont: (font: FontId) => {
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute('data-font', font);
      localStorage.setItem('dev-workspace-font', font);
    }
    set({ font });
  },
  cycleTheme: () => {
    const themeKeys: ThemeId[] = ['vscode-dark', 'dracula', 'glass-modern', 'minimal-paper'];
    const currentIndex = themeKeys.indexOf(get().theme);
    const nextIndex = (currentIndex + 1) % themeKeys.length;
    get().setTheme(themeKeys[nextIndex]);
  },
}));
