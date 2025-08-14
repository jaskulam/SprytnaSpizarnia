import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import {
  persistReducer,
  persistStore,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

import authReducer from './slices/authSlice';
import productsReducer from './slices/productsSlice';
import shoppingReducer from './slices/shoppingSlice';
import recipesReducer from './slices/recipesSlice';
import familyReducer from './slices/familySlice';
import notificationsReducer from './slices/notificationsSlice';
import preferencesReducer from './slices/preferencesSlice';
import offlineReducer from './slices/offlineSlice';
import { syncMiddleware } from '@store/middleware/syncMiddleware';

const rootReducer = combineReducers({
  auth: authReducer,
  products: productsReducer,
  shopping: shoppingReducer,
  recipes: recipesReducer,
  family: familyReducer,
  notifications: notificationsReducer,
  preferences: preferencesReducer,
  offline: offlineReducer,
});

const persistConfig = {
  key: 'root',
  version: 1,
  storage: AsyncStorage,
  whitelist: ['auth', 'products', 'shopping'],
  blacklist: ['recipes', 'notifications'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        ignoredPaths: ['products.items', 'shopping.lists'],
      },
    }).concat(syncMiddleware),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
