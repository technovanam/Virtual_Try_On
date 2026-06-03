import { Platform, NativeModules } from 'react-native';

const getBackendUrl = () => {
  const envUrl = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:8000';
  
  if (Platform.OS === 'web') {
    return envUrl;
  }
  
  if (envUrl.includes('localhost') || envUrl.includes('127.0.0.1')) {
    try {
      const scriptURL = NativeModules.SourceCode?.scriptURL;
      if (scriptURL) {
        // scriptURL is typically: "http://192.168.1.100:8081/index.bundle?platform=android..."
        const match = scriptURL.match(/^https?:\/\/([^:/]+)/);
        if (match && match[1]) {
          const hostIp = match[1];
          const resolvedUrl = envUrl.replace(/localhost|127\.0\.0\.1/, hostIp);
          console.log(`[API Config] Dynamically resolved localhost to Metro bundler host IP: ${resolvedUrl}`);
          return resolvedUrl;
        }
      }
    } catch (e) {
      console.warn('[API Config] Failed to resolve dynamic backend IP, falling back to env URL:', e);
    }
  }
  
  return envUrl;
};

export const BACKEND_BASE_URL = getBackendUrl();
