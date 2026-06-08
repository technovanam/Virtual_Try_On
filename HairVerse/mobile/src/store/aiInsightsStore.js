import { create } from 'zustand';
import { aiInsightsService } from '../services/aiInsightsService';

export const useAIInsightsStore = create((set) => ({
  insights: [],
  fullData: null,
  status: 'pending',
  isLoading: false,
  error: null,

  fetchInsights: async () => {
    try {
      set({ isLoading: true, error: null });
      const data = await aiInsightsService.fetchAIInsights();
      
      const faceShape = data.combinedInsights?.faceProfile || data.faceAnalysis?.faceShape || data.geminiAnalysis?.faceShape || 'Unknown';
      const hairDensity = data.hairAnalysis?.density || 'Unknown';
      const hairHealth = data.hairAnalysis?.healthScore ? `${data.hairAnalysis.healthScore}/100` : 'Unknown';
      const hairTexture = data.hairAnalysis?.texture || 'Unknown';
      
      const hasData = data.status === 'completed';
      const insightObj = { faceShape, hairDensity, hairHealth, hairTexture };

      set({ 
        insights: hasData ? [insightObj] : [], 
        fullData: data,
        status: data.status || 'pending',
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error.message || 'Failed to fetch AI insights', 
        isLoading: false 
      });
    }
  },
  
  clearStore: () => {
    set({ insights: [], fullData: null, status: 'pending', isLoading: false, error: null });
  }
}));
