import React from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { useAuthStore } from '../store/authStore';

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

const AuthStack = createStackNavigator();
const MainStack = createStackNavigator();
const Tab = createBottomTabNavigator();

// ═══════════════════════════════════════════════════════════════════════════════
// Bottom Tab Navigator (authenticated)
// ═══════════════════════════════════════════════════════════════════════════════
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
            iconName = focused ? 'sparkles' : 'sparkles-outline';
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
  return (
    <MainStack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: COLORS.background },
      }}
    >
      {/* Bottom tabs — entry point of authenticated experience */}
      <MainStack.Screen name="Main" component={BottomTabNavigator} />

      {/* Onboarding / Setup (post-auth but before full experience) */}
      <MainStack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
      <MainStack.Screen name="Onboarding" component={OnboardingScreen} />

      {/* Feature screens */}
      <MainStack.Screen name="AIAnalysis" component={AIAnalysisScreen} />
      <MainStack.Screen name="Recommendation" component={RecommendationScreen} />
      <MainStack.Screen name="VirtualTryOn" component={VirtualTryOnScreen} />
      <MainStack.Screen name="HairstyleDetail" component={HairstyleDetailScreen} />
      <MainStack.Screen name="Settings" component={SettingsScreen} />
      <MainStack.Screen name="Comparison" component={ComparisonScreen} />
      <MainStack.Screen name="HairInsights" component={HairInsightsScreen} />
      <MainStack.Screen name="Premium" component={PremiumScreen} />
      <MainStack.Screen name="Notifications" component={NotificationsScreen} />
      <MainStack.Screen name="Export" component={ExportScreen} />
      <MainStack.Screen name="HelpSupport" component={HelpSupportScreen} />
      <MainStack.Screen name="LiveCamera" component={LiveCameraScreen} />
      <MainStack.Screen name="Admin" component={AdminScreen} />
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
