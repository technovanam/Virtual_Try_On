import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/theme';
import { useAuthStore } from '../store/authStore';

export default function ProfileScreen({ navigation }) {
  const { user } = useAuthStore();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.substring(0, 2).toUpperCase() || 'JD'}</Text>
        </View>
        <Text style={styles.name}>{user?.name || 'John Doe'}</Text>
        <Text style={styles.email}>{user?.email || 'john.doe@example.com'}</Text>
      </View>

      <Text style={styles.sectionTitle}>My AI Specs</Text>
      <View style={styles.card}>
        <View style={styles.specRow}>
          <Text style={styles.specLabel}>Face Shape:</Text>
          <Text style={styles.specValue}>Oval</Text>
        </View>
        <View style={styles.specRow}>
          <Text style={styles.specLabel}>Hair Texture:</Text>
          <Text style={styles.specValue}>Straight</Text>
        </View>
        <View style={styles.specRow}>
          <Text style={styles.specLabel}>Hair Density:</Text>
          <Text style={styles.specValue}>Medium</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Quick Links</Text>
      <TouchableOpacity 
        style={styles.linkRow}
        onPress={() => navigation.navigate('HairInsights')}
      >
        <Text style={styles.linkText}>Hair Health Report</Text>
        <Text style={styles.linkArrow}>></Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.linkRow}
        onPress={() => navigation.navigate('Premium')}
      >
        <Text style={styles.linkText}>Unlock Pro Premium</Text>
        <Text style={styles.linkArrow}>></Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.linkRow}
        onPress={() => navigation.navigate('Comparison')}
      >
        <Text style={styles.linkText}>View Style Comparisons</Text>
        <Text style={styles.linkArrow}>></Text>
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
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: COLORS.secondary,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  email: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 16,
    marginTop: 10,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 24,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  specLabel: {
    color: COLORS.textSecondary,
  },
  specValue: {
    color: COLORS.secondary,
    fontWeight: 'bold',
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.card,
    padding: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
    alignItems: 'center',
  },
  linkText: {
    color: COLORS.textPrimary,
    fontWeight: 'bold',
  },
  linkArrow: {
    color: COLORS.secondary,
    fontWeight: 'bold',
  },
});
