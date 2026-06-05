import axios from 'axios';
import { auth } from '../config/firebase';
import { BACKEND_BASE_URL } from '../config/api';

export const supportService = {
  getFaqs: async () => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');
      
      const token = await user.getIdToken();
      const response = await axios.get(`${BACKEND_BASE_URL}/support/faqs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      throw error;
    }
  },

  getTickets: async () => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');
      
      const token = await user.getIdToken();
      const response = await axios.get(`${BACKEND_BASE_URL}/support/tickets`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching tickets:', error);
      throw error;
    }
  },

  createTicket: async (ticketData) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');
      
      const token = await user.getIdToken();
      const response = await axios.post(`${BACKEND_BASE_URL}/support/tickets`, ticketData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating ticket:', error);
      throw error;
    }
  },

  submitFeedback: async (feedbackData) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');
      
      const token = await user.getIdToken();
      const response = await axios.post(`${BACKEND_BASE_URL}/support/feedback`, feedbackData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      throw error;
    }
  }
};
