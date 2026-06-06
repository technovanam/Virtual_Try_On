import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
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
  const waveTranslateY = useSharedValue(height * 1.5); // Start far below
  const whiteLogoOpacity = useSharedValue(0);
  
  const logoTranslateX = useSharedValue(0);
  const logoTranslateY = useSharedValue(0);
  const findStyleOpacity = useSharedValue(0);

  // Stage 5 values
  const brandOpacity = useSharedValue(0);
  const taglineOpacity = useSharedValue(0);
  const loadingOpacity = useSharedValue(0);

  useEffect(() => {
    // Stage 1: Colored logo fades in
    logoOpacity.value = withDelay(400, withTiming(1, { duration: 1000, easing: Easing.out(Easing.exp) }));
    
    // Scale sequence: Stage 1 (scale to 1) -> Stage 3 (scale to 0.25) -> Stage 5 (scale to 0.8)
    logoScale.value = withSequence(
      withDelay(400, withTiming(1, { duration: 1200, easing: Easing.out(Easing.exp) })),
      withDelay(1200, withTiming(0.25, { duration: 1200, easing: Easing.inOut(Easing.cubic) })),
      withDelay(2500, withTiming(0.8, { duration: 1000, easing: Easing.inOut(Easing.cubic) }))
    );

    // Diagonal Wave sequence: Stage 2 (rise up) -> Stage 5 (slide down)
    waveTranslateY.value = withSequence(
      withDelay(1600, withTiming(-height * 1.5, { duration: 1400, easing: Easing.inOut(Easing.cubic) })),
      withDelay(3500, withTiming(height * 1.5, { duration: 1200, easing: Easing.inOut(Easing.cubic) }))
    );

    // White Logo Opacity sequence: Stage 2 (crossfade as wave hits) -> Stage 5 (fade out)
    whiteLogoOpacity.value = withSequence(
      withDelay(2100, withTiming(1, { duration: 400 })), // Turns white midway through the wave rising
      withDelay(4000, withTiming(0, { duration: 1000 }))
    );

    // Logo translation sequence: Stage 4 (move left/up) -> Stage 5 (move to center top)
    logoTranslateX.value = withSequence(
      withDelay(4300, withTiming(60 - width / 2, { duration: 1200, easing: Easing.inOut(Easing.cubic) })),
      withDelay(1000, withTiming(0, { duration: 1000, easing: Easing.inOut(Easing.cubic) }))
    );
    logoTranslateY.value = withSequence(
      withDelay(4300, withTiming(-50, { duration: 1200, easing: Easing.inOut(Easing.cubic) })),
      withDelay(1000, withTiming(-80, { duration: 1000, easing: Easing.inOut(Easing.cubic) }))
    );

    // Find Style Text sequence: Stage 4 (fade in) -> Stage 5 (fade out)
    findStyleOpacity.value = withSequence(
      withDelay(4700, withTiming(1, { duration: 800 })),
      withDelay(1000, withTiming(0, { duration: 500 }))
    );

    // Stage 5 Final Elements (Only fade in once, so delay is enough)
    const tFinalStart = 6500;
    brandOpacity.value = withDelay(tFinalStart + 400, withTiming(1, { duration: 600 }));
    taglineOpacity.value = withDelay(tFinalStart + 600, withTiming(1, { duration: 600 }));
    loadingOpacity.value = withDelay(tFinalStart + 800, withTiming(1, { duration: 600 }, (finished) => {
      if (finished) {
        runOnJS(setAnimationFinished)(true);
      }
    }));
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

  const WAVE_SIZE = Math.max(width, height) * 3;

  const waveStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    width: WAVE_SIZE,
    height: WAVE_SIZE,
    left: (width - WAVE_SIZE) / 2,
    top: (height - WAVE_SIZE) / 2,
    transform: [
      { rotate: '-35deg' }, // Slant it so it comes from bottom-right
      { translateY: waveTranslateY.value }
    ],
  }));

  const whiteLogoStyle = useAnimatedStyle(() => ({
    opacity: whiteLogoOpacity.value,
    position: 'absolute',
    width: '100%',
    height: '100%',
  }));

  const textBlockStyle = useAnimatedStyle(() => ({
    opacity: findStyleOpacity.value,
    position: 'absolute',
    left: 40, 
    top: height / 2 - 10, 
  }));

  const brandStyle = useAnimatedStyle(() => ({
    opacity: brandOpacity.value,
    position: 'absolute',
    top: height / 2 - 10, 
  }));

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
    position: 'absolute',
    top: height / 2 + 55, 
  }));

  const loadingAreaStyle = useAnimatedStyle(() => ({
    opacity: loadingOpacity.value,
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

      {/* Diagonal Liquid Wave Overlay (Stage 2) */}
      <Animated.View style={waveStyle}>
        <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" fill="none">
          <Path 
            d="M 0,35 C 20,45 40,15 60,35 C 80,55 95,25 100,30 L 100,100 L 0,100 Z" 
            fill="url(#wave_grad)"
          />
          <Defs>
            <SvgLinearGradient id="wave_grad" x1="50" y1="20" x2="50" y2="100" gradientUnits="userSpaceOnUse">
              <Stop stopColor="#8B5CF6"/> {/* Lighter purple at the crest of the wave */}
              <Stop offset="0.3" stopColor="#6C29D9"/>
              <Stop offset="1" stopColor="#391673"/>
            </SvgLinearGradient>
          </Defs>
        </Svg>
      </Animated.View>

      {/* Logos Container */}
      <Animated.View style={logoAnimatedStyle}>
        {/* Colored Logo (Base) */}
        <Animated.Image 
          source={require('../../assets/logo.png')} 
          style={{ width: '100%', height: '100%', position: 'absolute' }}
          resizeMode="contain"
        />
        {/* White Logo (Crossfades in) */}
        <Animated.Image 
          source={require('../../assets/whitelogo.png')} 
          style={whiteLogoStyle}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Text Block (Stage 4) */}
      <Animated.View style={textBlockStyle}>
        <Animated.Text style={styles.findStyleText}>
          Find Your{'\n'}Signature Style<Animated.Text style={styles.purpleDot}>.</Animated.Text>
        </Animated.Text>
      </Animated.View>

      {/* Brand Text (Stage 5) */}
      <Animated.View style={[styles.brandContainer, brandStyle]}>
        <Animated.Text style={styles.brandTextWhite}>Hair</Animated.Text>
        <Animated.Text style={styles.brandTextPurple}>Verse</Animated.Text>
      </Animated.View>

      {/* Tagline Text (Stage 5) */}
      <Animated.Text style={[styles.taglineText, taglineStyle]}>
        Try Before You Cut
      </Animated.Text>

      {/* Loading Area (Stage 5) */}
      <Animated.View style={[styles.loadingArea, loadingAreaStyle]}>
        <LoadingDots />
        <Animated.Text style={styles.loadingMessage}>Loading AI models...</Animated.Text>
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

// Animated Dots Component
const LoadingDots = () => {
  const dot1 = useSharedValue(0.3);
  const dot2 = useSharedValue(0.3);
  const dot3 = useSharedValue(0.3);

  useEffect(() => {
    const duration = 600;
    dot1.value = withRepeat(withTiming(1, { duration }), -1, true);
    setTimeout(() => {
      dot2.value = withRepeat(withTiming(1, { duration }), -1, true);
    }, 200);
    setTimeout(() => {
      dot3.value = withRepeat(withTiming(1, { duration }), -1, true);
    }, 400);
  }, []);

  return (
    <View style={styles.dotsContainer}>
      <Animated.View style={[styles.dot, { backgroundColor: '#5721AE', opacity: dot1 }]} />
      <Animated.View style={[styles.dot, { backgroundColor: '#7A36E5', opacity: dot2 }]} />
      <Animated.View style={[styles.dot, { backgroundColor: '#7A67F4', opacity: dot3 }]} />
    </View>
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
