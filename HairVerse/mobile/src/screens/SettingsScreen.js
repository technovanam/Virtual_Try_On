import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Switch,
  Modal,
  Animated,
  Easing,
  Alert,
  Platform,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { useAuthStore } from '../store/authStore';

import { USE_NATIVE_DRIVER } from '../constants/nativeDriver';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Futuristic Toggle Component ───────────────────────────────────────────────
function FuturisticToggle({ value, onValueChange, color = COLORS.secondary }) {
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;
  const glowAnim = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(anim, {
        toValue: value ? 1 : 0,
        duration: 220,
        easing: Easing.out(Easing.back(1.4)),
        useNativeDriver: false,
      }),
      Animated.timing(glowAnim, {
        toValue: value ? 1 : 0,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();
  }, [value]);

  const trackColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255,255,255,0.06)', color + '33'],
  });
  const knobLeft = anim.interpolate({ inputRange: [0, 1], outputRange: [2, 22] });
  const knobShadow = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={() => onValueChange(!value)}>
      <Animated.View style={[styles.toggleTrack, { backgroundColor: trackColor, borderColor: value ? color + '66' : 'rgba(255,255,255,0.08)' }]}>
        <Animated.View
          style={[
            styles.toggleKnob,
            {
              left: knobLeft,
              backgroundColor: value ? color : 'rgba(160,160,176,0.6)',
              shadowColor: color,
              shadowOpacity: value ? 0.9 : 0,
              shadowRadius: knobShadow,
              shadowOffset: { width: 0, height: 0 },
              elevation: value ? 4 : 0,
            },
          ]}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}

// ─── Settings Row ──────────────────────────────────────────────────────────────
function SettingRow({
  icon,
  iconColor = COLORS.secondary,
  iconBg = 'rgba(0,212,255,0.08)',
  label,
  sublabel,
  toggle,
  toggleValue,
  onToggle,
  onPress,
  rightLabel,
  rightIcon = true,
  danger = false,
  badge,
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: USE_NATIVE_DRIVER, speed: 30 }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: USE_NATIVE_DRIVER, speed: 20 }).start();
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
      disabled={toggle && !onPress}
    >
      <Animated.View style={[styles.settingRow, danger && styles.settingRowDanger, { transform: [{ scale: scaleAnim }] }]}>
        <View style={[styles.settingIconBox, { backgroundColor: iconBg }]}>
          <Ionicons name={icon} size={16} color={danger ? COLORS.error : iconColor} />
        </View>
        <View style={styles.settingTextCol}>
          <Text style={[styles.settingLabel, danger && styles.settingLabelDanger]}>{label}</Text>
          {sublabel ? <Text style={styles.settingSubLabel}>{sublabel}</Text> : null}
        </View>
        {badge ? (
          <View style={styles.settingBadge}>
            <Text style={styles.settingBadgeText}>{badge}</Text>
          </View>
        ) : null}
        {toggle ? (
          <FuturisticToggle value={toggleValue} onValueChange={onToggle} color={danger ? COLORS.error : COLORS.secondary} />
        ) : rightLabel ? (
          <Text style={[styles.settingRightLabel, danger && { color: COLORS.error }]}>{rightLabel}</Text>
        ) : rightIcon ? (
          <Ionicons name="chevron-forward" size={14} color={danger ? COLORS.error : 'rgba(255,255,255,0.2)'} />
        ) : null}
      </Animated.View>
    </TouchableOpacity>
  );
}

// ─── Category Header ───────────────────────────────────────────────────────────
function CategoryHeader({ icon, title, color = COLORS.secondary }) {
  return (
    <View style={styles.categoryHeader}>
      <View style={[styles.categoryIconLine, { backgroundColor: color }]} />
      <Ionicons name={icon} size={12} color={color} style={{ marginRight: 6 }} />
      <Text style={[styles.categoryTitle, { color }]}>{title.toUpperCase()}</Text>
    </View>
  );
}

// ─── Section Card wrapper ──────────────────────────────────────────────────────
function SettingsCard({ children, style }) {
  return <View style={[styles.settingsCard, style]}>{children}</View>;
}

// ─── Delete Confirmation Modal ─────────────────────────────────────────────────
function ConfirmModal({ visible, onClose, onConfirm, title, body, confirmLabel, confirmColor = COLORS.error, icon = 'warning-outline' }) {
  const slideAnim = useRef(new Animated.Value(80)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      slideAnim.setValue(80);
      fadeAnim.setValue(0);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: USE_NATIVE_DRIVER }),
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: USE_NATIVE_DRIVER, tension: 80, friction: 10 }),
      ]).start();
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 180, useNativeDriver: USE_NATIVE_DRIVER }),
      Animated.timing(slideAnim, { toValue: 80, duration: 180, useNativeDriver: USE_NATIVE_DRIVER }),
    ]).start(() => onClose());
  };

  return (
    <Modal visible={visible} transparent animationType="none">
      <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
        <TouchableOpacity style={styles.modalDismissArea} onPress={handleClose} />
        <Animated.View style={[styles.confirmModalCard, { transform: [{ translateY: slideAnim }] }]}>
          <View style={[styles.confirmIconCircle, { backgroundColor: confirmColor + '15', borderColor: confirmColor + '40' }]}>
            <Ionicons name={icon} size={28} color={confirmColor} />
          </View>
          <Text style={styles.confirmTitle}>{title}</Text>
          <Text style={styles.confirmBody}>{body}</Text>
          <View style={styles.confirmActionsRow}>
            <TouchableOpacity style={styles.confirmCancelBtn} onPress={handleClose}>
              <Text style={styles.confirmCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmActionBtn, { backgroundColor: confirmColor }]}
              onPress={() => { handleClose(); setTimeout(onConfirm, 250); }}
            >
              <Text style={styles.confirmActionText}>{confirmLabel}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

// ─── Bottom Sheet Modal ────────────────────────────────────────────────────────
function BottomSheet({ visible, onClose, title, children }) {
  const slideAnim = useRef(new Animated.Value(600)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      slideAnim.setValue(600);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: USE_NATIVE_DRIVER }),
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: USE_NATIVE_DRIVER, tension: 70, friction: 11 }),
      ]).start();
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: USE_NATIVE_DRIVER }),
      Animated.timing(slideAnim, { toValue: 600, duration: 220, useNativeDriver: USE_NATIVE_DRIVER }),
    ]).start(() => onClose());
  };

  return (
    <Modal visible={visible} transparent animationType="none">
      <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
        <TouchableOpacity style={styles.modalDismissArea} onPress={handleClose} />
        <Animated.View style={[styles.bottomSheet, { transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.sheetHandle} />
          {title ? <Text style={styles.sheetTitle}>{title}</Text> : null}
          {children}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

// ─── Language Selector Options ─────────────────────────────────────────────────
const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
];

// ─── AI Recommendation Modes ───────────────────────────────────────────────────
const AI_MODES = [
  { key: 'aggressive', label: 'Aggressive', icon: 'flash', color: COLORS.error, desc: 'Max recommendations, all styles shown' },
  { key: 'balanced', label: 'Balanced', icon: 'sparkles', color: COLORS.secondary, desc: 'Smart suggestions based on face shape' },
  { key: 'conservative', label: 'Conservative', icon: 'shield-checkmark', color: COLORS.success, desc: 'Only highly-matched styles suggested' },
  { key: 'minimal', label: 'Minimal', icon: 'remove-circle', color: COLORS.warning, desc: 'Limit AI output, manual browsing preferred' },
];

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN SCREEN
// ═══════════════════════════════════════════════════════════════════════════════
export default function SettingsScreen({ navigation }) {

  // ── Account ────────────────────────────────────────────────────────────────
  const [twoFactor, setTwoFactor] = useState(false);
  const [biometricLogin, setBiometricLogin] = useState(true);
  const [autoSync, setAutoSync] = useState(true);

  // ── Privacy ────────────────────────────────────────────────────────────────
  const [selfiesAutoDelete, setSelfiesAutoDelete] = useState(false);
  const [analyticsSharing, setAnalyticsSharing] = useState(true);
  const [dataPersonalization, setDataPersonalization] = useState(true);
  const [faceDataStorage, setFaceDataStorage] = useState(true);

  // ── Notifications ─────────────────────────────────────────────────────────
  const [notifAiInsights, setNotifAiInsights] = useState(true);
  const [notifNewStyles, setNotifNewStyles] = useState(true);
  const [notifSubscription, setNotifSubscription] = useState(false);
  const [notifWeeklyReport, setNotifWeeklyReport] = useState(true);
  const [notifScanReminder, setNotifScanReminder] = useState(false);
  const [notifPromo, setNotifPromo] = useState(false);

  // ── Appearance ────────────────────────────────────────────────────────────
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [hapticFeedback, setHapticFeedback] = useState(true);
  const [compactMode, setCompactMode] = useState(false);

  // ── AI Preferences ────────────────────────────────────────────────────────
  const [aiMode, setAiMode] = useState('balanced');
  const [aiAutoReanalysis, setAiAutoReanalysis] = useState(false);
  const [aiSmartSuggestions, setAiSmartSuggestions] = useState(true);
  const [aiVoiceFeedback, setAiVoiceFeedback] = useState(false);

  // ── Language ──────────────────────────────────────────────────────────────
  const [language, setLanguage] = useState('en');

  // ── Logout state ───────────────────────────────────────────────────────────
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const logout = useAuthStore((state) => state.logout);

  // ── Modals ─────────────────────────────────────────────────────────────────
  const [showDeleteSelfiesConfirm, setShowDeleteSelfiesConfirm] = useState(false);
  const [showClearAiConfirm, setShowClearAiConfirm] = useState(false);
  const [showDeleteAccountConfirm, setShowDeleteAccountConfirm] = useState(false);
  const [showLanguageSheet, setShowLanguageSheet] = useState(false);
  const [showAiModeSheet, setShowAiModeSheet] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showExportSheet, setShowExportSheet] = useState(false);

  // ── Animated Header ───────────────────────────────────────────────────────
  const headerGlow = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(headerGlow, { toValue: 1, duration: 2200, easing: Easing.inOut(Easing.ease), useNativeDriver: USE_NATIVE_DRIVER }),
        Animated.timing(headerGlow, { toValue: 0, duration: 2200, easing: Easing.inOut(Easing.ease), useNativeDriver: USE_NATIVE_DRIVER }),
      ])
    ).start();
  }, []);

  const glowOpacity = headerGlow.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.75] });
  const selectedLang = LANGUAGES.find(l => l.code === language);
  const selectedAiMode = AI_MODES.find(m => m.key === aiMode);

  // ── Logout handler ────────────────────────────────────────────────────────
  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    // Conditional rendering in AppNavigator switches to AuthStack automatically
    // when isAuthenticated changes to false. No manual navigation needed.
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <View style={styles.root}>

      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        {/* Glow accent line */}
        <Animated.View style={[styles.headerGlowBar, { opacity: glowOpacity }]} />

        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation?.goBack && navigation.goBack()}>
            <Ionicons name="chevron-back" size={20} color={COLORS.secondary} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Settings & Privacy</Text>
            <Text style={styles.headerSubtitle}>HairVerse Control Center</Text>
          </View>
          <View style={styles.headerVersionBadge}>
            <Text style={styles.headerVersionText}>v1.0</Text>
          </View>
        </View>
      </View>

      {/* ── SCROLLABLE CONTENT ────────────────────────────────────────────── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* ══ SUBSCRIPTION SHORTCUT BANNER ══ */}
        <TouchableOpacity
          style={styles.subscriptionBanner}
          onPress={() => navigation?.navigate && navigation.navigate('Premium')}
          activeOpacity={0.88}
        >
          <View style={styles.subscriptionBannerLeft}>
            <View style={styles.subscriptionIconRing}>
              <Ionicons name="sparkles" size={18} color="#D4AF37" />
            </View>
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.subscriptionBannerLabel}>PRO MEMBERSHIP ACTIVE</Text>
              <Text style={styles.subscriptionBannerSub}>Manage plan · Billing · Upgrades</Text>
            </View>
          </View>
          <View style={styles.subscriptionChevron}>
            <Ionicons name="chevron-forward" size={16} color="#D4AF37" />
          </View>
        </TouchableOpacity>

        {/* ══ 1. ACCOUNT ══════════════════════════════════════════════════════ */}
        <CategoryHeader icon="person-circle-outline" title="Account" color={COLORS.primary} />
        <SettingsCard>
          <SettingRow
            icon="create-outline"
            iconColor={COLORS.primary}
            iconBg="rgba(124,92,252,0.1)"
            label="Edit Profile Identity"
            sublabel="Name, email & avatar"
            onPress={() => Alert.alert('Edit Profile', 'Opens identity editor.')}
          />
          <View style={styles.rowDivider} />
          <SettingRow
            icon="finger-print-outline"
            iconColor={COLORS.secondary}
            iconBg="rgba(0,212,255,0.08)"
            label="Biometric Login"
            sublabel="Face ID / Fingerprint unlock"
            toggle
            toggleValue={biometricLogin}
            onToggle={setBiometricLogin}
          />
          <View style={styles.rowDivider} />
          <SettingRow
            icon="shield-half-outline"
            iconColor="#FFD740"
            iconBg="rgba(255,215,64,0.08)"
            label="Two-Factor Authentication"
            sublabel="Extra layer of account security"
            toggle
            toggleValue={twoFactor}
            onToggle={setTwoFactor}
          />
          <View style={styles.rowDivider} />
          <SettingRow
            icon="cloud-upload-outline"
            iconColor={COLORS.success}
            iconBg="rgba(0,230,118,0.08)"
            label="Auto Cloud Sync"
            sublabel="Sync profiles to Cyber-Cloud"
            toggle
            toggleValue={autoSync}
            onToggle={setAutoSync}
          />
          <View style={styles.rowDivider} />
          <SettingRow
            icon="card-outline"
            iconColor="#D4AF37"
            iconBg="rgba(212,175,55,0.08)"
            label="Subscription Management"
            sublabel="Plan details & billing"
            badge="PRO"
            onPress={() => navigation?.navigate && navigation.navigate('Premium')}
          />
        </SettingsCard>

        {/* ══ 2. PRIVACY ══════════════════════════════════════════════════════ */}
        <CategoryHeader icon="lock-closed-outline" title="Privacy" color={COLORS.secondary} />
        <SettingsCard>
          <SettingRow
            icon="images-outline"
            iconColor="#FF6B9D"
            iconBg="rgba(255,107,157,0.08)"
            label="Delete Uploaded Selfies"
            sublabel="Permanently remove all face scans"
            onPress={() => setShowDeleteSelfiesConfirm(true)}
            danger
          />
          <View style={styles.rowDivider} />
          <SettingRow
            icon="eye-off-outline"
            iconColor={COLORS.secondary}
            iconBg="rgba(0,212,255,0.08)"
            label="Auto-Delete Selfies"
            sublabel="Remove uploads after each session"
            toggle
            toggleValue={selfiesAutoDelete}
            onToggle={setSelfiesAutoDelete}
          />
          <View style={styles.rowDivider} />
          <SettingRow
            icon="person-outline"
            iconColor={COLORS.primary}
            iconBg="rgba(124,92,252,0.1)"
            label="AI Data Personalization"
            sublabel="Let AI learn from your style history"
            toggle
            toggleValue={dataPersonalization}
            onToggle={setDataPersonalization}
          />
          <View style={styles.rowDivider} />
          <SettingRow
            icon="analytics-outline"
            iconColor={COLORS.warning}
            iconBg="rgba(255,215,64,0.08)"
            label="Usage Analytics Sharing"
            sublabel="Anonymous usage data to improve AI"
            toggle
            toggleValue={analyticsSharing}
            onToggle={setAnalyticsSharing}
          />
          <View style={styles.rowDivider} />
          <SettingRow
            icon="scan-outline"
            iconColor={COLORS.success}
            iconBg="rgba(0,230,118,0.08)"
            label="Facial Data On-Device Storage"
            sublabel="Keep face mesh data locally only"
            toggle
            toggleValue={faceDataStorage}
            onToggle={setFaceDataStorage}
          />
          <View style={styles.rowDivider} />
          <SettingRow
            icon="document-text-outline"
            iconColor="rgba(160,160,176,0.8)"
            iconBg="rgba(255,255,255,0.04)"
            label="Privacy Policy"
            sublabel="Read our data usage policies"
            onPress={() => Alert.alert('Privacy Policy', 'Opens the full privacy policy.')}
          />
        </SettingsCard>

        {/* ══ 3. NOTIFICATIONS ════════════════════════════════════════════════ */}
        <CategoryHeader icon="notifications-outline" title="Notifications" color={COLORS.warning} />
        <SettingsCard>
          <SettingRow
            icon="bulb-outline"
            iconColor={COLORS.secondary}
            iconBg="rgba(0,212,255,0.08)"
            label="AI Style Insights"
            sublabel="Personalized weekly AI recommendations"
            toggle
            toggleValue={notifAiInsights}
            onToggle={setNotifAiInsights}
          />
          <View style={styles.rowDivider} />
          <SettingRow
            icon="cut-outline"
            iconColor={COLORS.primary}
            iconBg="rgba(124,92,252,0.1)"
            label="New Hairstyle Drops"
            sublabel="Alerts when trending styles arrive"
            toggle
            toggleValue={notifNewStyles}
            onToggle={setNotifNewStyles}
          />
          <View style={styles.rowDivider} />
          <SettingRow
            icon="document-outline"
            iconColor={COLORS.success}
            iconBg="rgba(0,230,118,0.08)"
            label="Weekly Hair Health Report"
            sublabel="Follicular metrics summary every Sunday"
            toggle
            toggleValue={notifWeeklyReport}
            onToggle={setNotifWeeklyReport}
          />
          <View style={styles.rowDivider} />
          <SettingRow
            icon="timer-outline"
            iconColor={COLORS.warning}
            iconBg="rgba(255,215,64,0.08)"
            label="Scan Session Reminder"
            sublabel="Nudge to re-scan face mesh biweekly"
            toggle
            toggleValue={notifScanReminder}
            onToggle={setNotifScanReminder}
          />
          <View style={styles.rowDivider} />
          <SettingRow
            icon="card-outline"
            iconColor="#D4AF37"
            iconBg="rgba(212,175,55,0.08)"
            label="Subscription & Billing"
            sublabel="Renewal, upgrade & payment alerts"
            toggle
            toggleValue={notifSubscription}
            onToggle={setNotifSubscription}
          />
          <View style={styles.rowDivider} />
          <SettingRow
            icon="gift-outline"
            iconColor="#FF6B9D"
            iconBg="rgba(255,107,157,0.08)"
            label="Promotions & Offers"
            sublabel="Exclusive deals and discount codes"
            toggle
            toggleValue={notifPromo}
            onToggle={setNotifPromo}
          />
        </SettingsCard>

        {/* ══ 4. APPEARANCE ═══════════════════════════════════════════════════ */}
        <CategoryHeader icon="color-palette-outline" title="Appearance" color="#FF6B9D" />
        <SettingsCard>
          {/* Theme Toggle Card */}
          <TouchableOpacity
            style={styles.themeToggleRow}
            onPress={() => setIsDarkTheme(!isDarkTheme)}
            activeOpacity={0.88}
          >
            <View style={styles.themeOption}>
              <View style={[styles.themePreviewBox, styles.themeDarkBox, !isDarkTheme && styles.themeBoxInactive]}>
                <Ionicons name="moon" size={18} color={isDarkTheme ? COLORS.secondary : 'rgba(255,255,255,0.3)'} />
              </View>
              <Text style={[styles.themeLabel, isDarkTheme && styles.themeLabelActive]}>Dark</Text>
            </View>
            <View style={styles.themeToggleDivider} />
            <View style={styles.themeOption}>
              <View style={[styles.themePreviewBox, styles.themeLightBox, isDarkTheme && styles.themeBoxInactive]}>
                <Ionicons name="sunny" size={18} color={!isDarkTheme ? '#F97316' : 'rgba(255,255,255,0.3)'} />
              </View>
              <Text style={[styles.themeLabel, !isDarkTheme && styles.themeLabelActive]}>Light</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.rowDivider} />
          <SettingRow
            icon="language-outline"
            iconColor={COLORS.secondary}
            iconBg="rgba(0,212,255,0.08)"
            label="Language"
            sublabel="Select app display language"
            rightLabel={`${selectedLang?.flag} ${selectedLang?.label}`}
            onPress={() => setShowLanguageSheet(true)}
          />
          <View style={styles.rowDivider} />
          <SettingRow
            icon="flash-outline"
            iconColor={COLORS.warning}
            iconBg="rgba(255,215,64,0.08)"
            label="Animations & Transitions"
            sublabel="Enable smooth motion effects"
            toggle
            toggleValue={animationsEnabled}
            onToggle={setAnimationsEnabled}
          />
          <View style={styles.rowDivider} />
          <SettingRow
            icon="phone-portrait-outline"
            iconColor={COLORS.primary}
            iconBg="rgba(124,92,252,0.1)"
            label="Haptic Feedback"
            sublabel="Vibration on interactions"
            toggle
            toggleValue={hapticFeedback}
            onToggle={setHapticFeedback}
          />
          <View style={styles.rowDivider} />
          <SettingRow
            icon="resize-outline"
            iconColor={COLORS.success}
            iconBg="rgba(0,230,118,0.08)"
            label="Compact Mode"
            sublabel="Reduce card padding for denser layout"
            toggle
            toggleValue={compactMode}
            onToggle={setCompactMode}
          />
        </SettingsCard>

        {/* ══ 5. AI PREFERENCES ═══════════════════════════════════════════════ */}
        <CategoryHeader icon="hardware-chip-outline" title="AI Preferences" color={COLORS.primary} />
        <SettingsCard>
          {/* AI Mode Selector */}
          <TouchableOpacity
            style={styles.aiModeRow}
            onPress={() => setShowAiModeSheet(true)}
            activeOpacity={0.88}
          >
            <View style={[styles.settingIconBox, { backgroundColor: 'rgba(124,92,252,0.1)' }]}>
              <Ionicons name={selectedAiMode?.icon} size={16} color={selectedAiMode?.color} />
            </View>
            <View style={styles.settingTextCol}>
              <Text style={styles.settingLabel}>AI Recommendation Mode</Text>
              <Text style={styles.settingSubLabel}>{selectedAiMode?.desc}</Text>
            </View>
            <View style={[styles.aiModeBadge, { borderColor: selectedAiMode?.color + '55', backgroundColor: selectedAiMode?.color + '12' }]}>
              <Text style={[styles.aiModeBadgeText, { color: selectedAiMode?.color }]}>{selectedAiMode?.label}</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.rowDivider} />
          <SettingRow
            icon="refresh-circle-outline"
            iconColor={COLORS.secondary}
            iconBg="rgba(0,212,255,0.08)"
            label="Auto AI Re-Analysis"
            sublabel="Automatically re-scan on profile open"
            toggle
            toggleValue={aiAutoReanalysis}
            onToggle={setAiAutoReanalysis}
          />
          <View style={styles.rowDivider} />
          <SettingRow
            icon="sparkles-outline"
            iconColor={COLORS.primary}
            iconBg="rgba(124,92,252,0.1)"
            label="Smart Style Suggestions"
            sublabel="AI curates daily lookbooks for you"
            toggle
            toggleValue={aiSmartSuggestions}
            onToggle={setAiSmartSuggestions}
          />
          <View style={styles.rowDivider} />
          <SettingRow
            icon="mic-outline"
            iconColor={COLORS.warning}
            iconBg="rgba(255,215,64,0.08)"
            label="AI Voice Feedback"
            sublabel="Hear AI commentary on your look"
            toggle
            toggleValue={aiVoiceFeedback}
            onToggle={setAiVoiceFeedback}
          />
          <View style={styles.rowDivider} />
          <SettingRow
            icon="trash-outline"
            iconColor={COLORS.error}
            iconBg="rgba(255,82,82,0.08)"
            label="Clear AI History"
            sublabel="Wipe all AI interaction & analysis logs"
            onPress={() => setShowClearAiConfirm(true)}
            danger
            rightIcon={false}
            rightLabel="Clear"
          />
        </SettingsCard>

        {/* ══ 6. EXPORT SETTINGS ══════════════════════════════════════════════ */}
        <CategoryHeader icon="cloud-download-outline" title="Export Settings" color={COLORS.success} />
        <SettingsCard>
          <SettingRow
            icon="download-outline"
            iconColor={COLORS.success}
            iconBg="rgba(0,230,118,0.08)"
            label="Export My Data"
            sublabel="Download full profile & AI history"
            onPress={() => setShowExportSheet(true)}
          />
          <View style={styles.rowDivider} />
          <SettingRow
            icon="image-outline"
            iconColor={COLORS.secondary}
            iconBg="rgba(0,212,255,0.08)"
            label="Export Render Quality"
            sublabel="Default HD resolution for exports"
            rightLabel="4K HD"
            onPress={() => Alert.alert('Export Quality', 'Choose 1080p, 4K HD or Lossless.')}
          />
          <View style={styles.rowDivider} />
          <SettingRow
            icon="logo-dropbox"
            iconColor="#0061FF"
            iconBg="rgba(0,97,255,0.08)"
            label="Cloud Export Destination"
            sublabel="Auto-save to Google Drive / Dropbox"
            rightLabel="Local"
            onPress={() => Alert.alert('Cloud Sync', 'Connect to cloud storage provider.')}
          />
          <View style={styles.rowDivider} />
          <SettingRow
            icon="watermark-outline"
            iconColor={COLORS.primary}
            iconBg="rgba(124,92,252,0.1)"
            label="Watermark on Exports"
            sublabel="HairVerse branding on renders"
            rightLabel="OFF"
            onPress={() => Alert.alert('Watermark', 'Enable or disable branding watermark.')}
          />
        </SettingsCard>

        {/* ══ DANGER ZONE ══════════════════════════════════════════════════════ */}
        <View style={styles.dangerHeader}>
          <Ionicons name="warning-outline" size={13} color={COLORS.error} style={{ marginRight: 6 }} />
          <Text style={styles.dangerHeaderText}>DANGER ZONE</Text>
        </View>

        <SettingsCard style={styles.dangerCard}>
          <SettingRow
            icon="log-out-outline"
            iconColor={COLORS.error}
            iconBg="rgba(255,82,82,0.08)"
            label="Logout"
            sublabel="Sign out of your HairVerse account"
            onPress={() => setShowLogoutConfirm(true)}
            danger
            rightIcon={false}
          />
          <View style={styles.rowDivider} />
          <SettingRow
            icon="person-remove-outline"
            iconColor={COLORS.error}
            iconBg="rgba(255,82,82,0.06)"
            label="Delete Account"
            sublabel="Permanently erase all data & access"
            onPress={() => setShowDeleteAccountConfirm(true)}
            danger
            rightIcon={false}
          />
        </SettingsCard>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerLogo}>HairVerse</Text>
          <Text style={styles.footerVer}>Version 1.0.0 · Neural Build 2026</Text>
          <Text style={styles.footerCopy}>© 2026 HairVerse AI Labs. All rights reserved.</Text>
        </View>

      </ScrollView>

      {/* ══ MODALS ══════════════════════════════════════════════════════════════ */}

      {/* Delete Selfies */}
      <ConfirmModal
        visible={showDeleteSelfiesConfirm}
        onClose={() => setShowDeleteSelfiesConfirm(false)}
        onConfirm={() => Alert.alert('✓ Done', 'All uploaded selfies have been deleted from the system.')}
        icon="images-outline"
        title="Delete All Selfies?"
        body="This will permanently remove all uploaded face scan images from HairVerse servers. Your AI profile data may be affected."
        confirmLabel="Delete Selfies"
      />

      {/* Clear AI History */}
      <ConfirmModal
        visible={showClearAiConfirm}
        onClose={() => setShowClearAiConfirm(false)}
        onConfirm={() => Alert.alert('✓ Cleared', 'All AI interaction history and neural logs have been wiped.')}
        icon="hardware-chip-outline"
        title="Clear AI History?"
        body="This will erase all AI analysis logs, recommendation history, and neural cycle data. This action cannot be undone."
        confirmLabel="Clear History"
        confirmColor={COLORS.warning}
      />

      {/* Logout */}
      <ConfirmModal
        visible={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        icon="log-out-outline"
        title="Sign Out?"
        body="You'll be returned to the login screen. Your profile data will remain saved in Cyber-Cloud."
        confirmLabel="Sign Out"
        confirmColor={COLORS.secondary}
      />

      {/* Logout Loading Overlay */}
      <Modal visible={isLoggingOut} transparent animationType="none">
        <View style={[styles.modalOverlay, { justifyContent: 'center', alignItems: 'center' }]}>
          <View style={styles.logoutLoader}>
            <ActivityIndicator size="large" color={COLORS.secondary} />
            <Text style={styles.logoutLoaderText}>Signing out...</Text>
          </View>
        </View>
      </Modal>

      {/* Delete Account */}
      <ConfirmModal
        visible={showDeleteAccountConfirm}
        onClose={() => setShowDeleteAccountConfirm(false)}
        onConfirm={() => Alert.alert('Account Deleted', 'Your account and all associated data have been permanently removed.')}
        icon="person-remove-outline"
        title="Delete Account?"
        body="This is PERMANENT and irreversible. All your profiles, AI history, selfies, saved styles and subscription data will be erased forever."
        confirmLabel="Delete My Account"
      />

      {/* Language Sheet */}
      <BottomSheet
        visible={showLanguageSheet}
        onClose={() => setShowLanguageSheet(false)}
        title="SELECT LANGUAGE"
      >
        <ScrollView style={{ maxHeight: 360 }} showsVerticalScrollIndicator={false}>
          {LANGUAGES.map(lang => (
            <TouchableOpacity
              key={lang.code}
              style={[styles.langRow, language === lang.code && styles.langRowActive]}
              onPress={() => { setLanguage(lang.code); setShowLanguageSheet(false); }}
            >
              <Text style={styles.langFlag}>{lang.flag}</Text>
              <Text style={[styles.langLabel, language === lang.code && styles.langLabelActive]}>{lang.label}</Text>
              {language === lang.code && <Ionicons name="checkmark-circle" size={18} color={COLORS.secondary} />}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </BottomSheet>

      {/* AI Mode Sheet */}
      <BottomSheet
        visible={showAiModeSheet}
        onClose={() => setShowAiModeSheet(false)}
        title="AI RECOMMENDATION MODE"
      >
        {AI_MODES.map(mode => (
          <TouchableOpacity
            key={mode.key}
            style={[styles.aiModeOption, aiMode === mode.key && { borderColor: mode.color + '66', backgroundColor: mode.color + '0D' }]}
            onPress={() => { setAiMode(mode.key); setShowAiModeSheet(false); }}
          >
            <View style={[styles.aiModeOptionIcon, { backgroundColor: mode.color + '15' }]}>
              <Ionicons name={mode.icon} size={18} color={mode.color} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.aiModeOptionLabel, aiMode === mode.key && { color: mode.color }]}>{mode.label}</Text>
              <Text style={styles.aiModeOptionDesc}>{mode.desc}</Text>
            </View>
            {aiMode === mode.key && <Ionicons name="checkmark-circle" size={18} color={mode.color} />}
          </TouchableOpacity>
        ))}
      </BottomSheet>

      {/* Export Sheet */}
      <BottomSheet
        visible={showExportSheet}
        onClose={() => setShowExportSheet(false)}
        title="EXPORT DATA FORMAT"
      >
        {[
          { label: 'Full JSON Profile', icon: 'code-slash-outline', color: COLORS.secondary, desc: 'All profile & AI data in JSON' },
          { label: 'PDF Summary Report', icon: 'document-text-outline', color: COLORS.primary, desc: 'Printable diagnostic summary' },
          { label: 'ZIP Archive', icon: 'archive-outline', color: COLORS.success, desc: 'All images + data bundled' },
          { label: 'CSV Analytics', icon: 'bar-chart-outline', color: COLORS.warning, desc: 'Usage stats in spreadsheet format' },
        ].map(opt => (
          <TouchableOpacity
            key={opt.label}
            style={styles.exportOption}
            onPress={() => { setShowExportSheet(false); Alert.alert('Export Initiated', `Preparing ${opt.label} export...`); }}
          >
            <View style={[styles.exportOptionIcon, { backgroundColor: opt.color + '15' }]}>
              <Ionicons name={opt.icon} size={18} color={opt.color} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.exportOptionLabel}>{opt.label}</Text>
              <Text style={styles.exportOptionDesc}>{opt.desc}</Text>
            </View>
            <Ionicons name="chevron-forward" size={14} color="rgba(255,255,255,0.2)" />
          </TouchableOpacity>
        ))}
      </BottomSheet>

    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // ── Header ─────────────────────────────────────────────────────────────────
  header: {
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
    paddingTop: Platform.OS === 'ios' ? 56 : 42,
    paddingBottom: 14,
    overflow: 'hidden',
  },
  headerGlowBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1.5,
    backgroundColor: COLORS.secondary,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(0,212,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(0,212,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    color: COLORS.textPrimary,
    fontSize: 17,
    fontWeight: 'bold',
    letterSpacing: 0.4,
  },
  headerSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 10,
    marginTop: 1,
    letterSpacing: 0.3,
  },
  headerVersionBadge: {
    backgroundColor: 'rgba(124,92,252,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(124,92,252,0.3)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  headerVersionText: {
    color: COLORS.primary,
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },

  // ── Scroll ─────────────────────────────────────────────────────────────────
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 14,
    paddingTop: 16,
    paddingBottom: 100,
  },

  // ── Subscription Banner ────────────────────────────────────────────────────
  subscriptionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(212,175,55,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.28)',
    borderRadius: 18,
    padding: 14,
    marginBottom: 22,
  },
  subscriptionBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  subscriptionIconRing: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(212,175,55,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  subscriptionBannerLabel: {
    color: '#D4AF37',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.6,
  },
  subscriptionBannerSub: {
    color: 'rgba(212,175,55,0.65)',
    fontSize: 9,
    marginTop: 2,
  },
  subscriptionChevron: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(212,175,55,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Category Header ────────────────────────────────────────────────────────
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 6,
    paddingLeft: 2,
  },
  categoryIconLine: {
    width: 3,
    height: 12,
    borderRadius: 2,
    marginRight: 6,
  },
  categoryTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },

  // ── Settings Card ──────────────────────────────────────────────────────────
  settingsCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
    marginBottom: 16,
    overflow: 'hidden',
  },

  // ── Setting Row ────────────────────────────────────────────────────────────
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  settingRowDanger: {
    backgroundColor: 'rgba(255,82,82,0.02)',
  },
  settingIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingTextCol: {
    flex: 1,
  },
  settingLabel: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  settingLabelDanger: {
    color: COLORS.error,
  },
  settingSubLabel: {
    color: COLORS.textSecondary,
    fontSize: 10,
    marginTop: 2,
    lineHeight: 14,
  },
  settingRightLabel: {
    color: COLORS.secondary,
    fontSize: 11,
    fontWeight: 'bold',
  },
  settingBadge: {
    backgroundColor: 'rgba(212,175,55,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.35)',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
    marginRight: 8,
  },
  settingBadgeText: {
    color: '#D4AF37',
    fontSize: 8,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  rowDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
    marginLeft: 60,
  },

  // ── Futuristic Toggle ──────────────────────────────────────────────────────
  toggleTrack: {
    width: 44,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
  },
  toggleKnob: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
  },

  // ── Theme Toggle Row ───────────────────────────────────────────────────────
  themeToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 16,
  },
  themeOption: {
    flex: 1,
    alignItems: 'center',
  },
  themePreviewBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1.5,
  },
  themeDarkBox: {
    backgroundColor: 'rgba(0,212,255,0.07)',
    borderColor: COLORS.secondary + '60',
  },
  themeLightBox: {
    backgroundColor: 'rgba(249,115,22,0.07)',
    borderColor: 'rgba(249,115,22,0.4)',
  },
  themeBoxInactive: {
    opacity: 0.35,
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  themeLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.4,
  },
  themeLabelActive: {
    color: COLORS.textPrimary,
  },
  themeToggleDivider: {
    width: 1,
    height: 50,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginHorizontal: 8,
  },

  // ── AI Mode Row ────────────────────────────────────────────────────────────
  aiModeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  aiModeBadge: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  aiModeBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.4,
  },

  // ── Danger Zone ────────────────────────────────────────────────────────────
  dangerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 4,
    paddingLeft: 2,
  },
  dangerHeaderText: {
    color: COLORS.error,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  dangerCard: {
    borderColor: 'rgba(255,82,82,0.12)',
    backgroundColor: 'rgba(255,82,82,0.02)',
  },

  // ── Logout Loader ─────────────────────────────────────────────────────────
  logoutLoader: {
    backgroundColor: '#14141E',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 32,
    alignItems: 'center',
    gap: 16,
  },
  logoutLoaderText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  // ── Footer ─────────────────────────────────────────────────────────────────
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
    marginTop: 8,
  },
  footerLogo: {
    color: COLORS.secondary,
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 4,
  },
  footerVer: {
    color: COLORS.textSecondary,
    fontSize: 10,
    marginBottom: 2,
  },
  footerCopy: {
    color: 'rgba(160,160,176,0.4)',
    fontSize: 9,
  },

  // ── Modals ─────────────────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  modalDismissArea: {
    flex: 1,
  },

  // Confirm Modal
  confirmModalCard: {
    backgroundColor: '#14141E',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 44 : 28,
    alignItems: 'center',
  },
  confirmIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  confirmTitle: {
    color: COLORS.textPrimary,
    fontSize: 17,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  confirmBody: {
    color: COLORS.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  confirmActionsRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
  },
  confirmCancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmCancelText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: 'bold',
  },
  confirmActionBtn: {
    flex: 1.5,
    height: 46,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmActionText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },

  // Bottom Sheet
  bottomSheet: {
    backgroundColor: '#14141E',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 26,
  },
  sheetHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    color: COLORS.secondary,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 14,
  },

  // Language Sheet
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  langRowActive: {
    backgroundColor: 'rgba(0,212,255,0.06)',
    borderColor: 'rgba(0,212,255,0.25)',
  },
  langFlag: {
    fontSize: 22,
    marginRight: 12,
  },
  langLabel: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  langLabelActive: {
    color: COLORS.textPrimary,
  },

  // AI Mode Sheet Options
  aiModeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  aiModeOptionIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiModeOptionLabel: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  aiModeOptionDesc: {
    color: COLORS.textSecondary,
    fontSize: 10,
    lineHeight: 14,
  },

  // Export Options
  exportOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  exportOptionIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exportOptionLabel: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  exportOptionDesc: {
    color: COLORS.textSecondary,
    fontSize: 10,
  },
});
