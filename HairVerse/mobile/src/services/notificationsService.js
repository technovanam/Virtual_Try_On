import axios from 'axios';
import { auth } from '../config/firebase';
import { BACKEND_BASE_URL } from '../config/api';

export const notificationsService = {
  fetchNotifications: async () => {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) {
        throw new Error('User not authenticated');
      }

      const idToken = await firebaseUser.getIdToken();
      
      const response = await axios.get(`${BACKEND_BASE_URL}/notifications`, {
        headers: { Authorization: `Bearer ${idToken}` },
        timeout: 10000
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  markAsRead: async (notificationId) => {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) throw new Error('User not authenticated');
      const idToken = await firebaseUser.getIdToken();
      
      const response = await axios.patch(
        `${BACKEND_BASE_URL}/notifications/${notificationId}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${idToken}` },
          timeout: 10000
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  deleteNotification: async (notificationId) => {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) throw new Error('User not authenticated');
      const idToken = await firebaseUser.getIdToken();
      
      const response = await axios.delete(
        `${BACKEND_BASE_URL}/notifications/${notificationId}`,
        {
          headers: { Authorization: `Bearer ${idToken}` },
          timeout: 10000
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }
};
