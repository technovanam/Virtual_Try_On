import { create } from 'zustand';
import axios from 'axios';

const BACKEND_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:8000';

/**
 * @typedef {Object} AnalysisResult
 * @property {string} faceShape
 * @property {string} hairDensity
 * @property {string} hairThickness
 * @property {string} hairTexture
 * @property {string} hairLength
 * @property {string} hairColor
 * @property {string} hairShine
 */

export const useDashboardStore = create((set, get) => ({
  recommendations: [],
  trendingStyles: [],
  recentActivity: [],
  savedCollections: [],
  insights: null, // Placeholder for AnalysisResult

  loading: {
    recommendations: false,
    trendingStyles: false,
    recentActivity: false,
    savedCollections: false,
    insights: false,
  },

  error: {
    recommendations: null,
    trendingStyles: null,
    recentActivity: null,
    savedCollections: null,
    insights: null,
  },

  setLoading: (key, isLoading) => 
    set((state) => ({ loading: { ...state.loading, [key]: isLoading } })),

  setError: (key, errorMsg) => 
    set((state) => ({ error: { ...state.error, [key]: errorMsg } })),

  fetchRecommendations: async () => {
    get().setLoading('recommendations', true);
    get().setError('recommendations', null);
    try {
      const response = await axios.get(`${BACKEND_BASE_URL}/recommendations`);
      set({ recommendations: response.data });
    } catch (err) {
      get().setError('recommendations', err.message || 'Failed to fetch recommendations');
    } finally {
      get().setLoading('recommendations', false);
    }
  },

  fetchTrending: async () => {
    get().setLoading('trendingStyles', true);
    get().setError('trendingStyles', null);
    try {
      const response = await axios.get(`${BACKEND_BASE_URL}/hairstyles/trending`);
      set({ trendingStyles: response.data });
    } catch (err) {
      get().setError('trendingStyles', err.message || 'Failed to fetch trending');
    } finally {
      get().setLoading('trendingStyles', false);
    }
  },

  fetchHistory: async (token) => {
    get().setLoading('recentActivity', true);
    get().setError('recentActivity', null);
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.get(`${BACKEND_BASE_URL}/tryon/history`, { headers });
      set({ recentActivity: response.data });
    } catch (err) {
      get().setError('recentActivity', err.message || 'Failed to fetch history');
    } finally {
      get().setLoading('recentActivity', false);
    }
  },

  fetchSaved: async (token) => {
    get().setLoading('savedCollections', true);
    get().setError('savedCollections', null);
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.get(`${BACKEND_BASE_URL}/saved`, { headers });
      set({ savedCollections: response.data });
    } catch (err) {
      get().setError('savedCollections', err.message || 'Failed to fetch saved collections');
    } finally {
      get().setLoading('savedCollections', false);
    }
  },

  fetchDashboardAll: async (token) => {
    // Fire all fetchers concurrently
    await Promise.all([
      get().fetchRecommendations(),
      get().fetchTrending(),
      get().fetchHistory(token),
      get().fetchSaved(token),
    ]);
  }
}));
