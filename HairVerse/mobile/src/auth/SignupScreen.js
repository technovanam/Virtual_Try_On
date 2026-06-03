import React, { useState } from 'react';
import { Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';

export default function SignupScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [localError, setLocalError] = useState('');
  const { register, isLoading, error } = useAuthStore();

  const handleSignup = async () => {
    setLocalError('');
    if (!email || !password || !username) {
      setLocalError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      return;
    }

    const result = await register(email, password, username);
    if (!result.success) {
      setLocalError(result.error || 'This email has been already registered.');
    }
  };

  return (
    <View className="flex-1 bg-background justify-center p-6">
      <Text className="font-display text-[28px] font-semibold text-textPrimary mb-2 leading-[34px]">Sign Up</Text>
      <TextInput
        className="bg-surface text-textPrimary p-3 rounded-md mb-4 border border-border"
        placeholder="Username"
        placeholderTextColor="#6B7280"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        className="bg-surface text-textPrimary p-3 rounded-md mb-4 border border-border"
        placeholder="Email"
        placeholderTextColor="#6B7280"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <View className="relative mb-4">
        <TextInput
          className="bg-surface text-textPrimary p-3 rounded-md border border-border pr-11"
          placeholder="Password"
          placeholderTextColor="#6B7280"
          value={password}
          onChangeText={setPassword}
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
        onPress={handleSignup} 
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text className="text-white font-semibold text-[15px]">Create Account</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Login')} className="mt-4 items-center">
        <Text className="text-xs text-secondary">Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
}
