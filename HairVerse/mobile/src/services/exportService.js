import axios from 'axios';
import { auth } from '../config/firebase';
import { BACKEND_BASE_URL } from '../config/api';

export const exportService = {
  getExportHistory: async () => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');
      
      const token = await user.getIdToken();
      const response = await axios.get(`${BACKEND_BASE_URL}/exports`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching export history:', error);
      throw error;
    }
  },

  trackExport: async (exportData) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');
      
      const token = await user.getIdToken();
      const response = await axios.post(`${BACKEND_BASE_URL}/exports`, exportData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error tracking export:', error);
      throw error;
    }
  }
};
