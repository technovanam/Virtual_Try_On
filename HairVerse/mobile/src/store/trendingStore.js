import { create } from 'zustand';
import { trendingService } from '../services/trendingService';

export const useTrendingStore = create((set) => ({
  hairstyles: [],
  isLoading: false,
  error: null,
  lastUpdated: null,

  fetchTrendingHairstyles: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await trendingService.fetchTrendingHairstyles();
      set({ 
        hairstyles: data.hairstyles || [], 
        lastUpdated: data.updatedAt,
        isLoading: false,
        error: null
      });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.message || 'Failed to load trending hairstyles'
      });
    }
  },

  clearError: () => set({ error: null }),
}));
