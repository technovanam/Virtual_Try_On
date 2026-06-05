import { create } from 'zustand';
import { settingsService } from '../services/settingsService';

export const useSettingsStore = create((set, get) => ({
  settings: null,
  loading: false,
  error: null,
  isInitialized: false,

  fetchSettings: async () => {
    try {
      set({ loading: true, error: null });
      const data = await settingsService.getSettings();
      set({ settings: data, loading: false, isInitialized: true });
    } catch (error) {
      set({ error: error.message || 'Failed to fetch settings', loading: false });
    }
  },

  updateSetting: async (key, value) => {
    const previousSettings = get().settings;
    
    // OPTIMISTIC UPDATE: instantly update the UI state
    set((state) => ({
      settings: { ...state.settings, [key]: value }
    }));

    try {
      // Fire the API call in the background
      const updatedData = await settingsService.updateSettings({ [key]: value });
      // Sync back with the definitive backend response
      set({ settings: updatedData });
    } catch (error) {
      console.error(`Failed to sync setting ${key} to backend:`, error);
      // REVERT the UI state if the backend save fails
      set({ settings: previousSettings });
      // Briefly show an error (could connect to a toast system here)
    }
  },

  resetSettings: async () => {
    try {
      set({ loading: true });
      const data = await settingsService.resetSettings();
      set({ settings: data, loading: false });
    } catch (error) {
      set({ error: error.message || 'Failed to reset settings', loading: false });
    }
  },

  clearStore: () => {
    set({ settings: null, isInitialized: false, error: null });
  }
}));
