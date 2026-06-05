import { create } from 'zustand';
import { selfieService } from '../services/selfieService';

export const useSelfieStore = create((set, get) => ({
  selfies: [],
  activeSelfie: null,
  isLoading: false,
  isUploading: false,
  isFetchingMore: false,
  nextCursor: null,
  hasMore: true,
  error: null,

  fetchSelfies: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await selfieService.getSelfies(10, null);
      const data = response.data || [];
      const cursor = response.nextCursor || null;
      
      const active = data.find(s => s.isActive) || null;
      
      set({ 
        selfies: data, 
        activeSelfie: active,
        nextCursor: cursor,
        hasMore: cursor !== null,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error.response?.data?.detail || error.message || 'Failed to fetch selfies', 
        isLoading: false 
      });
    }
  },

  fetchMoreSelfies: async () => {
    const { nextCursor, hasMore, isFetchingMore, selfies, activeSelfie } = get();
    
    if (!hasMore || isFetchingMore || !nextCursor) return;
    
    try {
      set({ isFetchingMore: true, error: null });
      const response = await selfieService.getSelfies(10, nextCursor);
      const data = response.data || [];
      const cursor = response.nextCursor || null;
      
      // Merge unique
      const existingIds = new Set(selfies.map(s => s.imageId));
      const newUniqueSelfies = data.filter(s => !existingIds.has(s.imageId));
      
      const updatedSelfies = [...selfies, ...newUniqueSelfies];
      
      // Only update activeSelfie if we didn't have one and we found one
      const newActive = activeSelfie || newUniqueSelfies.find(s => s.isActive) || null;
      
      set({ 
        selfies: updatedSelfies, 
        activeSelfie: newActive,
        nextCursor: cursor,
        hasMore: cursor !== null,
        isFetchingMore: false 
      });
    } catch (error) {
      set({ 
        error: error.response?.data?.detail || error.message || 'Failed to fetch more selfies', 
        isFetchingMore: false 
      });
    }
  },

  uploadSelfie: async (imageUri, source) => {
    try {
      set({ isUploading: true, error: null });
      const newSelfie = await selfieService.uploadSelfie(imageUri, source);
      
      const { selfies } = get();
      const updatedSelfies = [newSelfie, ...selfies];
      const active = newSelfie.isActive ? newSelfie : get().activeSelfie;

      set({ 
        selfies: updatedSelfies, 
        activeSelfie: active,
        isUploading: false 
      });
      return newSelfie;
    } catch (error) {
      set({ 
        error: error.response?.data?.detail || error.message || 'Failed to upload selfie', 
        isUploading: false 
      });
      throw error;
    }
  },

  setActiveSelfie: async (imageId) => {
    try {
      set({ isLoading: true, error: null });
      await selfieService.setActiveSelfie(imageId);
      
      const { selfies } = get();
      const updatedSelfies = selfies.map(s => ({
        ...s,
        isActive: s.imageId === imageId
      }));
      const active = updatedSelfies.find(s => s.imageId === imageId);

      set({ 
        selfies: updatedSelfies, 
        activeSelfie: active,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error.response?.data?.detail || error.message || 'Failed to set active selfie', 
        isLoading: false 
      });
      throw error;
    }
  },

  deleteSelfie: async (imageId) => {
    try {
      set({ isLoading: true, error: null });
      await selfieService.deleteSelfie(imageId);
      
      // Refresh list completely since backend might have changed active selfie
      await get().fetchSelfies();
    } catch (error) {
      set({ 
        error: error.response?.data?.detail || error.message || 'Failed to delete selfie', 
        isLoading: false 
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
  
  clearStore: () => {
    set({ 
      selfies: [], 
      activeSelfie: null, 
      isLoading: false, 
      isUploading: false, 
      isFetchingMore: false,
      nextCursor: null,
      hasMore: true,
      error: null 
    });
  }
}));
