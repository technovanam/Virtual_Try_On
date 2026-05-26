import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/theme';

export default function PremiumScreen({ navigation }) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.header}>Go Premium</Text>
      <Text style={styles.tagline}>Unlock the ultimate try-on realism</Text>

      <View style={styles.card}>
        <Text style={styles.planTitle}>Pro Access</Text>
        <Text style={styles.planPrice}>$4.99 / month</Text>
        
        <View style={styles.benefitList}>
          <Text style={styles.benefit}>✓ Unlimited AI rendering compositions</Text>
          <Text style={styles.benefit}>✓ HD & Ultra HD quality exports</Text>
          <Text style={styles.benefit}>✓ Watermark-free downloads</Text>
          <Text style={styles.benefit}>✓ Access premium trending packs (Wolf Cuts, Korean bangs)</Text>
          <Text style={styles.benefit}>✓ Custom color-blend dynamic tinting picker</Text>
        </View>

        <TouchableOpacity 
          style={styles.buyBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buyBtnText}>Start 3-Day Free Trial</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.cancelBtn}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.cancelBtnText}>Back to App</Text>
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
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    marginTop: 20,
  },
  tagline: {
    color: COLORS.secondary,
    textAlign: 'center',
    fontSize: 16,
    marginTop: 6,
    marginBottom: 30,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 24,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  planTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  planPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.secondary,
    textAlign: 'center',
    marginVertical: 12,
  },
  benefitList: {
    marginVertical: 20,
  },
  benefit: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 8,
  },
  buyBtn: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  buyBtnText: {
    color: COLORS.textPrimary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelBtn: {
    alignItems: 'center',
    marginTop: 24,
  },
  cancelBtnText: {
    color: COLORS.textSecondary,
  },
});
