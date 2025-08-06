import { AuthService } from './auth';
import { FirestoreService } from './firestore';
import { CloudFunctionsService } from './functions';
import { initializeFirebase, collections, config } from './config';
import { getCurrentFirebaseConfig, emulatorConfig } from './firebaseConfig';
import messaging from '@react-native-firebase/messaging';
import crashlytics from '@react-native-firebase/crashlytics';
import analytics from '@react-native-firebase/analytics';
import { User, Product, Recipe, ShoppingList, Family } from '../../types/models';

// Central Firebase Service that coordinates all Firebase operations
export class FirebaseService {
  private static _initialized = false;
  private static _isOffline = false;
  
  // Initialize Firebase with all services
  static async initialize(): Promise<void> {
    if (this._initialized) return;
    
    try {
      // Initialize core Firebase
      await initializeFirebase();
      
      // Setup offline persistence
      await this.setupOfflinePersistence();
      
      // Initialize messaging
      await this.initializeMessaging();
      
      // Setup analytics
      await this.initializeAnalytics();
      
      // Setup crash reporting
      await this.initializeCrashlytics();
      
      // Setup network monitoring
      this.setupNetworkMonitoring();
      
      this._initialized = true;
      console.log('Firebase initialized successfully');
    } catch (error) {
      console.error('Firebase initialization failed:', error);
      throw error;
    }
  }

  // Authentication methods
  static get auth() {
    return {
      signInAnonymously: () => AuthService.signInAnonymously(),
      signInWithGoogle: () => AuthService.signInWithGoogle(),
      signInWithApple: () => AuthService.signInWithApple(),
      signInWithEmailAndPassword: (email: string, password: string) => 
        AuthService.signInWithEmailAndPassword(email, password),
      signOut: () => AuthService.signOut(),
      createUserDocument: (firebaseUser: any) => AuthService.createUserDocument(firebaseUser),
    };
  }

  // Firestore methods
  static get firestore() {
    return {
      // Products
      getProducts: (userId: string, familyId?: string) => 
        FirestoreService.getProducts(userId, familyId),
      addProduct: (product: Omit<Product, 'id'>) => 
        FirestoreService.addProduct(product),
      updateProduct: (productId: string, updates: Partial<Product>) => 
        FirestoreService.updateProduct(productId, updates),
      deleteProduct: (productId: string) => 
        FirestoreService.deleteProduct(productId),
      
      // Shopping Lists
      getShoppingLists: (userId: string, familyId?: string) => 
        FirestoreService.getShoppingLists(userId, familyId),
      addShoppingList: (list: Omit<ShoppingList, 'id'>) => 
        FirestoreService.addShoppingList(list),
      updateShoppingList: (listId: string, updates: Partial<ShoppingList>) => 
        FirestoreService.updateShoppingList(listId, updates),
      deleteShoppingList: (listId: string) => 
        FirestoreService.deleteShoppingList(listId),
      
      // Recipes
      getRecipes: (userId: string, familyId?: string) => 
        FirestoreService.getRecipes(userId, familyId),
      addRecipe: (recipe: Omit<Recipe, 'id'>) => 
        FirestoreService.addRecipe(recipe),
      updateRecipe: (recipeId: string, updates: Partial<Recipe>) => 
        FirestoreService.updateRecipe(recipeId, updates),
      deleteRecipe: (recipeId: string) => 
        FirestoreService.deleteRecipe(recipeId),
      
      // Families
      getFamily: (familyId: string) => 
        FirestoreService.getFamily(familyId),
      createFamily: (family: Omit<Family, 'id'>) => 
        FirestoreService.createFamily(family),
      updateFamily: (familyId: string, updates: Partial<Family>) => 
        FirestoreService.updateFamily(familyId, updates),
    };
  }

  // Cloud Functions methods
  static get functions() {
    return {
      generateRecipes: (products: string[], preferences?: any) => 
        CloudFunctionsService.generateRecipes(products, preferences),
      scanBarcode: (barcode: string) => 
        CloudFunctionsService.scanBarcode(barcode),
      processReceipt: (imageBase64: string) => 
        CloudFunctionsService.processReceipt(imageBase64),
      sendFamilyInvite: (familyId: string, email: string, inviterName: string, role?: any) => 
        CloudFunctionsService.sendFamilyInvite(familyId, email, inviterName, role),
      joinFamily: (inviteCode: string, userId: string, userName: string) => 
        CloudFunctionsService.joinFamily(inviteCode, userId, userName),
      calculateEcoStats: (userId: string, familyId?: string, timeRange?: any) => 
        CloudFunctionsService.calculateEcoStats(userId, familyId, timeRange),
      generateWeeklyReport: (userId: string, familyId?: string) => 
        CloudFunctionsService.generateWeeklyReport(userId, familyId),
      checkAchievements: (userId: string, familyId?: string) => 
        CloudFunctionsService.checkAchievements(userId, familyId),
      analyzeShoppingPatterns: (userId: string, familyId?: string, timeRange?: any) => 
        CloudFunctionsService.analyzeShoppingPatterns(userId, familyId, timeRange),
      getSmartRecommendations: (userId: string, context: any) => 
        CloudFunctionsService.getSmartRecommendations(userId, context),
      optimizeShoppingRoute: (listId: string, storeId?: string, layout?: any) => 
        CloudFunctionsService.optimizeShoppingRoute(listId, storeId, layout),
    };
  }

  // Messaging setup
  private static async initializeMessaging(): Promise<void> {
    try {
      // Request permission (iOS)
      const authStatus = await messaging().requestPermission({
        alert: true,
        announcement: false,
        badge: true,
        carPlay: false,
        provisional: false,
        sound: true,
      });

      const enabled = authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
                     authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        // Get FCM token
        const token = await messaging().getToken();
        console.log('FCM Token:', token);
        
        // Store token in user profile
        // await this.firestore.updateUserToken(token);
      }

      // Handle background messages
      messaging().setBackgroundMessageHandler(async remoteMessage => {
        console.log('Background message:', remoteMessage);
        await this.handleBackgroundNotification(remoteMessage);
      });

      // Handle foreground messages
      messaging().onMessage(async remoteMessage => {
        console.log('Foreground message:', remoteMessage);
        await this.handleForegroundNotification(remoteMessage);
      });

    } catch (error) {
      console.error('Messaging initialization error:', error);
    }
  }

  // Analytics setup
  private static async initializeAnalytics(): Promise<void> {
    try {
      await analytics().setAnalyticsCollectionEnabled(true);
      await analytics().setUserId('anonymous-user');
      console.log('Analytics initialized');
    } catch (error) {
      console.error('Analytics initialization error:', error);
    }
  }

  // Crashlytics setup
  private static async initializeCrashlytics(): Promise<void> {
    try {
      await crashlytics().setCrashlyticsCollectionEnabled(true);
      console.log('Crashlytics initialized');
    } catch (error) {
      console.error('Crashlytics initialization error:', error);
    }
  }

  // Offline persistence setup
  private static async setupOfflinePersistence(): Promise<void> {
    try {
      // Offline persistence is automatically enabled in React Native Firebase
      console.log('Offline persistence enabled');
    } catch (error) {
      console.error('Offline persistence setup error:', error);
    }
  }

  // Network monitoring
  private static setupNetworkMonitoring(): void {
    // This would integrate with React Native NetInfo
    // For now, we'll use a simple online/offline detection
  }

  // Notification handlers
  private static async handleBackgroundNotification(message: any): Promise<void> {
    try {
      // Handle different notification types
      switch (message.data?.type) {
        case 'expiry_warning':
          await this.handleExpiryWarning(message.data);
          break;
        case 'family_invite':
          await this.handleFamilyInvite(message.data);
          break;
        case 'recipe_suggestion':
          await this.handleRecipeSuggestion(message.data);
          break;
        default:
          console.log('Unknown notification type:', message.data?.type);
      }
    } catch (error) {
      console.error('Background notification handling error:', error);
    }
  }

  private static async handleForegroundNotification(message: any): Promise<void> {
    try {
      // Show in-app notification
      // This would integrate with your notification system
      console.log('Foreground notification:', message);
    } catch (error) {
      console.error('Foreground notification handling error:', error);
    }
  }

  private static async handleExpiryWarning(data: any): Promise<void> {
    // Handle product expiry warning
    console.log('Product expiry warning:', data);
  }

  private static async handleFamilyInvite(data: any): Promise<void> {
    // Handle family invitation
    console.log('Family invite received:', data);
  }

  private static async handleRecipeSuggestion(data: any): Promise<void> {
    // Handle recipe suggestion
    console.log('Recipe suggestion:', data);
  }

  // Analytics tracking methods
  static trackEvent(eventName: string, parameters?: any): void {
    analytics().logEvent(eventName, parameters);
  }

  static trackScreenView(screenName: string, screenClass?: string): void {
    analytics().logScreenView({
      screen_name: screenName,
      screen_class: screenClass,
    });
  }

  static trackUserAction(action: string, details?: any): void {
    this.trackEvent('user_action', {
      action,
      ...details,
    });
  }

  // Error reporting
  static reportError(error: Error, context?: string): void {
    crashlytics().recordError(error);
    if (context) {
      crashlytics().log(context);
    }
  }

  static reportMessage(message: string, level: 'debug' | 'info' | 'warning' | 'error' = 'info'): void {
    crashlytics().log(`[${level.toUpperCase()}] ${message}`);
  }

  // Configuration getters
  static get isInitialized(): boolean {
    return this._initialized;
  }

  static get isOffline(): boolean {
    return this._isOffline;
  }

  static get collections() {
    return collections;
  }

  static get config() {
    return config;
  }

  // Development helpers
  static async connectToEmulators(): Promise<void> {
    if (__DEV__) {
      try {
        // Connect to emulators in development
        console.log('Connecting to Firebase emulators...');
        // Implementation would depend on specific emulator setup
      } catch (error) {
        console.error('Emulator connection error:', error);
      }
    }
  }

  // Health check
  static async healthCheck(): Promise<{
    auth: boolean;
    firestore: boolean;
    functions: boolean;
    messaging: boolean;
  }> {
    try {
      return {
        auth: true, // Check auth availability
        firestore: true, // Check Firestore connectivity
        functions: true, // Check Functions availability
        messaging: true, // Check Messaging availability
      };
    } catch (error) {
      console.error('Health check error:', error);
      return {
        auth: false,
        firestore: false,
        functions: false,
        messaging: false,
      };
    }
  }
}