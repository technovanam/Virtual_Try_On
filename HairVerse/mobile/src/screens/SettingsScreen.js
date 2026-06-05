import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useSettingsStore } from '../store/settingsStore';
import { useAuthStore } from '../store/authStore';
import { Ionicons } from '@expo/vector-icons';

const SectionHeader = ({ title }) => (
  <Text className="text-sm font-bold text-gray-500 uppercase tracking-wider mt-8 mb-3 px-2">{title}</Text>
);

const SettingRow = ({ icon, label, value, subLabel, onToggle, onPress, isLink, destructive }) => {
  const isSwitch = onToggle !== undefined;
  const isPressable = !!(isLink || onPress);
  const Wrapper = isPressable ? TouchableOpacity : View;

  return (
    <Wrapper 
      onPress={isPressable ? onPress : undefined}
      className={`flex-row items-center justify-between py-4 border-b border-gray-100 ${destructive ? 'bg-red-50/10' : ''}`}
    >
      <View className="flex-row items-center flex-1 pr-4">
        <View className={`w-9 h-9 rounded-full items-center justify-center mr-4 ${destructive ? 'bg-red-50' : 'bg-gray-100'}`}>
          <Ionicons name={icon} size={20} color={destructive ? '#EF4444' : '#4B5563'} />
        </View>
        <View className="flex-1">
           <Text className={`text-base font-medium ${destructive ? 'text-red-600' : 'text-gray-900'}`}>{label}</Text>
           {subLabel && <Text className="text-xs text-gray-500 mt-0.5">{subLabel}</Text>}
        </View>
      </View>
      
      {isSwitch && (
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: '#E5E7EB', true: '#4F46E5' }}
          thumbColor={'#FFFFFF'}
        />
      )}
      
      {isLink && !isSwitch && (
        <View className="flex-row items-center">
           {typeof value === 'string' && <Text className="text-gray-400 mr-2">{value}</Text>}
           <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </View>
      )}
    </Wrapper>
  );
};

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { settings, loading, error, isInitialized, fetchSettings, updateSetting, resetSettings } = useSettingsStore();
  const { logout, user } = useAuthStore();
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

  if (loading && !settings) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-[#F8FAFC] items-center justify-center">
        <ActivityIndicator size="large" color="#4F46E5" />
      </SafeAreaView>
    );
  }

  if (error && !settings) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-[#F8FAFC] items-center justify-center px-6">
        <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
        <Text className="text-xl font-bold text-gray-900 mt-4 text-center">Failed to load settings</Text>
        <Text className="text-gray-500 text-center mt-2 mb-8">{error}</Text>
        <TouchableOpacity className="bg-indigo-600 px-8 py-3.5 rounded-xl" onPress={fetchSettings}>
          <Text className="text-white font-bold text-base">Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const s = settings || {};

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-[#F8FAFC]">
      <View className="bg-white pt-2 pb-4 px-5 border-b border-gray-100 flex-row items-center justify-between z-10 shadow-sm">
        <View className="flex-row items-center">
           <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4 w-10 h-10 items-center justify-center bg-gray-50 rounded-full">
             <Ionicons name="arrow-back" size={20} color="#111827" />
           </TouchableOpacity>
           <Text className="text-2xl font-bold text-gray-900">Settings</Text>
        </View>
        <TouchableOpacity onPress={handleReset}>
           <Text className="text-indigo-600 font-bold">Reset</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
        
        {/* 1. Account Settings */}
        <SectionHeader title="Account Settings" />
        <View className="bg-white rounded-2xl px-4 py-1 shadow-sm border border-gray-100">
          <SettingRow icon="person-outline" label="Edit Profile" subLabel="Update username and avatar" isLink onPress={() => navigation.navigate('EditProfile')} />
          <SettingRow icon="mail-outline" label="Email Address" value={user?.email} isLink onPress={() => {}} />
          <SettingRow icon="key-outline" label="Change Password" isLink onPress={() => {}} />
        </View>

        {/* 2. Personalization */}
        <SectionHeader title="Personalization" />
        <View className="bg-white rounded-2xl px-4 py-1 shadow-sm border border-gray-100">
          <SettingRow icon="cut-outline" label="Hairstyle Categories" subLabel="Manage your favorite styles" isLink onPress={() => {}} />
          <SettingRow icon="color-palette-outline" label="Preferred Colors" isLink onPress={() => {}} />
          <SettingRow icon="resize-outline" label="Preferred Hair Length" value="Medium" isLink onPress={() => {}} />
        </View>

        {/* 3. AI Recommendation Settings */}
        <SectionHeader title="AI Recommendations" />
        <View className="bg-white rounded-2xl px-4 py-1 shadow-sm border border-gray-100">
          <SettingRow icon="sparkles-outline" label="Personalized Suggestions" value={s.personalizedRecommendations} onToggle={(val) => updateSetting('personalizedRecommendations', val)} />
          <SettingRow icon="star-outline" label="Celebrity Lookalikes" value={s.celebritySuggestions} onToggle={(val) => updateSetting('celebritySuggestions', val)} />
        </View>

        {/* 4. Notification Settings */}
        <SectionHeader title="Notifications" />
        <View className="bg-white rounded-2xl px-4 py-1 shadow-sm border border-gray-100">
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
        <View className="bg-white rounded-2xl px-4 py-1 shadow-sm border border-gray-100">
          <SettingRow icon="language-outline" label="Language" value={s.language} isLink onPress={() => {}} />
          <SettingRow icon="moon-outline" label="Theme" value={s.theme} isLink onPress={() => {}} />
        </View>

        {/* 6. Privacy & Security */}
        <SectionHeader title="Privacy & Security" />
        <View className="bg-white rounded-2xl px-4 py-1 shadow-sm border border-gray-100">
          <SettingRow icon="finger-print-outline" label="Biometric Login" value={s.biometricEnabled} onToggle={(val) => updateSetting('biometricEnabled', val)} />
          <SettingRow icon="trash-bin-outline" label="Auto-Delete Selfies" subLabel="Remove after 24 hours" value={s.autoDeleteSelfies} onToggle={(val) => updateSetting('autoDeleteSelfies', val)} />
          <SettingRow icon="shield-checkmark-outline" label="Analytics Consent" value={s.analyticsConsent} onToggle={(val) => updateSetting('analyticsConsent', val)} />
        </View>

        {/* 7. Storage Management */}
        <SectionHeader title="Storage Management" />
        <View className="bg-white rounded-2xl px-4 py-1 shadow-sm border border-gray-100">
          <SettingRow icon="server-outline" label="Local Cache Size" value={fakeCacheSize} />
          <SettingRow icon="refresh-outline" label="Clear Local Cache" isLink onPress={handleClearCache} />
        </View>

        {/* 8. Accessibility */}
        <SectionHeader title="Accessibility" />
        <View className="bg-white rounded-2xl px-4 py-1 shadow-sm border border-gray-100 mb-6">
           <SettingRow icon="text-outline" label="Larger Text" value={s.accessibilityOptions?.largerText} onToggle={(val) => updateSetting('accessibilityOptions', { ...s.accessibilityOptions, largerText: val })} />
           <SettingRow icon="contrast-outline" label="High Contrast" value={s.accessibilityOptions?.highContrast} onToggle={(val) => updateSetting('accessibilityOptions', { ...s.accessibilityOptions, highContrast: val })} />
           <SettingRow icon="play-skip-forward-outline" label="Reduced Motion" value={s.accessibilityOptions?.reducedMotion} onToggle={(val) => updateSetting('accessibilityOptions', { ...s.accessibilityOptions, reducedMotion: val })} />
        </View>

        {/* Actions */}
        <View className="bg-white rounded-2xl px-4 py-1 shadow-sm border border-gray-100 mb-10">
          <SettingRow icon="log-out-outline" label="Sign Out" destructive onPress={logout} />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
