import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Animated,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { COLORS } from '../constants/theme';
import { useAuthStore } from '../store/authStore';
import { useProfileSetupStore } from '../store/useProfileSetupStore';

const PROGRESS_BAR_WIDTH = 100; // Represented as percentage

export default function ProfileCompletionScreen() {
  const { user, completeProfile } = useAuthStore();
  const {
    data,
    currentStep,
    totalSteps,
    updateData,
    nextStep,
    prevStep,
    isValidCurrentStep,
  } = useProfileSetupStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Animation for progress bar
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: (currentStep / totalSteps) * 100,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentStep, totalSteps]);

  const handleNext = async () => {
    setErrorMsg('');
    if (!isValidCurrentStep()) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    if (currentStep === totalSteps || (currentStep === 4 && data.gender === 'Female')) {
      // Submit data
      setIsSubmitting(true);
      try {
        const payload = {
          gender: data.gender,
          age: data.age,
          country: data.country,
          hairLength: data.hairLength,
          hairType: data.hairType,
          hairColor: data.hairColor,
          hairConcerns: data.hairConcerns,
          preferredStyles: data.preferredStyles,
          goals: data.goals,
          beardStatus: data.gender === 'Male' ? data.beardStatus : null,
          beardPreference: data.gender === 'Male' ? data.beardPreference : null,
        };
        const result = await completeProfile(payload);
        if (!result.success) {
          setErrorMsg(result.error || 'Failed to complete profile.');
        }
      } catch (error) {
        setErrorMsg('An unexpected error occurred.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      nextStep();
    }
  };

  const renderSingleSelect = (options, selectedValue, fieldName) => (
    <View style={styles.optionsContainer}>
      {options.map((opt) => (
        <TouchableOpacity
          key={opt}
          style={[
            styles.optionButton,
            selectedValue === opt && styles.optionButtonSelected,
          ]}
          onPress={() => updateData({ [fieldName]: opt })}
        >
          <Text
            style={[
              styles.optionText,
              selectedValue === opt && styles.optionTextSelected,
            ]}
          >
            {opt}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderMultiSelect = (options, selectedValues, fieldName) => {
    const toggleSelection = (opt) => {
      if (opt === 'None') {
        updateData({ [fieldName]: ['None'] });
        return;
      }
      
      let newValues = [...selectedValues];
      if (newValues.includes('None')) {
        newValues = newValues.filter((v) => v !== 'None');
      }

      if (newValues.includes(opt)) {
        newValues = newValues.filter((v) => v !== opt);
      } else {
        newValues.push(opt);
      }
      updateData({ [fieldName]: newValues });
    };

    return (
      <View style={styles.optionsContainer}>
        {options.map((opt) => {
          const isSelected = selectedValues.includes(opt);
          return (
            <TouchableOpacity
              key={opt}
              style={[
                styles.optionButton,
                isSelected && styles.optionButtonSelected,
              ]}
              onPress={() => toggleSelection(opt)}
            >
              <Text
                style={[
                  styles.optionText,
                  isSelected && styles.optionTextSelected,
                ]}
              >
                {opt}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Basic Details</Text>

      <Text style={styles.inputLabel}>Gender *</Text>
      {renderSingleSelect(['Male', 'Female', 'Other'], data.gender, 'gender')}

      <Text style={styles.inputLabel}>Age *</Text>
      <TextInput
        style={styles.textInput}
        placeholder="Enter your age"
        placeholderTextColor="#666"
        keyboardType="numeric"
        value={data.age}
        onChangeText={(text) => updateData({ age: text })}
      />

      <Text style={styles.inputLabel}>Country</Text>
      <TextInput
        style={styles.textInput}
        placeholder="Enter your country"
        placeholderTextColor="#666"
        value={data.country}
        onChangeText={(text) => updateData({ country: text })}
      />
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Hair Profile</Text>

      <Text style={styles.inputLabel}>Hair Length</Text>
      {renderSingleSelect(['Bald', 'Very Short', 'Short', 'Medium', 'Long'], data.hairLength, 'hairLength')}

      <Text style={styles.inputLabel}>Hair Type</Text>
      {renderSingleSelect(['Straight', 'Wavy', 'Curly', 'Coily'], data.hairType, 'hairType')}

      <Text style={styles.inputLabel}>Hair Color</Text>
      {renderSingleSelect(['Black', 'Brown', 'Blonde', 'Red', 'Grey', 'Other'], data.hairColor, 'hairColor')}
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Hair Concerns</Text>
      <Text style={styles.inputDescription}>Select all that apply.</Text>
      {renderMultiSelect(
        ['Hair Fall', 'Thin Hair', 'Dandruff', 'Dry Hair', 'Oily Hair', 'Split Ends', 'None'],
        data.hairConcerns,
        'hairConcerns'
      )}
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Style Preferences</Text>

      <Text style={styles.inputLabel}>Preferred Styles</Text>
      {renderMultiSelect(
        ['Korean', 'Professional', 'Trendy', 'Celebrity', 'Classic', 'Modern'],
        data.preferredStyles,
        'preferredStyles'
      )}

      <Text style={styles.inputLabel}>Goals</Text>
      {renderMultiSelect(
        ['Professional Look', 'Improve Appearance', 'Trendy Look', 'Hair Growth Journey', 'Experiment Styles'],
        data.goals,
        'goals'
      )}
    </View>
  );

  const renderStep5 = () => {
    if (data.gender === 'Female') return null; // Should be skipped in nextStep anyway
    return (
      <View style={styles.stepContent}>
        <Text style={styles.stepTitle}>Personalization</Text>

        <Text style={styles.inputLabel}>Beard Status</Text>
        {renderSingleSelect(['No Beard', 'Light Beard', 'Medium Beard', 'Full Beard'], data.beardStatus, 'beardStatus')}

        <Text style={styles.inputLabel}>Beard Preference</Text>
        {renderSingleSelect(['Clean Shave', 'Stubble', 'Short Beard', 'Full Beard'], data.beardPreference, 'beardPreference')}
      </View>
    );
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      case 5:
        return renderStep5();
      default:
        return renderStep1();
    }
  };

  const displayStep = currentStep === 5 && data.gender === 'Female' ? 4 : currentStep;
  const displayTotal = data.gender === 'Female' ? 4 : totalSteps;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.stepIndicator}>
          Step {displayStep} of {displayTotal}
        </Text>
        <View style={styles.progressBarContainer}>
          <Animated.View
            style={[
              styles.progressBarFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {renderCurrentStep()}
        {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.footerButton, styles.backButton, currentStep === 1 && styles.disabledButton]}
          onPress={prevStep}
          disabled={currentStep === 1 || isSubmitting}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.footerButton, styles.nextButton, isSubmitting && styles.disabledButton]}
          onPress={handleNext}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#000" size="small" />
          ) : (
            <Text style={styles.nextButtonText}>
              {currentStep === displayTotal ? 'Complete' : 'Next'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  stepIndicator: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  stepContent: {
    marginTop: 16,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: '500',
    marginTop: 16,
    marginBottom: 12,
  },
  inputDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 16,
    marginTop: -16,
  },
  textInput: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    color: COLORS.textPrimary,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 8,
  },
  optionButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  optionButtonSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.accent,
  },
  optionText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  optionTextSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 16,
  },
  footerButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  backButtonText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: COLORS.primary,
  },
  nextButtonText: {
    color: '#ffffff', // primary is dark, text should be white
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.5,
  },
  errorText: {
    color: COLORS.error,
    marginTop: 20,
    textAlign: 'center',
    fontSize: 14,
  },
});
