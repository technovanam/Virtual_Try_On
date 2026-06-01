import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  Animated, 
  Dimensions, 
  Pressable, 
  Easing,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { useTryOnStore } from '../store/tryOnStore';
import { useAnalysisStore } from '../store/analysisStore';
import { useProfileStore } from '../store/profileStore';

const { width, height } = Dimensions.get('window');
const sliderWidth = width - 32;

// 6 Dynamic UI States enum
const STATES = {
  NO_SELFIE: 'NO_SELFIE',
  SELFIE_UPLOADED: 'SELFIE_UPLOADED',
  AI_ANALYZING: 'AI_ANALYZING',
  HAIR_RENDERING: 'HAIR_RENDERING',
  COMPLETED_RENDER: 'COMPLETED_RENDER',
  FAILED_GENERATION: 'FAILED_GENERATION',
};

// Premium preloaded models
const PRELOADED_MODELS = [
  {
    id: 'model_liam',
    name: 'Liam',
    gender: 'Male',
    faceShape: 'Oval',
    skinTone: 'Fair',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=400&fit=crop',
    base64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
  },
  {
    id: 'model_sophia',
    name: 'Sophia',
    gender: 'Female',
    faceShape: 'Heart',
    skinTone: 'Light Warm',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=400&fit=crop',
    base64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
  },
  {
    id: 'model_marcus',
    name: 'Marcus',
    gender: 'Male',
    faceShape: 'Square',
    skinTone: 'Dark',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop',
    base64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
  }
];

// Rich hairstyles catalog
const HAIRSTYLES_LIST = [
  { id: 'fade_01', name: 'Classic Fade', score: '95%', vibe: 'Sharp & Professional', matchShape: 'Oval', imageUrl: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=200&h=200&fit=crop' },
  { id: 'korean_02', name: 'Korean Textured', score: '92%', vibe: 'Soft & Casual Volume', matchShape: 'Oval', imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop' },
  { id: 'curly_03', name: 'Textured Curly', score: '88%', vibe: 'Bold & Voluminous curls', matchShape: 'Square', imageUrl: 'https://images.unsplash.com/photo-1605497746444-ac9dbd39f4a5?w=200&h=200&fit=crop' },
  { id: 'buzz_04', name: 'Modern Buzz Cut', score: '90%', vibe: 'Minimalist & Rugged cut', matchShape: 'Oval', imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop' }
];

// AI Explanation mapping for styling compatibility
const getAIExplanation = (faceShape, styleId) => {
  const shape = faceShape || 'Oval';
  const explanations = {
    'fade_01': {
      'Oval': 'The Classic Fade structures your Oval face by adding clean, angular definition at the temples, providing a sharp and professional profile.',
      'Square': 'The high contrast of the Classic Fade highlights your strong jawline while elongating your face for a highly masculine, balanced structure.',
      'Heart': 'This fade narrows the side profile to balance your wider forehead, centering focus down towards your eyes and cheekbones.'
    },
    'korean_02': {
      'Oval': 'Textured volume on top complements your Oval proportions naturally, creating a soft, casual flow that highlights your jawline.',
      'Square': 'The textured layers of this cut soften your square jaw angle, introducing rounded organic structure to your forehead.',
      'Heart': 'Textured bangs cover the wider forehead of Heart shapes perfectly, creating an elegant, balanced proportion.'
    },
    'curly_03': {
      'Oval': 'Textured curls bring a bold, volumetric dimension that works beautifully with your balanced Oval facial symmetry.',
      'Square': 'Voluminous curly crops soften sharp facial angles, breaking up square lines with soft organic texture.',
      'Heart': 'Volume on top draws attention upward, balancing a narrow chin structure with playful, textured proportions.'
    },
    'buzz_04': {
      'Oval': 'The Modern Buzz Cut maximizes your high facial symmetry, highlighting your balanced browridge and cheekbone alignment.',
      'Square': 'A minimalist, rugged cut that emphasizes your powerful jawline and symmetrical bone structure with zero styling effort.',
      'Heart': 'A clean buzz cut emphasizes your eyes and cheek structure, creating a highly athletic, sharp demeanor.'
    }
  };
  
  return explanations[styleId]?.[shape] || explanations['fade_01']['Oval'];
};

const normalizeBase64 = (value) => {
  if (!value) return null;
  if (value.startsWith('data:')) return value;
  return `data:image/png;base64,${value}`;
};

export default function VirtualTryOnScreen({ navigation }) {
  const { 
    selectedHairstyle, 
    selectedColor, 
    selectedBeardStyle, 
    setSelectedColor, 
    setSelectedBeardStyle,
    setSelectedHairstyle,
    generateTryOn,
    renderedImageURL,
    isRendering,
    hairColors,
    beardStyles,
    fetchColors,
    fetchBeards,
    isLoadingOptions,
    resetTryOn
  } = useTryOnStore();

  const { userSelfieBase64, currentAnalysis, setUserSelfie } = useAnalysisStore();

  // Screen State
  const [activeState, setActiveState] = useState(STATES.NO_SELFIE);
  const [selectedModel, setSelectedModel] = useState(null);
  const [isQuickUpdating, setIsQuickUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState('styles');
  
  // Interactive Simulation additions
  const [sliderPosition, setSliderPosition] = useState(50);
  const [activeAngle, setActiveAngle] = useState('front');
  const [isRotatingAngle, setIsRotatingAngle] = useState(false);
  const [compareGridMode, setCompareGridMode] = useState(false);
  const [isHdMode, setIsHdMode] = useState(false);

  // Premium Actions & Export states
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [showExportDrawer, setShowExportDrawer] = useState(false);
  const [exportQuality, setExportQuality] = useState('hd'); // 'standard', 'hd', 'ultrahd'
  const [savedStylesList, setSavedStylesList] = useState([]); // Simulation history logger
  const [favoriteStyleIds, setFavoriteStyleIds] = useState([]); // Bookmarked style IDs
  const [showProUpgrade, setShowProUpgrade] = useState(false);

  // Progress ticks status
  const [step1Status, setStep1Status] = useState('pending');
  const [step2Status, setStep2Status] = useState('pending');
  const [step3Status, setStep3Status] = useState('pending');

  // Animation values
  const scanAnim = useRef(new Animated.Value(0)).current;
  const nodeAnim = useRef(new Animated.Value(0)).current;
  const borderPulse = useRef(new Animated.Value(0)).current;
  const fadeImage = useRef(new Animated.Value(0)).current;
  const scaleImage = useRef(new Animated.Value(1.04)).current;
  
  // Custom shimmers & loader loops
  const skeletonPulse = useRef(new Animated.Value(0.3)).current;
  const shimmerSweep = useRef(new Animated.Value(0)).current;

  // Saved successfully animations
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastScale = useRef(new Animated.Value(0.7)).current;
  
  const carouselScrollRef = useRef(null);

  // Load Colors and Beards dynamically on mount, start loader animations
  useEffect(() => {
    fetchColors();
    fetchBeards();

    // Pulse skeleton loader animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(skeletonPulse, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(skeletonPulse, { toValue: 0.3, duration: 800, useNativeDriver: true })
      ])
    ).start();
  }, []);

  // Determine initial state based on active selfie
  useEffect(() => {
    const isDummySelfie = userSelfieBase64 && userSelfieBase64.length < 200;
    if (userSelfieBase64 && !isDummySelfie) {
      setActiveState(STATES.SELFIE_UPLOADED);
      setSelectedModel(null);
    } else if (selectedModel) {
      setActiveState(STATES.SELFIE_UPLOADED);
    } else {
      setActiveState(STATES.NO_SELFIE);
    }
  }, [userSelfieBase64, selectedModel]);

  // Setup loop animations for scanning state
  const startAnimations = () => {
    scanAnim.setValue(0);
    nodeAnim.setValue(0);
    borderPulse.setValue(0);
    shimmerSweep.setValue(0);

    // Diagonal shimmer sweep loop
    Animated.loop(
      Animated.timing(shimmerSweep, {
        toValue: 1,
        duration: 1600,
        easing: Easing.linear,
        useNativeDriver: false
      })
    ).start();

    // Scanline loops
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(scanAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        })
      ])
    ).start();

    // Mapping Node scale
    Animated.loop(
      Animated.sequence([
        Animated.timing(nodeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(nodeAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        })
      ])
    ).start();

    // Pulse border glow
    Animated.loop(
      Animated.sequence([
        Animated.timing(borderPulse, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(borderPulse, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        })
      ])
    ).start();
  };

  // Full AI Generation Trigger
  const triggerAIGeneration = async (hairstyle = selectedHairstyle, color = selectedColor, beard = selectedBeardStyle) => {
    const activeImage = selectedModel ? selectedModel.base64 : userSelfieBase64;
    if (!activeImage) return;

    setActiveState(STATES.AI_ANALYZING);
    setStep1Status('active');
    setStep2Status('pending');
    setStep3Status('pending');
    
    startAnimations();

    setTimeout(() => {
      setStep1Status('done');
      setStep2Status('active');

      setTimeout(() => {
        setStep2Status('done');
        setStep3Status('active');
        setActiveState(STATES.HAIR_RENDERING);

        setTimeout(async () => {
          fadeImage.setValue(0);
          scaleImage.setValue(1.04);
          
          const finalRender = await generateTryOn(normalizeBase64(activeImage));
          
          if (finalRender) {
            setStep3Status('done');
            setActiveState(STATES.COMPLETED_RENDER);
            
            Animated.parallel([
              Animated.timing(fadeImage, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true
              }),
              Animated.timing(scaleImage, {
                toValue: 1.0,
                duration: 650,
                easing: Easing.out(Easing.back(1.2)),
                useNativeDriver: true
              })
            ]).start();
          } else {
            setActiveState(STATES.FAILED_GENERATION);
          }
        }, 1500);
      }, 1200);
    }, 1200);
  };

  // Fast Update custom details instantly
  const triggerInstantUpdate = async (color = selectedColor, beard = selectedBeardStyle, style = selectedHairstyle) => {
    const activeImage = selectedModel ? selectedModel.base64 : userSelfieBase64;
    if (!activeImage) return;

    setIsQuickUpdating(true);
    fadeImage.setValue(0.7);

    const finalRender = await generateTryOn(normalizeBase64(activeImage));

    setIsQuickUpdating(false);
    if (finalRender) {
      setActiveState(STATES.COMPLETED_RENDER);
      Animated.timing(fadeImage, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      }).start();
    } else {
      setActiveState(STATES.FAILED_GENERATION);
    }
  };

  // Split-slider Touch sweep mapping
  const handleSliderTouch = (event) => {
    const x = event.nativeEvent.locationX;
    const percent = Math.max(0, Math.min(100, (x / sliderWidth) * 100));
    setSliderPosition(percent);
  };

  // Rotate simulated angle
  const handleAngleChange = (angle) => {
    if (angle === activeAngle) return;
    setIsRotatingAngle(true);
    setTimeout(() => {
      setActiveAngle(angle);
      setIsRotatingAngle(false);
    }, 900);
  };

  // Switch Model Selection
  const handleSelectModel = (model) => {
    setSelectedModel(model);
    setUserSelfie(model.base64);
    if (!selectedHairstyle) {
      setSelectedHairstyle(HAIRSTYLES_LIST[0]);
    }
  };

  // Swiping quick next/previous
  const handleHairstyleNav = (direction) => {
    if (!selectedHairstyle) return;
    const currentIndex = HAIRSTYLES_LIST.findIndex(h => h.id === selectedHairstyle.id);
    let targetIndex = 0;

    if (direction === 'next') {
      targetIndex = (currentIndex + 1) % HAIRSTYLES_LIST.length;
    } else {
      targetIndex = (currentIndex - 1 + HAIRSTYLES_LIST.length) % HAIRSTYLES_LIST.length;
    }

    const nextStyle = HAIRSTYLES_LIST[targetIndex];
    setSelectedHairstyle(nextStyle);
    triggerAIGeneration(nextStyle);
  };

  // Bookmark / Favorite style trigger
  const handleToggleFavorite = (styleId) => {
    setFavoriteStyleIds(prev => {
      if (prev.includes(styleId)) {
        return prev.filter(id => id !== styleId);
      } else {
        return [...prev, styleId];
      }
    });
  };

  // Premium actions trigger
  const handleSaveStyle = () => {
    if (!selectedHairstyle) return;
    
    const newSave = {
      id: Date.now().toString(),
      style: selectedHairstyle,
      color: selectedColor,
      beard: selectedBeardStyle,
      imageUrl: renderedImageURL || selectedHairstyle.imageUrl,
      time: 'Just Now'
    };

    setSavedStylesList(prev => [newSave, ...prev]);

    setShowSavedToast(true);
    toastOpacity.setValue(0);
    toastScale.setValue(0.7);

    Animated.parallel([
      Animated.timing(toastOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(toastScale, { toValue: 1, duration: 400, easing: Easing.out(Easing.back(1.5)), useNativeDriver: true })
    ]).start(() => {
      setTimeout(() => {
        Animated.timing(toastOpacity, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
          setShowSavedToast(false);
        });
      }, 1500);
    });
  };

  // Continue Editing handler re-loading past configurations
  const handleContinueEditing = (historyItem) => {
    setSelectedHairstyle(historyItem.style);
    setSelectedColor(historyItem.color);
    setSelectedBeardStyle(historyItem.beard);
    triggerInstantUpdate(historyItem.color, historyItem.beard, historyItem.style);
  };

  // Confirm Export
  const handleConfirmExport = () => {
    setShowExportDrawer(false);
    if (exportQuality === 'ultrahd' || exportQuality === 'hd') {
      setShowProUpgrade(true);
    } else {
      Alert.alert(
        'Export Finished', 
        'Standard definition composite downloaded to gallery successfully.',
        [{ text: 'Great' }]
      );
    }
  };

  const handleShare = () => {
    Alert.alert('Share', 'Simulating native share integration. Link generated.', [{ text: 'Awesome' }]);
  };

  // Reset screen
  const handleReset = () => {
    resetTryOn();
    setSelectedModel(null);
    setActiveState(STATES.NO_SELFIE);
  };

  const getTrendingColors = () => hairColors.filter(c => c.trending);
  const getRecommendedColors = () => hairColors.filter(c => c.recommended);

  const scanlineY = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 360],
  });

  const borderColorPulse = borderPulse.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(0, 212, 255, 0.2)', 'rgba(124, 92, 252, 0.7)']
  });

  const nodeScale = nodeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1.2]
  });

  // Diagonal shimmer sweep X translation
  const shimmerTranslateX = shimmerSweep.interpolate({
    inputRange: [0, 1],
    outputRange: [-150, 450]
  });

  const getPerspectiveStyle = () => {
    if (activeAngle === 'left') {
      return { transform: [{ rotateY: '-20deg' }, { scale: 0.96 }] };
    }
    if (activeAngle === 'right') {
      return { transform: [{ rotateY: '20deg' }, { scale: 0.96 }] };
    }
    return { transform: [{ rotateY: '0deg' }] };
  };

  const activeFaceShape = selectedModel ? selectedModel.faceShape : (currentAnalysis?.face_shape || 'Oval');
  const dynamicExplanation = selectedHairstyle ? getAIExplanation(activeFaceShape, selectedHairstyle.id) : '';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      {/* Header Profile Title */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.subtitle}>AI HAIRSTYLE LABORATORY</Text>
          <Text style={styles.header}>Neural Studio</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.arCameraBtn} 
          onPress={() => navigation.navigate('LiveCamera')}
        >
          <Ionicons name="videocam" size={16} color={COLORS.background} />
          <Text style={styles.arCameraText}>Live AR Mode</Text>
        </TouchableOpacity>
      </View>

      {/* RENDER BOX PREVIEW CONTAINER */}
      <View style={styles.previewCardOuter}>
        
        {/* Diagnostic Top Toolbar */}
        {activeState !== STATES.NO_SELFIE && (
          <View style={styles.diagnosticToolbar}>
            <TouchableOpacity 
              style={[styles.diagToggleBtn, isHdMode && styles.activeDiagToggleBtn]}
              onPress={() => setIsHdMode(!isHdMode)}
            >
              <Ionicons name="sparkles" size={12} color={isHdMode ? '#D4AF37' : COLORS.textSecondary} />
              <Text style={[styles.diagToggleBtnText, isHdMode && { color: '#D4AF37' }]}>HD UPSCALING</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.diagToggleBtn, compareGridMode && styles.activeDiagToggleBtn]}
              onPress={() => setCompareGridMode(!compareGridMode)}
            >
              <Ionicons name="grid" size={12} color={compareGridMode ? COLORS.secondary : COLORS.textSecondary} />
              <Text style={[styles.diagToggleBtnText, compareGridMode && { color: COLORS.secondary }]}>SPLIT COMPARE</Text>
            </TouchableOpacity>
          </View>
        )}

        <Animated.View style={[
          styles.previewContainer, 
          { borderColor: isHdMode ? '#D4AF37' : (activeState === STATES.AI_ANALYZING || activeState === STATES.HAIR_RENDERING) ? borderColorPulse : COLORS.border },
          isHdMode && styles.hdBorderGlow
        ]}>
          
          {/* State 1: No Selfie Uploaded */}
          {activeState === STATES.NO_SELFIE && (
            <View style={styles.emptyView}>
              <View style={styles.cyberCircleOuter}>
                <Ionicons name="camera-outline" size={40} color={COLORS.secondary} />
              </View>
              <Text style={styles.emptyTitle}>Upload Face or Select Model</Text>
              <Text style={styles.emptySubtitle}>Experience high-fidelity real-time AI hair fits instantly.</Text>
              
              <View style={styles.emptyActionRow}>
                <TouchableOpacity style={styles.uploadSelfieBtn} onPress={() => navigation.navigate('AIAnalysis')}>
                  <Ionicons name="scan-outline" size={18} color={COLORS.background} />
                  <Text style={styles.uploadSelfieBtnText}>Scan Selfie</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.modelSectionLabel}>OR TRY WITH AI MODELS</Text>
              <View style={styles.modelGrid}>
                {PRELOADED_MODELS.map((model) => (
                  <TouchableOpacity key={model.id} style={styles.modelCard} onPress={() => handleSelectModel(model)}>
                    <Image source={{ uri: model.avatarUrl }} style={styles.modelThumb} />
                    <View style={styles.modelBadge}>
                      <Text style={styles.modelBadgeText}>{model.name}</Text>
                    </View>
                    <Text style={styles.modelMeta}>{model.faceShape}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* State 2: Selfie Loaded */}
          {activeState === STATES.SELFIE_UPLOADED && (
            <View style={styles.imageWrapper}>
              <Image 
                source={{ uri: selectedModel ? selectedModel.avatarUrl : (userSelfieBase64?.startsWith('data:') ? userSelfieBase64 : `data:image/png;base64,${userSelfieBase64}`) }} 
                style={styles.fullImage} 
              />
              <View style={styles.overlayOutline} />
              <View style={styles.readyBadge}>
                <Ionicons name="shield-checkmark" size={14} color={COLORS.success} />
                <Text style={styles.readyBadgeText}>FACE ALIGNED</Text>
              </View>
              <TouchableOpacity style={styles.floatingCenterGenerateBtn} onPress={() => triggerAIGeneration()}>
                <Ionicons name="sparkles" size={18} color={COLORS.background} />
                <Text style={styles.floatingCenterGenerateBtnText}>Synthesize Hairstyle</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* State 3: AI Analyzing / Scanning */}
          {activeState === STATES.AI_ANALYZING && (
            <View style={styles.imageWrapper}>
              <Image 
                source={{ uri: selectedModel ? selectedModel.avatarUrl : (userSelfieBase64?.startsWith('data:') ? userSelfieBase64 : `data:image/png;base64,${userSelfieBase64}`) }} 
                style={styles.fullImage} 
              />
              
              {/* Looping ray-tracing shimmer sweeps */}
              <Animated.View style={[styles.diagonalShimmerSheen, { left: shimmerTranslateX }]} />

              <Animated.View style={[styles.laserScanline, { top: scanlineY }]} />
              
              <Animated.View style={[styles.landmarkDot, { top: 120, left: 120, transform: [{ scale: nodeScale }] }]} />
              <Animated.View style={[styles.landmarkDot, { top: 120, left: 180, transform: [{ scale: nodeScale }] }]} />
              <Animated.View style={[styles.landmarkDot, { top: 160, left: 150, transform: [{ scale: nodeScale }] }]} />
              <Animated.View style={[styles.landmarkDot, { top: 200, left: 100, transform: [{ scale: nodeScale }] }]} />
              <Animated.View style={[styles.landmarkDot, { top: 200, left: 200, transform: [{ scale: nodeScale }] }]} />
              <Animated.View style={[styles.landmarkDot, { top: 230, left: 150, transform: [{ scale: nodeScale }] }]} />

              <View style={styles.scanGlassOverlay}>
                <ActivityIndicator size="small" color={COLORS.secondary} />
                <Text style={styles.scanGlassText}>Analyzing Face Landmark Grid...</Text>
              </View>
            </View>
          )}

          {/* State 4: Hairstyle Rendering */}
          {activeState === STATES.HAIR_RENDERING && (
            <View style={styles.imageWrapper}>
              <Image 
                source={{ uri: selectedModel ? selectedModel.avatarUrl : (userSelfieBase64?.startsWith('data:') ? userSelfieBase64 : `data:image/png;base64,${userSelfieBase64}`) }} 
                style={styles.fullImage} 
              />
              {/* Looping ray-tracing shimmer sweeps */}
              <Animated.View style={[styles.diagonalShimmerSheen, { left: shimmerTranslateX }]} />

              <View style={styles.renderGlassOverlay}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.renderGlassText}>Rendering Composite Hair...</Text>
              </View>
            </View>
          )}

          {/* State 5: Completed Render with Compare split-slider & multi grids */}
          {activeState === STATES.COMPLETED_RENDER && (
            <View style={styles.imageWrapper}>
              
              {compareGridMode ? (
                <View style={styles.compareGridContainer}>
                  <View style={styles.compareGridCol}>
                    <Image source={{ uri: renderedImageURL }} style={styles.fullImage} />
                    <View style={styles.compareGridLabel}>
                      <Text style={styles.compareGridLabelText}>{selectedHairstyle?.name}</Text>
                    </View>
                  </View>
                  <View style={styles.compareGridDivider} />
                  <View style={styles.compareGridCol}>
                    <Image source={{ uri: HAIRSTYLES_LIST[1].imageUrl }} style={styles.fullImage} />
                    <View style={styles.compareGridLabel}>
                      <Text style={styles.compareGridLabelText}>{HAIRSTYLES_LIST[1].name}</Text>
                    </View>
                  </View>
                </View>
              ) : (
                <View 
                  style={styles.imageWrapper}
                  onTouchMove={handleSliderTouch}
                >
                  <Animated.View style={[styles.imageWrapper, getPerspectiveStyle()]}>
                    <Image 
                      source={{ uri: selectedModel ? selectedModel.avatarUrl : (userSelfieBase64?.startsWith('data:') ? userSelfieBase64 : `data:image/png;base64,${userSelfieBase64}`) }} 
                      style={styles.fullImage} 
                    />
                    
                    <View style={[styles.clippedContainer, { width: `${sliderPosition}%` }]}>
                      <Animated.Image 
                        source={{ uri: renderedImageURL }} 
                        style={[
                          styles.fullImage, 
                          styles.hairShadowFilter,
                          { width: sliderWidth, opacity: fadeImage, transform: [{ scale: scaleImage }] }
                        ]} 
                      />
                    </View>

                    <View style={[styles.sliderSeparatorLine, { left: `${sliderPosition}%` }]}>
                      <View style={styles.sliderHandleCircle}>
                        <Ionicons name="swap-horizontal" size={10} color={COLORS.background} />
                      </View>
                    </View>
                  </Animated.View>
                </View>
              )}

              {/* Dynamic Watermark Overlay */}
              <View style={styles.watermarkPreviewShield}>
                <Text style={styles.watermarkText}>HAIRVERSE FREE PREVIEW</Text>
              </View>

              <View style={styles.compatibilityOverlayScore}>
                <Ionicons name="sparkles" size={10} color={COLORS.secondary} />
                <Text style={styles.compatibilityOverlayText}>{selectedHairstyle?.score} AI MATCH</Text>
              </View>

              {isRotatingAngle && (
                <View style={styles.angleRotationOverlay}>
                  <ActivityIndicator size="small" color={COLORS.secondary} />
                  <Text style={styles.angleRotationOverlayText}>Rotating Neural Camera Field...</Text>
                </View>
              )}
            </View>
          )}

          {/* State 6: Failed Generation */}
          {activeState === STATES.FAILED_GENERATION && (
            <View style={styles.emptyView}>
              <Ionicons name="alert-circle-outline" size={48} color={COLORS.error} />
              <Text style={styles.emptyTitle}>Synthesis Interrupted</Text>
              <Text style={styles.emptySubtitle}>AI synthesis lost signal from rendering clusters. Try again.</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={() => triggerAIGeneration()}>
                <Text style={styles.retryBtnText}>Re-attempt Synthesis</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Saved successfully animation floating overlay */}
          {showSavedToast && (
            <Animated.View style={[
              styles.savedToastContainer, 
              { opacity: toastOpacity, transform: [{ scale: toastScale }] }
            ]}>
              <View style={styles.toastCircleIcon}>
                <Ionicons name="checkmark-circle" size={32} color={COLORS.success} />
              </View>
              <Text style={styles.toastTitle}>Saved Successfully</Text>
              <Text style={styles.toastMeta}>Added to your Cyber Collection</Text>
            </Animated.View>
          )}

          {isQuickUpdating && (
            <View style={styles.quickUpdatingOverlay}>
              <ActivityIndicator size="large" color={COLORS.secondary} />
              <Text style={styles.quickUpdatingText}>AI customization morphing...</Text>
            </View>
          )}

        </Animated.View>
      </View>

      {/* MULTILATERAL ANGLE SELECTOR */}
      {activeState === STATES.COMPLETED_RENDER && !compareGridMode && (
        <View style={styles.angleSelectorCard}>
          <Text style={styles.angleLabel}>GENERATE ANOTHER ANGLE</Text>
          <View style={styles.angleRow}>
            <TouchableOpacity 
              style={[styles.angleBtn, activeAngle === 'left' && styles.activeAngleBtn]}
              onPress={() => handleAngleChange('left')}
            >
              <Ionicons name="arrow-undo" size={14} color={activeAngle === 'left' ? COLORS.background : COLORS.textPrimary} />
              <Text style={[styles.angleBtnText, activeAngle === 'left' && { color: COLORS.background }]}>Left Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.angleBtn, activeAngle === 'front' && styles.activeAngleBtn]}
              onPress={() => handleAngleChange('front')}
            >
              <Ionicons name="body" size={14} color={activeAngle === 'front' ? COLORS.background : COLORS.textPrimary} />
              <Text style={[styles.angleBtnText, activeAngle === 'front' && { color: COLORS.background }]}>Front View</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.angleBtn, activeAngle === 'right' && styles.activeAngleBtn]}
              onPress={() => handleAngleChange('right')}
            >
              <Ionicons name="arrow-redo" size={14} color={activeAngle === 'right' ? COLORS.background : COLORS.textPrimary} />
              <Text style={[styles.angleBtnText, activeAngle === 'right' && { color: COLORS.background }]}>Right Profile</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* DYNAMIC POST-RENDER PREMIUM ACTIONS GRID */}
      {activeState === STATES.COMPLETED_RENDER && (
        <View style={styles.actionsGridContainer}>
          <Text style={styles.actionsLabel}>PREMIUM RENDERING CONTROLS</Text>
          
          <View style={styles.actionsGridRow}>
            <TouchableOpacity style={styles.actionGridCard} onPress={handleSaveStyle}>
              <View style={styles.actionGridIconBg}>
                <Ionicons name="bookmark-outline" size={16} color={COLORS.secondary} />
              </View>
              <Text style={styles.actionGridText}>Save Style</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionGridCard} onPress={() => setCompareGridMode(!compareGridMode)}>
              <View style={styles.actionGridIconBg}>
                <Ionicons name="grid-outline" size={16} color={COLORS.secondary} />
              </View>
              <Text style={styles.actionGridText}>Compare</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionGridCard} onPress={() => setShowExportDrawer(true)}>
              <View style={styles.actionGridIconBg}>
                <Ionicons name="download-outline" size={16} color={COLORS.secondary} />
              </View>
              <Text style={styles.actionGridText}>Export HD</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.actionsGridRow}>
            <TouchableOpacity style={styles.actionGridCard} onPress={handleShare}>
              <View style={styles.actionGridIconBg}>
                <Ionicons name="share-social-outline" size={16} color={COLORS.secondary} />
              </View>
              <Text style={styles.actionGridText}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionGridCard} onPress={() => triggerAIGeneration()}>
              <View style={styles.actionGridIconBg}>
                <Ionicons name="refresh-outline" size={16} color={COLORS.secondary} />
              </View>
              <Text style={styles.actionGridText}>Retry</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionGridCard} onPress={() => navigation.navigate('LiveCamera')}>
              <View style={styles.actionGridIconBg}>
                <Ionicons name="videocam-outline" size={16} color={COLORS.secondary} />
              </View>
              <Text style={styles.actionGridText}>Live Preview</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* EXPORT QUALITY DRAWER */}
      {showExportDrawer && (
        <View style={styles.exportDrawerCard}>
          <View style={styles.drawerHeader}>
            <Text style={styles.drawerTitle}>Export Configuration</Text>
            <TouchableOpacity onPress={() => setShowExportDrawer(false)}>
              <Ionicons name="close-circle" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
          <View style={styles.qualityList}>
            <TouchableOpacity 
              style={[styles.qualityItem, exportQuality === 'standard' && styles.activeQualityItem]}
              onPress={() => setExportQuality('standard')}
            >
              <Ionicons name="image-outline" size={18} color={exportQuality === 'standard' ? COLORS.secondary : COLORS.textSecondary} />
              <View style={styles.qualityDetails}>
                <Text style={styles.qualityName}>Standard Quality (720p)</Text>
                <Text style={styles.qualityMeta}>Fast rendering • Standard file size</Text>
              </View>
              <Text style={styles.freeQualityBadge}>FREE</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.qualityItem, exportQuality === 'hd' && styles.activeQualityItem]}
              onPress={() => setExportQuality('hd')}
            >
              <Ionicons name="sparkles" size={18} color={exportQuality === 'hd' ? COLORS.secondary : COLORS.textSecondary} />
              <View style={styles.qualityDetails}>
                <Text style={styles.qualityName}>HD Quality (1080p)</Text>
                <Text style={styles.qualityMeta}>Sharp resolution • Face texture preservation</Text>
              </View>
              <Text style={styles.proQualityBadge}>PRO</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.qualityItem, exportQuality === 'ultrahd' && styles.activeQualityItem]}
              onPress={() => setExportQuality('ultrahd')}
            >
              <Ionicons name="flash-outline" size={18} color={exportQuality === 'ultrahd' ? COLORS.secondary : COLORS.textSecondary} />
              <View style={styles.qualityDetails}>
                <Text style={styles.qualityName}>Ultra HD 4K Quality</Text>
                <Text style={styles.qualityMeta}>SuperRes Neural Upscaling • Print ready</Text>
              </View>
              <Text style={styles.proQualityBadge}>PRO</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.exportConfirmBtn} onPress={handleConfirmExport}>
            <Ionicons name="download-outline" size={18} color={COLORS.background} />
            <Text style={styles.exportConfirmText}>Download Diagnostic Render</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* PRO UPGRADE */}
      {showProUpgrade && (
        <View style={styles.proCard}>
          <View style={styles.proHeader}>
            <Ionicons name="gift" size={24} color="#D4AF37" />
            <Text style={styles.proTitle}>UNLEASH ULTRA HD 4K</Text>
            <TouchableOpacity onPress={() => setShowProUpgrade(false)}>
              <Ionicons name="close" size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.proDesc}>Remove watermarks, unlock super-resolution prints, and toggle Left/Right camera angles at 60fps.</Text>
          <TouchableOpacity style={styles.proUpgradeBtn} onPress={() => { setShowProUpgrade(false); navigation.navigate('Premium'); }}>
            <Text style={styles.proUpgradeBtnText}>Unlock Cyber Pro - $4.99/mo</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* DYNAMIC PROGRESS INDICATORS */}
      {(activeState === STATES.AI_ANALYZING || activeState === STATES.HAIR_RENDERING) && (
        <View style={styles.progressStepsCard}>
          <View style={styles.progressRow}>
            <Ionicons 
              name={step1Status === 'done' ? 'checkmark-circle' : step1Status === 'active' ? 'sync' : 'ellipse-outline'} 
              size={18} 
              color={step1Status === 'done' ? COLORS.success : step1Status === 'active' ? COLORS.secondary : COLORS.textSecondary} 
            />
            <Text style={[styles.stepText, step1Status === 'done' && styles.stepTextDone]}>Detecting Face Shape</Text>
          </View>
          <View style={styles.progressRow}>
            <Ionicons 
              name={step2Status === 'done' ? 'checkmark-circle' : step2Status === 'active' ? 'sync' : 'ellipse-outline'} 
              size={18} 
              color={step2Status === 'done' ? COLORS.success : step2Status === 'active' ? COLORS.secondary : COLORS.textSecondary} 
            />
            <Text style={[styles.stepText, step2Status === 'done' && styles.stepTextDone]}>Analyzing Hair Texture</Text>
          </View>
          <View style={styles.progressRow}>
            <Ionicons 
              name={step3Status === 'done' ? 'checkmark-circle' : step3Status === 'active' ? 'sync' : 'ellipse-outline'} 
              size={18} 
              color={step3Status === 'done' ? COLORS.success : step3Status === 'active' ? COLORS.secondary : COLORS.textSecondary} 
            />
            <Text style={[styles.stepText, step3Status === 'done' && styles.stepTextDone]}>Generating Realistic Hair</Text>
          </View>
        </View>
      )}

      {/* DYNAMIC AI FACE SHAPE DIAGNOSTIC EXPLANATION & TELEMETRY */}
      {activeState === STATES.COMPLETED_RENDER && (
        <View style={styles.explanationCard}>
          <View style={styles.explanationHeaderRow}>
            <View style={styles.bestMatchBadgeLabel}>
              <Ionicons name="sparkles" size={10} color={COLORS.background} />
              <Text style={styles.bestMatchLabelText}>BEST FOR YOUR FACE SHAPE</Text>
            </View>
            <Text style={styles.explanationTitle}>AI Fit Summary</Text>
          </View>
          <Text style={styles.explanationText}>{dynamicExplanation}</Text>
          
          {/* Dynamic real-time cosmetic telemetry feed */}
          <View style={styles.telemetryContainer}>
            <Ionicons name="pulse" size={10} color={COLORS.secondary} />
            <Text style={styles.telemetryText}>
              Lux: 350 (Good) | Nodes: 1,824 | Alignment: 94.6% | STATUS: RENDER_OK
            </Text>
          </View>
        </View>
      )}

      {/* ONLY RENDER INTERACTION PANELS IF WE HAVE CHOSEN A PHOTO/MODEL */}
      {activeState !== STATES.NO_SELFIE && (
        <View>
          
          {/* GLASSMORPHISM CONTROL TABS */}
          <View style={styles.glassTabs}>
            <TouchableOpacity 
              style={[styles.tabItem, activeTab === 'styles' && styles.activeTabItem]}
              onPress={() => setActiveTab('styles')}
            >
              <Ionicons name="cut-outline" size={16} color={activeTab === 'styles' ? COLORS.secondary : COLORS.textSecondary} />
              <Text style={[styles.tabItemText, activeTab === 'styles' && styles.activeTabItemText]}>Styles</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.tabItem, activeTab === 'colors' && styles.activeTabItem]}
              onPress={() => setActiveTab('colors')}
            >
              <Ionicons name="color-palette-outline" size={16} color={activeTab === 'colors' ? COLORS.secondary : COLORS.textSecondary} />
              <Text style={[styles.tabItemText, activeTab === 'colors' && styles.activeTabItemText]}>Colors</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.tabItem, activeTab === 'beard' && styles.activeTabItem]}
              onPress={() => setActiveTab('beard')}
            >
              <Ionicons name="sparkles-outline" size={16} color={activeTab === 'beard' ? COLORS.secondary : COLORS.textSecondary} />
              <Text style={[styles.tabItemText, activeTab === 'beard' && styles.activeTabItemText]}>Beards</Text>
            </TouchableOpacity>
          </View>

          {/* TAB 1 CONTENT: DYNAMIC HAIRSTYLE CAROUSEL */}
          {activeTab === 'styles' && (
            <View style={styles.controlPanel}>
              <View style={styles.carouselHeader}>
                <Text style={styles.controlTitle}>Swipe & Choose Hairstyle</Text>
                <View style={styles.arrowRow}>
                  <TouchableOpacity style={styles.arrowBtn} onPress={() => handleHairstyleNav('prev')}>
                    <Ionicons name="chevron-back" size={18} color={COLORS.textPrimary} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.arrowBtn} onPress={() => handleHairstyleNav('next')}>
                    <Ionicons name="chevron-forward" size={18} color={COLORS.textPrimary} />
                  </TouchableOpacity>
                </View>
              </View>

              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                contentContainerStyle={styles.carouselContainer}
                ref={carouselScrollRef}
              >
                {HAIRSTYLES_LIST.map((style) => {
                  const isSelected = selectedHairstyle?.id === style.id;
                  const isBookmarked = favoriteStyleIds.includes(style.id);
                  
                  return (
                    <TouchableOpacity 
                      key={style.id} 
                      style={[styles.hairCard, isSelected && styles.activeHairCard]}
                      onPress={() => {
                        setSelectedHairstyle(style);
                        triggerAIGeneration(style);
                      }}
                      activeOpacity={0.8}
                    >
                      <Image source={{ uri: style.imageUrl }} style={styles.hairCardThumb} />
                      
                      <TouchableOpacity 
                        style={styles.favoriteHeartBtn}
                        onPress={() => handleToggleFavorite(style.id)}
                      >
                        <Ionicons 
                          name={isBookmarked ? "heart" : "heart-outline"} 
                          size={14} 
                          color={isBookmarked ? COLORS.error : "#FFF"} 
                        />
                      </TouchableOpacity>

                      <View style={styles.hairCardInfo}>
                        <Text style={styles.hairCardName}>{style.name}</Text>
                        <Text style={styles.hairCardVibe}>{style.vibe}</Text>
                        <View style={styles.suitabilityBadge}>
                          <Text style={styles.suitabilityText}>{style.score} Match</Text>
                        </View>
                      </View>
                      {isSelected && (
                        <View style={styles.activeCheckCircle}>
                          <Ionicons name="checkmark" size={12} color={COLORS.background} />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* RECOMMENDED FOR YOU FEED */}
              <View style={styles.recommendedAISection}>
                <View style={styles.recHeaderRow}>
                  <View style={styles.badgeAI}>
                    <Ionicons name="sparkles" size={10} color={COLORS.secondary} />
                    <Text style={styles.badgeAIText}>AI MATCH FEED</Text>
                  </View>
                  <Text style={styles.recLabel}>Recommended for you</Text>
                </View>

                {HAIRSTYLES_LIST.map((style, idx) => {
                  const fitsShape = style.matchShape === activeFaceShape;
                  if (!fitsShape) return null;
                  
                  return (
                    <View key={`rec_${style.id}`} style={styles.recListItem}>
                      <Image source={{ uri: style.imageUrl }} style={styles.recListThumb} />
                      <View style={styles.recListDetails}>
                        <Text style={styles.recListName}>{style.name}</Text>
                        <Text style={styles.recListVibe}>Complements {activeFaceShape} Face Symmetry</Text>
                        <View style={styles.recSymmetryRow}>
                          <View style={styles.neonProgressBarBg}>
                            <View style={[styles.neonProgressBarFill, { width: style.score }]} />
                          </View>
                          <Text style={styles.recListScore}>{style.score}</Text>
                        </View>
                      </View>
                      <TouchableOpacity 
                        style={styles.recQuickTryBtn}
                        onPress={() => {
                          setSelectedHairstyle(style);
                          triggerAIGeneration(style);
                        }}
                      >
                        <Text style={styles.recQuickTryText}>TRY</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>

            </View>
          )}

          {/* TAB 2 CONTENT: DYNAMIC REAL-TIME COLORS */}
          {activeTab === 'colors' && (
            <View style={styles.controlPanel}>
              
              {/* PULSING GLASSMORPHIC SKELETON LOADER FOR HAIR COLORS */}
              {isLoadingOptions ? (
                <View>
                  <Text style={styles.sectionHeading}>Recommended Colors</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.colorSwatchesScroll}>
                    {[1, 2, 3].map((n) => (
                      <Animated.View key={`skeleton_col_${n}`} style={[styles.colorDetailsCardSkeleton, { opacity: skeletonPulse }]}>
                        <View style={styles.skeletonCircle} />
                        <View style={styles.skeletonTextLineShort} />
                        <View style={styles.skeletonTextLineLong} />
                      </Animated.View>
                    ))}
                  </ScrollView>
                </View>
              ) : (
                <View>
                  <Text style={styles.sectionHeading}>Recommended Colors</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.colorSwatchesScroll}>
                    {getRecommendedColors().map((color) => {
                      const isSelected = selectedColor === color.name;
                      return (
                        <TouchableOpacity 
                          key={`rec_col_${color.id}`} 
                          style={[styles.colorDetailsCard, isSelected && styles.activeColorDetailsCard]}
                          onPress={() => {
                            setSelectedColor(color.name);
                            triggerInstantUpdate(color.name);
                          }}
                          activeOpacity={0.8}
                        >
                          <View style={styles.gradientCircleContainer}>
                            <View style={[styles.gradientSwatchColor, { backgroundColor: color.hex }]} />
                            <View style={styles.gradientSwatchShine} />
                          </View>
                          <View style={styles.colorSpecs}>
                            <Text style={styles.colorSwatchName}>{color.name}</Text>
                            <Text style={styles.colorSkinMatch}>{color.skinCompatibility}</Text>
                            <Text style={styles.colorPop}>{color.popularity}% Popular</Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>

                  <Text style={styles.sectionHeading}>Trending Shades</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.colorSwatchesScroll}>
                    {getTrendingColors().map((color) => {
                      const isSelected = selectedColor === color.name;
                      return (
                        <TouchableOpacity 
                          key={`trend_col_${color.id}`} 
                          style={[styles.colorDetailsCard, isSelected && styles.activeColorDetailsCard]}
                          onPress={() => {
                            setSelectedColor(color.name);
                            triggerInstantUpdate(color.name);
                          }}
                          activeOpacity={0.8}
                        >
                          <View style={styles.gradientCircleContainer}>
                            <View style={[styles.gradientSwatchColor, { backgroundColor: color.hex }]} />
                            <View style={styles.gradientSwatchShine} />
                          </View>
                          <View style={styles.colorSpecs}>
                            <Text style={styles.colorSwatchName}>{color.name}</Text>
                            <Text style={styles.colorSkinMatch}>{color.skinCompatibility}</Text>
                            <Text style={styles.colorPop}>{color.popularity}% Popular</Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              )}

            </View>
          )}

          {/* TAB 3 CONTENT: DYNAMIC REAL-TIME BEARDS */}
          {activeTab === 'beard' && (
            <View style={styles.controlPanel}>
              
              {/* PULSING GLASSMORPHIC SKELETON LOADER FOR BEARDS */}
              {isLoadingOptions ? (
                <View>
                  <Text style={styles.controlTitle}>Select Beard Architecture</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.beardsScrollContainer}>
                    {[1, 2, 3].map((n) => (
                      <Animated.View key={`skeleton_beard_${n}`} style={[styles.beardCardSkeleton, { opacity: skeletonPulse }]}>
                        <View style={styles.skeletonThumbnail} />
                        <View style={styles.skeletonTextLineShort} />
                      </Animated.View>
                    ))}
                  </ScrollView>
                </View>
              ) : (
                <View>
                  <Text style={styles.controlTitle}>Select Beard Architecture</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.beardsScrollContainer}>
                    {beardStyles.map((beard) => {
                      const isSelected = selectedBeardStyle === beard.name;
                      return (
                        <TouchableOpacity 
                          key={`beard_${beard.id}`} 
                          style={[styles.beardCard, isSelected && styles.activeBeardCard]}
                          onPress={() => {
                            setSelectedBeardStyle(beard.name);
                            triggerInstantUpdate(selectedColor, beard.name);
                          }}
                          activeOpacity={0.85}
                        >
                          <Image source={{ uri: beard.thumbnail }} style={styles.beardCardThumb} />
                          
                          <View style={styles.beardCardInfo}>
                            <Text style={styles.beardCardName}>{beard.name}</Text>
                            <Text style={styles.beardCardScore}>AI Match: {beard.compatibility}%</Text>
                          </View>

                          {beard.bestMatch && (
                            <View style={styles.bestMatchBadge}>
                              <Text style={styles.bestMatchText}>BEST MATCH</Text>
                            </View>
                          )}

                          {isSelected && (
                            <View style={styles.beardCheckCircle}>
                              <Ionicons name="checkmark" size={10} color={COLORS.background} />
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              )}

            </View>
          )}

          {/* AI SIMULATION HISTORY FEED */}
          {savedStylesList.length > 0 && (
            <View style={styles.historySectionContainer}>
              <Text style={styles.historyHeading}>SIMULATION HISTORY</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.historyScroll}>
                {savedStylesList.map((item) => (
                  <TouchableOpacity 
                    key={item.id} 
                    style={styles.historyCard}
                    onPress={() => handleContinueEditing(item)}
                  >
                    <Image source={{ uri: item.imageUrl }} style={styles.historyThumb} />
                    <View style={styles.historyInfo}>
                      <Text style={styles.historyStyleName}>{item.style.name}</Text>
                      <Text style={styles.historyMetaText}>{item.color} • {item.beard}</Text>
                      <Text style={styles.historyLabelAction}>Continue Editing</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

        </View>
      )}
    </ScrollView>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 10,
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
  arCameraBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  arCameraText: {
    color: COLORS.background,
    fontWeight: 'bold',
    fontSize: 12,
    marginLeft: 6,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 212, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.25)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  resetBtnText: {
    color: COLORS.secondary,
    fontWeight: 'bold',
    fontSize: 12,
    marginLeft: 6,
  },
  
  // PREVIEW CONTAINER CARD
  previewCardOuter: {
    width: '100%',
    height: 380,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: '#0A0A0F',
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
    position: 'relative',
  },
  previewContainer: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: COLORS.card,
  },
  hdBorderGlow: {
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 16,
    elevation: 10,
  },

  // SHIMMER SWEER RAY-TRACING EFFECT
  diagonalShimmerSheen: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    transform: [{ skewX: '-30deg' }],
    zIndex: 85,
  },

  // DIAGNOSTIC TOOLBAR
  diagnosticToolbar: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 100,
  },
  diagToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 10, 15, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  activeDiagToggleBtn: {
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(18, 18, 26, 0.95)',
  },
  diagToggleBtnText: {
    color: COLORS.textSecondary,
    fontSize: 8,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  
  // EMPTY VIEW STATE
  emptyView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  cyberCircleOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 212, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  emptySubtitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  emptyActionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  uploadSelfieBtn: {
    flexDirection: 'row',
    backgroundColor: COLORS.secondary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 14,
    alignItems: 'center',
  },
  uploadSelfieBtnText: {
    color: COLORS.background,
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 8,
  },
  modelSectionLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    letterSpacing: 2,
    marginBottom: 12,
  },
  modelGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modelCard: {
    width: '30%',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 12,
    overflow: 'hidden',
    alignItems: 'center',
    paddingBottom: 8,
  },
  modelThumb: {
    width: '100%',
    height: 70,
    resizeMode: 'cover',
  },
  modelBadge: {
    backgroundColor: COLORS.primary,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 8,
    marginTop: -8,
  },
  modelBadgeText: {
    color: COLORS.textPrimary,
    fontSize: 8,
    fontWeight: 'bold',
  },
  modelMeta: {
    color: COLORS.textSecondary,
    fontSize: 9,
    marginTop: 4,
  },

  // IMAGE WRAPPERS
  imageWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  fullImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlayOutline: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 212, 255, 0.3)',
    borderRadius: 20,
  },
  readyBadge: {
    position: 'absolute',
    top: 55,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 230, 118, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.35)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  readyBadgeText: {
    color: COLORS.success,
    fontSize: 9,
    fontWeight: 'bold',
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  floatingCenterGenerateBtn: {
    position: 'absolute',
    bottom: 24,
    left: '15%',
    right: '15%',
    backgroundColor: COLORS.secondary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 6,
  },
  floatingCenterGenerateBtnText: {
    color: COLORS.background,
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 8,
  },

  // ANIMS SCANNING
  laserScanline: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: COLORS.secondary,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 8,
  },
  landmarkDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00D4FF',
    shadowColor: '#00D4FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
  },
  scanGlassOverlay: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(18, 18, 26, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanGlassText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    marginLeft: 8,
    fontWeight: '500',
  },
  renderGlassOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 10, 15, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  renderGlassText: {
    color: COLORS.secondary,
    fontSize: 15,
    marginTop: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },

  // COMPLETED STATE INTERACTIVE FEATURES
  clippedContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  hairShadowFilter: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  sliderSeparatorLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: COLORS.secondary,
    zIndex: 90,
  },
  sliderHandleCircle: {
    position: 'absolute',
    top: '50%',
    left: -12,
    marginTop: -12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
  compatibilityOverlayScore: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(18, 18, 26, 0.85)',
    borderWidth: 1.5,
    borderColor: COLORS.secondary,
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 8,
    zIndex: 95,
  },
  compatibilityOverlayText: {
    color: COLORS.textPrimary,
    fontSize: 9,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  watermarkPreviewShield: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    zIndex: 95,
  },
  watermarkText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 8,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },

  // ROTATION
  angleRotationOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 10, 15, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  angleRotationOverlayText: {
    color: COLORS.secondary,
    fontSize: 12,
    marginTop: 8,
    fontWeight: 'bold',
  },

  // MULTI-STYLE COMPARE
  compareGridContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#000',
  },
  compareGridCol: {
    flex: 1,
    position: 'relative',
  },
  compareGridDivider: {
    width: 2,
    backgroundColor: COLORS.secondary,
  },
  compareGridLabel: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  compareGridLabelText: {
    color: '#FFF',
    fontSize: 8,
    fontWeight: 'bold',
  },

  // SAVED SUCCESSFUL TOAST
  savedToastContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(18, 18, 26, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 200,
  },
  toastCircleIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0, 230, 118, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  toastTitle: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: 'bold',
  },
  toastMeta: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 6,
  },

  // QUICK UPDATING LOADER OVERLAY
  quickUpdatingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 10, 15, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickUpdatingText: {
    color: COLORS.secondary,
    fontSize: 13,
    marginTop: 10,
    fontWeight: 'bold',
  },

  // ANGLES CARD
  angleSelectorCard: {
    backgroundColor: 'rgba(18, 18, 26, 0.7)',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    marginBottom: 16,
    alignItems: 'center',
  },
  angleLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  angleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  angleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 8,
    borderRadius: 10,
    width: '31%',
  },
  activeAngleBtn: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  angleBtnText: {
    color: COLORS.textPrimary,
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 6,
  },

  // DYNAMIC POST-RENDER PREMIUM ACTIONS GRID
  actionsGridContainer: {
    backgroundColor: 'rgba(18, 18, 26, 0.7)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    marginBottom: 16,
  },
  actionsLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    letterSpacing: 1.5,
    marginBottom: 12,
    textAlign: 'center',
  },
  actionsGridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  actionGridCard: {
    width: '31%',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  actionGridIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 212, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionGridText: {
    color: COLORS.textPrimary,
    fontSize: 11,
    fontWeight: 'bold',
  },

  // EXPORT DRAWER CARD
  exportDrawerCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 16,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  drawerTitle: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: 'bold',
  },
  qualityList: {
    marginBottom: 20,
  },
  qualityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  activeQualityItem: {
    borderColor: COLORS.secondary,
    backgroundColor: 'rgba(0, 212, 255, 0.03)',
  },
  qualityDetails: {
    flex: 1,
    marginLeft: 12,
  },
  qualityName: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  qualityMeta: {
    color: COLORS.textSecondary,
    fontSize: 9,
    marginTop: 2,
  },
  freeQualityBadge: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: COLORS.textPrimary,
    fontSize: 8,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  proQualityBadge: {
    backgroundColor: '#D4AF37',
    color: COLORS.background,
    fontSize: 8,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  exportConfirmBtn: {
    backgroundColor: COLORS.secondary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 14,
  },
  exportConfirmText: {
    color: COLORS.background,
    fontWeight: 'bold',
    fontSize: 13,
    marginLeft: 8,
  },

  // PRO CARD
  proCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#D4AF37',
    padding: 16,
    marginBottom: 16,
  },
  proHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  proTitle: {
    color: '#D4AF37',
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 0.5,
    flex: 1,
    marginLeft: 8,
  },
  proDesc: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 16,
  },
  proUpgradeBtn: {
    backgroundColor: '#D4AF37',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  proUpgradeBtnText: {
    color: COLORS.background,
    fontWeight: 'bold',
    fontSize: 13,
  },

  // EXPLANATION DIAGNOSTIC CARD
  explanationCard: {
    backgroundColor: 'rgba(18, 18, 26, 0.7)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    marginBottom: 20,
  },
  explanationHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bestMatchBadgeLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  bestMatchLabelText: {
    color: COLORS.background,
    fontSize: 8,
    fontWeight: 'bold',
    marginLeft: 3,
  },
  explanationTitle: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  explanationText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  telemetryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    paddingTop: 10,
    marginTop: 10,
  },
  telemetryText: {
    color: COLORS.textSecondary,
    fontSize: 9,
    fontFamily: 'System',
    marginLeft: 6,
    letterSpacing: 0.5,
  },

  // PROGRESS STEPS CARD
  progressStepsCard: {
    backgroundColor: 'rgba(18, 18, 26, 0.7)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    marginBottom: 20,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  stepText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginLeft: 10,
  },
  stepTextDone: {
    color: COLORS.success,
    textDecorationLine: 'line-through',
    opacity: 0.8,
  },

  // TABS NAVIGATION SYSTEM
  glassTabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(18, 18, 26, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 4,
    marginBottom: 16,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
  },
  activeTabItem: {
    backgroundColor: 'rgba(0, 212, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.15)',
  },
  tabItemText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  activeTabItemText: {
    color: COLORS.secondary,
  },

  // CONTROL PANELS
  controlPanel: {
    backgroundColor: 'rgba(18, 18, 26, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
  },
  controlTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  carouselHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  arrowRow: {
    flexDirection: 'row',
  },
  arrowBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },

  // SWIPE CAROUSEL CARDS
  carouselContainer: {
    paddingRight: 16,
    paddingBottom: 16,
  },
  hairCard: {
    width: 140,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    overflow: 'hidden',
    marginRight: 12,
    position: 'relative',
  },
  activeHairCard: {
    borderColor: COLORS.secondary,
    borderWidth: 1.5,
  },
  hairCardThumb: {
    width: '100%',
    height: 90,
    resizeMode: 'cover',
  },
  favoriteHeartBtn: {
    position: 'absolute',
    top: 6,
    left: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  hairCardInfo: {
    padding: 8,
  },
  hairCardName: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  hairCardVibe: {
    color: COLORS.textSecondary,
    fontSize: 9,
    marginTop: 2,
  },
  suitabilityBadge: {
    backgroundColor: 'rgba(0, 212, 255, 0.08)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  suitabilityText: {
    color: COLORS.secondary,
    fontSize: 8,
    fontWeight: 'bold',
  },
  activeCheckCircle: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // AI RECOMMENDATIONS SECTION
  recommendedAISection: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingTop: 16,
  },
  recHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  badgeAI: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 212, 255, 0.08)',
    borderColor: 'rgba(0, 212, 255, 0.2)',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 2,
    paddingHorizontal: 6,
    marginRight: 8,
  },
  badgeAIText: {
    color: COLORS.secondary,
    fontSize: 8,
    fontWeight: 'bold',
    marginLeft: 3,
  },
  recLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  recListItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
    marginBottom: 10,
  },
  recListThumb: {
    width: 50,
    height: 50,
    borderRadius: 10,
  },
  recListDetails: {
    flex: 1,
    marginLeft: 12,
  },
  recListName: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: 'bold',
  },
  recListVibe: {
    color: COLORS.textSecondary,
    fontSize: 9,
    marginTop: 2,
  },
  recSymmetryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  neonProgressBarBg: {
    flex: 0.6,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 2,
    marginRight: 8,
  },
  neonProgressBarFill: {
    height: '100%',
    backgroundColor: COLORS.secondary,
    borderRadius: 2,
  },
  recListScore: {
    color: COLORS.secondary,
    fontSize: 9,
    fontWeight: 'bold',
  },
  recQuickTryBtn: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  recQuickTryText: {
    color: COLORS.textPrimary,
    fontSize: 10,
    fontWeight: 'bold',
  },

  // COLORS TAB DESIGN
  sectionHeading: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: 8,
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  colorSwatchesScroll: {
    paddingBottom: 12,
  },
  colorDetailsCard: {
    width: 140,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
    padding: 10,
    marginRight: 10,
    alignItems: 'center',
  },
  activeColorDetailsCard: {
    borderColor: COLORS.secondary,
    borderWidth: 1.5,
  },
  gradientCircleContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 8,
  },
  gradientSwatchColor: {
    width: '100%',
    height: '100%',
  },
  gradientSwatchShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.15)',
    opacity: 0.5,
  },
  colorSpecs: {
    alignItems: 'center',
  },
  colorSwatchName: {
    color: COLORS.textPrimary,
    fontSize: 11,
    fontWeight: 'bold',
  },
  colorSkinMatch: {
    color: COLORS.textSecondary,
    fontSize: 9,
    marginTop: 2,
    textAlign: 'center',
  },
  colorPop: {
    color: COLORS.secondary,
    fontSize: 9,
    fontWeight: 'bold',
    marginTop: 4,
  },

  // GLASSMORPHIC SKELETON CARDS
  colorDetailsCardSkeleton: {
    width: 140,
    height: 120,
    backgroundColor: 'rgba(18, 18, 26, 0.4)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  skeletonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginBottom: 8,
  },
  skeletonTextLineShort: {
    width: 60,
    height: 10,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginBottom: 6,
  },
  skeletonTextLineLong: {
    width: 90,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  
  // BEARD SKELETON
  beardCardSkeleton: {
    width: 130,
    height: 140,
    backgroundColor: 'rgba(18, 18, 26, 0.4)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
    marginRight: 10,
    overflow: 'hidden',
  },
  skeletonThumbnail: {
    width: '100%',
    height: 80,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginBottom: 10,
  },

  // BEARDS TAB DESIGN
  beardsScrollContainer: {
    paddingBottom: 12,
  },
  beardCard: {
    width: 130,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
    overflow: 'hidden',
    marginRight: 10,
    position: 'relative',
  },
  activeBeardCard: {
    borderColor: COLORS.secondary,
    borderWidth: 1.5,
  },
  beardCardThumb: {
    width: '100%',
    height: 80,
    resizeMode: 'cover',
  },
  beardCardInfo: {
    padding: 8,
  },
  beardCardName: {
    color: COLORS.textPrimary,
    fontSize: 11,
    fontWeight: 'bold',
  },
  beardCardScore: {
    color: COLORS.secondary,
    fontSize: 9,
    marginTop: 2,
    fontWeight: 'bold',
  },
  bestMatchBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: COLORS.primary,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  bestMatchText: {
    color: COLORS.textPrimary,
    fontSize: 7,
    fontWeight: 'bold',
  },
  beardCheckCircle: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // SIMULATION HISTORY SECTION
  historySectionContainer: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingTop: 20,
  },
  historyHeading: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  historyScroll: {
    paddingBottom: 16,
  },
  historyCard: {
    flexDirection: 'row',
    width: 200,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    padding: 8,
    marginRight: 10,
    alignItems: 'center',
  },
  historyThumb: {
    width: 44,
    height: 44,
    borderRadius: 8,
  },
  historyInfo: {
    flex: 1,
    marginLeft: 10,
  },
  historyStyleName: {
    color: COLORS.textPrimary,
    fontSize: 11,
    fontWeight: 'bold',
  },
  historyMetaText: {
    color: COLORS.textSecondary,
    fontSize: 9,
    marginTop: 2,
  },
  historyLabelAction: {
    color: COLORS.secondary,
    fontSize: 9,
    fontWeight: 'bold',
    marginTop: 4,
  },

  retryBtn: {
    marginTop: 14,
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  retryBtnText: {
    color: COLORS.textPrimary,
    fontWeight: 'bold',
    fontSize: 12,
  },
});
