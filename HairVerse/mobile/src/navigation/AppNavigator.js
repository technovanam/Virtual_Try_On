import React from 'react';
import { Text, View, ActivityIndicator } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { useAuthStore } from '../store/authStore';

import LoginScreen from '../auth/LoginScreen';
import SignupScreen from '../auth/SignupScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ProfileCompletionScreen from '../screens/ProfileCompletionScreen';
import PlaceholderScreen from '../screens/PlaceholderScreen';

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
        cardStyle: { flex: 1, backgroundColor: '#FAFAFA' },
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
        cardStyle: { flex: 1, backgroundColor: '#FAFAFA' },
      }}
    >
      {!user?.profileCompleted ? (
        <MainStack.Screen name="ProfileCompletion" component={ProfileCompletionScreen} />
      ) : (
        <>
          <MainStack.Screen name="Dashboard" component={DashboardScreen} />
          <MainStack.Screen name="ProfileCompletion" component={ProfileCompletionScreen} />
          <MainStack.Screen name="Placeholder" component={PlaceholderScreen} />
        </>
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
      <View className="flex-1 bg-background items-center justify-center">
        <Text className="text-5xl font-bold text-primary">HairVerse</Text>
        <Text className="text-lg text-secondary mt-2">Try Before You Cut.</Text>
        <ActivityIndicator size="large" color="#0F172A" className="mt-10" />
        <Text className="text-textSecondary text-sm mt-5">Initializing AI Engine...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
