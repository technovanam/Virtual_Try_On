import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import axios from 'axios';
import { auth } from '../config/firebase';
import { BACKEND_BASE_URL } from '../config/api';
import { useShareStore } from '../store/shareStore';

export const shareService = {
  trackShare: async (resourceType, resourceId, platform) => {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) return;
      const idToken = await firebaseUser.getIdToken();
      await axios.post(`${BACKEND_BASE_URL}/track/share`, 
        { resourceType, resourceId, platform },
        { headers: { Authorization: `Bearer ${idToken}` } }
      );
    } catch (err) {
      console.log('Failed to track share:', err);
    }
  },

  shareImage: async (imageUrl, resourceType, resourceId, platform = 'native') => {
    const store = useShareStore.getState();
    store.clearStatus();
    store.setSharing(true);

    try {
      // To share an image from a URL via expo-sharing, it must be downloaded first
      const fileName = `HairVerse_Share_${resourceId}_${Date.now()}.jpg`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      
      const { uri } = await FileSystem.downloadAsync(imageUrl, fileUri);

      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        store.setError('Sharing is not available on this device');
        store.setSharing(false);
        return false;
      }

      await Sharing.shareAsync(uri, {
        dialogTitle: 'Share your HairVerse result',
        mimeType: 'image/jpeg',
      });

      // Cleanup
      await FileSystem.deleteAsync(uri, { idempotent: true });

      // Track Share
      await shareService.trackShare(resourceType, resourceId, platform);

      store.setSharing(false);
      return true;

    } catch (error) {
      console.error('Share error:', error);
      store.setError('Failed to share image. ' + error.message);
      store.setSharing(false);
      return false;
    }
  }
};
