import axios from 'axios';
import { auth } from '../config/firebase';
import { BACKEND_BASE_URL } from '../config/api';

export const profileService = {
  fetchProfile: async () => {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) throw new Error('User not authenticated');
      const idToken = await firebaseUser.getIdToken();
      const response = await axios.get(`${BACKEND_BASE_URL}/profile`, {
        headers: { Authorization: `Bearer ${idToken}` },
        timeout: 10000
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  },

  updateProfile: async (updates) => {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) throw new Error('User not authenticated');
      const idToken = await firebaseUser.getIdToken();
      const response = await axios.patch(`${BACKEND_BASE_URL}/profile`, updates, {
        headers: { Authorization: `Bearer ${idToken}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }
};
