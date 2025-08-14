import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import functions from '@react-native-firebase/functions';
import storage from '@react-native-firebase/storage';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

export const initializeFirebase = async () => {
  // Configure Google Sign In
  await GoogleSignin.configure({
    webClientId: process.env.GOOGLE_WEB_CLIENT_ID,
    offlineAccess: true,
    forceCodeForRefreshToken: true,
  });

  // Enable Firestore offline persistence
  await firestore().settings({
    persistence: true,
    cacheSizeBytes: firestore.CACHE_SIZE_UNLIMITED,
  });

  // Set Firebase Functions region
  functions().useFunctionsEmulator('localhost', 5001); // Only in DEV
};

export { auth, firestore, functions, storage };