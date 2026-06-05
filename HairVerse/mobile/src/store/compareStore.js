import { create } from 'zustand';
import { compareService } from '../services/compareService';

export const useCompareStore = create((set, get) => ({
  comparisons: [],
  currentComparison: null,
  status: 'idle', // idle, loading, generating, success, empty, error
  error: null,

  fetchComparisons: async () => {
    try {
      set({ status: 'loading', error: null });
      const data = await compareService.getComparisons();
      if (!data.comparisons || data.comparisons.length === 0) {
        set({ status: 'empty', comparisons: [] });
      } else {
        set({ status: 'success', comparisons: data.comparisons });
      }
    } catch (error) {
      set({ status: 'error', error: error.message || 'Failed to fetch comparisons' });
    }
  },

  fetchComparisonById: async (comparisonId) => {
    try {
      set({ status: 'loading', error: null });
      const data = await compareService.getComparisonById(comparisonId);
      set({ status: 'success', currentComparison: data.comparison });
    } catch (error) {
      set({ status: 'error', error: error.message || 'Failed to fetch comparison' });
    }
  },

  createComparison: async (comparisonType, items) => {
    try {
      set({ status: 'generating', error: null });
      const data = await compareService.createComparison(comparisonType, items);
      set({ status: 'success', currentComparison: data.comparison });
      get().fetchComparisons(); // Refresh list
    } catch (error) {
      set({ status: 'error', error: error.response?.data?.detail || error.message || 'Failed to create comparison' });
    }
  },

  deleteComparison: async (comparisonId) => {
    try {
      await compareService.deleteComparison(comparisonId);
      set((state) => ({
        comparisons: state.comparisons.filter(c => c.comparisonId !== comparisonId),
        currentComparison: state.currentComparison?.comparisonId === comparisonId ? null : state.currentComparison
      }));
    } catch (error) {
      console.error('Failed to delete comparison:', error);
    }
  },
  
  clearStore: () => {
    set({ comparisons: [], currentComparison: null, status: 'idle', error: null });
  }
}));
