import React, { useState, useEffect, useRef } from 'react';
import {
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Animated,
  TextInput,
  ActivityIndicator,
} from 'react-native';
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
    <View className="flex-row flex-wrap gap-2.5 mb-2">
      {options.map((opt) => {
        const isSelected = selectedValue === opt;
        return (
          <TouchableOpacity
            key={opt}
            className={`py-2.5 px-4 rounded-[20px] border ${isSelected ? 'border-primary bg-accent' : 'border-border bg-card'}`}
            onPress={() => updateData({ [fieldName]: opt })}
          >
            <Text className={`text-sm ${isSelected ? 'text-primary font-semibold' : 'text-textSecondary'}`}>
              {opt}
            </Text>
          </TouchableOpacity>
        );
      })}
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
      <View className="flex-row flex-wrap gap-2.5 mb-2">
        {options.map((opt) => {
          const isSelected = selectedValues.includes(opt);
          return (
            <TouchableOpacity
              key={opt}
              className={`py-2.5 px-4 rounded-[20px] border ${isSelected ? 'border-primary bg-accent' : 'border-border bg-card'}`}
              onPress={() => toggleSelection(opt)}
            >
              <Text className={`text-sm ${isSelected ? 'text-primary font-semibold' : 'text-textSecondary'}`}>
                {opt}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderStep1 = () => (
    <View className="mt-4">
      <Text className="text-[28px] font-bold text-textPrimary mb-6">Basic Details</Text>

      <Text className="text-base text-textPrimary font-medium mt-4 mb-3">Gender *</Text>
      {renderSingleSelect(['Male', 'Female', 'Other'], data.gender, 'gender')}

      <Text className="text-base text-textPrimary font-medium mt-4 mb-3">Age *</Text>
      <TextInput
        className="bg-card border border-border rounded-xl text-textPrimary px-4 py-3.5 text-base"
        placeholder="Enter your age"
        placeholderTextColor="#666"
        keyboardType="numeric"
        value={data.age}
        onChangeText={(text) => updateData({ age: text })}
      />

      <Text className="text-base text-textPrimary font-medium mt-4 mb-3">Country</Text>
      <TextInput
        className="bg-card border border-border rounded-xl text-textPrimary px-4 py-3.5 text-base"
        placeholder="Enter your country"
        placeholderTextColor="#666"
        value={data.country}
        onChangeText={(text) => updateData({ country: text })}
      />
    </View>
  );

  const renderStep2 = () => (
    <View className="mt-4">
      <Text className="text-[28px] font-bold text-textPrimary mb-6">Hair Profile</Text>

      <Text className="text-base text-textPrimary font-medium mt-4 mb-3">Hair Length</Text>
      {renderSingleSelect(['Bald', 'Very Short', 'Short', 'Medium', 'Long'], data.hairLength, 'hairLength')}

      <Text className="text-base text-textPrimary font-medium mt-4 mb-3">Hair Type</Text>
      {renderSingleSelect(['Straight', 'Wavy', 'Curly', 'Coily'], data.hairType, 'hairType')}

      <Text className="text-base text-textPrimary font-medium mt-4 mb-3">Hair Color</Text>
      {renderSingleSelect(['Black', 'Brown', 'Blonde', 'Red', 'Grey', 'Other'], data.hairColor, 'hairColor')}
    </View>
  );

  const renderStep3 = () => (
    <View className="mt-4">
      <Text className="text-[28px] font-bold text-textPrimary mb-6">Hair Concerns</Text>
      <Text className="text-sm text-textSecondary mb-4 -mt-4">Select all that apply.</Text>
      {renderMultiSelect(
        ['Hair Fall', 'Thin Hair', 'Dandruff', 'Dry Hair', 'Oily Hair', 'Split Ends', 'None'],
        data.hairConcerns,
        'hairConcerns'
      )}
    </View>
  );

  const renderStep4 = () => (
    <View className="mt-4">
      <Text className="text-[28px] font-bold text-textPrimary mb-6">Style Preferences</Text>

      <Text className="text-base text-textPrimary font-medium mt-4 mb-3">Preferred Styles</Text>
      {renderMultiSelect(
        ['Korean', 'Professional', 'Trendy', 'Celebrity', 'Classic', 'Modern'],
        data.preferredStyles,
        'preferredStyles'
      )}

      <Text className="text-base text-textPrimary font-medium mt-4 mb-3">Goals</Text>
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
      <View className="mt-4">
        <Text className="text-[28px] font-bold text-textPrimary mb-6">Personalization</Text>

        <Text className="text-base text-textPrimary font-medium mt-4 mb-3">Beard Status</Text>
        {renderSingleSelect(['No Beard', 'Light Beard', 'Medium Beard', 'Full Beard'], data.beardStatus, 'beardStatus')}

        <Text className="text-base text-textPrimary font-medium mt-4 mb-3">Beard Preference</Text>
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
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-6 pt-6 pb-4">
        <Text className="text-primary text-sm font-semibold mb-2">
          Step {displayStep} of {displayTotal}
        </Text>
        <View className="h-1.5 bg-border rounded-full overflow-hidden">
          <Animated.View
            className="h-full bg-primary rounded-full"
            style={{
              width: progressAnim.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
            }}
          />
        </View>
      </View>

      <ScrollView contentContainerClassName="grow px-6 pb-10" keyboardShouldPersistTaps="handled">
        {renderCurrentStep()}
        {errorMsg ? <Text className="text-error mt-5 text-center text-sm">{errorMsg}</Text> : null}
      </ScrollView>

      <View className="flex-row px-6 py-5 border-t border-border gap-4">
        <TouchableOpacity
          className={`flex-1 py-4 rounded-xl items-center justify-center bg-transparent border border-border ${currentStep === 1 ? 'opacity-50' : ''}`}
          onPress={prevStep}
          disabled={currentStep === 1 || isSubmitting}
        >
          <Text className="text-textPrimary text-base font-semibold">Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-1 py-4 rounded-xl items-center justify-center bg-primary ${isSubmitting ? 'opacity-50' : ''}`}
          onPress={handleNext}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#000" size="small" />
          ) : (
            <Text className="text-white text-base font-bold">
              {currentStep === displayTotal ? 'Complete' : 'Next'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
