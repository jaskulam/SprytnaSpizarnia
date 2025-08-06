import type { 
  Notification, 
  NotificationType,
  Product, 
  UserPreferences 
} from '../types';

// React Native notification helpers
export interface NotificationChannel {
  id: string;
  name: string;
  description: string;
  importance: 'low' | 'medium' | 'high';
  sound?: boolean;
  vibrate?: boolean;
  showBadge?: boolean;
}

export interface LocalNotificationOptions {
  id?: string;
  title: string;
  body: string;
  channelId?: string;
  smallIcon?: string;
  largeIcon?: string;
  data?: any;
  actions?: NotificationAction[];
  scheduledTime?: Date;
  repeatType?: 'none' | 'daily' | 'weekly';
  sound?: boolean;
  vibrate?: boolean;
  priority?: 'low' | 'medium' | 'high';
}

export interface NotificationAction {
  id: string;
  title: string;
  icon?: string;
  pressAction?: {
    id: string;
    launchActivity?: string;
  };
}

export interface PushNotificationData {
  type: NotificationType;
  title: string;
  body: string;
  data?: any;
  badge?: number;
  sound?: string;
  url?: string;
}

// React Native notification helper class
export class ReactNativeNotificationHelper {
  private static channels: Map<string, NotificationChannel> = new Map();
  private static isInitialized = false;

  // Initialize notification channels
  public static async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Register default channels
      await this.registerDefaultChannels();
      
      // Request permissions
      await this.requestPermissions();
      
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize React Native notifications:', error);
    }
  }

  // Register notification channels (Android)
  private static async registerDefaultChannels(): Promise<void> {
    const defaultChannels: NotificationChannel[] = [
      {
        id: 'expiry_alerts',
        name: 'Alerty o dacie ważności',
        description: 'Powiadomienia o produktach blisko daty ważności',
        importance: 'high',
        sound: true,
        vibrate: true,
        showBadge: true
      },
      {
        id: 'family_updates',
        name: 'Aktualizacje rodziny',
        description: 'Powiadomienia o zmianach w rodzinnej spiżarni',
        importance: 'medium',
        sound: true,
        vibrate: false,
        showBadge: true
      },
      {
        id: 'recipe_suggestions',
        name: 'Sugestie przepisów',
        description: 'Propozycje przepisów na podstawie dostępnych produktów',
        importance: 'medium',
        sound: false,
        vibrate: false,
        showBadge: false
      },
      {
        id: 'achievements',
        name: 'Osiągnięcia',
        description: 'Powiadomienia o zdobytych osiągnięciach',
        importance: 'low',
        sound: true,
        vibrate: true,
        showBadge: false
      },
      {
        id: 'weekly_reports',
        name: 'Raporty tygodniowe',
        description: 'Cotygodniowe podsumowania i statystyki',
        importance: 'low',
        sound: false,
        vibrate: false,
        showBadge: false
      }
    ];

    for (const channel of defaultChannels) {
      await this.createNotificationChannel(channel);
    }
  }

  // Create notification channel
  public static async createNotificationChannel(channel: NotificationChannel): Promise<void> {
    try {
      // For React Native - would use @react-native-async-storage/async-storage or similar
      this.channels.set(channel.id, channel);
      
      // In a real React Native app, you would use:
      // import PushNotification from 'react-native-push-notification';
      // PushNotification.createChannel(channel, () => {});
      
    } catch (error) {
      console.error(`Failed to create channel ${channel.id}:`, error);
    }
  }

  // Request notification permissions
  public static async requestPermissions(): Promise<boolean> {
    try {
      // In React Native, you would use:
      // import PushNotification from 'react-native-push-notification';
      // const permissions = await PushNotification.requestPermissions();
      // return permissions.alert && permissions.badge && permissions.sound;
      
      return true; // Mock for now
    } catch (error) {
      console.error('Failed to request notification permissions:', error);
      return false;
    }
  }

  // Show local notification
  public static async showLocalNotification(options: LocalNotificationOptions): Promise<void> {
    try {
      const notification = {
        id: options.id || Date.now().toString(),
        title: options.title,
        message: options.body,
        channelId: options.channelId || 'default',
        smallIcon: options.smallIcon || 'ic_notification',
        largeIcon: options.largeIcon,
        userInfo: options.data,
        actions: options.actions,
        date: options.scheduledTime || new Date(),
        repeatType: options.repeatType || 'none',
        soundName: options.sound ? 'default' : undefined,
        vibrate: options.vibrate !== false,
        priority: options.priority || 'medium'
      };

      // In React Native, you would use:
      // import PushNotification from 'react-native-push-notification';
      // PushNotification.localNotification(notification);
      
      console.log('Would show local notification:', notification);
    } catch (error) {
      console.error('Failed to show local notification:', error);
    }
  }

  // Cancel notification
  public static async cancelNotification(id: string): Promise<void> {
    try {
      // In React Native:
      // import PushNotification from 'react-native-push-notification';
      // PushNotification.cancelLocalNotifications({ id });
      
      console.log('Would cancel notification:', id);
    } catch (error) {
      console.error('Failed to cancel notification:', error);
    }
  }

  // Cancel all notifications
  public static async cancelAllNotifications(): Promise<void> {
    try {
      // In React Native:
      // import PushNotification from 'react-native-push-notification';
      // PushNotification.cancelAllLocalNotifications();
      
      console.log('Would cancel all notifications');
    } catch (error) {
      console.error('Failed to cancel all notifications:', error);
    }
  }

  // Get delivered notifications
  public static async getDeliveredNotifications(): Promise<any[]> {
    try {
      // In React Native:
      // import PushNotification from 'react-native-push-notification';
      // return new Promise(resolve => {
      //   PushNotification.getDeliveredNotifications(resolve);
      // });
      
      return [];
    } catch (error) {
      console.error('Failed to get delivered notifications:', error);
      return [];
    }
  }

  // Set badge count (iOS)
  public static async setBadgeCount(count: number): Promise<void> {
    try {
      // In React Native:
      // import PushNotification from 'react-native-push-notification';
      // PushNotification.setApplicationIconBadgeNumber(count);
      
      console.log('Would set badge count to:', count);
    } catch (error) {
      console.error('Failed to set badge count:', error);
    }
  }

  // Clear badge (iOS)
  public static async clearBadge(): Promise<void> {
    await this.setBadgeCount(0);
  }
}

// Notification templates for common use cases
export class NotificationTemplates {
  // Expiry notification
  public static createExpiryNotification(
    products: Product[],
    daysBefore: number
  ): LocalNotificationOptions {
    const count = products.length;
    const product = products[0];
    
    if (count === 1) {
      return {
        title: 'Produkt wkrótce się przeterminuje',
        body: `${product.name} wygasa za ${daysBefore} ${daysBefore === 1 ? 'dzień' : 'dni'}`,
        channelId: 'expiry_alerts',
        data: {
          type: 'expiry',
          productIds: [product.id],
          daysBefore
        },
        actions: [
          {
            id: 'view_product',
            title: 'Zobacz produkt'
          },
          {
            id: 'mark_consumed',
            title: 'Oznacz jako zużyty'
          }
        ]
      };
    } else {
      return {
        title: `${count} produktów wkrótce się przeterminuje`,
        body: `Sprawdź produkty w swojej spiżarni`,
        channelId: 'expiry_alerts',
        data: {
          type: 'expiry',
          productIds: products.map(p => p.id),
          daysBefore
        },
        actions: [
          {
            id: 'view_products',
            title: 'Zobacz produkty'
          },
          {
            id: 'dismiss',
            title: 'Odrzuć'
          }
        ]
      };
    }
  }

  // Family update notification
  public static createFamilyUpdateNotification(
    type: 'product_added' | 'product_consumed' | 'shopping_list_updated',
    data: {
      userName: string;
      productName?: string;
      familyName: string;
    }
  ): LocalNotificationOptions {
    let title: string;
    let body: string;

    switch (type) {
      case 'product_added':
        title = 'Nowy produkt w spiżarni';
        body = `${data.userName} dodał ${data.productName} do ${data.familyName}`;
        break;
      case 'product_consumed':
        title = 'Produkt został zużyty';
        body = `${data.userName} oznaczył ${data.productName} jako zużyty`;
        break;
      case 'shopping_list_updated':
        title = 'Lista zakupów zaktualizowana';
        body = `${data.userName} zaktualizował listę zakupów`;
        break;
    }

    return {
      title,
      body,
      channelId: 'family_updates',
      data: {
        type: 'family_update',
        updateType: type,
        ...data
      },
      actions: [
        {
          id: 'view_family',
          title: 'Zobacz rodzinę'
        }
      ]
    };
  }

  // Recipe suggestion notification
  public static createRecipeSuggestionNotification(
    recipeName: string,
    matchingIngredients: number,
    recipeId: string
  ): LocalNotificationOptions {
    return {
      title: 'Sugestia przepisu',
      body: `Możesz przygotować "${recipeName}" z ${matchingIngredients} dostępnych składników`,
      channelId: 'recipe_suggestions',
      data: {
        type: 'recipe_suggestion',
        recipeId,
        matchingIngredients
      },
      actions: [
        {
          id: 'view_recipe',
          title: 'Zobacz przepis'
        },
        {
          id: 'dismiss',
          title: 'Nie teraz'
        }
      ]
    };
  }

  // Achievement notification
  public static createAchievementNotification(achievement: {
    id: string;
    name: string;
    description: string;
    points: number;
    icon?: string;
  }): LocalNotificationOptions {
    return {
      title: 'Nowe osiągnięcie!',
      body: `Zdobyłeś "${achievement.name}" (+${achievement.points} pkt)`,
      channelId: 'achievements',
      largeIcon: achievement.icon,
      data: {
        type: 'achievement',
        achievementId: achievement.id,
        points: achievement.points
      },
      actions: [
        {
          id: 'view_achievements',
          title: 'Zobacz osiągnięcia'
        },
        {
          id: 'share_achievement',
          title: 'Udostępnij'
        }
      ]
    };
  }

  // Weekly report notification
  public static createWeeklyReportNotification(report: {
    productsAdded: number;
    productsConsumed: number;
    wasteReduced: number;
    moneySaved: number;
  }): LocalNotificationOptions {
    return {
      title: 'Cotygodniowy raport spiżarni',
      body: `Dodałeś ${report.productsAdded} produktów, zaoszczędziłeś ${report.moneySaved.toFixed(2)} zł`,
      channelId: 'weekly_reports',
      data: {
        type: 'weekly_report',
        report
      },
      actions: [
        {
          id: 'view_report',
          title: 'Zobacz raport'
        }
      ]
    };
  }

  // Shopping reminder notification
  public static createShoppingReminderNotification(
    itemCount: number,
    urgent: boolean = false
  ): LocalNotificationOptions {
    return {
      title: urgent ? 'Pilne zakupy!' : 'Przypomnienie o zakupach',
      body: `Masz ${itemCount} ${itemCount === 1 ? 'produkt' : 'produktów'} na liście zakupów`,
      channelId: 'family_updates',
      data: {
        type: 'shopping_reminder',
        itemCount,
        urgent
      },
      actions: [
        {
          id: 'view_shopping_list',
          title: 'Zobacz listę'
        },
        {
          id: 'snooze',
          title: 'Przypomnij później'
        }
      ]
    };
  }
}

// Notification scheduler for managing recurring and scheduled notifications
export class NotificationScheduler {
  private static scheduledNotifications: Map<string, any> = new Map();

  // Schedule daily expiry check
  public static async scheduleDailyExpiryCheck(
    preferences: UserPreferences,
    time: { hour: number; minute: number } = { hour: 9, minute: 0 }
  ): Promise<void> {
    const id = 'daily_expiry_check';
    
    if (!preferences.notifications.expiryReminders) {
      await this.cancelScheduledNotification(id);
      return;
    }

    const scheduledTime = new Date();
    scheduledTime.setHours(time.hour, time.minute, 0, 0);
    
    // If time has passed today, schedule for tomorrow
    if (scheduledTime.getTime() <= Date.now()) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const notification: LocalNotificationOptions = {
      id,
      title: 'Sprawdź daty ważności',
      body: 'Czas sprawdzić, czy masz produkty bliskie terminu ważności',
      channelId: 'expiry_alerts',
      scheduledTime,
      repeatType: 'daily',
      data: {
        type: 'expiry_check_reminder'
      }
    };

    await ReactNativeNotificationHelper.showLocalNotification(notification);
    this.scheduledNotifications.set(id, notification);
  }

  // Schedule weekly report
  public static async scheduleWeeklyReport(
    preferences: UserPreferences,
    dayOfWeek: number = 0, // Sunday
    time: { hour: number; minute: number } = { hour: 10, minute: 0 }
  ): Promise<void> {
    const id = 'weekly_report';
    
    if (!preferences.notifications.weeklyReport) {
      await this.cancelScheduledNotification(id);
      return;
    }

    const scheduledTime = new Date();
    const currentDay = scheduledTime.getDay();
    const daysUntilTarget = (dayOfWeek - currentDay + 7) % 7;
    
    scheduledTime.setDate(scheduledTime.getDate() + daysUntilTarget);
    scheduledTime.setHours(time.hour, time.minute, 0, 0);

    const notification: LocalNotificationOptions = {
      id,
      title: 'Cotygodniowy raport gotowy',
      body: 'Zobacz swoje osiągnięcia z ostatniego tygodnia',
      channelId: 'weekly_reports',
      scheduledTime,
      repeatType: 'weekly',
      data: {
        type: 'weekly_report_reminder'
      }
    };

    await ReactNativeNotificationHelper.showLocalNotification(notification);
    this.scheduledNotifications.set(id, notification);
  }

  // Cancel scheduled notification
  public static async cancelScheduledNotification(id: string): Promise<void> {
    await ReactNativeNotificationHelper.cancelNotification(id);
    this.scheduledNotifications.delete(id);
  }

  // Cancel all scheduled notifications
  public static async cancelAllScheduledNotifications(): Promise<void> {
    for (const id of this.scheduledNotifications.keys()) {
      await ReactNativeNotificationHelper.cancelNotification(id);
    }
    this.scheduledNotifications.clear();
  }

  // Get scheduled notifications
  public static getScheduledNotifications(): Map<string, any> {
    return new Map(this.scheduledNotifications);
  }
}

// Export types and classes
export {
  ReactNativeNotificationHelper,
  NotificationTemplates,
  NotificationScheduler
};
