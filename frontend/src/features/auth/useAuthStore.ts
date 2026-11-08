import { create } from 'zustand';
import { UserSummary, login as apiLogin, getCurrentUser } from '../../api/auth.api';

interface AuthState {
  user: UserSummary | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  initialize: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  // Boundary 7: Read token from sessionStorage on startup
  token: typeof window !== 'undefined' ? sessionStorage.getItem('ssip_auth_token') : null,
  isLoading: true,
  error: null,

  clearError: () => set({ error: null }),

  login: async (username: string, password: string): Promise<boolean> => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiLogin({ username, password });
      // Boundary 7: Store short-lived token in sessionStorage
      sessionStorage.setItem('ssip_auth_token', data.access_token);
      set({
        token: data.access_token,
        user: data.user,
        isLoading: false,
        error: null,
      });
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || err.message || 'Authentication failed';
      set({ error: msg, isLoading: false });
      return false;
    }
  },

  logout: () => {
    // Boundary 7: Wipe token from sessionStorage and user from memory
    sessionStorage.removeItem('ssip_auth_token');
    set({ user: null, token: null, isLoading: false, error: null });
  },

  initialize: async () => {
    const token = sessionStorage.getItem('ssip_auth_token');
    if (!token) {
      set({ isLoading: false, user: null, token: null });
      return;
    }

    try {
      const user = await getCurrentUser();
      set({ user, token, isLoading: false, error: null });
    } catch {
      // Token expired or invalid
      sessionStorage.removeItem('ssip_auth_token');
      set({ user: null, token: null, isLoading: false });
    }
  },
}));

