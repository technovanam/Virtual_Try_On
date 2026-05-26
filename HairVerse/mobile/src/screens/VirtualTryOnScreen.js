import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { COLORS } from '../constants/theme';
import { useTryOnStore } from '../store/tryOnStore';
import { useAnalysisStore } from '../store/analysisStore';

const COLORS_LIST = ['Black', 'Dark Brown', 'Light Brown', 'Blonde', 'Burgundy', 'Silver'];
const BEARDS_LIST = ['Clean Shave', 'Stubble', 'Short Beard', 'Full Beard'];

export default function VirtualTryOnScreen({ navigation }) {
  const { 
    selectedHairstyle, 
    selectedColor, 
    selectedBeardStyle, 
    setSelectedColor, 
    setSelectedBeardStyle,
    generateTryOn,
    renderedImageURL,
    isRendering 
  } = useTryOnStore();

  const { userSelfieBase64 } = useAnalysisStore();

  const startRender = async () => {
    // Call the try-on generation API with user selfie base64
    await generateTryOn(userSelfieBase64);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.header}>AI Try-On</Text>
      
      <View style={styles.previewContainer}>
        {isRendering ? (
          <View style={styles.renderingBox}>
            <ActivityIndicator size="large" color={COLORS.secondary} />
            <Text style={styles.renderingText}>AI is shaping your hair...</Text>
          </View>
        ) : renderedImageURL ? (
          <Image source={{ uri: renderedImageURL }} style={styles.previewImage} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderText}>
              {selectedHairstyle ? `${selectedHairstyle.name} Selected` : 'Select a hairstyle from Recommendations'}
            </Text>
            {userSelfieBase64 ? (
              <Text style={styles.specText}>Selfie loaded. Ready to style!</Text>
            ) : (
              <Text style={styles.specWarn}>Go to Home -> AI Scanning to load your selfie first</Text>
            )}
          </View>
        )}
      </View>

      {selectedHairstyle && (
        <View style={styles.selectedStyleCard}>
          <Text style={styles.styleLabel}>Selected Hairstyle:</Text>
          <Text style={styles.styleName}>{selectedHairstyle.name}</Text>
        </View>
      )}

      <Text style={styles.sectionTitle}>Hair Colors</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
        {COLORS_LIST.map((color) => (
          <TouchableOpacity
            key={color}
            style={[styles.chip, selectedColor === color && styles.activeChip]}
            onPress={() => setSelectedColor(color)}
          >
            <Text style={[styles.chipText, selectedColor === color && styles.activeChipText]}>{color}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.sectionTitle}>Beard Options</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
        {BEARDS_LIST.map((beard) => (
          <TouchableOpacity
            key={beard}
            style={[styles.chip, selectedBeardStyle === beard && styles.activeChip]}
            onPress={() => setSelectedBeardStyle(beard)}
          >
            <Text style={[styles.chipText, selectedBeardStyle === beard && styles.activeChipText]}>{beard}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity 
        style={[styles.renderBtn, !selectedHairstyle && styles.disabledBtn]} 
        onPress={startRender}
        disabled={!selectedHairstyle}
      >
        <Text style={styles.renderText}>Generate AI Try-On</Text>
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
  previewContainer: {
    width: '100%',
    height: 380,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    flex: 1,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  placeholderText: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  specText: {
    color: COLORS.success,
    marginTop: 12,
    fontWeight: 'bold',
  },
  specWarn: {
    color: COLORS.warning,
    marginTop: 12,
    textAlign: 'center',
    fontSize: 13,
  },
  selectedStyleCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 24,
  },
  styleLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  styleName: {
    color: COLORS.secondary,
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
  },
  renderingBox: {
    flex: 1,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  renderingText: {
    color: COLORS.secondary,
    fontSize: 16,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  scroll: {
    marginBottom: 24,
  },
  chip: {
    backgroundColor: COLORS.card,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeChip: {
    borderColor: COLORS.secondary,
    backgroundColor: COLORS.primary,
  },
  chipText: {
    color: COLORS.textSecondary,
  },
  activeChipText: {
    color: COLORS.textPrimary,
    fontWeight: 'bold',
  },
  renderBtn: {
    backgroundColor: COLORS.secondary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  disabledBtn: {
    backgroundColor: COLORS.card,
    opacity: 0.5,
  },
  renderText: {
    color: COLORS.background,
    fontWeight: 'bold',
    fontSize: 16,
  },
});
