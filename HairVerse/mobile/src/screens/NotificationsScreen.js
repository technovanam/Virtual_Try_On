import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/theme';

const MOCK_NOTIFICATIONS = [
  { id: '1', title: 'New Trend Alert!', desc: 'Korean textured fringes are trending in your area this week. Try it on now!' },
  { id: '2', title: 'Hair Insight Score Calculated', desc: 'Your hair health score is ready. Open your report to see growth tips.' },
  { id: '3', title: 'Premium Upgrade Successful', desc: 'You now have unlimited Ultra HD try-ons. Unlock custom tint filters.' }
];

export default function NotificationsScreen({ navigation }) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.header}>Notifications</Text>
      
      {MOCK_NOTIFICATIONS.map((item) => (
        <View key={item.id} style={styles.card}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.desc}>{item.desc}</Text>
        </View>
      ))}

      <TouchableOpacity 
        style={styles.btn}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.btnText}>Clear All</Text>
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
    marginBottom: 24,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  desc: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: 6,
    lineHeight: 20,
  },
  btn: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.error,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  btnText: {
    color: COLORS.error,
    fontWeight: 'bold',
    fontSize: 16,
  },
});
