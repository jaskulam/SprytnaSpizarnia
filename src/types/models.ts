// types/models.ts - Definicje typów dla aplikacji mobilnej Sprytna Spiżarnia

// Podstawowe typy dla produktów
export interface Product {
  id: string;
  name: string;
  quantity: string;
  unit?: ProductUnit;
  expiryDate: Date;
  location: StorageLocation;
  ownerId: string;
  createdAt: Date;
  updatedAt?: Date;
  barcode?: string;
  category?: ProductCategory;
  photo?: string; // lokalna ścieżka dla mobilnej
  imageUrl?: string; // zdalny URL, używany w UI
  notes?: string;
  sharedWith?: string[];
  tags?: string[];
  nutritionalInfo?: NutritionalInfo;
  isConsumed?: boolean;
  consumedAt?: Date;
  price?: number;
  store?: string;
}

export type StorageLocation = 
  | 'Lodówka' 
  | 'Spiżarnia' 
  | 'Kuchnia' 
  | 'Piwnica' 
  | 'Szafka z przyprawami'
  | 'Zamrażarka'
  | 'Garaż'
  | 'Balkon'
  | 'Inne';

export type ProductCategory = 
  | 'Nabiał'
  | 'Mięso i ryby'
  | 'Warzywa i owoce'
  | 'Pieczywo'
  | 'Przyprawy'
  | 'Napoje'
  | 'Słodycze'
  | 'Konserwy'
  | 'Mrożonki'
  | 'Kosmetyki'
  | 'Środki czystości'
  | 'Leki'
  | 'Inne';

export type ProductUnit = 
  | 'pcs'
  | 'kg'
  | 'g'
  | 'l'
  | 'ml'
  | 'pack'
  | 'bottle'
  | 'can'
  | 'jar'
  | 'box'
  | 'bag';

export interface NutritionalInfo {
  calories?: number;
  protein?: number;
  carbohydrates?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  salt?: number;
  saturatedFat?: number;
  servingSize?: string;
}

// Typy dla użytkowników - zoptymalizowane pod mobilne
export interface User {
  id: string;
  email: string | null;
  displayName: string;
  photoURL?: string;
  isAnonymous: boolean;
  provider?: AuthProvider;
  createdAt: Date;
  lastLoginAt: Date;
  isPro: boolean;
  subscription?: Subscription;
  preferences?: UserPreferences;
  familyId?: string;
  deviceToken?: string; // FCM token dla push notifications
  language?: string;
  timezone?: string;
}

export type AuthProvider = 'email' | 'google' | 'apple' | 'anonymous';

// Additional types for Redux slices
export type ThemeMode = 'light' | 'dark' | 'auto';
export type Language = 'pl' | 'en';
export type Units = 'metric' | 'imperial';
export type NotificationChannel = 'push' | 'email' | 'sms' | 'both';
export type NotificationCategory = 'system' | 'family' | 'products' | 'recipes' | 'shopping';
export type FamilyRole = 'owner' | 'admin' | 'member';

export interface FamilyInvite {
  id: string;
  familyId: string;
  email: string;
  role: FamilyRole;
  invitedBy: string;
  inviteCode: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  expiresAt: Date;
  createdAt: Date;
  acceptedAt?: Date;
  message?: string;
}

export interface NotificationPreferences {
  push: boolean;
  email: boolean;
  expiration: boolean;
  shopping: boolean;
  recipes: boolean;
  family: boolean;
  frequency: 'instant' | 'hourly' | 'daily' | 'weekly';
  quietHours: {
    enabled: boolean;
    start: string; // "HH:MM"
    end: string; // "HH:MM"
  };
  categories: {
    [key in NotificationCategory]: boolean;
  };
}

export interface Subscription {
  id: string;
  type: 'monthly' | 'yearly' | 'lifetime';
  status: 'active' | 'cancelled' | 'expired' | 'trial';
  startDate: Date;
  endDate?: Date;
  autoRenew: boolean;
  platform: 'ios' | 'android' | 'web';
  productId: string; // Store product ID
  originalTransactionId?: string;
  receiptData?: string; // dla walidacji
}

export interface UserPreferences {
  userId: string;
  theme: ThemeMode;
  language: Language;
  units: Units;
  currency: 'PLN' | 'EUR' | 'USD';
  notifications: NotificationPreferences;
  privacy: PrivacySettings;
  features: {
    offlineSync: boolean;
    autoBackup: boolean;
    smartSuggestions: boolean;
    voiceCommands: boolean;
    experimentalFeatures: boolean;
  };
  ui: {
    compactView: boolean;
    showTutorials: boolean;
    animationsEnabled: boolean;
    hapticFeedback: boolean;
  };
  shopping: {
    autoSort: boolean;
    groupByCategory: boolean;
    showPrices: boolean;
    defaultStore: string;
  };
  recipes: {
    defaultServings: number;
    showNutrition: boolean;
    autoScale: boolean;
    favoriteFirst: boolean;
  };
  defaultLocation: StorageLocation;
  expiryWarningDays: number;
  updatedAt: Date;
  createdAt: Date;
}

export interface NotificationSettings {
  expiryReminders: boolean;
  familyUpdates: boolean;
  weeklyReport: boolean;
  recipeSuggestions: boolean;
  lowStock: boolean;
  reminderTime: string; // "HH:MM"
  reminderDaysBefore: number;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

export interface DisplaySettings {
  defaultView: 'grid' | 'list';
  showEstimatedDates: boolean;
  showNutritionalInfo: boolean;
  showPrices: boolean;
  fontSize: 'small' | 'medium' | 'large';
  highContrast: boolean;
  compactMode: boolean;
}

export interface PrivacySettings {
  shareStatsWithFamily: boolean;
  allowCommunityRecipes: boolean;
  allowAnalytics: boolean;
  allowCrashReports: boolean;
  shareUsageData: boolean;
}

// Typy dla list zakupów
export interface ShoppingList {
  id: string;
  name: string;
  ownerId: string;
  items: ShoppingListItem[];
  sharedWith: string[];
  createdAt: Date;
  updatedAt: Date;
  isCompleted: boolean;
  completedAt?: Date;
  tags?: string[];
  store?: string;
  estimatedBudget?: number;
  actualTotal?: number;
  color?: string;
  icon?: string;
}

export interface ShoppingListItem {
  id: string;
  name: string;
  quantity?: string;
  checked: boolean;
  addedBy: string;
  addedAt: Date;
  checkedBy?: string;
  checkedAt?: Date;
  category?: ProductCategory;
  notes?: string;
  estimatedPrice?: number;
  actualPrice?: number;
  productId?: string;
  urgent?: boolean;
  unit?: string;
}

// Typy dla przepisów - rozszerzone
export interface Recipe {
  id: string;
  name: string;
  description?: string;
  ingredients: RecipeIngredient[];
  instructions: string[];
  preparationTime: number; // w minutach
  cookingTime: number;
  totalTime: number;
  servings: number;
  difficulty: DifficultyLevel;
  cuisine: CuisineType;
  mealType: MealType;
  dietary?: DietaryRestriction[];
  tags?: string[];
  imageUrl?: string;
  images?: string[]; // dodatkowe zdjęcia
  source: RecipeSource;
  createdBy?: string;
  createdAt: Date;
  updatedAt?: Date;
  rating?: number;
  ratingCount?: number;
  reviews?: Review[];
  nutritionalInfo?: NutritionalInfo;
  tips?: string[];
  variations?: string[];
  cost?: 'low' | 'medium' | 'high';
  equipment?: string[];
  isFavorite?: boolean;
  cookCount?: number;
  lastCooked?: Date;
}

export interface RecipeIngredient {
  name: string;
  quantity: number;
  unit: string;
  optional?: boolean;
  productId?: string;
  available?: boolean;
  notes?: string;
  category?: ProductCategory;
}

export type DifficultyLevel = 'easy' | 'medium' | 'hard';
export type CuisineType = 'polish' | 'italian' | 'asian' | 'mexican' | 'mediterranean' | 'indian' | 'american' | 'french' | 'other';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert' | 'drink';
export type RecipeSource = 'ai' | 'user' | 'community' | 'imported';

export type DietaryRestriction = 
  | 'vegan'
  | 'vegetarian'
  | 'gluten-free'
  | 'dairy-free'
  | 'keto'
  | 'paleo'
  | 'low-carb'
  | 'low-fat'
  | 'halal'
  | 'kosher'
  | 'nut-free'
  | 'egg-free';

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment?: string;
  photos?: string[];
  createdAt: Date;
  helpful: number;
  verified?: boolean;
}

// Typy dla planera posiłków
export interface MealPlan {
  id: string;
  userId: string;
  familyId?: string;
  date: Date;
  meals: { [key in MealType]?: Recipe };
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  shoppingListGenerated?: boolean;
  totalCalories?: number;
  totalCost?: number;
}

// Typy dla rodziny - rozszerzone
export interface Family {
  id: string;
  name: string;
  ownerId: string;
  members: FamilyMember[];
  invitations: FamilyInvitation[];
  createdAt: Date;
  settings: FamilySettings;
  avatar?: string;
  description?: string;
}

export interface FamilyMember {
  userId: string;
  email: string;
  displayName: string;
  role: FamilyRole;
  joinedAt: Date;
  permissions: FamilyPermissions;
  avatar?: string;
  isActive: boolean;
  status: 'active' | 'inactive' | 'pending';
  lastSeen?: Date;
}

export interface FamilyInvitation {
  id: string;
  email: string;
  invitedBy: string;
  invitedAt: Date;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  acceptedAt?: Date;
  code: string; // 6-cyfrowy kod
  expiresAt: Date;
  message?: string;
}

export interface FamilyPermissions {
  canAddProducts: boolean;
  canDeleteProducts: boolean;
  canEditProducts: boolean;
  canManageShoppingLists: boolean;
  canInviteMembers: boolean;
  canRemoveMembers: boolean;
  canViewStats: boolean;
  canManageMealPlans: boolean;
}

export interface FamilySettings {
  shareProducts: boolean;
  shareShoppingLists: boolean;
  shareMealPlans: boolean;
  shareRecipes: boolean;
  notifyOnChanges: boolean;
  autoSyncProducts: boolean;
  allowGuestAccess: boolean;
}

// Typy dla powiadomień mobilnych
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: Date;
  readAt?: Date;
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: NotificationCategory;
  expiresAt?: Date;
  imageUrl?: string;
  scheduledFor?: Date; // dla zaplanowanych notyfikacji
  repeat?: 'daily' | 'weekly' | 'monthly';
}

export type NotificationType = 
  | 'expiry_warning'
  | 'expired_product'
  | 'family_invite'
  | 'family_update'
  | 'shopping_reminder'
  | 'low_stock'
  | 'recipe_suggestion'
  | 'meal_reminder'
  | 'waste_alert'
  | 'achievement_unlocked'
  | 'system_update'
  | 'backup_reminder';

// Typy dla statystyk ekologicznych
export interface EcoStats {
  moneySaved: number;
  co2Reduced: number;
  waterSaved: number;
  wasteReduced: number;
  period: StatsPeriod;
}

export interface Statistics {
  userId: string;
  period: StatsPeriod;
  productsAdded: number;
  productsUsed: number;
  productsExpired: number;
  productsWasted: number;
  wasteValue: number;
  savedValue: number;
  recipesCooked: number;
  shoppingTrips: number;
  averageShoppingValue: number;
  mostUsedProducts: ProductUsage[];
  mostWastedCategories: CategoryWaste[];
  ecoStats: EcoStats;
  streaks: UserStreaks;
}

export interface UserStreaks {
  currentZeroWasteStreak: number;
  longestZeroWasteStreak: number;
  currentCookingStreak: number;
  longestCookingStreak: number;
  currentScanningStreak: number;
}

export type StatsPeriod = 'week' | 'month' | 'quarter' | 'year' | 'all-time';

export interface ProductUsage {
  productName: string;
  count: number;
  category: ProductCategory;
  trend: 'up' | 'down' | 'stable';
}

export interface CategoryWaste {
  category: ProductCategory;
  count: number;
  value: number;
  percentage: number;
  trend: 'improving' | 'worsening' | 'stable';
}

// Typy dla skanowania - mobilne
export interface BarcodeScanResult {
  barcode: string;
  format: BarcodeFormat;
  product?: ScannedProduct;
  source: 'openFoodFacts' | 'manual' | 'database' | 'cache';
  confidence: number;
  timestamp: Date;
}

export type BarcodeFormat = 'EAN_13' | 'EAN_8' | 'UPC_A' | 'UPC_E' | 'CODE_128' | 'CODE_39' | 'QR_CODE';

export interface ScannedProduct {
  name: string;
  brand?: string;
  quantity?: string;
  category?: ProductCategory;
  imageUrl?: string;
  ingredients?: string[];
  nutritionalInfo?: NutritionalInfo;
  allergens?: string[];
  countryOfOrigin?: string;
  languages?: string[];
  verified: boolean;
}

export interface CameraScanSettings {
  flashEnabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  autoFocus: boolean;
  scanArea: 'full' | 'center' | 'top' | 'bottom';
  orientation: 'portrait' | 'landscape' | 'auto';
}

// Typy dla urządzenia mobilnego
export interface DeviceInfo {
  platform: 'ios' | 'android';
  deviceModel: string;
  osVersion: string;
  appVersion: string;
  deviceId: string;
  screenSize: string;
  language: string;
  timezone: string;
  hasNotch?: boolean;
  safeAreaInsets?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

// Typy dla synchronizacji offline
export interface SyncState {
  lastSyncAt: Date | null;
  pendingChanges: PendingChange[];
  isSyncing: boolean;
  syncError: string | null;
  conflictResolution: 'local' | 'remote' | 'manual';
  autoSync: boolean;
  syncOnWifiOnly: boolean;
}

export interface PendingChange {
  id: string;
  type: ChangeType;
  entity: EntityType;
  entityId: string;
  data: any;
  timestamp: Date;
  deviceId: string;
  userId: string;
  retryCount: number;
  priority: 'low' | 'normal' | 'high';
}

export type ChangeType = 'create' | 'update' | 'delete' | 'restore';
export type EntityType = 'product' | 'shoppingList' | 'recipe' | 'mealPlan' | 'family' | 'notification';

// Type guards dla bezpieczeństwa typów
export const isProduct = (item: any): item is Product => {
  return item && 
    typeof item.id === 'string' && 
    typeof item.name === 'string' &&
    item.expiryDate instanceof Date &&
    typeof item.location === 'string';
};

export const isShoppingList = (item: any): item is ShoppingList => {
  return item && 
    typeof item.id === 'string' && 
    typeof item.name === 'string' &&
    Array.isArray(item.items);
};

export const isRecipe = (item: any): item is Recipe => {
  return item && 
    typeof item.id === 'string' && 
    typeof item.name === 'string' &&
    Array.isArray(item.ingredients) &&
    Array.isArray(item.instructions);
};

export const isFamilyMember = (item: any): item is FamilyMember => {
  return item && 
    typeof item.userId === 'string' &&
    typeof item.email === 'string' &&
    ['owner', 'admin', 'member'].includes(item.role);
};

export const isNotification = (item: any): item is Notification => {
  return item && 
    typeof item.id === 'string' &&
    typeof item.title === 'string' &&
    typeof item.message === 'string';
};

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// API Response types dla mobilnej
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: Date;
  requestId?: string;
  statusCode?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Error types dla aplikacji mobilnej
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
  userId?: string;
  action?: string;
  recoverable: boolean;
  userMessage?: string; // user-friendly message
}

export type ErrorCode = 
  | 'NETWORK_ERROR'
  | 'AUTH_ERROR' 
  | 'VALIDATION_ERROR'
  | 'STORAGE_ERROR'
  | 'CAMERA_ERROR'
  | 'PERMISSION_ERROR'
  | 'SYNC_ERROR'
  | 'BIOMETRIC_ERROR'
  | 'LOCATION_ERROR'
  | 'UNKNOWN_ERROR';

// Achievement system
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  condition: AchievementCondition;
  reward?: AchievementReward;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: Date;
  progress?: number;
  maxProgress?: number;
}

export type AchievementCategory = 'waste_reduction' | 'cooking' | 'scanning' | 'family' | 'eco' | 'streak';

export interface AchievementCondition {
  type: 'count' | 'streak' | 'value' | 'time';
  target: number;
  entity: 'products' | 'recipes' | 'scans' | 'family_members' | 'waste_reduction';
}

export interface AchievementReward {
  type: 'badge' | 'feature' | 'discount';
  value?: string;
}

// Inne typy pomocnicze
export interface GeolocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: Date;
  address?: string;
}