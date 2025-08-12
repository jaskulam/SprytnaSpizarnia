// Assets configuration for Sprytna Spiżarnia React Native app
// This file centralizes all asset imports for easier management

// App Branding
export const Branding = {
  AppIcon: require('./images/branding/app-icon.svg'),
  LogoFull: require('./images/branding/logo-full.svg'),
  LogoWhite: require('./images/branding/logo-white.svg'),
};

// Navigation Icons
export const NavigationIcons = {
  Home: require('./images/icons/home-icon.svg'),
  Pantry: require('./images/icons/pantry-icon.svg'),
  Shopping: require('./images/icons/shopping-icon.svg'),
  Recipes: require('./images/icons/recipes-icon.svg'),
  Profile: require('./images/icons/profile-icon.svg'),
};

// Action Icons
export const ActionIcons = {
  Add: require('./images/icons/add-icon.svg'),
  Scan: require('./images/icons/scan-icon.svg'),
  Edit: require('./images/icons/edit-icon.svg'),
  Delete: require('./images/icons/delete-icon.svg'),
  Share: require('./images/icons/share-icon.svg'),
  Favorite: require('./images/icons/favorite-icon.svg'),
  Settings: require('./images/icons/settings-icon.svg'),
  Notification: require('./images/icons/notification-icon.svg'),
};

// Status Icons
export const StatusIcons = {
  Fresh: require('./images/icons/fresh-icon.svg'),
  ExpiringSoon: require('./images/icons/expiring-soon-icon.svg'),
  Expired: require('./images/icons/expired-icon.svg'),
  Checkmark: require('./images/icons/checkmark-icon.svg'),
  Warning: require('./images/icons/warning-icon.svg'),
  Info: require('./images/icons/info-icon.svg'),
};

// Category Icons
export const CategoryIcons = {
  Fruits: require('./images/categories/category-fruits.svg'),
  Dairy: require('./images/categories/category-dairy.svg'),
  Meat: require('./images/categories/category-meat.svg'),
  Grains: require('./images/categories/category-grains.svg'),
  Beverages: require('./images/categories/category-beverages.svg'),
  Snacks: require('./images/categories/category-snacks.svg'),
  Frozen: require('./images/categories/category-frozen.svg'),
  Canned: require('./images/categories/category-canned.svg'),
  Spices: require('./images/categories/category-spices.svg'),
  Cleaning: require('./images/categories/category-cleaning.svg'),
};

// Illustrations
export const Illustrations = {
  EmptyPantry: require('./images/illustrations/empty-pantry.svg'),
  EmptyShoppingList: require('./images/illustrations/empty-shopping-list.svg'),
  EmptyRecipes: require('./images/illustrations/empty-recipes.svg'),
  Success: require('./images/illustrations/success-illustration.svg'),
  Error: require('./images/illustrations/error-illustration.svg'),
};

// Placeholders
export const Placeholders = {
  Product: require('./images/placeholders/product-placeholder.svg'),
  Avatar: require('./images/placeholders/avatar-placeholder.svg'),
  Family: require('./images/placeholders/family-placeholder.svg'),
  NoImage: require('./images/placeholders/product-no-image.svg'),
};

// Onboarding Images
export const Onboarding = {
  Step1: require('./images/onboarding/onboarding-1.svg'),
  Step2: require('./images/onboarding/onboarding-2.svg'),
  Step3: require('./images/onboarding/onboarding-3.svg'),
  Step4: require('./images/onboarding/onboarding-4.svg'),
};

// Example usage in components:
/*
import { NavigationIcons, StatusIcons, CategoryIcons } from '../assets';

// In your component
<Image source={NavigationIcons.Home} style={styles.icon} />
<Image source={StatusIcons.Fresh} style={styles.statusIcon} />
<Image source={CategoryIcons.Fruits} style={styles.categoryIcon} />
*/

export default {
  Branding,
  NavigationIcons,
  ActionIcons,
  StatusIcons,
  CategoryIcons,
  Illustrations,
  Placeholders,
  Onboarding,
};
