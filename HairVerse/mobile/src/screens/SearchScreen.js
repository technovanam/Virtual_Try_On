import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useSearchStore } from '../store/searchStore';
import SearchResultCard from '../components/SearchResultCard';
import { Ionicons } from '@expo/vector-icons';

const SkeletonCard = () => (
  <View style={styles.skeletonCard}>
    <View style={styles.skeletonImage} />
    <View style={styles.skeletonTextContainer}>
      <View style={[styles.skeletonLine, { width: '30%', marginBottom: 8 }]} />
      <View style={[styles.skeletonLine, { width: '80%', height: 16, marginBottom: 8 }]} />
      <View style={[styles.skeletonLine, { width: '50%' }]} />
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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6D28D9" />
        </View>
      );
    }

    return (
      <View style={styles.initialContainer}>
        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Searches</Text>
              <TouchableOpacity onPress={clearRecentSearches} activeOpacity={0.6}>
                <Text style={styles.clearAllText}>Clear All</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.recentList}>
              {recentSearches.map((search, idx) => (
                <View key={idx} style={styles.recentItem}>
                  <TouchableOpacity 
                    style={styles.recentItemLeft}
                    onPress={() => setSearchInput(search)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="time-outline" size={18} color="#94A3B8" />
                    <Text style={styles.recentItemText}>{search}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => removeRecentSearch(search)} 
                    style={styles.removeItemButton}
                    activeOpacity={0.6}
                  >
                    <Ionicons name="close" size={16} color="#94A3B8" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Trending Searches */}
        {trendingSearches.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="trending-up" size={18} color="#6D28D9" />
              <Text style={[styles.sectionTitle, { marginLeft: 6 }]}>Trending Now</Text>
            </View>
            <View style={styles.trendingList}>
              {trendingSearches.map((trend, idx) => (
                <TouchableOpacity 
                  key={idx} 
                  style={styles.trendBadge}
                  onPress={() => setSearchInput(trend)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.trendBadgeText}>{trend}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Categories */}
        {categories.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Explore Categories</Text>
            <View style={styles.trendingList}>
              {categories.map((cat, idx) => (
                <TouchableOpacity 
                  key={idx} 
                  style={styles.categoryBadge}
                  onPress={() => handleCategoryPress(cat)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.categoryBadgeText}>{cat}</Text>
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
      <View style={styles.footerLoader}>
        {isLoading && <ActivityIndicator size="small" color="#6D28D9" />}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header / Search Bar */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={22} color="#1E293B" />
        </TouchableOpacity>
        
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search hairstyles, categories..."
            placeholderTextColor="#94A3B8"
            value={searchInput}
            onChangeText={setSearchInput}
            autoFocus
          />
          {searchInput.length > 0 && (
            <TouchableOpacity onPress={() => setSearchInput('')} style={styles.clearButton} activeOpacity={0.6}>
              <View style={styles.clearIconBg}>
                <Ionicons name="close" size={12} color="#ffffff" />
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.body}>
        {/* Initial State (No search input yet) */}
        {!searchInput.trim() && !isLoading && results.length === 0 ? (
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {renderInitialState()}
          </ScrollView>
        ) : (
          /* Search Results List */
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={() => (
              <>
                {/* Loading State for initial search */}
                {isLoading && results.length === 0 && (
                  <View style={{ marginTop: 4 }}>
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                  </View>
                )}

                {/* Error State */}
                {!isLoading && error && (
                  <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
                    <Text style={styles.errorText}>
                      {error}
                    </Text>
                    <TouchableOpacity 
                      style={styles.retryButton}
                      onPress={() => performSearch(searchInput)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.retryButtonText}>Retry Search</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Empty State */}
                {!isLoading && !error && results.length === 0 && (
                  <View style={styles.emptyContainer}>
                    <View style={styles.emptyIconBg}>
                      <Ionicons name="search" size={32} color="#CBD5E1" />
                    </View>
                    <Text style={styles.emptyTitle}>No results found</Text>
                    <Text style={styles.emptySubtitle}>
                      We couldn't find anything matching your search. Try adjusting your keywords.
                    </Text>
                  </View>
                )}

                {/* Success Header */}
                {!isLoading && !error && results.length > 0 && (
                  <Text style={styles.resultsHeader}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: '#1E293B',
    marginLeft: 8,
    height: '100%',
    padding: 0,
  },
  clearButton: {
    padding: 4,
  },
  clearIconBg: {
    backgroundColor: '#CBD5E1',
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  body: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 110,
  },
  loadingContainer: {
    marginTop: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialContainer: {
    paddingBottom: 20,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: 'Poppins_700Bold',
    color: '#1E293B',
  },
  clearAllText: {
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
    color: '#94A3B8',
  },
  recentList: {
    marginTop: 4,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  recentItemLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  recentItemText: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: '#475569',
    marginLeft: 10,
  },
  removeItemButton: {
    padding: 6,
  },
  trendingList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  trendBadge: {
    backgroundColor: '#F5F3FF',
    borderWidth: 1,
    borderColor: '#EDE9FE',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  trendBadgeText: {
    color: '#6D28D9',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
  },
  categoryBadge: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  categoryBadgeText: {
    color: '#475569',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
  },
  skeletonCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  skeletonImage: {
    width: 76,
    height: 76,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
    marginRight: 16,
  },
  skeletonTextContainer: {
    flex: 1,
  },
  skeletonLine: {
    height: 12,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    marginTop: 40,
  },
  errorText: {
    color: '#EF4444',
    fontFamily: 'Poppins_500Medium',
    textAlign: 'center',
    marginVertical: 12,
    fontSize: 14,
  },
  retryButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#ffffff',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
  },
  emptyIconBg: {
    width: 72,
    height: 72,
    backgroundColor: '#F8FAFC',
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: 'Poppins_700Bold',
    color: '#1E293B',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 18,
  },
  resultsHeader: {
    fontSize: 10,
    fontFamily: 'Poppins_700Bold',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 4,
  },
  footerLoader: {
    paddingVertical: 16,
    alignItems: 'center',
  },
});
