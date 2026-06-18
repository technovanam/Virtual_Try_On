import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Dimensions } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';

import DashboardScreen from '../screens/DashboardScreen';
import UploadSelfieScreen from '../screens/UploadSelfieScreen';
import SearchScreen from '../screens/SearchScreen';
import SavedCollectionsScreen from '../screens/SavedCollectionsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const getPath = (width, containerHeight, curveWidth = 100, curveHeight = 16) => {
  const center = width / 2;
  const lineLeft = center - curveWidth / 2;
  const lineRight = center + curveWidth / 2;

  return `
    M 0,0 
    L ${lineLeft},0 
    C ${lineLeft + 18},0 ${center - 22},-${curveHeight} ${center},-${curveHeight} 
    C ${center + 22},-${curveHeight} ${lineRight - 18},0 ${lineRight},0 
    L ${width},0 
    L ${width},${containerHeight} 
    L 0,${containerHeight} 
    Z
  `;
};

const getTopBorderPath = (width, curveWidth = 100, curveHeight = 16) => {
  const center = width / 2;
  const lineLeft = center - curveWidth / 2;
  const lineRight = center + curveWidth / 2;

  return `
    M 0,0 
    L ${lineLeft},0 
    C ${lineLeft + 18},0 ${center - 22},-${curveHeight} ${center},-${curveHeight} 
    C ${center + 22},-${curveHeight} ${lineRight - 18},0 ${lineRight},0 
    L ${width},0
  `;
};

function CustomTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();
  const bottomInset = insets.bottom > 0 ? insets.bottom : 0;
  const containerHeight = 64 + bottomInset;

  const [width, setWidth] = React.useState(Dimensions.get('window').width);

  return (
    <View
      style={[
        styles.tabContainer,
        {
          height: containerHeight,
          paddingBottom: bottomInset,
        },
      ]}
      onLayout={(e) => {
        const { width: newWidth } = e.nativeEvent.layout;
        setWidth(newWidth);
      }}
    >
      {/* Curved SVG Background with Top Border */}
      <View style={StyleSheet.absoluteFill}>
        <Svg width={width} height={containerHeight} style={{ overflow: 'visible' }}>
          <Path d={getPath(width, containerHeight)} fill="#ffffff" />
          <Path d={getTopBorderPath(width)} fill="none" stroke="#E2E8F0" strokeWidth={1.2} />
        </Svg>
      </View>

      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate({ name: route.name, merge: true });
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        // Select icons (solid for focused, outline for unfocused)
        let iconName;
        if (route.name === 'Home') iconName = isFocused ? 'home' : 'home-outline';
        else if (route.name === 'Try-On') iconName = 'camera';
        else if (route.name === 'Search') iconName = isFocused ? 'search' : 'search-outline';
        else if (route.name === 'Saved') iconName = isFocused ? 'bookmark' : 'bookmark-outline';
        else if (route.name === 'Profile') iconName = isFocused ? 'person' : 'person-outline';

        // Render central raised tab button with premium gradient
        if (index === 2) {
          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.centerTabItem}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#8B5CF6', '#6D28D9']}
                style={styles.centerButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="camera" size={24} color="#ffffff" />
              </LinearGradient>
              <Text 
                numberOfLines={1} 
                style={[
                  styles.label, 
                  isFocused ? styles.activeLabel : styles.inactiveLabel,
                  { marginTop: 4 }
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        }

        // Render standard tab buttons
        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabItem}
            activeOpacity={0.7}
          >
            {isFocused && <View style={styles.activeIndicator} />}
            <View style={styles.iconContainer}>
              <Ionicons
                name={iconName}
                size={22}
                color={isFocused ? '#6D28D9' : '#94A3B8'}
              />
            </View>
            <Text 
              style={[
                styles.label, 
                isFocused ? styles.activeLabel : styles.inactiveLabel
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={DashboardScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Try-On" component={UploadSelfieScreen} />
      <Tab.Screen name="Saved" component={SavedCollectionsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent', // Transparent container, SVG renders background
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'visible',
    // Premium soft shadow around the SVG shape
    shadowColor: '#6D28D9',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    paddingTop: 8,
    position: 'relative',
  },
  centerTabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
    paddingBottom: 6,
    position: 'relative',
  },
  centerButton: {
    position: 'absolute',
    top: -24, // Floats above the top curve
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 3,
    borderColor: '#ffffff', // Clean separation boundary from background curve
    alignItems: 'center',
    justifyContent: 'center',
    // Glow effect for the center action button
    shadowColor: '#6D28D9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },
  activeIndicator: {
    position: 'absolute',
    top: -1.2, // Overlaps the top border line perfectly for a seamless glowing hook
    width: 24,
    height: 3,
    backgroundColor: '#6D28D9',
    borderRadius: 1.5,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 24,
    marginBottom: 4,
  },
  label: {
    fontSize: 9.5,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  activeLabel: {
    color: '#6D28D9',
    fontFamily: 'Poppins_600SemiBold', // Matches design system Poppins SemiBold
  },
  inactiveLabel: {
    color: '#94A3B8',
    fontFamily: 'Poppins_500Medium', // Matches design system Poppins Medium
  },
});

