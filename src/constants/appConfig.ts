export const APP_CONFIG = {
  name: 'Sprytna Spiżarnia',
  version: '1.0.0',
  buildNumber: '1',
  
  // API Configuration
  api: {
    baseUrl: __DEV__ ? 'http://localhost:3000/api' : 'https://api.sprytna-spizarnia.pl',
    timeout: 10000,
    retryAttempts: 3,
  },

  // Firebase Configuration
  firebase: {
    projectId: 'sprytna-spizarnia',
    storageBucket: 'sprytna-spizarnia.appspot.com',
    messagingSenderId: '123456789',
    appId: '1:123456789:android:abcdef123456',
  },

  // Feature Flags
  features: {
    enablePushNotifications: true,
    enableBarcodeScanner: true,
    enableReceiptScanner: true,
    enableAIRecipes: true,
    enableFamilySharing: true,
    enableOfflineMode: true,
    enableBiometricAuth: true,
    enableAnalytics: !__DEV__,
  },

  // Subscription Configuration
  subscription: {
    trialDays: 7,
    monthlyProductId: 'sprytna_spizarnia_monthly',
    yearlyProductId: 'sprytna_spizarnia_yearly',
    yearlyDiscount: 0.2, // 20% discount
  },

  // Limits for Free Users
  freeLimits: {
    maxProducts: 50,
    maxRecipes: 10,
    maxFamilyMembers: 2,
    maxShoppingLists: 3,
    aiRecipeGenerationsPerMonth: 5,
  },

  // Pro Features
  proLimits: {
    maxProducts: 1000,
    maxRecipes: 500,
    maxFamilyMembers: 10,
    maxShoppingLists: 20,
    aiRecipeGenerationsPerMonth: 100,
  },

  // Cache Configuration
  cache: {
    productImagesCacheDuration: 7 * 24 * 60 * 60 * 1000, // 7 days
    recipeImagesCacheDuration: 30 * 24 * 60 * 60 * 1000, // 30 days
    apiCacheDuration: 5 * 60 * 1000, // 5 minutes
  },

  // Notification Configuration
  notifications: {
    defaultExpiryReminderDays: [1, 3, 7],
    shoppingReminderTime: '18:00',
    mealPlannerReminderTime: '09:00',
    maxPendingNotifications: 64,
  },

  // UI Configuration
  ui: {
    animationDuration: 300,
    hapticFeedback: true,
    darkModeSupport: true,
    defaultTheme: 'system' as 'light' | 'dark' | 'system',
    primaryColor: '#2196F3',
    secondaryColor: '#4CAF50',
    errorColor: '#F44336',
    warningColor: '#FF9800',
  },

  // Security Configuration
  security: {
    biometricTimeout: 5 * 60 * 1000, // 5 minutes
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 minutes
  },

  // External Services
  external: {
    openFoodFactsApi: 'https://world.openfoodfacts.org/api/v0',
    nutritionixApi: 'https://trackapi.nutritionix.com/v2',
    spoonacularApi: 'https://api.spoonacular.com',
  },

  // Development Configuration
  development: {
    enableReduxLogger: __DEV__,
    enableNetworkLogger: __DEV__,
    enableCrashReporting: !__DEV__,
    enablePerformanceMonitoring: !__DEV__,
  },
} as const;

export type AppConfig = typeof APP_CONFIG;
