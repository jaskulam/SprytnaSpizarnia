import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FirestoreService } from '../../services/firebase/firestore';
import { UserPreferences, ThemeMode, Language, Units, NotificationSettings } from '../../types/models';
import { RootState } from '../store';

interface PreferencesState {
  preferences: UserPreferences | null;
  isLoading: boolean;
  error: string | null;
  hasUnsavedChanges: boolean;
  lastSync: Date | null;
}

const defaultPreferences: UserPreferences = {
  userId: '',
  theme: 'auto',
  language: 'pl',
  units: 'metric',
  currency: 'PLN',
  notifications: {
    push: true,
    email: true,
    expiration: true,
    shopping: true,
    recipes: true,
    family: true,
  },
  privacy: {
    shareData: false,
    analytics: true,
    crashReports: true,
  },
  features: {
    offlineSync: true,
    autoBackup: true,
    smartSuggestions: true,
    voiceCommands: false,
    experimentalFeatures: false,
  },
  ui: {
    compactView: false,
    showTutorials: true,
    animationsEnabled: true,
    hapticFeedback: true,
  },
  shopping: {
    autoSort: true,
    groupByCategory: true,
    showPrices: true,
    defaultStore: '',
  },
  recipes: {
    defaultServings: 4,
    showNutrition: true,
    autoScale: true,
    favoriteFirst: true,
  },
  updatedAt: new Date(),
  createdAt: new Date(),
};

const initialState: PreferencesState = {
  preferences: null,
  isLoading: false,
  error: null,
  hasUnsavedChanges: false,
  lastSync: null,
};

// Async Thunks
export const loadPreferences = createAsyncThunk(
  'preferences/load',
  async ({ userId }: { userId: string }) => {
    try {
      // Try to load from local storage first
      const localPrefsStr = await AsyncStorage.getItem(`preferences_${userId}`);
      const localPrefs = localPrefsStr ? JSON.parse(localPrefsStr) : null;
      
      // Load from Firestore
      const firestorePrefs = await FirestoreService.getUserPreferences(userId);
      
      // Use most recent preferences
      if (firestorePrefs && localPrefs) {
        const firestoreDate = new Date(firestorePrefs.updatedAt);
        const localDate = new Date(localPrefs.updatedAt);
        
        return firestoreDate > localDate ? firestorePrefs : localPrefs;
      }
      
      return firestorePrefs || localPrefs || { ...defaultPreferences, userId };
    } catch (error) {
      // If Firestore fails, try local storage
      const localPrefsStr = await AsyncStorage.getItem(`preferences_${userId}`);
      return localPrefsStr ? JSON.parse(localPrefsStr) : { ...defaultPreferences, userId };
    }
  }
);

export const savePreferences = createAsyncThunk(
  'preferences/save',
  async ({ preferences }: { preferences: UserPreferences }) => {
    const updatedPreferences = {
      ...preferences,
      updatedAt: new Date(),
    };
    
    try {
      // Save to local storage first (faster)
      await AsyncStorage.setItem(
        `preferences_${preferences.userId}`,
        JSON.stringify(updatedPreferences)
      );
      
      // Then save to Firestore
      await FirestoreService.updateUserPreferences(preferences.userId, updatedPreferences);
      
      return updatedPreferences;
    } catch (error) {
      // If Firestore fails, at least we have local copy
      await AsyncStorage.setItem(
        `preferences_${preferences.userId}`,
        JSON.stringify(updatedPreferences)
      );
      
      throw new Error('Failed to sync preferences to server');
    }
  }
);

export const updateTheme = createAsyncThunk(
  'preferences/updateTheme',
  async ({ userId, theme }: { userId: string; theme: ThemeMode }) => {
    const prefsStr = await AsyncStorage.getItem(`preferences_${userId}`);
    const currentPrefs = prefsStr ? JSON.parse(prefsStr) : { ...defaultPreferences, userId };
    
    const updatedPreferences = {
      ...currentPrefs,
      theme,
      updatedAt: new Date(),
    };
    
    await AsyncStorage.setItem(`preferences_${userId}`, JSON.stringify(updatedPreferences));
    
    return updatedPreferences;
  }
);

export const updateLanguage = createAsyncThunk(
  'preferences/updateLanguage',
  async ({ userId, language }: { userId: string; language: Language }) => {
    const prefsStr = await AsyncStorage.getItem(`preferences_${userId}`);
    const currentPrefs = prefsStr ? JSON.parse(prefsStr) : { ...defaultPreferences, userId };
    
    const updatedPreferences = {
      ...currentPrefs,
      language,
      updatedAt: new Date(),
    };
    
    await AsyncStorage.setItem(`preferences_${userId}`, JSON.stringify(updatedPreferences));
    
    return updatedPreferences;
  }
);

export const updateNotificationSettings = createAsyncThunk(
  'preferences/updateNotifications',
  async ({ 
    userId, 
    notifications 
  }: { 
    userId: string; 
    notifications: Partial<NotificationSettings> 
  }) => {
    const prefsStr = await AsyncStorage.getItem(`preferences_${userId}`);
    const currentPrefs = prefsStr ? JSON.parse(prefsStr) : { ...defaultPreferences, userId };
    
    const updatedPreferences = {
      ...currentPrefs,
      notifications: {
        ...currentPrefs.notifications,
        ...notifications,
      },
      updatedAt: new Date(),
    };
    
    await AsyncStorage.setItem(`preferences_${userId}`, JSON.stringify(updatedPreferences));
    
    return updatedPreferences;
  }
);

export const resetPreferences = createAsyncThunk(
  'preferences/reset',
  async ({ userId }: { userId: string }) => {
    const resetPrefs = { ...defaultPreferences, userId, updatedAt: new Date() };
    
    // Save reset preferences locally
    await AsyncStorage.setItem(`preferences_${userId}`, JSON.stringify(resetPrefs));
    
    try {
      // Try to save to Firestore
      await FirestoreService.updateUserPreferences(userId, resetPrefs);
    } catch (error) {
      // If Firestore fails, local storage will be synced later
    }
    
    return resetPrefs;
  }
);

export const exportPreferences = createAsyncThunk(
  'preferences/export',
  async ({ userId }: { userId: string }) => {
    const prefsStr = await AsyncStorage.getItem(`preferences_${userId}`);
    const preferences = prefsStr ? JSON.parse(prefsStr) : null;
    
    if (!preferences) {
      throw new Error('No preferences found to export');
    }
    
    return preferences;
  }
);

export const importPreferences = createAsyncThunk(
  'preferences/import',
  async ({ 
    userId, 
    importedPrefs 
  }: { 
    userId: string; 
    importedPrefs: Partial<UserPreferences> 
  }) => {
    const currentPrefsStr = await AsyncStorage.getItem(`preferences_${userId}`);
    const currentPrefs = currentPrefsStr ? JSON.parse(currentPrefsStr) : { ...defaultPreferences, userId };
    
    const mergedPreferences = {
      ...currentPrefs,
      ...importedPrefs,
      userId, // Ensure correct user ID
      updatedAt: new Date(),
    };
    
    // Save merged preferences
    await AsyncStorage.setItem(`preferences_${userId}`, JSON.stringify(mergedPreferences));
    
    try {
      await FirestoreService.updateUserPreferences(userId, mergedPreferences);
    } catch (error) {
      // Local storage is updated, Firestore will sync later
    }
    
    return mergedPreferences;
  }
);

// Main slice
const preferencesSlice = createSlice({
  name: 'preferences',
  initialState,
  reducers: {
    setPreferences: (state, action: PayloadAction<UserPreferences>) => {
      state.preferences = action.payload;
      state.hasUnsavedChanges = false;
    },
    
    updatePreferencesLocal: (state, action: PayloadAction<Partial<UserPreferences>>) => {
      if (state.preferences) {
        state.preferences = {
          ...state.preferences,
          ...action.payload,
          updatedAt: new Date(),
        };
        state.hasUnsavedChanges = true;
      }
    },
    
    setTheme: (state, action: PayloadAction<ThemeMode>) => {
      if (state.preferences) {
        state.preferences.theme = action.payload;
        state.preferences.updatedAt = new Date();
        state.hasUnsavedChanges = true;
      }
    },
    
    setLanguage: (state, action: PayloadAction<Language>) => {
      if (state.preferences) {
        state.preferences.language = action.payload;
        state.preferences.updatedAt = new Date();
        state.hasUnsavedChanges = true;
      }
    },
    
    setUnits: (state, action: PayloadAction<Units>) => {
      if (state.preferences) {
        state.preferences.units = action.payload;
        state.preferences.updatedAt = new Date();
        state.hasUnsavedChanges = true;
      }
    },
    
    toggleNotification: (state, action: PayloadAction<keyof NotificationSettings>) => {
      if (state.preferences) {
        const key = action.payload;
        state.preferences.notifications[key] = !state.preferences.notifications[key];
        state.preferences.updatedAt = new Date();
        state.hasUnsavedChanges = true;
      }
    },
    
    updateFeatureSetting: (state, action: PayloadAction<{ key: keyof UserPreferences['features']; value: boolean }>) => {
      if (state.preferences) {
        const { key, value } = action.payload;
        state.preferences.features[key] = value;
        state.preferences.updatedAt = new Date();
        state.hasUnsavedChanges = true;
      }
    },
    
    updateUISetting: (state, action: PayloadAction<{ key: keyof UserPreferences['ui']; value: boolean }>) => {
      if (state.preferences) {
        const { key, value } = action.payload;
        state.preferences.ui[key] = value;
        state.preferences.updatedAt = new Date();
        state.hasUnsavedChanges = true;
      }
    },
    
    clearError: (state) => {
      state.error = null;
    },
    
    markSaved: (state) => {
      state.hasUnsavedChanges = false;
    },
  },
  
  extraReducers: (builder) => {
    // Load preferences
    builder
      .addCase(loadPreferences.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadPreferences.fulfilled, (state, action) => {
        state.isLoading = false;
        state.preferences = action.payload;
        state.hasUnsavedChanges = false;
        state.lastSync = new Date();
      })
      .addCase(loadPreferences.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to load preferences';
        // Set default preferences if loading fails
        state.preferences = defaultPreferences;
      });
    
    // Save preferences
    builder
      .addCase(savePreferences.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(savePreferences.fulfilled, (state, action) => {
        state.isLoading = false;
        state.preferences = action.payload;
        state.hasUnsavedChanges = false;
        state.lastSync = new Date();
      })
      .addCase(savePreferences.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to save preferences';
      });
    
    // Update theme
    builder
      .addCase(updateTheme.fulfilled, (state, action) => {
        state.preferences = action.payload;
        state.hasUnsavedChanges = true;
      });
    
    // Update language
    builder
      .addCase(updateLanguage.fulfilled, (state, action) => {
        state.preferences = action.payload;
        state.hasUnsavedChanges = true;
      });
    
    // Update notification settings
    builder
      .addCase(updateNotificationSettings.fulfilled, (state, action) => {
        state.preferences = action.payload;
        state.hasUnsavedChanges = true;
      });
    
    // Reset preferences
    builder
      .addCase(resetPreferences.fulfilled, (state, action) => {
        state.preferences = action.payload;
        state.hasUnsavedChanges = false;
      });
    
    // Import preferences
    builder
      .addCase(importPreferences.fulfilled, (state, action) => {
        state.preferences = action.payload;
        state.hasUnsavedChanges = false;
      });
  },
});

export const {
  setPreferences,
  updatePreferencesLocal,
  setTheme,
  setLanguage,
  setUnits,
  toggleNotification,
  updateFeatureSetting,
  updateUISetting,
  clearError,
  markSaved,
} = preferencesSlice.actions;

export default preferencesSlice.reducer;
