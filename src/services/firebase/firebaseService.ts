// firebaseService.ts - Kompletny serwis Firebase dla aplikacji Sprytna Spiżarnia

import { 
  initializeApp, 
  FirebaseApp 
} from 'firebase/app';

import { 
  getAuth, 
  Auth,
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
  sendPasswordResetEmail,
  deleteUser,
  linkWithCredential,
  EmailAuthProvider
} from 'firebase/auth';

import {
  getFirestore,
  Firestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  writeBatch,
  enableNetwork,
  disableNetwork,
  enableIndexedDbPersistence,
  QuerySnapshot,
  DocumentSnapshot,
  arrayUnion,
  arrayRemove,
  increment
} from 'firebase/firestore';

import {
  getStorage,
  Storage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  uploadString
} from 'firebase/storage';

import {
  getFunctions,
  Functions,
  httpsCallable,
  connectFunctionsEmulator
} from 'firebase/functions';

import {
  getMessaging,
  Messaging,
  getToken,
  onMessage,
  deleteToken
} from 'firebase/messaging';

import {
  getAnalytics,
  Analytics,
  logEvent,
  setUserId,
  setUserProperties
} from 'firebase/analytics';

import { firebaseConfig } from './firebaseConfig';
import type { 
  Product, 
  User, 
  ShoppingList, 
  Recipe, 
  Family,
  MealPlan,
  Notification,
  ActivityLog,
  PendingChange,
  BarcodeScanResult,
  ReceiptScanResult 
} from '../../types/models';

// Inicjalizacja Firebase
class FirebaseService {
  private app: FirebaseApp;
  private auth: Auth;
  private db: Firestore;
  private storage: Storage;
  private functions: Functions;
  private messaging: Messaging | null = null;
  private analytics: Analytics | null = null;
  private unsubscribers: Map<string, () => void> = new Map();
  private isOffline: boolean = false;

  constructor() {
    this.app = initializeApp(firebaseConfig);
    this.auth = getAuth(this.app);
    this.db = getFirestore(this.app);
    this.storage = getStorage(this.app);
    this.functions = getFunctions(this.app, 'europe-west1');
    
    // Inicjalizacja opcjonalnych serwisów
    this.initializeOptionalServices();
    
    // Konfiguracja trybu offline
    this.setupOfflineMode();
    
    // Ustawienie języka
    this.auth.languageCode = 'pl';
  }

  private async initializeOptionalServices() {
    try {
      // Analytics (tylko w produkcji)
      if (process.env.NODE_ENV === 'production') {
        const { getAnalytics } = await import('firebase/analytics');
        this.analytics = getAnalytics(this.app);
      }
      
      // Messaging (jeśli obsługiwane)
      if ('Notification' in window && Notification.permission === 'granted') {
        const { getMessaging } = await import('firebase/messaging');
        this.messaging = getMessaging(this.app);
      }
    } catch (error) {
      console.warn('Opcjonalne serwisy Firebase nie zostały zainicjalizowane:', error);
    }
  }

  private async setupOfflineMode() {
    try {
      // Włącz persystencję offline dla Firestore
      await enableIndexedDbPersistence(this.db);
      
      // Nasłuchuj zmian stanu połączenia
      window.addEventListener('online', () => this.handleOnline());
      window.addEventListener('offline', () => this.handleOffline());
    } catch (error) {
      console.error('Błąd konfiguracji trybu offline:', error);
    }
  }

  private async handleOnline() {
    this.isOffline = false;
    await enableNetwork(this.db);
    this.logEvent('connection_restored');
  }

  private async handleOffline() {
    this.isOffline = true;
    await disableNetwork(this.db);
    this.logEvent('connection_lost');
  }

  // ============== AUTORYZACJA ==============

  async signInAnonymously(): Promise<User> {
    try {
      const credential = await signInAnonymously(this.auth);
      return this.mapFirebaseUserToUser(credential.user);
    } catch (error) {
      console.error('Błąd logowania anonimowego:', error);
      throw error;
    }
  }

  async signInWithEmail(email: string, password: string): Promise<User> {
    try {
      const credential = await signInWithEmailAndPassword(this.auth, email, password);
      return this.mapFirebaseUserToUser(credential.user);
    } catch (error) {
      console.error('Błąd logowania email:', error);
      throw error;
    }
  }

  async signUpWithEmail(email: string, password: string, displayName: string): Promise<User> {
    try {
      const credential = await createUserWithEmailAndPassword(this.auth, email, password);
      
      // Aktualizuj profil użytkownika
      await updateProfile(credential.user, { displayName });
      
      // Utwórz dokument użytkownika w Firestore
      const user = await this.mapFirebaseUserToUser(credential.user);
      await this.createUserDocument(user);
      
      return user;
    } catch (error) {
      console.error('Błąd rejestracji:', error);
      throw error;
    }
  }

  async signInWithGoogle(): Promise<User> {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      
      const credential = await signInWithPopup(this.auth, provider);
      const user = await this.mapFirebaseUserToUser(credential.user);
      
      // Sprawdź czy to nowy użytkownik
      const userDoc = await this.getUserDocument(user.id);
      if (!userDoc) {
        await this.createUserDocument(user);
      }
      
      return user;
    } catch (error) {
      console.error('Błąd logowania Google:', error);
      throw error;
    }
  }

  async signInWithApple(): Promise<User> {
    try {
      const provider = new OAuthProvider('apple.com');
      provider.addScope('email');
      provider.addScope('name');
      
      const credential = await signInWithPopup(this.auth, provider);
      const user = await this.mapFirebaseUserToUser(credential.user);
      
      // Sprawdź czy to nowy użytkownik
      const userDoc = await this.getUserDocument(user.id);
      if (!userDoc) {
        await this.createUserDocument(user);
      }
      
      return user;
    } catch (error) {
      console.error('Błąd logowania Apple:', error);
      throw error;
    }
  }

  async linkAnonymousAccount(email: string, password: string): Promise<User> {
    try {
      const user = this.auth.currentUser;
      if (!user || !user.isAnonymous) {
        throw new Error('Brak konta anonimowego do połączenia');
      }
      
      const credential = EmailAuthProvider.credential(email, password);
      const result = await linkWithCredential(user, credential);
      
      return this.mapFirebaseUserToUser(result.user);
    } catch (error) {
      console.error('Błąd łączenia konta:', error);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    try {
      await signOut(this.auth);
      this.unsubscribeAll();
      this.logEvent('user_logout');
    } catch (error) {
      console.error('Błąd wylogowania:', error);
      throw error;
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(this.auth, email);
      this.logEvent('password_reset_requested');
    } catch (error) {
      console.error('Błąd resetowania hasła:', error);
      throw error;
    }
  }

  async deleteAccount(): Promise<void> {
    try {
      const user = this.auth.currentUser;
      if (!user) throw new Error('Brak zalogowanego użytkownika');
      
      // Usuń dane użytkownika z Firestore
      await this.deleteUserData(user.uid);
      
      // Usuń konto
      await deleteUser(user);
      
      this.logEvent('account_deleted');
    } catch (error) {
      console.error('Błąd usuwania konta:', error);
      throw error;
    }
  }

  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(this.auth, async (firebaseUser) => {
      if (firebaseUser) {
        const user = await this.mapFirebaseUserToUser(firebaseUser);
        callback(user);
      } else {
        callback(null);
      }
    });
  }

  // ============== PRODUKTY ==============

  async getProducts(userId: string, familyId?: string): Promise<Product[]> {
    try {
      let q;
      if (familyId) {
        q = query(
          collection(this.db, 'products'),
          where('familyId', '==', familyId),
          orderBy('expiryDate', 'asc')
        );
      } else {
        q = query(
          collection(this.db, 'products'),
          where('ownerId', '==', userId),
          orderBy('expiryDate', 'asc')
        );
      }
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Product));
    } catch (error) {
      console.error('Błąd pobierania produktów:', error);
      throw error;
    }
  }

  async addProduct(product: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
    try {
      const docRef = doc(collection(this.db, 'products'));
      const newProduct: Product = {
        ...product,
        id: docRef.id,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await setDoc(docRef, {
        ...newProduct,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      this.logEvent('product_added', { category: product.category });
      return newProduct;
    } catch (error) {
      console.error('Błąd dodawania produktu:', error);
      throw error;
    }
  }

  async updateProduct(productId: string, updates: Partial<Product>): Promise<void> {
    try {
      await updateDoc(doc(this.db, 'products', productId), {
        ...updates,
        updatedAt: serverTimestamp()
      });
      
      this.logEvent('product_updated');
    } catch (error) {
      console.error('Błąd aktualizacji produktu:', error);
      throw error;
    }
  }

  async deleteProduct(productId: string): Promise<void> {
    try {
      await deleteDoc(doc(this.db, 'products', productId));
      this.logEvent('product_deleted');
    } catch (error) {
      console.error('Błąd usuwania produktu:', error);
      throw error;
    }
  }

  subscribeToProducts(
    userId: string, 
    callback: (products: Product[]) => void,
    familyId?: string
  ): () => void {
    let q;
    if (familyId) {
      q = query(
        collection(this.db, 'products'),
        where('familyId', '==', familyId),
        orderBy('expiryDate', 'asc')
      );
    } else {
      q = query(
        collection(this.db, 'products'),
        where('ownerId', '==', userId),
        orderBy('expiryDate', 'asc')
      );
    }
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Product));
      callback(products);
    });
    
    this.unsubscribers.set(`products_${userId}`, unsubscribe);
    return unsubscribe;
  }

  // ============== LISTY ZAKUPÓW ==============

  async getShoppingLists(userId: string, familyId?: string): Promise<ShoppingList[]> {
    try {
      let q;
      if (familyId) {
        q = query(
          collection(this.db, 'shoppingLists'),
          where('familyId', '==', familyId),
          orderBy('updatedAt', 'desc')
        );
      } else {
        q = query(
          collection(this.db, 'shoppingLists'),
          where('ownerId', '==', userId),
          orderBy('updatedAt', 'desc')
        );
      }
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ShoppingList));
    } catch (error) {
      console.error('Błąd pobierania list zakupów:', error);
      throw error;
    }
  }

  async createShoppingList(list: Omit<ShoppingList, 'id' | 'createdAt' | 'updatedAt'>): Promise<ShoppingList> {
    try {
      const docRef = doc(collection(this.db, 'shoppingLists'));
      const newList: ShoppingList = {
        ...list,
        id: docRef.id,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await setDoc(docRef, {
        ...newList,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      this.logEvent('shopping_list_created');
      return newList;
    } catch (error) {
      console.error('Błąd tworzenia listy zakupów:', error);
      throw error;
    }
  }

  async updateShoppingList(listId: string, updates: Partial<ShoppingList>): Promise<void> {
    try {
      await updateDoc(doc(this.db, 'shoppingLists', listId), {
        ...updates,
        updatedAt: serverTimestamp()
      });
      
      this.logEvent('shopping_list_updated');
    } catch (error) {
      console.error('Błąd aktualizacji listy zakupów:', error);
      throw error;
    }
  }

  subscribeToShoppingLists(
    userId: string,
    callback: (lists: ShoppingList[]) => void,
    familyId?: string
  ): () => void {
    let q;
    if (familyId) {
      q = query(
        collection(this.db, 'shoppingLists'),
        where('familyId', '==', familyId),
        orderBy('updatedAt', 'desc')
      );
    } else {
      q = query(
        collection(this.db, 'shoppingLists'),
        where('ownerId', '==', userId),
        orderBy('updatedAt', 'desc')
      );
    }
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lists = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ShoppingList));
      callback(lists);
    });
    
    this.unsubscribers.set(`shoppingLists_${userId}`, unsubscribe);
    return unsubscribe;
  }

  // ============== PRZEPISY I AI ==============

  async generateRecipes(ingredients: string[], options?: any): Promise<Recipe[]> {
    try {
      const generateRecipesFunc = httpsCallable(this.functions, 'generateRecipes');
      const result = await generateRecipesFunc({ ingredients, options });
      
      this.logEvent('recipes_generated', { count: (result.data as any).recipes.length });
      return (result.data as any).recipes;
    } catch (error) {
      console.error('Błąd generowania przepisów:', error);
      throw error;
    }
  }

  async saveRecipe(recipe: Omit<Recipe, 'id' | 'createdAt'>): Promise<Recipe> {
    try {
      const docRef = doc(collection(this.db, 'recipes'));
      const newRecipe: Recipe = {
        ...recipe,
        id: docRef.id,
        createdAt: new Date()
      };
      
      await setDoc(docRef, {
        ...newRecipe,
        createdAt: serverTimestamp()
      });
      
      this.logEvent('recipe_saved');
      return newRecipe;
    } catch (error) {
      console.error('Błąd zapisywania przepisu:', error);
      throw error;
    }
  }

  async getRecipes(userId: string): Promise<Recipe[]> {
    try {
      const q = query(
        collection(this.db, 'recipes'),
        where('createdBy', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Recipe));
    } catch (error) {
      console.error('Błąd pobierania przepisów:', error);
      throw error;
    }
  }

  // ============== SKANOWANIE ==============

  async scanBarcode(barcode: string): Promise<BarcodeScanResult> {
    try {
      const scanBarcodeFunc = httpsCallable(this.functions, 'scanBarcode');
      const result = await scanBarcodeFunc({ barcode });
      
      this.logEvent('barcode_scanned');
      return result.data as BarcodeScanResult;
    } catch (error) {
      console.error('Błąd skanowania kodu kreskowego:', error);
      throw error;
    }
  }

  async scanReceipt(imageBase64: string): Promise<ReceiptScanResult> {
    try {
      const scanReceiptFunc = httpsCallable(this.functions, 'scanReceipt');
      const result = await scanReceiptFunc({ image: imageBase64 });
      
      this.logEvent('receipt_scanned');
      return result.data as ReceiptScanResult;
    } catch (error) {
      console.error('Błąd skanowania paragonu:', error);
      throw error;
    }
  }

  // ============== RODZINA ==============

  async createFamily(name: string, ownerId: string): Promise<Family> {
    try {
      const docRef = doc(collection(this.db, 'families'));
      const newFamily: Family = {
        id: docRef.id,
        name,
        ownerId,
        members: [{
          userId: ownerId,
          email: this.auth.currentUser?.email || '',
          displayName: this.auth.currentUser?.displayName || 'Owner',
          role: 'owner',
          joinedAt: new Date(),
          permissions: {
            canAddProducts: true,
            canDeleteProducts: true,
            canEditProducts: true,
            canManageShoppingLists: true,
            canInviteMembers: true,
            canRemoveMembers: true,
            canViewStats: true
          }
        }],
        invitations: [],
        createdAt: new Date(),
        settings: {
          shareProducts: true,
          shareShoppingLists: true,
          shareMealPlans: true,
          notifyOnChanges: true,
          autoAcceptInvites: false
        }
      };
      
      await setDoc(docRef, newFamily);
      
      // Aktualizuj użytkownika
      await updateDoc(doc(this.db, 'users', ownerId), {
        familyId: docRef.id
      });
      
      this.logEvent('family_created');
      return newFamily;
    } catch (error) {
      console.error('Błąd tworzenia rodziny:', error);
      throw error;
    }
  }

  async inviteToFamily(familyId: string, email: string): Promise<void> {
    try {
      const inviteFamilyMemberFunc = httpsCallable(this.functions, 'inviteFamilyMember');
      await inviteFamilyMemberFunc({ familyId, email });
      
      this.logEvent('family_invite_sent');
    } catch (error) {
      console.error('Błąd wysyłania zaproszenia:', error);
      throw error;
    }
  }

  async acceptFamilyInvite(token: string): Promise<void> {
    try {
      const acceptInviteFunc = httpsCallable(this.functions, 'acceptFamilyInvite');
      await acceptInviteFunc({ token });
      
      this.logEvent('family_invite_accepted');
    } catch (error) {
      console.error('Błąd akceptacji zaproszenia:', error);
      throw error;
    }
  }

  async removeFamilyMember(familyId: string, userId: string): Promise<void> {
    try {
      await updateDoc(doc(this.db, 'families', familyId), {
        members: arrayRemove(userId)
      });
      
      await updateDoc(doc(this.db, 'users', userId), {
        familyId: null
      });
      
      this.logEvent('family_member_removed');
    } catch (error) {
      console.error('Błąd usuwania członka rodziny:', error);
      throw error;
    }
  }

  subscribeToFamily(familyId: string, callback: (family: Family) => void): () => void {
    const unsubscribe = onSnapshot(doc(this.db, 'families', familyId), (doc) => {
      if (doc.exists()) {
        callback({ id: doc.id, ...doc.data() } as Family);
      }
    });
    
    this.unsubscribers.set(`family_${familyId}`, unsubscribe);
    return unsubscribe;
  }

  // ============== POWIADOMIENIA ==============

  async enableNotifications(): Promise<string | null> {
    try {
      if (!this.messaging) {
        console.warn('Messaging nie jest dostępny');
        return null;
      }
      
      const token = await getToken(this.messaging, {
        vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY
      });
      
      // Zapisz token w Firestore
      if (this.auth.currentUser) {
        await updateDoc(doc(this.db, 'users', this.auth.currentUser.uid), {
          fcmTokens: arrayUnion(token)
        });
      }
      
      this.logEvent('notifications_enabled');
      return token;
    } catch (error) {
      console.error('Błąd włączania powiadomień:', error);
      throw error;
    }
  }

  async disableNotifications(): Promise<void> {
    try {
      if (!this.messaging) return;
      
      await deleteToken(this.messaging);
      
      // Usuń token z Firestore
      if (this.auth.currentUser) {
        const token = await getToken(this.messaging);
        await updateDoc(doc(this.db, 'users', this.auth.currentUser.uid), {
          fcmTokens: arrayRemove(token)
        });
      }
      
      this.logEvent('notifications_disabled');
    } catch (error) {
      console.error('Błąd wyłączania powiadomień:', error);
      throw error;
    }
  }

  onMessage(callback: (payload: any) => void): () => void | null {
    if (!this.messaging) return () => {};
    
    return onMessage(this.messaging, callback);
  }

  async getNotifications(userId: string, limit: number = 20): Promise<Notification[]> {
    try {
      const q = query(
        collection(this.db, 'notifications'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limit)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Notification));
    } catch (error) {
      console.error('Błąd pobierania powiadomień:', error);
      throw error;
    }
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      await updateDoc(doc(this.db, 'notifications', notificationId), {
        read: true,
        readAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Błąd oznaczania powiadomienia:', error);
      throw error;
    }
  }

  // ============== PLANER POSIŁKÓW ==============

  async createMealPlan(mealPlan: Omit<MealPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<MealPlan> {
    try {
      const docRef = doc(collection(this.db, 'mealPlans'));
      const newMealPlan: MealPlan = {
        ...mealPlan,
        id: docRef.id,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await setDoc(docRef, {
        ...newMealPlan,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      this.logEvent('meal_plan_created');
      return newMealPlan;
    } catch (error) {
      console.error('Błąd tworzenia planu posiłków:', error);
      throw error;
    }
  }

  async getMealPlans(userId: string, familyId?: string): Promise<MealPlan[]> {
    try {
      let q;
      if (familyId) {
        q = query(
          collection(this.db, 'mealPlans'),
          where('familyId', '==', familyId),
          where('isActive', '==', true),
          orderBy('startDate', 'desc')
        );
      } else {
        q = query(
          collection(this.db, 'mealPlans'),
          where('userId', '==', userId),
          where('isActive', '==', true),
          orderBy('startDate', 'desc')
        );
      }
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as MealPlan));
    } catch (error) {
      console.error('Błąd pobierania planów posiłków:', error);
      throw error;
    }
  }

  // ============== STORAGE ==============

  async uploadImage(file: File, path: string): Promise<string> {
    try {
      const storageRef = ref(this.storage, path);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      this.logEvent('image_uploaded');
      return downloadURL;
    } catch (error) {
      console.error('Błąd przesyłania obrazu:', error);
      throw error;
    }
  }

  async uploadBase64Image(base64: string, path: string): Promise<string> {
    try {
      const storageRef = ref(this.storage, path);
      const snapshot = await uploadString(storageRef, base64, 'data_url');
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return downloadURL;
    } catch (error) {
      console.error('Błąd przesyłania obrazu base64:', error);
      throw error;
    }
  }

  async deleteImage(path: string): Promise<void> {
    try {
      const storageRef = ref(this.storage, path);
      await deleteObject(storageRef);
    } catch (error) {
      console.error('Błąd usuwania obrazu:', error);
      throw error;
    }
  }

  // ============== AKTYWNOŚĆ I STATYSTYKI ==============

  async logActivity(activity: Omit<ActivityLog, 'id' | 'timestamp'>): Promise<void> {
    try {
      const docRef = doc(collection(this.db, 'activityLogs'));
      await setDoc(docRef, {
        ...activity,
        id: docRef.id,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Błąd logowania aktywności:', error);
    }
  }

  async getActivityLogs(userId: string, limit: number = 50): Promise<ActivityLog[]> {
    try {
      const q = query(
        collection(this.db, 'activityLogs'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(limit)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ActivityLog));
    } catch (error) {
      console.error('Błąd pobierania logów aktywności:', error);
      throw error;
    }
  }

  async getStatistics(userId: string, period: string): Promise<any> {
    try {
      const getStatsFunc = httpsCallable(this.functions, 'getStatistics');
      const result = await getStatsFunc({ userId, period });
      
      return result.data;
    } catch (error) {
      console.error('Błąd pobierania statystyk:', error);
      throw error;
    }
  }

  // ============== HELPERS ==============

  private async mapFirebaseUserToUser(firebaseUser: FirebaseUser): Promise<User> {
    const userDoc = await this.getUserDocument(firebaseUser.uid);
    
    return {
      id: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName || 'Użytkownik',
      photoURL: firebaseUser.photoURL || undefined,
      isAnonymous: firebaseUser.isAnonymous,
      provider: this.getAuthProvider(firebaseUser),
      createdAt: userDoc?.createdAt || new Date(),
      lastLoginAt: new Date(),
      isPro: userDoc?.isPro || false,
      subscription: userDoc?.subscription,
      preferences: userDoc?.preferences || this.getDefaultPreferences(),
      familyId: userDoc?.familyId
    };
  }

  private getAuthProvider(user: FirebaseUser): 'email' | 'google' | 'apple' | 'anonymous' {
    if (user.isAnonymous) return 'anonymous';
    
    const provider = user.providerData[0]?.providerId;
    switch (provider) {
      case 'google.com': return 'google';
      case 'apple.com': return 'apple';
      case 'password': return 'email';
      default: return 'email';
    }
  }

  private getDefaultPreferences() {
    return {
      notifications: {
        expiryReminders: true,
        familyUpdates: true,
        weeklyReport: false,
        lowStock: true,
        reminderTime: '09:00',
        reminderDaysBefore: 3
      },
      defaultLocation: 'Lodówka' as const,
      language: 'pl' as const,
      theme: 'light' as const,
      expiryWarningDays: 3,
      measurementUnit: 'metric' as const
    };
  }

  private async getUserDocument(userId: string): Promise<any> {
    try {
      const docSnap = await getDoc(doc(this.db, 'users', userId));
      return docSnap.exists() ? docSnap.data() : null;
    } catch (error) {
      console.error('Błąd pobierania dokumentu użytkownika:', error);
      return null;
    }
  }

  private async createUserDocument(user: User): Promise<void> {
    try {
      await setDoc(doc(this.db, 'users', user.id), {
        ...user,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Błąd tworzenia dokumentu użytkownika:', error);
      throw error;
    }
  }

  private async deleteUserData(userId: string): Promise<void> {
    try {
      const batch = writeBatch(this.db);
      
      // Usuń produkty
      const productsSnapshot = await getDocs(
        query(collection(this.db, 'products'), where('ownerId', '==', userId))
      );
      productsSnapshot.docs.forEach(doc => batch.delete(doc.ref));
      
      // Usuń listy zakupów
      const listsSnapshot = await getDocs(
        query(collection(this.db, 'shoppingLists'), where('ownerId', '==', userId))
      );
      listsSnapshot.docs.forEach(doc => batch.delete(doc.ref));
      
      // Usuń przepisy
      const recipesSnapshot = await getDocs(
        query(collection(this.db, 'recipes'), where('createdBy', '==', userId))
      );
      recipesSnapshot.docs.forEach(doc => batch.delete(doc.ref));
      
      // Usuń dokument użytkownika
      batch.delete(doc(this.db, 'users', userId));
      
      await batch.commit();
    } catch (error) {
      console.error('Błąd usuwania danych użytkownika:', error);
      throw error;
    }
  }

  private logEvent(eventName: string, parameters?: any): void {
    if (this.analytics) {
      logEvent(this.analytics, eventName, parameters);
    }
  }

  private unsubscribeAll(): void {
    this.unsubscribers.forEach(unsubscribe => unsubscribe());
    this.unsubscribers.clear();
  }

  // ============== SYNCHRONIZACJA OFFLINE ==============

  async syncPendingChanges(changes: PendingChange[]): Promise<void> {
    if (this.isOffline) {
      throw new Error('Aplikacja jest offline');
    }
    
    const batch = writeBatch(this.db);
    
    for (const change of changes) {
      const docRef = doc(this.db, change.entity, change.entityId);
      
      switch (change.type) {
        case 'create':
          batch.set(docRef, change.data);
          break;
        case 'update':
          batch.update(docRef, change.data);
          break;
        case 'delete':
          batch.delete(docRef);
          break;
      }
    }
    
    await batch.commit();
    this.logEvent('offline_sync_completed', { changesCount: changes.length });
  }

  getConnectionStatus(): boolean {
    return !this.isOffline;
  }
}

// Eksport instancji singleton
export const firebaseService = new FirebaseService();
export default firebaseService;
