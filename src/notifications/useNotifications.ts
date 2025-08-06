import { useState, useEffect, useCallback, useRef } from 'react';
import type { 
  Notification, 
  NotificationType,
  Product, 
  UserPreferences 
} from '../types';
import NotificationManager from './NotificationManager';

// Hook for managing notifications
export const useNotifications = (userPreferences?: UserPreferences) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const isInitialized = useRef(false);

  // Initialize notification manager
  useEffect(() => {
    const initializeNotifications = async () => {
      if (userPreferences && !isInitialized.current) {
        try {
          await NotificationManager.initialize(userPreferences);
          isInitialized.current = true;
        } catch (error) {
          console.error('Failed to initialize notifications:', error);
        }
      }
      setIsLoading(false);
    };

    initializeNotifications();
  }, [userPreferences]);

  // Subscribe to notification changes
  useEffect(() => {
    const unsubscribe = NotificationManager.subscribe((newNotifications) => {
      setNotifications(newNotifications);
      setUnreadCount(newNotifications.filter(n => !n.read).length);
    });

    // Load initial notifications
    const initialNotifications = NotificationManager.getNotifications();
    setNotifications(initialNotifications);
    setUnreadCount(NotificationManager.getUnreadCount());

    return unsubscribe;
  }, []);

  // Update preferences
  const updatePreferences = useCallback((preferences: UserPreferences) => {
    NotificationManager.updatePreferences(preferences);
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    await NotificationManager.markAsRead(notificationId);
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    await NotificationManager.markAllAsRead();
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    await NotificationManager.deleteNotification(notificationId);
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(async () => {
    await NotificationManager.clearAllNotifications();
  }, []);

  // Add custom notification
  const addNotification = useCallback(async (
    notification: Omit<Notification, 'id' | 'createdAt' | 'read'>
  ) => {
    return await NotificationManager.addNotification(notification);
  }, []);

  // Check expiry notifications
  const checkExpiryNotifications = useCallback(async (products: Product[]) => {
    await NotificationManager.checkExpiryNotifications(products);
  }, []);

  // Add family update notification
  const addFamilyUpdateNotification = useCallback(async (
    type: 'product_added' | 'product_consumed' | 'shopping_list_updated',
    data: {
      userName: string;
      productName?: string;
      familyName: string;
    }
  ) => {
    await NotificationManager.addFamilyUpdateNotification(type, data);
  }, []);

  // Add achievement notification
  const addAchievementNotification = useCallback(async (achievement: {
    id: string;
    name: string;
    description: string;
    points: number;
  }) => {
    await NotificationManager.addAchievementNotification(achievement);
  }, []);

  // Add recipe suggestion notification
  const addRecipeSuggestionNotification = useCallback(async (
    recipeName: string,
    matchingIngredients: number,
    recipeId: string
  ) => {
    await NotificationManager.addRecipeSuggestionNotification(
      recipeName,
      matchingIngredients,
      recipeId
    );
  }, []);

  // Get notifications by type
  const getNotificationsByType = useCallback((type: NotificationType) => {
    return NotificationManager.getNotificationsByType(type);
  }, []);

  // Search notifications
  const searchNotifications = useCallback((query: string) => {
    return NotificationManager.searchNotifications(query);
  }, []);

  // Get unread notifications
  const getUnreadNotifications = useCallback(() => {
    return NotificationManager.getUnreadNotifications();
  }, []);

  // Get formatted time for notification
  const getFormattedTime = useCallback((date: Date) => {
    return NotificationManager.getFormattedTime(date);
  }, []);

  // Get notification statistics
  const getStatistics = useCallback(() => {
    return NotificationManager.getStatistics();
  }, []);

  // Export notifications
  const exportNotifications = useCallback(() => {
    return NotificationManager.exportNotifications();
  }, []);

  // Import notifications
  const importNotifications = useCallback(async (data: string) => {
    await NotificationManager.importNotifications(data);
  }, []);

  // Cleanup old notifications
  const cleanupOldNotifications = useCallback(async (daysToKeep: number = 30) => {
    await NotificationManager.cleanupOldNotifications(daysToKeep);
  }, []);

  return {
    // State
    notifications,
    unreadCount,
    isLoading,
    
    // Actions
    updatePreferences,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    addNotification,
    checkExpiryNotifications,
    addFamilyUpdateNotification,
    addAchievementNotification,
    addRecipeSuggestionNotification,
    
    // Queries
    getNotificationsByType,
    searchNotifications,
    getUnreadNotifications,
    getFormattedTime,
    getStatistics,
    
    // Import/Export
    exportNotifications,
    importNotifications,
    
    // Maintenance
    cleanupOldNotifications
  };
};

// Hook for notification permissions
export const useNotificationPermissions = () => {
  const [permission, setPermission] = useState<'granted' | 'denied' | 'undetermined'>('undetermined');
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);

  // Check current permission status
  const checkPermission = useCallback(async () => {
    try {
      // In React Native, you would check actual permissions
      // For now, simulate permission check
      setPermission('granted');
    } catch (error) {
      console.error('Failed to check notification permission:', error);
      setPermission('denied');
    }
  }, []);

  // Request notification permissions
  const requestPermission = useCallback(async () => {
    if (isRequestingPermission) return permission;

    setIsRequestingPermission(true);
    try {
      // In React Native, you would request actual permissions
      // For now, simulate permission request
      setPermission('granted');
      return 'granted';
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      setPermission('denied');
      return 'denied';
    } finally {
      setIsRequestingPermission(false);
    }
  }, [permission, isRequestingPermission]);

  // Check permission on mount
  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  return {
    permission,
    isRequestingPermission,
    requestPermission,
    checkPermission
  };
};

// Hook for notification scheduling
export const useNotificationScheduler = (preferences?: UserPreferences) => {
  const [scheduledNotifications, setScheduledNotifications] = useState<Map<string, any>>(new Map());

  // Schedule daily expiry check
  const scheduleDailyExpiryCheck = useCallback(async (
    time: { hour: number; minute: number } = { hour: 9, minute: 0 }
  ) => {
    if (!preferences?.notifications.expiryReminders) return;

    try {
      // In a real implementation, this would schedule actual notifications
      const id = 'daily_expiry_check';
      const notification = {
        id,
        title: 'Sprawdź daty ważności',
        body: 'Czas sprawdzić produkty w Twojej spiżarni',
        scheduledTime: time
      };
      
      setScheduledNotifications(prev => new Map(prev.set(id, notification)));
    } catch (error) {
      console.error('Failed to schedule daily expiry check:', error);
    }
  }, [preferences]);

  // Schedule weekly report
  const scheduleWeeklyReport = useCallback(async (
    dayOfWeek: number = 0, // Sunday
    time: { hour: number; minute: number } = { hour: 10, minute: 0 }
  ) => {
    if (!preferences?.notifications.weeklyReport) return;

    try {
      const id = 'weekly_report';
      const notification = {
        id,
        title: 'Cotygodniowy raport',
        body: 'Twój tygodniowy raport spiżarni jest gotowy',
        scheduledTime: { dayOfWeek, ...time }
      };
      
      setScheduledNotifications(prev => new Map(prev.set(id, notification)));
    } catch (error) {
      console.error('Failed to schedule weekly report:', error);
    }
  }, [preferences]);

  // Cancel scheduled notification
  const cancelScheduledNotification = useCallback(async (id: string) => {
    try {
      setScheduledNotifications(prev => {
        const newMap = new Map(prev);
        newMap.delete(id);
        return newMap;
      });
    } catch (error) {
      console.error('Failed to cancel scheduled notification:', error);
    }
  }, []);

  // Cancel all scheduled notifications
  const cancelAllScheduledNotifications = useCallback(async () => {
    try {
      setScheduledNotifications(new Map());
    } catch (error) {
      console.error('Failed to cancel all scheduled notifications:', error);
    }
  }, []);

  // Update schedules when preferences change
  useEffect(() => {
    if (preferences) {
      scheduleDailyExpiryCheck();
      scheduleWeeklyReport();
    }
  }, [preferences, scheduleDailyExpiryCheck, scheduleWeeklyReport]);

  return {
    scheduledNotifications,
    scheduleDailyExpiryCheck,
    scheduleWeeklyReport,
    cancelScheduledNotification,
    cancelAllScheduledNotifications
  };
};

// Hook for notification badge count
export const useNotificationBadge = () => {
  const [badgeCount, setBadgeCount] = useState(0);

  useEffect(() => {
    const unsubscribe = NotificationManager.subscribe((notifications) => {
      const unreadCount = notifications.filter(n => !n.read).length;
      setBadgeCount(unreadCount);
    });

    // Set initial badge count
    setBadgeCount(NotificationManager.getUnreadCount());

    return unsubscribe;
  }, []);

  const clearBadge = useCallback(async () => {
    await NotificationManager.markAllAsRead();
    setBadgeCount(0);
  }, []);

  return {
    badgeCount,
    clearBadge
  };
};
