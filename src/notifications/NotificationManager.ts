import type { 
  Notification, 
  NotificationType,
  Product, 
  UserPreferences 
} from '../types';

// Centralized notification manager
export class NotificationManager {
  private static instance: NotificationManager;
  private notifications: Notification[] = [];
  private preferences: UserPreferences | null = null;
  private listeners: Set<(notifications: Notification[]) => void> = new Set();

  private constructor() {}

  public static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  // Initialize manager
  public async initialize(userPreferences: UserPreferences): Promise<void> {
    this.preferences = userPreferences;
    
    try {
      // Load existing notifications
      await this.loadNotifications();
      
      // Setup periodic checks
      this.setupPeriodicChecks();
      
    } catch (error) {
      console.error('Failed to initialize notification manager:', error);
    }
  }

  // Load notifications from storage
  private async loadNotifications(): Promise<void> {
    try {
      // In a real app, load from AsyncStorage or API
      // const stored = await AsyncStorage.getItem('notifications');
      // if (stored) {
      //   this.notifications = JSON.parse(stored);
      // }
      
      this.notifications = [];
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  }

  // Save notifications to storage
  private async saveNotifications(): Promise<void> {
    try {
      // In a real app, save to AsyncStorage or API
      // await AsyncStorage.setItem('notifications', JSON.stringify(this.notifications));
    } catch (error) {
      console.error('Failed to save notifications:', error);
    }
  }

  // Add notification
  public async addNotification(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<string> {
    const id = `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newNotification: Notification = {
      ...notification,
      id,
      createdAt: new Date(),
      read: false
    };

    this.notifications.unshift(newNotification);
    
    // Keep only last 100 notifications
    if (this.notifications.length > 100) {
      this.notifications = this.notifications.slice(0, 100);
    }

    await this.saveNotifications();
    this.notifyListeners();

    return id;
  }

  // Mark notification as read
  public async markAsRead(notificationId: string): Promise<void> {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification && !notification.read) {
      notification.read = true;
      await this.saveNotifications();
      this.notifyListeners();
    }
  }

  // Mark all notifications as read
  public async markAllAsRead(): Promise<void> {
    let hasChanges = false;
    
    for (const notification of this.notifications) {
      if (!notification.read) {
        notification.read = true;
        hasChanges = true;
      }
    }

    if (hasChanges) {
      await this.saveNotifications();
      this.notifyListeners();
    }
  }

  // Delete notification
  public async deleteNotification(notificationId: string): Promise<void> {
    const index = this.notifications.findIndex(n => n.id === notificationId);
    if (index >= 0) {
      this.notifications.splice(index, 1);
      await this.saveNotifications();
      this.notifyListeners();
    }
  }

  // Clear all notifications
  public async clearAllNotifications(): Promise<void> {
    this.notifications = [];
    await this.saveNotifications();
    this.notifyListeners();
  }

  // Get all notifications
  public getNotifications(): Notification[] {
    return [...this.notifications];
  }

  // Get unread notifications
  public getUnreadNotifications(): Notification[] {
    return this.notifications.filter(n => !n.read);
  }

  // Get unread count
  public getUnreadCount(): number {
    return this.getUnreadNotifications().length;
  }

  // Check for expiry notifications
  public async checkExpiryNotifications(products: Product[]): Promise<void> {
    if (!this.preferences?.notifications.expiryReminders) {
      return;
    }

    const daysBefore = this.preferences.notifications.expiryDaysBefore || 3;
    const now = new Date();
    const checkDate = new Date();
    checkDate.setDate(now.getDate() + daysBefore);

    const expiringProducts = products.filter(product => {
      if (product.isConsumed) return false;
      
      const expiryDate = new Date(product.expiryDate);
      return expiryDate <= checkDate && expiryDate > now;
    });

    if (expiringProducts.length === 0) return;

    // Check if we already sent notification today
    const today = now.toDateString();
    const existingNotification = this.notifications.find(n => 
      n.type === 'expiry' && 
      n.createdAt.toDateString() === today
    );

    if (existingNotification) return;

    const title = expiringProducts.length === 1 
      ? 'Produkt wkrótce się przeterminuje'
      : `${expiringProducts.length} produktów wkrótce się przeterminuje`;

    const message = expiringProducts.length === 1
      ? `${expiringProducts[0].name} wygasa ${this.formatDate(expiringProducts[0].expiryDate)}`
      : `Sprawdź produkty w swojej spiżarni`;

    await this.addNotification({
      userId: '', // Will be set by caller
      type: 'expiry',
      title,
      message,
      data: {
        products: expiringProducts.map(p => ({ id: p.id, name: p.name, expiryDate: p.expiryDate })),
        daysBefore
      },
      actionUrl: '/products?filter=expiring'
    });
  }

  // Check for weekly report notification
  public async checkWeeklyReportNotification(weeklyStats: {
    productsAdded: number;
    productsConsumed: number;
    wasteReduced: number;
    moneySaved: number;
  }): Promise<void> {
    if (!this.preferences?.notifications.weeklyReport) {
      return;
    }

    // Check if it's the right day (Sunday)
    const now = new Date();
    if (now.getDay() !== 0) return;

    // Check if we already sent report this week
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const existingReport = this.notifications.find(n => 
      n.type === 'report' && 
      n.createdAt >= weekStart
    );

    if (existingReport) return;

    await this.addNotification({
      userId: '', // Will be set by caller
      type: 'update',
      title: 'Cotygodniowy raport spiżarni',
      message: `Dodałeś ${weeklyStats.productsAdded} produktów, zaoszczędziłeś ${weeklyStats.moneySaved.toFixed(2)} zł`,
      data: weeklyStats,
      actionUrl: '/stats/weekly'
    });
  }

  // Add family update notification
  public async addFamilyUpdateNotification(
    type: 'product_added' | 'product_consumed' | 'shopping_list_updated',
    data: {
      userName: string;
      productName?: string;
      familyName: string;
    }
  ): Promise<void> {
    if (!this.preferences?.notifications.familyUpdates) {
      return;
    }

    let title: string;
    let message: string;

    switch (type) {
      case 'product_added':
        title = 'Nowy produkt w spiżarni';
        message = `${data.userName} dodał ${data.productName} do ${data.familyName}`;
        break;
      case 'product_consumed':
        title = 'Produkt został zużyty';
        message = `${data.userName} oznaczył ${data.productName} jako zużyty`;
        break;
      case 'shopping_list_updated':
        title = 'Lista zakupów zaktualizowana';
        message = `${data.userName} zaktualizował listę zakupów`;
        break;
    }

    await this.addNotification({
      userId: '', // Will be set by caller
      type: 'family',
      title,
      message,
      data: {
        updateType: type,
        ...data
      },
      actionUrl: '/family'
    });
  }

  // Add achievement notification
  public async addAchievementNotification(achievement: {
    id: string;
    name: string;
    description: string;
    points: number;
  }): Promise<void> {
    if (!this.preferences?.notifications.achievementAlerts) {
      return;
    }

    await this.addNotification({
      userId: '', // Will be set by caller
      type: 'achievement',
      title: 'Nowe osiągnięcie!',
      message: `Zdobyłeś "${achievement.name}" (+${achievement.points} pkt)`,
      data: achievement,
      actionUrl: '/achievements'
    });
  }

  // Add recipe suggestion notification
  public async addRecipeSuggestionNotification(
    recipeName: string,
    matchingIngredients: number,
    recipeId: string
  ): Promise<void> {
    if (!this.preferences?.notifications.recipeSuggestions) {
      return;
    }

    await this.addNotification({
      userId: '', // Will be set by caller
      type: 'tip',
      title: 'Sugestia przepisu',
      message: `Możesz przygotować "${recipeName}" z ${matchingIngredients} dostępnych składników`,
      data: {
        recipeId,
        recipeName,
        matchingIngredients
      },
      actionUrl: `/recipes/${recipeId}`
    });
  }

  // Setup periodic checks
  private setupPeriodicChecks(): void {
    // Check every hour for expiry notifications
    setInterval(() => {
      // This would be triggered by the app's product checking logic
    }, 60 * 60 * 1000); // 1 hour

    // Check daily for weekly reports (at 9 AM)
    const now = new Date();
    const nextCheck = new Date();
    nextCheck.setHours(9, 0, 0, 0);
    
    if (nextCheck <= now) {
      nextCheck.setDate(nextCheck.getDate() + 1);
    }

    const timeUntilNextCheck = nextCheck.getTime() - now.getTime();
    setTimeout(() => {
      // This would check for weekly reports
      setInterval(() => {
        // Weekly report check logic
      }, 24 * 60 * 60 * 1000); // Daily
    }, timeUntilNextCheck);
  }

  // Subscribe to notification changes
  public subscribe(listener: (notifications: Notification[]) => void): () => void {
    this.listeners.add(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  // Notify all listeners
  private notifyListeners(): void {
    for (const listener of this.listeners) {
      listener([...this.notifications]);
    }
  }

  // Update preferences
  public updatePreferences(preferences: UserPreferences): void {
    this.preferences = preferences;
  }

  // Utility methods
  private formatDate(date: Date): string {
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'dzisiaj';
    if (diffDays === 1) return 'jutro';
    if (diffDays === -1) return 'wczoraj';
    
    return date.toLocaleDateString('pl-PL', {
      month: 'short',
      day: 'numeric'
    });
  }

  // Get formatted notification time
  public getFormattedTime(date: Date): string {
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return 'przed chwilą';
    if (diffMinutes < 60) return `${diffMinutes} min temu`;
    if (diffHours < 24) return `${diffHours} godz. temu`;
    if (diffDays < 7) return `${diffDays} dni temu`;
    
    return date.toLocaleDateString('pl-PL');
  }

  // Filter notifications by type
  public getNotificationsByType(type: NotificationType): Notification[] {
    return this.notifications.filter(n => n.type === type);
  }

  // Search notifications
  public searchNotifications(query: string): Notification[] {
    const lowerQuery = query.toLowerCase();
    return this.notifications.filter(n => 
      n.title.toLowerCase().includes(lowerQuery) ||
      n.message.toLowerCase().includes(lowerQuery)
    );
  }

  // Export notifications
  public exportNotifications(): string {
    const exportData = {
      notifications: this.notifications,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    
    return JSON.stringify(exportData, null, 2);
  }

  // Import notifications
  public async importNotifications(data: string): Promise<void> {
    try {
      const importData = JSON.parse(data);
      
      if (importData.notifications && Array.isArray(importData.notifications)) {
        this.notifications = importData.notifications.map((n: any) => ({
          ...n,
          createdAt: new Date(n.createdAt)
        }));
        
        await this.saveNotifications();
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Failed to import notifications:', error);
      throw new Error('Invalid notification data format');
    }
  }

  // Cleanup old notifications
  public async cleanupOldNotifications(daysToKeep: number = 30): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const originalLength = this.notifications.length;
    this.notifications = this.notifications.filter(n => n.createdAt > cutoffDate);

    if (this.notifications.length !== originalLength) {
      await this.saveNotifications();
      this.notifyListeners();
    }
  }

  // Get notification statistics
  public getStatistics(): {
    total: number;
    unread: number;
    byType: Record<NotificationType, number>;
    recentActivity: number;
  } {
    const byType = this.notifications.reduce((acc, n) => {
      acc[n.type] = (acc[n.type] || 0) + 1;
      return acc;
    }, {} as Record<NotificationType, number>);

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recentActivity = this.notifications.filter(n => n.createdAt > weekAgo).length;

    return {
      total: this.notifications.length,
      unread: this.getUnreadCount(),
      byType,
      recentActivity
    };
  }
}

// Default export
export default NotificationManager.getInstance();
