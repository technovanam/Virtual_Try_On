import { create } from 'zustand';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../config/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';

const BACKEND_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:8000';
const TOKEN_KEY = '@hairverse_auth_token';

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isInitializing: true,
  authChecked: false,
  isLoading: false,
  error: null,

  restoreSession: () => {
    let firebaseAuthenticated = false;

    // Firebase listener handles the case where a user is signed in via Firebase.
    // It does NOT set authChecked for null users — the JWT check below owns that.
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        firebaseAuthenticated = true;

        try {
          // Get a fresh Firebase ID token and load profile from backend
          const idToken = await firebaseUser.getIdToken();
          const response = await axios.post(`${BACKEND_BASE_URL}/auth/profile`, {
            id_token: idToken,
          }, { timeout: 10000 });
          const data = response.data;

          if (!data || !data.uid) {
            throw new Error('profile_unavailable');
          }

          set({
            user: {
              uid: data.uid,
              email: data.email,
              displayName: data.display_name || data.email,
              subscriptionStatus: data.subscription_status || 'free',
              onboardingCompleted: data.onboarding_completed ?? false,
            },
            isAuthenticated: true,
            isInitializing: false,
            authChecked: true,
            isLoading: false,
            error: null,
          });
        } catch (err) {
          // Backend profile load failed — still restore basic auth from Firebase
          set({
            user: {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.email || '',
              subscriptionStatus: 'free',
              onboardingCompleted: false,
            },
            isAuthenticated: true,
            isInitializing: false,
            authChecked: true,
            isLoading: false,
            error: null,
          });
        }
      }
      // If no Firebase user, do nothing — the JWT check below resolves the final state
    });

    // JWT restore check — only sets authChecked if Firebase hasn't already done so
    AsyncStorage.getItem(TOKEN_KEY).then(async (storedToken) => {
      if (storedToken) {
        try {
          const response = await axios.post(`${BACKEND_BASE_URL}/auth/verify`, {
            token: storedToken,
          }, { timeout: 8000 });
          const data = response.data;

          set({
            user: {
              uid: data.uid,
              email: data.email,
              displayName: data.display_name || data.email,
              subscriptionStatus: data.subscription_status || 'free',
              onboardingCompleted: data.onboarding_completed ?? false,
            },
            isAuthenticated: true,
            isInitializing: false,
            authChecked: true,
            isLoading: false,
            error: null,
          });

          return; // session restored via JWT
        } catch (err) {
          // JWT invalid or network error — clear the stale token
          await AsyncStorage.removeItem(TOKEN_KEY).catch(() => {});
        }
      }

      // Only set unauthenticated if Firebase didn't already restore the session
      if (!firebaseAuthenticated) {
        set({
          user: null,
          isAuthenticated: false,
          isInitializing: false,
          authChecked: true,
          isLoading: false,
          error: null,
        });
      }
    }).catch(() => {
      // AsyncStorage error — only mark as unauthenticated if Firebase didn't restore
      if (!firebaseAuthenticated) {
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

      // 3. Send ID token to backend to load Firestore profile
      const response = await axios.post(`${BACKEND_BASE_URL}/auth/profile`, {
        id_token: idToken,
      }, { timeout: 15000 });

      const data = response.data;

      if (!data || !data.uid) {
        throw new Error('profile_unavailable');
      }

      // 4. Update store with user profile from backend
      set({
        user: {
          uid: data.uid,
          email: data.email,
          displayName: data.display_name || data.email,
          subscriptionStatus: data.subscription_status || 'free',
          onboardingCompleted: data.onboarding_completed ?? false,
        },
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return { success: true };
    } catch (err) {
      if (auth.currentUser && (err.response || err.message === 'profile_unavailable')) {
        const firebaseUser = auth.currentUser;
        set({
          user: {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.email || '',
            subscriptionStatus: 'free',
            onboardingCompleted: false,
          },
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        return { success: true, warning: 'profile_unavailable' };
      }

      // 🔍 DEBUG: Log raw Firebase error shape

      let errorMessage;

      if (err.code && err.code.startsWith('auth/')) {
        // Firebase Auth error (from signInWithEmailAndPassword)
        switch (err.code) {
          case 'auth/invalid-credential':
          case 'auth/user-not-found':
          case 'auth/wrong-password':
            errorMessage = 'Invalid email or password. Please try again.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'Please enter a valid email address.';
            break;
          case 'auth/network-request-failed':
            errorMessage = 'A network error occurred. Please check your internet connection and try again.';
            break;
          case 'auth/too-many-requests':
            errorMessage = 'Too many login attempts. Please try again later.';
            break;
          case 'auth/user-disabled':
            errorMessage = 'This account has been disabled. Please contact support.';
            break;
          default:
            errorMessage = err.message || 'An unexpected error occurred during login.';
        }
      } else if (err.response) {
        // Backend returned an error response
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

      // 🔍 DEBUG: Log the message about to be stored

      set({
        isLoading: false,
        error: errorMessage,
      });

      return { success: false, error: errorMessage };
    }
  },

  logout: async () => {
    // Clear JWT token (for backend-signed-up users)
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
    } catch (err) {
      console.warn('Failed to clear token:', err);
    }

    // Sign out of Firebase (for login users)
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('Firebase signOut error:', err);
    }

    set({ user: null, isAuthenticated: false });
  },

  register: async (email, password, username) => {
    set({ isLoading: true, error: null });

    try {
      // 1. Create Firebase Auth user via Client SDK
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const { uid } = userCredential.user;

      // 2. Get a fresh Firebase ID token
      const idToken = await userCredential.user.getIdToken();

      // 3. Send ID token to backend to create Firestore profile
      const response = await axios.post(`${BACKEND_BASE_URL}/auth/register-profile`, {
        id_token: idToken,
        username,
      }, { timeout: 15000 });

      const data = response.data;

      // 4. Store JWT for session persistence
      await AsyncStorage.setItem(TOKEN_KEY, data.token);

      // 5. Update store with user profile
      set({
        user: {
          uid: data.user.uid,
          email: data.user.email,
          displayName: data.user.display_name || data.user.email,
          subscriptionStatus: data.user.subscription_status || 'free',
          onboardingCompleted: data.user.onboarding_completed ?? false,
        },
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return { success: true, user: data.user };
    } catch (err) {
      let errorMessage;

      if (err.code && err.code.startsWith('auth/')) {
        // Firebase Auth error (from createUserWithEmailAndPassword)
        switch (err.code) {
          case 'auth/email-already-in-use':
            errorMessage = 'An account with this email already exists.';
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
        // Backend returned an error response (from register-profile)
        const status = err.response.status;
        const detail = err.response.data?.detail || '';

        switch (status) {
          case 401:
            errorMessage = 'Session expired. Please try signing up again.';
            break;
          case 409:
            errorMessage = 'An account with this email already exists.';
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
}));
