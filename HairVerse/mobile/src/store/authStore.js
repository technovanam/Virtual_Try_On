import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isAnalyzing: false,

  login: async (email, password) => {
    // Mock login for now
    set({ user: { email, uid: 'mock-uid-123', name: 'John Doe' }, isAuthenticated: true });
    return true;
  },

  logout: async () => {
    set({ user: null, isAuthenticated: false });
  },

  register: async (email, password, username) => {
    set({ user: { email, uid: 'mock-uid-123', name: username }, isAuthenticated: true });
    return true;
  }
}));
