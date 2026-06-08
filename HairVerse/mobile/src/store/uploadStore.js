import { create } from 'zustand';
import { uploadService } from '../services/uploadService';

export const useUploadStore = create((set) => ({
  isUploading: false,
  progress: 0,
  error: null,
  success: false,
  imageId: null,
  imageUrl: null,

  uploadSelfie: async (imageUri) => {
    set({ isUploading: true, progress: 0, error: null, success: false });
    try {
      const data = await uploadService.uploadSelfie(imageUri, (progress) => {
        set({ progress });
      });
      const result = data.data || data;
      set({
        isUploading: false,
        progress: 100,
        success: true,
        imageId: result.imageId,
        imageUrl: result.imageUrl,
      });
    } catch (error) {
      const errorMsg = error.response?.data?.detail || error.message || 'Failed to upload image';
      set({ isUploading: false, error: errorMsg });
    }
  },

  resetUpload: () => set({
    isUploading: false,
    progress: 0,
    error: null,
    success: false,
    imageId: null,
    imageUrl: null,
  }),
}));
