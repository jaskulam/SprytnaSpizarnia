import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Notification, NotificationPreferences, NotificationChannel, NotificationCategory } from '../../types/models';
import { NotificationService } from '../../services/notification';
import { FirestoreService } from '../../services/firebase/firestore';
import PushNotification from 'react-native-push-notification';
import { RootState } from '../store';

interface NotificationsState {
  notifications: Notification[];
  preferences: NotificationPreferences | null;
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  deviceToken: string | null;
  lastSync: Date | null;
  pushEnabled: boolean;
}

const initialState: NotificationsState = {
  notifications: [],
  preferences: null,
  unreadCount: 0,
  isLoading: false,
  error: null,
  deviceToken: null,
  lastSync: null,
  pushEnabled: false,
};

// Async Thunks
export const initializeNotifications = createAsyncThunk(
  'notifications/initialize',
  async ({ userId }: { userId: string }) => {
    try {
      // Request permission for push notifications
      const permission = await NotificationService.requestPermission();
      
      // Get device token
      const deviceToken = await NotificationService.getDeviceToken();
      
      // Load user preferences
      const preferences = await FirestoreService.getUserNotificationPreferences(userId);
      
      // Load recent notifications
      const notifications = await FirestoreService.getUserNotifications(userId, 50);
      
      // Calculate unread count
      const unreadCount = notifications.filter(n => !n.read).length;
      
      return {
        notifications,
        preferences,
        unreadCount,
        deviceToken,
        pushEnabled: permission === 'granted',
      };
    } catch (error) {
      throw new Error('Failed to initialize notifications');
    }
  }
);

export const sendNotification = createAsyncThunk(
  'notifications/send',
  async ({
    notification,
    channel = 'push',
  }: {
    notification: Omit<Notification, 'id' | 'createdAt'>;
    channel?: NotificationChannel;
  }) => {
    const notificationData: Notification = {
      ...notification,
      id: `notification_${Date.now()}`,
      createdAt: new Date(),
    };
    
    // Save to Firestore
    await FirestoreService.createNotification(notificationData);
    
    // Send via push notification if enabled
    if (channel === 'push' || channel === 'both') {
      await NotificationService.sendPushNotification({
        title: notification.title,
        body: notification.message,
        data: notification.data || {},
      });
    }
    
    return notificationData;
  }
);

export const scheduleNotification = createAsyncThunk(
  'notifications/schedule',
  async ({
    notification,
    scheduledFor,
    repeat,
  }: {
    notification: Omit<Notification, 'id' | 'createdAt'>;
    scheduledFor: Date;
    repeat?: 'daily' | 'weekly' | 'monthly';
  }) => {
    const notificationData: Notification = {
      ...notification,
      id: `scheduled_${Date.now()}`,
      createdAt: new Date(),
      scheduledFor,
      repeat,
    };
    
    // Save to Firestore
    await FirestoreService.createNotification(notificationData);
    
    // Schedule with react-native-push-notification
    PushNotification.localNotificationSchedule({
      title: notification.title,
      message: notification.message,
      date: scheduledFor,
      repeatType: repeat,
      userInfo: notification.data || {},
    });
    
    return notificationData;
  }
);

export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async ({ notificationId }: { notificationId: string }) => {
    await FirestoreService.updateNotification(notificationId, {
      read: true,
      readAt: new Date(),
    });
    
    return notificationId;
  }
);

export const markAllAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async ({ userId }: { userId: string }) => {
    const notifications = await FirestoreService.getUserNotifications(userId);
    const unreadNotifications = notifications.filter(n => !n.read);
    
    const updatePromises = unreadNotifications.map(notification =>
      FirestoreService.updateNotification(notification.id, {
        read: true,
        readAt: new Date(),
      })
    );
    
    await Promise.all(updatePromises);
    
    return unreadNotifications.map(n => n.id);
  }
);

export const deleteNotification = createAsyncThunk(
  'notifications/delete',
  async ({ notificationId }: { notificationId: string }) => {
    await FirestoreService.deleteNotification(notificationId);
    return notificationId;
  }
);

export const updatePreferences = createAsyncThunk(
  'notifications/updatePreferences',
  async ({
    userId,
    preferences,
  }: {
    userId: string;
    preferences: Partial<NotificationPreferences>;
  }) => {
    const updatedPreferences = await FirestoreService.updateUserNotificationPreferences(
      userId,
      preferences
    );
    
    return updatedPreferences;
  }
);

export const testNotification = createAsyncThunk(
  'notifications/test',
  async ({ userId }: { userId: string }) => {
    const testNotification: Omit<Notification, 'id' | 'createdAt'> = {
      userId,
      title: 'Test Notification',
      message: 'This is a test notification to verify your settings work correctly.',
      category: 'system',
      type: 'info',
      read: false,
      data: { test: true },
    };
    
    const notification: Notification = {
      ...testNotification,
      id: `test_${Date.now()}`,
      createdAt: new Date(),
    };
    
    // Send push notification
    await NotificationService.sendPushNotification({
      title: notification.title,
      body: notification.message,
      data: notification.data || {},
    });
    
    return notification;
  }
);

export const fetchNotifications = createAsyncThunk(
  'notifications/fetch',
  async ({ 
    userId, 
    limit = 20, 
    offset = 0 
  }: { 
    userId: string; 
    limit?: number; 
    offset?: number 
  }) => {
    const notifications = await FirestoreService.getUserNotifications(userId, limit, offset);
    return notifications;
  }
);

export const clearOldNotifications = createAsyncThunk(
  'notifications/clearOld',
  async ({ 
    userId, 
    olderThan 
  }: { 
    userId: string; 
    olderThan: Date 
  }) => {
    const deletedIds = await FirestoreService.deleteOldNotifications(userId, olderThan);
    return deletedIds;
  }
);

// Main slice
const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.read) {
        state.unreadCount += 1;
      }
    },
    
    updateNotification: (state, action: PayloadAction<{ id: string; updates: Partial<Notification> }>) => {
      const { id, updates } = action.payload;
      const index = state.notifications.findIndex(n => n.id === id);
      
      if (index !== -1) {
        const wasUnread = !state.notifications[index].read;
        state.notifications[index] = { ...state.notifications[index], ...updates };
        
        // Update unread count
        if (wasUnread && updates.read === true) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        } else if (!wasUnread && updates.read === false) {
          state.unreadCount += 1;
        }
      }
    },
    
    removeNotification: (state, action: PayloadAction<string>) => {
      const index = state.notifications.findIndex(n => n.id === action.payload);
      if (index !== -1) {
        const notification = state.notifications[index];
        if (!notification.read) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.notifications.splice(index, 1);
      }
    },
    
    clearAllNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
    
    setUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = Math.max(0, action.payload);
    },
    
    setDeviceToken: (state, action: PayloadAction<string | null>) => {
      state.deviceToken = action.payload;
    },
    
    setPushEnabled: (state, action: PayloadAction<boolean>) => {
      state.pushEnabled = action.payload;
    },
    
    setPreferences: (state, action: PayloadAction<NotificationPreferences>) => {
      state.preferences = action.payload;
    },
    
    clearError: (state) => {
      state.error = null;
    },
    
    // Optimistic updates
    optimisticMarkAsRead: (state, action: PayloadAction<string>) => {
      const index = state.notifications.findIndex(n => n.id === action.payload);
      if (index !== -1 && !state.notifications[index].read) {
        state.notifications[index].read = true;
        state.notifications[index].readAt = new Date();
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    
    optimisticDelete: (state, action: PayloadAction<string>) => {
      const index = state.notifications.findIndex(n => n.id === action.payload);
      if (index !== -1) {
        const notification = state.notifications[index];
        if (!notification.read) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.notifications.splice(index, 1);
      }
    },
  },
  
  extraReducers: (builder) => {
    // Initialize notifications
    builder
      .addCase(initializeNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(initializeNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = action.payload.notifications;
        state.preferences = action.payload.preferences;
        state.unreadCount = action.payload.unreadCount;
        state.deviceToken = action.payload.deviceToken;
        state.pushEnabled = action.payload.pushEnabled;
        state.lastSync = new Date();
      })
      .addCase(initializeNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to initialize notifications';
      });
    
    // Send notification
    builder
      .addCase(sendNotification.fulfilled, (state, action) => {
        state.notifications.unshift(action.payload);
        if (!action.payload.read) {
          state.unreadCount += 1;
        }
      })
      .addCase(sendNotification.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to send notification';
      });
    
    // Schedule notification
    builder
      .addCase(scheduleNotification.fulfilled, (state, action) => {
        state.notifications.unshift(action.payload);
      })
      .addCase(scheduleNotification.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to schedule notification';
      });
    
    // Mark as read
    builder
      .addCase(markAsRead.fulfilled, (state, action) => {
        const index = state.notifications.findIndex(n => n.id === action.payload);
        if (index !== -1 && !state.notifications[index].read) {
          state.notifications[index].read = true;
          state.notifications[index].readAt = new Date();
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markAsRead.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to mark as read';
      });
    
    // Mark all as read
    builder
      .addCase(markAllAsRead.fulfilled, (state, action) => {
        action.payload.forEach(notificationId => {
          const index = state.notifications.findIndex(n => n.id === notificationId);
          if (index !== -1) {
            state.notifications[index].read = true;
            state.notifications[index].readAt = new Date();
          }
        });
        state.unreadCount = 0;
      })
      .addCase(markAllAsRead.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to mark all as read';
      });
    
    // Delete notification
    builder
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const index = state.notifications.findIndex(n => n.id === action.payload);
        if (index !== -1) {
          const notification = state.notifications[index];
          if (!notification.read) {
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          }
          state.notifications.splice(index, 1);
        }
      })
      .addCase(deleteNotification.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to delete notification';
      });
    
    // Update preferences
    builder
      .addCase(updatePreferences.fulfilled, (state, action) => {
        state.preferences = action.payload;
      })
      .addCase(updatePreferences.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to update preferences';
      });
    
    // Test notification
    builder
      .addCase(testNotification.fulfilled, (state, action) => {
        state.notifications.unshift(action.payload);
        state.unreadCount += 1;
      })
      .addCase(testNotification.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to send test notification';
      });
    
    // Fetch notifications
    builder
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.notifications = action.payload;
        state.unreadCount = action.payload.filter(n => !n.read).length;
        state.lastSync = new Date();
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to fetch notifications';
      });
    
    // Clear old notifications
    builder
      .addCase(clearOldNotifications.fulfilled, (state, action) => {
        action.payload.forEach(id => {
          const index = state.notifications.findIndex(n => n.id === id);
          if (index !== -1) {
            const notification = state.notifications[index];
            if (!notification.read) {
              state.unreadCount = Math.max(0, state.unreadCount - 1);
            }
            state.notifications.splice(index, 1);
          }
        });
      })
      .addCase(clearOldNotifications.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to clear old notifications';
      });
  },
});

export const {
  addNotification,
  updateNotification,
  removeNotification,
  clearAllNotifications,
  setUnreadCount,
  setDeviceToken,
  setPushEnabled,
  setPreferences,
  clearError,
  optimisticMarkAsRead,
  optimisticDelete,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;
