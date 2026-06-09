import React from 'react';
import { Text, View, TouchableOpacity, SafeAreaView, Modal, ScrollView } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { useSelfieStore } from '../store/selfieStore';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import OnboardingScreen from './OnboardingScreen';
import DashboardHeader from '../components/DashboardHeader';
import DashboardSearch from '../components/DashboardSearch';
import AITryOnHero from '../components/AITryOnHero';
import RecommendedSection from '../components/RecommendedSection';
import TrendingHairstylesSection from '../components/TrendingHairstylesSection';
import RecentlyTriedSection from '../components/RecentlyTriedSection';
import SavedCollectionsSection from '../components/SavedCollectionsSection';
import AIInsightsSection from '../components/AIInsightsSection';
import ContinueTryOnSection from '../components/ContinueTryOnSection';

export default function DashboardScreen() {
  const { user, isAuthenticated } = useAuthStore();
  const { activeSelfie } = useSelfieStore();
  const navigation = useNavigation();

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
      <DashboardSearch />

      <View style={{ flex: 1, minHeight: 0 }}>
        <ScrollView 
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 110 }}
          showsVerticalScrollIndicator={false}
        >
          <AITryOnHero />

          {/* Action Blocks based on activeSelfie */}
          {!activeSelfie ? (
            <View className="flex-row justify-between mb-6 gap-3">
              <TouchableOpacity 
                className="flex-1 py-[14px] rounded-2xl items-center justify-center bg-[#00d2ff] shadow-sm"
                onPress={() => navigation.navigate('Try-On')}
                activeOpacity={0.8}
              >
                <Text className="text-[#0f3460] text-[15px] font-bold">Upload Selfie</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className="flex-1 py-[14px] rounded-2xl items-center justify-center bg-[#F1F5F9] border border-[#E2E8F0]"
                onPress={() => navigation.navigate('LiveCamera')}
                activeOpacity={0.8}
              >
                <Text className="text-[#0F172A] text-[15px] font-semibold">Live Camera</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="mb-6">
              <Text className="text-xl font-bold text-[#0F172A] mb-4">Choose Action</Text>
              <View className="flex-row justify-between gap-3">
                <TouchableOpacity 
                  className="flex-1 py-[14px] rounded-2xl items-center justify-center bg-[#0F172A] shadow-sm"
                  onPress={() => navigation.navigate('VirtualTryOn')}
                  activeOpacity={0.8}
                >
                  <Text className="text-white text-[15px] font-bold">Virtual Try-On</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  className="flex-1 py-[14px] rounded-2xl items-center justify-center bg-[#F1F5F9] border border-[#E2E8F0]"
                  onPress={() => navigation.navigate('LiveCamera')}
                  activeOpacity={0.8}
                >
                  <Text className="text-[#0F172A] text-[15px] font-semibold">AI Analysis</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <TrendingHairstylesSection />
          
          <RecommendedSection />
          
          <AIInsightsSection />
          
          <ContinueTryOnSection />
          
          <RecentlyTriedSection />

          <SavedCollectionsSection />

          {/* History Link Section */}
          <TouchableOpacity 
            className="flex-row items-center justify-between bg-[#F8FAFC] rounded-2xl p-5 mb-6 border border-[#E2E8F0]"
            onPress={() => navigation.navigate('StyleHistoryScreen')}
            activeOpacity={0.8}
          >
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-full bg-[#EEF2FF] justify-center items-center">
                <Ionicons name="time-outline" size={20} color="#6366F1" />
              </View>
              <View>
                <Text className="text-base font-bold text-[#0F172A]">History</Text>
                <Text className="text-xs text-[#64748B]">View all past activities</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
          </TouchableOpacity>

          <View className="min-h-[24px]" />
          
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
