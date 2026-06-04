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

  return (
    <View className="mt-6 mb-2">
      <View className="flex-row justify-between items-end mb-4 px-1">
        <Text className="text-xl font-bold text-gray-900">AI Insights</Text>
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

      {/* Empty State */}
      {!isLoading && !error && insights.length === 0 && (
        <View className="bg-gradient-to-r from-indigo-50 to-purple-50 p-8 rounded-2xl items-center justify-center border border-indigo-100">
          <Text className="text-indigo-900 font-semibold text-center mb-2 text-lg">
            No Insights Yet
          </Text>
          <Text className="text-indigo-600 font-medium text-center mb-6 text-sm">
            Complete your first AI analysis to unlock personalized insights.
          </Text>
          <TouchableOpacity 
            className="bg-indigo-600 py-3 px-8 rounded-xl shadow-sm"
            onPress={() => navigation.navigate('Try-On')}
          >
            <Text className="text-white font-bold text-base">Start Analysis</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Success State */}
      {!isLoading && !error && insights.length > 0 && (
        <View>
          {/* Display the most recent analysis */}
          <InsightCard 
            title="Face Shape" 
            value={insights[0].faceShape} 
            colorClass="bg-purple-50 border-purple-100" 
            textColorClass="text-purple-800" 
          />
          <InsightCard 
            title="Hair Density" 
            value={insights[0].hairDensity} 
            colorClass="bg-blue-50 border-blue-100" 
            textColorClass="text-blue-800" 
          />
          <InsightCard 
            title="Hair Health" 
            value={insights[0].hairHealth} 
            colorClass="bg-emerald-50 border-emerald-100" 
            textColorClass="text-emerald-800" 
          />
          <InsightCard 
            title="Hair Texture" 
            value={insights[0].hairTexture} 
            colorClass="bg-amber-50 border-amber-100" 
            textColorClass="text-amber-800" 
          />
        </View>
      )}
    </View>
  );
}
