import axios from 'axios';
import { auth } from '../config/firebase';
import { BACKEND_BASE_URL } from '../config/api';

export const recommendationEngineService = {
  generateRecommendation: async (payload = {}) => {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) {
        throw new Error('User not authenticated');
      }

      const idToken = await firebaseUser.getIdToken();
      
      const response = await axios.post(`${BACKEND_BASE_URL}/recommendation/generate`, payload, {
        headers: { Authorization: `Bearer ${idToken}` },
        timeout: 15000
      });
      
      return response.data;
    } catch (error) {
      console.error('Error generating recommendation:', error);
      throw error;
    }
  },

  getRecommendation: async (recommendationId) => {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) {
        throw new Error('User not authenticated');
      }

      const idToken = await firebaseUser.getIdToken();
      
      const response = await axios.get(`${BACKEND_BASE_URL}/recommendation/${recommendationId}`, {
        headers: { Authorization: `Bearer ${idToken}` },
        timeout: 10000
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching recommendation:', error);
      throw error;
    }
  }
};
