import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRecommendationStore } from '../store/recommendationStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const getPlaceholderImage = (category) => {
  const cat = category.toLowerCase();
  if (cat.includes('short')) return 'https://images.unsplash.com/photo-1599839619722-39751411ea63?q=80&w=400&auto=format&fit=crop';
  if (cat.includes('long')) return 'https://images.unsplash.com/photo-1595475884562-073cda88ec13?q=80&w=400&auto=format&fit=crop';
  if (cat.includes('medium')) return 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?q=80&w=400&auto=format&fit=crop';
  if (cat.includes('curly')) return 'https://images.unsplash.com/photo-1605384318063-42e12816999a?q=80&w=400&auto=format&fit=crop';
  return 'https://images.unsplash.com/photo-1560060141-7b9018741cb7?q=80&w=400&auto=format&fit=crop';
};

export default function RecommendationResultsScreen({ navigation, route }) {
  const { 
    recommendations, 
    isLoading, 
    isGenerating, 
    status, 
    error, 
    fetchRecommendations, 
    generateRecommendations 
  } = useRecommendationStore();

  useEffect(() => {
    // If navigating after an analysis, we could automatically trigger generateRecommendations(analysisId)
    // For now, let's just fetch existing. If empty, user can generate.
    fetchRecommendations();
  }, []);

  const handleRefresh = async () => {
    // Optionally pass an analysisId if you have it from route.params
    await generateRecommendations();
  };

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
        <TouchableOpacity 
          style={styles.primaryButton} 
          onPress={() => navigation.navigate('SelfieUpload')}
        >
          <Text style={styles.primaryButtonText}>Analyze Selfie</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Grouping the recommendations for sections
  const topStyles = recommendations.slice(0, 3);
  const alternativeStyles = recommendations.slice(3);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Recommendation Summary */}
        <View style={styles.summarySection}>
          <Text style={styles.headerTitle}>Your Perfect Matches</Text>
          <Text style={styles.headerSubtitle}>
            Based on your face shape, hair type, and personal preferences, we found {recommendations.length} styles that will look amazing on you.
          </Text>
        </View>

        {/* Top Recommended Hairstyles */}
        <Text style={styles.sectionTitle}>Top Recommended</Text>
        {topStyles.map((item, index) => (
          <View key={item.recommendationId || index} style={styles.card}>
            <Image source={{ uri: getPlaceholderImage(item.category) }} style={styles.cardImage} />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.8)']}
              style={styles.cardGradient}
            >
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{item.hairstyleName}</Text>
                  <View style={styles.scoreBadge}>
                    <Text style={styles.scoreText}>{item.suitabilityScore}% Match</Text>
                  </View>
                </View>
                <Text style={styles.cardCategory}>{item.category} • {item.maintenanceLevel} Maintenance</Text>
                
                <Text style={styles.cardReason} numberOfLines={2}>
                  {item.recommendationReason}
                </Text>

                <View style={styles.cardActions}>
                  <TouchableOpacity style={styles.actionButtonSecondary} onPress={() => Alert.alert('Saved to Collections', `${item.hairstyleName} has been saved.`)}>
                    <Text style={styles.actionButtonSecondaryText}>Save Style</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButtonPrimary} onPress={() => navigation.navigate('VirtualTryOn', { hairstyle: item })}>
                    <Text style={styles.actionButtonPrimaryText}>Try Style</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </LinearGradient>
          </View>
        ))}

        {/* Why These Styles Suit You */}
        <View style={styles.insightBox}>
          <Text style={styles.insightTitle}>Why These Suit You</Text>
          <Text style={styles.insightText}>
            Our AI analyzed your facial structure and determined that these styles balance your proportions perfectly, while matching your selected maintenance level.
          </Text>
        </View>

        {/* Alternative Styles */}
        {alternativeStyles.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Alternative Styles</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
              {alternativeStyles.map((item, index) => (
                <View key={item.recommendationId || index} style={styles.smallCard}>
                  <Image source={{ uri: getPlaceholderImage(item.category) }} style={styles.smallCardImage} />
                  <View style={styles.smallCardContent}>
                    <Text style={styles.smallCardTitle} numberOfLines={1}>{item.hairstyleName}</Text>
                    <Text style={styles.smallCardScore}>{item.suitabilityScore}% Match</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </>
        )}

        {/* Maintenance Insights */}
        <View style={styles.insightBox}>
          <Text style={styles.insightTitle}>Maintenance Insights</Text>
          <Text style={styles.insightText}>
            For styles with "Medium" or "High" maintenance, expect to visit the salon every 4-6 weeks for trims and potential touch-ups to maintain the structure.
          </Text>
        </View>

        {/* Refresh Button */}
        <TouchableOpacity style={[styles.primaryButton, styles.refreshButton]} onPress={handleRefresh}>
          <Text style={styles.primaryButtonText}>Refresh Recommendations</Text>
        </TouchableOpacity>
        
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingText: {
    color: '#cbd5e1',
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'Inter',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  errorSubText: {
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyImage: {
    width: 120,
    height: 120,
    marginBottom: 24,
    opacity: 0.7,
    tintColor: '#94a3b8'
  },
  emptyTitle: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubTitle: {
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 32,
    fontSize: 15,
  },
  primaryButton: {
    backgroundColor: '#ec4899',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 30,
    shadowColor: '#ec4899',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  refreshButton: {
    marginTop: 20,
    backgroundColor: '#3b82f6',
    shadowColor: '#3b82f6',
  },
  summarySection: {
    marginBottom: 24,
  },
  headerTitle: {
    color: '#f8fafc',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
  },
  headerSubtitle: {
    color: '#94a3b8',
    fontSize: 15,
    lineHeight: 22,
  },
  sectionTitle: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 8,
  },
  card: {
    width: '100%',
    height: 320,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 24,
    backgroundColor: '#1e293b',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  cardGradient: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 20,
  },
  cardContent: {
    gap: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
  },
  scoreBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  scoreText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardCategory: {
    color: '#cbd5e1',
    fontSize: 14,
    fontWeight: '500',
  },
  cardReason: {
    color: '#94a3b8',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionButtonPrimary: {
    flex: 1,
    backgroundColor: '#ec4899',
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
  },
  actionButtonPrimaryText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  actionButtonSecondary: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
  },
  actionButtonSecondaryText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  insightBox: {
    backgroundColor: '#1e293b',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#8b5cf6',
  },
  insightTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  insightText: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 20,
  },
  horizontalScroll: {
    marginBottom: 24,
  },
  smallCard: {
    width: 140,
    backgroundColor: '#1e293b',
    borderRadius: 16,
    marginRight: 16,
    overflow: 'hidden',
  },
  smallCardImage: {
    width: '100%',
    height: 140,
  },
  smallCardContent: {
    padding: 12,
  },
  smallCardTitle: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
  },
  smallCardScore: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: 'bold',
  }
});
