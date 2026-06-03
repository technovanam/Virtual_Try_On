import React, { useState, useEffect } from 'react';
import { Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState(null);
  const { login, isLoading, error } = useAuthStore();

  useEffect(() => {
    if (error) {
      setLocalError(error);
      useAuthStore.setState({ error: null });
    }
  }, [error]);

  const handleEmailChange = (text) => {
    setEmail(text);
    if (localError) {
      setLocalError(null);
      useAuthStore.setState({ error: null });
    }
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
    if (localError) {
      setLocalError(null);
      useAuthStore.setState({ error: null });
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const result = await login(email, password);
  };

  return (
    <View className="flex-1 bg-background justify-center p-6">
      <Text className="font-display text-[28px] font-semibold text-textPrimary mb-2 leading-[34px]">Login</Text>
      
      <TextInput
        className="bg-surface text-textPrimary p-3 rounded-md mb-4 border border-border"
        placeholder="Email"
        placeholderTextColor="#6B7280"
        value={email}
        onChangeText={handleEmailChange}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      
      <View className="relative mb-4">
        <TextInput
          className="bg-surface text-textPrimary p-3 rounded-md border border-border pr-11"
          placeholder="Password"
          placeholderTextColor="#6B7280"
          value={password}
          onChangeText={handlePasswordChange}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity
          className="absolute right-3 top-0 bottom-0 justify-center px-1"
          onPress={() => setShowPassword(!showPassword)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color="#6B7280"
          />
        </TouchableOpacity>
      </View>

      {localError ? (
        <View className="flex-row items-center bg-[#EF4444]/10 rounded-md py-2 px-3 mb-3 border border-[#EF4444]/25">
          <Ionicons name="alert-circle" size={16} color="#EF4444" className="mr-1.5" />
          <Text className="flex-1 text-xs text-error font-medium">{localError}</Text>
        </View>
      ) : null}

      <TouchableOpacity
        className={`bg-primary py-3 rounded-md items-center mt-2 ${isLoading ? 'opacity-60' : ''}`}
        onPress={handleLogin}
        disabled={isLoading}>
        {isLoading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text className="text-white font-semibold text-[15px]">Sign In</Text>
        )}
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => navigation.navigate('Signup')} className="mt-4 items-center">
        <Text className="text-xs text-secondary">Don't have an account? Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
}
