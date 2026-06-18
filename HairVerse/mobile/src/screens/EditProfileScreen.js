import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProfileStore } from '../store/profileStore';
import { useAuthStore } from '../store/authStore';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const Label = ({ text }) => <Text className="text-xs font-bold text-purple-700/60 uppercase tracking-wider mt-6 mb-2.5 px-1">{text}</Text>;

export default function EditProfileScreen() {
  const { profileData, updateProfile } = useProfileStore();
  const navigation = useNavigation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const completion = profileData?.profileCompletion || {};

  const [formData, setFormData] = useState({
    displayName: profileData?.displayName || '',
    gender: completion.gender || '',
    age: completion.age?.toString() || '',
    country: completion.country || '',
    hairLength: completion.hairLength || '',
    hairType: completion.hairType || '',
    hairColor: completion.hairColor || '',
    hairConcerns: completion.hairConcerns || [],
    preferredStyles: completion.preferredStyles || [],
    goals: completion.goals || [],
    beardStatus: completion.beardStatus || '',
    beardPreference: completion.beardPreference || '',
  });

  const isMale = formData.gender === 'Male';

  const updateData = (updates) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const renderSingleSelect = (options, selectedValue, fieldName) => (
    <View className="flex-row flex-wrap gap-2 mb-2">
      {options.map((opt) => {
        const isSelected = selectedValue === opt;
        return (
          <TouchableOpacity
            key={opt}
            className={`py-2.5 px-4 rounded-full border ${isSelected ? 'border-purple-600 bg-purple-50' : 'border-gray-200 bg-white'} shadow-sm`}
            onPress={() => updateData({ [fieldName]: opt })}
          >
            <Text className={`text-sm ${isSelected ? 'text-purple-700 font-semibold' : 'text-gray-600'}`}>
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
      <View className="flex-row flex-wrap gap-2 mb-2">
        {options.map((opt) => {
          const isSelected = selectedValues.includes(opt);
          return (
            <TouchableOpacity
              key={opt}
              className={`py-2.5 px-4 rounded-full border ${isSelected ? 'border-purple-600 bg-purple-50' : 'border-gray-200 bg-white'} shadow-sm`}
              onPress={() => toggleSelection(opt)}
            >
              <Text className={`text-sm ${isSelected ? 'text-purple-700 font-semibold' : 'text-gray-600'}`}>
                {opt}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    setErrorMsg('');
    
    const payload = { 
      ...formData, 
      age: formData.age ? parseInt(formData.age, 10) : null 
    };

    if (formData.gender !== 'Male') {
      payload.beardStatus = null;
      payload.beardPreference = null;
    }

    const success = await updateProfile(payload);
    setIsSubmitting(false);
    if (success) {
      // Sync display name with authStore
      useAuthStore.setState((state) => ({
        user: state.user ? { ...state.user, displayName: formData.displayName } : null
      }));
      navigation.goBack();
    } else {
      setErrorMsg('Failed to update profile. Please check your network and try again.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <View className="flex-row items-center justify-between px-4 py-4 bg-white border-b border-gray-100 shadow-sm">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 w-10 h-10 items-center justify-center bg-gray-50 rounded-full">
          <Ionicons name="close" size={20} color="#1F2937" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-900">Edit Profile</Text>
        <TouchableOpacity onPress={handleSave} disabled={isSubmitting} className="bg-purple-600 px-5 py-2.5 rounded-full shadow-sm">
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text className="text-white font-bold text-sm">Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerClassName="px-6 pt-2 pb-14" showsVerticalScrollIndicator={false}>
        {errorMsg ? (
          <View className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4 flex-row items-center">
            <Ionicons name="alert-circle" size={20} color="#EF4444" className="mr-2" />
            <Text className="text-red-700 font-medium text-sm flex-1">{errorMsg}</Text>
          </View>
        ) : null}

        <View className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm mb-6">
          <Label text="Display Name / Username" />
          <TextInput
            className="bg-gray-50 border border-gray-100 rounded-xl text-gray-900 px-4 py-3.5 text-base focus:border-purple-500"
            placeholder="Enter your name"
            value={formData.displayName}
            onChangeText={(text) => updateData({ displayName: text })}
          />

          <Label text="Gender" />
          {renderSingleSelect(['Male', 'Female'], formData.gender, 'gender')}

          <Label text="Age" />
          <TextInput
            className="bg-gray-50 border border-gray-100 rounded-xl text-gray-900 px-4 py-3.5 text-base focus:border-purple-500"
            placeholder="Enter your age"
            keyboardType="numeric"
            value={formData.age}
            onChangeText={(text) => updateData({ age: text })}
          />

          <Label text="Country" />
          <TextInput
            className="bg-gray-50 border border-gray-100 rounded-xl text-gray-900 px-4 py-3.5 text-base focus:border-purple-500"
            placeholder="Enter your country"
            value={formData.country}
            onChangeText={(text) => updateData({ country: text })}
          />
        </View>

        <View className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm mb-6">
          <Label text="Hair Length" />
          {renderSingleSelect(['Bald', 'Very Short', 'Short', 'Medium', 'Long'], formData.hairLength, 'hairLength')}

          <Label text="Hair Type" />
          {renderSingleSelect(['Straight', 'Wavy', 'Curly', 'Coily'], formData.hairType, 'hairType')}

          <Label text="Hair Color" />
          {renderSingleSelect(['Black', 'Brown', 'Blonde', 'Red', 'Grey', 'Other'], formData.hairColor, 'hairColor')}
        </View>

        <View className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm mb-6">
          <Label text="Hair Concerns" />
          {renderMultiSelect(['Hair Loss', 'Dandruff', 'Dull Hair', 'Frizzy Hair', 'Split Ends', 'Breakage', 'Oily Scalp', 'Heat Damage', 'None'], formData.hairConcerns, 'hairConcerns')}

          <Label text="Preferred Styles" />
          {renderMultiSelect(['Korean', 'Professional', 'Trendy', 'Celebrity', 'Classic', 'Modern'], formData.preferredStyles, 'preferredStyles')}

          <Label text="Goals" />
          {renderMultiSelect(['Professional Look', 'Improve Appearance', 'Trendy Look', 'Hair Growth Journey', 'Experiment Styles'], formData.goals, 'goals')}
        </View>

        {isMale && (
          <View className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm mb-6">
            <Label text="Beard Status" />
            {renderSingleSelect(['No Beard', 'Light Beard', 'Medium Beard', 'Full Beard'], formData.beardStatus, 'beardStatus')}

            <Label text="Beard Preference" />
            {renderSingleSelect(['Clean Shave', 'Stubble', 'Short Beard', 'Full Beard'], formData.beardPreference, 'beardPreference')}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
