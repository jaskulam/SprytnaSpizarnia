// Context API Types - uzupełnienie dla Redux w obszarach UI, urządzenia i wydajności

import { Appearance } from 'react-native';

// Theme Context Types
export interface ThemeContextState {
  theme: 'light' | 'dark' | 'system';
  colorScheme: 'light' | 'dark';
  isSystemDarkMode: boolean;
  colors: ThemeColors;
  spacing: ThemeSpacing;
  typography: ThemeTypography;
}

export interface ThemeColors {
  // Primary colors
  primary: string;
  primaryDark: string;
  primaryLight: string;
  
  // Background colors
  background: string;
  surface: string;
  overlay: string;
  
  // Text colors
  text: string;
  textSecondary: string;
  textDisabled: string;
  
  // Status colors
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // Border colors
  border: string;
  divider: string;
  
  // Component colors
  card: string;
  notification: string;
  shadow: string;
}

export interface ThemeSpacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
}

export interface ThemeTypography {
  h1: TextStyle;
  h2: TextStyle;
  h3: TextStyle;
  h4: TextStyle;
  body1: TextStyle;
  body2: TextStyle;
  caption: TextStyle;
  button: TextStyle;
}

interface TextStyle {
  fontSize: number;
  fontWeight: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  lineHeight: number;
  letterSpacing?: number;
}

// Device Context Types
export interface DeviceContextState {
  // Device info
  deviceId: string;
  deviceType: 'phone' | 'tablet';
  platform: 'ios' | 'android';
  osVersion: string;
  
  // Screen info
  screenWidth: number;
  screenHeight: number;
  isLandscape: boolean;
  safeAreaInsets: SafeAreaInsets;
  
  // Capabilities
  hasNotch: boolean;
  supportsBiometrics: boolean;
  supportsCamera: boolean;
  supportsNFC: boolean;
  
  // Performance
  isLowMemoryDevice: boolean;
  batteryLevel?: number;
  isLowPowerMode?: boolean;
}

export interface SafeAreaInsets {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

// Network Context Types
export interface NetworkContextState {
  isConnected: boolean;
  connectionType: ConnectionType;
  isExpensive: boolean;
  isInternetReachable: boolean | null;
  connectionQuality: 'poor' | 'moderate' | 'good' | 'excellent';
  downloadSpeed?: number;
  uploadSpeed?: number;
}

export type ConnectionType = 
  | 'none'
  | 'unknown'
  | 'cellular'
  | 'wifi'
  | 'bluetooth'
  | 'ethernet'
  | 'wimax'
  | 'vpn'
  | 'other';

// App Lifecycle Context Types
export interface AppLifecycleContextState {
  appState: 'active' | 'background' | 'inactive';
  lastActiveTime: Date | null;
  sessionStartTime: Date;
  sessionDuration: number;
  backgroundTime: number;
  isFirstLaunch: boolean;
  launchCount: number;
}

// Performance Context Types  
export interface PerformanceContextState {
  fps: number;
  memoryUsage: number;
  renderTime: number;
  navigationTime: number;
  apiResponseTimes: Record<string, number>;
  errorCount: number;
  crashCount: number;
  isPerformanceMonitoringEnabled: boolean;
}

// Permissions Context Types
export interface PermissionsContextState {
  camera: PermissionStatus;
  photos: PermissionStatus;
  notifications: PermissionStatus;
  location: PermissionStatus;
  microphone: PermissionStatus;
  contacts: PermissionStatus;
}

export type PermissionStatus = 
  | 'granted'
  | 'denied'
  | 'never_ask_again'
  | 'unavailable'
  | 'blocked'
  | 'limited'
  | 'undetermined';

// Haptics Context Types
export interface HapticsContextState {
  isEnabled: boolean;
  intensity: 'light' | 'medium' | 'heavy';
  supportsHaptics: boolean;
}

// Accessibility Context Types
export interface AccessibilityContextState {
  isScreenReaderEnabled: boolean;
  isReduceMotionEnabled: boolean;
  isInvertColorsEnabled: boolean;
  isGrayscaleEnabled: boolean;
  isBoldTextEnabled: boolean;
  isReduceTransparencyEnabled: boolean;
  fontSize: 'small' | 'normal' | 'large' | 'extraLarge';
}

// Combined App Context State
export interface AppContextState {
  theme: ThemeContextState;
  device: DeviceContextState;
  network: NetworkContextState;
  lifecycle: AppLifecycleContextState;
  performance: PerformanceContextState;
  permissions: PermissionsContextState;
  haptics: HapticsContextState;
  accessibility: AccessibilityContextState;
}

// Action Types
export type ThemeAction = 
  | { type: 'SET_THEME'; payload: 'light' | 'dark' | 'system' }
  | { type: 'SET_COLOR_SCHEME'; payload: 'light' | 'dark' }
  | { type: 'UPDATE_SYSTEM_THEME'; payload: 'light' | 'dark' };

export type DeviceAction = 
  | { type: 'UPDATE_ORIENTATION'; payload: { width: number; height: number; isLandscape: boolean } }
  | { type: 'UPDATE_SAFE_AREA'; payload: SafeAreaInsets }
  | { type: 'UPDATE_BATTERY'; payload: { level: number; isLowPowerMode: boolean } }
  | { type: 'UPDATE_BIOMETRICS'; payload: boolean };

export type NetworkAction = 
  | { type: 'UPDATE_CONNECTION'; payload: { isConnected: boolean; type: ConnectionType } }
  | { type: 'UPDATE_INTERNET_REACHABILITY'; payload: boolean }
  | { type: 'UPDATE_CONNECTION_QUALITY'; payload: 'poor' | 'moderate' | 'good' | 'excellent' }
  | { type: 'UPDATE_SPEEDS'; payload: { download: number; upload: number } };

export type AppLifecycleAction = 
  | { type: 'APP_STATE_CHANGE'; payload: 'active' | 'background' | 'inactive' }
  | { type: 'UPDATE_SESSION_TIME'; payload: number }
  | { type: 'INCREMENT_LAUNCH_COUNT' };

export type PerformanceAction = 
  | { type: 'UPDATE_FPS'; payload: number }
  | { type: 'UPDATE_MEMORY'; payload: number }
  | { type: 'UPDATE_RENDER_TIME'; payload: number }
  | { type: 'UPDATE_API_RESPONSE_TIME'; payload: { endpoint: string; time: number } }
  | { type: 'INCREMENT_ERROR_COUNT' }
  | { type: 'INCREMENT_CRASH_COUNT' };

export type PermissionsAction = 
  | { type: 'UPDATE_PERMISSION'; payload: { permission: keyof PermissionsContextState; status: PermissionStatus } }
  | { type: 'UPDATE_ALL_PERMISSIONS'; payload: PermissionsContextState };

export type HapticsAction = 
  | { type: 'SET_HAPTICS_ENABLED'; payload: boolean }
  | { type: 'SET_HAPTICS_INTENSITY'; payload: 'light' | 'medium' | 'heavy' };

export type AccessibilityAction = 
  | { type: 'UPDATE_ACCESSIBILITY'; payload: Partial<AccessibilityContextState> };

export type AppAction = 
  | { type: 'THEME_ACTION'; payload: ThemeAction }
  | { type: 'DEVICE_ACTION'; payload: DeviceAction }
  | { type: 'NETWORK_ACTION'; payload: NetworkAction }
  | { type: 'LIFECYCLE_ACTION'; payload: AppLifecycleAction }
  | { type: 'PERFORMANCE_ACTION'; payload: PerformanceAction }
  | { type: 'PERMISSIONS_ACTION'; payload: PermissionsAction }
  | { type: 'HAPTICS_ACTION'; payload: HapticsAction }
  | { type: 'ACCESSIBILITY_ACTION'; payload: AccessibilityAction }
  | { type: 'RESET_CONTEXT' };

// Context Methods Interface
export interface AppContextMethods {
  // Theme methods
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleTheme: () => void;
  
  // Device methods
  updateOrientation: () => void;
  checkBiometricsSupport: () => Promise<boolean>;
  
  // Network methods
  checkConnectionStatus: () => Promise<void>;
  measureConnectionSpeed: () => Promise<{ download: number; upload: number }>;
  
  // Performance methods
  startPerformanceMonitoring: () => void;
  stopPerformanceMonitoring: () => void;
  recordApiResponse: (endpoint: string, time: number) => void;
  
  // Permissions methods
  requestPermission: (permission: keyof PermissionsContextState) => Promise<PermissionStatus>;
  checkAllPermissions: () => Promise<void>;
  
  // Haptics methods
  triggerHaptic: (type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error') => void;
  
  // Accessibility methods
  updateAccessibilitySettings: () => Promise<void>;
}
