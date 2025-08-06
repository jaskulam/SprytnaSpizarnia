import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { appleAuth } from '@invertase/react-native-apple-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../../types/models';

export class AuthService {
  static async signInAnonymously(): Promise<User> {
    try {
      const credential = await auth().signInAnonymously();
      const user = await this.createUserDocument(credential.user);
      return user;
    } catch (error) {
      console.error('Anonymous sign in error:', error);
      throw error;
    }
  }

  static async signInWithGoogle(): Promise<User> {
    try {
      await GoogleSignin.hasPlayServices();
      const { idToken } = await GoogleSignin.signIn();
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      const credential = await auth().signInWithCredential(googleCredential);
      
      // Migrate anonymous data if exists
      await this.migrateAnonymousData(credential.user.uid);
      
      const user = await this.createUserDocument(credential.user);
      return user;
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  }

  static async signInWithApple(): Promise<User> {
    try {
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      });

      const { identityToken, nonce } = appleAuthRequestResponse;
      const appleCredential = auth.AppleAuthProvider.credential(identityToken, nonce);
      const credential = await auth().signInWithCredential(appleCredential);
      
      await this.migrateAnonymousData(credential.user.uid);
      
      const user = await this.createUserDocument(credential.user);
      return user;
    } catch (error) {
      console.error('Apple sign in error:', error);
      throw error;
    }
  }

  static async signInWithEmailAndPassword(email: string, password: string): Promise<User> {
    try {
      const credential = await auth().signInWithEmailAndPassword(email, password);
      await this.migrateAnonymousData(credential.user.uid);
      const user = await this.createUserDocument(credential.user);
      return user;
    } catch (error) {
      console.error('Email sign in error:', error);
      throw error;
    }
  }

  static async createUserDocument(firebaseUser: any): Promise<User> {
    const userRef = firestore().collection('users').doc(firebaseUser.uid);
    const doc = await userRef.get();

    if (!doc.exists) {
      const userData: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || 'Użytkownik',
        isAnonymous: firebaseUser.isAnonymous,
        isPro: false,
        createdAt: new Date(),
      };

      await userRef.set(userData);
      return userData;
    }

    return doc.data() as User;
  }

  static async migrateAnonymousData(newUserId: string): Promise<void> {
    const currentUser = auth().currentUser;
    if (!currentUser?.isAnonymous) return;

    try {
      // Get all products from anonymous user
      const productsSnapshot = await firestore()
        .collection('products')
        .where('ownerId', '==', currentUser.uid)
        .get();

      // Migrate products to new user
      const batch = firestore().batch();
      productsSnapshot.docs.forEach((doc) => {
        batch.update(doc.ref, { ownerId: newUserId });
      });

      await batch.commit();
      
      // Delete anonymous user account
      await currentUser.delete();
    } catch (error) {
      console.error('Data migration error:', error);
    }
  }

  static async signOut(): Promise<void> {
    try {
      await auth().signOut();
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }
}
