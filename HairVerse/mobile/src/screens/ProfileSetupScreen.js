import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ActivityIndicator, Alert, useWindowDimensions, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { useAuthStore } from '../store/authStore';

const GENDERS = ['Male', 'Female', 'Prefer Not To Say'];
const LENGTHS = ['Short', 'Medium', 'Long'];
const BEARDS = ['Clean Shave', 'Stubble', 'Short Beard', 'Full Beard', 'No Preference'];
const STYLES = ['Professional', 'Trendy', 'Korean', 'Casual', 'Modern Fade', 'Celebrity Inspired'];
const GOALS = ['Try New Hairstyles', 'Professional Look', 'Trendy Look', 'Hair Growth Journey', 'Experiment With Colors'];
const COLORS_OPTS = ['Natural Black', 'Brown', 'Blonde', 'Fashion Colors', 'No Preference'];

export default function ProfileSetupScreen({ navigation }) {
  const { completeProfile, isLoading, logout } = useAuthStore();

  const [gender, setGender] = useState('Male');
  const [hairLength, setHairLength] = useState('Short');
  const [beardPreference, setBeardPreference] = useState('Clean Shave');
  const [selectedStyles, setSelectedStyles] = useState([]);
  const [mainGoal, setMainGoal] = useState('Try New Hairstyles');
  const [preferredHairColor, setPreferredHairColor] = useState('Natural Black');

  const toggleStyle = (style) => {
    if (selectedStyles.includes(style)) {
      setSelectedStyles(selectedStyles.filter(s => s !== style));
    } else {
      setSelectedStyles([...selectedStyles, style]);
    }
  };

  const handleSave = async () => {
    if (selectedStyles.length === 0) {
      Alert.alert('Required', 'Please select at least one preferred style.');
      return;
    }

    const preferences = {
      gender,
      hairLength,
      beardPreference: gender === 'Female' ? 'No Preference' : beardPreference,
      preferredStyles: selectedStyles,
      mainGoal,
      preferredHairColor,
    };

    const res = await completeProfile(preferences);
    if (res.success) {
      navigation.replace('Main');
    } else {
      Alert.alert('Error', res.error || 'Failed to save profile preferences.');
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const { height } = useWindowDimensions();

  return (
    <View style={{ height: Platform.OS === 'web' ? '100vh' : height, flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={true}>
        <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Profile Completion</Text>
          <Text style={styles.subtitle}>Help us personalize your experience</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn} activeOpacity={0.7}>
          <Ionicons name="log-out-outline" size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Gender</Text>
      <View style={styles.chipRow}>
        {GENDERS.map(g => (
          <TouchableOpacity
            key={g}
            style={[styles.chip, gender === g && styles.activeChip]}
            onPress={() => setGender(g)}
          >
            <Text style={[styles.chipText, gender === g && styles.activeChipText]}>{g}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Hair Length Preference</Text>
      <View style={styles.chipRow}>
        {LENGTHS.map(l => (
          <TouchableOpacity
            key={l}
            style={[styles.chip, hairLength === l && styles.activeChip]}
            onPress={() => setHairLength(l)}
          >
            <Text style={[styles.chipText, hairLength === l && styles.activeChipText]}>{l}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {gender !== 'Female' && (
        <>
          <Text style={styles.label}>Beard Preference</Text>
          <View style={styles.chipRow}>
            {BEARDS.map(b => (
              <TouchableOpacity
                key={b}
                style={[styles.chip, beardPreference === b && styles.activeChip]}
                onPress={() => setBeardPreference(b)}
              >
                <Text style={[styles.chipText, beardPreference === b && styles.activeChipText]}>{b}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      <Text style={styles.label}>Preferred Style Type (Select Multiple)</Text>
      <View style={styles.chipRow}>
        {STYLES.map(s => {
          const active = selectedStyles.includes(s);
          return (
            <TouchableOpacity
              key={s}
              style={[styles.chip, active && styles.activeChip]}
              onPress={() => toggleStyle(s)}
            >
              <Text style={[styles.chipText, active && styles.activeChipText]}>{s}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.label}>Main Goal</Text>
      <View style={styles.chipRow}>
        {GOALS.map(g => (
          <TouchableOpacity
            key={g}
            style={[styles.chip, mainGoal === g && styles.activeChip]}
            onPress={() => setMainGoal(g)}
          >
            <Text style={[styles.chipText, mainGoal === g && styles.activeChipText]}>{g}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Preferred Hair Color</Text>
      <View style={styles.chipRow}>
        {COLORS_OPTS.map(c => (
          <TouchableOpacity
            key={c}
            style={[styles.chip, preferredHairColor === c && styles.activeChip]}
            onPress={() => setPreferredHairColor(c)}
          >
            <Text style={[styles.chipText, preferredHairColor === c && styles.activeChipText]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={[styles.btn, isLoading && { opacity: 0.7 }]} onPress={handleSave} disabled={isLoading}>
        {isLoading ? (
          <ActivityIndicator size="small" color={COLORS.background} />
        ) : (
          <Text style={styles.btnText}>Save & Continue</Text>
        )}
      </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  logoutBtn: {
    padding: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 30,
    marginTop: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 12,
    marginTop: 20,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
  activeChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.secondary,
  },
  chipText: {
    color: COLORS.textSecondary,
  },
  activeChipText: {
    color: COLORS.textPrimary,
    fontWeight: 'bold',
  },
  btn: {
    backgroundColor: COLORS.secondary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 40,
  },
  btnText: {
    color: COLORS.background,
    fontWeight: 'bold',
    fontSize: 16,
  },
});
