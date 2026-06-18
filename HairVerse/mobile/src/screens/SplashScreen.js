import React, { useEffect, useState } from 'react';
import { View, Text, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  runOnJS
} from 'react-native-reanimated';
import { useAuthStore } from '../store/authStore';

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ onAnimationComplete }) {
  const { authChecked } = useAuthStore();
  const [animationFinished, setAnimationFinished] = useState(false);

  // Check if both conditions are met to unmount splash screen
  useEffect(() => {
    if (animationFinished && authChecked) {
      setTimeout(() => {
        onAnimationComplete();
      }, 200);
    }
  }, [animationFinished, authChecked, onAnimationComplete]);

  // Shared values for the multi-stage animation
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.6);
  const logoTranslateX = useSharedValue(0);
  const logoTranslateY = useSharedValue(0);
  const findStyleOpacity = useSharedValue(0);

  useEffect(() => {
    // Stage 1: Colored logo fades in
    logoOpacity.value = withDelay(100, withTiming(1, { duration: 600, easing: Easing.out(Easing.quad) }));
    
    // Scale sequence: Stage 1 (scale to 1) -> Stage 2 (scale to 0.25)
    logoScale.value = withSequence(
      withDelay(100, withTiming(1, { duration: 600, easing: Easing.out(Easing.quad) })),
      withTiming(0.25, { duration: 800, easing: Easing.inOut(Easing.cubic) })
    );

    // Logo translation sequence: Stage 3 (move left/up)
    logoTranslateX.value = withDelay(900, withTiming(60 - width / 2, { duration: 800, easing: Easing.inOut(Easing.cubic) }));
    logoTranslateY.value = withDelay(900, withTiming(-50, { duration: 800, easing: Easing.inOut(Easing.cubic) }));

    // Find Style Text sequence: Stage 3 (fade in text alongside logo slide)
    findStyleOpacity.value = withDelay(1200, withTiming(1, { duration: 600 }));

    // Complete Animation
    setTimeout(() => {
      runOnJS(setAnimationFinished)(true);
    }, 2500); //snappy 2.5 seconds total
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: logoOpacity.value,
      transform: [
        { translateX: logoTranslateX.value },
        { translateY: logoTranslateY.value },
        { scale: logoScale.value }
      ],
      width: 160,
      height: 160,
      justifyContent: 'center',
      alignItems: 'center',
      position: 'absolute',
    };
  });

  const findStyleStyle = useAnimatedStyle(() => ({
    opacity: findStyleOpacity.value,
    position: 'absolute',
    left: 40,
    top: height / 2 - 10,
  }));

  return (
    <View className="flex-1 items-center justify-center bg-white">
      {/* Logos Container */}
      <Animated.View style={logoAnimatedStyle}>
        <Animated.Image 
          source={require('../../assets/logo.png')} 
          style={{ width: '100%', height: '100%', position: 'absolute' }}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Text Block */}
      <Animated.View style={findStyleStyle}>
        <Text className="text-[36px] text-[#1F2937] leading-[48px] font-cocogoose py-2">
          Find Your{'\n'}Signature Style<Text className="text-[#6D28D9]">.</Text>
        </Text>
      </Animated.View>
    </View>
  );
}
