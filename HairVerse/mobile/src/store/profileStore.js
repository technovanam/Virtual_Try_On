import { create } from 'zustand';
import { profileService } from '../services/profileService';

export const useProfileStore = create((set) => ({
  profileData: null,
  stats: null,
  aiStyleProfile: null,
  hairInsightsSummary: null,
  completionPercentage: 0,
  isLoading: false,
  error: null,

  fetchProfile: async () => {
    try {
      set({ isLoading: true, error: null });
      const data = await profileService.getProfile();
      set({ 
        profileData: data, 
        stats: data.stats,
        aiStyleProfile: data.aiStyleProfile,
        hairInsightsSummary: data.hairInsightsSummary,
        completionPercentage: data.completionPercentage || 0,
        isLoading: false 
      });
    } catch (error) {
      set({ error: error.message || 'Failed to fetch profile', isLoading: false });
    }
  },

  updateProfile: async (updateData) => {
    try {
      set({ isLoading: true, error: null });
      const data = await profileService.updateProfile(updateData);
      set({ 
        profileData: data, 
        stats: data.stats,
        aiStyleProfile: data.aiStyleProfile,
        hairInsightsSummary: data.hairInsightsSummary,
        completionPercentage: data.completionPercentage || 0,
        isLoading: false 
      });
      return true;
    } catch (error) {
      set({ error: error.message || 'Failed to update profile', isLoading: false });
      return false;
    }
  },

  clearProfile: () => {
    set({ 
        profileData: null, 
        stats: null,
        aiStyleProfile: null,
        hairInsightsSummary: null,
        completionPercentage: 0,
        error: null 
    });
  }
}));
