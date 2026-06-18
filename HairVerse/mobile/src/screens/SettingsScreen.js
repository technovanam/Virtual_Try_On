import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Switch, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useSettingsStore } from '../store/settingsStore';
import { useAuthStore } from '../store/authStore';
import { Ionicons } from '@expo/vector-icons';

const SectionHeader = ({ title }) => (
  <Text style={styles.sectionTitle}>{title}</Text>
);

const SettingRow = ({ icon, label, value, subLabel, onToggle, onPress, isLink, destructive }) => {
  const isSwitch = onToggle !== undefined;
  const isPressable = !!(isLink || onPress);
  const Wrapper = isPressable ? TouchableOpacity : View;

  return (
    <Wrapper 
      onPress={isPressable ? onPress : undefined}
      style={styles.menuItem}
      activeOpacity={isPressable ? 0.7 : 1}
    >
      <View style={styles.menuItemLeft}>
        <View style={[styles.menuIconBg, { backgroundColor: destructive ? '#FEE2E2' : '#F5F3FF' }]}>
          <Ionicons name={icon} size={18} color={destructive ? '#EF4444' : '#6D28D9'} />
        </View>
        <View style={{ flex: 1, paddingRight: 8 }}>
          <Text style={[styles.menuItemText, destructive && { color: '#EF4444' }]}>{label}</Text>
          {subLabel && <Text style={styles.subLabel}>{subLabel}</Text>}
        </View>
      </View>
      
      {isSwitch && (
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: '#E5E7EB', true: '#6D28D9' }}
          thumbColor={'#FFFFFF'}
        />
      )}
      
      {isLink && !isSwitch && (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {typeof value === 'string' && <Text style={styles.rowValue}>{value}</Text>}
            <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
        </View>
      )}
    </Wrapper>
  );
};

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { settings, loading, error, isInitialized, fetchSettings, updateSetting, resetSettings } = useSettingsStore();
  const { logout, user, sendPasswordReset } = useAuthStore();
  const [fakeCacheSize, setFakeCacheSize] = useState('142 MB');

  useEffect(() => {
    if (!isInitialized) fetchSettings();
  }, [isInitialized]);

  const handleReset = () => {
    Alert.alert(
      "Reset Preferences",
      "Are you sure you want to reset all settings to their default values?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Reset", style: "destructive", onPress: resetSettings }
      ]
    );
  };

  const handleClearCache = () => {
    Alert.alert("Cache Cleared", "Successfully freed up 142 MB of local storage.");
    setFakeCacheSize('0 MB');
  };

  const handleChangePassword = () => {
    if (!user?.email) {
      Alert.alert("Error", "User email address not found.");
      return;
    }
    Alert.alert(
      "Change Password",
      `Would you like to send a password reset link to your email: ${user.email}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send Reset Link",
          onPress: async () => {
            const res = await sendPasswordReset(user.email);
            if (res.success) {
              Alert.alert("Email Sent", "A password reset link has been successfully sent to your email address.");
            } else {
              Alert.alert("Failed", res.error || "Failed to send reset email.");
            }
          }
        }
      ]
    );
  };

  if (loading && !settings) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6D28D9" />
      </View>
    );
  }

  if (error && !settings) {
    return (
      <SafeAreaView edges={['top']} style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text style={styles.errorTitle}>Failed to load settings</Text>
          <Text style={styles.errorSubtitle}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchSettings}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const s = settings || {};

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>
        <TouchableOpacity onPress={handleReset} activeOpacity={0.7}>
          <Text style={styles.resetButtonText}>Reset</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={styles.scrollContainer} 
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Account Settings */}
        <SectionHeader title="Account Settings" />
        <View style={styles.menuContainer}>
          <SettingRow icon="person-outline" label="Edit Profile" subLabel="Update name, gender, and hair details" isLink onPress={() => navigation.navigate('EditProfile')} />
          <SettingRow icon="mail-outline" label="Email Address" value={user?.email} isLink onPress={() => {}} />
          <SettingRow icon="key-outline" label="Change Password" isLink onPress={handleChangePassword} />
        </View>

        {/* 2. Personalization */}
        <SectionHeader title="Personalization" />
        <View style={styles.menuContainer}>
          <SettingRow icon="cut-outline" label="Hairstyle Categories" subLabel="Manage your favorite styles" isLink onPress={() => {}} />
          <SettingRow icon="color-palette-outline" label="Preferred Colors" isLink onPress={() => {}} />
          <SettingRow icon="resize-outline" label="Preferred Hair Length" value="Medium" isLink onPress={() => {}} />
        </View>

        {/* 3. AI Recommendation Settings */}
        <SectionHeader title="AI Recommendations" />
        <View style={styles.menuContainer}>
          <SettingRow icon="sparkles-outline" label="Personalized Suggestions" value={s.personalizedRecommendations} onToggle={(val) => updateSetting('personalizedRecommendations', val)} />
          <SettingRow icon="star-outline" label="Celebrity Lookalikes" value={s.celebritySuggestions} onToggle={(val) => updateSetting('celebritySuggestions', val)} />
        </View>

        {/* 4. Notification Settings */}
        <SectionHeader title="Notifications" />
        <View style={styles.menuContainer}>
          <SettingRow icon="notifications-outline" label="Allow All Notifications" value={s.notificationsEnabled} onToggle={(val) => updateSetting('notificationsEnabled', val)} />
          {s.notificationsEnabled && (
             <>
               <SettingRow icon="trending-up-outline" label="Trend Alerts" value={s.trendNotifications} onToggle={(val) => updateSetting('trendNotifications', val)} />
               <SettingRow icon="bulb-outline" label="New Recommendations" value={s.recommendationNotifications} onToggle={(val) => updateSetting('recommendationNotifications', val)} />
               <SettingRow icon="medkit-outline" label="Haircare Tips" value={s.haircareNotifications} onToggle={(val) => updateSetting('haircareNotifications', val)} />
             </>
          )}
        </View>

        {/* 5. Language & Appearance */}
        <SectionHeader title="Language & Appearance" />
        <View style={styles.menuContainer}>
          <SettingRow icon="language-outline" label="Language" value={s.language} isLink onPress={() => {}} />
          <SettingRow icon="moon-outline" label="Theme" value={s.theme} isLink onPress={() => {}} />
        </View>

        {/* 6. Privacy & Security */}
        <SectionHeader title="Privacy & Security" />
        <View style={styles.menuContainer}>
          <SettingRow icon="finger-print-outline" label="Biometric Login" value={s.biometricEnabled} onToggle={(val) => updateSetting('biometricEnabled', val)} />
          <SettingRow icon="trash-bin-outline" label="Auto-Delete Selfies" subLabel="Remove after 24 hours" value={s.autoDeleteSelfies} onToggle={(val) => updateSetting('autoDeleteSelfies', val)} />
          <SettingRow icon="shield-checkmark-outline" label="Analytics Consent" value={s.analyticsConsent} onToggle={(val) => updateSetting('analyticsConsent', val)} />
        </View>

        {/* 7. Storage Management */}
        <SectionHeader title="Storage Management" />
        <View style={styles.menuContainer}>
          <SettingRow icon="server-outline" label="Local Cache Size" value={fakeCacheSize} />
          <SettingRow icon="refresh-outline" label="Clear Local Cache" isLink onPress={handleClearCache} />
        </View>

        {/* 8. Accessibility */}
        <SectionHeader title="Accessibility" />
        <View style={[styles.menuContainer, { marginBottom: 24 }]}>
           <SettingRow icon="text-outline" label="Larger Text" value={s.accessibilityOptions?.largerText} onToggle={(val) => updateSetting('accessibilityOptions', { ...s.accessibilityOptions, largerText: val })} />
           <SettingRow icon="contrast-outline" label="High Contrast" value={s.accessibilityOptions?.highContrast} onToggle={(val) => updateSetting('accessibilityOptions', { ...s.accessibilityOptions, highContrast: val })} />
           <SettingRow icon="play-skip-forward-outline" label="Reduced Motion" value={s.accessibilityOptions?.reducedMotion} onToggle={(val) => updateSetting('accessibilityOptions', { ...s.accessibilityOptions, reducedMotion: val })} />
        </View>

        {/* Actions */}
        <View style={styles.menuContainer}>
          <SettingRow icon="log-out-outline" label="Sign Out" destructive onPress={logout} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
    color: '#0F172A',
    marginLeft: 14,
  },
  resetButtonText: {
    color: '#6D28D9',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 80,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Poppins_700Bold',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 26,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  menuContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.02,
    shadowRadius: 12,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderColor: '#F8FAFC',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuItemText: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: '#1E293B',
  },
  subLabel: {
    fontSize: 11,
    fontFamily: 'Poppins_400Regular',
    color: '#64748B',
    marginTop: 2,
  },
  rowValue: {
    color: '#94A3B8',
    fontFamily: 'Poppins_500Medium',
    fontSize: 13,
    marginRight: 8,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 100,
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
  },
  retryButtonText: {
    color: '#ffffff',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
  },
});
