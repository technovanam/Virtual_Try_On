import { create } from 'zustand';
import { notificationsService } from '../services/notificationsService';

export const useNotificationsStore = create((set) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  fetchNotifications: async () => {
    try {
      set({ isLoading: true, error: null });
      const data = await notificationsService.fetchNotifications();
      set({ 
        notifications: data.notifications || [], 
        unreadCount: data.unreadCount || 0,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error.message || 'Failed to fetch notifications', 
        isLoading: false 
      });
    }
  },
  
  clearStore: () => {
    set({ notifications: [], unreadCount: 0, isLoading: false, error: null });
  }
}));
