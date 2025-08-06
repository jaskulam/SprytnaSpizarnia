// API Type definitions for Sprytna Spiżarnia mobile app

import { 
  Product, 
  Recipe, 
  ShoppingList, 
  User, 
  Family, 
  Notification,
  BarcodeScanResult,
  Statistics,
  MealPlan,
  UserPreferences
} from './models';

// Base API Response
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
  timestamp: Date;
  requestId?: string;
  statusCode: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  field?: string;
  timestamp: Date;
}

// Pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
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

// Authentication API
export interface LoginRequest {
  email: string;
  password: string;
  deviceInfo?: DeviceInfo;
  fcmToken?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
  language?: string;
  deviceInfo?: DeviceInfo;
  fcmToken?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface GoogleSignInRequest {
  idToken: string;
  deviceInfo?: DeviceInfo;
  fcmToken?: string;
}

export interface AppleSignInRequest {
  identityToken: string;
  authorizationCode: string;
  deviceInfo?: DeviceInfo;
  fcmToken?: string;
}

// Products API
export interface CreateProductRequest {
  name: string;
  quantity: string;
  expiryDate: Date;
  location: string;
  category?: string;
  barcode?: string;
  photo?: string;
  notes?: string;
  price?: number;
  store?: string;
}

export interface UpdateProductRequest {
  name?: string;
  quantity?: string;
  expiryDate?: Date;
  location?: string;
  category?: string;
  notes?: string;
  price?: number;
  store?: string;
}

export interface GetProductsRequest extends PaginationParams {
  location?: string;
  category?: string;
  expiringSoon?: boolean;
  expired?: boolean;
  consumed?: boolean;
}

export interface BulkUpdateProductsRequest {
  productIds: string[];
  updates: Partial<UpdateProductRequest>;
}

// Recipes API
export interface CreateRecipeRequest {
  name: string;
  description?: string;
  ingredients: RecipeIngredientRequest[];
  instructions: string[];
  preparationTime: number;
  cookingTime: number;
  servings: number;
  difficulty: string;
  cuisine: string;
  mealType: string;
  dietary?: string[];
  tags?: string[];
  imageUrl?: string;
}

export interface RecipeIngredientRequest {
  name: string;
  quantity: number;
  unit: string;
  optional?: boolean;
  notes?: string;
}

export interface UpdateRecipeRequest {
  name?: string;
  description?: string;
  ingredients?: RecipeIngredientRequest[];
  instructions?: string[];
  preparationTime?: number;
  cookingTime?: number;
  servings?: number;
  difficulty?: string;
  cuisine?: string;
  mealType?: string;
  dietary?: string[];
  tags?: string[];
  imageUrl?: string;
}

export interface GetRecipesRequest extends PaginationParams {
  cuisine?: string;
  mealType?: string;
  difficulty?: string;
  dietary?: string[];
  maxPrepTime?: number;
  maxCookTime?: number;
  ingredientIds?: string[];
  favorites?: boolean;
}

export interface GenerateRecipeRequest {
  availableIngredients: string[];
  dietaryRestrictions?: string[];
  mealType?: string;
  cookingTime?: number;
  servings?: number;
  cuisine?: string;
}

export interface RateRecipeRequest {
  rating: number;
  comment?: string;
  photos?: string[];
}

// Shopping Lists API
export interface CreateShoppingListRequest {
  name: string;
  items?: ShoppingListItemRequest[];
  sharedWith?: string[];
  store?: string;
  estimatedBudget?: number;
}

export interface ShoppingListItemRequest {
  name: string;
  quantity?: string;
  category?: string;
  notes?: string;
  estimatedPrice?: number;
  urgent?: boolean;
  unit?: string;
}

export interface UpdateShoppingListRequest {
  name?: string;
  estimatedBudget?: number;
  store?: string;
  color?: string;
  icon?: string;
}

export interface AddItemToListRequest {
  name: string;
  quantity?: string;
  category?: string;
  notes?: string;
  estimatedPrice?: number;
  urgent?: boolean;
  unit?: string;
}

export interface UpdateShoppingItemRequest {
  name?: string;
  quantity?: string;
  category?: string;
  notes?: string;
  estimatedPrice?: number;
  actualPrice?: number;
  urgent?: boolean;
  checked?: boolean;
  unit?: string;
}

export interface OptimizeShoppingRouteRequest {
  listId: string;
  storeLayout?: StoreLayout;
  preferredOrder?: string[];
}

export interface StoreLayout {
  name: string;
  sections: StoreSection[];
}

export interface StoreSection {
  name: string;
  categories: string[];
  order: number;
}

// Family API
export interface CreateFamilyRequest {
  name: string;
  description?: string;
  settings?: FamilySettingsRequest;
}

export interface FamilySettingsRequest {
  shareProducts?: boolean;
  shareShoppingLists?: boolean;
  shareMealPlans?: boolean;
  shareRecipes?: boolean;
  notifyOnChanges?: boolean;
  autoSyncProducts?: boolean;
  allowGuestAccess?: boolean;
}

export interface InviteFamilyMemberRequest {
  email: string;
  role?: string;
  message?: string;
}

export interface UpdateFamilyMemberRequest {
  role?: string;
  permissions?: FamilyPermissionsRequest;
}

export interface FamilyPermissionsRequest {
  canAddProducts?: boolean;
  canDeleteProducts?: boolean;
  canEditProducts?: boolean;
  canManageShoppingLists?: boolean;
  canInviteMembers?: boolean;
  canRemoveMembers?: boolean;
  canViewStats?: boolean;
  canManageMealPlans?: boolean;
}

export interface JoinFamilyRequest {
  inviteCode: string;
}

// Barcode Scanning API
export interface ScanBarcodeRequest {
  barcode: string;
  format?: string;
}

export interface ScanBarcodeResponse {
  product?: ScannedProductResponse;
  suggestions?: ScannedProductResponse[];
  source: string;
  confidence: number;
}

export interface ScannedProductResponse {
  name: string;
  brand?: string;
  quantity?: string;
  category?: string;
  imageUrl?: string;
  ingredients?: string[];
  nutritionalInfo?: NutritionalInfoResponse;
  allergens?: string[];
  verified: boolean;
}

export interface NutritionalInfoResponse {
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

// Notifications API
export interface CreateNotificationRequest {
  title: string;
  message: string;
  type: string;
  category: string;
  priority?: string;
  data?: Record<string, any>;
  scheduledFor?: Date;
  expiresAt?: Date;
}

export interface UpdateNotificationRequest {
  read?: boolean;
}

export interface NotificationPreferencesRequest {
  push?: boolean;
  email?: boolean;
  categories?: Record<string, boolean>;
  quietHours?: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

// Statistics API
export interface GetStatisticsRequest {
  period: 'week' | 'month' | 'quarter' | 'year' | 'all-time';
  includeEcoStats?: boolean;
  includeComparisons?: boolean;
}

export interface StatisticsResponse {
  stats: Statistics;
  comparisons?: StatisticsComparison;
  insights?: StatisticsInsight[];
}

export interface StatisticsComparison {
  previousPeriod: Statistics;
  familyAverage?: Statistics;
  communityAverage?: Statistics;
}

export interface StatisticsInsight {
  type: 'achievement' | 'warning' | 'tip' | 'goal';
  title: string;
  description: string;
  action?: string;
  data?: any;
}

// Meal Planning API
export interface CreateMealPlanRequest {
  date: Date;
  meals: Record<string, string>; // mealType -> recipeId
  notes?: string;
}

export interface UpdateMealPlanRequest {
  meals?: Record<string, string>;
  notes?: string;
}

export interface GetMealPlansRequest {
  startDate?: Date;
  endDate?: Date;
  includeFamily?: boolean;
}

export interface GenerateShoppingListFromMealPlanRequest {
  mealPlanIds: string[];
  excludeAvailableIngredients?: boolean;
}

// User Preferences API
export interface UpdatePreferencesRequest {
  theme?: string;
  language?: string;
  units?: string;
  currency?: string;
  notifications?: NotificationPreferencesRequest;
  privacy?: PrivacySettingsRequest;
  defaultLocation?: string;
  expiryWarningDays?: number;
}

export interface PrivacySettingsRequest {
  shareStatsWithFamily?: boolean;
  allowCommunityRecipes?: boolean;
  allowAnalytics?: boolean;
  allowCrashReports?: boolean;
  shareUsageData?: boolean;
}

// File Upload API
export interface UploadFileRequest {
  file: File | Blob;
  type: 'product_photo' | 'recipe_image' | 'profile_avatar';
  metadata?: Record<string, any>;
}

export interface UploadFileResponse {
  url: string;
  fileName: string;
  size: number;
  mimeType: string;
  uploadedAt: Date;
}

// Device Info
export interface DeviceInfo {
  platform: 'ios' | 'android';
  deviceModel: string;
  osVersion: string;
  appVersion: string;
  deviceId: string;
  screenSize?: string;
  language: string;
  timezone: string;
}

// Cloud Functions API
export interface CloudFunctionRequest<T = any> {
  data: T;
  uid?: string;
  timestamp?: Date;
}

export interface CloudFunctionResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  executionTime?: number;
}

// Export/Import API
export interface ExportDataRequest {
  types: ('products' | 'recipes' | 'shopping_lists' | 'meal_plans' | 'preferences')[];
  format: 'json' | 'csv' | 'pdf';
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface ImportDataRequest {
  file: File | Blob;
  type: 'products' | 'recipes' | 'shopping_lists';
  format: 'json' | 'csv';
  options?: {
    overwrite?: boolean;
    merge?: boolean;
    validateData?: boolean;
  };
}

export interface ImportDataResponse {
  imported: number;
  skipped: number;
  errors: ImportError[];
  warnings: ImportWarning[];
}

export interface ImportError {
  row?: number;
  field?: string;
  message: string;
  data?: any;
}

export interface ImportWarning {
  row?: number;
  field?: string;
  message: string;
  data?: any;
}