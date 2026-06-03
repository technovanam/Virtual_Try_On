import { create } from 'zustand';
import { searchService } from '../services/searchService';

export const useSearchStore = create((set) => ({
  query: '',
  results: [],
  categories: [],
  total: 0,
  isLoading: false,
  error: null,

  setQuery: (query) => set({ query }),

  performSearch: async (searchQuery) => {
    try {
      set({ isLoading: true, error: null, query: searchQuery });
      const data = await searchService.globalSearch(searchQuery);
      set({ 
        results: data.results || [], 
        total: data.total || 0,
        categories: data.categories || [],
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error.message || 'Failed to perform search', 
        isLoading: false 
      });
    }
  },
  
  clearSearch: () => {
    set({ query: '', results: [], categories: [], total: 0, isLoading: false, error: null });
  }
}));
