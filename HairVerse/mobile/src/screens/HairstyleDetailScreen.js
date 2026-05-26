import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { useTryOnStore } from '../store/tryOnStore';

const HAIRSTYLE_DATABASE = {
  fade_01: {
    id: 'fade_01',
    name: 'Classic Fade',
    vibe: 'Modern, Sharp & Clean',
    faceShapes: 'Oval, Round, Square',
    maintenance: 'Medium (Requires styling clay)',
    length: 'Short (< 2 inches)',
    matchScore: '95%',
    imageUrl: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&h=600&fit=crop',
  },
  korean_02: {
    id: 'korean_02',
    name: 'Korean Textured',
    vibe: 'Soft, Textured & Casual',
    faceShapes: 'Oval, Heart, Oblong',
    maintenance: 'Low (Simple brush & spray)',
    length: 'Medium (3 - 5 inches)',
    matchScore: '92%',
    imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&h=600&fit=crop',
  },
  curly_03: {
    id: 'curly_03',
    name: 'Textured Curly Crop',
    vibe: 'Bold, Curly & Voluminous',
    faceShapes: 'Oval, Square, Heart',
    maintenance: 'High (Needs curl activator)',
    length: 'Medium (2 - 4 inches)',
    matchScore: '88%',
    imageUrl: 'https://images.unsplash.com/photo-1605497746444-ac9dbd39f4a5?w=600&h=600&fit=crop',
  },
  buzz_04: {
    id: 'buzz_04',
    name: 'Modern Buzz Cut',
    vibe: 'Minimalist, Rugged & Athletic',
    faceShapes: 'Oval, Square, Symmetrical',
    maintenance: 'Low (Zero products required)',
    length: 'Short (< 0.5 inches)',
    matchScore: '90%',
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&h=600&fit=crop',
  }
};

const COLOR_SWATCHES = [
  { name: 'Black', hex: '#09090C' },
  { name: 'Dark Brown', hex: '#3C2F2F' },
  { name: 'Light Brown', hex: '#8B5A2B' },
  { name: 'Blonde', hex: '#D4AF37' },
  { name: 'Burgundy', hex: '#800020' },
  { name: 'Silver', hex: '#C0C0C0' }
];

const BEARDS_LIST = ['Clean Shave', 'Stubble', 'Short Beard', 'Full Beard'];

export default function HairstyleDetailScreen({ route, navigation }) {
  const { id } = route.params || { id: 'fade_01' };
  
  // Resolve hairstyle data from database
  const hairstyle = HAIRSTYLE_DATABASE[id] || HAIRSTYLE_DATABASE.fade_01;

  // Custom Selection States
  const [selectedColor, setSelectedColor] = useState('Black');
  const [selectedBeard, setSelectedBeard] = useState('Clean Shave');

  const { setSelectedHairstyle, setSelectedColor: setStoreColor, setSelectedBeardStyle } = useTryOnStore();

  const handleTryOnPress = () => {
    setSelectedHairstyle({ id: hairstyle.id, name: hairstyle.name });
    setStoreColor(selectedColor);
    setSelectedBeardStyle(selectedBeard);
    
    // Smoothly transition to the main bottom tab Try-On screen
    navigation.navigate('Main', {
      screen: 'Search', // Fallback, or since VirtualTryOn is a Stack.Screen inside AppNavigator, let's navigate to VirtualTryOn directly!
    });
    
    // In AppNavigator, VirtualTryOn is registered directly on the main Stack:
    // <Stack.Screen name="VirtualTryOn" component={VirtualTryOnScreen} />
    // So we can navigate directly to VirtualTryOn!
    navigation.navigate('VirtualTryOn');
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header Cover Image */}
        <View style={styles.imageHeaderContainer}>
          <Image source={{ uri: hairstyle.imageUrl }} style={styles.headerImage} />
          <View style={styles.gradientOverlay} />
          
          {/* Back Action */}
          <TouchableOpacity 
            style={styles.backBtn} 
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back-outline" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>

          {/* Floating Compatibility Ring */}
          <View style={styles.floatingCompatibilityBox}>
            <Text style={styles.compatibilityLabel}>AI MATCH</Text>
            <Text style={styles.compatibilityValue}>{hairstyle.matchScore}</Text>
          </View>
        </View>

        {/* Hairstyle Branding */}
        <View style={styles.infoSection}>
          <Text style={styles.vibeText}>{hairstyle.vibe.toUpperCase()}</Text>
          <Text style={styles.title}>{hairstyle.name}</Text>
          
          {/* Glassmorphism Specs Grid */}
          <View style={styles.specsCard}>
            <View style={styles.specRow}>
              <Ionicons name="sparkles-outline" size={16} color={COLORS.secondary} style={styles.specIcon} />
              <View style={styles.specTextCol}>
                <Text style={styles.specLabel}>Style Vibe</Text>
                <Text style={styles.specValue}>{hairstyle.vibe}</Text>
              </View>
            </View>

            <View style={styles.specRow}>
              <Ionicons name="people-outline" size={16} color={COLORS.secondary} style={styles.specIcon} />
              <View style={styles.specTextCol}>
                <Text style={styles.specLabel}>Suitable Face Shapes</Text>
                <Text style={styles.specValue}>{hairstyle.faceShapes}</Text>
              </View>
            </View>

            <View style={styles.specRow}>
              <Ionicons name="construct-outline" size={16} color={COLORS.secondary} style={styles.specIcon} />
              <View style={styles.specTextCol}>
                <Text style={styles.specLabel}>Maintenance Level</Text>
                <Text style={styles.specValue}>{hairstyle.maintenance}</Text>
              </View>
            </View>

            <View style={[styles.specRow, { borderBottomWidth: 0, paddingBottom: 0 }]}>
              <Ionicons name="resize-outline" size={16} color={COLORS.secondary} style={styles.specIcon} />
              <View style={styles.specTextCol}>
                <Text style={styles.specLabel}>Hair Length Requirement</Text>
                <Text style={styles.specValue}>{hairstyle.length}</Text>
              </View>
            </View>
          </View>

          {/* Hair Color Selection */}
          <Text style={styles.sectionTitle}>Select Hair Color</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.colorsScroll}>
            {COLOR_SWATCHES.map((color) => {
              const isSelected = selectedColor === color.name;
              return (
                <TouchableOpacity
                  key={color.name}
                  style={[styles.colorOption, isSelected && styles.activeColorOption]}
                  onPress={() => setSelectedColor(color.name)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.colorCircle, { backgroundColor: color.hex }]} />
                  <Text style={[styles.colorLabelText, isSelected && styles.activeColorLabelText]}>
                    {color.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Beard Option Selection */}
          <Text style={styles.sectionTitle}>Select Beard Style</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.beardsScroll}>
            {BEARDS_LIST.map((beard) => {
              const isSelected = selectedBeard === beard;
              return (
                <TouchableOpacity
                  key={beard}
                  style={[styles.beardChip, isSelected && styles.activeBeardChip]}
                  onPress={() => setSelectedBeard(beard)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.beardChipText, isSelected && styles.activeBeardChipText]}>
                    {beard}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </ScrollView>

      {/* Try-On Button Bar (Floating) */}
      <View style={styles.bottomBar}>
        <TouchableOpacity 
          style={styles.tryOnBtn} 
          onPress={handleTryOnPress}
          activeOpacity={0.85}
        >
          <Ionicons name="body-outline" size={18} color={COLORS.background} style={styles.btnIcon} />
          <Text style={styles.tryOnText}>Try This Hairstyle</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 110,
  },
  imageHeaderContainer: {
    height: 360,
    position: 'relative',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  headerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 120,
    backgroundColor: 'rgba(10, 10, 15, 0.95)', // Custom base gradient blend
  },
  backBtn: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(10, 10, 15, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingCompatibilityBox: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    backgroundColor: 'rgba(18, 18, 26, 0.85)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: COLORS.secondary,
    alignItems: 'center',
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  compatibilityLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: COLORS.secondary,
    letterSpacing: 1,
  },
  compatibilityValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  infoSection: {
    paddingHorizontal: 20,
    marginTop: -20,
  },
  vibeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.secondary,
    letterSpacing: 1.5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: 6,
    marginBottom: 20,
  },
  specsCard: {
    backgroundColor: 'rgba(18, 18, 26, 0.85)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 24,
  },
  specRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 12,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  specIcon: {
    marginRight: 14,
  },
  specTextCol: {
    flex: 1,
  },
  specLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  specValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 14,
    letterSpacing: 0.5,
  },
  colorsScroll: {
    marginBottom: 24,
  },
  colorOption: {
    alignItems: 'center',
    marginRight: 16,
    padding: 4,
  },
  activeColorOption: {
    // Add dynamic borders around selected colors
  },
  colorCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 6,
  },
  colorLabelText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  activeColorLabelText: {
    color: COLORS.secondary,
    fontWeight: 'bold',
  },
  beardsScroll: {
    marginBottom: 12,
  },
  beardChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 10,
  },
  activeBeardChip: {
    backgroundColor: 'rgba(0, 212, 255, 0.05)',
    borderColor: 'rgba(0, 212, 255, 0.25)',
  },
  beardChipText: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  activeBeardChipText: {
    color: COLORS.secondary,
    fontWeight: 'bold',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: 'rgba(10, 10, 15, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  tryOnBtn: {
    backgroundColor: COLORS.secondary,
    borderRadius: 14,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  btnIcon: {
    marginRight: 8,
  },
  tryOnText: {
    color: COLORS.background,
    fontSize: 15,
    fontWeight: 'bold',
  },
});
