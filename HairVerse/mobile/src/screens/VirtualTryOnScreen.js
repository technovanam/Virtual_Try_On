import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, SafeAreaView, Dimensions, ActivityIndicator, PanResponder, ScrollView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { virtualTryonService } from '../services/virtualTryonService';
import { useSelfieStore } from '../store/selfieStore';
import { useUploadStore } from '../store/uploadStore';

const { width } = Dimensions.get('window');

const HAIR_COLORS = [
  { name: 'Original', hex: 'transparent' },
  { name: 'Blonde', hex: '#E6C594' },
  { name: 'Brunette', hex: '#4A3B32' },
  { name: 'Black', hex: '#1A1A1A' },
  { name: 'Auburn', hex: '#8B3A3A' },
  { name: 'Platinum', hex: '#E8E8E8' }
];

const BEARD_STYLES = [
  { name: 'None', label: 'Clean' },
  { name: 'Stubble', label: 'Stubble' },
  { name: 'Goatee', label: 'Goatee' },
  { name: 'Full', label: 'Full Beard' }
];

export default function VirtualTryOnScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const activeSelfie = useSelfieStore(state => state.activeSelfie);
  const uploadedImageId = useUploadStore(state => state.imageId);
  const uploadedImageUrl = useUploadStore(state => state.imageUrl);
  
  const params = route.params || {};
  const imageId = params.imageId || activeSelfie?.imageId || uploadedImageId;
  // Support both direct ID and full hairstyle object (from recommendations)
  const hairstyleId = params.hairstyleId || params.hairstyle?.hairstyleId || params.hairstyle?.hairstyleName;
  const originalImageUrl = params.originalImageUrl || activeSelfie?.imageUrl || uploadedImageUrl;

  const [status, setStatus] = useState('idle'); // idle, loading, pending, processing, completed, failed
  const [tryOnId, setTryOnId] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [error, setError] = useState(null);

  // Customization State
  const [selectedColor, setSelectedColor] = useState(HAIR_COLORS[0]);
  const [selectedBeard, setSelectedBeard] = useState(BEARD_STYLES[0]);

  // Slider State
  const [sliderPosition, setSliderPosition] = useState(50); // percentage 0-100
  const containerWidth = width - 32; // Assuming padding px-4 (16 * 2)

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        let newPos = ((gestureState.moveX - 16) / containerWidth) * 100;
        if (newPos < 0) newPos = 0;
        if (newPos > 100) newPos = 100;
        setSliderPosition(newPos);
      }
    })
  ).current;

  useEffect(() => {
    // Start initial try-on on mount
    const init = async () => {
      let currentImageId = imageId;
      if (!currentImageId) {
        await useSelfieStore.getState().fetchSelfies();
        currentImageId = useSelfieStore.getState().activeSelfie?.imageId;
      }
      handleGenerate(currentImageId);
    };
    init();
  }, []);

  useEffect(() => {
    let intervalId;
    if (tryOnId && (status === 'pending' || status === 'processing')) {
      intervalId = setInterval(pollStatus, 3000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [tryOnId, status]);

  const handleGenerate = async (forceImageId) => {
    const targetImageId = typeof forceImageId === 'string' ? forceImageId : imageId;
    
    if (!targetImageId || !hairstyleId) {
      setError('Missing image or hairstyle selection.');
      setStatus('failed');
      return;
    }

    try {
      setStatus('loading');
      setError(null);
      
      const config = {
        colorName: selectedColor.name !== 'Original' ? selectedColor.name : undefined,
        beardStyle: selectedBeard.name !== 'None' ? selectedBeard.name : undefined,
      };

      const data = await virtualTryonService.generate(targetImageId, hairstyleId, config);
      setTryOnId(data.tryOnId);
      setStatus(data.status || 'pending');
      setSliderPosition(100); // Snap to result by default
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
    }
  };

  const handleSaveResult = () => {
    console.log('Saved');
  };

  const renderStatusLayer = () => {
    if (status === 'loading' || status === 'pending') {
      return (
        <View className="absolute inset-0 bg-black/60 items-center justify-center rounded-[32px] z-20">
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text className="text-white font-semibold mt-4 text-lg">Preparing Magic...</Text>
        </View>
      );
    }
    if (status === 'processing') {
      return (
        <View className="absolute inset-0 bg-black/60 items-center justify-center rounded-[32px] z-20">
          <Ionicons name="color-wand" size={48} color="#8B5CF6" className="animate-pulse" />
          <Text className="text-white font-bold mt-4 text-xl">Generating preview</Text>
          <View className="w-48 h-1 bg-gray-600 rounded-full mt-6 overflow-hidden">
            <View className="w-1/2 h-full bg-[#8B5CF6] rounded-full animate-pulse" />
          </View>
        </View>
      );
    }
    if (status === 'failed') {
      return (
        <View className="absolute inset-0 bg-black/80 items-center justify-center rounded-[32px] z-20">
          <Ionicons name="warning-outline" size={64} color="#ff4444" />
          <Text className="text-white font-bold mt-4 text-xl">Oops!</Text>
          <Text className="text-gray-300 mt-2 mb-6">{error || 'Generation failed.'}</Text>
          <TouchableOpacity className="bg-white py-3 px-8 rounded-full" onPress={handleGenerate}>
            <Text className="text-black font-bold">Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return null;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0F172A' }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4">
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 bg-white/10 rounded-full items-center justify-center">
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>
        <Text className="text-white font-bold text-lg">Live Try-On</Text>
        <TouchableOpacity onPress={handleSaveResult}>
          <Ionicons name="bookmark-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }}>
        {/* Main Image Comparison Area */}
        <View className="px-4 py-2">
          <View className="w-full aspect-[3/4] bg-gray-900 rounded-[32px] overflow-hidden relative border border-gray-800">
            {/* Original Image (Always underneath) */}
            <Image 
              source={{ uri: originalImageUrl || 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=600&auto=format&fit=crop' }} 
              className="absolute inset-0 w-full h-full"
              resizeMode="cover"
            />

            {/* Generated Image Container (Clipped by slider) */}
            {status === 'completed' && resultImage && (
              <View 
                className="absolute inset-y-0 left-0 overflow-hidden" 
                style={{ width: `${sliderPosition}%` }}
              >
                <Image 
                  source={{ uri: resultImage }} 
                  style={{ width: containerWidth, height: '100%' }}
                  resizeMode="cover"
                />
              </View>
            )}

            {/* Slider Control Line */}
            {status === 'completed' && resultImage && (
              <View 
                {...panResponder.panHandlers}
                className="absolute inset-y-0 items-center justify-center z-10"
                style={{ left: `${sliderPosition}%`, marginLeft: -16, width: 32 }}
              >
                <View className="w-1 h-full bg-white shadow-lg relative items-center justify-center">
                  <View className="w-8 h-8 bg-white rounded-full items-center justify-center shadow-xl">
                    <Ionicons name="swap-horizontal" size={18} color="#0F172A" />
                  </View>
                </View>
              </View>
            )}

            {renderStatusLayer()}

            {/* Helper text overlay */}
            {status === 'completed' && resultImage && (
              <View className="absolute bottom-4 left-0 right-0 flex-row justify-between px-4 pointer-events-none">
                <Text className="text-white font-bold text-xs bg-black/40 px-2 py-1 rounded">Result</Text>
                <Text className="text-white font-bold text-xs bg-black/40 px-2 py-1 rounded">Original</Text>
              </View>
            )}
          </View>
        </View>

        {/* Controls Area */}
        <View className="px-6 py-6 gap-6">
          
          {/* Hair Color Controls */}
          <View>
            <Text className="text-white font-bold text-base mb-3">Hair Color</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
              {HAIR_COLORS.map((color, index) => (
                <TouchableOpacity 
                  key={index}
                  onPress={() => setSelectedColor(color)}
                  className={`mr-4 items-center gap-2`}
                >
                  <View className={`w-12 h-12 rounded-full border-2 items-center justify-center ${selectedColor.name === color.name ? 'border-[#8B5CF6]' : 'border-transparent'}`}>
                    <View 
                      className="w-10 h-10 rounded-full" 
                      style={{ 
                        backgroundColor: color.hex === 'transparent' ? '#334155' : color.hex,
                        borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)'
                      }} 
                    >
                      {color.name === 'Original' && <Ionicons name="close" size={24} color="#94A3B8" style={{ alignSelf: 'center', marginTop: 6 }} />}
                    </View>
                  </View>
                  <Text className={`text-xs ${selectedColor.name === color.name ? 'text-white font-bold' : 'text-gray-400'}`}>
                    {color.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Beard Controls */}
          <View>
            <Text className="text-white font-bold text-base mb-3">Beard Style</Text>
            <View className="flex-row flex-wrap gap-3">
              {BEARD_STYLES.map((beard, index) => (
                <TouchableOpacity 
                  key={index}
                  onPress={() => setSelectedBeard(beard)}
                  className={`px-4 py-2 rounded-full border ${selectedBeard.name === beard.name ? 'bg-[#8B5CF6]/20 border-[#8B5CF6]' : 'bg-white/5 border-transparent'}`}
                >
                  <Text className={selectedBeard.name === beard.name ? 'text-[#8B5CF6] font-bold' : 'text-gray-400'}>
                    {beard.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Apply Changes Button */}
          <TouchableOpacity 
            onPress={() => handleGenerate()}
            disabled={status === 'loading' || status === 'pending' || status === 'processing'}
            className={`w-full py-4 rounded-xl items-center shadow-lg ${(status === 'loading' || status === 'pending' || status === 'processing') ? 'bg-gray-700 opacity-50' : 'bg-[#ec4899] shadow-pink-500/30'}`}
          >
            <Text className="text-white font-bold text-base">Generate New Preview</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
