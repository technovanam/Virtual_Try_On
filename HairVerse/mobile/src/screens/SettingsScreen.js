import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../constants/theme';

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <View style={styles.card}>
        <Text style={styles.text}>Theme: Futuristic Dark</Text>
        <Text style={styles.text}>Language: English</Text>
        <Text style={styles.text}>Version: 1.0.0 (MVP)</Text>
      </View>
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 40,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  text: {
    color: COLORS.textSecondary,
    fontSize: 16,
    marginBottom: 12,
  },
});
