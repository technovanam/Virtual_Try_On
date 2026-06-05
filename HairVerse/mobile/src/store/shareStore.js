import { create } from 'zustand';

export const useShareStore = create((set) => ({
  isDownloading: false,
  isSharing: false,
  downloadProgress: 0,
  error: null,
  successMessage: null,

  setDownloading: (status) => set({ isDownloading: status }),
  setSharing: (status) => set({ isSharing: status }),
  setProgress: (progress) => set({ downloadProgress: progress }),
  setError: (error) => set({ error }),
  setSuccess: (message) => set({ successMessage: message }),
  clearStatus: () => set({ error: null, successMessage: null, downloadProgress: 0 })
}));
