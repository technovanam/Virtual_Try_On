import { create } from 'zustand';
import { hairstyleService } from '../services/hairstyleService';

export const useHairstyleStore = create((set, get) => ({
  hairstyles: [],
  categories: [],
  trending: [],
  selectedHairstyle: null,
  
  status: 'idle', // 'idle' | 'loading' | 'success' | 'error' | 'empty'
  error: null,
  
  nextCursor: null,
  hasMore: false,

  fetchHairstyles: async (params = {}, loadMore = false) => {
    set({ status: 'loading', error: null });
    try {
      const currentCursor = loadMore ? get().nextCursor : null;
      const fetchParams = { ...params, cursor: currentCursor };
      
      const response = await hairstyleService.fetchHairstyles(fetchParams);
      const { hairstyles, nextCursor } = response;
      
      const newHairstyles = loadMore ? [...get().hairstyles, ...hairstyles] : hairstyles;
      
      if (newHairstyles.length === 0) {
        set({ hairstyles: [], nextCursor: null, hasMore: false, status: 'empty' });
      } else {
        set({ 
          hairstyles: newHairstyles, 
          nextCursor, 
          hasMore: !!nextCursor, 
          status: 'success' 
        });
      }
    } catch (error) {
      set({ status: 'error', error: error.message });
    }
  },

  fetchHairstyleById: async (hairstyleId) => {
    set({ status: 'loading', error: null });
    try {
      const details = await hairstyleService.fetchHairstyleById(hairstyleId);
      if (!details || Object.keys(details).length === 0) {
        set({ selectedHairstyle: null, status: 'empty' });
      } else {
        set({ selectedHairstyle: details, status: 'success' });
      }
    } catch (error) {
      set({ status: 'error', error: error.message });
    }
  },

  fetchCategories: async () => {
    try {
      const categories = await hairstyleService.fetchCategories();
      set({ categories });
    } catch (error) {
      console.error('Failed to fetch categories', error);
    }
  },

  fetchTrending: async (limit = 20) => {
    try {
      const trending = await hairstyleService.fetchTrending(limit);
      set({ trending });
    } catch (error) {
      console.error('Failed to fetch trending', error);
    }
  },

  resetStore: () => set({
    hairstyles: [],
    categories: [],
    trending: [],
    selectedHairstyle: null,
    status: 'idle',
    error: null,
    nextCursor: null,
    hasMore: false
  })
}));
