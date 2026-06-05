import { create } from 'zustand';
import { recommendationEngineService } from '../services/recommendationEngineService';

export const useRecommendationEngineStore = create((set, get) => ({
  recommendationData: null,
  recommendationId: null,
  status: 'idle', // idle, loading, pending, completed, error
  error: null,

  generateRecommendation: async (payload) => {
    set({ status: 'loading', error: null });
    try {
      const data = await recommendationEngineService.generateRecommendation(payload);
      set({ 
        recommendationId: data.recommendationId, 
        status: data.status || 'pending',
        recommendationData: data
      });
      return data;
    } catch (error) {
      set({ status: 'error', error: error.message });
      throw error;
    }
  },

  fetchRecommendation: async (recommendationId) => {
    set({ status: 'loading', error: null });
    try {
      const currentId = recommendationId || get().recommendationId;
      if (!currentId) throw new Error("No recommendationId provided");

      const data = await recommendationEngineService.getRecommendation(currentId);
      set({ 
        recommendationData: data,
        status: data.status === 'completed' ? 'completed' : 'pending' 
      });
      return data;
    } catch (error) {
      set({ status: 'error', error: error.message });
      throw error;
    }
  },
  
  reset: () => {
    set({ recommendationData: null, recommendationId: null, status: 'idle', error: null });
  }
}));
