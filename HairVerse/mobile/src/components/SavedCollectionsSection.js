import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useSavedStore } from '../store/savedStore';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function SavedCollectionsSection() {
  const { items, isLoading, error, fetchSavedItems } = useSavedStore();
  const navigation = useNavigation();

  useEffect(() => {
    fetchSavedItems();
  }, []);

  return (
    <View className="mt-6 mb-2">
      <View className="flex-row justify-between items-end mb-4 px-1">
        <Text className="text-xl font-bold text-gray-900">Saved Collections</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Saved')}>
          <Text className="text-blue-500 font-semibold">View All</Text>
        </TouchableOpacity>
      </View>

      {/* Loading State */}
      {isLoading && (
        <View className="py-4"><ActivityIndicator color="#4F46E5" /></View>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <View className="bg-red-50 p-4 rounded-xl items-center justify-center border border-red-100">
          <Text className="text-red-500">{error || 'Failed to load collections'}</Text>
        </View>
      )}

      {/* Empty State */}
      {!isLoading && !error && items.length === 0 && (
        <View className="bg-gray-50 p-8 rounded-2xl items-center justify-center border border-gray-200 border-dashed">
          <Text className="text-gray-500 font-medium text-center mb-4 text-base">
            No saved styles yet.
          </Text>
          <TouchableOpacity className="bg-blue-600 py-3 px-6 rounded-xl" onPress={() => navigation.navigate('Saved')}>
            <Text className="text-white font-bold">Go to Collections</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Success State */}
      {!isLoading && !error && items.length > 0 && (
        <View>
          {items.slice(0, 2).map((item) => (
            <TouchableOpacity 
              key={item.savedId}
              className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 mb-3 flex-row items-center"
              onPress={() => navigation.navigate('Saved')}
            >
              {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} className="w-12 h-12 rounded-lg mr-3 bg-gray-100" />
              ) : (
                <View className="w-12 h-12 rounded-lg bg-gray-100 justify-center items-center mr-3">
                  <Ionicons name="image-outline" size={16} color="#9CA3AF" />
                </View>
              )}
              <View className="flex-1">
                <Text className="text-sm font-bold text-gray-900 mb-0.5" numberOfLines={1}>{item.title}</Text>
                <Text className="text-xs text-gray-500 capitalize">{item.itemType}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}
