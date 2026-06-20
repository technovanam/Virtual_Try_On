import React, { useState } from 'react';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { View, Text } from 'react-native';

import LoginScreen from '../auth/LoginScreen';
import SignupScreen from '../auth/SignupScreen';
import SplashScreen from '../screens/SplashScreen';
import { useAuthStore } from '../store/authStore';

const AuthStack = createStackNavigator();

function AuthNavigator() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { flex: 1, backgroundColor: '#FAFAFA' },
        ...TransitionPresets.SlideFromRightIOS,
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Signup" component={SignupScreen} />
    </AuthStack.Navigator>
  );
}

export default function AppNavigator() {
  const { isAuthenticated, authChecked } = useAuthStore();
  const [isSplashAnimationDone, setIsSplashAnimationDone] = useState(false);

  // Show splash screen animation first
  if (!isSplashAnimationDone) {
    return (
      <SplashScreen onAnimationComplete={() => setIsSplashAnimationDone(true)} />
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Logged In</Text>
        </View>
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
}
