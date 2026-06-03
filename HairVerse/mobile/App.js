import './global.css';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { useAuthStore } from './src/store/authStore';

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Platform, View } from 'react-native';

export default function App() {
  useEffect(() => {
    // Start the Firebase auth state listener at app startup.
    // This checks if a user is already signed in (persistent session)
    // and restores their profile from Firestore.
    const unsubscribe = useAuthStore.getState().restoreSession();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const Container = Platform.OS === 'web' ? View : GestureHandlerRootView;

  return (
    <Container style={{ flex: 1 }}>
      <AppNavigator />
      <StatusBar style="light" />
    </Container>
  );
}

