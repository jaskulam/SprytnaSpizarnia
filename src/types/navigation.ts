// Navigation Type definitions for Sprytna Spiżarnia React Native app

import { NavigatorScreenParams } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp, RouteProp } from '@react-navigation/native';

// Main Stack Navigator
export type RootStackParamList = {
  // Auth Stack
  AuthStack: NavigatorScreenParams<AuthStackParamList>;
  
  // Main App Stack  
  MainStack: NavigatorScreenParams<MainStackParamList>;
  
  // Modal Screens
  ProductModal: {
    productId?: string;
    mode: 'create' | 'edit' | 'view';
    initialData?: Partial<ProductModalData>;
  };
  
  RecipeModal: {
    recipeId?: string;
    mode: 'create' | 'edit' | 'view';
    initialData?: Partial<RecipeModalData>;
  };
  
  CameraModal: {
    mode: 'barcode' | 'photo';
    returnScreen: keyof RootStackParamList;
    returnParams?: any;
  };
  
  ShoppingListModal: {
    listId?: string;
    mode: 'create' | 'edit';
    initialData?: Partial<ShoppingListModalData>;
  };
  
  FamilyInviteModal: {
    inviteCode?: string;
    familyName?: string;
  };
  
  SettingsModal: {
    section?: 'general' | 'notifications' | 'privacy' | 'family' | 'about';
  };
  
  ImageViewer: {
    images: string[];
    initialIndex?: number;
    title?: string;
  };
  
  WebView: {
    url: string;
    title?: string;
  };
};

// Auth Stack Navigator
export type AuthStackParamList = {
  Welcome: undefined;
  Login: {
    email?: string;
  };
  Register: {
    email?: string;
  };
  ForgotPassword: {
    email?: string;
  };
  VerifyEmail: {
    email: string;
  };
  BiometricSetup: undefined;
  TermsAndConditions: undefined;
  PrivacyPolicy: undefined;
};

// Main App Stack Navigator
export type MainStackParamList = {
  TabNavigator: NavigatorScreenParams<TabParamList>;
  
  // Product Screens
  ProductDetails: {
    productId: string;
    fromScreen?: string;
  };
  
  ProductEdit: {
    productId: string;
  };
  
  ProductHistory: {
    productId: string;
  };
  
  BarcodeScanner: {
    returnScreen: keyof MainStackParamList;
    returnParams?: any;
  };
  
  // Recipe Screens
  RecipeDetails: {
    recipeId: string;
    fromScreen?: string;
  };
  
  RecipeEdit: {
    recipeId: string;
  };
  
  CookingMode: {
    recipeId: string;
    servings?: number;
  };
  
  RecipeSearch: {
    initialQuery?: string;
    filters?: RecipeSearchFilters;
  };
  
  // Shopping Screens
  ShoppingListDetails: {
    listId: string;
    mode?: 'view' | 'shop';
  };
  
  ShoppingOptimizer: {
    listId: string;
    storeId?: string;
  };
  
  ShoppingSummary: {
    listId: string;
  };
  
  // Family Screens
  FamilyDetails: {
    familyId: string;
  };
  
  FamilyMember: {
    memberId: string;
  };
  
  FamilySettings: {
    familyId: string;
  };
  
  FamilyInvite: {
    familyId: string;
  };
  
  // Statistics Screens
  Statistics: {
    period?: 'week' | 'month' | 'year';
  };
  
  StatisticsDetails: {
    type: 'waste' | 'savings' | 'eco' | 'usage';
    period: string;
  };
  
  // Meal Planning
  MealPlanner: {
    date?: string; // ISO date string
  };
  
  MealPlanDetails: {
    planId: string;
  };
  
  // Settings
  Settings: undefined;
  Profile: undefined;
  Notifications: undefined;
  Privacy: undefined;
  About: undefined;
  Support: undefined;
  
  // Onboarding
  OnboardingTour: {
    step?: number;
  };
};

// Bottom Tab Navigator
export type TabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>;
  ProductsTab: NavigatorScreenParams<ProductsStackParamList>;
  RecipesTab: NavigatorScreenParams<RecipesStackParamList>;
  ShoppingTab: NavigatorScreenParams<ShoppingStackParamList>;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
};

// Tab Stack Navigators
export type HomeStackParamList = {
  Home: undefined;
  QuickAdd: undefined;
  Notifications: undefined;
  Search: {
    type?: 'products' | 'recipes' | 'all';
    initialQuery?: string;
  };
};

export type ProductsStackParamList = {
  ProductsList: {
    filter?: ProductsFilter;
    sortBy?: ProductsSortBy;
  };
  ProductDetails: {
    productId: string;
  };
  ProductAdd: {
    barcode?: string;
    scannedData?: any;
  };
  CategoryView: {
    category: string;
    location?: string;
  };
  LocationView: {
    location: string;
  };
  ExpiringProducts: undefined;
};

export type RecipesStackParamList = {
  RecipesList: {
    filter?: RecipesFilter;
    sortBy?: RecipesSortBy;
  };
  RecipeDetails: {
    recipeId: string;
  };
  RecipeAdd: undefined;
  RecipeGenerate: {
    availableIngredients?: string[];
  };
  Favorites: undefined;
  Collections: undefined;
};

export type ShoppingStackParamList = {
  ShoppingLists: undefined;
  ShoppingListDetails: {
    listId: string;
  };
  ShoppingAdd: undefined;
  ShoppingSuggestions: undefined;
  Stores: undefined;
};

export type ProfileStackParamList = {
  Profile: undefined;
  Statistics: undefined;
  Family: undefined;
  Settings: undefined;
  Achievements: undefined;
};

// Navigation Props Types
export type RootStackNavigationProp = StackNavigationProp<RootStackParamList>;
export type AuthStackNavigationProp = StackNavigationProp<AuthStackParamList>;
export type MainStackNavigationProp = StackNavigationProp<MainStackParamList>;
export type TabNavigationProp = BottomTabNavigationProp<TabParamList>;

// Screen-specific Navigation Props
export type HomeScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'HomeTab'>,
  StackNavigationProp<RootStackParamList>
>;

export type ProductsScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'ProductsTab'>,
  StackNavigationProp<RootStackParamList>
>;

export type RecipesScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'RecipesTab'>,
  StackNavigationProp<RootStackParamList>
>;

export type ShoppingScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'ShoppingTab'>,
  StackNavigationProp<RootStackParamList>
>;

export type ProfileScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'ProfileTab'>,
  StackNavigationProp<RootStackParamList>
>;

// Route Props Types
export type RootStackRouteProp<T extends keyof RootStackParamList> = RouteProp<RootStackParamList, T>;
export type AuthStackRouteProp<T extends keyof AuthStackParamList> = RouteProp<AuthStackParamList, T>;
export type MainStackRouteProp<T extends keyof MainStackParamList> = RouteProp<MainStackParamList, T>;
export type TabRouteProp<T extends keyof TabParamList> = RouteProp<TabParamList, T>;

// Screen Props Combinations
export type AuthScreenProps<T extends keyof AuthStackParamList> = {
  navigation: StackNavigationProp<AuthStackParamList, T>;
  route: RouteProp<AuthStackParamList, T>;
};

export type MainScreenProps<T extends keyof MainStackParamList> = {
  navigation: StackNavigationProp<MainStackParamList, T>;
  route: RouteProp<MainStackParamList, T>;
};

export type TabScreenProps<T extends keyof TabParamList> = {
  navigation: BottomTabNavigationProp<TabParamList, T>;
  route: RouteProp<TabParamList, T>;
};

// Filter and Sort Types
export interface ProductsFilter {
  location?: string;
  category?: string;
  expiring?: boolean;
  expired?: boolean;
  consumed?: boolean;
  searchQuery?: string;
}

export type ProductsSortBy = 
  | 'name_asc' 
  | 'name_desc' 
  | 'expiry_asc' 
  | 'expiry_desc' 
  | 'created_asc' 
  | 'created_desc'
  | 'category_asc'
  | 'location_asc';

export interface RecipesFilter {
  cuisine?: string;
  mealType?: string;
  difficulty?: string;
  dietary?: string[];
  maxPrepTime?: number;
  maxCookTime?: number;
  availableIngredients?: boolean;
  favorites?: boolean;
  searchQuery?: string;
}

export type RecipesSortBy = 
  | 'name_asc' 
  | 'name_desc' 
  | 'rating_desc' 
  | 'prep_time_asc' 
  | 'cook_time_asc'
  | 'total_time_asc'
  | 'created_desc'
  | 'difficulty_asc';

export interface RecipeSearchFilters {
  cuisine?: string[];
  mealType?: string[];
  difficulty?: string[];
  dietary?: string[];
  maxPrepTime?: number;
  maxCookTime?: number;
  ingredients?: string[];
}

// Modal Data Types
export interface ProductModalData {
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

export interface RecipeModalData {
  name: string;
  description?: string;
  ingredients: RecipeIngredientModalData[];
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

export interface RecipeIngredientModalData {
  name: string;
  quantity: number;
  unit: string;
  optional?: boolean;
  notes?: string;
}

export interface ShoppingListModalData {
  name: string;
  items?: ShoppingItemModalData[];
  sharedWith?: string[];
  store?: string;
  estimatedBudget?: number;
  color?: string;
  icon?: string;
}

export interface ShoppingItemModalData {
  name: string;
  quantity?: string;
  category?: string;
  notes?: string;
  estimatedPrice?: number;
  urgent?: boolean;
  unit?: string;
}

// Deep Linking Types
export interface DeepLinkParams {
  screen?: string;
  params?: any;
  initial?: boolean;
}

export type DeepLinkRoute = 
  | 'product'
  | 'recipe' 
  | 'shopping-list'
  | 'family-invite'
  | 'notification'
  | 'barcode-scan'
  | 'meal-plan';

// Navigation State Types
export interface NavigationState {
  routes: NavigationRoute[];
  index: number;
  routeNames: string[];
  history?: NavigationRoute[];
  type: string;
  key: string;
}

export interface NavigationRoute {
  key: string;
  name: string;
  params?: any;
  path?: string;
}

// Navigation Options
export interface ScreenOptions {
  title?: string;
  headerShown?: boolean;
  headerTitle?: string;
  headerBackTitle?: string;
  headerRight?: React.ComponentType<any>;
  headerLeft?: React.ComponentType<any>;
  gestureEnabled?: boolean;
  cardStyleInterpolator?: any;
  transitionSpec?: {
    open: any;
    close: any;
  };
}

// Tab Bar Options
export interface TabBarOptions {
  activeTintColor?: string;
  inactiveTintColor?: string;
  activeBackgroundColor?: string;
  inactiveBackgroundColor?: string;
  showLabel?: boolean;
  showIcon?: boolean;
  labelStyle?: any;
  iconStyle?: any;
  tabStyle?: any;
  style?: any;
}

// Navigation Events
export type NavigationEvent = 
  | 'focus'
  | 'blur'
  | 'state'
  | 'beforeRemove'
  | 'gestureStart'
  | 'gestureEnd'
  | 'gestureCancel';

export interface NavigationEventData {
  data?: any;
  target?: string;
  canPreventDefault: boolean;
  preventDefault(): void;
}

// Navigation Actions
export type NavigationAction = 
  | 'navigate'
  | 'reset'
  | 'goBack'
  | 'push'
  | 'pop'
  | 'popToTop'
  | 'replace'
  | 'setParams';

export interface NavigationActionPayload {
  name?: string;
  key?: string;
  params?: any;
  merge?: boolean;
}

// Screen Layout
export interface ScreenLayout {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SafeAreaInsets {
  top: number;
  bottom: number;
  left: number;
  right: number;
}
