import { create } from 'zustand';
import { compareService } from '../services/compareService';

export const useCompareStore = create((set, get) => ({
  comparisonData: null,
  loading: false,
  error: null,
  empty: true,

  fetchTryonComparison: async (tryOnId) => {
    set({ loading: true, error: null, empty: false });
    try {
      const data = await compareService.getTryonComparison(tryOnId);
      if (!data || !data.originalImageUrl || !data.generatedImageUrl) {
        set({ empty: true, comparisonData: null });
      } else {
        set({ comparisonData: data, empty: false });
      }
    } catch (error) {
      console.error('Error fetching tryon comparison:', error);
      set({ 
        error: error.response?.data?.detail || error.message || 'Failed to load comparison',
        empty: true,
        comparisonData: null
      });
    } finally {
      set({ loading: false });
    }
  },

  clearComparison: () => {
    set({ comparisonData: null, loading: false, error: null, empty: true });
  }
}));
