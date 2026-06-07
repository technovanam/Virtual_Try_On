import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useHaircareStore } from '../store/haircareStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const getCategoryColor = (category) => {
  const cat = category.toLowerCase();
  if (cat.includes('growth')) return ['#8b5cf6', '#6d28d9'];
  if (cat.includes('fall')) return ['#f43f5e', '#be123c'];
  if (cat.includes('health')) return ['#10b981', '#047857'];
  if (cat.includes('routine')) return ['#3b82f6', '#1d4ed8'];
  if (cat.includes('styling')) return ['#f59e0b', '#b45309'];
  if (cat.includes('nutrition')) return ['#84cc16', '#4d7c0f'];
  return ['#64748b', '#334155'];
};

const getCategoryIcon = (category) => {
  const cat = category.toLowerCase();
  if (cat.includes('growth')) return '🌱';
  if (cat.includes('fall')) return '🛡️';
  if (cat.includes('health')) return '✨';
  if (cat.includes('routine')) return '📅';
  if (cat.includes('styling')) return '✂️';
  if (cat.includes('nutrition')) return '🥗';
  return '💡';
};

export default function HairCareSuggestionsScreen({ navigation }) {
  const { 
    suggestions, 
    isLoading, 
    isGenerating, 
    status, 
    error, 
    fetchSuggestions, 
    generateSuggestions 
  } = useHaircareStore();

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const handleGenerate = async () => {
    await generateSuggestions();
  };

  if (isLoading || isGenerating) {
    return (
      <View className="flex-1 bg-[#0f172a] justify-center items-center p-5">
        <ActivityIndicator size="large" color="#ec4899" />
        <Text className="text-[#cbd5e1] mt-4 text-[16px] text-center font-['Inter']">
          {isGenerating ? "Analyzing your profile & generating custom suggestions..." : "Loading your hair care plan..."}
        </Text>
      </View>
    );
  }

  if (status === 'error') {
    return (
      <View className="flex-1 bg-[#0f172a] justify-center items-center p-5">
        <Text className="text-[#ef4444] text-[20px] font-bold mb-2">Oops! Something went wrong.</Text>
        <Text className="text-[#94a3b8] text-center mb-6">{error}</Text>
        <TouchableOpacity 
          className="bg-[#ec4899] py-[14px] px-8 rounded-[30px] elevation-5" 
          style={{ shadowColor: '#ec4899', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 }}
          onPress={fetchSuggestions}
        >
          <Text className="text-white text-[16px] font-bold text-center">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (status === 'empty' || suggestions.length === 0) {
    return (
      <View className="flex-1 bg-[#0f172a] justify-center items-center p-5">
        <Text className="text-[64px] mb-6">🧪</Text>
        <Text className="text-[#f8fafc] text-[20px] font-bold mb-2 text-center">No personalized suggestions available yet.</Text>
        <Text className="text-[#94a3b8] text-center mb-8 text-[15px]">Let our AI build a custom hair care & growth plan tailored specifically for your hair type and goals.</Text>
        <TouchableOpacity 
          className="bg-[#ec4899] py-[14px] px-8 rounded-[30px] elevation-5" 
          style={{ shadowColor: '#ec4899', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 }}
          onPress={handleGenerate}
        >
          <Text className="text-white text-[16px] font-bold text-center">Analyze Hair & Generate</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Group suggestions by category
  const groupedSuggestions = suggestions.reduce((acc, curr) => {
    const cat = curr.category || 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(curr);
    return acc;
  }, {});

  const categories = Object.keys(groupedSuggestions).sort();

  return (
    <SafeAreaView className="flex-1 bg-[#0f172a]">
      <ScrollView contentContainerClassName="p-5 pb-10">
        
        <View className="mb-6">
          <Text className="text-[#f8fafc] text-[28px] font-extrabold mb-2">Your Custom Hair Care Plan</Text>
          <Text className="text-[#94a3b8] text-[15px] leading-[22px]">
            Fully personalized AI-generated routine and suggestions based on your recent analysis.
          </Text>
        </View>

        {categories.map((category) => (
          <View key={category} className="mb-6">
            <View className="flex-row items-center mb-3">
              <Text className="text-[24px] mr-2">{getCategoryIcon(category)}</Text>
              <Text className="text-[#f8fafc] text-[20px] font-bold">{category}</Text>
            </View>
            
            {groupedSuggestions[category].map((item, index) => (
              <LinearGradient
                key={item.suggestionId || index}
                colors={getCategoryColor(category)}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="p-4 rounded-[16px] mb-3 elevation-3"
                style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84 }}
              >
                <View className="flex-row justify-between items-start mb-2">
                  <Text className="text-white text-[18px] font-bold flex-1 mr-2">{item.title}</Text>
                  {item.priority === 'High' && (
                    <View className="bg-[rgba(255,255,255,0.2)] px-2 py-1 rounded-lg">
                      <Text className="text-white text-[10px] font-bold uppercase">Crucial</Text>
                    </View>
                  )}
                </View>
                <Text className="text-[rgba(255,255,255,0.9)] text-[14px] leading-5">{item.description}</Text>
              </LinearGradient>
            ))}
          </View>
        ))}

        <TouchableOpacity 
          className="bg-[#3b82f6] mt-[30px] py-[14px] px-8 rounded-[30px] elevation-5" 
          style={{ shadowColor: '#3b82f6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 }}
          onPress={handleGenerate}
        >
          <Text className="text-white text-[16px] font-bold text-center">Regenerate Plan</Text>
        </TouchableOpacity>
        
      </ScrollView>
    </SafeAreaView>
  );
}
