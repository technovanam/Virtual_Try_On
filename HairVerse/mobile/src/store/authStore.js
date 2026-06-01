import { create } from 'zustand';
import { auth, db } from '../config/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isInitializing: true,
  authChecked: false,
  isLoading: false,
  error: null,

  restoreSession: () => {
    // Set up the Firebase auth state listener (runs once at app startup)
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in — restore their profile from Firestore
        try {
          const uid = firebaseUser.uid;
          const email = firebaseUser.email || '';
          const userDocRef = doc(db, 'users', uid);
          const userDocSnap = await getDoc(userDocRef);

          let userProfile;
          if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            userProfile = {
              uid,
              email,
              displayName: data.displayName || email,
              subscriptionStatus: data.subscriptionStatus || 'free',
              onboardingCompleted: data.onboardingCompleted ?? false,
            };
          } else {
            userProfile = {
              uid,
              email,
              displayName: email,
              subscriptionStatus: 'free',
              onboardingCompleted: false,
            };
          }

          set({
            user: userProfile,
            isAuthenticated: true,
            isInitializing: false,
            authChecked: true,
            isLoading: false,
            error: null,
          });
        } catch (err) {
          // Firestore read failed — still restore basic auth from Firebase
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
      } else {
        // No user is signed in
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

    // Return unsubscribe function so it can be cleaned up
    return unsubscribe;
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });

    try {
      // 1. Sign in with Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const { uid } = userCredential.user;

      // 2. Load Firestore user document
      const userDocRef = doc(db, 'users', uid);
      const userDocSnap = await getDoc(userDocRef);

      // 3. Build user profile from Firestore data (or fallback to Auth data)
      let userProfile;
      if (userDocSnap.exists()) {
        const data = userDocSnap.data();
        userProfile = {
          uid,
          email,
          displayName: data.displayName || email,
          subscriptionStatus: data.subscriptionStatus || 'free',
          onboardingCompleted: data.onboardingCompleted ?? false,
        };
      } else {
        // Firestore doc doesn't exist (e.g. pre-existing Firebase user without doc)
        userProfile = {
          uid,
          email,
          displayName: email,
          subscriptionStatus: 'free',
          onboardingCompleted: false,
        };
      }

      // 4. Update store
      set({
        user: userProfile,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return { success: true };
    } catch (err) {
      let errorMessage;

      // Map Firebase error codes to user-friendly messages
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

      set({
        isLoading: false,
        error: errorMessage,
      });

      return { success: false, error: errorMessage };
    }
  },

  logout: async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('Logout error:', err);
    }
    set({ user: null, isAuthenticated: false });
  },

  register: async (email, password, username) => {
    set({ isLoading: true, error: null });

    try {
      // 1. Create the Firebase Authentication account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const { uid } = userCredential.user;

      // 2. Create Firestore user document
      const userDocRef = doc(db, 'users', uid);
      const userData = {
        uid,
        email,
        displayName: username,
        createdAt: serverTimestamp(),
        onboardingCompleted: false,
        subscriptionStatus: 'free',
      };
      await setDoc(userDocRef, userData);

      // 3. Update store with authenticated user
      set({
        user: {
          uid,
          email,
          displayName: username,
        },
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return { success: true, user: userCredential.user };
    } catch (err) {
      let errorMessage;

      // Map Firebase error codes to user-friendly messages
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

      set({
        isLoading: false,
        error: errorMessage,
      });

      return { success: false, error: errorMessage };
    }
  },

}));
