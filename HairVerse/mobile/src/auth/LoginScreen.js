import React, { useState, useEffect } from 'react';
import { Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator, Dimensions, StyleSheet, Image, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';

const { height } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [errors, setErrors] = useState({ email: '', password: '' });
  const { login, isLoading, error } = useAuthStore();

  useEffect(() => {
    if (error) {
      const lowerErr = error.toLowerCase();
      if (lowerErr.includes('email') || lowerErr.includes('user-not-found')) {
        setErrors(prev => ({ ...prev, email: error }));
      } else if (lowerErr.includes('password') || lowerErr.includes('wrong-password')) {
        setErrors(prev => ({ ...prev, password: error }));
      } else if (lowerErr.includes('credential') || lowerErr.includes('incorrect')) {
        setErrors({ email: 'Incorrect email or password', password: 'Incorrect email or password' });
      } else {
        setLocalError(error);
      }
      useAuthStore.setState({ error: null });
    }
  }, [error]);

  const handleEmailChange = (text) => {
    setEmail(text);
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: '' }));
    }
    if (localError) {
      setLocalError(null);
      useAuthStore.setState({ error: null });
    }
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
    if (errors.password) {
      setErrors(prev => ({ ...prev, password: '' }));
    }
    if (localError) {
      setLocalError(null);
      useAuthStore.setState({ error: null });
    }
  };

  const handleLogin = async () => {
    const newErrors = { email: '', password: '' };
    let hasError = false;

    if (!email.trim()) {
      newErrors.email = 'Email is required';
      hasError = true;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
      hasError = true;
    }

    if (!password) {
      newErrors.password = 'Password is required';
      hasError = true;
    }

    setErrors(newErrors);
    if (hasError) return;

    await login(email, password);
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : null}
    >
      <View className="flex-1 bg-white">
        <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
          <ScrollView 
            contentContainerClassName="flex-grow justify-center" 
            bounces={false} 
            showsVerticalScrollIndicator={false}
            className="px-[30px]"
          >
            {/* Title - "Login" in deep purple */}
            <Text className="text-[#6D28D9] text-[32px] font-Poppins-Bold text-center mb-[40px] tracking-wide">
              Login
            </Text>

            {/* Form Fields Container */}
            <View className="gap-4 mb-5">
              {/* Email Input */}
              <View>
                <View className={`flex-row items-center bg-white border rounded-full px-5 h-[54px] shadow-sm ${errors.email ? 'border-red-500' : 'border-[#E5E7EB]'}`}>
                  <Ionicons name="mail-outline" size={20} color="#6B7280" style={{ marginRight: 12 }} />
                  <TextInput
                    className="flex-1 bg-transparent text-[#1F2937] text-[14px] font-Poppins outline-none"
                    placeholder="Email"
                    placeholderTextColor="#9CA3AF"
                    value={email}
                    onChangeText={handleEmailChange}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </View>
                {errors.email ? (
                  <Text className="text-red-500 text-[11px] font-Poppins mt-1.5 ml-4">{errors.email}</Text>
                ) : null}
              </View>

              {/* Password Input */}
              <View>
                <View className={`flex-row items-center bg-white border rounded-full px-5 h-[54px] shadow-sm ${errors.password ? 'border-red-500' : 'border-[#E5E7EB]'}`}>
                  <Ionicons name="lock-closed-outline" size={20} color="#6B7280" style={{ marginRight: 12 }} />
                  <TextInput
                    className="flex-1 bg-transparent text-[#1F2937] text-[14px] font-Poppins outline-none"
                    placeholder="Password"
                    placeholderTextColor="#9CA3AF"
                    value={password}
                    onChangeText={handlePasswordChange}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity
                    className="p-1"
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color="#9CA3AF"
                    />
                  </TouchableOpacity>
                </View>
                {errors.password ? (
                  <Text className="text-red-500 text-[11px] font-Poppins mt-1.5 ml-4">{errors.password}</Text>
                ) : null}
              </View>
            </View>



            {/* Local Error message */}
            {localError ? (
              <View className="flex-row items-center bg-red-50 rounded-xl p-3 mb-4 border border-red-200">
                <Ionicons name="alert-circle" size={18} color="#EF4444" style={{ marginRight: 8 }} />
                <Text className="flex-1 text-[#EF4444] text-[13px] font-Poppins">{localError}</Text>
              </View>
            ) : null}

            {/* Main Login Button (Deep Purple) */}
            <TouchableOpacity
              className="bg-[#6D28D9] rounded-full h-[54px] justify-center items-center mb-[30px] shadow-sm active:opacity-90"
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text className="text-white text-[15px] font-Poppins-SemiBold">Login</Text>
              )}
            </TouchableOpacity>

            {/* Divider "or" */}
            <View className="flex-row items-center mb-[30px]">
              <View className="flex-1 h-[1px] bg-[#E5E7EB]" />
              <Text className="text-[#6B7280] text-[13px] font-Poppins px-4">or</Text>
              <View className="flex-1 h-[1px] bg-[#E5E7EB]" />
            </View>

            {/* Third-Party Buttons Container */}
            <View className="gap-3 mb-[40px]">
              {/* Google Button */}
              <TouchableOpacity 
                className="flex-row items-center justify-center bg-[#F3F4F6] rounded-full h-[50px] px-6 shadow-sm"
                activeOpacity={0.9}
                onPress={() => {}}
              >
                <View style={{ width: 24, height: 24, justifyContent: 'center', alignItems: 'center', marginRight: 8 }}>
                  <Image 
                    source={{ uri: 'https://img.icons8.com/color/48/000000/google-logo.png' }} 
                    style={{ width: 18, height: 18 }} 
                    resizeMode="contain"
                  />
                </View>
                <Text className="text-[#1F2937] text-[14px] font-Poppins-Medium">
                  Continue with Google
                </Text>
              </TouchableOpacity>

              {/* Apple Button (Premium Black) */}
              <TouchableOpacity 
                className="flex-row items-center justify-center bg-[#000000] rounded-full h-[50px] px-6 shadow-sm"
                activeOpacity={0.9}
                onPress={() => {}}
              >
                <View style={{ width: 24, height: 24, justifyContent: 'center', alignItems: 'center', marginRight: 8 }}>
                  <Ionicons name="logo-apple" size={18} color="#FFFFFF" />
                </View>
                <Text className="text-white text-[14px] font-Poppins-Medium">
                  Continue with Apple
                </Text>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View className="flex-row justify-center pb-5">
              <Text className="text-[#4B5563] text-[14px] font-Poppins">Need an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                <Text className="text-[#6D28D9] text-[14px] font-Poppins-Bold">Sign up</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    </KeyboardAvoidingView>
  );
}
