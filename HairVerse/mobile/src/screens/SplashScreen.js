import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  withRepeat,
  Easing,
  runOnJS
} from 'react-native-reanimated';
import { useAuthStore } from '../store/authStore';

const { width, height } = Dimensions.get('window');

const PARTICLES = Array.from({ length: 12 }).map((_, i) => ({
  id: i,
  x: Math.random() * width,
  y: Math.random() * height,
  size: Math.random() * 3 + 1, // 1px - 4px
  opacity: Math.random() * 0.15 + 0.05, // 5% - 20%
  duration: Math.random() * 10000 + 10000, // 10s - 20s
}));

// Using the local logo from assets

export default function SplashScreen({ onAnimationComplete }) {
  const { authChecked } = useAuthStore();
  const [animationFinished, setAnimationFinished] = useState(false);

  // Check if both conditions are met to unmount splash screen
  useEffect(() => {
    if (animationFinished && authChecked) {
      setTimeout(() => {
        onAnimationComplete();
      }, 300);
    }
  }, [animationFinished, authChecked, onAnimationComplete]);

  // Shared values for the multi-stage animation
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.6);
  const waveTranslateY = useSharedValue(height + 500); // Start way below
  const waveTranslateX = useSharedValue(300); // Start far right
  const whiteLogoOpacity = useSharedValue(0);
  
  const logoTranslateX = useSharedValue(0);
  const logoTranslateY = useSharedValue(0);
  const findStyleOpacity = useSharedValue(0);

  useEffect(() => {
    // Stage 1: Colored logo fades in
    logoOpacity.value = withDelay(400, withTiming(1, { duration: 1000, easing: Easing.out(Easing.exp) }));
    
    // Scale sequence: Stage 1 (scale to 1) -> Stage 3 (scale to 0.25)
    logoScale.value = withSequence(
      withDelay(400, withTiming(1, { duration: 1200, easing: Easing.out(Easing.exp) })),
      withDelay(1200, withTiming(0.25, { duration: 1200, easing: Easing.inOut(Easing.cubic) }))
    );

    // Organic Wave sequence: Stage 2 (rise up from bottom right)
    waveTranslateY.value = withDelay(1600, withTiming(-height, { duration: 1600, easing: Easing.out(Easing.cubic) }));
    waveTranslateX.value = withDelay(1600, withTiming(-200, { duration: 1600, easing: Easing.out(Easing.cubic) }));

    // White Logo Opacity sequence: Stage 2 (crossfade as wave hits)
    whiteLogoOpacity.value = withDelay(2200, withTiming(1, { duration: 400 }));

    // Logo translation sequence: Stage 4 (move left/up)
    logoTranslateX.value = withDelay(4300, withTiming(60 - width / 2, { duration: 1200, easing: Easing.inOut(Easing.cubic) }));
    logoTranslateY.value = withDelay(4300, withTiming(-50, { duration: 1200, easing: Easing.inOut(Easing.cubic) }));

    // Find Style Text sequence: Stage 4 (fade in)
    findStyleOpacity.value = withDelay(4700, withTiming(1, { duration: 800 }));

    // Complete Animation after Stage 4
    setTimeout(() => {
      runOnJS(setAnimationFinished)(true);
    }, 6500);
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

  const scaleFactor = Math.max(width / 430, height / 932) * 1.2; // Extra 20% to prevent edge clipping

  const waveStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    width: 430,
    height: 932,
    left: (width - 430) / 2, // perfectly center the viewBox 
    top: (height - 932) / 2,
    transform: [
      { scale: scaleFactor },
      { translateX: waveTranslateX.value },
      { translateY: waveTranslateY.value }
    ],
  }));

  const whiteLogoStyle = useAnimatedStyle(() => ({
    opacity: whiteLogoOpacity.value,
    position: 'absolute',
    width: '100%',
    height: '100%',
  }));

  const findStyleStyle = useAnimatedStyle(() => ({
    opacity: findStyleOpacity.value,
    position: 'absolute',
    left: 40,
    top: height / 2 - 10,
  }));

  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient
        colors={['#05030D', '#221044', '#352554', '#221044']}
        locations={[0, 0.4, 0.8, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Subtle Glow Layers */}
      <View style={styles.glowContainer}>
        <View style={[styles.glow, { backgroundColor: '#5721AE', opacity: 0.12, width: width * 1.5, height: width * 1.5, top: -width * 0.2 }]} />
        <View style={[styles.glow, { backgroundColor: '#7A36E5', opacity: 0.08, width: width * 2, height: width * 2, bottom: -width * 0.5 }]} />
      </View>

      {/* Particle System */}
      {PARTICLES.map((p) => (
        <Particle key={p.id} particle={p} />
      ))}

      {/* Organic Liquid Wave Overlay (Stage 2) */}
      <Animated.View style={waveStyle}>
        <Svg width="100%" height="100%" viewBox="0 0 430 932" fill="none" style={{ overflow: 'visible' }}>
          <Path 
            d="M-1710.03 459.114C-2049.33 516.895 -2046 3000 -2046 3000L1497 3000V-120.111C1497 -120.111 1196.95 -430.071 947.224 -305.463C761.059 -212.57 854.657 -40.6756 672.336 18.9032C467.688 85.7783 401.148 -190.751 122.561 -96.9417C-147.139 -6.12494 48.8052 189.492 -182.87 273.762C-420.948 360.36 -470.226 116.186 -763.189 204.255C-1054.26 291.755 -888.704 486.072 -1129.71 551.789C-1401.19 625.82 -1470.1 418.256 -1710.03 459.114Z" 
            fill="url(#wave_grad)"
          />
          <Defs>
            <SvgLinearGradient id="wave_grad" x1="-274.5" y1="-335" x2="-274.5" y2="3000" gradientUnits="userSpaceOnUse">
              <Stop stopColor="#6C29D9"/>
              <Stop offset="1" stopColor="#391673"/>
            </SvgLinearGradient>
          </Defs>
        </Svg>
      </Animated.View>

      {/* Logos Container */}
      <Animated.View style={logoAnimatedStyle}>
        <Animated.Image 
          source={require('../../assets/logo.png')} 
          style={{ width: '100%', height: '100%', position: 'absolute' }}
          resizeMode="contain"
        />
        <Animated.Image 
          source={require('../../assets/whitelogo.png')} 
          style={whiteLogoStyle}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Text Block (Stage 4) */}
      <Animated.View style={findStyleStyle}>
        <Text style={styles.findStyleText}>
          Find Your{'\n'}Signature Style<Text style={styles.purpleDot}>.</Text>
        </Text>
      </Animated.View>
    </View>
  );
}

// Separate component for Particle to keep own animation state
const Particle = ({ particle }) => {
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withRepeat(
      withTiming(-100, { duration: particle.duration, easing: Easing.linear }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          left: particle.x,
          top: particle.y,
          width: particle.size,
          height: particle.size,
          opacity: particle.opacity,
          borderRadius: particle.size / 2,
        },
        animatedStyle,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#05030D',
  },
  glowContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    borderRadius: 9999,
    filter: 'blur(60px)', 
    shadowColor: '#5721AE',
    shadowOpacity: 1,
    shadowRadius: 100,
    elevation: 20,
  },
  particle: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    shadowColor: '#FFFFFF',
    shadowOpacity: 0.8,
    shadowRadius: 2,
  },
  findStyleText: {
    fontFamily: 'CocogoosePro-Regular', // Requires custom font loaded in App
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FFFFFF',
    lineHeight: 40,
  },
  purpleDot: {
    color: '#C084FC',
  },
  brandContainer: {
    flexDirection: 'row',
  },
  brandTextWhite: {
    fontFamily: 'NCLGasdrifo-Regular', 
    fontSize: 64,
    color: '#F7F6F6',
    fontWeight: '300',
  },
  brandTextPurple: {
    fontFamily: 'NCLGasdrifo-Regular', 
    fontSize: 64,
    color: '#7A36E5',
    fontWeight: '300',
  },
  taglineText: {
    fontFamily: 'sans-serif', 
    fontSize: 16,
    color: '#F7F6F6',
    fontWeight: '600',
  },
  loadingArea: {
    position: 'absolute',
    bottom: '10%',
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  loadingMessage: {
    color: '#F7F6F6',
    opacity: 0.7,
    fontSize: 13,
  },
});
