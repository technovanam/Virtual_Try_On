import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function TrendingCard({
  hairstyleId,
  hairstyleName,
  category,
  previewImage,
  trendScore,
  popularityScore,
  onPress
}) {
  return (
    <TouchableOpacity 
      className="bg-white rounded-2xl mr-4 shadow-sm overflow-hidden border border-[#F1F5F9] w-[260px]" 
      style={{ elevation: 3 }}
      onPress={onPress} 
      activeOpacity={0.9}
    >
      <View className="h-[160px] w-full bg-[#F8FAFC] relative">
        {previewImage ? (
          <Image source={{ uri: previewImage }} className="w-full h-full" resizeMode="cover" />
        ) : (
          <View className="w-full h-full justify-center items-center">
            <Ionicons name="image-outline" size={32} color="#CBD5E1" />
          </View>
        )}
        
        {trendScore > 0 && (
          <View className="absolute top-3 right-3 bg-[#EF4444] px-2 py-1 rounded-xl flex-row items-center gap-1">
            <Ionicons name="flame" size={12} color="#FFFFFF" />
            <Text className="text-white text-[10px] font-bold uppercase">Trending</Text>
          </View>
        )}

        {category && (
          <View className="absolute top-3 left-3 bg-[#0F172A]/80 px-2 py-1 rounded-xl flex-row items-center">
            <Text className="text-white text-[10px] font-bold uppercase">{category}</Text>
          </View>
        )}
      </View>

      <View className="p-4">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-lg font-bold text-[#0F172A] flex-1 mr-2" numberOfLines={1}>{hairstyleName || 'Hairstyle'}</Text>
        </View>

        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center gap-1">
            <Ionicons name="trending-up" size={14} color="#10B981" />
            <Text className="text-[#10B981] text-[13px] font-semibold">{trendScore ? Math.round(trendScore) : 0} Score</Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Ionicons name="star" size={14} color="#F59E0B" />
            <Text className="text-[#F59E0B] text-[13px] font-semibold">{popularityScore ? Math.round(popularityScore) : 0}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
