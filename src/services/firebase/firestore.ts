import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { 
  Product, 
  ShoppingList, 
  Recipe, 
  MealPlan,
  Family,
  Achievement,
  EcoStats,
  UserPreferences,
  Notification,
} from '../../types/models';
import { collections } from './config';

export class FirestoreService {
  // Products
  static async getProducts(userId: string, familyId?: string): Promise<Product[]> {
    try {
      let query: FirebaseFirestoreTypes.Query = firestore()
        .collection(collections.products);

      if (familyId) {
        query = query.where('familyId', '==', familyId);
      } else {
        query = query.where('ownerId', '==', userId);
      }

      const snapshot = await query.get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        expiryDate: doc.data().expiryDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      } as Product));
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  static async addProduct(product: Omit<Product, 'id'>): Promise<Product> {
    try {
      const docRef = await firestore()
        .collection(collections.products)
        .add({
          ...product,
          createdAt: firestore.FieldValue.serverTimestamp(),
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });

      const doc = await docRef.get();
      return {
        id: doc.id,
        ...doc.data(),
        expiryDate: doc.data()?.expiryDate?.toDate(),
        createdAt: doc.data()?.createdAt?.toDate(),
        updatedAt: doc.data()?.updatedAt?.toDate(),
      } as Product;
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  }

  static async updateProduct(productId: string, updates: Partial<Product>): Promise<void> {
    try {
      await firestore()
        .collection(collections.products)
        .doc(productId)
        .update({
          ...updates,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  static async deleteProduct(productId: string): Promise<void> {
    try {
      await firestore()
        .collection(collections.products)
        .doc(productId)
        .delete();
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  // Shopping Lists
  static async getShoppingLists(userId: string, familyId?: string): Promise<ShoppingList[]> {
    try {
      let query: FirebaseFirestoreTypes.Query = firestore()
        .collection(collections.shoppingLists);

      if (familyId) {
        query = query.where('familyId', '==', familyId);
      } else {
        query = query.where('ownerId', '==', userId)
          .where('sharedWith', 'array-contains', userId);
      }

      const snapshot = await query.get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      } as ShoppingList));
    } catch (error) {
      console.error('Error fetching shopping lists:', error);
      throw error;
    }
  }

  static async addShoppingList(list: Omit<ShoppingList, 'id'>): Promise<ShoppingList> {
    try {
      const docRef = await firestore()
        .collection(collections.shoppingLists)
        .add({
          ...list,
          createdAt: firestore.FieldValue.serverTimestamp(),
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });

      const doc = await docRef.get();
      return {
        id: doc.id,
        ...doc.data(),
      } as ShoppingList;
    } catch (error) {
      console.error('Error adding shopping list:', error);
      throw error;
    }
  }

  static async updateShoppingList(listId: string, updates: Partial<ShoppingList>): Promise<void> {
    try {
      await firestore()
        .collection(collections.shoppingLists)
        .doc(listId)
        .update({
          ...updates,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });
    } catch (error) {
      console.error('Error updating shopping list:', error);
      throw error;
    }
  }

  // Recipes
  static async getRecipes(filters?: {
    ingredients?: string[];
    diet?: string[];
    maxTime?: number;
    difficulty?: string;
  }): Promise<Recipe[]> {
    try {
      let query: FirebaseFirestoreTypes.Query = firestore()
        .collection(collections.recipes);

      if (filters?.diet && filters.diet.length > 0) {
        query = query.where('diet', 'array-contains-any', filters.diet);
      }

      if (filters?.difficulty) {
        query = query.where('difficulty', '==', filters.difficulty);
      }

      if (filters?.maxTime) {
        query = query.where('prepTime', '<=', filters.maxTime);
      }

      const snapshot = await query.get();
      let recipes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Recipe));

      // Filtrowanie po składnikach (client-side)
      if (filters?.ingredients && filters.ingredients.length > 0) {
        recipes = recipes.filter(recipe => {
          const recipeIngredients = recipe.ingredients.map(i => i.name.toLowerCase());
          return filters.ingredients!.some(ingredient => 
            recipeIngredients.includes(ingredient.toLowerCase())
          );
        });
      }

      return recipes;
    } catch (error) {
      console.error('Error fetching recipes:', error);
      throw error;
    }
  }

  // Meal Plans
  static async getMealPlans(familyId: string, startDate: Date, endDate: Date): Promise<MealPlan[]> {
    try {
      const snapshot = await firestore()
        .collection(collections.mealPlans)
        .where('familyId', '==', familyId)
        .where('date', '>=', startDate)
        .where('date', '<=', endDate)
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate(),
      } as MealPlan));
    } catch (error) {
      console.error('Error fetching meal plans:', error);
      throw error;
    }
  }

  static async saveMealPlan(mealPlan: Omit<MealPlan, 'id'>): Promise<MealPlan> {
    try {
      const docRef = await firestore()
        .collection(collections.mealPlans)
        .add(mealPlan);

      const doc = await docRef.get();
      return {
        id: doc.id,
        ...doc.data(),
      } as MealPlan;
    } catch (error) {
      console.error('Error saving meal plan:', error);
      throw error;
    }
  }

  // Families
  static async getFamily(familyId: string): Promise<Family | null> {
    try {
      const doc = await firestore()
        .collection(collections.families)
        .doc(familyId)
        .get();

      if (!doc.exists) return null;

      return {
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data()?.createdAt?.toDate(),
      } as Family;
    } catch (error) {
      console.error('Error fetching family:', error);
      throw error;
    }
  }

  static async createFamily(family: Omit<Family, 'id'>): Promise<Family> {
    try {
      const docRef = await firestore()
        .collection(collections.families)
        .add({
          ...family,
          createdAt: firestore.FieldValue.serverTimestamp(),
        });

      const doc = await docRef.get();
      return {
        id: doc.id,
        ...doc.data(),
      } as Family;
    } catch (error) {
      console.error('Error creating family:', error);
      throw error;
    }
  }

  static async updateFamily(familyId: string, updates: Partial<Family>): Promise<void> {
    try {
      await firestore()
        .collection(collections.families)
        .doc(familyId)
        .update(updates);
    } catch (error) {
      console.error('Error updating family:', error);
      throw error;
    }
  }

  // Real-time listeners
  static subscribeToProducts(
    userId: string, 
    familyId: string | undefined,
    callback: (products: Product[]) => void
  ): () => void {
    let query: FirebaseFirestoreTypes.Query = firestore()
      .collection(collections.products);

    if (familyId) {
      query = query.where('familyId', '==', familyId);
    } else {
      query = query.where('ownerId', '==', userId);
    }

    const unsubscribe = query.onSnapshot(
      snapshot => {
        const products = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          expiryDate: doc.data().expiryDate?.toDate(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        } as Product));
        callback(products);
      },
      error => {
        console.error('Products subscription error:', error);
      }
    );

    return unsubscribe;
  }

  static subscribeToShoppingLists(
    userId: string,
    familyId: string | undefined,
    callback: (lists: ShoppingList[]) => void
  ): () => void {
    let query: FirebaseFirestoreTypes.Query = firestore()
      .collection(collections.shoppingLists);

    if (familyId) {
      query = query.where('familyId', '==', familyId);
    } else {
      query = query.where('ownerId', '==', userId);
    }

    const unsubscribe = query.onSnapshot(
      snapshot => {
        const lists = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        } as ShoppingList));
        callback(lists);
      },
      error => {
        console.error('Shopping lists subscription error:', error);
      }
    );

    return unsubscribe;
  }

  // Eco Stats
  static async getEcoStats(userId: string): Promise<EcoStats | null> {
    try {
      const doc = await firestore()
        .collection(collections.ecoStats)
        .doc(userId)
        .get();

      if (!doc.exists) return null;

      return {
        ...doc.data(),
        lastUpdated: doc.data()?.lastUpdated?.toDate(),
      } as EcoStats;
    } catch (error) {
      console.error('Error fetching eco stats:', error);
      throw error;
    }
  }

  // User Preferences
  static async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    try {
      const doc = await firestore()
        .collection(collections.userPreferences)
        .doc(userId)
        .get();

      if (!doc.exists) return null;

      return doc.data() as UserPreferences;
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      throw error;
    }
  }

  static async updateUserPreferences(
    userId: string, 
    preferences: Partial<UserPreferences>
  ): Promise<void> {
    try {
      await firestore()
        .collection(collections.userPreferences)
        .doc(userId)
        .set(preferences, { merge: true });
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw error;
    }
  }

  // Notifications
  static async getNotifications(userId: string): Promise<Notification[]> {
    try {
      const snapshot = await firestore()
        .collection(collections.notifications)
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(50)
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      } as Notification));
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  static async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      await firestore()
        .collection(collections.notifications)
        .doc(notificationId)
        .update({ read: true });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }
}
