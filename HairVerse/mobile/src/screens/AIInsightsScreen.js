import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAIInsightsStore } from '../store/aiInsightsStore';
import InsightCard from '../components/InsightCard';
import { Ionicons } from '@expo/vector-icons';

const AIInsightsScreen = () => {
  const navigation = useNavigation();
  const { insights, status, isLoading, error, fetchInsights } = useAIInsightsStore();

  useEffect(() => {
    fetchInsights();
  }, []);

  const handleStartAnalysis = () => {
    // Navigate to VirtualTryOn where user can take a selfie to start analysis
    navigation.navigate('VirtualTryOn');
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#0F172A" />
          <Text className="mt-4 text-gray-600 font-medium">Loading your AI insights...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View className="flex-1 justify-center items-center px-6">
          <View className="w-16 h-16 bg-red-100 rounded-full items-center justify-center mb-6">
            <Ionicons name="alert-circle" size={32} color="#EF4444" />
          </View>
          <Text className="text-xl font-bold text-gray-900 mb-2">Failed to load insights</Text>
          <Text className="text-gray-500 text-center mb-8">
            {error || 'An unexpected error occurred while fetching your AI insights.'}
          </Text>
          <TouchableOpacity 
            className="bg-black px-8 py-4 rounded-xl w-full"
            onPress={fetchInsights}
          >
            <Text className="text-white text-center font-bold text-base">Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!insights || insights.length === 0) {
      return (
        <View className="flex-1 justify-center items-center px-6">
          <View className="w-20 h-20 bg-indigo-50 rounded-full items-center justify-center mb-6">
            <Ionicons name="scan-outline" size={40} color="#4F46E5" />
          </View>
          <Text className="text-2xl font-bold text-gray-900 mb-2">No analysis available yet.</Text>
          <Text className="text-gray-500 text-center mb-8 text-base">
            Take a selfie to unlock your personalized face and hair profile.
          </Text>
          <TouchableOpacity 
            className="bg-indigo-600 px-8 py-4 rounded-xl w-full shadow-sm"
            onPress={handleStartAnalysis}
          >
            <Text className="text-white text-center font-bold text-lg">Start Analysis</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const latestInsight = insights[0];

    return (
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-gray-500 mb-6">
          Analyzed at: {new Date(latestInsight.analyzedAt || latestInsight.generatedAt).toLocaleString()}
        </Text>

        {/* 1. Face Analysis Section */}
        <View className="mb-8">
          <Text className="text-xl font-bold text-gray-900 mb-4">Face Analysis</Text>
          <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <InsightCard 
              title="Face Shape" 
              value={latestInsight.faceShape || 'Unknown'} 
              colorClass="bg-purple-50 border-purple-100" 
              textColorClass="text-purple-800" 
            />
          </View>
        </View>

        {/* 2. Hair Analysis Section */}
        <View className="mb-8">
          <Text className="text-xl font-bold text-gray-900 mb-4">Hair Analysis</Text>
          <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
            <InsightCard 
              title="Hair Density" 
              value={latestInsight.hairDensity || 'Unknown'} 
              colorClass="bg-blue-50 border-blue-100" 
              textColorClass="text-blue-800" 
            />
            <InsightCard 
              title="Hair Length" 
              value={latestInsight.hairLength || 'Unknown'} 
              colorClass="bg-sky-50 border-sky-100" 
              textColorClass="text-sky-800" 
            />
            <InsightCard 
              title="Hair Color" 
              value={latestInsight.hairColor || 'Unknown'} 
              colorClass="bg-indigo-50 border-indigo-100" 
              textColorClass="text-indigo-800" 
            />
            <InsightCard 
              title="Hair Texture" 
              value={latestInsight.hairTexture || 'Unknown'} 
              colorClass="bg-amber-50 border-amber-100" 
              textColorClass="text-amber-800" 
            />
          </View>
        </View>

        {/* 3. Hair Health Section */}
        <View className="mb-8">
          <Text className="text-xl font-bold text-gray-900 mb-4">Hair Health</Text>
          <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <InsightCard 
              title="Overall Health" 
              value={latestInsight.hairHealth || 'Unknown'} 
              colorClass="bg-emerald-50 border-emerald-100" 
              textColorClass="text-emerald-800" 
            />
          </View>
        </View>

        {/* 4. Recommendation Readiness Section */}
        <View className="mb-8">
          <Text className="text-xl font-bold text-gray-900 mb-4">Recommendation Readiness</Text>
          <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 items-center">
            <View className="w-16 h-16 bg-green-100 rounded-full items-center justify-center mb-4">
              <Ionicons name="checkmark-circle" size={32} color="#10B981" />
            </View>
            <Text className="text-lg font-semibold text-gray-900 mb-2">Ready for Recommendations</Text>
            <Text className="text-gray-500 text-center mb-6">
              Your profile is fully analyzed. You can now receive highly personalized hairstyle matches.
            </Text>
            <TouchableOpacity 
              className="bg-black px-6 py-3 rounded-xl w-full"
              onPress={() => navigation.navigate('Recommendations')}
            >
              <Text className="text-white text-center font-bold">View Matches</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FAFAFA]">
      <View className="flex-row items-center justify-between px-4 py-4 bg-white border-b border-gray-100">
        <TouchableOpacity 
          className="w-10 h-10 items-center justify-center rounded-full bg-gray-50"
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-900">AI Insights</Text>
        <View className="w-10 h-10" />
      </View>
      {renderContent()}
    </SafeAreaView>
  );
};

export default AIInsightsScreen;
