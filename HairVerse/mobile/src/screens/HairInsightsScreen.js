import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/theme';

export default function HairInsightsScreen({ navigation }) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.header}>Hair Insights</Text>
      <Text style={styles.subHeader}>Full health report generated on May 26, 2026</Text>

      <View style={styles.gaugeContainer}>
        <View style={styles.gauge}>
          <Text style={styles.gaugeNumber}>85</Text>
          <Text style={styles.gaugeLabel}>Overall Score</Text>
        </View>
        <Text style={styles.gaugeStatus}>Status: Good (Straight/Smooth)</Text>
      </View>

      <Text style={styles.sectionTitle}>Condition Details</Text>
      <View style={styles.card}>
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Dryness:</Text>
          <Text style={styles.metricValue}>Low (10%)</Text>
        </View>
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Frizz:</Text>
          <Text style={styles.metricValue}>Low (12%)</Text>
        </View>
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Breakage Risk:</Text>
          <Text style={styles.metricValue}>Minimal</Text>
        </View>
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Gray Follicles:</Text>
          <Text style={styles.metricValue}>0% detected</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>AI Care Recommendation</Text>
      <View style={styles.tipsBox}>
        <Text style={styles.tipTitle}>Hydration & Volume Tips</Text>
        <Text style={styles.tipText}>
          Your hair exhibits high symmetry and smooth cuticles. To maintain volume with classic fades or textured crops, we recommend using a lightweight matte clay instead of heavy pomades.
        </Text>
      </View>

      <TouchableOpacity 
        style={styles.btn}
        onPress={() => navigation.navigate('AIAnalysis')}
      >
        <Text style={styles.btnText}>Recalculate Insights</Text>
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
    padding: 16,
    paddingTop: 40,
    paddingBottom: 40,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  subHeader: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: 4,
    marginBottom: 24,
  },
  gaugeContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  gauge: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 8,
    borderColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.card,
  },
  gaugeNumber: {
    fontSize: 42,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  gaugeLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  gaugeStatus: {
    color: COLORS.success,
    fontWeight: 'bold',
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 24,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  metricLabel: {
    color: COLORS.textSecondary,
  },
  metricValue: {
    color: COLORS.textPrimary,
    fontWeight: 'bold',
  },
  tipsBox: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.primary,
    marginBottom: 30,
  },
  tipTitle: {
    color: COLORS.secondary,
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
  },
  tipText: {
    color: COLORS.textSecondary,
    lineHeight: 20,
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
