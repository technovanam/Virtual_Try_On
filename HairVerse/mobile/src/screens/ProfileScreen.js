import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  Modal, 
  TextInput, 
  Animated, 
  Easing, 
  LayoutAnimation, 
  Platform, 
  UIManager,
  Alert,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { useAuthStore } from '../store/authStore';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width: contentWidth } = Dimensions.get('window');

// ─── Premium Plan Config ───────────────────────────────────────────────────────
const PLAN_BENEFITS = {
  pro: [
    { icon: 'sparkles',           label: 'AI Neural Analysis',      detail: 'Full 360° follicular scan' },
    { icon: 'cloud-download',     label: '4K HD Export',            detail: 'Lossless render output' },
    { icon: 'git-compare',        label: 'Unlimited A/B Compares',  detail: 'Side-by-side style matching' },
    { icon: 'color-palette',      label: 'Premium Rendering',       detail: 'Advanced ray-trace engine' },
    { icon: 'sync',               label: 'Cyber-Cloud Backup',      detail: 'Auto-sync all profiles' },
    { icon: 'shield-checkmark',   label: 'Watermark-Free Exports',  detail: 'Clean outputs, no branding' },
  ],
  free: [
    { icon: 'scan-outline',       label: 'Basic Face Scan',         detail: 'Standard resolution scan' },
    { icon: 'image-outline',      label: '1080p Export',            detail: 'Standard quality export' },
    { icon: 'git-compare-outline',label: '3 Comparisons/Month',     detail: 'Limited A/B style tests' },
    { icon: 'lock-closed-outline',label: 'Standard Rendering',      detail: 'Basic quality render' },
  ],
};

// ─── Style Personality Data ─────────────────────────────────────────────────────
const STYLE_PERSONALITIES = [
  { key: 'trendy_minimalist',    label: 'Trendy Minimalist',      icon: 'remove-circle',  color: '#00D4FF', desc: 'Clean cuts, precision fades, and structured crops define your aesthetic. You prefer timeless over trendy.' },
  { key: 'korean_style_lover',   label: 'Korean Style Lover',     icon: 'heart',          color: '#FF6B9D', desc: 'Curtain fringes, soft waves, and effortlessly textured two-blocks resonate deeply with your style compass.' },
  { key: 'professional_modern',  label: 'Professional Modern',    icon: 'briefcase',      color: '#7C5CFC', desc: 'Structured side parts, clean tapers, and polished pompadours align with your sharp professional edge.' },
  { key: 'bold_experimentalist', label: 'Bold Experimentalist',   icon: 'flash',          color: '#FFD740', desc: 'High contrast undercuts, vivid colors, and avant-garde texture play — you push the limits of style.' },
  { key: 'classic_traditionalist',label:'Classic Traditionalist',  icon: 'ribbon',         color: '#00E676', desc: 'Time-honored cuts, natural textures, and refined pomades mirror your appreciation for timeless elegance.' },
];

// ─── Trend Recommendations Data ────────────────────────────────────────────────
const TREND_CATALOG = {
  'Curly Textures': [
    { name: 'Textured Curly Shag',   match: 97, trend: '+18%', icon: 'trending-up',  color: '#00D4FF' },
    { name: 'Soft Curly Taper',      match: 94, trend: '+12%', icon: 'trending-up',  color: '#00E676' },
    { name: 'Defined Curl Fade',     match: 91, trend: '+9%',  icon: 'trending-up',  color: '#7C5CFC' },
  ],
  'Classic Fades': [
    { name: 'Sleek Undercut',        match: 95, trend: '+14%', icon: 'trending-up',  color: '#00D4FF' },
    { name: 'Low Fade Pompadour',    match: 92, trend: '+11%', icon: 'trending-up',  color: '#FFD740' },
    { name: 'Taper Fade Comb-Over',  match: 89, trend: '+8%',  icon: 'trending-up',  color: '#7C5CFC' },
  ],
  'Wavy Sweeps': [
    { name: 'Messy Curtain Bang',    match: 96, trend: '+22%', icon: 'trending-up',  color: '#FF6B9D' },
    { name: 'Casual Wave Side Part', match: 93, trend: '+15%', icon: 'trending-up',  color: '#00D4FF' },
    { name: 'Textured Fringe Flow',  match: 90, trend: '+10%', icon: 'trending-up',  color: '#00E676' },
  ],
  'Textured Undercut': [
    { name: 'Disconnected Undercut', match: 98, trend: '+25%', icon: 'trending-up',  color: '#FFD740' },
    { name: 'Textured Quiff Fade',   match: 95, trend: '+18%', icon: 'trending-up',  color: '#7C5CFC' },
    { name: 'High Fade Crop Top',    match: 92, trend: '+14%', icon: 'trending-up',  color: '#00D4FF' },
  ],
};

// ─── AI Future Recommendations ─────────────────────────────────────────────────
const AI_FUTURE_RECS = {
  'profile_1': [
    { title: 'Curly Wolf Cut',         when: 'This Season',  match: 96, reason: 'Oval face + thick curls = perfect volume distribution', color: '#00D4FF' },
    { title: 'French Crop with Fade',  when: 'Next Month',   match: 93, reason: 'Rising trend in your age group, matches face width', color: '#7C5CFC' },
    { title: 'Textured Mohawk Fade',   when: 'Summer 2026',  match: 89, reason: 'Bold seasonal trend matching your style interaction history', color: '#FFD740' },
  ],
  'profile_2': [
    { title: 'Clean Undercut',         when: 'This Week',    match: 95, reason: 'Square jaw angles perfectly frame undercut transitions', color: '#00E676' },
    { title: 'Low Fade Side Part',     when: 'This Month',   match: 91, reason: 'Straight texture and square shape = classic symmetry', color: '#00D4FF' },
    { title: 'Pompadour Fade',         when: 'Next Season',  match: 87, reason: 'Volume adds height balance to strong jaw structure', color: '#FF6B9D' },
  ],
  'profile_3': [
    { title: 'Messy Curtain Fringe',   when: 'Trending Now', match: 97, reason: 'Heart face shape + wavy texture = ideal curtain match', color: '#FF6B9D' },
    { title: 'Layered Wavy Flow',      when: 'This Season',  match: 94, reason: 'Fine density benefits from layer-based volume illusion', color: '#00D4FF' },
    { title: 'Soft Textured Perm',     when: 'Summer 2026',  match: 90, reason: 'AI projects 34% rise in perm styles for Heart faces', color: '#7C5CFC' },
  ],
};

// ─── Favorite Category Pool ─────────────────────────────────────────────────────
const CATEGORY_POOL = [
  { key: 'Curly Textures',    icon: 'water',          color: '#00D4FF' },
  { key: 'Classic Fades',     icon: 'cut',            color: '#7C5CFC' },
  { key: 'Wavy Sweeps',       icon: 'trending-up',    color: '#FF6B9D' },
  { key: 'Textured Undercut', icon: 'flash',          color: '#FFD740' },
  { key: 'Pompadours',        icon: 'arrow-up',       color: '#00E676' },
  { key: 'Korean Two-Block',  icon: 'heart',          color: '#FF6B9D' },
  { key: 'Buzz Cuts',         icon: 'remove-circle',  color: COLORS.textSecondary },
  { key: 'Curtain Bangs',     icon: 'reorder-three',  color: '#7C5CFC' },
];

// Seed presets for dynamic face profiles
const INITIAL_FACE_PROFILES = [
  {
    id: 'profile_1',
    name: 'John Doe (Active Scan)',
    role: 'Primary Active',
    faceShape: 'Oval Face',
    hairTexture: 'Curly Hair',
    hairDensity: 'Thick Density',
    beardStatus: 'Beard Compatible',
    joinedDate: 'May 12, 2026',
    email: 'john.doe@example.com',
    subscription: 'PRO Premium Member',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop',
    symmetryScore: '94.6%',
    arMirrorTime: '2.4 Hours',
    faceScanWidth: '16.4 cm',
    hairHealth: 'Optimal',
    scalpVisibility: 'Minimum',
    shineLevel: 'High Gloss',
    hairHealthScore: 92,
    styleCompatScore: 95,
    aiConfidence: 98,
    aiInsights: [
      "Curly styles suit your Oval face shape best, generating natural volume.",
      "Low fade improves jawline balance by 12% under diagnostic guidelines.",
      "Scalp diagnostic scans show high follicular root thickness and density."
    ],
    totalTryOns: 48,
    savedHairstyles: 14,
    favCategory: 'Curly Textures',
    totalComparisons: 12,
    exportedStyles: 8,
    aiAccuracyRating: '98.6%',
    neuralCyclesSynced: 1240,
    aiRecommendationInteraction: '85.4% Action Rate',
    mostTriedCategory: 'Textured Undercut',
    favBeardStyle: 'Fade Beard',
    favColorName: 'Black',
    favColorHex: '#0A0A0B',
    weeklyHairstyleUsage: [8, 14, 5, 12, 19, 7, 10],
    monthlyHairstyleUsage: [38, 54, 42, 60],
    recentActivityTimeline: [
      { id: 'act_1', time: '10m ago', icon: 'scan-outline', title: 'AR Face Mesh recalibrated', desc: 'Follicular health parameters updated (+1.2%)' },
      { id: 'act_2', time: '1h ago', icon: 'git-compare-outline', title: 'A/B Hairstyle comparison generated', desc: 'Compared Textured Shag vs Mid-Fade Comb-Over' },
      { id: 'act_3', time: '3h ago', icon: 'cloud-download-outline', title: '4K HD Rendered Portrait exported', desc: 'Saved to local device album (Watermark bypassed)' },
    ],
    recentlyTried: [
      { id: 'rt_1', name: 'Textured Shag', match: '96%', color: 'Black', colorHex: '#0A0A0B', imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop' },
      { id: 'rt_2', name: 'Curly Undercut', match: '93%', color: 'Silver', colorHex: '#BEC3C9', imageUrl: 'https://images.unsplash.com/photo-1605497746444-ac9dbd39f4a5?w=150&h=150&fit=crop' },
      { id: 'rt_3', name: 'Classic Pompadour', match: '90%', color: 'Burgundy', colorHex: '#7D0A2C', imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop' }
    ]
  },
  {
    id: 'profile_2',
    name: 'Liam (Client scan)',
    role: 'Guest Scan Log',
    faceShape: 'Square Face',
    hairTexture: 'Straight Hair',
    hairDensity: 'Medium Density',
    beardStatus: 'Clean Shave',
    joinedDate: 'May 20, 2026',
    email: 'liam.styles@gmail.com',
    subscription: 'Free Guest Tier',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop',
    symmetryScore: '91.2%',
    arMirrorTime: '0.8 Hours',
    faceScanWidth: '17.2 cm',
    hairHealth: 'Excellent',
    scalpVisibility: 'Low',
    shineLevel: 'Optimal',
    hairHealthScore: 88,
    styleCompatScore: 90,
    aiConfidence: 96,
    aiInsights: [
      "Straight hair structures square jawlines cleanly, framing facial corners.",
      "Classic undercuts and structured parts optimize vertical symmetry indexes.",
      "Scalp diagnostics highlight standard density profile and low follicle fatigue."
    ],
    totalTryOns: 24,
    savedHairstyles: 6,
    favCategory: 'Classic Fades',
    totalComparisons: 5,
    exportedStyles: 2,
    aiAccuracyRating: '95.2%',
    neuralCyclesSynced: 680,
    aiRecommendationInteraction: '72.1% Action Rate',
    mostTriedCategory: 'Sleek Low Part',
    favBeardStyle: 'Clean Shave',
    favColorName: 'Brown',
    favColorHex: '#5C4033',
    weeklyHairstyleUsage: [3, 6, 2, 8, 4, 1, 5],
    monthlyHairstyleUsage: [18, 22, 15, 24],
    recentActivityTimeline: [
      { id: 'act_1', time: '2h ago', icon: 'heart-outline', title: 'Sleek Comb-Over favorited', desc: 'Saved to "Office Looks" smart collection' },
      { id: 'act_2', time: 'Yesterday', icon: 'sync-outline', title: 'Guest profile parameters compiled', desc: 'Sync complete via Cyber-Cloud database' }
    ],
    recentlyTried: [
      { id: 'rt_1', name: 'Sleek Low Parting', match: '94%', color: 'Brown', colorHex: '#5C4033', imageUrl: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=150&h=150&fit=crop' },
      { id: 'rt_2', name: 'Textured Fringe', match: '90%', color: 'Black', colorHex: '#0A0A0B', imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop' }
    ]
  },
  {
    id: 'profile_3',
    name: 'Clean Shaven Alt',
    role: 'Alternate Scan',
    faceShape: 'Heart Face',
    hairTexture: 'Wavy Hair',
    hairDensity: 'Fine Density',
    beardStatus: 'Clean Shave',
    joinedDate: 'May 25, 2026',
    email: 'john.doe.alt@example.com',
    subscription: 'PRO Premium Member',
    avatarUrl: 'https://images.unsplash.com/photo-1605497746444-ac9dbd39f4a5?w=150&h=150&fit=crop',
    symmetryScore: '93.1%',
    arMirrorTime: '1.5 Hours',
    faceScanWidth: '15.8 cm',
    hairHealth: 'Good',
    scalpVisibility: 'Standard',
    shineLevel: 'Satin',
    hairHealthScore: 78,
    styleCompatScore: 84,
    aiConfidence: 94,
    aiInsights: [
      "Wavy curls perfectly balance narrow tapered chins, adding horizontal sweeps.",
      "Mid-length curtain sweeps provide width to balance prominent cheek structures.",
      "Follicle diagnostic shows normal structural shine rate with minimal strand dryness."
    ],
    totalTryOns: 32,
    savedHairstyles: 9,
    favCategory: 'Wavy Sweeps',
    totalComparisons: 7,
    exportedStyles: 4,
    aiAccuracyRating: '96.8%',
    neuralCyclesSynced: 910,
    aiRecommendationInteraction: '79.2% Action Rate',
    mostTriedCategory: 'Messy Curtain Sweep',
    favBeardStyle: 'Clean Shave',
    favColorName: 'Gold',
    favColorHex: '#D4AF37',
    weeklyHairstyleUsage: [5, 4, 9, 3, 7, 8, 4],
    monthlyHairstyleUsage: [25, 29, 32, 28],
    recentActivityTimeline: [
      { id: 'act_1', time: '1d ago', icon: 'image-outline', title: 'Wavy curtain model rendered', desc: 'Computed in high-resolution 4K canvas' },
      { id: 'act_2', time: '3d ago', icon: 'git-compare-outline', title: 'Facial balance test complete', desc: 'Evaluated cheek structure symmetry ratios' }
    ],
    recentlyTried: [
      { id: 'rt_1', name: 'Messy Curtain Sweep', match: '92%', color: 'Gold', colorHex: '#D4AF37', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop' },
      { id: 'rt_2', name: 'Casual Side Sweep', match: '89%', color: 'Pastel Pink', colorHex: '#FBCFE8', imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop' }
    ]
  }
];

// Presets stock avatar selectors for scan modal
const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&h=150&fit=crop',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop'
];

export default function ProfileScreen({ navigation }) {
  const { user } = useAuthStore();

  // Dynamic Identity States
  const [profilesList, setProfilesList] = useState(INITIAL_FACE_PROFILES);
  const [activeProfileId, setActiveProfileId] = useState('profile_1');
  const [isLoading, setIsLoading] = useState(true);

  // Modals Visibility
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [switcherModalVisible, setSwitcherModalVisible] = useState(false);
  const [addScanModalVisible, setAddScanModalVisible] = useState(false);
  const [guidelineModalVisible, setGuidelineModalVisible] = useState(false);
  const [activeGuideline, setActiveGuideline] = useState(null);

  // AI Insights Scanner Telemetry
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const scannerLineAnim = useRef(new Animated.Value(0)).current;

  // Hairstyle Analytics Segment Toggle
  const [analyticsMode, setAnalyticsMode] = useState('weekly');

  // ── Premium & AI Personalization State ────────────────────────────────────
  const [selectedCategories, setSelectedCategories] = useState(['Curly Textures', 'Textured Undercut']);
  const [aiLearningProgress, setAiLearningProgress] = useState(68);
  const [stylePersonalityIndex, setStylePersonalityIndex] = useState(0);
  const [personalityAnimating, setPersonalityAnimating] = useState(false);

  // Premium Animations
  const premiumGlowAnim   = useRef(new Animated.Value(0)).current;
  const shimmerAnim       = useRef(new Animated.Value(0)).current;
  const personalityFade   = useRef(new Animated.Value(1)).current;
  const learningPulse     = useRef(new Animated.Value(1)).current;
  const trendCardScale    = useRef(new Animated.Value(1)).current;
  const upgradeGlow       = useRef(new Animated.Value(0)).current;

  // ── Phase 1: Avatar ring + meter bar + badge press animations ────────────
  const avatarRingAnim    = useRef(new Animated.Value(0)).current;
  const meterBar1Anim     = useRef(new Animated.Value(0)).current;
  const meterBar2Anim     = useRef(new Animated.Value(0)).current;
  const meterBar3Anim     = useRef(new Animated.Value(0)).current;
  const headerSlideAnim   = useRef(new Animated.Value(-12)).current;
  const headerFadeAnim    = useRef(new Animated.Value(0)).current;
  const greetingSlideAnim = useRef(new Animated.Value(16)).current;
  const greetingFadeAnim  = useRef(new Animated.Value(0)).current;
  const statsStaggerAnims = useRef([0,1,2,3,4,5].map(() => new Animated.Value(0))).current;
  const scanSpinAnim      = useRef(new Animated.Value(0)).current;
  const badgePressAnims   = useRef([0,1,2,3].map(() => new Animated.Value(1))).current;

  // Edit profile form inputs
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editSub, setEditSub] = useState('PRO Premium Member');
  const [editAvatar, setEditAvatar] = useState('');

  // Add face profile form inputs
  const [newName, setNewName] = useState('');
  const [newShape, setNewShape] = useState('Oval Face');
  const [newTexture, setNewTexture] = useState('Curly Hair');
  const [newDensity, setNewDensity] = useState('Thick Density');
  const [newBeard, setNewBeard] = useState('Beard Compatible');
  const [newAvatar, setNewAvatar] = useState(PRESET_AVATARS[0]);

  // Animated configurations
  const skeletonPulse = useRef(new Animated.Value(0.3)).current;
  const profileScale = useRef(new Animated.Value(1)).current;
  const fadeContent = useRef(new Animated.Value(0)).current;

  // Resolve current active face profile parameters
  const activeProfile = profilesList.find(p => p.id === activeProfileId) || profilesList[0];

  // 1. Infinite Pulse timing for skeleton indicators
  useEffect(() => {
    const pulseAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(skeletonPulse, {
          toValue: 0.9,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        }),
        Animated.timing(skeletonPulse, {
          toValue: 0.35,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        })
      ])
    );
    pulseAnim.start();
    return () => pulseAnim.stop();
  }, []);

  // ── Avatar ring slow rotation ─────────────────────────────────────────────
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(avatarRingAnim, {
        toValue: 1,
        duration: 6000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, []);

  // ── Scan-button spin while analyzing ─────────────────────────────────────
  useEffect(() => {
    let spinLoop;
    if (isAnalyzing) {
      scanSpinAnim.setValue(0);
      spinLoop = Animated.loop(
        Animated.timing(scanSpinAnim, { toValue: 1, duration: 700, easing: Easing.linear, useNativeDriver: true })
      );
      spinLoop.start();
    } else {
      scanSpinAnim.setValue(0);
    }
    return () => { if (spinLoop) spinLoop.stop(); };
  }, [isAnalyzing]);

  // ── Premium Glow Loop ─────────────────────────────────────────────────────
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(premiumGlowAnim, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(premiumGlowAnim, { toValue: 0, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  // ── Shimmer sweep for upgrade banner ─────────────────────────────────────
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, { toValue: 1, duration: 1400, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(shimmerAnim, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  // ── Upgrade banner glow pulse ─────────────────────────────────────────────
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(upgradeGlow, { toValue: 1, duration: 1600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(upgradeGlow, { toValue: 0, duration: 1600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  // ── AI Learning progress pulse ────────────────────────────────────────────
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(learningPulse, { toValue: 1.05, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(learningPulse, { toValue: 1.0, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  // ── Cycle style personality cards on profile switch ───────────────────────
  useEffect(() => {
    const idx = activeProfile.id === 'profile_1' ? 0
              : activeProfile.id === 'profile_2' ? 2
              : 1;
    setStylePersonalityIndex(idx);
  }, [activeProfileId]);

  const handleCyclePersonality = () => {
    if (personalityAnimating) return;
    setPersonalityAnimating(true);
    Animated.sequence([
      Animated.timing(personalityFade, { toValue: 0, duration: 180, useNativeDriver: true }),
    ]).start(() => {
      setStylePersonalityIndex(prev => (prev + 1) % STYLE_PERSONALITIES.length);
      Animated.timing(personalityFade, { toValue: 1, duration: 250, useNativeDriver: true }).start();
      setPersonalityAnimating(false);
    });
  };

  const handleBoostAiLearning = () => {
    setAiLearningProgress(prev => {
      const next = prev + Math.round(Math.random() * 5 + 2);
      return next > 98 ? 98 : next;
    });
  };

  const toggleCategory = (cat) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedCategories(prev =>
      prev.includes(cat)
        ? prev.filter(c => c !== cat)
        : [...prev, cat]
    );
  };

  // 2. Simulate cloud fetching delay + staggered entrance animations
  useEffect(() => {
    setIsLoading(true);
    fadeContent.setValue(0);
    headerSlideAnim.setValue(-12);
    headerFadeAnim.setValue(0);
    greetingSlideAnim.setValue(16);
    greetingFadeAnim.setValue(0);
    meterBar1Anim.setValue(0);
    meterBar2Anim.setValue(0);
    meterBar3Anim.setValue(0);
    statsStaggerAnims.forEach(a => a.setValue(0));

    const timer = setTimeout(() => {
      setIsLoading(false);
      // Fade + slide header in
      Animated.parallel([
        Animated.timing(fadeContent, { toValue: 1, duration: 380, useNativeDriver: true }),
        Animated.spring(headerSlideAnim, { toValue: 0, tension: 80, friction: 10, useNativeDriver: true }),
        Animated.timing(headerFadeAnim, { toValue: 1, duration: 320, useNativeDriver: true }),
      ]).start();

      // Greeting slides up with delay
      setTimeout(() => {
        Animated.parallel([
          Animated.spring(greetingSlideAnim, { toValue: 0, tension: 70, friction: 10, useNativeDriver: true }),
          Animated.timing(greetingFadeAnim, { toValue: 1, duration: 280, useNativeDriver: true }),
        ]).start();
      }, 180);

      // Meter bars animate in staggered
      setTimeout(() => {
        Animated.stagger(120, [
          Animated.timing(meterBar1Anim, { toValue: 1, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
          Animated.timing(meterBar2Anim, { toValue: 1, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
          Animated.timing(meterBar3Anim, { toValue: 1, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
        ]).start();
      }, 400);

      // Stat cards stagger in from bottom
      setTimeout(() => {
        Animated.stagger(60, statsStaggerAnims.map(a =>
          Animated.spring(a, { toValue: 1, tension: 70, friction: 10, useNativeDriver: true })
        )).start();
      }, 350);

    }, 820);
    return () => clearTimeout(timer);
  }, [activeProfileId]);

  // --- AI REANALYSIS INFINITE SCANNING EFFECT ---
  useEffect(() => {
    let scannerLoop;
    if (isAnalyzing) {
      scannerLineAnim.setValue(0);
      scannerLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(scannerLineAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true
          }),
          Animated.timing(scannerLineAnim, {
            toValue: 0,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true
          })
        ])
      );
      scannerLoop.start();
    } else {
      scannerLineAnim.setValue(0);
    }
    return () => {
      if (scannerLoop) scannerLoop.stop();
    };
  }, [isAnalyzing]);

  // Re-scan active follicles with live score fluctuation feedback
  const handleTriggerAiReanalysis = () => {
    setIsAnalyzing(true);
    
    setTimeout(() => {
      setIsAnalyzing(false);
      
      setProfilesList(prev => prev.map(p => {
        if (p.id === activeProfileId) {
          // Fluctuates scores by dynamic margin (+- 2% to make it feel extremely active)
          const healthDelta = Math.random() > 0.5 ? 1 : -1;
          const compatDelta = Math.random() > 0.5 ? 1 : -1;
          
          let newHealth = p.hairHealthScore + healthDelta;
          if (newHealth > 98) newHealth = 98;
          if (newHealth < 75) newHealth = 75;
          
          let newCompat = p.styleCompatScore + compatDelta;
          if (newCompat > 98) newCompat = 98;
          if (newCompat < 75) newCompat = 75;

          const updatedTimeline = [
            {
              id: `act_${Date.now()}`,
              time: 'Just Now',
              icon: 'scan-outline',
              title: 'Follicular re-scan executed',
              desc: `Recalculated Health Score: ${newHealth}%, Compat: ${newCompat}%`
            },
            ...(p.recentActivityTimeline || [])
          ].slice(0, 4);
          
          return {
            ...p,
            hairHealthScore: newHealth,
            styleCompatScore: newCompat,
            symmetryScore: `${(90 + Math.random() * 8).toFixed(1)}%`,
            totalTryOns: (p.totalTryOns || 0) + 1,
            recentActivityTimeline: updatedTimeline
          };
        }
        return p;
      }));
      
      Alert.alert(
        'Re-analysis Complete',
        'AI follicular scanner completed. Hair Health and Compatibility indexes recalculated!'
      );
    }, 2000);
  };


  // Initialize edit forms when active profile shifts
  useEffect(() => {
    if (activeProfile) {
      setEditName(activeProfile.name.split(' (')[0]);
      setEditEmail(activeProfile.email);
      setEditSub(activeProfile.subscription);
      setEditAvatar(activeProfile.avatarUrl);
    }
  }, [activeProfileId]);

  // 3. Switch active face profile with bouncing transition
  const handleSwitchProfile = (id) => {
    Animated.sequence([
      Animated.timing(profileScale, {
        toValue: 0.88,
        duration: 120,
        useNativeDriver: true
      }),
      Animated.timing(profileScale, {
        toValue: 1.0,
        duration: 180,
        useNativeDriver: true
      })
    ]).start();

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveProfileId(id);
    setSwitcherModalVisible(false);
  };

  // 4. Save Profile Modifications
  const handleSaveProfileEdits = () => {
    if (!editName.trim()) {
      Alert.alert('Required Field', 'Please enter a valid username.');
      return;
    }
    
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setProfilesList(prev => prev.map(p => {
      if (p.id === activeProfileId) {
        return {
          ...p,
          name: `${editName}${p.role !== 'Primary Active' ? ` (${p.role})` : ' (Active Scan)'}`,
          email: editEmail,
          subscription: editSub,
          avatarUrl: editAvatar
        };
      }
      return p;
    }));
    
    setEditModalVisible(false);
    Alert.alert('Database Synchronized', 'Identity credentials updated successfully inside Cyber-Cloud.');
  };

  // 5. Establish New Face profile scan log
  const handleAddFaceScanSubmit = () => {
    if (!newName.trim()) {
      Alert.alert('Scan Tag Required', 'Please input a name label for this scan.');
      return;
    }

    const newScan = {
      id: `profile_${Date.now()}`,
      name: `${newName} (Scan Log)`,
      role: 'Custom Scan Log',
      faceShape: newShape,
      hairTexture: newTexture,
      hairDensity: newDensity,
      beardStatus: newBeard,
      joinedDate: 'Just Now',
      email: activeProfile.email,
      subscription: activeProfile.subscription,
      avatarUrl: newAvatar,
      symmetryScore: `${(90 + Math.random() * 8).toFixed(1)}%`,
      arMirrorTime: '0.0 Hours',
      faceScanWidth: `${(15.2 + Math.random() * 2.5).toFixed(1)} cm`,
      hairHealth: 'Optimal',
      scalpVisibility: 'Minimum',
      shineLevel: 'Optimal',
      hairHealthScore: Math.round(80 + Math.random() * 15),
      styleCompatScore: Math.round(82 + Math.random() * 15),
      aiConfidence: 95,
      aiInsights: [
        `${newTexture} aligns uniquely with dynamic styling volume factors under scanner calibration.`,
        `${newShape} provides proportional matching metrics for high-volume sweeps and fades.`,
        "Scalp scanners confirm stabilized root integrity and high shine rates under active scans."
      ],
      totalTryOns: 15,
      savedHairstyles: 4,
      favCategory: newTexture.includes('Curly') ? 'Curly Textures' : 'Classic Fades',
      totalComparisons: 3,
      exportedStyles: 1,
      aiAccuracyRating: '94.8%',
      neuralCyclesSynced: 340,
      aiRecommendationInteraction: '68.0% Action Rate',
      mostTriedCategory: newTexture.includes('Curly') ? 'Curly Undercut' : 'Structured Crop',
      favBeardStyle: newBeard,
      favColorName: 'Black',
      favColorHex: '#0A0A0B',
      weeklyHairstyleUsage: [2, 4, 1, 3, 2, 1, 2],
      monthlyHairstyleUsage: [8, 12, 10, 14],
      recentActivityTimeline: [
        { id: 'act_1', time: 'Just Now', icon: 'scan-outline', title: 'Custom Face Scan Compiled', desc: `Structural alignment calibrated for ${newShape}` }
      ],
      recentlyTried: [
        { id: 'rt_1', name: newTexture.includes('Curly') ? 'Curly Fade' : 'Sleek Undercut', match: '94%', color: 'Black', colorHex: '#0A0A0B', imageUrl: newAvatar }
      ]
    };

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setProfilesList(prev => [...prev, newScan]);
    setActiveProfileId(newScan.id);
    setAddScanModalVisible(false);

    // Reset fields
    setNewName('');
    setNewShape('Oval Face');
    setNewTexture('Curly Hair');
    setNewDensity('Thick Density');
    setNewBeard('Beard Compatible');
    setNewAvatar(PRESET_AVATARS[0]);

    Alert.alert(
      'AI Analysis Sync',
      'Scan coordinates successfully compiled. Face structural grid is fully synchronized!'
    );
  };

  // 6. Custom greeting dynamic compiler
  const compileDynamicGreeting = () => {
    const isPro = activeProfile.subscription.includes('PRO');
    const hour = new Date().getHours();
    let greet = 'Welcome back';
    
    if (hour < 12) greet = 'Good morning';
    else if (hour < 18) greet = 'Good afternoon';
    else greet = 'Good evening';

    if (isPro) {
      return `${greet}, Chief Operator. Neural symmetry logs are warm and stabilized.`;
    }
    return `${greet}, Stylist. Ready to explore AI Hairstyle simulation matrices?`;
  };

  // 7. Dynamic guidelines on badge press
  const handleOpenBadgeGuideline = (title, specValue) => {
    let text = '';
    if (title.includes('Shape')) {
      text = `Oval shape indicates ideal horizontal-to-vertical facial ratios (1:1.5). This provides a highly flexible landscape, compatible with textured curly shags, classic fades, crop cuts, and slick backs. Perfect for showcasing forehead structures.`;
      if (specValue.includes('Square')) {
        text = `Square profile showcases robust jaw symmetry and sharp chin boxes. We recommend voluminous styles, pompadours, crop tops, and textured fringe layers to soften structural angles while reinforcing facial masculinity.`;
      } else if (specValue.includes('Heart')) {
        text = `Heart symmetry balances a broad forehead with an elegant tapered chin. Mid-length flows, texturized curtains, messy bangs, and natural curly sweeps provide proportional width around jawlines perfectly.`;
      }
    } else if (title.includes('Texture')) {
      text = `Curly hair texture generates natural structural volume and spring factors (18% variance). We recommend textured fades, curly shags, messy side parts, and undercut curly sweeps. Avoid plain buzz cuts to preserve volume characteristics.`;
      if (specValue.includes('Straight')) {
        text = `Straight follicles deliver clean, linear sweeps with zero coiling rates. Ideal for undercuts, pompadours, structured comb-overs, and side-parted quiffs. Use matte wax for textured separations.`;
      } else if (specValue.includes('Wavy')) {
        text = `Wavy strands offer elegant natural sweeps and movement patterns. Extremely compatible with textured flow cuts, casual side sweeps, and curly locks. A minor sea salt spray highlights coiling layers beautifully.`;
      }
    } else if (title.includes('Density')) {
      text = `Thick strand density offers substantial hair volumetric layers, generating solid structures. Extremely compatible with long flows, high volume quiffs, and pompadours. Light texturizing is recommended to remove excess bulk.`;
      if (specValue.includes('Medium')) {
        text = `Medium strand spacing offers an ideal balance of density and manageability. Compatible with nearly all styling sweeps, fades, undercuts, and curtains. Maintains clean shapes without flattening easily.`;
      } else if (specValue.includes('Fine')) {
        text = `Fine follicle strands provide a light weight structure. Best suited for high-fade comb overs, linear crop cuts, and short undercuts. Avoid heavy pomades to prevent flattening strands.`;
      }
    } else {
      text = `Beard Compatible specs mean jawline angles match 90%+ facial beard sweep lines. Compatible with fade beards, short stubble outlines, and heavy contour lines. Sideburn fades sync strands beautifully.`;
      if (specValue.includes('Clean')) {
        text = `Clean Shaven spec highlights bare skin details, cheekbones, and jaw boxes. Directing focus up to hairstyles. Ideal for clean sideburn trims and sharp edge lines.`;
      }
    }

    setActiveGuideline({ title, value: specValue, text });
    setGuidelineModalVisible(true);
  };

  // ─── PREMIUM SKELETON LOADER ─────────────────────────────────────────────
  const renderLoadingSkeleton = () => {
    const S = skeletonPulse; // shorthand
    const skRow = (w1, w2) => (
      <View style={{ flexDirection: 'row', marginBottom: 8 }}>
        <Animated.View style={[styles.skLine, { width: w1, opacity: S }]} />
        {w2 && <Animated.View style={[styles.skLine, { width: w2, marginLeft: 8, opacity: S }]} />}
      </View>
    );
    return (
      <View style={styles.skeletonContainer}>

        {/* ── Header card ── */}
        <Animated.View style={[styles.skCard, styles.skCardTall, { opacity: S }]}>
          <View style={styles.skAvatarRing}>
            <View style={styles.skAvatarInner} />
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <View style={[styles.skLine, { width: '60%', height: 14, marginBottom: 8 }]} />
            <View style={[styles.skLine, { width: '40%', height: 10 }]} />
          </View>
        </Animated.View>

        {/* ── Greeting ── */}
        <Animated.View style={[styles.skCard, { height: 54, marginBottom: 20, opacity: S }]}>
          <View style={[styles.skLine, { width: '55%' }]} />
        </Animated.View>

        {/* ── Diagnostic badges 2x2 ── */}
        <Animated.View style={[styles.skLine, { width: '45%', height: 11, marginBottom: 10, opacity: S }]} />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 }}>
          {[0,1,2,3].map(i => (
            <Animated.View key={i} style={[styles.skCard, { width: '48%', height: 88, marginBottom: 10, opacity: S }]}>
              <View style={styles.skCircle} />
              <View style={[styles.skLine, { width: '50%', marginTop: 8 }]} />
              <View style={[styles.skLine, { width: '70%', height: 13, marginTop: 6 }]} />
            </Animated.View>
          ))}
        </View>

        {/* ── AI Insights card ── */}
        <Animated.View style={[styles.skLine, { width: '50%', height: 11, marginBottom: 10, opacity: S }]} />
        <Animated.View style={[styles.skCard, { height: 180, marginBottom: 20, opacity: S }]}>
          {skRow('70%', null)}
          {skRow('55%', null)}
          {skRow('65%', null)}
          <View style={[styles.skLine, { width: '100%', height: 36, borderRadius: 10, marginTop: 8 }]} />
        </Animated.View>

        {/* ── Telemetry 3-col ── */}
        <Animated.View style={[styles.skCard, { height: 72, marginBottom: 20, opacity: S }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', flex: 1 }}>
            {[0,1,2].map(i => (
              <View key={i} style={{ alignItems: 'center' }}>
                <View style={[styles.skLine, { width: 40, height: 18, marginBottom: 6 }]} />
                <View style={[styles.skLine, { width: 55, height: 8 }]} />
              </View>
            ))}
          </View>
        </Animated.View>

        {/* ── Analytics chart ── */}
        <Animated.View style={[styles.skCard, { height: 100, marginBottom: 20, opacity: S }]}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', flex: 1, paddingHorizontal: 4 }}>
            {[60,85,45,90,70,55,80].map((h, i) => (
              <View key={i} style={{ flex: 1, marginHorizontal: 2 }}>
                <Animated.View style={[styles.skLine, { height: h * 0.55, borderRadius: 3, opacity: S }]} />
              </View>
            ))}
          </View>
        </Animated.View>

        {/* ── Premium/Upgrade card ── */}
        <Animated.View style={[styles.skCard, { height: 140, marginBottom: 20, opacity: S, borderColor: 'rgba(212,175,55,0.15)' }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <View style={[styles.skCircle, { backgroundColor: 'rgba(212,175,55,0.15)' }]} />
            <View style={{ marginLeft: 12 }}>
              <View style={[styles.skLine, { width: 60, height: 8, marginBottom: 6, backgroundColor: 'rgba(212,175,55,0.12)' }]} />
              <View style={[styles.skLine, { width: 120, height: 14, backgroundColor: 'rgba(212,175,55,0.12)' }]} />
            </View>
          </View>
          <View style={[styles.skLine, { width: '100%', height: 38, borderRadius: 10, backgroundColor: 'rgba(212,175,55,0.08)' }]} />
        </Animated.View>

        {/* ── Style personality card ── */}
        <Animated.View style={[styles.skCard, { height: 130, marginBottom: 20, opacity: S }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <View style={[styles.skCircle, { width: 48, height: 48, borderRadius: 16 }]} />
            <View style={{ marginLeft: 12 }}>
              <View style={[styles.skLine, { width: 80, height: 8, marginBottom: 6 }]} />
              <View style={[styles.skLine, { width: 140, height: 16 }]} />
            </View>
          </View>
          {skRow('90%', null)}
          {skRow('75%', null)}
        </Animated.View>

      </View>
    );
  };

  // ── Animated spin interpolation ─────────────────────────────────────────
  const spinDeg = scanSpinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const avatarRingDeg = avatarRingAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const isPro = activeProfile.subscription.includes('PRO');

  // ── SectionHeader component ───────────────────────────────────────────────
  const SectionHeader = ({ icon, label, color = COLORS.secondary, rightElement }) => (
    <View style={styles.sectionHeaderRow}>
      <View style={[styles.sectionHeaderBar, { backgroundColor: color }]} />
      {icon && <Ionicons name={icon} size={12} color={color} style={{ marginRight: 5 }} />}
      <Text style={[styles.sectionHeaderLabel, { color }]}>{label}</Text>
      {rightElement && <View style={{ marginLeft: 'auto' }}>{rightElement}</View>}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={Platform.OS === 'android'}
        windowSize={7}
        maxToRenderPerBatch={8}
        initialNumToRender={6}
        keyboardShouldPersistTaps="handled"
      >
        {isLoading ? (
          renderLoadingSkeleton()
        ) : (
          <Animated.View style={{ opacity: fadeContent, flex: 1 }}>

            {/* ╔══════════════════════════════════════════════════════════╗ */}
            {/* ║  1. PREMIUM PROFILE HEADER                              ║ */}
            {/* ╚══════════════════════════════════════════════════════════╝ */}
            <Animated.View style={[
              styles.profileHeaderCard,
              { transform: [{ translateY: headerSlideAnim }], opacity: headerFadeAnim }
            ]}>
              {/* Top meta row */}
              <View style={styles.headerTopActions}>
                <View style={[styles.membershipTag, isPro ? styles.membershipPro : styles.membershipFree]}>
                  <Ionicons
                    name={isPro ? 'sparkles' : 'person-outline'}
                    size={10}
                    color={isPro ? '#D4AF37' : COLORS.textSecondary}
                  />
                  <Text style={[styles.membershipTagText, { color: isPro ? '#D4AF37' : COLORS.textSecondary }]}>
                    {isPro ? 'PRO MEMBER' : 'FREE TIER'}
                  </Text>
                </View>
                <Text style={styles.joinedText}>Member since {activeProfile.joinedDate}</Text>
              </View>

              {/* Avatar + identity */}
              <View style={styles.avatarRow}>
                {/* Rotating glow ring */}
                <View style={styles.avatarContainer}>
                  <Animated.View style={[
                    styles.avatarGlowRing,
                    {
                      borderColor: isPro ? '#D4AF37' : COLORS.secondary,
                      transform: [{ rotate: avatarRingDeg }],
                      opacity: isPro ? 0.85 : 0.5,
                    }
                  ]} />
                  <Image source={{ uri: activeProfile.avatarUrl }} style={styles.avatarImg} />
                  {/* Online status dot */}
                  <View style={[styles.avatarStatusDot, { backgroundColor: COLORS.success }]} />
                </View>

                <View style={styles.avatarInfoCol}>
                  <Text style={styles.profileName} numberOfLines={1}>
                    {activeProfile.name.split(' (')[0]}
                  </Text>
                  <Text style={styles.profileRoleTag} numberOfLines={1}>{activeProfile.role}</Text>
                  <Text style={styles.profileEmail} numberOfLines={1}>{activeProfile.email}</Text>
                  {/* Scan width inline */}
                  <View style={styles.profileMetaPill}>
                    <Ionicons name="scan-outline" size={9} color={COLORS.secondary} />
                    <Text style={styles.profileMetaPillText}>{activeProfile.faceScanWidth} face scan</Text>
                  </View>
                </View>
              </View>

              {/* Action buttons row */}
              <View style={styles.headerToolbar}>
                {[
                  { icon: 'create-outline',    label: 'Edit',    action: () => setEditModalVisible(true) },
                  { icon: 'swap-horizontal',   label: 'Switch',  action: () => setSwitcherModalVisible(true) },
                  { icon: 'scan-outline',      label: 'New Scan',action: () => setAddScanModalVisible(true) },
                ].map((btn, i, arr) => (
                  <TouchableOpacity
                    key={btn.label}
                    style={[styles.toolbarBtn, i < arr.length - 1 && { borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,0.05)' }]}
                    onPress={btn.action}
                    activeOpacity={0.75}
                  >
                    <View style={styles.toolbarIconBox}>
                      <Ionicons name={btn.icon} size={14} color={COLORS.secondary} />
                    </View>
                    <Text style={styles.toolbarBtnText}>{btn.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>

            {/* ╔══════════════════════════════════════════════════════════╗ */}
            {/* ║  2. DYNAMIC GREETING                                    ║ */}
            {/* ╚══════════════════════════════════════════════════════════╝ */}
            <Animated.View style={[
              styles.greetingCard,
              { transform: [{ translateY: greetingSlideAnim }], opacity: greetingFadeAnim }
            ]}>
              <View style={styles.greetingIconBox}>
                <Ionicons name="hardware-chip-outline" size={16} color={COLORS.secondary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.greetingHeader}>NEURAL FEED STATUS  ●  LIVE</Text>
                <Text style={styles.greetingText}>{compileDynamicGreeting()}</Text>
              </View>
            </Animated.View>

            {/* ╔══════════════════════════════════════════════════════════╗ */}
            {/* ║  3. DYNAMIC AI DIAGNOSTICS BADGES                       ║ */}
            {/* ╚══════════════════════════════════════════════════════════╝ */}
            <SectionHeader icon="scan-circle-outline" label="AI DIAGNOSTICS" color={COLORS.primary} />
            <View style={styles.badgesContainerGrid}>
              {[
                { title: 'Face Shape Diagnostic', spec: activeProfile.faceShape,   icon: 'scan-circle',           color: COLORS.primary,   bg: 'rgba(124,92,252,0.1)',  label: 'FACE SHAPE' },
                { title: 'Hair Texture Diagnostic',spec: activeProfile.hairTexture, icon: 'water',                 color: COLORS.secondary, bg: 'rgba(0,212,255,0.1)',   label: 'TEXTURE' },
                { title: 'Follicle Density Diagnostic',spec:activeProfile.hairDensity,icon:'grid',               color: COLORS.success,   bg: 'rgba(0,230,118,0.1)',   label: 'DENSITY' },
                { title: 'Beard Trim Compatibility',spec: activeProfile.beardStatus,icon: 'shield-checkmark',    color: COLORS.error,     bg: 'rgba(255,82,82,0.1)',   label: 'BEARD SPEC' },
              ].map((badge, i) => {
                const pressAnim = badgePressAnims[i];
                const handleIn  = () => Animated.spring(pressAnim, { toValue: 0.93, useNativeDriver: true, speed: 30 }).start();
                const handleOut = () => Animated.spring(pressAnim, { toValue: 1,    useNativeDriver: true, speed: 20 }).start();
                return (
                  <TouchableOpacity
                    key={badge.label}
                    onPress={() => handleOpenBadgeGuideline(badge.title, badge.spec)}
                    onPressIn={handleIn}
                    onPressOut={handleOut}
                    activeOpacity={1}
                  >
                    <Animated.View style={[styles.diagnosticBadgeCard, { transform: [{ scale: pressAnim }] }]}>
                      <View style={[styles.badgeIconBg, { backgroundColor: badge.bg }]}>
                        <Ionicons name={badge.icon} size={20} color={badge.color} />
                      </View>
                      <Text style={styles.diagnosticBadgeLabel}>{badge.label}</Text>
                      <Text style={[styles.diagnosticBadgeValue, { color: badge.color }]}>{badge.spec}</Text>
                      <Text style={[styles.tapTipText, { color: badge.color }]}>Tap for specs →</Text>
                    </Animated.View>
                  </TouchableOpacity>
                );
              })}

            </View>

            {/* ╔══════════════════════════════════════════════════════════╗ */}
            {/* ║  3.1 AI INSIGHTS & SCALP HEALTH DASHBOARD               ║ */}
            {/* ╚══════════════════════════════════════════════════════════╝ */}
            <SectionHeader
              icon="bulb-outline"
              label="AI HAIR INSIGHTS & METRICS"
              color={COLORS.secondary}
              rightElement={
                <TouchableOpacity style={styles.reAnalysisTextBtn} onPress={handleTriggerAiReanalysis}>
                  <Animated.View style={{ transform: [{ rotate: spinDeg }] }}>
                    <Ionicons name="refresh" size={11} color={COLORS.secondary} />
                  </Animated.View>
                  <Text style={[styles.reAnalysisText, { marginLeft: 4 }]}>Re-scan</Text>
                </TouchableOpacity>
              }
            />
            <View style={styles.insightsDashboardCard}>

              {/* Animated progress meters */}
              <View style={styles.scoreMetersContainer}>
                {[
                  { label: 'Follicular Health Index',   score: activeProfile.hairHealthScore,  anim: meterBar1Anim, color: COLORS.success },
                  { label: 'Style Compatibility Factor', score: activeProfile.styleCompatScore, anim: meterBar2Anim, color: COLORS.secondary },
                  { label: 'Analysis Confidence Rate',   score: activeProfile.aiConfidence,     anim: meterBar3Anim, color: COLORS.primary },
                ].map((m) => (
                  <View key={m.label} style={styles.scoreMeterRow}>
                    <View style={styles.scoreMeterLabels}>
                      <Text style={styles.scoreMeterName}>{m.label}</Text>
                      <Text style={[styles.scoreMeterValue, { color: m.color }]}>{m.score}%</Text>
                    </View>
                    <View style={styles.meterBarOuter}>
                      <Animated.View style={[
                        styles.meterBarFill,
                        {
                          width: m.anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', `${m.score}%`] }),
                          backgroundColor: m.color,
                        }
                      ]} />
                      {/* Glowing knob at bar end */}
                      <Animated.View style={[
                        styles.meterBarKnob,
                        {
                          left: m.anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', `${m.score - 1}%`] }),
                          backgroundColor: m.color,
                          shadowColor: m.color,
                        }
                      ]} />
                    </View>
                  </View>
                ))}
              </View>

              {/* Mini analytics cards */}
              <View style={styles.miniAnalyticsRow}>
                <View style={styles.miniAnalyticsCard}>
                  <Text style={styles.miniCardLabel}>SCALP FOCUS</Text>
                  <Text style={styles.miniCardValue} numberOfLines={1}>{activeProfile.scalpVisibility}</Text>
                  <Text style={styles.miniCardSub}>Visibility</Text>
                </View>
                <View style={styles.miniAnalyticsCard}>
                  <Text style={styles.miniCardLabel}>FOLLICLE SHINE</Text>
                  <Text style={styles.miniCardValue} numberOfLines={1}>{activeProfile.shineLevel}</Text>
                  <Text style={styles.miniCardSub}>Shine level</Text>
                </View>
                <View style={styles.miniAnalyticsCard}>
                  <Text style={styles.miniCardLabel}>HAIR HEALTH</Text>
                  <Text style={styles.miniCardValue} numberOfLines={1}>{activeProfile.hairHealth}</Text>
                  <Text style={styles.miniCardSub}>Follicle health</Text>
                </View>
              </View>

              {/* Dynamic Insights list */}
              <View style={styles.insightsListBlock}>
                <Text style={styles.insightsSubHeading}>AI-GENERATED STYLE RECOMMENDATIONS</Text>
                {activeProfile.aiInsights && activeProfile.aiInsights.map((insight, idx) => (
                  <View key={idx} style={styles.insightItemRow}>
                    <Ionicons name="sparkles" size={12} color={COLORS.secondary} style={{ marginRight: 8, marginTop: 2 }} />
                    <Text style={styles.insightItemText}>{insight}</Text>
                  </View>
                ))}
              </View>

              {/* View Full AI Report CTA Button */}
              <TouchableOpacity 
                style={styles.fullReportCTA}
                onPress={() => navigation.navigate('AIAnalysis')}
              >
                <Ionicons name="document-text-outline" size={14} color={COLORS.background} />
                <Text style={styles.fullReportCTAText}>View Full AI Insights Report</Text>
              </TouchableOpacity>
            </View>

            {/* ╔══════════════════════════════════════════════════════════╗ */}
            {/* ║  4. NEURAL TELEMETRY                                    ║ */}
            {/* ╚══════════════════════════════════════════════════════════╝ */}
            <SectionHeader icon="heart-half-outline" label="NEURAL INTEGRITY TELEMETRY" color="#FF6B9D" />
            <View style={styles.telemetryCardOuter}>
              <View style={styles.telemetryHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="heart-half-outline" size={16} color={COLORS.secondary} />
                  <Text style={styles.telemetryTitleText}>Facial Structural Integrity Metrics</Text>
                </View>
                <View style={styles.glowingDot} />
              </View>

              <View style={styles.telemetryRow}>
                <View style={styles.telemetryCol}>
                  <Text style={styles.telemetryLabel}>Symmetry Score</Text>
                  <Text style={styles.telemetryValueText}>{activeProfile.symmetryScore}</Text>
                  <Text style={styles.telemetrySubText}>Balancing Factor</Text>
                </View>
                
                <View style={styles.telemetryColDivider} />

                <View style={styles.telemetryCol}>
                  <Text style={styles.telemetryLabel}>AR Mirror Duration</Text>
                  <Text style={styles.telemetryValueText}>{activeProfile.arMirrorTime}</Text>
                  <Text style={styles.telemetrySubText}>Active tracking logs</Text>
                </View>

                <View style={styles.telemetryColDivider} />

                <View style={styles.telemetryCol}>
                  <Text style={styles.telemetryLabel}>Structure Width</Text>
                  <Text style={styles.telemetryValueText}>{activeProfile.faceScanWidth}</Text>
                  <Text style={styles.telemetrySubText}>AI box coordinates</Text>
                </View>
              </View>
            </View>

            {/* ╔══════════════════════════════════════════════════════════╗ */}
            {/* ║  5. ANALYTICS DASHBOARD                                 ║ */}
            {/* ╚══════════════════════════════════════════════════════════╝ */}
            <SectionHeader icon="bar-chart-outline" label="ANALYTICS DASHBOARD" color={COLORS.warning} />

            {/* Segment Toggle */}
            <View style={styles.segmentContainer}>
              <TouchableOpacity style={[styles.segmentBtn, analyticsMode === 'weekly' && styles.segmentBtnActive]} onPress={() => setAnalyticsMode('weekly')}>
                <Text style={[styles.segmentBtnText, analyticsMode === 'weekly' && styles.segmentBtnTextActive]}>Weekly</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.segmentBtn, analyticsMode === 'monthly' && styles.segmentBtnActive]} onPress={() => setAnalyticsMode('monthly')}>
                <Text style={[styles.segmentBtnText, analyticsMode === 'monthly' && styles.segmentBtnTextActive]}>Monthly</Text>
              </TouchableOpacity>
            </View>

            {/* Analytics Charts */}
            {analyticsMode === 'weekly' ? (
              <View style={styles.weeklyChart}>
                {activeProfile.weeklyHairstyleUsage.map((val, idx) => (
                  <View key={idx} style={styles.weeklyBarWrapper}>
                    <Text style={styles.weeklyBarLabel}>{['M','T','W','T','F','S','S'][idx]}</Text>
                    <View style={styles.weeklyBarBackground}>
                      <Animated.View style={[styles.weeklyBarFill, { height: `${val}%`, backgroundColor: '#00D4FF' }]} />
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.monthlyChart}>
                {activeProfile.monthlyHairstyleUsage.map((val, idx) => (
                  <View key={idx} style={styles.monthlyBarWrapper}>
                    <View style={styles.monthlyBarBackground}>
                      <Animated.View style={[styles.monthlyBarFill, { width: `${val}%`, backgroundColor: '#00E676' }]} />
                    </View>
                    <Text style={styles.monthlyBarLabel}>Wk {idx + 1}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Stat Cards Grid — stagger animated */}
            <View style={styles.statGrid}>
              {[
                { icon: 'repeat-outline',        label: 'Try-Ons',       value: activeProfile.totalTryOns,                  color: COLORS.secondary },
                { icon: 'heart-outline',          label: 'Saved',         value: activeProfile.savedHairstyles,              color: '#FF6B9D' },
                { icon: 'cloud-download-outline', label: 'Exported',      value: activeProfile.exportedStyles,               color: COLORS.success },
                { icon: 'git-compare-outline',    label: 'Comparisons',   value: activeProfile.totalComparisons,             color: COLORS.primary },
                { icon: 'sparkles-outline',       label: 'AI Interact.',  value: activeProfile.aiRecommendationInteraction,  color: COLORS.warning },
                { icon: 'sync-outline',           label: 'Neural Cycles', value: activeProfile.neuralCyclesSynced,           color: COLORS.secondary },
              ].map((s, i) => (
                <Animated.View
                  key={s.label}
                  style={[
                    styles.statCard,
                    {
                      opacity: statsStaggerAnims[i],
                      transform: [{ translateY: statsStaggerAnims[i].interpolate({ inputRange: [0,1], outputRange: [18, 0] }) }]
                    }
                  ]}
                >
                  <Ionicons name={s.icon} size={18} color={s.color} />
                  <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </Animated.View>
              ))}
            </View>

            {/* Favorite Beard & Color Card */}
            <View style={styles.dualInfoCard}>
              <View style={styles.colorSwatch}>
                <View style={[styles.colorCircle, { backgroundColor: activeProfile.favColorHex }]} />
                <Text style={styles.colorLabel}>{activeProfile.favColorName}</Text>
              </View>
              <View style={styles.beardInfo}>
                <Ionicons name="brush-outline" size={20} color={COLORS.secondary} />
                <Text style={styles.beardLabel}>{activeProfile.favBeardStyle}</Text>
              </View>
            </View>

            {/* ╔══════════════════════════════════════════════════════════╗ */}
            {/* ║  RECENTLY TRIED                                         ║ */}
            {/* ╚══════════════════════════════════════════════════════════╝ */}
            <SectionHeader icon="eye-outline" label="RECENTLY TRIED" color={COLORS.secondary} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recentlyTriedRow}>
              {activeProfile.recentlyTried.map(item => (
                <TouchableOpacity key={item.id} style={styles.recentCard} onPress={() => {/* TODO: toast interaction */}}>
                  <Image source={{ uri: item.imageUrl }} style={styles.recentImg} />
                  <View style={styles.recentOverlay}>
                    <Text style={styles.recentMatch}>{item.match} Match</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* ╔══════════════════════════════════════════════════════════╗ */}
            {/* ║  ACTIVITY TIMELINE                                      ║ */}
            {/* ╚══════════════════════════════════════════════════════════╝ */}
            <SectionHeader icon="time-outline" label="ACTIVITY TIMELINE" color={COLORS.primary} />
            <View style={styles.timelineContainer}>
              {activeProfile.recentActivityTimeline.map(event => (
                <View key={event.id} style={styles.timelineItem}>
                  <View style={styles.timelineDot} />
                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineTitle}>{event.title}</Text>
                    <Text style={styles.timelineDesc}>{event.desc}</Text>
                    <Text style={styles.timelineTime}>{event.time}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* ╔══════════════════════════════════════════════════════════╗ */}
            {/* ║  MEMBERSHIP & AI BENEFITS                               ║ */}
            {/* ╚══════════════════════════════════════════════════════════╝ */}
            <SectionHeader icon="sparkles-outline" label="MEMBERSHIP & AI BENEFITS" color="#D4AF37" />

            {activeProfile.subscription.includes('PRO') ? (
              /* ── PRO STATUS CARD ─────────────────────────────────────── */
              <View style={styles.premiumStatusCard}>
                {/* Animated glow border */}
                <Animated.View style={[
                  styles.premiumGlowRing,
                  { opacity: premiumGlowAnim.interpolate({ inputRange: [0,1], outputRange: [0.35, 1.0] }) }
                ]} />

                {/* Header Row */}
                <View style={styles.premiumCardHeader}>
                  <View style={styles.premiumBadgeRow}>
                    <View style={styles.premiumCrownCircle}>
                      <Ionicons name="sparkles" size={16} color="#D4AF37" />
                    </View>
                    <View style={{ marginLeft: 10 }}>
                      <Text style={styles.premiumCardPlanLabel}>CURRENT PLAN</Text>
                      <Text style={styles.premiumCardPlanName}>PRO Premium</Text>
                    </View>
                  </View>
                  <View style={styles.premiumActiveBadge}>
                    <View style={styles.premiumActiveDot} />
                    <Text style={styles.premiumActiveText}>ACTIVE</Text>
                  </View>
                </View>

                {/* Plan Stats Row */}
                <View style={styles.premiumStatsRow}>
                  <View style={styles.premiumStatItem}>
                    <Text style={styles.premiumStatValue}>4K HD</Text>
                    <Text style={styles.premiumStatLabel}>Export Quality</Text>
                  </View>
                  <View style={styles.premiumStatDivider} />
                  <View style={styles.premiumStatItem}>
                    <Text style={styles.premiumStatValue}>∞</Text>
                    <Text style={styles.premiumStatLabel}>AI Renders</Text>
                  </View>
                  <View style={styles.premiumStatDivider} />
                  <View style={styles.premiumStatItem}>
                    <Text style={styles.premiumStatValue}>PRO</Text>
                    <Text style={styles.premiumStatLabel}>Neural Engine</Text>
                  </View>
                </View>

                {/* Benefits Grid */}
                <Text style={styles.premiumBenefitsHeading}>UNLOCKED BENEFITS</Text>
                <View style={styles.premiumBenefitsGrid}>
                  {PLAN_BENEFITS.pro.map((b, i) => (
                    <View key={i} style={styles.premiumBenefitChip}>
                      <Ionicons name={b.icon} size={12} color="#D4AF37" style={{ marginRight: 5 }} />
                      <View>
                        <Text style={styles.premiumBenefitLabel}>{b.label}</Text>
                        <Text style={styles.premiumBenefitDetail}>{b.detail}</Text>
                      </View>
                    </View>
                  ))}
                </View>

                {/* Manage CTA */}
                <TouchableOpacity
                  style={styles.premiumManageBtn}
                  onPress={() => navigation.navigate('Premium')}
                >
                  <Ionicons name="card-outline" size={13} color="#D4AF37" style={{ marginRight: 6 }} />
                  <Text style={styles.premiumManageBtnText}>Manage Subscription</Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* ── UPGRADE BANNER ─────────────────────────────────────── */
              <TouchableOpacity
                style={styles.upgradeBannerCard}
                onPress={() => navigation.navigate('Premium')}
                activeOpacity={0.88}
              >
                {/* Animated glow pulse */}
                <Animated.View style={[
                  styles.upgradeBannerGlow,
                  { opacity: upgradeGlow.interpolate({ inputRange: [0,1], outputRange: [0.4, 0.85] }) }
                ]} />

                {/* Shimmer overlay */}
                <Animated.View style={[
                  styles.upgradeShimmer,
                  {
                    transform: [{
                      translateX: shimmerAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-contentWidth, contentWidth]
                      })
                    }]
                  }
                ]} />

                <View style={styles.upgradeBannerContent}>
                  <View style={styles.upgradeBannerLeft}>
                    <View style={styles.upgradeLockIcon}>
                      <Ionicons name="lock-open-outline" size={20} color="#D4AF37" />
                    </View>
                    <View style={{ marginLeft: 12, flex: 1 }}>
                      <Text style={styles.upgradeTitle}>Upgrade to PRO Premium</Text>
                      <Text style={styles.upgradeSubtitle}>Unlock 4K exports, unlimited AI scans & neural rendering engine</Text>
                    </View>
                  </View>
                  <View style={styles.upgradeChevron}>
                    <Ionicons name="arrow-forward" size={16} color="#D4AF37" />
                  </View>
                </View>

                {/* Free tier locked benefits */}
                <View style={styles.upgradeBenefitRow}>
                  {['4K HD Export', 'Neural AI', 'Unlimited Scans', 'No Watermark'].map((item, i) => (
                    <View key={i} style={styles.upgradeTagChip}>
                      <Ionicons name="lock-closed" size={8} color="rgba(212,175,55,0.6)" style={{ marginRight: 3 }} />
                      <Text style={styles.upgradeTagText}>{item}</Text>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
            )}

            {/* ╔══════════════════════════════════════════════════════════╗ */}
            {/* ║  YOUR STYLE PERSONALITY                                 ║ */}
            {/* ╚══════════════════════════════════════════════════════════╝ */}
            <SectionHeader icon="person-outline" label="YOUR STYLE PERSONALITY" color="#FF6B9D" />
            <Animated.View style={[styles.personalityCard, { opacity: personalityFade }]}>
              {/* Glow accent */}
              <Animated.View style={[
                styles.personalityGlow,
                {
                  backgroundColor: STYLE_PERSONALITIES[stylePersonalityIndex].color + '20',
                  opacity: premiumGlowAnim.interpolate({ inputRange: [0,1], outputRange: [0.5, 1.0] })
                }
              ]} />

              <View style={styles.personalityHeader}>
                <View style={[
                  styles.personalityIconRing,
                  { borderColor: STYLE_PERSONALITIES[stylePersonalityIndex].color + '55',
                    backgroundColor: STYLE_PERSONALITIES[stylePersonalityIndex].color + '12' }
                ]}>
                  <Ionicons
                    name={STYLE_PERSONALITIES[stylePersonalityIndex].icon}
                    size={22}
                    color={STYLE_PERSONALITIES[stylePersonalityIndex].color}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.personalityAiLabel}>AI-GENERATED STYLE TYPE</Text>
                  <Text style={[
                    styles.personalityTitle,
                    { color: STYLE_PERSONALITIES[stylePersonalityIndex].color }
                  ]}>
                    {STYLE_PERSONALITIES[stylePersonalityIndex].label}
                  </Text>
                </View>
                <TouchableOpacity style={styles.personalityCycleBtn} onPress={handleCyclePersonality}>
                  <Ionicons name="refresh-outline" size={14} color={COLORS.secondary} />
                </TouchableOpacity>
              </View>

              <Text style={styles.personalityDesc}>
                {STYLE_PERSONALITIES[stylePersonalityIndex].desc}
              </Text>

              {/* Personality trait pills */}
              <View style={styles.personalityTraitsRow}>
                {['Shape-Aware', 'Trend-Aligned', 'Face-Optimized'].map((trait, i) => (
                  <View key={i} style={[
                    styles.traitPill,
                    { borderColor: STYLE_PERSONALITIES[stylePersonalityIndex].color + '40',
                      backgroundColor: STYLE_PERSONALITIES[stylePersonalityIndex].color + '0D' }
                  ]}>
                    <Text style={[styles.traitPillText, { color: STYLE_PERSONALITIES[stylePersonalityIndex].color }]}>
                      {trait}
                    </Text>
                  </View>
                ))}
              </View>
            </Animated.View>

            {/* ╔══════════════════════════════════════════════════════════╗ */}
            {/* ║  AI LEARNING PROGRESS                                   ║ */}
            {/* ╚══════════════════════════════════════════════════════════╝ */}
            <SectionHeader icon="hardware-chip-outline" label="AI LEARNING PROGRESS" color={COLORS.primary} />
            <Animated.View style={[styles.aiLearningCard, { transform: [{ scale: learningPulse }] }]}>
              <View style={styles.aiLearningHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="hardware-chip-outline" size={15} color={COLORS.primary} />
                  <Text style={styles.aiLearningTitle}>Neural Style Model</Text>
                </View>
                <TouchableOpacity style={styles.aiBoostBtn} onPress={handleBoostAiLearning}>
                  <Ionicons name="flash" size={11} color={COLORS.background} style={{ marginRight: 3 }} />
                  <Text style={styles.aiBoostBtnText}>Boost</Text>
                </TouchableOpacity>
              </View>

              {/* Main progress ring placeholder via bar */}
              <View style={styles.aiProgressBarOuter}>
                <Animated.View
                  style={[
                    styles.aiProgressBarFill,
                    { width: `${aiLearningProgress}%` }
                  ]}
                />
                <View style={[
                  styles.aiProgressKnob,
                  { left: `${aiLearningProgress - 2}%` }
                ]} />
              </View>
              <View style={styles.aiProgressLabels}>
                <Text style={styles.aiProgressPct}>{aiLearningProgress}% Trained</Text>
                <Text style={styles.aiProgressSub}>~{100 - aiLearningProgress} sessions to mastery</Text>
              </View>

              {/* Learning metrics row */}
              <View style={styles.aiLearnMetricsRow}>
                {[
                  { label: 'Try-Ons Learned', value: activeProfile.totalTryOns, icon: 'repeat-outline', color: COLORS.secondary },
                  { label: 'Patterns Found',  value: activeProfile.neuralCyclesSynced, icon: 'git-network-outline', color: COLORS.primary },
                  { label: 'Accuracy',        value: activeProfile.aiAccuracyRating, icon: 'checkmark-circle-outline', color: COLORS.success },
                ].map((m, i) => (
                  <View key={i} style={styles.aiLearnMetricCard}>
                    <Ionicons name={m.icon} size={14} color={m.color} />
                    <Text style={[styles.aiLearnMetricValue, { color: m.color }]}>{m.value}</Text>
                    <Text style={styles.aiLearnMetricLabel}>{m.label}</Text>
                  </View>
                ))}
              </View>
            </Animated.View>

            {/* ╔══════════════════════════════════════════════════════════╗ */}
            {/* ║  FAVORITE STYLE CATEGORIES                              ║ */}
            {/* ╚══════════════════════════════════════════════════════════╝ */}
            <SectionHeader icon="heart-outline" label="FAVORITE STYLE CATEGORIES" color="#FF6B9D" />
            <View style={styles.favCatCard}>
              <Text style={styles.favCatHint}>
                <Ionicons name="information-circle-outline" size={11} color={COLORS.secondary} />
                {' '}Tap to personalise · AI tailors feeds to your selections
              </Text>
              <View style={styles.favCatGrid}>
                {CATEGORY_POOL.map((cat) => {
                  const isActive = selectedCategories.includes(cat.key);
                  return (
                    <TouchableOpacity
                      key={cat.key}
                      style={[
                        styles.favCatChip,
                        isActive && {
                          borderColor: cat.color + '80',
                          backgroundColor: cat.color + '15',
                        }
                      ]}
                      onPress={() => toggleCategory(cat.key)}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name={isActive ? cat.icon : cat.icon + '-outline'}
                        size={13}
                        color={isActive ? cat.color : COLORS.textSecondary}
                        style={{ marginRight: 5 }}
                      />
                      <Text style={[
                        styles.favCatChipText,
                        isActive && { color: cat.color }
                      ]}>
                        {cat.key}
                      </Text>
                      {isActive && (
                        <View style={[styles.favCatActiveDot, { backgroundColor: cat.color }]} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Active count feedback */}
              <View style={styles.favCatFooter}>
                <Ionicons name="checkmark-circle" size={12} color={COLORS.success} />
                <Text style={styles.favCatFooterText}>
                  {selectedCategories.length} categories selected · AI feed updated
                </Text>
              </View>
            </View>

            {/* ╔══════════════════════════════════════════════════════════╗ */}
            {/* ║  RECOMMENDED TRENDS FOR YOU                             ║ */}
            {/* ╚══════════════════════════════════════════════════════════╝ */}
            <SectionHeader icon="trending-up-outline" label="RECOMMENDED TRENDS" color={COLORS.success} />
            <View style={styles.trendsCard}>
              <View style={styles.trendsCardHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="trending-up" size={14} color={COLORS.secondary} />
                  <Text style={styles.trendsCardTitle}>Based on: {activeProfile.favCategory}</Text>
                </View>
                <View style={styles.trendLiveBadge}>
                  <View style={styles.trendLiveDot} />
                  <Text style={styles.trendLiveText}>LIVE</Text>
                </View>
              </View>

              {(TREND_CATALOG[activeProfile.favCategory] || TREND_CATALOG['Curly Textures']).map((trend, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.trendRow}
                  onPress={() => navigation.navigate('VirtualTryOn')}
                  activeOpacity={0.82}
                >
                  <View style={[styles.trendRankBubble, { backgroundColor: trend.color + '18', borderColor: trend.color + '40' }]}>
                    <Text style={[styles.trendRankText, { color: trend.color }]}>#{i + 1}</Text>
                  </View>
                  <View style={styles.trendInfo}>
                    <Text style={styles.trendName}>{trend.name}</Text>
                    <View style={styles.trendMatchRow}>
                      <View style={[styles.trendMatchBar, { width: trend.match * 0.9 }]}>
                        <View style={[styles.trendMatchFill, { width: `${trend.match}%`, backgroundColor: trend.color }]} />
                      </View>
                      <Text style={[styles.trendMatchPct, { color: trend.color }]}>{trend.match}%</Text>
                    </View>
                  </View>
                  <View style={styles.trendBadgeCol}>
                    <Text style={[styles.trendTrendPct, { color: COLORS.success }]}>{trend.trend}</Text>
                    <Ionicons name="chevron-forward" size={12} color="rgba(255,255,255,0.2)" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* ╔══════════════════════════════════════════════════════════╗ */}
            {/* ║  AI FUTURE STYLE FORECASTS                              ║ */}
            {/* ╚══════════════════════════════════════════════════════════╝ */}
            <SectionHeader icon="telescope-outline" label="AI FUTURE FORECASTS" color={COLORS.warning} />
            <View style={styles.futureRecsContainer}>
              {(AI_FUTURE_RECS[activeProfile.id] || AI_FUTURE_RECS['profile_1']).map((rec, i) => (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.futureRecCard,
                    { borderColor: rec.color + '30', backgroundColor: rec.color + '06' }
                  ]}
                  onPress={() => navigation.navigate('VirtualTryOn')}
                  activeOpacity={0.85}
                >
                  {/* Glow top accent */}
                  <View style={[styles.futureRecAccentBar, { backgroundColor: rec.color }]} />

                  <View style={styles.futureRecRow}>
                    <View style={[styles.futureRecIconBox, { backgroundColor: rec.color + '18' }]}>
                      <Ionicons name="sparkles" size={15} color={rec.color} />
                    </View>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.futureRecTitle}>{rec.title}</Text>
                      <Text style={styles.futureRecWhen}>{rec.when}</Text>
                    </View>
                    <View style={[styles.futureRecMatchBadge, { borderColor: rec.color + '50' }]}>
                      <Text style={[styles.futureRecMatchText, { color: rec.color }]}>{rec.match}%</Text>
                    </View>
                  </View>

                  <Text style={styles.futureRecReason}>{rec.reason}</Text>

                  <TouchableOpacity
                    style={[styles.futureRecTryBtn, { borderColor: rec.color + '40' }]}
                    onPress={() => navigation.navigate('VirtualTryOn')}
                  >
                    <Ionicons name="eye-outline" size={11} color={rec.color} style={{ marginRight: 4 }} />
                    <Text style={[styles.futureRecTryText, { color: rec.color }]}>Preview Style</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>

            {/* ╔══════════════════════════════════════════════════════════╗ */}
            {/* ║  AI PERSONALIZATION CONTROLS                            ║ */}
            {/* ╚══════════════════════════════════════════════════════════╝ */}
            <SectionHeader icon="options-outline" label="AI PERSONALIZATION" color={COLORS.secondary} />
            <View style={styles.aiControlsCard}>
              {/* Control rows */}
              {[
                {
                  icon: 'bulb-outline',
                  color: COLORS.secondary,
                  label: 'Smart Recommendations',
                  sub: 'AI curates style feeds based on face & history',
                  active: true,
                },
                {
                  icon: 'analytics-outline',
                  color: COLORS.primary,
                  label: 'Behavioral Learning',
                  sub: 'AI adapts from your try-on interaction patterns',
                  active: true,
                },
                {
                  icon: 'eye-outline',
                  color: '#FF6B9D',
                  label: 'Face-Shape Filtering',
                  sub: 'Only show styles matched to your face geometry',
                  active: true,
                },
                {
                  icon: 'trending-up-outline',
                  color: COLORS.warning,
                  label: 'Trend Awareness Mode',
                  sub: 'Factor in global style trends into AI output',
                  active: false,
                },
                {
                  icon: 'calendar-outline',
                  color: COLORS.success,
                  label: 'Seasonal Style Rotation',
                  sub: 'AI rotates recommendations by season & climate',
                  active: false,
                },
              ].map((ctrl, i, arr) => (
                <View key={i}>
                  <View style={styles.aiCtrlRow}>
                    <View style={[styles.aiCtrlIconBox, { backgroundColor: ctrl.color + '14' }]}>
                      <Ionicons name={ctrl.icon} size={15} color={ctrl.color} />
                    </View>
                    <View style={styles.aiCtrlTextCol}>
                      <Text style={styles.aiCtrlLabel}>{ctrl.label}</Text>
                      <Text style={styles.aiCtrlSub}>{ctrl.sub}</Text>
                    </View>
                    <View style={[
                      styles.aiCtrlToggle,
                      ctrl.active && { backgroundColor: ctrl.color + '30', borderColor: ctrl.color + '70' }
                    ]}>
                      <View style={[
                        styles.aiCtrlKnob,
                        ctrl.active && { marginLeft: 20, backgroundColor: ctrl.color }
                      ]} />
                    </View>
                  </View>
                  {i < arr.length - 1 && <View style={styles.aiCtrlDivider} />}
                </View>
              ))}

              {/* AI Personalization Score */}
              <View style={styles.aiPersonScoreRow}>
                <Ionicons name="star" size={13} color={COLORS.warning} />
                <Text style={styles.aiPersonScoreLabel}>Personalization Score</Text>
                <Text style={styles.aiPersonScoreValue}>{activeProfile.aiAccuracyRating}</Text>
              </View>
            </View>

            {/* SETTINGS & PRIVACY ENTRY POINT */}
            <TouchableOpacity
              style={[styles.settingsEntryCard]}
              onPress={() => navigation.navigate('Settings')}
              activeOpacity={0.87}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <View style={styles.settingsEntryIconBox}>
                  <Ionicons name="settings-outline" size={18} color={COLORS.secondary} />
                </View>
                <View style={{ marginLeft: 12 }}>
                  <Text style={styles.settingsEntryTitle}>Settings & Privacy</Text>
                  <Text style={styles.settingsEntrySubtitle}>Account · Privacy · AI · Appearance</Text>
                </View>
              </View>
              <View style={styles.settingsEntryChevronBox}>
                <Ionicons name="chevron-forward" size={16} color={COLORS.secondary} />
              </View>
            </TouchableOpacity>

            {/* ╔══════════════════════════════════════════════════════════╗ */}
            {/* ║  AI IDENTITY QUICK PORTS                                ║ */}
            {/* ╚══════════════════════════════════════════════════════════╝ */}
            <SectionHeader icon="git-network-outline" label="AI IDENTITY QUICK PORTS" color={COLORS.primary} />
            <TouchableOpacity style={styles.linkGlassCard} onPress={() => navigation.navigate('HairInsights')}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={styles.linkIconBox}>
                  <Ionicons name="pulse" size={16} color={COLORS.secondary} />
                </View>
                <View>
                  <Text style={styles.linkHeadline}>Diagnostic Hair Health Report</Text>
                  <Text style={styles.linkSubtitle}>Scan follicular strands elasticity logs</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color={COLORS.secondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.linkGlassCard} onPress={() => navigation.navigate('Premium')}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={styles.linkIconBox}>
                  <Ionicons name="sparkles" size={16} color={COLORS.secondary} />
                </View>
                <View>
                  <Text style={styles.linkHeadline}>Manage Membership Tier</Text>
                  <Text style={styles.linkSubtitle}>Unlock HD 4K rendering profiles</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color={COLORS.secondary} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.linkGlassCard, { marginBottom: 20 }]} onPress={() => navigation.navigate('Comparison')}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={styles.linkIconBox}>
                  <Ionicons name="git-compare" size={16} color={COLORS.secondary} />
                </View>
                <View>
                  <Text style={styles.linkHeadline}>View Diagnostic Comparisons</Text>
                  <Text style={styles.linkSubtitle}>Reopen A/B structural matches history</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color={COLORS.secondary} />
            </TouchableOpacity>

          </Animated.View>
        )}
      </ScrollView>

      {/* --- MODAL 1: EDIT PROFILE DRAWER --- */}
      <Modal visible={editModalVisible} transparent animationType="slide">
        <View style={styles.drawerOverlay}>
          <TouchableOpacity style={styles.drawerDismissArea} onPress={() => setEditModalVisible(false)} />
          <View style={styles.drawerContainer}>
            <View style={styles.drawerHandle} />
            <Text style={styles.drawerHeaderTitle}>EDIT IDENTITY CREDENTIALS</Text>
            
            <Text style={styles.inputLabelText}>USERNAME LABEL</Text>
            <TextInput 
              style={styles.drawerInput}
              value={editName}
              onChangeText={setEditName}
              placeholder="Username..."
              placeholderTextColor={COLORS.textSecondary}
            />

            <Text style={styles.inputLabelText}>SECURE CLOUD EMAIL</Text>
            <TextInput 
              style={styles.drawerInput}
              value={editEmail}
              onChangeText={setEditEmail}
              placeholder="Email address..."
              placeholderTextColor={COLORS.textSecondary}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <Text style={styles.inputLabelText}>AVATAR URL IDENTIFIER</Text>
            <TextInput 
              style={styles.drawerInput}
              value={editAvatar}
              onChangeText={setEditAvatar}
              placeholder="Custom image link..."
              placeholderTextColor={COLORS.textSecondary}
              autoCapitalize="none"
            />

            <Text style={styles.inputLabelText}>MEMBERSHIP TIER STATUS</Text>
            <View style={styles.subTogglerContainer}>
              <TouchableOpacity 
                style={[styles.subToggleBtn, editSub === 'PRO Premium Member' && styles.subToggleActive]}
                onPress={() => setEditSub('PRO Premium Member')}
              >
                <Text style={[styles.subToggleText, editSub === 'PRO Premium Member' && styles.subToggleTextActive]}>PRO Premium</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.subToggleBtn, editSub === 'Free Guest Tier' && styles.subToggleActive]}
                onPress={() => setEditSub('Free Guest Tier')}
              >
                <Text style={[styles.subToggleText, editSub === 'Free Guest Tier' && styles.subToggleTextActive]}>Free Guest</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.drawerActionsRow}>
              <TouchableOpacity style={styles.drawerSubmitBtn} onPress={handleSaveProfileEdits}>
                <Text style={styles.drawerSubmitBtnText}>Synchronize Identity</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.drawerCancelBtn} onPress={() => setEditModalVisible(false)}>
                <Text style={styles.drawerCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* --- MODAL 2: FACE PROFILE SWITCHER --- */}
      <Modal visible={switcherModalVisible} transparent animationType="slide">
        <View style={styles.drawerOverlay}>
          <TouchableOpacity style={styles.drawerDismissArea} onPress={() => setSwitcherModalVisible(false)} />
          <View style={styles.drawerContainer}>
            <View style={styles.drawerHandle} />
            <Text style={styles.drawerHeaderTitle}>SWITCH SECURE FACE PROFILE SCANS</Text>
            
            <ScrollView style={{ maxHeight: 220 }} showsVerticalScrollIndicator={false}>
              {profilesList.map(item => {
                const isActive = item.id === activeProfileId;
                return (
                  <TouchableOpacity 
                    key={item.id} 
                    style={[styles.switchCardRow, isActive && styles.switchCardRowActive]}
                    onPress={() => handleSwitchProfile(item.id)}
                  >
                    <Image source={{ uri: item.avatarUrl }} style={styles.switchAvatar} />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.switchNameText}>{item.name}</Text>
                      <Text style={styles.switchMetaText}>{item.faceShape} • {item.hairTexture}</Text>
                    </View>
                    {isActive ? (
                      <Ionicons name="checkmark-circle" size={20} color={COLORS.secondary} />
                    ) : (
                      <Ionicons name="ellipse-outline" size={20} color={COLORS.border} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TouchableOpacity 
              style={styles.addScanShortcutBtn}
              onPress={() => {
                setSwitcherModalVisible(false);
                setAddScanModalVisible(true);
              }}
            >
              <Ionicons name="add-circle" size={16} color={COLORS.secondary} />
              <Text style={styles.addScanShortcutText}>Add New Alternate Face Scan</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.drawerCancelBtn, { marginTop: 10 }]} onPress={() => setSwitcherModalVisible(false)}>
              <Text style={styles.drawerCancelBtnText}>Close Panel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* --- MODAL 3: ADD FACE SCAN OVERLAY --- */}
      <Modal visible={addScanModalVisible} transparent animationType="slide">
        <View style={styles.drawerOverlay}>
          <TouchableOpacity style={styles.drawerDismissArea} onPress={() => setAddScanModalVisible(false)} />
          <View style={styles.drawerContainer}>
            <View style={styles.drawerHandle} />
            <Text style={styles.drawerHeaderTitle}>AI STRUCTURAL FACE SCANNER</Text>
            
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 380 }}>
              <Text style={styles.inputLabelText}>SCAN IDENTITY LABEL</Text>
              <TextInput 
                style={styles.drawerInput}
                value={newName}
                onChangeText={setNewName}
                placeholder="e.g. Liam (Clean Shaven Scan)..."
                placeholderTextColor={COLORS.textSecondary}
              />

              <Text style={styles.inputLabelText}>CHOOSE AVATAR PRESET</Text>
              <View style={styles.avatarPresetRow}>
                {PRESET_AVATARS.map((url, index) => {
                  const isSelected = newAvatar === url;
                  return (
                    <TouchableOpacity 
                      key={index} 
                      onPress={() => setNewAvatar(url)}
                      style={[styles.avatarPresetBtn, isSelected && styles.avatarPresetSelected]}
                    >
                      <Image source={{ uri: url }} style={styles.presetAvatarImg} />
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.inputLabelText}>DIAGNOSTIC FACE SHAPE</Text>
              <View style={styles.selectorGrid}>
                {['Oval Face', 'Round Face', 'Square Face', 'Heart Face'].map(shape => (
                  <TouchableOpacity 
                    key={shape} 
                    style={[styles.selectorChip, newShape === shape && styles.selectorChipActive]}
                    onPress={() => setNewShape(shape)}
                  >
                    <Text style={[styles.selectorChipText, newShape === shape && styles.selectorChipTextActive]}>{shape}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabelText}>FOLLICLE TEXTURE RATE</Text>
              <View style={styles.selectorGrid}>
                {['Straight Hair', 'Wavy Hair', 'Curly Hair', 'Coily Hair'].map(tex => (
                  <TouchableOpacity 
                    key={tex} 
                    style={[styles.selectorChip, newTexture === tex && styles.selectorChipActive]}
                    onPress={() => setNewTexture(tex)}
                  >
                    <Text style={[styles.selectorChipText, newTexture === tex && styles.selectorChipTextActive]}>{tex}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabelText}>FOLICLE DENSITY PROFILE</Text>
              <View style={styles.selectorGrid}>
                {['Fine Density', 'Medium Density', 'Thick Density'].map(den => (
                  <TouchableOpacity 
                    key={den} 
                    style={[styles.selectorChip, newDensity === den && styles.selectorChipActive]}
                    onPress={() => setNewDensity(den)}
                  >
                    <Text style={[styles.selectorChipText, newDensity === den && styles.selectorChipTextActive]}>{den}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabelText}>BEARD MATRIX CONFIG</Text>
              <View style={styles.selectorGrid}>
                {['Beard Compatible', 'Clean Shave'].map(brd => (
                  <TouchableOpacity 
                    key={brd} 
                    style={[styles.selectorChip, newBeard === brd && styles.selectorChipActive]}
                    onPress={() => setNewBeard(brd)}
                  >
                    <Text style={[styles.selectorChipText, newBeard === brd && styles.selectorChipTextActive]}>{brd}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={styles.drawerActionsRow}>
              <TouchableOpacity style={styles.drawerSubmitBtn} onPress={handleAddFaceScanSubmit}>
                <Text style={styles.drawerSubmitBtnText}>Synthesize Scan coordinates</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.drawerCancelBtn} onPress={() => setAddScanModalVisible(false)}>
                <Text style={styles.drawerCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* --- MODAL 4: DIAGNOSTIC BADGES bottom sheet --- */}
      <Modal visible={guidelineModalVisible} transparent animationType="slide">
        <View style={styles.drawerOverlay}>
          <TouchableOpacity style={styles.drawerDismissArea} onPress={() => setGuidelineModalVisible(false)} />
          <View style={styles.drawerContainer}>
            <View style={styles.drawerHandle} />
            
            {activeGuideline && (
              <View>
                <Text style={styles.guidelineMetaHeader}>AI SPEC DIAGNOSTIC SUMMARY</Text>
                <Text style={styles.guidelineHeaderTitle}>{activeGuideline.title.toUpperCase()}</Text>
                
                <View style={styles.guidelineValueBadge}>
                  <Ionicons name="checkmark-circle" size={14} color={COLORS.secondary} style={{ marginRight: 6 }} />
                  <Text style={styles.guidelineValueBadgeText}>Detected: {activeGuideline.value}</Text>
                </View>

                <Text style={styles.guidelineText}>{activeGuideline.text}</Text>

                <TouchableOpacity style={styles.guidelineDismissBtn} onPress={() => setGuidelineModalVisible(false)}>
                  <Text style={styles.guidelineDismissBtnText}>Synchronize Diagnostics</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* --- MODAL 5: AI STRUCTURAL SCANNER OVERLAY --- */}
      <Modal visible={isAnalyzing} transparent animationType="fade">
        <View style={styles.scannerOverlay}>
          <View style={styles.scannerContainerContainer}>
            <View style={styles.scannerTopHeader}>
              <Ionicons name="scan-outline" size={24} color={COLORS.secondary} style={styles.scannerGlowIcon} />
              <Text style={styles.scannerTitleText}>AI FOLLICULAR SCANNING IN PROGRESS...</Text>
              <Text style={styles.scannerSubtitleText}>Stabilizing active structural face matrix sweep</Text>
            </View>

            {/* Scanning viewport */}
            <View style={styles.scannerViewportBox}>
              {activeProfile && (
                <Image source={{ uri: activeProfile.avatarUrl }} style={styles.scannerTargetAvatar} />
              )}
              {/* Green scanner laser line */}
              <Animated.View style={[
                styles.scannerBeamLine, 
                { 
                  transform: [{ 
                    translateY: scannerLineAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 178] // Matches scanner viewport inner height (180 - line height)
                    }) 
                  }] 
                }
              ]} />
              
              <View style={styles.cornerMarkerTopLeft} />
              <View style={styles.cornerMarkerTopRight} />
              <View style={styles.cornerMarkerBottomLeft} />
              <View style={styles.cornerMarkerBottomRight} />
            </View>

            {/* Diagnostic stats calibration log */}
            <View style={styles.scannerCalibrateBox}>
              <Text style={styles.calibrateHeading}>CALIBRATING SCAN COORDINATES...</Text>
              <Text style={styles.calibrateLogText}>✓ Vertex coordinates locked: {activeProfile.faceScanWidth}</Text>
              <Text style={styles.calibrateLogText}>✓ Follicular health metric verified: {activeProfile.hairHealth}</Text>
              <Text style={styles.calibrateLogText}>✓ Diagnostic face shape sync: 100%</Text>
            </View>
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

  badgesContainerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  diagnosticBadgeCard: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 3,
  },
  badgeIconBg: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  diagnosticBadgeLabel: {
    color: COLORS.textSecondary,
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  diagnosticBadgeValue: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 4,
    textAlign: 'center',
  },
  tapTipText: {
    color: COLORS.secondary,
    fontSize: 8,
    marginTop: 8,
    fontWeight: '600',
    opacity: 0.6,
  },

  // === PROFILE CARD HEADER ===
  profileHeaderCard: {
    backgroundColor: COLORS.card,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    padding: 18,
    marginBottom: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 6,
  },
  headerTopActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  membershipTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  membershipPro: {
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    borderColor: 'rgba(212, 175, 55, 0.25)',
  },
  membershipFree: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  membershipTagText: {
    fontSize: 8,
    fontWeight: 'bold',
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  joinedText: {
    color: COLORS.textSecondary,
    fontSize: 9,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  // Avatar container with ring
  avatarContainer: {
    position: 'relative',
    width: 76,
    height: 76,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarGlowRing: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 42,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  avatarImg: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2.5,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  avatarStatusDot: {
    position: 'absolute',
    bottom: 3,
    right: 3,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.card,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 4,
  },
  avatarInfoCol: {
    flex: 1,
    marginLeft: 14,
  },
  profileName: {
    color: COLORS.textPrimary,
    fontSize: 19,
    fontWeight: 'bold',
    letterSpacing: 0.4,
    lineHeight: 23,
  },
  profileRoleTag: {
    color: COLORS.secondary,
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 0.7,
    marginTop: 2,
    marginBottom: 1,
    opacity: 0.8,
  },
  profileEmail: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 1,
  },
  profileMetaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,212,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(0,212,255,0.15)',
    borderRadius: 7,
    paddingHorizontal: 7,
    paddingVertical: 3,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  profileMetaPillText: {
    color: COLORS.secondary,
    fontSize: 8,
    fontWeight: 'bold',
    marginLeft: 3,
    letterSpacing: 0.3,
  },
  headerToolbar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.04)',
    paddingTop: 14,
    justifyContent: 'space-between',
  },
  toolbarBtn: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  toolbarIconBox: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: 'rgba(0,212,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(0,212,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  toolbarBtnText: {
    color: COLORS.textSecondary,
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },

  // === GREETINGS BLOCK ===
  greetingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 212, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.18)',
    borderRadius: 18,
    padding: 12,
    marginBottom: 24,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
  },
  greetingIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(0,212,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0,212,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  greetingHeader: {
    color: COLORS.secondary,
    fontSize: 8,
    fontWeight: 'bold',
    letterSpacing: 1.0,
    marginBottom: 3,
    opacity: 0.85,
  },
  greetingText: {
    color: COLORS.textPrimary,
    fontSize: 11.5,
    lineHeight: 16,
    fontWeight: '500',
  },

  // === SECTION HEADER SYSTEM ===
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 12,
    paddingLeft: 2,
  },
  sectionHeaderBar: {
    width: 3,
    height: 14,
    borderRadius: 2,
    marginRight: 8,
  },
  sectionHeaderLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1.1,
    flex: 1,
  },
  // Legacy section title (kept for any stragglers)
  sectionTitle: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1.1,
    marginTop: 22,
    marginBottom: 10,
    paddingLeft: 2,
  },


  // === TELEMETRY ANALYTICS CARD ===
  telemetryCardOuter: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 14,
    marginBottom: 24,
  },
  telemetryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  telemetryTitleText: {
    color: COLORS.textPrimary,
    fontSize: 11,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  glowingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.secondary,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 4,
  },
  telemetryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  telemetryCol: {
    flex: 1,
    alignItems: 'center',
  },
  telemetryLabel: {
    color: COLORS.textSecondary,
    fontSize: 8,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  telemetryValueText: {
    color: COLORS.secondary,
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 4,
  },
  telemetrySubText: {
    color: COLORS.textSecondary,
    fontSize: 7,
    marginTop: 2,
  },
  telemetryColDivider: {
    width: 1,
    height: 25,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },

  // ═══════════════════════════════════════════════════════════
  // PREMIUM STATUS CARD
  // ═══════════════════════════════════════════════════════════
  premiumStatusCard: {
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(212,175,55,0.35)',
    backgroundColor: 'rgba(212,175,55,0.04)',
    padding: 18,
    marginBottom: 20,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  premiumGlowRing: {
    position: 'absolute',
    top: -1,
    left: -1,
    right: -1,
    bottom: -1,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#D4AF37',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
  },
  premiumCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  premiumBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  premiumCrownCircle: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: 'rgba(212,175,55,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumCardPlanLabel: {
    color: 'rgba(212,175,55,0.65)',
    fontSize: 8,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  premiumCardPlanName: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    marginTop: 1,
  },
  premiumActiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,230,118,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0,230,118,0.3)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  premiumActiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.success,
    marginRight: 5,
    shadowColor: COLORS.success,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 4,
  },
  premiumActiveText: {
    color: COLORS.success,
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 0.8,
  },
  premiumStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(212,175,55,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.12)',
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
  },
  premiumStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  premiumStatValue: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  premiumStatLabel: {
    color: 'rgba(212,175,55,0.6)',
    fontSize: 8,
    marginTop: 3,
    fontWeight: 'bold',
    letterSpacing: 0.4,
    textAlign: 'center',
  },
  premiumStatDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(212,175,55,0.15)',
  },
  premiumBenefitsHeading: {
    color: 'rgba(212,175,55,0.6)',
    fontSize: 8,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 10,
  },
  premiumBenefitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 14,
  },
  premiumBenefitChip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '50%',
    paddingVertical: 5,
    paddingRight: 8,
  },
  premiumBenefitLabel: {
    color: '#D4AF37',
    fontSize: 10,
    fontWeight: 'bold',
    lineHeight: 13,
  },
  premiumBenefitDetail: {
    color: 'rgba(212,175,55,0.5)',
    fontSize: 8,
    lineHeight: 12,
    marginTop: 1,
  },
  premiumManageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(212,175,55,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.35)',
    borderRadius: 12,
    paddingVertical: 11,
  },
  premiumManageBtnText: {
    color: '#D4AF37',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.4,
  },

  // ─── Upgrade Banner ──────────────────────────────────────────────────────
  upgradeBannerCard: {
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: 'rgba(212,175,55,0.4)',
    backgroundColor: 'rgba(212,175,55,0.05)',
    padding: 16,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 6,
  },
  upgradeBannerGlow: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    borderRadius: 40,
    backgroundColor: 'rgba(212,175,55,0.06)',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
  },
  upgradeShimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 60,
    backgroundColor: 'rgba(255,255,255,0.06)',
    transform: [{ skewX: '-20deg' }],
  },
  upgradeBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  upgradeBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  upgradeLockIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: 'rgba(212,175,55,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  upgradeTitle: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  upgradeSubtitle: {
    color: 'rgba(212,175,55,0.6)',
    fontSize: 10,
    lineHeight: 14,
  },
  upgradeChevron: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: 'rgba(212,175,55,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  upgradeBenefitRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  upgradeTagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212,175,55,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.2)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  upgradeTagText: {
    color: 'rgba(212,175,55,0.75)',
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },

  // ─── Style Personality ───────────────────────────────────────────────────
  personalityCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: COLORS.card,
    padding: 16,
    marginBottom: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  personalityGlow: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  personalityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  personalityIconRing: {
    width: 48,
    height: 48,
    borderRadius: 16,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  personalityAiLabel: {
    color: COLORS.textSecondary,
    fontSize: 8,
    fontWeight: 'bold',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  personalityTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    letterSpacing: 0.4,
  },
  personalityCycleBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(0,212,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0,212,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  personalityDesc: {
    color: COLORS.textSecondary,
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 14,
  },
  personalityTraitsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  traitPill: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  traitPillText: {
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 0.4,
  },

  // ─── AI Learning Progress ─────────────────────────────────────────────────
  aiLearningCard: {
    backgroundColor: COLORS.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(124,92,252,0.2)',
    padding: 16,
    marginBottom: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  aiLearningHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  aiLearningTitle: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: 'bold',
    marginLeft: 7,
    letterSpacing: 0.3,
  },
  aiBoostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 9,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  aiBoostBtnText: {
    color: COLORS.background,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.4,
  },
  aiProgressBarOuter: {
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 5,
    overflow: 'visible',
    marginBottom: 8,
    position: 'relative',
  },
  aiProgressBarFill: {
    height: '100%',
    borderRadius: 5,
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 6,
  },
  aiProgressKnob: {
    position: 'absolute',
    top: -3,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
  },
  aiProgressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  aiProgressPct: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: 'bold',
  },
  aiProgressSub: {
    color: COLORS.textSecondary,
    fontSize: 10,
  },
  aiLearnMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  aiLearnMetricCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    padding: 10,
    marginHorizontal: 3,
  },
  aiLearnMetricValue: {
    fontSize: 13,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  aiLearnMetricLabel: {
    color: COLORS.textSecondary,
    fontSize: 8,
    fontWeight: 'bold',
    letterSpacing: 0.3,
    textAlign: 'center',
  },

  // ─── Favorite Categories ─────────────────────────────────────────────────
  favCatCard: {
    backgroundColor: COLORS.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    padding: 14,
    marginBottom: 20,
  },
  favCatHint: {
    color: COLORS.textSecondary,
    fontSize: 10,
    marginBottom: 12,
    lineHeight: 14,
  },
  favCatGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  favCatChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 7,
    position: 'relative',
  },
  favCatChipText: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.2,
  },
  favCatActiveDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginLeft: 5,
    shadowOpacity: 0.8,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 0 },
  },
  favCatFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.04)',
    paddingTop: 10,
  },
  favCatFooterText: {
    color: COLORS.success,
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 5,
  },

  // ─── Recommended Trends ──────────────────────────────────────────────────
  trendsCard: {
    backgroundColor: COLORS.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    padding: 14,
    marginBottom: 20,
  },
  trendsCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  trendsCardTitle: {
    color: COLORS.textPrimary,
    fontSize: 11,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  trendLiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,82,82,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,82,82,0.3)',
    borderRadius: 7,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  trendLiveDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.error,
    marginRight: 4,
    shadowColor: COLORS.error,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 3,
  },
  trendLiveText: {
    color: COLORS.error,
    fontSize: 8,
    fontWeight: 'bold',
    letterSpacing: 0.8,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.03)',
  },
  trendRankBubble: {
    width: 36,
    height: 36,
    borderRadius: 11,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  trendRankText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  trendInfo: {
    flex: 1,
  },
  trendName: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  trendMatchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendMatchBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 2,
    overflow: 'hidden',
    marginRight: 6,
  },
  trendMatchFill: {
    height: '100%',
    borderRadius: 2,
  },
  trendMatchPct: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  trendBadgeCol: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  trendTrendPct: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 3,
  },

  // ─── AI Future Recommendations ───────────────────────────────────────────
  futureRecsContainer: {
    marginBottom: 20,
  },
  futureRecCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  futureRecAccentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    borderRadius: 1,
    opacity: 0.6,
  },
  futureRecRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 6,
  },
  futureRecIconBox: {
    width: 36,
    height: 36,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  futureRecTitle: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },
  futureRecWhen: {
    color: COLORS.textSecondary,
    fontSize: 9,
    marginTop: 2,
    fontWeight: 'bold',
  },
  futureRecMatchBadge: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  futureRecMatchText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  futureRecReason: {
    color: COLORS.textSecondary,
    fontSize: 10,
    lineHeight: 14,
    marginBottom: 10,
    fontStyle: 'italic',
  },
  futureRecTryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 7,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  futureRecTryText: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },

  // ─── AI Personalization Controls ─────────────────────────────────────────
  aiControlsCard: {
    backgroundColor: COLORS.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    padding: 14,
    marginBottom: 20,
  },
  aiCtrlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
  },
  aiCtrlIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 11,
  },
  aiCtrlTextCol: {
    flex: 1,
  },
  aiCtrlLabel: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  aiCtrlSub: {
    color: COLORS.textSecondary,
    fontSize: 9,
    marginTop: 2,
    lineHeight: 13,
  },
  aiCtrlToggle: {
    width: 40,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  aiCtrlKnob: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(160,160,176,0.5)',
  },
  aiCtrlDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
    marginLeft: 45,
  },
  aiPersonScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,215,64,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,215,64,0.2)',
    borderRadius: 12,
    padding: 10,
    marginTop: 12,
  },
  aiPersonScoreLabel: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 11,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  aiPersonScoreValue: {
    color: COLORS.warning,
    fontSize: 13,
    fontWeight: 'bold',
  },

  // === SETTINGS ENTRY CARD ===
  settingsEntryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 212, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.18)',
    borderRadius: 18,
    padding: 14,
    marginBottom: 20,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  settingsEntryIconBox: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: 'rgba(0, 212, 255, 0.09)',
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsEntryTitle: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },
  settingsEntrySubtitle: {
    color: COLORS.textSecondary,
    fontSize: 10,
    marginTop: 2,
  },
  settingsEntryChevronBox: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: 'rgba(0, 212, 255, 0.07)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // === LINK GLASS CARDS ===
  linkGlassCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
    padding: 14,
    marginBottom: 10,
  },
  linkIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 212, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  linkHeadline: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  linkSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 9,
    marginTop: 2,
  },

  // === CONTEXT DRAWERS & OVERLAYS ===
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
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  drawerHeaderTitle: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 0.8,
    marginBottom: 16,
  },
  inputLabelText: {
    color: COLORS.secondary,
    fontSize: 8,
    fontWeight: 'bold',
    letterSpacing: 0.8,
    marginTop: 10,
    marginBottom: 6,
    paddingHorizontal: 2,
  },
  drawerInput: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 10,
    color: COLORS.textPrimary,
    fontSize: 12,
    paddingHorizontal: 12,
    height: 38,
    marginBottom: 8,
  },
  subTogglerContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    padding: 2,
    marginBottom: 16,
  },
  subToggleBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  subToggleActive: {
    backgroundColor: COLORS.secondary,
  },
  subToggleText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: 'bold',
  },
  subToggleTextActive: {
    color: COLORS.background,
  },
  drawerActionsRow: {
    flexDirection: 'row',
    marginTop: 15,
  },
  drawerSubmitBtn: {
    flex: 2,
    backgroundColor: COLORS.secondary,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  drawerSubmitBtnText: {
    color: COLORS.background,
    fontSize: 11,
    fontWeight: 'bold',
  },
  drawerCancelBtn: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  drawerCancelBtnText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: 'bold',
  },

  // === METER BAR SYSTEM ===
  meterBarOuter: {
    height: 7,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 4,
    overflow: 'visible',
    position: 'relative',
  },
  meterBarFill: {
    height: '100%',
    borderRadius: 4,
    shadowOpacity: 0.5,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 0 },
  },
  meterBarKnob: {
    position: 'absolute',
    top: -3.5,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: COLORS.card,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 4,
    elevation: 3,
  },

  // === SWITCH CARD ROWS ===
  switchCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.015)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
  },
  switchCardRowActive: {
    borderColor: COLORS.secondary,
    backgroundColor: 'rgba(0, 212, 255, 0.03)',
  },
  switchAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  switchNameText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  switchMetaText: {
    color: COLORS.textSecondary,
    fontSize: 9,
    marginTop: 2,
  },
  addScanShortcutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 10,
  },
  addScanShortcutText: {
    color: COLORS.secondary,
    fontSize: 11,
    fontWeight: 'bold',
    marginLeft: 6,
  },

  // === AVATAR PRESET SELECTOR ===
  avatarPresetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  avatarPresetBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: 'transparent',
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  avatarPresetSelected: {
    borderColor: COLORS.secondary,
  },
  presetAvatarImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  // === SELECTOR GRID CHIPS ===
  selectorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  selectorChip: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginRight: 6,
    marginBottom: 6,
  },
  selectorChipActive: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  selectorChipText: {
    color: COLORS.textSecondary,
    fontSize: 9,
    fontWeight: 'bold',
  },
  selectorChipTextActive: {
    color: COLORS.background,
  },

  // === GUIDELINE bottom sheet CSS ===
  guidelineMetaHeader: {
    color: COLORS.secondary,
    fontSize: 8,
    fontWeight: 'bold',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  guidelineHeaderTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  guidelineValueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 212, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.25)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 14,
  },
  guidelineValueBadgeText: {
    color: COLORS.secondary,
    fontSize: 10,
    fontWeight: 'bold',
  },
  guidelineText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 20,
  },
  guidelineDismissBtn: {
    backgroundColor: COLORS.secondary,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guidelineDismissBtnText: {
    color: COLORS.background,
    fontSize: 11,
    fontWeight: 'bold',
  },

  // === SKELETON LOADER PLATFORM ===
  skeletonContainer: {
    width: '100%',
    paddingVertical: 10,
  },
  skeletonHeader: {
    backgroundColor: 'rgba(255,255,255,0.015)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
    borderRadius: 24,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  skeletonAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginBottom: 12,
  },
  skeletonTextLong: {
    height: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 6,
    width: '60%',
    marginBottom: 8,
  },
  skeletonTextShort: {
    height: 9,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 5,
    width: '30%',
  },
  skeletonGreeting: {
    height: 48,
    backgroundColor: 'rgba(255,255,255,0.015)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
    padding: 12,
    justifyContent: 'center',
    marginBottom: 24,
  },
  skeletonTextMedium: {
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 5,
    width: '45%',
  },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  skeletonGridCard: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.015)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
    borderRadius: 18,
    padding: 12,
    marginBottom: 12,
  },
  skeletonCardCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  skeletonCard: {
    height: 100,
    backgroundColor: 'rgba(255,255,255,0.015)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
    borderRadius: 20,
    padding: 14,
  },

  // === DYNAMIC AI INSIGHTS DASHBOARD CSS ===
  insightsDashboardCard: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
    padding: 16,
    marginBottom: 24,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  insightsCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  insightsCardTitle: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  reAnalysisTextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 212, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  reAnalysisText: {
    color: COLORS.secondary,
    fontSize: 9,
    fontWeight: 'bold',
  },
  scoreMetersContainer: {
    marginBottom: 16,
  },
  scoreMeterRow: {
    marginBottom: 12,
  },
  scoreMeterLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  scoreMeterName: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: 'bold',
  },
  scoreMeterValue: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  meterBarOuter: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  meterBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  miniAnalyticsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  miniAnalyticsCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.015)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    marginHorizontal: 3,
  },
  miniCardLabel: {
    color: COLORS.textSecondary,
    fontSize: 7,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  miniCardValue: {
    color: COLORS.textPrimary,
    fontSize: 11,
    fontWeight: 'bold',
    marginTop: 4,
  },
  miniCardSub: {
    color: COLORS.textSecondary,
    fontSize: 7,
    marginTop: 2,
  },
  insightsListBlock: {
    backgroundColor: 'rgba(255,255,255,0.01)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
  },
  insightsSubHeading: {
    color: COLORS.secondary,
    fontSize: 8,
    fontWeight: 'bold',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  insightItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  insightItemText: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: 10,
    lineHeight: 14,
  },
  fullReportCTA: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    paddingVertical: 12,
    borderRadius: 12,
  },
  fullReportCTAText: {
    color: COLORS.background,
    fontSize: 11,
    fontWeight: 'bold',
    marginLeft: 6,
  },

  // === ANALYTICS DASHBOARD CSS ===
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    padding: 3,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  segmentBtnActive: {
    backgroundColor: COLORS.secondary,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  segmentBtnText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  segmentBtnTextActive: {
    color: COLORS.background,
  },

  // Weekly Bar Chart
  weeklyChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(255,255,255,0.015)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    height: 100,
  },
  weeklyBarWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  weeklyBarLabel: {
    color: COLORS.textSecondary,
    fontSize: 8,
    marginTop: 4,
    fontWeight: 'bold',
  },
  weeklyBarBackground: {
    width: 20,
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 4,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  weeklyBarFill: {
    width: '100%',
    borderRadius: 4,
  },

  // Monthly Bar Chart
  monthlyChart: {
    backgroundColor: 'rgba(255,255,255,0.015)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  monthlyBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  monthlyBarBackground: {
    flex: 1,
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 5,
    overflow: 'hidden',
    marginRight: 8,
  },
  monthlyBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  monthlyBarLabel: {
    color: COLORS.textSecondary,
    fontSize: 9,
    fontWeight: 'bold',
    width: 28,
    textAlign: 'right',
  },

  // Stat Grid
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    width: '31%',
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(0,212,255,0.12)',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  statValue: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 6,
    letterSpacing: 0.5,
  },
  statLabel: {
    color: COLORS.textSecondary,
    fontSize: 8,
    marginTop: 3,
    fontWeight: 'bold',
    letterSpacing: 0.4,
    textAlign: 'center',
  },

  // Dual Info Card (Beard + Color)
  dualInfoCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.015)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  colorSwatch: {
    alignItems: 'center',
  },
  colorCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.15)',
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  colorLabel: {
    color: COLORS.textSecondary,
    fontSize: 9,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  beardInfo: {
    alignItems: 'center',
  },
  beardLabel: {
    color: COLORS.textSecondary,
    fontSize: 9,
    fontWeight: 'bold',
    marginTop: 6,
    textAlign: 'center',
  },

  // Recently Tried Carousel
  recentlyTriedRow: {
    marginBottom: 16,
  },
  recentCard: {
    width: 90,
    height: 110,
    borderRadius: 14,
    overflow: 'hidden',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,212,255,0.15)',
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  recentImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  recentOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  recentMatch: {
    color: COLORS.secondary,
    fontSize: 8,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  // Activity Timeline
  timelineContainer: {
    marginBottom: 20,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.secondary,
    marginTop: 3,
    marginRight: 12,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 3,
  },
  timelineContent: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.015)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
    borderRadius: 10,
    padding: 10,
  },
  timelineTitle: {
    color: COLORS.textPrimary,
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  timelineDesc: {
    color: COLORS.textSecondary,
    fontSize: 9,
    lineHeight: 13,
    marginBottom: 4,
  },
  timelineTime: {
    color: COLORS.secondary,
    fontSize: 8,
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },

  // === AI STRUCTURAL SCANNER OVERLAY CSS ===
  scannerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 10, 12, 0.98)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  scannerContainerContainer: {
    width: '100%',
    alignItems: 'center',
  },
  scannerTopHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  scannerGlowIcon: {
    marginBottom: 8,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  scannerTitleText: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  scannerSubtitleText: {
    color: COLORS.textSecondary,
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
  },
  scannerViewportBox: {
    width: 180,
    height: 180,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.secondary,
    position: 'relative',
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  scannerTargetAvatar: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  scannerBeamLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: COLORS.secondary,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
  },
  cornerMarkerTopLeft: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 15,
    height: 15,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: COLORS.secondary,
  },
  cornerMarkerTopRight: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 15,
    height: 15,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: COLORS.secondary,
  },
  cornerMarkerBottomLeft: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    width: 15,
    height: 15,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderColor: COLORS.secondary,
  },
  cornerMarkerBottomRight: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 15,
    height: 15,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: COLORS.secondary,
  },
  scannerCalibrateBox: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 14,
    marginTop: 24,
  },
  calibrateHeading: {
    color: COLORS.secondary,
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  calibrateLogText: {
    color: COLORS.textSecondary,
    fontSize: 10,
    lineHeight: 16,
  },
});
