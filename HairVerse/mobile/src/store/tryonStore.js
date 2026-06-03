import { create } from 'zustand';
import { tryonService } from '../services/tryonService';

export const useTryonStore = create((set) => ({
  sessions: [],
  total: 0,
  isLoading: false,
  error: null,

  fetchSessions: async () => {
    try {
      set({ isLoading: true, error: null });
      const data = await tryonService.fetchContinueSessions();
      set({ 
        sessions: data.sessions || [], 
        total: data.total || 0,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error.message || 'Failed to fetch try-on sessions', 
        isLoading: false 
      });
    }
  },
  
  clearStore: () => {
    set({ sessions: [], total: 0, isLoading: false, error: null });
  }
}));
