import axios from 'axios';
import { getAuth } from 'firebase/auth';
import { Platform } from 'react-native';
import { API_URL } from '../config/api';

class CameraService {
  async uploadCapturedImage(uri) {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const token = await user.getIdToken();
      
      const formData = new FormData();
      
      if (Platform.OS === 'web') {
        // Fetch the data URI or blob URL to get a real Blob for web FormData
        const res = await fetch(uri);
        const blob = await res.blob();
        formData.append('file', blob, 'capture.jpg');
      } else {
        const filename = uri.split('/').pop() || 'capture.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        formData.append('file', {
          uri,
          name: filename,
          type,
        });
      }

      const response = await axios.post(`${API_URL}/camera/capture`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('Camera upload error:', error);
      throw error;
    }
  }
}

export const cameraService = new CameraService();
