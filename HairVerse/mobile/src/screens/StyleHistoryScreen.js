import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useHistoryTimelineStore } from '../store/historyTimelineStore';

const FILTERS = [
  { id: 'All', label: 'All Activity' },
  { id: 'selfie_upload', label: 'Selfies' },
  { id: 'analysis', label: 'Analysis' },
  { id: 'recommendation', label: 'Recommendations' },
  { id: 'celebrity_match', label: 'Celebrity Matches' },
  { id: 'tryon', label: 'Try-Ons' },
  { id: 'saved_style', label: 'Saved Styles' },
  { id: 'comparison', label: 'Comparisons' }
];

export default function StyleHistoryScreen() {
  const navigation = useNavigation();
  const { 
    events, 
    loading, 
    loadingMore, 
    error, 
    filterType, 
    fetchTimeline, 
    loadMore, 
    setFilterType,
    clearEvents 
  } = useHistoryTimelineStore();

  useEffect(() => {
    fetchTimeline(true);
    return () => clearEvents();
  }, []);

  const handleOpenActivity = (item) => {
    switch(item.eventType) {
      case 'tryon':
        navigation.navigate('VirtualTryOnResultScreen', { tryOnId: item.referenceId });
        break;
      case 'comparison':
        navigation.navigate('ComparisonScreen', { tryOnId: item.referenceId });
        break;
      case 'analysis':
        navigation.navigate('AIInsights');
        break;
      case 'recommendation':
        navigation.navigate('Recommendations');
        break;
      case 'celebrity_match':
        navigation.navigate('CelebrityMatch');
        break;
      default:
        break;
    }
  };

  const renderFilter = ({ item }) => (
    <TouchableOpacity
      onPress={() => setFilterType(item.id)}
      className={`px-4 py-2 rounded-full mr-2 border ${filterType === item.id ? 'bg-purple-600 border-purple-600' : 'bg-white border-gray-200'}`}
      activeOpacity={0.7}
    >
      <Text className={`font-Poppins-SemiBold ${filterType === item.id ? 'text-white' : 'text-gray-600'}`}>
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  const getIconForType = (type) => {
    switch (type) {
      case 'selfie_upload': return 'camera-outline';
      case 'analysis': return 'scan-outline';
      case 'recommendation': return 'bulb-outline';
      case 'celebrity_match': return 'star-outline';
      case 'tryon': return 'color-wand-outline';
      case 'saved_style': return 'bookmark-outline';
      case 'comparison': return 'git-compare-outline';
      default: return 'time-outline';
    }
  };

  const renderEvent = ({ item, index }) => {
    const isLast = index === events.length - 1;
    
    return (
      <TouchableOpacity 
        activeOpacity={0.8}
        onPress={() => handleOpenActivity(item)}
        className="flex-row px-4 mb-2"
      >
        {/* Timeline Line & Icon */}
        <View className="items-center mr-4 w-8">
          <View className="w-8 h-8 rounded-full bg-purple-50 border border-purple-100 items-center justify-center z-10">
            <Ionicons name={getIconForType(item.eventType)} size={16} color="#6D28D9" />
          </View>
          {!isLast && <View className="w-0.5 flex-1 bg-gray-200 -mt-2" />}
        </View>

        {/* Card Content */}
        <View className="flex-1 bg-white rounded-3xl p-5 border border-gray-100 mb-4 shadow-sm">
          <View className="flex-row justify-between items-start mb-2">
            <View className="flex-1">
              <Text className="text-gray-900 font-Poppins-Bold text-base">{item.title}</Text>
              <Text className="text-gray-400 text-xs mt-1 font-Poppins">
                {new Date(item.createdAt).toLocaleString()}
              </Text>
            </View>
            <TouchableOpacity className="p-1 -mr-2 -mt-2">
              <Ionicons name="ellipsis-horizontal" size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <Text className="text-gray-600 text-sm mb-3 font-Poppins">{item.description}</Text>

          {item.imageUrl && (
            <Image 
              source={{ uri: item.imageUrl }} 
              className="w-full h-40 rounded-2xl bg-gray-50 border border-gray-100"
              resizeMode="cover"
            />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && events.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color="#6D28D9" />
        <Text className="mt-4 text-gray-500 font-Poppins-Medium">Loading your history...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4 bg-white border-b border-gray-100">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4 w-10 h-10 items-center justify-center bg-gray-50 rounded-full shadow-sm">
            <Ionicons name="arrow-back" size={20} color="#1F2937" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-gray-900 font-Poppins-Bold">Style History</Text>
        </View>
        <TouchableOpacity className="w-10 h-10 items-center justify-center bg-gray-50 rounded-full shadow-sm">
          <Ionicons name="search-outline" size={18} color="#1F2937" />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View className="bg-white border-b border-gray-100 py-3">
        <FlatList 
          horizontal
          showsHorizontalScrollIndicator={false}
          data={FILTERS}
          keyExtractor={(item) => item.id}
          renderItem={renderFilter}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        />
      </View>

      {/* Timeline List */}
      <FlatList
        data={events}
        keyExtractor={(item) => item.eventId}
        renderItem={renderEvent}
        contentContainerStyle={{ paddingTop: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          !loading && (
            <View className="flex-1 justify-center items-center px-6 py-20 bg-white mx-4 rounded-3xl border border-gray-100 shadow-sm mt-10">
              <View className="w-16 h-16 bg-gray-50 rounded-full items-center justify-center mb-4">
                <Ionicons name="time-outline" size={32} color="#94A3B8" />
              </View>
              <Text className="text-gray-900 font-Poppins-Bold text-lg">No activity yet</Text>
              <Text className="text-gray-500 text-center mt-2 mb-6 font-Poppins text-sm">
                Your styling history will appear here once you start exploring.
              </Text>
              <TouchableOpacity 
                className="bg-purple-600 px-6 py-3.5 rounded-full shadow-sm"
                onPress={() => navigation.navigate('LiveCamera')}
              >
                <Text className="text-white font-Poppins-Bold text-sm">Start Your First Analysis</Text>
              </TouchableOpacity>
            </View>
          )
        }
        ListFooterComponent={
          loadingMore ? (
            <View className="py-4 items-center">
              <ActivityIndicator size="small" color="#6D28D9" />
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}
