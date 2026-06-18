import './global.css';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { useAuthStore } from './src/store/authStore';

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Platform, View, AppState } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useFonts } from 'expo-font';
import { 
  Poppins_400Regular, 
  Poppins_500Medium, 
  Poppins_600SemiBold, 
  Poppins_700Bold 
} from '@expo-google-fonts/poppins';

export default function App() {
  const [fontsLoaded] = useFonts({
    'NCLGasdrifo': Poppins_700Bold,
    'CocogoosePro-Regular': Poppins_600SemiBold,
    'Inter-Regular': Poppins_400Regular,
    'Inter-Medium': Poppins_500Medium,
    'Inter-SemiBold': Poppins_600SemiBold,
    'Roboto-Regular': Poppins_400Regular,
    'Roboto-Medium': Poppins_500Medium,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  useEffect(() => {
    // Start the Firebase auth state listener at app startup.
    const unsubscribe = useAuthStore.getState().restoreSession();

    // Auto-logout when the user comes out / exits / minimizes the app
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        console.log('[AppState] App minimized or closed. Auto-logging out...');
        useAuthStore.getState().logout();
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
      subscription.remove();
    };
  }, []);

  // Wait for fonts to load before rendering anything
  if (!fontsLoaded) {
    return null;
  }

  const Container = Platform.OS === 'web' ? View : GestureHandlerRootView;

  return (
    <Container style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppNavigator />
        <StatusBar style="light" />
      </SafeAreaProvider>
    </Container>
  );
}

