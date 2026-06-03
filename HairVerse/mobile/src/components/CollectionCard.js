import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export default function CollectionCard({ collection, onPress }) {
  // Use provided image or a fallback colored view
  const hasImage = Boolean(collection.hairstyleImage);

  return (
    <TouchableOpacity 
      className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 mb-4 flex-row items-center active:bg-gray-50"
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Image / Avatar */}
      <View className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 items-center justify-center mr-4">
        {hasImage ? (
          <Image 
            source={{ uri: collection.hairstyleImage }} 
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-full bg-blue-50 items-center justify-center">
            <Text className="text-blue-500 font-bold text-xl">
              {collection.collectionName.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View className="flex-1">
        <Text className="text-gray-900 font-semibold text-base mb-1" numberOfLines={1}>
          {collection.collectionName}
        </Text>
        
        <View className="flex-row items-center">
          <Text className="text-gray-500 text-xs mr-3">
            {collection.category}
          </Text>
          <Text className="text-gray-400 text-xs">
            Updated {formatDate(collection.savedAt)}
          </Text>
        </View>
      </View>

      {/* Quick Action Button */}
      <View className="w-8 h-8 rounded-full bg-gray-50 items-center justify-center border border-gray-200">
        <Text className="text-gray-500 text-lg leading-tight">→</Text>
      </View>
    </TouchableOpacity>
  );
}
