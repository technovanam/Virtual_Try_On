import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRecommendationStore } from '../store/recommendationStore';
import RecommendationCard from './RecommendationCard';
import RecommendationSkeleton from './RecommendationSkeleton';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function RecommendedSection() {
  const { recommendations, isLoading, error, fetchRecommendations, status } = useRecommendationStore();
  const navigation = useNavigation();

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  const handleRetry = () => {
    fetchRecommendations();
  };

  const handleCompleteAnalysis = () => {
    navigation.navigate('LiveCamera');
  };

  const renderContent = () => {
    if (isLoading || status === 'loading') {
      return (
        <View className="w-full">
          <RecommendationSkeleton />
          <RecommendationSkeleton />
        </View>
      );
    }

    if (error || status === 'error') {
      return (
        <View className="bg-[#F8FAFC] rounded-2xl p-6 items-center border border-[#E2E8F0]">
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" className="mb-4" />
          <Text className="text-lg font-semibold text-[#0F172A] mb-2 text-center">Oops, something went wrong</Text>
          <Text className="text-sm text-[#64748B] text-center mb-5 leading-5">{error || 'Failed to fetch recommendations.'}</Text>
          <TouchableOpacity className="bg-[#0F172A] px-6 py-3 rounded-lg" onPress={handleRetry}>
            <Text className="text-white text-sm font-semibold">Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!recommendations || recommendations.length === 0) {
      return (
        <View className="bg-[#F8FAFC] rounded-2xl p-6 items-center border border-[#E2E8F0]">
          <Ionicons name="sparkles-outline" size={48} color="#6366F1" className="mb-4" />
          <Text className="text-lg font-semibold text-[#0F172A] mb-4 text-center">No personalized recommendations available yet.</Text>
          <TouchableOpacity className="bg-[#0F172A] px-6 py-3 rounded-lg" onPress={handleCompleteAnalysis}>
            <Text className="text-white text-sm font-semibold">Start Analysis</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View className="w-full">
        {recommendations.map((rec, index) => (
          <RecommendationCard
            key={rec.hairstyleId || index}
            hairstyleId={rec.hairstyleId}
            hairstyleName={rec.hairstyleName}
            suitabilityScore={rec.suitabilityScore}
            maintenanceLevel={rec.maintenanceLevel}
            previewImage={rec.previewImage}
            category={rec.category}
            trending={rec.trending}
            onPress={() => navigation.navigate('HairstyleDetails', { hairstyleId: rec.hairstyleId })}
          />
        ))}
      </View>
    );
  };

  return (
    <View className="w-full my-6">
      <Text className="text-xl font-bold text-[#0F172A] mb-4">Recommended For You</Text>
      {renderContent()}
    </View>
  );
}
