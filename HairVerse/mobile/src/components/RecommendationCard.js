import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DownloadButton from './DownloadButton';
import ShareButton from './ShareButton';

export default function RecommendationCard({
  hairstyleId,
  hairstyleName,
  suitabilityScore,
  maintenanceLevel,
  previewImage,
  category,
  trending,
  onPress
}) {
  return (
    <TouchableOpacity 
      className="bg-white rounded-2xl mb-4 shadow-sm overflow-hidden border border-[#F1F5F9]" 
      style={{ elevation: 3 }}
      onPress={onPress} 
      activeOpacity={0.9}
    >
      <View className="h-[180px] w-full bg-[#F8FAFC] relative">
        {previewImage ? (
          <Image source={{ uri: previewImage }} className="w-full h-full" resizeMode="cover" />
        ) : (
          <View className="w-full h-full justify-center items-center">
            <Ionicons name="image-outline" size={32} color="#CBD5E1" />
          </View>
        )}
        
        {trending && (
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

        <View className="absolute bottom-3 right-3 flex-row gap-2">
          <DownloadButton 
            imageUrl={previewImage} 
            resourceType="recommendation" 
            resourceId={hairstyleId} 
            className="bg-white/90 p-2 rounded-full shadow-sm" 
            iconSize={16} 
          />
          <ShareButton 
            imageUrl={previewImage} 
            resourceType="recommendation" 
            resourceId={hairstyleId} 
            title={`Check out this recommended hairstyle: ${hairstyleName}`}
            className="bg-white/90 p-2 rounded-full shadow-sm" 
            iconSize={16} 
          />
        </View>
      </View>

      <View className="p-4">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-lg font-bold text-[#0F172A] flex-1 mr-2" numberOfLines={1}>{hairstyleName || 'Hairstyle'}</Text>
          <View className="bg-[#ECFDF5] px-2 py-1 rounded-lg">
            <Text className="text-[#10B981] text-xs font-bold">{suitabilityScore || '0'}% Match</Text>
          </View>
        </View>

        <View className="flex-row items-center">
          <View className="flex-row items-center gap-1">
            <Ionicons name="time-outline" size={14} color="#64748B" />
            <Text className="text-[#64748B] text-[13px]">{maintenanceLevel || 'Medium'} Maintenance</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
