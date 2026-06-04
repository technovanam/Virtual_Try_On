import axios from 'axios';
import { auth } from '../config/firebase';
import { BACKEND_BASE_URL } from '../config/api';

export const hairstyleService = {
  fetchHairstyles: async ({ limit = 10, cursor = null, category = null, gender = null, sortBy = 'createdAt', sortDesc = true } = {}) => {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) throw new Error('User not authenticated');
      const idToken = await firebaseUser.getIdToken();

      const params = { limit, sort_by: sortBy, sort_desc: sortDesc };
      if (cursor) params.cursor = cursor;
      if (category) params.category = category;
      if (gender) params.gender = gender;

      const response = await axios.get(`${BACKEND_BASE_URL}/hairstyles/`, {
        headers: { Authorization: `Bearer ${idToken}` },
        params,
        timeout: 10000
      });
      return response.data; // { hairstyles: [...], nextCursor: '...' }
    } catch (error) {
      console.error('Error fetching hairstyles:', error);
      throw error;
    }
  },

  fetchHairstyleById: async (hairstyleId) => {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) throw new Error('User not authenticated');
      const idToken = await firebaseUser.getIdToken();

      const response = await axios.get(`${BACKEND_BASE_URL}/hairstyles/${hairstyleId}`, {
        headers: { Authorization: `Bearer ${idToken}` },
        timeout: 10000
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching hairstyle details:', error);
      throw error;
    }
  },

  fetchCategories: async () => {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) throw new Error('User not authenticated');
      const idToken = await firebaseUser.getIdToken();

      const response = await axios.get(`${BACKEND_BASE_URL}/hairstyles/categories`, {
        headers: { Authorization: `Bearer ${idToken}` },
        timeout: 10000
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  fetchTrending: async (limit = 20) => {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) throw new Error('User not authenticated');
      const idToken = await firebaseUser.getIdToken();

      const response = await axios.get(`${BACKEND_BASE_URL}/hairstyles/trending`, {
        headers: { Authorization: `Bearer ${idToken}` },
        params: { limit },
        timeout: 10000
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching trending hairstyles:', error);
      throw error;
    }
  }
};
