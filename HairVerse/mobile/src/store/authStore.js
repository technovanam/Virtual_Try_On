import { create } from 'zustand';
import axios from 'axios';
import { auth } from '../config/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, sendPasswordResetEmail } from 'firebase/auth';
import { useProfileSetupStore } from './useProfileSetupStore';
import { useSavedStore } from './savedStore';
import { useHistoryStore } from './historyStore';
import { useNotificationsStore } from './notificationsStore';
import { useTryonStore } from './tryonStore';
import { useSelfieStore } from './selfieStore';
import { useRecommendationStore } from './recommendationStore';

import { BACKEND_BASE_URL } from '../config/api';

let isRegistering = false;

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isInitializing: true,
  authChecked: false,
  isLoading: false,
  error: null,

  restoreSession: () => {
    // 100% Firebase Native Session Management
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (isRegistering) return;
      if (firebaseUser) {
        try {
          // Get a fresh Firebase ID token
          const idToken = await firebaseUser.getIdToken();
          
          // Load profile from backend using the Bearer token standard
          const response = await axios.get(`${BACKEND_BASE_URL}/profile`, {
            headers: { Authorization: `Bearer ${idToken}` },
            timeout: 10000 
          });
          
          const data = response.data;

          if (!data || !data.uid) {
            throw new Error('profile_unavailable');
          }

          if (data.profileCompletion) {
            useProfileSetupStore.getState().updateData(data.profileCompletion);
          }

          set({
            user: {
              uid: data.uid,
              email: data.email,
              displayName: data.displayName || data.display_name || data.email,
              subscriptionStatus: data.subscriptionStatus || data.subscription_status || 'free',
              profileCompleted: data.profileCompleted ?? data.profile_completed ?? false,
              onboardingCompleted: data.onboardingCompleted ?? data.onboarding_completed ?? false,
            },
            isAuthenticated: true,
            isInitializing: false,
            authChecked: true,
            isLoading: false,
            error: null,
          });
        } catch (err) {
          const isNetworkError = err.code === 'ECONNABORTED' || (err.message && err.message.toLowerCase().includes('timeout')) || err.message === 'Network Error';
          
          // Backend profile load failed — still restore basic auth from Firebase
          set({
            user: {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.email || '',
              subscriptionStatus: 'free',
              profileCompleted: false, // Ensure onboarding is not bypassed on network errors
              onboardingCompleted: false,
            },
            isAuthenticated: true,
            isInitializing: false,
            authChecked: true,
            isLoading: false,
            error: isNetworkError ? 'Network error. Some features may be unavailable.' : null,
          });
        }
      } else {
        // No Firebase user - guarantee unauthenticated state
        set({
          user: null,
          isAuthenticated: false,
          isInitializing: false,
          authChecked: true,
          isLoading: false,
          error: null,
        });
      }
    });

    return unsubscribe;
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });

    try {
      // 1. Sign in with Firebase Client SDK
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      // 2. Get a fresh Firebase ID token
      const idToken = await userCredential.user.getIdToken();

      // 3. Get Firestore profile via standardized Bearer token
      const response = await axios.get(`${BACKEND_BASE_URL}/profile`, {
        headers: { Authorization: `Bearer ${idToken}` },
        timeout: 15000 
      });

      const data = response.data;

      if (!data || !data.uid) {
        throw new Error('profile_unavailable');
      }

      if (data.profileCompletion) {
        useProfileSetupStore.getState().updateData(data.profileCompletion);
      }

      // 4. Update store with user profile from backend
      set({
        user: {
          uid: data.uid,
          email: data.email,
          displayName: data.displayName || data.display_name || data.email,
          subscriptionStatus: data.subscriptionStatus || data.subscription_status || 'free',
          profileCompleted: data.profileCompleted ?? data.profile_completed ?? false,
          onboardingCompleted: data.onboardingCompleted ?? data.onboarding_completed ?? false,
        },
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return { success: true };
    } catch (err) {
      if (auth.currentUser && (err.response || err.message === 'profile_unavailable' || err.code === 'ECONNABORTED' || (err.message && err.message.toLowerCase().includes('timeout')) || err.message === 'Network Error')) {
        const firebaseUser = auth.currentUser;
        const isNetworkError = err.code === 'ECONNABORTED' || (err.message && err.message.toLowerCase().includes('timeout')) || err.message === 'Network Error';
        
        set({
          user: {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.email || '',
            subscriptionStatus: 'free',
            profileCompleted: false, // Ensure onboarding is not bypassed on network errors
            onboardingCompleted: false,
          },
          isAuthenticated: true,
          isLoading: false,
          error: isNetworkError ? 'Network error. Some features may be unavailable.' : null,
        });

        return { success: true, warning: isNetworkError ? 'network_error' : 'profile_unavailable' };
      }

      let errorMessage;

      if (err.code && err.code.startsWith('auth/')) {
        switch (err.code) {
          case 'auth/user-not-found':
            errorMessage = 'No account found with this email address.';
            break;
          case 'auth/wrong-password':
            errorMessage = 'Incorrect password. Please try again.';
            break;
          case 'auth/invalid-credential':
            errorMessage = 'Incorrect email or password.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'Please enter a valid email address.';
            break;
          case 'auth/network-request-failed':
            errorMessage = 'Network error. Please check your internet connection.';
            break;
          case 'auth/too-many-requests':
            errorMessage = 'Too many attempts. Please try again later.';
            break;
          case 'auth/user-disabled':
            errorMessage = 'This account has been disabled. Please contact support.';
            break;
          default:
            errorMessage = err.message || 'An unexpected error occurred during login.';
        }
      } else if (err.response) {
        const status = err.response.status;
        const detail = err.response.data?.detail || '';

        switch (status) {
          case 401:
          case 404:
            errorMessage = 'Invalid email or password. Please try again.';
            break;
          case 422:
            errorMessage = detail || 'Please enter a valid email and password.';
            break;
          case 503:
            errorMessage = 'Service temporarily unavailable. Please try again later.';
            break;
          default:
            errorMessage = detail || 'An unexpected error occurred during login. Please try again.';
        }
      } else if (err.code === 'ECONNABORTED') {
        errorMessage = 'The request timed out. Please check your internet connection and try again.';
      } else if (err.message && err.message.includes('Network')) {
        errorMessage = 'A network error occurred. Please check your internet connection and try again.';
      } else {
        errorMessage = err.message || 'An unexpected error occurred during login.';
      }

      set({
        isLoading: false,
        error: errorMessage,
      });

      return { success: false, error: errorMessage };
    }
  },

  sendPasswordReset: async (email) => {
    set({ isLoading: true, error: null });
    try {
      await sendPasswordResetEmail(auth, email);
      set({ isLoading: false });
      return { success: true };
    } catch (err) {
      let errorMessage = 'An error occurred. Please try again.';
      if (err.code && err.code.startsWith('auth/')) {
        switch (err.code) {
          case 'auth/user-not-found':
            errorMessage = 'No user found with this email address.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'Please enter a valid email address.';
            break;
          case 'auth/network-request-failed':
            errorMessage = 'Network error. Please check your internet connection.';
            break;
          default:
            errorMessage = err.message;
        }
      }
      set({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  logout: async () => {
    // 100% Firebase SignOut
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('Firebase signOut error:', err);
    }

    // Reset all stores to prevent data leakage and start fresh
    useProfileSetupStore.getState().reset();
    
    try {
      useSavedStore.setState({ items: [], isLoading: false, error: null, searchQuery: '', activeTab: 'favorites', activeCategory: 'All' });
      useHistoryStore.setState({ historyItems: [], total: 0, isLoading: false, error: null, status: 'idle' });
      useNotificationsStore.setState({ notifications: [], unreadCount: 0, isLoading: false, error: null, searchQuery: '', activeCategory: 'all', filter: 'all', sortBy: 'newest' });
      useTryonStore.getState().clearStore?.();
      useSelfieStore.getState().clearStore?.();
      useRecommendationStore.getState().reset?.();
    } catch (e) {
      console.warn('Failed to reset some user stores on logout:', e);
    }

    set({ user: null, isAuthenticated: false });
  },

  register: async (email, password, username) => {
    set({ isLoading: true, error: null });
    useProfileSetupStore.getState().reset();

    try {
      // 1. Create Firebase Auth user via Client SDK
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // 2. Get a fresh Firebase ID token
      const idToken = await userCredential.user.getIdToken();

      // 3. Send profile data to backend to create Firestore profile
      const response = await axios.post(`${BACKEND_BASE_URL}/auth/register-profile`, {
        username,
      }, { 
        headers: { Authorization: `Bearer ${idToken}` },
        timeout: 15000 
      });

      const data = response.data;

      // 4. Update store with user profile
      set({
        user: {
          uid: data.uid,
          email: data.email,
          displayName: data.displayName || data.display_name || data.email,
          subscriptionStatus: data.subscriptionStatus || data.subscription_status || 'free',
          profileCompleted: data.profileCompleted ?? data.profile_completed ?? false,
          onboardingCompleted: data.onboardingCompleted ?? data.onboarding_completed ?? false,
        },
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return { success: true, user: data };
    } catch (err) {
      // If Firebase Auth succeeded but Firestore profile creation failed, sign out and clean up state
      try {
        if (auth.currentUser) {
          await signOut(auth);
        }
      } catch (signOutErr) {
        console.warn('Firebase signOut cleanup failed:', signOutErr);
      }
      set({ user: null, isAuthenticated: false });

      let errorMessage;

      if (err.code && err.code.startsWith('auth/')) {
        switch (err.code) {
          case 'auth/email-already-in-use':
            errorMessage = 'This email has been already registered.';
            break;
          case 'auth/weak-password':
            errorMessage = 'Password is too weak. It must be at least 6 characters.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'Please enter a valid email address.';
            break;
          case 'auth/operation-not-allowed':
            errorMessage = 'Email/password sign up is not enabled. Please contact support.';
            break;
          case 'auth/network-request-failed':
            errorMessage = 'A network error occurred. Please check your internet connection and try again.';
            break;
          case 'auth/too-many-requests':
            errorMessage = 'Too many attempts. Please try again later.';
            break;
          default:
            errorMessage = err.message || 'An unexpected error occurred during signup.';
        }
      } else if (err.response) {
        const status = err.response.status;
        const detail = err.response.data?.detail || '';

        switch (status) {
          case 401:
            errorMessage = 'Session expired. Please try signing up again.';
            break;
          case 409:
            errorMessage = 'This email has been already registered.';
            break;
          case 422:
            errorMessage = detail || 'Please check your input and try again.';
            break;
          case 503:
            errorMessage = 'Service temporarily unavailable. Please try again later.';
            break;
          default:
            errorMessage = detail || 'An unexpected error occurred during signup. Please try again.';
        }
      } else if (err.code === 'ECONNABORTED') {
        errorMessage = 'The request timed out. Please check your internet connection and try again.';
      } else if (err.message && err.message.includes('Network')) {
        errorMessage = 'A network error occurred. Please check your internet connection and try again.';
      } else {
        errorMessage = err.message || 'An unexpected error occurred during signup.';
      }

      set({
        isLoading: false,
        error: errorMessage,
      });

      return { success: false, error: errorMessage };
    }
  },

  checkEmailExists: async (email) => {
    try {
      const response = await axios.get(`${BACKEND_BASE_URL}/auth/check-email`, {
        params: { email: email.trim().toLowerCase() },
        timeout: 10000
      });
      return response.data?.exists || false;
    } catch (err) {
      console.warn('Email validation check failed:', err);
      throw new Error('Failed to verify email availability. Please check your internet connection.');
    }
  },

  registerWithProfile: async (email, password, username, preferences) => {
    set({ isLoading: true, error: null });
    useProfileSetupStore.getState().reset();

    try {
      // 1. Create Firebase Auth user via Client SDK
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // 2. Get a fresh Firebase ID token
      const idToken = await userCredential.user.getIdToken();

      // 3. Send profile data and username to backend to create completed Firestore profile
      const response = await axios.post(`${BACKEND_BASE_URL}/auth/register-with-profile`, {
        username,
        ...preferences
      }, { 
        headers: { Authorization: `Bearer ${idToken}` },
        timeout: 20000 
      });

      const data = response.data;

      // 4. Update store with completed user profile
      set({
        user: {
          uid: data.uid,
          email: data.email,
          displayName: data.displayName || data.display_name || data.email,
          subscriptionStatus: data.subscriptionStatus || data.subscription_status || 'free',
          profileCompleted: data.profileCompleted ?? data.profile_completed ?? true,
          onboardingCompleted: data.onboardingCompleted ?? data.onboarding_completed ?? false,
        },
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return { success: true, user: data };
    } catch (err) {
      // Cleanup Firebase Auth user if backend profile fails
      try {
        if (auth.currentUser) {
          await auth.currentUser.delete();
        }
      } catch (deleteErr) {
        console.warn('Firebase user deletion cleanup failed:', deleteErr);
        try {
          await signOut(auth);
        } catch (signOutErr) {
          console.warn('Firebase signOut cleanup failed:', signOutErr);
        }
      }
      set({ user: null, isAuthenticated: false });

      let errorMessage;

      if (err.code && err.code.startsWith('auth/')) {
        switch (err.code) {
          case 'auth/email-already-in-use':
            errorMessage = 'This email has been already registered.';
            break;
          case 'auth/weak-password':
            errorMessage = 'Password is too weak. It must be at least 6 characters.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'Please enter a valid email address.';
            break;
          case 'auth/operation-not-allowed':
            errorMessage = 'Email/password sign up is not enabled. Please contact support.';
            break;
          case 'auth/network-request-failed':
            errorMessage = 'A network error occurred. Please check your internet connection and try again.';
            break;
          case 'auth/too-many-requests':
            errorMessage = 'Too many attempts. Please try again later.';
            break;
          default:
            errorMessage = err.message || 'An unexpected error occurred during signup.';
        }
      } else if (err.response) {
        const status = err.response.status;
        const detail = err.response.data?.detail || '';

        switch (status) {
          case 401:
            errorMessage = 'Session expired. Please try signing up again.';
            break;
          case 409:
            errorMessage = 'This email has been already registered.';
            break;
          case 422:
            errorMessage = detail || 'Please check your input and try again.';
            break;
          case 503:
            errorMessage = 'Service temporarily unavailable. Please try again later.';
            break;
          default:
            errorMessage = detail || 'An unexpected error occurred during signup. Please try again.';
        }
      } else if (err.code === 'ECONNABORTED') {
        errorMessage = 'The request timed out. Please check your internet connection and try again.';
      } else if (err.message && err.message.includes('Network')) {
        errorMessage = 'A network error occurred. Please check your internet connection and try again.';
      } else {
        errorMessage = err.message || 'An unexpected error occurred during signup.';
      }

      set({
        isLoading: false,
        error: errorMessage,
      });

      return { success: false, error: errorMessage };
    } finally {
      setTimeout(() => {
        isRegistering = false;
      }, 1000);
    }
  },

  completeProfile: async (preferences) => {
    set({ isLoading: true, error: null });
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) throw new Error('Not logged into Firebase');
      // Force refresh the token to prevent 401 errors if it expired during setup
      const idToken = await firebaseUser.getIdToken(true);
      
      const response = await axios.put(`${BACKEND_BASE_URL}/auth/profile/complete`, preferences, {
        headers: { Authorization: `Bearer ${idToken}` },
        timeout: 15000
      });
      
      const data = response.data;
      set((state) => ({
        user: { ...state.user, profileCompleted: data.profileCompleted ?? data.profile_completed ?? true },
        isLoading: false
      }));
      return { success: true };
    } catch (err) {
      let errorMessage = err.message;
      if (err.response && err.response.data && err.response.data.detail) {
        if (Array.isArray(err.response.data.detail)) {
          errorMessage = err.response.data.detail[0].msg;
        } else {
          errorMessage = err.response.data.detail;
        }
      } else if (err.code === 'ECONNABORTED') {
        errorMessage = 'The request timed out. Please check your internet connection.';
      }
      set({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  completeOnboarding: async () => {
    set({ isLoading: true, error: null });
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) throw new Error('Not logged into Firebase');
      const idToken = await firebaseUser.getIdToken(true);
      
      const response = await axios.put(`${BACKEND_BASE_URL}/auth/onboarding/complete`, {}, {
        headers: { Authorization: `Bearer ${idToken}` },
        timeout: 15000
      });
      
      const data = response.data;
      set((state) => ({
        user: { ...state.user, onboardingCompleted: data.onboardingCompleted ?? data.onboarding_completed ?? true },
        isLoading: false
      }));
      return { success: true };
    } catch (err) {
      set((state) => ({
        user: state.user ? { ...state.user, onboardingCompleted: true } : null,
        isLoading: false,
        error: err.message
      }));
      return { success: true };
    }
  },

  editProfile: async (partialData) => {
    set({ isLoading: true, error: null });
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) throw new Error('Not logged into Firebase');
      const idToken = await firebaseUser.getIdToken(true);
      
      const response = await axios.patch(`${BACKEND_BASE_URL}/auth/profile`, partialData, {
        headers: { Authorization: `Bearer ${idToken}` }
      });
      
      const data = response.data;
      if (data.profileCompletion) {
        useProfileSetupStore.getState().updateData(data.profileCompletion);
      }
      
      set({ isLoading: false });
      return { success: true };
    } catch (err) {
      set({ isLoading: false, error: err.message });
      return { success: false, error: err.message };
    }
  },
}));
