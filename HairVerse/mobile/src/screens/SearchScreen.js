import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TextInput, ScrollView, TouchableOpacity, Image, ActivityIndicator, Animated, Easing, Keyboard, Dimensions, Modal, Switch, LayoutAnimation, UIManager, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { COLORS } from '../constants/theme';
import { useTryOnStore } from '../store/tryOnStore';
import { useProfileStore } from '../store/profileStore';

import { USE_NATIVE_DRIVER } from '../constants/nativeDriver';

const BACKEND_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:8000';
const { width, height } = Dimensions.get('window');

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Filter & Sort Constants
const FACE_SHAPES = ['Oval', 'Square', 'Round', 'Heart', 'Diamond', 'Oblong', 'Chiseled'];
const HAIR_TEXTURES = ['Straight', 'Wavy', 'Curly', 'Coarse', 'Fine'];
const HAIR_DENSITIES = ['Thick', 'Medium', 'Thin'];
const HAIR_LENGTHS = ['Short', 'Medium', 'Long'];
const MAINTENANCE_LEVELS = ['Low', 'Medium', 'High'];
const BEARD_COMPATIBILITIES = ['Beard', 'Stubble', 'Clean Shave'];
const HAIR_COLORS = ['Black', 'Brown', 'Blonde', 'Silver', 'Ginger'];
const TREND_LEVELS = ['Viral', 'Trending', 'Rising', 'Popular', 'Hot'];

const SORT_OPTIONS = [
  { label: 'Highest Match', value: 'highest_match', icon: 'sparkles' },
  { label: 'Trending First', value: 'trending', icon: 'flame' },
  { label: 'Most Tried', value: 'most_tried', icon: 'people' },
  { label: 'Newest Arrivals', value: 'newest', icon: 'calendar' },
  { label: 'Most Saved', value: 'most_saved', icon: 'bookmark' },
];

export default function SearchScreen({ route, navigation }) {
  const [query, setQuery] = useState('');
  const [allSuggestions, setAllSuggestions] = useState([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState(['Modern Fade', 'Curly Crop', 'Korean Volume']);
  const [trendingSearches, setTrendingSearches] = useState(['Silver Hair Dye', 'Wolf Cut', 'Pompadour', 'Clean Shave']);
  
  // Search & Filter States
  const [filteredHairstyles, setFilteredHairstyles] = useState([]);
  const [savedStyleIds, setSavedStyleIds] = useState(['fade_01']);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [sortBy, setSortBy] = useState('highest_match');
  const [isSmartFilterActive, setIsSmartFilterActive] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({
    faceShape: null,
    hairTexture: null,
    hairDensity: null,
    hairLength: null,
    maintenanceLevel: null,
    beardCompatibility: null,
    hairColor: null,
    trendLevel: null
  });

  // Supplemental recommendations & pagination
  const [similarStyles, setSimilarStyles] = useState([]);
  const [usersAlsoTried, setUsersAlsoTried] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isFilteringLoading, setIsFilteringLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  // Dynamic AI-powered Trend Discovery Feed States
  const [trends, setTrends] = useState([]);
  const [isLoadingTrends, setIsLoadingTrends] = useState(true);
  const [showAllTrends, setShowAllTrends] = useState(false);
  const [activeTrendCategory, setActiveTrendCategory] = useState('All');

  // Dynamic AI-Detailed Browse Categories & Regional Feed States
  const [detailedCategories, setDetailedCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [expandedCategoryId, setExpandedCategoryId] = useState(null);
  const [popularRegional, setPopularRegional] = useState([]);
  const [isLoadingRegional, setIsLoadingRegional] = useState(true);

  // Active Profile Store Integration
  const { profiles, activeProfileId } = useProfileStore();
  const activeProfile = profiles.find(p => p.id === activeProfileId);
  
  // Interface States
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  const [isVoiceSearching, setIsVoiceSearching] = useState(false);

  // Animations
  const voicePulse = useRef(new Animated.Value(1)).current;
  const loaderRotation = useRef(new Animated.Value(0)).current;
  const listFadeAnim = useRef(new Animated.Value(0)).current;
  const cardSlideAnim = useRef(new Animated.Value(20)).current;
  const skeletonPulse = useRef(new Animated.Value(0.3)).current;
  const searchDebounceRef = useRef(null);

  const { setSelectedHairstyle } = useTryOnStore();

  // Dynamic AI Suggestions chips below search
  const aiDynamicChips = [
    { label: 'Recommended for Oval Face', query: 'Oval' },
    { label: 'Trending for Curly Hair', query: 'Curly' },
    { label: 'Popular Korean Styles', query: 'Korean' }
  ];

  // 1. Fetch suggestions and ancillary content from API
  useEffect(() => {
    fetchSearchSuggestions();
    fetchSearchTrends();
    fetchDetailedCategories();
    fetchPopularRegional();
  }, []);

  // 2. Reactive search fetcher based on filters and sorting
  useEffect(() => {
    fetchHairstylesDatabase(1, false);
  }, [sortBy, appliedFilters, isSmartFilterActive, activeTab]);

  // Sync query if redirected from homepage search categories
  useEffect(() => {
    if (route?.params?.query !== undefined) {
      const q = route.params.query;
      setQuery(q);
      if (q.trim()) {
        handleSearchSubmit(q);
      } else {
        setFilteredHairstyles([]);
      }
    }
  }, [route?.params?.query]);

  // Spinner rotation loop
  useEffect(() => {
    if (isLoading) {
      Animated.loop(
        Animated.timing(loaderRotation, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: USE_NATIVE_DRIVER,
        })
      ).start();
    } else {
      loaderRotation.setValue(0);
    }
  }, [isLoading]);

  // Skeleton pulse breathing loop
  useEffect(() => {
    if (isFilteringLoading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(skeletonPulse, {
            toValue: 0.8,
            duration: 800,
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
          Animated.timing(skeletonPulse, {
            toValue: 0.3,
            duration: 800,
            useNativeDriver: USE_NATIVE_DRIVER,
          })
        ])
      ).start();
    } else {
      skeletonPulse.setValue(1);
    }
  }, [isFilteringLoading]);

  const fetchDetailedCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const response = await axios.get(`${BACKEND_BASE_URL}/homepage/categories-detailed`);
      setDetailedCategories(response.data);
    } catch (error) {
      console.warn("Failed to fetch detailed categories, using offline fallback.", error);
      setDetailedCategories([
        {
          id: "korean",
          title: "Korean Textured",
          icon: "sparkles",
          bannerUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=500&h=250&fit=crop",
          stylesCount: 12,
          trendLevel: "Rising",
          matchScore: 95,
          isRecommended: true,
          subcategories: ["Soft Wavy Bangs", "Textured Shag", "Korean Mullet", "Two-Block Cut"]
        },
        {
          id: "fade",
          title: "Fade & Crops",
          icon: "cut",
          bannerUrl: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=500&h=250&fit=crop",
          stylesCount: 15,
          trendLevel: "Hot",
          matchScore: 92,
          isRecommended: false,
          subcategories: ["High Skin Fade", "Mid Drop Fade", "French Crop", "Taper Fade"]
        },
        {
          id: "curly",
          title: "Curly & Wavy",
          icon: "git-branch",
          bannerUrl: "https://images.unsplash.com/photo-1605497746444-ac9dbd39f4a5?w=500&h=250&fit=crop",
          stylesCount: 8,
          trendLevel: "Rising",
          matchScore: 88,
          isRecommended: true,
          subcategories: ["Textured Curly Crop", "Messy Waves", "Curly Shag", "Tight Ringlets"]
        },
        {
          id: "beard",
          title: "Beard & Stubble",
          icon: "body",
          bannerUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&h=250&fit=crop",
          stylesCount: 10,
          trendLevel: "High",
          matchScore: 90,
          isRecommended: false,
          subcategories: ["Stubble Trim", "Short Boxed Beard", "Full Beard Groom", "Anchor Beard"]
        },
        {
          id: "professional",
          title: "Professional Looks",
          icon: "business",
          bannerUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=250&fit=crop",
          stylesCount: 14,
          trendLevel: "Hot",
          matchScore: 94,
          isRecommended: false,
          subcategories: ["Futuristic Slick Back", "Classic Executive Part", "Modern Pompadour", "Ivy League"]
        }
      ]);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const fetchPopularRegional = async () => {
    setIsLoadingRegional(true);
    try {
      const response = await axios.get(`${BACKEND_BASE_URL}/homepage/popular-regional`);
      setPopularRegional(response.data);
    } catch (error) {
      console.warn("Failed to fetch popular regional styles, using offline fallback.", error);
      setPopularRegional([
        {
          id: "fade_01",
          name: "Classic Fade",
          popularity: "98%",
          regionRank: 1,
          imageUrl: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=150&h=150&fit=crop"
        },
        {
          id: "korean_02",
          name: "Korean Textured",
          popularity: "95%",
          regionRank: 2,
          imageUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop"
        },
        {
          id: "curly_03",
          name: "Textured Curly Crop",
          popularity: "91%",
          regionRank: 3,
          imageUrl: "https://images.unsplash.com/photo-1605497746444-ac9dbd39f4a5?w=150&h=150&fit=crop"
        }
      ]);
    } finally {
      setIsLoadingRegional(false);
    }
  };

  const fetchSearchTrends = async () => {
    setIsLoadingTrends(true);
    try {
      const response = await axios.get(`${BACKEND_BASE_URL}/homepage/trends`);
      setTrends(response.data);
    } catch (error) {
      console.warn("Failed to fetch trending searches, using offline fallbacks.", error);
      setTrends([
        {
          id: 'trend_01',
          name: 'Silver Curly Crop',
          trendScore: 98,
          popularity: '12.4k',
          category: 'Curly',
          strength: 'EXTREME',
          badge: 'Viral',
          compatible_face_shapes: ['Oval', 'Square', 'Round'],
          compatible_hair_types: ['Curly', 'Wavy']
        },
        {
          id: 'trend_02',
          name: 'Korean Volume Wave',
          trendScore: 96,
          popularity: '9.8k',
          category: 'Korean',
          strength: 'STRONG',
          badge: 'Trending',
          compatible_face_shapes: ['Oval', 'Heart', 'Round'],
          compatible_hair_types: ['Straight', 'Wavy']
        },
        {
          id: 'trend_03',
          name: 'Mid Drop Fade',
          trendScore: 94,
          popularity: '8.2k',
          category: 'Fade',
          strength: 'HIGH',
          badge: 'New',
          compatible_face_shapes: ['Oval', 'Square', 'Diamond'],
          compatible_hair_types: ['Straight', 'Thick', 'Fine']
        },
        {
          id: 'trend_04',
          name: 'Office Slick Pompadour',
          trendScore: 91,
          popularity: '6.5k',
          category: 'Office',
          strength: 'HIGH',
          badge: 'Popular',
          compatible_face_shapes: ['Square', 'Oval', 'Oblong'],
          compatible_hair_types: ['Straight', 'Thick']
        },
        {
          id: 'trend_05',
          name: 'Short Beard Trim',
          trendScore: 89,
          popularity: '5.7k',
          category: 'Beard',
          strength: 'OPTIMAL',
          badge: 'Popular',
          compatible_face_shapes: ['Oval', 'Square', 'Heart'],
          compatible_hair_types: ['Coarse', 'Thick']
        },
        {
          id: 'trend_06',
          name: 'Zayn Malik Blonde Fade',
          trendScore: 95,
          popularity: '11.1k',
          category: 'Celebrity',
          strength: 'EXTREME',
          badge: 'Viral',
          compatible_face_shapes: ['Oval', 'Square', 'Chiseled'],
          compatible_hair_types: ['Straight', 'Thick']
        }
      ]);
    } finally {
      setIsLoadingTrends(false);
    }
  };

  const fetchSearchSuggestions = async () => {
    try {
      const response = await axios.get(`${BACKEND_BASE_URL}/homepage/suggestions`);
      setAllSuggestions(response.data);
      const trends = response.data
        .filter(item => item.type === 'Trend' || item.type === 'Hair Color')
        .map(item => item.query || item.name)
        .slice(0, 4);
      if (trends.length > 0) setTrendingSearches(trends);
    } catch (error) {
      console.warn("Failed to fetch suggestions from backend, using default list.", error);
      setAllSuggestions([
        { name: 'Classic Fade', type: 'Hairstyle', id: 'fade_01' },
        { name: 'Korean Textured', type: 'Hairstyle', id: 'korean_02' },
        { name: 'Textured Curly Crop', type: 'Hairstyle', id: 'curly_03' },
        { name: 'Modern Buzz Cut', type: 'Hairstyle', id: 'buzz_04' },
        { name: 'Clean Shave', type: 'Beard Style', query: 'Clean Shave' },
        { name: 'Stubble Beard', type: 'Beard Style', query: 'Stubble' }
      ]);
    }
  };

  // Main Dynamic Backend-Driven Filtering, Sorting and Pagination Fetcher
  const fetchHairstylesDatabase = async (pageIndex = 1, append = false, queryOverride = null) => {
    const activeQuery = queryOverride !== null ? queryOverride : query;
    if (pageIndex === 1) {
      setIsFilteringLoading(true);
    }
    
    try {
      let url = `${BACKEND_BASE_URL}/recommendations/hairstyles?page=${pageIndex}&limit=4&sort_by=${sortBy}`;
      
      // Inject Active Profile parameters
      if (activeProfile) {
        const pFace = activeProfile.analysisData?.face_shape || 'Oval';
        const pHair = activeProfile.analysisData?.hair_type || 'Straight';
        url += `&active_face_shape=${encodeURIComponent(pFace)}&active_hair_texture=${encodeURIComponent(pHair)}`;
      }

      // Add query
      if (activeQuery.trim()) {
        url += `&query=${encodeURIComponent(activeQuery)}`;
      }

      // Tab selector override
      if (activeTab !== 'All') {
        url += `&query=${encodeURIComponent(activeTab)}`;
      }

      // Dynamic AI Smart filter overrides normal tags
      if (isSmartFilterActive && activeProfile) {
        const shape = activeProfile.analysisData?.face_shape;
        const texture = activeProfile.analysisData?.hair_type;
        if (shape) url += `&face_shape=${encodeURIComponent(shape)}`;
        if (texture) url += `&hair_texture=${encodeURIComponent(texture)}`;
      } else {
        // Build manual filters
        if (appliedFilters.faceShape) url += `&face_shape=${encodeURIComponent(appliedFilters.faceShape)}`;
        if (appliedFilters.hairTexture) url += `&hair_texture=${encodeURIComponent(appliedFilters.hairTexture)}`;
        if (appliedFilters.hairDensity) url += `&hair_density=${encodeURIComponent(appliedFilters.hairDensity)}`;
        if (appliedFilters.hairLength) url += `&hair_length=${encodeURIComponent(appliedFilters.hairLength)}`;
        if (appliedFilters.maintenanceLevel) url += `&maintenance_level=${encodeURIComponent(appliedFilters.maintenanceLevel)}`;
        if (appliedFilters.beardCompatibility) url += `&beard_compatibility=${encodeURIComponent(appliedFilters.beardCompatibility)}`;
        if (appliedFilters.hairColor) url += `&hair_color=${encodeURIComponent(appliedFilters.hairColor)}`;
        if (appliedFilters.trendLevel) url += `&trend_level=${encodeURIComponent(appliedFilters.trendLevel)}`;
      }

      const response = await axios.get(url);
      const data = response.data;

      if (append) {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setFilteredHairstyles(prev => [...prev, ...data.results]);
      } else {
        // Trigger exit-to-entry layout slide/fade animation for premium feel
        Animated.timing(listFadeAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: USE_NATIVE_DRIVER
        }).start(() => {
          cardSlideAnim.setValue(20);
          setFilteredHairstyles(data.results || []);
          
          Animated.parallel([
            Animated.timing(listFadeAnim, {
              toValue: 1,
              duration: 350,
              useNativeDriver: USE_NATIVE_DRIVER
            }),
            Animated.timing(cardSlideAnim, {
              toValue: 0,
              duration: 350,
              useNativeDriver: USE_NATIVE_DRIVER
            })
          ]).start();
        });
      }

      setSimilarStyles(data.similar_styles || []);
      setUsersAlsoTried(data.users_also_tried || []);
      setTotalResults(data.total || 0);
      setHasMore(data.has_more || false);
      setPage(pageIndex);

    } catch (error) {
      console.warn("Failed to load backend hairstyles.", error);
    } finally {
      setIsFilteringLoading(false);
    }
  };

  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    await fetchHairstylesDatabase(page + 1, true);
    setIsLoadingMore(false);
  };

  const handleResetFilters = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setAppliedFilters({
      faceShape: null,
      hairTexture: null,
      hairDensity: null,
      hairLength: null,
      maintenanceLevel: null,
      beardCompatibility: null,
      hairColor: null,
      trendLevel: null
    });
    setIsSmartFilterActive(false);
    setSortBy('highest_match');
  };

  const getActiveFilterCount = () => {
    if (isSmartFilterActive) return 1;
    let count = 0;
    Object.values(appliedFilters).forEach(v => {
      if (v !== null && v !== '') count++;
    });
    return count;
  };

  // Debounced live suggestion filter while typing
  const handleQueryChange = (text) => {
    setQuery(text);
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }
    
    if (text.trim().length > 0) {
      setIsTyping(true);
      searchDebounceRef.current = setTimeout(() => {
        const filtered = allSuggestions.filter(item =>
          item.name.toLowerCase().includes(text.toLowerCase()) ||
          item.type.toLowerCase().includes(text.toLowerCase())
        ).slice(0, 5);
        
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setFilteredSuggestions(filtered);
      }, 150); // 150ms debounce for elite speed UX
    } else {
      setIsTyping(false);
      setFilteredSuggestions([]);
    }
  };

  // Perform search matching
  const handleSearchSubmit = (searchText) => {
    const searchTarget = (searchText !== undefined ? searchText : query).trim();
    setQuery(searchTarget);
    setIsTyping(false);
    setFilteredSuggestions([]);
    Keyboard.dismiss();

    // Add to recent search tags
    if (searchTarget) {
      setRecentSearches(prev => {
        const filtered = prev.filter(s => s.toLowerCase() !== searchTarget.toLowerCase());
        return [searchTarget, ...filtered].slice(0, 5);
      });
    }

    fetchHairstylesDatabase(1, false, searchTarget);
  };

  // Simulate active voice listening with breathing pulses
  const startVoiceSearch = () => {
    setIsVoiceSearching(true);
    Animated.loop(
      Animated.sequence([
        Animated.timing(voicePulse, {
          toValue: 1.4,
          duration: 700,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(voicePulse, {
          toValue: 1.0,
          duration: 700,
          useNativeDriver: USE_NATIVE_DRIVER,
        })
      ])
    ).start();

    // Receive simulated voice query
    setTimeout(() => {
      setIsVoiceSearching(false);
      const voiceOptions = ['Silver Curly Crop', 'Classic Fade', 'Korean Volume', 'Textured Curly Crop'];
      const chosen = voiceOptions[Math.floor(Math.random() * voiceOptions.length)];
      handleSearchSubmit(chosen);
    }, 2200);
  };

  const handleTabChange = (tabName) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveTab(tabName);
  };

  const toggleBookmark = (id) => {
    setSavedStyleIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleQuickTryOn = (item) => {
    setSelectedHairstyle({ id: item.id, name: item.name });
    navigation.navigate('VirtualTryOn');
  };

  const handleQuickCompare = (item) => {
    setSelectedHairstyle({ id: item.id, name: item.name });
    navigation.navigate('Comparison');
  };

  const clearRecentSearches = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setRecentSearches([]);
  };

  const toggleCategoryExpand = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedCategoryId(expandedCategoryId === id ? null : id);
  };

  // Spinner rotation interpolated value
  const spin = loaderRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  const getFilteredTrends = () => {
    if (activeTrendCategory === 'All') return trends;
    return trends.filter(t => t.category.toLowerCase() === activeTrendCategory.toLowerCase());
  };

  const filteredTrends = getFilteredTrends();

  // Helper render method for filter chips in the Modal
  const renderFilterChips = (list, filterKey) => {
    return (
      <View style={styles.filterChipRow}>
        {list.map((option) => {
          const isSelected = appliedFilters[filterKey] === option;
          return (
            <TouchableOpacity
              key={option}
              style={[styles.filterChip, isSelected && styles.activeFilterChip]}
              onPress={() => {
                setAppliedFilters(prev => ({
                  ...prev,
                  [filterKey]: isSelected ? null : option
                }));
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterChipText, isSelected && styles.activeFilterChipText]}>
                {option}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  // Pulse skeleton renderer
  const renderSkeletons = () => {
    return (
      <View style={styles.skeletonGrid}>
        {[1, 2, 3, 4].map((item) => (
          <Animated.View key={item} style={[styles.skeletonCard, { opacity: skeletonPulse }]}>
            <View style={styles.skeletonImage} />
            <View style={styles.skeletonInfoBox}>
              <View style={styles.skeletonTitle} />
              <View style={styles.skeletonSubText} />
              <View style={styles.skeletonWhyBox} />
              <View style={styles.skeletonActions}>
                <View style={styles.skeletonActionBtn} />
                <View style={[styles.skeletonActionBtn, { width: 50 }]} />
                <View style={styles.skeletonActionBtn} />
                <View style={styles.skeletonActionBtn} />
              </View>
            </View>
          </Animated.View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {/* Dynamic Top AI Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.header}>Discover Your Next Style</Text>
          <View style={styles.badgeRow}>
            <View style={styles.aiBadge}>
              <View style={styles.pulseDot} />
              <Text style={styles.aiBadgeText}>NEURAL SEARCH ENGINE ONLINE</Text>
            </View>
          </View>
        </View>

        {/* Dynamic Search Bar Container with Dedicated Filter Button */}
        <View style={styles.searchRow}>
          <View style={styles.searchBarContainer}>
            <Ionicons name="search" size={20} color={COLORS.secondary} style={styles.searchIcon} />
            
            <TextInput
              style={styles.input}
              placeholder="Search cuts, hair colors, beard shapes, celebs..."
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={query}
              onChangeText={handleQueryChange}
              onSubmitEditing={() => handleSearchSubmit()}
              returnKeyType="search"
            />

            {isLoading ? (
              <Animated.View style={{ transform: [{ rotate: spin }] }}>
                <Ionicons name="sync-outline" size={20} color={COLORS.secondary} style={styles.rightIcon} />
              </Animated.View>
            ) : query.length > 0 ? (
              <TouchableOpacity onPress={() => { setQuery(''); setIsTyping(false); setFilteredSuggestions([]); setFilteredHairstyles([]); }}>
                <Ionicons name="close-circle" size={20} color="rgba(255,255,255,0.5)" style={styles.rightIcon} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={startVoiceSearch} activeOpacity={0.7}>
                <Ionicons name="mic" size={20} color="#7C5CFC" style={styles.rightIcon} />
              </TouchableOpacity>
            )}
          </View>

          {/* Glowing Translucent Filter Button Trigger */}
          <TouchableOpacity 
            style={[styles.filterTriggerBtn, getActiveFilterCount() > 0 && styles.filterTriggerActiveBtn]}
            onPress={() => setIsFilterVisible(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="options-outline" size={20} color={getActiveFilterCount() > 0 ? "#00D4FF" : "#FFFFFF"} />
            {getActiveFilterCount() > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{getActiveFilterCount()}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Live Search Suggestions Popover with slide ease-in animation */}
        {isTyping && filteredSuggestions.length > 0 && (
          <View style={styles.suggestionsPopover}>
            {filteredSuggestions.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestionRow}
                onPress={() => handleSearchSubmit(item.query || item.name)}
              >
                <Ionicons 
                  name={item.type === 'Hairstyle' ? 'cut-outline' : item.type === 'Beard Style' ? 'body-outline' : 'sparkles-outline'} 
                  size={14} 
                  color={COLORS.secondary} 
                  style={{ marginRight: 10 }}
                />
                <View style={styles.suggestionTextCol}>
                  <Text style={styles.suggestionNameText}>{item.name}</Text>
                  <Text style={styles.suggestionTypeText}>{item.type.toUpperCase()}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Dynamic AI Suggestion Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.aiChipsScroll}>
          {aiDynamicChips.map((chip, index) => (
            <TouchableOpacity
              key={index}
              style={styles.aiChip}
              onPress={() => handleSearchSubmit(chip.query)}
              activeOpacity={0.8}
            >
              <Ionicons name="sparkles" size={12} color="#00D4FF" style={{ marginRight: 6 }} />
              <Text style={styles.aiChipText}>{chip.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Dynamic Tab Filter Bar (Only visible when search has matches) */}
        {filteredHairstyles.length > 0 && !isFilteringLoading && (
          <View style={styles.tabsRow}>
            {['All', 'Fade', 'Korean', 'Curly'].map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tabItem, activeTab === tab && styles.activeTabItem]}
                onPress={() => handleTabChange(tab)}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Dynamic Filtering Skeletons vs Results Gallery */}
        {isFilteringLoading ? (
          renderSkeletons()
        ) : filteredHairstyles.length > 0 ? (
          <Animated.View style={{ opacity: listFadeAnim, transform: [{ translateY: cardSlideAnim }] }}>
            <View style={styles.resultsGrid}>
              {filteredHairstyles.map((item) => {
                const isBookmarked = savedStyleIds.includes(item.id);
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.resultCard}
                    onPress={() => navigation.navigate('HairstyleDetail', { id: item.id })}
                    activeOpacity={0.85}
                  >
                    {/* Visual Card Image Cover */}
                    <View style={styles.resultImageWrapper}>
                      <Image source={{ uri: item.imageUrl }} style={styles.resultImage} />
                      <View style={styles.resultBadge}>
                        <Text style={styles.resultBadgeText}>{item.badge}</Text>
                      </View>
                      
                      {/* Dynamic Neural Match Badge */}
                      <View style={styles.matchScoreBadge}>
                        <Text style={styles.matchScoreBadgeText}>{item.matchScore} MATCH</Text>
                      </View>
                    </View>

                    <View style={styles.resultInfoBox}>
                      <View style={styles.cardHeaderRow}>
                        <Text style={styles.resultTitleText} numberOfLines={1}>{item.name}</Text>
                        <View style={styles.ratingRow}>
                          <Ionicons name="star" size={10} color="#FFD700" style={{ marginRight: 2 }} />
                          <Text style={styles.ratingText}>{item.popularity}</Text>
                        </View>
                      </View>
                      
                      <Text style={styles.resultSubText}>{item.category} • {item.maintenance}</Text>
                      
                      {/* "Why This Matches You" AI Explanation Rationale */}
                      {item.why_matches && (
                        <View style={styles.whyMatchesContainer}>
                          <Ionicons name="sparkles" size={10} color="#00D4FF" style={{ marginRight: 4, marginTop: 2 }} />
                          <Text style={styles.whyMatchesText}>{item.why_matches}</Text>
                        </View>
                      )}

                      {/* Card Actions Footer Row */}
                      <View style={styles.resultActionsRow}>
                        <TouchableOpacity
                          style={styles.resultActionBtn}
                          onPress={() => toggleBookmark(item.id)}
                          activeOpacity={0.7}
                        >
                          <Ionicons 
                            name={isBookmarked ? "bookmark" : "bookmark-outline"} 
                            size={12} 
                            color={isBookmarked ? "#00D4FF" : COLORS.textPrimary} 
                          />
                        </TouchableOpacity>

                        {/* Premium Try On Button Accent */}
                        <TouchableOpacity
                          style={[styles.resultActionBtn, styles.tryOnBtnAccent]}
                          onPress={() => handleQuickTryOn(item)}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="sparkles" size={12} color="#00E676" style={{ marginRight: 3 }} />
                          <Text style={styles.tryOnBtnAccentText}>TRY</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.resultActionBtn}
                          onPress={() => handleQuickCompare(item)}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="git-compare" size={12} color="#7C5CFC" />
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.resultActionBtn}
                          onPress={() => navigation.navigate('HairstyleDetail', { id: item.id })}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="chevron-forward" size={12} color={COLORS.textPrimary} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Pagination Load More Button */}
            {hasMore && (
              <View style={styles.loadMoreContainer}>
                {isLoadingMore ? (
                  <View style={styles.loadMoreSpinnerBox}>
                    <ActivityIndicator size="small" color="#00D4FF" />
                    <Text style={styles.loadMoreSpinnerText}>Syncing neural models...</Text>
                  </View>
                ) : (
                  <TouchableOpacity 
                    style={styles.loadMoreBtn} 
                    onPress={handleLoadMore}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.loadMoreBtnText}>LOAD MORE NEURAL RECOMMENDATIONS</Text>
                    <Ionicons name="chevron-down-outline" size={14} color="#00D4FF" style={{ marginLeft: 6 }} />
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Supplemental Recommendation: Similar Styles */}
            {similarStyles.length > 0 && (
              <View style={styles.recommendationDeck}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.recommendationDeckTitle}>Similar Neural Styles</Text>
                  <View style={styles.aiGlowBadgeMini}>
                    <Ionicons name="sparkles" size={10} color="#00D4FF" style={{ marginRight: 3 }} />
                    <Text style={styles.aiGlowBadgeMiniText}>AI MATCHED</Text>
                  </View>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recScroll}>
                  {similarStyles.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.recCard}
                      onPress={() => navigation.navigate('HairstyleDetail', { id: item.id })}
                      activeOpacity={0.85}
                    >
                      <Image source={{ uri: item.imageUrl }} style={styles.recCardImage} />
                      <View style={styles.recCardOverlay} />
                      <View style={styles.recCardContent}>
                        <Text style={styles.recCardTitle} numberOfLines={1}>{item.name}</Text>
                        <View style={styles.recCardBottomRow}>
                          <Text style={styles.recCardMatch}>{item.matchScore} Match</Text>
                          <TouchableOpacity 
                            style={styles.recCardTryBtn}
                            onPress={() => handleQuickTryOn(item)}
                          >
                            <Ionicons name="sparkles" size={10} color="#00E676" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Supplemental Recommendation: Users Also Tried */}
            {usersAlsoTried.length > 0 && (
              <View style={styles.recommendationDeck}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.recommendationDeckTitle}>Users With Similar Traits Tried</Text>
                  <View style={styles.aiGlowBadgeMini}>
                    <Ionicons name="people" size={10} color="#7C5CFC" style={{ marginRight: 3 }} />
                    <Text style={styles.aiGlowBadgeMiniText}>POPULAR</Text>
                  </View>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recScroll}>
                  {usersAlsoTried.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.recCard}
                      onPress={() => navigation.navigate('HairstyleDetail', { id: item.id })}
                      activeOpacity={0.85}
                    >
                      <Image source={{ uri: item.imageUrl }} style={styles.recCardImage} />
                      <View style={styles.recCardOverlay} />
                      <View style={styles.recCardContent}>
                        <Text style={styles.recCardTitle} numberOfLines={1}>{item.name}</Text>
                        <View style={styles.recCardBottomRow}>
                          <Text style={styles.recCardTried}>{item.tried_count} tries</Text>
                          <TouchableOpacity 
                            style={styles.recCardTryBtn}
                            onPress={() => handleQuickTryOn(item)}
                          >
                            <Ionicons name="sparkles" size={10} color="#00E676" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

          </Animated.View>
        ) : (query.length > 0 || getActiveFilterCount() > 0) && !isTyping ? (
          /* NO RESULTS STATE */
          <View style={styles.noResultsContainer}>
            <Ionicons name="alert-circle-outline" size={48} color="#FF5252" style={{ marginBottom: 12 }} />
            <Text style={styles.noResultsTitle}>No Neural Matches Found</Text>
            <Text style={styles.noResultsSubText}>
              We couldn't match your criteria with our database. Try toggling of your filter properties or clear tags.
            </Text>
            <TouchableOpacity 
              style={styles.clearSearchBtn}
              onPress={() => { setQuery(''); handleResetFilters(); setFilteredHairstyles([]); }}
            >
              <Text style={styles.clearSearchBtnText}>Reset Search Engine & Filters</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* DEFAULT DISCOVERY CONTENT */
          <View style={styles.discoveryBlock}>
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <View style={styles.discoverySection}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>Recent Searches</Text>
                  <TouchableOpacity onPress={clearRecentSearches} activeOpacity={0.7}>
                    <Text style={styles.clearAllText}>Clear All</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.recentSearchesRow}>
                  {recentSearches.map((item, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={styles.recentChip}
                      onPress={() => handleSearchSubmit(item)}
                      activeOpacity={0.75}
                    >
                      <Ionicons name="time-outline" size={12} color="rgba(255,255,255,0.4)" style={{ marginRight: 6 }} />
                      <Text style={styles.recentChipText}>{item}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Dynamic AI-Powered Trend Discovery Feed */}
            <View style={styles.discoverySection}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>AI Trend Discovery</Text>
                <View style={styles.aiGlowBadgeMini}>
                  <Ionicons name="flash" size={10} color="#00D4FF" style={{ marginRight: 3 }} />
                  <Text style={styles.aiGlowBadgeMiniText}>REAL-TIME</Text>
                </View>
              </View>
              
              {/* Dynamic Categories selector */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.trendCategoriesScroll} contentContainerStyle={{ paddingRight: 16 }}>
                {['All', 'Korean', 'Curly', 'Fade', 'Office', 'Beard', 'Celebrity'].map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.trendCategoryChip, activeTrendCategory === cat && styles.activeTrendCategoryChip]}
                    onPress={() => setActiveTrendCategory(cat)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.trendCategoryChipText, activeTrendCategory === cat && styles.activeTrendCategoryChipText]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {isLoadingTrends ? (
                <View style={styles.trendsLoading}>
                  <ActivityIndicator size="small" color={COLORS.secondary} />
                  <Text style={styles.trendsLoadingText}>Fetching neural search volume...</Text>
                </View>
              ) : filteredTrends.length > 0 ? (
                <View>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    style={styles.trendsScroll}
                    contentContainerStyle={styles.trendsScrollContent}
                    decelerationRate="fast"
                    snapToInterval={246} // Snaps perfectly for 230 card width + 16 margin
                  >
                    {filteredTrends.slice(0, showAllTrends ? filteredTrends.length : 3).map((item) => {
                      const isCompatibleShape = item.compatible_face_shapes.some(
                        s => s.toLowerCase() === (activeProfile?.analysisData?.face_shape || 'Oval').toLowerCase()
                      );
                      const isCompatibleHair = item.compatible_hair_types.some(
                        h => h.toLowerCase() === (activeProfile?.analysisData?.hair_type || 'Straight').toLowerCase()
                      );
                      
                      let matchPercentage = 80;
                      if (isCompatibleShape) matchPercentage += 12;
                      if (isCompatibleHair) matchPercentage += 6;
                      
                      return (
                        <TouchableOpacity
                          key={item.id}
                          style={styles.trendDiscoveryCard}
                          onPress={() => handleSearchSubmit(item.name)}
                          activeOpacity={0.9}
                        >
                          <View style={styles.trendCardOverlayGlow} />
                          
                          <View style={styles.trendCardHeader}>
                            <Text style={styles.trendCardCategoryText}>{item.category.toUpperCase()}</Text>
                            <View style={[
                              styles.animatedTrendBadge,
                              item.badge === 'Viral' && styles.badgeViral,
                              item.badge === 'Trending' && styles.badgeTrending,
                              item.badge === 'New' && styles.badgeNew,
                              item.badge === 'Popular' && styles.badgePopular,
                            ]}>
                              <Text style={styles.animatedTrendBadgeText}>{item.badge.toUpperCase()}</Text>
                            </View>
                          </View>

                          <Text style={styles.trendCardNameText} numberOfLines={1}>{item.name}</Text>

                          <View style={styles.trendMetricsRow}>
                            <View style={styles.metricItem}>
                              <Ionicons name="stats-chart" size={10} color={COLORS.secondary} style={{ marginRight: 4 }} />
                              <Text style={styles.metricValText}>{item.popularity} searches</Text>
                            </View>
                            <View style={styles.metricItem}>
                              <Ionicons name="pulse" size={10} color="#00E676" style={{ marginRight: 4 }} />
                              <Text style={styles.metricValText}>{item.trendScore}% Vol</Text>
                            </View>
                          </View>

                          <View style={styles.aiMatchIndicatorRow}>
                            <View style={styles.aiMatchPulseDot} />
                            <Text style={styles.aiMatchIndicatorText}>
                              {matchPercentage}% Match for your {activeProfile?.analysisData?.face_shape || 'Oval'} face
                            </Text>
                          </View>

                          <View style={styles.recStrengthContainer}>
                            <Text style={styles.recStrengthLabel}>REC STRENGTH:</Text>
                            <Text style={[
                              styles.recStrengthVal,
                              item.strength === 'EXTREME' && { color: '#FF5252' },
                              item.strength === 'STRONG' && { color: '#7C5CFC' },
                              item.strength === 'HIGH' && { color: '#00D4FF' },
                              item.strength === 'OPTIMAL' && { color: '#00E676' },
                            ]}>
                              {item.strength}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>

                  {!showAllTrends && filteredTrends.length > 3 && (
                    <TouchableOpacity
                      style={styles.seeMoreTrendsBtn}
                      onPress={() => setShowAllTrends(true)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.seeMoreTrendsBtnText}>See More Trends</Text>
                      <Ionicons name="arrow-forward" size={14} color={COLORS.secondary} style={{ marginLeft: 6 }} />
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                <View style={styles.trendsEmpty}>
                  <Ionicons name="filter-outline" size={24} color="rgba(255,255,255,0.2)" style={{ marginBottom: 6 }} />
                  <Text style={styles.trendsEmptyText}>No trends match category "{activeTrendCategory}"</Text>
                </View>
              )}
            </View>

            {/* Redesigned AI Dynamic Browse Categories */}
            <View style={styles.discoverySection}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Browse Categories</Text>
                <Ionicons name="apps-outline" size={16} color={COLORS.secondary} />
              </View>

              {isLoadingCategories ? (
                <View style={styles.trendsLoading}>
                  <ActivityIndicator size="small" color={COLORS.secondary} />
                  <Text style={styles.trendsLoadingText}>Connecting category nodes...</Text>
                </View>
              ) : (
                <View style={styles.categoriesDetailedContainer}>
                  {detailedCategories.map((item) => {
                    const isExpanded = expandedCategoryId === item.id;
                    return (
                      <View key={item.id} style={styles.categoryCardWrapper}>
                        <TouchableOpacity
                          style={styles.categoryDetailedCard}
                          onPress={() => toggleCategoryExpand(item.id)}
                          activeOpacity={0.9}
                        >
                          <Image source={{ uri: item.bannerUrl }} style={styles.categoryCardBanner} resizeMode="cover" />
                          <View style={styles.categoryCardOverlayGlow} />

                          {item.isRecommended && (
                            <View style={styles.recCategoryBadge}>
                              <Ionicons name="sparkles" size={8} color={COLORS.background} style={{ marginRight: 3 }} />
                              <Text style={styles.recCategoryBadgeText}>RECOMMENDED</Text>
                            </View>
                          )}

                          <View style={styles.categoryCardMainRow}>
                            <View style={styles.categoryCardIconBox}>
                              <Ionicons name={item.icon === 'sparkles' ? 'sparkles' : item.icon === 'cut' ? 'cut' : item.icon === 'git-branch' ? 'git-branch' : item.icon === 'body' ? 'body' : 'business'} size={18} color="#00D4FF" />
                            </View>

                            <View style={styles.categoryCardTitleBox}>
                              <Text style={styles.categoryCardTitleText}>{item.title}</Text>
                              <Text style={styles.categoryCardStylesCount}>{item.stylesCount} Premium Styles</Text>
                            </View>

                            <View style={styles.categoryCardRightBox}>
                              <View style={styles.categoryCardTrendBadge}>
                                <Text style={styles.categoryCardTrendText}>{item.trendLevel.toUpperCase()}</Text>
                              </View>
                              <Ionicons 
                                name={isExpanded ? "chevron-up" : "chevron-down"} 
                                size={18} 
                                color="rgba(255,255,255,0.6)" 
                                style={{ marginLeft: 8 }}
                              />
                            </View>
                          </View>
                        </TouchableOpacity>

                        {isExpanded && (
                          <View style={styles.subcategoriesDropdown}>
                            <Text style={styles.subcategoriesTitle}>EXPANDED SUB-CATEGORIES:</Text>
                            <View style={styles.subcategoryChipsRow}>
                              {item.subcategories.map((sub, idx) => (
                                <TouchableOpacity
                                  key={idx}
                                  style={styles.subcategoryChip}
                                  onPress={() => handleSearchSubmit(sub)}
                                  activeOpacity={0.8}
                                >
                                  <Ionicons name="arrow-forward-circle" size={12} color={COLORS.secondary} style={{ marginRight: 4 }} />
                                  <Text style={styles.subcategoryChipText}>{sub}</Text>
                                </TouchableOpacity>
                              ))}
                            </View>
                            <TouchableOpacity
                              style={styles.quickPreviewBtn}
                              onPress={() => handleSearchSubmit(item.title.split(' ')[0])}
                              activeOpacity={0.8}
                            >
                              <Text style={styles.quickPreviewBtnText}>View Category Registry</Text>
                              <Ionicons name="open-outline" size={12} color={COLORS.secondary} style={{ marginLeft: 4 }} />
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              )}
            </View>

            {/* Dynamic AI-Powered "Popular In Your Region" Section */}
            <View style={[styles.discoverySection, { marginBottom: 0 }]}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Popular In Your Region</Text>
                <View style={styles.regionSelectorRow}>
                  <Ionicons name="globe-outline" size={12} color="rgba(255,255,255,0.4)" style={{ marginRight: 4 }} />
                  <Text style={styles.regionSelectorText}>Global Nodes</Text>
                </View>
              </View>

              {isLoadingRegional ? (
                <View style={styles.trendsLoading}>
                  <ActivityIndicator size="small" color={COLORS.secondary} />
                  <Text style={styles.trendsLoadingText}>Parsing regional matching indexes...</Text>
                </View>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.regionalScroll}>
                  {popularRegional.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.regionalCard}
                      onPress={() => handleSearchSubmit(item.name)}
                      activeOpacity={0.9}
                    >
                      <Image source={{ uri: item.imageUrl }} style={styles.regionalImage} />
                      <View style={styles.regionalImageOverlay} />
                      
                      <View style={styles.regionRankBadge}>
                        <Text style={styles.regionRankText}>#{item.regionRank}</Text>
                      </View>

                      <View style={styles.regionalCardContent}>
                        <Text style={styles.regionalNameText} numberOfLines={1}>{item.name}</Text>
                        <View style={styles.regionalVolumeRow}>
                          <Ionicons name="trending-up" size={10} color="#00E676" style={{ marginRight: 3 }} />
                          <Text style={styles.regionalVolumeText}>{item.popularity} Popularity</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Futuristic Voice Search listening modal overlay */}
      {isVoiceSearching && (
        <View style={styles.voiceOverlay}>
          <Animated.View style={[
            styles.voiceOuterGlow, 
            { transform: [{ scale: voicePulse }] }
          ]}>
            <View style={styles.voiceInnerCircle}>
              <Ionicons name="mic" size={40} color="#FFFFFF" />
            </View>
          </Animated.View>
          <Text style={styles.voiceTitle}>AI Voice Search Active</Text>
          <Text style={styles.voiceSub}>Speak now... Try saying "Silver Wolf Cut"</Text>
        </View>
      )}

      {/* Premium Dark Glassmorphism Bottom Sheet Filter Modal */}
      <Modal
        visible={isFilterVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsFilterVisible(false)}
      >
        <View style={styles.filterModalContainer}>
          <TouchableOpacity 
            style={styles.filterModalDismissArea} 
            activeOpacity={1} 
            onPress={() => setIsFilterVisible(false)} 
          />
          
          <View style={styles.filterSheet}>
            {/* Modal Pull Bar Accent */}
            <View style={styles.filterPullBar} />
            
            <View style={styles.filterModalHeader}>
              <Text style={styles.filterModalTitle}>AI Neural Filters</Text>
              <TouchableOpacity 
                style={styles.modalResetBtn} 
                onPress={handleResetFilters}
                activeOpacity={0.7}
              >
                <Text style={styles.resetFiltersBtnText}>Reset All</Text>
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.filterModalScroll} 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.filterModalScrollContent}
            >
              {/* AI Smart Filter Section */}
              <View style={styles.smartFilterRow}>
                <View style={styles.smartFilterInfo}>
                  <View style={styles.smartTitleRow}>
                    <Ionicons name="sparkles" size={16} color="#00D4FF" style={{ marginRight: 6 }} />
                    <Text style={styles.smartFilterTitle}>Styles Best For You</Text>
                  </View>
                  <Text style={styles.smartFilterSubtitle}>
                    {activeProfile 
                      ? `Auto-match with your active profile (${activeProfile.name}: ${activeProfile.analysisData?.face_shape || 'Oval'} + ${activeProfile.analysisData?.hair_type || 'Straight'})`
                      : 'Load customized styles matching your saved face analysis'
                    }
                  </Text>
                </View>
                <Switch
                  value={isSmartFilterActive}
                  onValueChange={(val) => {
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                    setIsSmartFilterActive(val);
                  }}
                  trackColor={{ false: '#2C2C35', true: '#7C5CFC' }}
                  thumbColor={isSmartFilterActive ? '#00D4FF' : '#E0E0E0'}
                />
              </View>

              {/* Sorting Options Selector */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>SORT RECON INDEX</Text>
                <View style={styles.sortOptionsGrid}>
                  {SORT_OPTIONS.map((opt) => {
                    const isSelected = sortBy === opt.value;
                    return (
                      <TouchableOpacity
                        key={opt.value}
                        style={[styles.sortOptCard, isSelected && styles.activeSortOptCard]}
                        onPress={() => setSortBy(opt.value)}
                        activeOpacity={0.75}
                      >
                        <Ionicons 
                          name={opt.icon} 
                          size={14} 
                          color={isSelected ? '#00D4FF' : 'rgba(255,255,255,0.6)'} 
                          style={{ marginRight: 6 }} 
                        />
                        <Text style={[styles.sortOptText, isSelected && styles.activeSortOptText]}>
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Manual Category Filters (Only enabled when Smart Filter is inactive) */}
              {!isSmartFilterActive ? (
                <>
                  <View style={styles.filterSection}>
                    <Text style={styles.filterSectionTitle}>FACE COMPATIBILITY</Text>
                    {renderFilterChips(FACE_SHAPES, 'faceShape')}
                  </View>

                  <View style={styles.filterSection}>
                    <Text style={styles.filterSectionTitle}>HAIR TEXTURE</Text>
                    {renderFilterChips(HAIR_TEXTURES, 'hairTexture')}
                  </View>

                  <View style={styles.filterSection}>
                    <Text style={styles.filterSectionTitle}>HAIR DENSITY</Text>
                    {renderFilterChips(HAIR_DENSITIES, 'hairDensity')}
                  </View>

                  <View style={styles.filterSection}>
                    <Text style={styles.filterSectionTitle}>HAIR LENGTH</Text>
                    {renderFilterChips(HAIR_LENGTHS, 'hairLength')}
                  </View>

                  <View style={styles.filterSection}>
                    <Text style={styles.filterSectionTitle}>MAINTENANCE LEVEL</Text>
                    {renderFilterChips(MAINTENANCE_LEVELS, 'maintenanceLevel')}
                  </View>

                  <View style={styles.filterSection}>
                    <Text style={styles.filterSectionTitle}>BEARD COMPATIBILITY</Text>
                    {renderFilterChips(BEARD_COMPATIBILITIES, 'beardCompatibility')}
                  </View>

                  <View style={styles.filterSection}>
                    <Text style={styles.filterSectionTitle}>HAIR COLORS</Text>
                    {renderFilterChips(HAIR_COLORS, 'hairColor')}
                  </View>

                  <View style={styles.filterSection}>
                    <Text style={styles.filterSectionTitle}>TREND LEVEL</Text>
                    {renderFilterChips(TREND_LEVELS, 'trendLevel')}
                  </View>
                </>
              ) : (
                <View style={styles.smartModePlaceholder}>
                  <Ionicons name="lock-closed-outline" size={24} color="rgba(255,255,255,0.2)" style={{ marginBottom: 8 }} />
                  <Text style={styles.smartModePlaceholderText}>Manual filter tags are locked in AI Smart Mode.</Text>
                  <Text style={styles.smartModePlaceholderSub}>Deactivate "Styles Best For You" above to manually select filter properties.</Text>
                </View>
              )}
            </ScrollView>

            {/* Glowing Apply Button with Real-Time Total Count Badge */}
            <TouchableOpacity
              style={styles.applyFiltersBtn}
              onPress={() => setIsFilterVisible(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.applyFiltersBtnText}>
                SHOW {totalResults} MATCHING OUTCOMES
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    padding: 16,
    paddingTop: 54,
    paddingBottom: 100, // padding spacing for bottom nav overlay
  },
  headerContainer: {
    marginBottom: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    letterSpacing: 0.5,
  },
  badgeRow: {
    flexDirection: 'row',
    marginTop: 6,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 212, 255, 0.08)',
    borderColor: 'rgba(0, 212, 255, 0.25)',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.secondary,
    marginRight: 6,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
  },
  aiBadgeText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: COLORS.secondary,
    letterSpacing: 0.8,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  searchBarContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(18, 18, 26, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.15)',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 52,
    position: 'relative',
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    marginRight: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '500',
    height: '100%',
  },
  rightIcon: {
    marginLeft: 10,
  },
  filterTriggerBtn: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: 'rgba(18, 18, 26, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  filterTriggerActiveBtn: {
    borderColor: 'rgba(0, 212, 255, 0.4)',
    backgroundColor: 'rgba(0, 212, 255, 0.06)',
    shadowColor: '#00D4FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#00D4FF',
    borderRadius: 9,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.background,
  },
  filterBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: COLORS.background,
  },
  suggestionsPopover: {
    backgroundColor: 'rgba(18, 18, 26, 0.98)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    marginTop: 6,
    padding: 6,
    zIndex: 999,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.03)',
  },
  suggestionTextCol: {
    flex: 1,
  },
  suggestionNameText: {
    fontSize: 13,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  suggestionTypeText: {
    fontSize: 8,
    color: COLORS.textSecondary,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    marginTop: 1,
  },
  aiChipsScroll: {
    marginTop: 4,
    marginBottom: 20,
  },
  aiChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(124, 92, 252, 0.08)',
    borderColor: 'rgba(124, 92, 252, 0.22)',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  aiChipText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#7C5CFC',
  },
  tabsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    padding: 3,
    marginBottom: 16,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTabItem: {
    backgroundColor: 'rgba(0, 212, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.15)',
  },
  tabText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
  },
  activeTabText: {
    color: COLORS.secondary,
  },
  resultsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  resultCard: {
    width: '48%',
    backgroundColor: 'rgba(18, 18, 26, 0.85)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  resultImageWrapper: {
    height: 120,
    position: 'relative',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  resultImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  resultBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0, 212, 255, 0.15)',
    borderColor: 'rgba(0, 212, 255, 0.35)',
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  resultBadgeText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: COLORS.secondary,
    textTransform: 'uppercase',
  },
  matchScoreBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 230, 118, 0.18)',
    borderColor: 'rgba(0, 230, 118, 0.45)',
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    shadowColor: '#00E676',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  matchScoreBadgeText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  resultInfoBox: {
    padding: 10,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultTitleText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.08)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  ratingText: {
    fontSize: 9,
    color: '#FFD700',
    fontWeight: '700',
  },
  resultSubText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 2,
    marginBottom: 6,
  },
  whyMatchesContainer: {
    backgroundColor: 'rgba(0, 212, 255, 0.04)',
    borderColor: 'rgba(0, 212, 255, 0.15)',
    borderWidth: 0.5,
    borderRadius: 8,
    padding: 6,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  whyMatchesText: {
    fontSize: 8.5,
    color: '#00D4FF',
    lineHeight: 12,
    fontWeight: '500',
    flex: 1,
  },
  resultActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.04)',
    paddingTop: 8,
  },
  resultActionBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tryOnBtnAccent: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 230, 118, 0.08)',
    borderColor: 'rgba(0, 230, 118, 0.25)',
    borderWidth: 1,
    paddingHorizontal: 8,
    borderRadius: 10,
    width: undefined,
    height: 24,
  },
  tryOnBtnAccentText: {
    fontSize: 8.5,
    color: '#00E676',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  noResultsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(18, 18, 26, 0.5)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  noResultsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  noResultsSubText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  clearSearchBtn: {
    backgroundColor: 'rgba(0, 212, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.35)',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  clearSearchBtnText: {
    fontSize: 12,
    color: COLORS.secondary,
    fontWeight: 'bold',
  },
  discoveryBlock: {
    marginTop: 8,
  },
  discoverySection: {
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  clearAllText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  recentSearchesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  recentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  recentChipText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  voiceOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 10, 15, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  voiceOuterGlow: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(124, 92, 252, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  voiceInnerCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#7C5CFC',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#7C5CFC',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 8,
  },
  voiceTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  voiceSub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  aiGlowBadgeMini: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 212, 255, 0.06)',
    borderColor: 'rgba(0, 212, 255, 0.25)',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  aiGlowBadgeMiniText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: COLORS.secondary,
    letterSpacing: 0.5,
  },
  trendCategoriesScroll: {
    marginBottom: 14,
    marginTop: 4,
  },
  trendCategoryChip: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    marginRight: 8,
  },
  activeTrendCategoryChip: {
    backgroundColor: 'rgba(0, 212, 255, 0.08)',
    borderColor: 'rgba(0, 212, 255, 0.22)',
  },
  trendCategoryChipText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  activeTrendCategoryChipText: {
    color: COLORS.secondary,
    fontWeight: 'bold',
  },
  trendsLoading: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 35,
    backgroundColor: 'rgba(18, 18, 26, 0.5)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  trendsLoadingText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 8,
    fontWeight: '500',
  },
  trendsScroll: {
    marginBottom: 16,
  },
  trendsScrollContent: {
    paddingRight: 16,
  },
  trendDiscoveryCard: {
    width: 230,
    backgroundColor: 'rgba(18, 18, 26, 0.85)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.15)',
    padding: 14,
    marginRight: 16,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  trendCardOverlayGlow: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(0, 212, 255, 0.04)',
  },
  trendCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  trendCardCategoryText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
  },
  animatedTrendBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 0.5,
  },
  badgeViral: {
    backgroundColor: 'rgba(255, 82, 82, 0.12)',
    borderColor: 'rgba(255, 82, 82, 0.35)',
  },
  badgeTrending: {
    backgroundColor: 'rgba(124, 92, 252, 0.12)',
    borderColor: 'rgba(124, 92, 252, 0.35)',
  },
  badgeNew: {
    backgroundColor: 'rgba(0, 212, 255, 0.12)',
    borderColor: 'rgba(0, 212, 255, 0.35)',
  },
  badgePopular: {
    backgroundColor: 'rgba(0, 230, 118, 0.12)',
    borderColor: 'rgba(0, 230, 118, 0.35)',
  },
  animatedTrendBadgeText: {
    fontSize: 7,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    letterSpacing: 0.5,
  },
  trendCardNameText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  trendMetricsRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  metricValText: {
    fontSize: 9,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  aiMatchIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 230, 118, 0.05)',
    borderColor: 'rgba(0, 230, 118, 0.15)',
    borderWidth: 0.5,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginBottom: 10,
  },
  aiMatchPulseDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#00E676',
    marginRight: 6,
  },
  aiMatchIndicatorText: {
    fontSize: 8.5,
    color: '#00E676',
    fontWeight: 'bold',
  },
  recStrengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255,255,255,0.04)',
    paddingTop: 8,
  },
  recStrengthLabel: {
    fontSize: 8.5,
    color: COLORS.textSecondary,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  recStrengthVal: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  seeMoreTrendsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 4,
  },
  seeMoreTrendsBtnText: {
    fontSize: 12,
    color: COLORS.secondary,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  trendsEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 35,
    backgroundColor: 'rgba(18, 18, 26, 0.5)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  trendsEmptyText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  categoriesDetailedContainer: {
    marginTop: 4,
  },
  categoryCardWrapper: {
    marginBottom: 14,
    borderRadius: 20,
    overflow: 'hidden',
  },
  categoryDetailedCard: {
    height: 94,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.15)',
  },
  categoryCardBanner: {
    ...StyleSheet.absoluteFillObject,
  },
  categoryCardOverlayGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 10, 15, 0.65)',
  },
  recCategoryBadge: {
    position: 'absolute',
    top: 10,
    left: 16,
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  recCategoryBadgeText: {
    fontSize: 7,
    fontWeight: 'bold',
    color: COLORS.background,
    letterSpacing: 0.5,
  },
  categoryCardMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 8,
  },
  categoryCardIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(18, 18, 26, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryCardTitleBox: {
    flex: 1,
  },
  categoryCardTitleText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  categoryCardStylesCount: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 2,
    fontWeight: '600',
  },
  categoryCardRightBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryCardTrendBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 0.5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  categoryCardTrendText: {
    fontSize: 8.5,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    letterSpacing: 0.5,
  },
  subcategoriesDropdown: {
    backgroundColor: 'rgba(18, 18, 26, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.15)',
    borderTopWidth: 0,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    padding: 14,
    marginTop: -8,
    zIndex: 9,
  },
  subcategoriesTitle: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.textSecondary,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  subcategoryChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  subcategoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderColor: 'rgba(255,255,255,0.06)',
    borderWidth: 0.5,
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginRight: 6,
    marginBottom: 6,
  },
  subcategoryChipText: {
    fontSize: 10.5,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  quickPreviewBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 212, 255, 0.05)',
    borderColor: 'rgba(0, 212, 255, 0.2)',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 6,
  },
  quickPreviewBtnText: {
    fontSize: 11,
    color: COLORS.secondary,
    fontWeight: 'bold',
  },
  regionalScroll: {
    marginTop: 10,
  },
  regionalCard: {
    width: 140,
    height: 140,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  regionalImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  regionalImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 10, 15, 0.5)',
  },
  regionRankBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
  },
  regionRankText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.background,
  },
  regionalCardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    backgroundColor: 'rgba(15, 15, 22, 0.8)',
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  regionalNameText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  regionalVolumeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  regionalVolumeText: {
    fontSize: 8.5,
    color: '#00E676',
    fontWeight: 'bold',
  },
  regionSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderColor: 'rgba(255,255,255,0.08)',
    borderWidth: 0.5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  regionSelectorText: {
    fontSize: 9,
    color: COLORS.textSecondary,
    fontWeight: 'bold',
  },

  // Pagination Load More Styles
  loadMoreContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    width: '100%',
  },
  loadMoreSpinnerBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadMoreSpinnerText: {
    fontSize: 11,
    color: '#00D4FF',
    marginLeft: 8,
    fontWeight: '600',
  },
  loadMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 212, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.25)',
    width: '100%',
  },
  loadMoreBtnText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#00D4FF',
    letterSpacing: 1,
  },

  // Supplemental Recommendations styles
  recommendationDeck: {
    marginTop: 20,
    marginBottom: 10,
  },
  recommendationDeckTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  recScroll: {
    marginTop: 10,
  },
  recCard: {
    width: 140,
    height: 145,
    backgroundColor: 'rgba(18, 18, 26, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    marginRight: 12,
  },
  recCardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  recCardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 10, 15, 0.4)',
  },
  recCardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
    backgroundColor: 'rgba(18, 18, 26, 0.9)',
  },
  recCardTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  recCardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  recCardMatch: {
    fontSize: 9,
    color: '#00E676',
    fontWeight: '700',
  },
  recCardTried: {
    fontSize: 9,
    color: '#7C5CFC',
    fontWeight: '700',
  },
  recCardTryBtn: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(0, 230, 118, 0.1)',
    borderColor: 'rgba(0, 230, 118, 0.25)',
    borderWidth: 0.5,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Skeleton Loading Pulsing Styles
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  skeletonCard: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    height: 240,
    marginBottom: 16,
    overflow: 'hidden',
  },
  skeletonImage: {
    height: 120,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  skeletonInfoBox: {
    padding: 10,
  },
  skeletonTitle: {
    height: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 4,
    width: '70%',
    marginBottom: 6,
  },
  skeletonSubText: {
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 3,
    width: '45%',
    marginBottom: 10,
  },
  skeletonWhyBox: {
    height: 36,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 6,
    width: '100%',
    marginBottom: 12,
  },
  skeletonActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  skeletonActionBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },

  // Premium Filter Bottom Sheet Styles
  filterModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(5, 5, 8, 0.65)',
    justifyContent: 'flex-end',
  },
  filterModalDismissArea: {
    flex: 1,
  },
  filterSheet: {
    backgroundColor: 'rgba(18, 18, 26, 0.98)',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.2)',
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: height * 0.04,
    maxHeight: height * 0.85,
  },
  filterPullBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignSelf: 'center',
    marginBottom: 14,
  },
  filterModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  filterModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    letterSpacing: 0.5,
  },
  modalResetBtn: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(255, 82, 82, 0.08)',
    borderColor: 'rgba(255, 82, 82, 0.25)',
    borderWidth: 0.5,
    borderRadius: 6,
  },
  resetFiltersBtnText: {
    fontSize: 10.5,
    color: '#FF5252',
    fontWeight: 'bold',
  },
  filterModalScroll: {
    flexGrow: 0,
  },
  filterModalScrollContent: {
    paddingBottom: 24,
  },
  smartFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(124, 92, 252, 0.06)',
    borderColor: 'rgba(124, 92, 252, 0.2)',
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    marginBottom: 18,
  },
  smartFilterInfo: {
    flex: 1,
    marginRight: 10,
  },
  smartTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  smartFilterTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#00D4FF',
  },
  smartFilterSubtitle: {
    fontSize: 10,
    color: COLORS.textSecondary,
    lineHeight: 14,
  },
  filterSection: {
    marginBottom: 20,
  },
  filterSectionTitle: {
    fontSize: 10.5,
    fontWeight: '800',
    color: COLORS.textSecondary,
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  sortOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  sortOptCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderColor: 'rgba(255,255,255,0.06)',
    borderWidth: 0.5,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginRight: 8,
    marginBottom: 8,
  },
  activeSortOptCard: {
    backgroundColor: 'rgba(0, 212, 255, 0.06)',
    borderColor: 'rgba(0, 212, 255, 0.25)',
  },
  sortOptText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
  activeSortOptText: {
    color: '#00D4FF',
    fontWeight: 'bold',
  },
  filterChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterChip: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderColor: 'rgba(255,255,255,0.05)',
    borderWidth: 0.5,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  activeFilterChip: {
    backgroundColor: 'rgba(0, 212, 255, 0.06)',
    borderColor: 'rgba(0, 212, 255, 0.25)',
  },
  filterChipText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.65)',
    fontWeight: '500',
  },
  activeFilterChipText: {
    color: '#00D4FF',
    fontWeight: 'bold',
  },
  smartModePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    backgroundColor: 'rgba(255,255,255,0.01)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  smartModePlaceholderText: {
    fontSize: 12,
    color: COLORS.textPrimary,
    fontWeight: 'bold',
  },
  smartModePlaceholderSub: {
    fontSize: 10,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 20,
    marginTop: 4,
  },
  applyFiltersBtn: {
    backgroundColor: '#7C5CFC',
    borderRadius: 14,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#7C5CFC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  applyFiltersBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
});
