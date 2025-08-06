import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Recipe, RecipeFilter, RecipeDifficulty } from '../../types/models';
import { FirestoreService } from '../../services/firebase/firestore';
import { CloudFunctionsService } from '../../services/firebase/functions';
import { RootState } from '../store';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface RecipesState {
  recipes: Recipe[];
  favorites: string[];
  recentlyViewed: string[];
  currentRecipe: Recipe | null;
  searchResults: Recipe[];
  generatedRecipes: Recipe[];
  isLoading: boolean;
  isGenerating: boolean;
  error: string | null;
  filter: RecipeFilter;
  lastSync: Date | null;
}

const initialState: RecipesState = {
  recipes: [],
  favorites: [],
  recentlyViewed: [],
  currentRecipe: null,
  searchResults: [],
  generatedRecipes: [],
  isLoading: false,
  isGenerating: false,
  error: null,
  filter: {
    difficulty: null,
    maxTime: null,
    diet: [],
    cuisine: null,
    ingredients: [],
  },
  lastSync: null,
};

// Async Thunks
export const fetchRecipes = createAsyncThunk(
  'recipes/fetch',
  async (filters?: Partial<RecipeFilter>, { getState }) => {
    const state = getState() as RootState;
    const userId = state.auth.user?.id;
    
    if (!userId) throw new Error('User not authenticated');
    
    try {
      const recipes = await FirestoreService.getRecipes(filters);
      await AsyncStorage.setItem('recipes_cache', JSON.stringify(recipes));
      return recipes;
    } catch (error) {
      // Fallback to cached data
      const cached = await AsyncStorage.getItem('recipes_cache');
      if (cached) {
        return JSON.parse(cached);
      }
      throw error;
    }
  }
);

export const fetchRecipeById = createAsyncThunk(
  'recipes/fetchById',
  async (recipeId: string) => {
    const recipe = await FirestoreService.getRecipe(recipeId);
    return recipe;
  }
);

export const createRecipe = createAsyncThunk(
  'recipes/create',
  async (recipeData: Omit<Recipe, 'id'>, { getState }) => {
    const state = getState() as RootState;
    const userId = state.auth.user?.id;
    
    if (!userId) throw new Error('User not authenticated');
    
    const recipe = await FirestoreService.addRecipe({
      ...recipeData,
      authorId: userId,
    });
    return recipe;
  }
);

export const updateRecipe = createAsyncThunk(
  'recipes/update',
  async ({ id, updates }: { id: string; updates: Partial<Recipe> }) => {
    await FirestoreService.updateRecipe(id, updates);
    return { id, updates };
  }
);

export const deleteRecipe = createAsyncThunk(
  'recipes/delete',
  async (recipeId: string) => {
    await FirestoreService.deleteRecipe(recipeId);
    return recipeId;
  }
);

export const generateRecipesFromProducts = createAsyncThunk(
  'recipes/generateFromProducts',
  async (
    { products, preferences }: { 
      products: string[]; 
      preferences?: any 
    },
    { getState }
  ) => {
    const state = getState() as RootState;
    const userId = state.auth.user?.id;
    
    if (!userId) throw new Error('User not authenticated');
    
    const result = await CloudFunctionsService.generateRecipes(products, preferences);
    return result.recipes;
  }
);

export const searchRecipes = createAsyncThunk(
  'recipes/search',
  async (query: string) => {
    // Implementation would depend on your search strategy
    // For now, we'll do a simple local search
    const cached = await AsyncStorage.getItem('recipes_cache');
    const allRecipes = cached ? JSON.parse(cached) : [];
    
    const filtered = allRecipes.filter((recipe: Recipe) =>
      recipe.name.toLowerCase().includes(query.toLowerCase()) ||
      recipe.description?.toLowerCase().includes(query.toLowerCase()) ||
      recipe.ingredients.some(ingredient => 
        ingredient.name.toLowerCase().includes(query.toLowerCase())
      )
    );
    
    return filtered;
  }
);

export const addToFavorites = createAsyncThunk(
  'recipes/addToFavorites',
  async (recipeId: string, { getState }) => {
    const state = getState() as RootState;
    const userId = state.auth.user?.id;
    
    if (!userId) throw new Error('User not authenticated');
    
    // Update user preferences in Firestore
    const currentFavorites = state.recipes.favorites;
    const updatedFavorites = [...currentFavorites, recipeId];
    
    await FirestoreService.updateUserPreferences(userId, {
      favoriteRecipes: updatedFavorites,
    });
    
    return recipeId;
  }
);

export const removeFromFavorites = createAsyncThunk(
  'recipes/removeFromFavorites',
  async (recipeId: string, { getState }) => {
    const state = getState() as RootState;
    const userId = state.auth.user?.id;
    
    if (!userId) throw new Error('User not authenticated');
    
    const currentFavorites = state.recipes.favorites;
    const updatedFavorites = currentFavorites.filter(id => id !== recipeId);
    
    await FirestoreService.updateUserPreferences(userId, {
      favoriteRecipes: updatedFavorites,
    });
    
    return recipeId;
  }
);

export const rateRecipe = createAsyncThunk(
  'recipes/rate',
  async ({ recipeId, rating }: { recipeId: string; rating: number }) => {
    // Update recipe rating
    const recipe = await FirestoreService.getRecipe(recipeId);
    const currentRatings = recipe.ratings || [];
    const updatedRatings = [...currentRatings, rating];
    const averageRating = updatedRatings.reduce((sum, r) => sum + r, 0) / updatedRatings.length;
    
    await FirestoreService.updateRecipe(recipeId, {
      ratings: updatedRatings,
      averageRating,
    });
    
    return { recipeId, rating, averageRating };
  }
);

// Main slice
const recipesSlice = createSlice({
  name: 'recipes',
  initialState,
  reducers: {
    setCurrentRecipe: (state, action: PayloadAction<Recipe | null>) => {
      state.currentRecipe = action.payload;
      
      // Add to recently viewed if it's a new recipe
      if (action.payload && !state.recentlyViewed.includes(action.payload.id)) {
        state.recentlyViewed = [action.payload.id, ...state.recentlyViewed.slice(0, 9)];
      }
    },
    
    updateFilter: (state, action: PayloadAction<Partial<RecipeFilter>>) => {
      state.filter = { ...state.filter, ...action.payload };
    },
    
    clearFilter: (state) => {
      state.filter = initialState.filter;
    },
    
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
    
    clearGeneratedRecipes: (state) => {
      state.generatedRecipes = [];
    },
    
    clearError: (state) => {
      state.error = null;
    },
    
    addRecentlyViewed: (state, action: PayloadAction<string>) => {
      const recipeId = action.payload;
      if (!state.recentlyViewed.includes(recipeId)) {
        state.recentlyViewed = [recipeId, ...state.recentlyViewed.slice(0, 9)];
      }
    },
    
    clearRecentlyViewed: (state) => {
      state.recentlyViewed = [];
    },
    
    // Optimistic updates for better UX
    addRecipeOptimistic: (state, action: PayloadAction<Recipe>) => {
      state.recipes.unshift(action.payload);
    },
    
    updateRecipeOptimistic: (state, action: PayloadAction<{ id: string; updates: Partial<Recipe> }>) => {
      const { id, updates } = action.payload;
      const index = state.recipes.findIndex(recipe => recipe.id === id);
      if (index !== -1) {
        state.recipes[index] = { ...state.recipes[index], ...updates };
      }
    },
    
    removeRecipeOptimistic: (state, action: PayloadAction<string>) => {
      state.recipes = state.recipes.filter(recipe => recipe.id !== action.payload);
    },
  },
  
  extraReducers: (builder) => {
    // Fetch recipes
    builder
      .addCase(fetchRecipes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRecipes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.recipes = action.payload;
        state.lastSync = new Date();
      })
      .addCase(fetchRecipes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch recipes';
      });
    
    // Fetch recipe by ID
    builder
      .addCase(fetchRecipeById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRecipeById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentRecipe = action.payload;
        
        // Update recipe in list if it exists
        const index = state.recipes.findIndex(recipe => recipe.id === action.payload.id);
        if (index !== -1) {
          state.recipes[index] = action.payload;
        } else {
          state.recipes.push(action.payload);
        }
      })
      .addCase(fetchRecipeById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch recipe';
      });
    
    // Create recipe
    builder
      .addCase(createRecipe.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createRecipe.fulfilled, (state, action) => {
        state.isLoading = false;
        state.recipes.unshift(action.payload);
      })
      .addCase(createRecipe.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to create recipe';
      });
    
    // Update recipe
    builder
      .addCase(updateRecipe.fulfilled, (state, action) => {
        const { id, updates } = action.payload;
        const index = state.recipes.findIndex(recipe => recipe.id === id);
        if (index !== -1) {
          state.recipes[index] = { ...state.recipes[index], ...updates };
        }
        
        if (state.currentRecipe?.id === id) {
          state.currentRecipe = { ...state.currentRecipe, ...updates };
        }
      })
      .addCase(updateRecipe.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to update recipe';
      });
    
    // Delete recipe
    builder
      .addCase(deleteRecipe.fulfilled, (state, action) => {
        const recipeId = action.payload;
        state.recipes = state.recipes.filter(recipe => recipe.id !== recipeId);
        state.favorites = state.favorites.filter(id => id !== recipeId);
        state.recentlyViewed = state.recentlyViewed.filter(id => id !== recipeId);
        
        if (state.currentRecipe?.id === recipeId) {
          state.currentRecipe = null;
        }
      })
      .addCase(deleteRecipe.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to delete recipe';
      });
    
    // Generate recipes
    builder
      .addCase(generateRecipesFromProducts.pending, (state) => {
        state.isGenerating = true;
        state.error = null;
      })
      .addCase(generateRecipesFromProducts.fulfilled, (state, action) => {
        state.isGenerating = false;
        state.generatedRecipes = action.payload;
      })
      .addCase(generateRecipesFromProducts.rejected, (state, action) => {
        state.isGenerating = false;
        state.error = action.error.message || 'Failed to generate recipes';
      });
    
    // Search recipes
    builder
      .addCase(searchRecipes.fulfilled, (state, action) => {
        state.searchResults = action.payload;
      })
      .addCase(searchRecipes.rejected, (state, action) => {
        state.error = action.error.message || 'Search failed';
      });
    
    // Favorites
    builder
      .addCase(addToFavorites.fulfilled, (state, action) => {
        if (!state.favorites.includes(action.payload)) {
          state.favorites.push(action.payload);
        }
      })
      .addCase(removeFromFavorites.fulfilled, (state, action) => {
        state.favorites = state.favorites.filter(id => id !== action.payload);
      });
    
    // Rating
    builder
      .addCase(rateRecipe.fulfilled, (state, action) => {
        const { recipeId, averageRating } = action.payload;
        const index = state.recipes.findIndex(recipe => recipe.id === recipeId);
        if (index !== -1) {
          state.recipes[index].averageRating = averageRating;
        }
        
        if (state.currentRecipe?.id === recipeId) {
          state.currentRecipe.averageRating = averageRating;
        }
      });
  },
});

export const {
  setCurrentRecipe,
  updateFilter,
  clearFilter,
  clearSearchResults,
  clearGeneratedRecipes,
  clearError,
  addRecentlyViewed,
  clearRecentlyViewed,
  addRecipeOptimistic,
  updateRecipeOptimistic,
  removeRecipeOptimistic,
} = recipesSlice.actions;

export default recipesSlice.reducer;
