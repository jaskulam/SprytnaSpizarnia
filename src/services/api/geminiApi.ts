import { Recipe, RecipeIngredient } from '../../types/models';
import { cloudFunctions } from '../firebase/config';

interface GeminiRecipeRequest {
  ingredients: string[];
  preferences?: {
    diet?: string[];
    allergies?: string[];
    maxTime?: number;
    difficulty?: string;
    cuisine?: string;
    servings?: number;
  };
  language?: string;
}

interface GeminiRecipeResponse {
  recipes: Array<{
    name: string;
    description: string;
    ingredients: Array<{
      name: string;
      quantity: number;
      unit: string;
    }>;
    instructions: string[];
    prepTime: number;
    cookTime: number;
    servings: number;
    difficulty: 'easy' | 'medium' | 'hard';
    cuisine: string;
    diet: string[];
    tags: string[];
  }>;
}

export class GeminiApiService {
  static async generateRecipes(request: GeminiRecipeRequest): Promise<Recipe[]> {
    try {
      const response = await cloudFunctions.generateRecipes(request);
      const data = response.data as GeminiRecipeResponse;

      return data.recipes.map((recipe, index) => ({
        id: `ai_${Date.now()}_${index}`,
        name: recipe.name,
        ingredients: recipe.ingredients.map(ing => ({
          name: ing.name,
          quantity: ing.quantity,
          unit: ing.unit as any,
        })),
        instructions: recipe.instructions,
        prepTime: recipe.prepTime,
        cookTime: recipe.cookTime,
        servings: recipe.servings,
        difficulty: recipe.difficulty,
        cuisine: recipe.cuisine,
        diet: recipe.diet as any[],
        tags: recipe.tags,
        source: 'ai',
        rating: 0,
        ratingCount: 0,
      }));
    } catch (error) {
      console.error('Error generating recipes with Gemini:', error);
      throw new Error('Nie udało się wygenerować przepisów. Spróbuj ponownie.');
    }
  }

  static async generateQuickRecipe(ingredients: string[]): Promise<Recipe> {
    try {
      const response = await cloudFunctions.generateRecipes({
        ingredients,
        preferences: {
          maxTime: 15,
          difficulty: 'easy',
        },
        language: 'pl',
      });

      const data = response.data as GeminiRecipeResponse;
      
      if (data.recipes.length === 0) {
        throw new Error('Nie znaleziono szybkiego przepisu');
      }

      const recipe = data.recipes[0];
      return {
        id: `quick_${Date.now()}`,
        name: recipe.name,
        ingredients: recipe.ingredients.map(ing => ({
          name: ing.name,
          quantity: ing.quantity,
          unit: ing.unit as any,
        })),
        instructions: recipe.instructions,
        prepTime: recipe.prepTime,
        cookTime: recipe.cookTime,
        servings: recipe.servings,
        difficulty: 'easy',
        cuisine: recipe.cuisine,
        diet: recipe.diet as any[],
        tags: ['szybkie', ...recipe.tags],
        source: 'quick',
        rating: 0,
        ratingCount: 0,
      };
    } catch (error) {
      console.error('Error generating quick recipe:', error);
      throw new Error('Nie udało się wygenerować szybkiego przepisu');
    }
  }

  static async getRecipeSuggestions(
    availableIngredients: string[],
    missingIngredients: string[]
  ): Promise<string[]> {
    try {
      // Zwraca sugestie składników, które warto dokupić
      const suggestions = missingIngredients.filter(ingredient => {
        // Logika określająca priorytet składników
        return true;
      }).slice(0, 3);

      return suggestions;
    } catch (error) {
      console.error('Error getting recipe suggestions:', error);
      return [];
    }
  }

  static async analyzeNutritionalValue(recipe: Recipe): Promise<{
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  }> {
    // Symulacja analizy wartości odżywczych
    return {
      calories: Math.floor(Math.random() * 500) + 200,
      protein: Math.floor(Math.random() * 30) + 10,
      carbs: Math.floor(Math.random() * 60) + 20,
      fat: Math.floor(Math.random() * 20) + 5,
      fiber: Math.floor(Math.random() * 10) + 2,
    };
  }
}
