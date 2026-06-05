import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, TextInput, Alert, SafeAreaView } from 'react-native';
import { useRecommendationStore } from '../store/recommendationStore';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import RecommendationSection from '../components/RecommendationSection';

const getPlaceholderImage = (category, fallback) => {
  if (!category) return fallback;
  const cat = category.toLowerCase();
  if (cat.includes('short')) return 'https://images.unsplash.com/photo-1599839619722-39751411ea63?q=80&w=400&auto=format&fit=crop';
  if (cat.includes('long')) return 'https://images.unsplash.com/photo-1595475884562-073cda88ec13?q=80&w=400&auto=format&fit=crop';
  if (cat.includes('medium')) return 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?q=80&w=400&auto=format&fit=crop';
  if (cat.includes('curly')) return 'https://images.unsplash.com/photo-1605384318063-42e12816999a?q=80&w=400&auto=format&fit=crop';
  return fallback || 'https://images.unsplash.com/photo-1560060141-7b9018741cb7?q=80&w=400&auto=format&fit=crop';
};

export default function RecommendationResultsScreen({ navigation }) {
  const { 
    summary,
    recommendations,
    hairColors,
    beards,
    celebrities,
    trending,
    searchQuery,
    setSearchQuery,
    activeCategory,
    setActiveCategory,
    isLoading, 
    isGenerating, 
    status, 
    error, 
    fetchRecommendations,
    generateRecommendations
  } = useRecommendationStore();

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const handleRefresh = async () => {
    await generateRecommendations();
  };

  const categories = ['All', 'Short', 'Medium', 'Long', 'Trendy', 'Classic', 'Low Maintenance'];

  // Filtering Logic
  const filteredRecommendations = recommendations.filter(rec => {
    const matchesSearch = rec.hairstyleName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          rec.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesCategory = true;
    if (activeCategory !== 'All') {
      if (activeCategory === 'Low Maintenance') {
        matchesCategory = rec.maintenanceLevel.toLowerCase() === 'low';
      } else {
        matchesCategory = rec.category.toLowerCase().includes(activeCategory.toLowerCase());
      }
    }
    
    return matchesSearch && matchesCategory;
  });

  if (isLoading || isGenerating) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#ec4899" />
        <Text style={styles.loadingText}>
          {isGenerating ? "Analyzing your profile & generating styles..." : "Loading recommendations..."}
        </Text>
      </View>
    );
  }

  if (status === 'error') {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
        <Text style={styles.errorText}>Oops! Something went wrong.</Text>
        <Text style={styles.errorSubText}>{error}</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={fetchRecommendations}>
          <Text style={styles.primaryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (status === 'empty' || recommendations.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Image 
          source={{ uri: 'https://cdn-icons-png.flaticon.com/512/7481/7481372.png' }} 
          style={styles.emptyImage}
        />
        <Text style={styles.emptyTitle}>No recommendations available yet.</Text>
        <Text style={styles.emptySubTitle}>Let our AI analyze your features to find your perfect hairstyle.</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('SelfieUpload')}>
          <Text style={styles.primaryButtonText}>Analyze Selfie</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Sticky Header with Search and Filters */}
      <View style={styles.stickyHeader}>
        <Text style={styles.pageTitle}>Your AI Stylist</Text>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#94a3b8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search hairstyles, colors..."
            placeholderTextColor="#64748b"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {categories.map(cat => (
            <TouchableOpacity 
              key={cat} 
              style={[styles.filterChip, activeCategory === cat && styles.filterChipActive]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text style={[styles.filterText, activeCategory === cat && styles.filterTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* AI Summary Card */}
        {summary ? (
          <LinearGradient colors={['#4f46e5', '#ec4899']} style={styles.summaryCard} start={{x:0, y:0}} end={{x:1, y:1}}>
            <View style={styles.summaryHeader}>
              <Ionicons name="sparkles" size={24} color="#fff" />
              <Text style={styles.summaryTitle}>AI Summary</Text>
            </View>
            <Text style={styles.summaryText}>{summary}</Text>
          </LinearGradient>
        ) : null}

        {/* Recommended Hairstyles List */}
        <Text style={styles.sectionTitle}>Top Hairstyles</Text>
        {filteredRecommendations.length === 0 ? (
          <Text style={styles.noResultsText}>No styles found matching your criteria.</Text>
        ) : (
          filteredRecommendations.map((item, index) => (
            <View key={item.recommendationId || index} style={styles.card}>
              <Image source={{ uri: item.imageUrl || getPlaceholderImage(item.category) }} style={styles.cardImage} />
              <LinearGradient colors={['transparent', 'rgba(15,23,42,0.95)']} style={styles.cardGradient}>
                <View style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>{item.hairstyleName}</Text>
                    <View style={styles.scoreBadge}>
                      <Text style={styles.scoreText}>{item.suitabilityScore}% Match</Text>
                    </View>
                  </View>
                  <Text style={styles.cardCategory}>{item.category} • {item.maintenanceLevel} Maintenance</Text>
                  <Text style={styles.cardReason} numberOfLines={2}>{item.recommendationReason}</Text>

                  <View style={styles.cardActions}>
                    <TouchableOpacity style={styles.actionButtonSecondary} onPress={() => Alert.alert('Saved', 'Saved to Collections')}>
                      <Ionicons name="bookmark-outline" size={18} color="white" />
                      <Text style={styles.actionButtonSecondaryText}>Save</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButtonSecondary} onPress={() => navigation.navigate('CompareHairstyles')}>
                      <Ionicons name="git-compare-outline" size={18} color="white" />
                      <Text style={styles.actionButtonSecondaryText}>Compare</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButtonPrimary} onPress={() => navigation.navigate('VirtualTryOn', { hairstyle: item })}>
                      <Text style={styles.actionButtonPrimaryText}>Try Now</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </LinearGradient>
            </View>
          ))
        )}

        {/* Hair Colors Section */}
        <RecommendationSection 
          title="Hair Color Recommendations"
          data={hairColors}
          renderItem={(item, idx) => (
            <View key={idx} style={styles.colorCard}>
              <View style={[styles.colorSwatch, { backgroundColor: item.hexCode }]} />
              <Text style={styles.smallCardTitle}>{item.colorName}</Text>
              <Text style={styles.smallCardReason} numberOfLines={3}>{item.reason}</Text>
            </View>
          )}
        />

        {/* Beards Section */}
        <RecommendationSection 
          title="Beard Matches"
          subtitle="Tailored for your face shape"
          data={beards}
          renderItem={(item, idx) => (
            <View key={idx} style={styles.infoCard}>
              <Text style={styles.smallCardTitle}>{item.beardStyle}</Text>
              <Text style={styles.smallCardSubtitle}>{item.maintenanceLevel} Maintenance</Text>
              <Text style={styles.smallCardReason} numberOfLines={3}>{item.reason}</Text>
            </View>
          )}
        />

        {/* Celebrities Section */}
        <RecommendationSection 
          title="Celebrity Matches"
          data={celebrities}
          renderItem={(item, idx) => (
            <View key={idx} style={styles.celebCard}>
              <View style={styles.celebImagePlaceholder}>
                <Ionicons name="person" size={32} color="#64748b" />
              </View>
              <Text style={styles.smallCardTitle}>{item.celebrityName}</Text>
              <Text style={styles.smallCardSubtitle}>{item.matchScore}% Match</Text>
              <Text style={styles.smallCardReason} numberOfLines={2}>{item.reason}</Text>
            </View>
          )}
        />

        {/* Trending Section */}
        <RecommendationSection 
          title="Trending Now"
          data={trending}
          renderItem={(item, idx) => (
            <View key={idx} style={styles.infoCard}>
              <View style={styles.trendHeader}>
                <Ionicons name="trending-up" size={18} color="#10b981" />
                <Text style={styles.smallCardTitle}>{item.styleName}</Text>
              </View>
              <Text style={styles.smallCardReason} numberOfLines={3}>{item.trendReason}</Text>
            </View>
          )}
        />

        <TouchableOpacity style={[styles.primaryButton, styles.refreshButton]} onPress={handleRefresh}>
          <Text style={styles.primaryButtonText}>Regenerate Recommendations</Text>
        </TouchableOpacity>
        
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  centerContainer: { flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingText: { color: '#cbd5e1', marginTop: 16, fontSize: 16 },
  errorText: { color: '#f8fafc', fontSize: 20, fontWeight: 'bold', marginTop: 16, marginBottom: 8 },
  errorSubText: { color: '#94a3b8', textAlign: 'center', marginBottom: 24 },
  emptyImage: { width: 120, height: 120, marginBottom: 24, opacity: 0.7, tintColor: '#94a3b8' },
  emptyTitle: { color: '#f8fafc', fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  emptySubTitle: { color: '#94a3b8', textAlign: 'center', marginBottom: 32, fontSize: 15 },
  
  // Sticky Header
  stickyHeader: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    zIndex: 10,
  },
  pageTitle: { color: '#f8fafc', fontSize: 28, fontWeight: '800', marginBottom: 16 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  searchInput: { flex: 1, color: '#f8fafc', marginLeft: 8, fontSize: 16 },
  filterScroll: { gap: 8 },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1e293b',
    marginRight: 8,
  },
  filterChipActive: { backgroundColor: '#ec4899' },
  filterText: { color: '#cbd5e1', fontSize: 14, fontWeight: '500' },
  filterTextActive: { color: '#ffffff', fontWeight: 'bold' },

  scrollContent: { padding: 20, paddingBottom: 60 },
  sectionTitle: { color: '#f8fafc', fontSize: 22, fontWeight: 'bold', marginBottom: 16, marginTop: 8 },
  noResultsText: { color: '#94a3b8', fontSize: 16, textAlign: 'center', marginVertical: 20 },

  summaryCard: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 24,
    shadowColor: '#ec4899',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  summaryHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  summaryTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  summaryText: { color: '#fff', fontSize: 15, lineHeight: 22, opacity: 0.9 },

  card: { width: '100%', height: 340, borderRadius: 24, overflow: 'hidden', marginBottom: 24, backgroundColor: '#1e293b' },
  cardImage: { width: '100%', height: '100%', position: 'absolute' },
  cardGradient: { flex: 1, justifyContent: 'flex-end', padding: 20 },
  cardContent: { gap: 8 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { color: 'white', fontSize: 24, fontWeight: 'bold', flex: 1 },
  scoreBadge: { backgroundColor: '#10b981', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  scoreText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  cardCategory: { color: '#cbd5e1', fontSize: 14, fontWeight: '500' },
  cardReason: { color: '#94a3b8', fontSize: 13, lineHeight: 18, marginBottom: 8 },
  
  cardActions: { flexDirection: 'row', gap: 10, marginTop: 8 },
  actionButtonPrimary: { flex: 2, backgroundColor: '#ec4899', paddingVertical: 12, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  actionButtonPrimaryText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
  actionButtonSecondary: { flex: 1.5, backgroundColor: 'rgba(255,255,255,0.15)', paddingVertical: 12, borderRadius: 20, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6 },
  actionButtonSecondaryText: { color: 'white', fontWeight: 'bold', fontSize: 13 },

  // Small Cards for Sections
  colorCard: { width: 140, backgroundColor: '#1e293b', borderRadius: 16, padding: 16 },
  colorSwatch: { width: '100%', height: 60, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#334155' },
  
  infoCard: { width: 220, backgroundColor: '#1e293b', borderRadius: 16, padding: 16 },
  
  celebCard: { width: 160, backgroundColor: '#1e293b', borderRadius: 16, padding: 16, alignItems: 'center' },
  celebImagePlaceholder: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#334155', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  
  smallCardTitle: { color: '#f8fafc', fontWeight: 'bold', fontSize: 16, marginBottom: 4, textAlign: 'left' },
  smallCardSubtitle: { color: '#10b981', fontSize: 13, fontWeight: 'bold', marginBottom: 8 },
  smallCardReason: { color: '#94a3b8', fontSize: 13, lineHeight: 18 },
  
  trendHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },

  primaryButton: { backgroundColor: '#ec4899', paddingVertical: 14, paddingHorizontal: 32, borderRadius: 30, alignItems: 'center' },
  primaryButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  refreshButton: { marginTop: 10, backgroundColor: '#3b82f6' },
});
