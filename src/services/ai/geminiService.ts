import functions from '@react-native-firebase/functions';
import { Recipe } from '@/types/models';

interface RecipeGenerationParams {
  ingredients: string[];
  preferences?: {
    diet?: 'vegan' | 'vegetarian' | 'gluten-free' | 'keto';
    maxTime?: number;
    cuisine?: string;
  };
  userId: string;
}

class GeminiService {
  // Call Cloud Function that uses Gemini API
  async generateRecipes(params: RecipeGenerationParams): Promise<Recipe[]> {
    try {
      const generateRecipesFunction = functions().httpsCallable('generateRecipes');
      const result = await generateRecipesFunction(params);
      
      return result.data.recipes as Recipe[];
    } catch (error) {
      console.error('Recipe generation error:', error);
      throw new Error('Nie udało się wygenerować przepisów');
    }
  }

  // Generate meal plan
  async generateMealPlan(
    userId: string, 
    days: number, 
    preferences: any
  ): Promise<any> {
    try {
      const generateMealPlanFunction = functions().httpsCallable('generateMealPlan');
      const result = await generateMealPlanFunction({
        userId,
        days,
        preferences,
      });
      
      return result.data;
    } catch (error) {
      console.error('Meal plan generation error:', error);
      throw error;
    }
  }
}

export default new GeminiService();
