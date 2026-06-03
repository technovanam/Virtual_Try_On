import { create } from 'zustand';
import { historyService } from '../services/historyService';

export const useHistoryStore = create((set) => ({
  historyItems: [],
  total: 0,
  isLoading: false,
  error: null,
  status: 'idle',

  fetchRecentHistory: async () => {
    set({ isLoading: true, error: null, status: 'loading' });
    try {
      const data = await historyService.fetchRecentHistory();
      set({ 
        historyItems: data.items || [], 
        total: data.total || 0,
        status: 'success',
        isLoading: false,
        error: null
      });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.message || 'Failed to load history',
        status: 'error'
      });
    }
  },

  clearError: () => set({ error: null, status: 'idle' }),
}));
