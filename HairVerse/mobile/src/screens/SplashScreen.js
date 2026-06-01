import React, { useEffect } from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { COLORS, FONTS, RADIUS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { useAuthStore } from '../store/authStore';

export default function SplashScreen({ navigation }) {
  const { isAuthenticated, isInitializing, authChecked } = useAuthStore();

  useEffect(() => {
    // Wait for the auth state check to complete before navigating
    if (!authChecked) return;

    // Small delay for smooth splash animation before navigating
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        navigation.replace('Main');
      } else {
        navigation.replace('Login');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [authChecked, isAuthenticated]);

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>HairVerse</Text>
      <Text style={styles.tagline}>Try Before You Cut.</Text>
      <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
      <Text style={styles.status}>
        {isInitializing ? 'Restoring session...' : 'Initializing AI Engine...'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xxl,
  },
  bgCircleTop: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: COLORS.accent,
    top: -60,
    right: -40,
  },
  bgCircleBottom: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: COLORS.surface,
    bottom: -80,
    left: -60,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#1B2233',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.primary,
    marginRight: SPACING.sm,
  },
  brand: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    letterSpacing: 1.3,
    textTransform: 'uppercase',
  },
  title: {
    ...TYPOGRAPHY.display,
    fontFamily: FONTS.display,
    color: COLORS.ink,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    maxWidth: 300,
  },
  stackArea: {
    height: 210,
    marginTop: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stackBack: {
    position: 'absolute',
    width: 200,
    height: 160,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    transform: [{ rotate: '-6deg' }],
  },
  stackMid: {
    position: 'absolute',
    width: 210,
    height: 170,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.accent,
    borderWidth: 1,
    borderColor: COLORS.border,
    transform: [{ rotate: '3deg' }],
  },
  stackFront: {
    width: 220,
    height: 180,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#1B2233',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
    padding: SPACING.md,
    justifyContent: 'center',
  },
  stackBadge: {
    width: 28,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginBottom: SPACING.md,
  },
  stackLine: {
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.surface,
    marginBottom: SPACING.sm,
  },
  stackLineShort: {
    width: '70%',
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.surface,
  },
  stackChipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  stackChip: {
    width: 36,
    height: 10,
    borderRadius: 6,
    backgroundColor: COLORS.accent,
    marginRight: SPACING.sm,
  },
  stackChipWide: {
    width: 60,
    height: 10,
    borderRadius: 6,
    backgroundColor: COLORS.surface,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  status: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
  },
});
