import { create } from 'zustand';
import { profileService } from '../services/profileService';

const calculateCompletion = (profileData) => {
  if (!profileData || !profileData.profileCompletion) return 0;
  
  const data = profileData.profileCompletion;
  const isMale = data.gender === 'Male';
  
  // Define fields that count towards completion
  const baseFields = ['age', 'country', 'hairLength', 'hairType', 'hairColor', 'hairConcerns', 'preferredStyles', 'goals'];
  const maleFields = [...baseFields, 'beardStatus', 'beardPreference'];
  
  const fieldsToCheck = isMale ? maleFields : baseFields;
  let filledCount = 0;
  
  fieldsToCheck.forEach(field => {
    const val = data[field];
    if (val !== undefined && val !== null && val !== '') {
      if (Array.isArray(val)) {
        if (val.length > 0) filledCount++;
      } else {
        filledCount++;
      }
    }
  });
  
  return Math.round((filledCount / fieldsToCheck.length) * 100);
};

export const useProfileStore = create((set, get) => ({
  profileData: null,
  completionPercentage: 0,
  isLoading: false,
  error: null,

  fetchProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await profileService.fetchProfile();
      set({ 
        profileData: data, 
        completionPercentage: calculateCompletion(data),
        isLoading: false 
      });
    } catch (err) {
      set({ error: err.message || 'Failed to load profile', isLoading: false });
    }
  },

  updateProfile: async (updates) => {
    set({ isLoading: true, error: null });
    try {
      const data = await profileService.updateProfile(updates);
      set({ 
        profileData: data, 
        completionPercentage: calculateCompletion(data),
        isLoading: false 
      });
      return { success: true };
    } catch (err) {
      set({ error: err.message || 'Failed to update profile', isLoading: false });
      return { success: false, error: err.message };
    }
  }
}));
