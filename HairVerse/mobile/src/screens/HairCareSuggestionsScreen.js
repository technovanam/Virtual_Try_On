import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useHaircareStore } from '../store/haircareStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const getCategoryColor = (category) => {
  const cat = category.toLowerCase();
  if (cat.includes('growth')) return ['#8b5cf6', '#6d28d9'];
  if (cat.includes('fall')) return ['#f43f5e', '#be123c'];
  if (cat.includes('health')) return ['#10b981', '#047857'];
  if (cat.includes('routine')) return ['#3b82f6', '#1d4ed8'];
  if (cat.includes('styling')) return ['#f59e0b', '#b45309'];
  if (cat.includes('nutrition')) return ['#84cc16', '#4d7c0f'];
  return ['#64748b', '#334155'];
};

const getCategoryIcon = (category) => {
  const cat = category.toLowerCase();
  if (cat.includes('growth')) return '🌱';
  if (cat.includes('fall')) return '🛡️';
  if (cat.includes('health')) return '✨';
  if (cat.includes('routine')) return '📅';
  if (cat.includes('styling')) return '✂️';
  if (cat.includes('nutrition')) return '🥗';
  return '💡';
};

export default function HairCareSuggestionsScreen({ navigation }) {
  const { 
    suggestions, 
    isLoading, 
    isGenerating, 
    status, 
    error, 
    fetchSuggestions, 
    generateSuggestions 
  } = useHaircareStore();

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const handleGenerate = async () => {
    await generateSuggestions();
  };

  if (isLoading || isGenerating) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#ec4899" />
        <Text style={styles.loadingText}>
          {isGenerating ? "Analyzing your profile & generating custom suggestions..." : "Loading your hair care plan..."}
        </Text>
      </View>
    );
  }

  if (status === 'error') {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Oops! Something went wrong.</Text>
        <Text style={styles.errorSubText}>{error}</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={fetchSuggestions}>
          <Text style={styles.primaryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (status === 'empty' || suggestions.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyIcon}>🧪</Text>
        <Text style={styles.emptyTitle}>No personalized suggestions available yet.</Text>
        <Text style={styles.emptySubTitle}>Let our AI build a custom hair care & growth plan tailored specifically for your hair type and goals.</Text>
        <TouchableOpacity 
          style={styles.primaryButton} 
          onPress={handleGenerate}
        >
          <Text style={styles.primaryButtonText}>Analyze Hair & Generate</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Group suggestions by category
  const groupedSuggestions = suggestions.reduce((acc, curr) => {
    const cat = curr.category || 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(curr);
    return acc;
  }, {});

  const categories = Object.keys(groupedSuggestions).sort();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.summarySection}>
          <Text style={styles.headerTitle}>Your Custom Hair Care Plan</Text>
          <Text style={styles.headerSubtitle}>
            Fully personalized AI-generated routine and suggestions based on your recent analysis.
          </Text>
        </View>

        {categories.map((category) => (
          <View key={category} style={styles.categorySection}>
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryIcon}>{getCategoryIcon(category)}</Text>
              <Text style={styles.categoryTitle}>{category}</Text>
            </View>
            
            {groupedSuggestions[category].map((item, index) => (
              <LinearGradient
                key={item.suggestionId || index}
                colors={getCategoryColor(category)}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.suggestionCard}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  {item.priority === 'High' && (
                    <View style={styles.priorityBadge}>
                      <Text style={styles.priorityText}>Crucial</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.cardDescription}>{item.description}</Text>
              </LinearGradient>
            ))}
          </View>
        ))}

        <TouchableOpacity style={[styles.primaryButton, styles.refreshButton]} onPress={handleGenerate}>
          <Text style={styles.primaryButtonText}>Regenerate Plan</Text>
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
    textAlign: 'center',
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
  emptyIcon: {
    fontSize: 64,
    marginBottom: 24,
  },
  emptyTitle: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
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
    marginTop: 30,
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
  categorySection: {
    marginBottom: 24,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  categoryTitle: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: 'bold',
  },
  suggestionCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  priorityBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priorityText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  cardDescription: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    lineHeight: 20,
  }
});
