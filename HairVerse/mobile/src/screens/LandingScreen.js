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
    <View style={styles.container}>
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
      <View style={styles.centerContent}>
        {/* Logo */}
        <Image 
          source={require('../../assets/logo.png')} 
          style={styles.logo} 
          resizeMode="contain"
        />

        {/* Brand Name */}
        <View style={styles.brandRow}>
          <Text style={styles.hairText}>Hair</Text>
          <Text style={styles.verseText}>Verse</Text>
        </View>

        {/* Tagline */}
        <Text style={styles.tagline}>Try Before You Cut</Text>
      </View>

      {/* Loading Indicator at Bottom */}
      <View style={styles.bottomContent}>
        <View style={styles.dotsContainer}>
          <Animated.View style={[styles.dot, dot1Style]} />
          <Animated.View style={[styles.dot, dot2Style]} />
          <Animated.View style={[styles.dot, dot3Style]} />
        </View>
        <Text style={styles.loadingText}>Loading AI models...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#11052C', // Deep purple-black
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -50,
  },
  logo: {
    width: 140,
    height: 140,
    marginBottom: 20,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  hairText: {
    fontSize: 48,
    color: '#FFFFFF',
    fontFamily: 'NCLGasdrifo', // Fallback to serif if custom font not loaded
    fontWeight: 'bold',
  },
  verseText: {
    fontSize: 48,
    color: '#8B5CF6', // Purple
    fontFamily: 'NCLGasdrifo',
    fontWeight: 'bold',
  },
  tagline: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: 'CocogoosePro-Regular',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  bottomContent: {
    position: 'absolute',
    bottom: 60,
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8B5CF6',
    marginHorizontal: 4,
  },
  loadingText: {
    color: '#A78BFA',
    fontSize: 13,
    letterSpacing: 0.5,
  },
});
