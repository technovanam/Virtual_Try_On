import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function HistoryCard({
  historyId,
  hairstyleId,
  hairstyleName,
  hairstyleCategory,
  tryOnImage,
  createdAt,
  onPress
}) {
  const formattedDate = createdAt ? new Date(createdAt).toLocaleDateString() : 'Recently';

  return (
    <TouchableOpacity 
      className="bg-white rounded-2xl mb-4 shadow-sm flex-row overflow-hidden border border-[#F1F5F9] p-3 items-center" 
      style={{ elevation: 2 }}
      onPress={onPress} 
      activeOpacity={0.8}
    >
      <View className="h-[80px] w-[80px] bg-[#F8FAFC] rounded-xl overflow-hidden relative">
        {tryOnImage ? (
          <Image source={{ uri: tryOnImage }} className="w-full h-full" resizeMode="cover" />
        ) : (
          <View className="w-full h-full justify-center items-center">
            <Ionicons name="image-outline" size={24} color="#CBD5E1" />
          </View>
        )}
      </View>

      <View className="flex-1 ml-4 justify-center">
        <Text className="text-base font-bold text-[#0F172A] mb-1" numberOfLines={1}>
          {hairstyleName || 'Try-On Session'}
        </Text>
        
        <View className="flex-row items-center mb-1">
          <Text className="text-[#64748B] text-[10px] font-bold uppercase bg-[#F1F5F9] px-2 py-0.5 rounded-md overflow-hidden">
            {hairstyleCategory || 'Category'}
          </Text>
        </View>

        <View className="flex-row items-center">
          <Ionicons name="time-outline" size={12} color="#94A3B8" />
          <Text className="text-[#94A3B8] text-xs ml-1">{formattedDate}</Text>
        </View>
      </View>

      <View className="ml-2 w-8 h-8 rounded-full bg-[#F8FAFC] justify-center items-center">
        <Ionicons name="chevron-forward" size={16} color="#64748B" />
      </View>
    </TouchableOpacity>
  );
}
