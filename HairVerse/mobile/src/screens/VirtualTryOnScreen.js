import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, SafeAreaView, Dimensions, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { virtualTryonService } from '../services/virtualTryonService';

const { width, height } = Dimensions.get('window');

export default function VirtualTryOnScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { imageId, hairstyleId, originalImageUrl } = route.params || {};

  // 'loading' | 'pending' | 'processing' | 'completed' | 'failed'
  const [status, setStatus] = useState('loading');
  const [tryOnId, setTryOnId] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    startTryOnProcess();
  }, []);

  useEffect(() => {
    let intervalId;
    if (tryOnId && (status === 'pending' || status === 'processing')) {
      intervalId = setInterval(pollStatus, 3000); // Poll every 3 seconds
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [tryOnId, status]);

  const startTryOnProcess = async () => {
    if (!imageId || !hairstyleId) {
      setError('Missing image or hairstyle selection.');
      setStatus('failed');
      return;
    }

    try {
      setStatus('loading');
      setError(null);
      const data = await virtualTryonService.startTryOn(imageId, hairstyleId);
      setTryOnId(data.tryOnId);
      setStatus(data.status || 'pending');
    } catch (err) {
      setError('Failed to start virtual try-on.');
      setStatus('failed');
      console.error(err);
    }
  };

  const pollStatus = async () => {
    try {
      const data = await virtualTryonService.getTryOnStatus(tryOnId);
      setStatus(data.status);
      
      if (data.status === 'completed' && data.resultImage) {
        setResultImage(data.resultImage);
      } else if (data.status === 'failed') {
        setError('Try-on generation failed. Please try again.');
      }
    } catch (err) {
      console.error('Error polling status:', err);
      // We don't fail immediately on polling error, maybe next tick works.
    }
  };

  const handleSaveResult = () => {
    console.log('Save result to collections');
  };

  const handleCompareStyles = () => {
    console.log('Navigate to compare screen');
  };

  const handleDownloadResult = () => {
    console.log('Download result image');
  };

  const renderStatusLayer = () => {
    if (status === 'loading') {
      return (
        <View className="absolute inset-0 bg-black/60 items-center justify-center rounded-[40px] z-10 backdrop-blur-sm">
          <ActivityIndicator size="large" color="#fff" />
          <Text className="text-white font-semibold mt-4 text-lg">Initializing...</Text>
        </View>
      );
    }
    
    if (status === 'pending') {
      return (
        <View className="absolute inset-0 bg-black/60 items-center justify-center rounded-[40px] z-10 backdrop-blur-sm">
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text className="text-white font-semibold mt-4 text-lg">Preparing virtual try-on...</Text>
          <Text className="text-gray-300 mt-2 text-sm text-center px-8">Queueing your image for analysis.</Text>
        </View>
      );
    }

    if (status === 'processing') {
      return (
        <View className="absolute inset-0 bg-black/60 items-center justify-center rounded-[40px] z-10 backdrop-blur-sm">
          <Ionicons name="color-wand" size={48} color="#8B5CF6" className="animate-pulse" />
          <Text className="text-white font-bold mt-4 text-xl">Generating preview</Text>
          <Text className="text-gray-300 mt-2 text-sm text-center px-8">Applying AI transformations. This might take a few moments...</Text>
          <View className="w-48 h-1 bg-gray-600 rounded-full mt-6 overflow-hidden">
            <View className="w-1/2 h-full bg-[#8B5CF6] rounded-full animate-pulse" />
          </View>
        </View>
      );
    }

    if (status === 'failed') {
      return (
        <View className="absolute inset-0 bg-black/80 items-center justify-center rounded-[40px] z-10 backdrop-blur-md">
          <Ionicons name="warning-outline" size={64} color="#ff4444" />
          <Text className="text-white font-bold mt-4 text-xl">Oops! Something went wrong.</Text>
          <Text className="text-gray-300 mt-2 mb-6 text-center px-8">{error || 'Generation failed.'}</Text>
          <TouchableOpacity 
            className="bg-white py-3 px-8 rounded-full"
            onPress={startTryOnProcess}
          >
            <Text className="text-black font-bold">Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    return null;
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0F172A]">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4">
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          className="w-10 h-10 bg-white/10 rounded-full items-center justify-center"
        >
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>
        <Text className="text-white font-bold text-lg">Virtual Try-On</Text>
        <View className="w-10 h-10" />
      </View>

      {/* Main Preview Area */}
      <View className="flex-1 px-4 py-2">
        <View className="flex-1 bg-gray-900 rounded-[40px] overflow-hidden relative border border-gray-800">
          
          {/* Base Image underneath the result */}
          <Image 
            source={{ uri: originalImageUrl || 'https://placehold.co/600x600/png' }} 
            className="absolute inset-0 w-full h-full opacity-50"
            resizeMode="cover"
          />

          {/* Result Image */}
          {status === 'completed' && resultImage && (
            <Image 
              source={{ uri: resultImage }} 
              className="absolute inset-0 w-full h-full"
              resizeMode="cover"
            />
          )}

          {renderStatusLayer()}

        </View>
      </View>

      {/* Selected Hairstyle Info */}
      <View className="px-6 py-4 mb-2">
        <View className="bg-white/10 p-4 rounded-2xl flex-row items-center border border-white/5">
          <View className="w-12 h-12 bg-white/20 rounded-xl items-center justify-center mr-4">
            <Ionicons name="cut-outline" size={24} color="#fff" />
          </View>
          <View className="flex-1">
            <Text className="text-white font-bold text-base">Applying Style</Text>
            <Text className="text-gray-400 text-sm">Target ID: {hairstyleId || 'Unknown'}</Text>
          </View>
        </View>
      </View>

      {/* Actions */}
      <View className="px-6 pb-8 pt-2">
        <View className="flex-row gap-3">
          <TouchableOpacity 
            onPress={handleCompareStyles}
            disabled={status !== 'completed'}
            className={`flex-1 py-4 rounded-full border border-white/20 items-center justify-center flex-row ${status !== 'completed' ? 'opacity-50' : 'bg-white/5'}`}
          >
            <Ionicons name="git-compare-outline" size={20} color="#fff" className="mr-2" />
            <Text className="text-white font-bold text-base">Compare</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={handleSaveResult}
            disabled={status !== 'completed'}
            className={`flex-[1.5] py-4 rounded-full items-center justify-center flex-row shadow-lg ${status !== 'completed' ? 'bg-gray-700 opacity-50' : 'bg-[#8B5CF6] shadow-purple-500/30'}`}
          >
            <Ionicons name="bookmark-outline" size={20} color="#fff" className="mr-2" />
            <Text className="text-white font-bold text-base">Save Result</Text>
          </TouchableOpacity>
        </View>
        {status === 'completed' && (
          <TouchableOpacity 
            onPress={handleDownloadResult}
            className="w-full mt-4 py-3 rounded-full border border-white/10 items-center justify-center flex-row"
          >
            <Ionicons name="download-outline" size={18} color="#9CA3AF" className="mr-2" />
            <Text className="text-gray-400 font-semibold text-sm">Download Image</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}
