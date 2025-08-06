import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useMemo, useState } from 'react';
import { RootState, AppDispatch } from '../store/store';
import { 
  requestPermission,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  scheduleReminder,
  cancelReminder,
  updateSettings,
  fetchNotifications
} from '../store/slices/notificationsSlice';
import { Notification, NotificationSettings, NotificationType } from '../types/models';

export interface UseNotificationsReturn {
  // State
  notifications: Notification[];
  settings: NotificationSettings;
  hasPermission: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  requestNotificationPermission: () => Promise<boolean>;
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  deleteNotificationById: (id: string) => Promise<void>;
  scheduleProductReminder: (productId: string, expiryDate: Date) => Promise<void>;
  scheduleShoppingReminder: (listId: string, reminderTime: Date) => Promise<void>;
  cancelProductReminder: (productId: string) => Promise<void>;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => Promise<void>;
  loadNotifications: () => Promise<void>;
  
  // Computed values
  unreadCount: number;
  unreadNotifications: Notification[];
  readNotifications: Notification[];
  notificationsByType: Record<NotificationType, Notification[]>;
  recentNotifications: Notification[];
  isNotificationsEnabled: boolean;
  isQuietHoursActive: boolean;
}

export const useNotifications = (): UseNotificationsReturn => {
  const dispatch = useDispatch<AppDispatch>();
  const notificationsState = useSelector((state: RootState) => state.notifications);
  const { user } = useSelector((state: RootState) => state.auth);
  const [isProcessing, setIsProcessing] = useState(false);

  // Unread notifications
  const unreadNotifications = useMemo(() => 
    notificationsState.notifications.filter(notification => !notification.read)
  , [notificationsState.notifications]);

  // Read notifications
  const readNotifications = useMemo(() => 
    notificationsState.notifications.filter(notification => notification.read)
  , [notificationsState.notifications]);

  // Notifications grouped by type
  const notificationsByType = useMemo(() => {
    const grouped: Record<NotificationType, Notification[]> = {
      expiry: [],
      shopping: [],
      family: [],
      recipe: [],
      system: [],
    };

    notificationsState.notifications.forEach(notification => {
      if (grouped[notification.type]) {
        grouped[notification.type].push(notification);
      }
    });

    return grouped;
  }, [notificationsState.notifications]);

  // Recent notifications (last 7 days)
  const recentNotifications = useMemo(() => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    return notificationsState.notifications
      .filter(notification => new Date(notification.createdAt) >= sevenDaysAgo)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [notificationsState.notifications]);

  // Check if notifications are enabled
  const isNotificationsEnabled = useMemo(() => 
    notificationsState.hasPermission && notificationsState.settings.enabled
  , [notificationsState.hasPermission, notificationsState.settings.enabled]);

  // Check if quiet hours are currently active
  const isQuietHoursActive = useMemo(() => {
    if (!notificationsState.settings.quietHours.enabled) return false;
    
    const now = new Date();
    const currentHour = now.getHours();
    const { startHour, endHour } = notificationsState.settings.quietHours;
    
    if (startHour <= endHour) {
      return currentHour >= startHour && currentHour < endHour;
    } else {
      // Quiet hours span midnight
      return currentHour >= startHour || currentHour < endHour;
    }
  }, [notificationsState.settings.quietHours]);

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    setIsProcessing(true);
    try {
      const granted = await dispatch(requestPermission()).unwrap();
      return granted;
    } catch (error) {
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [dispatch]);

  // Mark notification as read
  const markNotificationAsRead = useCallback(async (id: string) => {
    try {
      await dispatch(markAsRead({ id })).unwrap();
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  // Mark all notifications as read
  const markAllNotificationsAsRead = useCallback(async () => {
    setIsProcessing(true);
    try {
      await dispatch(markAllAsRead()).unwrap();
    } catch (error) {
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [dispatch]);

  // Delete notification
  const deleteNotificationById = useCallback(async (id: string) => {
    try {
      await dispatch(deleteNotification({ id })).unwrap();
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  // Schedule product expiry reminder
  const scheduleProductReminder = useCallback(async (productId: string, expiryDate: Date) => {
    if (!isNotificationsEnabled) return;
    
    try {
      await dispatch(scheduleReminder({
        type: 'expiry',
        productId,
        scheduledDate: expiryDate,
        userId: user?.uid || ''
      })).unwrap();
    } catch (error) {
      throw error;
    }
  }, [dispatch, isNotificationsEnabled, user?.uid]);

  // Schedule shopping reminder
  const scheduleShoppingReminder = useCallback(async (listId: string, reminderTime: Date) => {
    if (!isNotificationsEnabled) return;
    
    try {
      await dispatch(scheduleReminder({
        type: 'shopping',
        listId,
        scheduledDate: reminderTime,
        userId: user?.uid || ''
      })).unwrap();
    } catch (error) {
      throw error;
    }
  }, [dispatch, isNotificationsEnabled, user?.uid]);

  // Cancel product reminder
  const cancelProductReminder = useCallback(async (productId: string) => {
    try {
      await dispatch(cancelReminder({
        type: 'expiry',
        productId
      })).unwrap();
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  // Update notification settings
  const updateNotificationSettings = useCallback(async (settings: Partial<NotificationSettings>) => {
    setIsProcessing(true);
    try {
      await dispatch(updateSettings({ 
        settings,
        userId: user?.uid || ''
      })).unwrap();
    } catch (error) {
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [dispatch, user?.uid]);

  // Load notifications
  const loadNotifications = useCallback(async () => {
    if (!user?.uid) return;
    
    try {
      await dispatch(fetchNotifications({ 
        userId: user.uid 
      })).unwrap();
    } catch (error) {
      throw error;
    }
  }, [dispatch, user?.uid]);

  return {
    // State
    notifications: notificationsState.notifications,
    settings: notificationsState.settings,
    hasPermission: notificationsState.hasPermission,
    isLoading: notificationsState.loading || isProcessing,
    error: notificationsState.error,
    
    // Actions
    requestNotificationPermission,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotificationById,
    scheduleProductReminder,
    scheduleShoppingReminder,
    cancelProductReminder,
    updateNotificationSettings,
    loadNotifications,
    
    // Computed values
    unreadCount: unreadNotifications.length,
    unreadNotifications,
    readNotifications,
    notificationsByType,
    recentNotifications,
    isNotificationsEnabled,
    isQuietHoursActive,
  };
};
