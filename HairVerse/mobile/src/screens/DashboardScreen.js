import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/theme';
import { useAuthStore } from '../store/authStore';

export default function DashboardScreen({ navigation }) {
  const logout = useAuthStore((state) => state.logout);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcome}>Welcome to HairVerse</Text>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.heroCard}
        onPress={() => navigation.navigate('AIAnalysis')}
      >
        <Text style={styles.heroTitle}>AI Hairstyle Try-On</Text>
        <Text style={styles.heroSubtitle}>Upload a selfie to analyze your face shape and try on styles instantly</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Trending Hairstyles</Text>
      <View style={styles.trendingGrid}>
        <TouchableOpacity
          style={styles.trendItem}
          onPress={() => navigation.navigate('HairstyleDetail', { id: 'fade_01' })}
        >
          <Text style={styles.trendName}>Classic Fade</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.trendItem}
          onPress={() => navigation.navigate('HairstyleDetail', { id: 'korean_02' })}
        >
          <Text style={styles.trendName}>Korean Textured Cut</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 24,
  },
  welcome: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  logoutBtn: {
    padding: 8,
  },
  logoutText: {
    color: COLORS.error,
  },
  heroCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 24,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  heroSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  trendingGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  trendItem: {
    backgroundColor: COLORS.card,
    flex: 0.48,
    height: 120,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'flex-end',
  },
  trendName: {
    color: COLORS.textPrimary,
    fontWeight: 'bold',
  },
});
