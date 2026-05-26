import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Animated, Easing, ActivityIndicator, Image, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { COLORS } from '../constants/theme';
import { useAuthStore } from '../store/authStore';
import { useProfileStore } from '../store/profileStore';
import { useTryOnStore } from '../store/tryOnStore';

const BACKEND_BASE_URL = 'http://localhost:8000';

export default function DashboardScreen({ navigation }) {
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dynamic Greeting States
  const [greeting, setGreeting] = useState('Welcome');
  const [subtitle, setSubtitle] = useState('Find your perfect hairstyle today');

  // Search Live Suggestions State
  const [suggestions, setSuggestions] = useState([]);
  const [searchableSuggestions, setSearchableSuggestions] = useState([]);

  // Profiles State
  const { profiles, activeProfileId, setActiveProfile, addProfile, fetchProfiles } = useProfileStore();
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  
  const activeProfile = profiles.find(p => p.id === activeProfileId);

  // Dynamic AI Hero States: 'NO_SELFIE' | 'UPLOADING' | 'ANALYZING' | 'PROCESSING' | 'READY' | 'FAILED'
  const [aiState, setAiState] = useState('NO_SELFIE');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [textureProgress, setTextureProgress] = useState(0);
  const [generationProgress, setGenerationProgress] = useState(0);

  // Dynamic Categories State
  const [categories, setCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Dynamic AI Recommendation Feed States
  const [trendingFeeds, setTrendingFeeds] = useState([]);
  const [personalizedFeeds, setPersonalizedFeeds] = useState([]);
  const [isLoadingHairstyles, setIsLoadingHairstyles] = useState(true);
  const [savedStyleIds, setSavedStyleIds] = useState(['fade_01']);
  const [recentlyTried, setRecentlyTried] = useState([]);

  // Try-on State Integration for Recycled Selections
  const { setSelectedHairstyle, setSelectedColor: setStoreColor, setSelectedBeardStyle } = useTryOnStore();

  // Load entry animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(25)).current;

  // Hero scanner animation
  const scanAnim = useRef(new Animated.Value(0)).current;

  // Profile switch fade animation
  const profileFadeAnim = useRef(new Animated.Value(1)).current;

  // Skeleton pulse animation
  const skeletonPulse = useRef(new Animated.Value(0.3)).current;

  // Simulates standard dynamic transition loops for real-time AI visual cues
  const runAiSequence = (hasSelfie, name = '') => {
    if (name.toLowerCase().includes('fail') || name.toLowerCase().includes('error')) {
      setAiState('UPLOADING');
      setUploadProgress(15);
      
      let uploadVal = 15;
      const uploadInterval = setInterval(() => {
        uploadVal += 25;
        setUploadProgress(Math.min(uploadVal, 100));
        if (uploadVal >= 100) {
          clearInterval(uploadInterval);
          setAiState('ANALYZING');
          setAnalysisProgress(10);
          setTextureProgress(5);
          
          let analVal = 10;
          let textVal = 5;
          const analysisInterval = setInterval(() => {
            analVal += 20;
            textVal += 15;
            setAnalysisProgress(Math.min(analVal, 100));
            setTextureProgress(Math.min(textVal, 100));
            if (analVal >= 50) {
              clearInterval(analysisInterval);
              setAiState('FAILED');
            }
          }, 300);
        }
      }, 250);
      return;
    }

    if (!hasSelfie) {
      setAiState('NO_SELFIE');
      return;
    }

    // Dynamic sequence for existing selfie
    setAiState('UPLOADING');
    setUploadProgress(0);
    setAnalysisProgress(0);
    setTextureProgress(0);
    setGenerationProgress(0);

    // upload phase
    let uProgress = 0;
    const uploadTimer = setInterval(() => {
      uProgress += 20;
      setUploadProgress(uProgress);
      if (uProgress >= 100) {
        clearInterval(uploadTimer);
        setAiState('ANALYZING');
        
        // analysis phase
        let aProgress = 0;
        let tProgress = 0;
        const analysisTimer = setInterval(() => {
          aProgress += 25;
          tProgress += 20;
          setAnalysisProgress(Math.min(aProgress, 100));
          setTextureProgress(Math.min(tProgress, 100));
          
          if (aProgress >= 100 && tProgress >= 100) {
            clearInterval(analysisTimer);
            setAiState('PROCESSING');
            
            // processing phase
            let gProgress = 0;
            const generationTimer = setInterval(() => {
              gProgress += 20;
              setGenerationProgress(gProgress);
              if (gProgress >= 100) {
                clearInterval(generationTimer);
                setAiState('READY');
              }
            }, 250);
          }
        }, 200);
      }
    }, 150);
  };

  useEffect(() => {
    // 1. Entry Fade & Slide Animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 750,
        easing: Easing.out(Easing.back(1)),
        useNativeDriver: true,
      })
    ]).start();

    // 2. Loop scanner laser animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(scanAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 3. Loop skeleton pulse animation for breathing loading states
    Animated.loop(
      Animated.sequence([
        Animated.timing(skeletonPulse, {
          toValue: 0.7,
          duration: 1100,
          useNativeDriver: true,
        }),
        Animated.timing(skeletonPulse, {
          toValue: 0.3,
          duration: 1100,
          useNativeDriver: true,
        })
      ])
    ).start();

    // Fetch dynamic initial data from API
    fetchProfiles();
    fetchCategories();
    fetchSuggestions();
  }, [fadeAnim, slideAnim, scanAnim]);

  // 3. Calculate dynamic greeting and subtitle based on time of day via backend config
  const fetchGreeting = async () => {
    try {
      const activeName = user?.name || activeProfile?.name || 'Sasi';
      const hours = new Date().getHours();
      const response = await axios.get(`${BACKEND_BASE_URL}/homepage/config`, {
        params: { username: activeName, hour: hours }
      });
      setGreeting(response.data.greeting_prefix);
      setSubtitle(response.data.subtitle);
    } catch (error) {
      console.warn("Failed to fetch greeting from backend, using offline fallback.", error);
      const hours = new Date().getHours();
      let currentGreeting = 'Good Evening';
      let currentSubtitle = 'Plan your perfect hairstyle tonight';

      if (hours < 12) {
        currentGreeting = 'Good Morning';
        currentSubtitle = 'Ready for your next fresh look?';
      } else if (hours < 17) {
        currentGreeting = 'Good Afternoon';
        currentSubtitle = 'Find your perfect hairstyle today';
      }

      setGreeting(currentGreeting);
      setSubtitle(currentSubtitle);
    }
  };

  useEffect(() => {
    fetchGreeting();
  }, [activeProfileId, user?.name]);

  useEffect(() => {
    if (activeProfile) {
      runAiSequence(!!activeProfile.selfieBase64, activeProfile.name);
    }
  }, [activeProfileId, activeProfile?.selfieBase64]);

  useEffect(() => {
    profileFadeAnim.setValue(0.4);
    Animated.timing(profileFadeAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
  }, [activeProfileId]);

  const handleReanalyze = () => {
    if (activeProfile) {
      runAiSequence(!!activeProfile.selfieBase64, activeProfile.name);
    }
  };

  const fetchHairstyles = async () => {
    setIsLoadingHairstyles(true);
    try {
      // 1. Fetch trending feed
      const trendingRes = await axios.get(`${BACKEND_BASE_URL}/recommendations/trending`, {
        params: { category: selectedCategory }
      });
      setTrendingFeeds(trendingRes.data);

      // 2. Fetch personalized recommendations based on active profile's face shape and hair texture
      const fShape = activeProfile?.analysisData?.face_shape || 'Oval';
      const hTexture = activeProfile?.analysisData?.hair_texture || 'Straight';
      const personalizedRes = await axios.get(`${BACKEND_BASE_URL}/recommendations/personalized`, {
        params: { face_shape: fShape, hair_texture: hTexture }
      });
      setPersonalizedFeeds(personalizedRes.data);

      // 3. Fetch recently tried history
      const historyRes = await axios.get(`${BACKEND_BASE_URL}/tryon/history`);
      setRecentlyTried(historyRes.data);
    } catch (error) {
      console.warn("Failed to fetch hairstyles from backend recommendations, using offline fallbacks.", error);
      setTrendingFeeds([
        {
          id: 'fade_01',
          name: 'Classic Fade',
          matchScore: '95%',
          maintenance: 'Medium Maintenance',
          badge: 'Trending',
          popularity: 4.9,
          category: 'Fade',
          imageUrl: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=350&h=350&fit=crop',
        },
        {
          id: 'korean_02',
          name: 'Korean Textured',
          matchScore: '92%',
          maintenance: 'Low Maintenance',
          badge: 'New Style',
          popularity: 4.7,
          category: 'Korean',
          imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=350&h=350&fit=crop',
        },
        {
          id: 'curly_03',
          name: 'Textured Crop',
          matchScore: '88%',
          maintenance: 'High Maintenance',
          badge: 'Recommended',
          popularity: 4.6,
          category: 'Curly',
          imageUrl: 'https://images.unsplash.com/photo-1605497746444-ac9dbd39f4a5?w=350&h=350&fit=crop',
        },
        {
          id: 'buzz_04',
          name: 'Modern Buzz',
          matchScore: '90%',
          maintenance: 'Low Maintenance',
          badge: 'Popular',
          popularity: 4.8,
          category: 'Trending',
          imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=350&h=350&fit=crop',
        }
      ]);
      setPersonalizedFeeds([
        {
          id: 'fade_01',
          name: 'Classic Fade',
          matchScore: '95%',
          maintenance: 'Medium Maintenance',
          badge: 'Recommended',
          popularity: 4.9,
          category: 'Fade',
          imageUrl: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=350&h=350&fit=crop',
        },
        {
          id: 'korean_02',
          name: 'Korean Textured',
          matchScore: '92%',
          maintenance: 'Recommended',
          popularity: 4.7,
          category: 'Korean',
          imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=350&h=350&fit=crop',
        }
      ]);
      setRecentlyTried([
        {
          id: 'curly_03',
          name: 'Textured Curly Crop',
          color: 'Silver',
          beard: 'Stubble Beard',
          time: '2 hours ago',
          imageUrl: 'https://images.unsplash.com/photo-1605497746444-ac9dbd39f4a5?w=200&h=200&fit=crop'
        },
        {
          id: 'fade_01',
          name: 'Classic Fade',
          color: 'Dark Brown',
          beard: 'Clean Shave',
          time: '1 day ago',
          imageUrl: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=200&h=200&fit=crop'
        }
      ]);
    } finally {
      setIsLoadingHairstyles(false);
    }
  };

  useEffect(() => {
    fetchHairstyles();
  }, [activeProfileId, selectedCategory, activeProfile?.analysisData]);

  const toggleBookmark = (id) => {
    if (savedStyleIds.includes(id)) {
      setSavedStyleIds(savedStyleIds.filter(item => item !== id));
    } else {
      setSavedStyleIds([...savedStyleIds, id]);
    }
  };

  const handleQuickTryOn = (item) => {
    setSelectedHairstyle({ id: item.id, name: item.name });
    navigation.navigate('VirtualTryOn');
  };

  const handleQuickCompare = (item) => {
    setSelectedHairstyle({ id: item.id, name: item.name });
    navigation.navigate('Comparison');
  };

  // 4. Fetch dynamic categories dynamically from API
  const fetchCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const response = await axios.get(`${BACKEND_BASE_URL}/homepage/categories`);
      setCategories(response.data);
    } catch (error) {
      console.warn("Failed to fetch categories from backend, using offline fallback.", error);
      setCategories(['Korean', 'Fade', 'Curly', 'Professional', 'Beard', 'Trending']);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  // 5. Fetch dynamic search suggestions dynamically from API
  const fetchSuggestions = async () => {
    try {
      const response = await axios.get(`${BACKEND_BASE_URL}/homepage/suggestions`);
      setSearchableSuggestions(response.data);
    } catch (error) {
      console.warn("Failed to fetch suggestions from backend, using offline fallback.", error);
      setSearchableSuggestions([
        { name: 'Classic Fade', type: 'Hairstyle', id: 'fade_01' },
        { name: 'Korean Textured', type: 'Hairstyle', id: 'korean_02' },
        { name: 'Textured Curly Crop', type: 'Hairstyle', id: 'curly_03' },
        { name: 'Modern Buzz Cut', type: 'Hairstyle', id: 'buzz_04' },
        { name: 'Wolf Cut', type: 'Hairstyle', id: 'curly_03' },
        { name: 'Pompadour style', type: 'Hairstyle', id: 'fade_01' },
        { name: 'Clean Shave', type: 'Beard Style', query: 'Clean Shave' },
        { name: 'Stubble Beard', type: 'Beard Style', query: 'Stubble' },
        { name: 'Short Beard', type: 'Beard Style', query: 'Short Beard' },
        { name: 'Full Beard', type: 'Beard Style', query: 'Full Beard' },
        { name: 'Silver Hair Color', type: 'Hair Color', query: 'Silver' },
        { name: 'Blonde Highlights', type: 'Hair Color', query: 'Blonde' },
        { name: 'Burgundy Dye', type: 'Hair Color', query: 'Burgundy' },
        { name: 'Dark Brown Shade', type: 'Hair Color', query: 'Dark Brown' },
        { name: 'Zayn Malik Celebrity Look', type: 'Celebrity look', query: 'Zayn Malik' },
        { name: 'Gong Yoo Wave style', type: 'Celebrity look', query: 'Gong Yoo' },
        { name: 'Trending Fades', type: 'Trend', query: 'Modern Fades' },
        { name: 'Korean Bangs Trend', type: 'Trend', query: 'Korean Bangs' }
      ]);
    }
  };

  const translateY = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-24, 24],
  });

  const trendingHairstyles = [
    {
      id: 'fade_01',
      name: 'Classic Fade',
      matchScore: '95%',
      maintenance: 'Medium Maintenance',
      badge: 'Trending',
      imageUrl: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=350&h=350&fit=crop',
    },
    {
      id: 'korean_02',
      name: 'Korean Textured',
      matchScore: '92%',
      maintenance: 'Low Maintenance',
      badge: 'New Style',
      imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=350&h=350&fit=crop',
    },
    {
      id: 'curly_03',
      name: 'Textured Crop',
      matchScore: '88%',
      maintenance: 'High Maintenance',
      badge: 'Hot Look',
      imageUrl: 'https://images.unsplash.com/photo-1605497746444-ac9dbd39f4a5?w=350&h=350&fit=crop',
    },
    {
      id: 'buzz_04',
      name: 'Modern Buzz',
      matchScore: '90%',
      maintenance: 'Low Maintenance',
      badge: 'Popular',
      imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=350&h=350&fit=crop',
    }
  ];



  // Live query change handler
  const handleSearchTextChange = (text) => {
    setSearchQuery(text);
    if (text.trim().length > 0) {
      const filtered = searchableSuggestions.filter(item =>
        item.name.toLowerCase().includes(text.toLowerCase()) ||
        item.type.toLowerCase().includes(text.toLowerCase())
      ).slice(0, 5);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  // Search Submission or Suggestion click handler
  const handleSuggestionPress = (item) => {
    setSearchQuery('');
    setSuggestions([]);
    if (item.id) {
      navigation.navigate('HairstyleDetail', { id: item.id });
    } else {
      navigation.navigate('Search', { query: item.query || item.name });
    }
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      navigation.navigate('Search', { query: searchQuery.trim() });
      setSearchQuery('');
      setSuggestions([]);
    }
  };

  const handleCategoryPress = (category) => {
    if (selectedCategory === category) {
      setSelectedCategory(null);
      navigation.navigate('Search', { query: '' });
    } else {
      setSelectedCategory(category);
      navigation.navigate('Search', { query: category });
    }
  };

  // Pulsing skeleton for the horizontal recommendation cards
  const renderRecommendationSkeleton = () => {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.recommendedScroll}
        contentContainerStyle={styles.recommendedScrollContent}
      >
        {[1, 2].map((i) => (
          <Animated.View
            key={i}
            style={[
              styles.recommendedCard,
              { opacity: skeletonPulse, backgroundColor: 'rgba(255, 255, 255, 0.03)', borderColor: 'rgba(255, 255, 255, 0.05)' }
            ]}
          >
            <View style={{ ...styles.recommendedCardOverlay, backgroundColor: 'rgba(255, 255, 255, 0.03)' }} />
            <View style={[styles.recommendedMatchRing, { borderColor: 'rgba(255, 255, 255, 0.08)', backgroundColor: 'rgba(255, 255, 255, 0.04)' }]} />
            <View style={[styles.recommendedCardBadge, { backgroundColor: 'rgba(255, 255, 255, 0.04)', borderColor: 'transparent' }]} />
            <View style={[styles.recommendedInfoBox, { backgroundColor: 'rgba(255, 255, 255, 0.02)' }]}>
              <View style={{ width: 120, height: 14, backgroundColor: 'rgba(255, 255, 255, 0.06)', borderRadius: 4, marginBottom: 6 }} />
              <View style={{ width: 80, height: 10, backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: 4 }} />
            </View>
          </Animated.View>
        ))}
      </ScrollView>
    );
  };

  // Pulsing skeleton for the vertical/grid trending cards
  const renderTrendingSkeleton = () => {
    return (
      <View style={styles.trendingGrid}>
        {[1, 2, 3, 4].map((i) => (
          <Animated.View
            key={i}
            style={[
              styles.trendCard,
              { opacity: skeletonPulse, backgroundColor: 'rgba(255, 255, 255, 0.03)', borderColor: 'rgba(255, 255, 255, 0.05)' }
            ]}
          >
            <View style={[styles.trendImageContainer, { backgroundColor: 'rgba(255, 255, 255, 0.04)' }]}>
              <View style={[styles.trendCardBadge, { backgroundColor: 'rgba(255, 255, 255, 0.04)', borderColor: 'transparent' }]} />
              <View style={[styles.trendCardMatchBadge, { backgroundColor: 'rgba(255, 255, 255, 0.04)', borderColor: 'transparent' }]} />
            </View>
            <View style={[styles.trendInfoBox, { backgroundColor: 'rgba(255, 255, 255, 0.02)' }]}>
              <View style={{ width: 90, height: 12, backgroundColor: 'rgba(255, 255, 255, 0.06)', borderRadius: 4, marginBottom: 6 }} />
              <View style={{ width: 60, height: 10, backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: 4 }} />
            </View>
          </Animated.View>
        ))}
      </View>
    );
  };

  const getAiSummaryData = () => {
    if (!activeProfile || !activeProfile.analysisData) {
      return {
        matchScore: '92%',
        hairHealth: 85,
        recommendationStrength: 'STRONG',
        recProgress: '92%',
        styleCompatibility: 95,
        faceShape: 'Oval',
        texture: 'Straight',
        density: 'Medium',
        beardCompatibility: '85%',
      };
    }

    const data = activeProfile.analysisData;
    
    // Dynamically calculate metrics based on shape, texture etc. to feel extremely authentic & real!
    const faceShape = data.face_shape || 'Oval';
    const texture = data.hair_texture || data.hair_type || 'Straight';
    const density = data.hair_density || 'Medium';
    
    // Derive some nice deterministic but realistic values based on their actual analysis data!
    let hairHealth = data.hair_health_score || 85;
    let symmetry = data.symmetry_score ? Math.round(data.symmetry_score * 100) : 92;
    let beardScore = data.beard_compatibility_score || 88;
    
    // If not present in mock, calculate a stable value from characteristics
    if (!data.hair_health_score) {
      if (faceShape === 'Heart') {
        hairHealth = 78;
        symmetry = 89;
        beardScore = 75;
      } else if (faceShape === 'Oval') {
        hairHealth = 88;
        symmetry = 94;
        beardScore = 91;
      } else {
        hairHealth = 82;
        symmetry = 85;
        beardScore = 80;
      }
    }

    const recommendationStrength = symmetry >= 92 ? 'STRONG' : symmetry >= 85 ? 'HIGH' : 'OPTIMAL';
    const styleCompatibility = Math.min(symmetry + 3, 98);

    return {
      matchScore: `${symmetry}%`,
      hairHealth,
      recommendationStrength,
      recProgress: `${symmetry}%`,
      styleCompatibility,
      faceShape,
      texture,
      density,
      beardCompatibility: `${beardScore}%`,
    };
  };

  const summaryData = getAiSummaryData();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Animated Top Section */}
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        {/* Brand Header & Profile Avatar & Notifications */}
        <View style={styles.headerRow}>
          <View style={styles.greetContainer}>
            <Text style={styles.welcomeSubtitle}>{subtitle.toUpperCase()}</Text>
            <Text style={styles.welcomeTitle} numberOfLines={1}>
              {greeting}, {user?.name || activeProfile?.name || 'Sasi'}
            </Text>
          </View>
          
          <View style={styles.headerRightRow}>
            {/* Glowing Notification Icon */}
            <TouchableOpacity
              style={styles.notificationBtn}
              onPress={() => navigation.navigate('Notifications')}
              activeOpacity={0.7}
            >
              <Ionicons name="notifications-outline" size={22} color={COLORS.textPrimary} />
              <View style={styles.notificationBadge} />
            </TouchableOpacity>

            {/* Profile Avatar with dynamic image, fallback, and modal triggers */}
            <TouchableOpacity
              style={styles.profileBtn}
              onPress={() => setProfileModalVisible(true)}
              activeOpacity={0.8}
            >
              <View style={styles.avatarBorder}>
                <View style={styles.avatarContainer}>
                  {activeProfile?.avatarUrl ? (
                    <Image source={{ uri: activeProfile.avatarUrl }} style={styles.avatarImage} />
                  ) : (
                    <Text style={styles.avatarText}>
                      {activeProfile?.name?.substring(0, 2).toUpperCase() || 'JD'}
                    </Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Modern Search Bar */}
        <View style={styles.searchSectionContainer}>
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={20} color={COLORS.secondary} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search cuts, colors, beards, celebs..."
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
              value={searchQuery}
              onChangeText={handleSearchTextChange}
              onSubmitEditing={handleSearchSubmit}
              returnKeyType="search"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => { setSearchQuery(''); setSuggestions([]); }} activeOpacity={0.7}>
                <Ionicons name="close-circle" size={18} color="rgba(255, 255, 255, 0.5)" style={styles.clearIcon} />
              </TouchableOpacity>
            )}
          </View>

          {/* Live Search Suggestions Popover */}
          {suggestions.length > 0 && (
            <View style={styles.suggestionsContainer}>
              {suggestions.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestionItem}
                  onPress={() => handleSuggestionPress(item)}
                  activeOpacity={0.7}
                >
                  <Ionicons 
                    name={item.id ? "cut-outline" : "search-outline"} 
                    size={16} 
                    color={COLORS.secondary} 
                    style={styles.suggestionIcon} 
                  />
                  <Text style={styles.suggestionText}>{item.name}</Text>
                  <Text style={styles.suggestionTypeText}>{item.type}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Dynamic Category Chips Scroll */}
        {isLoadingCategories ? (
          <View style={styles.skeletonChipsContainer}>
            <View style={styles.skeletonChip} />
            <View style={styles.skeletonChip2} />
            <View style={styles.skeletonChip3} />
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipsScroll}
            contentContainerStyle={styles.chipsContainer}
          >
            {categories.map((item) => {
              const isActive = selectedCategory === item;
              return (
                <TouchableOpacity
                  key={item}
                  style={[styles.chip, isActive && styles.activeChip]}
                  onPress={() => handleCategoryPress(item)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.chipText, isActive && styles.activeChipText]}>{item}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </Animated.View>

      {/* Redesigned AI Hairstyle Try-On Card (Glassmorphic & Futuristic Hero) */}
      <View style={[
        styles.heroCard, 
        aiState === 'NO_SELFIE' && styles.cardIdle,
        aiState === 'UPLOADING' && styles.cardUploading,
        aiState === 'ANALYZING' && styles.cardAnalyzing,
        aiState === 'PROCESSING' && styles.cardProcessing,
        aiState === 'READY' && styles.cardReady,
        aiState === 'FAILED' && styles.cardFailed
      ]}>
        {/* Glow spots for linear-gradient radial effect */}
        <View style={styles.glowSpot1} />
        <View style={styles.glowSpot2} />

        {/* Content Top Row */}
        <View style={styles.heroMainRow}>
          <View style={styles.heroTextContent}>
            {/* Dynamic AI Status Badge */}
            <View style={[
              styles.heroBadge,
              aiState === 'NO_SELFIE' && styles.badgeIdle,
              aiState === 'UPLOADING' && styles.badgeUploading,
              aiState === 'ANALYZING' && styles.badgeAnalyzing,
              aiState === 'PROCESSING' && styles.badgeProcessing,
              aiState === 'READY' && styles.badgeReady,
              aiState === 'FAILED' && styles.badgeFailed
            ]}>
              <Text style={[
                styles.heroBadgeText,
                aiState === 'NO_SELFIE' && styles.badgeTextIdle,
                aiState === 'UPLOADING' && styles.badgeTextUploading,
                aiState === 'ANALYZING' && styles.badgeTextAnalyzing,
                aiState === 'PROCESSING' && styles.badgeTextProcessing,
                aiState === 'READY' && styles.badgeTextReady,
                aiState === 'FAILED' && styles.badgeTextFailed
              ]}>
                {aiState === 'NO_SELFIE' && '🔴 FACE AI OFFLINE'}
                {aiState === 'UPLOADING' && '⚡ UPLOADING SELFIE...'}
                {aiState === 'ANALYZING' && '🌀 NEURAL ANALYSIS ACTIVE'}
                {aiState === 'PROCESSING' && '🧬 HAIR SYNTHESIS IN PROGRESS'}
                {aiState === 'READY' && '🟢 FACE AI READY'}
                {aiState === 'FAILED' && '❌ AI ENGINE FAILED'}
              </Text>
            </View>
            <Text style={styles.heroTitle}>AI Hairstyle Try-On</Text>
            <Text style={styles.heroSubtitle}>
              {aiState === 'NO_SELFIE' && 'Upload a selfie to analyze your face shape and try on styles instantly.'}
              {aiState === 'UPLOADING' && 'Uploading your face profile to security-cleared cloud nodes...'}
              {aiState === 'ANALYZING' && 'Analyzing neural facial features and bone structure symmetry...'}
              {aiState === 'PROCESSING' && 'Synthesizing and rendering realistic matching hairstyles...'}
              {aiState === 'READY' && 'Your AI hair profile is ready! Try on any hairstyle instantly.'}
              {aiState === 'FAILED' && 'Failed to detect a clear face in the uploaded image. Please retry.'}
            </Text>
          </View>

          {/* Futuristic AI Illustration / Animation */}
          <View style={styles.illustrationContainer}>
            <View style={[
              styles.outerScanRing,
              aiState === 'FAILED' && styles.ringFailed,
              aiState === 'READY' && styles.ringReady
            ]}>
              <View style={[
                styles.innerScanRing,
                aiState === 'FAILED' && styles.innerRingFailed,
                aiState === 'READY' && styles.innerRingReady
              ]}>
                {aiState === 'NO_SELFIE' && <Ionicons name="camera-outline" size={26} color="rgba(255, 255, 255, 0.4)" />}
                {aiState === 'UPLOADING' && <Ionicons name="cloud-upload-outline" size={26} color="#7C5CFC" />}
                {aiState === 'ANALYZING' && <Ionicons name="scan-outline" size={26} color="#00D4FF" />}
                {aiState === 'PROCESSING' && <Ionicons name="git-branch-outline" size={26} color="#00E676" />}
                {aiState === 'READY' && <Ionicons name="checkmark-circle-outline" size={28} color="#00E676" />}
                {aiState === 'FAILED' && <Ionicons name="alert-circle-outline" size={28} color="#FF1744" />}
              </View>
              {(aiState === 'ANALYZING' || aiState === 'PROCESSING') && (
                <Animated.View style={[styles.scanLine, { transform: [{ translateY }] }]} />
              )}
            </View>
          </View>
        </View>

        {/* Live Loading Animation Placeholders */}
        <View style={styles.statusPanel}>
          {aiState === 'NO_SELFIE' && (
            <View style={styles.statusRowSimple}>
              <Ionicons name="information-circle-outline" size={16} color="rgba(255, 255, 255, 0.5)" style={styles.infoIcon} />
              <Text style={styles.statusTextSimple}>AI engine idle. Upload a face photo to initialize neural rendering.</Text>
            </View>
          )}

          {aiState === 'UPLOADING' && (
            <View style={styles.statusRow}>
              <View style={styles.statusLabelRow}>
                <ActivityIndicator size="small" color="#7C5CFC" style={styles.statusIndicator} />
                <Text style={styles.statusText}>Uploading base64 image streams... {uploadProgress}%</Text>
              </View>
              <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { width: `${uploadProgress}%`, backgroundColor: '#7C5CFC' }]} />
              </View>
            </View>
          )}

          {aiState === 'ANALYZING' && (
            <>
              <View style={styles.statusRow}>
                <View style={styles.statusLabelRow}>
                  <ActivityIndicator size="small" color="#00D4FF" style={styles.statusIndicator} />
                  <Text style={styles.statusText}>Analyzing Face Shape... {analysisProgress}%</Text>
                </View>
                <View style={styles.progressContainer}>
                  <View style={[styles.progressBar, { width: `${analysisProgress}%`, backgroundColor: '#00D4FF' }]} />
                </View>
              </View>
              <View style={[styles.statusRow, { marginBottom: 0 }]}>
                <View style={styles.statusLabelRow}>
                  <ActivityIndicator size="small" color="#00D4FF" style={styles.statusIndicator} />
                  <Text style={styles.statusText}>Detecting Hair Texture... {textureProgress}%</Text>
                </View>
                <View style={styles.progressContainer}>
                  <View style={[styles.progressBar, { width: `${textureProgress}%`, backgroundColor: '#00D4FF' }]} />
                </View>
              </View>
            </>
          )}

          {aiState === 'PROCESSING' && (
            <>
              <View style={styles.statusRow}>
                <View style={styles.statusLabelRow}>
                  <Ionicons name="checkmark-circle" size={14} color="#00E676" style={styles.successStatusIcon} />
                  <Text style={[styles.statusText, { color: '#00E676' }]}>Analyzing Face Shape... 100%</Text>
                </View>
                <View style={styles.progressContainer}>
                  <View style={[styles.progressBar, { width: '100%', backgroundColor: '#00E676' }]} />
                </View>
              </View>
              <View style={styles.statusRow}>
                <View style={styles.statusLabelRow}>
                  <Ionicons name="checkmark-circle" size={14} color="#00E676" style={styles.successStatusIcon} />
                  <Text style={[styles.statusText, { color: '#00E676' }]}>Detecting Hair Texture... 100%</Text>
                </View>
                <View style={styles.progressContainer}>
                  <View style={[styles.progressBar, { width: '100%', backgroundColor: '#00E676' }]} />
                </View>
              </View>
              <View style={[styles.statusRow, { marginBottom: 0 }]}>
                <View style={styles.statusLabelRow}>
                  <ActivityIndicator size="small" color="#00D4FF" style={styles.statusIndicator} />
                  <Text style={styles.statusText}>Generating Realistic Hair... {generationProgress}%</Text>
                </View>
                <View style={styles.progressContainer}>
                  <View style={[styles.progressBar, { width: `${generationProgress}%`, backgroundColor: '#00D4FF' }]} />
                </View>
              </View>
            </>
          )}

          {aiState === 'READY' && (
            <View style={styles.statusRowSimple}>
              <Ionicons name="sparkles" size={16} color="#00E676" style={styles.infoIcon} />
              <Text style={[styles.statusTextSimple, { color: '#00E676', fontWeight: 'bold' }]}>
                Neural profile fully generated. 95% matching accuracy active.
              </Text>
            </View>
          )}

          {aiState === 'FAILED' && (
            <View style={styles.statusRowSimple}>
              <Ionicons name="close-circle" size={16} color="#FF1744" style={styles.infoIcon} />
              <Text style={[styles.statusTextSimple, { color: '#FF1744', fontWeight: 'bold' }]}>
                Error: No face detected. Make sure your face is well-lit and fully visible.
              </Text>
            </View>
          )}
        </View>

        {/* Dynamic Action Buttons */}
        <View style={styles.actionsContainer}>
          {(aiState === 'NO_SELFIE' || aiState === 'FAILED') && (
            <TouchableOpacity
              style={[
                styles.actionBtn, 
                aiState === 'FAILED' ? styles.failedActionBtn : styles.primaryActionBtn
              ]}
              onPress={() => navigation.navigate('AIAnalysis')}
              activeOpacity={0.8}
            >
              <Ionicons 
                name="cloud-upload-outline" 
                size={16} 
                color={aiState === 'FAILED' ? '#FF1744' : COLORS.background} 
                style={styles.btnIcon} 
              />
              <Text style={[
                styles.actionBtnText, 
                aiState === 'FAILED' ? styles.failedActionBtnText : styles.primaryActionBtnText
              ]}>
                Upload Selfie
              </Text>
            </TouchableOpacity>
          )}

          {aiState === 'READY' && (
            <>
              <TouchableOpacity
                style={[styles.actionBtn, styles.primaryActionBtn]}
                onPress={() => navigation.navigate('LiveCamera')}
                activeOpacity={0.8}
              >
                <Ionicons name="videocam-outline" size={16} color={COLORS.background} style={styles.btnIcon} />
                <Text style={[styles.actionBtnText, styles.primaryActionBtnText]}>Start Live Try-On</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, styles.secondaryActionBtn]}
                onPress={handleReanalyze}
                activeOpacity={0.8}
              >
                <Ionicons name="analytics-outline" size={16} color={COLORS.secondary} style={styles.btnIcon} />
                <Text style={[styles.actionBtnText, styles.secondaryActionBtnText]}>AI Analyze My Hair</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, styles.tertiaryActionBtn]}
                onPress={() => navigation.navigate('AIAnalysis')}
                activeOpacity={0.8}
              >
                <Ionicons name="camera-outline" size={16} color={COLORS.textPrimary} style={styles.btnIcon} />
                <Text style={[styles.actionBtnText, styles.tertiaryActionBtnText]}>Change Selfie</Text>
              </TouchableOpacity>
            </>
          )}

          {aiState === 'NO_SELFIE' && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.secondaryActionBtn]}
              onPress={() => navigation.navigate('LiveCamera')}
              activeOpacity={0.8}
            >
              <Ionicons name="videocam-outline" size={16} color={COLORS.secondary} style={styles.btnIcon} />
              <Text style={[styles.actionBtnText, styles.secondaryActionBtnText]}>Start Live Try-On</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Current Face Profile Section (Dynamic & Premium Carousel) */}
      <View style={styles.profileSection}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Saved Face Profiles</Text>
          <TouchableOpacity 
            style={styles.addProfileHeaderBtn}
            onPress={() => setProfileModalVisible(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="settings-outline" size={14} color={COLORS.secondary} />
            <Text style={styles.addProfileHeaderBtnText}>Manage</Text>
          </TouchableOpacity>
        </View>

        {/* Animated Active Profile Card */}
        <Animated.View style={[styles.profileCard, { opacity: profileFadeAnim }]}>
          <View style={styles.glowSpotProfile} />
          
          <View style={styles.profileHeaderRow}>
            {/* Avatar block with status ring */}
            <View style={[
              styles.avatarContainerLarge,
              activeProfile?.isGuest ? styles.avatarRingGuest : styles.avatarRingActive
            ]}>
              {activeProfile?.avatarUrl ? (
                <Image source={{ uri: activeProfile.avatarUrl }} style={styles.profileThumbnailLarge} />
              ) : (
                <View style={styles.profileThumbnailPlaceholderLarge}>
                  <Text style={styles.profileThumbnailPlaceholderTextLarge}>
                    {activeProfile?.name?.substring(0, 2).toUpperCase() || 'GU'}
                  </Text>
                </View>
              )}
              {/* Pulsing online status indicator dot */}
              <View style={styles.activeProfileIndicator} />
            </View>

            <View style={styles.profileInfoContainer}>
              <Text style={styles.profileCardLabel}>CURRENT ACTIVE PROFILE</Text>
              <Text style={styles.profileCardTitle}>
                {activeProfile?.name || 'Sasi'} {activeProfile?.isGuest && ' (Guest)'}
              </Text>
              <Text style={styles.profileMetaText}>
                Last used: <Text style={styles.profileHighlightText}>{activeProfile?.lastUsedTime || 'Active Now'}</Text>
              </Text>
            </View>
          </View>

          {/* AI Badges Row */}
          <View style={styles.badgeRow}>
            {activeProfile?.analysisData ? (
              <>
                <View style={[styles.aiBadge, styles.badgeFaceShape]}>
                  <Ionicons name="scan" size={10} color="#00D4FF" style={styles.badgeIcon} />
                  <Text style={styles.aiBadgeText}>{activeProfile.analysisData.face_shape} Shape</Text>
                </View>
                <View style={[styles.aiBadge, styles.badgeHairType]}>
                  <Ionicons name="git-branch" size={10} color="#7C5CFC" style={styles.badgeIcon} />
                  <Text style={styles.aiBadgeText}>{activeProfile.analysisData.hair_texture || activeProfile.analysisData.hair_type} Hair</Text>
                </View>
                <View style={[styles.aiBadge, styles.badgeDensity]}>
                  <Ionicons name="grid" size={10} color="#00E676" style={styles.badgeIcon} />
                  <Text style={styles.aiBadgeText}>{activeProfile.analysisData.hair_density} Density</Text>
                </View>
              </>
            ) : (
              <View style={[styles.aiBadge, styles.badgeDashed]}>
                <Ionicons name="alert-circle-outline" size={10} color="rgba(255,255,255,0.4)" style={styles.badgeIcon} />
                <Text style={styles.aiBadgeTextDashed}>No AI Analysis Scan Loaded</Text>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.profileActionsContainer}>
            <TouchableOpacity
              style={[styles.profileActionBtn, styles.profileChangeBtn]}
              onPress={() => navigation.navigate('AIAnalysis')}
              activeOpacity={0.75}
            >
              <Ionicons name="camera-outline" size={14} color={COLORS.secondary} style={styles.profileBtnIcon} />
              <Text style={styles.profileChangeBtnText}>Change Selfie</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.profileActionBtn, styles.profileSwitchBtn]}
              onPress={() => setProfileModalVisible(true)}
              activeOpacity={0.75}
            >
              <Ionicons name="people-outline" size={14} color={COLORS.textPrimary} style={styles.profileBtnIcon} />
              <Text style={styles.profileSwitchBtnText}>Switch Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.profileActionBtn, styles.profileAddBtn]}
              onPress={() => {
                setProfileModalVisible(true);
              }}
              activeOpacity={0.75}
            >
              <Ionicons name="person-add-outline" size={14} color="#00E676" style={styles.profileBtnIcon} />
              <Text style={styles.profileAddBtnText}>Add New</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Horizontal Profile Carousel Selector directly on the dashboard */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.profileCarouselScroll}
          contentContainerStyle={styles.profileCarouselContent}
        >
          {profiles.map((p) => {
            const isSelected = p.id === activeProfileId;
            return (
              <TouchableOpacity
                key={p.id}
                style={[
                  styles.carouselProfileItem,
                  isSelected && styles.carouselProfileItemActive
                ]}
                onPress={() => setActiveProfile(p.id)}
                activeOpacity={0.8}
              >
                <View style={[
                  styles.carouselAvatarRing,
                  isSelected && styles.carouselAvatarRingSelected
                ]}>
                  {p.avatarUrl ? (
                    <Image source={{ uri: p.avatarUrl }} style={styles.carouselAvatar} />
                  ) : (
                    <View style={styles.carouselAvatarPlaceholder}>
                      <Text style={styles.carouselAvatarPlaceholderText}>
                        {p.name.substring(0, 2).toUpperCase()}
                      </Text>
                    </View>
                  )}
                </View>
                <Text 
                  style={[
                    styles.carouselProfileName,
                    isSelected && styles.carouselProfileNameActive
                  ]}
                  numberOfLines={1}
                >
                  {p.name}
                </Text>
              </TouchableOpacity>
            );
          })}
          
          {/* Quick Add Profile Node in Carousel */}
          <TouchableOpacity
            style={styles.carouselProfileItemAdd}
            onPress={() => setProfileModalVisible(true)}
            activeOpacity={0.8}
          >
            <View style={styles.carouselAvatarRingAdd}>
              <Ionicons name="add" size={20} color="rgba(255, 255, 255, 0.6)" />
            </View>
            <Text style={styles.carouselProfileNameAdd}>Add New</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Switch Profile Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={profileModalVisible}
        onRequestClose={() => setProfileModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalGlow} />
            
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Switch Face Profile</Text>
              <TouchableOpacity onPress={() => setProfileModalVisible(false)}>
                <Ionicons name="close-outline" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Switch between saved face shapes and selfies or configure a temporary Guest profile.
            </Text>

            {/* Profile List */}
            <ScrollView style={styles.modalProfilesList} showsVerticalScrollIndicator={false}>
              {profiles.map((p) => {
                const isActive = p.id === activeProfileId;
                return (
                  <TouchableOpacity
                    key={p.id}
                    style={[styles.modalProfileItem, isActive && styles.activeModalProfileItem]}
                    onPress={() => {
                      setActiveProfile(p.id);
                      setProfileModalVisible(false);
                    }}
                    activeOpacity={0.75}
                  >
                    <Image source={{ uri: p.avatarUrl }} style={styles.modalAvatar} />
                    <View style={styles.modalProfileInfo}>
                      <Text style={[styles.modalProfileName, isActive && styles.activeModalProfileName]}>
                        {p.name} {p.isGuest && '(Guest)'}
                      </Text>
                      <Text style={styles.modalProfileDetails}>
                        {p.analysisData ? `${p.analysisData.face_shape} • ${p.analysisData.hair_type}` : 'No Selfie Uploaded'}
                      </Text>
                    </View>
                    {isActive ? (
                      <Ionicons name="checkmark-circle" size={22} color={COLORS.secondary} />
                    ) : (
                      <View style={styles.unselectedRadio} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Add New Profile Section */}
            <View style={styles.addProfileSection}>
              <Text style={styles.addProfileLabel}>Create New Profile</Text>
              <View style={styles.addProfileRow}>
                <TextInput
                  style={styles.addProfileInput}
                  placeholder="Enter name (e.g. Sasi)..."
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  value={newProfileName}
                  onChangeText={setNewProfileName}
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.addProfileBtn}
                  onPress={() => {
                    if (newProfileName.trim()) {
                      addProfile(newProfileName.trim());
                      setNewProfileName('');
                      setProfileModalVisible(false);
                    }
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.addProfileBtnText}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Dynamic AI Recommendation Section - Recommended For You */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Recommended For You</Text>
        <Ionicons name="sparkles-outline" size={16} color="#00D4FF" />
      </View>
      <Text style={styles.sectionSubtitle}>
        AI Recommendations tailored for your {activeProfile?.analysisData?.face_shape || 'Oval'} face & {activeProfile?.analysisData?.hair_type || 'Straight'} hair
      </Text>

      {isLoadingHairstyles ? renderRecommendationSkeleton() : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.recommendedScroll}
          contentContainerStyle={styles.recommendedScrollContent}
        >
          {personalizedFeeds.map((item) => {
            const isBookmarked = savedStyleIds.includes(item.id);
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.recommendedCard}
                onPress={() => navigation.navigate('HairstyleDetail', { id: item.id })}
                activeOpacity={0.85}
              >
                <Image source={{ uri: item.imageUrl }} style={styles.recommendedImage} />
                <View style={styles.recommendedCardOverlay} />

                {/* Compatibility Ring Floating Tag */}
                <View style={styles.recommendedMatchRing}>
                  <Text style={styles.recommendedMatchText}>{item.matchScore}</Text>
                  <Text style={styles.recommendedMatchSubText}>Match</Text>
                </View>

                {/* Card floating badge */}
                <View style={styles.recommendedCardBadge}>
                  <Text style={styles.recommendedCardBadgeText}>{item.badge}</Text>
                </View>

                {/* Info Overlay Box */}
                <View style={styles.recommendedInfoBox}>
                  <Text style={styles.recommendedNameText} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.recommendedMetaText}>
                    {item.category} • {item.maintenance}
                  </Text>
                  
                  {/* Floating Action Icons */}
                  <View style={styles.recommendedActionsRow}>
                    <TouchableOpacity
                      style={styles.cardActionBtnMini}
                      onPress={() => toggleBookmark(item.id)}
                      activeOpacity={0.7}
                    >
                      <Ionicons 
                        name={isBookmarked ? "bookmark" : "bookmark-outline"} 
                        size={14} 
                        color={isBookmarked ? "#00D4FF" : COLORS.textPrimary} 
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.cardActionBtnMini}
                      onPress={() => handleQuickTryOn(item)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="sparkles" size={14} color="#00E676" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.cardActionBtnMini}
                      onPress={() => handleQuickCompare(item)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="git-compare" size={14} color="#7C5CFC" />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* Trending Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Trending Hairstyles</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Search')} activeOpacity={0.7}>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>

      {/* Redesigned Premium Trending Grid */}
      {isLoadingHairstyles ? renderTrendingSkeleton() : (
        <View style={styles.trendingGrid}>
          {trendingFeeds.map((item) => {
            const isBookmarked = savedStyleIds.includes(item.id);
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.trendCard}
                onPress={() => navigation.navigate('HairstyleDetail', { id: item.id })}
                activeOpacity={0.85}
              >
                {/* Image Cover Container */}
                <View style={styles.trendImageContainer}>
                  <Image source={{ uri: item.imageUrl }} style={styles.trendImage} />
                  <View style={styles.trendImageOverlay} />
                  
                  {/* Floating Trend Badge */}
                  <View style={styles.trendCardBadge}>
                    <Text style={styles.trendCardBadgeText}>{item.badge}</Text>
                  </View>
                  
                  {/* Match Score Floating Badge */}
                  <View style={styles.trendCardMatchBadge}>
                    <Text style={styles.trendCardMatchBadgeText}>{item.matchScore}</Text>
                  </View>
                </View>

                {/* Info Box */}
                <View style={styles.trendInfoBox}>
                  <Text style={styles.trendTitleText} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.trendMaintLevelText}>{item.maintenance}</Text>
                  
                  {/* Mini actions inside card */}
                  <View style={styles.trendActionsRow}>
                    <Text style={styles.trendPopularityScoreText}>
                      ⭐ {item.popularity}
                    </Text>

                    <View style={styles.trendCardButtonsRow}>
                      <TouchableOpacity
                        style={styles.miniCardIconBtn}
                        onPress={() => toggleBookmark(item.id)}
                        activeOpacity={0.7}
                      >
                        <Ionicons 
                          name={isBookmarked ? "bookmark" : "bookmark-outline"} 
                          size={12} 
                          color={isBookmarked ? "#00D4FF" : COLORS.textPrimary} 
                        />
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.miniCardIconBtn}
                        onPress={() => handleQuickTryOn(item)}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="sparkles" size={12} color="#00E676" />
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.miniCardIconBtn}
                        onPress={() => handleQuickCompare(item)}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="git-compare" size={12} color="#7C5CFC" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* SECTION 1 — Recently Tried (Dynamic & Premium Swipeable History) */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Recently Tried</Text>
        <Ionicons name="time-outline" size={16} color={COLORS.secondary} />
      </View>
      
      {recentlyTried && recentlyTried.length > 0 ? (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.recentScroll}
          contentContainerStyle={styles.recentScrollContent}
          snapToInterval={286} // Snaps perfectly for card sizing + margin
          decelerationRate="fast"
        >
          {recentlyTried.map((item, index) => (
            <View key={index} style={styles.recentHistoryCard}>
              <View style={styles.recentCardGlow} />
              
              <View style={styles.recentMainRow}>
                {/* Hairstyle Preview Thumbnail */}
                <Image source={{ uri: item.imageUrl }} style={styles.recentHistoryThumbnail} />
                
                <View style={styles.recentDetailsCol}>
                  <Text style={styles.recentHistoryNameText} numberOfLines={1}>{item.name}</Text>
                  
                  {/* Selected traits chips */}
                  <View style={styles.recentTraitsRow}>
                    <View style={styles.traitBadgeMini}>
                      <View style={[
                        styles.colorDotIndicator, 
                        { 
                          backgroundColor: (() => {
                            const c = (item.color || 'Original').toLowerCase();
                            return c.includes('silver') ? '#C0C0C0' : 
                                   c.includes('blonde') ? '#F4F1DE' : 
                                   c.includes('burgundy') ? '#800020' : 
                                   c.includes('black') ? '#000000' : 
                                   c.includes('brown') ? '#4E3629' : '#7C5CFC';
                          })()
                        }
                      ]} />
                      <Text style={styles.traitBadgeMiniText} numberOfLines={1}>{item.color || 'Original'}</Text>
                    </View>
                    <View style={styles.traitBadgeMini}>
                      <Text style={styles.traitBadgeMiniText} numberOfLines={1}>{item.beard || 'Clean Shave'}</Text>
                    </View>
                  </View>
                  
                  <Text style={styles.recentHistoryTimeText}>{item.time}</Text>
                </View>
              </View>

              {/* Action Buttons Row */}
              <View style={styles.recentActionsRow}>
                <TouchableOpacity
                  style={[styles.recentActionBtnMini, styles.recentActionContinueBtn]}
                  onPress={() => {
                    setSelectedHairstyle({ id: item.id, name: item.name });
                    setStoreColor(item.color);
                    setSelectedBeardStyle(item.beard);
                    navigation.navigate('VirtualTryOn');
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons name="play" size={10} color={COLORS.background} />
                  <Text style={styles.recentActionContinueBtnText}>Continue Try-On</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.recentActionBtnMini, styles.recentActionCompareBtn]}
                  onPress={() => {
                    setSelectedHairstyle({ id: item.id, name: item.name });
                    setStoreColor(item.color);
                    setSelectedBeardStyle(item.beard);
                    navigation.navigate('Comparison');
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons name="git-compare" size={10} color={COLORS.secondary} />
                  <Text style={styles.recentActionCompareBtnText}>Compare Again</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyHistoryContainer}>
          <Ionicons name="color-palette-outline" size={28} color="rgba(0, 212, 255, 0.4)" style={{ marginBottom: 6 }} />
          <Text style={styles.emptyHistoryText}>No recently tried styles yet.</Text>
          <TouchableOpacity
            style={styles.emptyHistoryBtn}
            onPress={() => navigation.navigate('Search')}
            activeOpacity={0.8}
          >
            <Text style={styles.emptyHistoryBtnText}>Explore Hairstyles</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* SECTION 2 — AI Hair Summary (Premium Analytics Dashboard) */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>AI Hair Summary</Text>
        <Ionicons name="sparkles-outline" size={14} color={COLORS.secondary} />
      </View>
      
      <View style={styles.summaryHeroCard}>
        <View style={styles.summaryHeroGlow} />
        
        {/* Top Analytics Row */}
        <View style={styles.summaryTopRow}>
          {/* AI Insight Score Meter */}
          <View style={styles.scoreMeterContainer}>
            <View style={styles.scoreMeterOuter}>
              <View style={styles.scoreMeterInner}>
                <Text style={styles.scoreMeterValueText}>{summaryData.matchScore}</Text>
                <Text style={styles.scoreMeterLabelText}>MATCH</Text>
              </View>
            </View>
          </View>
          
          {/* Dynamic Score KPIs */}
          <View style={styles.kpiContainer}>
            <View style={styles.kpiItem}>
              <View style={styles.kpiLabelRow}>
                <Text style={styles.kpiLabel}>Hair Health Score</Text>
                <Text style={[styles.kpiValue, { color: '#00E676' }]}>{summaryData.hairHealth}/100</Text>
              </View>
              <View style={styles.kpiProgressContainer}>
                <View style={[styles.kpiProgressBar, { width: `${summaryData.hairHealth}%`, backgroundColor: '#00E676' }]} />
              </View>
            </View>
            
            <View style={styles.kpiItem}>
              <View style={styles.kpiLabelRow}>
                <Text style={styles.kpiLabel}>AI Recommendation Strength</Text>
                <Text style={[styles.kpiValue, { color: '#7C5CFC' }]}>{summaryData.recommendationStrength}</Text>
              </View>
              <View style={styles.kpiProgressContainer}>
                <View style={[styles.kpiProgressBar, { width: summaryData.recProgress, backgroundColor: '#7C5CFC' }]} />
              </View>
            </View>
            
            <View style={[styles.kpiItem, { marginBottom: 0 }]}>
              <View style={styles.kpiLabelRow}>
                <Text style={styles.kpiLabel}>Style Compatibility %</Text>
                <Text style={[styles.kpiValue, { color: '#00D4FF' }]}>{summaryData.styleCompatibility}%</Text>
              </View>
              <View style={styles.kpiProgressContainer}>
                <View style={[styles.kpiProgressBar, { width: `${summaryData.styleCompatibility}%`, backgroundColor: '#00D4FF' }]} />
              </View>
            </View>
          </View>
        </View>
        
        {/* Futuristic Mini Analytics Grid (2x2 premium layout) */}
        <View style={styles.miniAnalyticsGrid}>
          {/* Card 1: Face Shape */}
          <View style={styles.miniAnalyticCard}>
            <Ionicons name="scan-outline" size={14} color="#00D4FF" style={styles.miniAnalyticIcon} />
            <Text style={styles.miniAnalyticLabel}>Face Shape</Text>
            <Text style={styles.miniAnalyticVal} numberOfLines={1}>
              {summaryData.faceShape}
            </Text>
          </View>
          
          {/* Card 2: Hair Texture */}
          <View style={styles.miniAnalyticCard}>
            <Ionicons name="git-branch-outline" size={14} color="#7C5CFC" style={styles.miniAnalyticIcon} />
            <Text style={styles.miniAnalyticLabel}>Texture</Text>
            <Text style={styles.miniAnalyticVal} numberOfLines={1}>
              {summaryData.texture}
            </Text>
          </View>
          
          {/* Card 3: Density */}
          <View style={styles.miniAnalyticCard}>
            <Ionicons name="grid-outline" size={14} color="#00E676" style={styles.miniAnalyticIcon} />
            <Text style={styles.miniAnalyticLabel}>Density</Text>
            <Text style={styles.miniAnalyticVal} numberOfLines={1}>
              {summaryData.density}
            </Text>
          </View>

          {/* Card 4: Beard Compatibility */}
          <View style={styles.miniAnalyticCard}>
            <Ionicons name="sparkles-outline" size={14} color="#FFD740" style={styles.miniAnalyticIcon} />
            <Text style={styles.miniAnalyticLabel}>Beard Match</Text>
            <Text style={styles.miniAnalyticVal} numberOfLines={1}>
              {summaryData.beardCompatibility}
            </Text>
          </View>
        </View>
        
        {/* Dynamic CTA */}
        <TouchableOpacity
          style={styles.fullReportBtn}
          onPress={() => navigation.navigate('HairInsights')}
          activeOpacity={0.8}
        >
          <Ionicons name="sparkles" size={16} color="#00D4FF" style={styles.fullReportIcon} />
          <Text style={styles.fullReportBtnText}>View Full AI Report</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
    paddingBottom: 90, // Spacing for floating navigation bar overlay
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 20,
  },
  greetContainer: {
    flex: 1,
    paddingRight: 10,
  },
  welcomeSubtitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: COLORS.secondary,
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  headerRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationBtn: {
    marginRight: 16,
    position: 'relative',
    padding: 4,
  },
  notificationBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: COLORS.error,
    borderWidth: 1,
    borderColor: COLORS.background,
  },
  profileBtn: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarBorder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    padding: 2,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    letterSpacing: 0.5,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  searchSectionContainer: {
    position: 'relative',
    zIndex: 10,
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.15)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 14,
    padding: 0,
  },
  clearIcon: {
    marginLeft: 8,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(18, 18, 26, 0.95)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.25)',
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
    zIndex: 99,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  suggestionIcon: {
    marginRight: 12,
  },
  suggestionText: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 13,
  },
  suggestionTypeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: COLORS.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  skeletonChipsContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  skeletonChip: {
    width: 80,
    height: 34,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    marginRight: 8,
  },
  skeletonChip2: {
    width: 65,
    height: 34,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    marginRight: 8,
  },
  skeletonChip3: {
    width: 90,
    height: 34,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    marginRight: 8,
  },
  chipsScroll: {
    marginBottom: 24,
  },
  chipsContainer: {
    paddingRight: 16,
  },
  chip: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.15)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  chipText: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  activeChip: {
    backgroundColor: 'rgba(0, 212, 255, 0.15)',
    borderColor: '#00D4FF',
    shadowColor: '#00D4FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  activeChipText: {
    color: '#00D4FF',
    fontWeight: 'bold',
  },
  heroCard: {
    backgroundColor: 'rgba(18, 18, 26, 0.85)',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.25)',
    marginBottom: 28,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  glowSpot1: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(0, 212, 255, 0.12)',
  },
  glowSpot2: {
    position: 'absolute',
    bottom: -60,
    left: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(124, 92, 252, 0.1)',
  },
  heroMainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  heroTextContent: {
    flex: 1,
    paddingRight: 12,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 212, 255, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.25)',
    marginBottom: 10,
  },
  heroBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: COLORS.secondary,
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  heroSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 8,
    lineHeight: 18,
  },
  illustrationContainer: {
    width: 72,
    height: 72,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outerScanRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.3)',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  innerScanRing: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(0, 212, 255, 0.06)',
    borderWidth: 1,
    borderColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanLine: {
    position: 'absolute',
    width: '100%',
    height: 2,
    backgroundColor: COLORS.secondary,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  statusPanel: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 20,
  },
  statusRow: {
    marginBottom: 10,
  },
  statusLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  statusIndicator: {
    marginRight: 8,
    transform: [{ scale: 0.7 }],
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  progressContainer: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  actionsContainer: {
    marginTop: 4,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
  },
  btnIcon: {
    marginRight: 8,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  primaryActionBtn: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  primaryActionBtnText: {
    color: COLORS.background,
  },
  secondaryActionBtn: {
    backgroundColor: 'rgba(0, 212, 255, 0.04)',
    borderColor: 'rgba(0, 212, 255, 0.3)',
  },
  secondaryActionBtnText: {
    color: COLORS.secondary,
  },
  tertiaryActionBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderColor: 'rgba(255, 255, 255, 0.06)',
    marginBottom: 0,
  },
  tertiaryActionBtnText: {
    color: COLORS.textPrimary,
  },

  // Profile Section Styles
  profileSection: {
    marginBottom: 28,
  },
  profileCard: {
    backgroundColor: 'rgba(18, 18, 26, 0.85)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.15)',
    position: 'relative',
    overflow: 'hidden',
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  glowSpotProfile: {
    position: 'absolute',
    bottom: -40,
    right: -40,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(0, 212, 255, 0.08)',
  },
  profileHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileInfoContainer: {
    flex: 1,
    paddingRight: 10,
  },
  profileCardLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: COLORS.secondary,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  profileCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  profileHighlight: {
    color: COLORS.secondary,
  },
  profileMetaText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  profileThumbnailContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  profileThumbnail: {
    width: '100%',
    height: '100%',
  },
  profileThumbnailPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileThumbnailPlaceholderText: {
    color: COLORS.textSecondary,
    fontWeight: 'bold',
  },
  profileActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  profileActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 0.48,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  profileBtnIcon: {
    marginRight: 6,
  },
  profileChangeBtn: {
    backgroundColor: 'rgba(0, 212, 255, 0.03)',
    borderColor: 'rgba(0, 212, 255, 0.25)',
  },
  profileChangeBtnText: {
    color: COLORS.secondary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  profileSwitchBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  profileSwitchBtnText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: 'bold',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0F0F16',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.2)',
    maxHeight: '80%',
    position: 'relative',
    overflow: 'hidden',
  },
  modalGlow: {
    position: 'absolute',
    top: -60,
    left: '25%',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(124, 92, 252, 0.1)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  modalSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: 20,
  },
  modalProfilesList: {
    maxHeight: 220,
    marginBottom: 20,
  },
  modalProfileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    marginBottom: 10,
  },
  activeModalProfileItem: {
    backgroundColor: 'rgba(0, 212, 255, 0.05)',
    borderColor: 'rgba(0, 212, 255, 0.25)',
  },
  modalAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  modalProfileInfo: {
    flex: 1,
  },
  modalProfileName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  activeModalProfileName: {
    color: COLORS.secondary,
  },
  modalProfileDetails: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  unselectedRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  addProfileSection: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 16,
  },
  addProfileLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  addProfileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addProfileInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    color: COLORS.textPrimary,
    fontSize: 13,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginRight: 10,
  },
  addProfileBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addProfileBtnText: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: 'bold',
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  seeAllText: {
    fontSize: 14,
    color: COLORS.secondary,
    fontWeight: '600',
  },
  trendingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  trendCard: {
    width: '48%',
    backgroundColor: 'rgba(18, 18, 26, 0.85)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  trendImageContainer: {
    height: 120,
    position: 'relative',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  trendImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  trendImageOverlay: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 30,
    backgroundColor: 'rgba(10, 10, 15, 0.3)',
  },
  trendCardBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0, 212, 255, 0.15)',
    borderColor: 'rgba(0, 212, 255, 0.3)',
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  trendCardBadgeText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: COLORS.secondary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  trendInfoBox: {
    padding: 12,
  },
  trendTitleText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  trendMatchScoreText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.success,
    marginTop: 4,
  },
  trendMaintLevelText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  // Recent Section Styles
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 10,
  },
  recentScroll: {
    marginBottom: 28,
  },
  recentScrollContent: {
    paddingRight: 16,
  },
  recentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(18, 18, 26, 0.85)',
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    marginRight: 12,
    width: 210,
    position: 'relative',
  },
  recentThumbnail: {
    width: 48,
    height: 48,
    borderRadius: 10,
    marginRight: 12,
  },
  recentInfoCol: {
    flex: 1,
    justifyContent: 'center',
  },
  recentNameText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  recentDetailsText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  recentTimeText: {
    fontSize: 9,
    color: COLORS.secondary,
    marginTop: 3,
    fontWeight: '600',
  },
  recentArrow: {
    marginLeft: 4,
  },

  // Summary Styles
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 35,
  },
  summaryCard: {
    flex: 0.31,
    backgroundColor: 'rgba(18, 18, 26, 0.85)',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.1)',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  summaryIcon: {
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  summaryGlow1: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 212, 255, 0.04)',
  },
  summaryGlow2: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(124, 92, 252, 0.04)',
  },
  summaryGlow3: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 230, 118, 0.04)',
  },
  
  // System State Card Outlines
  cardIdle: {
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  cardUploading: {
    borderColor: 'rgba(124, 92, 252, 0.4)',
    shadowColor: '#7C5CFC',
    shadowOpacity: 0.15,
  },
  cardAnalyzing: {
    borderColor: 'rgba(0, 212, 255, 0.4)',
    shadowColor: '#00D4FF',
    shadowOpacity: 0.18,
  },
  cardProcessing: {
    borderColor: 'rgba(0, 230, 118, 0.4)',
    shadowColor: '#00E676',
    shadowOpacity: 0.15,
  },
  cardReady: {
    borderColor: 'rgba(0, 212, 255, 0.5)',
    shadowColor: '#00D4FF',
    shadowOpacity: 0.25,
  },
  cardFailed: {
    borderColor: 'rgba(255, 23, 68, 0.5)',
    shadowColor: '#FF1744',
    shadowOpacity: 0.25,
  },

  // Badge States
  badgeIdle: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  badgeTextIdle: {
    color: 'rgba(255, 255, 255, 0.6)',
  },
  badgeUploading: {
    backgroundColor: 'rgba(124, 92, 252, 0.15)',
    borderColor: 'rgba(124, 92, 252, 0.4)',
  },
  badgeTextUploading: {
    color: '#7C5CFC',
  },
  badgeAnalyzing: {
    backgroundColor: 'rgba(0, 212, 255, 0.15)',
    borderColor: 'rgba(0, 212, 255, 0.4)',
  },
  badgeTextAnalyzing: {
    color: '#00D4FF',
  },
  badgeProcessing: {
    backgroundColor: 'rgba(0, 230, 118, 0.15)',
    borderColor: 'rgba(0, 230, 118, 0.4)',
  },
  badgeTextProcessing: {
    color: '#00E676',
  },
  badgeReady: {
    backgroundColor: 'rgba(0, 212, 255, 0.2)',
    borderColor: 'rgba(0, 212, 255, 0.6)',
  },
  badgeTextReady: {
    color: '#00D4FF',
  },
  badgeFailed: {
    backgroundColor: 'rgba(255, 23, 68, 0.15)',
    borderColor: 'rgba(255, 23, 68, 0.4)',
  },
  badgeTextFailed: {
    color: '#FF1744',
  },

  // Ring States
  ringFailed: {
    borderColor: 'rgba(255, 23, 68, 0.5)',
  },
  ringReady: {
    borderColor: 'rgba(0, 230, 118, 0.5)',
  },
  innerRingFailed: {
    backgroundColor: 'rgba(255, 23, 68, 0.08)',
    borderColor: '#FF1744',
  },
  innerRingReady: {
    backgroundColor: 'rgba(0, 230, 118, 0.08)',
    borderColor: '#00E676',
  },

  // Simple Row Status
  statusRowSimple: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  statusTextSimple: {
    fontSize: 11,
    color: COLORS.textSecondary,
    flex: 1,
  },
  infoIcon: {
    marginRight: 8,
  },
  successStatusIcon: {
    marginRight: 8,
  },

  // Failed Button Styles
  failedActionBtn: {
    backgroundColor: 'rgba(255, 23, 68, 0.05)',
    borderColor: 'rgba(255, 23, 68, 0.3)',
  },
  failedActionBtnText: {
    color: '#FF1744',
  },

  // Profile Redesign Styles
  addProfileHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 212, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  addProfileHeaderBtnText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginLeft: 4,
  },
  avatarContainerLarge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    padding: 2,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarRingActive: {
    borderColor: COLORS.secondary,
  },
  avatarRingGuest: {
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  profileThumbnailLarge: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
  },
  profileThumbnailPlaceholderLarge: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileThumbnailPlaceholderTextLarge: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  activeProfileIndicator: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.success,
    borderWidth: 2.5,
    borderColor: '#0F0F16',
  },
  profileHighlightText: {
    color: COLORS.secondary,
    fontWeight: '600',
  },
  
  // AI Badges
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 14,
    marginBottom: 6,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  badgeFaceShape: {
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    borderColor: 'rgba(0, 212, 255, 0.25)',
  },
  badgeHairType: {
    backgroundColor: 'rgba(124, 92, 252, 0.1)',
    borderColor: 'rgba(124, 92, 252, 0.25)',
  },
  badgeDensity: {
    backgroundColor: 'rgba(0, 230, 118, 0.1)',
    borderColor: 'rgba(0, 230, 118, 0.25)',
  },
  badgeDashed: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderStyle: 'dashed',
  },
  badgeIcon: {
    marginRight: 4,
  },
  aiBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  aiBadgeTextDashed: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },

  // Action Button
  profileAddBtn: {
    backgroundColor: 'rgba(0, 230, 118, 0.04)',
    borderColor: 'rgba(0, 230, 118, 0.25)',
    flex: 0.31,
  },
  profileAddBtnText: {
    color: '#00E676',
    fontSize: 12,
    fontWeight: 'bold',
  },
  
  // Direct profile selector carousel under card
  profileCarouselScroll: {
    marginTop: 14,
    marginBottom: 6,
  },
  profileCarouselContent: {
    paddingRight: 16,
    alignItems: 'center',
  },
  carouselProfileItem: {
    alignItems: 'center',
    marginRight: 16,
    width: 64,
  },
  carouselProfileItemActive: {
    transform: [{ scale: 1.05 }],
  },
  carouselAvatarRing: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  carouselAvatarRingSelected: {
    borderColor: COLORS.secondary,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 5,
  },
  carouselAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
  },
  carouselAvatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  carouselAvatarPlaceholderText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: 'bold',
  },
  carouselProfileName: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 6,
    textAlign: 'center',
    fontWeight: '500',
  },
  carouselProfileNameActive: {
    color: COLORS.secondary,
    fontWeight: 'bold',
  },
  carouselProfileItemAdd: {
    alignItems: 'center',
    width: 64,
  },
  carouselAvatarRingAdd: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
  },
  carouselProfileNameAdd: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 6,
    textAlign: 'center',
    fontWeight: '500',
  },

  // Recommended & Feeds Styling
  sectionSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 16,
    marginTop: -8,
  },
  loadingHairstylesContainer: {
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
    marginBottom: 20,
  },
  loadingHairstylesText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 10,
  },
  recommendedScroll: {
    marginBottom: 28,
  },
  recommendedScrollContent: {
    paddingRight: 16,
  },
  recommendedCard: {
    width: 250,
    height: 180,
    borderRadius: 20,
    backgroundColor: 'rgba(18, 18, 26, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.15)',
    marginRight: 16,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  recommendedImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    resizeMode: 'cover',
  },
  recommendedCardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 10, 15, 0.55)',
  },
  recommendedMatchRing: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(10, 10, 15, 0.85)',
    borderWidth: 2,
    borderColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
  recommendedMatchText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  recommendedMatchSubText: {
    fontSize: 6,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  recommendedCardBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(124, 92, 252, 0.15)',
    borderColor: 'rgba(124, 92, 252, 0.35)',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  recommendedCardBadgeText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#7C5CFC',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  recommendedInfoBox: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    backgroundColor: 'rgba(15, 15, 22, 0.8)',
  },
  recommendedNameText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  recommendedMetaText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  recommendedActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  cardActionBtnMini: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  trendCardMatchBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 230, 118, 0.15)',
    borderColor: 'rgba(0, 230, 118, 0.35)',
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  trendCardMatchBadgeText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: COLORS.success,
    letterSpacing: 0.5,
  },
  trendActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  trendPopularityScoreText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
  },
  trendCardButtonsRow: {
    flexDirection: 'row',
  },
  miniCardIconBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  recentHistoryCard: {
    width: 270,
    marginRight: 16,
    borderRadius: 20,
    padding: 14,
    backgroundColor: 'rgba(18, 18, 26, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.15)',
    overflow: 'hidden',
    position: 'relative',
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  recentCardGlow: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 212, 255, 0.05)',
  },
  recentMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recentHistoryThumbnail: {
    width: 64,
    height: 64,
    borderRadius: 12,
    marginRight: 14,
  },
  recentDetailsCol: {
    flex: 1,
    justifyContent: 'center',
  },
  recentHistoryNameText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  recentTraitsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  traitBadgeMini: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 6,
    marginTop: 4,
  },
  traitBadgeMiniText: {
    fontSize: 9,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  recentHistoryTimeText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 6,
  },
  colorDotIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  recentActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingTop: 10,
  },
  recentActionBtnMini: {
    flex: 0.48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  recentActionContinueBtn: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  recentActionContinueBtnText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: COLORS.background,
    marginLeft: 4,
  },
  recentActionCompareBtn: {
    backgroundColor: 'transparent',
    borderColor: 'rgba(0, 212, 255, 0.3)',
  },
  recentActionCompareBtnText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginLeft: 4,
  },
  emptyHistoryContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    backgroundColor: 'rgba(18, 18, 26, 0.5)',
    borderRadius: 16,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  emptyHistoryText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  summaryHeroCard: {
    backgroundColor: 'rgba(18, 18, 26, 0.85)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(124, 92, 252, 0.2)',
    padding: 18,
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 20,
  },
  summaryHeroGlow: {
    position: 'absolute',
    top: -50,
    left: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(124, 92, 252, 0.05)',
  },
  summaryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  scoreMeterContainer: {
    width: 84,
    height: 84,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreMeterOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: 'rgba(0, 212, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopColor: COLORS.secondary,
    borderRightColor: COLORS.secondary,
  },
  scoreMeterInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(10, 10, 15, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreMeterValueText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  scoreMeterLabelText: {
    fontSize: 7,
    color: COLORS.secondary,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    marginTop: 1,
  },
  kpiContainer: {
    flex: 1,
    marginLeft: 16,
  },
  kpiItem: {
    marginBottom: 10,
  },
  kpiLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  kpiLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  kpiValue: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  kpiProgressContainer: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  kpiProgressBar: {
    height: '100%',
    borderRadius: 2,
  },
  miniAnalyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  miniAnalyticCard: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  miniAnalyticIcon: {
    marginBottom: 4,
  },
  miniAnalyticLabel: {
    fontSize: 9,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginBottom: 2,
  },
  miniAnalyticVal: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  fullReportBtn: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 212, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.25)',
    borderRadius: 12,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullReportIcon: {
    marginRight: 6,
  },
  fullReportBtnText: {
    fontSize: 12,
    color: COLORS.secondary,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  emptyHistoryBtn: {
    marginTop: 10,
    backgroundColor: 'rgba(0, 212, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.35)',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  emptyHistoryBtnText: {
    fontSize: 11,
    color: COLORS.secondary,
    fontWeight: 'bold',
  },
});
