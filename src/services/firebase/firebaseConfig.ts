import { FirebaseOptions } from '@react-native-firebase/app';

// Firebase Configuration for React Native
export const firebaseConfig: FirebaseOptions = {
  // Core Firebase settings
  projectId: process.env.FIREBASE_PROJECT_ID || 'sprytnaspizarnia-dev',
  appId: process.env.FIREBASE_APP_ID || '1:123456789:android:abcdef123456',
  apiKey: process.env.FIREBASE_API_KEY || 'AIzaSyC9XYZ...',
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || 'sprytnaspizarnia-dev.firebaseapp.com',
  databaseURL: process.env.FIREBASE_DATABASE_URL || 'https://sprytnaspizarnia-dev-default-rtdb.europe-west1.firebasedatabase.app',
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'sprytnaspizarnia-dev.appspot.com',
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '123456789',
  
  // Additional settings
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || 'G-XXXXXXXXXX',
};

// Environment-specific configurations
export const environments = {
  development: {
    ...firebaseConfig,
    projectId: 'sprytnaspizarnia-dev',
    authDomain: 'sprytnaspizarnia-dev.firebaseapp.com',
    storageBucket: 'sprytnaspizarnia-dev.appspot.com',
  },
  
  staging: {
    ...firebaseConfig,
    projectId: 'sprytnaspizarnia-staging',
    authDomain: 'sprytnaspizarnia-staging.firebaseapp.com',
    storageBucket: 'sprytnaspizarnia-staging.appspot.com',
  },
  
  production: {
    ...firebaseConfig,
    projectId: 'sprytnaspizarnia-prod',
    authDomain: 'sprytnaspizarnia.pl',
    storageBucket: 'sprytnaspizarnia-prod.appspot.com',
  },
};

// Get configuration based on environment
export const getCurrentFirebaseConfig = (): FirebaseOptions => {
  const env = process.env.NODE_ENV || 'development';
  
  switch (env) {
    case 'production':
      return environments.production;
    case 'staging':
      return environments.staging;
    default:
      return environments.development;
  }
};

// Firebase regions
export const regions = {
  europe: 'europe-west1',
  us: 'us-central1',
  asia: 'asia-southeast1',
} as const;

// Default region for Cloud Functions
export const defaultRegion = regions.europe;

// Security rules paths
export const securityRules = {
  firestore: 'firestore.rules',
  storage: 'storage.rules',
  database: 'database.rules.json',
} as const;

// Emulator configuration for development
export const emulatorConfig = {
  auth: {
    host: 'localhost',
    port: 9099,
  },
  firestore: {
    host: 'localhost',
    port: 8080,
  },
  functions: {
    host: 'localhost',
    port: 5001,
  },
  storage: {
    host: 'localhost',
    port: 9199,
  },
  database: {
    host: 'localhost',
    port: 9000,
  },
};

// Feature flags for Firebase services
export const featureFlags = {
  analytics: true,
  crashlytics: true,
  performance: true,
  messaging: true,
  dynamicLinks: false,
  remoteConfig: true,
  appCheck: false,
} as const;