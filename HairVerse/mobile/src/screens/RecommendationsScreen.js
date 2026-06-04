import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useRecommendationStore } from '../store/recommendationStore';
import RecommendationCard from '../components/RecommendationCard';
import { Ionicons } from '@expo/vector-icons';

const RecommendationsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { analysisId } = route.params || {};

  const { 
    recommendations, 
    status, 
    isLoading, 
    error, 
    fetchRecommendations, 
    reset 
  } = useRecommendationStore();

  useEffect(() => {
    fetchRecommendations();
    return () => reset(); // Clean up when leaving
  }, []);

  const handleStartNewAnalysis = () => {
    navigation.navigate('UploadSelfie');
  };

  const handleRetry = () => {
    fetchRecommendations();
  };

  const renderHeader = () => (
    <View className="mb-6">
      <TouchableOpacity 
        onPress={() => navigation.navigate('Dashboard')}
        className="w-10 h-10 bg-white rounded-full items-center justify-center mb-4 shadow-sm border border-slate-100"
      >
        <Ionicons name="arrow-back" size={20} color="#0F172A" />
      </TouchableOpacity>
      <Text className="text-3xl font-bold text-slate-900">Your Perfect Matches</Text>
      <Text className="text-slate-500 mt-2">
        Based on your AI analysis, here are the best hairstyles tailored for your profile.
      </Text>
    </View>
  );

  const renderSkeletonCard = (key) => (
    <View key={key} className="bg-white rounded-2xl mb-4 shadow-sm border border-slate-100 overflow-hidden">
      <View className="h-[180px] w-full bg-slate-200 animate-pulse" />
      <View className="p-4">
        <View className="h-6 bg-slate-200 rounded w-3/4 mb-3 animate-pulse" />
        <View className="h-4 bg-slate-200 rounded w-1/2 animate-pulse" />
      </View>
    </View>
  );

  // States
  if (isLoading || status === 'loading') {
    return (
      <SafeAreaView className="flex-1 bg-[#FAFAFA]">
        <View className="flex-1 px-4 pt-4">
          {renderHeader()}
          {[1, 2, 3].map((i) => renderSkeletonCard(i))}
        </View>
      </SafeAreaView>
    );
  }

  if (error || status === 'error') {
    return (
      <SafeAreaView className="flex-1 bg-[#FAFAFA]">
        <View className="flex-1 justify-center items-center px-8">
          <View className="w-16 h-16 bg-red-100 rounded-full items-center justify-center mb-6">
            <Ionicons name="alert-circle" size={32} color="#EF4444" />
          </View>
          <Text className="text-2xl font-bold text-slate-900 mb-2">Oops!</Text>
          <Text className="text-slate-500 text-center mb-8">
            {error || 'We encountered an error while loading your recommendations.'}
          </Text>
          <TouchableOpacity 
            onPress={handleRetry}
            className="w-full bg-[#0F172A] py-4 rounded-xl items-center"
          >
            <Text className="text-white font-semibold text-lg">Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (status === 'empty' || recommendations.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-[#FAFAFA]">
        <View className="flex-1 px-4 pt-4">
          {renderHeader()}
          <View className="flex-1 justify-center items-center pb-20">
            <View className="w-20 h-20 bg-slate-100 rounded-full items-center justify-center mb-6">
              <Ionicons name="search-outline" size={36} color="#94A3B8" />
            </View>
            <Text className="text-xl font-bold text-slate-900 mb-2">No recommendations available yet</Text>
            <Text className="text-slate-500 text-center mb-8 px-4">
              We need a bit more data to find your perfect style. Complete an AI analysis to get started.
            </Text>
            <TouchableOpacity 
              onPress={handleStartNewAnalysis}
              className="px-8 py-4 bg-[#0F172A] rounded-xl"
            >
              <Text className="text-white font-semibold text-base">Start New Analysis</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#FAFAFA]">
      <FlatList
        data={recommendations}
        keyExtractor={(item) => item.recommendationId}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        ListHeaderComponent={renderHeader}
        renderItem={({ item }) => (
          <RecommendationCard
            hairstyleId={item.hairstyleId}
            hairstyleName={item.hairstyleName}
            category={item.category}
            suitabilityScore={item.suitabilityScore ? Math.round(item.suitabilityScore * 100) : 0}
            maintenanceLevel={item.maintenanceLevel}
            previewImage={item.imageUrl}
            onPress={() => {
              // Future: Navigate to Hairstyle Details Screen
              // navigation.navigate('HairstyleDetails', { hairstyleId: item.hairstyleId });
            }}
          />
        )}
      />
    </SafeAreaView>
  );
};

export default RecommendationsScreen;
