import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProfileStore } from '../store/profileStore';
import { useAuthStore } from '../store/authStore';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const SectionHeader = ({ title }) => (
  <Text className="text-lg font-bold text-gray-900 mt-6 mb-3">{title}</Text>
);

const DetailRow = ({ label, value }) => (
  <View className="flex-row justify-between py-3 border-b border-gray-100">
    <Text className="text-gray-500 font-medium">{label}</Text>
    <Text className="text-gray-900 font-semibold max-w-[60%] text-right">
      {Array.isArray(value) ? value.join(', ') || 'Not set' : value || 'Not set'}
    </Text>
  </View>
);

const SettingItem = ({ icon, label, onPress, destructive }) => (
  <TouchableOpacity 
    className="flex-row items-center justify-between py-4 border-b border-gray-100"
    onPress={onPress}
  >
    <View className="flex-row items-center">
      <View className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${destructive ? 'bg-red-50' : 'bg-blue-50'}`}>
        <Ionicons name={icon} size={18} color={destructive ? '#EF4444' : '#3B82F6'} />
      </View>
      <Text className={`text-base font-semibold ${destructive ? 'text-red-500' : 'text-gray-900'}`}>{label}</Text>
    </View>
    <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
  </TouchableOpacity>
);

export default function ProfileScreen() {
  const { profileData, completionPercentage, isLoading, error, fetchProfile } = useProfileStore();
  const { logout } = useAuthStore();
  const navigation = useNavigation();

  useEffect(() => {
    fetchProfile();
  }, []);

  if (isLoading && !profileData) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#4F46E5" />
      </SafeAreaView>
    );
  }

  if (error && !profileData) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center px-6">
        <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
        <Text className="text-xl font-bold text-gray-900 mt-4 text-center">Failed to load profile</Text>
        <Text className="text-gray-500 text-center mt-2 mb-8">{error}</Text>
        <TouchableOpacity 
          className="bg-blue-600 px-8 py-3.5 rounded-xl"
          onPress={fetchProfile}
        >
          <Text className="text-white font-bold text-base">Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const user = profileData || {};
  const completion = user.profileCompletion || {};
  const username = user.display_name || user.email?.split('@')[0] || 'User';
  const initial = username.charAt(0).toUpperCase();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <View className="bg-white pt-2 pb-4 px-6 border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-900">Profile</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerClassName="px-6 pt-6 pb-28" showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View className="bg-white rounded-2xl p-6 items-center shadow-sm border border-gray-100 mb-6">
          <View className="w-24 h-24 rounded-full bg-blue-100 items-center justify-center mb-4">
            <Text className="text-4xl font-bold text-blue-600">{initial}</Text>
          </View>
          <Text className="text-xl font-bold text-gray-900">{username}</Text>
          <Text className="text-sm text-gray-500 mb-4">{user.email}</Text>
          
          <View className="w-full bg-gray-100 rounded-full h-2.5 mb-2">
            <View 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${completionPercentage}%` }} 
            />
          </View>
          <Text className="text-xs font-bold text-gray-500">{completionPercentage}% Profile Completed</Text>
        </View>

        {/* Basic Information */}
        <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
          <SectionHeader title="Basic Information" />
          <DetailRow label="Gender" value={completion.gender} />
          <DetailRow label="Age" value={completion.age} />
          <DetailRow label="Country" value={completion.country} />
        </View>

        {/* Hair Profile */}
        <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
          <SectionHeader title="Hair Profile" />
          <DetailRow label="Hair Length" value={completion.hairLength} />
          <DetailRow label="Hair Type" value={completion.hairType} />
          <DetailRow label="Hair Color" value={completion.hairColor} />
          <DetailRow label="Hair Concerns" value={completion.hairConcerns} />
        </View>

        {/* Style Preferences */}
        <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
          <SectionHeader title="Style Preferences" />
          <DetailRow label="Preferred Styles" value={completion.preferredStyles} />
          <DetailRow label="Goals" value={completion.goals} />
        </View>

        {/* Beard Profile */}
        {completion.gender === 'Male' && (
          <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
            <SectionHeader title="Beard Profile" />
            <DetailRow label="Beard Status" value={completion.beardStatus} />
            <DetailRow label="Beard Preference" value={completion.beardPreference} />
          </View>
        )}

        {/* Account Information */}
        <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
          <SectionHeader title="Account Information" />
          <DetailRow label="UID" value={user.uid} />
          <DetailRow label="Email" value={user.email} />
        </View>

        {/* Settings Actions */}
        <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-10">
          <SectionHeader title="Settings" />
          <SettingItem 
            icon="create-outline" 
            label="Edit Profile" 
            onPress={() => navigation.navigate('EditProfile')} 
          />
          <SettingItem 
            icon="notifications-outline" 
            label="Notification Settings" 
            onPress={() => navigation.navigate('Placeholder')} 
          />
          <SettingItem 
            icon="lock-closed-outline" 
            label="Privacy Settings" 
            onPress={() => navigation.navigate('Placeholder')} 
          />
          <SettingItem 
            icon="log-out-outline" 
            label="Logout" 
            onPress={logout} 
            destructive 
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
