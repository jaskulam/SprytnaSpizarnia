import { AppContextState } from '../types/AppTypes';

// Domyślne kolory dla jasnego motywu
const lightColors = {
  primary: '#2196F3',
  primaryDark: '#1976D2',
  primaryLight: '#BBDEFB',
  
  background: '#FFFFFF',
  surface: '#F5F5F5',
  overlay: 'rgba(0, 0, 0, 0.5)',
  
  text: '#212121',
  textSecondary: '#757575',
  textDisabled: '#BDBDBD',
  
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
  
  border: '#E0E0E0',
  divider: '#EEEEEE',
  
  card: '#FFFFFF',
  notification: '#FF5722',
  shadow: 'rgba(0, 0, 0, 0.1)',
};

// Domyślne kolory dla ciemnego motywu
const darkColors = {
  primary: '#90CAF9',
  primaryDark: '#1976D2',
  primaryLight: '#E3F2FD',
  
  background: '#121212',
  surface: '#1E1E1E',
  overlay: 'rgba(0, 0, 0, 0.7)',
  
  text: '#FFFFFF',
  textSecondary: '#AAAAAA',
  textDisabled: '#666666',
  
  success: '#81C784',
  warning: '#FFB74D',
  error: '#E57373',
  info: '#64B5F6',
  
  border: '#333333',
  divider: '#2C2C2C',
  
  card: '#1E1E1E',
  notification: '#FF7043',
  shadow: 'rgba(0, 0, 0, 0.3)',
};

// Domyślne odstępy
const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Domyślna typografia
const typography = {
  h1: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  h4: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  body1: {
    fontSize: 16,
    fontWeight: 'normal' as const,
    lineHeight: 24,
  },
  body2: {
    fontSize: 14,
    fontWeight: 'normal' as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: 'normal' as const,
    lineHeight: 16,
  },
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 20,
  },
};

export const initialAppState: AppContextState = {
  theme: {
    theme: 'system',
    colorScheme: 'light',
    isSystemDarkMode: false,
    colors: lightColors,
    spacing,
    typography,
  },
  
  device: {
    deviceId: '',
    deviceType: 'phone',
    platform: 'android',
    osVersion: '',
    
    screenWidth: 375,
    screenHeight: 812,
    isLandscape: false,
    safeAreaInsets: {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    },
    
    hasNotch: false,
    supportsBiometrics: false,
    supportsCamera: true,
    supportsNFC: false,
    
    isLowMemoryDevice: false,
    batteryLevel: undefined,
    isLowPowerMode: undefined,
  },
  
  network: {
    isConnected: true,
    connectionType: 'wifi',
    isExpensive: false,
    isInternetReachable: null,
    connectionQuality: 'good',
    downloadSpeed: undefined,
    uploadSpeed: undefined,
  },
  
  lifecycle: {
    appState: 'active',
    lastActiveTime: null,
    sessionStartTime: new Date(),
    sessionDuration: 0,
    backgroundTime: 0,
    isFirstLaunch: true,
    launchCount: 1,
  },
  
  performance: {
    fps: 60,
    memoryUsage: 0,
    renderTime: 0,
    navigationTime: 0,
    apiResponseTimes: {},
    errorCount: 0,
    crashCount: 0,
    isPerformanceMonitoringEnabled: false,
  },
  
  permissions: {
    camera: 'undetermined',
    photos: 'undetermined',
    notifications: 'undetermined',
    location: 'undetermined',
    microphone: 'undetermined',
    contacts: 'undetermined',
  },
  
  haptics: {
    isEnabled: true,
    intensity: 'medium',
    supportsHaptics: true,
  },
  
  accessibility: {
    isScreenReaderEnabled: false,
    isReduceMotionEnabled: false,
    isInvertColorsEnabled: false,
    isGrayscaleEnabled: false,
    isBoldTextEnabled: false,
    isReduceTransparencyEnabled: false,
    fontSize: 'normal',
  },
};

// Helper functions for theme
export const getThemeColors = (isDark: boolean) => isDark ? darkColors : lightColors;

export const getThemeByColorScheme = (colorScheme: 'light' | 'dark') => ({
  ...initialAppState.theme,
  colorScheme,
  colors: getThemeColors(colorScheme === 'dark'),
});
