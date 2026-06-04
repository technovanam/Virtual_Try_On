import React from 'react';
import { View, Platform, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import DashboardScreen from '../screens/DashboardScreen';
import UploadSelfieScreen from '../screens/UploadSelfieScreen';
import SearchScreen from '../screens/SearchScreen';
import SavedCollectionsScreen from '../screens/SavedCollectionsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? 24 : 16,
          left: 16,
          right: 16,
          elevation: 0,
          backgroundColor: '#ffffff',
          borderRadius: 24,
          height: 64,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.1,
          shadowRadius: 20,
          borderWidth: 1,
          borderColor: '#f3f4f6',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Try-On') iconName = focused ? 'camera' : 'camera-outline';
          else if (route.name === 'Search') iconName = focused ? 'search' : 'search-outline';
          else if (route.name === 'Saved') iconName = focused ? 'bookmark' : 'bookmark-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';

          return (
            <View className="items-center justify-center w-12 h-12">
              <Ionicons name={iconName} size={24} color={color} />
              {focused && (
                <View className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1 absolute bottom-2" />
              )}
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={DashboardScreen} />
      <Tab.Screen name="Try-On" component={UploadSelfieScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Saved" component={SavedCollectionsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
