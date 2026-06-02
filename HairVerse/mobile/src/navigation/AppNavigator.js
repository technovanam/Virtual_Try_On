import React from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { COLORS } from '../constants/theme';
import { useAuthStore } from '../store/authStore';

import LoginScreen from '../auth/LoginScreen';
import SignupScreen from '../auth/SignupScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ProfileCompletionScreen from '../screens/ProfileCompletionScreen';

const AuthStack = createStackNavigator();
const MainStack = createStackNavigator();

// ═══════════════════════════════════════════════════════════════════════════════
// Auth Stack (unauthenticated users)
// ═══════════════════════════════════════════════════════════════════════════════
function AuthNavigator() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: COLORS.background },
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Signup" component={SignupScreen} />
    </AuthStack.Navigator>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main Stack (authenticated users)
// ═══════════════════════════════════════════════════════════════════════════════
function MainNavigator() {
  const { user } = useAuthStore();
  
  return (
    <MainStack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: COLORS.background },
      }}
    >
      {!user?.profileCompleted ? (
        <MainStack.Screen name="ProfileCompletion" component={ProfileCompletionScreen} />
      ) : (
        <MainStack.Screen name="Dashboard" component={DashboardScreen} />
      )}
    </MainStack.Navigator>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Root Navigator — conditionally renders auth vs main based on session
// ═══════════════════════════════════════════════════════════════════════════════
export default function AppNavigator() {
  const { isAuthenticated, authChecked } = useAuthStore();

  // While Firebase is checking session persistence, show a branded splash
  if (!authChecked) {
    return (
      <View style={styles.splashContainer}>
        <Text style={styles.splashLogo}>HairVerse</Text>
        <Text style={styles.splashTagline}>Try Before You Cut.</Text>
        <ActivityIndicator size="large" color={COLORS.primary} style={styles.splashLoader} />
        <Text style={styles.splashStatus}>Initializing AI Engine...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Styles
// ═══════════════════════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashLogo: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  splashTagline: {
    fontSize: 18,
    color: COLORS.secondary,
    marginTop: 8,
  },
  splashLoader: {
    marginTop: 40,
  },
  splashStatus: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: 20,
  },
});
