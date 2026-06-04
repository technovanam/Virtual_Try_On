import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSearchStore } from '../store/searchStore';
import SearchResultCard from '../components/SearchResultCard';
import Svg, { Path, Circle, Polyline, Clock } from 'react-native-svg';

const BackIcon = ({ color, size }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Polyline points="15 18 9 12 15 6" />
  </Svg>
);

const SearchIcon = ({ color, size }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="11" cy="11" r="8" />
    <Path d="m21 21-4.3-4.3" />
  </Svg>
);

const ClockIcon = ({ color, size }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="12" r="10" />
    <Polyline points="12 6 12 12 16 14" />
  </Svg>
);

const TrendingIcon = ({ color, size }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <Polyline points="17 6 23 6 23 12" />
  </Svg>
);

const SkeletonCard = () => (
  <View className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-4 flex-row items-center">
    <View className="w-20 h-20 rounded-xl bg-gray-200 mr-4" />
    <View className="flex-1">
      <View className="h-3 bg-gray-200 rounded w-1/4 mb-2" />
      <View className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
      <View className="h-4 bg-gray-200 rounded w-1/2" />
    </View>
  </View>
);

export default function SearchScreen() {
  const navigation = useNavigation();
  const { 
    query, results, total, isLoading, isInitialLoading, error, hasMore,
    recentSearches, trendingSearches, categories,
    fetchInitialData, performSearch, clearSearch, removeRecentSearch, clearRecentSearches
  } = useSearchStore();
  const [searchInput, setSearchInput] = useState(query);

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Debounce search input
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchInput.trim().length > 0) {
        performSearch(searchInput);
      } else {
        clearSearch();
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchInput]);

  const handleCategoryPress = (category) => {
    setSearchInput("");
    performSearch("", category);
  };

  const renderInitialState = () => {
    if (isInitialLoading) {
      return (
        <View className="mt-10 items-center justify-center">
          <ActivityIndicator size="large" color="#1a1a1a" />
        </View>
      );
    }

    return (
      <View className="pb-10">
        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-bold text-gray-900">Recent Searches</Text>
              <TouchableOpacity onPress={clearRecentSearches}>
                <Text className="text-sm font-semibold text-gray-500">Clear All</Text>
              </TouchableOpacity>
            </View>
            <View>
              {recentSearches.map((search, idx) => (
                <View key={idx} className="flex-row items-center justify-between py-3 border-b border-gray-100">
                  <TouchableOpacity 
                    className="flex-1 flex-row items-center"
                    onPress={() => setSearchInput(search)}
                  >
                    <ClockIcon size={18} color="#8e8e93" />
                    <Text className="text-base text-gray-700 ml-3">{search}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => removeRecentSearch(search)} className="p-2">
                    <Text className="text-gray-400 font-bold">X</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Trending Searches */}
        {trendingSearches.length > 0 && (
          <View className="mb-8">
            <View className="flex-row items-center mb-4">
              <TrendingIcon size={20} color="#ff3b30" />
              <Text className="text-lg font-bold text-gray-900 ml-2">Trending Now</Text>
            </View>
            <View className="flex-row flex-wrap">
              {trendingSearches.map((trend, idx) => (
                <TouchableOpacity 
                  key={idx} 
                  className="bg-red-50 border border-red-100 py-2.5 px-4 rounded-full mr-3 mb-3"
                  onPress={() => setSearchInput(trend)}
                >
                  <Text className="text-red-600 font-medium">{trend}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Categories */}
        {categories.length > 0 && (
          <View>
            <Text className="text-lg font-bold text-gray-900 mb-4">Explore Categories</Text>
            <View className="flex-row flex-wrap">
              {categories.map((cat, idx) => (
                <TouchableOpacity 
                  key={idx} 
                  className="bg-white border border-gray-200 py-2.5 px-5 rounded-full mr-3 mb-3 shadow-sm"
                  onPress={() => handleCategoryPress(cat)}
                >
                  <Text className="text-gray-700 font-semibold">{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderFooter = () => {
    if (!hasMore) return null;
    return (
      <View className="py-4 mt-2">
        {isLoading && <ActivityIndicator size="small" color="#1a1a1a" />}
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      {/* Header / Search Bar */}
      <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
        <TouchableOpacity 
          className="mr-3 w-10 h-10 justify-center items-center rounded-full bg-gray-50"
          onPress={() => navigation.goBack()}
        >
          <BackIcon size={24} color="#1a1a1a" />
        </TouchableOpacity>
        
        <View className="flex-1 flex-row items-center bg-[#f4f5f7] rounded-2xl px-4 h-[50px]">
          <SearchIcon size={20} color="#8e8e93" />
          <TextInput
            className="flex-1 text-base text-[#1a1a1a] ml-2 h-full"
            placeholder="Search hairstyles, categories..."
            placeholderTextColor="#8e8e93"
            value={searchInput}
            onChangeText={setSearchInput}
            autoFocus
          />
          {searchInput.length > 0 && (
            <TouchableOpacity onPress={() => setSearchInput('')} className="p-1">
              <View className="bg-gray-300 rounded-full w-5 h-5 justify-center items-center">
                <Text className="text-white text-xs font-bold">X</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View className="flex-1 bg-[#FAFAFA]">
        {/* Initial State (No search input yet) */}
        {!searchInput.trim() && !isLoading && results.length === 0 ? (
          <ScrollView 
            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
          >
            {renderInitialState()}
          </ScrollView>
        ) : (
          /* Search Results List */
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 110 }}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={() => (
              <>
                {/* Loading State for initial search */}
                {isLoading && results.length === 0 && (
                  <View className="mt-2">
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                  </View>
                )}

                {/* Error State */}
                {!isLoading && error && (
                  <View className="bg-red-50 p-6 rounded-2xl items-center justify-center border border-red-100 mt-10">
                    <Text className="text-red-500 font-medium text-center mb-4 text-base">
                      {error}
                    </Text>
                    <TouchableOpacity 
                      className="bg-red-500 py-3 px-8 rounded-xl shadow-sm"
                      onPress={() => performSearch(searchInput)}
                    >
                      <Text className="text-white font-bold text-base">Retry Search</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Empty State */}
                {!isLoading && !error && results.length === 0 && (
                  <View className="items-center justify-center mt-20">
                    <View className="w-24 h-24 bg-gray-100 rounded-full justify-center items-center mb-6">
                      <SearchIcon size={40} color="#cbd5e1" />
                    </View>
                    <Text className="text-xl font-bold text-gray-900 mb-2">No results found</Text>
                    <Text className="text-gray-500 text-center px-10">
                      We couldn't find anything matching your search. Try adjusting your keywords.
                    </Text>
                  </View>
                )}

                {/* Success Header */}
                {!isLoading && !error && results.length > 0 && (
                  <Text className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4 ml-1">
                    {total} Results found
                  </Text>
                )}
              </>
            )}
            renderItem={({ item }) => (
              <SearchResultCard 
                result={item} 
                onPress={(r) => navigation.navigate('HairstyleDetails', { id: r.id })}
              />
            )}
            onEndReached={() => {
              if (hasMore && !isLoading) {
                performSearch(searchInput, null, null, true);
              }
            }}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
