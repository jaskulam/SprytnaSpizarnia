import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useMemo, useState } from 'react';
import { RootState, AppDispatch } from '../store/store';
import { 
  createShoppingList,
  updateShoppingList,
  deleteShoppingList,
  addItemToList,
  updateListItem,
  removeItemFromList,
  toggleItemCompleted,
  shareShoppingList,
  unshareShoppingList,
  generateListFromRecipes,
  optimizeShoppingRoute
} from '../store/slices/shoppingSlice';
import { ShoppingList, ShoppingListItem, Product } from '../types/models';

export interface UseShoppingListsReturn {
  // State
  lists: ShoppingList[];
  currentList: ShoppingList | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  createList: (name: string, description?: string) => Promise<string>;
  updateList: (id: string, updates: Partial<ShoppingList>) => Promise<void>;
  deleteList: (id: string) => Promise<void>;
  addItem: (listId: string, productId: string, quantity: number, notes?: string) => Promise<void>;
  updateItem: (listId: string, itemId: string, updates: Partial<ShoppingListItem>) => Promise<void>;
  removeItem: (listId: string, itemId: string) => Promise<void>;
  toggleCompleted: (listId: string, itemId: string) => Promise<void>;
  shareList: (listId: string, userIds: string[]) => Promise<void>;
  unshareList: (listId: string, userId: string) => Promise<void>;
  generateFromRecipes: (recipeIds: string[], servings?: Record<string, number>) => Promise<string>;
  optimizeRoute: (listId: string, storeLayout?: any) => Promise<void>;
  setCurrentList: (listId: string | null) => void;
  
  // Computed values
  totalLists: number;
  activeLists: ShoppingList[];
  completedLists: ShoppingList[];
  sharedLists: ShoppingList[];
  myLists: ShoppingList[];
  listStatistics: {
    totalItems: number;
    completedItems: number;
    completionRate: number;
    estimatedCost: number;
  };
  currentListItems: ShoppingListItem[];
  currentListProgress: {
    total: number;
    completed: number;
    percentage: number;
  };
}

export const useShoppingLists = (currentListId?: string): UseShoppingListsReturn => {
  const dispatch = useDispatch<AppDispatch>();
  const shoppingState = useSelector((state: RootState) => state.shopping);
  const { user } = useSelector((state: RootState) => state.auth);
  const { products } = useSelector((state: RootState) => state.products);
  const [selectedListId, setSelectedListId] = useState<string | null>(currentListId || null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Current list
  const currentList = useMemo(() => {
    const listId = currentListId || selectedListId;
    return listId ? shoppingState.lists.find(list => list.id === listId) || null : null;
  }, [shoppingState.lists, currentListId, selectedListId]);

  // Active lists (not archived/deleted)
  const activeLists = useMemo(() => 
    shoppingState.lists.filter(list => !list.archived && !list.deleted)
  , [shoppingState.lists]);

  // Completed lists
  const completedLists = useMemo(() => 
    activeLists.filter(list => list.status === 'completed')
  , [activeLists]);

  // Shared lists (where user is not owner)
  const sharedLists = useMemo(() => 
    activeLists.filter(list => list.ownerId !== user?.uid && list.sharedWith?.includes(user?.uid || ''))
  , [activeLists, user?.uid]);

  // My lists (where user is owner)
  const myLists = useMemo(() => 
    activeLists.filter(list => list.ownerId === user?.uid)
  , [activeLists, user?.uid]);

  // List statistics
  const listStatistics = useMemo(() => {
    const allItems = activeLists.flatMap(list => list.items || []);
    const completedItems = allItems.filter(item => item.completed);
    
    const estimatedCost = allItems.reduce((total, item) => {
      const product = products.find(p => p.id === item.productId);
      const price = product?.price || 0;
      return total + (price * item.quantity);
    }, 0);

    return {
      totalItems: allItems.length,
      completedItems: completedItems.length,
      completionRate: allItems.length > 0 ? (completedItems.length / allItems.length) * 100 : 0,
      estimatedCost,
    };
  }, [activeLists, products]);

  // Current list items
  const currentListItems = useMemo(() => 
    currentList?.items || []
  , [currentList?.items]);

  // Current list progress
  const currentListProgress = useMemo(() => {
    const items = currentListItems;
    const completed = items.filter(item => item.completed).length;
    
    return {
      total: items.length,
      completed,
      percentage: items.length > 0 ? (completed / items.length) * 100 : 0,
    };
  }, [currentListItems]);

  // Create new shopping list
  const createList = useCallback(async (name: string, description?: string) => {
    setIsProcessing(true);
    try {
      const listId = await dispatch(createShoppingList({
        name,
        description,
        ownerId: user?.uid || '',
      })).unwrap();
      return listId;
    } catch (error) {
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [dispatch, user?.uid]);

  // Update shopping list
  const updateList = useCallback(async (id: string, updates: Partial<ShoppingList>) => {
    setIsProcessing(true);
    try {
      await dispatch(updateShoppingList({ id, updates })).unwrap();
    } catch (error) {
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [dispatch]);

  // Delete shopping list
  const deleteList = useCallback(async (id: string) => {
    setIsProcessing(true);
    try {
      await dispatch(deleteShoppingList({ id })).unwrap();
      if (selectedListId === id) {
        setSelectedListId(null);
      }
    } catch (error) {
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [dispatch, selectedListId]);

  // Add item to list
  const addItem = useCallback(async (listId: string, productId: string, quantity: number, notes?: string) => {
    try {
      await dispatch(addItemToList({
        listId,
        item: {
          productId,
          quantity,
          notes,
          completed: false,
          addedAt: new Date().toISOString(),
        },
      })).unwrap();
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  // Update list item
  const updateItem = useCallback(async (listId: string, itemId: string, updates: Partial<ShoppingListItem>) => {
    try {
      await dispatch(updateListItem({
        listId,
        itemId,
        updates,
      })).unwrap();
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  // Remove item from list
  const removeItem = useCallback(async (listId: string, itemId: string) => {
    try {
      await dispatch(removeItemFromList({
        listId,
        itemId,
      })).unwrap();
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  // Toggle item completed status
  const toggleCompleted = useCallback(async (listId: string, itemId: string) => {
    try {
      await dispatch(toggleItemCompleted({
        listId,
        itemId,
      })).unwrap();
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  // Share list with users
  const shareList = useCallback(async (listId: string, userIds: string[]) => {
    setIsProcessing(true);
    try {
      await dispatch(shareShoppingList({
        listId,
        userIds,
      })).unwrap();
    } catch (error) {
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [dispatch]);

  // Unshare list from user
  const unshareList = useCallback(async (listId: string, userId: string) => {
    setIsProcessing(true);
    try {
      await dispatch(unshareShoppingList({
        listId,
        userId,
      })).unwrap();
    } catch (error) {
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [dispatch]);

  // Generate list from recipes
  const generateFromRecipes = useCallback(async (recipeIds: string[], servings?: Record<string, number>) => {
    setIsProcessing(true);
    try {
      const listId = await dispatch(generateListFromRecipes({
        recipeIds,
        servings,
        ownerId: user?.uid || '',
      })).unwrap();
      return listId;
    } catch (error) {
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [dispatch, user?.uid]);

  // Optimize shopping route
  const optimizeRoute = useCallback(async (listId: string, storeLayout?: any) => {
    setIsProcessing(true);
    try {
      await dispatch(optimizeShoppingRoute({
        listId,
        storeLayout,
      })).unwrap();
    } catch (error) {
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [dispatch]);

  // Set current list
  const setCurrentList = useCallback((listId: string | null) => {
    setSelectedListId(listId);
  }, []);

  return {
    // State
    lists: shoppingState.lists,
    currentList,
    isLoading: shoppingState.loading || isProcessing,
    error: shoppingState.error,
    
    // Actions
    createList,
    updateList,
    deleteList,
    addItem,
    updateItem,
    removeItem,
    toggleCompleted,
    shareList,
    unshareList,
    generateFromRecipes,
    optimizeRoute,
    setCurrentList,
    
    // Computed values
    totalLists: activeLists.length,
    activeLists,
    completedLists,
    sharedLists,
    myLists,
    listStatistics,
    currentListItems,
    currentListProgress,
  };
};
