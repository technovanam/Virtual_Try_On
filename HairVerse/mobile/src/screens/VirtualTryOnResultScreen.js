import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, SafeAreaView, Dimensions, ActivityIndicator, Animated, PanResponder, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { virtualTryonService } from '../services/virtualTryonService';
import { savedService } from '../services/savedService';
import { useCompareStore } from '../store/compareStore';
import ViewShot, { captureRef } from 'react-native-view-shot';
import { downloadService } from '../services/downloadService';
import { shareService } from '../services/shareService';
import { useShareStore } from '../store/shareStore';

const { width } = Dimensions.get('window');

export default function VirtualTryOnResultScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { imageId, hairstyleId, originalImageUrl, tryOnId: passedTryOnId, tryOnImage: passedTryOnImage } = route.params || {};

  const [status, setStatus] = useState(passedTryOnId ? 'completed' : 'loading');
  const [tryOnId, setTryOnId] = useState(passedTryOnId || null);
  const [resultImage, setResultImage] = useState(passedTryOnImage || null);
  const [error, setError] = useState(null);
  const [isComparing, setIsComparing] = useState(false);
  const [generationTime, setGenerationTime] = useState(0);
  const viewShotRef = useRef();
  const { isDownloading, isSharing, clearStatus, error: shareError, successMessage } = useShareStore();

  useEffect(() => {
    if (shareError) {
      Alert.alert('Action Failed', shareError, [{ text: 'OK', onPress: clearStatus }]);
    }
    if (successMessage) {
      Alert.alert('Success', successMessage, [{ text: 'OK', onPress: clearStatus }]);
    }
  }, [shareError, successMessage]);

  const handleDownloadScreenshot = async () => {
    if (!viewShotRef.current) return;
    try {
      const uri = await captureRef(viewShotRef, {
        format: 'jpg',
        quality: 0.9,
      });
      await downloadService.downloadImage(uri, 'tryon', tryOnId || 'unknown');
    } catch (err) {
      Alert.alert('Error', 'Failed to capture screenshot: ' + err.message);
    }
  };

  const handleShareScreenshot = async () => {
    if (!viewShotRef.current) return;
    try {
      const uri = await captureRef(viewShotRef, {
        format: 'jpg',
        quality: 0.9,
      });
      await shareService.shareImage(uri, 'tryon', tryOnId || 'unknown');
    } catch (err) {
      Alert.alert('Error', 'Failed to capture screenshot: ' + err.message);
    }
  };

  // Slider State
  const sliderPosition = useRef(new Animated.Value(width / 2)).current;
  const [sliderRatio, setSliderRatio] = useState(0.5);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (e, gestureState) => {
        let newX = width / 2 + gestureState.dx;
        // Padding for edges
        if (newX < 20) newX = 20;
        if (newX > width - 50) newX = width - 50;
        sliderPosition.setValue(newX);
        setSliderRatio(newX / (width - 32)); // Adjust for container padding
      },
      onPanResponderRelease: () => {
        // Optional snap or just leave it
      }
    })
  ).current;

  useEffect(() => {
    if (!passedTryOnId) {
      startTryOnProcess();
    }
  }, []);

  useEffect(() => {
    let intervalId;
    let startTime;
    if (tryOnId && (status === 'pending' || status === 'processing')) {
      startTime = Date.now();
      intervalId = setInterval(() => {
        pollStatus();
        setGenerationTime(Math.floor((Date.now() - startTime) / 1000));
      }, 3000);
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
      setGenerationTime(0);
      // We pass the config to tell the backend what to use (e.g., replicate)
      const data = await virtualTryonService.generate(imageId, hairstyleId, { provider: 'replicate' });
      setTryOnId(data.tryOnId);
      setStatus(data.status || 'pending');
    } catch (err) {
      setError('Failed to start virtual try-on pipeline.');
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
        setError('Generation pipeline failed. Please try again or check quota.');
      }
    } catch (err) {
      console.error('Error polling status:', err);
    }
  };

  const { createComparison } = useCompareStore();

  const handleSaveResult = async () => {
    try {
      await savedService.createSavedItem({
        type: 'tryon',
        tryOnId: tryOnId,
        hairstyleId: hairstyleId,
        imageUrl: resultImage,
        title: `Try-On: ${hairstyleId}`,
        createdAt: new Date().toISOString()
      });
      Alert.alert('Success', 'Try-On result saved to your collections!');
    } catch (e) {
      Alert.alert('Error', 'Failed to save Try-On result.');
    }
  };

  const handleFullCompare = async () => {
    try {
      await createComparison('before_after', [
        { id: 'original', name: 'Original', imageUrl: originalImageUrl },
        { id: 'generated', name: 'Generated', imageUrl: resultImage }
      ]);
      navigation.navigate('Comparison');
    } catch (e) {
      Alert.alert('Error', 'Failed to add to comparison system');
    }
  };

  const handleRegenerate = () => {
    startTryOnProcess();
  };

  const handleDelete = async () => {
    if (tryOnId) {
      try {
        await virtualTryonService.deleteTryOn(tryOnId);
        navigation.goBack();
      } catch (e) {
        Alert.alert('Error', 'Failed to delete try-on');
      }
    } else {
      navigation.goBack();
    }
  };

  const renderStatusLayer = () => {
    if (status === 'loading') {
      return (
        <View className="absolute inset-0 bg-black/60 items-center justify-center z-10">
          <ActivityIndicator size="large" color="#fff" />
          <Text className="text-white font-semibold mt-4 text-lg">Initializing Pipeline...</Text>
        </View>
      );
    }
    
    if (status === 'pending') {
      return (
        <View className="absolute inset-0 bg-black/80 items-center justify-center z-10">
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text className="text-white font-semibold mt-4 text-lg">Queueing Job...</Text>
          <Text className="text-gray-400 mt-2 text-sm text-center px-8">Waiting for provider resources.</Text>
        </View>
      );
    }

    if (status === 'processing') {
      return (
        <View className="absolute inset-0 bg-black/80 items-center justify-center z-10">
          <Ionicons name="color-wand" size={48} color="#8B5CF6" className="animate-pulse" />
          <Text className="text-white font-bold mt-4 text-xl">Generating Try-On</Text>
          <Text className="text-gray-300 mt-2 text-sm text-center px-8">Applying advanced diffusion model. Time elapsed: {generationTime}s</Text>
          <View className="w-48 h-1 bg-gray-600 rounded-full mt-6 overflow-hidden">
            <View className="w-1/2 h-full bg-[#8B5CF6] rounded-full animate-pulse" />
          </View>
        </View>
      );
    }

    if (status === 'failed') {
      return (
        <View className="absolute inset-0 bg-black/90 items-center justify-center z-10">
          <Ionicons name="warning-outline" size={64} color="#ff4444" />
          <Text className="text-white font-bold mt-4 text-xl">Generation Failed</Text>
          <Text className="text-gray-300 mt-2 mb-6 text-center px-8">{error || 'Provider timeout or quota exceeded.'}</Text>
          <TouchableOpacity 
            className="bg-white py-3 px-8 rounded-full"
            onPress={handleRegenerate}
          >
            <Text className="text-black font-bold">Retry Generation</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    return null;
  };

  const renderComparisonView = () => {
    if (!isComparing || !originalImageUrl || !resultImage) return null;

    return (
      <View className="absolute inset-0 z-20 overflow-hidden rounded-[30px]">
        {/* Base: Result Image */}
        <Image source={{ uri: resultImage }} className="absolute inset-0 w-full h-full" resizeMode="cover" />
        
        {/* Overlay: Original Image masked by Slider */}
        <View style={[StyleSheet.absoluteFill, { width: `${sliderRatio * 100}%`, overflow: 'hidden' }]}>
          <Image source={{ uri: originalImageUrl }} style={{ width: width - 32, height: '100%' }} resizeMode="cover" />
        </View>

        {/* Slider Handle */}
        <Animated.View 
          {...panResponder.panHandlers}
          className="absolute top-0 bottom-0 w-[2px] -ml-[1px] z-30"
          style={{ transform: [{ translateX: sliderPosition }] }}
        >
          <View className="w-1 h-full bg-white shadow-lg" />
          <View className="absolute w-8 h-8 bg-white rounded-full shadow-lg items-center justify-center border border-gray-200" style={{ top: '50%', marginTop: -16, left: -14 }}>
            <Ionicons name="code-outline" size={16} color="#8B5CF6" style={{ transform: [{ rotate: '90deg' }] }} />
          </View>
        </Animated.View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0F172A' }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4">
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          className="w-10 h-10 bg-white/10 rounded-full items-center justify-center"
        >
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text className="text-white font-bold text-lg tracking-wide">Result</Text>
        <TouchableOpacity onPress={handleDelete} className="w-10 h-10 bg-red-500/10 rounded-full items-center justify-center">
          <Ionicons name="trash-outline" size={20} color="#ff4444" />
        </TouchableOpacity>
      </View>

      {/* Main Preview Area */}
      <View className="flex-[1.5] px-4 py-2">
        <ViewShot ref={viewShotRef} options={{ format: 'jpg', quality: 0.9 }} style={{ flex: 1, borderRadius: 30, overflow: 'hidden' }}>
          <View className="flex-1 bg-gray-900 relative border border-gray-800 shadow-2xl">
            
            {/* Base Image fallback */}
            <Image 
              source={{ uri: originalImageUrl || 'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?w=600&h=600&fit=crop' }} 
              className="absolute inset-0 w-full h-full opacity-40"
              resizeMode="cover"
            />

            {/* Result Image */}
            {status === 'completed' && resultImage && !isComparing && (
              <Image 
                source={{ uri: resultImage }} 
                className="absolute inset-0 w-full h-full"
                resizeMode="cover"
              />
            )}

            {renderComparisonView()}
            {renderStatusLayer()}

          </View>
        </ViewShot>
      </View>

      {/* Hairstyle Information & Tools */}
      <View className="flex-1 px-6 pt-6 pb-8 bg-[#1E293B] mt-4 rounded-t-[40px] shadow-lg">
        <View className="flex-row items-center justify-between mb-6">
          <View>
            <Text className="text-white font-bold text-2xl">AI Generation</Text>
            <Text className="text-gray-400 mt-1">Provider: Replicate (Flux)</Text>
          </View>
          <TouchableOpacity 
            onPress={() => setIsComparing(!isComparing)}
            disabled={status !== 'completed'}
            className={`w-12 h-12 rounded-full items-center justify-center ${status === 'completed' ? (isComparing ? 'bg-[#8B5CF6]' : 'bg-white/10') : 'bg-gray-800 opacity-50'}`}
          >
            <Ionicons name="git-compare-outline" size={20} color={isComparing ? '#fff' : '#9CA3AF'} />
          </TouchableOpacity>
        </View>

        {/* Hairstyle Metadata */}
        <View className="bg-white/5 p-4 rounded-2xl flex-row items-center border border-white/5 mb-6">
          <View className="w-12 h-12 bg-white/10 rounded-xl items-center justify-center mr-4">
            <Ionicons name="color-palette-outline" size={24} color="#8B5CF6" />
          </View>
          <View className="flex-1">
            <Text className="text-white font-semibold text-base">Applied Style</Text>
            <Text className="text-gray-400 text-sm">{hairstyleId || 'Classic Cut'}</Text>
          </View>
          {status === 'completed' && (
            <View className="bg-green-500/20 px-3 py-1 rounded-full">
              <Text className="text-green-400 text-xs font-bold">100% Match</Text>
            </View>
          )}
        </View>

        {/* Actions */}
        <View className="flex-row gap-2 mt-auto">
          <TouchableOpacity 
            onPress={handleRegenerate}
            className="flex-1 py-4 rounded-xl bg-white/5 border border-white/10 items-center justify-center flex-row"
          >
            <Ionicons name="refresh-outline" size={20} color="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={handleSaveResult}
            disabled={status !== 'completed'}
            className={`flex-[1.5] py-4 rounded-xl items-center justify-center flex-row shadow-lg ${status !== 'completed' ? 'bg-gray-700 opacity-50' : 'bg-[#8B5CF6] shadow-purple-500/30'}`}
          >
            <Ionicons name="bookmark" size={20} color="#fff" className="mr-2" />
            <Text className="text-white font-bold text-base">Save Try-On</Text>
          </TouchableOpacity>

          {status === 'completed' && resultImage && (
            <>
              <TouchableOpacity
                onPress={handleFullCompare}
                className="flex-1 py-4 rounded-xl bg-white/10 border-0 items-center justify-center flex-row"
              >
                <Ionicons name="git-compare" size={20} color="#fff" />
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={handleDownloadScreenshot}
                disabled={isDownloading}
                className="flex-1 py-4 rounded-xl bg-white/10 border-0 items-center justify-center flex-row"
              >
                {isDownloading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="download-outline" size={20} color="#fff" />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleShareScreenshot}
                disabled={isSharing}
                className="flex-1 py-4 rounded-xl bg-white/10 border-0 items-center justify-center flex-row"
              >
                {isSharing ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="share-social-outline" size={20} color="#fff" />
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

