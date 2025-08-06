// firebaseConfig.ts - Konfiguracja Firebase dla aplikacji Sprytna Spiżarnia

export const firebaseConfig = {
  // Produkcja
  production: {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY_PROD || "AIzaSyD...",
    authDomain: "sprytna-spizarnia.firebaseapp.com",
    projectId: "sprytna-spizarnia",
    storageBucket: "sprytna-spizarnia.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef123456",
    measurementId: "G-XXXXXXXXXX",
    
    // Dodatkowe ustawienia
    vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY_PROD || "BKagOny0K...",
    databaseURL: "https://sprytna-spizarnia-default-rtdb.europe-west1.firebasedatabase.app",
    
    // Cloud Functions region
    functionsRegion: 'europe-west1',
    
    // Storage bucket dla różnych typów plików
    storageBuckets: {
      products: 'products',
      receipts: 'receipts',
      recipes: 'recipes',
      userAvatars: 'avatars'
    }
  },
  
  // Development
  development: {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY_DEV || "AIzaSyC...",
    authDomain: "sprytna-spizarnia-dev.firebaseapp.com",
    projectId: "sprytna-spizarnia-dev",
    storageBucket: "sprytna-spizarnia-dev.appspot.com",
    messagingSenderId: "987654321098",
    appId: "1:987654321098:web:fedcba654321",
    measurementId: "G-YYYYYYYYYY",
    
    vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY_DEV || "BLagOny1L...",
    databaseURL: "https://sprytna-spizarnia-dev-default-rtdb.europe-west1.firebasedatabase.app",
    
    functionsRegion: 'europe-west1',
    
    storageBuckets: {
      products: 'products-dev',
      receipts: 'receipts-dev',
      recipes: 'recipes-dev',
      userAvatars: 'avatars-dev'
    }
  },
  
  // Staging
  staging: {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY_STAGING || "AIzaSyB...",
    authDomain: "sprytna-spizarnia-staging.firebaseapp.com",
    projectId: "sprytna-spizarnia-staging",
    storageBucket: "sprytna-spizarnia-staging.appspot.com",
    messagingSenderId: "456789012345",
    appId: "1:456789012345:web:abcdef789012",
    measurementId: "G-ZZZZZZZZZZ",
    
    vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY_STAGING || "BMagOny2M...",
    databaseURL: "https://sprytna-spizarnia-staging-default-rtdb.europe-west1.firebasedatabase.app",
    
    functionsRegion: 'europe-west1',
    
    storageBuckets: {
      products: 'products-staging',
      receipts: 'receipts-staging',
      recipes: 'recipes-staging',
      userAvatars: 'avatars-staging'
    }
  }
};

// Określ środowisko
const getEnvironment = (): 'production' | 'development' | 'staging' => {
  const env = process.env.REACT_APP_ENVIRONMENT || process.env.NODE_ENV;
  
  switch (env) {
    case 'production':
      return 'production';
    case 'staging':
      return 'staging';
    case 'development':
    case 'test':
    default:
      return 'development';
  }
};

// Eksportuj konfigurację dla aktualnego środowiska
const currentEnvironment = getEnvironment();
export const currentConfig = firebaseConfig[currentEnvironment];

// Ustawienia Firestore
export const firestoreSettings = {
  // Cache settings
  cacheSizeBytes: 50 * 1024 * 1024, // 50 MB
  
  // Persistence settings
  synchronizeTabs: true,
  
  // Experimental settings
  experimentalForceLongPolling: false,
  experimentalAutoDetectLongPolling: true
};

// Ustawienia Storage
export const storageSettings = {
  maxUploadSizeMB: 10,
  maxDownloadSizeMB: 20,
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/heic'],
  allowedDocumentTypes: ['application/pdf'],
  
  // Kompresja obrazów
  imageCompression: {
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 0.8,
    format: 'webp' as const
  },
  
  // Miniaturki
  thumbnailSettings: {
    width: 200,
    height: 200,
    quality: 0.7
  }
};

// Ustawienia Authentication
export const authSettings = {
  // Session persistence
  persistence: 'local' as const, // 'local' | 'session' | 'none'
  
  // Token refresh
  tokenRefreshThreshold: 5 * 60 * 1000, // 5 minut przed wygaśnięciem
  
  // Account settings
  requireEmailVerification: false,
  allowAnonymousAccounts: true,
  allowMultipleAccounts: false,
  
  // Password requirements
  passwordRequirements: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: false
  },
  
  // Rate limiting
  maxLoginAttempts: 5,
  lockoutDuration: 15 * 60 * 1000, // 15 minut
  
  // Social providers
  enabledProviders: [
    'google.com',
    'apple.com',
    'password',
    'anonymous'
  ]
};

// Ustawienia Cloud Functions
export const functionsSettings = {
  region: currentConfig.functionsRegion,
  timeout: 30000, // 30 sekund
  
  // Endpoints
  endpoints: {
    generateRecipes: 'generateRecipes',
    scanBarcode: 'scanBarcode',
    scanReceipt: 'scanReceipt',
    inviteFamilyMember: 'inviteFamilyMember',
    acceptFamilyInvite: 'acceptFamilyInvite',
    getStatistics: 'getStatistics',
    sendExpiryNotifications: 'sendExpiryNotifications',
    generateShoppingList: 'generateShoppingList',
    exportData: 'exportData',
    deleteAccount: 'deleteAccount',
    upgradeAccount: 'upgradeAccount',
    processPayment: 'processPayment'
  },
  
  // Retry configuration
  retryConfig: {
    maxAttempts: 3,
    backoffMultiplier: 2,
    initialDelay: 1000,
    maxDelay: 10000
  }
};

// Ustawienia Analytics
export const analyticsSettings = {
  enabled: currentEnvironment === 'production',
  
  // Events to track
  trackedEvents: [
    'product_added',
    'product_deleted',
    'product_updated',
    'product_consumed',
    'recipe_generated',
    'recipe_saved',
    'recipe_cooked',
    'shopping_list_created',
    'shopping_list_completed',
    'family_created',
    'family_joined',
    'barcode_scanned',
    'receipt_scanned',
    'notification_enabled',
    'subscription_started',
    'subscription_cancelled',
    'user_signup',
    'user_login',
    'user_logout',
    'account_deleted'
  ],
  
  // User properties
  userProperties: [
    'subscription_type',
    'family_size',
    'products_count',
    'app_version',
    'platform',
    'language',
    'theme'
  ],
  
  // Conversion events
  conversionEvents: [
    'subscription_started',
    'family_created',
    'first_product_added'
  ]
};

// Ustawienia Performance Monitoring
export const performanceSettings = {
  enabled: currentEnvironment === 'production',
  
  // Traces to monitor
  customTraces: [
    'products_load',
    'recipe_generation',
    'barcode_scan',
    'receipt_scan',
    'image_upload',
    'sync_operation',
    'family_data_load'
  ],
  
  // Network monitoring
  networkRequestTimeout: 10000,
  
  // Sampling rate (0-1)
  samplingRate: currentEnvironment === 'production' ? 0.1 : 1.0
};

// Ustawienia Messaging (Push Notifications)
export const messagingSettings = {
  vapidKey: currentConfig.vapidKey,
  
  // Notification settings
  defaultNotificationOptions: {
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    vibrate: [200, 100, 200],
    requireInteraction: false,
    silent: false
  },
  
  // Topics
  topics: {
    expiryReminders: 'expiry-reminders',
    familyUpdates: 'family-updates',
    systemUpdates: 'system-updates',
    promotions: 'promotions'
  },
  
  // Channels (dla Android)
  notificationChannels: [
    {
      id: 'expiry',
      name: 'Przypomnienia o dacie ważności',
      importance: 4,
      sound: 'default'
    },
    {
      id: 'family',
      name: 'Aktualizacje rodzinne',
      importance: 3,
      sound: 'default'
    },
    {
      id: 'system',
      name: 'Powiadomienia systemowe',
      importance: 2,
      sound: null
    }
  ]
};

// Remote Config defaults
export const remoteConfigDefaults = {
  // Feature flags
  enable_ai_recipes: true,
  enable_barcode_scanning: true,
  enable_receipt_scanning: true,
  enable_meal_planning: true,
  enable_waste_tracking: true,
  enable_voice_input: false,
  enable_smart_suggestions: true,
  
  // Limits
  max_products_free: 50,
  max_products_pro: 1000,
  max_recipes_per_day_free: 3,
  max_recipes_per_day_pro: 100,
  max_family_members: 10,
  max_shopping_lists: 20,
  
  // AI Settings
  ai_model_version: 'gemini-pro',
  ai_temperature: 0.7,
  ai_max_tokens: 2000,
  
  // Pricing (w groszach)
  price_monthly: 999, // 9.99 PLN
  price_yearly: 9999, // 99.99 PLN
  price_lifetime: 29999, // 299.99 PLN
  
  // Maintenance
  maintenance_mode: false,
  maintenance_message: '',
  
  // App versions
  min_app_version: '3.0.0',
  recommended_app_version: '3.1.0',
  force_update_version: '2.0.0',
  
  // URLs
  privacy_policy_url: 'https://sprytna-spizarnia.pl/privacy',
  terms_of_service_url: 'https://sprytna-spizarnia.pl/terms',
  support_email: 'support@sprytna-spizarnia.pl',
  feedback_form_url: 'https://forms.gle/...'
};

// Security Rules Templates
export const securityRulesTemplates = {
  // Firestore rules version
  firestoreRulesVersion: '2',
  
  // Common patterns
  isAuthenticated: 'request.auth != null',
  isOwner: 'request.auth.uid == resource.data.ownerId',
  isFamilyMember: 'request.auth.uid in resource.data.familyMembers',
  isPro: 'request.auth.token.isPro == true',
  
  // Rate limiting
  rateLimits: {
    reads: 1000, // per minute
    writes: 100, // per minute
    deletes: 50 // per minute
  }
};

// Emulator settings (dla development)
export const emulatorSettings = {
  useEmulators: process.env.REACT_APP_USE_EMULATORS === 'true',
  
  auth: {
    host: 'localhost',
    port: 9099
  },
  firestore: {
    host: 'localhost',
    port: 8080
  },
  functions: {
    host: 'localhost',
    port: 5001
  },
  storage: {
    host: 'localhost',
    port: 9199
  },
  database: {
    host: 'localhost',
    port: 9000
  }
};

// API Keys dla zewnętrznych serwisów
export const externalApiKeys = {
  // Open Food Facts API
  openFoodFacts: {
    baseUrl: 'https://world.openfoodfacts.org/api/v0',
    userAgent: 'SprytnaSpizarnia/3.0'
  },
  
  // Google Vision API (dla OCR)
  googleVision: {
    apiKey: process.env.REACT_APP_GOOGLE_VISION_API_KEY,
    endpoint: 'https://vision.googleapis.com/v1'
  },
  
  // Gemini API (dla AI)
  gemini: {
    apiKey: process.env.REACT_APP_GEMINI_API_KEY,
    model: 'gemini-pro',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta'
  },
  
  // Stripe (dla płatności)
  stripe: {
    publishableKey: process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY,
    secretKey: process.env.STRIPE_SECRET_KEY, // Tylko po stronie serwera!
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET
  },
  
  // SendGrid (dla emaili)
  sendGrid: {
    apiKey: process.env.SENDGRID_API_KEY, // Tylko po stronie serwera!
    fromEmail: 'noreply@sprytna-spizarnia.pl',
    templates: {
      welcome: 'd-xxxxxxxxxxxxx',
      familyInvite: 'd-yyyyyyyyyyyyy',
      expiryReminder: 'd-zzzzzzzzzzzzz',
      weeklyReport: 'd-aaaaaaaaaaaaa'
    }
  }
};

// Export domyślnej konfiguracji
export default currentConfig;