// constants.ts - Stałe wartości dla aplikacji Sprytna Spiżarnia

// ============== WERSJA APLIKACJI ==============
export const APP_VERSION = '3.1.0';
export const APP_BUILD = '2024.12.15';
export const MIN_SUPPORTED_VERSION = '3.0.0';

// ============== NAZWY I IDENTYFIKATORY ==============
export const APP_NAME = 'Sprytna Spiżarnia';
export const APP_NAME_SHORT = 'SS';
export const APP_BUNDLE_ID = 'pl.sprytna-spizarnia.app';
export const APP_SCHEME = 'sprytna-spizarnia://';

// ============== LIMITY ==============
export const LIMITS = {
  // Limity dla użytkowników FREE
  FREE: {
    MAX_PRODUCTS: 50,
    MAX_RECIPES_PER_DAY: 3,
    MAX_SHOPPING_LISTS: 3,
    MAX_SHOPPING_LIST_ITEMS: 20,
    MAX_RECIPE_INGREDIENTS: 3,
    MAX_FAMILY_MEMBERS: 0,
    MAX_MEAL_PLANS: 0,
    MAX_PRODUCT_PHOTOS: 0,
    MAX_CUSTOM_LOCATIONS: 0,
    MAX_EXPORT_PER_MONTH: 1,
    EXPIRY_WARNING_DAYS: 3
  },
  
  // Limity dla użytkowników PRO
  PRO: {
    MAX_PRODUCTS: 1000,
    MAX_RECIPES_PER_DAY: 100,
    MAX_SHOPPING_LISTS: 50,
    MAX_SHOPPING_LIST_ITEMS: 200,
    MAX_RECIPE_INGREDIENTS: 20,
    MAX_FAMILY_MEMBERS: 10,
    MAX_MEAL_PLANS: 12,
    MAX_PRODUCT_PHOTOS: 5,
    MAX_CUSTOM_LOCATIONS: 20,
    MAX_EXPORT_PER_MONTH: -1, // Bez limitu
    EXPIRY_WARNING_DAYS: 30
  },
  
  // Limity systemowe
  SYSTEM: {
    MAX_FILE_SIZE_MB: 10,
    MAX_IMAGE_SIZE_MB: 5,
    MAX_BATCH_SIZE: 100,
    MAX_SEARCH_RESULTS: 50,
    MAX_NOTIFICATIONS: 100,
    MAX_ACTIVITY_LOGS: 1000,
    CACHE_SIZE_MB: 50,
    SESSION_TIMEOUT_MINUTES: 30,
    REFRESH_TOKEN_DAYS: 30
  }
} as const;

// ============== DOMYŚLNE LOKALIZACJE ==============
export const DEFAULT_LOCATIONS = [
  'Lodówka',
  'Zamrażarka',
  'Spiżarnia',
  'Kuchnia',
  'Szafka',
  'Szafka z przyprawami',
  'Piwnica',
  'Garaż'
] as const;

// ============== KATEGORIE PRODUKTÓW ==============
export const PRODUCT_CATEGORIES = [
  { id: 'dairy', name: 'Nabiał', icon: '🥛', color: '#FFE5B4' },
  { id: 'meat', name: 'Mięso i ryby', icon: '🥩', color: '#FFB6C1' },
  { id: 'vegetables', name: 'Warzywa', icon: '🥦', color: '#90EE90' },
  { id: 'fruits', name: 'Owoce', icon: '🍎', color: '#FFD700' },
  { id: 'bread', name: 'Pieczywo', icon: '🍞', color: '#DEB887' },
  { id: 'spices', name: 'Przyprawy', icon: '🧂', color: '#CD853F' },
  { id: 'drinks', name: 'Napoje', icon: '🥤', color: '#87CEEB' },
  { id: 'sweets', name: 'Słodycze', icon: '🍫', color: '#D2691E' },
  { id: 'canned', name: 'Konserwy', icon: '🥫', color: '#C0C0C0' },
  { id: 'frozen', name: 'Mrożonki', icon: '🧊', color: '#B0E0E6' },
  { id: 'other', name: 'Inne', icon: '📦', color: '#D3D3D3' }
] as const;

// ============== JEDNOSTKI MIARY ==============
export const MEASUREMENT_UNITS = {
  WEIGHT: ['kg', 'g', 'mg', 'lb', 'oz'],
  VOLUME: ['l', 'ml', 'cup', 'tbsp', 'tsp'],
  COUNT: ['szt', 'paczka', 'opakowanie', 'butelka', 'słoik'],
  LENGTH: ['cm', 'm', 'inch']
} as const;

// ============== DIETY I PREFERENCJE ==============
export const DIET_TYPES = [
  { id: 'vegan', name: 'Wegańska', icon: '🌱' },
  { id: 'vegetarian', name: 'Wegetariańska', icon: '🥗' },
  { id: 'gluten-free', name: 'Bezglutenowa', icon: '🌾' },
  { id: 'dairy-free', name: 'Bez laktozy', icon: '🥛' },
  { id: 'keto', name: 'Keto', icon: '🥑' },
  { id: 'paleo', name: 'Paleo', icon: '🍖' },
  { id: 'low-carb', name: 'Niskowęglowodanowa', icon: '🥦' },
  { id: 'low-fat', name: 'Niskotłuszczowa', icon: '🥬' },
  { id: 'halal', name: 'Halal', icon: '☪️' },
  { id: 'kosher', name: 'Koszerna', icon: '✡️' }
] as const;

// ============== POZIOMY TRUDNOŚCI PRZEPISÓW ==============
export const RECIPE_DIFFICULTIES = [
  { id: 'easy', name: 'Łatwe', icon: '👨‍🍳', color: '#90EE90' },
  { id: 'medium', name: 'Średnie', icon: '👨‍🍳👨‍🍳', color: '#FFD700' },
  { id: 'hard', name: 'Trudne', icon: '👨‍🍳👨‍🍳👨‍🍳', color: '#FF6347' }
] as const;

// ============== TYPY POSIŁKÓW ==============
export const MEAL_TYPES = [
  { id: 'breakfast', name: 'Śniadanie', icon: '🍳', time: '07:00' },
  { id: 'lunch', name: 'Lunch', icon: '🥗', time: '12:00' },
  { id: 'dinner', name: 'Obiad', icon: '🍽️', time: '14:00' },
  { id: 'snack', name: 'Przekąska', icon: '🍿', time: '16:00' },
  { id: 'supper', name: 'Kolacja', icon: '🥪', time: '19:00' },
  { id: 'dessert', name: 'Deser', icon: '🍰', time: '20:00' }
] as const;

// ============== KOLORY APLIKACJI ==============
export const COLORS = {
  PRIMARY: '#3B82F6', // Blue 500
  PRIMARY_DARK: '#2563EB', // Blue 600
  PRIMARY_LIGHT: '#60A5FA', // Blue 400
  
  SUCCESS: '#10B981', // Green 500
  SUCCESS_DARK: '#059669', // Green 600
  SUCCESS_LIGHT: '#34D399', // Green 400
  
  WARNING: '#F59E0B', // Amber 500
  WARNING_DARK: '#D97706', // Amber 600
  WARNING_LIGHT: '#FBBF24', // Amber 400
  
  DANGER: '#EF4444', // Red 500
  DANGER_DARK: '#DC2626', // Red 600
  DANGER_LIGHT: '#F87171', // Red 400
  
  NEUTRAL: '#6B7280', // Gray 500
  NEUTRAL_DARK: '#4B5563', // Gray 600
  NEUTRAL_LIGHT: '#9CA3AF', // Gray 400
  
  BACKGROUND: '#F9FAFB', // Gray 50
  SURFACE: '#FFFFFF',
  BORDER: '#E5E7EB', // Gray 200
  
  TEXT_PRIMARY: '#111827', // Gray 900
  TEXT_SECONDARY: '#6B7280', // Gray 500
  TEXT_DISABLED: '#9CA3AF', // Gray 400
  
  // Status kolorów dla świeżości
  FRESHNESS: {
    FRESH: '#10B981',
    EXPIRING_SOON: '#F59E0B',
    EXPIRED: '#EF4444'
  }
} as const;

// ============== CZASY I INTERWAŁY ==============
export const TIMINGS = {
  // Animacje (ms)
  ANIMATION_FAST: 200,
  ANIMATION_NORMAL: 300,
  ANIMATION_SLOW: 500,
  
  // Debounce/Throttle (ms)
  DEBOUNCE_SEARCH: 300,
  DEBOUNCE_INPUT: 500,
  THROTTLE_SCROLL: 100,
  
  // Synchronizacja (ms)
  SYNC_INTERVAL: 30000, // 30 sekund
  SYNC_RETRY_DELAY: 5000, // 5 sekund
  
  // Odświeżanie (ms)
  REFRESH_PRODUCTS: 60000, // 1 minuta
  REFRESH_NOTIFICATIONS: 300000, // 5 minut
  REFRESH_STATISTICS: 600000, // 10 minut
  
  // Timeouty (ms)
  API_TIMEOUT: 30000, // 30 sekund
  IMAGE_UPLOAD_TIMEOUT: 60000, // 1 minuta
  BARCODE_SCAN_TIMEOUT: 10000, // 10 sekund
  
  // Expiry warnings (dni)
  EXPIRY_WARNING_DAYS: [1, 3, 7, 14, 30],
  
  // Cache (sekundy)
  CACHE_TTL: {
    PRODUCTS: 300, // 5 minut
    RECIPES: 3600, // 1 godzina
    USER_DATA: 1800, // 30 minut
    STATISTICS: 7200 // 2 godziny
  }
} as const;

// ============== ROZMIARY ==============
export const SIZES = {
  // Ikony
  ICON_XS: 12,
  ICON_SM: 16,
  ICON_MD: 20,
  ICON_LG: 24,
  ICON_XL: 32,
  ICON_XXL: 48,
  
  // Czcionki
  FONT_XS: 10,
  FONT_SM: 12,
  FONT_MD: 14,
  FONT_LG: 16,
  FONT_XL: 18,
  FONT_XXL: 24,
  FONT_XXXL: 32,
  
  // Odstępy
  SPACING_XS: 4,
  SPACING_SM: 8,
  SPACING_MD: 16,
  SPACING_LG: 24,
  SPACING_XL: 32,
  SPACING_XXL: 48,
  
  // Border Radius
  RADIUS_SM: 4,
  RADIUS_MD: 8,
  RADIUS_LG: 12,
  RADIUS_XL: 16,
  RADIUS_FULL: 9999,
  
  // Heights
  BUTTON_HEIGHT: 48,
  INPUT_HEIGHT: 48,
  NAVBAR_HEIGHT: 64,
  TABBAR_HEIGHT: 56,
  
  // Widths
  MAX_WIDTH_MOBILE: 428,
  MAX_WIDTH_TABLET: 768,
  MAX_WIDTH_DESKTOP: 1024
} as const;

// ============== KOMUNIKATY ==============
export const MESSAGES = {
  // Sukces
  SUCCESS: {
    PRODUCT_ADDED: 'Produkt został dodany',
    PRODUCT_UPDATED: 'Produkt został zaktualizowany',
    PRODUCT_DELETED: 'Produkt został usunięty',
    RECIPE_GENERATED: 'Przepis został wygenerowany',
    RECIPE_SAVED: 'Przepis został zapisany',
    LIST_CREATED: 'Lista zakupów została utworzona',
    FAMILY_INVITED: 'Zaproszenie zostało wysłane',
    SETTINGS_SAVED: 'Ustawienia zostały zapisane',
    DATA_SYNCED: 'Dane zostały zsynchronizowane'
  },
  
  // Błędy
  ERROR: {
    GENERIC: 'Wystąpił błąd. Spróbuj ponownie.',
    NETWORK: 'Brak połączenia z internetem',
    AUTH_REQUIRED: 'Wymagane jest zalogowanie',
    PERMISSION_DENIED: 'Brak uprawnień do tej operacji',
    NOT_FOUND: 'Nie znaleziono żądanych danych',
    INVALID_DATA: 'Nieprawidłowe dane',
    LIMIT_EXCEEDED: 'Przekroczono limit',
    SYNC_FAILED: 'Synchronizacja nie powiodła się',
    UPLOAD_FAILED: 'Przesyłanie nie powiodło się',
    BARCODE_NOT_FOUND: 'Nie znaleziono produktu dla tego kodu',
    RECIPE_GENERATION_FAILED: 'Nie udało się wygenerować przepisu'
  },
  
  // Ostrzeżenia
  WARNING: {
    EXPIRY_SOON: 'Produkt wkrótce się przeterminuje',
    EXPIRED: 'Produkt jest przeterminowany',
    LOW_STOCK: 'Niski stan produktu',
    OFFLINE_MODE: 'Pracujesz w trybie offline',
    UNSAVED_CHANGES: 'Masz niezapisane zmiany',
    DELETE_CONFIRM: 'Czy na pewno chcesz usunąć?',
    LOGOUT_CONFIRM: 'Czy na pewno chcesz się wylogować?'
  },
  
  // Informacje
  INFO: {
    LOADING: 'Ładowanie...',
    SAVING: 'Zapisywanie...',
    SYNCING: 'Synchronizacja...',
    GENERATING: 'Generowanie...',
    SCANNING: 'Skanowanie...',
    NO_PRODUCTS: 'Brak produktów w spiżarni',
    NO_RECIPES: 'Brak zapisanych przepisów',
    NO_LISTS: 'Brak list zakupów',
    NO_NOTIFICATIONS: 'Brak powiadomień',
    UPGRADE_REQUIRED: 'Ta funkcja wymaga konta PRO',
    FEATURE_COMING_SOON: 'Ta funkcja będzie dostępna wkrótce'
  }
} as const;

// ============== REGEXP PATTERNS ==============
export const PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
  PHONE: /^(\+48)?[ -]?\d{3}[ -]?\d{3}[ -]?\d{3}$/,
  BARCODE_EAN8: /^\d{8}$/,
  BARCODE_EAN13: /^\d{13}$/,
  DATE: /^\d{4}-\d{2}-\d{2}$/,
  TIME: /^([01]\d|2[0-3]):([0-5]\d)$/,
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  HEX_COLOR: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
} as const;

// ============== KLUCZE LOCAL STORAGE ==============
export const STORAGE_KEYS = {
  USER_TOKEN: 'ss_user_token',
  USER_DATA: 'ss_user_data',
  USER_PREFERENCES: 'ss_user_preferences',
  PENDING_CHANGES: 'ss_pending_changes',
  CACHED_PRODUCTS: 'ss_cached_products',
  CACHED_RECIPES: 'ss_cached_recipes',
  CACHED_LISTS: 'ss_cached_lists',
  LAST_SYNC: 'ss_last_sync',
  APP_SETTINGS: 'ss_app_settings',
  ONBOARDING_COMPLETED: 'ss_onboarding_completed',
  SELECTED_THEME: 'ss_selected_theme',
  SELECTED_LANGUAGE: 'ss_selected_language',
  DEVICE_ID: 'ss_device_id',
  ANALYTICS_CONSENT: 'ss_analytics_consent'
} as const;

// ============== ROUTES ==============
export const ROUTES = {
  // Główne
  HOME: '/',
  PRODUCTS: '/products',
  SHOPPING: '/shopping',
  RECIPES: '/recipes',
  MEAL_PLANNER: '/meal-planner',
  SETTINGS: '/settings',
  
  // Auth
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  
  // Produkty
  ADD_PRODUCT: '/products/add',
  EDIT_PRODUCT: '/products/edit/:id',
  PRODUCT_DETAILS: '/products/:id',
  SCAN_BARCODE: '/products/scan-barcode',
  SCAN_RECEIPT: '/products/scan-receipt',
  
  // Przepisy
  GENERATE_RECIPE: '/recipes/generate',
  RECIPE_DETAILS: '/recipes/:id',
  SAVED_RECIPES: '/recipes/saved',
  
  // Rodzina
  FAMILY: '/family',
  FAMILY_INVITE: '/family/invite',
  FAMILY_MEMBERS: '/family/members',
  
  // Profil
  PROFILE: '/profile',
  SUBSCRIPTION: '/subscription',
  NOTIFICATIONS: '/notifications',
  STATISTICS: '/statistics',
  
  // Inne
  HELP: '/help',
  PRIVACY: '/privacy',
  TERMS: '/terms',
  ABOUT: '/about',
  ONBOARDING: '/onboarding'
} as const;

// ============== API ENDPOINTS ==============
export const API_ENDPOINTS = {
  // Base URLs
  BASE_URL: process.env.REACT_APP_API_URL || 'https://api.sprytna-spizarnia.pl',
  
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    VERIFY_EMAIL: '/auth/verify-email',
    RESET_PASSWORD: '/auth/reset-password',
    SOCIAL_LOGIN: '/auth/social'
  },
  
  // Products
  PRODUCTS: {
    LIST: '/products',
    CREATE: '/products',
    UPDATE: '/products/:id',
    DELETE: '/products/:id',
    BATCH: '/products/batch',
    SEARCH: '/products/search'
  },
  
  // Recipes
  RECIPES: {
    GENERATE: '/recipes/generate',
    LIST: '/recipes',
    SAVE: '/recipes',
    DELETE: '/recipes/:id',
    RATE: '/recipes/:id/rate'
  },
  
  // Shopping
  SHOPPING: {
    LISTS: '/shopping-lists',
    CREATE: '/shopping-lists',
    UPDATE: '/shopping-lists/:id',
    DELETE: '/shopping-lists/:id',
    SHARE: '/shopping-lists/:id/share'
  },
  
  // Family
  FAMILY: {
    CREATE: '/family',
    INVITE: '/family/invite',
    ACCEPT: '/family/accept',
    LEAVE: '/family/leave',
    MEMBERS: '/family/members',
    REMOVE_MEMBER: '/family/members/:id'
  },
  
  // External APIs
  EXTERNAL: {
    OPEN_FOOD_FACTS: 'https://world.openfoodfacts.org/api/v0/product',
    BARCODE_LOOKUP: 'https://api.barcodelookup.com/v3/products',
    NUTRITION_API: 'https://api.nutritionix.com/v1_1'
  }
} as const;

// ============== ŚRODOWISKA ==============
export const ENVIRONMENTS = {
  DEVELOPMENT: 'development',
  STAGING: 'staging',
  PRODUCTION: 'production',
  TEST: 'test'
} as const;

// ============== PLATFORMY ==============
export const PLATFORMS = {
  IOS: 'ios',
  ANDROID: 'android',
  WEB: 'web',
  DESKTOP: 'desktop'
} as const;

// ============== JĘZYKI ==============
export const LANGUAGES = [
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' }
] as const;

// ============== WALUTY ==============
export const CURRENCIES = [
  { code: 'PLN', symbol: 'zł', name: 'Polski złoty' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'USD', symbol: '$', name: 'Dolar amerykański' },
  { code: 'GBP', symbol: '£', name: 'Funt brytyjski' }
] as const;

// ============== DOMYŚLNE WARTOŚCI ==============
export const DEFAULTS = {
  LANGUAGE: 'pl',
  CURRENCY: 'PLN',
  THEME: 'light',
  LOCATION: 'Lodówka',
  CATEGORY: 'other',
  EXPIRY_WARNING_DAYS: 3,
  ITEMS_PER_PAGE: 20,
  MAX_RECENT_SEARCHES: 10,
  IMAGE_QUALITY: 0.8,
  SYNC_INTERVAL_MINUTES: 5,
  SESSION_TIMEOUT_MINUTES: 30,
  NOTIFICATION_HOUR: 9,
  WEEK_START_DAY: 1 // Poniedziałek
} as const;

// ============== FEATURE FLAGS ==============
export const FEATURES = {
  BARCODE_SCANNING: true,
  RECEIPT_SCANNING: true,
  AI_RECIPES: true,
  MEAL_PLANNING: true,
  FAMILY_SHARING: true,
  OFFLINE_MODE: true,
  PUSH_NOTIFICATIONS: true,
  VOICE_INPUT: false,
  SMART_SUGGESTIONS: true,
  WASTE_TRACKING: true,
  NUTRITION_INFO: true,
  PRICE_TRACKING: false,
  RECIPE_SHARING: false,
  SOCIAL_FEATURES: false,
  DARK_MODE: true
} as const;

// Export wszystkich stałych jako jeden obiekt
export const CONSTANTS = {
  APP_VERSION,
  APP_BUILD,
  MIN_SUPPORTED_VERSION,
  APP_NAME,
  APP_NAME_SHORT,
  APP_BUNDLE_ID,
  APP_SCHEME,
  LIMITS,
  DEFAULT_LOCATIONS,
  PRODUCT_CATEGORIES,
  MEASUREMENT_UNITS,
  DIET_TYPES,
  RECIPE_DIFFICULTIES,
  MEAL_TYPES,
  COLORS,
  TIMINGS,
  SIZES,
  MESSAGES,
  PATTERNS,
  STORAGE_KEYS,
  ROUTES,
  API_ENDPOINTS,
  ENVIRONMENTS,
  PLATFORMS,
  LANGUAGES,
  CURRENCIES,
  DEFAULTS,
  FEATURES
} as const;

export default CONSTANTS;
