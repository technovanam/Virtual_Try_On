import React, { useState, useRef } from 'react';
import {
  StyleSheet,
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
      <View style={[styles.slide, { width: cardWidth }]}>
        <View style={styles.slideContent}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleSkip} style={styles.skipButton} activeOpacity={0.7}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.illustrationContainer}>
            <View style={styles.illustrationPlaceholder}>
              <Text style={styles.illustrationText}>[Illustration Placeholder]</Text>
            </View>
          </View>

          <View style={styles.textContainer}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.backdrop}>
      <View style={[styles.card, { width: cardWidth, height: cardHeight }]}>
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
        
        <View style={styles.footerContainer} pointerEvents="box-none">
          <View style={styles.footer} pointerEvents="box-none">
            <View style={styles.paginatorContainer}>
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
                    style={[
                      styles.dot,
                      {
                        width: dotWidth,
                        opacity,
                      },
                    ]}
                    key={i.toString()}
                  />
                );
              })}
            </View>

            <TouchableOpacity style={styles.button} onPress={handleNext} activeOpacity={0.7}>
              <Text style={styles.buttonText}>
                {currentIndex === onboardingSlides.length - 1 ? 'Get Started' : 'Next'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 10,
    boxShadow: '0px 10px 20px rgba(0, 0, 0, 0.2)',
  },
  slide: {
    flex: 1,
  },
  slideContent: {
    flex: 1,
    paddingBottom: 80, // Leave space for the absolute footer
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    alignItems: 'flex-end',
    zIndex: 10,
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  skipText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '600',
  },
  illustrationContainer: {
    flex: 0.55,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    marginTop: 10,
  },
  illustrationPlaceholder: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.1)',
    borderStyle: 'dashed',
  },
  illustrationText: {
    color: '#666666',
    fontWeight: 'bold',
  },
  textContainer: {
    flex: 0.45,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#444444',
    textAlign: 'center',
    lineHeight: 22,
  },
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    zIndex: 20,
  },
  footer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  paginatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#000000',
    marginHorizontal: 4,
  },
  button: {
    backgroundColor: '#000000',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    elevation: 2,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
