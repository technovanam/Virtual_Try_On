import React, { useEffect } from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { COLORS } from '../constants/theme';
import { useAuthStore } from '../store/authStore';

export default function SplashScreen({ navigation }) {
  const { isAuthenticated, isInitializing, authChecked } = useAuthStore();

  useEffect(() => {
    // Wait for the auth state check to complete before navigating
    if (!authChecked) return;

    // Small delay for smooth splash animation before navigating
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        navigation.replace('Main');
      } else {
        navigation.replace('Login');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [authChecked, isAuthenticated]);

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>HairVerse</Text>
      <Text style={styles.tagline}>Try Before You Cut.</Text>
      <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
      <Text style={styles.status}>
        {isInitializing ? 'Restoring session...' : 'Initializing AI Engine...'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  tagline: {
    fontSize: 18,
    color: COLORS.secondary,
    marginTop: 8,
  },
  loader: {
    marginTop: 40,
  },
  status: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: 20,
  },
});
