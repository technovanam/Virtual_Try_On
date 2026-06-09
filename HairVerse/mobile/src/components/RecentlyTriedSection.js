import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useHistoryStore } from '../store/historyStore';
import HistoryCard from './HistoryCard';
import HistorySkeleton from './HistorySkeleton';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function RecentlyTriedSection() {
  const { historyItems, isLoading, error, fetchRecentHistory, status } = useHistoryStore();
  const navigation = useNavigation();

  useEffect(() => {
    fetchRecentHistory();
  }, [fetchRecentHistory]);

  const handleRetry = () => {
    fetchRecentHistory();
  };

  const handleStartTryOn = () => {
    navigation.navigate('VirtualTryOn');
  };

  const renderContent = () => {
    if (isLoading || status === 'loading') {
      return (
        <View className="w-full">
          <HistorySkeleton />
          <HistorySkeleton />
        </View>
      );
    }

    if (error || status === 'error') {
      return (
        <View className="bg-[#F8FAFC] rounded-2xl p-6 items-center border border-[#E2E8F0]">
          <Ionicons name="alert-circle-outline" size={40} color="#EF4444" className="mb-3" />
          <Text className="text-base font-semibold text-[#0F172A] mb-2 text-center">Oops, something went wrong</Text>
          <Text className="text-sm text-[#64748B] text-center mb-4 leading-5">{error || 'Failed to load history.'}</Text>
          <TouchableOpacity className="bg-[#0F172A] px-5 py-2.5 rounded-lg" onPress={handleRetry}>
            <Text className="text-white text-sm font-semibold">Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!historyItems || historyItems.length === 0) {
      return null;
    }

    return (
      <View className="w-full">
        {historyItems.slice(0, 2).map((item, index) => (
          <HistoryCard
            key={item.historyId || index}
            historyId={item.historyId}
            hairstyleId={item.hairstyleId}
            hairstyleName={item.hairstyleName}
            hairstyleCategory={item.hairstyleCategory}
            tryOnImage={item.tryOnImage}
            createdAt={item.createdAt}
            onPress={() => navigation.navigate('VirtualTryOnResultScreen', { 
              tryOnId: item.historyId,
              hairstyleId: item.hairstyleId,
              tryOnImage: item.tryOnImage
            })}
          />
        ))}
      </View>
    );
  };

  const content = renderContent();
  if (!content) return null;

  return (
    <View className="w-full my-2">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-xl font-bold text-[#0F172A]">Recently Generated</Text>
        {historyItems && historyItems.length > 0 && (
          <TouchableOpacity onPress={() => navigation.navigate('StyleHistoryScreen')}>
            <Text className="text-[#6366F1] text-sm font-semibold">View All</Text>
          </TouchableOpacity>
        )}
      </View>
      {content}
    </View>
  );
}
