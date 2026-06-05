import { create } from 'zustand';
import { supportService } from '../services/supportService';

export const useSupportStore = create((set, get) => ({
  faqs: [],
  tickets: [],
  isLoadingFaqs: false,
  isLoadingTickets: false,
  isSubmitting: false,
  error: null,
  searchQuery: '',

  setSearchQuery: (query) => set({ searchQuery: query }),

  fetchData: async () => {
    try {
      set({ isLoadingFaqs: true, isLoadingTickets: true, error: null });
      
      const [faqsData, ticketsData] = await Promise.all([
        supportService.getFaqs(),
        supportService.getTickets()
      ]);

      set({ 
        faqs: faqsData, 
        tickets: ticketsData, 
        isLoadingFaqs: false, 
        isLoadingTickets: false 
      });
    } catch (error) {
      set({ 
        error: error.message || 'Failed to fetch support data', 
        isLoadingFaqs: false, 
        isLoadingTickets: false 
      });
    }
  },

  submitTicket: async (ticketData) => {
    try {
      set({ isSubmitting: true, error: null });
      const newTicket = await supportService.createTicket(ticketData);
      
      set(state => ({ 
        tickets: [newTicket, ...state.tickets],
        isSubmitting: false 
      }));
      return true;
    } catch (error) {
      set({ error: error.message || 'Failed to submit ticket', isSubmitting: false });
      return false;
    }
  },

  submitFeedback: async (feedbackData) => {
    try {
      set({ isSubmitting: true, error: null });
      await supportService.submitFeedback(feedbackData);
      set({ isSubmitting: false });
      return true;
    } catch (error) {
      set({ error: error.message || 'Failed to submit feedback', isSubmitting: false });
      return false;
    }
  },

  getFilteredFaqs: () => {
    const { faqs, searchQuery } = get();
    if (!searchQuery.trim()) return faqs;

    const q = searchQuery.toLowerCase();
    return faqs.filter(faq => 
      faq.question.toLowerCase().includes(q) || 
      faq.answer.toLowerCase().includes(q) ||
      faq.category.toLowerCase().includes(q)
    );
  }
}));
