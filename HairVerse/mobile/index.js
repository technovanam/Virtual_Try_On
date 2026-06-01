import { registerRootComponent } from 'expo';
import { LogBox, Platform } from 'react-native';
import App from './App';

LogBox.ignoreLogs([
  '"shadow*" style props are deprecated', 
  'props.pointerEvents is deprecated',
  'Cannot record touch end without a touch start'
]);

if (Platform.OS === 'web') {
  const originalWarn = console.warn;
  console.warn = (...args) => {
    if (typeof args[0] === 'string' && (args[0].includes('shadow*') || args[0].includes('pointerEvents'))) {
      return;
    }
    originalWarn(...args);
  };

  const originalError = console.error;
  console.error = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('Cannot record touch end without a touch start')) {
      return;
    }
    originalError(...args);
  };
  
  const originalInfo = console.info;
  console.info = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('Download the React DevTools')) {
      return;
    }
    if (originalInfo) originalInfo(...args);
  };

  const originalLog = console.log;
  console.log = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('Download the React DevTools')) {
      return;
    }
    if (originalLog) originalLog(...args);
  };
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
