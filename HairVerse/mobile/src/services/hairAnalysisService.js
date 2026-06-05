import axios from 'axios';
import { auth } from '../config/firebase';
import { BACKEND_BASE_URL } from '../config/api';

export const hairAnalysisService = {
  startAnalysis: async (imageUrl = null) => {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) {
        throw new Error('User not authenticated');
      }

      const idToken = await firebaseUser.getIdToken();
      
      const response = await axios.post(`${BACKEND_BASE_URL}/analysis/hair/start`, {
        imageUrl
      }, {
        headers: { Authorization: `Bearer ${idToken}` },
        timeout: 15000
      });
      
      return response.data;
    } catch (error) {
      console.error('Error starting hair analysis:', error);
      throw error;
    }
  },

  getAnalysis: async (analysisId) => {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) {
        throw new Error('User not authenticated');
      }

      const idToken = await firebaseUser.getIdToken();
      
      const response = await axios.get(`${BACKEND_BASE_URL}/analysis/hair/${analysisId}`, {
        headers: { Authorization: `Bearer ${idToken}` },
        timeout: 10000
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching hair analysis:', error);
      throw error;
    }
  }
};
