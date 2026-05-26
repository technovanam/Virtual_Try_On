import React from 'react';
import { StyleSheet, View } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
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
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'rgba(18, 18, 26, 0.95)',
          borderTopWidth: 1,
          borderTopColor: 'rgba(0, 212, 255, 0.15)',
          height: 68,
          position: 'absolute',
          bottom: 16,
          left: 16,
          right: 16,
          borderRadius: 20,
          paddingBottom: 10,
          paddingTop: 8,
          shadowColor: COLORS.secondary,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.12,
          shadowRadius: 16,
          elevation: 8,
          borderWidth: 1,
          borderColor: 'rgba(0, 212, 255, 0.08)',
        },
        tabBarActiveTintColor: COLORS.secondary,
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.35)',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: 'bold',
          marginTop: 2,
        },
        tabBarIcon: ({ focused, color }) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Search') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Try-On') {
            iconName = focused ? 'sparkles' : 'sparkles-outline'; // Sparks are more AI-aligned than standard body
          } else if (route.name === 'Saved') {
            iconName = focused ? 'bookmark' : 'bookmark-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return (
            <View style={focused ? tabStyles.activeIconWrapper : tabStyles.iconWrapper}>
              <Ionicons name={iconName} size={focused ? 22 : 18} color={color} />
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={DashboardScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Try-On" component={VirtualTryOnScreen} />
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

const tabStyles = StyleSheet.create({
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  activeIconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 212, 255, 0.08)',
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.22)',
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
});
