import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, Image, ActivityIndicator } from 'react-native';
import { useSavedStore } from '../store/savedStore';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const SavedItemCard = ({ item, onPress, onDelete }) => {
  return (
    <TouchableOpacity 
      className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4 flex-row items-center"
      onPress={onPress}
      activeOpacity={0.7}
    >
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} className="w-20 h-20 rounded-xl mr-4 bg-gray-100" />
      ) : (
        <View className="w-20 h-20 rounded-xl bg-gray-100 justify-center items-center mr-4">
          <Ionicons name="image-outline" size={24} color="#9CA3AF" />
        </View>
      )}
      <View className="flex-1">
        <View className="bg-indigo-50 self-start px-2 py-1 rounded-md mb-2">
          <Text className="text-indigo-600 text-xs font-semibold capitalize">{item.itemType}</Text>
        </View>
        <Text className="text-base font-bold text-gray-900 mb-1" numberOfLines={1}>{item.title}</Text>
        <Text className="text-xs text-gray-500">
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
      <TouchableOpacity className="p-2" onPress={onDelete}>
        <Ionicons name="trash-outline" size={22} color="#EF4444" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default function SavedCollectionsScreen() {
  const { items, isLoading, error, fetchSavedItems, deleteItem } = useSavedStore();
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('favorites');

  useEffect(() => {
    fetchSavedItems();
  }, []);

  const tabs = [
    { id: 'favorites', label: 'Favorites' },
    { id: 'hairstyle', label: 'Hairstyles' },
    { id: 'tryon', label: 'Try-Ons' },
    { id: 'comparison', label: 'Comparisons' }
  ];

  const filteredItems = items.filter(item => {
    if (activeTab === 'favorites') return true;
    return item.itemType === activeTab;
  });

  const handleOpenItem = (item) => {
    if (item.itemType === 'hairstyle') {
      navigation.navigate('HairstyleDetails', { hairstyleId: item.referenceId });
    } else if (item.itemType === 'tryon') {
      navigation.navigate('VirtualTryOn', { sessionId: item.referenceId });
    } else if (item.itemType === 'comparison') {
      navigation.navigate('CompareHairstyles', { historyId: item.referenceId });
    }
  };

  const handleDelete = (savedId) => {
    deleteItem(savedId);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-5 pt-4 pb-2 bg-white flex-row items-center border-b border-gray-100">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">Saved Collections</Text>
      </View>

      <View className="bg-white border-b border-gray-100">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 py-3">
          {tabs.map(tab => (
            <TouchableOpacity 
              key={tab.id}
              className={`px-4 py-2 rounded-full mr-3 border ${activeTab === tab.id ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-gray-200'}`}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text className={`font-semibold ${activeTab === tab.id ? 'text-white' : 'text-gray-600'}`}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView className="flex-1" contentContainerClassName="px-5 pt-6 pb-28" showsVerticalScrollIndicator={false}>
        {isLoading && (
          <View className="py-10 items-center justify-center">
            <ActivityIndicator size="large" color="#4F46E5" />
          </View>
        )}

        {!isLoading && error && (
          <View className="bg-red-50 p-6 rounded-2xl items-center justify-center border border-red-100 mb-6">
            <Ionicons name="alert-circle-outline" size={32} color="#EF4444" className="mb-2" />
            <Text className="text-red-500 font-medium text-center mb-4">{error}</Text>
            <TouchableOpacity className="bg-red-500 px-6 py-2 rounded-lg" onPress={fetchSavedItems}>
              <Text className="text-white font-bold">Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {!isLoading && !error && filteredItems.length === 0 && (
          <View className="bg-white p-10 rounded-3xl items-center justify-center border border-gray-100 shadow-sm mt-10">
            <View className="w-20 h-20 bg-indigo-50 rounded-full items-center justify-center mb-4">
              <Ionicons name="bookmark-outline" size={32} color="#4F46E5" />
            </View>
            <Text className="text-xl font-bold text-gray-900 mb-2">No saved items yet.</Text>
            <Text className="text-gray-500 text-center mb-8">
              Items you save will appear here for quick access later.
            </Text>
            <TouchableOpacity 
              className="bg-indigo-600 py-3.5 px-8 rounded-xl shadow-md w-full items-center"
              onPress={() => navigation.navigate('Search')}
            >
              <Text className="text-white font-bold text-base">Explore Hairstyles</Text>
            </TouchableOpacity>
          </View>
        )}

        {!isLoading && !error && filteredItems.length > 0 && (
          <View className="pb-10">
            {filteredItems.map(item => (
              <SavedItemCard 
                key={item.savedId} 
                item={item} 
                onPress={() => handleOpenItem(item)}
                onDelete={() => handleDelete(item.savedId)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
