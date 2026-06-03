import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSavedCollectionsStore } from '../store/savedCollectionsStore';
import CollectionCard from './CollectionCard';

const SkeletonCard = () => (
  <View className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 mb-4 flex-row items-center">
    <View className="w-16 h-16 rounded-xl bg-gray-200 mr-4" />
    <View className="flex-1">
      <View className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
      <View className="h-3 bg-gray-200 rounded w-1/2" />
    </View>
    <View className="w-8 h-8 rounded-full bg-gray-200" />
  </View>
);

export default function SavedCollectionsSection() {
  const { collections, isLoading, error, fetchCollections } = useSavedCollectionsStore();

  useEffect(() => {
    fetchCollections();
  }, []);

  return (
    <View className="mt-6 mb-2">
      <View className="flex-row justify-between items-end mb-4 px-1">
        <Text className="text-xl font-bold text-gray-900">Saved Collections</Text>
        {(!isLoading && !error && collections.length > 0) && (
          <TouchableOpacity>
            <Text className="text-blue-500 font-semibold">View All</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Loading State */}
      {isLoading && (
        <View>
          <SkeletonCard />
          <SkeletonCard />
        </View>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <View className="bg-red-50 p-6 rounded-2xl items-center justify-center border border-red-100">
          <Text className="text-red-500 font-medium text-center mb-3">
            {error || 'Failed to load collections.'}
          </Text>
          <TouchableOpacity 
            className="bg-red-500 py-2 px-6 rounded-xl"
            onPress={fetchCollections}
          >
            <Text className="text-white font-bold">Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Empty State */}
      {!isLoading && !error && collections.length === 0 && (
        <View className="bg-gray-50 p-8 rounded-2xl items-center justify-center border border-gray-200 border-dashed">
          <Text className="text-gray-500 font-medium text-center mb-4 text-base">
            No saved styles yet.
          </Text>
          <TouchableOpacity className="bg-blue-600 py-3 px-6 rounded-xl">
            <Text className="text-white font-bold">Explore Hairstyles</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Success State */}
      {!isLoading && !error && collections.length > 0 && (
        <View>
          {collections.map((collection) => (
            <CollectionCard 
              key={collection.collectionId} 
              collection={collection} 
              onPress={() => console.log('Open collection', collection.collectionId)}
            />
          ))}
        </View>
      )}
    </View>
  );
}
