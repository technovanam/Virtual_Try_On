import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Switch, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSettingsStore } from '../store/settingsStore';
import { useAuthStore } from '../store/authStore';
import { Ionicons } from '@expo/vector-icons';

const SectionHeader = ({ title }) => (
  <Text className="text-sm font-bold text-gray-500 uppercase tracking-wider mt-6 mb-3 px-2">{title}</Text>
);

const SettingRow = ({ icon, label, value, onToggle, onPress, isLink, destructive }) => {
  const isSwitch = onToggle !== undefined;
  const isPressable = !!(isLink || onPress);
  const Wrapper = isPressable ? TouchableOpacity : View;

  return (
    <Wrapper 
      onPress={isPressable ? onPress : undefined}
      className={`flex-row items-center justify-between py-4 border-b border-gray-100 ${destructive ? 'bg-red-50/10' : ''}`}
    >
      <View className="flex-row items-center">
        <View className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${destructive ? 'bg-red-50' : 'bg-gray-100'}`}>
          <Ionicons name={icon} size={18} color={destructive ? '#EF4444' : '#6B7280'} />
        </View>
        <Text className={`text-base font-medium ${destructive ? 'text-red-600' : 'text-gray-900'}`}>{label}</Text>
      </View>
      
      {isSwitch && (
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
          thumbColor={value ? '#FFFFFF' : '#FFFFFF'}
        />
      )}
      
      {isLink && (
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      )}
    </Wrapper>
  );
};

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { settings, loading, error, isInitialized, fetchSettings, updateSetting } = useSettingsStore();
  const { logout, user } = useAuthStore();

  useEffect(() => {
    if (!isInitialized) {
      fetchSettings();
    }
  }, [isInitialized]);

  if (loading && !settings) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
      </SafeAreaView>
    );
  }

  if (error && !settings) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center px-6">
        <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
        <Text className="text-xl font-bold text-gray-900 mt-4 text-center">Failed to load settings</Text>
        <Text className="text-gray-500 text-center mt-2 mb-8">{error}</Text>
        <TouchableOpacity 
          className="bg-blue-600 px-8 py-3.5 rounded-xl"
          onPress={fetchSettings}
        >
          <Text className="text-white font-bold text-base">Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const s = settings || {};

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <View className="bg-white pt-2 pb-4 px-6 border-b border-gray-200 flex-row items-center">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-gray-900">Settings</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        
        {/* Account */}
        <View className="bg-white rounded-2xl px-4 py-2 mt-6 shadow-sm border border-gray-100">
          <SectionHeader title="Account" />
          <SettingRow 
            icon="person-outline" 
            label="Edit Profile" 
            isLink 
            onPress={() => navigation.navigate('EditProfile')} 
          />
          <SettingRow 
            icon="mail-outline" 
            label="Email" 
            value={user?.email} 
          />
          <SettingRow 
            icon="key-outline" 
            label="Change Password" 
            isLink 
            onPress={() => {}} 
          />
        </View>

        {/* Notifications */}
        <View className="bg-white rounded-2xl px-4 py-2 mt-6 shadow-sm border border-gray-100">
          <SectionHeader title="Notifications" />
          <SettingRow 
            icon="notifications-outline" 
            label="Push Notifications" 
            value={s.pushNotifications} 
            onToggle={(val) => updateSetting('pushNotifications', val)} 
          />
          <SettingRow 
            icon="mail-unread-outline" 
            label="Email Notifications" 
            value={s.emailNotifications} 
            onToggle={(val) => updateSetting('emailNotifications', val)} 
          />
        </View>

        {/* Privacy */}
        <View className="bg-white rounded-2xl px-4 py-2 mt-6 shadow-sm border border-gray-100">
          <SectionHeader title="Privacy" />
          <SettingRow 
            icon="analytics-outline" 
            label="Analytics Consent" 
            value={s.analyticsConsent} 
            onToggle={(val) => updateSetting('analyticsConsent', val)} 
          />
          <SettingRow 
            icon="shield-checkmark-outline" 
            label="Data Portability" 
            isLink 
            onPress={() => {}} 
          />
        </View>

        {/* Appearance */}
        <View className="bg-white rounded-2xl px-4 py-2 mt-6 shadow-sm border border-gray-100">
          <SectionHeader title="Appearance" />
          <SettingRow 
            icon="moon-outline" 
            label="Dark Mode" 
            value={s.darkMode} 
            onToggle={(val) => updateSetting('darkMode', val)} 
          />
        </View>

        {/* Support */}
        <View className="bg-white rounded-2xl px-4 py-2 mt-6 shadow-sm border border-gray-100">
          <SectionHeader title="Support" />
          <SettingRow 
            icon="help-circle-outline" 
            label="Help Center" 
            isLink 
            onPress={() => {}} 
          />
          <SettingRow 
            icon="document-text-outline" 
            label="Terms of Service" 
            isLink 
            onPress={() => {}} 
          />
        </View>

        {/* Logout */}
        <View className="bg-white rounded-2xl px-4 py-2 mt-6 shadow-sm border border-gray-100">
          <SettingRow 
            icon="log-out-outline" 
            label="Logout" 
            destructive 
            onPress={logout} 
          />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
