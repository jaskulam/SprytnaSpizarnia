// Environment and Configuration Types for Sprytna Spiżarnia

// Environment types
export type Environment = 'development' | 'staging' | 'production';

export interface AppConfig {
  environment: Environment;
  version: string;
  buildNumber: string;
  apiUrl: string;
  apiVersion: string;
  firebaseConfig: FirebaseConfig;
  features: FeatureFlags;
  logging: LoggingConfig;
  analytics: AnalyticsConfiguration;
  security: SecurityConfig;
  performance: PerformanceConfig;
  ui: UIConfig;
}

// Firebase Configuration
export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
  databaseURL?: string;
  functionsRegion: string;
  emulator?: FirebaseEmulatorConfig;
}

export interface FirebaseEmulatorConfig {
  enabled: boolean;
  auth: {
    host: string;
    port: number;
  };
  firestore: {
    host: string;
    port: number;
  };
  functions: {
    host: string;
    port: number;
  };
  storage: {
    host: string;
    port: number;
  };
}

// Feature Flags
export interface FeatureFlags {
  // Core features
  enableOfflineMode: boolean;
  enableFamilySharing: boolean;
  enableMealPlanning: boolean;
  enableBarcodeScanning: boolean;
  enableAIRecipes: boolean;
  enablePushNotifications: boolean;
  enableBiometrics: boolean;
  
  // Beta features
  enableVoiceCommands: boolean;
  enableSmartSuggestions: boolean;
  enableAdvancedAnalytics: boolean;
  enableLocationBasedReminders: boolean;
  enableCommunityFeatures: boolean;
  enableSubscriptionTiers: boolean;
  
  // Experimental features
  enableARMode: boolean;
  enableMLExpiration: boolean;
  enableBlockchain: boolean;
  enableVirtualAssistant: boolean;
  
  // Debug features
  enableDebugMode: boolean;
  enablePerformanceMonitoring: boolean;
  enableCrashReporting: boolean;
  enableFeatureToggleUI: boolean;
}

// Logging Configuration
export interface LoggingConfig {
  enabled: boolean;
  level: 'debug' | 'info' | 'warn' | 'error';
  console: boolean;
  file: boolean;
  remote: boolean;
  maxFileSize: number; // bytes
  maxFiles: number;
  remoteEndpoint?: string;
  sensitiveFields: string[]; // fields to redact
}

// Analytics Configuration
export interface AnalyticsConfiguration {
  enabled: boolean;
  providers: AnalyticsProvider[];
  anonymizeIp: boolean;
  cookieConsent: boolean;
  sessionTimeout: number; // minutes
  samplingRate: number; // 0-1
  customDimensions: CustomDimension[];
}

export interface AnalyticsProvider {
  name: 'firebase' | 'amplitude' | 'mixpanel' | 'custom';
  enabled: boolean;
  apiKey?: string;
  config?: Record<string, any>;
}

export interface CustomDimension {
  index: number;
  name: string;
  scope: 'user' | 'session' | 'hit';
}

// Security Configuration
export interface SecurityConfig {
  // Authentication
  sessionTimeout: number; // minutes
  tokenRefreshThreshold: number; // minutes before expiry
  maxLoginAttempts: number;
  lockoutDuration: number; // minutes
  
  // Data protection
  encryptLocalStorage: boolean;
  encryptBackups: boolean;
  dataRetentionDays: number;
  
  // Network security
  certificatePinning: boolean;
  allowHttpInDev: boolean;
  apiTimeout: number; // milliseconds
  
  // Biometrics
  biometricTimeout: number; // minutes
  fallbackToPin: boolean;
  
  // Privacy
  anonymizeErrorReports: boolean;
  shareUsageData: boolean;
  allowThirdPartyTracking: boolean;
}

// Performance Configuration
export interface PerformanceConfig {
  // Image optimization
  imageCompression: {
    quality: number; // 0-1
    maxWidth: number;
    maxHeight: number;
    format: 'jpeg' | 'webp' | 'auto';
  };
  
  // Caching
  cache: {
    maxSize: number; // bytes
    defaultTTL: number; // seconds
    strategies: CacheStrategy[];
  };
  
  // Network
  network: {
    timeout: number; // milliseconds
    retries: number;
    backoffMultiplier: number;
  };
  
  // Memory management
  memory: {
    imagePoolSize: number;
    preloadLimit: number;
    gcThreshold: number; // MB
  };
  
  // Performance monitoring
  monitoring: {
    enabled: boolean;
    sampleRate: number; // 0-1
    trackNavigationTiming: boolean;
    trackUserInteraction: boolean;
  };
}

export interface CacheStrategy {
  pattern: string; // URL pattern
  strategy: 'cache-first' | 'network-first' | 'stale-while-revalidate';
  ttl: number; // seconds
}

// UI Configuration
export interface UIConfig {
  // Theme
  defaultTheme: 'light' | 'dark' | 'auto';
  supportedThemes: ('light' | 'dark')[];
  
  // Animations
  animations: {
    enabled: boolean;
    duration: {
      fast: number; // ms
      normal: number; // ms
      slow: number; // ms
    };
    easing: string;
  };
  
  // Typography
  typography: {
    fontFamily: string;
    fontSizes: FontSizeScale;
    lineHeights: LineHeightScale;
  };
  
  // Layout
  layout: {
    maxWidth: number; // px
    gridColumns: number;
    spacing: SpacingScale;
    borderRadius: BorderRadiusScale;
  };
  
  // Colors
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  
  // Accessibility
  accessibility: {
    minimumTouchTarget: number; // px
    highContrastSupport: boolean;
    screenReaderSupport: boolean;
    keyboardNavigation: boolean;
  };
}

export interface FontSizeScale {
  xs: number;
  sm: number;
  base: number;
  lg: number;
  xl: number;
  '2xl': number;
  '3xl': number;
  '4xl': number;
}

export interface LineHeightScale {
  none: number;
  tight: number;
  snug: number;
  normal: number;
  relaxed: number;
  loose: number;
}

export interface SpacingScale {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
  '3xl': number;
  '4xl': number;
}

export interface BorderRadiusScale {
  none: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  full: number;
}

// Build Configuration
export interface BuildConfig {
  target: 'development' | 'production';
  sourceMaps: boolean;
  minify: boolean;
  optimization: boolean;
  bundleAnalyzer: boolean;
  outputPath: string;
  publicPath: string;
  
  // Platform specific
  ios: {
    bundleId: string;
    teamId: string;
    provisioningProfile: string;
    codeSignIdentity: string;
  };
  
  android: {
    packageName: string;
    versionCode: number;
    keystore: {
      file: string;
      alias: string;
      storePassword: string;
      keyPassword: string;
    };
  };
}

// API Configuration
export interface APIConfig {
  baseURL: string;
  version: string;
  timeout: number;
  retries: number;
  
  // Rate limiting
  rateLimit: {
    requests: number;
    window: number; // seconds
  };
  
  // Endpoints
  endpoints: {
    auth: string;
    products: string;
    recipes: string;
    shopping: string;
    family: string;
    notifications: string;
    analytics: string;
    upload: string;
    ai: string;
  };
  
  // Headers
  defaultHeaders: Record<string, string>;
}

// Push Notification Configuration
export interface PushNotificationConfig {
  enabled: boolean;
  
  // Firebase Cloud Messaging
  fcm: {
    senderId: string;
    serverKey: string;
    vapidKey: string;
  };
  
  // Apple Push Notification Service
  apns: {
    keyId: string;
    teamId: string;
    bundleId: string;
    keyFile: string;
    production: boolean;
  };
  
  // Notification categories
  categories: NotificationCategoryConfig[];
}

export interface NotificationCategoryConfig {
  id: string;
  name: string;
  description: string;
  actions: NotificationActionConfig[];
}

export interface NotificationActionConfig {
  id: string;
  title: string;
  icon?: string;
  destructive?: boolean;
  authenticationRequired?: boolean;
}

// Monitoring and Error Tracking
export interface MonitoringConfig {
  // Error tracking
  errorTracking: {
    enabled: boolean;
    dsn: string;
    environment: string;
    release: string;
    sampleRate: number;
    beforeSend?: (event: any) => any;
  };
  
  // Performance monitoring
  performance: {
    enabled: boolean;
    sampleRate: number;
    trackComponents: boolean;
    trackUserInteractions: boolean;
  };
  
  // Health checks
  healthChecks: {
    enabled: boolean;
    interval: number; // seconds
    endpoints: string[];
  };
}

// Third-party Integrations
export interface IntegrationsConfig {
  // Barcode scanning
  barcode: {
    provider: 'zxing' | 'mlkit' | 'custom';
    apiKey?: string;
    formats: string[];
  };
  
  // Maps and location
  maps: {
    provider: 'google' | 'apple' | 'openstreetmap';
    apiKey?: string;
    region: string;
  };
  
  // AI and ML
  ai: {
    openai?: {
      apiKey: string;
      model: string;
      maxTokens: number;
    };
    
    vision?: {
      provider: 'google' | 'aws' | 'azure';
      apiKey: string;
      confidence: number;
    };
  };
  
  // Social sharing
  social: {
    facebook?: {
      appId: string;
      appSecret: string;
    };
    
    twitter?: {
      apiKey: string;
      apiSecret: string;
    };
    
    instagram?: {
      clientId: string;
      clientSecret: string;
    };
  };
}

// Environment Variables
export interface EnvironmentVariables {
  NODE_ENV: Environment;
  REACT_NATIVE_STAGE: Environment;
  API_URL: string;
  FIREBASE_API_KEY: string;
  FIREBASE_PROJECT_ID: string;
  SENTRY_DSN?: string;
  ANALYTICS_ID?: string;
  OPENAI_API_KEY?: string;
  GOOGLE_MAPS_API_KEY?: string;
}

// Configuration Validation
export interface ConfigValidation {
  required: string[];
  optional: string[];
  deprecated: string[];
  
  validators: {
    [key: string]: (value: any) => boolean;
  };
  
  migrations: {
    [version: string]: (config: any) => any;
  };
}

// Default configurations for different environments
export const DEFAULT_CONFIG: Record<Environment, Partial<AppConfig>> = {
  development: {
    environment: 'development',
    features: {
      enableOfflineMode: true,
      enableFamilySharing: true,
      enableMealPlanning: true,
      enableBarcodeScanning: true,
      enableAIRecipes: true,
      enablePushNotifications: true,
      enableBiometrics: true,
      enableVoiceCommands: false,
      enableSmartSuggestions: true,
      enableAdvancedAnalytics: false,
      enableLocationBasedReminders: false,
      enableCommunityFeatures: false,
      enableSubscriptionTiers: false,
      enableARMode: false,
      enableMLExpiration: false,
      enableBlockchain: false,
      enableVirtualAssistant: false,
      enableDebugMode: true,
      enablePerformanceMonitoring: true,
      enableCrashReporting: true,
      enableFeatureToggleUI: true,
    },
    logging: {
      enabled: true,
      level: 'debug',
      console: true,
      file: true,
      remote: false,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      sensitiveFields: ['password', 'token', 'apiKey'],
    },
  },
  
  staging: {
    environment: 'staging',
    features: {
      enableOfflineMode: true,
      enableFamilySharing: true,
      enableMealPlanning: true,
      enableBarcodeScanning: true,
      enableAIRecipes: true,
      enablePushNotifications: true,
      enableBiometrics: true,
      enableVoiceCommands: true,
      enableSmartSuggestions: true,
      enableAdvancedAnalytics: true,
      enableLocationBasedReminders: true,
      enableCommunityFeatures: true,
      enableSubscriptionTiers: true,
      enableARMode: false,
      enableMLExpiration: true,
      enableBlockchain: false,
      enableVirtualAssistant: false,
      enableDebugMode: false,
      enablePerformanceMonitoring: true,
      enableCrashReporting: true,
      enableFeatureToggleUI: false,
    },
    logging: {
      enabled: true,
      level: 'info',
      console: false,
      file: true,
      remote: true,
      maxFileSize: 5 * 1024 * 1024, // 5MB
      maxFiles: 3,
      sensitiveFields: ['password', 'token', 'apiKey', 'email'],
    },
  },
  
  production: {
    environment: 'production',
    features: {
      enableOfflineMode: true,
      enableFamilySharing: true,
      enableMealPlanning: true,
      enableBarcodeScanning: true,
      enableAIRecipes: true,
      enablePushNotifications: true,
      enableBiometrics: true,
      enableVoiceCommands: true,
      enableSmartSuggestions: true,
      enableAdvancedAnalytics: true,
      enableLocationBasedReminders: true,
      enableCommunityFeatures: true,
      enableSubscriptionTiers: true,
      enableARMode: false,
      enableMLExpiration: true,
      enableBlockchain: false,
      enableVirtualAssistant: false,
      enableDebugMode: false,
      enablePerformanceMonitoring: true,
      enableCrashReporting: true,
      enableFeatureToggleUI: false,
    },
    logging: {
      enabled: true,
      level: 'warn',
      console: false,
      file: false,
      remote: true,
      maxFileSize: 1 * 1024 * 1024, // 1MB
      maxFiles: 1,
      sensitiveFields: ['password', 'token', 'apiKey', 'email', 'phone'],
    },
  },
};
