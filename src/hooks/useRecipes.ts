import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useMemo, useState } from 'react';
import { RootState, AppDispatch } from '../store/store';
import { 
  fetchRecipes,
  addRecipe,
  updateRecipe,
  deleteRecipe,
  generateRecipe,
  toggleFavorite,
  rateRecipe,
  searchRecipes,
  setRecipeFilter
} from '../store/slices/recipesSlice';
import { Recipe, RecipeIngredient, DifficultyLevel, CuisineType, MealType, DietaryRestriction } from '../types/models';

export interface UseRecipesReturn {
  // State
  recipes: Recipe[];
  filteredRecipes: Recipe[];
  favoriteRecipes: Recipe[];
  isLoading: boolean;
  error: string | null;
  searchResults: Recipe[];
  filter: {
    difficulty?: DifficultyLevel;
    cuisine?: CuisineType;
    mealType?: MealType;
    dietaryRestrictions?: DietaryRestriction[];
    maxCookingTime?: number;
    availableIngredients?: boolean;
    search?: string;
  };
  
  // Actions
  loadRecipes: () => Promise<void>;
  addNewRecipe: (recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Recipe>;
  updateExistingRecipe: (id: string, updates: Partial<Recipe>) => Promise<void>;
  removeRecipe: (id: string) => Promise<void>;
  generateAIRecipe: (ingredients: string[], preferences?: any) => Promise<Recipe>;
  searchForRecipes: (query: string, filters?: any) => Promise<Recipe[]>;
  toggleRecipeFavorite: (id: string) => Promise<void>;
  rateRecipeById: (id: string, rating: number, review?: string) => Promise<void>;
  setFilter: (filter: Partial<UseRecipesReturn['filter']>) => void;
  clearFilters: () => void;
  
  // Computed values
  totalRecipes: number;
  recipesWithAvailableIngredients: Recipe[];
  recipesByCuisine: Record<CuisineType, Recipe[]>;
  recipesByDifficulty: Record<DifficultyLevel, Recipe[]>;
  recentlyViewedRecipes: Recipe[];
  popularRecipes: Recipe[];
  quickRecipes: Recipe[];
}

export const useRecipes = (): UseRecipesReturn => {
  const dispatch = useDispatch<AppDispatch>();
  const recipesState = useSelector((state: RootState) => state.recipes);
  const { products } = useSelector((state: RootState) => state.products);
  const { user, familyId } = useSelector((state: RootState) => state.auth);
  const [isProcessing, setIsProcessing] = useState(false);

  // Get available ingredients from products
  const availableIngredients = useMemo(() => 
    products
      .filter(product => !product.isConsumed)
      .map(product => product.name.toLowerCase())
  , [products]);

  // Get filtered recipes
  const filteredRecipes = useMemo(() => {
    let filtered = [...recipesState.recipes];

    if (recipesState.filter.difficulty) {
      filtered = filtered.filter(recipe => recipe.difficulty === recipesState.filter.difficulty);
    }
    
    if (recipesState.filter.cuisine) {
      filtered = filtered.filter(recipe => recipe.cuisine === recipesState.filter.cuisine);
    }
    
    if (recipesState.filter.mealType) {
      filtered = filtered.filter(recipe => recipe.mealType === recipesState.filter.mealType);
    }
    
    if (recipesState.filter.dietaryRestrictions?.length) {
      filtered = filtered.filter(recipe => 
        recipesState.filter.dietaryRestrictions!.every(restriction => 
          recipe.dietaryRestrictions?.includes(restriction)
        )
      );
    }
    
    if (recipesState.filter.maxCookingTime) {
      filtered = filtered.filter(recipe => 
        recipe.cookingTime <= recipesState.filter.maxCookingTime!
      );
    }
    
    if (recipesState.filter.availableIngredients) {
      filtered = filtered.filter(recipe => {
        const requiredIngredients = recipe.ingredients
          .filter(ing => !ing.optional)
          .map(ing => ing.name.toLowerCase());
        
        return requiredIngredients.every(ingredient => 
          availableIngredients.some(available => 
            available.includes(ingredient) || ingredient.includes(available)
          )
        );
      });
    }
    
    if (recipesState.filter.search) {
      const searchTerm = recipesState.filter.search.toLowerCase();
      filtered = filtered.filter(recipe => 
        recipe.title.toLowerCase().includes(searchTerm) ||
        recipe.description?.toLowerCase().includes(searchTerm) ||
        recipe.ingredients.some(ing => ing.name.toLowerCase().includes(searchTerm))
      );
    }

    return filtered;
  }, [recipesState.recipes, recipesState.filter, availableIngredients]);

  // Get favorite recipes
  const favoriteRecipes = useMemo(() => 
    recipesState.recipes.filter(recipe => recipe.isFavorite)
  , [recipesState.recipes]);

  // Computed values
  const recipesWithAvailableIngredients = useMemo(() => 
    recipesState.recipes.filter(recipe => {
      const requiredIngredients = recipe.ingredients
        .filter(ing => !ing.optional)
        .map(ing => ing.name.toLowerCase());
      
      const availableCount = requiredIngredients.filter(ingredient => 
        availableIngredients.some(available => 
          available.includes(ingredient) || ingredient.includes(available)
        )
      ).length;
      
      return availableCount / requiredIngredients.length >= 0.8; // 80% of ingredients available
    })
  , [recipesState.recipes, availableIngredients]);

  const recipesByCuisine = useMemo(() => {
    const cuisines: Record<CuisineType, Recipe[]> = {
      polish: [], italian: [], asian: [], mexican: [], mediterranean: [],
      indian: [], american: [], french: [], other: []
    };

    recipesState.recipes.forEach(recipe => {
      cuisines[recipe.cuisine].push(recipe);
    });

    return cuisines;
  }, [recipesState.recipes]);

  const recipesByDifficulty = useMemo(() => {
    const difficulties: Record<DifficultyLevel, Recipe[]> = {
      easy: [], medium: [], hard: []
    };

    recipesState.recipes.forEach(recipe => {
      difficulties[recipe.difficulty].push(recipe);
    });

    return difficulties;
  }, [recipesState.recipes]);

  const recentlyViewedRecipes = useMemo(() => 
    recipesState.recipes
      .filter(recipe => recipe.lastViewed)
      .sort((a, b) => new Date(b.lastViewed!).getTime() - new Date(a.lastViewed!).getTime())
      .slice(0, 10)
  , [recipesState.recipes]);

  const popularRecipes = useMemo(() => 
    recipesState.recipes
      .filter(recipe => recipe.rating && recipe.ratingCount && recipe.ratingCount > 5)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 20)
  , [recipesState.recipes]);

  const quickRecipes = useMemo(() => 
    recipesState.recipes
      .filter(recipe => recipe.cookingTime <= 30)
      .sort((a, b) => a.cookingTime - b.cookingTime)
  , [recipesState.recipes]);

  // Load recipes
  const loadRecipes = useCallback(async () => {
    try {
      await dispatch(fetchRecipes({ familyId })).unwrap();
    } catch (error) {
      throw error;
    }
  }, [dispatch, familyId]);

  // Add new recipe
  const addNewRecipe = useCallback(async (recipeData: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsProcessing(true);
    try {
      const recipe = await dispatch(addRecipe({
        ...recipeData,
        authorId: user?.uid || '',
        familyId,
      })).unwrap();
      return recipe;
    } catch (error) {
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [dispatch, user?.uid, familyId]);

  // Update existing recipe
  const updateExistingRecipe = useCallback(async (id: string, updates: Partial<Recipe>) => {
    setIsProcessing(true);
    try {
      await dispatch(updateRecipe({ id, updates })).unwrap();
    } catch (error) {
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [dispatch]);

  // Remove recipe
  const removeRecipe = useCallback(async (id: string) => {
    setIsProcessing(true);
    try {
      await dispatch(deleteRecipe({ id })).unwrap();
    } catch (error) {
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [dispatch]);

  // Generate AI recipe
  const generateAIRecipe = useCallback(async (ingredients: string[], preferences?: any) => {
    setIsProcessing(true);
    try {
      const recipe = await dispatch(generateRecipe({ 
        ingredients, 
        preferences,
        familyId 
      })).unwrap();
      return recipe;
    } catch (error) {
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [dispatch, familyId]);

  // Search recipes
  const searchForRecipes = useCallback(async (query: string, filters?: any) => {
    setIsProcessing(true);
    try {
      const results = await dispatch(searchRecipes({ query, filters })).unwrap();
      return results;
    } catch (error) {
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [dispatch]);

  // Toggle favorite
  const toggleRecipeFavorite = useCallback(async (id: string) => {
    try {
      await dispatch(toggleFavorite({ id })).unwrap();
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  // Rate recipe
  const rateRecipeById = useCallback(async (id: string, rating: number, review?: string) => {
    setIsProcessing(true);
    try {
      await dispatch(rateRecipe({ 
        id, 
        rating, 
        review,
        userId: user?.uid || ''
      })).unwrap();
    } catch (error) {
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [dispatch, user?.uid]);

  // Set filter
  const setFilter = useCallback((filter: Partial<UseRecipesReturn['filter']>) => {
    dispatch(setRecipeFilter(filter));
  }, [dispatch]);

  // Clear filters
  const clearFilters = useCallback(() => {
    dispatch(setRecipeFilter({}));
  }, [dispatch]);

  return {
    // State
    recipes: recipesState.recipes,
    filteredRecipes,
    favoriteRecipes,
    isLoading: recipesState.loading || isProcessing,
    error: recipesState.error,
    searchResults: recipesState.searchResults || [],
    filter: recipesState.filter,
    
    // Actions
    loadRecipes,
    addNewRecipe,
    updateExistingRecipe,
    removeRecipe,
    generateAIRecipe,
    searchForRecipes,
    toggleRecipeFavorite,
    rateRecipeById,
    setFilter,
    clearFilters,
    
    // Computed values
    totalRecipes: recipesState.recipes.length,
    recipesWithAvailableIngredients,
    recipesByCuisine,
    recipesByDifficulty,
    recentlyViewedRecipes,
    popularRecipes,
    quickRecipes,
  };
};
