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
  StatusBar,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Image
} from 'react-native';
import { useAuthStore } from '../store/authStore';
import { useProfileSetupStore } from '../store/useProfileSetupStore';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COUNTRIES } from '../constants/countries';

const HAIR_LENGTH_AVATARS_MALE = {
  'Bald': require('../../assets/hair_bald.png'),
  'Very Short': require('../../assets/hair_very_short.png'),
  'Short': require('../../assets/hair_short.png'),
  'Medium': require('../../assets/hair_medium.png'),
  'Long': require('../../assets/hair_long.png'),
};

const HAIR_LENGTH_AVATARS_FEMALE = {
  'Bald': require('../../assets/hair_bald_female.png'),
  'Very Short': require('../../assets/hair_very_short_female.png'),
  'Short': require('../../assets/hair_short_female.png'),
  'Medium': require('../../assets/hair_medium_female.png'),
  'Long': require('../../assets/hair_long_female.png'),
};

const HAIR_LENGTH_LABELS = {
  'Bald': 'Bald',
  'Very Short': 'Very short',
  'Short': 'Short',
  'Medium': 'Medium',
  'Long': 'Long',
};

const HAIR_COLORS = [
  { name: 'Black', colors: ['#2B2B2B', '#0A0A0A'] },
  { name: 'Brown', colors: ['#A06A42', '#3E2511'] },
  { name: 'Blonde', colors: ['#EAD175', '#8E6F1D'] },
  { name: 'Red', colors: ['#C8501E', '#6C1B05'] },
  { name: 'Grey', colors: ['#A5ADB5', '#495057'] },
  { name: 'Other', colors: ['#A88DFE', '#3F2C80'] },
];

export default function ProfileCompletionScreen({ navigation }) {
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


  const [showCountryModal, setShowCountryModal] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [isAgeFocused, setIsAgeFocused] = useState(false);

  const getFilteredCountries = () => {
    if (!countrySearch) return COUNTRIES;
    const lowerSearch = countrySearch.toLowerCase();
    return COUNTRIES.filter(c => c.name.toLowerCase().includes(lowerSearch))
      .sort((a, b) => {
        // Prioritize countries that start with the search term
        const aStarts = a.name.toLowerCase().startsWith(lowerSearch);
        const bStarts = b.name.toLowerCase().startsWith(lowerSearch);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return a.name.localeCompare(b.name);
      });
  };

  const handleNext = async () => {
    setErrorMsg('');
    if (!isValidCurrentStep()) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    if (currentStep === totalSteps || (currentStep === 4 && data.gender === 'Female')) {
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
        if (result.success) {
          useProfileSetupStore.getState().reset();
          if (navigation && navigation.canGoBack()) {
            navigation.goBack();
          }
        } else {
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
    <View className="flex-row flex-wrap gap-3 mb-2">
      {options.map((opt) => {
        const isSelected = selectedValue === opt;
        return (
          <TouchableOpacity
            key={opt}
            className={`py-3 px-5 rounded-[20px] border ${isSelected ? 'border-[#8A4FFF] bg-[#2A243D]' : 'border-[#3C3454] bg-[#221D33]'}`}
            onPress={() => updateData({ [fieldName]: opt })}
          >
            <Text className={`text-sm ${isSelected ? 'text-[#8A4FFF] font-semibold' : 'text-[#A19DB4]'}`}>
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
      <View className="flex-row flex-wrap gap-3 mb-2">
        {options.map((opt) => {
          const isSelected = selectedValues.includes(opt);
          return (
            <TouchableOpacity
              key={opt}
              className={`py-3 px-5 rounded-[20px] border ${isSelected ? 'border-[#8A4FFF] bg-[#2A243D]' : 'border-[#3C3454] bg-[#221D33]'}`}
              onPress={() => toggleSelection(opt)}
            >
              <Text className={`text-sm ${isSelected ? 'text-[#8A4FFF] font-semibold' : 'text-[#A19DB4]'}`}>
                {opt}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderStep1 = () => {
    const selectedCountryObj = COUNTRIES.find(c => c.name === data.country);
    const countryCode = selectedCountryObj ? selectedCountryObj.code.toLowerCase() : null;

    return (
      <View className="mt-2">
        <Text className="text-white text-base font-medium mb-3">Gender</Text>
        <View className="flex-row gap-4 mb-6">
          {['Male', 'Female'].map((opt) => {
            const isSelected = data.gender === opt;
            return (
              <TouchableOpacity
                key={opt}
                onPress={() => updateData({ gender: opt })}
                className={`flex-1 rounded-[24px] py-6 border items-center justify-center ${isSelected ? 'border-[#8A4FFF] bg-[#2A243D]' : 'border-[#3C3454] bg-[#221D33]'}`}
              >
                <Ionicons 
                  name={opt === 'Male' ? 'male' : 'female'} 
                  size={28} 
                  color={isSelected ? '#8A4FFF' : '#A19DB4'} 
                  style={{ marginBottom: 8 }}
                />
                <Text className={`text-sm ${isSelected ? 'text-[#8A4FFF]' : 'text-[#A19DB4]'}`}>
                  {opt}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text className="text-white text-base font-medium mb-3">Age</Text>
        <View className="relative mb-6">
          <TextInput
            className={`bg-[#221D33] border rounded-2xl text-white px-5 py-4 text-base ${
              isAgeFocused ? 'border-[#8A4FFF]' : 'border-[#3C3454]'
            }`}
            placeholder="Enter your age"
            placeholderTextColor="#A19DB4"
            keyboardType="numeric"
            value={data.age}
            onChangeText={(text) => updateData({ age: text })}
            onFocus={() => setIsAgeFocused(true)}
            onBlur={() => setIsAgeFocused(false)}
            style={{ outline: 'none' }}
          />
        </View>

        <Text className="text-white text-base font-medium mb-3">Country</Text>
        <TouchableOpacity 
          className="relative mb-6"
          onPress={() => {
            setCountrySearch('');
            setShowCountryModal(true);
          }}
        >
          <View className="bg-[#221D33] border border-[#3C3454] rounded-2xl py-4 px-5 flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              {countryCode ? (
                <Image 
                  source={{ uri: `https://flagcdn.com/w160/${countryCode}.png` }} 
                  style={{ width: 24, height: 16, borderRadius: 2, marginRight: 12 }} 
                />
              ) : (
                <Ionicons name="globe-outline" size={20} color="#A19DB4" style={{ marginRight: 12 }} />
              )}
              <Text className={data.country ? "text-white text-base flex-1" : "text-[#A19DB4] text-base flex-1"} numberOfLines={1}>
                {data.country || "Select country"}
              </Text>
            </View>
            <Ionicons name="chevron-down" size={20} color="#A19DB4" />
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderHairLengthSelect = () => {
    const options = ['Bald', 'Very Short', 'Short', 'Medium', 'Long'];
    const avatars = data.gender === 'Female' ? HAIR_LENGTH_AVATARS_FEMALE : HAIR_LENGTH_AVATARS_MALE;
    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={{ flexDirection: 'row', gap: 12, paddingVertical: 4 }}
        className="mb-4"
      >
        {options.map((opt) => {
          const isSelected = data.hairLength === opt;
          return (
            <View key={opt} className="items-center">
              <TouchableOpacity
                className={`w-[78px] h-[98px] rounded-[20px] border overflow-hidden justify-center items-center ${
                  isSelected ? 'border-[#8A4FFF] bg-[#2A243D]/50' : 'border-[#3C3454] bg-[#221D33]/40'
                }`}
                onPress={() => updateData({ hairLength: opt })}
              >
                <Image 
                  source={avatars[opt]} 
                  style={{ width: '100%', height: '100%', borderRadius: 19 }}
                  resizeMode="cover"
                />
              </TouchableOpacity>
              <Text className={`text-xs mt-2 ${isSelected ? 'text-white font-medium' : 'text-[#A19DB4]'}`}>
                {HAIR_LENGTH_LABELS[opt]}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    );
  };

  const renderHairTypeSelect = () => {
    const options = ['Straight', 'Wavy', 'Curly', 'Coily'];
    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ flexDirection: 'row', gap: 10, paddingVertical: 4 }}
        className="mb-4"
      >
        {options.map((opt) => {
          const isSelected = data.hairType === opt;
          return (
            <TouchableOpacity
              key={opt}
              className={`py-3 px-6 rounded-full border ${
                isSelected ? 'border-[#8A4FFF] bg-[#2A243D]/60' : 'border-[#3C3454] bg-[#221D33]/40'
              }`}
              onPress={() => updateData({ hairType: opt })}
            >
              <Text className={`text-sm ${isSelected ? 'text-white font-semibold' : 'text-[#A19DB4]'}`}>
                {opt}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    );
  };

  const renderHairColorSelect = () => {
    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ flexDirection: 'row', gap: 12, paddingVertical: 4 }}
        className="mb-2"
      >
        {HAIR_COLORS.map((item) => {
          const isSelected = data.hairColor === item.name;
          return (
            <View key={item.name} className="items-center">
              <TouchableOpacity
                className={`rounded-full justify-center items-center ${
                  isSelected ? 'border-2 border-[#8A4FFF] p-[3px]' : 'border-2 border-transparent p-[3px]'
                }`}
                onPress={() => updateData({ hairColor: item.name })}
              >
                <LinearGradient
                  colors={item.colors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ width: 46, height: 46, borderRadius: 23 }}
                />
              </TouchableOpacity>
              <Text className={`text-xs mt-2 ${isSelected ? 'text-white font-medium' : 'text-[#A19DB4]'}`}>
                {item.name}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    );
  };

  const renderStep2 = () => (
    <View className="mt-2">
      <Text className="text-white text-base font-medium mt-4 mb-3">Hair Length</Text>
      {renderHairLengthSelect()}

      <Text className="text-white text-base font-medium mt-6 mb-3">Hair Type</Text>
      {renderHairTypeSelect()}

      <Text className="text-white text-base font-medium mt-6 mb-3">Hair Colour</Text>
      {renderHairColorSelect()}
    </View>
  );

  const renderStep3 = () => (
    <View className="mt-2">
      <Text className="text-white text-base font-medium mt-4 mb-3">Select your main concerns</Text>
      {renderMultiSelect(
        ['Hair Fall', 'Thin Hair', 'Dandruff', 'Dry Hair', 'Oily Hair', 'Split Ends', 'None'],
        data.hairConcerns,
        'hairConcerns'
      )}
    </View>
  );

  const renderStep4 = () => (
    <View className="mt-2">
      <Text className="text-white text-base font-medium mt-4 mb-3">Preferred Styles</Text>
      {renderMultiSelect(
        ['Korean', 'Professional', 'Trendy', 'Celebrity', 'Classic', 'Modern'],
        data.preferredStyles,
        'preferredStyles'
      )}

      <Text className="text-white text-base font-medium mt-6 mb-3">Goals</Text>
      {renderMultiSelect(
        ['Professional Look', 'Improve Appearance', 'Trendy Look', 'Hair Growth Journey', 'Experiment Styles'],
        data.goals,
        'goals'
      )}
    </View>
  );

  const renderStep5 = () => {
    if (data.gender === 'Female') return null;
    return (
      <View className="mt-2">
        <Text className="text-white text-base font-medium mt-4 mb-3">Beard Status</Text>
        {renderSingleSelect(['No Beard', 'Light Beard', 'Medium Beard', 'Full Beard'], data.beardStatus, 'beardStatus')}

        <Text className="text-white text-base font-medium mt-6 mb-3">Beard Preference</Text>
        {renderSingleSelect(['Clean Shave', 'Stubble', 'Short Beard', 'Full Beard'], data.beardPreference, 'beardPreference')}
      </View>
    );
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      default: return renderStep1();
    }
  };

  const displayStep = currentStep === 5 && data.gender === 'Female' ? 4 : currentStep;
  const displayTotal = data.gender === 'Female' ? 4 : totalSteps;

  const getStepTitles = () => {
    switch(currentStep) {
      case 1: return { title: 'Basic Information', subtitle: 'Tell us a bit about yourself.' };
      case 2: return { title: 'Hair Profile', subtitle: 'Help us understand your hair type.' };
      case 3: return { title: 'Hair Concerns', subtitle: 'What are your main hair concerns?' };
      case 4: return { title: 'Style Preferences', subtitle: 'What kind of styles do you prefer?' };
      case 5: return { title: 'Personalization', subtitle: 'A few more details to customize your experience.' };
      default: return { title: 'Basic Information', subtitle: 'Tell us a bit about yourself.' };
    }
  };

  const { title, subtitle } = getStepTitles();



  const renderCountryModal = () => (
    <Modal visible={showCountryModal} transparent animationType="slide">
      <View className="flex-1 justify-end bg-black/60">
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
          className="bg-[#1A162B] border-t border-l border-r border-[#3C3454] rounded-t-[32px] h-4/5 p-6"
        >
          <View className="w-12 h-1.5 bg-[#3C3454] rounded-full mx-auto mb-6" />
          
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-white text-2xl font-bold">Select Country</Text>
            <TouchableOpacity onPress={() => setShowCountryModal(false)}>
              <Ionicons name="close" size={28} color="#A19DB4" />
            </TouchableOpacity>
          </View>
          
          <View className="bg-[#221D33] border border-[#3C3454] rounded-2xl flex-row items-center px-4 py-3.5 mb-6">
            <Ionicons name="search" size={20} color="#A19DB4" />
            <TextInput
              className="flex-1 ml-3 text-white text-base"
              placeholder="Search country..."
              placeholderTextColor="#A19DB4"
              value={countrySearch}
              onChangeText={setCountrySearch}
              autoCapitalize="words"
            />
          </View>

          <FlatList
            data={getFilteredCountries()}
            keyExtractor={(item) => item.name}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => {
              const isSelected = data.country === item.name;
              const itemCode = item.code.toLowerCase();
              return (
                <TouchableOpacity
                  className={`flex-row items-center p-4 rounded-2xl mb-3 border ${
                    isSelected 
                      ? 'border-[#8A4FFF] bg-[#2A243D]' 
                      : 'border-[#2F2B43] bg-[#1C182F]'
                  }`}
                  onPress={() => {
                    updateData({ country: item.name });
                    setShowCountryModal(false);
                    setCountrySearch('');
                  }}
                >
                  <Image 
                    source={{ uri: `https://flagcdn.com/w160/${itemCode}.png` }} 
                    style={{ width: 30, height: 20, borderRadius: 3, marginRight: 16 }} 
                  />
                  <Text className={`text-base ${isSelected ? 'text-[#8A4FFF] font-bold' : 'text-white'}`}>
                    {item.name}
                  </Text>
                  {isSelected && (
                    <View className="ml-auto">
                      <Ionicons name="checkmark-circle" size={22} color="#8A4FFF" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            }}
            showsVerticalScrollIndicator={false}
          />
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#0D0914' }}>
      <LinearGradient colors={['#1F163D', '#0B0A16']} style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }}>
          <StatusBar barStyle="light-content" />
          
          {/* Header */}
          <View className="px-6 pt-4 pb-2">
            <TouchableOpacity 
              onPress={() => {
                if (currentStep > 1) {
                  prevStep();
                } else if (navigation && navigation.canGoBack()) {
                  navigation.goBack();
                }
              }} 
              className="mb-6 w-10"
            >
              <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
            </TouchableOpacity>
            
            <View className="items-center mb-8">
              <Text className="text-white text-3xl font-bold mb-2">{title}</Text>
              <Text className="text-[#A19DB4] text-sm">{subtitle}</Text>
            </View>
            
            {/* Progress Bar */}
            <View className="flex-row items-center justify-between w-[80%] mx-auto mb-8">
              {[...Array(displayTotal)].map((_, idx) => {
                const step = idx + 1;
                return (
                  <React.Fragment key={step}>
                    <View className={`w-[18px] h-[18px] rounded-full ${step <= displayStep ? 'bg-[#8A4FFF]' : 'bg-[#2F2B43]'}`} />
                    {idx < displayTotal - 1 && (
                      <View className={`flex-1 h-[4px] ${step < displayStep ? 'bg-[#8A4FFF]' : 'bg-[#2F2B43]'}`} />
                    )}
                  </React.Fragment>
                );
              })}
            </View>
          </View>

          {/* Form Container (Floating Card wrapper) */}
          <View className="flex-1 mx-6 mb-8 bg-[#1D1933]/90 border border-[#3C3454] rounded-[32px] p-6 justify-between shadow-2xl">
            <ScrollView 
              showsVerticalScrollIndicator={false} 
              contentContainerStyle={{ flexGrow: 1 }} 
              keyboardShouldPersistTaps="handled"
            >
              <View className="flex-1 justify-center">
                {renderCurrentStep()}
                {errorMsg ? <Text className="text-red-500 mt-5 text-center text-sm">{errorMsg}</Text> : null}
              </View>
            </ScrollView>
            
            {/* Button inside the Card Container */}
            <View className="mt-6">
              <TouchableOpacity
                className="rounded-2xl overflow-hidden shadow-lg"
                onPress={handleNext}
                disabled={isSubmitting}
              >
                <LinearGradient 
                  colors={['#8A4FFF', '#5865F2']} 
                  start={{ x: 0, y: 0 }} 
                  end={{ x: 1, y: 1 }}
                  className="py-4 items-center justify-center"
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#FFF" size="small" />
                  ) : (
                    <Text className="text-white text-base font-bold">
                      {currentStep === displayTotal ? 'Complete' : 'Continue'}
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          {/* Modals */}

          {renderCountryModal()}
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}
