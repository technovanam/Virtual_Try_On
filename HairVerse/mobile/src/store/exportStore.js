import { create } from 'zustand';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { exportService } from '../services/exportService';

export const useExportStore = create((set, get) => ({
  exportHistory: [],
  isLoading: false,
  isDownloading: false,
  error: null,

  fetchExportHistory: async () => {
    try {
      set({ isLoading: true, error: null });
      const data = await exportService.getExportHistory();
      set({ exportHistory: data, isLoading: false });
    } catch (error) {
      set({ error: error.message || 'Failed to fetch export history', isLoading: false });
    }
  },

  downloadAsset: async (exportData) => {
    try {
      set({ isDownloading: true, error: null });

      const { imageUrl, format, exportType, resourceId, quality } = exportData;
      let downloadSuccess = false;

      // Platform specific download logic
      if (Platform.OS === 'web') {
        // Web Download
        try {
          const response = await fetch(imageUrl);
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `HairVerse_${exportType}_${resourceId}.${format}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          downloadSuccess = true;
        } catch (e) {
          throw new Error('Web download failed: ' + e.message);
        }
      } else {
        // iOS / Android Native Download
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== 'granted') {
          throw new Error('Storage permission denied.');
        }

        const fileUri = `${FileSystem.documentDirectory}HairVerse_${exportType}_${resourceId}.${format}`;
        
        const downloadedFile = await FileSystem.downloadAsync(imageUrl, fileUri);
        
        if (downloadedFile.status === 200) {
          const asset = await MediaLibrary.createAssetAsync(downloadedFile.uri);
          await MediaLibrary.createAlbumAsync('HairVerse', asset, false);
          downloadSuccess = true;
        } else {
          throw new Error('Failed to download file to device.');
        }
      }

      if (downloadSuccess) {
        // Track the export in backend if successful
        const response = await exportService.trackExport({
          exportType,
          resourceId,
          imageUrl,
          format,
          quality
        });
        
        // Update local history
        set(state => ({
          exportHistory: [response.exportRecord, ...state.exportHistory],
          isDownloading: false
        }));
        
        return true;
      }
      return false;

    } catch (error) {
      console.error('Download error:', error);
      set({ error: error.message || 'Failed to complete export', isDownloading: false });
      return false;
    }
  }
}));
