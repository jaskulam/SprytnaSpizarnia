import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product } from '@/types/models';

// Offline queue item types
type QueueItem =
  | { type: 'add'; data: Product; timestamp: number }
  | { type: 'update'; id: string; data: Partial<Product>; timestamp: number }
  | { type: 'delete'; id: string; timestamp: number };

class ProductsService {
  private collection = firestore().collection('products');
  private offlineQueue: QueueItem[] = [];
  private OFFLINE_STORAGE_KEY = '@products_offline_queue';

  // Load offline queue on init
  async loadOfflineQueue(): Promise<void> {
    try {
      const queue = await AsyncStorage.getItem(this.OFFLINE_STORAGE_KEY);
      if (queue) {
        this.offlineQueue = JSON.parse(queue);
      }
    } catch (error) {
      console.error('Error loading offline queue:', error);
    }
  }

  // Save offline queue
  private async saveOfflineQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem(this.OFFLINE_STORAGE_KEY, JSON.stringify(this.offlineQueue));
    } catch (error) {
      console.error('Error saving offline queue:', error);
    }
  }

  // Add product
  async addProduct(product: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
    const netInfo = await NetInfo.fetch();

    const newProduct: Product = {
      ...product,
      id: '',
      createdAt: new Date(),
    } as Product;

    if (netInfo.isConnected) {
      try {
        const docRef = await this.collection.add({
          ...newProduct,
          createdAt: firestore.FieldValue.serverTimestamp(),
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });
        newProduct.id = docRef.id;
        return newProduct;
      } catch (error) {
        // If online but failed, add to offline queue
        this.offlineQueue.push({ type: 'add', data: newProduct, timestamp: Date.now() });
        await this.saveOfflineQueue();
        throw error;
      }
    } else {
      // Offline - add to queue
      newProduct.id = `offline_${Date.now()}`;
      this.offlineQueue.push({ type: 'add', data: newProduct, timestamp: Date.now() });
      await this.saveOfflineQueue();
      return newProduct;
    }
  }

  // Get products for user (with family sharing)
  async getProducts(userId: string): Promise<Product[]> {
    try {
      // Get user's family members
      const userDoc = await firestore().collection('users').doc(userId).get();
      const familyMembers: string[] = userDoc.data()?.familyMembers || [];
      const allUserIds = [userId, ...familyMembers];

      // Firestore 'in' queries allow up to 10 values
      const chunks: string[][] = [];
      for (let i = 0; i < allUserIds.length; i += 10) {
        chunks.push(allUserIds.slice(i, i + 10));
      }

      const results: Product[] = [];
      for (const chunk of chunks) {
        const snapshot = await this.collection
          .where('ownerId', 'in', chunk)
          .orderBy('expiryDate', 'asc')
          .get();

        snapshot.docs.forEach((doc) => {
          const data = doc.data() as any;
          results.push({
            id: doc.id,
            ...data,
            expiryDate: data?.expiryDate?.toDate?.() ?? data?.expiryDate,
            createdAt: data?.createdAt?.toDate?.() ?? data?.createdAt,
          } as Product);
        });
      }

      // Cache latest
      await AsyncStorage.setItem(`@products_${userId}`, JSON.stringify(results));
      return results;
    } catch (error) {
      console.error('Error fetching products:', error);
      // Return cached data if available
      const cached = await AsyncStorage.getItem(`@products_${userId}`);
      return cached ? JSON.parse(cached) : [];
    }
  }

  // Update product
  async updateProduct(productId: string, updates: Partial<Product>): Promise<void> {
    const netInfo = await NetInfo.fetch();

    if (netInfo.isConnected) {
      try {
        await this.collection.doc(productId).update({
          ...updates,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });
      } catch (error) {
        this.offlineQueue.push({ type: 'update', id: productId, data: updates, timestamp: Date.now() });
        await this.saveOfflineQueue();
        throw error;
      }
    } else {
      this.offlineQueue.push({ type: 'update', id: productId, data: updates, timestamp: Date.now() });
      await this.saveOfflineQueue();
    }
  }

  // Delete product
  async deleteProduct(productId: string): Promise<void> {
    const netInfo = await NetInfo.fetch();

    if (netInfo.isConnected) {
      try {
        await this.collection.doc(productId).delete();
      } catch (error) {
        this.offlineQueue.push({ type: 'delete', id: productId, timestamp: Date.now() });
        await this.saveOfflineQueue();
        throw error;
      }
    } else {
      this.offlineQueue.push({ type: 'delete', id: productId, timestamp: Date.now() });
      await this.saveOfflineQueue();
    }
  }

  // Real-time listener for products
  subscribeToProducts(
    userId: string,
    callback: (products: Product[]) => void
  ): () => void {
    return this.collection
      .where('ownerId', '==', userId)
      .orderBy('expiryDate', 'asc')
      .onSnapshot(
        (snapshot) => {
          const products = snapshot.docs.map((doc) => {
            const data = doc.data() as any;
            return {
              id: doc.id,
              ...data,
              expiryDate: data?.expiryDate?.toDate?.() ?? data?.expiryDate,
              createdAt: data?.createdAt?.toDate?.() ?? data?.createdAt,
            } as Product;
          });

          callback(products);

          // Cache for offline
          AsyncStorage.setItem(`@products_${userId}`, JSON.stringify(products));
        },
        (error) => {
          console.error('Products subscription error:', error);
        }
      );
  }

  // Sync offline queue
  async syncOfflineQueue(): Promise<void> {
    if (this.offlineQueue.length === 0) return;

    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) return;

    const batch = firestore().batch();
    const processedItems: number[] = [];

    for (let i = 0; i < this.offlineQueue.length; i++) {
      const item = this.offlineQueue[i];

      try {
        switch (item.type) {
          case 'add': {
            const docRef = this.collection.doc();
            batch.set(docRef, {
              ...item.data,
              id: docRef.id,
              createdAt: firestore.FieldValue.serverTimestamp(),
              updatedAt: firestore.FieldValue.serverTimestamp(),
            });
            break;
          }
          case 'update': {
            batch.update(this.collection.doc(item.id), {
              ...item.data,
              updatedAt: firestore.FieldValue.serverTimestamp(),
            });
            break;
          }
          case 'delete': {
            batch.delete(this.collection.doc(item.id));
            break;
          }
        }

        processedItems.push(i);
      } catch (error) {
        console.error('Error processing offline item:', error);
      }
    }

    try {
      await batch.commit();

      // Remove processed items from queue
      this.offlineQueue = this.offlineQueue.filter((_, index) => !processedItems.includes(index));
      await this.saveOfflineQueue();
    } catch (error) {
      console.error('Batch commit error:', error);
    }
  }

  // Get products expiring soon
  async getExpiringProducts(userId: string, daysAhead: number = 3): Promise<Product[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    try {
      const snapshot = await this.collection
        .where('ownerId', '==', userId)
        .where('expiryDate', '<=', futureDate)
        .where('expiryDate', '>=', new Date())
        .get();

      return snapshot.docs.map((doc) => {
        const data = doc.data() as any;
        return {
          id: doc.id,
          ...data,
          expiryDate: data?.expiryDate?.toDate?.() ?? data?.expiryDate,
          createdAt: data?.createdAt?.toDate?.() ?? data?.createdAt,
        } as Product;
      });
    } catch (error) {
      console.error('Error fetching expiring products:', error);
      return [];
    }
  }
}

export const productsService = new ProductsService();
export default productsService;
