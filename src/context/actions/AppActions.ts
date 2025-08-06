import { 
  ThemeAction, 
  DeviceAction, 
  NetworkAction, 
  AppLifecycleAction, 
  PerformanceAction, 
  PermissionsAction, 
  HapticsAction, 
  AccessibilityAction,
  PermissionStatus,
  ConnectionType,
  SafeAreaInsets
} from '../types/AppTypes';

// Theme Actions
export const themeActions = {
  setTheme: (theme: 'light' | 'dark' | 'system'): ThemeAction => ({
    type: 'SET_THEME',
    payload: theme,
  }),
  
  setColorScheme: (colorScheme: 'light' | 'dark'): ThemeAction => ({
    type: 'SET_COLOR_SCHEME',
    payload: colorScheme,
  }),
  
  updateSystemTheme: (systemTheme: 'light' | 'dark'): ThemeAction => ({
    type: 'UPDATE_SYSTEM_THEME',
    payload: systemTheme,
  }),
};

// Device Actions
export const deviceActions = {
  updateOrientation: (width: number, height: number, isLandscape: boolean): DeviceAction => ({
    type: 'UPDATE_ORIENTATION',
    payload: { width, height, isLandscape },
  }),
  
  updateSafeArea: (insets: SafeAreaInsets): DeviceAction => ({
    type: 'UPDATE_SAFE_AREA',
    payload: insets,
  }),
  
  updateBattery: (level: number, isLowPowerMode: boolean): DeviceAction => ({
    type: 'UPDATE_BATTERY',
    payload: { level, isLowPowerMode },
  }),
  
  updateBiometrics: (supported: boolean): DeviceAction => ({
    type: 'UPDATE_BIOMETRICS',
    payload: supported,
  }),
};

// Network Actions
export const networkActions = {
  updateConnection: (isConnected: boolean, type: ConnectionType): NetworkAction => ({
    type: 'UPDATE_CONNECTION',
    payload: { isConnected, type },
  }),
  
  updateInternetReachability: (isReachable: boolean): NetworkAction => ({
    type: 'UPDATE_INTERNET_REACHABILITY',
    payload: isReachable,
  }),
  
  updateConnectionQuality: (quality: 'poor' | 'moderate' | 'good' | 'excellent'): NetworkAction => ({
    type: 'UPDATE_CONNECTION_QUALITY',
    payload: quality,
  }),
  
  updateSpeeds: (download: number, upload: number): NetworkAction => ({
    type: 'UPDATE_SPEEDS',
    payload: { download, upload },
  }),
};

// App Lifecycle Actions
export const lifecycleActions = {
  appStateChange: (appState: 'active' | 'background' | 'inactive'): AppLifecycleAction => ({
    type: 'APP_STATE_CHANGE',
    payload: appState,
  }),
  
  updateSessionTime: (duration: number): AppLifecycleAction => ({
    type: 'UPDATE_SESSION_TIME',
    payload: duration,
  }),
  
  incrementLaunchCount: (): AppLifecycleAction => ({
    type: 'INCREMENT_LAUNCH_COUNT',
  }),
};

// Performance Actions
export const performanceActions = {
  updateFPS: (fps: number): PerformanceAction => ({
    type: 'UPDATE_FPS',
    payload: fps,
  }),
  
  updateMemory: (memory: number): PerformanceAction => ({
    type: 'UPDATE_MEMORY',
    payload: memory,
  }),
  
  updateRenderTime: (time: number): PerformanceAction => ({
    type: 'UPDATE_RENDER_TIME',
    payload: time,
  }),
  
  updateApiResponseTime: (endpoint: string, time: number): PerformanceAction => ({
    type: 'UPDATE_API_RESPONSE_TIME',
    payload: { endpoint, time },
  }),
  
  incrementErrorCount: (): PerformanceAction => ({
    type: 'INCREMENT_ERROR_COUNT',
  }),
  
  incrementCrashCount: (): PerformanceAction => ({
    type: 'INCREMENT_CRASH_COUNT',
  }),
};

// Permissions Actions
export const permissionsActions = {
  updatePermission: (permission: string, status: PermissionStatus): PermissionsAction => ({
    type: 'UPDATE_PERMISSION',
    payload: { permission: permission as any, status },
  }),
  
  updateAllPermissions: (permissions: any): PermissionsAction => ({
    type: 'UPDATE_ALL_PERMISSIONS',
    payload: permissions,
  }),
};

// Haptics Actions
export const hapticsActions = {
  setHapticsEnabled: (enabled: boolean): HapticsAction => ({
    type: 'SET_HAPTICS_ENABLED',
    payload: enabled,
  }),
  
  setHapticsIntensity: (intensity: 'light' | 'medium' | 'heavy'): HapticsAction => ({
    type: 'SET_HAPTICS_INTENSITY',
    payload: intensity,
  }),
};

// Accessibility Actions
export const accessibilityActions = {
  updateAccessibility: (settings: any): AccessibilityAction => ({
    type: 'UPDATE_ACCESSIBILITY',
    payload: settings,
  }),
};

// Combined actions object for easy import
export const appActions = {
  theme: themeActions,
  device: deviceActions,
  network: networkActions,
  lifecycle: lifecycleActions,
  performance: performanceActions,
  permissions: permissionsActions,
  haptics: hapticsActions,
  accessibility: accessibilityActions,
  
  // Global reset action
  resetContext: () => ({
    type: 'RESET_CONTEXT' as const,
  }),
};
