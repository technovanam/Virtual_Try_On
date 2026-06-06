import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withRepeat, withSequence, withDelay, Easing } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

// Simple particle component for the background
const Particle = ({ particle }) => {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateY.value = withRepeat(
      withTiming(-100, { duration: particle.duration, easing: Easing.linear }),
      -1,
      false
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(particle.opacity, { duration: particle.duration * 0.2 }),
        withTiming(particle.opacity, { duration: particle.duration * 0.6 }),
        withTiming(0, { duration: particle.duration * 0.2 })
      ),
      -1,
      false
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: particle.x,
          top: particle.y,
          width: particle.size,
          height: particle.size,
          borderRadius: particle.size / 2,
          backgroundColor: '#FFF',
        },
        style,
      ]}
    />
  );
};

const PARTICLES = Array.from({ length: 15 }).map((_, i) => ({
  id: i,
  x: Math.random() * width,
  y: Math.random() * height,
  size: Math.random() * 3 + 1,
  opacity: Math.random() * 0.2 + 0.1,
  duration: Math.random() * 8000 + 10000,
}));

export default function LandingScreen({ onComplete }) {
  // Animated dots
  const dot1 = useSharedValue(0);
  const dot2 = useSharedValue(0);
  const dot3 = useSharedValue(0);

  useEffect(() => {
    // Animate dots
    dot1.value = withRepeat(
      withSequence(withTiming(1, { duration: 400 }), withTiming(0, { duration: 400 }), withDelay(400, withTiming(0, { duration: 0 }))),
      -1, true
    );
    dot2.value = withRepeat(
      withSequence(withDelay(200, withTiming(1, { duration: 400 })), withTiming(0, { duration: 400 }), withDelay(200, withTiming(0, { duration: 0 }))),
      -1, true
    );
    dot3.value = withRepeat(
      withSequence(withDelay(400, withTiming(1, { duration: 400 })), withTiming(0, { duration: 400 })),
      -1, true
    );

    // Auto-navigate after a few seconds
    const timer = setTimeout(() => {
      onComplete();
    }, 4000); // 4 seconds loading simulation

    return () => clearTimeout(timer);
  }, []);

  const dot1Style = useAnimatedStyle(() => ({ opacity: dot1.value * 0.5 + 0.5, transform: [{ scale: dot1.value * 0.2 + 0.8 }] }));
  const dot2Style = useAnimatedStyle(() => ({ opacity: dot2.value * 0.5 + 0.5, transform: [{ scale: dot2.value * 0.2 + 0.8 }] }));
  const dot3Style = useAnimatedStyle(() => ({ opacity: dot3.value * 0.5 + 0.5, transform: [{ scale: dot3.value * 0.2 + 0.8 }] }));

  return (
    <View className="flex-1 bg-[#11052C] items-center justify-center">
      {/* Background Gradient */}
      <LinearGradient
        colors={['#170A30', '#2E125E', '#170A30']}
        style={StyleSheet.absoluteFillObject}
      />
      
      {/* Particles */}
      {PARTICLES.map((p) => (
        <Particle key={p.id} particle={p} />
      ))}

      {/* Main Content */}
      <View className="items-center justify-center -mt-[50px]">
        {/* Logo */}
        <Image 
          source={require('../../assets/logo.png')} 
          className="w-[140px] h-[140px] mb-5"
          resizeMode="contain"
        />

        {/* Brand Name */}
        <View className="flex-row items-baseline mb-2">
          <Text className="text-[64px] text-white font-bold font-ncl">Hair</Text>
          <Text className="text-[64px] text-[#8B5CF6] font-bold font-ncl">Verse</Text>
        </View>

        {/* Tagline */}
        <Text className="text-[14px] text-white font-semibold tracking-[0.5px] font-cocogoose">Try Before You Cut</Text>
      </View>

      {/* Loading Indicator at Bottom */}
      <View className="absolute bottom-[60px] items-center">
        <View className="flex-row mb-3">
          <Animated.View className="w-2 h-2 rounded-full bg-[#8B5CF6] mx-1" style={dot1Style} />
          <Animated.View className="w-2 h-2 rounded-full bg-[#8B5CF6] mx-1" style={dot2Style} />
          <Animated.View className="w-2 h-2 rounded-full bg-[#8B5CF6] mx-1" style={dot3Style} />
        </View>
        <Text className="text-[#A78BFA] text-[13px] tracking-[0.5px]">Loading AI models...</Text>
      </View>
    </View>
  );
}
