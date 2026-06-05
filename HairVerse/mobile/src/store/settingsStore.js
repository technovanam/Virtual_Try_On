import { create } from 'zustand';
import { getSettings, updateSettings } from '../services/settingsService';

export const useSettingsStore = create((set, get) => ({
  settings: null,
  loading: false,
  error: null,
  isInitialized: false,

  fetchSettings: async () => {
    set({ loading: true, error: null });
    try {
      const data = await getSettings();
      set({ settings: data, loading: false, isInitialized: true });
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      set({ error: error.message || 'Failed to load settings', loading: false });
    }
  },

  updateSetting: async (key, value) => {
    const currentSettings = get().settings;
    
    // Optimistic update
    set({
      settings: { ...currentSettings, [key]: value },
      error: null
    });

    try {
      const updatedData = await updateSettings({ [key]: value });
      set({ settings: updatedData });
    } catch (error) {
      console.error('Failed to update setting:', error);
      // Revert on failure
      set({ settings: currentSettings, error: error.message || 'Failed to update setting' });
    }
  },

  reset: () => set({ settings: null, loading: false, error: null, isInitialized: false })
}));
