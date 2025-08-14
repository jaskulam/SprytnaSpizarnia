import type { Middleware } from '@reduxjs/toolkit';
import { syncPendingChanges as syncProductsPending, fetchProducts } from '../slices/productsSlice';
import { setOnlineStatus as setProductsOnlineStatus } from '../slices/productsSlice';
import { setOnlineStatus as setOfflineOnlineStatus } from '../slices/offlineSlice';

// Triggers background sync when app comes back online or after state rehydration
export const syncMiddleware: Middleware = ({ dispatch, getState }) => next => action => {
  const result = next(action);

  try {
    // When online status flips to true, kick off a sync
    if (
      (action.type === setProductsOnlineStatus.type || action.type === setOfflineOnlineStatus.type) &&
      action.payload === true
    ) {
      const state = getState() as any;
      const isOnline = state.products.isOnline || state.offline.isOnline;
      const hasPending = state.products.pendingChanges > 0;
      if (isOnline) {
        // Always try a sync when we come online; products thunk is idempotent
        (dispatch as any)(syncProductsPending());
      } else if (hasPending) {
        // No-op: will sync on next online event
      }
    }

    // After rehydration, if there are pending changes and we're online, attempt a sync
    if (action.type === 'persist/REHYDRATE') {
      const state = getState() as any;
      const isOnline = state.products.isOnline;
      const hasPending = state.products.pendingChanges > 0;
      if (isOnline && hasPending) {
        (dispatch as any)(syncProductsPending());
      }
    }

    // After a successful sync, refresh the products list to reflect server state
    if (action.type === (syncProductsPending as any).fulfilled.type) {
      (dispatch as any)(fetchProducts());
    }
  } catch {
    // Best-effort middleware; ignore errors to avoid breaking the chain
  }

  return result;
};
