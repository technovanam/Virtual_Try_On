import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS } from '../constants/theme';
import { useTryOnStore } from '../store/tryOnStore';

export default function ComparisonScreen({ navigation }) {
  const { renderedImageURL, selectedHairstyle } = useTryOnStore();
  const [mode, setMode] = useState('beforeAfter'); // beforeAfter or sideBySide

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.header}>Comparison</Text>
      
      <View style={styles.tabRow}>
        <TouchableOpacity 
          style={[styles.tab, mode === 'beforeAfter' && styles.activeTab]}
          onPress={() => setMode('beforeAfter')}
        >
          <Text style={[styles.tabText, mode === 'beforeAfter' && styles.activeTabText]}>Before vs After</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, mode === 'sideBySide' && styles.activeTab]}
          onPress={() => setMode('sideBySide')}
        >
          <Text style={[styles.tabText, mode === 'sideBySide' && styles.activeTabText]}>Side by Side</Text>
        </TouchableOpacity>
      </View>

      {mode === 'beforeAfter' ? (
        <View style={styles.compareContainer}>
          <View style={styles.half}>
            <Text style={styles.label}>Before</Text>
            <View style={styles.imageBox}>
              <Text style={styles.boxText}>Original Selfie</Text>
            </View>
          </View>
          <View style={styles.half}>
            <Text style={styles.label}>After</Text>
            {renderedImageURL ? (
              <Image source={{ uri: renderedImageURL }} style={styles.renderedImage} />
            ) : (
              <View style={styles.imageBox}>
                <Text style={styles.boxText}>Render Try-On First</Text>
              </View>
            )}
          </View>
        </View>
      ) : (
        <View style={styles.sideBySideContainer}>
          <View style={styles.fullBox}>
            <Text style={styles.label}>Original</Text>
            <View style={styles.largeBox}>
              <Text style={styles.boxText}>Original Selfie</Text>
            </View>
          </View>
          <View style={styles.fullBox}>
            <Text style={styles.label}>{selectedHairstyle ? selectedHairstyle.name : 'Styled Look'}</Text>
            {renderedImageURL ? (
              <Image source={{ uri: renderedImageURL }} style={styles.largeRenderedImage} />
            ) : (
              <View style={styles.largeBox}>
                <Text style={styles.boxText}>Render Try-On First</Text>
              </View>
            )}
          </View>
        </View>
      )}

      <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('Premium')}>
        <Text style={styles.btnText}>Export HD Grid (Premium)</Text>
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
    marginBottom: 20,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 8,
    padding: 4,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    color: COLORS.textSecondary,
    fontWeight: 'bold',
  },
  activeTabText: {
    color: COLORS.textPrimary,
  },
  compareContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  half: {
    width: '48%',
  },
  label: {
    color: COLORS.secondary,
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  imageBox: {
    backgroundColor: COLORS.card,
    height: 250,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  boxText: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  renderedImage: {
    height: 250,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  sideBySideContainer: {
    marginBottom: 30,
  },
  fullBox: {
    marginBottom: 20,
  },
  largeBox: {
    backgroundColor: COLORS.card,
    height: 300,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  largeRenderedImage: {
    height: 300,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  btn: {
    backgroundColor: COLORS.secondary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnText: {
    color: COLORS.background,
    fontWeight: 'bold',
    fontSize: 16,
  },
});
