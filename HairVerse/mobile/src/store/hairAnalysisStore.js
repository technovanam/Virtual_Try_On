import { create } from 'zustand';
import { hairAnalysisService } from '../services/hairAnalysisService';

export const useHairAnalysisStore = create((set, get) => ({
  analysisData: null,
  analysisId: null,
  status: 'idle', // idle, loading, pending, completed, error
  error: null,

  startAnalysis: async (imageUrl) => {
    set({ status: 'loading', error: null });
    try {
      const data = await hairAnalysisService.startAnalysis(imageUrl);
      set({ 
        analysisId: data.analysisId, 
        status: data.status || 'pending',
        analysisData: data
      });
      return data;
    } catch (error) {
      set({ status: 'error', error: error.message });
      throw error;
    }
  },

  fetchAnalysis: async (analysisId) => {
    set({ status: 'loading', error: null });
    try {
      const currentId = analysisId || get().analysisId;
      if (!currentId) throw new Error("No analysisId provided");

      const data = await hairAnalysisService.getAnalysis(currentId);
      set({ 
        analysisData: data,
        status: data.status === 'completed' ? 'completed' : 'pending' 
      });
      return data;
    } catch (error) {
      set({ status: 'error', error: error.message });
      throw error;
    }
  },
  
  reset: () => {
    set({ analysisData: null, analysisId: null, status: 'idle', error: null });
  }
}));
