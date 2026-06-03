import { create } from 'zustand';
import { aiInsightsService } from '../services/aiInsightsService';

export const useAIInsightsStore = create((set) => ({
  insights: [],
  status: 'pending',
  isLoading: false,
  error: null,

  fetchInsights: async () => {
    try {
      set({ isLoading: true, error: null });
      const data = await aiInsightsService.fetchAIInsights();
      set({ 
        insights: data.insights || [], 
        status: data.status || 'pending',
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error.message || 'Failed to fetch AI insights', 
        isLoading: false 
      });
    }
  },
  
  clearStore: () => {
    set({ insights: [], status: 'pending', isLoading: false, error: null });
  }
}));
