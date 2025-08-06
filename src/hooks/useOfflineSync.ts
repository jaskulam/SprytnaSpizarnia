import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useMemo, useState, useEffect } from 'react';
import { RootState, AppDispatch } from '../store/store';
import { 
  setOfflineMode,
  queueAction,
  processOfflineQueue,
  clearOfflineQueue,
  updateSyncStatus,
  resolveConflict
} from '../store/slices/offlineSlice';
import { OfflineAction, SyncStatus, ConflictResolution } from '../types/models';

export interface UseOfflineSyncReturn {
  // State
  isOffline: boolean;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  pendingActions: OfflineAction[];
  conflicts: any[];
  syncStatus: SyncStatus;
  error: string | null;
  
  // Actions
  enableOfflineMode: () => void;
  disableOfflineMode: () => void;
  queueOfflineAction: (action: Omit<OfflineAction, 'id' | 'timestamp'>) => void;
  syncPendingChanges: () => Promise<void>;
  clearPendingActions: () => void;
  resolveDataConflict: (conflictId: string, resolution: ConflictResolution) => Promise<void>;
  forceFullSync: () => Promise<void>;
  
  // Computed values
  hasPendingChanges: boolean;
  pendingChangesCount: number;
  canSync: boolean;
  syncProgress: number;
  lastSyncAgo: string;
  pendingActionsByType: Record<string, OfflineAction[]>;
}

export const useOfflineSync = (): UseOfflineSyncReturn => {
  const dispatch = useDispatch<AppDispatch>();
  const offlineState = useSelector((state: RootState) => state.offline);
  const { user } = useSelector((state: RootState) => state.auth);
  const [isProcessing, setIsProcessing] = useState(false);

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => {
      dispatch(setOfflineMode(false));
      // Auto-sync when coming back online
      if (offlineState.pendingActions.length > 0) {
        syncPendingChanges();
      }
    };

    const handleOffline = () => {
      dispatch(setOfflineMode(true));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Set initial state
    dispatch(setOfflineMode(!navigator.onLine));

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [dispatch, offlineState.pendingActions.length]);

  // Pending actions grouped by type
  const pendingActionsByType = useMemo(() => {
    const grouped: Record<string, OfflineAction[]> = {};
    
    offlineState.pendingActions.forEach(action => {
      if (!grouped[action.type]) {
        grouped[action.type] = [];
      }
      grouped[action.type].push(action);
    });

    return grouped;
  }, [offlineState.pendingActions]);

  // Calculate last sync time ago
  const lastSyncAgo = useMemo(() => {
    if (!offlineState.lastSyncTime) return 'Never';
    
    const now = new Date();
    const lastSync = new Date(offlineState.lastSyncTime);
    const diffMinutes = Math.floor((now.getTime() - lastSync.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  }, [offlineState.lastSyncTime]);

  // Can sync if online and has user
  const canSync = useMemo(() => 
    !offlineState.isOffline && !!user && !offlineState.isSyncing
  , [offlineState.isOffline, offlineState.isSyncing, user]);

  // Sync progress (mock calculation based on pending actions)
  const syncProgress = useMemo(() => {
    if (!offlineState.isSyncing) return 0;
    // This would be calculated based on actual sync progress
    return Math.min(90, (Date.now() % 10000) / 100);
  }, [offlineState.isSyncing]);

  // Enable offline mode manually
  const enableOfflineMode = useCallback(() => {
    dispatch(setOfflineMode(true));
  }, [dispatch]);

  // Disable offline mode manually
  const disableOfflineMode = useCallback(() => {
    dispatch(setOfflineMode(false));
  }, [dispatch]);

  // Queue an offline action
  const queueOfflineAction = useCallback((action: Omit<OfflineAction, 'id' | 'timestamp'>) => {
    const offlineAction: OfflineAction = {
      ...action,
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      userId: user?.uid || '',
    };
    
    dispatch(queueAction(offlineAction));
  }, [dispatch, user?.uid]);

  // Sync pending changes
  const syncPendingChanges = useCallback(async () => {
    if (!canSync || offlineState.pendingActions.length === 0) return;
    
    setIsProcessing(true);
    try {
      dispatch(updateSyncStatus({ status: 'syncing', progress: 0 }));
      await dispatch(processOfflineQueue()).unwrap();
      dispatch(updateSyncStatus({ 
        status: 'completed', 
        progress: 100,
        lastSyncTime: new Date().toISOString()
      }));
    } catch (error) {
      dispatch(updateSyncStatus({ status: 'error', error: error.message }));
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [dispatch, canSync, offlineState.pendingActions.length]);

  // Clear all pending actions
  const clearPendingActions = useCallback(() => {
    dispatch(clearOfflineQueue());
  }, [dispatch]);

  // Resolve data conflict
  const resolveDataConflict = useCallback(async (conflictId: string, resolution: ConflictResolution) => {
    setIsProcessing(true);
    try {
      await dispatch(resolveConflict({ conflictId, resolution })).unwrap();
    } catch (error) {
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [dispatch]);

  // Force full synchronization
  const forceFullSync = useCallback(async () => {
    if (!canSync) return;
    
    setIsProcessing(true);
    try {
      dispatch(updateSyncStatus({ status: 'syncing', progress: 0 }));
      
      // Clear existing queue and perform full sync
      dispatch(clearOfflineQueue());
      
      // This would trigger a full data synchronization
      // Implementation would depend on your backend sync strategy
      await new Promise(resolve => setTimeout(resolve, 2000)); // Mock sync time
      
      dispatch(updateSyncStatus({ 
        status: 'completed', 
        progress: 100,
        lastSyncTime: new Date().toISOString()
      }));
    } catch (error) {
      dispatch(updateSyncStatus({ status: 'error', error: error.message }));
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [dispatch, canSync]);

  return {
    // State
    isOffline: offlineState.isOffline,
    isSyncing: offlineState.isSyncing || isProcessing,
    lastSyncTime: offlineState.lastSyncTime ? new Date(offlineState.lastSyncTime) : null,
    pendingActions: offlineState.pendingActions,
    conflicts: offlineState.conflicts || [],
    syncStatus: offlineState.syncStatus,
    error: offlineState.error,
    
    // Actions
    enableOfflineMode,
    disableOfflineMode,
    queueOfflineAction,
    syncPendingChanges,
    clearPendingActions,
    resolveDataConflict,
    forceFullSync,
    
    // Computed values
    hasPendingChanges: offlineState.pendingActions.length > 0,
    pendingChangesCount: offlineState.pendingActions.length,
    canSync,
    syncProgress,
    lastSyncAgo,
    pendingActionsByType,
  };
};
