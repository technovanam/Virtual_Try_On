import { Platform, NativeModules } from 'react-native';

const isEmulator = () => {
  if (Platform.OS === 'ios') {
    const model = Platform.constants.Model || '';
    return model.toLowerCase().includes('simulator') || model.toLowerCase().includes('ipad') || model.toLowerCase().includes('iphone');
  }
  if (Platform.OS === 'android') {
    const brand = Platform.constants.Brand || '';
    const model = Platform.constants.Model || '';
    const fingerprint = Platform.constants.Fingerprint || '';
    const hardware = Platform.constants.Hardware || '';
    return (
      brand.toLowerCase().includes('generic') ||
      model.toLowerCase().includes('sdk') ||
      model.toLowerCase().includes('emulator') ||
      fingerprint.toLowerCase().includes('generic') ||
      hardware.toLowerCase().includes('goldfish') ||
      hardware.toLowerCase().includes('ranchu')
    );
  }
  return false;
};

const getBackendUrl = () => {
  const envUrl = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:8000';
  
  if (Platform.OS === 'web') {
    return envUrl;
  }

  // If we are running on an emulator, use the local loopback bypass to avoid host firewall blocking
  if (isEmulator()) {
    const port = envUrl.match(/:(\d+)/)?.[1] || '8000';
    const loopbackUrl = Platform.OS === 'android' ? `http://10.0.2.2:${port}` : `http://localhost:${port}`;
    console.log(`[API Config] Emulator detected. Routing requests via loopback: ${loopbackUrl}`);
    return loopbackUrl;
  }
  
  // For physical devices, dynamically resolve to the Metro bundler host IP
  try {
    const scriptURL = NativeModules.SourceCode?.scriptURL;
    if (scriptURL) {
      const match = scriptURL.match(/^https?:\/\/([^:/]+)/);
      if (match && match[1]) {
        const hostIp = match[1];
        const finalIp = (Platform.OS === 'android' && (hostIp === 'localhost' || hostIp === '127.0.0.1'))
          ? '10.0.2.2'
          : hostIp;
        const resolvedUrl = envUrl.replace(/(localhost|127\.0\.0\.1|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/, finalIp);
        console.log(`[API Config] Dynamically resolved backend base URL to: ${resolvedUrl}`);
        return resolvedUrl;
      }
    }
  } catch (e) {
    console.warn('[API Config] Failed to resolve dynamic backend IP:', e);
  }

  // Fallback for Android emulator if localhost exists in envUrl
  if (Platform.OS === 'android' && (envUrl.includes('localhost') || envUrl.includes('127.0.0.1'))) {
    return envUrl.replace(/localhost|127\.0\.0\.1/, '10.0.2.2');
  }
  
  return envUrl;
};

export const BACKEND_BASE_URL = getBackendUrl();
export const API_URL = BACKEND_BASE_URL;
