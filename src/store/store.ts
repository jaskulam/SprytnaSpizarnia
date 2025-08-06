import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import productsReducer from './slices/productsSlice';
import shoppingReducer from './slices/shoppingSlice';
import recipesReducer from './slices/recipesSlice';
import familyReducer from './slices/familySlice';
import notificationsReducer from './slices/notificationsSlice';
import preferencesReducer from './slices/preferencesSlice';
import offlineReducer from './slices/offlineSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productsReducer,
    shopping: shoppingReducer,
    recipes: recipesReducer,
    family: familyReducer,
    notifications: notificationsReducer,
    preferences: preferencesReducer,
    offline: offlineReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['products/setProducts', 'shopping/setLists'],
        ignoredPaths: ['products.items', 'shopping.lists'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
