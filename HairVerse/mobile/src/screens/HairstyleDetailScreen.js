import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/theme';

export default function HairstyleDetailScreen({ route, navigation }) {
  const { id } = route.params || { id: 'default' };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Hairstyle Detail</Text>
      <Text style={styles.subtitle}>ID: {id}</Text>

      <View style={styles.detailBox}>
        <Text style={styles.label}>Style Vibe:</Text>
        <Text style={styles.value}>Modern & Trendy</Text>

        <Text style={styles.label}>Maintenance:</Text>
        <Text style={styles.value}>Medium (Requires styling clay)</Text>

        <Text style={styles.label}>Suitable Face Shapes:</Text>
        <Text style={styles.value}>Oval, Round, Square</Text>
      </View>

      <TouchableOpacity
        style={styles.btn}
        onPress={() => navigation.navigate('VirtualTryOn')}
      >
        <Text style={styles.btnText}>Try This Hairstyle</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: 40,
  },
  subtitle: {
    color: COLORS.secondary,
    marginBottom: 20,
  },
  detailBox: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 30,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: 12,
  },
  value: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
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
