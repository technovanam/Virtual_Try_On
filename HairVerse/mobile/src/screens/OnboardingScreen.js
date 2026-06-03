import React, { useState, useRef } from 'react';
import {
  Text,
  View,
  FlatList,
  useWindowDimensions,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { onboardingSlides } from '../config/onboardingSlides';
import { useAuthStore } from '../store/authStore';

export default function OnboardingScreen() {
  const { width, height } = useWindowDimensions();
  const { completeOnboarding } = useAuthStore();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef(null);

  const viewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems[0]) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleNext = async () => {
    try {
      if (currentIndex < onboardingSlides.length - 1) {
        slidesRef.current.scrollToIndex({ index: currentIndex + 1 });
      } else {
        await completeOnboarding();
      }
    } catch (e) {
      console.log('Error completing onboarding', e);
    }
  };

  const handleSkip = async () => {
    try {
      await completeOnboarding();
    } catch (e) {
      console.log('Error completing onboarding', e);
    }
  };

  const cardWidth = Math.min(width * 0.9, 400);
  const cardHeight = height * 0.8;

  const renderItem = ({ item }) => {
    return (
      <View className="flex-1" style={{ width: cardWidth }}>
        <View className="flex-1 pb-20">
          <View className="px-5 pt-5 items-end z-10">
            <TouchableOpacity onPress={handleSkip} className="py-2 px-4 rounded-full bg-black/5" activeOpacity={0.7}>
              <Text className="text-black text-sm font-semibold">Skip</Text>
            </TouchableOpacity>
          </View>
          
          <View className="justify-center items-center px-[30px] mt-2.5 flex-[0.55]">
            <View className="w-full aspect-square bg-black/5 rounded-[24px] justify-center items-center border-2 border-black/10 border-dashed">
              <Text className="text-[#666666] font-bold">[Illustration Placeholder]</Text>
            </View>
          </View>

          <View className="px-6 items-center justify-center flex-[0.45]">
            <Text className="text-[26px] font-bold text-black text-center mb-3">{item.title}</Text>
            <Text className="text-[15px] text-[#444444] text-center leading-[22px]">{item.description}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-black/60 justify-center items-center">
      <View className="bg-white rounded-[24px] overflow-hidden shadow-xl" style={{ width: cardWidth, height: cardHeight, elevation: 10 }}>
        <FlatList
          data={onboardingSlides}
          renderItem={renderItem}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          bounces={false}
          keyExtractor={(item) => item.id}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
            useNativeDriver: false,
          })}
          scrollEventThrottle={32}
          onViewableItemsChanged={viewableItemsChanged}
          viewabilityConfig={viewConfig}
          ref={slidesRef}
          getItemLayout={(data, index) => ({
            length: cardWidth,
            offset: cardWidth * index,
            index,
          })}
          keyboardShouldPersistTaps="handled"
        />
        
        <View className="absolute bottom-0 left-0 right-0 h-20 z-20" pointerEvents="box-none">
          <View className="flex-1 flex-row justify-between items-center px-6" pointerEvents="box-none">
            <View className="flex-row items-center">
              {onboardingSlides.map((_, i) => {
                const inputRange = [(i - 1) * cardWidth, i * cardWidth, (i + 1) * cardWidth];

                const dotWidth = scrollX.interpolate({
                  inputRange,
                  outputRange: [8, 24, 8],
                  extrapolate: 'clamp',
                });

                const opacity = scrollX.interpolate({
                  inputRange,
                  outputRange: [0.3, 1, 0.3],
                  extrapolate: 'clamp',
                });

                return (
                  <Animated.View
                    className="h-2 rounded-full bg-black mx-1"
                    style={{ width: dotWidth, opacity }}
                    key={i.toString()}
                  />
                );
              })}
            </View>

            <TouchableOpacity className="bg-black py-3 px-6 rounded-full shadow-sm" style={{ elevation: 2 }} onPress={handleNext} activeOpacity={0.7}>
              <Text className="text-white text-[15px] font-bold">
                {currentIndex === onboardingSlides.length - 1 ? 'Get Started' : 'Next'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}
