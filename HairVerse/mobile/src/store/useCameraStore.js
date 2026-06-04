import { create } from 'zustand';
import { cameraService } from '../services/cameraService';

export const useCameraStore = create((set, get) => ({
  hasPermission: null,
  isCameraReady: false,
  capturedImage: null,
  uploading: false,
  error: null,
  uploadResult: null,

  setPermission: (status) => set({ hasPermission: status }),
  setCameraReady: (isReady) => set({ isCameraReady: isReady }),
  setCapturedImage: (uri) => set({ capturedImage: uri }),
  clearImage: () => set({ capturedImage: null, uploadResult: null, error: null }),
  setError: (err) => set({ error: err }),
  
  uploadImage: async (uri) => {
    set({ uploading: true, error: null });
    try {
      const result = await cameraService.uploadCapturedImage(uri);
      set({ uploadResult: result, uploading: false });
      return result;
    } catch (err) {
      set({ 
        error: err.response?.data?.detail || err.message || 'Failed to upload image', 
        uploading: false 
      });
      throw err;
    }
  }
}));
