import { create } from 'zustand';
import { savedCollectionsService } from '../services/savedCollectionsService';

export const useSavedCollectionsStore = create((set, get) => ({
  collections: [],
  total: 0,
  isLoading: false,
  error: null,

  fetchCollections: async () => {
    try {
      set({ isLoading: true, error: null });
      const data = await savedCollectionsService.fetchSavedCollections();
      set({ 
        collections: data.collections || [], 
        total: data.total || 0,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error.message || 'Failed to fetch saved collections', 
        isLoading: false 
      });
    }
  },
  
  clearStore: () => {
    set({ collections: [], total: 0, isLoading: false, error: null });
  }
}));
