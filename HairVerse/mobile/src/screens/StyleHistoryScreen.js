import React, { useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator, StyleSheet } from 'react-native';
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
        // Handle other routes or fallback
        break;
    }
  };

  const renderFilter = ({ item }) => (
    <TouchableOpacity
      onPress={() => setFilterType(item.id)}
      className={`px-4 py-2 rounded-full mr-2 ${filterType === item.id ? 'bg-primary' : 'bg-surface border border-borderLight'}`}
    >
      <Text className={`font-medium ${filterType === item.id ? 'text-white' : 'text-textSecondary'}`}>
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
        activeOpacity={0.7}
        onPress={() => handleOpenActivity(item)}
        className="flex-row px-4 mb-2"
      >
        {/* Timeline Line & Icon */}
        <View className="items-center mr-4 w-8">
          <View className="w-8 h-8 rounded-full bg-surface border border-borderLight items-center justify-center z-10 bg-white">
            <Ionicons name={getIconForType(item.eventType)} size={16} color="#0F172A" />
          </View>
          {!isLast && <View className="w-0.5 flex-1 bg-borderLight -mt-2" />}
        </View>

        {/* Card Content */}
        <View className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-borderLight mb-4">
          <View className="flex-row justify-between items-start mb-2">
            <View className="flex-1">
              <Text className="text-textPrimary font-bold text-base">{item.title}</Text>
              <Text className="text-textSecondary text-xs mt-1">
                {new Date(item.createdAt).toLocaleString()}
              </Text>
            </View>
            <TouchableOpacity className="p-1 -mr-2 -mt-2">
              <Ionicons name="ellipsis-horizontal" size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <Text className="text-textSecondary text-sm mb-3">{item.description}</Text>

          {item.imageUrl && (
            <Image 
              source={{ uri: item.imageUrl }} 
              className="w-full h-40 rounded-xl bg-surface"
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
        <ActivityIndicator size="large" color="#0F172A" />
        <Text className="mt-4 text-textSecondary font-medium">Loading your history...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-borderLight">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2">
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-textPrimary">Style History</Text>
        <TouchableOpacity className="p-2 -mr-2">
          <Ionicons name="search-outline" size={24} color="#0F172A" />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View className="bg-white border-b border-borderLight py-3">
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
            <View className="flex-1 justify-center items-center px-6 py-20">
              <Ionicons name="time-outline" size={64} color="#CBD5E1" />
              <Text className="text-textPrimary font-bold text-xl mt-4">No activity yet</Text>
              <Text className="text-textSecondary text-center mt-2 mb-8">
                Your styling history will appear here once you start exploring.
              </Text>
              <TouchableOpacity 
                className="bg-primary px-6 py-3 rounded-full"
                onPress={() => navigation.navigate('LiveCamera')}
              >
                <Text className="text-white font-bold text-base">Start Your First Analysis</Text>
              </TouchableOpacity>
            </View>
          )
        }
        ListFooterComponent={
          loadingMore ? (
            <View className="py-4 items-center">
              <ActivityIndicator size="small" color="#0F172A" />
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}
