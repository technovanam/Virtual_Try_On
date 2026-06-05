import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import axios from 'axios';
import { auth } from '../config/firebase';
import { BACKEND_BASE_URL } from '../config/api';
import { useShareStore } from '../store/shareStore';

export const downloadService = {
  trackDownload: async (resourceType, resourceId) => {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) return;
      const idToken = await firebaseUser.getIdToken();
      await axios.post(`${BACKEND_BASE_URL}/track/download`, 
        { resourceType, resourceId },
        { headers: { Authorization: `Bearer ${idToken}` } }
      );
    } catch (err) {
      console.log('Failed to track download, but proceeding anyway:', err);
    }
  },

  downloadImage: async (imageUrl, resourceType, resourceId) => {
    const store = useShareStore.getState();
    store.clearStatus();
    store.setDownloading(true);

    try {
      // Request permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        store.setError('Storage permission denied.');
        store.setDownloading(false);
        return false;
      }

      // Download file to temp directory
      const fileName = `HairVerse_${resourceType}_${resourceId}_${Date.now()}.jpg`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      
      const downloadResumable = FileSystem.createDownloadResumable(
        imageUrl,
        fileUri,
        {},
        (downloadProgress) => {
          const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
          store.setProgress(progress);
        }
      );

      const { uri } = await downloadResumable.downloadAsync();
      
      // Save to gallery
      const asset = await MediaLibrary.createAssetAsync(uri);
      const album = await MediaLibrary.getAlbumAsync('HairVerse');
      if (album == null) {
        await MediaLibrary.createAlbumAsync('HairVerse', asset, false);
      } else {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      }

      // Cleanup temp file
      await FileSystem.deleteAsync(uri, { idempotent: true });

      // Track in backend
      await downloadService.trackDownload(resourceType, resourceId);

      store.setSuccess('Image saved to gallery!');
      store.setDownloading(false);
      return true;

    } catch (error) {
      console.error('Download error:', error);
      store.setError('Failed to download image. ' + error.message);
      store.setDownloading(false);
      return false;
    }
  }
};
