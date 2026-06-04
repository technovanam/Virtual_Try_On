import axios from 'axios';
import { auth } from '../config/firebase';
import { BACKEND_BASE_URL } from '../config/api';

export const savedService = {
  fetchSavedItems: async () => {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) throw new Error('User not authenticated');
      const idToken = await firebaseUser.getIdToken();
      const response = await axios.get(`${BACKEND_BASE_URL}/saved`, {
        headers: { Authorization: `Bearer ${idToken}` },
        timeout: 10000
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching saved items:', error);
      throw error;
    }
  },

  createSavedItem: async (itemData) => {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) throw new Error('User not authenticated');
      const idToken = await firebaseUser.getIdToken();
      const response = await axios.post(`${BACKEND_BASE_URL}/saved`, itemData, {
        headers: { Authorization: `Bearer ${idToken}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating saved item:', error);
      throw error;
    }
  },

  deleteSavedItem: async (savedId) => {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) throw new Error('User not authenticated');
      const idToken = await firebaseUser.getIdToken();
      await axios.delete(`${BACKEND_BASE_URL}/saved/${savedId}`, {
        headers: { Authorization: `Bearer ${idToken}` }
      });
      return true;
    } catch (error) {
      console.error('Error deleting saved item:', error);
      throw error;
    }
  }
};
