import { AppContextState } from '../types/AppTypes';

// Theme selectors
export const themeSelectors = {
  getTheme: (state: AppContextState) => state.theme.theme,
  getColorScheme: (state: AppContextState) => state.theme.colorScheme,
  getColors: (state: AppContextState) => state.theme.colors,
  getSpacing: (state: AppContextState) => state.theme.spacing,
  getTypography: (state: AppContextState) => state.theme.typography,
  isDarkMode: (state: AppContextState) => state.theme.colorScheme === 'dark',
  isSystemDarkMode: (state: AppContextState) => state.theme.isSystemDarkMode,
};

// Device selectors
export const deviceSelectors = {
  getDeviceInfo: (state: AppContextState) => ({
    id: state.device.deviceId,
    type: state.device.deviceType,
    platform: state.device.platform,
    osVersion: state.device.osVersion,
  }),
  
  getScreenInfo: (state: AppContextState) => ({
    width: state.device.screenWidth,
    height: state.device.screenHeight,
    isLandscape: state.device.isLandscape,
    safeAreaInsets: state.device.safeAreaInsets,
  }),
  
  getCapabilities: (state: AppContextState) => ({
    hasNotch: state.device.hasNotch,
    supportsBiometrics: state.device.supportsBiometrics,
    supportsCamera: state.device.supportsCamera,
    supportsNFC: state.device.supportsNFC,
  }),
  
  getBatteryInfo: (state: AppContextState) => ({
    level: state.device.batteryLevel,
    isLowPowerMode: state.device.isLowPowerMode,
  }),
  
  isTablet: (state: AppContextState) => state.device.deviceType === 'tablet',
  isPhone: (state: AppContextState) => state.device.deviceType === 'phone',
  isLandscape: (state: AppContextState) => state.device.isLandscape,
  isLowMemoryDevice: (state: AppContextState) => state.device.isLowMemoryDevice,
};

// Network selectors
export const networkSelectors = {
  getConnectionStatus: (state: AppContextState) => ({
    isConnected: state.network.isConnected,
    type: state.network.connectionType,
    isExpensive: state.network.isExpensive,
    quality: state.network.connectionQuality,
  }),
  
  getConnectionSpeeds: (state: AppContextState) => ({
    download: state.network.downloadSpeed,
    upload: state.network.uploadSpeed,
  }),
  
  isConnected: (state: AppContextState) => state.network.isConnected,
  isOnWifi: (state: AppContextState) => state.network.connectionType === 'wifi',
  isOnCellular: (state: AppContextState) => state.network.connectionType === 'cellular',
  isConnectionExpensive: (state: AppContextState) => state.network.isExpensive,
  isInternetReachable: (state: AppContextState) => state.network.isInternetReachable,
  hasGoodConnection: (state: AppContextState) => 
    state.network.isConnected && 
    ['good', 'excellent'].includes(state.network.connectionQuality),
};

// App Lifecycle selectors
export const lifecycleSelectors = {
  getAppState: (state: AppContextState) => state.lifecycle.appState,
  getSessionInfo: (state: AppContextState) => ({
    startTime: state.lifecycle.sessionStartTime,
    duration: state.lifecycle.sessionDuration,
    backgroundTime: state.lifecycle.backgroundTime,
  }),
  
  getLaunchInfo: (state: AppContextState) => ({
    isFirstLaunch: state.lifecycle.isFirstLaunch,
    launchCount: state.lifecycle.launchCount,
  }),
  
  isAppActive: (state: AppContextState) => state.lifecycle.appState === 'active',
  isAppInBackground: (state: AppContextState) => state.lifecycle.appState === 'background',
  isFirstLaunch: (state: AppContextState) => state.lifecycle.isFirstLaunch,
  getLastActiveTime: (state: AppContextState) => state.lifecycle.lastActiveTime,
};

// Performance selectors
export const performanceSelectors = {
  getPerformanceMetrics: (state: AppContextState) => ({
    fps: state.performance.fps,
    memoryUsage: state.performance.memoryUsage,
    renderTime: state.performance.renderTime,
    navigationTime: state.performance.navigationTime,
  }),
  
  getErrorStats: (state: AppContextState) => ({
    errorCount: state.performance.errorCount,
    crashCount: state.performance.crashCount,
  }),
  
  getApiResponseTimes: (state: AppContextState) => state.performance.apiResponseTimes,
  
  getCurrentFPS: (state: AppContextState) => state.performance.fps,
  getMemoryUsage: (state: AppContextState) => state.performance.memoryUsage,
  isPerformanceMonitoringEnabled: (state: AppContextState) => 
    state.performance.isPerformanceMonitoringEnabled,
  
  // Performance health indicators
  hasGoodPerformance: (state: AppContextState) => 
    state.performance.fps >= 55 && state.performance.memoryUsage < 80,
  hasPerformanceIssues: (state: AppContextState) => 
    state.performance.fps < 30 || state.performance.memoryUsage > 90,
};

// Permissions selectors
export const permissionsSelectors = {
  getAllPermissions: (state: AppContextState) => state.permissions,
  
  getPermission: (permission: keyof AppContextState['permissions']) => 
    (state: AppContextState) => state.permissions[permission],
  
  hasPermission: (permission: keyof AppContextState['permissions']) => 
    (state: AppContextState) => state.permissions[permission] === 'granted',
  
  hasCameraPermission: (state: AppContextState) => state.permissions.camera === 'granted',
  hasPhotosPermission: (state: AppContextState) => state.permissions.photos === 'granted',
  hasNotificationPermission: (state: AppContextState) => state.permissions.notifications === 'granted',
  hasLocationPermission: (state: AppContextState) => state.permissions.location === 'granted',
  
  getMissingPermissions: (state: AppContextState) => 
    Object.entries(state.permissions)
      .filter(([_, status]) => status !== 'granted')
      .map(([permission]) => permission),
};

// Haptics selectors
export const hapticsSelectors = {
  getHapticsSettings: (state: AppContextState) => ({
    isEnabled: state.haptics.isEnabled,
    intensity: state.haptics.intensity,
    supportsHaptics: state.haptics.supportsHaptics,
  }),
  
  isHapticsEnabled: (state: AppContextState) => 
    state.haptics.isEnabled && state.haptics.supportsHaptics,
  getHapticsIntensity: (state: AppContextState) => state.haptics.intensity,
  supportsHaptics: (state: AppContextState) => state.haptics.supportsHaptics,
};

// Accessibility selectors
export const accessibilitySelectors = {
  getAccessibilitySettings: (state: AppContextState) => state.accessibility,
  
  isScreenReaderEnabled: (state: AppContextState) => state.accessibility.isScreenReaderEnabled,
  isReduceMotionEnabled: (state: AppContextState) => state.accessibility.isReduceMotionEnabled,
  isBoldTextEnabled: (state: AppContextState) => state.accessibility.isBoldTextEnabled,
  getFontSize: (state: AppContextState) => state.accessibility.fontSize,
  
  hasAccessibilityFeatures: (state: AppContextState) => 
    state.accessibility.isScreenReaderEnabled ||
    state.accessibility.isReduceMotionEnabled ||
    state.accessibility.isBoldTextEnabled ||
    state.accessibility.fontSize !== 'normal',
};

// Combined selectors for easy import
export const appSelectors = {
  theme: themeSelectors,
  device: deviceSelectors,
  network: networkSelectors,
  lifecycle: lifecycleSelectors,
  performance: performanceSelectors,
  permissions: permissionsSelectors,
  haptics: hapticsSelectors,
  accessibility: accessibilitySelectors,
  
  // Global state selectors
  getFullState: (state: AppContextState) => state,
  
  // Composite selectors
  canUseCamera: (state: AppContextState) => 
    deviceSelectors.getCapabilities(state).supportsCamera && 
    permissionsSelectors.hasCameraPermission(state),
    
  shouldReduceAnimations: (state: AppContextState) => 
    accessibilitySelectors.isReduceMotionEnabled(state) ||
    performanceSelectors.hasPerformanceIssues(state),
    
  shouldShowOfflineMessage: (state: AppContextState) => 
    !networkSelectors.isConnected(state) ||
    !networkSelectors.isInternetReachable(state),
    
  canSyncData: (state: AppContextState) => 
    networkSelectors.isConnected(state) && 
    networkSelectors.hasGoodConnection(state) &&
    !networkSelectors.isConnectionExpensive(state),
};
