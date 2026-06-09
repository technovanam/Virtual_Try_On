import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAnalysisStore } from '../store/analysisStore';
import { useSavedStore } from '../store/savedStore';
import { Ionicons } from '@expo/vector-icons';

// Minimal Insight Card for Professional Report Look
const InsightCard = ({ title, value, icon, colorClass }) => {
  return (
    <View className={`flex-row items-center p-3 rounded-xl mb-3 ${colorClass}`}>
      <View className="w-10 h-10 rounded-full bg-white/50 justify-center items-center mr-3">
        <Ionicons name={icon} size={20} color="#1E293B" />
      </View>
      <View className="flex-1">
        <Text className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-0.5">{title}</Text>
        <Text className="text-slate-900 font-bold text-base capitalize">{value}</Text>
      </View>
    </View>
  );
};

// Helper function to check if value is valid (not empty or placeholder)
const isValid = (value) => {
  if (value === null || value === undefined || value === '') return false;
  if (typeof value === 'string') {
    const lower = value.toLowerCase().trim();
    if (lower === 'unknown' || lower === 'n/a' || lower === 'no data available') return false;
  }
  return true;
};

export default function AIAnalysisResultScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { analysisId } = route.params || {};

  const { 
    analysisResult, 
    isLoadingResult, 
    resultError, 
    fetchAnalysisResult 
  } = useAnalysisStore();

  const { saveItem } = useSavedStore();

  useEffect(() => {
    if (analysisId) {
      fetchAnalysisResult(analysisId);
    }
  }, [analysisId]);

  const handleStartVirtualTryOn = () => {
    navigation.navigate('MainTabs', { screen: 'Search' });
  };

  const handleViewRecommendations = () => {
    navigation.navigate('Recommendations', { analysisId });
  };

  const handleReanalyze = () => {
    navigation.navigate('MainTabs', { screen: 'Try-On' });
  };

  const handleSaveAnalysis = async () => {
    try {
      await saveItem({
        itemType: 'analysis',
        referenceId: analysisId,
        title: 'AI Face & Hair Analysis',
        imageUrl: '', 
        category: 'History',
        matchScore: 0
      });
      Alert.alert('Success', 'Analysis saved to your collections!');
    } catch (e) {
      Alert.alert('Error', 'Failed to save analysis. It might already be saved.');
    }
  };

  const renderContent = () => {
    if (isLoadingResult) {
      return (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#0F172A" />
          <Text className="mt-4 text-slate-600 font-medium">Loading your AI analysis results...</Text>
        </View>
      );
    }

    if (resultError) {
      return (
        <View className="flex-1 justify-center items-center px-6">
          <View className="w-16 h-16 bg-red-100 rounded-full items-center justify-center mb-6">
            <Ionicons name="alert-circle" size={32} color="#EF4444" />
          </View>
          <Text className="text-xl font-bold text-slate-900 mb-2">Failed to load analysis</Text>
          <Text className="text-slate-500 text-center mb-8">
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
          <Text className="text-2xl font-bold text-slate-900 mb-2">No analysis available.</Text>
          <Text className="text-slate-500 text-center mb-8 text-base">
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
      hairLength, hairDensity, hairVolume, hairTexture, hairType, hairColor, hairHealthScore, hairlineType,
      beardDensity, beardCompatibility,
      celebrityMatchSummary, recommendationSummary,
      bestHairstyles, bestHairColors, bestBeardStyles,
      recommendedStylesDetailed,
      analyzedAt, analysisVersion
    } = analysisResult;

    const hasFaceMetrics = isValid(faceShape) || isValid(jawlineType) || isValid(foreheadType) || isValid(faceSymmetryScore);
    const hasHairMetrics = isValid(hairLength) || isValid(hairDensity) || isValid(hairVolume) || isValid(hairTexture) || isValid(hairType) || isValid(hairColor) || isValid(hairHealthScore) || isValid(hairlineType);
    const hasBeardMetrics = isValid(beardDensity) || isValid(beardCompatibility);
    
    const hasBestHairstyles = Array.isArray(bestHairstyles) && bestHairstyles.length > 0;
    const hasBestHairColors = Array.isArray(bestHairColors) && bestHairColors.length > 0;
    const hasBestBeardStyles = Array.isArray(bestBeardStyles) && bestBeardStyles.length > 0;
    
    const hasDetailedRecommendations = Array.isArray(recommendedStylesDetailed) && recommendedStylesDetailed.length > 0;

    return (
      <ScrollView 
        style={{ flex: 1, width: '100%' }}
        contentContainerStyle={{ flexGrow: 1, padding: 20, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-slate-500 text-sm font-medium">
            Analyzed {analyzedAt ? new Date(analyzedAt).toLocaleDateString() : 'Just now'}
          </Text>
          {analysisVersion === 2 && (
            <View className="bg-indigo-100 px-3 py-1 rounded-full">
              <Text className="text-indigo-700 text-xs font-bold">PRO REPORT</Text>
            </View>
          )}
        </View>

        {/* 1. Face Profile */}
        {hasFaceMetrics && (
          <View className="mb-8">
            <Text className="text-xl font-bold text-slate-900 mb-4 tracking-tight">Face Profile</Text>
            <View className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100">
              {isValid(faceShape) && <InsightCard title="Face Shape" value={faceShape} icon="scan-outline" colorClass="bg-purple-50" />}
              {isValid(jawlineType) && <InsightCard title="Jawline" value={jawlineType} icon="git-commit-outline" colorClass="bg-purple-50" />}
              {isValid(foreheadType) && <InsightCard title="Forehead" value={foreheadType} icon="expand-outline" colorClass="bg-purple-50" />}
              {isValid(faceSymmetryScore) && <InsightCard title="Symmetry" value={`${faceSymmetryScore}%`} icon="aperture-outline" colorClass="bg-purple-50" />}
            </View>
          </View>
        )}

        {/* 2. Hair Profile */}
        {hasHairMetrics && (
          <View className="mb-8">
            <Text className="text-xl font-bold text-slate-900 mb-4 tracking-tight">Hair Profile</Text>
            <View className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100">
              {isValid(hairType) && <InsightCard title="Hair Type" value={hairType} icon="color-filter-outline" colorClass="bg-sky-50" />}
              {isValid(hairTexture) && <InsightCard title="Texture" value={hairTexture} icon="water-outline" colorClass="bg-sky-50" />}
              {isValid(hairDensity) && <InsightCard title="Density" value={hairDensity} icon="layers-outline" colorClass="bg-sky-50" />}
              {isValid(hairVolume) && <InsightCard title="Volume" value={hairVolume} icon="bar-chart-outline" colorClass="bg-sky-50" />}
              {isValid(hairColor) && <InsightCard title="Color" value={hairColor} icon="color-palette-outline" colorClass="bg-sky-50" />}
              {isValid(hairLength) && <InsightCard title="Length" value={hairLength} icon="resize-outline" colorClass="bg-sky-50" />}
              {isValid(hairlineType) && <InsightCard title="Hairline" value={hairlineType} icon="analytics-outline" colorClass="bg-sky-50" />}
              {isValid(hairHealthScore) && <InsightCard title="Health Score" value={`${hairHealthScore}/100`} icon="medkit-outline" colorClass="bg-sky-50" />}
            </View>
          </View>
        )}

        {/* 3. Beard Profile */}
        {hasBeardMetrics && (
          <View className="mb-8">
            <Text className="text-xl font-bold text-slate-900 mb-4 tracking-tight">Beard Profile</Text>
            <View className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100">
              {isValid(beardDensity) && <InsightCard title="Density" value={beardDensity} icon="cut-outline" colorClass="bg-amber-50" />}
              {isValid(beardCompatibility) && <InsightCard title="Face Compatibility" value={beardCompatibility} icon="checkmark-circle-outline" colorClass="bg-amber-50" />}
            </View>
          </View>
        )}

        {/* 4. Top Matches (Chips) */}
        {(hasBestHairstyles || hasBestHairColors || hasBestBeardStyles) && (
          <View className="mb-8 space-y-6">
            <Text className="text-xl font-bold text-slate-900 tracking-tight">Your Top Matches</Text>
            
            {hasBestHairstyles && (
              <View>
                <Text className="text-slate-500 font-semibold mb-3 uppercase tracking-wider text-xs">Best Hairstyles</Text>
                <View className="flex-row flex-wrap gap-2">
                  {bestHairstyles.map((style, idx) => (
                    <View key={idx} className="bg-slate-900 px-4 py-2 rounded-full">
                      <Text className="text-white font-semibold text-sm">{style}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {hasBestHairColors && (
              <View>
                <Text className="text-slate-500 font-semibold mb-3 uppercase tracking-wider text-xs">Best Hair Colors</Text>
                <View className="flex-row flex-wrap gap-2">
                  {bestHairColors.map((color, idx) => (
                    <View key={idx} className="bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100">
                      <Text className="text-indigo-800 font-semibold text-sm">{color}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {hasBestBeardStyles && (
              <View>
                <Text className="text-slate-500 font-semibold mb-3 uppercase tracking-wider text-xs">Best Beard Styles</Text>
                <View className="flex-row flex-wrap gap-2">
                  {bestBeardStyles.map((style, idx) => (
                    <View key={idx} className="bg-orange-50 px-4 py-2 rounded-full border border-orange-100">
                      <Text className="text-orange-800 font-semibold text-sm">{style}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        {/* 5. Detailed Recommendations or Legacy Summaries */}
        {hasDetailedRecommendations ? (
          <View className="mb-8">
            <Text className="text-xl font-bold text-slate-900 mb-4 tracking-tight">Recommended For You</Text>
            {recommendedStylesDetailed.map((rec, idx) => (
              <View key={idx} className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 mb-4">
                <View className="flex-row justify-between items-start mb-3">
                  <Text className="text-lg font-bold text-slate-900 flex-1 mr-4">{rec.styleName}</Text>
                  {isValid(rec.matchPercentage) && (
                    <View className="bg-green-100 px-3 py-1 rounded-full flex-row items-center">
                      <Ionicons name="star" size={14} color="#16A34A" className="mr-1" />
                      <Text className="text-green-800 font-bold ml-1">{rec.matchPercentage}% Match</Text>
                    </View>
                  )}
                </View>
                {isValid(rec.reason) && (
                  <Text className="text-slate-600 mb-4 leading-relaxed">{rec.reason}</Text>
                )}
                {isValid(rec.maintenanceLevel) && (
                  <View className="flex-row items-center">
                    <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider mr-2">Maintenance:</Text>
                    <Text className="text-slate-800 font-semibold text-sm">{rec.maintenanceLevel}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        ) : (
          /* Legacy Summaries Fallback */
          <View className="mb-8 space-y-4">
            {isValid(celebrityMatchSummary) && (
              <View className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
                <Text className="font-bold text-slate-800 mb-2">Celebrity Match</Text>
                <Text className="text-slate-600 leading-relaxed">{celebrityMatchSummary}</Text>
              </View>
            )}

            {isValid(recommendationSummary) && (
              <View className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
                <Text className="font-bold text-slate-800 mb-2">General Recommendations</Text>
                <Text className="text-slate-600 leading-relaxed">{recommendationSummary}</Text>
              </View>
            )}
          </View>
        )}

        {/* Actions */}
        <View className="mb-8 space-y-3">
          <TouchableOpacity 
            className="bg-[#0F172A] px-6 py-4 rounded-xl w-full flex-row justify-center items-center"
            onPress={handleViewRecommendations}
          >
            <Text className="text-white font-bold text-lg mr-2">Browse Catalog</Text>
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
              className="flex-1 bg-white border border-slate-200 py-3 rounded-xl flex-row justify-center items-center"
              onPress={handleSaveAnalysis}
            >
              <Ionicons name="bookmark-outline" size={18} color="#4B5563" className="mr-2" />
              <Text className="text-slate-600 font-semibold ml-1">Save</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="flex-1 bg-white border border-slate-200 py-3 rounded-xl flex-row justify-center items-center"
              onPress={handleReanalyze}
            >
              <Ionicons name="refresh-outline" size={18} color="#4B5563" className="mr-2" />
              <Text className="text-slate-600 font-semibold ml-1">Reanalyze</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      <View className="flex-row items-center justify-between px-4 py-4 bg-white border-b border-slate-100 shadow-sm z-10">
        <TouchableOpacity 
          className="w-10 h-10 items-center justify-center rounded-full bg-slate-50"
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-slate-900">Analysis Report</Text>
        <View className="w-10 h-10" />
      </View>
      <View style={{ flex: 1 }}>
        {renderContent()}
      </View>
    </SafeAreaView>
  );
}
