import { create } from 'zustand';
import { hairInsightsService } from '../services/hairInsightsService';

export const useHairInsightsStore = create((set, get) => ({
  insights: null,
  history: [],
  status: 'idle', // idle, loading, generating, success, empty, error
  error: null,

  fetchInsights: async () => {
    try {
      set({ status: 'loading', error: null });
      const data = await hairInsightsService.getInsights();
      if (data.status === 'empty') {
        set({ status: 'empty', insights: null });
      } else {
        set({ status: 'success', insights: data.insights });
      }
    } catch (error) {
      set({ status: 'error', error: error.message || 'Failed to fetch insights' });
    }
  },

  fetchHistory: async () => {
    try {
      const data = await hairInsightsService.getHistory();
      set({ history: data.history || [] });
    } catch (error) {
      console.error('Failed to fetch history:', error);
    }
  },

  generateInsights: async () => {
    try {
      set({ status: 'generating', error: null });
      const data = await hairInsightsService.generateInsights();
      set({ status: 'success', insights: data.insights });
      
      // Also refresh history
      get().fetchHistory();
    } catch (error) {
      set({ status: 'error', error: error.response?.data?.detail || error.message || 'Failed to generate insights' });
    }
  },
  
  clearStore: () => {
    set({ insights: null, history: [], status: 'idle', error: null });
  }
}));
