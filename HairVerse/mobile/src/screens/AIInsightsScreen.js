import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useHairInsightsStore } from '../store/hairInsightsStore';
import { useAIInsightsStore } from '../store/aiInsightsStore';
import { Ionicons } from '@expo/vector-icons';

const ProgressBar = ({ label, value, colorClass, bgClass }) => (
  <View className="mb-3">
    <View className="flex-row justify-between mb-1">
      <Text className="text-gray-700 font-medium text-sm">{label}</Text>
      <Text className="text-gray-500 font-bold text-sm">{value}%</Text>
    </View>
    <View className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
      <View className={`h-full ${bgClass}`} style={{ width: `${value}%` }} />
    </View>
  </View>
);

const HairInsightsScreen = () => {
  const navigation = useNavigation();
  const { insights, history, status, error, fetchInsights, fetchHistory, generateInsights } = useHairInsightsStore();
  const { fullData, fetchInsights: fetchBaseInsights } = useAIInsightsStore();

  useEffect(() => {
    fetchInsights();
    fetchHistory();
    fetchBaseInsights();
  }, []);

  const handleStartAnalysis = () => {
    generateInsights();
  };

  const renderContent = () => {
    if (status === 'loading') {
      return (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text className="mt-4 text-gray-600 font-medium">Fetching your hair intelligence...</Text>
        </View>
      );
    }

    if (status === 'generating') {
      return (
        <View className="flex-1 justify-center items-center px-6">
          <View className="relative w-24 h-24 mb-6 items-center justify-center">
            <ActivityIndicator size="large" color="#4F46E5" className="absolute" />
            <Ionicons name="sparkles" size={32} color="#8B5CF6" className="animate-pulse" />
          </View>
          <Text className="text-xl font-bold text-gray-900 mb-2">Analyzing Your Hair</Text>
          <Text className="text-gray-500 text-center">Gemini AI is generating deep insights from your latest selfie. This may take a moment...</Text>
        </View>
      );
    }

    if (status === 'error') {
      return (
        <View className="flex-1 justify-center items-center px-6">
          <View className="w-16 h-16 bg-red-100 rounded-full items-center justify-center mb-6">
            <Ionicons name="alert-circle" size={32} color="#EF4444" />
          </View>
          <Text className="text-xl font-bold text-gray-900 mb-2">Analysis Failed</Text>
          <Text className="text-gray-500 text-center mb-8">{error}</Text>
          <TouchableOpacity className="bg-black px-8 py-4 rounded-xl w-full" onPress={fetchInsights}>
            <Text className="text-white text-center font-bold text-base">Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (status === 'empty' || !insights) {
      const hasBaseData = fullData && fullData.status === 'completed';
      
      return (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          {hasBaseData ? (
            <View className="mb-8">
              <Text className="text-2xl font-bold text-gray-900 mb-6">Basic AI Profile</Text>
              
              <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
                 {fullData.faceAnalysis?.faceShape && (
                   <View className="flex-row items-center justify-between py-3 border-b border-gray-50">
                     <Text className="text-gray-500 font-medium">Face Shape</Text>
                     <Text className="text-indigo-600 font-bold text-lg">{fullData.faceAnalysis.faceShape}</Text>
                   </View>
                 )}
                 {fullData.hairAnalysis?.density && (
                   <View className="flex-row items-center justify-between py-3 border-b border-gray-50">
                     <Text className="text-gray-500 font-medium">Hair Density</Text>
                     <Text className="text-indigo-600 font-bold text-lg">{fullData.hairAnalysis.density}</Text>
                   </View>
                 )}
                 {fullData.hairAnalysis?.healthScore && (
                   <View className="flex-row items-center justify-between py-3">
                     <Text className="text-gray-500 font-medium">Hair Health</Text>
                     <Text className="text-indigo-600 font-bold text-lg">{fullData.hairAnalysis.healthScore}/100</Text>
                   </View>
                 )}
                 {(!fullData.faceAnalysis?.faceShape && !fullData.hairAnalysis?.density) && (
                   <Text className="text-gray-500 text-center py-4">Some basic traits have been identified, but a full analysis is recommended.</Text>
                 )}
              </View>

              <View className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 items-center">
                <Ionicons name="sparkles" size={32} color="#4F46E5" className="mb-3" />
                <Text className="text-xl font-bold text-indigo-900 mb-2 text-center">Unlock Full Intelligence</Text>
                <Text className="text-indigo-600 text-center mb-6 leading-5">
                  Generate your comprehensive Hair Profile, Health Analysis, and Product Routine using your latest selfie.
                </Text>
                <TouchableOpacity className="bg-indigo-600 px-8 py-4 rounded-xl w-full shadow-md shadow-indigo-200" onPress={handleStartAnalysis}>
                  <Text className="text-white text-center font-bold text-base">Generate Detailed Analysis</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View className="flex-1 justify-center items-center py-20">
              <View className="w-24 h-24 bg-indigo-50 rounded-full items-center justify-center mb-6 shadow-inner">
                <Ionicons name="analytics" size={48} color="#4F46E5" />
              </View>
              <Text className="text-2xl font-bold text-gray-900 mb-2 text-center">No insights available yet.</Text>
              <Text className="text-gray-500 text-center mb-8 text-base px-4">
                Upload a selfie to unlock your personalized hair intelligence profile and product recommendations.
              </Text>
              <TouchableOpacity className="bg-indigo-600 px-8 py-4 rounded-full w-full shadow-lg shadow-indigo-200" onPress={handleStartAnalysis}>
                <Text className="text-white text-center font-bold text-lg">Start Analysis</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      );
    }

    return (
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        
        {/* Actions Row */}
        <View className="flex-row justify-between items-center mb-6">
           <Text className="text-gray-400 text-xs uppercase tracking-wider font-bold">
             Analyzed: {new Date(insights.analyzedAt).toLocaleDateString()}
           </Text>
           <TouchableOpacity onPress={handleStartAnalysis} className="bg-indigo-50 px-3 py-1 rounded-full flex-row items-center">
             <Ionicons name="refresh" size={14} color="#4F46E5" />
             <Text className="text-indigo-600 font-bold text-xs ml-1">Refresh</Text>
           </TouchableOpacity>
        </View>

        {/* 1. Hair Summary */}
        <View className="mb-8">
          <Text className="text-xl font-bold text-gray-900 mb-4">Hair Profile</Text>
          <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex-row flex-wrap justify-between">
             <View className="w-[48%] mb-4">
                <Text className="text-gray-400 text-xs mb-1">Hair Type</Text>
                <Text className="text-gray-900 font-bold text-lg">{insights.hairType}</Text>
             </View>
             <View className="w-[48%] mb-4">
                <Text className="text-gray-400 text-xs mb-1">Texture</Text>
                <Text className="text-gray-900 font-bold text-lg">{insights.texture}</Text>
             </View>
             <View className="w-[48%] mb-4">
                <Text className="text-gray-400 text-xs mb-1">Density</Text>
                <Text className="text-gray-900 font-bold text-lg">{insights.density}</Text>
             </View>
             <View className="w-[48%] mb-4">
                <Text className="text-gray-400 text-xs mb-1">Shine</Text>
                <Text className="text-gray-900 font-bold text-lg">{insights.shineLevel}</Text>
             </View>
             <View className="w-full mt-2 pt-4 border-t border-gray-50 flex-row justify-between items-center">
                <Text className="text-gray-600 font-medium">Overall Health Score</Text>
                <View className={`px-3 py-1 rounded-full ${insights.healthScore > 75 ? 'bg-green-100' : 'bg-orange-100'}`}>
                   <Text className={`font-bold ${insights.healthScore > 75 ? 'text-green-700' : 'text-orange-700'}`}>
                     {insights.healthScore}/100
                   </Text>
                </View>
             </View>
          </View>
        </View>

        {/* 2. Hair Health Analysis */}
        <View className="mb-8">
          <Text className="text-xl font-bold text-gray-900 mb-4">Health Analysis</Text>
          <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <ProgressBar label="Dryness" value={insights.healthAnalysis.dryness} bgClass="bg-orange-400" />
            <ProgressBar label="Frizz" value={insights.healthAnalysis.frizz} bgClass="bg-purple-400" />
            <ProgressBar label="Damage" value={insights.healthAnalysis.damage} bgClass="bg-red-400" />
            <ProgressBar label="Breakage" value={insights.healthAnalysis.breakage} bgClass="bg-rose-400" />
            <ProgressBar label="Strength" value={insights.healthAnalysis.strength} bgClass="bg-emerald-400" />
          </View>
        </View>

        {/* 3. Hairline Analysis */}
        <View className="mb-8">
          <Text className="text-xl font-bold text-gray-900 mb-4">Hairline & Growth</Text>
          <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
             <View className="flex-row items-center mb-3">
                <View className="w-10 h-10 bg-blue-50 rounded-full items-center justify-center mr-3">
                   <Ionicons name="person-outline" size={20} color="#3B82F6" />
                </View>
                <View>
                   <Text className="text-gray-500 text-xs">Hairline Type</Text>
                   <Text className="text-gray-900 font-bold">{insights.hairlineAnalysis.hairlineType}</Text>
                </View>
             </View>
             <View className="flex-row items-center mb-3">
                <View className="w-10 h-10 bg-indigo-50 rounded-full items-center justify-center mr-3">
                   <Ionicons name="expand-outline" size={20} color="#6366F1" />
                </View>
                <View>
                   <Text className="text-gray-500 text-xs">Forehead</Text>
                   <Text className="text-gray-900 font-bold">{insights.hairlineAnalysis.foreheadType}</Text>
                </View>
             </View>
             <View className="flex-row items-center">
                <View className="w-10 h-10 bg-teal-50 rounded-full items-center justify-center mr-3">
                   <Ionicons name="leaf-outline" size={20} color="#14B8A6" />
                </View>
                <View>
                   <Text className="text-gray-500 text-xs">Growth Pattern</Text>
                   <Text className="text-gray-900 font-bold">{insights.hairlineAnalysis.growthPattern}</Text>
                </View>
             </View>
          </View>
        </View>

        {/* 4. Hair Care Recommendations */}
        <View className="mb-8">
          <Text className="text-xl font-bold text-gray-900 mb-4">Care Recommendations</Text>
          <View className="space-y-3">
            {insights.recommendations.map((rec, index) => (
              <View key={index} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex-row items-start">
                <Ionicons name="checkmark-circle" size={20} color="#10B981" className="mr-3 mt-0.5" />
                <Text className="text-gray-700 flex-1 leading-5">{rec}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 5. Product Suggestions */}
        {insights.productSuggestions && insights.productSuggestions.length > 0 && (
          <View className="mb-8">
            <Text className="text-xl font-bold text-gray-900 mb-4">Product Routine</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-5 px-5">
              {insights.productSuggestions.map((prod, index) => (
                <View key={index} className="bg-white w-48 rounded-2xl p-4 mr-4 shadow-sm border border-gray-100">
                  <View className="w-12 h-12 bg-pink-50 rounded-xl items-center justify-center mb-3">
                    <Ionicons name="water-outline" size={24} color="#EC4899" />
                  </View>
                  <Text className="text-pink-600 text-xs font-bold uppercase tracking-wider mb-1">{prod.type}</Text>
                  <Text className="text-gray-900 font-bold text-base mb-2">{prod.name}</Text>
                  <Text className="text-gray-500 text-xs leading-4">{prod.reason}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* 6. Progress Tracking */}
        {history && history.length > 1 && (
          <View className="mb-8">
            <Text className="text-xl font-bold text-gray-900 mb-4">Progress History</Text>
            <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
               {history.map((hist, index) => (
                 <View key={index} className={`flex-row justify-between items-center py-3 ${index !== history.length - 1 ? 'border-b border-gray-50' : ''}`}>
                    <View>
                       <Text className="text-gray-900 font-medium">{new Date(hist.analyzedAt).toLocaleDateString()}</Text>
                       <Text className="text-gray-500 text-xs">Score: {hist.healthScore}</Text>
                    </View>
                    <View className={`px-2 py-1 rounded ${hist.healthScore > 75 ? 'bg-green-50' : 'bg-orange-50'}`}>
                       <Text className={`text-xs font-bold ${hist.healthScore > 75 ? 'text-green-600' : 'text-orange-600'}`}>
                          {hist.healthScore}/100
                       </Text>
                    </View>
                 </View>
               ))}
            </View>
          </View>
        )}

      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <View className="flex-row items-center justify-between px-4 py-4 bg-white border-b border-gray-100 z-10 shadow-sm">
        <TouchableOpacity className="w-10 h-10 items-center justify-center rounded-full bg-gray-50" onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-900">Hair Insights</Text>
        <View className="w-10 h-10" />
      </View>
      {renderContent()}
    </SafeAreaView>
  );
};

export default HairInsightsScreen;
