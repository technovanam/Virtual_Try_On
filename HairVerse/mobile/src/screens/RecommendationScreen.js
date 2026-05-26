import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/theme';
import { useTryOnStore } from '../store/tryOnStore';

const MOCK_RECOMMENDATIONS = [
  { id: 'fade_01', name: 'Classic Fade', score: '95%' },
  { id: 'korean_02', name: 'Korean Textured Cut', score: '88%' },
  { id: 'buzz_03', name: 'Crew Buzz Cut', score: '82%' },
];

export default function RecommendationScreen({ navigation }) {
  const setSelectedHairstyle = useTryOnStore((state) => state.setSelectedHairstyle);

  const handleTryOn = (style) => {
    setSelectedHairstyle(style);
    navigation.navigate('VirtualTryOn');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>AI Recommendations</Text>
      <Text style={styles.subHeader}>Based on your Oval face shape and Medium density hair</Text>

      {MOCK_RECOMMENDATIONS.map((style) => (
        <View key={style.id} style={styles.card}>
          <View style={styles.cardInfo}>
            <Text style={styles.cardName}>{style.name}</Text>
            <Text style={styles.cardScore}>Suitability: {style.score}</Text>
          </View>
          <TouchableOpacity style={styles.btn} onPress={() => handleTryOn(style)}>
            <Text style={styles.btnText}>Try On</Text>
          </TouchableOpacity>
        </View>
      ))}
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
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: 40,
  },
  subHeader: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 24,
    marginTop: 4,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardInfo: {
    flex: 0.7,
  },
  cardName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  cardScore: {
    color: COLORS.secondary,
    marginTop: 4,
  },
  btn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  btnText: {
    color: COLORS.textPrimary,
    fontWeight: 'bold',
  },
});
