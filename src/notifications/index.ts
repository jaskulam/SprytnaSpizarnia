// Main notifications module exports

// Core notification service and manager
export { default as NotificationService } from './NotificationService';
export { default as NotificationManager } from './NotificationManager';

// React Native helpers
export {
  ReactNativeNotificationHelper,
  NotificationTemplates,
  NotificationScheduler
} from './reactNativeHelpers';

// React components
export { default as NotificationList, NotificationBadge } from './NotificationList';

// React hooks
export {
  useNotifications,
  useNotificationPermissions,
  useNotificationScheduler,
  useNotificationBadge
} from './useNotifications';

// Configuration and utilities
export {
  NOTIFICATION_CONFIG,
  NotificationUtils,
  NOTIFICATION_TYPES
} from './config';

// Types and interfaces
export type {
  NotificationChannel,
  LocalNotificationOptions,
  NotificationAction,
  PushNotificationData,
  NotificationConfigType
} from './reactNativeHelpers';

// Re-export common types from main types module
export type {
  Notification,
  NotificationType,
  UserPreferences
} from '../types';

// Utility functions for easy access
export const createNotificationManager = () => NotificationManager;

export const createNotificationService = () => NotificationService;

// Quick setup function for notification system
export const setupNotifications = async (userPreferences: any) => {
  try {
    // Initialize notification manager
    await NotificationManager.initialize(userPreferences);
    
    // Initialize React Native helpers
    await ReactNativeNotificationHelper.initialize();
    
    // Request permissions
    const hasPermission = await ReactNativeNotificationHelper.requestPermissions();
    
    if (!hasPermission) {
      console.warn('Notification permissions not granted');
    }
    
    return {
      manager: NotificationManager,
      service: NotificationService,
      hasPermission
    };
  } catch (error) {
    console.error('Failed to setup notifications:', error);
    throw error;
  }
};

// Quick notification helpers
export const showQuickNotification = async (
  title: string,
  message: string,
  type: string = 'update'
) => {
  await ReactNativeNotificationHelper.showLocalNotification({
    title,
    body: message,
    channelId: NOTIFICATION_CONFIG.channels.SYSTEM_UPDATES,
    data: { type }
  });
};

export const showExpiryAlert = async (
  productName: string,
  daysUntilExpiry: number
) => {
  const template = NotificationTemplates.createExpiryNotification(
    [{ name: productName, expiryDate: new Date() } as any],
    daysUntilExpiry
  );
  
  await ReactNativeNotificationHelper.showLocalNotification(template);
};

export const showFamilyUpdate = async (
  type: 'product_added' | 'product_consumed' | 'shopping_list_updated',
  userName: string,
  familyName: string,
  productName?: string
) => {
  const template = NotificationTemplates.createFamilyUpdateNotification(type, {
    userName,
    familyName,
    productName
  });
  
  await ReactNativeNotificationHelper.showLocalNotification(template);
};

export const showAchievementNotification = async (
  achievementName: string,
  points: number,
  achievementId: string
) => {
  const template = NotificationTemplates.createAchievementNotification({
    id: achievementId,
    name: achievementName,
    description: '',
    points
  });
  
  await ReactNativeNotificationHelper.showLocalNotification(template);
};

// Debug helpers (for development)
export const debugNotifications = {
  // Test all notification types
  testAllNotifications: async () => {
    const testNotifications = [
      {
        title: 'Test Expiry Alert',
        body: 'Mleko wygasa jutro',
        channelId: NOTIFICATION_CONFIG.channels.EXPIRY_ALERTS
      },
      {
        title: 'Test Family Update',
        body: 'Jan dodał banany do spiżarni',
        channelId: NOTIFICATION_CONFIG.channels.FAMILY_UPDATES
      },
      {
        title: 'Test Achievement',
        body: 'Zdobyłeś osiągnięcie "Mistrz oszczędzania"',
        channelId: NOTIFICATION_CONFIG.channels.ACHIEVEMENTS
      },
      {
        title: 'Test Recipe Suggestion',
        body: 'Możesz zrobić smoothie z 3 dostępnych składników',
        channelId: NOTIFICATION_CONFIG.channels.RECIPE_SUGGESTIONS
      },
      {
        title: 'Test Weekly Report',
        body: 'Twój tygodniowy raport jest gotowy',
        channelId: NOTIFICATION_CONFIG.channels.WEEKLY_REPORTS
      }
    ];

    for (const notification of testNotifications) {
      await ReactNativeNotificationHelper.showLocalNotification(notification);
      // Small delay between notifications
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  },

  // Clear all test notifications
  clearAllNotifications: async () => {
    await ReactNativeNotificationHelper.cancelAllNotifications();
    await NotificationManager.clearAllNotifications();
  },

  // Get notification statistics
  getStats: () => {
    return NotificationManager.getStatistics();
  },

  // Export notification data
  exportData: () => {
    return NotificationManager.exportNotifications();
  }
};

// Default export - notification manager instance
export default NotificationManager;
