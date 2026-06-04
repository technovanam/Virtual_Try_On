import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProfileStore } from '../store/profileStore';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const Label = ({ text }) => <Text className="text-base text-gray-900 font-medium mt-5 mb-2">{text}</Text>;

export default function EditProfileScreen() {
  const { profileData, updateProfile } = useProfileStore();
  const navigation = useNavigation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const completion = profileData?.profileCompletion || {};
  const isMale = completion.gender === 'Male';

  const [formData, setFormData] = useState({
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
            className={`py-2 px-4 rounded-full border ${isSelected ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white'}`}
            onPress={() => updateData({ [fieldName]: opt })}
          >
            <Text className={`text-sm ${isSelected ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
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
              className={`py-2 px-4 rounded-full border ${isSelected ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white'}`}
              onPress={() => toggleSelection(opt)}
            >
              <Text className={`text-sm ${isSelected ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
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
    const payload = { ...formData, age: formData.age ? parseInt(formData.age, 10) : null };
    if (!isMale) {
      delete payload.beardStatus;
      delete payload.beardPreference;
    }
    const result = await updateProfile(payload);
    setIsSubmitting(false);
    if (result.success) {
      navigation.goBack();
    } else {
      setErrorMsg(result.error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
          <Ionicons name="close" size={24} color="#111827" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-900">Edit Profile</Text>
        <TouchableOpacity onPress={handleSave} disabled={isSubmitting} className="p-2">
          {isSubmitting ? <ActivityIndicator size="small" color="#3B82F6" /> : <Text className="text-blue-600 font-bold text-base">Save</Text>}
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerClassName="px-6 pt-2 pb-10" showsVerticalScrollIndicator={false}>
        {errorMsg ? <Text className="text-red-500 mb-4">{errorMsg}</Text> : null}

        <Label text="Age" />
        <TextInput
          className="bg-gray-50 border border-gray-200 rounded-xl text-gray-900 px-4 py-3.5 text-base"
          placeholder="Enter your age"
          keyboardType="numeric"
          value={formData.age}
          onChangeText={(text) => updateData({ age: text })}
        />

        <Label text="Country" />
        <TextInput
          className="bg-gray-50 border border-gray-200 rounded-xl text-gray-900 px-4 py-3.5 text-base"
          placeholder="Enter your country"
          value={formData.country}
          onChangeText={(text) => updateData({ country: text })}
        />

        <Label text="Hair Length" />
        {renderSingleSelect(['Bald', 'Very Short', 'Short', 'Medium', 'Long'], formData.hairLength, 'hairLength')}

        <Label text="Hair Type" />
        {renderSingleSelect(['Straight', 'Wavy', 'Curly', 'Coily'], formData.hairType, 'hairType')}

        <Label text="Hair Color" />
        {renderSingleSelect(['Black', 'Brown', 'Blonde', 'Red', 'Grey', 'Other'], formData.hairColor, 'hairColor')}

        <Label text="Hair Concerns" />
        {renderMultiSelect(['Hair Fall', 'Thin Hair', 'Dandruff', 'Dry Hair', 'Oily Hair', 'Split Ends', 'None'], formData.hairConcerns, 'hairConcerns')}

        <Label text="Preferred Styles" />
        {renderMultiSelect(['Korean', 'Professional', 'Trendy', 'Celebrity', 'Classic', 'Modern'], formData.preferredStyles, 'preferredStyles')}

        <Label text="Goals" />
        {renderMultiSelect(['Professional Look', 'Improve Appearance', 'Trendy Look', 'Hair Growth Journey', 'Experiment Styles'], formData.goals, 'goals')}

        {isMale && (
          <>
            <Label text="Beard Status" />
            {renderSingleSelect(['No Beard', 'Light Beard', 'Medium Beard', 'Full Beard'], formData.beardStatus, 'beardStatus')}

            <Label text="Beard Preference" />
            {renderSingleSelect(['Clean Shave', 'Stubble', 'Short Beard', 'Full Beard'], formData.beardPreference, 'beardPreference')}
          </>
        )}
        
        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}
