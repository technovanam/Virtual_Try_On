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

  markAsRead: async (notificationId) => {
    set((state) => {
      const updatedNotifications = state.notifications.map((n) => {
        if (n.notificationId === notificationId && !n.isRead) {
          return { ...n, isRead: true };
        }
        return n;
      });
      const unreadCount = updatedNotifications.filter(n => !n.isRead).length;
      return { notifications: updatedNotifications, unreadCount };
    });

    try {
      await notificationsService.markAsRead(notificationId);
    } catch (error) {
      console.error("Failed to mark as read in backend:", error);
    }
  },

  deleteNotification: async (notificationId) => {
    set((state) => {
      const updatedNotifications = state.notifications.filter(n => n.notificationId !== notificationId);
      const unreadCount = updatedNotifications.filter(n => !n.isRead).length;
      return { notifications: updatedNotifications, unreadCount };
    });

    try {
      await notificationsService.deleteNotification(notificationId);
    } catch (error) {
      console.error("Failed to delete notification in backend:", error);
    }
  },
  
  clearStore: () => {
    set({ notifications: [], unreadCount: 0, isLoading: false, error: null });
  }
}));
