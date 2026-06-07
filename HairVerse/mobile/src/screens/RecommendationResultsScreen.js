import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, TextInput, Alert, SafeAreaView } from 'react-native';
import { useRecommendationStore } from '../store/recommendationStore';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import RecommendationSection from '../components/RecommendationSection';

const getPlaceholderImage = (category, fallback) => {
  if (!category) return fallback;
  const cat = category.toLowerCase();
  if (cat.includes('short')) return 'https://images.unsplash.com/photo-1599839619722-39751411ea63?q=80&w=400&auto=format&fit=crop';
  if (cat.includes('long')) return 'https://images.unsplash.com/photo-1595475884562-073cda88ec13?q=80&w=400&auto=format&fit=crop';
  if (cat.includes('medium')) return 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?q=80&w=400&auto=format&fit=crop';
  if (cat.includes('curly')) return 'https://images.unsplash.com/photo-1605384318063-42e12816999a?q=80&w=400&auto=format&fit=crop';
  return fallback || 'https://images.unsplash.com/photo-1560060141-7b9018741cb7?q=80&w=400&auto=format&fit=crop';
};

export default function RecommendationResultsScreen({ navigation }) {
  const { 
    summary,
    recommendations,
    hairColors,
    beards,
    celebrities,
    trending,
    searchQuery,
    setSearchQuery,
    activeCategory,
    setActiveCategory,
    isLoading, 
    isGenerating, 
    status, 
    error, 
    fetchRecommendations,
    generateRecommendations
  } = useRecommendationStore();

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const handleRefresh = async () => {
    await generateRecommendations();
  };

  const categories = ['All', 'Short', 'Medium', 'Long', 'Trendy', 'Classic', 'Low Maintenance'];

  // Filtering Logic
  const filteredRecommendations = recommendations.filter(rec => {
    const matchesSearch = rec.hairstyleName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          rec.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesCategory = true;
    if (activeCategory !== 'All') {
      if (activeCategory === 'Low Maintenance') {
        matchesCategory = rec.maintenanceLevel.toLowerCase() === 'low';
      } else {
        matchesCategory = rec.category.toLowerCase().includes(activeCategory.toLowerCase());
      }
    }
    
    return matchesSearch && matchesCategory;
  });

  if (isLoading || isGenerating) {
    return (
      <View className="flex-1 bg-[#0f172a] justify-center items-center p-5">
        <ActivityIndicator size="large" color="#ec4899" />
        <Text className="text-[#cbd5e1] mt-4 text-[16px]">
          {isGenerating ? "Analyzing your profile & generating styles..." : "Loading recommendations..."}
        </Text>
      </View>
    );
  }

  if (status === 'error') {
    return (
      <View className="flex-1 bg-[#0f172a] justify-center items-center p-5">
        <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
        <Text className="text-[#f8fafc] text-[20px] font-bold mt-4 mb-2">Oops! Something went wrong.</Text>
        <Text className="text-[#94a3b8] text-center mb-6">{error}</Text>
        <TouchableOpacity className="bg-[#ec4899] py-[14px] px-8 rounded-[30px] items-center" onPress={fetchRecommendations}>
          <Text className="text-white text-[16px] font-bold">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (status === 'empty' || recommendations.length === 0) {
    return (
      <View className="flex-1 bg-[#0f172a] justify-center items-center p-5">
        <Image 
          source={{ uri: 'https://cdn-icons-png.flaticon.com/512/7481/7481372.png' }} 
          className="w-[120px] h-[120px] mb-6 opacity-70"
          style={{ tintColor: '#94a3b8' }}
        />
        <Text className="text-[#f8fafc] text-[20px] font-bold mb-2">No recommendations available yet.</Text>
        <Text className="text-[#94a3b8] text-center mb-8 text-[15px]">Let our AI analyze your features to find your perfect hairstyle.</Text>
        <TouchableOpacity className="bg-[#ec4899] py-[14px] px-8 rounded-[30px] items-center" onPress={() => navigation.navigate('SelfieUpload')}>
          <Text className="text-white text-[16px] font-bold">Analyze Selfie</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#0f172a]">
      {/* Sticky Header with Search and Filters */}
      <View className="px-5 pt-2.5 pb-2.5 bg-[rgba(15,23,42,0.95)] border-b border-[#1e293b] z-10">
        <Text className="text-[#f8fafc] text-[28px] font-extrabold mb-4">Your AI Stylist</Text>
        <View className="flex-row items-center bg-[#1e293b] rounded-xl px-3 py-2.5 mb-4">
          <Ionicons name="search" size={20} color="#94a3b8" />
          <TextInput
            className="flex-1 text-[#f8fafc] ml-2 text-[16px] outline-none bg-transparent"
            placeholder="Search hairstyles, colors..."
            placeholderTextColor="#64748b"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2">
          {categories.map(cat => (
            <TouchableOpacity 
              key={cat} 
              className={`px-4 py-2 rounded-[20px] mr-2 ${activeCategory === cat ? 'bg-[#ec4899]' : 'bg-[#1e293b]'}`}
              onPress={() => setActiveCategory(cat)}
            >
              <Text className={`text-[14px] ${activeCategory === cat ? 'text-white font-bold' : 'text-[#cbd5e1] font-medium'}`}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerClassName="p-5 pb-[60px]">
        
        {/* AI Summary Card */}
        {summary ? (
          <LinearGradient colors={['#4f46e5', '#ec4899']} className="p-5 rounded-[20px] mb-6 elevation-5" style={{ shadowColor: '#ec4899', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 }} start={{x:0, y:0}} end={{x:1, y:1}}>
            <View className="flex-row items-center mb-3 gap-2">
              <Ionicons name="sparkles" size={24} color="#fff" />
              <Text className="text-white text-[18px] font-bold">AI Summary</Text>
            </View>
            <Text className="text-white text-[15px] leading-[22px] opacity-90">{summary}</Text>
          </LinearGradient>
        ) : null}

        {/* Recommended Hairstyles List */}
        <Text className="text-[#f8fafc] text-[22px] font-bold mb-4 mt-2">Top Hairstyles</Text>
        {filteredRecommendations.length === 0 ? (
          <Text className="text-[#94a3b8] text-[16px] text-center my-5">No styles found matching your criteria.</Text>
        ) : (
          filteredRecommendations.map((item, index) => (
            <View key={item.recommendationId || index} className="w-full h-[340px] rounded-[24px] overflow-hidden mb-6 bg-[#1e293b]">
              <Image source={{ uri: item.imageUrl || getPlaceholderImage(item.category) }} className="w-full h-full absolute" />
              <LinearGradient colors={['transparent', 'rgba(15,23,42,0.95)']} className="flex-1 justify-end p-5">
                <View className="gap-2">
                  <View className="flex-row justify-between items-center">
                    <Text className="text-white text-[24px] font-bold flex-1">{item.hairstyleName}</Text>
                    <View className="bg-[#10b981] px-2.5 py-1 rounded-xl">
                      <Text className="text-white text-[12px] font-bold">{item.suitabilityScore}% Match</Text>
                    </View>
                  </View>
                  <Text className="text-[#cbd5e1] text-[14px] font-medium">{item.category} • {item.maintenanceLevel} Maintenance</Text>
                  <Text className="text-[#94a3b8] text-[13px] leading-[18px] mb-2" numberOfLines={2}>{item.recommendationReason}</Text>

                  <View className="flex-row gap-2.5 mt-2">
                    <TouchableOpacity className="flex-[1.5] bg-[rgba(255,255,255,0.15)] py-3 rounded-[20px] items-center justify-center flex-row gap-1.5" onPress={() => Alert.alert('Saved', 'Saved to Collections')}>
                      <Ionicons name="bookmark-outline" size={18} color="white" />
                      <Text className="text-white font-bold text-[13px]">Save</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="flex-[1.5] bg-[rgba(255,255,255,0.15)] py-3 rounded-[20px] items-center justify-center flex-row gap-1.5" onPress={() => navigation.navigate('CompareHairstyles')}>
                      <Ionicons name="git-compare-outline" size={18} color="white" />
                      <Text className="text-white font-bold text-[13px]">Compare</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="flex-[2] bg-[#ec4899] py-3 rounded-[20px] items-center justify-center" onPress={() => navigation.navigate('VirtualTryOn', { hairstyle: item })}>
                      <Text className="text-white font-bold text-[14px]">Try Now</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </LinearGradient>
            </View>
          ))
        )}

        {/* Hair Colors Section */}
        <RecommendationSection 
          title="Hair Color Recommendations"
          data={hairColors}
          renderItem={(item, idx) => (
            <View key={idx} className="w-[140px] bg-[#1e293b] rounded-[16px] p-4">
              <View className="w-full h-[60px] rounded-xl mb-3 border border-[#334155]" style={{ backgroundColor: item.hexCode }} />
              <Text className="text-[#f8fafc] font-bold text-[16px] mb-1 text-left">{item.colorName}</Text>
              <Text className="text-[#94a3b8] text-[13px] leading-[18px]" numberOfLines={3}>{item.reason}</Text>
            </View>
          )}
        />

        {/* Beards Section */}
        <RecommendationSection 
          title="Beard Matches"
          subtitle="Tailored for your face shape"
          data={beards}
          renderItem={(item, idx) => (
            <View key={idx} className="w-[220px] bg-[#1e293b] rounded-[16px] p-4">
              <Text className="text-[#f8fafc] font-bold text-[16px] mb-1 text-left">{item.beardStyle}</Text>
              <Text className="text-[#10b981] text-[13px] font-bold mb-2">{item.maintenanceLevel} Maintenance</Text>
              <Text className="text-[#94a3b8] text-[13px] leading-[18px]" numberOfLines={3}>{item.reason}</Text>
            </View>
          )}
        />

        {/* Celebrities Section */}
        <RecommendationSection 
          title="Celebrity Matches"
          data={celebrities}
          renderItem={(item, idx) => (
            <View key={idx} className="w-[160px] bg-[#1e293b] rounded-[16px] p-4 items-center">
              <View className="w-[64px] h-[64px] rounded-full bg-[#334155] items-center justify-center mb-3">
                <Ionicons name="person" size={32} color="#64748b" />
              </View>
              <Text className="text-[#f8fafc] font-bold text-[16px] mb-1 text-left">{item.celebrityName}</Text>
              <Text className="text-[#10b981] text-[13px] font-bold mb-2">{item.matchScore}% Match</Text>
              <Text className="text-[#94a3b8] text-[13px] leading-[18px]" numberOfLines={2}>{item.reason}</Text>
            </View>
          )}
        />

        {/* Trending Section */}
        <RecommendationSection 
          title="Trending Now"
          data={trending}
          renderItem={(item, idx) => (
            <View key={idx} className="w-[220px] bg-[#1e293b] rounded-[16px] p-4">
              <View className="flex-row items-center gap-2 mb-2">
                <Ionicons name="trending-up" size={18} color="#10b981" />
                <Text className="text-[#f8fafc] font-bold text-[16px] mb-1 text-left">{item.styleName}</Text>
              </View>
              <Text className="text-[#94a3b8] text-[13px] leading-[18px]" numberOfLines={3}>{item.trendReason}</Text>
            </View>
          )}
        />

        <TouchableOpacity className="bg-[#3b82f6] mt-2.5 py-[14px] px-8 rounded-[30px] items-center" onPress={handleRefresh}>
          <Text className="text-white text-[16px] font-bold">Regenerate Recommendations</Text>
        </TouchableOpacity>
        
      </ScrollView>
    </SafeAreaView>
  );
}
