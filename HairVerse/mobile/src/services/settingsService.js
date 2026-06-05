import axios from 'axios';
import { auth } from '../config/firebase';
import { BACKEND_BASE_URL } from '../config/api';

export const getSettings = async () => {
  const firebaseUser = auth.currentUser;
  if (!firebaseUser) throw new Error('User not authenticated');
  const idToken = await firebaseUser.getIdToken();
  const response = await axios.get(`${BACKEND_BASE_URL}/settings/`, {
    headers: { Authorization: `Bearer ${idToken}` },
  });
  return response.data;
};

export const updateSettings = async (updates) => {
  const firebaseUser = auth.currentUser;
  if (!firebaseUser) throw new Error('User not authenticated');
  const idToken = await firebaseUser.getIdToken();
  const response = await axios.patch(`${BACKEND_BASE_URL}/settings/`, updates, {
    headers: { Authorization: `Bearer ${idToken}` },
  });
  return response.data;
};
