import { create } from 'zustand';
import { notificationService } from '../services/notificationService';

export const useNotificationsStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  
  // Filter state
  searchQuery: '',
  activeCategory: 'all', // all, recommendation, hairstyle_trend, hair_insight, saved_reminder, system_update
  filter: 'all', // all, unread, read
  sortBy: 'newest', // newest, oldest

  setSearchQuery: (query) => set({ searchQuery: query }),
  setActiveCategory: (cat) => set({ activeCategory: cat }),
  setFilter: (filter) => set({ filter }),
  setSortBy: (sort) => set({ sortBy: sort }),

  fetchNotifications: async () => {
    try {
      set({ isLoading: true, error: null });
      const data = await notificationService.getNotifications();
      set({ notifications: data.notifications, unreadCount: data.unreadCount, isLoading: false });
    } catch (error) {
      set({ error: error.message || 'Failed to fetch notifications', isLoading: false });
    }
  },

  markAsRead: async (notificationId) => {
    // Optimistic Update
    const currentNotifications = get().notifications;
    const notification = currentNotifications.find(n => n.notificationId === notificationId);
    if (!notification || notification.isRead) return;

    set(state => ({
      notifications: state.notifications.map(n => 
        n.notificationId === notificationId ? { ...n, isRead: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1)
    }));

    try {
      await notificationService.markAsRead(notificationId);
    } catch (error) {
      console.error('Failed to sync markAsRead:', error);
      // Rollback
      set(state => ({
        notifications: currentNotifications,
        unreadCount: state.unreadCount + 1
      }));
    }
  },

  markAllAsRead: async () => {
    const currentNotifications = get().notifications;
    const currentUnreadCount = get().unreadCount;

    // Optimistic Update
    set(state => ({
      notifications: state.notifications.map(n => ({ ...n, isRead: true })),
      unreadCount: 0
    }));

    try {
      await notificationService.markAllAsRead();
    } catch (error) {
      console.error('Failed to sync markAllAsRead:', error);
      // Rollback
      set({ notifications: currentNotifications, unreadCount: currentUnreadCount });
    }
  },

  deleteNotification: async (notificationId) => {
    const currentNotifications = get().notifications;
    const currentUnreadCount = get().unreadCount;
    const isUnread = currentNotifications.find(n => n.notificationId === notificationId)?.isRead === false;

    // Optimistic Update
    set(state => ({
      notifications: state.notifications.filter(n => n.notificationId !== notificationId),
      unreadCount: isUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount
    }));

    try {
      await notificationService.deleteNotification(notificationId);
    } catch (error) {
      console.error('Failed to delete notification:', error);
      // Rollback
      set({ notifications: currentNotifications, unreadCount: currentUnreadCount });
    }
  },

  getFilteredNotifications: () => {
    const { notifications, searchQuery, activeCategory, filter, sortBy } = get();
    
    let result = [...notifications];

    // Category
    if (activeCategory !== 'all') {
      result = result.filter(n => n.category === activeCategory);
    }

    // Read/Unread Filter
    if (filter === 'unread') {
      result = result.filter(n => !n.isRead);
    } else if (filter === 'read') {
      result = result.filter(n => n.isRead);
    }

    // Search
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(n => 
        n.title.toLowerCase().includes(q) || 
        n.message.toLowerCase().includes(q)
      );
    }

    // Sorting
    result.sort((a, b) => {
      const tA = new Date(a.createdAt).getTime();
      const tB = new Date(b.createdAt).getTime();
      return sortBy === 'newest' ? tB - tA : tA - tB;
    });

    return result;
  }
}));
