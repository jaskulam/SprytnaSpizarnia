// Main exports for App Context API
export { default as AppContextProvider, AppContext } from './AppContext';

// Hooks exports
export {
  useAppContext,
  useTheme,
  useDevice,
  useNetwork,
  usePermissions,
  useHaptics,
  usePerformance,
  useAccessibility,
  useAppLifecycle,
} from './AppContext';

// Types exports
export type {
  AppContextState,
  AppContextMethods,
  AppAction,
  ThemeContextState,
  DeviceContextState,
  NetworkContextState,
  AppLifecycleContextState,
  PerformanceContextState,
  PermissionsContextState,
  HapticsContextState,
  AccessibilityContextState,
  ThemeColors,
  ThemeSpacing,
  ThemeTypography,
  SafeAreaInsets,
  ConnectionType,
  PermissionStatus,
  ThemeAction,
  DeviceAction,
  NetworkAction,
  AppLifecycleAction,
  PerformanceAction,
  PermissionsAction,
  HapticsAction,
  AccessibilityAction,
} from './types/AppTypes';

// Actions exports
export { appActions } from './actions/AppActions';

// Selectors exports
export { appSelectors } from './selectors/AppSelectors';

// State exports
export { initialAppState, getThemeColors, getThemeByColorScheme } from './state/AppInitialState';

// Methods exports
export { createAppContextMethods, contextUtils } from './methods/AppMethods';

// Reducer exports
export { appReducer } from './reducers/AppReducer';

// Re-export everything for convenience
export * from './types/AppTypes';
export * from './actions/AppActions';
export * from './selectors/AppSelectors';
export * from './state/AppInitialState';
export * from './methods/AppMethods';
export * from './reducers/AppReducer';
