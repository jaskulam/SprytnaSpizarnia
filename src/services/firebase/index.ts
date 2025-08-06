// Firebase Services - Central Export Point

// Core services
export { FirebaseService } from './firebaseService';
export { AuthService } from './auth';
export { FirestoreService } from './firestore';
export { CloudFunctionsService } from './functions';

// Configuration
export { 
  getCurrentFirebaseConfig,
  environments,
  defaultRegion,
  emulatorConfig,
  featureFlags
} from './firebaseConfig';

export { 
  initializeFirebase,
  collections,
  cloudFunctions,
  config
} from './config';

// Types for Cloud Functions
export type {
  RecipeGenerationResult,
  BarcodeResult,
  ReceiptProcessingResult,
  FamilyInviteResult,
  EcoStatsResult,
  WeeklyReportResult
} from './functions';

// Re-export commonly used Firebase types
export type { FirebaseOptions } from '@react-native-firebase/app';

// Convenience exports for easy access
export const firebase = {
  // Core service
  service: FirebaseService,
  
  // Individual services
  auth: AuthService,
  firestore: FirestoreService,
  functions: CloudFunctionsService,
  
  // Configuration
  config: getCurrentFirebaseConfig(),
  collections,
  
  // Initialize
  initialize: () => FirebaseService.initialize(),
  
  // Health check
  healthCheck: () => FirebaseService.healthCheck(),
};

// Default export
export default firebase;
