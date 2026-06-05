import axios from 'axios';
import { auth } from '../config/firebase';
import { BACKEND_BASE_URL } from '../config/api';

export const savedService = {
  getSavedItems: async () => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');
      
      const token = await user.getIdToken();
      const response = await axios.get(`${BACKEND_BASE_URL}/saved`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching saved items:', error);
      throw error;
    }
  },

  getSavedItem: async (savedId) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');
      
      const token = await user.getIdToken();
      const response = await axios.get(`${BACKEND_BASE_URL}/saved/${savedId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching saved item:', error);
      throw error;
    }
  },

  createSavedItem: async (itemData) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');
      
      const token = await user.getIdToken();
      const response = await axios.post(`${BACKEND_BASE_URL}/saved`, itemData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating saved item:', error);
      throw error;
    }
  },

  updateSavedItem: async (savedId, updateData) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');
      
      const token = await user.getIdToken();
      const response = await axios.put(`${BACKEND_BASE_URL}/saved/${savedId}`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating saved item:', error);
      throw error;
    }
  },

  deleteSavedItem: async (savedId) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');
      
      const token = await user.getIdToken();
      await axios.delete(`${BACKEND_BASE_URL}/saved/${savedId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return true;
    } catch (error) {
      console.error('Error deleting saved item:', error);
      throw error;
    }
  }
};
