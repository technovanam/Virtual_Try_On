import axios from 'axios';
import { auth } from '../config/firebase';
import { BACKEND_BASE_URL } from '../config/api';

export const compareService = {
  createComparison: async (hairstyleIds, selectedImages = []) => {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) {
        throw new Error('User not authenticated');
      }

      const idToken = await firebaseUser.getIdToken();
      
      const response = await axios.post(`${BACKEND_BASE_URL}/compare/create`, 
        { hairstyleIds, selectedImages },
        {
          headers: { Authorization: `Bearer ${idToken}` },
          timeout: 10000
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error creating comparison:', error);
      throw error;
    }
  },

  getComparison: async (comparisonId) => {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) {
        throw new Error('User not authenticated');
      }

      const idToken = await firebaseUser.getIdToken();
      
      const response = await axios.get(`${BACKEND_BASE_URL}/compare/${comparisonId}`, {
        headers: { Authorization: `Bearer ${idToken}` },
        timeout: 10000
      });
      
      return response.data;
    } catch (error) {
      console.error('Error getting comparison details:', error);
      throw error;
    }
  }
};
