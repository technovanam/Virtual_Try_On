import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useTrendingStore } from '../store/trendingStore';
import TrendingCard from './TrendingCard';
import TrendingSkeleton from './TrendingSkeleton';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function TrendingHairstylesSection() {
  const { hairstyles, isLoading, error, fetchTrendingHairstyles } = useTrendingStore();
  const navigation = useNavigation();

  useEffect(() => {
    fetchTrendingHairstyles();
  }, [fetchTrendingHairstyles]);

  const handleRetry = () => {
    fetchTrendingHairstyles();
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 20 }}>
          <TrendingSkeleton />
          <TrendingSkeleton />
          <TrendingSkeleton />
        </ScrollView>
      );
    }

    if (error) {
      return (
        <View className="bg-[#F8FAFC] rounded-2xl p-6 items-center border border-[#E2E8F0] mx-0">
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" className="mb-4" />
          <Text className="text-lg font-semibold text-[#0F172A] mb-2 text-center">Oops, something went wrong</Text>
          <Text className="text-sm text-[#64748B] text-center mb-5 leading-5">{error || 'Failed to fetch trending hairstyles.'}</Text>
          <TouchableOpacity className="bg-[#0F172A] px-6 py-3 rounded-lg" onPress={handleRetry}>
            <Text className="text-white text-sm font-semibold">Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!hairstyles || hairstyles.length === 0) {
      return null;
    }

    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 20 }}>
        {hairstyles.map((hairstyle, index) => (
          <TrendingCard
            key={hairstyle.hairstyleId || index}
            hairstyleId={hairstyle.hairstyleId}
            hairstyleName={hairstyle.hairstyleName}
            category={hairstyle.category}
            previewImage={hairstyle.previewImage}
            trendScore={hairstyle.trendScore}
            popularityScore={hairstyle.popularityScore}
            onPress={() => {}}
          />
        ))}
      </ScrollView>
    );
  };

  const content = renderContent();
  if (!content) return null;

  return (
    <View className="w-full my-6">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-xl font-bold text-[#0F172A]">Trending Hairstyles</Text>
      </View>
      {content}
    </View>
  );
}
