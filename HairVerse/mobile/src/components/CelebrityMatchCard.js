import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function CelebrityMatchCard({
  celebrityName,
  celebrityImage,
  hairstyleName,
  hairstyleImage,
  matchScore,
  onPress
}) {
  return (
    <TouchableOpacity 
      className="bg-white rounded-2xl mr-4 shadow-sm overflow-hidden border border-[#F1F5F9] w-[260px]" 
      style={{ elevation: 3 }}
      onPress={onPress} 
      activeOpacity={0.9}
    >
      <View className="h-[140px] w-full flex-row">
        {/* Celebrity Image Half */}
        <View className="w-1/2 h-full bg-[#F8FAFC] border-r border-[#E2E8F0]">
          {celebrityImage ? (
            <Image source={{ uri: celebrityImage }} className="w-full h-full" resizeMode="cover" />
          ) : (
            <View className="w-full h-full justify-center items-center">
              <Ionicons name="person-outline" size={24} color="#CBD5E1" />
            </View>
          )}
          <View className="absolute bottom-2 left-2 bg-[#0F172A]/80 px-1.5 py-0.5 rounded-lg max-w-[90%]">
            <Text className="text-white text-[9px] font-semibold" numberOfLines={1}>{celebrityName || 'Celebrity'}</Text>
          </View>
        </View>

        {/* Hairstyle Image Half */}
        <View className="w-1/2 h-full bg-[#F8FAFC]">
          {hairstyleImage ? (
            <Image source={{ uri: hairstyleImage }} className="w-full h-full" resizeMode="cover" />
          ) : (
            <View className="w-full h-full justify-center items-center">
              <Ionicons name="cut-outline" size={24} color="#CBD5E1" />
            </View>
          )}
          <View className="absolute bottom-2 right-2 bg-[#0F172A]/80 px-1.5 py-0.5 rounded-lg max-w-[90%]">
            <Text className="text-white text-[9px] font-semibold" numberOfLines={1}>{hairstyleName || 'Style'}</Text>
          </View>
        </View>

        {/* Match Badge Overlay */}
        <View className="absolute top-3 left-1/2 -ml-[30px] bg-[#6366F1] px-2 py-1 rounded-xl flex-row items-center justify-center w-[60px] border-2 border-white shadow-sm z-10">
          <Text className="text-white text-[11px] font-bold">{matchScore ? Math.round(matchScore) : 0}%</Text>
        </View>
      </View>

      <View className="p-3 bg-white items-center">
        <Text className="text-[#6366F1] text-xs font-semibold">View Match Details</Text>
      </View>
    </TouchableOpacity>
  );
}
