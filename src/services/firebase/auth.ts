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
      const user = await this.createOrUpdateUserDocument(credential.user);
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

      const oldUser = auth().currentUser;
      // Prefer linking to keep the same UID when user is anonymous
      if (oldUser?.isAnonymous) {
        try {
          const { user } = await oldUser.linkWithCredential(googleCredential);
          const mapped = await this.createOrUpdateUserDocument(user);
          return mapped;
        } catch (linkErr: any) {
          // If linking fails (e.g., credential already in use), fall back to sign in and migrate
          const { user } = await auth().signInWithCredential(googleCredential);
          if (oldUser && oldUser.uid !== user.uid) {
            await this.migrateAnonymousData(oldUser.uid, user.uid);
          }
          const mapped = await this.createOrUpdateUserDocument(user);
          return mapped;
        }
      }

      // Regular sign-in path
      const { user } = await auth().signInWithCredential(googleCredential);
      const mapped = await this.createOrUpdateUserDocument(user);
      return mapped;
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
      const oldUser = auth().currentUser;
      if (oldUser?.isAnonymous) {
        try {
          const { user } = await oldUser.linkWithCredential(appleCredential);
          const mapped = await this.createOrUpdateUserDocument(user);
          return mapped;
        } catch (linkErr: any) {
          const { user } = await auth().signInWithCredential(appleCredential);
          if (oldUser && oldUser.uid !== user.uid) {
            await this.migrateAnonymousData(oldUser.uid, user.uid);
          }
          const mapped = await this.createOrUpdateUserDocument(user);
          return mapped;
        }
      }

      const { user } = await auth().signInWithCredential(appleCredential);
      const mapped = await this.createOrUpdateUserDocument(user);
      return mapped;
    } catch (error) {
      console.error('Apple sign in error:', error);
      throw error;
    }
  }

  static async signInWithEmailAndPassword(email: string, password: string): Promise<User> {
    try {
      const oldUser = auth().currentUser;
      if (oldUser?.isAnonymous) {
        try {
          // For email/password, use linkWithCredential path
          const emailCred = auth.EmailAuthProvider.credential(email, password);
          const { user } = await oldUser.linkWithCredential(emailCred);
          const mapped = await this.createOrUpdateUserDocument(user);
          return mapped;
        } catch (linkErr: any) {
          const credential = await auth().signInWithEmailAndPassword(email, password);
          if (oldUser && oldUser.uid !== credential.user.uid) {
            await this.migrateAnonymousData(oldUser.uid, credential.user.uid);
          }
          const mapped = await this.createOrUpdateUserDocument(credential.user);
          return mapped;
        }
      }

      const credential = await auth().signInWithEmailAndPassword(email, password);
      const mapped = await this.createOrUpdateUserDocument(credential.user);
      return mapped;
    } catch (error) {
      console.error('Email sign in error:', error);
      throw error;
    }
  }

  static async registerWithEmailAndPassword(email: string, password: string): Promise<User> {
    try {
      const oldUser = auth().currentUser;
      // If user is anonymous, prefer linking to keep UID
      if (oldUser?.isAnonymous) {
        try {
          const emailCred = auth.EmailAuthProvider.credential(email, password);
          const { user } = await oldUser.linkWithCredential(emailCred);
          const mapped = await this.createOrUpdateUserDocument(user);
          return mapped;
        } catch (linkErr: any) {
          // Fallback to create account then migrate data
          const { user } = await auth().createUserWithEmailAndPassword(email, password);
          if (oldUser && oldUser.uid !== user.uid) {
            await this.migrateAnonymousData(oldUser.uid, user.uid);
          }
          const mapped = await this.createOrUpdateUserDocument(user);
          return mapped;
        }
      }

      // Normal registration path
      const { user } = await auth().createUserWithEmailAndPassword(email, password);
      const mapped = await this.createOrUpdateUserDocument(user);
      return mapped;
    } catch (error) {
      console.error('Email registration error:', error);
      throw error;
    }
  }

  static async createOrUpdateUserDocument(firebaseUser: any): Promise<User> {
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
        lastLoginAt: new Date(),
      };

      await userRef.set(userData);
      return userData;
    }
    // Update last login timestamp
    await userRef.set(
      {
        lastLoginAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

  const data = doc.data() as User;
  return { ...data, lastLoginAt: new Date() } as User;
  }

  static async migrateAnonymousData(oldUserId: string, newUserId: string): Promise<void> {
    if (!oldUserId || !newUserId || oldUserId === newUserId) return;

    const batch = firestore().batch();

    try {
      // Migrate products
      const productsSnapshot = await firestore()
        .collection('products')
        .where('ownerId', '==', oldUserId)
        .get();
      productsSnapshot.docs.forEach(docSnap => batch.update(docSnap.ref, { ownerId: newUserId }));

      // Migrate shopping lists
      const shoppingListsSnapshot = await firestore()
        .collection('shoppingLists')
        .where('ownerId', '==', oldUserId)
        .get();
      shoppingListsSnapshot.docs.forEach(docSnap => batch.update(docSnap.ref, { ownerId: newUserId }));

      // Move/merge user document data
      const oldUserDocRef = firestore().collection('users').doc(oldUserId);
      const newUserDocRef = firestore().collection('users').doc(newUserId);
      const oldUserData = (await oldUserDocRef.get()).data();
      if (oldUserData) {
        batch.set(
          newUserDocRef,
          { ...oldUserData, migratedFrom: oldUserId, updatedAt: firestore.FieldValue.serverTimestamp() },
          { merge: true }
        );
        batch.delete(oldUserDocRef);
      }

      await batch.commit();

      // Clear old cached data keys if present
      try {
        await AsyncStorage.removeItem(`@user_${oldUserId}`);
      } catch {}
    } catch (error) {
      console.error('Data migration error:', error);
      // Do not throw to avoid blocking sign-in
    }
  }

  static async signOut(): Promise<void> {
    try {
      try { await GoogleSignin.signOut(); } catch {}
      await auth().signOut();
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }
}
