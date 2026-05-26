import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { COLORS } from '../constants/theme';

import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import ProfileSetupScreen from '../screens/ProfileSetupScreen';
import DashboardScreen from '../screens/DashboardScreen';
import VirtualTryOnScreen from '../screens/VirtualTryOnScreen';
import AIAnalysisScreen from '../screens/AIAnalysisScreen';
import RecommendationScreen from '../screens/RecommendationScreen';
import HairstyleDetailScreen from '../screens/HairstyleDetailScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ComparisonScreen from '../screens/ComparisonScreen';
import SavedCollectionsScreen from '../screens/SavedCollectionsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import HairInsightsScreen from '../screens/HairInsightsScreen';
import PremiumScreen from '../screens/PremiumScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import SearchScreen from '../screens/SearchScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import ExportScreen from '../screens/ExportScreen';
import HelpSupportScreen from '../screens/HelpSupportScreen';
import LiveCameraScreen from '../screens/LiveCameraScreen';
import AdminScreen from '../screens/AdminScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.card,
          borderTopColor: COLORS.border,
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: COLORS.secondary,
        tabBarInactiveTintColor: COLORS.textSecondary,
      }}
    >
      <Tab.Screen name="Home" component={DashboardScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Scan" component={AIAnalysisScreen} />
      <Tab.Screen name="Saved" component={SavedCollectionsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: COLORS.background },
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        
        {/* Main bottom tabs */}
        <Stack.Screen name="Main" component={BottomTabNavigator} />
        
        {/* Additional Screens */}
        <Stack.Screen name="AIAnalysis" component={AIAnalysisScreen} />
        <Stack.Screen name="Recommendation" component={RecommendationScreen} />
        <Stack.Screen name="VirtualTryOn" component={VirtualTryOnScreen} />
        <Stack.Screen name="HairstyleDetail" component={HairstyleDetailScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Comparison" component={ComparisonScreen} />
        <Stack.Screen name="HairInsights" component={HairInsightsScreen} />
        <Stack.Screen name="Premium" component={PremiumScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="Export" component={ExportScreen} />
        <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
        <Stack.Screen name="LiveCamera" component={LiveCameraScreen} />
        <Stack.Screen name="Admin" component={AdminScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
