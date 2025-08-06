import functions from '@react-native-firebase/functions';
import { defaultRegion } from './firebaseConfig';

// Initialize Cloud Functions with region
const cloudFunctions = functions(defaultRegion);

// Types for Cloud Function responses
export interface RecipeGenerationResult {
  recipes: {
    id: string;
    name: string;
    ingredients: string[];
    instructions: string[];
    cookingTime: number;
    difficulty: 'easy' | 'medium' | 'hard';
    nutrition: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    };
  }[];
  suggestions: string[];
}

export interface BarcodeResult {
  product: {
    name: string;
    brand: string;
    category: string;
    nutrition: any;
    imageUrl?: string;
  } | null;
  found: boolean;
}

export interface ReceiptProcessingResult {
  products: {
    name: string;
    quantity: number;
    price: number;
    category: string;
  }[];
  total: number;
  confidence: number;
}

export interface FamilyInviteResult {
  inviteId: string;
  inviteCode: string;
  expiresAt: Date;
}

export interface EcoStatsResult {
  wasteReduced: number;
  co2Saved: number;
  moneySaved: number;
  rank: number;
  achievements: string[];
}

export interface WeeklyReportResult {
  productsSaved: number;
  recipesCooked: number;
  ecoImpact: EcoStatsResult;
  recommendations: string[];
  trends: {
    wasteReduction: number;
    cookingFrequency: number;
    shoppingEfficiency: number;
  };
}

// Cloud Functions Service
export class CloudFunctionsService {
  
  // Generate AI recipes based on available products
  static async generateRecipes(
    availableProducts: string[],
    preferences?: {
      cuisine?: string;
      dietaryRestrictions?: string[];
      cookingTime?: number;
      difficulty?: 'easy' | 'medium' | 'hard';
    }
  ): Promise<RecipeGenerationResult> {
    try {
      const generateRecipes = cloudFunctions.httpsCallable('generateRecipes');
      const result = await generateRecipes({
        availableProducts,
        preferences: preferences || {},
      });
      return result.data as RecipeGenerationResult;
    } catch (error) {
      console.error('Recipe generation error:', error);
      throw new Error('Nie udało się wygenerować przepisów. Spróbuj ponownie.');
    }
  }

  // Scan barcode and get product information
  static async scanBarcode(barcode: string): Promise<BarcodeResult> {
    try {
      const scanBarcode = cloudFunctions.httpsCallable('scanBarcode');
      const result = await scanBarcode({ barcode });
      return result.data as BarcodeResult;
    } catch (error) {
      console.error('Barcode scanning error:', error);
      throw new Error('Nie udało się zeskanować kodu kreskowego.');
    }
  }

  // Process receipt image and extract products
  static async processReceipt(imageBase64: string): Promise<ReceiptProcessingResult> {
    try {
      const processReceipt = cloudFunctions.httpsCallable('processReceipt');
      const result = await processReceipt({ 
        image: imageBase64,
        options: {
          language: 'pl',
          currency: 'PLN',
        }
      });
      return result.data as ReceiptProcessingResult;
    } catch (error) {
      console.error('Receipt processing error:', error);
      throw new Error('Nie udało się przetworzyć paragonu.');
    }
  }

  // Send family invitation
  static async sendFamilyInvite(
    familyId: string,
    inviteeEmail: string,
    inviterName: string,
    role: 'member' | 'admin' = 'member'
  ): Promise<FamilyInviteResult> {
    try {
      const sendFamilyInvite = cloudFunctions.httpsCallable('sendFamilyInvite');
      const result = await sendFamilyInvite({
        familyId,
        inviteeEmail,
        inviterName,
        role,
      });
      return result.data as FamilyInviteResult;
    } catch (error) {
      console.error('Family invite error:', error);
      throw new Error('Nie udało się wysłać zaproszenia do rodziny.');
    }
  }

  // Join family with invite code
  static async joinFamily(
    inviteCode: string,
    userId: string,
    userName: string
  ): Promise<{ familyId: string; success: boolean }> {
    try {
      const joinFamily = cloudFunctions.httpsCallable('joinFamily');
      const result = await joinFamily({
        inviteCode,
        userId,
        userName,
      });
      return result.data;
    } catch (error) {
      console.error('Join family error:', error);
      throw new Error('Nie udało się dołączyć do rodziny. Sprawdź kod zaproszenia.');
    }
  }

  // Calculate ecological statistics
  static async calculateEcoStats(
    userId: string,
    familyId?: string,
    timeRange: 'week' | 'month' | 'year' = 'month'
  ): Promise<EcoStatsResult> {
    try {
      const calculateEcoStats = cloudFunctions.httpsCallable('calculateEcoStats');
      const result = await calculateEcoStats({
        userId,
        familyId,
        timeRange,
      });
      return result.data as EcoStatsResult;
    } catch (error) {
      console.error('Eco stats calculation error:', error);
      throw new Error('Nie udało się obliczyć statystyk ekologicznych.');
    }
  }

  // Generate weekly report
  static async generateWeeklyReport(
    userId: string,
    familyId?: string
  ): Promise<WeeklyReportResult> {
    try {
      const generateWeeklyReport = cloudFunctions.httpsCallable('generateWeeklyReport');
      const result = await generateWeeklyReport({
        userId,
        familyId,
      });
      return result.data as WeeklyReportResult;
    } catch (error) {
      console.error('Weekly report generation error:', error);
      throw new Error('Nie udało się wygenerować raportu tygodniowego.');
    }
  }

  // Check and unlock achievements
  static async checkAchievements(
    userId: string,
    familyId?: string
  ): Promise<{ newAchievements: string[]; totalPoints: number }> {
    try {
      const checkAchievements = cloudFunctions.httpsCallable('checkAchievements');
      const result = await checkAchievements({
        userId,
        familyId,
      });
      return result.data;
    } catch (error) {
      console.error('Achievement check error:', error);
      throw new Error('Nie udało się sprawdzić osiągnięć.');
    }
  }

  // Analyze shopping patterns and suggest optimizations
  static async analyzeShoppingPatterns(
    userId: string,
    familyId?: string,
    timeRange: 'month' | 'quarter' | 'year' = 'month'
  ): Promise<{
    patterns: {
      frequentProducts: string[];
      seasonalTrends: any[];
      wastePatterns: any[];
    };
    recommendations: string[];
    potentialSavings: number;
  }> {
    try {
      const analyzePatterns = cloudFunctions.httpsCallable('analyzeShoppingPatterns');
      const result = await analyzePatterns({
        userId,
        familyId,
        timeRange,
      });
      return result.data;
    } catch (error) {
      console.error('Shopping pattern analysis error:', error);
      throw new Error('Nie udało się przeanalizować wzorców zakupowych.');
    }
  }

  // Smart recipe recommendations based on preferences and history
  static async getSmartRecommendations(
    userId: string,
    context: {
      timeOfDay?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
      availableTime?: number; // minutes
      mood?: 'quick' | 'comfort' | 'healthy' | 'experimental';
      weather?: 'hot' | 'cold' | 'rainy' | 'sunny';
    }
  ): Promise<{
    recipes: any[];
    products: string[];
    reasoning: string;
  }> {
    try {
      const getRecommendations = cloudFunctions.httpsCallable('getSmartRecommendations');
      const result = await getRecommendations({
        userId,
        context,
      });
      return result.data;
    } catch (error) {
      console.error('Smart recommendations error:', error);
      throw new Error('Nie udało się pobrać inteligentnych rekomendacji.');
    }
  }

  // Optimize shopping list order based on store layout
  static async optimizeShoppingRoute(
    shoppingListId: string,
    storeId?: string,
    storeLayout?: any
  ): Promise<{
    optimizedList: any[];
    estimatedTime: number;
    route: string[];
  }> {
    try {
      const optimizeRoute = cloudFunctions.httpsCallable('optimizeShoppingRoute');
      const result = await optimizeRoute({
        shoppingListId,
        storeId,
        storeLayout,
      });
      return result.data;
    } catch (error) {
      console.error('Shopping route optimization error:', error);
      throw new Error('Nie udało się zoptymalizować trasy zakupowej.');
    }
  }
}
