import { create } from 'zustand';
import { savedService } from '../services/savedService';

export const useSavedStore = create((set, get) => ({
  items: [],
  isLoading: false,
  error: null,
  
  fetchSavedItems: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await savedService.fetchSavedItems();
      set({ items: data.items || [], isLoading: false });
    } catch (error) {
      set({ error: error.message || 'Failed to fetch saved items', isLoading: false });
    }
  },

  saveItem: async (itemData) => {
    try {
      const newItem = await savedService.createSavedItem(itemData);
      set((state) => ({ items: [newItem, ...state.items] }));
      return newItem;
    } catch (error) {
      console.error('Failed to save item', error);
      throw error;
    }
  },

  deleteItem: async (savedId) => {
    try {
      await savedService.deleteSavedItem(savedId);
      set((state) => ({
        items: state.items.filter(item => item.savedId !== savedId)
      }));
    } catch (error) {
      console.error('Failed to delete item', error);
      throw error;
    }
  }
}));
