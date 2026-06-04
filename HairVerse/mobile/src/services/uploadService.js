import axios from 'axios';
import { auth } from '../config/firebase';
import { BACKEND_BASE_URL } from '../config/api';
import { Platform } from 'react-native';

export const uploadService = {
  uploadSelfie: async (imageUri, onProgress) => {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) {
        throw new Error('User not authenticated');
      }

      const idToken = await firebaseUser.getIdToken();

      const formData = new FormData();
      const filename = imageUri.split('/').pop() || 'selfie.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;

      if (Platform.OS === 'web') {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        formData.append('file', blob, filename);
      } else {
        formData.append('file', {
          uri: imageUri,
          name: filename,
          type,
        });
      }

      const response = await axios.post(`${BACKEND_BASE_URL}/user/selfie/upload`, formData, {
        headers: {
          Authorization: `Bearer ${idToken}`,
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000,
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percentCompleted);
          }
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error uploading selfie:', error);
      throw error;
    }
  },
};
