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
  }
}));
