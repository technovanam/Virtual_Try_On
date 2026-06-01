import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  ActivityIndicator, 
  Animated, 
  Dimensions, 
  Pressable 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { useTryOnStore } from '../store/tryOnStore';

import { USE_NATIVE_DRIVER } from '../constants/nativeDriver';

const { width } = Dimensions.get('window');

const LIVE_HAIRSTYLES = [
  { id: 'fade_01', name: 'Classic Fade', score: '95%', imageUrl: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=100&h=100&fit=crop' },
  { id: 'korean_02', name: 'Korean Textured', score: '92%', imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop' },
  { id: 'curly_03', name: 'Textured Curly', score: '88%', imageUrl: 'https://images.unsplash.com/photo-1605497746444-ac9dbd39f4a5?w=100&h=100&fit=crop' },
  { id: 'buzz_04', name: 'Modern Buzz Cut', score: '90%', imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop' }
];

const LIVE_COLORS = [
  { name: 'Black', hex: '#09090C' },
  { name: 'Dark Brown', hex: '#3C2F2F' },
  { name: 'Light Brown', hex: '#8B5A2B' },
  { name: 'Blonde', hex: '#D4AF37' },
  { name: 'Burgundy', hex: '#800020' },
  { name: 'Silver', hex: '#C0C0C0' }
];

const LIVE_BEARDS = [
  { name: 'Clean Shave', thumbnail: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=100&h=100&fit=crop' },
  { name: 'Stubble', thumbnail: 'https://images.unsplash.com/photo-1605497746444-ac9dbd39f4a5?w=100&h=100&fit=crop' },
  { name: 'Short Beard', thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop' },
  { name: 'Full Beard', thumbnail: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop' },
  { name: 'Fade Beard', thumbnail: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop' }
];

export default function LiveCameraScreen({ navigation }) {
  // Navigation authorization flows
  const [permissionGranted, setPermissionGranted] = useState('pending'); // 'pending', 'authorized', 'denied'
  
  // Real-time AR customization states
  const [activeStyle, setActiveStyle] = useState(LIVE_HAIRSTYLES[0]);
  const [activeColor, setActiveColor] = useState(LIVE_COLORS[0]);
  const [activeBeard, setActiveBeard] = useState(LIVE_BEARDS[0]);

  // Simulated head tracking vectors
  const [headAngle, setHeadAngle] = useState('front'); // 'front', 'left', 'right', 'tilt'
  const [isFaceDetected, setIsFaceDetected] = useState(true); // "Face Not Detected" professional state
  const [luxLevel, setLuxLevel] = useState(380); // ambient light detector
  const [isLowLight, setIsLowLight] = useState(false);
  const [liveCompare, setLiveCompare] = useState(false); // live split-view comparator

  // Action feedback states
  const [showShutterFlash, setShowShutterFlash] = useState(false);
  const [showSnapshotToast, setShowSnapshotToast] = useState(false);

  // Animated values
  const scanGuidePulse = useRef(new Animated.Value(0)).current;
  const shimmerOpacity = useRef(new Animated.Value(0)).current;
  const snapshotToastOpacity = useRef(new Animated.Value(0)).current;
  const snapshotToastScale = useRef(new Animated.Value(0.7)).current;

  // Face guide target pulse loop
  useEffect(() => {
    if (permissionGranted === 'authorized') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanGuidePulse, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: false
          }),
          Animated.timing(scanGuidePulse, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: false
          })
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerOpacity, { toValue: 0.6, duration: 800, useNativeDriver: USE_NATIVE_DRIVER }),
          Animated.timing(shimmerOpacity, { toValue: 0.2, duration: 800, useNativeDriver: USE_NATIVE_DRIVER })
        ])
      ).start();
    }
  }, [permissionGranted]);

  // Request Camera Permissions Simulated Flow
  const requestPermission = (status) => {
    setPermissionGranted(status);
  };

  // Turn Left, Turn Right, Slight Tilt skews
  const getHeadTransformStyle = () => {
    let rotateY = '0deg';
    let rotateZ = '0deg';
    let translateX = 0;
    let translateY = 0;

    if (headAngle === 'left') {
      rotateY = '-22deg';
      translateX = -18;
    } else if (headAngle === 'right') {
      rotateY = '22deg';
      translateX = 18;
    } else if (headAngle === 'tilt') {
      rotateZ = '-10deg';
      translateY = 6;
      translateX = -4;
    }

    return {
      transform: [
        { rotateY },
        { rotateZ },
        { translateX },
        { translateY }
      ]
    };
  };

  // Toggle Simulated Lux Levels
  const handleToggleLux = () => {
    if (luxLevel > 150) {
      setLuxLevel(45);
      setIsLowLight(true);
    } else {
      setLuxLevel(380);
      setIsLowLight(false);
    }
  };

  // Execute Shutter snapshot capture
  const triggerShutterSnapshot = () => {
    setShowShutterFlash(true);
    
    // Shutter flash animation sequence
    setTimeout(() => {
      setShowShutterFlash(false);
      
      // Toast confirmation spring
      setShowSnapshotToast(true);
      snapshotToastOpacity.setValue(0);
      snapshotToastScale.setValue(0.7);

      Animated.parallel([
        Animated.timing(snapshotToastOpacity, { toValue: 1, duration: 250, useNativeDriver: USE_NATIVE_DRIVER }),
        Animated.timing(snapshotToastScale, { toValue: 1, duration: 350, useNativeDriver: USE_NATIVE_DRIVER })
      ]).start(() => {
        setTimeout(() => {
          Animated.timing(snapshotToastOpacity, { toValue: 0, duration: 250, useNativeDriver: USE_NATIVE_DRIVER }).start(() => {
            setShowSnapshotToast(false);
          });
        }, 1500);
      });

    }, 150);
  };

  // Guide color boundary
  const pulseGuideColor = scanGuidePulse.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(0, 212, 255, 0.4)', 'rgba(0, 212, 255, 0.9)']
  });

  return (
    <View style={styles.container}>
      
      {/* 1. INITIAL AUTHORIZATION FLOW SETUP */}
      {permissionGranted === 'pending' && (
        <View style={styles.permissionCard}>
          <View style={styles.permissionIconBg}>
            <Ionicons name="camera" size={32} color={COLORS.secondary} />
          </View>
          <Text style={styles.permissionTitle}>AR Camera Diagnostics</Text>
          <Text style={styles.permissionDesc}>Cyber Smart Mirror requests access to utilize neural face tracking nodes for real-time 60FPS AR hairstyle composition.</Text>
          
          <TouchableOpacity style={styles.authBtn} onPress={() => requestPermission('authorized')}>
            <Text style={styles.authBtnText}>Grant Camera Access</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.authBtnSec} onPress={() => requestPermission('denied')}>
            <Text style={styles.authBtnSecText}>Refuse Permission</Text>
          </TouchableOpacity>
        </View>
      )}

      {permissionGranted === 'denied' && (
        <View style={styles.permissionCard}>
          <Ionicons name="warning" size={40} color={COLORS.error} />
          <Text style={styles.permissionTitle}>Access Terminated</Text>
          <Text style={styles.permissionDesc}>Neural tracking core has lost diagnostic authorization. Allow camera permissions in OS configurations to retry.</Text>
          <TouchableOpacity style={styles.authBtn} onPress={() => requestPermission('pending')}>
            <Text style={styles.authBtnText}>Re-attempt Authorization</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 2. LIVE AR CAMERA RUNNING CORE */}
      {permissionGranted === 'authorized' && (
        <ScrollView contentContainerStyle={styles.cameraWorkspace} showsVerticalScrollIndicator={false}>
          
          {/* Header row */}
          <View style={styles.headerRow}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={20} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.studioHeader}>AI Smart Mirror</Text>
            <View style={styles.emptyHeaderIcon} />
          </View>

          {/* VIEWPORT CANVAS CONTAINER */}
          <View style={styles.viewportCardOuter}>
            <View style={styles.viewportContainer}>
              
              {/* Virtual Camera Diagnostic model background */}
              {isFaceDetected ? (
                <View style={styles.arFeedWrapper}>
                  
                  {liveCompare ? (
                    /* Live Split Compare viewport */
                    <View style={styles.liveCompareGrid}>
                      <View style={styles.compareGridCol}>
                        <Image source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop' }} style={styles.viewportModelBackground} />
                        <View style={styles.compareColBadge}>
                          <Text style={styles.compareColBadgeText}>RAW CAMERA</Text>
                        </View>
                      </View>
                      <View style={styles.compareColDivider} />
                      <View style={styles.compareGridCol}>
                        <Animated.Image 
                          source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop' }} 
                          style={[styles.viewportModelBackground, getHeadTransformStyle()]} 
                        />
                        {/* Styled hairstyle overlay tracking head perspective tilt */}
                        <Animated.View style={[styles.arHairstyleOverlayLayer, getHeadTransformStyle()]}>
                          <View style={[styles.simulatedHairShape, { backgroundColor: activeColor.hex }]} />
                        </Animated.View>
                        <View style={styles.compareColBadge}>
                          <Text style={styles.compareColBadgeText}>AR ACTIVE</Text>
                        </View>
                      </View>
                    </View>
                  ) : (
                    /* Regular Full Viewport AR Layer */
                    <View style={styles.arFeedWrapper}>
                      <Animated.Image 
                        source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop' }} 
                        style={[styles.viewportModelBackground, getHeadTransformStyle()]} 
                      />
                      
                      {/* Styled Haar Cascade / Face landmarks bounding guides */}
                      {isFaceDetected && (
                        <Animated.View style={[styles.faceGuideOval, { borderColor: pulseGuideColor }]} />
                      )}

                      {/* Styled Hairstyles rendering layer tracking head */}
                      <Animated.View style={[styles.arHairstyleOverlayLayer, getHeadTransformStyle()]}>
                        {activeStyle.id === 'fade_01' && (
                          <View style={[styles.simulatedFadeCut, { backgroundColor: activeColor.hex }]} />
                        )}
                        {activeStyle.id === 'korean_02' && (
                          <View style={[styles.simulatedKoreanCut, { backgroundColor: activeColor.hex }]} />
                        )}
                        {activeStyle.id === 'curly_03' && (
                          <View style={[styles.simulatedCurlyCut, { backgroundColor: activeColor.hex }]} />
                        )}
                        {activeStyle.id === 'buzz_04' && (
                          <View style={[styles.simulatedBuzzCut, { backgroundColor: activeColor.hex }]} />
                        )}
                      </Animated.View>

                      {/* Styled Beard rendering layer tracking head */}
                      {activeBeard.name !== 'Clean Shave' && (
                        <Animated.View style={[styles.arBeardOverlayLayer, getHeadTransformStyle()]}>
                          <View style={[
                            styles.simulatedBeardStroke, 
                            activeBeard.name === 'Stubble' && styles.beardStubbleStroke,
                            activeBeard.name === 'Short Beard' && styles.beardShortStroke,
                            activeBeard.name === 'Full Beard' && styles.beardFullStroke,
                            activeBeard.name === 'Fade Beard' && styles.beardFadeStroke,
                          ]} />
                        </Animated.View>
                      )}
                    </View>
                  )}

                </View>
              ) : (
                /* Professional Face Not Detected warning card */
                <View style={styles.subjectLostView}>
                  <View style={styles.errorRadarCircle}>
                    <Ionicons name="scan" size={32} color={COLORS.error} />
                  </View>
                  <Text style={styles.subjectLostTitle}>CRITICAL ERROR: SUBJECT LOST</Text>
                  <Text style={styles.subjectLostDesc}>Neural landmark sensors lost facial boundary signals. Align subject within the designated tracking oval guide guide.</Text>
                </View>
              )}

              {/* FLOATING AR CORE DIAGNOSTICS SENSOR BARS */}
              <View style={styles.floatingSensorOverlayBar}>
                <View style={styles.sensorItem}>
                  <Ionicons name="flash" size={10} color={COLORS.secondary} />
                  <Text style={styles.sensorText}>ARCore: 60FPS</Text>
                </View>
                <View style={styles.sensorItemDivider} />
                <TouchableOpacity style={styles.sensorItem} onPress={handleToggleLux}>
                  <Ionicons name="sunny" size={10} color={isLowLight ? COLORS.error : COLORS.secondary} />
                  <Text style={[styles.sensorText, isLowLight && { color: COLORS.error }]}>Lux: {luxLevel}</Text>
                </TouchableOpacity>
              </View>

              {/* Dynamic low light indicator banner */}
              {isLowLight && (
                <View style={styles.lowLightBanner}>
                  <Ionicons name="warning" size={12} color={COLORS.error} />
                  <Text style={styles.lowLightText}>LOW LIGHT WARNING: INCREASE AMBIENT LUX</Text>
                </View>
              )}

              {/* Snapshot Shutter White Flash overlay */}
              {showShutterFlash && (
                <View style={styles.shutterFlashCanvas} />
              )}

              {/* Snapshot confirmation checkmark toast */}
              {showSnapshotToast && (
                <Animated.View style={[styles.toastShutterContainer, { opacity: snapshotToastOpacity, transform: [{ scale: snapshotToastScale }] }]}>
                  <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
                  <Text style={styles.toastShutterText}>Snapshot Saved successfully!</Text>
                </Animated.View>
              )}

            </View>
          </View>

          {/* STUDIO VIEWPORT CONTROLS BAR */}
          <View style={styles.studioQuickControls}>
            
            {/* Live split-screen comparator toggle */}
            <TouchableOpacity 
              style={[styles.quickControlBtn, liveCompare && styles.activeQuickControlBtn]}
              onPress={() => setLiveCompare(!liveCompare)}
            >
              <Ionicons name="git-compare" size={16} color={liveCompare ? COLORS.background : COLORS.secondary} />
              <Text style={[styles.quickControlBtnText, liveCompare && { color: COLORS.background }]}>Split Mirror</Text>
            </TouchableOpacity>

            {/* Shutter capture Snapshot */}
            <TouchableOpacity style={styles.shutterBtn} onPress={triggerShutterSnapshot}>
              <View style={styles.shutterCore} />
            </TouchableOpacity>

            {/* Simulate Lost Face Tracking signal */}
            <TouchableOpacity 
              style={[styles.quickControlBtn, !isFaceDetected && styles.activeQuickControlBtnError]}
              onPress={() => setIsFaceDetected(!isFaceDetected)}
            >
              <Ionicons name="eye-off" size={16} color={!isFaceDetected ? '#FFF' : COLORS.secondary} />
              <Text style={[styles.quickControlBtnText, !isFaceDetected && { color: '#FFF' }]}>
                {isFaceDetected ? 'Simulate Lost' : 'Align Subject'}
              </Text>
            </TouchableOpacity>

          </View>

          {/* AR SUBJECT HEAD POSTURE SELECTOR ("Simulate Head Movement") */}
          <View style={styles.postureCard}>
            <Text style={styles.postureLabel}>SIMULATE HEAD ROTATION & TILT</Text>
            <View style={styles.postureRow}>
              <TouchableOpacity 
                style={[styles.postureBtn, headAngle === 'left' && styles.activePostureBtn]}
                onPress={() => setHeadAngle('left')}
              >
                <Ionicons name="arrow-undo-outline" size={12} color={headAngle === 'left' ? COLORS.background : COLORS.textPrimary} />
                <Text style={[styles.postureBtnText, headAngle === 'left' && { color: COLORS.background }]}>Turn Left</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.postureBtn, headAngle === 'front' && styles.activePostureBtn]}
                onPress={() => setHeadAngle('front')}
              >
                <Ionicons name="scan-outline" size={12} color={headAngle === 'front' ? COLORS.background : COLORS.textPrimary} />
                <Text style={[styles.postureBtnText, headAngle === 'front' && { color: COLORS.background }]}>Align Front</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.postureBtn, headAngle === 'right' && styles.activePostureBtn]}
                onPress={() => setHeadAngle('right')}
              >
                <Ionicons name="arrow-redo-outline" size={12} color={headAngle === 'right' ? COLORS.background : COLORS.textPrimary} />
                <Text style={[styles.postureBtnText, headAngle === 'right' && { color: COLORS.background }]}>Turn Right</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.postureBtn, headAngle === 'tilt' && styles.activePostureBtn]}
                onPress={() => setHeadAngle('tilt')}
              >
                <Ionicons name="sync-outline" size={12} color={headAngle === 'tilt' ? COLORS.background : COLORS.textPrimary} />
                <Text style={[styles.postureBtnText, headAngle === 'tilt' && { color: COLORS.background }]}>Slight Tilt</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* DYNAMIC REAL-TIME PERSONALIZATION DRAWERS */}
          <View style={styles.studioInteractionSection}>
            
            {/* HAIRSTYLES */}
            <Text style={styles.studioSectionTitle}>AR HAIRSTYLE SWEEP</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
              {LIVE_HAIRSTYLES.map((style) => {
                const isSelected = activeStyle.id === style.id;
                return (
                  <TouchableOpacity
                    key={style.id}
                    style={[styles.interactionChip, isSelected && styles.activeInteractionChip]}
                    onPress={() => setActiveStyle(style)}
                  >
                    <Image source={{ uri: style.imageUrl }} style={styles.interactionThumb} />
                    <Text style={[styles.interactionChipText, isSelected && styles.activeInteractionChipText]}>{style.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* HAIR COLOR GRADIENTS swatches */}
            <Text style={styles.studioSectionTitle}>AR COLOR GRADIENT FILTER</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollColors}>
              {LIVE_COLORS.map((color) => {
                const isSelected = activeColor.name === color.name;
                return (
                  <TouchableOpacity
                    key={color.name}
                    style={[styles.colorOption, isSelected && styles.activeColorOption]}
                    onPress={() => setActiveColor(color)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.gradientCircleContainer}>
                      <View style={[styles.gradientSwatchColor, { backgroundColor: color.hex }]} />
                      <View style={styles.gradientSwatchShine} />
                    </View>
                    <Text style={[styles.colorLabelText, isSelected && styles.activeColorLabelText]}>
                      {color.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* BEARD OPTIONS */}
            <Text style={styles.studioSectionTitle}>AR BEARD SHIELD OVERLAY</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
              {LIVE_BEARDS.map((beard) => {
                const isSelected = activeBeard.name === beard.name;
                return (
                  <TouchableOpacity
                    key={beard.name}
                    style={[styles.interactionChip, isSelected && styles.activeInteractionChip]}
                    onPress={() => setActiveBeard(beard)}
                  >
                    <Image source={{ uri: beard.thumbnail }} style={styles.interactionThumb} />
                    <Text style={[styles.interactionChipText, isSelected && styles.activeInteractionChipText]}>{beard.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

          </View>

        </ScrollView>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  cameraWorkspace: {
    padding: 16,
    paddingTop: 50,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  studioHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  emptyHeaderIcon: {
    width: 38,
  },

  // PERMISSIONS INITIAL CARDS
  permissionCard: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  permissionIconBg: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(0, 212, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  permissionTitle: {
    color: COLORS.textPrimary,
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  permissionDesc: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 12,
  },
  authBtn: {
    backgroundColor: COLORS.secondary,
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  authBtnText: {
    color: COLORS.background,
    fontWeight: 'bold',
    fontSize: 14,
  },
  authBtnSec: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  authBtnSecText: {
    color: COLORS.textPrimary,
    fontWeight: 'bold',
    fontSize: 14,
  },

  // VIEWPORT DASHBOARD
  viewportCardOuter: {
    width: '100%',
    height: 380,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: '#000',
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  viewportContainer: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 212, 255, 0.2)',
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  arFeedWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  viewportModelBackground: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  // AI GUIDE target OVAL
  faceGuideOval: {
    position: 'absolute',
    top: '15%',
    left: '15%',
    width: '70%',
    height: '65%',
    borderRadius: 120,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    zIndex: 80,
  },

  // AR HAIRSTYLES OVERLAY LAYER WITH 3D perspective transforms
  arHairstyleOverlayLayer: {
    position: 'absolute',
    top: '16%',
    left: '25%',
    width: '50%',
    height: '35%',
    zIndex: 90,
  },
  simulatedFadeCut: {
    width: '100%',
    height: '50%',
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    opacity: 0.85,
  },
  simulatedKoreanCut: {
    width: '100%',
    height: '65%',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    opacity: 0.85,
  },
  simulatedCurlyCut: {
    width: '108%',
    height: '75%',
    left: '-4%',
    borderRadius: 60,
    opacity: 0.88,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  simulatedBuzzCut: {
    width: '92%',
    height: '42%',
    left: '4%',
    borderTopLeftRadius: 55,
    borderTopRightRadius: 55,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    opacity: 0.82,
  },

  // AR BEARDS OVERLAY LAYER WITH 3D perspective transforms
  arBeardOverlayLayer: {
    position: 'absolute',
    top: '52%',
    left: '27%',
    width: '46%',
    height: '25%',
    zIndex: 90,
  },
  simulatedBeardStroke: {
    width: '100%',
    height: '80%',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    borderWidth: 4,
    borderColor: '#2A2A2A',
    backgroundColor: 'transparent',
    opacity: 0.85,
  },
  beardStubbleStroke: {
    borderColor: '#3E3E3E',
    borderWidth: 3,
  },
  beardShortStroke: {
    borderColor: '#242424',
    borderWidth: 8,
  },
  beardFullStroke: {
    borderColor: '#111111',
    borderWidth: 16,
  },
  beardFadeStroke: {
    borderColor: '#2D2D2D',
    borderWidth: 4,
    borderStyle: 'dotted',
  },

  // SUBJECT LOST CARD
  subjectLostView: {
    flex: 1,
    backgroundColor: 'rgba(10, 10, 15, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorRadarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 82, 82, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 82, 82, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  subjectLostTitle: {
    color: COLORS.error,
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  subjectLostDesc: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    paddingHorizontal: 12,
  },

  // SENSOR DIAGNOSTICS BARS
  floatingSensorOverlayBar: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10,10,15,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    zIndex: 100,
  },
  sensorItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sensorText: {
    color: COLORS.textSecondary,
    fontSize: 9,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  sensorItemDivider: {
    width: 1,
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginHorizontal: 8,
  },
  lowLightBanner: {
    position: 'absolute',
    top: 48,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(255, 82, 82, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 82, 82, 0.25)',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  lowLightText: {
    color: COLORS.error,
    fontSize: 8,
    fontWeight: 'bold',
    marginLeft: 4,
  },

  // SHUTTER ANIM
  shutterFlashCanvas: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF',
    zIndex: 1000,
  },
  toastShutterContainer: {
    position: 'absolute',
    bottom: 24,
    left: '10%',
    right: '10%',
    backgroundColor: 'rgba(18, 18, 26, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  toastShutterText: {
    color: COLORS.textPrimary,
    fontSize: 11,
    fontWeight: 'bold',
    marginLeft: 8,
  },

  // STUDIO CONTROLS BAR
  studioQuickControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  quickControlBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    width: '32%',
    justifyContent: 'center',
  },
  activeQuickControlBtn: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  activeQuickControlBtnError: {
    backgroundColor: COLORS.error,
    borderColor: COLORS.error,
  },
  quickControlBtnText: {
    color: COLORS.textPrimary,
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  shutterBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 4,
    borderColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  shutterCore: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
  },

  // POSTURES CONTROLS CARD
  postureCard: {
    backgroundColor: 'rgba(18, 18, 26, 0.7)',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    marginBottom: 16,
    alignItems: 'center',
  },
  postureLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  postureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  postureBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 8,
    borderRadius: 10,
    width: '23.5%',
  },
  activePostureBtn: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  postureBtnText: {
    color: COLORS.textPrimary,
    fontSize: 9,
    fontWeight: 'bold',
    marginLeft: 4,
  },

  // PERSONALIZATION DRAWERS
  studioInteractionSection: {
    backgroundColor: 'rgba(18, 18, 26, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
  },
  studioSectionTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    letterSpacing: 1.5,
    marginBottom: 10,
    marginTop: 6,
  },
  scroll: {
    maxHeight: 52,
    marginBottom: 14,
  },
  interactionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  activeInteractionChip: {
    borderColor: COLORS.secondary,
    backgroundColor: 'rgba(0, 212, 255, 0.05)',
  },
  interactionThumb: {
    width: 20,
    height: 20,
    borderRadius: 6,
    marginRight: 8,
  },
  interactionChipText: {
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  activeInteractionChipText: {
    color: COLORS.secondary,
    fontWeight: 'bold',
  },

  // COLOR SWATCHES
  scrollColors: {
    maxHeight: 70,
    marginBottom: 14,
  },
  colorOption: {
    alignItems: 'center',
    marginRight: 16,
    padding: 2,
  },
  activeColorOption: {
    // dynamic border
  },
  gradientCircleContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 4,
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
    backgroundColor: 'rgba(255,255,255,0.12)',
    opacity: 0.5,
  },
  colorLabelText: {
    fontSize: 9,
    color: COLORS.textSecondary,
  },
  activeColorLabelText: {
    color: COLORS.secondary,
    fontWeight: 'bold',
  },

  // LIVE COMPARE VIEWPORT MODES
  liveCompareGrid: {
    flex: 1,
    flexDirection: 'row',
  },
  compareGridCol: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  compareColDivider: {
    width: 2,
    backgroundColor: COLORS.secondary,
    zIndex: 100,
  },
  compareColBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 6,
    zIndex: 100,
  },
  compareColBadgeText: {
    color: '#FFF',
    fontSize: 8,
    fontWeight: 'bold',
  },
});
