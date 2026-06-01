import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  TextInput, 
  Animated, 
  Dimensions, 
  Easing,
  Alert,
  LayoutAnimation,
  Platform,
  UIManager,
  Modal,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

import { USE_NATIVE_DRIVER } from '../constants/nativeDriver';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Premium color swatch HEX mapping
const HAIR_COLORS = {
  'Black': '#0A0A0B',
  'Burgundy': '#7D0A2C',
  'Silver': '#BEC3C9',
  'Gold': '#D4AF37',
  'Blonde': '#EAD29A',
  'Brown': '#5C4033',
  'Pastel Pink': '#FBCFE8',
  'Platinum': '#E5E7EB',
  'Copper': '#B87333',
  'Emerald': '#059669',
  'Midnight': '#1E3A8A'
};

const { width } = Dimensions.get('window');
const contentWidth = width - 32;

// Five dynamic categories
const TABS = [
  { id: 'favorites', name: 'Favorites' },
  { id: 'history', name: 'History' },
  { id: 'comparisons', name: 'Comparisons' },
  { id: 'exports', name: 'Saved Exports' },
  { id: 'collections', name: 'Collections' }
];

// AI Activity Timeline events
const TIMELINE_EVENTS = [
  { id: 'ev_1', time: '10:14 AM', event: 'AR Core Face alignment sync complete', icon: 'shield-checkmark' },
  { id: 'ev_2', time: '09:42 AM', event: '4K Ultra HD Diagnostic composite exported', icon: 'cloud-download' },
  { id: 'ev_3', time: '09:12 AM', event: 'Classic Fade bookmark logged to Cyber Library', icon: 'heart' },
  { id: 'ev_4', time: 'Yesterday', event: 'Korean Textured style comparison generated', icon: 'git-compare' }
];

// Smart collections
// Smart collections with dynamic style moodboards
const MOCK_COLLECTIONS = [
  {
    id: 'col_korean',
    name: 'Korean Looks',
    isSmart: true,
    lastUpdated: '10m ago',
    views: 45,
    used: 12,
    createdAt: 1716000000000,
    coverUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&h=300&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
    ],
    styles: [
      { id: 'col_k1', name: 'Liam • Textured Shaggy Cut', score: '93%', color: 'Black', beard: 'Clean Shave', date: 'May 24, 2026', imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop' },
      { id: 'col_k2', name: 'Sophia • Soft Textured Wolf Cut', score: '91%', color: 'Burgundy', beard: 'Clean Shave', date: 'May 25, 2026', imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop' },
      { id: 'col_k3', name: 'Noah • Shadow Perm Cut', score: '92%', color: 'Gold', beard: 'Clean Shave', date: 'May 26, 2026', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop' }
    ],
    favCategory: 'Korean Textured'
  },
  {
    id: 'col_office',
    name: 'Office Looks',
    isSmart: true,
    lastUpdated: '2h ago',
    views: 88,
    used: 24,
    createdAt: 1715000000000,
    coverUrl: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=300&h=300&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=100&h=100&fit=crop',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop'
    ],
    styles: [
      { id: 'col_o1', name: 'Liam • Classic Side Comb', score: '96%', color: 'Black', beard: 'Clean Shave', date: 'May 24, 2026', imageUrl: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=200&h=200&fit=crop' },
      { id: 'col_o2', name: 'Sophia • Sleek Low Parting', score: '94%', color: 'Brown', beard: 'Clean Shave', date: 'May 25, 2026', imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop' }
    ],
    favCategory: 'Classic Fades'
  },
  {
    id: 'col_curly',
    name: 'Curly Styles',
    isSmart: true,
    lastUpdated: '1d ago',
    views: 29,
    used: 8,
    createdAt: 1714000000000,
    coverUrl: 'https://images.unsplash.com/photo-1605497746444-ac9dbd39f4a5?w=300&h=300&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1605497746444-ac9dbd39f4a5?w=100&h=100&fit=crop',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop',
      'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=100&h=100&fit=crop'
    ],
    styles: [
      { id: 'col_c1', name: 'Liam • High Top Curly Fade', score: '89%', color: 'Silver', beard: 'Short Beard', date: 'May 26, 2026', imageUrl: 'https://images.unsplash.com/photo-1605497746444-ac9dbd39f4a5?w=200&h=200&fit=crop' },
      { id: 'col_c2', name: 'Noah • Tapered Curly Fringe', score: '87%', color: 'Brown', beard: 'Clean Shave', date: 'May 26, 2026', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop' }
    ],
    favCategory: 'Curly Textures'
  },
  {
    id: 'col_best',
    name: 'Best Matches',
    isSmart: true,
    lastUpdated: '4d ago',
    views: 120,
    used: 54,
    createdAt: 1713000000000,
    coverUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop',
    thumbnails: [
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
      'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=100&h=100&fit=crop',
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop',
      'https://images.unsplash.com/photo-1605497746444-ac9dbd39f4a5?w=100&h=100&fit=crop',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
    ],
    styles: [
      { id: 'col_b1', name: 'Liam • Classic Fade Fit', score: '98%', color: 'Black', beard: 'Clean Shave', date: 'May 24, 2026', imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop' },
      { id: 'col_b2', name: 'Sophia • Wolf Cut Fit', score: '97%', color: 'Burgundy', beard: 'Clean Shave', date: 'May 25, 2026', imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop' }
    ],
    favCategory: 'High Compatibility'
  }
];

// Interactive Swipe-Actions Drawer Row Component
function SwipeableItem({ item, onDelete, onFavorite, onRestore, hairColors }) {
  const translateX = useRef(new Animated.Value(0)).current;
  const [isOpen, setIsOpen] = useState(false);

  const toggleSwipe = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    Animated.spring(translateX, {
      toValue: isOpen ? 0 : -162, // Reveal 3 actions (54px each)
      friction: 8,
      tension: 50,
      useNativeDriver: USE_NATIVE_DRIVER
    }).start();
    setIsOpen(!isOpen);
  };

  const handleAction = (callback) => {
    Animated.timing(translateX, {
      toValue: 0,
      duration: 180,
      useNativeDriver: USE_NATIVE_DRIVER
    }).start(() => {
      setIsOpen(false);
      callback();
    });
  };

  // Split styling names from raw history logs
  const nameParts = item.name.split('•');
  const modelName = nameParts[0] ? nameParts[0].trim() : 'AI Model';
  const styleName = nameParts[1] ? nameParts[1].trim() : item.name;

  return (
    <View style={styles.swipeOuterContainer}>
      {/* Background slide actions */}
      <View style={styles.swipeBackgroundActions}>
        <TouchableOpacity 
          style={[styles.swipeActionBtn, { backgroundColor: 'rgba(0, 212, 255, 0.12)' }]} 
          onPress={() => handleAction(() => onFavorite(item))}
        >
          <Ionicons name="bookmark" size={15} color={COLORS.secondary} />
          <Text style={[styles.swipeActionText, { color: COLORS.secondary }]}>Save</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.swipeActionBtn, { backgroundColor: 'rgba(52, 211, 153, 0.12)' }]} 
          onPress={() => handleAction(() => onRestore(item))}
        >
          <Ionicons name="sync" size={15} color="#34D399" />
          <Text style={[styles.swipeActionText, { color: '#34D399' }]}>Restore</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.swipeActionBtn, { backgroundColor: 'rgba(239, 68, 68, 0.12)' }]} 
          onPress={() => handleAction(() => onDelete(item.id, 'history'))}
        >
          <Ionicons name="trash-outline" size={15} color="#EF4444" />
          <Text style={[styles.swipeActionText, { color: '#EF4444' }]}>Delete</Text>
        </TouchableOpacity>
      </View>

      {/* Foreground card */}
      <Animated.View style={[
        styles.swipeForegroundCard,
        { transform: [{ translateX }] }
      ]}>
        <TouchableOpacity 
          style={styles.favCard}
          onPress={toggleSwipe}
          activeOpacity={0.95}
        >
          <Image source={{ uri: item.imageUrl }} style={styles.favThumb} />
          <View style={styles.favInfo}>
            <View style={styles.favTitleRowContainer}>
              <Text style={styles.favName} numberOfLines={1}>{styleName}</Text>
              <Text style={styles.favModelTag}>Model: {modelName}</Text>
            </View>
            
            <View style={styles.favMetaRow}>
              <Text style={styles.favMetaText}>Shade: </Text>
              <View style={[styles.colorSwatch, { backgroundColor: HAIR_COLORS[item.color] || '#FFFFFF' }]} />
              <Text style={styles.favMetaText}>{item.color}  •  {item.beard}</Text>
            </View>
            
            <Text style={styles.favDate}>Tested {item.date}</Text>
          </View>
          
          <View style={styles.favBadgeRow}>
            {item.score && (
              <View style={styles.favFitBadge}>
                <Text style={styles.favFitText}>{item.score} Fit</Text>
              </View>
            )}
            <Ionicons name={isOpen ? "chevron-forward" : "chevron-back"} size={14} color={COLORS.textSecondary} style={{ marginLeft: 6 }} />
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

// Premium Dynamic Moodboard Cover Collage (album/cover style)
function MoodboardCover({ stylesList }) {
  if (!stylesList || stylesList.length === 0) {
    return (
      <View style={styles.moodboardCoverPlaceholder}>
        <Ionicons name="sparkles" size={24} color={COLORS.secondary} style={{ opacity: 0.6 }} />
        <Text style={styles.placeholderCoverText}>Cyber Moodboard Empty</Text>
      </View>
    );
  }

  if (stylesList.length === 1) {
    return <Image source={{ uri: stylesList[0].imageUrl }} style={styles.colCoverImg} />;
  }

  if (stylesList.length === 2) {
    return (
      <View style={styles.moodboardCoverRow}>
        <Image source={{ uri: stylesList[0].imageUrl }} style={styles.moodboardCoverSplit} />
        <Image source={{ uri: stylesList[1].imageUrl }} style={styles.moodboardCoverSplit} />
      </View>
    );
  }

  // Pinterest/Spotify style layout: 1 large left column, 2 stacked on the right
  const mainImage = stylesList[0].imageUrl;
  const secondaryImage1 = stylesList[1].imageUrl;
  const secondaryImage2 = stylesList[2] ? stylesList[2].imageUrl : stylesList[0].imageUrl;

  return (
    <View style={styles.moodboardCoverContainer}>
      <View style={styles.moodboardMainCol}>
        <Image source={{ uri: mainImage }} style={styles.moodboardMainImg} />
      </View>
      <View style={styles.moodboardSideColumn}>
        <Image source={{ uri: secondaryImage1 }} style={styles.moodboardSideImg} />
        <Image source={{ uri: secondaryImage2 }} style={styles.moodboardSideImg} />
      </View>
    </View>
  );
}

export default function SavedCollectionsScreen({ navigation }) {
  // Library States
  const [activeTab, setActiveTab] = useState('favorites');
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [historySubTab, setHistorySubTab] = useState('tried'); // Sub-history tabs: 'tried', 'exports', 'comparisons'
  
  // Custom Folder / Moodboard & Collection Overhaul States
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [optionsDrawerVisible, setOptionsDrawerVisible] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState(null);
  
  const [isMultiSelect, setIsMultiSelect] = useState(false);
  const [selectedHairstyles, setSelectedHairstyles] = useState([]);
  
  const [showAiSuggestion, setShowAiSuggestion] = useState(true);
  const [isArranging, setIsArranging] = useState(false);
  const [draggedItemIndex, setDraggedItemIndex] = useState(null);
  
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionTheme, setNewCollectionTheme] = useState('Korean Looks');
  const [renameCollectionName, setRenameCollectionName] = useState('');
  const [syncingCollectionId, setSyncingCollectionId] = useState(null);

  // Premium Comparison & Export Telemetry States
  const [comparisonModalVisible, setComparisonModalVisible] = useState(false);
  const [activeComparisonItem, setActiveComparisonItem] = useState(null);
  const [storageUsed, setStorageUsed] = useState(42.6); // MB Seeding
  const [showStorageCleanup, setShowStorageCleanup] = useState(true);
  const [sliderPos, setSliderPos] = useState(0.5); // 0.0 to 1.0 (touch slider coordinate split width)
  const [containerWidth, setContainerWidth] = useState(300); // Dynamic layout tracker for split slider
  
  // Dynamic Empty States, Onboarding & Loading Telemetry
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  
  // Interactive Custom Swipe/Actions Drawer States
  const [activeActionsCellId, setActiveActionsCellId] = useState(null); // Tracks row index of swiped item
  const [collectionsList, setCollectionsList] = useState(MOCK_COLLECTIONS);

  // Dynamic Hairstyle memory system feeds
  const [favoritesList, setFavoritesList] = useState([
    { id: 'fade_01', name: 'Classic Fade', score: '95%', color: 'Black', beard: 'Clean Shave', date: 'May 24, 2026', imageUrl: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=200&h=200&fit=crop' },
    { id: 'korean_02', name: 'Korean Textured', score: '92%', color: 'Burgundy', beard: 'Stubble', date: 'May 25, 2026', imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop' },
    { id: 'curly_03', name: 'Textured Curly', score: '88%', color: 'Silver', beard: 'Short Beard', date: 'May 26, 2026', imageUrl: 'https://images.unsplash.com/photo-1605497746444-ac9dbd39f4a5?w=200&h=200&fit=crop' }
  ]);

  const [historyTriedList, setHistoryTriedList] = useState([
    { id: 'hist_1', name: 'Liam • Classic Fade Fit', score: '95%', color: 'Black', beard: 'Clean Shave', date: '10 mins ago', imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop' },
    { id: 'hist_2', name: 'Sophia • Korean Textured Fit', score: '92%', color: 'Burgundy', beard: 'Clean Shave', date: '2 hours ago', imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop' }
  ]);

  const [historyExportList, setHistoryExportList] = useState([
    { id: 'hist_exp_1', name: 'Classic Fade High composite', quality: 'Ultra HD 4K', date: '4 hours ago', imageUrl: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=200&h=200&fit=crop', watermarkStatus: 'Bypassed (Clean)', isDuplicate: true },
    { id: 'hist_exp_2', name: 'Classic Fade standard compile', quality: 'Standard (1080p)', date: '6 hours ago', imageUrl: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=200&h=200&fit=crop', watermarkStatus: 'Embedded', isDuplicate: true },
    { id: 'hist_exp_3', name: 'Korean Wolf Cut portrait', quality: 'HD Resolution (2K)', date: 'Yesterday', imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop', watermarkStatus: 'Bypassed (Clean)', isDuplicate: false }
  ]);

  const [historyComparedList, setHistoryComparedList] = useState([
    { 
      id: 'hist_comp_1', 
      title: 'Fade vs Buzz Cut Split', 
      date: '3 days ago', 
      imageUrlA: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=300&h=300&fit=crop', 
      imageUrlB: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop',
      winner: 'Classic Fade',
      aiFeedback: 'Classic Fade accentuates cheekbone highlights and jawline angles 14% better than the standard Buzz Cut.',
      styleA: 'Classic Fade',
      styleB: 'Buzz Cut'
    },
    { 
      id: 'hist_comp_2', 
      title: 'Korean Wolf vs Curly Shag', 
      date: 'Last week', 
      imageUrlA: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&h=300&fit=crop', 
      imageUrlB: 'https://images.unsplash.com/photo-1605497746444-ac9dbd39f4a5?w=300&h=300&fit=crop',
      winner: 'Korean Wolf Cut',
      aiFeedback: 'Korean Wolf Cut softens forehead dimensions and frames jaw contouring 8% more dynamically than the Curly Shag.',
      styleA: 'Korean Wolf Cut',
      styleB: 'Curly Shag'
    }
  ]);

  // Animated values
  const tabSlideAnim = useRef(new Animated.Value(0)).current; // favorites index is 0
  const fadeContent = useRef(new Animated.Value(1)).current;
  const skeletonPulse = useRef(new Animated.Value(0.3)).current;

  // Spring-driven sliding pill transition
  const handleTabSwitch = (tab, index) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveTab(tab);
    
    Animated.spring(tabSlideAnim, {
      toValue: index,
      tension: 65,
      friction: 9,
      useNativeDriver: false
    }).start();

    fadeContent.setValue(0);
    Animated.timing(fadeContent, {
      toValue: 1,
      duration: 300,
      useNativeDriver: USE_NATIVE_DRIVER
    }).start();
  };

  // Perform dynamic title search and sorting
  useEffect(() => {
    let filtered = MOCK_COLLECTIONS.filter(col => 
      col.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (sortBy === 'newest') {
      filtered.sort((a, b) => b.createdAt - a.createdAt);
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => a.createdAt - b.createdAt);
    } else if (sortBy === 'views') {
      filtered.sort((a, b) => b.views - a.views);
    } else if (sortBy === 'used') {
      filtered.sort((a, b) => b.used - a.used);
    }

    setCollectionsList(filtered);
  }, [searchQuery, sortBy]);

  // --- PULSING SKELETON TIMING LOOP & DYNAMIC LOADERS ---
  useEffect(() => {
    const pulseAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(skeletonPulse, {
          toValue: 0.9,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: USE_NATIVE_DRIVER
        }),
        Animated.timing(skeletonPulse, {
          toValue: 0.35,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: USE_NATIVE_DRIVER
        })
      ])
    );
    pulseAnim.start();
    return () => pulseAnim.stop();
  }, []);

  // Simulate network fetching latency on tab / sub-tab shifts
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 850);
    return () => clearTimeout(timer);
  }, [activeTab, historySubTab]);

  // Pull-to-refresh secure simulation
  const handlePullToRefresh = () => {
    setRefreshing(true);
    setIsLoading(true);
    setTimeout(() => {
      setRefreshing(false);
      setIsLoading(false);
      Alert.alert(
        'Cloud Matrix Synced',
        'Cyber-Cloud database retrieved. Offline cache is fully synchronized.'
      );
    }, 1100);
  };

  // Premium Custom Swipe Row Actions
  const handleToggleSwipeCell = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (activeActionsCellId === id) {
      setActiveActionsCellId(null);
    } else {
      setActiveActionsCellId(id);
    }
  };

  const handleCellDelete = (id, section) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveActionsCellId(null);
    if (section === 'favorites') {
      setFavoritesList(prev => prev.filter(item => item.id !== id));
    } else {
      setHistoryTriedList(prev => prev.filter(item => item.id !== id));
    }
    Alert.alert('File Purged', 'Simulation profile removed successfully from Cyber Library.');
  };

  const handleCellFavorite = (item) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveActionsCellId(null);
    // Add to favorites list if not exists
    if (!favoritesList.find(f => f.id === item.id)) {
      const newFav = {
        id: item.id,
        name: item.name.split('•')[1] || item.name,
        score: item.score || '90%',
        color: item.color || 'Black',
        beard: item.beard || 'Clean Shave',
        date: 'Just Now',
        imageUrl: item.imageUrl
      };
      setFavoritesList(prev => [newFav, ...prev]);
      Alert.alert('Bookmark Registered', 'Profile added to Favorites feed.');
    } else {
      Alert.alert('Notification', 'Configuration already bookmarked in Favorites.');
    }
  };

  const handleCellRestore = (item) => {
    setActiveActionsCellId(null);
    Alert.alert('Restoring Fit', 'Re-syncing configuration parameters to neural mirror...');
  };

  // Continue Try-On Deep-linking launcher
  const handleContinuePreviousTryOn = (item) => {
    Alert.alert(
      'Continue Simulation',
      `Re-syncing ${item.name} composite parameters to Try-On laboratory.`,
      [
        { 
          text: 'Load Simulator', 
          onPress: () => {
            navigation.navigate('Main', { screen: 'Try-On' });
          } 
        }
      ]
    );
  };

  // HD / Ultra HD quality selection export system with watermark handling
  const handleExportShortcut = (item) => {
    Alert.alert(
      'Export Hairstyle Fit',
      'Select rendering quality to export this composite model:',
      [
        {
          text: 'Standard (1080p)',
          onPress: () => {
            Alert.alert(
              'Standard Export',
              'Composite exported successfully. A default digital watermark was embedded on the bottom margin.'
            );
          }
        },
        {
          text: 'HD Resolution (2K)',
          onPress: () => {
            Alert.alert(
              'HD Export Complete',
              'High-fidelity 2K composite saved. Watermark removed for this model.'
            );
          }
        },
        {
          text: '🚀 Ultra HD 4K (AI Super-Res)',
          onPress: () => {
            Alert.alert(
              'Premium Watermark Bypass Approved',
              'Super-resolution neural upscaling applied. Saved clean 4K diagnostic portrait to gallery!'
            );
          }
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };

  // --- OVERHAULED COLLECTION MOODBOARD ACTIONS & SYSTEMS ---

  // 1. Interactive Cloud Sync Trigger
  const handleToggleSync = (colId) => {
    setSyncingCollectionId(colId);
    // Simulate cloud compilation syncing spinner
    setTimeout(() => {
      setSyncingCollectionId(null);
      Alert.alert(
        'Cloud Synchronization Matrix',
        'Secure backup successful. All custom hairstyle parameters, rating files, and thumbnails fully synced to Cyber-Cloud.'
      );
    }, 1600);
  };

  // 2. Open Collection Preview Modal
  const handleOpenCollectionPreview = (col) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedCollection(col);
    setIsMultiSelect(false);
    setSelectedHairstyles([]);
    setPreviewModalVisible(true);
  };

  // 3. Open Context Menu Options Action Sheet Drawer
  const handleOpenCollectionOptions = (col) => {
    setSelectedCollection(col);
    setRenameCollectionName(col.name);
    setOptionsDrawerVisible(true);
  };

  // 4. Create New Collection with input name and style theme tags
  const handleCreateNewCollectionSubmit = () => {
    if (!newCollectionName.trim()) {
      Alert.alert('Validation Error', 'Please establish a valid collection tag title.');
      return;
    }

    const newId = `col_custom_${Date.now()}`;
    const coverPlaceholder = 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=300&h=300&fit=crop';
    
    const newFolder = {
      id: newId,
      name: newCollectionName.trim(),
      isSmart: false,
      lastUpdated: 'Just Now',
      views: 0,
      used: 0,
      createdAt: Date.now(),
      coverUrl: coverPlaceholder,
      thumbnails: [],
      styles: [],
      favCategory: newCollectionTheme
    };

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCollectionsList(prev => [newFolder, ...prev]);
    setNewCollectionName('');
    setCreateModalVisible(false);
    
    Alert.alert('Collection Initialized', `"${newFolder.name}" established as an empty AI Moodboard grid.`);
  };

  // 5. Rename Custom Collection
  const handleRenameCollectionSubmit = () => {
    if (!renameCollectionName.trim()) {
      Alert.alert('Validation Error', 'Title tag cannot remain empty.');
      return;
    }

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCollectionsList(prev => prev.map(col => {
      if (col.id === selectedCollection.id) {
        return { ...col, name: renameCollectionName.trim(), lastUpdated: 'Just Now' };
      }
      return col;
    }));
    
    setOptionsDrawerVisible(false);
    Alert.alert('Renaming Sync', 'Collection folder title updated successfully.');
  };

  // 6. Delete Collection with Alert Dual Confirmation
  const handleDeleteCollectionConfirm = () => {
    Alert.alert(
      'Purge Moodboard',
      `Are you absolutely sure you want to delete "${selectedCollection.name}"? This will permanently wipe all local reference logs inside this collection folder.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm Delete', 
          style: 'destructive',
          onPress: () => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setCollectionsList(prev => prev.filter(col => col.id !== selectedCollection.id));
            setOptionsDrawerVisible(false);
            Alert.alert('Collection Purged', 'Collection folder wiped from local directory.');
          }
        }
      ]
    );
  };

  // 7. Share Collection
  const handleShareCollectionTrigger = () => {
    setOptionsDrawerVisible(false);
    Alert.alert(
      'Generate Cyber Share Link',
      `Moodboard share package ready. Copying URL link to device clipboard:\n\nhttps://hairverse.ai/moodboards/${selectedCollection.id}`
    );
  };

  // 8. Batch Export Collection composites
  const handleExportCollectionTrigger = () => {
    setOptionsDrawerVisible(false);
    Alert.alert(
      'Batch Render Compilation',
      'Select export profile to batch-process all composites in this collection:',
      [
        {
          text: 'Standard PDF Album (Watermarked)',
          onPress: () => Alert.alert('Compilation Complete', 'Batch PDF index generated successfully.')
        },
        {
          text: '🚀 High-Res 4K Compilation ZIP',
          onPress: () => Alert.alert('Bypass Approved', 'Watermark-free ultra HD 4K portraits compiled and exported.')
        },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  // 9. AI Smart Recommendation Banner quick-establish generator
  const handleSmartFolderEstablish = () => {
    const koreanMatches = favoritesList.filter(f => f.name.toLowerCase().includes('korean') || f.color === 'Burgundy')
      .concat(historyTriedList.filter(h => h.name.toLowerCase().includes('korean')));
      
    // Remove duplicates
    const uniqueStyles = koreanMatches.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);

    const koreanSuggestionFolder = {
      id: 'col_smart_korean_suggest',
      name: 'Korean Moodboard',
      isSmart: true,
      lastUpdated: 'Just Now',
      views: 12,
      used: 2,
      createdAt: Date.now(),
      coverUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&h=300&fit=crop',
      thumbnails: uniqueStyles.slice(0, 3).map(s => s.imageUrl),
      styles: uniqueStyles,
      favCategory: 'Korean Textured'
    };

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCollectionsList(prev => [koreanSuggestionFolder, ...prev]);
    setShowAiSuggestion(false);
    
    Alert.alert(
      'AI Smart Matrix Synced',
      `Established "Korean Moodboard" automatically pre-populating ${uniqueStyles.length} matched styles from your history.`
    );
  };

  // 10. Multi-select style checkbox manager inside collection preview
  const handleToggleHairstyleSelect = (styleId) => {
    if (selectedHairstyles.includes(styleId)) {
      setSelectedHairstyles(prev => prev.filter(id => id !== styleId));
    } else {
      setSelectedHairstyles(prev => [...prev, styleId]);
    }
  };

  // 11. Batch Remove styles from active collection
  const handleBatchRemoveStyles = () => {
    if (selectedHairstyles.length === 0) {
      Alert.alert('Operation Blocked', 'No style components checked.');
      return;
    }

    Alert.alert(
      'Batch Removal',
      `Remove ${selectedHairstyles.length} selected style(s) from "${selectedCollection.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm Remove',
          onPress: () => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            
            const updatedStyles = selectedCollection.styles.filter(s => !selectedHairstyles.includes(s.id));
            const updatedCollection = {
              ...selectedCollection,
              styles: updatedStyles,
              thumbnails: updatedStyles.slice(0, 3).map(s => s.imageUrl)
            };

            setCollectionsList(prev => prev.map(col => col.id === selectedCollection.id ? updatedCollection : col));
            setSelectedCollection(updatedCollection);
            setSelectedHairstyles([]);
            setIsMultiSelect(false);
            
            Alert.alert('Batch Purge Complete', 'Selected styles removed from collection moodboard.');
          }
        }
      ]
    );
  };

  // 12. Batch Move styles to another folder
  const handleBatchMoveStyles = () => {
    if (selectedHairstyles.length === 0) {
      Alert.alert('Operation Blocked', 'No styles checked.');
      return;
    }

    const otherFolders = collectionsList.filter(col => col.id !== selectedCollection.id);
    if (otherFolders.length === 0) {
      Alert.alert('Transfer Interrupted', 'No other collection folders available. Create a new collection first.');
      return;
    }

    const choiceButtons = otherFolders.map(folder => ({
      text: folder.name,
      onPress: () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        
        const movingStyles = selectedCollection.styles.filter(s => selectedHairstyles.includes(s.id));
        const remainingStyles = selectedCollection.styles.filter(s => !selectedHairstyles.includes(s.id));

        const updatedTargetStyles = [...folder.styles, ...movingStyles];
        const updatedTargetFolder = {
          ...folder,
          styles: updatedTargetStyles,
          thumbnails: updatedTargetStyles.slice(0, 3).map(s => s.imageUrl)
        };

        const updatedActiveFolder = {
          ...selectedCollection,
          styles: remainingStyles,
          thumbnails: remainingStyles.slice(0, 3).map(s => s.imageUrl)
        };

        setCollectionsList(prev => prev.map(c => {
          if (c.id === selectedCollection.id) return updatedActiveFolder;
          if (c.id === folder.id) return updatedTargetFolder;
          return c;
        }));

        setSelectedCollection(updatedActiveFolder);
        setSelectedHairstyles([]);
        setIsMultiSelect(false);

        Alert.alert(
          'Transfer Successful',
          `${movingStyles.length} style(s) migrated to "${folder.name}" successfully.`
        );
      }
    }));

    choiceButtons.push({ text: 'Cancel', style: 'cancel' });

    Alert.alert(
      'Migrate Hairstyle Elements',
      'Select destination folder to transfer batch composites:',
      choiceButtons
    );
  };

  // 13. Drag-and-Swap layout order index shifts
  const handleReorderSwap = (index, direction) => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === collectionsList.length - 1) return;

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...collectionsList];
    
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    
    setCollectionsList(updated);
  };

  // --- COMPARISON HISTORY & EXPORT HISTORY SYSTEMS ACTIONS ---

  // 1. Reopen Comparison Modal view
  const handleOpenComparisonModal = (item) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveComparisonItem(item);
    setSliderPos(0.5); // Reset split center
    setComparisonModalVisible(true);
  };

  // 2. Re-download exported composite
  const handleReDownloadExport = (item) => {
    Alert.alert(
      'Securing Download',
      `Simulating cloud retrieval for "${item.name}" portrait composite...`,
      [
        {
          text: 'Confirm Sync',
          onPress: () => {
            Alert.alert(
              'Portrait Restored',
              'Composite compiled clean. Successfully saved to local device photos!'
            );
          }
        }
      ]
    );
  };

  // 3. Share exported composite
  const handleShareExport = (item) => {
    Alert.alert(
      'Generate Print Package',
      `Secure port established. Copying neural share link to clipboard:\n\nhttps://hairverse.ai/prints/${item.id}`
    );
  };

  // 4. Clean up standard duplicates (Reclaim storage)
  const handlePurgeRedundantExports = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    
    setHistoryExportList(prev => prev.filter(exp => !(exp.isDuplicate && exp.quality.includes('Standard'))));
    setStorageUsed(prev => Math.round((prev - 8.4) * 10) / 10);
    setShowStorageCleanup(false);
    
    Alert.alert(
      'Storage Sweep Matrix',
      'AI suggestion purge applied successfully. Reclaimed 8.4 MB of Cyber-Cloud capacity!'
    );
  };

  // --- DYNAMIC ONBOARDING HINT CAROUSEL ---
  const renderOnboardingCarousel = () => {
    const ONBOARDING_TIPS = [
      "💡 Tap the 'Quick Try-On' toolbar icon under any favorite to load its parameters instantly in the simulator studio!",
      "💡 Swipe any History Tried style left to reveal quick action drawers to favorite, restore, or delete.",
      "💡 Establish custom Moodboard collections to organize your styles by thematic looks, like Office or Curly Styles.",
      "💡 Reopen A/B comparisons to crop Style B dynamically over Style A using our touch-sensitive slider!",
      "💡 Pull down the screen to refresh and synchronize all cache profiles with our secure Cyber-Cloud servers."
    ];

    return (
      <View style={styles.onboardingTipsCardOuter}>
        <View style={styles.onboardingTipsCard}>
          <View style={{ flex: 1, paddingRight: 8 }}>
            <Text style={styles.onboardingTipsHeader}>DYNAMIC ONBOARDING INSIGHT</Text>
            <Text style={styles.onboardingTipsText}>{ONBOARDING_TIPS[currentTipIndex]}</Text>
          </View>
          <TouchableOpacity 
            style={styles.onboardingTipsNextBtn} 
            onPress={() => setCurrentTipIndex(prev => (prev + 1) % ONBOARDING_TIPS.length)}
          >
            <Ionicons name="chevron-forward" size={14} color={COLORS.secondary} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // --- HIGH-FIDELITY PULSING SKELETON LOADERS ---
  const renderLoadingSkeleton = () => {
    const isGrid = viewMode === 'grid';
    
    if (activeTab === 'favorites') {
      return (
        <View style={styles.skeletonContainer}>
          <Text style={styles.sectionHeading}>SYNCHRONIZING SECURE MIRRORS...</Text>
          {[1, 2, 3].map(i => (
            <Animated.View key={i} style={[styles.skeletonCardOuter, { opacity: skeletonPulse }]}>
              <View style={styles.skeletonCard}>
                <View style={styles.skeletonThumb} />
                <View style={styles.skeletonInfo}>
                  <View style={styles.skeletonTextLineLong} />
                  <View style={styles.skeletonTextLineShort} />
                  <View style={styles.skeletonTextLineMedium} />
                </View>
              </View>
            </Animated.View>
          ))}
        </View>
      );
    }
    
    if (activeTab === 'history') {
      return (
        <View style={styles.skeletonContainer}>
          <Text style={styles.sectionHeading}>LOADING DYNAMIC NEURAL TIMELINE...</Text>
          {[1, 2, 3].map(i => (
            <Animated.View key={i} style={[styles.skeletonCardOuter, { opacity: skeletonPulse }]}>
              <View style={styles.skeletonCard}>
                <View style={styles.skeletonThumb} />
                <View style={styles.skeletonInfo}>
                  <View style={styles.skeletonTextLineLong} />
                  <View style={styles.skeletonTextLineShort} />
                </View>
              </View>
            </Animated.View>
          ))}
        </View>
      );
    }
    
    if (activeTab === 'comparisons') {
      return (
        <View style={styles.skeletonContainer}>
          <Text style={styles.sectionHeading}>CALCULATING DIAGNOSTIC MATCH METRICS...</Text>
          {[1, 2].map(i => (
            <Animated.View key={i} style={[styles.skeletonCompCard, { opacity: skeletonPulse }]}>
              <View style={styles.skeletonCompImages}>
                <View style={styles.skeletonCompHalf} />
                <View style={styles.skeletonCompHalf} />
              </View>
              <View style={{ padding: 12 }}>
                <View style={styles.skeletonTextLineLong} />
                <View style={[styles.skeletonTextLineMedium, { marginTop: 8 }]} />
              </View>
            </Animated.View>
          ))}
        </View>
      );
    }
    
    if (activeTab === 'exports') {
      return (
        <View style={styles.skeletonContainer}>
          <Text style={styles.sectionHeading}>METRICS TELEMETRY RECOVERY...</Text>
          <Animated.View style={[styles.skeletonStorageCard, { opacity: skeletonPulse }]}>
            <View style={styles.skeletonTextLineMedium} />
            <View style={[styles.skeletonTextLineLong, { height: 8, marginTop: 8 }]} />
          </Animated.View>
          {[1, 2].map(i => (
            <Animated.View key={i} style={[styles.skeletonCardOuter, { opacity: skeletonPulse }]}>
              <View style={styles.skeletonCard}>
                <View style={styles.skeletonThumb} />
                <View style={styles.skeletonInfo}>
                  <View style={styles.skeletonTextLineLong} />
                  <View style={styles.skeletonTextLineShort} />
                </View>
              </View>
            </Animated.View>
          ))}
        </View>
      );
    }
    
    return (
      <View style={styles.skeletonContainer}>
        <Text style={styles.sectionHeading}>FETCHING MOODBOARDS MOSAIC...</Text>
        {isGrid ? (
          <View style={styles.skeletonGrid}>
            {[1, 2, 3, 4].map(i => (
              <Animated.View key={i} style={[styles.skeletonGridCard, { opacity: skeletonPulse }]}>
                <View style={styles.skeletonGridCover} />
                <View style={{ padding: 8 }}>
                  <View style={styles.skeletonTextLineMedium} />
                  <View style={[styles.skeletonTextLineShort, { marginTop: 4 }]} />
                </View>
              </Animated.View>
            ))}
          </View>
        ) : (
          [1, 2, 3].map(i => (
            <Animated.View key={i} style={[styles.skeletonCardOuter, { opacity: skeletonPulse }]}>
              <View style={styles.skeletonCard}>
                <View style={styles.skeletonThumb} />
                <View style={styles.skeletonInfo}>
                  <View style={styles.skeletonTextLineLong} />
                  <View style={styles.skeletonTextLineShort} />
                </View>
              </View>
            </Animated.View>
          ))
        )}
      </View>
    );
  };

  // --- PREMIUM EMPTY STATE COMPONENT WITH SHORTCUTS ---
  const renderEmptyState = (type) => {
    let iconName = 'bookmark-outline';
    let title = 'No Saved Looks';
    let description = 'Start saving your favorite hairstyles to compile your customized collection folders.';
    const recommendations = [
      { name: 'Classic Fade', score: '95%', color: 'Black', beard: 'Clean Shave', imageUrl: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=200&h=200&fit=crop' },
      { name: 'Korean Textured', score: '92%', color: 'Burgundy', beard: 'Stubble', imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop' },
      { name: 'Textured Curly', score: '88%', color: 'Silver', beard: 'Short Beard', imageUrl: 'https://images.unsplash.com/photo-1605497746444-ac9dbd39f4a5?w=200&h=200&fit=crop' },
      { name: 'Classic Pompadour', score: '91%', color: 'Brown', beard: 'Clean Shave', imageUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=200&h=200&fit=crop' }
    ];

    if (type === 'favorites') {
      iconName = 'bookmark-outline';
      title = 'Start saving your favorite hairstyles';
      description = 'Save hairstyle variants in the simulator to bookmark them here for instant comparisons.';
    } else if (type === 'tried') {
      iconName = 'sparkles-outline';
      title = 'No AI try-ons yet';
      description = 'Try out customized locks, hair dyes, and facial styles in the Simulation Studio to populate your timeline.';
    } else if (type === 'exported') {
      iconName = 'cloud-download-outline';
      title = 'No recently exported prints';
      description = 'Render high-resolution composites in the try-on page to sync and re-download them here.';
    } else if (type === 'compared_history') {
      iconName = 'git-compare-outline';
      title = 'No compared pairs recorded';
      description = 'Select multiple style options inside the try-on generator studio to run dynamic A/B metrics comparisons.';
    } else if (type === 'collections') {
      iconName = 'folder-open-outline';
      title = 'No cyber moodboards established';
      description = 'Group your bookmarked neural prints by aesthetic themes (e.g. Office Looks, Date Nights).';
    }

    return (
      <View style={styles.emptyContainer}>
        {renderOnboardingCarousel()}

        <View style={styles.emptyGraphicsBox}>
          <Ionicons name={iconName} size={36} color={COLORS.secondary} style={styles.emptyIconGlow} />
          <Text style={styles.emptyHeadlineText}>{title}</Text>
          <Text style={styles.emptyDescText}>{description}</Text>
        </View>

        {/* Dynamic primary try-on simulator redirect */}
        <TouchableOpacity 
          style={styles.emptyLaunchBtn} 
          onPress={() => Alert.alert('Launching Try-On Studio', 'Redirecting to AI Simulation page...')}
        >
          <Ionicons name="flash" size={13} color={COLORS.background} />
          <Text style={styles.emptyLaunchBtnText}>Launch Live Try-On Studio</Text>
        </TouchableOpacity>

        {/* AI Recommendations Shortcuts */}
        <View style={styles.emptyRecsSection}>
          <View style={styles.emptyRecsHeader}>
            <Ionicons name="sparkles" size={12} color={COLORS.secondary} />
            <Text style={styles.emptyRecsTitle}>PRE-LOAD POPULAR AI LOOKS</Text>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.emptyRecsScroll}>
            {recommendations.map((item, idx) => (
              <TouchableOpacity 
                key={idx} 
                style={styles.emptyRecCard}
                onPress={() => {
                  Alert.alert(
                    'Preloading Hairstyle',
                    `Do you want to pre-populate Try-On Studio with "${item.name}" (Color: ${item.color}, Fit Score: ${item.score})?`,
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { 
                        text: 'Load Style', 
                        onPress: () => handleContinuePreviousTryOn({ name: item.name })
                      }
                    ]
                  );
                }}
              >
                <Image source={{ uri: item.imageUrl }} style={styles.emptyRecCardThumb} />
                <View style={styles.emptyRecCardOverlay}>
                  <Text style={styles.emptyRecCardName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.emptyRecCardMeta}>{item.score} Match • {item.color}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    );
  };

  const tabWidth = contentWidth / 5;
  const leftOffset = tabSlideAnim.interpolate({
    inputRange: [0, 1, 2, 3, 4],
    outputRange: [0, tabWidth, tabWidth * 2, tabWidth * 3, tabWidth * 4]
  });

  const translateY = fadeContent.interpolate({
    inputRange: [0, 1],
    outputRange: [15, 0]
  });

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.contentContainer} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handlePullToRefresh}
            tintColor={COLORS.secondary}
            colors={[COLORS.secondary]}
            progressBackgroundColor="rgba(18, 18, 26, 0.98)"
          />
        }
      >
      
      {/* 1. PROFESSIONAL TELEMETRY HEADER */}
      <View style={styles.headerTelemetryRow}>
        <View>
          <Text style={styles.metaLabel}>AI GRAPHICS MATRIX</Text>
          <Text style={styles.header}>Cyber Library</Text>
        </View>
        
        <View style={styles.telemetryBadge}>
          <Ionicons name="cloud-done" size={14} color={COLORS.secondary} />
          <Text style={styles.telemetryBadgeText}>{favoritesList.length + historyTriedList.length} Fits Logged</Text>
        </View>
      </View>

      {/* 2. DYNAMIC TABS BAR */}
      <View style={styles.tabRowOuter}>
        <View style={styles.tabRow}>
          <Animated.View style={[
            styles.animatedTabPill, 
            { 
              width: tabWidth - 4,
              left: leftOffset 
            }
          ]} />

          {TABS.map((tab, idx) => {
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity 
                key={tab.id} 
                style={styles.tabItem}
                onPress={() => handleTabSwitch(tab.id, idx)}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabItemText, isActive && styles.activeTabItemText]}>
                  {tab.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* SEARCH AND LAYOUT FILTERS */}
      <View style={styles.filtersBar}>
        <View style={styles.searchBarContainer}>
          <Ionicons name="search" size={14} color={COLORS.textSecondary} style={styles.searchIcon} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Search library catalog..."
            placeholderTextColor={COLORS.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.layoutToggleBar}>
          <TouchableOpacity 
            style={[styles.toggleBtn, viewMode === 'grid' && styles.activeToggleBtn]} 
            onPress={() => setViewMode('grid')}
          >
            <Ionicons name="grid-outline" size={14} color={viewMode === 'grid' ? COLORS.background : COLORS.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.toggleBtn, viewMode === 'list' && styles.activeToggleBtn]} 
            onPress={() => setViewMode('list')}
          >
            <Ionicons name="list-outline" size={14} color={viewMode === 'list' ? COLORS.background : COLORS.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* SORT CONTROLS */}
      {activeTab === 'collections' && (
        <View style={styles.sortSelectorBar}>
          <Text style={styles.sortLabel}>SORT FILES:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sortScroll}>
            <TouchableOpacity style={[styles.sortChip, sortBy === 'newest' && styles.activeSortChip]} onPress={() => setSortBy('newest')}>
              <Text style={[styles.sortChipText, sortBy === 'newest' && styles.activeSortChipText]}>Newest</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.sortChip, sortBy === 'oldest' && styles.activeSortChip]} onPress={() => setSortBy('oldest')}>
              <Text style={[styles.sortChipText, sortBy === 'oldest' && styles.activeSortChipText]}>Oldest</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.sortChip, sortBy === 'views' && styles.activeSortChip]} onPress={() => setSortBy('views')}>
              <Text style={[styles.sortChipText, sortBy === 'views' && styles.activeSortChipText]}>Views</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {/* MAIN WORKSPACE DRIVEN BY TAB STATES */}
      <Animated.View style={{ opacity: fadeContent, transform: [{ translateY }], flex: 1 }}>
        {isLoading ? (
          renderLoadingSkeleton()
        ) : (
          <>
            {/* TABS 1: FAVORITES */}
            {activeTab === 'favorites' && (
          <View style={styles.simpleListContainer}>
            <Text style={styles.sectionHeading}>BOOKMARKED NEURAL HAIRSTYLES</Text>
            
            {favoritesList.length === 0 ? (
              renderEmptyState('favorites')
            ) : (
              favoritesList.map((fav) => {
                const showActions = activeActionsCellId === fav.id;
                return (
                  <View key={fav.id} style={styles.favCardOuter}>
                    
                    {/* Main Favorites row */}
                    <TouchableOpacity 
                      style={[styles.favCard, showActions && styles.activeFavCardBorder]} 
                      onPress={() => handleToggleSwipeCell(fav.id)}
                      activeOpacity={0.9}
                    >
                      <Image source={{ uri: fav.imageUrl }} style={styles.favThumb} />
                      <View style={styles.favInfo}>
                        <Text style={styles.favName}>{fav.name}</Text>
                        
                        <View style={styles.favMetaRow}>
                          <Text style={styles.favMetaText}>Shade: </Text>
                          <View style={[styles.colorSwatch, { backgroundColor: HAIR_COLORS[fav.color] || '#FFFFFF' }]} />
                          <Text style={styles.favMetaText}>{fav.color}  •  Beard: {fav.beard}</Text>
                        </View>
                        
                        <Text style={styles.favDate}>Saved {fav.date}</Text>
                      </View>
                      
                      <View style={styles.favBadgeRow}>
                        <View style={styles.favFitBadge}>
                          <Text style={styles.favFitText}>{fav.score} Fit</Text>
                        </View>
                        <Ionicons name={showActions ? "chevron-up" : "chevron-down"} size={14} color={COLORS.textSecondary} style={{ marginLeft: 6 }} />
                      </View>
                    </TouchableOpacity>
 
                    {/* Premium Expandable Action Swipe Drawer Toolbar */}
                    {showActions && (
                      <View style={styles.expandableToolbar}>
                        <TouchableOpacity style={styles.toolbarBtn} onPress={() => handleContinuePreviousTryOn(fav)}>
                          <Ionicons name="sparkles" size={14} color={COLORS.secondary} />
                          <Text style={styles.toolbarBtnText}>Quick Try</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.toolbarBtn} onPress={() => handleContinuePreviousTryOn(fav)}>
                          <Ionicons name="git-compare" size={14} color={COLORS.secondary} />
                          <Text style={styles.toolbarBtnText}>Compare Again</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.toolbarBtn} onPress={() => handleExportShortcut(fav)}>
                          <Ionicons name="cloud-download" size={14} color={COLORS.secondary} />
                          <Text style={styles.toolbarBtnText}>Export HD</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.toolbarBtn} onPress={() => handleCellDelete(fav.id, 'favorites')}>
                          <Ionicons name="trash-outline" size={14} color={COLORS.error} />
                          <Text style={[styles.toolbarBtnText, { color: COLORS.error }]}>Remove</Text>
                        </TouchableOpacity>
                      </View>
                    )}
 
                  </View>
                );
              })
            )}
          </View>
        )}
 
        {/* TAB 2: HISTORY TIMELINES */}
        {activeTab === 'history' && (
          <View style={styles.simpleListContainer}>
            
            {/* 3. RECENT HAIRSTYLE DIAGNOSTIC ANALYTICS CARD */}
            <View style={styles.analyticsCard}>
              <View style={styles.analyticsHeader}>
                <Ionicons name="analytics" size={14} color={COLORS.secondary} />
                <Text style={styles.analyticsTitle}>Cyber Diagnostic Telemetry</Text>
              </View>
              <View style={styles.analyticsRow}>
                <View style={styles.analyticsCol}>
                  <Text style={styles.analyticsLabelText}>Style Trend</Text>
                  <Text style={styles.analyticsValue}>Fade (62%)</Text>
                  {/* Neon filled progress bar */}
                  <View style={styles.miniProgressBar}>
                    <View style={[styles.miniProgressFill, { width: '62%' }]} />
                  </View>
                </View>
                <View style={styles.analyticsColDivider} />
                <View style={styles.analyticsCol}>
                  <Text style={styles.analyticsLabelText}>Fav Shade</Text>
                  <Text style={styles.analyticsValue}>Black (84%)</Text>
                  {/* Neon filled progress bar */}
                  <View style={styles.miniProgressBar}>
                    <View style={[styles.miniProgressFill, { width: '84%', backgroundColor: '#00D4FF' }]} />
                  </View>
                </View>
                <View style={styles.analyticsColDivider} />
                <View style={styles.analyticsCol}>
                  <Text style={styles.analyticsLabelText}>AR Tracking</Text>
                  <Text style={styles.analyticsValue}>24 Mins</Text>
                  {/* Neon filled progress bar */}
                  <View style={styles.miniProgressBar}>
                    <View style={[styles.miniProgressFill, { width: '80%', backgroundColor: '#34D399' }]} />
                  </View>
                </View>
              </View>
            </View>

            {/* Glassmorphic sub-segmented control bar inside History */}
            <View style={styles.subTabContainer}>
              <TouchableOpacity 
                style={[styles.subTabItem, historySubTab === 'tried' && styles.activeSubTabItem]}
                onPress={() => {
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                  setHistorySubTab('tried');
                }}
              >
                <Ionicons name="sparkles" size={12} color={historySubTab === 'tried' ? COLORS.background : COLORS.textSecondary} />
                <Text style={[styles.subTabText, historySubTab === 'tried' && styles.activeSubTabText]}>Tried Styles</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.subTabItem, historySubTab === 'exports' && styles.activeSubTabItem]}
                onPress={() => {
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                  setHistorySubTab('exports');
                }}
              >
                <Ionicons name="cloud-download" size={12} color={historySubTab === 'exports' ? COLORS.background : COLORS.textSecondary} />
                <Text style={[styles.subTabText, historySubTab === 'exports' && styles.activeSubTabText]}>Exported Prints</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.subTabItem, historySubTab === 'comparisons' && styles.activeSubTabItem]}
                onPress={() => {
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                  setHistorySubTab('comparisons');
                }}
              >
                <Ionicons name="git-compare" size={12} color={historySubTab === 'comparisons' ? COLORS.background : COLORS.textSecondary} />
                <Text style={[styles.subTabText, historySubTab === 'comparisons' && styles.activeSubTabText]}>Compared Pairs</Text>
              </TouchableOpacity>
            </View>

            {/* Tab 2.1: TRIED STYLES LIST (Using SwipeableItem with interactive drawer) */}
            {historySubTab === 'tried' && (
              <View>
                <Text style={styles.sectionHeading}>RECENTLY TRIED STYLES (SWIPE ROW LEFT)</Text>
                {historyTriedList.length === 0 ? (
                  renderEmptyState('tried')
                ) : (
                  historyTriedList.map((hist) => (
                    <SwipeableItem 
                      key={hist.id}
                      item={hist}
                      onDelete={(id) => handleCellDelete(id, 'history')}
                      onFavorite={handleCellFavorite}
                      onRestore={handleCellRestore}
                      hairColors={HAIR_COLORS}
                    />
                  ))
                )}
              </View>
            )}

            {/* Tab 2.2: EXPORTED PRINTS LIST */}
            {historySubTab === 'exports' && (
              <View>
                <Text style={styles.sectionHeading}>RECENTLY EXPORTED NEURAL LOOKS</Text>
                {historyExportList.length === 0 ? (
                  renderEmptyState('exported')
                ) : (
                  historyExportList.map((exp) => (
                    <View key={exp.id} style={styles.favCardOuter}>
                      <View style={styles.favCard}>
                        <Image source={{ uri: exp.imageUrl }} style={styles.favThumb} />
                        <View style={styles.favInfo}>
                          <Text style={styles.favName}>{exp.name}</Text>
                          <Text style={styles.favMeta}>Quality: {exp.quality} • {exp.date}</Text>
                        </View>
                        <View style={styles.exportBadge}>
                          <Text style={styles.exportBadgeText}>4K HD</Text>
                        </View>
                      </View>
                      <View style={styles.expandableToolbar}>
                        <TouchableOpacity style={styles.toolbarBtn} onPress={() => handleContinuePreviousTryOn({ name: exp.name })}>
                          <Ionicons name="sparkles" size={14} color={COLORS.secondary} />
                          <Text style={styles.toolbarBtnText}>Continue Editing</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.toolbarBtn} onPress={() => Alert.alert('Share Link', 'Copied secure neural share link to clipboard!')}>
                          <Ionicons name="share-social-outline" size={14} color={COLORS.secondary} />
                          <Text style={styles.toolbarBtnText}>Share Print</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                )}
              </View>
            )}

            {/* Tab 2.3: COMPARED PAIRS LIST */}
            {historySubTab === 'comparisons' && (
              <View>
                <Text style={styles.sectionHeading}>PREVIOUSLY COMPARED HAIRSTYLES</Text>
                {historyComparedList.length === 0 ? (
                  renderEmptyState('compared_history')
                ) : (
                  historyComparedList.map((comp) => (
                    <View key={comp.id} style={styles.compCard}>
                      <View style={styles.compImagesRow}>
                        <Image source={{ uri: comp.imageUrlA }} style={styles.compHalfImage} />
                        <Image source={{ uri: comp.imageUrlB }} style={styles.compHalfImage} />
                      </View>
                      <View style={styles.compDetails}>
                        <Text style={styles.compTitle}>{comp.title}</Text>
                        <Text style={styles.compDate}>{comp.date}</Text>
                        
                        <TouchableOpacity style={styles.continueTryBtn} onPress={() => handleContinuePreviousTryOn({ name: comp.title })}>
                          <Ionicons name="git-compare" size={14} color={COLORS.background} />
                          <Text style={styles.continueTryText}>Continue Split Comparison</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                )}
              </View>
            )}

            {/* FUTURISTIC AR ACTIVITY CONNECTOR TRACK TIMELINE */}
            <Text style={[styles.sectionHeading, { marginTop: 12 }]}>AI SYSTEM ACTIVITY LOG</Text>
            <View style={styles.timelineContainer}>
              {TIMELINE_EVENTS.map((event, idx) => (
                <View key={event.id} style={styles.timelineItem}>
                  {/* Dotted vertical connector track line */}
                  <View style={styles.timelineTrackLineCol}>
                    <View style={styles.timelineIndicatorDot}>
                      <Ionicons name={event.icon} size={8} color={COLORS.background} />
                    </View>
                    {idx !== TIMELINE_EVENTS.length - 1 && (
                      <View style={styles.verticalTrackerConnectorLine} />
                    )}
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineTimeText}>{event.time}</Text>
                    <Text style={styles.timelineEventText}>{event.event}</Text>
                  </View>
                </View>
              ))}
            </View>

          </View>
        )}

        {/* TAB 3: COMPARISONS */}
        {activeTab === 'comparisons' && (
          <View style={styles.simpleListContainer}>
            <Text style={styles.sectionHeading}>PREVIOUSLY COMPARED HAIRSTYLES</Text>
            {historyComparedList.length === 0 ? (
              renderEmptyState('compared_history')
            ) : (
              historyComparedList.map((comp) => (
                <View key={comp.id} style={styles.compCardOuter}>
                  <View style={styles.compCard}>
                    <View style={styles.compImagesRow}>
                      <View style={styles.compHalfContainer}>
                        <Image source={{ uri: comp.imageUrlA }} style={styles.compHalfImage} />
                        <View style={[styles.compTagBadge, { left: 8 }]}>
                          <Text style={styles.compTagBadgeText}>Before (Style A)</Text>
                        </View>
                      </View>
                      <View style={styles.compHalfContainer}>
                        <Image source={{ uri: comp.imageUrlB }} style={styles.compHalfImage} />
                        <View style={[styles.compTagBadge, { right: 8 }]}>
                          <Text style={styles.compTagBadgeText}>After (Style B)</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.compDetails}>
                      <View style={styles.compHeaderRow}>
                        <Text style={styles.compTitle}>{comp.title}</Text>
                        <Text style={styles.compDate}>{comp.date}</Text>
                      </View>
 
                      {/* Trophy Winner indicator */}
                      <View style={styles.winnerContainer}>
                        <Ionicons name="trophy" size={14} color="#D4AF37" style={{ marginRight: 6 }} />
                        <Text style={styles.winnerLabelText}>SELECTED WINNER: </Text>
                        <Text style={styles.winnerValueText}>{comp.winner}</Text>
                      </View>
 
                      {/* AI Match Differences Feedback Comment */}
                      <View style={styles.aiDifferencesCard}>
                        <Ionicons name="bulb-outline" size={13} color={COLORS.secondary} style={styles.aiDiffIcon} />
                        <Text style={styles.aiDiffText}>{comp.aiFeedback}</Text>
                      </View>
                      
                      {/* Reopen slider comparison button */}
                      <TouchableOpacity style={styles.reopenCompBtn} onPress={() => handleOpenComparisonModal(comp)}>
                        <Ionicons name="git-compare" size={14} color={COLORS.background} />
                        <Text style={styles.reopenCompBtnText}>Reopen A/B Slider Preview</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
 
        {/* TAB 4: EXPORTS */}
        {activeTab === 'exports' && (
          <View style={styles.simpleListContainer}>
            {/* Storage Usage indicator */}
            <View style={styles.storageCard}>
              <View style={styles.storageHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="cloud-done" size={14} color={COLORS.secondary} />
                  <Text style={styles.storageTitle}>Cyber-Cloud Storage telemetry</Text>
                </View>
                <Text style={styles.storageUsedText}>{storageUsed} MB / 100 MB Used</Text>
              </View>
              
              <View style={styles.storageBarOuter}>
                <View style={[styles.storageBarFill, { width: `${storageUsed}%` }]} />
              </View>
            </View>
 
            {/* Smart cleanup suggestion card */}
            {showStorageCleanup && (
              <View style={styles.cleanupCard}>
                <View style={styles.cleanupContent}>
                  <Ionicons name="trash-bin" size={18} color="#EF4444" style={{ marginRight: 10 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cleanupTitle}>AI STORAGE CLEANUP SUGGESTION</Text>
                    <Text style={styles.cleanupText}>
                      You have 2 redundant standard quality prints of Classic Fade. Purge duplicates to reclaim 8.4 MB of Cyber-Cloud capacity?
                    </Text>
                  </View>
                </View>
                <View style={styles.cleanupActionsRow}>
                  <TouchableOpacity style={styles.cleanupSubmitBtn} onPress={handlePurgeRedundantExports}>
                    <Text style={styles.cleanupSubmitText}>Purge Duplicates</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.cleanupDismissBtn} onPress={() => setShowStorageCleanup(false)}>
                    <Ionicons name="close" size={16} color={COLORS.textSecondary} />
                  </TouchableOpacity>
                </View>
              </View>
            )}
 
            {/* AI Export Analytics Card */}
            <View style={styles.exportAnalyticsCard}>
              <View style={styles.analyticsHeader}>
                <Ionicons name="speedometer" size={14} color={COLORS.secondary} />
                <Text style={styles.analyticsTitle}>AI Render Output Analytics</Text>
              </View>
              <View style={styles.analyticsRow}>
                <View style={styles.analyticsCol}>
                  <Text style={styles.analyticsLabelText}>Total Prints</Text>
                  <Text style={styles.analyticsValue}>{historyExportList.length} Outputs</Text>
                </View>
                <View style={styles.analyticsColDivider} />
                <View style={styles.analyticsCol}>
                  <Text style={styles.analyticsLabelText}>Ultra HD Prints</Text>
                  <Text style={styles.analyticsValue}>
                    {historyExportList.filter(e => e.quality.includes('4K')).length} Profiles
                  </Text>
                </View>
                <View style={styles.analyticsColDivider} />
                <View style={styles.analyticsCol}>
                  <Text style={styles.analyticsLabelText}>Upsample Success</Text>
                  <Text style={styles.analyticsValue}>98.4% Rate</Text>
                </View>
              </View>
            </View>
 
            <Text style={styles.sectionHeading}>RECENTLY EXPORTED NEURAL LOOKS</Text>
            {historyExportList.length === 0 ? (
              renderEmptyState('exported')
            ) : (
              historyExportList.map((exp) => (
                <View key={exp.id} style={styles.favCardOuter}>
                  <View style={styles.favCard}>
                    <Image source={{ uri: exp.imageUrl }} style={styles.favThumb} />
                    <View style={styles.favInfo}>
                      <Text style={styles.favName}>{exp.name}</Text>
                      
                      <View style={styles.exportMetaRow}>
                        <Text style={styles.exportMetaText}>Quality: {exp.quality}  •  </Text>
                        <Text style={styles.exportMetaText}>Watermark: </Text>
                        <Text style={[
                          styles.watermarkStatusText, 
                          exp.watermarkStatus === 'Embedded' ? styles.watermarkedLabel : styles.watermarkCleanLabel
                        ]}>
                          {exp.watermarkStatus === 'Embedded' ? 'Embedded' : 'Bypassed (Clean)'}
                        </Text>
                      </View>
                      
                      <Text style={styles.favDate}>{exp.date}</Text>
                    </View>
                    <View style={[
                      styles.exportBadge, 
                      exp.quality.includes('4K') ? { backgroundColor: '#D4AF37' } : { backgroundColor: COLORS.secondary }
                    ]}>
                      <Text style={styles.exportBadgeText}>{exp.quality.includes('4K') ? '4K UHD' : '2K HD'}</Text>
                    </View>
                  </View>
 
                  <View style={styles.expandableToolbar}>
                    <TouchableOpacity style={styles.toolbarBtn} onPress={() => handleReDownloadExport(exp)}>
                      <Ionicons name="cloud-download-outline" size={13} color={COLORS.secondary} />
                      <Text style={styles.toolbarBtnText}>Re-download</Text>
                    </TouchableOpacity>
 
                    <TouchableOpacity style={styles.toolbarBtn} onPress={() => handleShareExport(exp)}>
                      <Ionicons name="share-social-outline" size={13} color={COLORS.secondary} />
                      <Text style={styles.toolbarBtnText}>Share Link</Text>
                    </TouchableOpacity>
 
                    <TouchableOpacity style={styles.toolbarBtn} onPress={() => handleExportShortcut(exp)}>
                      <Ionicons name="sparkles" size={13} color={COLORS.secondary} />
                      <Text style={styles.toolbarBtnText}>Export Again</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* TAB 5: COLLECTIONS FOLDER CARD GRID/LIST */}
        {activeTab === 'collections' && (
          <View>
            {/* 1. AI Smart suggestion folder suggestions banner */}
            {showAiSuggestion && (
              <View style={styles.aiSuggestionBanner}>
                <View style={styles.aiSuggestionContent}>
                  <Ionicons name="sparkles" size={16} color={COLORS.secondary} style={styles.aiSuggestionIcon} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.aiSuggestionTitle}>AI RECOMMENDATION SUITE</Text>
                    <Text style={styles.aiSuggestionText}>
                      You bookmark Korean styles frequently. Establish a dedicated Korean Looks collection?
                    </Text>
                  </View>
                </View>
                <View style={styles.aiSuggestionActions}>
                  <TouchableOpacity style={styles.aiSuggestionBtn} onPress={handleSmartFolderEstablish}>
                    <Text style={styles.aiSuggestionBtnText}>Establish</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.aiSuggestionDismiss} onPress={() => setShowAiSuggestion(false)}>
                    <Ionicons name="close-circle" size={16} color={COLORS.textSecondary} />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Sub-header with reorder toggler */}
            <View style={styles.sectionHeaderRow}>
              <View>
                <Text style={styles.sectionHeading}>NEURAL STYLE MOODBOARDS</Text>
                <Text style={styles.sectionMeta}>{collectionsList.length} Folders Logged</Text>
              </View>
              
              <TouchableOpacity 
                style={[styles.reorderLayoutBtn, isArranging && styles.reorderLayoutBtnActive]}
                onPress={() => {
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                  setIsArranging(!isArranging);
                }}
              >
                <Ionicons name={isArranging ? "checkmark" : "swap-vertical"} size={12} color={isArranging ? COLORS.background : COLORS.secondary} />
                <Text style={[styles.reorderLayoutText, isArranging && styles.reorderLayoutTextActive]}>
                  {isArranging ? "Done Sorting" : "Sort Layout"}
                </Text>
              </TouchableOpacity>
            </View>

            {collectionsList.length === 0 ? (
              renderEmptyState('collections')
            ) : viewMode === 'grid' ? (
              <View style={styles.collectionsGrid}>
                {collectionsList.map((col, idx) => {
                  const avgMatch = col.styles.length > 0
                    ? Math.round(col.styles.reduce((sum, s) => sum + parseInt(s.score), 0) / col.styles.length)
                    : 90;
                  const isSyncing = syncingCollectionId === col.id;

                  return (
                    <TouchableOpacity 
                      key={col.id} 
                      style={styles.collectionGridCard} 
                      onPress={() => handleOpenCollectionPreview(col)}
                      activeOpacity={0.9}
                    >
                      <MoodboardCover stylesList={col.styles} />

                      {/* Options Button on Card cover */}
                      <TouchableOpacity style={styles.colCardOptionsBtn} onPress={() => handleOpenCollectionOptions(col)}>
                        <Ionicons name="ellipsis-horizontal" size={16} color={COLORS.textPrimary} />
                      </TouchableOpacity>

                      {/* Cloud Sync Telemetry button */}
                      <TouchableOpacity style={styles.colCardSyncBtn} onPress={() => handleToggleSync(col.id)}>
                        <Ionicons 
                          name={isSyncing ? "sync" : "cloud-done"} 
                          size={12} 
                          color={isSyncing ? '#00D4FF' : '#34D399'} 
                        />
                      </TouchableOpacity>

                      <View style={styles.glassColCardOverlay}>
                        <Text style={styles.colCardTitle} numberOfLines={1}>{col.name}</Text>
                        <Text style={styles.colCardMeta}>{col.styles.length} Styles • {col.lastUpdated}</Text>
                        <Text style={styles.colCardCategoryText}>Fav: {col.favCategory || 'General'}</Text>
                        
                        <View style={styles.colFitBadge}>
                          <Ionicons name="sparkles" size={6} color={COLORS.secondary} />
                          <Text style={styles.colFitBadgeText}>{avgMatch}% Avg Fit</Text>
                        </View>
                      </View>

                      {/* Reorder Arrangement arrows */}
                      {isArranging && (
                        <View style={styles.reorderSwapOverlay}>
                          <TouchableOpacity 
                            style={[styles.reorderSwapBtn, idx === 0 && styles.reorderSwapBtnDisabled]} 
                            onPress={() => handleReorderSwap(idx, 'up')}
                            disabled={idx === 0}
                          >
                            <Ionicons name="chevron-up" size={12} color={idx === 0 ? COLORS.textSecondary : COLORS.background} />
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={[styles.reorderSwapBtn, idx === collectionsList.length - 1 && styles.reorderSwapBtnDisabled]} 
                            onPress={() => handleReorderSwap(idx, 'down')}
                            disabled={idx === collectionsList.length - 1}
                          >
                            <Ionicons name="chevron-down" size={12} color={idx === collectionsList.length - 1 ? COLORS.textSecondary : COLORS.background} />
                          </TouchableOpacity>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <View style={styles.collectionsListContainer}>
                {collectionsList.map((col, idx) => {
                  const avgMatch = col.styles.length > 0
                    ? Math.round(col.styles.reduce((sum, s) => sum + parseInt(s.score), 0) / col.styles.length)
                    : 90;
                  const isSyncing = syncingCollectionId === col.id;

                  return (
                    <TouchableOpacity 
                      key={col.id} 
                      style={styles.collectionListCard} 
                      onPress={() => handleOpenCollectionPreview(col)}
                      activeOpacity={0.9}
                    >
                      <View style={styles.listMoodboardCoverWrapper}>
                        <MoodboardCover stylesList={col.styles} />
                      </View>

                      <View style={styles.colListDetails}>
                        <Text style={styles.colListTitle}>{col.name}</Text>
                        <Text style={styles.colListSub}>{col.styles.length} saved profiles • updated {col.lastUpdated}</Text>
                        <Text style={styles.colListCategory}>Fav Category: {col.favCategory || 'General'}</Text>
                      </View>

                      <View style={styles.listRightActionRow}>
                        <View style={styles.listMatchBadge}>
                          <Text style={styles.listMatchBadgeText}>{avgMatch}% Fit</Text>
                        </View>
                        
                        <View style={styles.listIconButtonsRow}>
                          <TouchableOpacity style={styles.listIconButton} onPress={() => handleToggleSync(col.id)}>
                            <Ionicons name={isSyncing ? "sync" : "cloud-done"} size={13} color={isSyncing ? '#00D4FF' : '#34D399'} />
                          </TouchableOpacity>
                          <TouchableOpacity style={styles.listIconButton} onPress={() => handleOpenCollectionOptions(col)}>
                            <Ionicons name="ellipsis-vertical" size={13} color={COLORS.textSecondary} />
                          </TouchableOpacity>
                        </View>
                      </View>

                      {/* Arrangement sorting panel */}
                      {isArranging && (
                        <View style={styles.reorderListControls}>
                          <TouchableOpacity onPress={() => handleReorderSwap(idx, 'up')} disabled={idx === 0}>
                            <Ionicons name="chevron-up-circle-outline" size={20} color={idx === 0 ? COLORS.textSecondary : COLORS.secondary} />
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => handleReorderSwap(idx, 'down')} disabled={idx === collectionsList.length - 1}>
                            <Ionicons name="chevron-down-circle-outline" size={20} color={idx === collectionsList.length - 1 ? COLORS.textSecondary : COLORS.secondary} />
                          </TouchableOpacity>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            <TouchableOpacity style={styles.createNewFolderBtn} onPress={() => setCreateModalVisible(true)}>
              <Ionicons name="add" size={20} color={COLORS.secondary} />
              <Text style={styles.createNewFolderText}>Establish New Custom Moodboard</Text>
            </TouchableOpacity>
          </View>
        )}
      </>
    )}
  </Animated.View>

    </ScrollView>

    {/* FLOATING ACTION BUTTON (FAB) FOR CREATING COLLECTIONS */}
    {activeTab === 'collections' && (
      <TouchableOpacity 
        style={styles.floatingFabBtn} 
        onPress={() => setCreateModalVisible(true)}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={24} color={COLORS.background} />
      </TouchableOpacity>
    )}

    {/* --- COLLECTION MODALS MATRIX --- */}

    {/* 1. CREATE MOODBOARD MODAL */}
    <Modal visible={createModalVisible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.glassModalContainer}>
          <View style={styles.modalHeaderRow}>
            <Text style={styles.modalTitle}>CREATE NEW MOODBOARD</Text>
            <TouchableOpacity onPress={() => setCreateModalVisible(false)}>
              <Ionicons name="close" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.modalInputLabel}>Moodboard Title Tag</Text>
          <TextInput 
            style={styles.modalInput}
            placeholder="e.g. Summer Fade Vibe..."
            placeholderTextColor={COLORS.textSecondary}
            value={newCollectionName}
            onChangeText={setNewCollectionName}
          />

          <Text style={styles.modalInputLabel}>Style Theme Category</Text>
          <View style={styles.themePickerRow}>
            {['Korean Cuts', 'Classic Fades', 'Curly Drops', 'Formal Trims'].map((theme) => (
              <TouchableOpacity 
                key={theme} 
                style={[styles.themeChip, newCollectionTheme === theme && styles.themeChipActive]}
                onPress={() => setNewCollectionTheme(theme)}
              >
                <Text style={[styles.themeChipText, newCollectionTheme === theme && styles.themeChipTextActive]}>
                  {theme}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.modalSubmitBtn} onPress={handleCreateNewCollectionSubmit}>
            <Ionicons name="sparkles" size={14} color={COLORS.background} />
            <Text style={styles.modalSubmitBtnText}>Establish Moodboard</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>

    {/* 2. COLLECTION FULL-SCREEN PREVIEW MODAL */}
    <Modal visible={previewModalVisible} transparent animationType="slide">
      <View style={styles.fullscreenModalOverlay}>
        {selectedCollection && (
          <View style={styles.fullscreenModalContainer}>
            {/* Modal Cover collage header */}
            <View style={styles.fullscreenModalCoverWrapper}>
              <MoodboardCover stylesList={selectedCollection.styles} />
              <View style={styles.fullscreenModalCoverOverlay}>
                <View style={styles.fullscreenModalHeaderActionRow}>
                  <TouchableOpacity style={styles.modalCloseCircle} onPress={() => setPreviewModalVisible(false)}>
                    <Ionicons name="close" size={20} color={COLORS.textPrimary} />
                  </TouchableOpacity>
                  <View style={styles.syncIndicatorHeaderRow}>
                    <Ionicons name="cloud-done" size={12} color="#34D399" />
                    <Text style={styles.syncHeaderStatusText}>Synced to Cloud</Text>
                  </View>
                </View>

                <View style={styles.fullscreenTitleRow}>
                  <Text style={styles.fullscreenColName}>{selectedCollection.name}</Text>
                  <Text style={styles.fullscreenColMeta}>
                    Theme: {selectedCollection.favCategory} • {selectedCollection.styles.length} Profiles Logged
                  </Text>
                </View>
              </View>
            </View>

            {/* Preview content area */}
            <View style={styles.fullscreenContentContainer}>
              
              {/* Operations row */}
              <View style={styles.fullscreenOpsRow}>
                <Text style={styles.opsHeaderTitle}>SAVED COMPOSITE MOODBOARD</Text>
                
                {selectedCollection.styles.length > 0 && (
                  <TouchableOpacity 
                    style={[styles.batchEditBtn, isMultiSelect && styles.batchEditBtnActive]}
                    onPress={() => {
                      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                      setIsMultiSelect(!isMultiSelect);
                      setSelectedHairstyles([]);
                    }}
                  >
                    <Ionicons name={isMultiSelect ? "checkmark" : "create-outline"} size={12} color={isMultiSelect ? COLORS.background : COLORS.secondary} />
                    <Text style={[styles.batchEditText, isMultiSelect && styles.batchEditTextActive]}>
                      {isMultiSelect ? "Done Editing" : "Batch Manage"}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Main nested grid styles */}
              {selectedCollection.styles.length === 0 ? (
                <View style={styles.emptyMoodboardInner}>
                  <Ionicons name="images-outline" size={42} color={COLORS.textSecondary} style={{ opacity: 0.5 }} />
                  <Text style={styles.emptyMoodboardText}>This AI Moodboard has no saved styles yet.</Text>
                  <Text style={styles.emptyMoodboardSub}>Bookmark styles in the simulator to add them here.</Text>
                </View>
              ) : (
                <ScrollView style={styles.moodboardScroll} contentContainerStyle={styles.moodboardScrollContent} showsVerticalScrollIndicator={false}>
                  <View style={styles.previewGrid}>
                    {selectedCollection.styles.map((style) => {
                      const isChecked = selectedHairstyles.includes(style.id);
                      
                      return (
                        <TouchableOpacity 
                          key={style.id} 
                          style={[styles.previewGridCard, isChecked && styles.previewGridCardChecked]} 
                          onPress={() => {
                            if (isMultiSelect) {
                              handleToggleHairstyleSelect(style.id);
                            } else {
                              handleContinuePreviousTryOn(style);
                            }
                          }}
                          activeOpacity={0.9}
                        >
                          <Image source={{ uri: style.imageUrl }} style={styles.previewCardImg} />
                          
                          {/* Checkbox during batch edits */}
                          {isMultiSelect && (
                            <View style={[styles.selectCheckbox, isChecked && styles.selectCheckboxChecked]}>
                              {isChecked && <Ionicons name="checkmark" size={10} color={COLORS.background} />}
                            </View>
                          )}

                          <View style={styles.previewCardOverlay}>
                            <Text style={styles.previewCardTitle} numberOfLines={1}>{style.name.split('•')[1] || style.name}</Text>
                            <Text style={styles.previewCardMeta} numberOfLines={1}>{style.color} • {style.beard}</Text>
                            <View style={styles.previewCardFitRow}>
                              <Text style={styles.previewCardFitText}>{style.score} Fit</Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </ScrollView>
              )}
            </View>

            {/* Batch action bottom rise-toolbar */}
            {isMultiSelect && selectedHairstyles.length > 0 && (
              <View style={styles.batchActionsBottomToolbar}>
                <View style={styles.batchCountCol}>
                  <Text style={styles.batchCountText}>{selectedHairstyles.length} Checked</Text>
                </View>
                <View style={styles.batchActionButtonsRow}>
                  <TouchableOpacity style={[styles.batchActionBtn, { backgroundColor: 'rgba(0, 212, 255, 0.15)' }]} onPress={handleBatchMoveStyles}>
                    <Ionicons name="arrow-forward" size={12} color={COLORS.secondary} />
                    <Text style={[styles.batchActionBtnText, { color: COLORS.secondary }]}>Move Styles</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.batchActionBtn, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]} onPress={handleBatchRemoveStyles}>
                    <Ionicons name="trash-outline" size={12} color="#EF4444" />
                    <Text style={[styles.batchActionBtnText, { color: '#EF4444' }]}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}
      </View>
    </Modal>

    {/* 3. OPTIONS ACTION SHEET DRAWER MODAL */}
    <Modal visible={optionsDrawerVisible} transparent animationType="slide">
      <View style={styles.drawerOverlay}>
        <TouchableOpacity style={styles.drawerDismissArea} onPress={() => setOptionsDrawerVisible(false)} />
        <View style={styles.drawerContainer}>
          <View style={styles.drawerHandle} />
          
          {selectedCollection && (
            <View>
              <Text style={styles.drawerHeaderTitle}>MOODBOARD CONFIGURATIONS</Text>
              <Text style={styles.drawerCollectionName}>Collection: {selectedCollection.name}</Text>
              
              {/* Rename collection folder */}
              <View style={styles.drawerRenameRow}>
                <TextInput 
                  style={styles.drawerInput}
                  placeholder="Rename collection tag..."
                  placeholderTextColor={COLORS.textSecondary}
                  value={renameCollectionName}
                  onChangeText={setRenameCollectionName}
                />
                <TouchableOpacity style={styles.drawerRenameSubmitBtn} onPress={handleRenameCollectionSubmit}>
                  <Text style={styles.drawerRenameSubmitText}>Apply</Text>
                </TouchableOpacity>
              </View>

              {/* Options lists */}
              <TouchableOpacity style={styles.drawerOptionBtn} onPress={handleShareCollectionTrigger}>
                <Ionicons name="share-social-outline" size={16} color={COLORS.secondary} />
                <Text style={styles.drawerOptionText}>Share Cyber Moodboard Link</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.drawerOptionBtn} onPress={handleExportCollectionTrigger}>
                <Ionicons name="cloud-download-outline" size={16} color={COLORS.secondary} />
                <Text style={styles.drawerOptionText}>Export HD Collection ZIP</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.drawerOptionBtn, { borderBottomWidth: 0 }]} onPress={handleDeleteCollectionConfirm}>
                <Ionicons name="trash-outline" size={16} color={COLORS.error} />
                <Text style={[styles.drawerOptionText, { color: COLORS.error }]}>Delete Moodboard Library</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.drawerCancelBtn} onPress={() => setOptionsDrawerVisible(false)}>
                <Text style={styles.drawerCancelText}>Close Configurations</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>

    {/* 4. COMPARISON SLIDER DRAWER MODAL */}
    <Modal visible={comparisonModalVisible} transparent animationType="fade">
      <View style={styles.comparisonContainerContainer}>
        <View style={styles.comparisonModalContent}>
          {/* Header */}
          <View style={styles.comparisonTitleHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.comparisonMetaHeader}>AI HAIRSTYLE COMPARISON ENGINE</Text>
              <Text style={styles.comparisonTitleText} numberOfLines={1}>{activeComparisonItem?.title || 'Style Comparison'}</Text>
            </View>
            <TouchableOpacity onPress={() => setComparisonModalVisible(false)} style={styles.comparisonCloseCircle}>
              <Ionicons name="close" size={18} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Slider comparison box */}
          {activeComparisonItem && (
            <View 
              style={styles.interactiveSliderBox}
              onTouchStart={(e) => {
                let x = e.nativeEvent.locationX;
                if (x < 0) x = 0;
                if (x > containerWidth) x = containerWidth;
                setSliderPos(x / containerWidth);
              }}
              onTouchMove={(e) => {
                let x = e.nativeEvent.locationX;
                if (x < 0) x = 0;
                if (x > containerWidth) x = containerWidth;
                setSliderPos(x / containerWidth);
              }}
              onLayout={(e) => {
                const layoutWidth = e.nativeEvent.layout.width;
                if (layoutWidth > 0) {
                  setContainerWidth(layoutWidth);
                }
              }}
            >
              {/* Image A (Before) - Base absolute image */}
              <Image source={{ uri: activeComparisonItem.imageUrlA }} style={styles.sliderImgA} />
              
              {/* Image B (After) - Absolute cropped overlay */}
              <View style={[styles.sliderImgBContainer, { width: `${sliderPos * 100}%` }]}>
                <Image 
                  source={{ uri: activeComparisonItem.imageUrlB }} 
                  style={[styles.sliderImgB, { width: containerWidth }]} 
                />
              </View>

              {/* Labels on sides */}
              <View style={[styles.sliderLabelTag, { left: 12, top: 12 }]}>
                <Text style={styles.sliderLabelText}>Style A (Before)</Text>
              </View>
              <View style={[styles.sliderLabelTag, { right: 12, top: 12 }]}>
                <Text style={styles.sliderLabelText}>Style B (After)</Text>
              </View>

              {/* Slider handle/divider */}
              <View style={[styles.sliderDividerLine, { left: `${sliderPos * 100}%` }]}>
                <View style={styles.sliderGlowHandle}>
                  <Ionicons name="swap-horizontal" size={14} color={COLORS.background} />
                </View>
              </View>
            </View>
          )}

          {/* Interactive footer with Winner and Diagnostics details */}
          {activeComparisonItem && (
            <View style={styles.comparisonFooterContainer}>
              <Text style={styles.footerInstructionText}>
                ← Slide horizontal bar to compare structural differences →
              </Text>
              
              <View style={styles.winnerRibbonRow}>
                <Ionicons name="trophy" size={14} color="#D4AF37" style={{ marginRight: 6 }} />
                <Text style={styles.winnerRibbonText}>
                  AI Choice Winner: {activeComparisonItem.winner}
                </Text>
              </View>

              <View style={styles.comparisonDiagnosticsCard}>
                <Text style={styles.diagnosticsHeading}>AI COMPARATIVE DIAGNOSTICS</Text>
                <Text style={styles.diagnosticsFeedback}>{activeComparisonItem.aiFeedback}</Text>
              </View>
            </View>
          )}
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
    paddingTop: 50,
    paddingBottom: 110,
  },
  headerTelemetryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  metaLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: COLORS.secondary,
    letterSpacing: 1.5,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: 4,
  },
  telemetryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 212, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.25)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  telemetryBadgeText: {
    color: COLORS.secondary,
    fontWeight: 'bold',
    fontSize: 12,
    marginLeft: 6,
  },

  // TABS ROW BAR
  tabRowOuter: {
    width: '100%',
    marginBottom: 20,
    backgroundColor: 'rgba(18, 18, 26, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 4,
    position: 'relative',
  },
  tabRow: {
    flexDirection: 'row',
    width: '100%',
    height: 38,
    position: 'relative',
  },
  animatedTabPill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 212, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.15)',
    borderRadius: 12,
    zIndex: 1,
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  tabItemText: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: 'bold',
  },
  activeTabItemText: {
    color: COLORS.secondary,
  },

  // SEARCH AND LAYOUT FILTERS BAR
  filtersBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchBarContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 38,
    marginRight: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 12,
  },
  layoutToggleBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 10,
    padding: 2,
  },
  toggleBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeToggleBtn: {
    backgroundColor: COLORS.secondary,
  },

  // SORT BAR
  sortSelectorBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sortLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    letterSpacing: 1.5,
    marginRight: 8,
  },
  sortScroll: {
    flexDirection: 'row',
  },
  sortChip: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginRight: 6,
  },
  activeSortChip: {
    borderColor: COLORS.secondary,
    backgroundColor: 'rgba(0, 212, 255, 0.05)',
  },
  sortChipText: {
    color: COLORS.textSecondary,
    fontSize: 9,
  },
  activeSortChipText: {
    color: COLORS.secondary,
    fontWeight: 'bold',
  },

  // GRID CARD WORKSPACE
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeading: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  sectionMeta: {
    fontSize: 10,
    color: COLORS.secondary,
    fontWeight: 'bold',
  },
  collectionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  collectionGridCard: {
    width: '48%',
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    position: 'relative',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  colCoverImg: {
    width: '100%',
    height: '60%',
    resizeMode: 'cover',
  },
  glassColCardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '55%',
    backgroundColor: 'rgba(18, 18, 26, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    padding: 10,
  },
  colCardTitle: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  colCardMeta: {
    color: COLORS.textSecondary,
    fontSize: 8,
    marginTop: 2,
  },
  thumbMiniGrid: {
    flexDirection: 'row',
    marginTop: 8,
  },
  thumbMini: {
    width: 20,
    height: 20,
    borderRadius: 4,
    marginRight: 4,
  },
  colFitBadge: {
    position: 'absolute',
    top: -10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 1.5,
  },
  colFitBadgeText: {
    color: COLORS.background,
    fontSize: 7,
    fontWeight: 'bold',
    marginLeft: 2,
  },

  // LIST CARD WORKSPACE
  collectionsListContainer: {
    marginBottom: 16,
  },
  collectionListCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
    padding: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  colListCoverImg: {
    width: 64,
    height: 64,
    borderRadius: 12,
  },
  colListDetails: {
    flex: 1,
    marginLeft: 12,
  },
  colListTitle: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: 'bold',
  },
  colListSub: {
    color: COLORS.textSecondary,
    fontSize: 9,
    marginTop: 2,
  },
  colListHorizontalThumbs: {
    flexDirection: 'row',
    marginTop: 6,
  },
  listThumbMini: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 4,
  },
  listMatchBadge: {
    backgroundColor: 'rgba(0, 212, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.2)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  listMatchBadgeText: {
    color: COLORS.secondary,
    fontSize: 9,
    fontWeight: 'bold',
  },

  // BUTTON
  createNewFolderBtn: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.secondary,
    borderStyle: 'dashed',
    paddingVertical: 14,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  createNewFolderText: {
    color: COLORS.secondary,
    fontWeight: 'bold',
    fontSize: 13,
    marginLeft: 8,
  },

  // DYNAMIC FAVORITES CARD WORKSPACE
  favCardOuter: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
    marginBottom: 12,
    overflow: 'hidden',
  },
  activeFavCardBorder: {
    borderColor: COLORS.secondary,
    borderWidth: 1.5,
  },
  favCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  favThumb: {
    width: 52,
    height: 52,
    borderRadius: 10,
  },
  favInfo: {
    flex: 1,
    marginLeft: 12,
  },
  favName: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: 'bold',
  },
  favMeta: {
    color: COLORS.textSecondary,
    fontSize: 10,
    marginTop: 2,
  },
  favDate: {
    color: COLORS.textSecondary,
    fontSize: 8,
    marginTop: 4,
  },
  favBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  favFitBadge: {
    backgroundColor: 'rgba(0, 212, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.2)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  favFitText: {
    color: COLORS.secondary,
    fontSize: 9,
    fontWeight: 'bold',
  },
  
  // EXPANDABLE PREMIUM ACTION TOOLBAR
  expandableToolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    padding: 8,
  },
  toolbarBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.01)',
    marginHorizontal: 3,
  },
  toolbarBtnText: {
    color: COLORS.textPrimary,
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
  },

  // DYNAMIC HISTORY TAB
  analyticsCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,212,255,0.15)',
    padding: 14,
    marginBottom: 20,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  analyticsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  analyticsTitle: {
    color: COLORS.secondary,
    fontWeight: 'bold',
    fontSize: 11,
    letterSpacing: 0.5,
    marginLeft: 6,
  },
  analyticsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  analyticsCol: {
    flex: 1,
    alignItems: 'center',
  },
  analyticsColDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  analyticsLabelText: {
    color: COLORS.textSecondary,
    fontSize: 9,
  },
  analyticsValue: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 4,
  },

  // VERTICAL ACTIVITY CONNECTOR TRACK TIMELINE
  timelineContainer: {
    backgroundColor: 'rgba(18, 18, 26, 0.4)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
    padding: 16,
    marginTop: 10,
    marginBottom: 20,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineTrackLineCol: {
    alignItems: 'center',
    width: 24,
  },
  timelineIndicatorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  verticalTrackerConnectorLine: {
    width: 1.5,
    backgroundColor: 'rgba(0, 212, 255, 0.25)',
    flex: 1,
    marginTop: 2,
    marginBottom: -16,
  },
  timelineContent: {
    flex: 1,
    marginLeft: 12,
  },
  timelineTimeText: {
    color: COLORS.secondary,
    fontSize: 8,
    fontWeight: 'bold',
  },
  timelineEventText: {
    color: COLORS.textPrimary,
    fontSize: 11,
    marginTop: 2,
  },

  // COMPARISONS CARD LIST
  compCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
    overflow: 'hidden',
    marginBottom: 12,
  },
  compImagesRow: {
    flexDirection: 'row',
    height: 120,
  },
  compHalfImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  compDetails: {
    padding: 12,
  },
  compTitle: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: 'bold',
  },
  compDate: {
    color: COLORS.textSecondary,
    fontSize: 9,
    marginTop: 2,
    marginBottom: 10,
  },
  continueTryBtn: {
    flexDirection: 'row',
    backgroundColor: COLORS.secondary,
    paddingVertical: 10,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueTryText: {
    color: COLORS.background,
    fontSize: 11,
    fontWeight: 'bold',
    marginLeft: 6,
  },

  // FAVORITES CARD AND SIMPLE FEED
  simpleListContainer: {
    flex: 1,
  },
  emptyFeed: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    padding: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyFeedText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 8,
  },
  exportBadge: {
    backgroundColor: '#D4AF37',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  exportBadgeText: {
    color: COLORS.background,
    fontSize: 8,
    fontWeight: 'bold',
  },

  // GLASSMORPHIC SUB-SEGMENTED CONTROL
  subTabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 3,
    marginBottom: 20,
  },
  subTabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 9,
  },
  activeSubTabItem: {
    backgroundColor: COLORS.secondary,
  },
  subTabText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  activeSubTabText: {
    color: COLORS.background,
  },

  // SWIPE ACTIONS DRAWER OUTER AND FOREGROUND
  swipeOuterContainer: {
    position: 'relative',
    height: 78,
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  swipeBackgroundActions: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 162,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    zIndex: 1,
  },
  swipeActionBtn: {
    width: 54,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,255,255,0.05)',
  },
  swipeActionText: {
    fontSize: 8,
    fontWeight: 'bold',
    marginTop: 4,
  },
  swipeForegroundCard: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.card,
    zIndex: 2,
  },

  // COLOR SWATCH AND DETAILED ROW METADATA
  colorSwatch: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  favMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  favMetaText: {
    color: COLORS.textSecondary,
    fontSize: 10,
  },
  favTitleRowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  favModelTag: {
    fontSize: 8,
    color: COLORS.secondary,
    fontWeight: 'bold',
    backgroundColor: 'rgba(0, 212, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.2)',
    paddingVertical: 1,
    paddingHorizontal: 4,
    borderRadius: 4,
    marginRight: 10,
  },

  // NEON TELEMETRY PROGRESS BARS
  miniProgressBar: {
    width: '75%',
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 1.5,
    marginTop: 6,
    overflow: 'hidden',
  },
  miniProgressFill: {
    height: '100%',
    backgroundColor: COLORS.secondary,
    borderRadius: 1.5,
  },

  // DYNAMIC MOODBOARD COLLAGE COVERS
  moodboardCoverContainer: {
    width: '100%',
    height: '60%',
    flexDirection: 'row',
    backgroundColor: '#0F0F15',
    overflow: 'hidden',
  },
  moodboardMainCol: {
    width: '60%',
    height: '100%',
  },
  moodboardMainImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  moodboardSideColumn: {
    width: '40%',
    height: '100%',
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,255,255,0.08)',
  },
  moodboardSideImg: {
    width: '100%',
    height: '50%',
    resizeMode: 'cover',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  moodboardCoverPlaceholder: {
    width: '100%',
    height: '60%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  placeholderCoverText: {
    color: COLORS.textSecondary,
    fontSize: 9,
    fontWeight: 'bold',
    marginTop: 6,
    letterSpacing: 0.5,
  },
  moodboardCoverRow: {
    width: '100%',
    height: '60%',
    flexDirection: 'row',
  },
  moodboardCoverSplit: {
    flex: 1,
    height: '100%',
    resizeMode: 'cover',
  },

  // LIST MOODBOARD COVER WRAPPER
  listMoodboardCoverWrapper: {
    width: 64,
    height: 64,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },

  // TELEMETRY SENSORS & OPTIONS ON CARD
  colCardOptionsBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(18, 18, 26, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  colCardSyncBtn: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(18, 18, 26, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  colCardCategoryText: {
    color: COLORS.secondary,
    fontSize: 8,
    fontWeight: 'bold',
    marginTop: 4,
  },

  // LIST CARD ADJUSTMENTS
  colListCategory: {
    color: COLORS.secondary,
    fontSize: 9,
    fontWeight: 'bold',
    marginTop: 3,
  },
  listRightActionRow: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 64,
  },
  listIconButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  listIconButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },

  // REORDER ARRANGEMENT ENGINE
  reorderLayoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 212, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.2)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  reorderLayoutBtnActive: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  reorderLayoutText: {
    color: COLORS.secondary,
    fontSize: 9,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  reorderLayoutTextActive: {
    color: COLORS.background,
  },
  reorderSwapOverlay: {
    position: 'absolute',
    right: 10,
    bottom: '50%',
    transform: [{ translateY: 15 }],
    backgroundColor: 'rgba(18,18,26,0.95)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 3,
    zIndex: 20,
    flexDirection: 'row',
  },
  reorderSwapBtn: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
  },
  reorderSwapBtnDisabled: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  reorderListControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },

  // FLOATING ACTION BUTTON (FAB)
  floatingFabBtn: {
    position: 'absolute',
    bottom: 95,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    zIndex: 99,
  },

  // AI SMART FOLDER SUGGESTIONS
  aiSuggestionBanner: {
    backgroundColor: 'rgba(18,18,26,0.9)',
    borderWidth: 1,
    borderColor: 'rgba(0,212,255,0.15)',
    borderRadius: 16,
    padding: 12,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  aiSuggestionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  aiSuggestionIcon: {
    marginRight: 10,
  },
  aiSuggestionTitle: {
    color: COLORS.secondary,
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  aiSuggestionText: {
    color: COLORS.textPrimary,
    fontSize: 10,
    marginTop: 2,
  },
  aiSuggestionActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiSuggestionBtn: {
    backgroundColor: COLORS.secondary,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginRight: 6,
  },
  aiSuggestionBtnText: {
    color: COLORS.background,
    fontSize: 9,
    fontWeight: 'bold',
  },
  aiSuggestionDismiss: {
    padding: 4,
  },

  // STANDARD MODAL POPUPS (CREATE COLLECTION)
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  glassModalContainer: {
    width: '100%',
    backgroundColor: 'rgba(18, 18, 26, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 24,
    padding: 20,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    paddingBottom: 10,
  },
  modalTitle: {
    color: COLORS.textPrimary,
    fontWeight: 'bold',
    fontSize: 13,
    letterSpacing: 1,
  },
  modalInputLabel: {
    color: COLORS.secondary,
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 10,
  },
  modalInput: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    color: COLORS.textPrimary,
    fontSize: 12,
    paddingHorizontal: 12,
    height: 42,
    marginBottom: 10,
  },
  themePickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  themeChip: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginRight: 6,
    marginBottom: 6,
  },
  themeChipActive: {
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    borderColor: COLORS.secondary,
  },
  themeChipText: {
    color: COLORS.textSecondary,
    fontSize: 9,
  },
  themeChipTextActive: {
    color: COLORS.secondary,
    fontWeight: 'bold',
  },
  modalSubmitBtn: {
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
    height: 44,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSubmitBtnText: {
    color: COLORS.background,
    fontWeight: 'bold',
    fontSize: 12,
    marginLeft: 6,
  },

  // FULL SCREEN PREVIEW MODAL
  fullscreenModalOverlay: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  fullscreenModalContainer: {
    flex: 1,
    position: 'relative',
  },
  fullscreenModalCoverWrapper: {
    width: '100%',
    height: '25%',
    position: 'relative',
  },
  fullscreenModalCoverOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(10, 10, 12, 0.65)',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 45,
  },
  fullscreenModalHeaderActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalCloseCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(10, 10, 12, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  syncIndicatorHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 211, 153, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.2)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  syncHeaderStatusText: {
    color: '#34D399',
    fontSize: 8,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  fullscreenTitleRow: {
    marginBottom: 5,
  },
  fullscreenColName: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: 'bold',
  },
  fullscreenColMeta: {
    color: COLORS.secondary,
    fontSize: 9,
    fontWeight: 'bold',
    marginTop: 2,
  },
  fullscreenContentContainer: {
    flex: 1,
    padding: 16,
  },
  fullscreenOpsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  opsHeaderTitle: {
    color: COLORS.textSecondary,
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  batchEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 212, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.2)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  batchEditBtnActive: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  batchEditText: {
    color: COLORS.secondary,
    fontSize: 8,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  batchEditTextActive: {
    color: COLORS.background,
  },
  emptyMoodboardInner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    backgroundColor: 'rgba(255,255,255,0.01)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
    borderRadius: 20,
    marginTop: 10,
    marginBottom: 20,
  },
  emptyMoodboardText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 12,
  },
  emptyMoodboardSub: {
    color: COLORS.textSecondary,
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
  },
  moodboardScroll: {
    flex: 1,
  },
  moodboardScrollContent: {
    paddingBottom: 80,
  },
  previewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  previewGridCard: {
    width: '48%',
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    position: 'relative',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  previewGridCardChecked: {
    borderColor: COLORS.secondary,
    borderWidth: 1.5,
  },
  previewCardImg: {
    width: '100%',
    height: '65%',
    resizeMode: 'cover',
  },
  selectCheckbox: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(10,10,12,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  selectCheckboxChecked: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  previewCardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '35%',
    backgroundColor: '#121217',
    padding: 8,
    justifyContent: 'center',
  },
  previewCardTitle: {
    color: COLORS.textPrimary,
    fontSize: 10,
    fontWeight: 'bold',
  },
  previewCardMeta: {
    color: COLORS.textSecondary,
    fontSize: 8,
    marginTop: 1,
  },
  previewCardFitRow: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    backgroundColor: 'rgba(0, 212, 255, 0.08)',
    borderWidth: 0.5,
    borderColor: 'rgba(0, 212, 255, 0.2)',
    paddingVertical: 1,
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  previewCardFitText: {
    color: COLORS.secondary,
    fontSize: 7,
    fontWeight: 'bold',
  },
  batchActionsBottomToolbar: {
    position: 'absolute',
    bottom: 25,
    left: 16,
    right: 16,
    height: 52,
    backgroundColor: 'rgba(18,18,26,0.95)',
    borderWidth: 1,
    borderColor: 'rgba(0,212,255,0.2)',
    borderRadius: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 99,
  },
  batchCountCol: {
    flex: 1,
  },
  batchCountText: {
    color: COLORS.textPrimary,
    fontSize: 11,
    fontWeight: 'bold',
  },
  batchActionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  batchActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginLeft: 8,
  },
  batchActionBtnText: {
    fontSize: 9,
    fontWeight: 'bold',
    marginLeft: 4,
  },

  // CONTEXT OPTIONS SHEET DRAWER
  drawerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  drawerDismissArea: {
    flex: 1,
  },
  drawerContainer: {
    backgroundColor: 'rgba(18, 18, 26, 0.98)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 25,
  },
  drawerHandle: {
    width: 36,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  drawerHeaderTitle: {
    color: COLORS.secondary,
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  drawerCollectionName: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
    marginBottom: 16,
  },
  drawerRenameRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  drawerInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 10,
    color: COLORS.textPrimary,
    fontSize: 12,
    paddingHorizontal: 12,
    height: 38,
    marginRight: 8,
  },
  drawerRenameSubmitBtn: {
    backgroundColor: COLORS.secondary,
    borderRadius: 10,
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  drawerRenameSubmitText: {
    color: COLORS.background,
    fontSize: 10,
    fontWeight: 'bold',
  },
  drawerOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  drawerOptionText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    marginLeft: 12,
  },
  drawerCancelBtn: {
    marginTop: 20,
    height: 42,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  drawerCancelText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: 'bold',
  },

  // === AI PREMIUM COMPARISON SYSTEM ===
  compCardOuter: {
    marginBottom: 16,
  },
  compHalfContainer: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  compTagBadge: {
    position: 'absolute',
    top: 8,
    backgroundColor: 'rgba(10, 10, 15, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  compTagBadgeText: {
    color: COLORS.textPrimary,
    fontSize: 8,
    fontWeight: 'bold',
  },
  compHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  winnerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  winnerLabelText: {
    color: '#D4AF37',
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  winnerValueText: {
    color: COLORS.textPrimary,
    fontSize: 11,
    fontWeight: 'bold',
  },
  aiDifferencesCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  aiDiffIcon: {
    marginTop: 2,
    marginRight: 6,
  },
  aiDiffText: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: 10,
    lineHeight: 14,
  },
  reopenCompBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    paddingVertical: 10,
    borderRadius: 10,
  },
  reopenCompBtnText: {
    color: COLORS.background,
    fontSize: 11,
    fontWeight: 'bold',
    marginLeft: 6,
  },

  // === EXPORTS STORAGE & TELEMETRY SYSTEMS ===
  storageCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  storageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  storageTitle: {
    color: COLORS.textPrimary,
    fontSize: 11,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  storageUsedText: {
    color: COLORS.secondary,
    fontSize: 10,
    fontWeight: 'bold',
  },
  storageBarOuter: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  storageBarFill: {
    height: '100%',
    backgroundColor: COLORS.secondary,
    borderRadius: 3,
  },
  cleanupCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  cleanupContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cleanupTitle: {
    color: '#EF4444',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  cleanupText: {
    color: COLORS.textSecondary,
    fontSize: 10,
    lineHeight: 14,
  },
  cleanupActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  cleanupSubmitBtn: {
    backgroundColor: '#EF4444',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 10,
  },
  cleanupSubmitText: {
    color: COLORS.textPrimary,
    fontSize: 9,
    fontWeight: 'bold',
  },
  cleanupDismissBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    padding: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  exportAnalyticsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
  },
  exportMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 4,
  },
  exportMetaText: {
    color: COLORS.textSecondary,
    fontSize: 9,
  },
  watermarkStatusText: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  watermarkedLabel: {
    color: '#D4AF37',
  },
  watermarkCleanLabel: {
    color: '#10B981',
  },

  // === INTERACTIVE SPLIT SLIDER DRAWER ===
  comparisonContainerContainer: {
    flex: 1,
    backgroundColor: 'rgba(10, 10, 12, 0.98)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  comparisonModalContent: {
    width: '100%',
    flex: 1,
    justifyContent: 'center',
  },
  comparisonTitleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  comparisonMetaHeader: {
    color: COLORS.secondary,
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 2,
  },
  comparisonTitleText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  comparisonCloseCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  interactiveSliderBox: {
    width: '100%',
    height: 340,
    backgroundColor: COLORS.card,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    position: 'relative',
  },
  sliderImgA: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  sliderImgBContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  sliderImgB: {
    height: '100%',
    resizeMode: 'cover',
  },
  sliderLabelTag: {
    position: 'absolute',
    backgroundColor: 'rgba(10, 10, 15, 0.8)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  sliderLabelText: {
    color: COLORS.textPrimary,
    fontSize: 9,
    fontWeight: 'bold',
  },
  sliderDividerLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: COLORS.secondary,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderGlowHandle: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 10,
  },
  comparisonFooterContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  footerInstructionText: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  winnerRibbonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  winnerRibbonText: {
    color: '#D4AF37',
    fontSize: 12,
    fontWeight: 'bold',
  },
  comparisonDiagnosticsCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 14,
  },
  diagnosticsHeading: {
    color: COLORS.secondary,
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  diagnosticsFeedback: {
    color: COLORS.textSecondary,
    fontSize: 11,
    lineHeight: 16,
  },

  // === DYNAMIC EMPTY STATES VISUAL CSS ===
  emptyContainer: {
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 2,
    alignItems: 'center',
  },
  emptyGraphicsBox: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.015)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    marginBottom: 16,
  },
  emptyIconGlow: {
    marginBottom: 12,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
  },
  emptyHeadlineText: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  emptyDescText: {
    color: COLORS.textSecondary,
    fontSize: 10,
    lineHeight: 14,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  emptyLaunchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.secondary,
    width: '100%',
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  emptyLaunchBtnText: {
    color: COLORS.background,
    fontSize: 11,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  emptyRecsSection: {
    width: '100%',
    marginBottom: 10,
  },
  emptyRecsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  emptyRecsTitle: {
    color: COLORS.secondary,
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 0.8,
    marginLeft: 6,
  },
  emptyRecsScroll: {
    paddingRight: 10,
  },
  emptyRecCard: {
    width: 130,
    height: 130,
    borderRadius: 14,
    overflow: 'hidden',
    marginRight: 10,
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  emptyRecCardThumb: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  emptyRecCardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(10, 10, 15, 0.85)',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  emptyRecCardName: {
    color: COLORS.textPrimary,
    fontSize: 9,
    fontWeight: 'bold',
  },
  emptyRecCardMeta: {
    color: COLORS.secondary,
    fontSize: 7,
    marginTop: 2,
  },

  // === ONBOARDING TIPS CORNER CSS ===
  onboardingTipsCardOuter: {
    width: '100%',
    marginBottom: 16,
  },
  onboardingTipsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 212, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.2)',
    borderRadius: 16,
    padding: 12,
  },
  onboardingTipsHeader: {
    color: COLORS.secondary,
    fontSize: 8,
    fontWeight: 'bold',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  onboardingTipsText: {
    color: COLORS.textPrimary,
    fontSize: 10,
    lineHeight: 14,
  },
  onboardingTipsNextBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },

  // === HIGH-FIDELITY PULSING SKELETON CSS ===
  skeletonContainer: {
    width: '100%',
    paddingVertical: 10,
  },
  skeletonCardOuter: {
    width: '100%',
    marginBottom: 12,
  },
  skeletonCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
  },
  skeletonThumb: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  skeletonInfo: {
    flex: 1,
    marginLeft: 12,
  },
  skeletonTextLineLong: {
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 5,
    width: '80%',
    marginBottom: 6,
  },
  skeletonTextLineShort: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 4,
    width: '40%',
  },
  skeletonTextLineMedium: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 4,
    width: '60%',
    marginBottom: 6,
  },
  skeletonCompCard: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  skeletonCompImages: {
    flexDirection: 'row',
    height: 120,
  },
  skeletonCompHalf: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginHorizontal: 1,
  },
  skeletonStorageCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  skeletonGridCard: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  skeletonGridCover: {
    height: 100,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
});
