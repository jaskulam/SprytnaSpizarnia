// Custom hooks for business logic
// These hooks provide a clean abstraction layer between React components and Redux store

export { useAuth } from './useAuth';
export type { UseAuthReturn } from './useAuth';

export { useProducts } from './useProducts';
export type { UseProductsReturn } from './useProducts';

export { useRecipes } from './useRecipes';
export type { UseRecipesReturn } from './useRecipes';

export { useFamily } from './useFamily';
export type { UseFamilyReturn } from './useFamily';

export { useNotifications } from './useNotifications';
export type { UseNotificationsReturn } from './useNotifications';

export { useOfflineSync } from './useOfflineSync';
export type { UseOfflineSyncReturn } from './useOfflineSync';

export { useShoppingLists } from './useShoppingLists';
export type { UseShoppingListsReturn } from './useShoppingLists';

export { useUtilities } from './useUtilities';
export type { UseUtilitiesReturn } from './useUtilities';

// Re-export commonly used types for convenience
export type {
  User,
  Product,
  Recipe,
  ShoppingList,
  FamilyMember,
  Notification,
} from '../types/models';
