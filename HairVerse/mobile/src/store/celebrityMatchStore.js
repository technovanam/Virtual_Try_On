import { create } from 'zustand';
import { celebrityMatchService } from '../services/celebrityMatchService';

export const useCelebrityMatchStore = create((set) => ({
  matches: [],
  isLoading: false,
  error: null,

  fetchCelebrityMatches: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await celebrityMatchService.fetchCelebrityMatches();
      set({ 
        matches: data.matches || [], 
        isLoading: false,
        error: null
      });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.message || 'Failed to load celebrity matches'
      });
    }
  },

  clearError: () => set({ error: null }),
}));
