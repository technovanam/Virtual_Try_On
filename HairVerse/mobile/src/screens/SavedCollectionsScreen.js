import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, Image, ActivityIndicator, TextInput, Modal } from 'react-native';
import { useSavedStore } from '../store/savedStore';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const SavedItemCard = ({ item, onOpenMenu }) => {
  return (
    <TouchableOpacity 
      className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4 flex-row items-center"
      onPress={() => onOpenMenu(item, 'open')}
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
        <View className="flex-row justify-between items-start mb-1">
          <View className="bg-indigo-50 px-2 py-1 rounded-md">
            <Text className="text-indigo-600 text-[10px] font-bold uppercase tracking-wider">{item.category}</Text>
          </View>
          <View className="flex-row items-center">
             <Ionicons name="eye-outline" size={12} color="#9CA3AF" className="mr-1" />
             <Text className="text-gray-400 text-xs">{item.viewCount}</Text>
          </View>
        </View>
        <Text className="text-base font-bold text-gray-900 mb-1" numberOfLines={1}>{item.title}</Text>
        <View className="flex-row items-center justify-between">
           <Text className="text-xs text-gray-500">
             {new Date(item.createdAt).toLocaleDateString()}
           </Text>
           {item.matchScore > 0 && (
              <Text className="text-xs font-bold text-emerald-600">{item.matchScore}% Match</Text>
           )}
        </View>
      </View>
      <TouchableOpacity className="p-2 ml-2" onPress={() => onOpenMenu(item, 'menu')}>
        <Ionicons name="ellipsis-vertical" size={20} color="#9CA3AF" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default function SavedCollectionsScreen() {
  const { 
    isLoading, error, fetchSavedItems, deleteItem, updateItemCategory,
    searchQuery, setSearchQuery, sortBy, setSortBy, 
    activeTab, setActiveTab, activeCategory, setActiveCategory,
    getFilteredItems, getUniqueCategories 
  } = useSavedStore();
  
  const navigation = useNavigation();
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    fetchSavedItems();
  }, []);

  const tabs = [
    { id: 'favorites', label: 'Favorites', icon: 'heart' },
    { id: 'history', label: 'History', icon: 'time' },
    { id: 'comparison', label: 'Comparisons', icon: 'git-compare' },
    { id: 'haircolor', label: 'Hair Colors', icon: 'color-palette' },
    { id: 'beardstyle', label: 'Beards', icon: 'cut' }
  ];

  const filteredItems = getFilteredItems();
  const uniqueCategories = getUniqueCategories();

  const handleOpenItem = (item) => {
    if (item.itemType === 'hairstyle') {
      navigation.navigate('HairstyleDetails', { hairstyleId: item.referenceId });
    } else if (item.itemType === 'tryon') {
      navigation.navigate('VirtualTryOn', { sessionId: item.referenceId });
    } else if (item.itemType === 'comparison') {
      navigation.navigate('Comparison', { comparisonId: item.referenceId });
    } else if (item.itemType === 'analysis') {
      navigation.navigate('AIAnalysisResult', { analysisId: item.referenceId });
    }
  };

  const handleMenuAction = (item, actionType) => {
    if (actionType === 'open') {
      handleOpenItem(item);
    } else {
      setSelectedItem(item);
      setMenuVisible(true);
    }
  };

  const executeAction = (action) => {
    setMenuVisible(false);
    if (!selectedItem) return;

    switch (action) {
      case 'open':
        handleOpenItem(selectedItem);
        break;
      case 'delete':
        deleteItem(selectedItem.savedId);
        break;
      case 'move':
        // Quick mock logic: cycle category for demo purposes
        const newCat = selectedItem.category === 'Favorites' ? 'Archived' : 'Favorites';
        updateItemCategory(selectedItem.savedId, newCat);
        break;
      case 'try_again':
        navigation.navigate('VirtualTryOn', { hairstyleId: selectedItem.referenceId });
        break;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-5 pt-4 pb-2 bg-white flex-row items-center border-b border-gray-100">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900 flex-1">Saved Collections</Text>
      </View>

      {/* Search and Sort Row */}
      <View className="bg-white px-5 py-3 flex-row items-center space-x-3">
        <View className="flex-1 bg-gray-100 rounded-xl flex-row items-center px-3 py-2">
          <Ionicons name="search" size={18} color="#9CA3AF" />
          <TextInput 
            className="flex-1 ml-2 text-base text-gray-900"
            placeholder="Search saved items..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity 
          className="bg-gray-100 p-2.5 rounded-xl flex-row items-center"
          onPress={() => setSortBy(sortBy === 'newest' ? 'highest_match' : 'newest')}
        >
          <Ionicons name="filter" size={18} color="#4F46E5" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View className="bg-white border-b border-gray-100 pb-2">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 py-2">
          {tabs.map(tab => (
            <TouchableOpacity 
              key={tab.id}
              className={`flex-row items-center px-4 py-2 rounded-full mr-3 border ${activeTab === tab.id ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-gray-200'}`}
              onPress={() => setActiveTab(tab.id)}
            >
              <Ionicons name={tab.icon} size={16} color={activeTab === tab.id ? '#FFF' : '#6B7280'} className="mr-2" />
              <Text className={`font-semibold ${activeTab === tab.id ? 'text-white' : 'text-gray-600'}`}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Folders / Categories */}
      {uniqueCategories.length > 1 && (
        <View className="bg-white border-b border-gray-100 pb-2">
           <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-5 py-2">
              {uniqueCategories.map(cat => (
                 <TouchableOpacity 
                    key={cat}
                    className={`mr-4 pb-1 border-b-2 ${activeCategory === cat ? 'border-indigo-600' : 'border-transparent'}`}
                    onPress={() => setActiveCategory(cat)}
                 >
                    <Text className={`font-bold ${activeCategory === cat ? 'text-indigo-600' : 'text-gray-400'}`}>{cat}</Text>
                 </TouchableOpacity>
              ))}
           </ScrollView>
        </View>
      )}

      <ScrollView className="flex-1" contentContainerClassName="px-5 pt-4 pb-28" showsVerticalScrollIndicator={false}>
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
              <Ionicons name="folder-open-outline" size={32} color="#4F46E5" />
            </View>
            <Text className="text-xl font-bold text-gray-900 mb-2 text-center">No items found.</Text>
            <Text className="text-gray-500 text-center mb-8">
              {searchQuery ? `We couldn't find anything matching "${searchQuery}".` : 'Explore the app and save items to build your collection.'}
            </Text>
            <TouchableOpacity 
              className="bg-indigo-600 py-3.5 px-8 rounded-xl shadow-md w-full items-center"
              onPress={() => navigation.navigate('Recommendations')}
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
                onOpenMenu={handleMenuAction}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Action Bottom Sheet Modal */}
      <Modal visible={menuVisible} transparent animationType="fade">
         <View className="flex-1 bg-black/50 justify-end">
            <View className="bg-white rounded-t-3xl p-5 pb-10">
               <View className="flex-row justify-between items-center mb-6">
                  <Text className="text-xl font-bold text-gray-900">Options</Text>
                  <TouchableOpacity onPress={() => setMenuVisible(false)}>
                     <Ionicons name="close" size={24} color="#000" />
                  </TouchableOpacity>
               </View>

               <TouchableOpacity className="flex-row items-center py-4 border-b border-gray-100" onPress={() => executeAction('open')}>
                  <Ionicons name="eye-outline" size={22} color="#4B5563" className="mr-4" />
                  <Text className="text-gray-700 text-base font-medium">Open Item</Text>
               </TouchableOpacity>

               <TouchableOpacity className="flex-row items-center py-4 border-b border-gray-100" onPress={() => executeAction('try_again')}>
                  <Ionicons name="color-wand-outline" size={22} color="#4B5563" className="mr-4" />
                  <Text className="text-gray-700 text-base font-medium">Try Again</Text>
               </TouchableOpacity>

               <TouchableOpacity className="flex-row items-center py-4 border-b border-gray-100" onPress={() => executeAction('move')}>
                  <Ionicons name="folder-open-outline" size={22} color="#4B5563" className="mr-4" />
                  <Text className="text-gray-700 text-base font-medium">Move to Folder</Text>
               </TouchableOpacity>

               <TouchableOpacity className="flex-row items-center py-4" onPress={() => executeAction('delete')}>
                  <Ionicons name="trash-outline" size={22} color="#EF4444" className="mr-4" />
                  <Text className="text-red-500 text-base font-medium">Delete Item</Text>
               </TouchableOpacity>
            </View>
         </View>
      </Modal>

    </SafeAreaView>
  );
}
