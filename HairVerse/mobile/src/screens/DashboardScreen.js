import React from 'react';
import { Text, View, TouchableOpacity, SafeAreaView, Modal, ScrollView } from 'react-native';
import { useAuthStore } from '../store/authStore';
import OnboardingScreen from './OnboardingScreen';
import DashboardHeader from '../components/DashboardHeader';
import AITryOnHero from '../components/AITryOnHero';
import RecommendedSection from '../components/RecommendedSection';
import RecentlyTriedSection from '../components/RecentlyTriedSection';

export default function DashboardScreen() {
  const { user, logout, isAuthenticated } = useAuthStore();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <Modal
        visible={isAuthenticated && user !== null && !user.onboardingCompleted}
        animationType="fade"
        transparent={true}
      >
        <OnboardingScreen />
      </Modal>

      <DashboardHeader />

      <View style={{ flex: 1, minHeight: 0 }}>
        <ScrollView 
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          <AITryOnHero />
          
          <RecentlyTriedSection />

          <RecommendedSection />
          
          <View className="min-h-[24px]" />
          
          <TouchableOpacity 
            className="bg-white py-3.5 px-8 rounded-xl border border-[#ff4444] w-full items-center" 
            onPress={handleLogout}
          >
            <Text className="text-[#ff4444] text-base font-bold">Logout</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
