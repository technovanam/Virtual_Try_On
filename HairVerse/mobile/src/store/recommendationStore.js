import { create } from 'zustand';
import { recommendationService } from '../services/recommendationService';

export const useRecommendationStore = create((set, get) => ({
  summary: '',
  recommendations: [],
  hairColors: [],
  beards: [],
  celebrities: [],
  trending: [],
  
  // Filter and Search States
  searchQuery: '',
  activeCategory: 'All', // 'All', 'Short', 'Medium', 'Long', etc.

  isGenerating: false,
  isLoading: false,
  error: null,
  status: 'idle', // 'idle', 'loading', 'success', 'empty', 'error'

  setSearchQuery: (query) => set({ searchQuery: query }),
  setActiveCategory: (category) => set({ activeCategory: category }),

  fetchRecommendations: async () => {
    set({ isLoading: true, error: null, status: 'loading' });
    try {
      const data = await recommendationService.fetchRecommendations();
      // data should now be the full object: { summary, recommendations, hairColors, beards, celebrities, trending }
      set({ 
        summary: data?.summary || '',
        recommendations: data?.recommendations || [],
        hairColors: data?.hairColors || [],
        beards: data?.beards || [],
        celebrities: data?.celebrities || [],
        trending: data?.trending || [],
        status: (data?.recommendations?.length > 0) ? 'success' : 'empty',
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

  generateRecommendations: async (analysisId = null) => {
    set({ isGenerating: true, error: null, status: 'loading' });
    try {
      const data = await recommendationService.generateRecommendations(analysisId);
      set({ 
        summary: data?.summary || '',
        recommendations: data?.recommendations || [],
        hairColors: data?.hairColors || [],
        beards: data?.beards || [],
        celebrities: data?.celebrities || [],
        trending: data?.trending || [],
        status: (data?.recommendations?.length > 0) ? 'success' : 'empty',
        isGenerating: false,
        error: null
      });
    } catch (error) {
      set({ 
        isGenerating: false, 
        error: error.message || 'Failed to generate recommendations',
        status: 'error'
      });
    }
  },

  clearError: () => set({ error: null, status: 'idle' }),
  reset: () => set({ 
    summary: '', recommendations: [], hairColors: [], beards: [], celebrities: [], trending: [],
    searchQuery: '', activeCategory: 'All',
    isGenerating: false, isLoading: false, error: null, status: 'idle' 
  }),
}));
