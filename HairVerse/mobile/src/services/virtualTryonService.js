import axios from 'axios';
import { auth } from '../config/firebase';
import { BACKEND_BASE_URL } from '../config/api';

export const virtualTryonService = {
  generate: async (imageId, hairstyleId, config = null) => {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) {
        throw new Error('User not authenticated');
      }

      const idToken = await firebaseUser.getIdToken();
      
      const payload = { imageId, hairstyleId };
      if (config) {
        payload.config = config;
      }

      const response = await axios.post(`${BACKEND_BASE_URL}/tryon/generate`, 
        payload,
        {
          headers: { Authorization: `Bearer ${idToken}` },
          timeout: 10000
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error starting try-on generation:', error);
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
  },

  deleteTryOn: async (tryOnId) => {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) {
        throw new Error('User not authenticated');
      }

      const idToken = await firebaseUser.getIdToken();
      
      const response = await axios.delete(`${BACKEND_BASE_URL}/tryon/${tryOnId}`, {
        headers: { Authorization: `Bearer ${idToken}` },
        timeout: 10000
      });
      
      return response.data;
    } catch (error) {
      console.error('Error deleting try-on:', error);
      throw error;
    }
  }
};
