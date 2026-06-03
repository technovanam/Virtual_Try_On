import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';

export default function SearchResultCard({ result, onPress }) {
  if (!result) return null;

  return (
    <TouchableOpacity 
      className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-4 flex-row items-center"
      onPress={() => onPress && onPress(result)}
    >
      <View className="w-20 h-20 rounded-xl bg-gray-100 mr-4 items-center justify-center overflow-hidden">
        {result.image ? (
          <Image source={{ uri: result.image }} className="w-full h-full" resizeMode="cover" />
        ) : (
          <Text className="text-gray-400 text-xs text-center px-1">No Image</Text>
        )}
      </View>

      <View className="flex-1 justify-center">
        <Text className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">
          {result.type}
        </Text>
        <Text className="text-gray-900 font-bold text-lg leading-tight mb-1" numberOfLines={1}>
          {result.title}
        </Text>
        
        <View className="flex-row items-center mt-1">
          {result.category && (
            <View className="bg-indigo-50 px-2 py-1 rounded-md mr-2">
              <Text className="text-indigo-600 text-[10px] font-bold uppercase">{result.category}</Text>
            </View>
          )}
          
          {result.popularityScore > 0 && (
            <Text className="text-orange-500 text-xs font-semibold">
              ★ {result.popularityScore}
            </Text>
          )}
        </View>

        {result.tags && result.tags.length > 0 && (
          <Text className="text-gray-400 text-xs mt-2" numberOfLines={1}>
            {result.tags.join(' • ')}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}
