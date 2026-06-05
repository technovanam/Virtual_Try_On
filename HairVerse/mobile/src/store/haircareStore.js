import { create } from 'zustand';
import { haircareService } from '../services/haircareService';

export const useHaircareStore = create((set) => ({
  suggestions: [],
  isGenerating: false,
  isLoading: false,
  error: null,
  status: 'idle', // 'idle', 'loading', 'success', 'empty', 'error'

  fetchSuggestions: async () => {
    set({ isLoading: true, error: null, status: 'loading' });
    try {
      const data = await haircareService.fetchSuggestions();
      set({ 
        suggestions: data, 
        status: data.length > 0 ? 'success' : 'empty',
        isLoading: false,
        error: null
      });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.message || 'Failed to load haircare suggestions',
        status: 'error'
      });
    }
  },

  generateSuggestions: async (context = null) => {
    set({ isGenerating: true, error: null, status: 'loading' });
    try {
      const data = await haircareService.generateSuggestions(context);
      set({ 
        suggestions: data, 
        status: data.length > 0 ? 'success' : 'empty',
        isGenerating: false,
        error: null
      });
    } catch (error) {
      set({ 
        isGenerating: false, 
        error: error.message || 'Failed to generate haircare suggestions',
        status: 'error'
      });
    }
  },

  clearError: () => set({ error: null, status: 'idle' }),
  reset: () => set({ suggestions: [], isGenerating: false, isLoading: false, error: null, status: 'idle' }),
}));
