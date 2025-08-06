import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AppState } from 'react-native';

import { 
  AppContextState, 
  AppContextMethods,
  AppAction
} from './types/AppTypes';
import { initialAppState } from './state/AppInitialState';
import { appReducer } from './reducers/AppReducer';
import { createAppContextMethods } from './methods/AppMethods';
import { appActions } from './actions/AppActions';

// Context interface
interface AppContextValue {
  state: AppContextState;
  methods: AppContextMethods;
  dispatch: React.Dispatch<AppAction>;
}

// Create contexts
const AppContext = createContext<AppContextValue | undefined>(undefined);

// Custom hook to use the app context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppContextProvider');
  }
  return context;
};

// Provider props
interface AppContextProviderProps {
  children: ReactNode;
}

// App Context Provider
export const AppContextProvider: React.FC<AppContextProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialAppState);
  const methods = createAppContextMethods(state, dispatch);

  // Initialize context on mount
  useEffect(() => {
    const initialize = async () => {
      // Initialize device info
      methods.updateOrientation();
      await methods.checkBiometricsSupport();
      
      // Initialize network status
      await methods.checkConnectionStatus();
      
      // Initialize permissions
      await methods.checkAllPermissions();
      
      // Initialize accessibility settings
      await methods.updateAccessibilitySettings();
      
      // Start performance monitoring in development
      if (__DEV__) {
        methods.startPerformanceMonitoring();
      }
    };

    initialize();
  }, []);

  // Listen to app state changes
  useEffect(() => {
    const handleAppStateChange = (nextAppState: any) => {
      dispatch({
        type: 'LIFECYCLE_ACTION',
        payload: appActions.lifecycle.appStateChange(nextAppState),
      });
    };

    // Add app state listener
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription?.remove();
    };
  }, []);

  // Listen to system theme changes
  useEffect(() => {
    // Mock system theme listener
    // In real implementation, this would listen to Appearance changes
    const mockThemeListener = () => {
      const systemTheme = 'light'; // contextUtils.getSystemColorScheme();
      dispatch({
        type: 'THEME_ACTION',
        payload: appActions.theme.updateSystemTheme(systemTheme),
      });
    };

    // Initial theme update
    mockThemeListener();

    // Would set up real listener here
    // const subscription = Appearance.addChangeListener(mockThemeListener);
    // return () => subscription.remove();
  }, []);

  // Listen to network changes
  useEffect(() => {
    // Mock network listener
    // In real implementation, this would use NetInfo
    const mockNetworkListener = () => {
      methods.checkConnectionStatus();
    };

    // Set up network monitoring interval
    const networkInterval = setInterval(mockNetworkListener, 30000); // Check every 30 seconds

    return () => {
      clearInterval(networkInterval);
    };
  }, [methods]);

  // Update session time
  useEffect(() => {
    const sessionInterval = setInterval(() => {
      const sessionDuration = Date.now() - state.lifecycle.sessionStartTime.getTime();
      dispatch({
        type: 'LIFECYCLE_ACTION',
        payload: appActions.lifecycle.updateSessionTime(sessionDuration),
      });
    }, 60000); // Update every minute

    return () => {
      clearInterval(sessionInterval);
    };
  }, [state.lifecycle.sessionStartTime]);

  const contextValue: AppContextValue = {
    state,
    methods,
    dispatch,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// Convenient hooks for specific parts of the context
export const useTheme = () => {
  const { state, methods } = useAppContext();
  return {
    ...state.theme,
    setTheme: methods.setTheme,
    toggleTheme: methods.toggleTheme,
  };
};

export const useDevice = () => {
  const { state, methods } = useAppContext();
  return {
    ...state.device,
    updateOrientation: methods.updateOrientation,
    checkBiometricsSupport: methods.checkBiometricsSupport,
  };
};

export const useNetwork = () => {
  const { state, methods } = useAppContext();
  return {
    ...state.network,
    checkConnectionStatus: methods.checkConnectionStatus,
    measureConnectionSpeed: methods.measureConnectionSpeed,
  };
};

export const usePermissions = () => {
  const { state, methods } = useAppContext();
  return {
    ...state.permissions,
    requestPermission: methods.requestPermission,
    checkAllPermissions: methods.checkAllPermissions,
  };
};

export const useHaptics = () => {
  const { state, methods } = useAppContext();
  return {
    ...state.haptics,
    triggerHaptic: methods.triggerHaptic,
  };
};

export const usePerformance = () => {
  const { state, methods } = useAppContext();
  return {
    ...state.performance,
    startMonitoring: methods.startPerformanceMonitoring,
    stopMonitoring: methods.stopPerformanceMonitoring,
    recordApiResponse: methods.recordApiResponse,
  };
};

export const useAccessibility = () => {
  const { state, methods } = useAppContext();
  return {
    ...state.accessibility,
    updateSettings: methods.updateAccessibilitySettings,
  };
};

export const useAppLifecycle = () => {
  const { state } = useAppContext();
  return state.lifecycle;
};

// Export the context for advanced usage
export { AppContext };

// Default export
export default AppContextProvider;
