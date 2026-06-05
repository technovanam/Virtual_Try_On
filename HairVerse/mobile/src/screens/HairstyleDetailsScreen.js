import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator, SafeAreaView, Dimensions } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { hairstyleService } from '../services/hairstyleService';

const { width } = Dimensions.get('window');

export default function HairstyleDetailsScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { hairstyleId } = route.params || {};

  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDetails();
  }, [hairstyleId]);

  const fetchDetails = async () => {
    if (!hairstyleId) {
      setError('Hairstyle ID is missing.');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const data = await hairstyleService.fetchHairstyleById(hairstyleId);
      setDetails(data);
    } catch (err) {
      setError('Failed to load hairstyle details.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveStyle = () => {
    // Future integration: Save Style
    console.log('Save style pressed');
  };

  const handleTryThisStyle = () => {
    navigation.navigate('VirtualTryOnResultScreen', {
      hairstyleId: hairstyleId,
      // Pass a mock imageId or fetch it from the user's profile if available
      imageId: 'latest_selfie_id', 
      originalImageUrl: 'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?w=600&h=600&fit=crop'
    });
  };

  const handleCompare = () => {
    // Future integration: Compare
    console.log('Compare pressed');
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 px-5 pt-5">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mb-4">
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          {/* Skeleton Layout */}
          <View className="w-full h-80 bg-gray-200 rounded-3xl mb-6 animate-pulse" />
          <View className="w-3/4 h-8 bg-gray-200 rounded-lg mb-4 animate-pulse" />
          <View className="w-1/3 h-5 bg-gray-200 rounded-lg mb-6 animate-pulse" />
          <View className="w-full h-24 bg-gray-200 rounded-lg mb-6 animate-pulse" />
          <View className="flex-row justify-between">
            <View className="w-24 h-8 bg-gray-200 rounded-full animate-pulse" />
            <View className="w-24 h-8 bg-gray-200 rounded-full animate-pulse" />
            <View className="w-24 h-8 bg-gray-200 rounded-full animate-pulse" />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !details) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <TouchableOpacity onPress={() => navigation.goBack()} className="absolute top-12 left-5 z-10">
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Ionicons name="alert-circle-outline" size={64} color="#ff4444" className="mb-4" />
        <Text className="text-xl font-bold text-gray-800 mb-2">Oops!</Text>
        <Text className="text-gray-500 mb-6 text-center px-8">{error || 'Hairstyle not found.'}</Text>
        <TouchableOpacity 
          className="bg-black py-3 px-8 rounded-full"
          onPress={fetchDetails}
        >
          <Text className="text-white font-bold">Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header Image Section */}
        <View className="relative w-full" style={{ height: width * 1.1 }}>
          <Image 
            source={{ uri: details.imageUrl || 'https://placehold.co/400x400/png' }} 
            className="w-full h-full rounded-b-[40px]"
            resizeMode="cover"
          />
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            className="absolute top-12 left-5 w-10 h-10 bg-white/30 backdrop-blur-md rounded-full items-center justify-center"
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={handleSaveStyle}
            className="absolute top-12 right-5 w-10 h-10 bg-white/30 backdrop-blur-md rounded-full items-center justify-center"
          >
            <Ionicons name="bookmark-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Content Section */}
        <View className="px-6 pt-8 pb-32">
          {/* Title and Popularity */}
          <View className="flex-row justify-between items-start mb-2">
            <View className="flex-1 pr-4">
              <Text className="text-3xl font-black text-gray-900 leading-tight">
                {details.hairstyleName}
              </Text>
              <Text className="text-[#8B5CF6] font-semibold text-base mt-1 uppercase tracking-wider">
                {details.category}
              </Text>
            </View>
            <View className="bg-orange-50 px-3 py-1.5 rounded-2xl flex-row items-center border border-orange-100">
              <Ionicons name="flame" size={16} color="#FF6B00" />
              <Text className="text-[#FF6B00] font-bold ml-1">{details.popularityScore}%</Text>
            </View>
          </View>

          {/* Tags */}
          {details.tags && details.tags.length > 0 && (
            <View className="flex-row flex-wrap gap-2 mt-4 mb-6">
              {details.tags.map((tag, index) => (
                <View key={index} className="bg-gray-100 px-4 py-1.5 rounded-full border border-gray-200">
                  <Text className="text-gray-600 font-medium text-sm">{tag}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Description */}
          <View className="mb-8">
            <Text className="text-xl font-bold text-gray-900 mb-3">About this Style</Text>
            <Text className="text-gray-600 text-base leading-relaxed">
              {details.description}
            </Text>
          </View>

          {/* Info Cards */}
          <View className="flex-row gap-4 mb-8">
            <View className="flex-1 bg-blue-50 p-4 rounded-3xl border border-blue-100">
              <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mb-3">
                <Ionicons name="water-outline" size={20} color="#3B82F6" />
              </View>
              <Text className="text-gray-500 text-sm font-medium mb-1">Maintenance</Text>
              <Text className="text-gray-900 font-bold text-lg capitalize">{details.maintenanceLevel}</Text>
            </View>
            <View className="flex-1 bg-purple-50 p-4 rounded-3xl border border-purple-100">
              <View className="w-10 h-10 bg-purple-100 rounded-full items-center justify-center mb-3">
                <Ionicons name="sparkles-outline" size={20} color="#8B5CF6" />
              </View>
              <Text className="text-gray-500 text-sm font-medium mb-1">Best For</Text>
              <Text className="text-gray-900 font-bold text-lg">Daily Wear</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Bar */}
      <View className="absolute bottom-0 w-full px-6 py-6 bg-white/80 backdrop-blur-xl border-t border-gray-100">
        <View className="flex-row gap-3">
          <TouchableOpacity 
            onPress={handleCompare}
            className="flex-1 py-4 rounded-full border-2 border-gray-200 items-center justify-center flex-row"
          >
            <Ionicons name="git-compare-outline" size={20} color="#4B5563" className="mr-2" />
            <Text className="text-gray-600 font-bold text-base ml-2">Compare</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={handleTryThisStyle}
            className="flex-[1.5] py-4 rounded-full bg-black items-center justify-center shadow-lg shadow-black/30 flex-row"
          >
            <Ionicons name="scan-outline" size={20} color="#fff" className="mr-2" />
            <Text className="text-white font-bold text-base ml-2">Try This Style</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
