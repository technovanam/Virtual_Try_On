import axios from 'axios';
import { auth } from '../config/firebase';
import { BACKEND_BASE_URL } from '../config/api';

export const haircareService = {
  fetchSuggestions: async () => {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) {
        throw new Error('User not authenticated');
      }

      const idToken = await firebaseUser.getIdToken();
      
      const response = await axios.get(`${BACKEND_BASE_URL}/haircare/`, {
        headers: { Authorization: `Bearer ${idToken}` },
        timeout: 10000
      });
      
      return response.data.suggestions || [];
    } catch (error) {
      console.error('Error fetching haircare suggestions:', error);
      throw error;
    }
  },

  generateSuggestions: async (context = null) => {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) {
        throw new Error('User not authenticated');
      }

      const idToken = await firebaseUser.getIdToken();
      
      const response = await axios.post(`${BACKEND_BASE_URL}/haircare/generate`, 
        { context },
        {
          headers: { Authorization: `Bearer ${idToken}` },
          timeout: 60000 // generation can take time
        }
      );
      
      return response.data.suggestions || [];
    } catch (error) {
      console.error('Error generating haircare suggestions:', error);
      throw error;
    }
  }
};
