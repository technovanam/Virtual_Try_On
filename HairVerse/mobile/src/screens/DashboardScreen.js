import React from 'react';
import { Text, View, TouchableOpacity, SafeAreaView, Modal, ScrollView } from 'react-native';
import { useAuthStore } from '../store/authStore';
import OnboardingScreen from './OnboardingScreen';
import DashboardHeader from '../components/DashboardHeader';
import AITryOnHero from '../components/AITryOnHero';
import RecommendedSection from '../components/RecommendedSection';

import CelebrityMatchSection from '../components/CelebrityMatchSection';
import RecentlyTriedSection from '../components/RecentlyTriedSection';
import SavedCollectionsSection from '../components/SavedCollectionsSection';
import AIInsightsSection from '../components/AIInsightsSection';
import ContinueTryOnSection from '../components/ContinueTryOnSection';


export default function DashboardScreen() {
  const { user, isAuthenticated } = useAuthStore();

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
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 110 }}
          showsVerticalScrollIndicator={false}
        >
          <AITryOnHero />

          <ContinueTryOnSection />
          
          <AIInsightsSection />
          
          <RecentlyTriedSection />

          <SavedCollectionsSection />

          <CelebrityMatchSection />

          <RecommendedSection />
          
          <View className="min-h-[24px]" />
          
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
