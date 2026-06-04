import { create } from 'zustand';
import { recommendationService } from '../services/recommendationService';

export const useRecommendationStore = create((set) => ({
  recommendations: [],
  total: 0,
  generatedAt: null,
  isLoading: false,
  error: null,
  status: 'idle',

  fetchRecommendations: async () => {
    set({ isLoading: true, error: null, status: 'loading' });
    try {
      const data = await recommendationService.fetchRecommendations();
      set({ 
        recommendations: data.recommendations || [], 
        total: data.total || 0,
        generatedAt: data.generatedAt,
        status: data.recommendations?.length > 0 ? 'success' : 'empty',
        isLoading: false,
        error: null
      });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.message || 'Failed to load recommendations',
        status: 'error'
      });
    }
  },

  clearError: () => set({ error: null, status: 'idle' }),
  reset: () => set({ recommendations: [], total: 0, generatedAt: null, isLoading: false, error: null, status: 'idle' }),
}));
