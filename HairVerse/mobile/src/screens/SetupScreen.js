import React from 'react';
import { Text, View, TouchableOpacity, SafeAreaView } from 'react-native';
import { useAuthStore } from '../store/authStore';

export default function SetupScreen() {
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      <View className="flex-1 justify-center items-center p-6">
        <Text className="text-2xl font-bold text-primary mb-2 text-center">HairVerse Setup In Progress</Text>
        <Text className="text-base text-white/70 mb-8">Welcome back!</Text>
        
        <View className="bg-white/5 p-5 rounded-2xl w-full mb-8 border border-primary/10">
          <Text className="text-xs text-white/50 mb-1 uppercase">Name:</Text>
          <Text className="text-base text-white mb-4 font-medium">{user?.displayName || 'User'}</Text>
          
          <Text className="text-xs text-white/50 mb-1 uppercase">Email:</Text>
          <Text className="text-base text-white mb-4 font-medium">{user?.email || 'N/A'}</Text>
        </View>

        <TouchableOpacity className="bg-[#ff3c3c]/15 py-3.5 px-8 rounded-xl border border-[#ff3c3c]/30 w-full items-center" onPress={handleLogout}>
          <Text className="text-[#ff4d4d] text-base font-bold">Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
