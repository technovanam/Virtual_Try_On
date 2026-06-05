import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator, Image, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCompareStore } from '../store/compareStore';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const ComparisonScreen = () => {
  const navigation = useNavigation();
  const { currentComparison, status, error, fetchComparisons, createComparison } = useCompareStore();
  const [activeTab, setActiveTab] = useState('scores'); // 'scores' or 'pros'

  // If there's no current comparison, we can show an empty state or let them browse
  useEffect(() => {
    // Ideally, we fetch comparisons or wait for user to select items from recommendations
    // For now, if empty, we handle it in renderContent
  }, []);

  const handleBrowse = () => {
    navigation.navigate('Recommendations');
  };

  const renderAIPanel = () => {
    if (!currentComparison || !currentComparison.aiPanel) return null;
    const { aiPanel, comparedItems } = currentComparison;

    const winnerItem = comparedItems.find(i => i.id === aiPanel.bestStyleId) || comparedItems[0];

    return (
      <View className="mt-6 bg-indigo-50 rounded-2xl p-5 border border-indigo-100 mb-8 shadow-sm">
        <View className="flex-row items-center mb-4">
          <Ionicons name="sparkles" size={24} color="#4F46E5" />
          <Text className="text-xl font-bold text-gray-900 ml-2">Gemini Analysis</Text>
        </View>

        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-xs text-indigo-600 font-bold uppercase tracking-wider mb-1">Top Recommendation</Text>
          <Text className="text-gray-900 font-bold text-lg mb-2">{winnerItem.name || 'Style 1'}</Text>
          <Text className="text-gray-600 text-sm leading-5">{aiPanel.recommendationReason}</Text>
        </View>

        {/* Tab Selector */}
        <View className="flex-row mb-4 bg-indigo-100/50 p-1 rounded-lg">
          <TouchableOpacity 
            className={`flex-1 py-2 items-center rounded-md ${activeTab === 'scores' ? 'bg-white shadow-sm' : ''}`}
            onPress={() => setActiveTab('scores')}
          >
            <Text className={`font-bold ${activeTab === 'scores' ? 'text-indigo-600' : 'text-gray-500'}`}>Scores</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className={`flex-1 py-2 items-center rounded-md ${activeTab === 'pros' ? 'bg-white shadow-sm' : ''}`}
            onPress={() => setActiveTab('pros')}
          >
            <Text className={`font-bold ${activeTab === 'pros' ? 'text-indigo-600' : 'text-gray-500'}`}>Pros & Cons</Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'scores' && (
          <View className="space-y-3">
            {aiPanel.scores.map((scoreObj, idx) => {
              const item = comparedItems.find(i => i.id === scoreObj.itemId) || comparedItems[idx];
              return (
                <View key={idx} className="flex-row items-center justify-between">
                  <Text className="text-gray-700 font-medium">{item?.name || `Style ${idx+1}`}</Text>
                  <View className="flex-row items-center">
                    <View className="w-32 h-2 bg-indigo-100 rounded-full overflow-hidden mr-3">
                      <View className="h-full bg-indigo-500" style={{ width: `${scoreObj.score}%` }} />
                    </View>
                    <Text className="text-indigo-700 font-bold w-8 text-right">{scoreObj.score}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {activeTab === 'pros' && (
          <View className="space-y-4">
            {aiPanel.scores.map((scoreObj, idx) => {
              const item = comparedItems.find(i => i.id === scoreObj.itemId) || comparedItems[idx];
              return (
                <View key={idx} className="bg-white p-3 rounded-xl border border-gray-100">
                  <Text className="font-bold text-gray-900 mb-2">{item?.name || `Style ${idx+1}`}</Text>
                  <View className="flex-row mb-1">
                    <Ionicons name="add-circle" size={16} color="#10B981" className="mr-1 mt-0.5" />
                    <Text className="text-gray-600 text-sm flex-1">{scoreObj.pros[0]}</Text>
                  </View>
                  <View className="flex-row">
                    <Ionicons name="remove-circle" size={16} color="#EF4444" className="mr-1 mt-0.5" />
                    <Text className="text-gray-600 text-sm flex-1">{scoreObj.cons[0]}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>
    );
  };

  const renderComparisonArea = () => {
    if (!currentComparison) return null;
    const { comparisonType, comparedItems } = currentComparison;

    if (comparisonType === 'before_after' || comparisonType === 'two_style') {
      return (
        <View className="flex-row justify-between mt-4 space-x-2">
          <View className="flex-1 rounded-2xl overflow-hidden bg-gray-100">
            <Image source={{ uri: comparedItems[0]?.imageUrl }} className="w-full h-64" resizeMode="cover" />
            <View className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded">
              <Text className="text-white text-xs font-bold">{comparedItems[0]?.name || 'Original'}</Text>
            </View>
          </View>
          <View className="flex-1 rounded-2xl overflow-hidden bg-gray-100">
            <Image source={{ uri: comparedItems[1]?.imageUrl }} className="w-full h-64" resizeMode="cover" />
            <View className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded">
              <Text className="text-white text-xs font-bold">{comparedItems[1]?.name || 'Generated'}</Text>
            </View>
          </View>
        </View>
      );
    }

    if (comparisonType === 'four_style') {
      return (
        <View className="flex-row flex-wrap justify-between mt-4">
          {comparedItems.slice(0, 4).map((item, idx) => (
            <View key={idx} className="w-[48%] mb-4 rounded-xl overflow-hidden bg-gray-100">
              <Image source={{ uri: item.imageUrl }} className="w-full h-40" resizeMode="cover" />
              <View className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded">
                <Text className="text-white text-[10px] font-bold">{item.name || `Style ${idx+1}`}</Text>
              </View>
            </View>
          ))}
        </View>
      );
    }

    // Default horizontal scroll for color_comparison or beard_comparison
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4 -mx-4 px-4">
        {comparedItems.map((item, idx) => (
          <View key={idx} className="w-64 mr-4 rounded-2xl overflow-hidden bg-gray-100 shadow-sm border border-gray-200">
            <Image source={{ uri: item.imageUrl }} className="w-full h-80" resizeMode="cover" />
            <View className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-3 rounded-xl flex-row items-center justify-between">
              <Text className="text-gray-900 font-bold">{item.name || `Option ${idx+1}`}</Text>
              <TouchableOpacity className="w-8 h-8 rounded-full bg-indigo-100 items-center justify-center">
                 <Ionicons name="heart-outline" size={16} color="#4F46E5" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    );
  };

  const renderContent = () => {
    if (status === 'loading') {
      return (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text className="mt-4 text-gray-600 font-medium">Loading comparison...</Text>
        </View>
      );
    }

    if (status === 'generating') {
      return (
        <View className="flex-1 justify-center items-center px-6">
          <View className="relative w-24 h-24 mb-6 items-center justify-center">
            <ActivityIndicator size="large" color="#EC4899" className="absolute" />
            <Ionicons name="git-compare" size={32} color="#BE185D" className="animate-pulse" />
          </View>
          <Text className="text-xl font-bold text-gray-900 mb-2">Analyzing Styles</Text>
          <Text className="text-gray-500 text-center">Gemini AI is evaluating the styles to find your perfect match. Please wait...</Text>
        </View>
      );
    }

    if (status === 'empty' || !currentComparison) {
      return (
        <View className="flex-1 justify-center items-center px-6">
          <View className="w-24 h-24 bg-pink-50 rounded-full items-center justify-center mb-6 shadow-inner">
            <Ionicons name="images" size={48} color="#EC4899" />
          </View>
          <Text className="text-2xl font-bold text-gray-900 mb-2">No styles selected.</Text>
          <Text className="text-gray-500 text-center mb-8 text-base">
            Select multiple hairstyles from your recommendations to compare them side-by-side.
          </Text>
          <TouchableOpacity className="bg-pink-600 px-8 py-4 rounded-full w-full shadow-lg shadow-pink-200" onPress={handleBrowse}>
            <Text className="text-white text-center font-bold text-lg">Browse Recommendations</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        
        {/* Header Area */}
        <View className="mb-2">
          <Text className="text-2xl font-bold text-gray-900">Compare Styles</Text>
          <Text className="text-gray-500 text-sm">Mode: <Text className="font-bold text-indigo-600 capitalize">{currentComparison.comparisonType.replace('_', ' ')}</Text></Text>
        </View>

        {/* Visual Comparison Area */}
        {renderComparisonArea()}

        {/* AI Recommendation Panel */}
        {renderAIPanel()}

        {/* Action Buttons */}
        <View className="space-y-3">
          <TouchableOpacity className="bg-black py-4 rounded-xl w-full flex-row items-center justify-center shadow-sm">
            <Ionicons name="checkmark-circle" size={20} color="#FFF" className="mr-2" />
            <Text className="text-white font-bold text-base">Select Winner</Text>
          </TouchableOpacity>
          <View className="flex-row space-x-3">
            <TouchableOpacity className="flex-1 bg-white py-4 rounded-xl border border-gray-200 flex-row items-center justify-center shadow-sm">
              <Ionicons name="bookmark-outline" size={20} color="#000" className="mr-2" />
              <Text className="text-gray-900 font-bold">Save</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 bg-white py-4 rounded-xl border border-gray-200 flex-row items-center justify-center shadow-sm">
              <Ionicons name="share-outline" size={20} color="#000" className="mr-2" />
              <Text className="text-gray-900 font-bold">Export</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]">
      <View className="flex-row items-center justify-between px-4 py-4 bg-white border-b border-gray-100 z-10 shadow-sm">
        <TouchableOpacity className="w-10 h-10 items-center justify-center rounded-full bg-gray-50" onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-900">Comparison</Text>
        <View className="w-10 h-10 items-center justify-center">
           <Ionicons name="ellipsis-horizontal" size={24} color="#000" />
        </View>
      </View>
      {renderContent()}
    </SafeAreaView>
  );
};

export default ComparisonScreen;
