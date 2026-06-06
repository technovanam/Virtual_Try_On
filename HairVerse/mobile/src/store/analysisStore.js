import { create } from 'zustand';
import { analysisService } from '../services/analysisService';

export const useAnalysisStore = create((set, get) => ({
  status: 'pending', // pending, processing, completed, failed
  progress: 0,
  error: null,
  analysisId: null,
  isPolling: false,
  
  setAnalysisId: (id) => set({ analysisId: id }),
  
  reset: () => set({
    status: 'pending',
    progress: 0,
    error: null,
    analysisId: null,
    isPolling: false,
  }),
  
  startAnalysis: async (imageUrl) => {
    set({ status: 'processing', error: null, progress: 10 });
    try {
      const data = await analysisService.startAnalysis(imageUrl);
      if (data.status === 'error') {
        set({ 
          status: 'failed', 
          error: data.healthObservations?.[0] || 'Analysis failed on the server',
          progress: 0
        });
        return data;
      }
      set({
        analysisId: data.analysisId,
        status: data.status,
        progress: 100,
      });
      return data;
    } catch (error) {
      set({ 
        status: 'failed', 
        error: error.message || 'Failed to start analysis',
        progress: 0
      });
      throw error;
    }
  },
  
  pollStatus: async (id) => {
    const analysisId = id || get().analysisId;
    if (!analysisId) return;
    
    set({ isPolling: true, error: null });
    
    try {
      const data = await analysisService.getAnalysisStatus(analysisId);
      
      set({
        status: data.status,
        progress: data.progress,
        error: null,
        isPolling: false,
      });
      
      return data;
    } catch (error) {
      set({ 
        status: 'failed', 
        error: error.message || 'Failed to fetch status',
        isPolling: false 
      });
      return { status: 'failed', error };
    }
  },

  analysisResult: null,
  isLoadingResult: false,
  resultError: null,

  fetchAnalysisResult: async (id) => {
    const analysisId = id || get().analysisId;
    if (!analysisId) return;

    set({ isLoadingResult: true, resultError: null });

    try {
      const data = await analysisService.getAnalysisResult(analysisId);
      
      set({
        analysisResult: data,
        isLoadingResult: false,
      });
      
      return data;
    } catch (error) {
      set({ 
        resultError: error.message || 'Failed to fetch analysis result',
        isLoadingResult: false 
      });
      return { status: 'error', error };
    }
  }
}));
