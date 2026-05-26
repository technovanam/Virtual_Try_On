import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { COLORS } from '../constants/theme';

const GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say'];
const LENGTHS = ['Short', 'Medium', 'Long'];
const STYLES = ['Fade', 'Korean', 'Curly', 'Wolf Cut', 'Professional', 'Buzz Cut'];
const GOALS = ['Volume', 'Shine', 'Growth', 'Damage Repair'];

export default function ProfileSetupScreen({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [hairLength, setHairLength] = useState('Short');
  const [selectedStyles, setSelectedStyles] = useState([]);
  const [selectedGoals, setSelectedGoals] = useState([]);
  
  // Style Quiz States
  const [isTrendy, setIsTrendy] = useState(true);
  const [isBold, setIsBold] = useState(false);
  const [colorInterest, setColorInterest] = useState(false);

  const toggleStyle = (style) => {
    if (selectedStyles.includes(style)) {
      setSelectedStyles(selectedStyles.filter(s => s !== style));
    } else {
      setSelectedStyles([...selectedStyles, style]);
    }
  };

  const toggleGoal = (goal) => {
    if (selectedGoals.includes(goal)) {
      setSelectedGoals(selectedGoals.filter(g => g !== goal));
    } else {
      setSelectedGoals([...selectedGoals, goal]);
    }
  };

  const handleSave = () => {
    // Save to global profile store or state
    navigation.replace('Main');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Profile Setup</Text>
      <Text style={styles.subtitle}>Customize your hair preferences</Text>

      <Text style={styles.label}>Full Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your name"
        placeholderTextColor={COLORS.textSecondary}
        value={fullName}
        onChangeText={setFullName}
      />

      <Text style={styles.label}>Age</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your age"
        placeholderTextColor={COLORS.textSecondary}
        value={age}
        onChangeText={setAge}
        keyboardType="numeric"
      />

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

      <Text style={styles.label}>Preferred Hair Length</Text>
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

      <Text style={styles.label}>Styles Interest</Text>
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

      <Text style={styles.label}>Hair Goals</Text>
      <View style={styles.chipRow}>
        {GOALS.map(g => {
          const active = selectedGoals.includes(g);
          return (
            <TouchableOpacity
              key={g}
              style={[styles.chip, active && styles.activeChip]}
              onPress={() => toggleGoal(g)}
            >
              <Text style={[styles.chipText, active && styles.activeChipText]}>{g}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.sectionTitle}>AI Style Quiz</Text>

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>{isTrendy ? 'Trendy Style Vibe' : 'Professional Style Vibe'}</Text>
        <Switch
          value={isTrendy}
          onValueChange={setIsTrendy}
          trackColor={{ false: COLORS.card, true: COLORS.primary }}
          thumbColor={COLORS.secondary}
        />
      </View>

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>{isBold ? 'Bold Looks' : 'Minimalist Looks'}</Text>
        <Switch
          value={isBold}
          onValueChange={setIsBold}
          trackColor={{ false: COLORS.card, true: COLORS.primary }}
          thumbColor={COLORS.secondary}
        />
      </View>

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Open to Hair Colors?</Text>
        <Switch
          value={colorInterest}
          onValueChange={setColorInterest}
          trackColor={{ false: COLORS.card, true: COLORS.primary }}
          thumbColor={COLORS.secondary}
        />
      </View>

      <TouchableOpacity style={styles.btn} onPress={handleSave}>
        <Text style={styles.btnText}>Save & Continue</Text>
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
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: 16,
    marginTop: 30,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 8,
  },
  input: {
    backgroundColor: COLORS.card,
    color: COLORS.textPrimary,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
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
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  switchLabel: {
    color: COLORS.textPrimary,
    fontSize: 15,
  },
  btn: {
    backgroundColor: COLORS.secondary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 30,
  },
  btnText: {
    color: COLORS.background,
    fontWeight: 'bold',
    fontSize: 16,
  },
});
