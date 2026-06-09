import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAIInsightsStore } from '../store/aiInsightsStore';
import InsightCard from './InsightCard';
import { useNavigation } from '@react-navigation/native';

const SkeletonCard = () => (
  <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-3 flex-row items-center justify-between">
    <View className="h-4 bg-gray-200 rounded w-1/3" />
    <View className="h-6 bg-gray-200 rounded w-1/4" />
  </View>
);

export default function AIInsightsSection() {
  const { insights, status, isLoading, error, fetchInsights } = useAIInsightsStore();
  const navigation = useNavigation();

  useEffect(() => {
    fetchInsights();
  }, []);

  if (!isLoading && !error && insights.length === 0) {
    return null;
  }

  const recentInsight = insights[0];
  const validInsights = [];
  
  if (recentInsight) {
    if (recentInsight.faceShape && recentInsight.faceShape !== 'Unknown') {
      validInsights.push(
        <InsightCard 
          key="faceShape"
          title="Face Shape" 
          value={recentInsight.faceShape} 
          colorClass="bg-purple-50 border-purple-100" 
          textColorClass="text-purple-800" 
        />
      );
    }
    if (recentInsight.hairDensity && recentInsight.hairDensity !== 'Unknown') {
      validInsights.push(
        <InsightCard 
          key="hairDensity"
          title="Hair Density" 
          value={recentInsight.hairDensity} 
          colorClass="bg-blue-50 border-blue-100" 
          textColorClass="text-blue-800" 
        />
      );
    }
    if (recentInsight.hairHealth && recentInsight.hairHealth !== 'Unknown') {
      validInsights.push(
        <InsightCard 
          key="hairHealth"
          title="Hair Health" 
          value={recentInsight.hairHealth} 
          colorClass="bg-emerald-50 border-emerald-100" 
          textColorClass="text-emerald-800" 
        />
      );
    }
    if (recentInsight.hairTexture && recentInsight.hairTexture !== 'Unknown') {
      validInsights.push(
        <InsightCard 
          key="hairTexture"
          title="Hair Texture" 
          value={recentInsight.hairTexture} 
          colorClass="bg-amber-50 border-amber-100" 
          textColorClass="text-amber-800" 
        />
      );
    }
  }

  // If no valid insights to show and it's not loading/error, hide the section
  if (!isLoading && !error && validInsights.length === 0) {
    return null;
  }

  return (
    <View className="mt-6 mb-2">
      <View className="flex-row justify-between items-end mb-4 px-1">
        <Text className="text-xl font-bold text-gray-900">AI Insights</Text>
        <TouchableOpacity onPress={() => navigation.navigate('AIInsights')}>
          <Text className="text-indigo-600 font-semibold text-sm">View Full Details</Text>
        </TouchableOpacity>
      </View>

      {/* Loading State */}
      {isLoading && (
        <View>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </View>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <View className="bg-red-50 p-6 rounded-2xl items-center justify-center border border-red-100">
          <Text className="text-red-500 font-medium text-center mb-3">
            {error || 'Failed to load AI insights.'}
          </Text>
          <TouchableOpacity 
            className="bg-red-500 py-2 px-6 rounded-xl"
            onPress={fetchInsights}
          >
            <Text className="text-white font-bold">Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Success State */}
      {!isLoading && !error && validInsights.length > 0 && (
        <View>
          {validInsights}
        </View>
      )}
    </View>
  );
}
