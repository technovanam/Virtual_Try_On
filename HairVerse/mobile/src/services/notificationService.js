import axios from 'axios';
import { auth } from '../config/firebase';
import { BACKEND_BASE_URL } from '../config/api';

export const notificationService = {
  getNotifications: async () => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');
      
      const token = await user.getIdToken();
      const response = await axios.get(`${BACKEND_BASE_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  markAsRead: async (notificationId) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');
      
      const token = await user.getIdToken();
      const response = await axios.patch(`${BACKEND_BASE_URL}/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  markAllAsRead: async () => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');
      
      const token = await user.getIdToken();
      const response = await axios.patch(`${BACKEND_BASE_URL}/notifications/read-all`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },

  deleteNotification: async (notificationId) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');
      
      const token = await user.getIdToken();
      const response = await axios.delete(`${BACKEND_BASE_URL}/notifications/${notificationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }
};
