import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import productsService from '@/services/productsService';
import { Product } from '@/types/models';
import { RootState } from '../store';

interface ProductsState {
  items: Product[];
  isLoading: boolean;
  error: string | null;
  isOnline: boolean;
  pendingChanges: number;
  lastSync: Date | null;
  filters: {
    location: string | null;
    sortBy: 'expiryDate' | 'name' | 'createdAt';
    showExpired: boolean;
  };
}

const initialState: ProductsState = {
  items: [],
  isLoading: false,
  error: null,
  isOnline: true,
  pendingChanges: 0,
  lastSync: null,
  filters: {
    location: null,
    sortBy: 'expiryDate',
    showExpired: false,
  },
};

// Async thunks
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (_, { getState }) => {
    const state = getState() as RootState;
    const userId = state.auth.user?.id;
    if (!userId) throw new Error('User not authenticated');
    
    return await productsService.getProducts(userId);
  }
);

export const addProduct = createAsyncThunk(
  'products/addProduct',
  async (product: Omit<Product, 'id' | 'createdAt'>, { getState }) => {
    const state = getState() as RootState;
    const userId = state.auth.user?.id;
    if (!userId) throw new Error('User not authenticated');
    
    return await productsService.addProduct({
      ...product,
      ownerId: userId,
    });
  }
);

export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ id, updates }: { id: string; updates: Partial<Product> }) => {
    await productsService.updateProduct(id, updates);
    return { id, updates };
  }
);

export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (productId: string) => {
    await productsService.deleteProduct(productId);
    return productId;
  }
);

export const syncPendingChanges = createAsyncThunk(
  'products/syncPendingChanges',
  async () => {
    await productsService.syncOfflineQueue();
    return new Date();
  }
);

export const saveLocalState = createAsyncThunk(
  'products/saveLocalState',
  async (_, { getState }) => {
    const state = getState() as RootState;
    // Placeholder for local snapshot; can persist if needed
    void state;
  }
);

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
    },
    setFilter: (state, action: PayloadAction<Partial<ProductsState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
    incrementPendingChanges: (state) => {
      state.pendingChanges += 1;
    },
    decrementPendingChanges: (state) => {
      state.pendingChanges = Math.max(0, state.pendingChanges - 1);
    },
    resetPendingChanges: (state) => {
      state.pendingChanges = 0;
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
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Błąd pobierania produktów';
      });

    // Add product
    builder
      .addCase(addProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items.push(action.payload);
        state.items.sort((a, b) => a.expiryDate.getTime() - b.expiryDate.getTime());
      })
      .addCase(addProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Błąd dodawania produktu';
        if (!state.isOnline) {
          state.pendingChanges += 1;
        }
      });

    // Update product
    builder
      .addCase(updateProduct.pending, (state) => {
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        const index = state.items.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = { ...state.items[index], ...action.payload.updates };
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.error = action.error.message || 'Błąd aktualizacji produktu';
        if (!state.isOnline) {
          state.pendingChanges += 1;
        }
      });

    // Delete product
    builder
      .addCase(deleteProduct.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.items = state.items.filter(p => p.id !== action.payload);
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.error = action.error.message || 'Błąd usuwania produktu';
        if (!state.isOnline) {
          state.pendingChanges += 1;
        }
      });

    // Sync pending changes
    builder
      .addCase(syncPendingChanges.fulfilled, (state, action) => {
        state.pendingChanges = 0;
        state.lastSync = action.payload;
      });
  },
});

// Selectors
export const selectFilteredProducts = (state: RootState) => {
  let products = [...state.products.items];
  
  // Apply filters
  if (!state.products.filters.showExpired) {
    products = products.filter(p => p.expiryDate > new Date());
  }
  
  if (state.products.filters.location) {
    products = products.filter(p => p.location === state.products.filters.location);
  }
  
  // Sort
  switch (state.products.filters.sortBy) {
    case 'name':
      products.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'createdAt':
      products.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      break;
    case 'expiryDate':
    default:
      products.sort((a, b) => a.expiryDate.getTime() - b.expiryDate.getTime());
      break;
  }
  
  return products;
};

export const selectExpiringProducts = (state: RootState, daysAhead: number = 3) => {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysAhead);
  
  return state.products.items.filter(p => 
    p.expiryDate <= futureDate && p.expiryDate >= new Date()
  );
};

export const selectExpiredProducts = (state: RootState) => {
  return state.products.items.filter(p => p.expiryDate < new Date());
};

export const { 
  setOnlineStatus, 
  setFilter, 
  clearError,
  incrementPendingChanges,
  decrementPendingChanges,
  resetPendingChanges,
} = productsSlice.actions;

export default productsSlice.reducer;
