import axios from 'axios';
import { auth, db } from '../config/firebase';
import { BACKEND_BASE_URL } from '../config/api';
import { collection, doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

export const searchService = {
  globalSearch: async (query, category = null, gender = null, page = 1, limit = 20) => {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) throw new Error('User not authenticated');
      const idToken = await firebaseUser.getIdToken();
      
      const response = await axios.get(`${BACKEND_BASE_URL}/search`, {
        params: { q: query, category, gender, page, limit },
        headers: { Authorization: `Bearer ${idToken}` },
        timeout: 10000
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching search results:', error);
      throw error;
    }
  },

  getTrending: async () => {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) throw new Error('User not authenticated');
      const idToken = await firebaseUser.getIdToken();
      
      const response = await axios.get(`${BACKEND_BASE_URL}/search/trending`, {
        headers: { Authorization: `Bearer ${idToken}` },
        timeout: 10000
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching trending searches:', error);
      throw error;
    }
  },

  getCategories: async () => {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) throw new Error('User not authenticated');
      const idToken = await firebaseUser.getIdToken();
      
      const response = await axios.get(`${BACKEND_BASE_URL}/search/categories`, {
        headers: { Authorization: `Bearer ${idToken}` },
        timeout: 10000
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching search categories:', error);
      throw error;
    }
  },

  getRecentSearches: async () => {
    try {
      const user = auth.currentUser;
      if (!user) return [];
      
      const docRef = doc(db, 'users', user.uid, 'recentSearches', 'data');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data().searches || [];
      } else {
        return [];
      }
    } catch (error) {
      console.error('Error getting recent searches:', error);
      return [];
    }
  },

  saveRecentSearch: async (searchQuery) => {
    try {
      if (!searchQuery || !searchQuery.trim()) return;
      const user = auth.currentUser;
      if (!user) return;

      const docRef = doc(db, 'users', user.uid, 'recentSearches', 'data');
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        await setDoc(docRef, { searches: [searchQuery] });
      } else {
        const data = docSnap.data();
        let searches = data.searches || [];
        // Remove if exists to push to front
        searches = searches.filter(s => s !== searchQuery);
        searches.unshift(searchQuery);
        // Keep only top 10
        if (searches.length > 10) searches = searches.slice(0, 10);
        await updateDoc(docRef, { searches });
      }
    } catch (error) {
      console.error('Error saving recent search:', error);
    }
  },

  clearRecentSearches: async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      const docRef = doc(db, 'users', user.uid, 'recentSearches', 'data');
      await setDoc(docRef, { searches: [] });
    } catch (error) {
      console.error('Error clearing recent searches:', error);
    }
  }
};
