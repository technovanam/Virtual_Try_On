import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useCelebrityMatchStore } from '../store/celebrityMatchStore';
import CelebrityMatchCard from './CelebrityMatchCard';
import CelebrityMatchSkeleton from './CelebrityMatchSkeleton';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function CelebrityMatchSection() {
  const { matches, isLoading, error, fetchCelebrityMatches } = useCelebrityMatchStore();
  const navigation = useNavigation();

  useEffect(() => {
    fetchCelebrityMatches();
  }, [fetchCelebrityMatches]);

  const handleRetry = () => {
    fetchCelebrityMatches();
  };

  const handleStartAnalysis = () => {
    navigation.navigate('LiveCamera');
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 20 }}>
          <CelebrityMatchSkeleton />
          <CelebrityMatchSkeleton />
          <CelebrityMatchSkeleton />
        </ScrollView>
      );
    }

    if (error) {
      return (
        <View className="bg-[#F8FAFC] rounded-2xl p-6 items-center border border-[#E2E8F0] mx-0">
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" className="mb-4" />
          <Text className="text-lg font-semibold text-[#0F172A] mb-2 text-center">Oops, something went wrong</Text>
          <Text className="text-sm text-[#64748B] text-center mb-5 leading-5">{error || 'Failed to fetch celebrity matches.'}</Text>
          <TouchableOpacity className="bg-[#0F172A] px-6 py-3 rounded-lg" onPress={handleRetry}>
            <Text className="text-white text-sm font-semibold">Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!matches || matches.length === 0) {
      return (
        <View className="bg-[#F8FAFC] rounded-2xl p-6 items-center border border-[#E2E8F0] mx-0">
          <Ionicons name="star-outline" size={48} color="#6366F1" className="mb-4" />
          <Text className="text-base font-semibold text-[#0F172A] text-center mb-4">No celebrity matches available yet.</Text>
          <TouchableOpacity className="bg-[#6366F1] px-6 py-3 rounded-xl flex-row items-center gap-2" onPress={handleStartAnalysis}>
            <Ionicons name="sparkles" size={18} color="#FFFFFF" />
            <Text className="text-white text-sm font-semibold">Start AI Analysis</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 20 }}>
        {matches.map((match, index) => (
          <CelebrityMatchCard
            key={match.celebrityId || index}
            celebrityName={match.celebrityName}
            celebrityImage={match.celebrityImage}
            hairstyleName={match.hairstyleName}
            hairstyleImage={match.hairstyleImage}
            matchScore={match.matchScore}
            onPress={() => {}}
          />
        ))}
      </ScrollView>
    );
  };

  return (
    <View className="w-full my-6">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-xl font-bold text-[#0F172A]">Your Celebrity Matches</Text>
      </View>
      {renderContent()}
    </View>
  );
}
