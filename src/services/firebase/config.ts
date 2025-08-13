import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import functions from '@react-native-firebase/functions';
import messaging from '@react-native-firebase/messaging';
import crashlytics from '@react-native-firebase/crashlytics';
import { Platform } from 'react-native';

export const initializeFirebase = async (): Promise<void> => {
  try {
    console.log('🔥 Initializing Firebase...');
    
    // Konfiguracja Firestore
    await firestore().settings({
      persistence: true,
      cacheSizeBytes: firestore.CACHE_SIZE_UNLIMITED,
    });
    console.log('✅ Firestore configured');

    // Włączenie Crashlytics
    await crashlytics().setCrashlyticsCollectionEnabled(true);
    console.log('✅ Crashlytics enabled');

    // Konfiguracja powiadomień
    if (Platform.OS === 'ios') {
      await messaging().requestPermission();
    }

    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      const token = await messaging().getToken();
      console.log('✅ FCM Token:', token);
    }

    // Nasłuchiwanie na powiadomienia w tle
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('📱 Background message:', remoteMessage);
    });

    console.log('🚀 Firebase initialization completed successfully!');

  } catch (error) {
    console.error('❌ Firebase initialization error:', error);
    crashlytics().recordError(error as Error);
  }
};

// Definicje kolekcji Firestore
export const collections = {
  users: 'users',
  products: 'products',
  shoppingLists: 'shoppingLists',
  recipes: 'recipes',
  mealPlans: 'mealPlans',
  families: 'families',
  achievements: 'achievements',
  notifications: 'notifications',
  ecoStats: 'ecoStats',
  userPreferences: 'userPreferences',
};

// Cloud Functions
export const cloudFunctions = {
  generateRecipes: functions().httpsCallable('generateRecipes'),
  scanBarcode: functions().httpsCallable('scanBarcode'),
  processReceipt: functions().httpsCallable('processReceipt'),
  sendFamilyInvite: functions().httpsCallable('sendFamilyInvite'),
  joinFamily: functions().httpsCallable('joinFamily'),
  calculateEcoStats: functions().httpsCallable('calculateEcoStats'),
  generateWeeklyReport: functions().httpsCallable('generateWeeklyReport'),
  checkAchievements: functions().httpsCallable('checkAchievements'),
};

// Konfiguracja środowiska
export const config = {
  apiUrl: __DEV__ ? 'http://localhost:5001' : 'https://api.sprytnaspizarnia.pl',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  openFoodFactsUrl: 'https://world.openfoodfacts.org/api/v0',
  supportEmail: 'support@sprytnaspizarnia.pl',
  privacyPolicyUrl: 'https://sprytnaspizarnia.pl/privacy',
  termsOfServiceUrl: 'https://sprytnaspizarnia.pl/terms',
};