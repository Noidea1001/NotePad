import { create } from 'zustand';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  color: string;
  provider: 'google' | 'github' | 'email' | 'guest';
}

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  token: string | null;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  login: (profile: UserProfile, token?: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  token: null,
  isAuthModalOpen: false,

  openAuthModal: () => set({ isAuthModalOpen: true }),
  closeAuthModal: () => set({ isAuthModalOpen: false }),

  login: (profile, token = 'jwt-mock-sync-token') => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('noteworkspace-auth-user', JSON.stringify(profile));
      localStorage.setItem('noteworkspace-auth-token', token);
    }
    set({ user: profile, isAuthenticated: true, token, isAuthModalOpen: false });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('noteworkspace-auth-user');
      localStorage.removeItem('noteworkspace-auth-token');
    }
    set({ user: null, isAuthenticated: false, token: null });
  },
}));
