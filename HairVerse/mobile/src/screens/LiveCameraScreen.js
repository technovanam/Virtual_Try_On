import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS } from '../constants/theme';

const LIVE_STYLES = ['Classic Fade', 'Korean Fringe', 'Buzz Cut', 'Crew Crop'];

export default function LiveCameraScreen({ navigation }) {
  const [selectedStyle, setSelectedStyle] = useState('Classic Fade');
  const [cameraActive, setCameraActive] = useState(true);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Live Try-On</Text>

      {cameraActive ? (
        <View style={styles.cameraBox}>
          <Text style={styles.cameraText}>Live Video Feed Active</Text>
          <View style={styles.overlayTextContainer}>
            <Text style={styles.overlayText}>{selectedStyle} Overlay Applied</Text>
          </View>
        </View>
      ) : (
        <View style={styles.cameraBox}>
          <Text style={styles.cameraText}>Camera Paused</Text>
        </View>
      )}

      <Text style={styles.sectionTitle}>Tap to Switch Styles Live:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
        {LIVE_STYLES.map((style) => (
          <TouchableOpacity
            key={style}
            style={[styles.chip, selectedStyle === style && styles.activeChip]}
            onPress={() => setSelectedStyle(style)}
          >
            <Text style={[styles.chipText, selectedStyle === style && styles.activeChipText]}>{style}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.row}>
        <TouchableOpacity 
          style={styles.btnSec}
          onPress={() => setCameraActive(!cameraActive)}
        >
          <Text style={styles.btnSecText}>{cameraActive ? 'Pause Video' : 'Resume Video'}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.btn}
          onPress={() => navigation.navigate('Export')}
        >
          <Text style={styles.btnText}>Snapshot Look</Text>
        </TouchableOpacity>
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
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 20,
  },
  cameraBox: {
    width: '100%',
    height: 380,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    backgroundColor: '#1E1E2E',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    overflow: 'hidden',
  },
  cameraText: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },
  overlayTextContainer: {
    position: 'absolute',
    bottom: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  overlayText: {
    color: COLORS.secondary,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  scroll: {
    maxHeight: 50,
    marginBottom: 30,
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  btn: {
    backgroundColor: COLORS.primary,
    flex: 0.48,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnText: {
    color: COLORS.textPrimary,
    fontWeight: 'bold',
  },
  btnSec: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    flex: 0.48,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnSecText: {
    color: COLORS.textPrimary,
    fontWeight: 'bold',
  },
});
