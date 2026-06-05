import axios from 'axios';
import { auth } from '../config/firebase';
import { BACKEND_BASE_URL } from '../config/api';

export const faceAnalysisService = {
  startAnalysis: async (imageUrl = null) => {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) {
        throw new Error('User not authenticated');
      }

      const idToken = await firebaseUser.getIdToken();
      
      const response = await axios.post(`${BACKEND_BASE_URL}/analysis/face/start`, {
        imageUrl
      }, {
        headers: { Authorization: `Bearer ${idToken}` },
        timeout: 15000
      });
      
      return response.data;
    } catch (error) {
      console.error('Error starting face analysis:', error);
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
      
      const response = await axios.get(`${BACKEND_BASE_URL}/analysis/face/${analysisId}`, {
        headers: { Authorization: `Bearer ${idToken}` },
        timeout: 10000
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching face analysis:', error);
      throw error;
    }
  }
};
