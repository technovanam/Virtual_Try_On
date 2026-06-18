import React from 'react';
import { Text, View, TouchableOpacity, Modal, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/authStore';
import { useSelfieStore } from '../store/selfieStore';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
            <View style={styles.actionRow}>
              <TouchableOpacity 
                style={styles.primaryButtonWrapper}
                onPress={() => navigation.navigate('Try-On')}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#8B5CF6', '#6D28D9']}
                  style={styles.primaryButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.primaryButtonText}>Upload Selfie</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.secondaryButton}
                onPress={() => navigation.navigate('LiveCamera')}
                activeOpacity={0.8}
              >
                <Text style={styles.secondaryButtonText}>Live Camera</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.chooseActionContainer}>
              <Text style={styles.sectionTitle}>Choose Action</Text>
              <View style={styles.actionRow}>
                <TouchableOpacity 
                  style={styles.primaryButtonWrapper}
                  onPress={() => navigation.navigate('VirtualTryOn')}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#8B5CF6', '#6D28D9']}
                    style={styles.primaryButton}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={styles.primaryButtonText}>Virtual Try-On</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.secondaryButton}
                  onPress={() => navigation.navigate('LiveCamera')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.secondaryButtonText}>AI Analysis</Text>
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
            style={styles.historyBanner}
            onPress={() => navigation.navigate('StyleHistoryScreen')}
            activeOpacity={0.8}
          >
            <View style={styles.historyLeft}>
              <View style={styles.historyIconContainer}>
                <Ionicons name="time-outline" size={20} color="#6D28D9" />
              </View>
              <View style={styles.historyInfo}>
                <Text style={styles.historyTitle}>History</Text>
                <Text style={styles.historySubtitle}>View all past activities</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
          </TouchableOpacity>

          <View style={{ height: 24 }} />
          
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  primaryButtonWrapper: {
    flex: 1,
    marginRight: 6,
  },
  primaryButton: {
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6D28D9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
  },
  secondaryButton: {
    flex: 1,
    marginLeft: 6,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  secondaryButtonText: {
    color: '#475569',
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
  },
  chooseActionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
    color: '#1E293B',
    marginBottom: 12,
  },
  historyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F3FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyInfo: {
    marginLeft: 12,
  },
  historyTitle: {
    fontSize: 14,
    fontFamily: 'Poppins_700Bold',
    color: '#1E293B',
  },
  historySubtitle: {
    fontSize: 11,
    fontFamily: 'Poppins_500Medium',
    color: '#64748B',
    marginTop: 1,
  },
});
