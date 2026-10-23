import { create } from 'zustand';
import { User } from '@/lib/api';

interface ExtendedUser extends User {
  subscriptionPlan?: 'free' | 'pro' | 'elite';
  subscriptionStatus?: string;
  avatar?: string;
  height?: number;
  weight?: number;
  fitnessGoal?: string;
  role?: 'user' | 'admin';
}

interface AuthState {
  user: ExtendedUser | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: ExtendedUser, token: string) => void;
  clearAuth: () => void;
  initAuth: () => void;
  updateUser: (updates: Partial<ExtendedUser>) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  setAuth: (user, token) => {
    localStorage.setItem('token', token);
    set({ user, token, isAuthenticated: true });
  },
  clearAuth: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  },
  initAuth: () => {
    const token = localStorage.getItem('token');
    if (token) {
      set({ token, isAuthenticated: true });
    }
  },
  updateUser: (updates) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    }));
  },
}));
