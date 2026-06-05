import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator, StyleSheet, Dimensions } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useCompareStore } from '../store/compareStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DownloadButton from '../components/DownloadButton';
import ShareButton from '../components/ShareButton';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, { useAnimatedGestureHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ComparisonScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { tryOnId } = route.params || {};

  const { comparisonData, loading, error, empty, fetchTryonComparison, clearComparison } = useCompareStore();
  const [viewMode, setViewMode] = useState('slider'); // 'slider' | 'side-by-side'

  useEffect(() => {
    if (tryOnId) {
      fetchTryonComparison(tryOnId);
    }
    return () => clearComparison();
  }, [tryOnId]);

  const sliderPosition = useSharedValue(SCREEN_WIDTH / 2);

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx) => {
      ctx.startX = sliderPosition.value;
    },
    onActive: (event, ctx) => {
      let nextPos = ctx.startX + event.translationX;
      nextPos = Math.max(0, Math.min(nextPos, SCREEN_WIDTH));
      sliderPosition.value = nextPos;
    },
  });

  const beforeStyle = useAnimatedStyle(() => {
    return {
      width: sliderPosition.value,
    };
  });

  const handleStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: sliderPosition.value }],
    };
  });

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color="#0F172A" />
        <Text className="mt-4 text-textSecondary font-medium">Loading comparison...</Text>
      </SafeAreaView>
    );
  }

  if (error || empty || !comparisonData) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-center items-center px-4">
        <Ionicons name="alert-circle-outline" size={64} color="#94A3B8" />
        <Text className="mt-4 text-textPrimary font-bold text-xl">No comparison available.</Text>
        <Text className="text-textSecondary text-center mt-2">{error || "We couldn't find the comparison data."}</Text>
        <TouchableOpacity 
          className="mt-8 bg-primary px-6 py-3 rounded-full"
          onPress={() => navigation.goBack()}
        >
          <Text className="text-white font-bold">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-textPrimary">Comparison</Text>
        <View className="flex-row">
          <TouchableOpacity onPress={() => setViewMode(viewMode === 'slider' ? 'side-by-side' : 'slider')} className="p-2">
            <Ionicons name={viewMode === 'slider' ? "albums-outline" : "options-outline"} size={24} color="#0F172A" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <View className="flex-1 bg-black">
        {viewMode === 'slider' ? (
          <View className="flex-1 relative">
            {/* After Image (Background) */}
            <Image 
              source={{ uri: comparisonData.generatedImageUrl }} 
              className="absolute w-full h-full"
              resizeMode="contain"
            />
            
            {/* Before Image (Foreground Clipped) */}
            <Animated.View style={[styles.beforeContainer, beforeStyle]}>
              <Image 
                source={{ uri: comparisonData.originalImageUrl }} 
                style={{ width: SCREEN_WIDTH, height: '100%' }}
                resizeMode="contain"
              />
            </Animated.View>

            {/* Slider Handle */}
            <PanGestureHandler onGestureEvent={gestureHandler}>
              <Animated.View style={[styles.sliderHandle, handleStyle]}>
                <View style={styles.sliderLine} />
                <View style={styles.sliderButton}>
                  <Ionicons name="swap-horizontal" size={20} color="#0F172A" />
                </View>
              </Animated.View>
            </PanGestureHandler>
            
            {/* Labels */}
            <View className="absolute top-4 left-4 bg-black/50 px-3 py-1 rounded-full">
              <Text className="text-white font-bold text-xs">BEFORE</Text>
            </View>
            <View className="absolute top-4 right-4 bg-black/50 px-3 py-1 rounded-full">
              <Text className="text-white font-bold text-xs">AFTER</Text>
            </View>
          </View>
        ) : (
          <View className="flex-1 flex-row">
            <View className="flex-1 border-r border-borderLight relative">
              <Image 
                source={{ uri: comparisonData.originalImageUrl }} 
                className="w-full h-full"
                resizeMode="contain"
              />
              <View className="absolute top-4 left-2 bg-black/50 px-2 py-1 rounded-full">
                <Text className="text-white font-bold text-[10px]">BEFORE</Text>
              </View>
            </View>
            <View className="flex-1 relative">
              <Image 
                source={{ uri: comparisonData.generatedImageUrl }} 
                className="w-full h-full"
                resizeMode="contain"
              />
              <View className="absolute top-4 right-2 bg-black/50 px-2 py-1 rounded-full">
                <Text className="text-white font-bold text-[10px]">AFTER</Text>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Footer Actions */}
      <View className="p-6 bg-white border-t border-borderLight flex-row justify-between items-center">
        <View className="flex-1">
          <Text className="text-textSecondary text-sm">Hairstyle Generated</Text>
          <Text className="text-textPrimary font-bold">{new Date(comparisonData.generatedAt).toLocaleDateString()}</Text>
        </View>
        <View className="flex-row">
          <DownloadButton 
            imageUrl={comparisonData.generatedImageUrl} 
            resourceType="comparison" 
            resourceId={tryOnId} 
            className="mr-3 bg-surface p-3 rounded-full shadow-sm border border-borderLight" 
          />
          <ShareButton 
            imageUrl={comparisonData.generatedImageUrl} 
            resourceType="comparison" 
            resourceId={tryOnId} 
            title="Check out my hairstyle before & after on HairVerse!"
            className="mr-3 bg-surface p-3 rounded-full shadow-sm border border-borderLight" 
          />
          <TouchableOpacity className="bg-primary px-6 py-3 rounded-full shadow-sm justify-center">
            <Text className="text-white font-bold">Save Look</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  beforeContainer: {
    position: 'absolute',
    height: '100%',
    overflow: 'hidden',
  },
  sliderHandle: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 40,
    marginLeft: -20, // Center the handle
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  sliderLine: {
    position: 'absolute',
    width: 2,
    height: '100%',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },
  sliderButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  }
});
