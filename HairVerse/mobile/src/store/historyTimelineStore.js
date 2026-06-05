import { create } from 'zustand';
import { historyTimelineService } from '../services/historyTimelineService';

export const useHistoryTimelineStore = create((set, get) => ({
  events: [],
  loading: false,
  loadingMore: false,
  error: null,
  nextCursor: null,
  hasMore: true,
  filterType: 'All',

  fetchTimeline: async (isRefresh = false) => {
    const { filterType, loading } = get();
    if (loading && !isRefresh) return;
    
    set({ loading: true, error: null });
    try {
      const data = await historyTimelineService.getTimeline(null, filterType, 20);
      set({ 
        events: data.events || [], 
        nextCursor: data.nextCursor,
        hasMore: !!data.nextCursor,
        loading: false 
      });
    } catch (error) {
      console.error('Error fetching timeline:', error);
      set({ 
        error: error.response?.data?.detail || error.message || 'Failed to load timeline',
        loading: false 
      });
    }
  },

  loadMore: async () => {
    const { nextCursor, hasMore, loadingMore, events, filterType } = get();
    if (!hasMore || loadingMore || !nextCursor) return;

    set({ loadingMore: true });
    try {
      const data = await historyTimelineService.getTimeline(nextCursor, filterType, 20);
      set({ 
        events: [...events, ...(data.events || [])],
        nextCursor: data.nextCursor,
        hasMore: !!data.nextCursor,
        loadingMore: false 
      });
    } catch (error) {
      console.error('Error loading more timeline events:', error);
      set({ loadingMore: false });
    }
  },

  setFilterType: (filterType) => {
    set({ filterType, events: [], nextCursor: null, hasMore: true });
    get().fetchTimeline(true);
  },

  clearEvents: () => {
    set({ events: [], nextCursor: null, hasMore: true, filterType: 'All', error: null });
  }
}));
