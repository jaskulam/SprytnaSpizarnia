import { 
  AppContextState, 
  AppContextMethods, 
  PermissionStatus 
} from '../types/AppTypes';
import { appActions } from '../actions/AppActions';

// Mock implementations for React Native APIs (będą zastąpione prawdziwymi w production)
const mockDeviceInfo = {
  getDeviceId: () => Promise.resolve('mock-device-id'),
  getDeviceType: () => Promise.resolve('phone' as const),
  getSystemVersion: () => Promise.resolve('14.0'),
  isTablet: () => Promise.resolve(false),
};

const mockNetInfo = {
  fetch: () => Promise.resolve({
    isConnected: true,
    type: 'wifi' as const,
    isInternetReachable: true,
  }),
  addEventListener: (callback: any) => {
    // Mock listener
    return () => {};
  },
};

const mockPermissions = {
  check: (permission: string) => Promise.resolve('granted' as PermissionStatus),
  request: (permission: string) => Promise.resolve('granted' as PermissionStatus),
  checkMultiple: (permissions: string[]) => 
    Promise.resolve(permissions.reduce((acc, p) => ({ ...acc, [p]: 'granted' }), {})),
};

const mockHaptics = {
  trigger: (type: string) => Promise.resolve(),
  isAvailable: () => Promise.resolve(true),
};

// Factory function to create context methods
export const createAppContextMethods = (
  state: AppContextState,
  dispatch: (action: any) => void
): AppContextMethods => {
  
  // Theme methods
  const setTheme = (theme: 'light' | 'dark' | 'system') => {
    dispatch({
      type: 'THEME_ACTION',
      payload: appActions.theme.setTheme(theme),
    });
    
    // Save to storage
    // AsyncStorage.setItem('@theme', theme);
  };
  
  const toggleTheme = () => {
    const currentTheme = state.theme.theme;
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };
  
  // Device methods
  const updateOrientation = () => {
    // In real implementation, this would get actual screen dimensions
    const mockDimensions = { width: 375, height: 812 };
    const isLandscape = mockDimensions.width > mockDimensions.height;
    
    dispatch({
      type: 'DEVICE_ACTION',
      payload: appActions.device.updateOrientation(
        mockDimensions.width,
        mockDimensions.height,
        isLandscape
      ),
    });
  };
  
  const checkBiometricsSupport = async (): Promise<boolean> => {
    try {
      // Mock biometrics check
      const supported = await Promise.resolve(true);
      
      dispatch({
        type: 'DEVICE_ACTION',
        payload: appActions.device.updateBiometrics(supported),
      });
      
      return supported;
    } catch (error) {
      console.error('Error checking biometrics support:', error);
      return false;
    }
  };
  
  // Network methods
  const checkConnectionStatus = async () => {
    try {
      const connectionInfo = await mockNetInfo.fetch();
      
      dispatch({
        type: 'NETWORK_ACTION',
        payload: appActions.network.updateConnection(
          connectionInfo.isConnected || false,
          connectionInfo.type || 'unknown'
        ),
      });
      
      if (connectionInfo.isInternetReachable !== undefined) {
        dispatch({
          type: 'NETWORK_ACTION',
          payload: appActions.network.updateInternetReachability(
            connectionInfo.isInternetReachable
          ),
        });
      }
    } catch (error) {
      console.error('Error checking connection status:', error);
      
      dispatch({
        type: 'NETWORK_ACTION',
        payload: appActions.network.updateConnection(false, 'none'),
      });
    }
  };
  
  const measureConnectionSpeed = async (): Promise<{ download: number; upload: number }> => {
    try {
      // Mock speed test
      const speeds = { download: 50, upload: 10 };
      
      dispatch({
        type: 'NETWORK_ACTION',
        payload: appActions.network.updateSpeeds(speeds.download, speeds.upload),
      });
      
      // Update connection quality based on speeds
      let quality: 'poor' | 'moderate' | 'good' | 'excellent';
      if (speeds.download < 1) quality = 'poor';
      else if (speeds.download < 5) quality = 'moderate';
      else if (speeds.download < 25) quality = 'good';
      else quality = 'excellent';
      
      dispatch({
        type: 'NETWORK_ACTION',
        payload: appActions.network.updateConnectionQuality(quality),
      });
      
      return speeds;
    } catch (error) {
      console.error('Error measuring connection speed:', error);
      return { download: 0, upload: 0 };
    }
  };
  
  // Performance methods
  const startPerformanceMonitoring = () => {
    // Mock performance monitoring start
    console.log('Performance monitoring started');
    
    // Start FPS monitoring
    const fpsInterval = setInterval(() => {
      const mockFPS = 58 + Math.random() * 4; // 58-62 FPS
      dispatch({
        type: 'PERFORMANCE_ACTION',
        payload: appActions.performance.updateFPS(mockFPS),
      });
    }, 1000);
    
    // Start memory monitoring
    const memoryInterval = setInterval(() => {
      const mockMemory = 30 + Math.random() * 20; // 30-50% memory usage
      dispatch({
        type: 'PERFORMANCE_ACTION',
        payload: appActions.performance.updateMemory(mockMemory),
      });
    }, 5000);
    
    // Store intervals for cleanup (in real implementation)
    // performanceIntervals.fps = fpsInterval;
    // performanceIntervals.memory = memoryInterval;
  };
  
  const stopPerformanceMonitoring = () => {
    console.log('Performance monitoring stopped');
    // Clear intervals in real implementation
  };
  
  const recordApiResponse = (endpoint: string, time: number) => {
    dispatch({
      type: 'PERFORMANCE_ACTION',
      payload: appActions.performance.updateApiResponseTime(endpoint, time),
    });
  };
  
  // Permissions methods
  const requestPermission = async (permission: keyof AppContextState['permissions']): Promise<PermissionStatus> => {
    try {
      const status = await mockPermissions.request(permission);
      
      dispatch({
        type: 'PERMISSIONS_ACTION',
        payload: appActions.permissions.updatePermission(permission, status),
      });
      
      return status;
    } catch (error) {
      console.error(`Error requesting ${permission} permission:`, error);
      return 'denied';
    }
  };
  
  const checkAllPermissions = async () => {
    try {
      const permissions = ['camera', 'photos', 'notifications', 'location', 'microphone', 'contacts'];
      const statuses = await mockPermissions.checkMultiple(permissions);
      
      dispatch({
        type: 'PERMISSIONS_ACTION',
        payload: appActions.permissions.updateAllPermissions(statuses),
      });
    } catch (error) {
      console.error('Error checking permissions:', error);
    }
  };
  
  // Haptics methods
  const triggerHaptic = (type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error') => {
    if (!state.haptics.isEnabled || !state.haptics.supportsHaptics) {
      return;
    }
    
    try {
      // Map semantic types to physical intensities
      let intensity: 'light' | 'medium' | 'heavy';
      switch (type) {
        case 'success':
          intensity = 'light';
          break;
        case 'warning':
          intensity = 'medium';
          break;
        case 'error':
          intensity = 'heavy';
          break;
        default:
          intensity = type;
      }
      
      // Trigger haptic with appropriate intensity
      mockHaptics.trigger(intensity);
    } catch (error) {
      console.error('Error triggering haptic feedback:', error);
    }
  };
  
  // Accessibility methods
  const updateAccessibilitySettings = async () => {
    try {
      // Mock accessibility settings check
      const settings = {
        isScreenReaderEnabled: false,
        isReduceMotionEnabled: false,
        isInvertColorsEnabled: false,
        isGrayscaleEnabled: false,
        isBoldTextEnabled: false,
        isReduceTransparencyEnabled: false,
        fontSize: 'normal' as const,
      };
      
      dispatch({
        type: 'ACCESSIBILITY_ACTION',
        payload: appActions.accessibility.updateAccessibility(settings),
      });
    } catch (error) {
      console.error('Error updating accessibility settings:', error);
    }
  };
  
  return {
    // Theme methods
    setTheme,
    toggleTheme,
    
    // Device methods
    updateOrientation,
    checkBiometricsSupport,
    
    // Network methods
    checkConnectionStatus,
    measureConnectionSpeed,
    
    // Performance methods
    startPerformanceMonitoring,
    stopPerformanceMonitoring,
    recordApiResponse,
    
    // Permissions methods
    requestPermission,
    checkAllPermissions,
    
    // Haptics methods
    triggerHaptic,
    
    // Accessibility methods
    updateAccessibilitySettings,
  };
};

// Utility functions for context methods
export const contextUtils = {
  // Theme utilities
  getSystemColorScheme: (): 'light' | 'dark' => {
    // Mock system theme detection
    return 'light';
  },
  
  // Device utilities
  detectDeviceType: (): 'phone' | 'tablet' => {
    // Mock device type detection based on screen size
    return 'phone';
  },
  
  // Network utilities
  isConnectionExpensive: (connectionType: string): boolean => {
    return connectionType === 'cellular';
  },
  
  // Performance utilities
  calculateConnectionQuality: (downloadSpeed: number): 'poor' | 'moderate' | 'good' | 'excellent' => {
    if (downloadSpeed < 1) return 'poor';
    if (downloadSpeed < 5) return 'moderate';
    if (downloadSpeed < 25) return 'good';
    return 'excellent';
  },
  
  // Accessibility utilities
  getFontSizeMultiplier: (fontSize: 'small' | 'normal' | 'large' | 'extraLarge'): number => {
    const multipliers = {
      small: 0.8,
      normal: 1.0,
      large: 1.2,
      extraLarge: 1.4,
    };
    return multipliers[fontSize];
  },
};
