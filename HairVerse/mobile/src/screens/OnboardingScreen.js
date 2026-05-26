import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS } from '../constants/theme';

const SLIDES = [
  {
    title: 'Welcome to HairVerse',
    description: 'Try before you cut. See exactly how you will look with our AI hairstyle overlays.',
  },
  {
    title: 'AI Hairstyle Recommendations',
    description: 'Get custom matched hairstyles suited for your specific face shape and hair density.',
  },
  {
    title: 'Live Camera Try-On',
    description: 'Try on hairstyles in real-time. Switch between classic cuts, fades, and colors instantly.',
  },
  {
    title: 'Style Quizzes & Goals',
    description: 'Customize your daily grooming habits, styling goals, and preferred colors.',
  }
];

export default function OnboardingScreen({ navigation }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      navigation.replace('Main');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.skip} onPress={() => navigation.replace('Main')}>Skip</Text>
      
      <View style={styles.content}>
        <Text style={styles.title}>{SLIDES[currentSlide].title}</Text>
        <Text style={styles.description}>{SLIDES[currentSlide].description}</Text>
      </View>

      <View style={styles.dotsRow}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[styles.dot, currentSlide === i && styles.activeDot]} />
        ))}
      </View>

      <TouchableOpacity style={styles.btn} onPress={handleNext}>
        <Text style={styles.btnText}>
          {currentSlide === SLIDES.length - 1 ? 'Get Started' : 'Next'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    padding: 24,
  },
  skip: {
    position: 'absolute',
    top: 50,
    right: 24,
    color: COLORS.textSecondary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 40,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.card,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: COLORS.secondary,
    width: 20,
  },
  btn: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnText: {
    color: COLORS.textPrimary,
    fontWeight: 'bold',
    fontSize: 16,
  },
});
