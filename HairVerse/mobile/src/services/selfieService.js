import axios from 'axios';
import { auth } from '../config/firebase';
import { BACKEND_BASE_URL } from '../config/api';
import * as FileSystem from 'expo-file-system';

export const selfieService = {
  getSelfies: async (limit = 10, cursor = null) => {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) {
        throw new Error('User not authenticated');
      }

      const idToken = await firebaseUser.getIdToken();
      
      let url = `${BACKEND_BASE_URL}/user/selfie/?limit=${limit}`;
      if (cursor) {
        url += `&cursor=${cursor}`;
      }
      
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${idToken}` },
        timeout: 10000
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching selfies:', error);
      throw error;
    }
  },

  getSelfie: async (imageId) => {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) {
        throw new Error('User not authenticated');
      }

      const idToken = await firebaseUser.getIdToken();
      
      const response = await axios.get(`${BACKEND_BASE_URL}/user/selfie/${imageId}`, {
        headers: { Authorization: `Bearer ${idToken}` },
        timeout: 10000
      });
      
      return response.data.data;
    } catch (error) {
      console.error('Error fetching selfie:', error);
      throw error;
    }
  },

  uploadSelfie: async (imageUri, source) => {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) {
        throw new Error('User not authenticated');
      }

      const idToken = await firebaseUser.getIdToken();
      
      // Use FormData for file upload
      const formData = new FormData();
      
      // React Native specific FormData implementation requires name, type, and uri
      const filename = imageUri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image`;

      formData.append('file', {
        uri: imageUri,
        name: filename,
        type: type
      });
      
      formData.append('source', source);

      const response = await axios.post(`${BACKEND_BASE_URL}/user/selfie/upload`, formData, {
        headers: { 
          Authorization: `Bearer ${idToken}`,
          'Content-Type': 'multipart/form-data'
        },
        timeout: 30000 // Give it more time for upload
      });
      
      return response.data.data;
    } catch (error) {
      console.error('Error uploading selfie:', error);
      throw error;
    }
  },

  setActiveSelfie: async (imageId) => {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) {
        throw new Error('User not authenticated');
      }

      const idToken = await firebaseUser.getIdToken();
      
      const response = await axios.patch(`${BACKEND_BASE_URL}/user/selfie/${imageId}/active`, {}, {
        headers: { Authorization: `Bearer ${idToken}` },
        timeout: 10000
      });
      
      return response.data.data;
    } catch (error) {
      console.error('Error setting active selfie:', error);
      throw error;
    }
  },

  deleteSelfie: async (imageId) => {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) {
        throw new Error('User not authenticated');
      }

      const idToken = await firebaseUser.getIdToken();
      
      const response = await axios.delete(`${BACKEND_BASE_URL}/user/selfie/${imageId}`, {
        headers: { Authorization: `Bearer ${idToken}` },
        timeout: 15000
      });
      
      return response.data;
    } catch (error) {
      console.error('Error deleting selfie:', error);
      throw error;
    }
  }
};
