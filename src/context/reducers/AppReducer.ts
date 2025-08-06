import { 
  AppContextState, 
  AppAction, 
  ThemeAction, 
  DeviceAction, 
  NetworkAction, 
  AppLifecycleAction, 
  PerformanceAction, 
  PermissionsAction, 
  HapticsAction, 
  AccessibilityAction 
} from '../types/AppTypes';
import { initialAppState, getThemeColors } from '../state/AppInitialState';

// Theme reducer
const themeReducer = (state: AppContextState['theme'], action: ThemeAction): AppContextState['theme'] => {
  switch (action.type) {
    case 'SET_THEME':
      return {
        ...state,
        theme: action.payload,
      };
      
    case 'SET_COLOR_SCHEME':
      return {
        ...state,
        colorScheme: action.payload,
        colors: getThemeColors(action.payload === 'dark'),
      };
      
    case 'UPDATE_SYSTEM_THEME':
      return {
        ...state,
        isSystemDarkMode: action.payload === 'dark',
        colorScheme: state.theme === 'system' ? action.payload : state.colorScheme,
        colors: state.theme === 'system' ? getThemeColors(action.payload === 'dark') : state.colors,
      };
      
    default:
      return state;
  }
};

// Device reducer
const deviceReducer = (state: AppContextState['device'], action: DeviceAction): AppContextState['device'] => {
  switch (action.type) {
    case 'UPDATE_ORIENTATION':
      return {
        ...state,
        screenWidth: action.payload.width,
        screenHeight: action.payload.height,
        isLandscape: action.payload.isLandscape,
      };
      
    case 'UPDATE_SAFE_AREA':
      return {
        ...state,
        safeAreaInsets: action.payload,
      };
      
    case 'UPDATE_BATTERY':
      return {
        ...state,
        batteryLevel: action.payload.level,
        isLowPowerMode: action.payload.isLowPowerMode,
      };
      
    case 'UPDATE_BIOMETRICS':
      return {
        ...state,
        supportsBiometrics: action.payload,
      };
      
    default:
      return state;
  }
};

// Network reducer
const networkReducer = (state: AppContextState['network'], action: NetworkAction): AppContextState['network'] => {
  switch (action.type) {
    case 'UPDATE_CONNECTION':
      return {
        ...state,
        isConnected: action.payload.isConnected,
        connectionType: action.payload.type,
      };
      
    case 'UPDATE_INTERNET_REACHABILITY':
      return {
        ...state,
        isInternetReachable: action.payload,
      };
      
    case 'UPDATE_CONNECTION_QUALITY':
      return {
        ...state,
        connectionQuality: action.payload,
      };
      
    case 'UPDATE_SPEEDS':
      return {
        ...state,
        downloadSpeed: action.payload.download,
        uploadSpeed: action.payload.upload,
      };
      
    default:
      return state;
  }
};

// App Lifecycle reducer
const lifecycleReducer = (state: AppContextState['lifecycle'], action: AppLifecycleAction): AppContextState['lifecycle'] => {
  switch (action.type) {
    case 'APP_STATE_CHANGE':
      const now = new Date();
      
      if (action.payload === 'active' && state.appState === 'background') {
        // App became active from background
        const backgroundDuration = state.lastActiveTime ? now.getTime() - state.lastActiveTime.getTime() : 0;
        return {
          ...state,
          appState: action.payload,
          lastActiveTime: now,
          backgroundTime: state.backgroundTime + backgroundDuration,
        };
      } else if (action.payload === 'background' && state.appState === 'active') {
        // App went to background
        return {
          ...state,
          appState: action.payload,
          lastActiveTime: now,
        };
      }
      
      return {
        ...state,
        appState: action.payload,
        lastActiveTime: now,
      };
      
    case 'UPDATE_SESSION_TIME':
      return {
        ...state,
        sessionDuration: action.payload,
      };
      
    case 'INCREMENT_LAUNCH_COUNT':
      return {
        ...state,
        launchCount: state.launchCount + 1,
        isFirstLaunch: false,
      };
      
    default:
      return state;
  }
};

// Performance reducer
const performanceReducer = (state: AppContextState['performance'], action: PerformanceAction): AppContextState['performance'] => {
  switch (action.type) {
    case 'UPDATE_FPS':
      return {
        ...state,
        fps: action.payload,
      };
      
    case 'UPDATE_MEMORY':
      return {
        ...state,
        memoryUsage: action.payload,
      };
      
    case 'UPDATE_RENDER_TIME':
      return {
        ...state,
        renderTime: action.payload,
      };
      
    case 'UPDATE_API_RESPONSE_TIME':
      return {
        ...state,
        apiResponseTimes: {
          ...state.apiResponseTimes,
          [action.payload.endpoint]: action.payload.time,
        },
      };
      
    case 'INCREMENT_ERROR_COUNT':
      return {
        ...state,
        errorCount: state.errorCount + 1,
      };
      
    case 'INCREMENT_CRASH_COUNT':
      return {
        ...state,
        crashCount: state.crashCount + 1,
      };
      
    default:
      return state;
  }
};

// Permissions reducer
const permissionsReducer = (state: AppContextState['permissions'], action: PermissionsAction): AppContextState['permissions'] => {
  switch (action.type) {
    case 'UPDATE_PERMISSION':
      return {
        ...state,
        [action.payload.permission]: action.payload.status,
      };
      
    case 'UPDATE_ALL_PERMISSIONS':
      return action.payload;
      
    default:
      return state;
  }
};

// Haptics reducer
const hapticsReducer = (state: AppContextState['haptics'], action: HapticsAction): AppContextState['haptics'] => {
  switch (action.type) {
    case 'SET_HAPTICS_ENABLED':
      return {
        ...state,
        isEnabled: action.payload,
      };
      
    case 'SET_HAPTICS_INTENSITY':
      return {
        ...state,
        intensity: action.payload,
      };
      
    default:
      return state;
  }
};

// Accessibility reducer
const accessibilityReducer = (state: AppContextState['accessibility'], action: AccessibilityAction): AppContextState['accessibility'] => {
  switch (action.type) {
    case 'UPDATE_ACCESSIBILITY':
      return {
        ...state,
        ...action.payload,
      };
      
    default:
      return state;
  }
};

// Main app reducer
export const appReducer = (state: AppContextState, action: AppAction): AppContextState => {
  switch (action.type) {
    case 'THEME_ACTION':
      return {
        ...state,
        theme: themeReducer(state.theme, action.payload),
      };
      
    case 'DEVICE_ACTION':
      return {
        ...state,
        device: deviceReducer(state.device, action.payload),
      };
      
    case 'NETWORK_ACTION':
      return {
        ...state,
        network: networkReducer(state.network, action.payload),
      };
      
    case 'LIFECYCLE_ACTION':
      return {
        ...state,
        lifecycle: lifecycleReducer(state.lifecycle, action.payload),
      };
      
    case 'PERFORMANCE_ACTION':
      return {
        ...state,
        performance: performanceReducer(state.performance, action.payload),
      };
      
    case 'PERMISSIONS_ACTION':
      return {
        ...state,
        permissions: permissionsReducer(state.permissions, action.payload),
      };
      
    case 'HAPTICS_ACTION':
      return {
        ...state,
        haptics: hapticsReducer(state.haptics, action.payload),
      };
      
    case 'ACCESSIBILITY_ACTION':
      return {
        ...state,
        accessibility: accessibilityReducer(state.accessibility, action.payload),
      };
      
    case 'RESET_CONTEXT':
      return initialAppState;
      
    default:
      return state;
  }
};
