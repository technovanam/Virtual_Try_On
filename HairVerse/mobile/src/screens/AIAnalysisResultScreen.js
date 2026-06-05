import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAnalysisStore } from '../store/analysisStore';
import { Ionicons } from '@expo/vector-icons';
import InsightCard from '../components/InsightCard';

const AIAnalysisResultScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { analysisId } = route.params || {};

  const { 
    analysisResult, 
    isLoadingResult, 
    resultError, 
    fetchAnalysisResult 
  } = useAnalysisStore();

  useEffect(() => {
    if (analysisId) {
      fetchAnalysisResult(analysisId);
    }
  }, [analysisId]);

  const handleStartVirtualTryOn = () => {
    navigation.navigate('VirtualTryOn', { analysisId });
  };

  const handleViewRecommendations = () => {
    navigation.navigate('Recommendations', { analysisId });
  };

  const handleReanalyze = () => {
    navigation.navigate('VirtualTryOn');
  };

  const handleSaveAnalysis = () => {
    // Implement save logic, maybe show a toast
    console.log('Analysis saved!');
  };

  const renderContent = () => {
    if (isLoadingResult) {
      return (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#0F172A" />
          <Text className="mt-4 text-gray-600 font-medium">Loading your AI analysis results...</Text>
        </View>
      );
    }

    if (resultError) {
      return (
        <View className="flex-1 justify-center items-center px-6">
          <View className="w-16 h-16 bg-red-100 rounded-full items-center justify-center mb-6">
            <Ionicons name="alert-circle" size={32} color="#EF4444" />
          </View>
          <Text className="text-xl font-bold text-gray-900 mb-2">Failed to load analysis</Text>
          <Text className="text-gray-500 text-center mb-8">
            {resultError || 'An unexpected error occurred while fetching your AI analysis results.'}
          </Text>
          <TouchableOpacity 
            className="bg-black px-8 py-4 rounded-xl w-full"
            onPress={() => fetchAnalysisResult(analysisId)}
          >
            <Text className="text-white text-center font-bold text-base">Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!analysisResult || analysisResult.status === 'not_found' || analysisResult.status === 'pending') {
      return (
        <View className="flex-1 justify-center items-center px-6">
          <View className="w-20 h-20 bg-indigo-50 rounded-full items-center justify-center mb-6">
            <Ionicons name="scan-outline" size={40} color="#4F46E5" />
          </View>
          <Text className="text-2xl font-bold text-gray-900 mb-2">No analysis available.</Text>
          <Text className="text-gray-500 text-center mb-8 text-base">
            Take a selfie to unlock your personalized face, hair, and beard profile.
          </Text>
          <TouchableOpacity 
            className="bg-indigo-600 px-8 py-4 rounded-xl w-full shadow-sm"
            onPress={handleReanalyze}
          >
            <Text className="text-white text-center font-bold text-lg">Start Analysis</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const {
      faceShape, jawlineType, foreheadType, faceSymmetryScore,
      hairLength, hairDensity, hairTexture, hairColor, hairHealthScore, hairlineType,
      beardDensity, beardCompatibility,
      celebrityMatchSummary, recommendationSummary,
      analyzedAt
    } = analysisResult;

    return (
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-gray-500 mb-6 text-sm">
          Analyzed at: {analyzedAt ? new Date(analyzedAt).toLocaleString() : 'Just now'}
        </Text>

        {/* 1. Face Analysis Section */}
        <View className="mb-8">
          <Text className="text-xl font-bold text-gray-900 mb-4">Face Analysis</Text>
          <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
            <InsightCard title="Face Shape" value={faceShape || 'Unknown'} colorClass="bg-purple-50 border-purple-100" textColorClass="text-purple-800" />
            <InsightCard title="Jawline Type" value={jawlineType || 'Unknown'} colorClass="bg-purple-50 border-purple-100" textColorClass="text-purple-800" />
            <InsightCard title="Forehead Type" value={foreheadType || 'Unknown'} colorClass="bg-purple-50 border-purple-100" textColorClass="text-purple-800" />
            <InsightCard title="Symmetry Score" value={faceSymmetryScore ? `${faceSymmetryScore}/100` : 'Unknown'} colorClass="bg-purple-50 border-purple-100" textColorClass="text-purple-800" />
          </View>
        </View>

        {/* 2. Hair Analysis Section */}
        <View className="mb-8">
          <Text className="text-xl font-bold text-gray-900 mb-4">Hair Analysis</Text>
          <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
            <InsightCard title="Hair Length" value={hairLength || 'Unknown'} colorClass="bg-sky-50 border-sky-100" textColorClass="text-sky-800" />
            <InsightCard title="Hair Density" value={hairDensity || 'Unknown'} colorClass="bg-blue-50 border-blue-100" textColorClass="text-blue-800" />
            <InsightCard title="Hair Texture" value={hairTexture || 'Unknown'} colorClass="bg-amber-50 border-amber-100" textColorClass="text-amber-800" />
            <InsightCard title="Hair Color" value={hairColor || 'Unknown'} colorClass="bg-indigo-50 border-indigo-100" textColorClass="text-indigo-800" />
            <InsightCard title="Hairline Type" value={hairlineType || 'Unknown'} colorClass="bg-pink-50 border-pink-100" textColorClass="text-pink-800" />
            <InsightCard title="Health Score" value={hairHealthScore ? `${hairHealthScore}/100` : 'Unknown'} colorClass="bg-emerald-50 border-emerald-100" textColorClass="text-emerald-800" />
          </View>
        </View>

        {/* 3. Beard Analysis Section */}
        <View className="mb-8">
          <Text className="text-xl font-bold text-gray-900 mb-4">Beard Analysis</Text>
          <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
            <InsightCard title="Beard Density" value={beardDensity || 'Unknown'} colorClass="bg-orange-50 border-orange-100" textColorClass="text-orange-800" />
            <InsightCard title="Compatibility" value={beardCompatibility || 'Unknown'} colorClass="bg-orange-50 border-orange-100" textColorClass="text-orange-800" />
          </View>
        </View>

        {/* 4. Summaries */}
        <View className="mb-8 space-y-4">
          <Text className="text-xl font-bold text-gray-900">Analysis Summaries</Text>
          
          <View className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
            <Text className="font-bold text-gray-800 mb-2">Celebrity Match</Text>
            <Text className="text-gray-600 leading-relaxed">
              {celebrityMatchSummary || 'No celebrity match summary available.'}
            </Text>
          </View>

          <View className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
            <Text className="font-bold text-gray-800 mb-2">Recommendations</Text>
            <Text className="text-gray-600 leading-relaxed">
              {recommendationSummary || 'No recommendation summary available.'}
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View className="mb-8 space-y-3">
          <TouchableOpacity 
            className="bg-primary px-6 py-4 rounded-xl w-full flex-row justify-center items-center"
            onPress={handleViewRecommendations}
          >
            <Text className="text-white font-bold text-lg mr-2">View Recommendations</Text>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </TouchableOpacity>

          <TouchableOpacity 
            className="bg-indigo-600 px-6 py-4 rounded-xl w-full flex-row justify-center items-center"
            onPress={handleStartVirtualTryOn}
          >
            <Text className="text-white font-bold text-lg mr-2">Start Virtual Try-On</Text>
            <Ionicons name="camera-outline" size={20} color="white" />
          </TouchableOpacity>

          <View className="flex-row justify-between space-x-3 mt-2">
            <TouchableOpacity 
              className="flex-1 bg-white border border-gray-200 py-3 rounded-xl flex-row justify-center items-center"
              onPress={handleSaveAnalysis}
            >
              <Ionicons name="bookmark-outline" size={18} color="#4B5563" className="mr-2" />
              <Text className="text-gray-600 font-semibold ml-1">Save Analysis</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="flex-1 bg-white border border-gray-200 py-3 rounded-xl flex-row justify-center items-center"
              onPress={handleReanalyze}
            >
              <Ionicons name="refresh-outline" size={18} color="#4B5563" className="mr-2" />
              <Text className="text-gray-600 font-semibold ml-1">Reanalyze</Text>
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
        <Text className="text-lg font-bold text-gray-900">AI Analysis Results</Text>
        <View className="w-10 h-10" />
      </View>
      {renderContent()}
    </SafeAreaView>
  );
};

export default AIAnalysisResultScreen;
