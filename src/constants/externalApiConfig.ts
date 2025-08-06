// External API Configuration for Food and Recipe Services

// Open Food Facts API Configuration
export const OPEN_FOOD_FACTS_CONFIG = {
  baseUrl: 'https://world.openfoodfacts.org/api/v0',
  endpoints: {
    productByBarcode: (barcode: string) => `/product/${barcode}.json`,
    productSearch: '/cgi/search.pl',
    productCategories: '/categories.json',
    productBrands: '/brands.json',
  },
  defaultParams: {
    json: 1,
    fields: 'code,product_name,brands,categories,image_url,image_front_url,nutrition_grades,nutriments,ingredients_text,allergens',
  },
  timeout: 10000,
  retryAttempts: 3,
  rateLimit: {
    requestsPerSecond: 10,
    burstLimit: 50,
  },
} as const;

// Spoonacular API Configuration  
export const SPOONACULAR_CONFIG = {
  baseUrl: 'https://api.spoonacular.com',
  apiKey: process.env.SPOONACULAR_API_KEY || '',
  endpoints: {
    recipeSearch: '/recipes/complexSearch',
    recipeInformation: (id: number) => `/recipes/${id}/information`,
    randomRecipes: '/recipes/random',
    ingredientSubstitutes: '/food/ingredients/substitutes',
    mealPlan: '/mealplanner/generate',
    nutritionAnalysis: '/recipes/analyze',
    recipesByIngredients: '/recipes/findByIngredients',
    similarRecipes: (id: number) => `/recipes/${id}/similar`,
    recipeInstructions: (id: number) => `/recipes/${id}/analyzedInstructions`,
  },
  defaultParams: {
    apiKey: process.env.SPOONACULAR_API_KEY || '',
    includeNutrition: true,
    addRecipeInformation: true,
    instructionsRequired: true,
  },
  timeout: 15000,
  retryAttempts: 2,
  rateLimit: {
    requestsPerDay: 150, // Free tier limit
    requestsPerMonth: 10000,
  },
  features: {
    recipeGeneration: true,
    nutritionAnalysis: true,
    mealPlanning: true,
    ingredientSubstitution: true,
  },
} as const;

// Nutritionix API Configuration
export const NUTRITIONIX_CONFIG = {
  baseUrl: 'https://trackapi.nutritionix.com/v2',
  appId: process.env.NUTRITIONIX_APP_ID || '',
  apiKey: process.env.NUTRITIONIX_API_KEY || '',
  endpoints: {
    naturalNutrients: '/natural/nutrients',
    naturalExercise: '/natural/exercise',
    search: '/search/instant',
    item: '/search/item',
    branded: '/search/branded',
  },
  headers: {
    'x-app-id': process.env.NUTRITIONIX_APP_ID || '',
    'x-app-key': process.env.NUTRITIONIX_API_KEY || '',
    'Content-Type': 'application/json',
  },
  timeout: 10000,
  retryAttempts: 2,
  rateLimit: {
    requestsPerDay: 5000, // Free tier limit
  },
} as const;

// Edamam Recipe API Configuration
export const EDAMAM_CONFIG = {
  baseUrl: 'https://api.edamam.com/api/recipes/v2',
  appId: process.env.EDAMAM_APP_ID || '',
  apiKey: process.env.EDAMAM_API_KEY || '',
  endpoints: {
    search: '/search',
    recipeById: (id: string) => `/${id}`,
  },
  defaultParams: {
    type: 'public',
    app_id: process.env.EDAMAM_APP_ID || '',
    app_key: process.env.EDAMAM_API_KEY || '',
  },
  timeout: 12000,
  retryAttempts: 2,
  rateLimit: {
    requestsPerMinute: 10, // Free tier limit
    requestsPerMonth: 10000,
  },
} as const;

// Google Vision API Configuration (for receipt scanning)
export const GOOGLE_VISION_CONFIG = {
  baseUrl: 'https://vision.googleapis.com/v1',
  apiKey: process.env.GOOGLE_VISION_API_KEY || '',
  endpoints: {
    textDetection: '/images:annotate',
    documentTextDetection: '/images:annotate',
  },
  features: [
    {
      type: 'DOCUMENT_TEXT_DETECTION',
      maxResults: 50,
    },
  ],
  timeout: 30000,
  retryAttempts: 2,
  rateLimit: {
    requestsPerMonth: 1000, // Free tier limit
  },
} as const;

// OpenAI API Configuration (for AI recipe generation)
export const OPENAI_CONFIG = {
  baseUrl: 'https://api.openai.com/v1',
  apiKey: process.env.OPENAI_API_KEY || '',
  endpoints: {
    completions: '/completions',
    chatCompletions: '/chat/completions',
    embeddings: '/embeddings',
  },
  models: {
    textGeneration: 'gpt-3.5-turbo',
    embedding: 'text-embedding-ada-002',
  },
  defaultParams: {
    temperature: 0.7,
    max_tokens: 1000,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  },
  timeout: 60000,
  retryAttempts: 2,
  rateLimit: {
    requestsPerMinute: 20,
    tokensPerMinute: 40000,
  },
} as const;

// Weather API Configuration (for seasonal recipes)
export const WEATHER_CONFIG = {
  baseUrl: 'https://api.openweathermap.org/data/2.5',
  apiKey: process.env.OPENWEATHER_API_KEY || '',
  endpoints: {
    currentWeather: '/weather',
    forecast: '/forecast',
  },
  defaultParams: {
    appid: process.env.OPENWEATHER_API_KEY || '',
    units: 'metric',
    lang: 'pl',
  },
  timeout: 8000,
  retryAttempts: 3,
} as const;

// Firebase Cloud Functions Configuration
export const FIREBASE_FUNCTIONS_CONFIG = {
  region: 'europe-west1',
  endpoints: {
    generateRecipe: 'generateRecipe',
    analyzeReceipt: 'analyzeReceipt',
    processProductImage: 'processProductImage',
    sendNotification: 'sendNotification',
    syncFamilyData: 'syncFamilyData',
  },
  timeout: 30000,
  retryAttempts: 2,
} as const;

// API Response Caching Configuration
export const API_CACHE_CONFIG = {
  // Cache durations in milliseconds
  durations: {
    barcodeLookup: 24 * 60 * 60 * 1000, // 24 hours
    recipeSearch: 60 * 60 * 1000, // 1 hour
    weatherData: 30 * 60 * 1000, // 30 minutes
    nutritionData: 7 * 24 * 60 * 60 * 1000, // 7 days
    productCategories: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
  
  // Cache size limits
  maxCacheSize: 50 * 1024 * 1024, // 50MB
  maxCacheEntries: 1000,
  
  // Cache keys
  keys: {
    barcode: (barcode: string) => `barcode_${barcode}`,
    recipe: (query: string) => `recipe_${query}`,
    weather: (location: string) => `weather_${location}`,
    nutrition: (food: string) => `nutrition_${food}`,
  },
} as const;

// Rate Limiting Configuration
export const RATE_LIMIT_CONFIG = {
  // Request quotas per API
  quotas: {
    openFoodFacts: {
      requestsPerSecond: 10,
      burstLimit: 50,
    },
    spoonacular: {
      requestsPerDay: 150,
      requestsPerMonth: 10000,
    },
    nutritionix: {
      requestsPerDay: 5000,
    },
    openai: {
      requestsPerMinute: 20,
      tokensPerMinute: 40000,
    },
    googleVision: {
      requestsPerMonth: 1000,
    },
  },
  
  // Fallback strategies
  fallbackStrategies: {
    cache: true,
    retry: true,
    degradedService: true,
  },
} as const;

// Error Handling Configuration
export const API_ERROR_CONFIG = {
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
  nonRetryableStatusCodes: [400, 401, 403, 404, 422],
  
  retryDelays: [1000, 2000, 4000], // Exponential backoff
  
  errorMessages: {
    networkError: 'Brak połączenia z internetem',
    timeout: 'Przekroczono limit czasu odpowiedzi',
    rateLimitExceeded: 'Przekroczono limit zapytań',
    apiKeyInvalid: 'Nieprawidłowy klucz API',
    quotaExceeded: 'Przekroczono dzienny limit zapytań',
    serviceUnavailable: 'Usługa tymczasowo niedostępna',
  },
} as const;

// API Feature Flags
export const API_FEATURES = {
  enableBarcodeScanning: true,
  enableReceiptScanning: true,
  enableAIRecipeGeneration: true,
  enableNutritionAnalysis: true,
  enableWeatherBasedRecipes: false,
  enableIngredientSubstitution: true,
  enableMealPlanning: true,
  
  // Premium features
  enableAdvancedNutrition: false,
  enablePersonalizedRecipes: false,
  enableProfessionalRecipes: false,
} as const;

// Development Configuration
export const DEV_CONFIG = {
  enableMockResponses: false,
  enableApiLogging: true,
  enablePerformanceMonitoring: true,
  bypassRateLimit: true,
  
  mockData: {
    enableBarcodeData: true,
    enableRecipeData: true,
    enableNutritionData: true,
  },
} as const;

// Types for external API configurations
export type ExternalApiConfig = 
  | typeof OPEN_FOOD_FACTS_CONFIG
  | typeof SPOONACULAR_CONFIG
  | typeof NUTRITIONIX_CONFIG
  | typeof EDAMAM_CONFIG
  | typeof GOOGLE_VISION_CONFIG
  | typeof OPENAI_CONFIG
  | typeof WEATHER_CONFIG;

export type ApiEndpoint = string | ((param: string | number) => string);
export type ApiFeature = keyof typeof API_FEATURES;
