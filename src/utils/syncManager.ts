// Sync Manager for offline/online data synchronization

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-netinfo/netinfo';
import { FirestoreService } from '../services/firebase/firestore';
import { Product, Recipe, ShoppingList, PendingChange, SyncState } from '../types/models';

export interface SyncManagerConfig {
  autoSync: boolean;
  syncInterval: number; // milliseconds
  maxRetries: number;
  retryDelay: number; // milliseconds
  batchSize: number;
  wifiOnly: boolean;
  backgroundSync: boolean;
}

export interface SyncResult {
  success: boolean;
  synced: number;
  failed: number;
  errors: string[];
  duration: number;
}

export interface ConflictResolution {
  strategy: 'local' | 'remote' | 'merge' | 'manual';
  resolveConflict?: (local: any, remote: any) => any;
}

class SyncManager {
  private config: SyncManagerConfig;
  private isOnline: boolean = true;
  private isSyncing: boolean = false;
  private syncTimer: NodeJS.Timeout | null = null;
  private pendingChanges: Map<string, PendingChange> = new Map();
  private listeners: Set<(state: SyncState) => void> = new Set();

  constructor(config: Partial<SyncManagerConfig> = {}) {
    this.config = {
      autoSync: true,
      syncInterval: 30000, // 30 seconds
      maxRetries: 3,
      retryDelay: 5000, // 5 seconds
      batchSize: 10,
      wifiOnly: false,
      backgroundSync: true,
      ...config,
    };

    this.initialize();
  }

  private async initialize(): Promise<void> {
    // Load pending changes from storage
    await this.loadPendingChanges();

    // Setup network listener
    this.setupNetworkListener();

    // Start auto sync if enabled
    if (this.config.autoSync) {
      this.startAutoSync();
    }
  }

  private async setupNetworkListener(): Promise<void> {
    NetInfo.addEventListener(state => {
      const wasOffline = !this.isOnline;
      this.isOnline = state.isConnected ?? false;

      // If we just came back online, trigger sync
      if (wasOffline && this.isOnline && this.pendingChanges.size > 0) {
        this.sync();
      }

      this.notifyListeners();
    });

    // Get initial network state
    const state = await NetInfo.fetch();
    this.isOnline = state.isConnected ?? false;
  }

  private startAutoSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
    }

    this.syncTimer = setInterval(() => {
      if (this.shouldSync()) {
        this.sync();
      }
    }, this.config.syncInterval);
  }

  private stopAutoSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
  }

  private shouldSync(): boolean {
    if (!this.isOnline || this.isSyncing || this.pendingChanges.size === 0) {
      return false;
    }

    // Check if we should only sync on WiFi
    if (this.config.wifiOnly) {
      // This would need to check connection type
      // For now, we'll assume any connection is fine
    }

    return true;
  }

  // Public API
  public async addPendingChange(change: Omit<PendingChange, 'id' | 'timestamp' | 'retryCount'>): Promise<void> {
    const pendingChange: PendingChange = {
      ...change,
      id: `${Date.now()}_${Math.random()}`,
      timestamp: new Date(),
      retryCount: 0,
      priority: change.priority || 'normal',
    };

    this.pendingChanges.set(pendingChange.id, pendingChange);
    await this.savePendingChanges();
    this.notifyListeners();

    // Try immediate sync if online
    if (this.isOnline && !this.isSyncing) {
      this.sync();
    }
  }

  public async sync(force: boolean = false): Promise<SyncResult> {
    if (this.isSyncing && !force) {
      throw new Error('Sync already in progress');
    }

    if (!this.isOnline) {
      throw new Error('Cannot sync while offline');
    }

    this.isSyncing = true;
    const startTime = Date.now();
    const result: SyncResult = {
      success: true,
      synced: 0,
      failed: 0,
      errors: [],
      duration: 0,
    };

    try {
      this.notifyListeners();

      // Get pending changes sorted by priority and timestamp
      const changes = Array.from(this.pendingChanges.values())
        .filter(change => change.retryCount < this.config.maxRetries)
        .sort((a, b) => {
          const priorityOrder = { high: 3, normal: 2, low: 1 };
          const aPriority = priorityOrder[a.priority];
          const bPriority = priorityOrder[b.priority];
          
          if (aPriority !== bPriority) {
            return bPriority - aPriority;
          }
          
          return a.timestamp.getTime() - b.timestamp.getTime();
        });

      // Process changes in batches
      const batches = this.createBatches(changes, this.config.batchSize);

      for (const batch of batches) {
        const batchResult = await this.processBatch(batch);
        result.synced += batchResult.synced;
        result.failed += batchResult.failed;
        result.errors.push(...batchResult.errors);
      }

      // Save updated pending changes
      await this.savePendingChanges();
      
    } catch (error) {
      result.success = false;
      result.errors.push(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      this.isSyncing = false;
      result.duration = Date.now() - startTime;
      this.notifyListeners();
    }

    return result;
  }

  private async processBatch(batch: PendingChange[]): Promise<{ synced: number; failed: number; errors: string[] }> {
    const result = { synced: 0, failed: 0, errors: [] };

    for (const change of batch) {
      try {
        await this.processChange(change);
        this.pendingChanges.delete(change.id);
        result.synced++;
      } catch (error) {
        change.retryCount++;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        result.errors.push(`${change.id}: ${errorMessage}`);
        result.failed++;

        // Remove change if max retries exceeded
        if (change.retryCount >= this.config.maxRetries) {
          this.pendingChanges.delete(change.id);
        }
      }
    }

    return result;
  }

  private async processChange(change: PendingChange): Promise<void> {
    switch (change.entity) {
      case 'product':
        await this.syncProduct(change);
        break;
      case 'recipe':
        await this.syncRecipe(change);
        break;
      case 'shoppingList':
        await this.syncShoppingList(change);
        break;
      default:
        throw new Error(`Unknown entity type: ${change.entity}`);
    }
  }

  private async syncProduct(change: PendingChange): Promise<void> {
    switch (change.type) {
      case 'create':
        await FirestoreService.createProduct(change.data);
        break;
      case 'update':
        await FirestoreService.updateProduct(change.entityId, change.data);
        break;
      case 'delete':
        await FirestoreService.deleteProduct(change.entityId);
        break;
      default:
        throw new Error(`Unknown change type: ${change.type}`);
    }
  }

  private async syncRecipe(change: PendingChange): Promise<void> {
    switch (change.type) {
      case 'create':
        await FirestoreService.createRecipe(change.data);
        break;
      case 'update':
        await FirestoreService.updateRecipe(change.entityId, change.data);
        break;
      case 'delete':
        await FirestoreService.deleteRecipe(change.entityId);
        break;
      default:
        throw new Error(`Unknown change type: ${change.type}`);
    }
  }

  private async syncShoppingList(change: PendingChange): Promise<void> {
    switch (change.type) {
      case 'create':
        await FirestoreService.createShoppingList(change.data);
        break;
      case 'update':
        await FirestoreService.updateShoppingList(change.entityId, change.data);
        break;
      case 'delete':
        await FirestoreService.deleteShoppingList(change.entityId);
        break;
      default:
        throw new Error(`Unknown change type: ${change.type}`);
    }
  }

  public async resolveConflict(
    localData: any,
    remoteData: any,
    resolution: ConflictResolution
  ): Promise<any> {
    switch (resolution.strategy) {
      case 'local':
        return localData;
      case 'remote':
        return remoteData;
      case 'merge':
        return this.mergeData(localData, remoteData);
      case 'manual':
        if (resolution.resolveConflict) {
          return resolution.resolveConflict(localData, remoteData);
        }
        throw new Error('Manual resolution function not provided');
      default:
        throw new Error(`Unknown resolution strategy: ${resolution.strategy}`);
    }
  }

  private mergeData(local: any, remote: any): any {
    // Simple merge strategy - remote wins for conflicts, keep local additions
    const merged = { ...local };
    
    Object.keys(remote).forEach(key => {
      if (remote[key] !== undefined) {
        // If remote has a newer timestamp, use remote value
        if (remote.updatedAt && local.updatedAt) {
          if (new Date(remote.updatedAt) > new Date(local.updatedAt)) {
            merged[key] = remote[key];
          }
        } else {
          merged[key] = remote[key];
        }
      }
    });

    return merged;
  }

  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }

  private async loadPendingChanges(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('pendingChanges');
      if (stored) {
        const changes: PendingChange[] = JSON.parse(stored);
        this.pendingChanges.clear();
        changes.forEach(change => {
          change.timestamp = new Date(change.timestamp);
          this.pendingChanges.set(change.id, change);
        });
      }
    } catch (error) {
      console.error('Failed to load pending changes:', error);
    }
  }

  private async savePendingChanges(): Promise<void> {
    try {
      const changes = Array.from(this.pendingChanges.values());
      await AsyncStorage.setItem('pendingChanges', JSON.stringify(changes));
    } catch (error) {
      console.error('Failed to save pending changes:', error);
    }
  }

  // Listener management
  public addListener(listener: (state: SyncState) => void): () => void {
    this.listeners.add(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    const state: SyncState = {
      lastSyncAt: new Date(),
      pendingChanges: Array.from(this.pendingChanges.values()),
      isSyncing: this.isSyncing,
      syncError: null,
      conflictResolution: 'local',
      autoSync: this.config.autoSync,
      syncOnWifiOnly: this.config.wifiOnly,
    };

    this.listeners.forEach(listener => {
      try {
        listener(state);
      } catch (error) {
        console.error('Error in sync listener:', error);
      }
    });
  }

  // Configuration management
  public updateConfig(newConfig: Partial<SyncManagerConfig>): void {
    this.config = { ...this.config, ...newConfig };

    // Restart auto sync if interval changed
    if (newConfig.autoSync !== undefined || newConfig.syncInterval !== undefined) {
      this.stopAutoSync();
      if (this.config.autoSync) {
        this.startAutoSync();
      }
    }
  }

  public getConfig(): SyncManagerConfig {
    return { ...this.config };
  }

  // Status methods
  public isOnlineStatus(): boolean {
    return this.isOnline;
  }

  public isSyncingStatus(): boolean {
    return this.isSyncing;
  }

  public getPendingChangesCount(): number {
    return this.pendingChanges.size;
  }

  public getPendingChanges(): PendingChange[] {
    return Array.from(this.pendingChanges.values());
  }

  public async clearPendingChanges(): Promise<void> {
    this.pendingChanges.clear();
    await this.savePendingChanges();
    this.notifyListeners();
  }

  // Cleanup
  public destroy(): void {
    this.stopAutoSync();
    this.listeners.clear();
    this.pendingChanges.clear();
  }

  // Static methods for convenience
  public static async createProductChange(
    type: 'create' | 'update' | 'delete',
    productId: string,
    data: any,
    userId: string,
    deviceId: string
  ): Promise<Omit<PendingChange, 'id' | 'timestamp' | 'retryCount'>> {
    return {
      type,
      entity: 'product',
      entityId: productId,
      data,
      userId,
      deviceId,
      priority: 'normal',
    };
  }

  public static async createRecipeChange(
    type: 'create' | 'update' | 'delete',
    recipeId: string,
    data: any,
    userId: string,
    deviceId: string
  ): Promise<Omit<PendingChange, 'id' | 'timestamp' | 'retryCount'>> {
    return {
      type,
      entity: 'recipe',
      entityId: recipeId,
      data,
      userId,
      deviceId,
      priority: 'normal',
    };
  }

  public static async createShoppingListChange(
    type: 'create' | 'update' | 'delete',
    listId: string,
    data: any,
    userId: string,
    deviceId: string
  ): Promise<Omit<PendingChange, 'id' | 'timestamp' | 'retryCount'>> {
    return {
      type,
      entity: 'shoppingList',
      entityId: listId,
      data,
      userId,
      deviceId,
      priority: 'normal',
    };
  }
}

// Create and export singleton instance
export const syncManager = new SyncManager();

// Export class for custom instances
export { SyncManager };

// Export utility functions
export const createOfflineProduct = async (
  product: Omit<Product, 'id'>,
  userId: string,
  deviceId: string
): Promise<Product> => {
  const id = `offline_product_${Date.now()}`;
  const offlineProduct: Product = {
    ...product,
    id,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Add to pending changes
  const change = await SyncManager.createProductChange(
    'create',
    id,
    offlineProduct,
    userId,
    deviceId
  );
  
  await syncManager.addPendingChange(change);

  return offlineProduct;
};

export const updateOfflineProduct = async (
  productId: string,
  updates: Partial<Product>,
  userId: string,
  deviceId: string
): Promise<void> => {
  const change = await SyncManager.createProductChange(
    'update',
    productId,
    { ...updates, updatedAt: new Date() },
    userId,
    deviceId
  );
  
  await syncManager.addPendingChange(change);
};

export const deleteOfflineProduct = async (
  productId: string,
  userId: string,
  deviceId: string
): Promise<void> => {
  const change = await SyncManager.createProductChange(
    'delete',
    productId,
    { deletedAt: new Date() },
    userId,
    deviceId
  );
  
  await syncManager.addPendingChange(change);
};

// Similar functions for recipes and shopping lists...
export const createOfflineRecipe = async (
  recipe: Omit<Recipe, 'id'>,
  userId: string,
  deviceId: string
): Promise<Recipe> => {
  const id = `offline_recipe_${Date.now()}`;
  const offlineRecipe: Recipe = {
    ...recipe,
    id,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const change = await SyncManager.createRecipeChange(
    'create',
    id,
    offlineRecipe,
    userId,
    deviceId
  );
  
  await syncManager.addPendingChange(change);

  return offlineRecipe;
};

export const createOfflineShoppingList = async (
  list: Omit<ShoppingList, 'id'>,
  userId: string,
  deviceId: string
): Promise<ShoppingList> => {
  const id = `offline_list_${Date.now()}`;
  const offlineList: ShoppingList = {
    ...list,
    id,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const change = await SyncManager.createShoppingListChange(
    'create',
    id,
    offlineList,
    userId,
    deviceId
  );
  
  await syncManager.addPendingChange(change);

  return offlineList;
};
