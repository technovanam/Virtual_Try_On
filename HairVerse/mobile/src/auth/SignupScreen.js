import React, { useState } from 'react';
import { Text, View, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, Dimensions, Image, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const { height } = Dimensions.get('window');

export default function SignupScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [agree, setAgree] = useState(false);
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
    
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }

    if (!agree) {
      setLocalError('Please agree to Terms & Conditions.');
      return;
    }

    const result = await register(email, password, username);
    if (!result.success) {
      setLocalError(result.error || 'This email has been already registered.');
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
      <View className="flex-1 bg-[#05030D]">
        <View style={StyleSheet.absoluteFillObject} backgroundColor="#05030D" />
        {/* Glowing background blobs */}
        <View style={[StyleSheet.absoluteFillObject, { opacity: 0.3 }]}>
          <LinearGradient
            colors={['rgba(139, 92, 246, 0.4)', 'rgba(79, 141, 255, 0.2)', 'transparent']}
            start={{ x: 0.1, y: 0.1 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
        </View>
        <SafeAreaView className="flex-1" edges={['top']}>
          <ScrollView contentContainerClassName="flex-grow" bounces={false} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View className="flex-row justify-between items-center px-6 pt-[25px]">
              <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2">
                <Ionicons name="chevron-back" size={24} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity className="flex-row items-center border border-[rgba(241,241,241,0.7)] rounded-[40px] px-3 py-1.5 gap-1.5">
                <Ionicons name="globe-outline" size={12} color="#F0F0F0" />
                <Text className="text-zinc-100 text-xs font-normal font-['Inter'] tracking-tight">EN</Text>
                <Ionicons name="chevron-down" size={12} color="#F0F0F0" />
              </TouchableOpacity>
            </View>
 
            {/* Title Text */}
            <View className="px-[30px] pt-[20px] z-10">
              <Text className="text-white text-3xl font-semibold font-['Inter-SemiBold'] mb-2">Create Account</Text>
              <Text className="text-white text-base font-normal font-['Inter']">Discover hairstyles tailored to your face.</Text>
            </View>
 
            {/* Card Overlay */}
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.12)', 'rgba(255, 255, 255, 0.03)']}
              className="flex-1 rounded-t-[50px] rounded-b-none px-[30px] pt-[50px] pb-0"
              style={{ marginTop: height * 0.05 }}
            >
              {/* Username Input */}
              <View className="flex-row items-center bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-[20px] mb-4 px-4 h-[56px]">
                <Ionicons name="person-outline" size={20} color="rgba(255, 255, 255, 0.70)" className="mr-3" />
                <TextInput
                  className="flex-1 bg-transparent text-white/70 text-base font-normal font-['Roboto'] outline-none"
                  placeholder="Username"
                  placeholderTextColor="rgba(255, 255, 255, 0.70)"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                />
              </View>
 
              {/* Email Input */}
              <View className="flex-row items-center bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-[20px] mb-4 px-4 h-[56px]">
                <Ionicons name="mail-outline" size={20} color="rgba(255, 255, 255, 0.70)" className="mr-3" />
                <TextInput
                  className="flex-1 bg-transparent text-white/70 text-base font-normal font-['Roboto'] outline-none"
                  placeholder="Enter Your Email"
                  placeholderTextColor="rgba(255, 255, 255, 0.70)"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
 
              {/* Password Input */}
              <View className="flex-row items-center bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-[20px] mb-4 px-4 h-[56px]">
                <Ionicons name="lock-closed-outline" size={20} color="rgba(255, 255, 255, 0.70)" className="mr-3" />
                <TextInput
                  className="flex-1 bg-transparent text-white/70 text-base font-normal font-['Roboto'] outline-none"
                  placeholder="Password"
                  placeholderTextColor="rgba(255, 255, 255, 0.70)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity className="p-1" onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="rgba(255, 255, 255, 0.70)" />
                </TouchableOpacity>
              </View>
 
              {/* Confirm Password Input */}
              <View className="flex-row items-center bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-[20px] mb-4 px-4 h-[56px]">
                <Ionicons name="lock-closed-outline" size={20} color="rgba(255, 255, 255, 0.70)" className="mr-3" />
                <TextInput
                  className="flex-1 bg-transparent text-white/70 text-base font-normal font-['Roboto'] outline-none"
                  placeholder="Confirm Password"
                  placeholderTextColor="rgba(255, 255, 255, 0.70)"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity className="p-1" onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Ionicons name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="rgba(255, 255, 255, 0.70)" />
                </TouchableOpacity>
              </View>
 
              {/* Password Strength */}
              {password.length > 0 && (
                <View className="mb-4">
                  <View className="flex-row justify-between mb-2 px-1">
                    <Text className="text-white/70 text-xs font-normal font-['Roboto']">Password Strength</Text>
                    <Text style={{ color: strength.color }} className="text-xs font-normal font-['Roboto']">{strength.label}</Text>
                  </View>
                  <View className="flex-row gap-2">
                    {[1, 2, 3, 4].map((segment) => (
                      <View 
                        key={segment} 
                        className="flex-1 h-[3px] rounded-full" 
                        style={{ backgroundColor: segment <= strength.segments ? '#8B5CF6' : 'rgba(255,255,255,0.1)' }}
                      />
                    ))}
                  </View>
                </View>
              )}
 
              {/* Terms Checkbox */}
              <TouchableOpacity className="flex-row items-center mb-[30px]" onPress={() => setAgree(!agree)}>
                <View className={`w-5 h-5 rounded-md border items-center justify-center mr-3 ${agree ? 'bg-[#8B5CF6] border-[#8B5CF6]' : 'border-[rgba(255,255,255,0.70)]'}`}>
                  {agree && <Ionicons name="checkmark" size={14} color="#FFF" />}
                </View>
                <Text className="text-white/70 text-sm font-normal font-['Roboto'] tracking-wide">I agree to <Text className="text-violet-700 text-sm font-normal font-['Roboto'] tracking-wide">Terms & Conditions</Text></Text>
              </TouchableOpacity>
 
              {/* Error Message */}
              {localError ? (
                <View className="flex-row items-center bg-[rgba(239,68,68,0.1)] rounded-lg p-2.5 mb-4 border border-[rgba(239,68,68,0.3)]">
                  <Ionicons name="alert-circle" size={16} color="#EF4444" style={{ marginRight: 6 }} />
                  <Text className="flex-1 text-[#EF4444] text-[12px] font-medium">{localError}</Text>
                </View>
              ) : null}
 
              {/* Create Account Button */}
              <TouchableOpacity
                className={`rounded-[20px] overflow-hidden mb-[30px] elevation-10 ${(!agree || isLoading) ? 'opacity-50' : ''}`}
                style={{ shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 8 }, shadowOpacity: (!agree || isLoading) ? 0 : 0.35, shadowRadius: 30 }}
                onPress={handleSignup}
                disabled={!agree || isLoading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#8B5CF6', '#6366F1', '#3B82F6']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="h-[59px] justify-center items-center"
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text className="text-white text-base font-semibold font-['Inter-SemiBold']">Create Account</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
 
              {/* Or Divider */}
              <View className="flex-row items-center mb-5">
                <View className="flex-1 h-[1px] bg-[rgba(221,221,221,0.50)]" />
                <Text className="text-white/70 text-base font-medium font-['Radio_Canada'] px-4">Or</Text>
                <View className="flex-1 h-[1px] bg-[rgba(221,221,221,0.50)]" />
              </View>
 
              {/* Social Buttons */}
              <View className="flex-row justify-center gap-5">
                <TouchableOpacity className="w-[44px] h-[44px] rounded-full border border-[rgba(255,255,255,0.70)] justify-center items-center">
                  <Image source={{ uri: 'https://img.icons8.com/color/48/000000/google-logo.png' }} style={{ width: 20, height: 20 }} />
                </TouchableOpacity>
                <TouchableOpacity className="w-[44px] h-[44px] rounded-full border border-[rgba(255,255,255,0.70)] justify-center items-center">
                  <Ionicons name="logo-apple" size={20} color="rgba(242, 242, 242, 0.90)" />
                </TouchableOpacity>
              </View>

            </LinearGradient>
          </ScrollView>
          {/* Floating Image */}
          <View className="absolute right-2 z-10 elevation-10" style={{ top: height * 0.12 }} pointerEvents="none">
            <Image 
              source={require('../../assets/barbershop.png')} 
              className="w-[70px] h-[70px]"
              resizeMode="contain"
            />
          </View>
        </SafeAreaView>
      </View>
    </KeyboardAvoidingView>
  );
}
