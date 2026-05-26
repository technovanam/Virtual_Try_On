import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/theme';

const TRENDING_SEARCHES = ['Modern Fades', 'Korean Bangs', 'Curly Crop', 'Buzz Cut', 'Mustache Styling'];

export default function SearchScreen({ navigation }) {
  const [query, setQuery] = useState('');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.header}>Search Styles</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Search for cuts, color, or styles..."
        placeholderTextColor={COLORS.textSecondary}
        value={query}
        onChangeText={setQuery}
      />

      <Text style={styles.sectionTitle}>Trending Searches</Text>
      <View style={styles.chipRow}>
        {TRENDING_SEARCHES.map((item) => (
          <TouchableOpacity 
            key={item} 
            style={styles.chip}
            onPress={() => setQuery(item)}
          >
            <Text style={styles.chipText}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Browse Categories</Text>
      <View style={styles.card}>
        <Text style={styles.categoryItem} onPress={() => navigation.navigate('HairstyleDetail', { id: 'fade' })}>Fades & Crops</Text>
        <Text style={styles.categoryItem} onPress={() => navigation.navigate('HairstyleDetail', { id: 'korean' })}>Korean Textured</Text>
        <Text style={styles.categoryItem} onPress={() => navigation.navigate('HairstyleDetail', { id: 'curly' })}>Curly & Wavy Styles</Text>
        <Text style={styles.categoryItem} onPress={() => navigation.navigate('HairstyleDetail', { id: 'beard' })}>Beards & Stubble</Text>
      </View>
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
    marginBottom: 20,
  },
  input: {
    backgroundColor: COLORS.card,
    color: COLORS.textPrimary,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 30,
  },
  chip: {
    backgroundColor: COLORS.card,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipText: {
    color: COLORS.secondary,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryItem: {
    color: COLORS.textPrimary,
    fontSize: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
});
