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
import SearchScreen from '../screens/SearchScreen';
import UploadSelfieScreen from '../screens/UploadSelfieScreen';
import LiveCameraScreen from '../screens/LiveCameraScreen';

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

import BottomTabNavigator from './BottomTabNavigator';

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
          <MainStack.Screen name="MainTabs" component={BottomTabNavigator} />
          <MainStack.Screen name="LiveCamera" component={LiveCameraScreen} />
          <MainStack.Screen name="AIAnalysis" component={require('../screens/AIAnalysisScreen').default} />
          <MainStack.Screen name="AIInsights" component={require('../screens/AIInsightsScreen').default} />
          <MainStack.Screen name="AIAnalysisResult" component={require('../screens/AIAnalysisResultScreen').default} />
          <MainStack.Screen name="Recommendations" component={require('../screens/RecommendationResultsScreen').default} />
          <MainStack.Screen name="HairCareSuggestions" component={require('../screens/HairCareSuggestionsScreen').default} />
          <MainStack.Screen name="HairstyleDetails" component={require('../screens/HairstyleDetailsScreen').default} />
          <MainStack.Screen name="VirtualTryOn" component={require('../screens/VirtualTryOnScreen').default} />
          <MainStack.Screen name="VirtualTryOnResultScreen" component={require('../screens/VirtualTryOnResultScreen').default} />
          <MainStack.Screen name="ComparisonScreen" component={require('../screens/ComparisonScreen').default} />
          <MainStack.Screen name="StyleHistoryScreen" component={require('../screens/StyleHistoryScreen').default} />
          <MainStack.Screen name="CompareHairstyles" component={require('../screens/CompareHairstylesScreen').default} />
          <MainStack.Screen name="CelebrityMatch" component={require('../screens/CelebrityMatchScreen').default} />
          <MainStack.Screen name="EditProfile" component={require('../screens/EditProfileScreen').default} />
          <MainStack.Screen name="Notifications" component={require('../screens/NotificationsScreen').default} />
          <MainStack.Screen name="Settings" component={require('../screens/SettingsScreen').default} />
          <MainStack.Screen name="Placeholder" component={PlaceholderScreen} />
        </>
      )}
    </MainStack.Navigator>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Root Navigator — conditionally renders auth vs main based on session
// ═══════════════════════════════════════════════════════════════════════════════
import { useState } from 'react';
import SplashScreen from '../screens/SplashScreen';
import LandingScreen from '../screens/LandingScreen';

export default function AppNavigator() {
  const { isAuthenticated, authChecked } = useAuthStore();
  const [isSplashAnimationDone, setIsSplashAnimationDone] = useState(false);
  const [isLandingDone, setIsLandingDone] = useState(false);

  // Show splash screen animation first
  if (!isSplashAnimationDone) {
    return (
      <SplashScreen onAnimationComplete={() => setIsSplashAnimationDone(true)} />
    );
  }

  // Then show the Landing page with loading indicator
  if (!isLandingDone || !authChecked) {
    return (
      <LandingScreen onComplete={() => setIsLandingDone(true)} />
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
