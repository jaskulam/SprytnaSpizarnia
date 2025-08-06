import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Product } from '../../types/models';
import { FirestoreService } from '../../services/firebase/firestore';
import { RootState } from '../store';

interface ProductsState {
  items: Product[];
  isLoading: boolean;
  error: string | null;
  lastSync: Date | null;
  pendingChanges: number;
  isOnline: boolean;
}

const initialState: ProductsState = {
  items: [],
  isLoading: false,
  error: null,
  lastSync: null,
  pendingChanges: 0,
  isOnline: true,
};

// Thunks
export const fetchProducts = createAsyncThunk(
  'products/fetch',
  async (_, { getState }) => {
    const state = getState() as RootState;
    const userId = state.auth.user?.id;
    const familyId = state.auth.user?.familyId;

    if (!userId) throw new Error('User not authenticated');

    const netState = await NetInfo.fetch();
    const isOnline = netState.isConnected ?? false;

    if (isOnline) {
      const products = await FirestoreService.getProducts(userId, familyId);
      await AsyncStorage.setItem('products_cache', JSON.stringify(products));
      return products;
    } else {
      const cached = await AsyncStorage.getItem('products_cache');
      return cached ? JSON.parse(cached) : [];
    }
  }
);

export const addProduct = createAsyncThunk(
  'products/add',
  async (product: Omit<Product, 'id'>, { getState }) => {
    const state = getState() as RootState;
    const isOnline = state.products.isOnline;

    if (isOnline) {
      return await FirestoreService.addProduct(product);
    } else {
      // Add to local storage for later sync
      const pendingProducts = await AsyncStorage.getItem('pending_products') || '[]';
      const pending = JSON.parse(pendingProducts);
      const localProduct = {
        ...product,
        id: `local_${Date.now()}`,
        _pending: true,
      };
      pending.push(localProduct);
      await AsyncStorage.setItem('pending_products', JSON.stringify(pending));
      return localProduct as Product;
    }
  }
);

export const updateProduct = createAsyncThunk(
  'products/update',
  async ({ id, updates }: { id: string; updates: Partial<Product> }, { getState }) => {
    const state = getState() as RootState;
    const isOnline = state.products.isOnline;

    if (isOnline) {
      await FirestoreService.updateProduct(id, updates);
      return { id, updates };
    } else {
      // Queue for sync
      const pendingUpdates = await AsyncStorage.getItem('pending_updates') || '[]';
      const pending = JSON.parse(pendingUpdates);
      pending.push({ id, updates, timestamp: Date.now() });
      await AsyncStorage.setItem('pending_updates', JSON.stringify(pending));
      return { id, updates };
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'products/delete',
  async (productId: string, { getState }) => {
    const state = getState() as RootState;
    const isOnline = state.products.isOnline;

    if (isOnline) {
      await FirestoreService.deleteProduct(productId);
      return productId;
    } else {
      // Queue for sync
      const pendingDeletes = await AsyncStorage.getItem('pending_deletes') || '[]';
      const pending = JSON.parse(pendingDeletes);
      pending.push({ id: productId, timestamp: Date.now() });
      await AsyncStorage.setItem('pending_deletes', JSON.stringify(pending));
      return productId;
    }
  }
);

export const syncOfflineChanges = createAsyncThunk(
  'products/sync',
  async () => {
    const pendingProducts = JSON.parse(await AsyncStorage.getItem('pending_products') || '[]');
    const pendingUpdates = JSON.parse(await AsyncStorage.getItem('pending_updates') || '[]');
    const pendingDeletes = JSON.parse(await AsyncStorage.getItem('pending_deletes') || '[]');

    const results = {
      added: [] as Product[],
      updated: [] as string[],
      deleted: [] as string[],
    };

    // Process additions
    for (const product of pendingProducts) {
      const { _pending, ...productData } = product;
      const added = await FirestoreService.addProduct(productData);
      results.added.push(added);
    }

    // Process updates
    for (const { id, updates } of pendingUpdates) {
      await FirestoreService.updateProduct(id, updates);
      results.updated.push(id);
    }

    // Process deletions
    for (const { id } of pendingDeletes) {
      await FirestoreService.deleteProduct(id);
      results.deleted.push(id);
    }

    // Clear pending changes
    await AsyncStorage.multiRemove([
      'pending_products',
      'pending_updates',
      'pending_deletes',
    ]);

    return results;
  }
);

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setProducts: (state, action: PayloadAction<Product[]>) => {
      state.items = action.payload;
    },
    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    updatePendingChanges: (state, action: PayloadAction<number>) => {
      state.pendingChanges = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch products
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
        state.lastSync = new Date();
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Błąd pobierania produktów';
      });

    // Add product
    builder
      .addCase(addProduct.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items.push(action.payload);
        if (!state.isOnline) {
          state.pendingChanges++;
        }
      })
      .addCase(addProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Błąd dodawania produktu';
      });

    // Update product
    builder
      .addCase(updateProduct.fulfilled, (state, action) => {
        const { id, updates } = action.payload;
        const index = state.items.findIndex(p => p.id === id);
        if (index !== -1) {
          state.items[index] = { ...state.items[index], ...updates };
        }
        if (!state.isOnline) {
          state.pendingChanges++;
        }
      });

    // Delete product
    builder
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.items = state.items.filter(p => p.id !== action.payload);
        if (!state.isOnline) {
          state.pendingChanges++;
        }
      });

    // Sync offline changes
    builder
      .addCase(syncOfflineChanges.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(syncOfflineChanges.fulfilled, (state) => {
        state.isLoading = false;
        state.pendingChanges = 0;
        state.lastSync = new Date();
      })
      .addCase(syncOfflineChanges.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Błąd synchronizacji';
      });
  },
});

export const { setProducts, setOnlineStatus, clearError, updatePendingChanges } = productsSlice.actions;

// Selectors
export const selectProducts = (state: RootState) => state.products.items;
export const selectProductById = (id: string) => (state: RootState) =>
  state.products.items.find(p => p.id === id);
export const selectExpiringProducts = (state: RootState) => {
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
  
  return state.products.items.filter(product => {
    if (!product.expiryDate) return false;
    return product.expiryDate <= threeDaysFromNow && product.expiryDate >= new Date();
  });
};

export default productsSlice.reducer;
