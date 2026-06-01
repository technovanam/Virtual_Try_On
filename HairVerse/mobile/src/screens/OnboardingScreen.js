import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { COLORS, FONTS, RADIUS, SPACING, TYPOGRAPHY } from '../constants/theme';

const SLIDES = [
  {
    title: 'Mobile try-on studio',
    description: 'See real cuts and finishes on your face before you book.',
  },
  {
    title: 'Personal style guidance',
    description: 'Recommendations tuned to your face shape and texture.',
  },
  {
    title: 'Live camera preview',
    description: 'Switch between classic, modern, and custom styles in seconds.',
  },
  {
    title: 'Save and compare',
    description: 'Keep your top looks and share them when you are ready.',
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
      <View style={styles.topRow}>
        <View style={styles.brandRow}>
          <View style={styles.brandDot} />
          <Text style={styles.eyebrow}>HairVerse</Text>
        </View>
        <Text style={styles.skip} onPress={() => navigation.replace('Main')}>Skip</Text>
      </View>

      <View style={styles.heroCard}>
        <View style={styles.mediaPanel}>
          <View style={styles.mediaBack} />
          <View style={styles.mediaFront}>
            <View style={styles.mediaBadge} />
            <View style={styles.mediaLine} />
            <View style={styles.mediaLineShort} />
          </View>
        </View>

        <View style={styles.textBlock}>
          <Text style={styles.title}>{SLIDES[currentSlide].title}</Text>
          <Text style={styles.description}>{SLIDES[currentSlide].description}</Text>
        </View>
      </View>

      <View style={styles.controlsRow}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.xxl,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
    marginRight: SPACING.sm,
  },
  eyebrow: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  skip: {
    color: COLORS.textSecondary,
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
  },
  heroCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#1B2233',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  mediaPanel: {
    height: 230,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  mediaBack: {
    position: 'absolute',
    width: 210,
    height: 190,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    transform: [{ rotate: '-4deg' }],
  },
  mediaFront: {
    width: 200,
    height: 200,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    justifyContent: 'center',
    shadowColor: '#1B2233',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  mediaBadge: {
    width: 30,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginBottom: SPACING.md,
  },
  mediaLine: {
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.surface,
    marginBottom: SPACING.sm,
  },
  mediaLineShort: {
    width: '70%',
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.surface,
  },
  textBlock: {
    alignItems: 'flex-start',
  },
  title: {
    ...TYPOGRAPHY.title,
    fontFamily: FONTS.display,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  description: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  controlsRow: {
    marginTop: SPACING.xl,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
    marginRight: SPACING.sm,
  },
  activeDot: {
    backgroundColor: COLORS.primary,
    width: 24,
  },
  btn: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  btnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
});
