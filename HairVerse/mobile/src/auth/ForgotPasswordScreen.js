import React, { useState } from 'react';
import { Text, View, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [localError, setLocalError] = useState('');
  const [isSent, setIsSent] = useState(false);
  const { sendPasswordReset, isLoading } = useAuthStore();

  const handleReset = async () => {
    setLocalError('');
    if (!email) {
      setLocalError('Please enter your email address.');
      return;
    }

    const result = await sendPasswordReset(email);
    if (result.success) {
      setIsSent(true);
    } else {
      setLocalError(result.error || 'Failed to send password reset email.');
    }
  };

  const handleTextChange = (text) => {
    setEmail(text);
    if (localError) {
      setLocalError('');
    }
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
            {/* Centered Title */}
            <View className="w-full pt-[20px] mb-[30px]">
              <Text className="text-[#6D28D9] text-[32px] font-Poppins-Bold text-center tracking-wide">
                Reset Password
              </Text>
            </View>

            {isSent ? (
              // Success View
              <View className="items-center py-5">
                <View className="w-16 h-16 bg-[#EEF2FF] rounded-full justify-center items-center mb-5 border border-[#E0E7FF]">
                  <Ionicons name="checkmark-circle" size={40} color="#6D28D9" />
                </View>
                <Text className="text-xl font-Poppins-Bold text-[#1F2937] text-center mb-3">
                  Check Your Email
                </Text>
                <Text className="text-[14px] text-[#4B5563] font-Poppins text-center leading-[22px] mb-8">
                  We've sent a password reset link to{'\n'}
                  <Text className="font-Poppins-Bold text-[#6D28D9]">{email}</Text>. Please check your inbox and spam folder.
                </Text>

                <TouchableOpacity
                  className="bg-[#6D28D9] rounded-full h-[54px] w-full justify-center items-center shadow-sm"
                  onPress={() => navigation.navigate('Login')}
                  activeOpacity={0.85}
                >
                  <Text className="text-white text-[15px] font-Poppins-SemiBold">Back to Login</Text>
                </TouchableOpacity>
              </View>
            ) : (
              // Reset Request Form View
              <View>
                <Text className="text-[14px] text-[#4B5563] font-Poppins text-center leading-[22px] mb-8 px-2">
                  Enter the email address associated with your account and we'll send you a link to reset your password.
                </Text>

                {/* Email Input */}
                <View className="flex-row items-center bg-white border border-[#E5E7EB] rounded-full px-5 h-[54px] shadow-sm mb-6">
                  <Ionicons name="mail-outline" size={20} color="#6B7280" style={{ marginRight: 12 }} />
                  <TextInput
                    className="flex-1 bg-transparent text-[#1F2937] text-[14px] font-Poppins outline-none"
                    placeholder="Email Address"
                    placeholderTextColor="#9CA3AF"
                    value={email}
                    onChangeText={handleTextChange}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </View>

                {/* Error Message */}
                {localError ? (
                  <View className="flex-row items-center bg-red-50 rounded-xl p-3 mb-6 border border-red-200">
                    <Ionicons name="alert-circle" size={18} color="#EF4444" style={{ marginRight: 8 }} />
                    <Text className="flex-1 text-[#EF4444] text-[13px] font-Poppins">{localError}</Text>
                  </View>
                ) : null}

                {/* Reset Button */}
                <TouchableOpacity
                  className="bg-[#6D28D9] rounded-full h-[54px] justify-center items-center shadow-sm active:opacity-90 mb-[25px]"
                  onPress={handleReset}
                  disabled={isLoading}
                  activeOpacity={0.85}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text className="text-white text-[15px] font-Poppins-SemiBold">Send Reset Link</Text>
                  )}
                </TouchableOpacity>

                {/* Centered Back to Login Link */}
                <View className="flex-row justify-center pb-5">
                  <Text className="text-[#4B5563] text-[14px] font-Poppins">Remember password? </Text>
                  <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text className="text-[#6D28D9] text-[14px] font-Poppins-Bold">Login</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </View>
    </KeyboardAvoidingView>
  );
}
