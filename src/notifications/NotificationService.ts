import type { 
  Notification, 
  NotificationType, 
  Product, 
  UserPreferences 
} from '../types';

// Notification service for managing local and push notifications
export class NotificationService {
  private static instance: NotificationService;
  private registeredChannels: Set<string> = new Set();
  private notificationQueue: Notification[] = [];
  private isEnabled: boolean = true;

  private constructor() {
    this.initializeService();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private async initializeService(): Promise<void> {
    try {
      // Check if notifications are supported
      if ('Notification' in window) {
        await this.requestPermission();
      }
      
      // Register default notification channels
      await this.registerDefaultChannels();
      
      // Initialize service worker for background notifications
      if ('serviceWorker' in navigator) {
        await this.registerServiceWorker();
      }
    } catch (error) {
      console.error('Failed to initialize notification service:', error);
    }
  }

  // Permission management
  public async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      throw new Error('Notifications not supported');
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission === 'denied') {
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    this.isEnabled = permission === 'granted';
    return permission;
  }

  public getPermissionStatus(): NotificationPermission {
    if (!('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission;
  }

  // Channel management
  private async registerDefaultChannels(): Promise<void> {
    const channels = [
      {
        id: 'expiry_alerts',
        name: 'Alerty o dacie ważności',
        description: 'Powiadomienia o produktach blisko daty ważności',
        importance: 'high' as const,
        sound: true,
        vibrate: true
      },
      {
        id: 'family_updates', 
        name: 'Aktualizacje rodziny',
        description: 'Powiadomienia o zmianach w rodzinnej spiżarni',
        importance: 'medium' as const,
        sound: true,
        vibrate: false
      },
      {
        id: 'weekly_reports',
        name: 'Raporty tygodniowe',
        description: 'Cotygodniowe podsumowania i statystyki',
        importance: 'low' as const,
        sound: false,
        vibrate: false
      },
      {
        id: 'recipe_suggestions',
        name: 'Sugestie przepisów',
        description: 'Propozycje przepisów na podstawie dostępnych produktów',
        importance: 'medium' as const,
        sound: false,
        vibrate: false
      },
      {
        id: 'achievements',
        name: 'Osiągnięcia',
        description: 'Powiadomienia o zdobytych osiągnięciach',
        importance: 'low' as const,
        sound: true,
        vibrate: true
      }
    ];

    for (const channel of channels) {
      await this.registerNotificationChannel(channel);
    }
  }

  private async registerNotificationChannel(channel: {
    id: string;
    name: string;
    description: string;
    importance: 'low' | 'medium' | 'high';
    sound: boolean;
    vibrate: boolean;
  }): Promise<void> {
    try {
      // Register channel for React Native (Android)
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'REGISTER_NOTIFICATION_CHANNEL',
          payload: channel
        }));
      }
      
      this.registeredChannels.add(channel.id);
    } catch (error) {
      console.error(`Failed to register channel ${channel.id}:`, error);
    }
  }

  // Local notifications
  public async showNotification(
    title: string,
    options: NotificationOptions & { 
      channelId?: string;
      data?: any;
      actions?: Array<{ action: string; title: string; }>;
    } = {}
  ): Promise<void> {
    if (!this.isEnabled || this.getPermissionStatus() !== 'granted') {
      console.warn('Notifications are not enabled or permission denied');
      return;
    }

    try {
      const notificationOptions: NotificationOptions = {
        body: options.body,
        icon: options.icon || '/icon-192x192.png',
        badge: options.badge || '/badge-72x72.png',
        image: options.image,
        tag: options.tag,
        data: options.data,
        requireInteraction: options.requireInteraction || false,
        silent: options.silent || false,
        vibrate: options.vibrate || [200, 100, 200],
        actions: options.actions?.map(action => ({
          action: action.action,
          title: action.title
        }))
      };

      const notification = new Notification(title, notificationOptions);
      
      // Handle notification clicks
      notification.onclick = (event) => {
        event.preventDefault();
        window.focus();
        
        if (options.data?.url) {
          window.location.href = options.data.url;
        }
        
        notification.close();
      };

      // Auto-close after delay if not requiring interaction
      if (!options.requireInteraction) {
        setTimeout(() => {
          notification.close();
        }, 5000);
      }

    } catch (error) {
      console.error('Failed to show notification:', error);
    }
  }

  // Expiry notifications
  public async checkExpiryNotifications(
    products: Product[],
    preferences: UserPreferences
  ): Promise<void> {
    if (!preferences.notifications.expiryReminders) {
      return;
    }

    const daysBefore = preferences.notifications.expiryDaysBefore;
    const now = new Date();
    const checkDate = new Date();
    checkDate.setDate(now.getDate() + daysBefore);

    const expiringProducts = products.filter(product => {
      if (product.isConsumed) return false;
      
      const expiryDate = new Date(product.expiryDate);
      return expiryDate <= checkDate && expiryDate > now;
    });

    if (expiringProducts.length === 0) return;

    const title = expiringProducts.length === 1 
      ? 'Produkt wkrótce się przeterminuje'
      : `${expiringProducts.length} produktów wkrótce się przeterminuje`;

    const body = expiringProducts.length === 1
      ? `${expiringProducts[0].name} wygasa ${this.formatDate(expiringProducts[0].expiryDate)}`
      : `Sprawdź ${expiringProducts.length} produktów w swojej spiżarni`;

    await this.showNotification(title, {
      body,
      channelId: 'expiry_alerts',
      tag: 'expiry-check',
      requireInteraction: true,
      data: {
        type: 'expiry',
        products: expiringProducts.map(p => p.id),
        url: '/products?filter=expiring'
      },
      actions: [
        { action: 'view', title: 'Zobacz produkty' },
        { action: 'dismiss', title: 'Odrzuć' }
      ]
    });
  }

  // Family notifications
  public async notifyFamilyUpdate(
    type: 'product_added' | 'product_consumed' | 'shopping_list_updated',
    data: {
      userName: string;
      productName?: string;
      familyName: string;
    }
  ): Promise<void> {
    let title: string;
    let body: string;

    switch (type) {
      case 'product_added':
        title = 'Nowy produkt w spiżarni';
        body = `${data.userName} dodał ${data.productName} do spiżarni ${data.familyName}`;
        break;
      case 'product_consumed':
        title = 'Produkt został zużyty';
        body = `${data.userName} oznaczył ${data.productName} jako zużyty w ${data.familyName}`;
        break;
      case 'shopping_list_updated':
        title = 'Lista zakupów zaktualizowana';
        body = `${data.userName} zaktualizował listę zakupów w ${data.familyName}`;
        break;
      default:
        return;
    }

    await this.showNotification(title, {
      body,
      channelId: 'family_updates',
      tag: `family-${type}`,
      data: {
        type: 'family_update',
        updateType: type,
        ...data
      }
    });
  }

  // Recipe suggestions
  public async suggestRecipes(
    availableProducts: Product[],
    suggestedRecipes: Array<{ id: string; name: string; matchingIngredients: number }>
  ): Promise<void> {
    if (suggestedRecipes.length === 0) return;

    const bestMatch = suggestedRecipes[0];
    const title = 'Sugestia przepisu';
    const body = `Możesz przygotować "${bestMatch.name}" z ${bestMatch.matchingIngredients} dostępnych składników`;

    await this.showNotification(title, {
      body,
      channelId: 'recipe_suggestions',
      tag: 'recipe-suggestion',
      data: {
        type: 'recipe_suggestion',
        recipeId: bestMatch.id,
        url: `/recipes/${bestMatch.id}`
      },
      actions: [
        { action: 'view_recipe', title: 'Zobacz przepis' },
        { action: 'dismiss', title: 'Nie teraz' }
      ]
    });
  }

  // Achievement notifications
  public async notifyAchievement(achievement: {
    id: string;
    name: string;
    description: string;
    icon: string;
    points: number;
  }): Promise<void> {
    const title = 'Nowe osiągnięcie!';
    const body = `Zdobyłeś osiągnięcie "${achievement.name}" (+${achievement.points} pkt)`;

    await this.showNotification(title, {
      body,
      channelId: 'achievements',
      tag: `achievement-${achievement.id}`,
      icon: achievement.icon,
      requireInteraction: true,
      data: {
        type: 'achievement',
        achievementId: achievement.id,
        url: '/achievements'
      },
      actions: [
        { action: 'view_achievements', title: 'Zobacz osiągnięcia' },
        { action: 'share', title: 'Udostępnij' }
      ]
    });
  }

  // Weekly reports
  public async sendWeeklyReport(report: {
    productsAdded: number;
    productsConsumed: number;
    wasteReduced: number;
    moneySaved: number;
    topCategories: string[];
  }): Promise<void> {
    const title = 'Cotygodniowy raport spiżarni';
    const body = `Dodałeś ${report.productsAdded} produktów, zużyłeś ${report.productsConsumed}. Zaoszczędziłeś ${report.moneySaved.toFixed(2)} zł!`;

    await this.showNotification(title, {
      body,
      channelId: 'weekly_reports',
      tag: 'weekly-report',
      data: {
        type: 'weekly_report',
        report,
        url: '/stats/weekly'
      },
      actions: [
        { action: 'view_stats', title: 'Zobacz statystyki' },
        { action: 'dismiss', title: 'OK' }
      ]
    });
  }

  // Scheduled notifications
  public async scheduleNotification(
    notification: {
      id: string;
      title: string;
      body: string;
      scheduledTime: Date;
      channelId: string;
      data?: any;
    }
  ): Promise<void> {
    const now = new Date();
    const delay = notification.scheduledTime.getTime() - now.getTime();

    if (delay <= 0) {
      // Show immediately if time has passed
      await this.showNotification(notification.title, {
        body: notification.body,
        channelId: notification.channelId,
        data: notification.data,
        tag: notification.id
      });
      return;
    }

    // Schedule for later
    setTimeout(async () => {
      await this.showNotification(notification.title, {
        body: notification.body,
        channelId: notification.channelId,
        data: notification.data,
        tag: notification.id
      });
    }, delay);
  }

  // Queue management
  public queueNotification(notification: Notification): void {
    this.notificationQueue.push(notification);
  }

  public async processNotificationQueue(): Promise<void> {
    while (this.notificationQueue.length > 0) {
      const notification = this.notificationQueue.shift();
      if (!notification) continue;

      await this.showNotification(notification.title, {
        body: notification.message,
        data: notification.data,
        tag: notification.id
      });

      // Small delay between notifications
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // Settings management
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  public isNotificationEnabled(): boolean {
    return this.isEnabled && this.getPermissionStatus() === 'granted';
  }

  public getRegisteredChannels(): string[] {
    return Array.from(this.registeredChannels);
  }

  // Service worker registration
  private async registerServiceWorker(): Promise<void> {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered successfully:', registration);
      
      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', this.handleServiceWorkerMessage.bind(this));
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }

  private handleServiceWorkerMessage(event: MessageEvent): void {
    const { type, payload } = event.data;
    
    switch (type) {
      case 'NOTIFICATION_CLICKED':
        this.handleNotificationClick(payload);
        break;
      case 'NOTIFICATION_CLOSED':
        this.handleNotificationClose(payload);
        break;
      default:
        console.log('Unknown service worker message:', type);
    }
  }

  private handleNotificationClick(payload: any): void {
    // Handle notification click actions
    if (payload.url) {
      window.location.href = payload.url;
    }
  }

  private handleNotificationClose(payload: any): void {
    // Handle notification close events
    console.log('Notification closed:', payload);
  }

  // Utility methods
  private formatDate(date: Date): string {
    return date.toLocaleDateString('pl-PL', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  }

  // Cleanup
  public destroy(): void {
    this.notificationQueue = [];
    this.registeredChannels.clear();
    this.isEnabled = false;
  }
}

// Default export
export default NotificationService.getInstance();
