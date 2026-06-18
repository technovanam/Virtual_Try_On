import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet, Platform, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useProfileStore } from '../store/profileStore';
import { useAuthStore } from '../store/authStore';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const { profileData, stats, aiStyleProfile, hairInsightsSummary, completionPercentage, isLoading, error, fetchProfile } = useProfileStore();
  const { logout } = useAuthStore();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    fetchProfile();
  }, []);

  if (isLoading && !profileData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6D28D9" />
      </View>
    );
  }

  if (error && !profileData) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
        <Text style={styles.errorTitle}>Failed to load profile</Text>
        <Text style={styles.errorSubtitle}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchProfile}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!profileData) return null;

  const username = profileData.displayName || profileData.email?.split('@')[0] || 'User';
  const initial = username.charAt(0).toUpperCase();

  return (
    <View style={styles.container}>
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120 }} 
        showsVerticalScrollIndicator={false}
      >
        {/* Top Cover Background */}
        <LinearGradient
          colors={['#7C3AED', '#4F46E5']}
          style={[styles.headerCover, { paddingTop: insets.top + 10 }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.topBar}>
            <Text style={styles.topBarTitle}>Profile</Text>
            <TouchableOpacity 
              style={styles.settingsButton} 
              onPress={() => navigation.navigate('Settings')}
            >
              <Ionicons name="settings-outline" size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Profile Details Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={['#C084FC', '#6D28D9']}
              style={styles.avatarRing}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.avatarInner}>
                <Text style={styles.avatarInitial}>{initial}</Text>
              </View>
            </LinearGradient>
            <View style={styles.badgeContainer}>
              <Ionicons name="star" size={12} color="#ffffff" />
            </View>
          </View>
          
          <Text style={styles.username}>{username}</Text>
          <Text style={styles.email}>{profileData.email}</Text>
          
          <View style={styles.badgeWrapper}>
            <Text style={styles.badgeText}>{profileData.userBadge || 'Style Explorer'}</Text>
          </View>

          {/* Progress Section */}
          <View style={styles.progressSection}>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${completionPercentage}%` }]} />
            </View>
            <Text style={styles.progressLabel}>{completionPercentage}% Profile Completed</Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats?.hairstylesTried || 0}</Text>
            <Text style={styles.statLabel}>Try-Ons</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats?.savedStyles || 0}</Text>
            <Text style={styles.statLabel}>Saved</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats?.comparisonsCreated || 0}</Text>
            <Text style={styles.statLabel}>Compared</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats?.recommendationsUsed || 0}</Text>
            <Text style={styles.statLabel}>Matches</Text>
          </View>
        </View>

        {/* AI Style Profile / DNA Card */}
        <View style={styles.sectionHeader}>
          <Ionicons name="sparkles" size={15} color="#6D28D9" />
          <Text style={styles.sectionTitle}>AI Hair DNA</Text>
        </View>

        <LinearGradient
          colors={['#1E1B4B', '#312E81']}
          style={styles.dnaCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.dnaGrid}>
            {/* Left Column: Health Score Circular Indicator */}
            <View style={styles.dnaLeftColumn}>
              <View style={styles.healthScoreCircle}>
                <Text style={styles.healthScoreValue}>{hairInsightsSummary?.healthScore || '--'}</Text>
                <Text style={styles.healthScoreMax}>/ 100</Text>
              </View>
              <Text style={styles.healthScoreLabel}>Hair Health Score</Text>
            </View>

            {/* Right Column: AI Insights Details */}
            <View style={styles.dnaRightColumn}>
              <View style={styles.traitItem}>
                <Text style={styles.traitLabel}>Favorite Color</Text>
                <Text style={styles.traitValue} numberOfLines={1}>
                  {aiStyleProfile?.favoriteHairColors?.[0] || 'Unknown'}
                </Text>
              </View>
              <View style={styles.traitItem}>
                <Text style={styles.traitLabel}>Top Category</Text>
                <Text style={styles.traitValue} numberOfLines={1}>
                  {aiStyleProfile?.favoriteCategories?.[0] || 'Unknown'}
                </Text>
              </View>
              <View style={styles.traitItem}>
                <Text style={styles.traitLabel}>Maintenance</Text>
                <Text style={styles.traitValue} numberOfLines={1}>
                  {aiStyleProfile?.preferredMaintenanceLevel || 'Unknown'}
                </Text>
              </View>
            </View>
          </View>
          
          <View style={styles.dnaDivider} />
          
          <TouchableOpacity 
            style={styles.dnaFooter} 
            onPress={() => navigation.navigate('AIInsights')}
            activeOpacity={0.8}
          >
            <Text style={styles.dnaFooterText} numberOfLines={1}>
              {hairInsightsSummary?.growthSuggestions?.[0] || 'View detailed diagnostics & hair health analysis'}
            </Text>
            <Ionicons name="chevron-forward" size={16} color="#A5B4FC" />
          </TouchableOpacity>
        </LinearGradient>

        {/* Quick Access Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitleOnly}>Quick Access</Text>
        </View>

        <View style={styles.quickAccessRow}>
          <TouchableOpacity 
            style={styles.quickAccessCard}
            onPress={() => navigation.navigate('Saved')}
            activeOpacity={0.7}
          >
            <View style={[styles.quickAccessIconBg, { backgroundColor: '#EEF2FF' }]}>
              <Ionicons name="bookmark" size={20} color="#4F46E5" />
            </View>
            <Text style={styles.quickAccessLabel}>Saved</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.quickAccessCard}
            onPress={() => navigation.navigate('StyleHistoryScreen')}
            activeOpacity={0.7}
          >
            <View style={[styles.quickAccessIconBg, { backgroundColor: '#ECFDF5' }]}>
              <Ionicons name="time" size={20} color="#10B981" />
            </View>
            <Text style={styles.quickAccessLabel}>History</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.quickAccessCard}
            onPress={() => navigation.navigate('AIInsights')}
            activeOpacity={0.7}
          >
            <View style={[styles.quickAccessIconBg, { backgroundColor: '#FFFBEB' }]}>
              <Ionicons name="bulb" size={20} color="#F59E0B" />
            </View>
            <Text style={styles.quickAccessLabel}>Insights</Text>
          </TouchableOpacity>
        </View>

        {/* Settings Preferences Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitleOnly}>Preferences</Text>
        </View>

        <View style={styles.menuContainer}>
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => navigation.navigate('EditProfile')}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIconBg, { backgroundColor: '#F3F4F6' }]}>
                <Ionicons name="person-outline" size={16} color="#4B5563" />
              </View>
              <Text style={styles.menuItemText}>Edit Profile Details</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => navigation.navigate('Settings')}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIconBg, { backgroundColor: '#F3F4F6' }]}>
                <Ionicons name="notifications-outline" size={16} color="#4B5563" />
              </View>
              <Text style={styles.menuItemText}>Notification Settings</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.menuItem, { borderBottomWidth: 0 }]} 
            onPress={logout}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIconBg, { backgroundColor: '#FEE2E2' }]}>
                <Ionicons name="log-out-outline" size={16} color="#EF4444" />
              </View>
              <Text style={[styles.menuItemText, { color: '#EF4444' }]}>Logout</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  errorTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
    color: '#1E293B',
    marginTop: 16,
    textAlign: 'center',
  },
  errorSubtitle: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#6D28D9',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#6D28D9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  retryButtonText: {
    color: '#ffffff',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
  },
  headerCover: {
    height: 160,
    width: '100%',
    paddingHorizontal: 20,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  topBarTitle: {
    fontSize: 22,
    fontFamily: 'Poppins_700Bold',
    color: '#ffffff',
  },
  settingsButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    marginTop: -50, // Overlaps the header cover
    // Premium card shadow
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarRing: {
    width: 90,
    height: 90,
    borderRadius: 45,
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInner: {
    width: '100%',
    height: '100%',
    borderRadius: 42,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  avatarInitial: {
    fontSize: 34,
    fontFamily: 'Poppins_700Bold',
    color: '#6D28D9',
  },
  badgeContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FBBF24',
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  username: {
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
    color: '#0F172A',
    marginBottom: 2,
  },
  email: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: '#64748B',
    marginBottom: 10,
  },
  badgeWrapper: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: 'Poppins_600SemiBold',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  progressSection: {
    width: '100%',
    alignItems: 'center',
  },
  progressBarBg: {
    width: '80%',
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    marginBottom: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#6D28D9',
    borderRadius: 3,
  },
  progressLabel: {
    fontSize: 10,
    fontFamily: 'Poppins_500Medium',
    color: '#94A3B8',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    // Subtle shadow
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
    color: '#6D28D9',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 9,
    fontFamily: 'Poppins_600SemiBold',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Poppins_700Bold',
    color: '#0F172A',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginLeft: 6,
  },
  sectionTitleOnly: {
    fontSize: 11,
    fontFamily: 'Poppins_700Bold',
    color: '#0F172A',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  dnaCard: {
    marginHorizontal: 20,
    borderRadius: 22,
    padding: 20,
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 6,
  },
  dnaGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dnaLeftColumn: {
    alignItems: 'center',
    flex: 1.2,
  },
  healthScoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#818CF8',
    backgroundColor: '#1E1B4B',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#818CF8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  healthScoreValue: {
    fontSize: 26,
    fontFamily: 'Poppins_700Bold',
    color: '#ffffff',
  },
  healthScoreMax: {
    fontSize: 10,
    fontFamily: 'Poppins_500Medium',
    color: '#818CF8',
    marginTop: -2,
  },
  healthScoreLabel: {
    fontSize: 10,
    fontFamily: 'Poppins_600SemiBold',
    color: '#A5B4FC',
    marginTop: 8,
    textAlign: 'center',
  },
  dnaRightColumn: {
    flex: 1.8,
    paddingLeft: 16,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255, 255, 255, 0.1)',
  },
  traitItem: {
    marginBottom: 8,
  },
  traitLabel: {
    fontSize: 10,
    fontFamily: 'Poppins_400Regular',
    color: '#818CF8',
    marginBottom: 1,
  },
  traitValue: {
    fontSize: 13,
    fontFamily: 'Poppins_600SemiBold',
    color: '#ffffff',
  },
  dnaDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 14,
  },
  dnaFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dnaFooterText: {
    fontSize: 11,
    fontFamily: 'Poppins_500Medium',
    color: '#E0E7FF',
    flex: 1,
    marginRight: 10,
  },
  quickAccessRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
  },
  quickAccessCard: {
    backgroundColor: '#ffffff',
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 2,
  },
  quickAccessIconBg: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickAccessLabel: {
    fontSize: 11,
    fontFamily: 'Poppins_600SemiBold',
    color: '#334155',
  },
  menuContainer: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: '#F8FAFC',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuItemText: {
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
    color: '#1E293B',
  },
});

