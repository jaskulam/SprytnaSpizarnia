export interface User {
  id: string;
  email: string | null;
  displayName: string;
  isAnonymous: boolean;
  isPro: boolean;
  familyId?: string;
  createdAt: Date;
  provider?: 'google' | 'apple' | 'email';
}

export interface Product {
  id: string;
  name: string;
  quantity: number;
  unit: ProductUnit;
  category: ProductCategory;
  expiryDate?: Date;
  estimatedFreshnessDays?: number;
  location: string;
  barcode?: string;
  ownerId: string;
  familyId?: string;
  addedBy: string;
  createdAt: Date;
  updatedAt: Date;
  openedAt?: Date;
  notes?: string;
  imageUrl?: string;
}

export interface ShoppingList {
  id: string;
  name: string;
  items: ShoppingListItem[];
  ownerId: string;
  familyId?: string;
  sharedWith: string[];
  createdAt: Date;
  updatedAt: Date;
  isDefault: boolean;
}

export interface ShoppingListItem {
  id: string;
  productName: string;
  quantity?: number;
  unit?: ProductUnit;
  category: ProductCategory;
  checked: boolean;
  addedBy: string;
  addedAt: Date;
  notes?: string;
  linkedProductId?: string;
}

export interface Recipe {
  id: string;
  name: string;
  ingredients: RecipeIngredient[];
  instructions: string[];
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  cuisine?: string;
  diet?: DietType[];
  allergens?: string[];
  imageUrl?: string;
  source: 'ai' | 'user' | 'community' | 'quick';
  ownerId?: string;
  rating?: number;
  ratingCount?: number;
  tags?: string[];
}

export interface RecipeIngredient {
  productId?: string;
  name: string;
  quantity: number;
  unit: ProductUnit;
  optional?: boolean;
}

export interface MealPlan {
  id: string;
  date: Date;
  meals: {
    breakfast?: Recipe;
    lunch?: Recipe;
    dinner?: Recipe;
    snack?: Recipe;
  };
  familyId: string;
  createdBy: string;
  notes?: string;
}

export interface Family {
  id: string;
  name: string;
  ownerId: string;
  members: FamilyMember[];
  inviteCodes: InviteCode[];
  createdAt: Date;
  settings: FamilySettings;
}

export interface FamilyMember {
  userId: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: Date;
  displayName: string;
  email: string;
}

export interface InviteCode {
  code: string;
  createdBy: string;
  createdAt: Date;
  expiresAt: Date;
  maxUses: number;
  currentUses: number;
  isActive: boolean;
}

export interface FamilySettings {
  allowGuestAccess: boolean;
  requireApproval: boolean;
  shareShoppingLists: boolean;
  shareMealPlans: boolean;
}

export type ProductCategory = 
  | 'dairy' 
  | 'meat' 
  | 'vegetables' 
  | 'fruits' 
  | 'bakery' 
  | 'pantry' 
  | 'beverages' 
  | 'frozen'
  | 'condiments' 
  | 'snacks' 
  | 'household'
  | 'other';

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

export type DietType = 
  | 'vegan' 
  | 'vegetarian' 
  | 'gluten-free' 
  | 'keto' 
  | 'paleo' 
  | 'dairy-free'
  | 'low-carb'
  | 'low-fat';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'waste' | 'recipes' | 'social' | 'eco';
  requirement: AchievementRequirement;
  reward?: string;
  unlockedAt?: Date;
  progress: number;
}

export interface AchievementRequirement {
  type: 'count' | 'streak' | 'percentage';
  target: number;
  metric: string;
}

export interface EcoStats {
  userId: string;
  moneySaved: number;
  co2Reduced: number;
  waterSaved: number;
  wasteReduced: number;
  mealsPlanned: number;
  productsNotWasted: number;
  lastUpdated: Date;
  monthlyStats: MonthlyEcoStats[];
}

export interface MonthlyEcoStats {
  month: string;
  year: number;
  moneySaved: number;
  wasteReduced: number;
  mostWastedCategory: ProductCategory;
  improvementTips: string[];
}

export interface Notification {
  id: string;
  userId: string;
  type: 'expiry' | 'family' | 'achievement' | 'tip' | 'update';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
}

export interface UserPreferences {
  userId: string;
  notifications: {
    expiryReminders: boolean;
    expiryDaysBefore: number;
    familyUpdates: boolean;
    weeklyReport: boolean;
    recipeSuggestions: boolean;
    achievementAlerts: boolean;
  };
  display: {
    defaultView: 'grid' | 'list';
    sortBy: 'expiry' | 'name' | 'category';
    showEstimatedDates: boolean;
    compactMode: boolean;
  };
  privacy: {
    shareStatsWithFamily: boolean;
    allowCommunityRecipes: boolean;
    anonymousAnalytics: boolean;
  };
}

export interface QuickAction {
  id: string;
  name: string;
  icon: string;
  action: string;
  params?: any;
  isPro: boolean;
}

export interface SyncStatus {
  lastSyncTime: Date;
  pendingUploads: number;
  pendingDownloads: number;
  isSyncing: boolean;
  errors: SyncError[];
}

export interface SyncError {
  id: string;
  type: 'upload' | 'download' | 'conflict';
  entityType: string;
  entityId: string;
  error: string;
  timestamp: Date;
  resolved: boolean;
}