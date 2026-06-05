import axios from 'axios';
import { auth } from '../config/firebase';
import { BACKEND_BASE_URL } from '../config/api';

export const historyTimelineService = {
  getTimeline: async (cursor = null, filterType = null, limit = 20) => {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) throw new Error('User not authenticated');

      const idToken = await firebaseUser.getIdToken();
      
      const params = new URLSearchParams();
      if (cursor) params.append('cursor', cursor);
      if (filterType && filterType !== 'All') params.append('filter_type', filterType);
      params.append('limit', limit);

      const response = await axios.get(`${BACKEND_BASE_URL}/history/timeline?${params.toString()}`, {
        headers: { Authorization: `Bearer ${idToken}` },
        timeout: 15000
      });
      
      return response.data;
    } catch (error) {
      console.error('Error getting timeline:', error);
      throw error;
    }
  },

  getTimelineEvent: async (eventId) => {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) throw new Error('User not authenticated');

      const idToken = await firebaseUser.getIdToken();
      
      const response = await axios.get(`${BACKEND_BASE_URL}/history/timeline/${eventId}`, {
        headers: { Authorization: `Bearer ${idToken}` },
        timeout: 10000
      });
      
      return response.data;
    } catch (error) {
      console.error('Error getting timeline event:', error);
      throw error;
    }
  }
};
