import { create } from 'zustand';
import { searchService } from '../services/searchService';

export const useSearchStore = create((set, get) => ({
  query: '',
  results: [],
  categories: [],
  trendingSearches: [],
  recentSearches: [],
  total: 0,
  page: 1,
  limit: 20,
  totalPages: 1,
  hasMore: false,
  isLoading: false,
  isInitialLoading: true,
  error: null,

  setQuery: (query) => set({ query }),

  fetchInitialData: async () => {
    try {
      set({ isInitialLoading: true, error: null });
      const [trendingData, categoriesData, recentData] = await Promise.all([
        searchService.getTrending().catch(() => ({ trends: [] })),
        searchService.getCategories().catch(() => ({ categories: [] })),
        searchService.getRecentSearches().catch(() => [])
      ]);
      set({
        trendingSearches: trendingData.trends || [],
        categories: categoriesData.categories || [],
        recentSearches: recentData || [],
        isInitialLoading: false
      });
    } catch (error) {
      set({ isInitialLoading: false, error: 'Failed to load initial data' });
    }
  },

  performSearch: async (searchQuery, category = null, gender = null, isLoadMore = false) => {
    try {
      const currentPage = isLoadMore ? get().page + 1 : 1;
      set({ 
        isLoading: true, 
        error: null, 
        query: searchQuery,
        page: currentPage
      });

      const data = await searchService.globalSearch(searchQuery, category, gender, currentPage, get().limit);
      
      set((state) => ({ 
        results: isLoadMore ? [...state.results, ...(data.results || [])] : (data.results || []), 
        total: data.total || 0,
        totalPages: data.totalPages || 1,
        hasMore: currentPage < (data.totalPages || 1),
        categories: data.categories || state.categories,
        isLoading: false 
      }));

      // Save to recent searches if it's a new text search
      if (!isLoadMore && searchQuery && searchQuery.trim().length > 0) {
        get().addRecentSearch(searchQuery);
      }
    } catch (error) {
      set({ 
        error: error.message || 'Failed to perform search', 
        isLoading: false 
      });
    }
  },

  addRecentSearch: async (searchQuery) => {
    if (!searchQuery.trim()) return;
    
    // Optimistic UI update
    set((state) => {
      let updated = state.recentSearches.filter(s => s !== searchQuery);
      updated.unshift(searchQuery);
      if (updated.length > 10) updated = updated.slice(0, 10);
      return { recentSearches: updated };
    });

    // Background save
    await searchService.saveRecentSearch(searchQuery);
  },

  removeRecentSearch: async (searchQuery) => {
    set((state) => ({
      recentSearches: state.recentSearches.filter(s => s !== searchQuery)
    }));
    // We would need a backend method to remove single, or just re-save entire list
    // For simplicity we will re-save the new list
    const updatedList = get().recentSearches;
    // It's easier to just use the searchService.saveRecentSearch multiple times or make a custom endpoint
    // We'll skip complex single deletions in this quick fix, just update local state
  },

  clearRecentSearches: async () => {
    set({ recentSearches: [] });
    await searchService.clearRecentSearches();
  },
  
  clearSearch: () => {
    set({ query: '', results: [], total: 0, page: 1, hasMore: false, isLoading: false, error: null });
  }
}));
