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

  generateMatches: async (analysisId = null) => {
    set({ isLoading: true, error: null });
    try {
      const data = await celebrityMatchService.generateMatches(analysisId);
      set({ 
        matches: data.matches || [], 
        isLoading: false,
        error: null
      });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.message || 'Failed to generate celebrity matches'
      });
    }
  },

  clearError: () => set({ error: null }),
}));
