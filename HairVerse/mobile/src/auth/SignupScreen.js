import React, { useState } from 'react';
import { Text, View, TextInput, TouchableOpacity, ActivityIndicator, Image, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignupScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [agree, setAgree] = useState(false);
  const [localError, setLocalError] = useState('');
  const [errors, setErrors] = useState({ username: '', email: '', password: '', confirmPassword: '', agree: '' });
  const { checkEmailExists, isLoading } = useAuthStore();

  const handleUsernameChange = (text) => {
    setUsername(text);
    if (errors.username) {
      setErrors(prev => ({ ...prev, username: '' }));
    }
    if (localError) setLocalError('');
  };

  const handleEmailChange = (text) => {
    setEmail(text);
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: '' }));
    }
    if (localError) setLocalError('');
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
    if (errors.password) {
      setErrors(prev => ({ ...prev, password: '' }));
    }
    if (localError) setLocalError('');
  };

  const handleConfirmPasswordChange = (text) => {
    setConfirmPassword(text);
    if (errors.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: '' }));
    }
    if (localError) setLocalError('');
  };

  const handleToggleAgree = () => {
    const nextVal = !agree;
    setAgree(nextVal);
    if (errors.agree && nextVal) {
      setErrors(prev => ({ ...prev, agree: '' }));
    }
    if (localError) setLocalError('');
  };

  const handleSignup = async () => {
    setLocalError('');
    const newErrors = { username: '', email: '', password: '', confirmPassword: '', agree: '' };
    let hasError = false;

    if (!username.trim()) {
      newErrors.username = 'Username is required';
      hasError = true;
    }

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
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      hasError = true;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirm password is required';
      hasError = true;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      hasError = true;
    }

    if (!agree) {
      newErrors.agree = 'You must agree to the Terms & Conditions';
      hasError = true;
    }

    setErrors(newErrors);
    if (hasError) return;

    useAuthStore.setState({ isLoading: true });
    try {
      const emailTaken = await checkEmailExists(email);
      useAuthStore.setState({ isLoading: false });

      if (emailTaken) {
        setErrors(prev => ({ ...prev, email: 'This email has been already registered.' }));
        return;
      }

      // Defer account creation by navigating to ProfileCompletion screen with credentials
      navigation.navigate('ProfileCompletion', {
        signUpData: { email: email.trim().toLowerCase(), password, username }
      });
    } catch (err) {
      useAuthStore.setState({ isLoading: false });
      setLocalError(err.message || 'Failed to verify email availability. Please try again.');
    }
  };

  // Simple password strength calculator
  const getPasswordStrength = () => {
    if (password.length === 0) return { label: '', color: 'transparent', segments: 0 };
    if (password.length < 6) return { label: 'Weak', color: '#EF4444', segments: 1 };
    if (password.length < 10) return { label: 'Good', color: '#F59E0B', segments: 2 };
    if (password.match(/(?=.*[A-Z])/) && password.match(/(?=.*[0-9])/)) return { label: 'Strong', color: '#10B981', segments: 4 };
    return { label: 'Strong', color: '#10B981', segments: 3 };
  };

  const strength = getPasswordStrength();

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
                Sign Up
              </Text>
            </View>

            {/* Form Fields Container */}
            <View className="gap-4 mb-4">
              {/* Username Input */}
              <View>
                <View className={`flex-row items-center bg-white border rounded-full px-5 h-[54px] shadow-sm ${errors.username ? 'border-red-500' : 'border-[#E5E7EB]'}`}>
                  <Ionicons name="person-outline" size={20} color="#6B7280" style={{ marginRight: 12 }} />
                  <TextInput
                    className="flex-1 bg-transparent text-[#1F2937] text-[14px] font-Poppins outline-none"
                    placeholder="Username"
                    placeholderTextColor="#9CA3AF"
                    value={username}
                    onChangeText={handleUsernameChange}
                    autoCapitalize="none"
                  />
                </View>
                {errors.username ? (
                  <Text className="text-red-500 text-[11px] font-Poppins mt-1.5 ml-4">{errors.username}</Text>
                ) : null}
              </View>

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
                  <TouchableOpacity className="p-1" onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>
                {errors.password ? (
                  <Text className="text-red-500 text-[11px] font-Poppins mt-1.5 ml-4">{errors.password}</Text>
                ) : null}
              </View>

              {/* Confirm Password Input */}
              <View>
                <View className={`flex-row items-center bg-white border rounded-full px-5 h-[54px] shadow-sm ${errors.confirmPassword ? 'border-red-500' : 'border-[#E5E7EB]'}`}>
                  <Ionicons name="lock-closed-outline" size={20} color="#6B7280" style={{ marginRight: 12 }} />
                  <TextInput
                    className="flex-1 bg-transparent text-[#1F2937] text-[14px] font-Poppins outline-none"
                    placeholder="Confirm Password"
                    placeholderTextColor="#9CA3AF"
                    value={confirmPassword}
                    onChangeText={handleConfirmPasswordChange}
                    secureTextEntry={!showConfirmPassword}
                  />
                  <TouchableOpacity className="p-1" onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                    <Ionicons name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>
                {errors.confirmPassword ? (
                  <Text className="text-red-500 text-[11px] font-Poppins mt-1.5 ml-4">{errors.confirmPassword}</Text>
                ) : null}
              </View>
            </View>

            {/* Password Strength Indicator */}
            {password.length > 0 && (
              <View className="mb-4 px-1">
                <View className="flex-row justify-between mb-2">
                  <Text className="text-[#4B5563] text-xs font-Poppins">Password Strength</Text>
                  <Text style={{ color: strength.color }} className="text-xs font-Poppins-Medium">{strength.label}</Text>
                </View>
                <View className="flex-row gap-2">
                  {[1, 2, 3, 4].map((segment) => (
                    <View 
                      key={segment} 
                      className="flex-1 h-[3px] rounded-full" 
                      style={{ backgroundColor: segment <= strength.segments ? '#6D28D9' : '#E5E7EB' }}
                    />
                  ))}
                </View>
              </View>
            )}

            {/* Terms Checkbox */}
            <View className="mb-[20px]">
              <View className="flex-row flex-wrap items-center px-1">
                <TouchableOpacity 
                  className="flex-row items-center" 
                  onPress={handleToggleAgree}
                  activeOpacity={0.7}
                >
                  <View className={`w-5 h-5 rounded-md border items-center justify-center mr-3 ${agree ? 'bg-[#6D28D9] border-[#6D28D9]' : errors.agree ? 'border-red-500' : 'border-[#E5E7EB]'}`}>
                    {agree && <Ionicons name="checkmark" size={14} color="#FFF" />}
                  </View>
                  <Text className="text-[#4B5563] text-sm font-Poppins">
                    I agree to{' '}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => navigation.navigate('Terms')}
                  activeOpacity={0.7}
                >
                  <Text className="text-[#6D28D9] text-sm font-Poppins-Bold">Terms & Conditions</Text>
                </TouchableOpacity>
              </View>
              {errors.agree ? (
                <Text className="text-red-500 text-[11px] font-Poppins mt-1.5 ml-4">{errors.agree}</Text>
              ) : null}
            </View>

            {/* Error Message */}
            {localError ? (
              <View className="flex-row items-center bg-red-50 rounded-xl p-3 mb-4 border border-red-200">
                <Ionicons name="alert-circle" size={18} color="#EF4444" style={{ marginRight: 8 }} />
                <Text className="flex-1 text-[#EF4444] text-[13px] font-Poppins">{localError}</Text>
              </View>
            ) : null}

            {/* Create Account Button */}
            <TouchableOpacity
              className={`rounded-full h-[54px] justify-center items-center mb-[25px] shadow-sm bg-[#6D28D9] ${isLoading ? 'opacity-50' : ''}`}
              onPress={handleSignup}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text className="text-white text-[15px] font-Poppins-SemiBold">Create Account</Text>
              )}
            </TouchableOpacity>

            {/* Divider "or" */}
            <View className="flex-row items-center mb-[25px]">
              <View className="flex-1 h-[1px] bg-[#E5E7EB]" />
              <Text className="text-[#6B7280] text-[13px] font-Poppins px-4">or</Text>
              <View className="flex-1 h-[1px] bg-[#E5E7EB]" />
            </View>

            {/* Social Buttons Container */}
            <View className="gap-3 mb-[30px]">
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

              {/* Apple Button */}
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
              <Text className="text-[#4B5563] text-[14px] font-Poppins">Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text className="text-[#6D28D9] text-[14px] font-Poppins-Bold">Login</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    </KeyboardAvoidingView>
  );
}
