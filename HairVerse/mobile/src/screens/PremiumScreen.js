import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS, FONTS, RADIUS, SPACING, TYPOGRAPHY } from '../constants/theme';

export default function PremiumScreen({ navigation }) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.headerBlock}>
        <Text style={styles.eyebrow}>Premium Access</Text>
        <Text style={styles.header}>HairVerse Pro Studio</Text>
        <Text style={styles.tagline}>Built for consistent, production-ready try-ons.</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.planRow}>
          <Text style={styles.planTitle}>Pro Access</Text>
          <Text style={styles.planPill}>Monthly</Text>
        </View>
        <Text style={styles.planPrice}>$4.99</Text>
        <Text style={styles.planSub}>per month, cancel anytime</Text>

        <View style={styles.divider} />

        <View style={styles.benefitList}>
          <View style={styles.benefitRow}>
            <View style={styles.bullet} />
            <Text style={styles.benefit}>Unlimited AI render attempts</Text>
          </View>
          <View style={styles.benefitRow}>
            <View style={styles.bullet} />
            <Text style={styles.benefit}>HD + Ultra HD exports</Text>
          </View>
          <View style={styles.benefitRow}>
            <View style={styles.bullet} />
            <Text style={styles.benefit}>Watermark-free downloads</Text>
          </View>
          <View style={styles.benefitRow}>
            <View style={styles.bullet} />
            <Text style={styles.benefit}>Premium style packs</Text>
          </View>
          <View style={styles.benefitRow}>
            <View style={styles.bullet} />
            <Text style={styles.benefit}>Advanced color controls</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.buyBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.buyBtnText}>Start 3-day trial</Text>
        </TouchableOpacity>

        <Text style={styles.footnote}>Then $4.99/month. Cancel anytime.</Text>
      </View>

      <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.cancelBtnText}>Return to App</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    padding: SPACING.xxl,
    paddingTop: SPACING.xxxl,
    paddingBottom: SPACING.xxxl,
  },
  headerBlock: {
    marginBottom: SPACING.xl,
  },
  eyebrow: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  header: {
    ...TYPOGRAPHY.display,
    fontFamily: FONTS.display,
    color: COLORS.textPrimary,
    marginTop: SPACING.sm,
  },
  tagline: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#1B2233',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  planRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planTitle: {
    ...TYPOGRAPHY.subtitle,
    color: COLORS.textPrimary,
  },
  planPill: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
  },
  planPrice: {
    fontSize: 34,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
  },
  planSub: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.lg,
  },
  benefitList: {
    marginBottom: SPACING.lg,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginRight: SPACING.sm,
  },
  benefit: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  buyBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  buyBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
  footnote: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  cancelBtn: {
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  cancelBtnText: {
    color: COLORS.textSecondary,
    ...TYPOGRAPHY.caption,
  },
});
