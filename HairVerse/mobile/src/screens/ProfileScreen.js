import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProfileStore } from '../store/profileStore';
import { useAuthStore } from '../store/authStore';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const StatCard = ({ value, label }) => (
  <View className="bg-white px-4 py-3 rounded-xl border border-gray-100 shadow-sm mr-3 items-center min-w-[90px]">
    <Text className="text-xl font-black text-indigo-600 mb-1">{value}</Text>
    <Text className="text-[10px] text-gray-500 font-bold uppercase tracking-wider text-center">{label}</Text>
  </View>
);

const QuickAccessCard = ({ icon, label, color, onPress }) => (
  <TouchableOpacity 
    className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex-1 mr-3 mb-3 items-center justify-center min-h-[100px]"
    onPress={onPress}
  >
    <View className={`w-12 h-12 rounded-full items-center justify-center mb-2`} style={{ backgroundColor: `${color}15` }}>
      <Ionicons name={icon} size={24} color={color} />
    </View>
    <Text className="text-gray-900 font-bold text-xs text-center">{label}</Text>
  </TouchableOpacity>
);

export default function ProfileScreen() {
  const { profileData, stats, aiStyleProfile, hairInsightsSummary, completionPercentage, isLoading, error, fetchProfile } = useProfileStore();
  const { logout } = useAuthStore();
  const navigation = useNavigation();

  useEffect(() => {
    fetchProfile();
  }, []);

  if (isLoading && !profileData) {
    return (
      <SafeAreaView className="flex-1 bg-[#F8FAFC] items-center justify-center">
        <ActivityIndicator size="large" color="#4F46E5" />
      </SafeAreaView>
    );
  }

  if (error && !profileData) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-[#F8FAFC] items-center justify-center px-6">
        <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
        <Text className="text-xl font-bold text-gray-900 mt-4 text-center">Failed to load profile</Text>
        <Text className="text-gray-500 text-center mt-2 mb-8">{error}</Text>
        <TouchableOpacity className="bg-indigo-600 px-8 py-3.5 rounded-xl" onPress={fetchProfile}>
          <Text className="text-white font-bold text-base">Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!profileData) return null;

  const username = profileData.displayName || profileData.email?.split('@')[0] || 'User';
  const initial = username.charAt(0).toUpperCase();

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-[#F8FAFC]">
      <View className="bg-white px-5 pt-2 pb-4 flex-row items-center justify-between border-b border-gray-100">
        <Text className="text-2xl font-bold text-gray-900">Dashboard</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')} className="w-10 h-10 items-center justify-center rounded-full bg-gray-50">
          <Ionicons name="settings-outline" size={20} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        
        {/* Profile Card Header */}
        <View className="bg-white p-6 border-b border-gray-100 items-center">
          <View className="relative">
            <View className="w-24 h-24 rounded-full bg-indigo-100 items-center justify-center mb-4 border-4 border-white shadow-sm">
              <Text className="text-4xl font-bold text-indigo-600">{initial}</Text>
            </View>
            <View className="absolute bottom-4 right-0 bg-yellow-400 w-8 h-8 rounded-full items-center justify-center border-2 border-white">
              <Ionicons name="star" size={14} color="#FFF" />
            </View>
          </View>
          
          <Text className="text-2xl font-black text-gray-900 mb-1">{username}</Text>
          <Text className="text-sm text-gray-500 mb-3">{profileData.email}</Text>
          
          <View className="bg-gray-100 px-3 py-1 rounded-full mb-5">
             <Text className="text-gray-600 text-xs font-bold uppercase tracking-wider">{profileData.userBadge}</Text>
          </View>

          <View className="w-full max-w-[250px] bg-gray-100 rounded-full h-2 mb-2">
            <View className="bg-indigo-600 h-2 rounded-full" style={{ width: `${completionPercentage}%` }} />
          </View>
          <Text className="text-xs font-bold text-gray-400">{completionPercentage}% Profile Completed</Text>
        </View>

        {/* Dynamic Profile Stats */}
        <View className="mt-6 px-5">
           <Text className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Your Activity</Text>
           <ScrollView horizontal showsHorizontalScrollIndicator={false} className="overflow-visible">
             <StatCard value={stats?.hairstylesTried || 0} label="Try-Ons" />
             <StatCard value={stats?.savedStyles || 0} label="Saved" />
             <StatCard value={stats?.comparisonsCreated || 0} label="Compared" />
             <StatCard value={stats?.recommendationsUsed || 0} label="Matches" />
           </ScrollView>
        </View>

        {/* Quick Access */}
        <View className="mt-8 px-5">
           <Text className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Quick Access</Text>
           <View className="flex-row flex-wrap">
              <QuickAccessCard icon="bookmark" label="Saved" color="#4F46E5" onPress={() => navigation.navigate('SavedCollections')} />
              <QuickAccessCard icon="time" label="History" color="#10B981" onPress={() => navigation.navigate('StyleHistory')} />
              <QuickAccessCard icon="bulb" label="Insights" color="#F59E0B" onPress={() => navigation.navigate('AIInsights')} />
           </View>
        </View>

        {/* AI Style Profile */}
        <View className="mt-8 px-5">
           <View className="flex-row items-center mb-3">
              <Ionicons name="sparkles" size={16} color="#4F46E5" className="mr-2" />
              <Text className="text-sm font-bold text-gray-900 uppercase tracking-wider">AI Style Profile</Text>
           </View>
           <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex-row flex-wrap justify-between">
              <View className="w-[48%] mb-4">
                 <Text className="text-gray-400 text-xs mb-1 font-medium">Favorite Color</Text>
                 <Text className="text-gray-900 font-bold">{aiStyleProfile?.favoriteHairColors?.[0] || 'Unknown'}</Text>
              </View>
              <View className="w-[48%] mb-4">
                 <Text className="text-gray-400 text-xs mb-1 font-medium">Top Category</Text>
                 <Text className="text-gray-900 font-bold">{aiStyleProfile?.favoriteCategories?.[0] || 'Unknown'}</Text>
              </View>
              <View className="w-[48%]">
                 <Text className="text-gray-400 text-xs mb-1 font-medium">Maintenance</Text>
                 <Text className="text-gray-900 font-bold">{aiStyleProfile?.preferredMaintenanceLevel || 'Unknown'}</Text>
              </View>
              <View className="w-[48%]">
                 <Text className="text-gray-400 text-xs mb-1 font-medium">Best Match</Text>
                 <Text className="text-gray-900 font-bold" numberOfLines={1}>{aiStyleProfile?.topRecommendationCategory || 'Unknown'}</Text>
              </View>
           </View>
        </View>

        {/* Hair Insights Summary */}
        <View className="mt-8 px-5">
           <Text className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Latest Health Insight</Text>
           <TouchableOpacity 
              className="bg-indigo-600 rounded-2xl p-5 shadow-sm flex-row items-center justify-between"
              onPress={() => navigation.navigate('AIInsights')}
              activeOpacity={0.8}
           >
              <View className="flex-1 mr-4">
                 <Text className="text-indigo-100 text-xs font-bold uppercase tracking-wider mb-1">Health Score</Text>
                 <View className="flex-row items-baseline mb-2">
                    <Text className="text-3xl font-black text-white mr-1">{hairInsightsSummary?.healthScore || '--'}</Text>
                    <Text className="text-indigo-200 font-medium">/ 100</Text>
                 </View>
                 <Text className="text-white text-sm" numberOfLines={1}>
                    {hairInsightsSummary?.growthSuggestions?.[0] || 'Tap to view your detailed hair analysis.'}
                 </Text>
              </View>
              <View className="w-12 h-12 bg-white/20 rounded-full items-center justify-center">
                 <Ionicons name="arrow-forward" size={24} color="#FFF" />
              </View>
           </TouchableOpacity>
        </View>

        {/* Preferences & Actions */}
        <View className="mt-8 px-5 mb-6">
           <Text className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Preferences</Text>
           <View className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <TouchableOpacity className="flex-row items-center justify-between p-4 border-b border-gray-50" onPress={() => navigation.navigate('EditProfile')}>
                 <View className="flex-row items-center">
                    <Ionicons name="person-outline" size={20} color="#4B5563" className="mr-3" />
                    <Text className="text-gray-900 font-medium">Edit Profile Details</Text>
                 </View>
                 <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
              </TouchableOpacity>
              <TouchableOpacity className="flex-row items-center justify-between p-4 border-b border-gray-50" onPress={() => navigation.navigate('Settings')}>
                 <View className="flex-row items-center">
                    <Ionicons name="notifications-outline" size={20} color="#4B5563" className="mr-3" />
                    <Text className="text-gray-900 font-medium">Notification Settings</Text>
                 </View>
                 <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
              </TouchableOpacity>
              <TouchableOpacity className="flex-row items-center justify-between p-4" onPress={logout}>
                 <View className="flex-row items-center">
                    <Ionicons name="log-out-outline" size={20} color="#EF4444" className="mr-3" />
                    <Text className="text-red-500 font-medium">Logout</Text>
                 </View>
              </TouchableOpacity>
           </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
