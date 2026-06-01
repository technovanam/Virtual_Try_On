import { Platform } from 'react-native';

/**
 * Whether the Animated API can safely use the native driver.
 * Web does not support useNativeDriver, so we fall back to JS-driven animations.
 */
export const USE_NATIVE_DRIVER = Platform.OS !== 'web';
