import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator, SafeAreaView, Dimensions } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { compareService } from '../services/compareService';

const { width } = Dimensions.get('window');

export default function CompareHairstylesScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { comparisonId } = route.params || {};

  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchComparison();
  }, [comparisonId]);

  const fetchComparison = async () => {
    if (!comparisonId) {
      setError('Comparison ID is missing.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await compareService.getComparison(comparisonId);
      setComparisonData(data);
    } catch (err) {
      setError('Failed to load comparison data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveComparison = () => {
    // Future integration: Save Comparison
    console.log('Save comparison pressed');
  };

  const handleChooseStyle = (hairstyleId) => {
    navigation.navigate('VirtualTryOn', { hairstyleId });
  };

  const handleViewDetails = (hairstyleId) => {
    navigation.navigate('HairstyleDetails', { hairstyleId });
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#000" />
          <Text className="mt-4 text-gray-500 font-medium text-lg">Loading comparison...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Handle Missing or Empty Data (No Hairstyles Selected)
  if (error || !comparisonData || !comparisonData.hairstyles || comparisonData.hairstyles.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <TouchableOpacity onPress={() => navigation.goBack()} className="absolute top-12 left-5 z-10">
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Ionicons name="git-compare-outline" size={64} color="#E5E7EB" className="mb-4" />
        <Text className="text-xl font-bold text-gray-800 mb-2">
          {error ? 'Oops!' : 'No Data'}
        </Text>
        <Text className="text-gray-500 mb-6 text-center px-8">
          {error ? error : 'No hairstyles selected for comparison.'}
        </Text>
        <TouchableOpacity 
          className="bg-black py-3 px-8 rounded-full"
          onPress={error ? fetchComparison : () => navigation.navigate('Home')}
        >
          <Text className="text-white font-bold">{error ? 'Retry' : 'Browse Hairstyles'}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#FAFAFA]">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 items-center justify-center">
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-900">Compare Styles</Text>
        <TouchableOpacity onPress={handleSaveComparison} className="w-10 h-10 items-center justify-center">
          <Ionicons name="bookmark-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingVertical: 20 }}>
        
        {/* Horizontal Scroll for side-by-side cards */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          className="px-5 mb-8"
          snapToInterval={width * 0.75 + 16} // card width + gap
          decelerationRate="fast"
        >
          {comparisonData.hairstyles.map((style, index) => (
            <View 
              key={style.hairstyleId || index} 
              className="bg-white rounded-[32px] overflow-hidden mr-4 border border-gray-100 shadow-sm shadow-gray-200"
              style={{ width: width * 0.75 }}
            >
              {/* Image */}
              <Image 
                source={{ uri: style.imageUrl || 'https://placehold.co/300x300/png' }} 
                className="w-full h-64 bg-gray-100"
                resizeMode="cover"
              />
              
              {/* Info Area */}
              <View className="p-5">
                <Text className="text-xl font-bold text-gray-900 mb-1" numberOfLines={1}>
                  {style.hairstyleName || 'Unknown Style'}
                </Text>
                <Text className="text-[#8B5CF6] font-semibold text-sm uppercase tracking-wider mb-4">
                  {style.category || 'Category'}
                </Text>

                {/* Attributes */}
                <View className="space-y-3 mb-6">
                  <View className="flex-row justify-between items-center">
                    <Text className="text-gray-500 text-sm">Maintenance</Text>
                    <Text className="text-gray-900 font-medium capitalize">{style.maintenanceLevel || 'N/A'}</Text>
                  </View>
                  <View className="flex-row justify-between items-center">
                    <Text className="text-gray-500 text-sm">Popularity</Text>
                    <View className="flex-row items-center">
                      <Ionicons name="flame" size={14} color="#FF6B00" />
                      <Text className="text-[#FF6B00] font-bold ml-1">{style.popularityScore || 0}%</Text>
                    </View>
                  </View>
                  <View className="flex-row justify-between items-center">
                    <Text className="text-gray-500 text-sm">Suitability Match</Text>
                    <Text className="text-green-500 font-bold">92%</Text> {/* Future: Dynamic Suitability */}
                  </View>
                </View>

                {/* Actions */}
                <View className="gap-2">
                  <TouchableOpacity 
                    onPress={() => handleChooseStyle(style.hairstyleId)}
                    className="w-full py-3 bg-black rounded-full items-center justify-center"
                  >
                    <Text className="text-white font-bold">Choose This</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => handleViewDetails(style.hairstyleId)}
                    className="w-full py-3 bg-gray-100 rounded-full items-center justify-center"
                  >
                    <Text className="text-gray-900 font-bold">Details</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}
