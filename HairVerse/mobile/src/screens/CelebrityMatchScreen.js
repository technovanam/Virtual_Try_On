import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCelebrityMatchStore } from '../store/celebrityMatchStore';
import DownloadButton from '../components/DownloadButton';
import ShareButton from '../components/ShareButton';

export default function CelebrityMatchScreen() {
  const navigation = useNavigation();
  const { matches, isLoading, error, fetchCelebrityMatches, generateMatches } = useCelebrityMatchStore();
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    fetchCelebrityMatches();
  }, []);

  const handleAnalyzeSelfie = async () => {
    setIsGenerating(true);
    await generateMatches();
    setIsGenerating(false);
  };

  const handleTryStyle = (celebrityName) => {
    // Navigate to virtual try on with context
    navigation.navigate('VirtualTryOn', { celebrityContext: celebrityName });
  };

  const handleViewHairstyles = (celebrityName) => {
    // Navigate to recommendations filtered by celebrity style
    navigation.navigate('Recommendations', { celebrityContext: celebrityName });
  };

  if (isLoading || isGenerating) {
    return (
      <View className="flex-1 bg-white items-center justify-center p-6">
        <ActivityIndicator size="large" color="#6366f1" />
        <Text className="text-lg font-medium text-gray-700 mt-4">
          {isGenerating ? "Analyzing face & hair for celebrity matches..." : "Loading celebrity matches..."}
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-white items-center justify-center p-6">
        <Text className="text-xl font-bold text-red-600 mb-4">Oops!</Text>
        <Text className="text-base text-gray-600 text-center mb-6">{error}</Text>
        <TouchableOpacity 
          className="bg-indigo-600 py-3 px-6 rounded-full"
          onPress={fetchCelebrityMatches}
        >
          <Text className="text-white font-semibold text-lg">Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!matches || matches.length === 0) {
    return (
      <View className="flex-1 bg-white items-center justify-center p-6">
        <Image 
          source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3237/3237447.png' }} 
          className="w-32 h-32 mb-6 opacity-80"
        />
        <Text className="text-2xl font-bold text-gray-800 mb-2 text-center">No Matches Found</Text>
        <Text className="text-base text-gray-500 text-center mb-8 px-4">
          No celebrity matches available. We need to analyze your selfie to find your celebrity look-alikes.
        </Text>
        <TouchableOpacity 
          className="bg-indigo-600 py-4 px-8 rounded-full shadow-lg"
          onPress={handleAnalyzeSelfie}
        >
          <Text className="text-white font-bold text-lg">Analyze Selfie</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-6 pb-10">
        <Text className="text-3xl font-extrabold text-gray-900 mb-2">Your Celebrity Matches</Text>
        <Text className="text-base text-gray-600 mb-6">Based on your face shape and hair analysis, here are the celebrities that share your characteristics.</Text>

        {matches.map((match, index) => (
          <View key={match.matchId} className="bg-white rounded-3xl shadow-sm mb-6 overflow-hidden border border-gray-100">
            <View className="relative">
              <Image 
                source={{ uri: match.imageUrl }} 
                className="w-full h-64 bg-gray-200"
                resizeMode="cover"
              />
              <View className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full shadow">
                <Text className="font-bold text-indigo-600">
                  {Math.round(match.similarityScore * 100)}% Match
                </Text>
              </View>
              <View className="absolute bottom-4 right-4 flex-row">
                <DownloadButton 
                  imageUrl={match.imageUrl} 
                  resourceType="celebrity-match" 
                  resourceId={match.matchId} 
                  className="bg-white/90 p-2 rounded-full mr-2 shadow-sm" 
                  iconSize={20} 
                />
                <ShareButton 
                  imageUrl={match.imageUrl} 
                  resourceType="celebrity-match" 
                  resourceId={match.matchId} 
                  title={`I matched with ${match.celebrityName} on HairVerse!`}
                  className="bg-white/90 p-2 rounded-full shadow-sm" 
                  iconSize={20} 
                />
              </View>
            </View>

            <View className="p-5">
              <Text className="text-2xl font-bold text-gray-800 mb-4">{match.celebrityName}</Text>
              
              <View className="space-y-3 mb-6">
                <View className="bg-indigo-50 p-3 rounded-xl">
                  <Text className="font-semibold text-indigo-900 mb-1">Face Shape Match</Text>
                  <Text className="text-sm text-indigo-700">{match.faceShapeMatch}</Text>
                </View>

                <View className="bg-pink-50 p-3 rounded-xl">
                  <Text className="font-semibold text-pink-900 mb-1">Hairstyle Match</Text>
                  <Text className="text-sm text-pink-700">{match.hairstyleMatch}</Text>
                </View>

                <View className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <Text className="font-semibold text-gray-800 mb-1">Why this match?</Text>
                  <Text className="text-sm text-gray-600">{match.reasoning}</Text>
                </View>
              </View>

              <View className="flex-row justify-between space-x-2">
                <TouchableOpacity 
                  className="flex-1 bg-white border border-indigo-200 py-3 rounded-xl items-center"
                  onPress={() => handleViewHairstyles(match.celebrityName)}
                >
                  <Text className="text-indigo-600 font-semibold">View Styles</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  className="flex-1 bg-indigo-600 py-3 rounded-xl items-center shadow-sm"
                  onPress={() => handleTryStyle(match.celebrityName)}
                >
                  <Text className="text-white font-bold">Try Style</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}

        <TouchableOpacity 
          className="mt-4 bg-gray-900 py-4 rounded-2xl shadow-md items-center"
          onPress={handleAnalyzeSelfie}
        >
          <Text className="text-white font-bold text-lg">Regenerate Matches</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
