import axios from 'axios';
import { auth } from '../config/firebase';

import { BACKEND_BASE_URL } from '../config/api';

export const recommendationService = {
  fetchRecommendations: async () => {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) {
        throw new Error('User not authenticated');
      }

      const idToken = await firebaseUser.getIdToken();
      
      const response = await axios.get(`${BACKEND_BASE_URL}/recommendations/`, {
        headers: { Authorization: `Bearer ${idToken}` },
        timeout: 10000
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      throw error;
    }
  },

  generateRecommendations: async (analysisId = null) => {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) {
        throw new Error('User not authenticated');
      }

      const idToken = await firebaseUser.getIdToken();
      
      const response = await axios.post(`${BACKEND_BASE_URL}/recommendations/generate`, 
        { analysisId },
        {
          headers: { Authorization: `Bearer ${idToken}` },
          timeout: 60000 // generation can take time
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error generating recommendations:', error);
      throw error;
    }
  }
};
