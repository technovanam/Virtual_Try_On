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
    navigation.navigate('Try-On');
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
      return (
        <View className="bg-[#F8FAFC] rounded-2xl p-6 items-center border border-[#E2E8F0]">
          <View className="w-16 h-16 bg-[#EEF2FF] rounded-full justify-center items-center mb-4">
            <Ionicons name="time-outline" size={32} color="#6366F1" />
          </View>
          <Text className="text-lg font-semibold text-[#0F172A] mb-4 text-center">No recent try-ons yet.</Text>
          <TouchableOpacity className="bg-[#0F172A] px-6 py-3 rounded-lg" onPress={handleStartTryOn}>
            <Text className="text-white text-sm font-semibold">Start Your First Try-On</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View className="w-full">
        {historyItems.map((item, index) => (
          <HistoryCard
            key={item.historyId || index}
            historyId={item.historyId}
            hairstyleId={item.hairstyleId}
            hairstyleName={item.hairstyleName}
            hairstyleCategory={item.hairstyleCategory}
            tryOnImage={item.tryOnImage}
            createdAt={item.createdAt}
            onPress={() => navigation.navigate('CompareHairstyles', { historyId: item.historyId })}
          />
        ))}
      </View>
    );
  };

  return (
    <View className="w-full my-2">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-xl font-bold text-[#0F172A]">Recently Tried</Text>
        {historyItems && historyItems.length > 0 && (
          <TouchableOpacity onPress={() => console.log('View All History')}>
            <Text className="text-[#6366F1] text-sm font-semibold">View All</Text>
          </TouchableOpacity>
        )}
      </View>
      {renderContent()}
    </View>
  );
}
