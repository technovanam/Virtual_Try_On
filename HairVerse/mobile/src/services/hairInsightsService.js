import axios from 'axios';
import { auth } from '../config/firebase';
import { BACKEND_BASE_URL } from '../config/api';

export const hairInsightsService = {
  getInsights: async () => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');
      
      const token = await user.getIdToken();
      const response = await axios.get(`${BACKEND_BASE_URL}/hair-insights`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching hair insights:', error);
      throw error;
    }
  },

  getHistory: async () => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');
      
      const token = await user.getIdToken();
      const response = await axios.get(`${BACKEND_BASE_URL}/hair-insights/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching hair insights history:', error);
      throw error;
    }
  },

  generateInsights: async () => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');
      
      const token = await user.getIdToken();
      const response = await axios.post(`${BACKEND_BASE_URL}/hair-insights/generate`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error generating hair insights:', error);
      throw error;
    }
  }
};
