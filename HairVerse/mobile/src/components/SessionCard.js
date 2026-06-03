import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';

export default function SessionCard({ session, onResume }) {
  if (!session) return null;

  // Format date correctly
  const formattedDate = new Date(session.updatedAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <View className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-4 flex-row items-center">
      {/* Thumbnail placeholder if no image exists */}
      <View className="w-16 h-16 rounded-xl bg-gray-100 mr-4 items-center justify-center overflow-hidden">
        {session.uploadedImage ? (
          <Image source={{ uri: session.uploadedImage }} className="w-full h-full" resizeMode="cover" />
        ) : (
          <Text className="text-gray-400 text-xs">No Image</Text>
        )}
      </View>

      <View className="flex-1">
        <Text className="text-gray-900 font-bold text-base mb-1" numberOfLines={1}>
          {session.selectedHairstyle || 'Untitled Session'}
        </Text>
        <Text className="text-gray-500 text-xs mb-2">
          Last modified: {formattedDate}
        </Text>
        
        {/* Progress Bar */}
        <View className="w-full h-1.5 bg-gray-100 rounded-full mb-1">
          <View 
            className="h-full bg-indigo-500 rounded-full" 
            style={{ width: `${Math.min(Math.max(session.progress || 0, 0), 100)}%` }} 
          />
        </View>
        <Text className="text-indigo-600 font-semibold text-xs text-right">
          {session.progress || 0}% Complete
        </Text>
      </View>

      <TouchableOpacity 
        className="ml-4 bg-indigo-50 py-2 px-4 rounded-lg"
        onPress={() => onResume && onResume(session)}
      >
        <Text className="text-indigo-700 font-bold text-sm">Resume</Text>
      </TouchableOpacity>
    </View>
  );
}
