import React, { useState, useEffect, useRef } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  StatusBar,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Image,
  StyleSheet,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/authStore';
import { useProfileSetupStore } from '../store/useProfileSetupStore';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COUNTRIES } from '../constants/countries';
import Svg, { Path, Circle, Line } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

// Gender SVGs removed in favor of premium Ionicons

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

const HAIR_COLOR_ASSETS = {
  'Black': require('../../assets/color_black.png'),
  'Brown': require('../../assets/color_brown.png'),
  'Blonde': require('../../assets/color_blonde.png'),
  'Red': require('../../assets/color_red.png'),
  'Grey': require('../../assets/color_grey.png'),
  'Other': require('../../assets/color_other.png'),
};

const BEARD_AVATARS = {
  'No Beard': require('../../assets/beard_none.png'),
  'Clean Shave': require('../../assets/beard_none.png'),
  'Light Beard': require('../../assets/beard_light.png'),
  'Stubble': require('../../assets/beard_light.png'),
  'Medium Beard': require('../../assets/beard_medium.png'),
  'Short Beard': require('../../assets/beard_medium.png'),
  'Full Beard': require('../../assets/beard_full.png'),
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
  { name: 'Other', colors: ['#6D28D9', '#C4B5FD'] },
];

const ConcernIcon = ({ name, color }) => {
  let iconName = 'help-circle-outline';
  
  switch (name) {
    case 'Hair Loss':
      iconName = 'trending-down-outline';
      break;
    case 'Dandruff':
      iconName = 'snow-outline';
      break;
    case 'Dull Hair':
      iconName = 'moon-outline';
      break;
    case 'Frizzy Hair':
      iconName = 'flash-outline';
      break;
    case 'Split Ends':
      iconName = 'git-branch-outline';
      break;
    case 'Breakage':
      iconName = 'cut-outline';
      break;
    case 'Oily Scalp':
      iconName = 'water-outline';
      break;
    case 'Heat Damage':
      iconName = 'flame-outline';
      break;
    default:
      iconName = 'help-circle-outline';
  }
  
  return <Ionicons name={iconName} size={20} color={color} />;
};

export default function ProfileCompletionScreen({ route, navigation }) {
  const signUpData = route.params?.signUpData;
  const { user, completeProfile, registerWithProfile } = useAuthStore();
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

  // Scroll View Refs
  const hairLengthScrollRef = useRef(null);
  const hairColorScrollRef = useRef(null);
  const beardStatusScrollRef = useRef(null);
  const beardPreferenceScrollRef = useRef(null);

  // Scroll Offset States
  const [hairLengthOffset, setHairLengthOffset] = useState(0);
  const [hairColorOffset, setHairColorOffset] = useState(0);
  const [beardStatusOffset, setBeardStatusOffset] = useState(0);
  const [beardPreferenceOffset, setBeardPreferenceOffset] = useState(0);

  // Scroll Event Handlers
  const handleHairLengthScroll = (event) => {
    setHairLengthOffset(event.nativeEvent.contentOffset.x);
  };

  const handleHairColorScroll = (event) => {
    setHairColorOffset(event.nativeEvent.contentOffset.x);
  };

  const handleBeardStatusScroll = (event) => {
    setBeardStatusOffset(event.nativeEvent.contentOffset.x);
  };

  const handleBeardPreferenceScroll = (event) => {
    setBeardPreferenceOffset(event.nativeEvent.contentOffset.x);
  };

  // Scroll Trigger Actions
  const scrollHairLength = (direction) => {
    const targetX = direction === 'left' 
      ? Math.max(0, hairLengthOffset - 120) 
      : hairLengthOffset + 120;
    hairLengthScrollRef.current?.scrollTo({ x: targetX, animated: true });
  };

  const scrollHairColor = (direction) => {
    const targetX = direction === 'left' 
      ? Math.max(0, hairColorOffset - 120) 
      : hairColorOffset + 120;
    hairColorScrollRef.current?.scrollTo({ x: targetX, animated: true });
  };

  const scrollBeardStatus = (direction) => {
    const targetX = direction === 'left' 
      ? Math.max(0, beardStatusOffset - 120) 
      : beardStatusOffset + 120;
    beardStatusScrollRef.current?.scrollTo({ x: targetX, animated: true });
  };

  const scrollBeardPreference = (direction) => {
    const targetX = direction === 'left' 
      ? Math.max(0, beardPreferenceOffset - 120) 
      : beardPreferenceOffset + 120;
    beardPreferenceScrollRef.current?.scrollTo({ x: targetX, animated: true });
  };

  const getFilteredCountries = () => {
    if (!countrySearch) return COUNTRIES;
    const lowerSearch = countrySearch.toLowerCase();
    return COUNTRIES.filter(c => c.name.toLowerCase().includes(lowerSearch))
      .sort((a, b) => {
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
        
        let result;
        if (signUpData) {
          result = await registerWithProfile(
            signUpData.email,
            signUpData.password,
            signUpData.username,
            payload
          );
        } else {
          result = await completeProfile(payload);
        }

        if (result.success) {
          useProfileSetupStore.getState().reset();
          // No goBack() call to let AuthState conditional rendering in AppNavigator handle navigation
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
    <View className="flex-row flex-wrap gap-2.5 mb-2">
      {options.map((opt) => {
        const isSelected = selectedValue === opt;
        return (
          <TouchableOpacity
            key={opt}
            className={`py-3 px-5 rounded-[20px] border ${isSelected ? 'border-[#6D28D9] bg-[#F3E8FF]' : 'border-[#E5E7EB] bg-white'}`}
            onPress={() => updateData({ [fieldName]: opt })}
            activeOpacity={0.7}
          >
            <Text className={`text-sm font-Poppins-Medium ${isSelected ? 'text-[#6D28D9]' : 'text-[#4B5563]'}`}>
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
              className={`py-3 px-5 rounded-[20px] border ${isSelected ? 'border-[#6D28D9] bg-[#F3E8FF]' : 'border-[#E5E7EB] bg-white'}`}
              onPress={() => toggleSelection(opt)}
              activeOpacity={0.7}
            >
              <Text className={`text-sm font-Poppins-Medium ${isSelected ? 'text-[#6D28D9]' : 'text-[#4B5563]'}`}>
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
        <Text className="text-[#1F2937] text-base font-Poppins-Medium mb-3.5">Gender</Text>
        <View className="flex-row gap-4 mb-8">
          {['Male', 'Female'].map((opt) => {
            const isSelected = data.gender === opt;
            return (
              <TouchableOpacity
                key={opt}
                onPress={() => updateData({ gender: opt })}
                className={`flex-1 rounded-[24px] py-7 border items-center justify-center ${
                  isSelected ? 'border-[#6D28D9] bg-[#F5F3FF]' : 'border-[#E5E7EB] bg-white'
                }`}
                style={{
                  shadowColor: isSelected ? '#6D28D9' : 'transparent',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: isSelected ? 0.12 : 0,
                  shadowRadius: 10,
                  elevation: isSelected ? 2 : 0,
                }}
                activeOpacity={0.7}
              >
                <View className="mb-3">
                  <View className={`w-16 h-16 rounded-full items-center justify-center ${
                    isSelected 
                      ? opt === 'Male' ? 'bg-[#EEF2FF]' : 'bg-[#FDF2F8]' 
                      : 'bg-[#F9FAFB]'
                  }`}>
                    <Ionicons 
                      name={opt === 'Male' ? 'male' : 'female'} 
                      size={32} 
                      color={isSelected ? (opt === 'Male' ? '#4F46E5' : '#EC4899') : '#9CA3AF'} 
                    />
                  </View>
                </View>
                <Text className={`text-[15px] font-Poppins-Bold ${isSelected ? 'text-[#6D28D9]' : 'text-[#4B5563]'}`}>
                  {opt}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text className="text-[#1F2937] text-base font-Poppins-Medium mb-3.5">Age</Text>
        <View className="relative mb-8">
          <TextInput
            className={`bg-white border rounded-2xl text-[#1F2937] px-6 py-4 text-base font-Poppins ${
              isAgeFocused ? 'border-[#6D28D9]' : 'border-[#E5E7EB]'
            }`}
            style={{
              shadowColor: isAgeFocused ? '#6D28D9' : 'transparent',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: isAgeFocused ? 0.08 : 0,
              shadowRadius: 8,
              elevation: isAgeFocused ? 1 : 0,
            }}
            placeholder="Enter your age"
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
            value={data.age}
            onChangeText={(text) => updateData({ age: text })}
            onFocus={() => setIsAgeFocused(true)}
            onBlur={() => setIsAgeFocused(false)}
          />
        </View>

        <Text className="text-[#1F2937] text-base font-Poppins-Medium mb-3.5">Country</Text>
        <TouchableOpacity 
          className="relative mb-8"
          onPress={() => {
            setCountrySearch('');
            setShowCountryModal(true);
          }}
          activeOpacity={0.7}
        >
          <View className="bg-white border border-[#E5E7EB] rounded-2xl py-4 px-6 flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              {countryCode ? (
                <Image 
                  source={{ uri: `https://flagcdn.com/w160/${countryCode}.png` }} 
                  style={{ width: 26, height: 18, borderRadius: 2, marginRight: 12 }} 
                />
              ) : (
                <Ionicons name="globe-outline" size={22} color="#9CA3AF" style={{ marginRight: 12 }} />
              )}
              <Text className="text-[#1F2937] text-base font-Poppins flex-1" numberOfLines={1}>
                {data.country || "Select country"}
              </Text>
            </View>
            <Ionicons name="chevron-down" size={22} color="#9CA3AF" />
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderHairLengthSelect = () => {
    const options = ['Bald', 'Very Short', 'Short', 'Medium', 'Long'];
    const avatars = data.gender === 'Female' ? HAIR_LENGTH_AVATARS_FEMALE : HAIR_LENGTH_AVATARS_MALE;
    return (
      <View className="relative flex-row items-center mb-4">
        <TouchableOpacity 
          onPress={() => scrollHairLength('left')}
          className="absolute left-0 z-10 w-8 h-8 rounded-full bg-white/80 border border-[#E5E7EB] items-center justify-center shadow-sm"
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={18} color="#6D28D9" />
        </TouchableOpacity>

        <ScrollView 
          ref={hairLengthScrollRef}
          horizontal 
          showsHorizontalScrollIndicator={false} 
          onScroll={handleHairLengthScroll}
          scrollEventThrottle={16}
          contentContainerStyle={{ flexDirection: 'row', gap: 12, paddingHorizontal: 32, paddingVertical: 4 }}
        >
          {options.map((opt) => {
            const isSelected = data.hairLength === opt;
            return (
              <View key={opt} className="items-center">
                <TouchableOpacity
                  className={`w-[78px] h-[98px] rounded-[20px] border overflow-hidden justify-center items-center ${
                    isSelected ? 'border-[#6D28D9] p-[2px]' : 'border-[#E5E7EB] bg-white'
                  }`}
                  onPress={() => updateData({ hairLength: opt })}
                  activeOpacity={0.7}
                >
                  <Image 
                    source={avatars[opt]} 
                    style={{ width: '100%', height: '100%', borderRadius: 18 }}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
                <Text className={`text-[11px] mt-2 font-Poppins-Medium ${isSelected ? 'text-[#6D28D9]' : 'text-[#4B5563]'}`}>
                  {HAIR_LENGTH_LABELS[opt]}
                </Text>
              </View>
            );
          })}
        </ScrollView>

        <TouchableOpacity 
          onPress={() => scrollHairLength('right')}
          className="absolute right-0 z-10 w-8 h-8 rounded-full bg-white/80 border border-[#E5E7EB] items-center justify-center shadow-sm"
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-forward" size={18} color="#6D28D9" />
        </TouchableOpacity>
      </View>
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
              className={`py-2.5 px-5 rounded-full border ${
                isSelected ? 'border-[#6D28D9] bg-[#F3E8FF]' : 'border-[#E5E7EB] bg-white'
              }`}
              onPress={() => updateData({ hairType: opt })}
              activeOpacity={0.7}
            >
              <Text className={`text-[12px] font-Poppins-Medium ${isSelected ? 'text-[#6D28D9]' : 'text-[#4B5563]'}`}>
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
      <View className="relative flex-row items-center mb-2">
        <TouchableOpacity 
          onPress={() => scrollHairColor('left')}
          className="absolute left-0 z-10 w-8 h-8 rounded-full bg-white/80 border border-[#E5E7EB] items-center justify-center shadow-sm"
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={18} color="#6D28D9" />
        </TouchableOpacity>

        <ScrollView 
          ref={hairColorScrollRef}
          horizontal 
          showsHorizontalScrollIndicator={false}
          onScroll={handleHairColorScroll}
          scrollEventThrottle={16}
          contentContainerStyle={{ flexDirection: 'row', gap: 12, paddingHorizontal: 32, paddingVertical: 4 }}
        >
          {HAIR_COLORS.map((item) => {
            const isSelected = data.hairColor === item.name;
            return (
              <View key={item.name} className="items-center">
                <TouchableOpacity
                  className={`rounded-full justify-center items-center ${
                    isSelected ? 'border-2 border-[#6D28D9] p-[3px]' : 'border-2 border-transparent p-[3px]'
                  }`}
                  onPress={() => updateData({ hairColor: item.name })}
                  activeOpacity={0.7}
                >
                  <Image 
                    source={HAIR_COLOR_ASSETS[item.name]} 
                    style={{ width: 44, height: 44, borderRadius: 22 }}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
                <Text className={`text-[11px] mt-1.5 font-Poppins-Medium ${isSelected ? 'text-[#6D28D9]' : 'text-[#4B5563]'}`}>
                  {item.name}
                </Text>
              </View>
            );
          })}
        </ScrollView>

        <TouchableOpacity 
          onPress={() => scrollHairColor('right')}
          className="absolute right-0 z-10 w-8 h-8 rounded-full bg-white/80 border border-[#E5E7EB] items-center justify-center shadow-sm"
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-forward" size={18} color="#6D28D9" />
        </TouchableOpacity>
      </View>
    );
  };

  const renderStep2 = () => (
    <View className="mt-2">
      <Text className="text-[#1F2937] text-[15px] font-Poppins-Medium mt-2 mb-3">Hair Length</Text>
      {renderHairLengthSelect()}

      <Text className="text-[#1F2937] text-[15px] font-Poppins-Medium mt-4 mb-3">Hair Type</Text>
      {renderHairTypeSelect()}

      <Text className="text-[#1F2937] text-[15px] font-Poppins-Medium mt-4 mb-3">Hair Colour</Text>
      {renderHairColorSelect()}
    </View>
  );

  const renderStep3 = () => {
    const concerns = [
      { name: 'Hair Loss', icon: 'Hair Loss' },
      { name: 'Dandruff', icon: 'Dandruff' },
      { name: 'Dull Hair', icon: 'Dull Hair' },
      { name: 'Frizzy Hair', icon: 'Frizzy Hair' },
      { name: 'Split Ends', icon: 'Split Ends' },
      { name: 'Breakage', icon: 'Breakage' },
      { name: 'Oily Scalp', icon: 'Oily Scalp' },
      { name: 'Heat Damage', icon: 'Heat Damage' },
    ];

    const toggleSelection = (opt) => {
      let newValues = [...(data.hairConcerns || [])];
      if (newValues.includes(opt)) {
        newValues = newValues.filter((v) => v !== opt);
      } else {
        newValues.push(opt);
      }
      updateData({ hairConcerns: newValues });
    };

    return (
      <View className="mt-2">
        <View className="flex-row flex-wrap justify-between gap-y-3.5 my-2">
          {concerns.map((item) => {
            const isSelected = (data.hairConcerns || []).includes(item.name);
            return (
              <TouchableOpacity
                key={item.name}
                onPress={() => toggleSelection(item.name)}
                style={{ width: '48%' }}
                className={`flex-row items-center py-3.5 px-4 rounded-[20px] border ${
                  isSelected ? 'border-[#6D28D9] bg-[#F3E8FF]' : 'border-[#E5E7EB] bg-white'
                }`}
                activeOpacity={0.7}
              >
                <ConcernIcon name={item.icon} color={isSelected ? '#6D28D9' : '#6B7280'} />
                <Text 
                  className={`text-[13px] font-Poppins-Medium ml-3 flex-1 ${
                    isSelected ? 'text-[#6D28D9]' : 'text-[#4B5563]'
                  }`}
                  numberOfLines={1}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View className="flex-row items-start mt-6 mb-2 px-1">
          <Ionicons 
            name="warning-outline" 
            size={18} 
            color="#EF4444" 
            style={{ marginRight: 8, marginTop: 1 }} 
          />
          <Text className="text-[#6B7280] text-[11px] font-Poppins leading-4 flex-1">
            This helps us provide better recommendations tailored for you.
          </Text>
        </View>
      </View>
    );
  };

  const renderStep4 = () => (
    <View className="mt-2">
      <Text className="text-[#1F2937] text-[15px] font-Poppins-Medium mt-2 mb-3">Preferred Styles</Text>
      {renderMultiSelect(
        ['Korean', 'Professional', 'Trendy', 'Celebrity', 'Classic', 'Modern'],
        data.preferredStyles,
        'preferredStyles'
      )}

      <Text className="text-[#1F2937] text-[15px] font-Poppins-Medium mt-4 mb-3">Goals</Text>
      {renderMultiSelect(
        ['Professional Look', 'Improve Appearance', 'Trendy Look', 'Hair Growth Journey', 'Experiment Styles'],
        data.goals,
        'goals'
      )}
    </View>
  );

  const renderBeardSelect = (options, selectedValue, fieldName, scrollRef, offset, onScroll, onArrowClick) => {
    return (
      <View className="relative flex-row items-center mb-4">
        <TouchableOpacity 
          onPress={() => onArrowClick('left')}
          className="absolute left-0 z-10 w-8 h-8 rounded-full bg-white/80 border border-[#E5E7EB] items-center justify-center shadow-sm"
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={18} color="#6D28D9" />
        </TouchableOpacity>

        <ScrollView 
          ref={scrollRef}
          horizontal 
          showsHorizontalScrollIndicator={false} 
          onScroll={onScroll}
          scrollEventThrottle={16}
          contentContainerStyle={{ flexDirection: 'row', gap: 12, paddingHorizontal: 32, paddingVertical: 4 }}
        >
          {options.map((opt) => {
            const isSelected = selectedValue === opt;
            return (
              <View key={opt} className="items-center">
                <TouchableOpacity
                  className={`w-[78px] h-[98px] rounded-[20px] border overflow-hidden justify-center items-center ${
                    isSelected ? 'border-[#6D28D9] p-[2px]' : 'border-[#E5E7EB] bg-white'
                  }`}
                  onPress={() => updateData({ [fieldName]: opt })}
                  activeOpacity={0.7}
                >
                  <Image 
                    source={BEARD_AVATARS[opt]} 
                    style={{ width: '100%', height: '100%', borderRadius: 18 }}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
                <Text className={`text-[11px] mt-2 font-Poppins-Medium ${isSelected ? 'text-[#6D28D9]' : 'text-[#4B5563]'}`}>
                  {opt}
                </Text>
              </View>
            );
          })}
        </ScrollView>

        <TouchableOpacity 
          onPress={() => onArrowClick('right')}
          className="absolute right-0 z-10 w-8 h-8 rounded-full bg-white/80 border border-[#E5E7EB] items-center justify-center shadow-sm"
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-forward" size={18} color="#6D28D9" />
        </TouchableOpacity>
      </View>
    );
  };

  const renderStep5 = () => {
    if (data.gender === 'Female') return null;
    return (
      <View className="mt-2">
        <Text className="text-[#1F2937] text-[15px] font-Poppins-Medium mt-2 mb-3">Beard Status</Text>
        {renderBeardSelect(
          ['No Beard', 'Light Beard', 'Medium Beard', 'Full Beard'],
          data.beardStatus,
          'beardStatus',
          beardStatusScrollRef,
          beardStatusOffset,
          handleBeardStatusScroll,
          scrollBeardStatus
        )}

        <Text className="text-[#1F2937] text-[15px] font-Poppins-Medium mt-4 mb-3">Beard Preference</Text>
        {renderBeardSelect(
          ['Clean Shave', 'Stubble', 'Short Beard', 'Full Beard'],
          data.beardPreference,
          'beardPreference',
          beardPreferenceScrollRef,
          beardPreferenceOffset,
          handleBeardPreferenceScroll,
          scrollBeardPreference
        )}
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
      case 2: return { title: 'Hair Profile', subtitle: 'Help us understand your natural hair.' };
      case 3: return { title: 'Hair Concerns', subtitle: 'Select all that apply.' };
      case 4: return { title: 'Style Preferences', subtitle: 'What kind of styles do you prefer?' };
      case 5: return { title: 'Personalization', subtitle: 'A few more details to customize your experience.' };
      default: return { title: 'Basic Information', subtitle: 'Tell us a bit about yourself.' };
    }
  };

  const { title, subtitle } = getStepTitles();

  const renderCountryModal = () => (
    <Modal visible={showCountryModal} transparent animationType="slide">
      <View className="flex-1 justify-end bg-black/50">
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
          className="bg-white border-t border-l border-r border-[#E5E7EB] rounded-t-[32px] h-4/5 p-6"
        >
          <View className="w-12 h-1.5 bg-[#E5E7EB] rounded-full mx-auto mb-6" />
          
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-[#1F2937] text-2xl font-Poppins-Bold">Select Country</Text>
            <TouchableOpacity onPress={() => setShowCountryModal(false)}>
              <Ionicons name="close" size={28} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
          
          <View className="bg-white border border-[#E5E7EB] rounded-2xl flex-row items-center px-4 py-3.5 mb-6">
            <Ionicons name="search" size={20} color="#9CA3AF" />
            <TextInput
              className="flex-1 ml-3 text-[#1F2937] text-base font-Poppins"
              placeholder="Search country..."
              placeholderTextColor="#9CA3AF"
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
                      ? 'border-[#6D28D9] bg-[#F3E8FF]' 
                      : 'border-[#E5E7EB] bg-white'
                  }`}
                  onPress={() => {
                    updateData({ country: item.name });
                    setShowCountryModal(false);
                    setCountrySearch('');
                  }}
                  activeOpacity={0.7}
                >
                  <Image 
                    source={{ uri: `https://flagcdn.com/w160/${itemCode}.png` }} 
                    style={{ width: 30, height: 20, borderRadius: 3, marginRight: 16 }} 
                  />
                  <Text className={`text-base font-Poppins ${isSelected ? 'text-[#6D28D9] font-Poppins-Bold' : 'text-[#1F2937]'}`}>
                    {item.name}
                  </Text>
                  {isSelected && (
                    <View className="ml-auto">
                      <Ionicons name="checkmark-circle" size={22} color="#6D28D9" />
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
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <LinearGradient colors={['#FFFFFF', '#FAF5FF', '#F5F3FF', '#FFFFFF']} style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }} edges={['top', 'bottom']}>
          <StatusBar barStyle="dark-content" />
          
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
            style={{ flex: 1 }}
          >
            {/* Header */}
            <View className="px-6 pt-6 pb-2">
              <View className="items-center mb-4">
                <View className="bg-[#F3E8FF] px-3.5 py-1.5 rounded-full mb-3 shadow-sm">
                  <Text className="text-[#6D28D9] text-[11px] font-Poppins-Bold tracking-[2px] uppercase">
                    Step {displayStep} of {displayTotal}
                  </Text>
                </View>
                <Text className="text-[#1F2937] text-2xl font-Poppins-Bold mb-1.5">{title}</Text>
                <Text className="text-[#6B7280] text-sm font-Poppins text-center px-4">{subtitle}</Text>
              </View>
              
              {/* Premium Segmented Progress Bar */}
              <View className="flex-row items-center justify-center gap-2 mb-4 px-10">
                {[...Array(displayTotal)].map((_, idx) => {
                  const step = idx + 1;
                  const isCurrent = step === displayStep;
                  const isCompleted = step < displayStep;
                  
                  return (
                    <View 
                      key={step} 
                      className={`h-1.5 rounded-full ${
                        isCurrent 
                          ? 'w-8 bg-[#6D28D9]' 
                          : isCompleted 
                            ? 'w-3.5 bg-[#7C3AED]' 
                            : 'w-3.5 bg-[#E5E7EB]'
                      }`}
                    />
                  );
                })}
              </View>
            </View>
   
            {/* Form Container (Floating Card wrapper) */}
            <View className="flex-1 mx-6 mb-6 bg-white border border-[#E5E7EB] rounded-[32px] p-6 justify-between shadow-lg">
              <ScrollView 
                showsVerticalScrollIndicator={false} 
                contentContainerStyle={{ flexGrow: 1 }} 
                keyboardShouldPersistTaps="handled"
              >
                <View className="flex-1 justify-center">
                  {renderCurrentStep()}
                  {errorMsg ? <Text className="text-red-500 mt-5 text-center text-sm font-Poppins">{errorMsg}</Text> : null}
                </View>
              </ScrollView>
              
              {/* Button inside the Card Container */}
              <View className="mt-6">
                <TouchableOpacity
                  className="rounded-2xl overflow-hidden shadow-sm"
                  onPress={handleNext}
                  disabled={isSubmitting}
                  activeOpacity={0.85}
                >
                  <LinearGradient 
                    colors={['#6D28D9', '#7C3AED']} 
                    start={{ x: 0, y: 0 }} 
                    end={{ x: 1, y: 1 }}
                    className="py-4 items-center justify-center"
                  >
                    {isSubmitting ? (
                      <ActivityIndicator color="#FFF" size="small" />
                    ) : (
                      <Text className="text-white text-base font-Poppins-SemiBold">
                        {currentStep === displayTotal ? 'Complete' : 'Continue'}
                      </Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                {/* Go Back Link at the bottom of the card */}
                {(currentStep > 1 || (navigation && navigation.canGoBack())) ? (
                  <TouchableOpacity
                    onPress={() => {
                      if (currentStep > 1) {
                        prevStep();
                      } else if (navigation && navigation.canGoBack()) {
                        navigation.goBack();
                      }
                    }}
                    className="mt-3.5 py-2 items-center justify-center"
                    activeOpacity={0.7}
                  >
                    <Text className="text-[#6D28D9] text-sm font-Poppins-Bold underline">
                      Go Back
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
        {renderCountryModal()}
      </LinearGradient>
    </View>
  );
}
