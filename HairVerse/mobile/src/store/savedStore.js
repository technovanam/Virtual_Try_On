import { create } from 'zustand';
import { savedService } from '../services/savedService';

export const useSavedStore = create((set, get) => ({
  items: [],
  isLoading: false,
  error: null,
  
  // Filter state
  searchQuery: '',
  sortBy: 'newest', // newest, oldest, highest_match, most_viewed
  activeTab: 'favorites', // favorites, history, comparison, haircolor, beardstyle
  activeCategory: 'All', // 'All', 'Korean Styles', etc.

  setSearchQuery: (query) => set({ searchQuery: query }),
  setSortBy: (sort) => set({ sortBy: sort }),
  setActiveTab: (tab) => set({ activeTab: tab, activeCategory: 'All' }), // reset category on tab switch
  setActiveCategory: (cat) => set({ activeCategory: cat }),

  fetchSavedItems: async () => {
    try {
      set({ isLoading: true, error: null });
      const data = await savedService.getSavedItems();
      set({ items: data.items, isLoading: false });
    } catch (error) {
      set({ error: error.message || 'Failed to fetch items', isLoading: false });
    }
  },

  updateItemCategory: async (savedId, newCategory) => {
    try {
      const updated = await savedService.updateSavedItem(savedId, { category: newCategory });
      set(state => ({
        items: state.items.map(item => item.savedId === savedId ? updated : item)
      }));
    } catch (error) {
      console.error('Failed to update category', error);
    }
  },

  deleteItem: async (savedId) => {
    try {
      await savedService.deleteSavedItem(savedId);
      set(state => ({ items: state.items.filter(i => i.savedId !== savedId) }));
    } catch (error) {
      console.error('Failed to delete item', error);
    }
  },

  // Getters for computed state
  getFilteredItems: () => {
    const { items, searchQuery, sortBy, activeTab, activeCategory } = get();
    
    let result = [...items];

    // 1. Tab Filtering
    if (activeTab === 'history') {
      result = result.filter(i => i.itemType === 'tryon');
    } else if (activeTab === 'comparison') {
      result = result.filter(i => i.itemType === 'comparison');
    } else if (activeTab === 'haircolor') {
      result = result.filter(i => i.itemType === 'haircolor');
    } else if (activeTab === 'beardstyle') {
      result = result.filter(i => i.itemType === 'beardstyle');
    } else {
      // favorites tab implicitly shows everything or items with category 'Favorites'
      // We will just show everything not explicitly filtered out
    }

    // 2. Category Filtering
    if (activeCategory !== 'All') {
      result = result.filter(i => i.category === activeCategory);
    }

    // 3. Search Filtering
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(i => i.title.toLowerCase().includes(q) || i.category.toLowerCase().includes(q));
    }

    // 4. Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'newest': return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest': return new Date(a.createdAt) - new Date(b.createdAt);
        case 'highest_match': return b.matchScore - a.matchScore;
        case 'most_viewed': return b.viewCount - a.viewCount;
        default: return 0;
      }
    });

    return result;
  },

  getUniqueCategories: () => {
    const { items } = get();
    const categories = new Set(items.map(i => i.category));
    return ['All', ...Array.from(categories).filter(c => c && c !== 'All')];
  }
}));
