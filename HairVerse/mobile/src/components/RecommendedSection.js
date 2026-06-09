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
      return null;
    }

    return (
      <View className="w-full">
        {recommendations.slice(0, 2).map((rec, index) => (
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

  const content = renderContent();
  if (!content) return null;

  return (
    <View className="w-full my-6">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-xl font-bold text-[#0F172A]">Recommended For You</Text>
        {recommendations && recommendations.length > 0 && (
          <TouchableOpacity onPress={() => navigation.navigate('Recommendations')}>
            <Text className="text-[#6366F1] text-sm font-semibold">View All</Text>
          </TouchableOpacity>
        )}
      </View>
      {content}
    </View>
  );
}
