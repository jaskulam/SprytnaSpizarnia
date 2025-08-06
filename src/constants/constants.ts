// General App Constants
export const APP_NAME = 'Sprytna Spiżarnia';
export const APP_VERSION = '1.0.0';

// Date & Time Constants
export const DATE_FORMATS = {
  display: 'DD.MM.YYYY',
  api: 'YYYY-MM-DD',
  timestamp: 'YYYY-MM-DD HH:mm:ss',
  short: 'DD.MM',
  long: 'dddd, DD MMMM YYYY',
} as const;

export const TIME_FORMATS = {
  display: 'HH:mm',
  full: 'HH:mm:ss',
  ampm: 'h:mm A',
} as const;

// Navigation Constants
export const SCREENS = {
  // Auth Stack
  LOGIN: 'Login',
  REGISTER: 'Register',
  FORGOT_PASSWORD: 'ForgotPassword',
  
  // Main Tab Stack
  HOME: 'Home',
  PRODUCTS: 'Products',
  RECIPES: 'Recipes',
  SHOPPING: 'Shopping',
  SETTINGS: 'Settings',
  
  // Modal Screens
  ADD_PRODUCT: 'AddProduct',
  EDIT_PRODUCT: 'EditProduct',
  PRODUCT_DETAILS: 'ProductDetails',
  BARCODE_SCANNER: 'BarcodeScanner',
  RECEIPT_SCANNER: 'ReceiptScanner',
  RECIPE_DETAILS: 'RecipeDetails',
  MEAL_PLANNER: 'MealPlanner',
  FAMILY_MANAGER: 'FamilyManager',
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  USER_TOKEN: '@sprytna_spizarnia:user_token',
  USER_DATA: '@sprytna_spizarnia:user_data',
  THEME: '@sprytna_spizarnia:theme',
  LANGUAGE: '@sprytna_spizarnia:language',
  ONBOARDING_COMPLETED: '@sprytna_spizarnia:onboarding_completed',
  BIOMETRIC_ENABLED: '@sprytna_spizarnia:biometric_enabled',
  NOTIFICATION_SETTINGS: '@sprytna_spizarnia:notification_settings',
  CACHE_VERSION: '@sprytna_spizarnia:cache_version',
  OFFLINE_DATA: '@sprytna_spizarnia:offline_data',
  LAST_SYNC: '@sprytna_spizarnia:last_sync',
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  REFRESH_TOKEN: '/auth/refresh',
  LOGOUT: '/auth/logout',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  
  // Products
  PRODUCTS: '/products',
  PRODUCT_BY_ID: (id: string) => `/products/${id}`,
  PRODUCT_BY_BARCODE: (barcode: string) => `/products/barcode/${barcode}`,
  PRODUCT_UPLOAD_IMAGE: (id: string) => `/products/${id}/image`,
  
  // Recipes
  RECIPES: '/recipes',
  RECIPE_BY_ID: (id: string) => `/recipes/${id}`,
  RECIPE_GENERATE: '/recipes/generate',
  RECIPE_SEARCH: '/recipes/search',
  
  // Shopping
  SHOPPING_LISTS: '/shopping-lists',
  SHOPPING_LIST_BY_ID: (id: string) => `/shopping-lists/${id}`,
  
  // Family
  FAMILY: '/family',
  FAMILY_INVITE: '/family/invite',
  FAMILY_ACCEPT_INVITE: '/family/accept-invite',
  
  // Notifications
  NOTIFICATIONS: '/notifications',
  NOTIFICATION_TOKEN: '/notifications/token',
  
  // Sync
  SYNC: '/sync',
  SYNC_STATUS: '/sync/status',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Brak połączenia z internetem',
  SERVER_ERROR: 'Błąd serwera. Spróbuj ponownie później',
  VALIDATION_ERROR: 'Dane są nieprawidłowe',
  AUTHENTICATION_ERROR: 'Błąd uwierzytelniania',
  AUTHORIZATION_ERROR: 'Brak uprawnień',
  NOT_FOUND: 'Nie znaleziono',
  TIMEOUT_ERROR: 'Przekroczono limit czasu',
  UNKNOWN_ERROR: 'Wystąpił nieoczekiwany błąd',
  
  // Specific errors
  INVALID_EMAIL: 'Nieprawidłowy adres email',
  INVALID_PASSWORD: 'Hasło musi mieć minimum 8 znaków',
  PASSWORDS_NOT_MATCH: 'Hasła nie są zgodne',
  EMAIL_ALREADY_EXISTS: 'Konto z tym adresem email już istnieje',
  INVALID_CREDENTIALS: 'Nieprawidłowy email lub hasło',
  ACCOUNT_DISABLED: 'Konto zostało zablokowane',
  
  // Product errors
  PRODUCT_NAME_REQUIRED: 'Nazwa produktu jest wymagana',
  PRODUCT_CATEGORY_REQUIRED: 'Kategoria produktu jest wymagana',
  PRODUCT_EXPIRY_DATE_REQUIRED: 'Data ważności jest wymagana',
  PRODUCT_NOT_FOUND: 'Produkt nie został znaleziony',
  BARCODE_NOT_FOUND: 'Nie znaleziono produktu o tym kodzie kreskowym',
  
  // Camera errors
  CAMERA_PERMISSION_DENIED: 'Brak dostępu do kamery',
  CAMERA_NOT_AVAILABLE: 'Kamera jest niedostępna',
  
  // Storage errors
  STORAGE_QUOTA_EXCEEDED: 'Przekroczono limit przestrzeni dyskowej',
  FILE_UPLOAD_FAILED: 'Błąd podczas przesyłania pliku',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  PRODUCT_ADDED: 'Produkt został dodany',
  PRODUCT_UPDATED: 'Produkt został zaktualizowany',
  PRODUCT_DELETED: 'Produkt został usunięty',
  RECIPE_SAVED: 'Przepis został zapisany',
  SHOPPING_LIST_CREATED: 'Lista zakupów została utworzona',
  FAMILY_MEMBER_INVITED: 'Zaproszenie zostało wysłane',
  SETTINGS_SAVED: 'Ustawienia zostały zapisane',
  PASSWORD_CHANGED: 'Hasło zostało zmienione',
  LOGOUT_SUCCESS: 'Zostałeś wylogowany',
  SYNC_COMPLETED: 'Synchronizacja zakończona',
} as const;

// Validation Constants
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  PRODUCT_NAME_MAX_LENGTH: 100,
  PRODUCT_NOTES_MAX_LENGTH: 500,
  RECIPE_NAME_MAX_LENGTH: 150,
  RECIPE_DESCRIPTION_MAX_LENGTH: 1000,
  FAMILY_NAME_MAX_LENGTH: 50,
  
  // File upload limits
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  MAX_FILE_NAME_LENGTH: 255,
} as const;

// Permissions
export const PERMISSIONS = {
  CAMERA: 'camera',
  PHOTO_LIBRARY: 'photo-library',
  NOTIFICATIONS: 'notifications',
  LOCATION: 'location',
} as const;

// Theme Constants
export const THEME = {
  COLORS: {
    PRIMARY: '#2196F3',
    SECONDARY: '#4CAF50',
    ERROR: '#F44336',
    WARNING: '#FF9800',
    SUCCESS: '#4CAF50',
    INFO: '#2196F3',
    
    // Grayscale
    WHITE: '#FFFFFF',
    BLACK: '#000000',
    GRAY_50: '#FAFAFA',
    GRAY_100: '#F5F5F5',
    GRAY_200: '#EEEEEE',
    GRAY_300: '#E0E0E0',
    GRAY_400: '#BDBDBD',
    GRAY_500: '#9E9E9E',
    GRAY_600: '#757575',
    GRAY_700: '#616161',
    GRAY_800: '#424242',
    GRAY_900: '#212121',
  },
  
  SPACING: {
    XS: 4,
    SM: 8,
    MD: 16,
    LG: 24,
    XL: 32,
    XXL: 48,
  },
  
  BORDER_RADIUS: {
    SM: 4,
    MD: 8,
    LG: 12,
    XL: 16,
    ROUND: 50,
  },
  
  FONT_SIZES: {
    XS: 12,
    SM: 14,
    MD: 16,
    LG: 18,
    XL: 20,
    XXL: 24,
    XXXL: 32,
  },
  
  SHADOWS: {
    SM: {
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.22,
      shadowRadius: 2.22,
      elevation: 3,
    },
    MD: {
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.23,
      shadowRadius: 2.62,
      elevation: 4,
    },
    LG: {
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 8,
    },
  },
} as const;

// Animation Constants
export const ANIMATIONS = {
  DURATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
  },
  EASING: {
    EASE_IN: 'ease-in',
    EASE_OUT: 'ease-out',
    EASE_IN_OUT: 'ease-in-out',
  },
} as const;

// Regex Patterns
export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
  PHONE: /^\+?[\d\s\-\(\)]{10,}$/,
  BARCODE: /^\d{8,13}$/,
  URL: /^https?:\/\/.+/,
} as const;

export type ScreenName = keyof typeof SCREENS;
export type StorageKey = keyof typeof STORAGE_KEYS;
export type ApiEndpoint = keyof typeof API_ENDPOINTS;
export type ErrorMessage = keyof typeof ERROR_MESSAGES;
export type SuccessMessage = keyof typeof SUCCESS_MESSAGES;
