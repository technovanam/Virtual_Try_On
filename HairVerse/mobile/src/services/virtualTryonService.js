import axios from 'axios';
import { auth } from '../config/firebase';
import { BACKEND_BASE_URL } from '../config/api';

export const virtualTryonService = {
  startTryOn: async (imageId, hairstyleId) => {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) {
        throw new Error('User not authenticated');
      }

      const idToken = await firebaseUser.getIdToken();
      
      const response = await axios.post(`${BACKEND_BASE_URL}/tryon/start`, 
        { imageId, hairstyleId },
        {
          headers: { Authorization: `Bearer ${idToken}` },
          timeout: 10000
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error starting try-on:', error);
      throw error;
    }
  },

  getTryOnStatus: async (tryOnId) => {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) {
        throw new Error('User not authenticated');
      }

      const idToken = await firebaseUser.getIdToken();
      
      const response = await axios.get(`${BACKEND_BASE_URL}/tryon/${tryOnId}`, {
        headers: { Authorization: `Bearer ${idToken}` },
        timeout: 10000
      });
      
      return response.data;
    } catch (error) {
      console.error('Error getting try-on status:', error);
      throw error;
    }
  }
};
