// Analytics Events Configuration
export const ANALYTICS_EVENTS = {
  // User Authentication
  USER_SIGN_UP: 'user_sign_up',
  USER_SIGN_IN: 'user_sign_in',
  USER_SIGN_OUT: 'user_sign_out',
  PASSWORD_RESET: 'password_reset',
  ACCOUNT_DELETED: 'account_deleted',
  
  // Subscription
  SUBSCRIPTION_STARTED: 'subscription_started',
  SUBSCRIPTION_CANCELLED: 'subscription_cancelled',
  TRIAL_STARTED: 'trial_started',
  TRIAL_ENDED: 'trial_ended',
  SUBSCRIPTION_RENEWED: 'subscription_renewed',
  
  // Product Management
  PRODUCT_ADDED: 'product_added',
  PRODUCT_EDITED: 'product_edited',
  PRODUCT_DELETED: 'product_deleted',
  PRODUCT_CONSUMED: 'product_consumed',
  PRODUCT_EXPIRED: 'product_expired',
  PRODUCT_SCANNED: 'product_scanned',
  PRODUCT_PHOTO_TAKEN: 'product_photo_taken',
  
  // Barcode & Receipt Scanning
  BARCODE_SCANNED: 'barcode_scanned',
  BARCODE_SCAN_SUCCESSFUL: 'barcode_scan_successful',
  BARCODE_SCAN_FAILED: 'barcode_scan_failed',
  RECEIPT_SCANNED: 'receipt_scanned',
  RECEIPT_SCAN_SUCCESSFUL: 'receipt_scan_successful',
  RECEIPT_SCAN_FAILED: 'receipt_scan_failed',
  
  // Recipe Management
  RECIPE_VIEWED: 'recipe_viewed',
  RECIPE_SAVED: 'recipe_saved',
  RECIPE_REMOVED: 'recipe_removed',
  RECIPE_GENERATED: 'recipe_generated',
  RECIPE_SHARED: 'recipe_shared',
  RECIPE_COOKED: 'recipe_cooked',
  
  // Shopping Lists
  SHOPPING_LIST_CREATED: 'shopping_list_created',
  SHOPPING_LIST_SHARED: 'shopping_list_shared',
  SHOPPING_ITEM_ADDED: 'shopping_item_added',
  SHOPPING_ITEM_CHECKED: 'shopping_item_checked',
  SHOPPING_LIST_COMPLETED: 'shopping_list_completed',
  
  // Meal Planning
  MEAL_PLANNED: 'meal_planned',
  MEAL_PLAN_CREATED: 'meal_plan_created',
  MEAL_PLAN_SHARED: 'meal_plan_shared',
  
  // Family Features
  FAMILY_CREATED: 'family_created',
  FAMILY_MEMBER_INVITED: 'family_member_invited',
  FAMILY_INVITE_ACCEPTED: 'family_invite_accepted',
  FAMILY_MEMBER_REMOVED: 'family_member_removed',
  FAMILY_LEFT: 'family_left',
  
  // Notifications
  NOTIFICATION_RECEIVED: 'notification_received',
  NOTIFICATION_OPENED: 'notification_opened',
  NOTIFICATION_DISMISSED: 'notification_dismissed',
  EXPIRY_REMINDER_SET: 'expiry_reminder_set',
  
  // App Usage
  APP_OPENED: 'app_opened',
  APP_BACKGROUNDED: 'app_backgrounded',
  SCREEN_VIEWED: 'screen_viewed',
  TUTORIAL_STARTED: 'tutorial_started',
  TUTORIAL_COMPLETED: 'tutorial_completed',
  TUTORIAL_SKIPPED: 'tutorial_skipped',
  
  // Search & Discovery
  SEARCH_PERFORMED: 'search_performed',
  FILTER_APPLIED: 'filter_applied',
  CATEGORY_BROWSED: 'category_browsed',
  
  // Settings & Preferences
  SETTINGS_CHANGED: 'settings_changed',
  THEME_CHANGED: 'theme_changed',
  LANGUAGE_CHANGED: 'language_changed',
  NOTIFICATIONS_ENABLED: 'notifications_enabled',
  NOTIFICATIONS_DISABLED: 'notifications_disabled',
  BIOMETRIC_ENABLED: 'biometric_enabled',
  BIOMETRIC_DISABLED: 'biometric_disabled',
  
  // Errors & Performance
  ERROR_OCCURRED: 'error_occurred',
  CRASH_OCCURRED: 'crash_occurred',
  API_ERROR: 'api_error',
  SYNC_FAILED: 'sync_failed',
  SYNC_COMPLETED: 'sync_completed',
  OFFLINE_MODE_ENTERED: 'offline_mode_entered',
  
  // AI Features
  AI_RECIPE_REQUESTED: 'ai_recipe_requested',
  AI_RECIPE_GENERATED: 'ai_recipe_generated',
  AI_SUGGESTION_ACCEPTED: 'ai_suggestion_accepted',
  AI_SUGGESTION_REJECTED: 'ai_suggestion_rejected',
} as const;

// User Properties for Analytics
export const USER_PROPERTIES = {
  USER_TYPE: 'user_type', // 'free' | 'pro'
  SUBSCRIPTION_STATUS: 'subscription_status',
  FAMILY_SIZE: 'family_size',
  PRODUCTS_COUNT: 'products_count',
  RECIPES_COUNT: 'recipes_count',
  APP_VERSION: 'app_version',
  DEVICE_TYPE: 'device_type', // 'ios' | 'android'
  FIRST_OPEN_TIME: 'first_open_time',
  LAST_ACTIVITY: 'last_activity',
  PREFERRED_LANGUAGE: 'preferred_language',
  PREFERRED_THEME: 'preferred_theme',
  NOTIFICATIONS_ENABLED: 'notifications_enabled',
  BIOMETRIC_ENABLED: 'biometric_enabled',
  CAMERA_PERMISSIONS: 'camera_permissions',
  LOCATION_PERMISSIONS: 'location_permissions',
} as const;

// Event Parameters
export interface AnalyticsEventParams {
  [ANALYTICS_EVENTS.USER_SIGN_UP]: {
    method: 'email' | 'google' | 'apple' | 'facebook';
    source?: string;
  };
  
  [ANALYTICS_EVENTS.USER_SIGN_IN]: {
    method: 'email' | 'google' | 'apple' | 'facebook' | 'biometric';
    success: boolean;
  };
  
  [ANALYTICS_EVENTS.SUBSCRIPTION_STARTED]: {
    plan: 'monthly' | 'yearly';
    price: number;
    currency: string;
    trial_period: boolean;
  };
  
  [ANALYTICS_EVENTS.PRODUCT_ADDED]: {
    category: string;
    source: 'manual' | 'barcode' | 'receipt' | 'suggestion';
    has_image: boolean;
    expiry_days: number;
  };
  
  [ANALYTICS_EVENTS.BARCODE_SCANNED]: {
    success: boolean;
    barcode_type: string;
    product_found: boolean;
    scan_duration: number;
  };
  
  [ANALYTICS_EVENTS.RECEIPT_SCANNED]: {
    success: boolean;
    products_found: number;
    scan_duration: number;
  };
  
  [ANALYTICS_EVENTS.RECIPE_GENERATED]: {
    ingredients_count: number;
    generation_time: number;
    success: boolean;
    source: 'ai' | 'manual';
  };
  
  [ANALYTICS_EVENTS.SCREEN_VIEWED]: {
    screen_name: string;
    previous_screen?: string;
    view_duration?: number;
  };
  
  [ANALYTICS_EVENTS.SEARCH_PERFORMED]: {
    search_term: string;
    results_count: number;
    category?: string;
    source: 'products' | 'recipes';
  };
  
  [ANALYTICS_EVENTS.ERROR_OCCURRED]: {
    error_type: string;
    error_message: string;
    screen_name: string;
    user_action?: string;
  };
  
  [ANALYTICS_EVENTS.NOTIFICATION_RECEIVED]: {
    notification_type: 'expiry_reminder' | 'shopping_reminder' | 'meal_planner' | 'family' | 'marketing';
    scheduled: boolean;
  };
  
  [ANALYTICS_EVENTS.FAMILY_MEMBER_INVITED]: {
    invitation_method: 'email' | 'link' | 'qr_code';
    family_size: number;
  };
}

// Analytics Configuration
export const ANALYTICS_CONFIG = {
  // Google Analytics / Firebase Analytics
  trackingId: 'G-XXXXXXXXXX',
  
  // Event batching
  batchSize: 20,
  batchTimeout: 5000, // 5 seconds
  
  // User session tracking
  sessionTimeout: 30 * 60 * 1000, // 30 minutes
  
  // Performance monitoring
  enablePerformanceMonitoring: true,
  enableCrashReporting: true,
  
  // Privacy settings
  enableDataCollection: true,
  enablePersonalizedAds: false,
  dataRetentionDays: 90,
  
  // Debug mode
  enableDebugMode: __DEV__,
  enableVerboseLogging: __DEV__,
  
  // Sampling rates
  userSamplingRate: 1.0, // 100% of users
  eventSamplingRate: 1.0, // 100% of events
  errorSamplingRate: 1.0, // 100% of errors
  
  // Custom dimensions
  customDimensions: {
    userType: 'custom_dimension_1',
    subscriptionStatus: 'custom_dimension_2',
    familySize: 'custom_dimension_3',
    appVersion: 'custom_dimension_4',
    deviceType: 'custom_dimension_5',
  },
  
  // Conversion tracking
  conversionEvents: [
    ANALYTICS_EVENTS.SUBSCRIPTION_STARTED,
    ANALYTICS_EVENTS.TRIAL_STARTED,
    ANALYTICS_EVENTS.FAMILY_CREATED,
    ANALYTICS_EVENTS.RECIPE_GENERATED,
  ],
} as const;

// Event Priority Levels
export const EVENT_PRIORITY = {
  CRITICAL: 'critical', // Crashes, payment issues
  HIGH: 'high', // User actions, conversions
  MEDIUM: 'medium', // Navigation, feature usage
  LOW: 'low', // Performance metrics, debug info
} as const;

// Data Types for Analytics
export type AnalyticsEvent = keyof typeof ANALYTICS_EVENTS;
export type UserProperty = keyof typeof USER_PROPERTIES;
export type EventPriority = keyof typeof EVENT_PRIORITY;

// Helper function to create typed analytics events
export const createAnalyticsEvent = <T extends AnalyticsEvent>(
  event: T,
  params?: T extends keyof AnalyticsEventParams ? AnalyticsEventParams[T] : Record<string, any>,
  priority: EventPriority = 'MEDIUM'
) => ({
  event,
  params: params || {},
  priority,
  timestamp: Date.now(),
});

// Privacy-compliant event filtering
export const PRIVACY_SENSITIVE_EVENTS = [
  ANALYTICS_EVENTS.USER_SIGN_UP,
  ANALYTICS_EVENTS.USER_SIGN_IN,
  ANALYTICS_EVENTS.SUBSCRIPTION_STARTED,
  ANALYTICS_EVENTS.FAMILY_MEMBER_INVITED,
] as const;

// GDPR compliance settings
export const GDPR_CONFIG = {
  requireConsent: true,
  consentCategories: [
    'necessary',
    'analytics',
    'marketing',
    'personalization',
  ],
  defaultConsentState: {
    necessary: true,
    analytics: false,
    marketing: false,
    personalization: false,
  },
} as const;
