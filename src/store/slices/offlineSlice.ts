import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FirestoreService } from '../../services/firebase/firestore';
import { Product, Recipe, ShoppingList } from '../../types/models';
import { RootState } from '../store';

interface PendingChange {
  id: string;
  type: 'product' | 'recipe' | 'shopping';
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: Date;
  retryCount: number;
}

interface OfflineState {
  isOnline: boolean;
  pendingChanges: PendingChange[];
  isSync: boolean;
  lastSync: Date | null;
  syncErrors: string[];
  queueSize: number;
  offlineData: {
    products: Product[];
    recipes: Recipe[];
    shoppingLists: ShoppingList[];
  };
  settings: {
    autoSync: boolean;
    maxRetries: number;
    syncInterval: number;
    offlineStorageLimit: number;
  };
}

const initialState: OfflineState = {
  isOnline: true,
  pendingChanges: [],
  isSync: false,
  lastSync: null,
  syncErrors: [],
  queueSize: 0,
  offlineData: {
    products: [],
    recipes: [],
    shoppingLists: [],
  },
  settings: {
    autoSync: true,
    maxRetries: 3,
    syncInterval: 30000, // 30 seconds
    offlineStorageLimit: 1000, // Max items to store offline
  },
};

// Async Thunks
export const initializeOfflineSync = createAsyncThunk(
  'offline/initialize',
  async () => {
    try {
      // Load pending changes from AsyncStorage
      const pendingChangesStr = await AsyncStorage.getItem('pendingChanges');
      const pendingChanges = pendingChangesStr ? JSON.parse(pendingChangesStr) : [];
      
      // Load offline data
      const offlineDataStr = await AsyncStorage.getItem('offlineData');
      const offlineData = offlineDataStr ? JSON.parse(offlineDataStr) : {
        products: [],
        recipes: [],
        shoppingLists: [],
      };
      
      // Load settings
      const settingsStr = await AsyncStorage.getItem('offlineSettings');
      const settings = settingsStr ? JSON.parse(settingsStr) : initialState.settings;
      
      return {
        pendingChanges,
        offlineData,
        settings,
      };
    } catch (error) {
      throw new Error('Failed to initialize offline sync');
    }
  }
);

export const addPendingChange = createAsyncThunk(
  'offline/addPendingChange',
  async (change: Omit<PendingChange, 'id' | 'timestamp' | 'retryCount'>) => {
    const pendingChange: PendingChange = {
      ...change,
      id: `change_${Date.now()}_${Math.random()}`,
      timestamp: new Date(),
      retryCount: 0,
    };
    
    // Save to AsyncStorage
    const existingChangesStr = await AsyncStorage.getItem('pendingChanges');
    const existingChanges = existingChangesStr ? JSON.parse(existingChangesStr) : [];
    const updatedChanges = [...existingChanges, pendingChange];
    
    await AsyncStorage.setItem('pendingChanges', JSON.stringify(updatedChanges));
    
    return pendingChange;
  }
);

export const syncPendingChanges = createAsyncThunk(
  'offline/syncPendingChanges',
  async (_, { getState }) => {
    const state = getState() as RootState;
    const { pendingChanges } = state.offline;
    
    if (pendingChanges.length === 0) {
      return { syncedChanges: [], errors: [] };
    }
    
    const syncedChanges: string[] = [];
    const errors: string[] = [];
    
    for (const change of pendingChanges) {
      try {
        switch (change.type) {
          case 'product':
            await syncProductChange(change);
            break;
          case 'recipe':
            await syncRecipeChange(change);
            break;
          case 'shopping':
            await syncShoppingChange(change);
            break;
        }
        
        syncedChanges.push(change.id);
      } catch (error) {
        errors.push(`Failed to sync ${change.id}: ${error}`);
        
        // Update retry count
        change.retryCount += 1;
      }
    }
    
    // Update AsyncStorage with remaining changes
    const remainingChanges = pendingChanges.filter(
      change => !syncedChanges.includes(change.id) && change.retryCount < 3
    );
    
    await AsyncStorage.setItem('pendingChanges', JSON.stringify(remainingChanges));
    
    return { syncedChanges, errors };
  }
);

export const saveOfflineData = createAsyncThunk(
  'offline/saveData',
  async ({ 
    type, 
    data 
  }: { 
    type: 'products' | 'recipes' | 'shoppingLists'; 
    data: any[] 
  }) => {
    const existingDataStr = await AsyncStorage.getItem('offlineData');
    const existingData = existingDataStr ? JSON.parse(existingDataStr) : {};
    
    const updatedData = {
      ...existingData,
      [type]: data,
    };
    
    await AsyncStorage.setItem('offlineData', JSON.stringify(updatedData));
    
    return { type, data };
  }
);

export const loadOfflineData = createAsyncThunk(
  'offline/loadData',
  async ({ type }: { type: 'products' | 'recipes' | 'shoppingLists' }) => {
    const offlineDataStr = await AsyncStorage.getItem('offlineData');
    const offlineData = offlineDataStr ? JSON.parse(offlineDataStr) : {};
    
    return { type, data: offlineData[type] || [] };
  }
);

export const clearOfflineData = createAsyncThunk(
  'offline/clearData',
  async () => {
    await AsyncStorage.removeItem('offlineData');
    await AsyncStorage.removeItem('pendingChanges');
    
    return null;
  }
);

export const updateOfflineSettings = createAsyncThunk(
  'offline/updateSettings',
  async (settings: Partial<OfflineState['settings']>) => {
    const existingSettingsStr = await AsyncStorage.getItem('offlineSettings');
    const existingSettings = existingSettingsStr ? JSON.parse(existingSettingsStr) : initialState.settings;
    
    const updatedSettings = {
      ...existingSettings,
      ...settings,
    };
    
    await AsyncStorage.setItem('offlineSettings', JSON.stringify(updatedSettings));
    
    return updatedSettings;
  }
);

export const forceSyncNow = createAsyncThunk(
  'offline/forceSync',
  async (_, { dispatch, getState }) => {
    const state = getState() as RootState;
    
    if (!state.offline.isOnline) {
      throw new Error('Cannot sync while offline');
    }
    
    // Sync pending changes
    const syncResult = await dispatch(syncPendingChanges()).unwrap();
    
    // Force refresh data from server
    try {
      const products = await FirestoreService.getProducts();
      const recipes = await FirestoreService.getRecipes();
      const shoppingLists = await FirestoreService.getShoppingLists();
      
      // Save fresh data offline
      await dispatch(saveOfflineData({ type: 'products', data: products }));
      await dispatch(saveOfflineData({ type: 'recipes', data: recipes }));
      await dispatch(saveOfflineData({ type: 'shoppingLists', data: shoppingLists }));
      
      return {
        ...syncResult,
        refreshedData: true,
      };
    } catch (error) {
      return {
        ...syncResult,
        refreshedData: false,
        refreshError: error.message,
      };
    }
  }
);

// Helper functions
async function syncProductChange(change: PendingChange) {
  switch (change.action) {
    case 'create':
      await FirestoreService.createProduct(change.data);
      break;
    case 'update':
      await FirestoreService.updateProduct(change.data.id, change.data);
      break;
    case 'delete':
      await FirestoreService.deleteProduct(change.data.id);
      break;
  }
}

async function syncRecipeChange(change: PendingChange) {
  switch (change.action) {
    case 'create':
      await FirestoreService.createRecipe(change.data);
      break;
    case 'update':
      await FirestoreService.updateRecipe(change.data.id, change.data);
      break;
    case 'delete':
      await FirestoreService.deleteRecipe(change.data.id);
      break;
  }
}

async function syncShoppingChange(change: PendingChange) {
  switch (change.action) {
    case 'create':
      await FirestoreService.createShoppingList(change.data);
      break;
    case 'update':
      await FirestoreService.updateShoppingList(change.data.id, change.data);
      break;
    case 'delete':
      await FirestoreService.deleteShoppingList(change.data.id);
      break;
  }
}

// Main slice
const offlineSlice = createSlice({
  name: 'offline',
  initialState,
  reducers: {
    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
      
      if (action.payload && state.settings.autoSync && state.pendingChanges.length > 0) {
        // Will trigger sync in middleware or component
      }
    },
    
    addPendingChangeLocal: (state, action: PayloadAction<PendingChange>) => {
      state.pendingChanges.push(action.payload);
      state.queueSize = state.pendingChanges.length;
    },
    
    removePendingChange: (state, action: PayloadAction<string>) => {
      state.pendingChanges = state.pendingChanges.filter(change => change.id !== action.payload);
      state.queueSize = state.pendingChanges.length;
    },
    
    updatePendingChange: (state, action: PayloadAction<{ id: string; updates: Partial<PendingChange> }>) => {
      const { id, updates } = action.payload;
      const index = state.pendingChanges.findIndex(change => change.id === id);
      
      if (index !== -1) {
        state.pendingChanges[index] = { ...state.pendingChanges[index], ...updates };
      }
    },
    
    clearSyncErrors: (state) => {
      state.syncErrors = [];
    },
    
    addSyncError: (state, action: PayloadAction<string>) => {
      state.syncErrors.push(action.payload);
    },
    
    updateOfflineDataLocal: (state, action: PayloadAction<{ type: keyof OfflineState['offlineData']; data: any[] }>) => {
      const { type, data } = action.payload;
      state.offlineData[type] = data;
    },
    
    addOfflineItem: (state, action: PayloadAction<{ type: keyof OfflineState['offlineData']; item: any }>) => {
      const { type, item } = action.payload;
      state.offlineData[type].push(item);
    },
    
    updateOfflineItem: (state, action: PayloadAction<{ type: keyof OfflineState['offlineData']; id: string; updates: any }>) => {
      const { type, id, updates } = action.payload;
      const index = state.offlineData[type].findIndex((item: any) => item.id === id);
      
      if (index !== -1) {
        state.offlineData[type][index] = { ...state.offlineData[type][index], ...updates };
      }
    },
    
    removeOfflineItem: (state, action: PayloadAction<{ type: keyof OfflineState['offlineData']; id: string }>) => {
      const { type, id } = action.payload;
      state.offlineData[type] = state.offlineData[type].filter((item: any) => item.id !== id);
    },
    
    setLastSync: (state, action: PayloadAction<Date>) => {
      state.lastSync = action.payload;
    },
    
    updateSettings: (state, action: PayloadAction<Partial<OfflineState['settings']>>) => {
      state.settings = { ...state.settings, ...action.payload };
    },
  },
  
  extraReducers: (builder) => {
    // Initialize offline sync
    builder
      .addCase(initializeOfflineSync.fulfilled, (state, action) => {
        state.pendingChanges = action.payload.pendingChanges;
        state.offlineData = action.payload.offlineData;
        state.settings = action.payload.settings;
        state.queueSize = action.payload.pendingChanges.length;
      })
      .addCase(initializeOfflineSync.rejected, (state) => {
        // Use default state if initialization fails
      });
    
    // Add pending change
    builder
      .addCase(addPendingChange.pending, (state) => {
        state.isSync = true;
      })
      .addCase(addPendingChange.fulfilled, (state, action) => {
        state.isSync = false;
        state.pendingChanges.push(action.payload);
        state.queueSize = state.pendingChanges.length;
      })
      .addCase(addPendingChange.rejected, (state, action) => {
        state.isSync = false;
        state.syncErrors.push(action.error.message || 'Failed to add pending change');
      });
    
    // Sync pending changes
    builder
      .addCase(syncPendingChanges.pending, (state) => {
        state.isSync = true;
        state.syncErrors = [];
      })
      .addCase(syncPendingChanges.fulfilled, (state, action) => {
        state.isSync = false;
        
        // Remove synced changes
        state.pendingChanges = state.pendingChanges.filter(
          change => !action.payload.syncedChanges.includes(change.id)
        );
        
        state.queueSize = state.pendingChanges.length;
        state.syncErrors = action.payload.errors;
        state.lastSync = new Date();
      })
      .addCase(syncPendingChanges.rejected, (state, action) => {
        state.isSync = false;
        state.syncErrors.push(action.error.message || 'Failed to sync changes');
      });
    
    // Save offline data
    builder
      .addCase(saveOfflineData.fulfilled, (state, action) => {
        const { type, data } = action.payload;
        state.offlineData[type] = data;
      });
    
    // Load offline data
    builder
      .addCase(loadOfflineData.fulfilled, (state, action) => {
        const { type, data } = action.payload;
        state.offlineData[type] = data;
      });
    
    // Clear offline data
    builder
      .addCase(clearOfflineData.fulfilled, (state) => {
        state.pendingChanges = [];
        state.offlineData = initialState.offlineData;
        state.queueSize = 0;
        state.syncErrors = [];
        state.lastSync = null;
      });
    
    // Update settings
    builder
      .addCase(updateOfflineSettings.fulfilled, (state, action) => {
        state.settings = action.payload;
      });
    
    // Force sync
    builder
      .addCase(forceSyncNow.pending, (state) => {
        state.isSync = true;
        state.syncErrors = [];
      })
      .addCase(forceSyncNow.fulfilled, (state, action) => {
        state.isSync = false;
        state.lastSync = new Date();
        
        if (action.payload.refreshError) {
          state.syncErrors.push(action.payload.refreshError);
        }
      })
      .addCase(forceSyncNow.rejected, (state, action) => {
        state.isSync = false;
        state.syncErrors.push(action.error.message || 'Failed to force sync');
      });
  },
});

export const {
  setOnlineStatus,
  addPendingChangeLocal,
  removePendingChange,
  updatePendingChange,
  clearSyncErrors,
  addSyncError,
  updateOfflineDataLocal,
  addOfflineItem,
  updateOfflineItem,
  removeOfflineItem,
  setLastSync,
  updateSettings,
} = offlineSlice.actions;

export default offlineSlice.reducer;
