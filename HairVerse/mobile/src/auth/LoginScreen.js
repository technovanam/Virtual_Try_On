import React, { useState, useEffect } from 'react';
import { Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator, Dimensions, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

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
    <View className="flex-1 bg-[#05030D]">
      <View style={StyleSheet.absoluteFillObject} backgroundColor="#05030D" />
      {/* Approximating the glowing background blobs using soft gradients */}
      <View style={[StyleSheet.absoluteFillObject, { opacity: 0.3 }]}>
        <LinearGradient
          colors={['rgba(139, 92, 246, 0.4)', 'rgba(79, 141, 255, 0.2)', 'transparent']}
          start={{ x: 0.1, y: 0.1 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
      </View>
      <SafeAreaView className="flex-1" edges={['top']}>
        
        {/* Header - Language Pill */}
        <View className="items-end px-6 pt-[25px]">
          <TouchableOpacity className="flex-row items-center border border-[rgba(241,241,241,0.7)] rounded-[40px] px-3 py-1.5 gap-1.5">
            <Ionicons name="globe-outline" size={12} color="#F0F0F0" />
            <Text className="text-[#F0F0F0] text-[12px] font-normal tracking-[0.36px]">EN</Text>
            <Ionicons name="chevron-down" size={12} color="#F0F0F0" />
          </TouchableOpacity>
        </View>

        {/* Welcome Text */}
        <View className="px-[30px] pt-[30px] z-10">
          <Text className="text-white text-[32px] font-semibold mb-2">Welcome Back</Text>
          <Text className="text-white text-[15px] font-normal">See yourself in a new style.</Text>
        </View>

        {/* Card Overlay */}
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.12)', 'rgba(255, 255, 255, 0.03)']}
          className="flex-1 rounded-t-[50px] rounded-b-none px-[30px] pt-[40px] pb-[20px]"
          style={{ marginTop: height * 0.1 }}
        >
          <Text className="text-white text-[24px] font-semibold mb-[30px]">Login</Text>

          <View className="flex-row items-center bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-[20px] mb-4 px-4 h-[56px]">
            <Ionicons name="mail-outline" size={20} color="rgba(255, 255, 255, 0.70)" className="mr-3" />
            <TextInput
              className="flex-1 bg-transparent text-[rgba(255,255,255,0.70)] text-[16px] font-normal outline-none"
              placeholder="Enter Your Email"
              placeholderTextColor="rgba(255, 255, 255, 0.70)"
              value={email}
              onChangeText={handleEmailChange}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View className="flex-row items-center bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-[20px] mb-4 px-4 h-[56px]">
            <Ionicons name="lock-closed-outline" size={20} color="rgba(255, 255, 255, 0.70)" className="mr-3" />
            <TextInput
              className="flex-1 bg-transparent text-[rgba(255,255,255,0.70)] text-[16px] font-normal outline-none"
              placeholder="Password"
              placeholderTextColor="rgba(255, 255, 255, 0.70)"
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
                color="rgba(255, 255, 255, 0.70)"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity className="items-end mb-[30px]">
            <Text className="text-[rgba(255,255,255,0.70)] text-[14px] font-semibold">Forget password?</Text>
          </TouchableOpacity>

          {localError ? (
            <View className="flex-row items-center bg-[rgba(239,68,68,0.1)] rounded-lg p-2.5 mb-4 border border-[rgba(239,68,68,0.3)]">
              <Ionicons name="alert-circle" size={16} color="#EF4444" style={{ marginRight: 6 }} />
              <Text className="flex-1 text-[#EF4444] text-[12px] font-medium">{localError}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            className="rounded-[20px] overflow-hidden mb-[30px] elevation-10"
            style={{ shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 30 }}
            onPress={handleLogin}
            disabled={isLoading}
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
                <Text className="text-white text-[16px] font-semibold">Continue</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <View className="flex-row items-center mb-[30px]">
            <View className="flex-1 h-[1px] bg-[rgba(221,221,221,0.50)]" />
            <Text className="text-[rgba(255,255,255,0.70)] px-4 text-[16px] font-medium">Or </Text>
            <View className="flex-1 h-[1px] bg-[rgba(221,221,221,0.50)]" />
          </View>

          <View className="flex-row justify-center gap-5 mb-[30px]">
            <TouchableOpacity className="w-[44px] h-[44px] rounded-full border border-[rgba(255,255,255,0.70)] justify-center items-center">
              <Image source={{ uri: 'https://img.icons8.com/color/48/000000/google-logo.png' }} style={{ width: 20, height: 20 }} />
            </TouchableOpacity>
            <TouchableOpacity className="w-[44px] h-[44px] rounded-full border border-[rgba(255,255,255,0.70)] justify-center items-center">
              <Ionicons name="logo-apple" size={20} color="rgba(242, 242, 242, 0.90)" />
            </TouchableOpacity>
          </View>

          <View className="flex-row justify-center pb-5">
            <Text className="text-[rgba(255,255,255,0.70)] text-[14px] tracking-[0.42px]">Don’t have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text className="text-[#8339FB] text-[14px] tracking-[0.42px]">Create Account</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Floating Icons (Scissor & Comb image) */}
        {/* Positioned after card to overlap it properly */}
        <View className="absolute right-[15px] z-10 elevation-10" style={{ top: height * 0.18 }}>
          <Image 
            source={require('../../assets/barbershop.png')} 
            className="w-[180px] h-[180px]"
            resizeMode="contain"
          />
        </View>
      </SafeAreaView>
    </View>
  );
}
