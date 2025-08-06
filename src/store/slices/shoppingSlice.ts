import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ShoppingList, ShoppingListItem, Product } from '../../types/models';
import { FirestoreService } from '../../services/firebase/firestore';
import { CloudFunctionsService } from '../../services/firebase/functions';
import { RootState } from '../store';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ShoppingState {
  lists: ShoppingList[];
  currentList: ShoppingList | null;
  sharedLists: ShoppingList[];
  archivedLists: ShoppingList[];
  isLoading: boolean;
  isGenerating: boolean;
  error: string | null;
  lastSync: Date | null;
  offlineChanges: any[];
}

const initialState: ShoppingState = {
  lists: [],
  currentList: null,
  sharedLists: [],
  archivedLists: [],
  isLoading: false,
  isGenerating: false,
  error: null,
  lastSync: null,
  offlineChanges: [],
};

// Async Thunks
export const fetchShoppingLists = createAsyncThunk(
  'shopping/fetchLists',
  async (_, { getState }) => {
    const state = getState() as RootState;
    const userId = state.auth.user?.id;
    const familyId = state.auth.user?.familyId;
    
    if (!userId) throw new Error('User not authenticated');
    
    try {
      const lists = await FirestoreService.getShoppingLists(userId, familyId);
      await AsyncStorage.setItem('shopping_lists_cache', JSON.stringify(lists));
      return lists;
    } catch (error) {
      // Fallback to cached data
      const cached = await AsyncStorage.getItem('shopping_lists_cache');
      if (cached) {
        return JSON.parse(cached);
      }
      throw error;
    }
  }
);

export const createShoppingList = createAsyncThunk(
  'shopping/createList',
  async (
    listData: { name: string; description?: string; ownerId: string },
    { getState }
  ) => {
    const state = getState() as RootState;
    const userId = state.auth.user?.id;
    
    if (!userId) throw new Error('User not authenticated');
    
    const newList: Omit<ShoppingList, 'id'> = {
      ...listData,
      items: [],
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      sharedWith: [],
      archived: false,
    };
    
    const list = await FirestoreService.addShoppingList(newList);
    return list;
  }
);

export const updateShoppingList = createAsyncThunk(
  'shopping/updateList',
  async ({ id, updates }: { id: string; updates: Partial<ShoppingList> }) => {
    await FirestoreService.updateShoppingList(id, updates);
    return { id, updates };
  }
);

export const deleteShoppingList = createAsyncThunk(
  'shopping/deleteList',
  async (listId: string) => {
    await FirestoreService.deleteShoppingList(listId);
    return listId;
  }
);

export const addItemToList = createAsyncThunk(
  'shopping/addItem',
  async ({ 
    listId, 
    item 
  }: { 
    listId: string; 
    item: { productId: string; quantity: number; notes?: string; completed: boolean; addedAt: string } 
  }) => {
    const updatedList = await FirestoreService.getShoppingList(listId);
    if (!updatedList) throw new Error('Shopping list not found');
    
    const newItem: ShoppingListItem = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...item,
    };
    
    const updatedItems = [...(updatedList.items || []), newItem];
    
    await FirestoreService.updateShoppingList(listId, {
      items: updatedItems,
      updatedAt: new Date(),
    });
    
    return { listId, item: newItem };
  }
);

export const updateListItem = createAsyncThunk(
  'shopping/updateItem',
  async ({ 
    listId, 
    itemId, 
    updates 
  }: { 
    listId: string; 
    itemId: string; 
    updates: Partial<ShoppingListItem> 
  }) => {
    const list = await FirestoreService.getShoppingList(listId);
    if (!list) throw new Error('Shopping list not found');
    
    const updatedItems = list.items?.map(item => 
      item.id === itemId ? { ...item, ...updates } : item
    ) || [];
    
    await FirestoreService.updateShoppingList(listId, {
      items: updatedItems,
      updatedAt: new Date(),
    });
    
    return { listId, itemId, updates };
  }
);

export const removeItemFromList = createAsyncThunk(
  'shopping/removeItem',
  async ({ listId, itemId }: { listId: string; itemId: string }) => {
    const list = await FirestoreService.getShoppingList(listId);
    if (!list) throw new Error('Shopping list not found');
    
    const updatedItems = list.items?.filter(item => item.id !== itemId) || [];
    
    await FirestoreService.updateShoppingList(listId, {
      items: updatedItems,
      updatedAt: new Date(),
    });
    
    return { listId, itemId };
  }
);

export const toggleItemCompleted = createAsyncThunk(
  'shopping/toggleItemCompleted',
  async ({ listId, itemId }: { listId: string; itemId: string }) => {
    const list = await FirestoreService.getShoppingList(listId);
    if (!list) throw new Error('Shopping list not found');
    
    const item = list.items?.find(item => item.id === itemId);
    if (!item) throw new Error('Item not found');
    
    const updatedItems = list.items?.map(item => 
      item.id === itemId ? { ...item, completed: !item.completed } : item
    ) || [];
    
    await FirestoreService.updateShoppingList(listId, {
      items: updatedItems,
      updatedAt: new Date(),
    });
    
    return { listId, itemId, completed: !item.completed };
  }
);

export const shareShoppingList = createAsyncThunk(
  'shopping/shareList',
  async ({ listId, userIds }: { listId: string; userIds: string[] }) => {
    const list = await FirestoreService.getShoppingList(listId);
    if (!list) throw new Error('Shopping list not found');
    
    const updatedSharedWith = [...(list.sharedWith || []), ...userIds];
    
    await FirestoreService.updateShoppingList(listId, {
      sharedWith: updatedSharedWith,
    });
    
    return { listId, userIds };
  }
);

export const unshareShoppingList = createAsyncThunk(
  'shopping/unshareList',
  async ({ listId, userId }: { listId: string; userId: string }) => {
    const list = await FirestoreService.getShoppingList(listId);
    if (!list) throw new Error('Shopping list not found');
    
    const updatedSharedWith = list.sharedWith?.filter(id => id !== userId) || [];
    
    await FirestoreService.updateShoppingList(listId, {
      sharedWith: updatedSharedWith,
    });
    
    return { listId, userId };
  }
);

export const generateListFromRecipes = createAsyncThunk(
  'shopping/generateFromRecipes',
  async ({ 
    recipeIds, 
    servings = {},
    ownerId 
  }: { 
    recipeIds: string[]; 
    servings?: Record<string, number>;
    ownerId: string;
  }) => {
    // Get recipes and extract ingredients
    const recipes = await Promise.all(
      recipeIds.map(id => FirestoreService.getRecipe(id))
    );
    
    const allIngredients: any[] = [];
    
    recipes.forEach(recipe => {
      if (!recipe) return;
      
      const servingMultiplier = servings[recipe.id] || 1;
      
      recipe.ingredients.forEach(ingredient => {
        const existingIndex = allIngredients.findIndex(
          item => item.name.toLowerCase() === ingredient.name.toLowerCase()
        );
        
        if (existingIndex >= 0) {
          allIngredients[existingIndex].quantity += ingredient.quantity * servingMultiplier;
        } else {
          allIngredients.push({
            ...ingredient,
            quantity: ingredient.quantity * servingMultiplier,
          });
        }
      });
    });
    
    // Create shopping list
    const listName = `Lista z przepisów (${new Date().toLocaleDateString()})`;
    
    const newList: Omit<ShoppingList, 'id'> = {
      name: listName,
      description: `Automatycznie wygenerowana z ${recipeIds.length} przepisów`,
      ownerId,
      items: allIngredients.map(ingredient => ({
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        productId: ingredient.productId || '',
        quantity: ingredient.quantity,
        notes: `Z przepisu: ${ingredient.recipeName || ''}`,
        completed: false,
        addedAt: new Date().toISOString(),
      })),
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      sharedWith: [],
      archived: false,
    };
    
    const list = await FirestoreService.addShoppingList(newList);
    return list;
  }
);

export const optimizeShoppingRoute = createAsyncThunk(
  'shopping/optimizeRoute',
  async ({ 
    listId, 
    storeLayout 
  }: { 
    listId: string; 
    storeLayout?: any 
  }) => {
    try {
      const result = await CloudFunctionsService.optimizeShoppingRoute(
        listId, 
        undefined, 
        storeLayout
      );
      
      // Update list with optimized order
      await FirestoreService.updateShoppingList(listId, {
        items: result.optimizedList,
        updatedAt: new Date(),
      });
      
      return { listId, optimizedList: result.optimizedList, estimatedTime: result.estimatedTime };
    } catch (error) {
      // Fallback to simple alphabetical sorting
      const list = await FirestoreService.getShoppingList(listId);
      if (!list) throw new Error('Shopping list not found');
      
      const sortedItems = [...(list.items || [])].sort((a, b) => {
        // Sort by completion status first, then alphabetically
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1;
        }
        return (a.notes || '').localeCompare(b.notes || '');
      });
      
      await FirestoreService.updateShoppingList(listId, {
        items: sortedItems,
        updatedAt: new Date(),
      });
      
      return { listId, optimizedList: sortedItems, estimatedTime: sortedItems.length * 2 };
    }
  }
);

// Main slice
const shoppingSlice = createSlice({
  name: 'shopping',
  initialState,
  reducers: {
    setCurrentList: (state, action: PayloadAction<ShoppingList | null>) => {
      state.currentList = action.payload;
    },
    
    clearError: (state) => {
      state.error = null;
    },
    
    // Optimistic updates for better UX
    addListOptimistic: (state, action: PayloadAction<ShoppingList>) => {
      state.lists.unshift(action.payload);
    },
    
    updateListOptimistic: (state, action: PayloadAction<{ id: string; updates: Partial<ShoppingList> }>) => {
      const { id, updates } = action.payload;
      const index = state.lists.findIndex(list => list.id === id);
      if (index !== -1) {
        state.lists[index] = { ...state.lists[index], ...updates };
      }
      
      if (state.currentList?.id === id) {
        state.currentList = { ...state.currentList, ...updates };
      }
    },
    
    removeListOptimistic: (state, action: PayloadAction<string>) => {
      const listId = action.payload;
      state.lists = state.lists.filter(list => list.id !== listId);
      
      if (state.currentList?.id === listId) {
        state.currentList = null;
      }
    },
    
    addItemOptimistic: (state, action: PayloadAction<{ listId: string; item: ShoppingListItem }>) => {
      const { listId, item } = action.payload;
      const listIndex = state.lists.findIndex(list => list.id === listId);
      
      if (listIndex !== -1) {
        state.lists[listIndex].items = [...(state.lists[listIndex].items || []), item];
      }
      
      if (state.currentList?.id === listId) {
        state.currentList.items = [...(state.currentList.items || []), item];
      }
    },
    
    updateItemOptimistic: (state, action: PayloadAction<{ 
      listId: string; 
      itemId: string; 
      updates: Partial<ShoppingListItem> 
    }>) => {
      const { listId, itemId, updates } = action.payload;
      
      // Update in lists array
      const listIndex = state.lists.findIndex(list => list.id === listId);
      if (listIndex !== -1 && state.lists[listIndex].items) {
        const itemIndex = state.lists[listIndex].items!.findIndex(item => item.id === itemId);
        if (itemIndex !== -1) {
          state.lists[listIndex].items![itemIndex] = { 
            ...state.lists[listIndex].items![itemIndex], 
            ...updates 
          };
        }
      }
      
      // Update in current list
      if (state.currentList?.id === listId && state.currentList.items) {
        const itemIndex = state.currentList.items.findIndex(item => item.id === itemId);
        if (itemIndex !== -1) {
          state.currentList.items[itemIndex] = { 
            ...state.currentList.items[itemIndex], 
            ...updates 
          };
        }
      }
    },
    
    removeItemOptimistic: (state, action: PayloadAction<{ listId: string; itemId: string }>) => {
      const { listId, itemId } = action.payload;
      
      // Remove from lists array
      const listIndex = state.lists.findIndex(list => list.id === listId);
      if (listIndex !== -1) {
        state.lists[listIndex].items = state.lists[listIndex].items?.filter(
          item => item.id !== itemId
        ) || [];
      }
      
      // Remove from current list
      if (state.currentList?.id === listId) {
        state.currentList.items = state.currentList.items?.filter(
          item => item.id !== itemId
        ) || [];
      }
    },
    
    // Offline support
    addOfflineChange: (state, action: PayloadAction<any>) => {
      state.offlineChanges.push(action.payload);
    },
    
    clearOfflineChanges: (state) => {
      state.offlineChanges = [];
    },
  },
  
  extraReducers: (builder) => {
    // Fetch shopping lists
    builder
      .addCase(fetchShoppingLists.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchShoppingLists.fulfilled, (state, action) => {
        state.isLoading = false;
        state.lists = action.payload;
        state.lastSync = new Date();
      })
      .addCase(fetchShoppingLists.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch shopping lists';
      });
    
    // Create shopping list
    builder
      .addCase(createShoppingList.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createShoppingList.fulfilled, (state, action) => {
        state.isLoading = false;
        state.lists.unshift(action.payload);
      })
      .addCase(createShoppingList.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to create shopping list';
      });
    
    // Update shopping list
    builder
      .addCase(updateShoppingList.fulfilled, (state, action) => {
        const { id, updates } = action.payload;
        const index = state.lists.findIndex(list => list.id === id);
        if (index !== -1) {
          state.lists[index] = { ...state.lists[index], ...updates };
        }
        
        if (state.currentList?.id === id) {
          state.currentList = { ...state.currentList, ...updates };
        }
      })
      .addCase(updateShoppingList.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to update shopping list';
      });
    
    // Delete shopping list
    builder
      .addCase(deleteShoppingList.fulfilled, (state, action) => {
        const listId = action.payload;
        state.lists = state.lists.filter(list => list.id !== listId);
        
        if (state.currentList?.id === listId) {
          state.currentList = null;
        }
      })
      .addCase(deleteShoppingList.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to delete shopping list';
      });
    
    // Add item to list
    builder
      .addCase(addItemToList.fulfilled, (state, action) => {
        const { listId, item } = action.payload;
        const listIndex = state.lists.findIndex(list => list.id === listId);
        
        if (listIndex !== -1) {
          state.lists[listIndex].items = [...(state.lists[listIndex].items || []), item];
        }
        
        if (state.currentList?.id === listId) {
          state.currentList.items = [...(state.currentList.items || []), item];
        }
      })
      .addCase(addItemToList.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to add item';
      });
    
    // Update list item
    builder
      .addCase(updateListItem.fulfilled, (state, action) => {
        const { listId, itemId, updates } = action.payload;
        
        // Update in lists array
        const listIndex = state.lists.findIndex(list => list.id === listId);
        if (listIndex !== -1 && state.lists[listIndex].items) {
          const itemIndex = state.lists[listIndex].items!.findIndex(item => item.id === itemId);
          if (itemIndex !== -1) {
            state.lists[listIndex].items![itemIndex] = { 
              ...state.lists[listIndex].items![itemIndex], 
              ...updates 
            };
          }
        }
        
        // Update in current list
        if (state.currentList?.id === listId && state.currentList.items) {
          const itemIndex = state.currentList.items.findIndex(item => item.id === itemId);
          if (itemIndex !== -1) {
            state.currentList.items[itemIndex] = { 
              ...state.currentList.items[itemIndex], 
              ...updates 
            };
          }
        }
      })
      .addCase(updateListItem.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to update item';
      });
    
    // Remove item from list
    builder
      .addCase(removeItemFromList.fulfilled, (state, action) => {
        const { listId, itemId } = action.payload;
        
        // Remove from lists array
        const listIndex = state.lists.findIndex(list => list.id === listId);
        if (listIndex !== -1) {
          state.lists[listIndex].items = state.lists[listIndex].items?.filter(
            item => item.id !== itemId
          ) || [];
        }
        
        // Remove from current list
        if (state.currentList?.id === listId) {
          state.currentList.items = state.currentList.items?.filter(
            item => item.id !== itemId
          ) || [];
        }
      })
      .addCase(removeItemFromList.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to remove item';
      });
    
    // Toggle item completed
    builder
      .addCase(toggleItemCompleted.fulfilled, (state, action) => {
        const { listId, itemId, completed } = action.payload;
        
        // Update in lists array
        const listIndex = state.lists.findIndex(list => list.id === listId);
        if (listIndex !== -1 && state.lists[listIndex].items) {
          const itemIndex = state.lists[listIndex].items!.findIndex(item => item.id === itemId);
          if (itemIndex !== -1) {
            state.lists[listIndex].items![itemIndex].completed = completed;
          }
        }
        
        // Update in current list
        if (state.currentList?.id === listId && state.currentList.items) {
          const itemIndex = state.currentList.items.findIndex(item => item.id === itemId);
          if (itemIndex !== -1) {
            state.currentList.items[itemIndex].completed = completed;
          }
        }
      })
      .addCase(toggleItemCompleted.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to toggle item';
      });
    
    // Generate list from recipes
    builder
      .addCase(generateListFromRecipes.pending, (state) => {
        state.isGenerating = true;
        state.error = null;
      })
      .addCase(generateListFromRecipes.fulfilled, (state, action) => {
        state.isGenerating = false;
        state.lists.unshift(action.payload);
      })
      .addCase(generateListFromRecipes.rejected, (state, action) => {
        state.isGenerating = false;
        state.error = action.error.message || 'Failed to generate shopping list';
      });
    
    // Optimize shopping route
    builder
      .addCase(optimizeShoppingRoute.fulfilled, (state, action) => {
        const { listId, optimizedList } = action.payload;
        const listIndex = state.lists.findIndex(list => list.id === listId);
        
        if (listIndex !== -1) {
          state.lists[listIndex].items = optimizedList;
        }
        
        if (state.currentList?.id === listId) {
          state.currentList.items = optimizedList;
        }
      })
      .addCase(optimizeShoppingRoute.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to optimize route';
      });
  },
});

export const {
  setCurrentList,
  clearError,
  addListOptimistic,
  updateListOptimistic,
  removeListOptimistic,
  addItemOptimistic,
  updateItemOptimistic,
  removeItemOptimistic,
  addOfflineChange,
  clearOfflineChanges,
} = shoppingSlice.actions;

export default shoppingSlice.reducer;
