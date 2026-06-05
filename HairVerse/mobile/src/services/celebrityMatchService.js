import axios from 'axios';
import { auth } from '../config/firebase';
import { BACKEND_BASE_URL } from '../config/api';

export const celebrityMatchService = {
  fetchCelebrityMatches: async () => {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) throw new Error('User not authenticated');
      const idToken = await firebaseUser.getIdToken();
      
      const response = await axios.get(`${BACKEND_BASE_URL}/celebrity-matches/`, {
        headers: { Authorization: `Bearer ${idToken}` },
        timeout: 10000
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching celebrity matches:', error);
      throw error;
    }
  },

  generateMatches: async (analysisId) => {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) throw new Error('User not authenticated');
      const idToken = await firebaseUser.getIdToken();
      
      const response = await axios.post(`${BACKEND_BASE_URL}/celebrity-matches/generate`, 
        { analysisId: analysisId || null },
        {
          headers: { Authorization: `Bearer ${idToken}` },
          timeout: 60000 // generation might take a while
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error generating celebrity matches:', error);
      throw error;
    }
  },

  getMatchById: async (matchId) => {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) throw new Error('User not authenticated');
      const idToken = await firebaseUser.getIdToken();
      
      const response = await axios.get(`${BACKEND_BASE_URL}/celebrity-matches/${matchId}`, {
        headers: { Authorization: `Bearer ${idToken}` },
        timeout: 10000
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching celebrity match ${matchId}:`, error);
      throw error;
    }
  }
};
