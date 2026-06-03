import axios from 'axios';
import { auth } from '../config/firebase';
import { BACKEND_BASE_URL } from '../config/api';

export const searchService = {
  globalSearch: async (query) => {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) {
        throw new Error('User not authenticated');
      }

      const idToken = await firebaseUser.getIdToken();
      
      const response = await axios.get(`${BACKEND_BASE_URL}/search`, {
        params: { q: query },
        headers: { Authorization: `Bearer ${idToken}` },
        timeout: 10000
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching search results:', error);
      throw error;
    }
  }
};
