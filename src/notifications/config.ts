// Notification system configuration
export const NOTIFICATION_CONFIG = {
  // Channels
  channels: {
    EXPIRY_ALERTS: 'expiry_alerts',
    FAMILY_UPDATES: 'family_updates',
    RECIPE_SUGGESTIONS: 'recipe_suggestions',
    ACHIEVEMENTS: 'achievements',
    WEEKLY_REPORTS: 'weekly_reports',
    SYSTEM_UPDATES: 'system_updates'
  },

  // Default settings
  defaults: {
    enableNotifications: true,
    enableExpiryReminders: true,
    expiryReminderDays: 3,
    enableFamilyUpdates: true,
    enableWeeklyReports: true,
    enableRecipeSuggestions: true,
    enableAchievementAlerts: true,
    
    // Timing
    dailyCheckTime: { hour: 9, minute: 0 },
    weeklyReportDay: 0, // Sunday
    weeklyReportTime: { hour: 10, minute: 0 },
    
    // Cleanup
    notificationRetentionDays: 30,
    maxNotificationsStored: 100
  },

  // Notification priorities
  priorities: {
    expiry: 'high' as const,
    family: 'medium' as const,
    achievement: 'low' as const,
    tip: 'medium' as const,
    update: 'low' as const
  },

  // Icon mappings
  icons: {
    expiry: '⏰',
    family: '👨‍👩‍👧‍👦',
    achievement: '🏆',
    tip: '💡',
    update: '📢',
    default: '📋'
  },

  // Color mappings
  colors: {
    expiry: '#FF6B6B',
    family: '#4ECDC4',
    achievement: '#FFE66D',
    tip: '#A8E6CF',
    update: '#88D8C0',
    default: '#DDD'
  },

  // Sound settings
  sounds: {
    expiry: 'default',
    family: 'default',
    achievement: 'achievement.wav',
    tip: 'gentle.wav',
    update: 'default'
  },

  // Vibration patterns (milliseconds)
  vibrationPatterns: {
    expiry: [0, 250, 100, 250],
    family: [0, 200, 100, 200],
    achievement: [0, 100, 50, 100, 50, 100],
    tip: [0, 150],
    update: [0, 100]
  },

  // Action button configurations
  actions: {
    expiry: [
      { id: 'view_product', title: 'Zobacz produkt' },
      { id: 'mark_consumed', title: 'Oznacz jako zużyty' },
      { id: 'extend_date', title: 'Przedłuż datę' }
    ],
    family: [
      { id: 'view_family', title: 'Zobacz rodzinę' },
      { id: 'open_chat', title: 'Otwórz czat' }
    ],
    achievement: [
      { id: 'view_achievements', title: 'Zobacz osiągnięcia' },
      { id: 'share_achievement', title: 'Udostępnij' }
    ],
    tip: [
      { id: 'view_recipe', title: 'Zobacz przepis' },
      { id: 'save_recipe', title: 'Zapisz przepis' },
      { id: 'dismiss', title: 'Nie teraz' }
    ],
    update: [
      { id: 'view_details', title: 'Zobacz szczegóły' },
      { id: 'dismiss', title: 'OK' }
    ]
  },

  // Templates for common notifications
  templates: {
    singleProductExpiring: {
      title: 'Produkt wkrótce się przeterminuje',
      bodyTemplate: '{productName} wygasa za {days} {daysText}'
    },
    multipleProductsExpiring: {
      title: '{count} produktów wkrótce się przeterminuje',
      bodyTemplate: 'Sprawdź produkty w swojej spiżarni'
    },
    productAdded: {
      title: 'Nowy produkt w spiżarni',
      bodyTemplate: '{userName} dodał {productName} do {familyName}'
    },
    productConsumed: {
      title: 'Produkt został zużyty',
      bodyTemplate: '{userName} oznaczył {productName} jako zużyty'
    },
    achievementUnlocked: {
      title: 'Nowe osiągnięcie!',
      bodyTemplate: 'Zdobyłeś "{achievementName}" (+{points} pkt)'
    },
    recipeSuggestion: {
      title: 'Sugestia przepisu',
      bodyTemplate: 'Możesz przygotować "{recipeName}" z {matchingIngredients} składników'
    },
    weeklyReport: {
      title: 'Cotygodniowy raport spiżarni',
      bodyTemplate: 'Dodałeś {productsAdded} produktów, zaoszczędziłeś {moneySaved} zł'
    },
    shoppingReminder: {
      title: 'Przypomnienie o zakupach',
      bodyTemplate: 'Masz {itemCount} {itemText} na liście zakupów'
    }
  },

  // Frequency limits (to prevent spam)
  frequencyLimits: {
    expiryCheck: {
      maxPerDay: 3,
      cooldownMinutes: 60
    },
    familyUpdates: {
      maxPerHour: 10,
      cooldownMinutes: 5
    },
    recipeSuggestions: {
      maxPerDay: 5,
      cooldownMinutes: 30
    },
    achievements: {
      maxPerDay: 10,
      cooldownMinutes: 1
    }
  },

  // Feature flags
  features: {
    enableRichNotifications: true,
    enableActionButtons: true,
    enableNotificationHistory: true,
    enableNotificationSearch: true,
    enableNotificationExport: true,
    enableSmartScheduling: true,
    enableNotificationCategories: true
  },

  // Debug settings
  debug: {
    enableLogging: false, // Set to true in development
    logNotificationEvents: false,
    enableTestNotifications: false
  }
};

// Utility functions for notifications
export const NotificationUtils = {
  // Format notification body with template
  formatNotificationBody: (template: string, data: Record<string, any>): string => {
    return template.replace(/\{(\w+)\}/g, (match, key) => {
      return data[key] || match;
    });
  },

  // Get appropriate icon for notification type
  getNotificationIcon: (type: string): string => {
    return NOTIFICATION_CONFIG.icons[type as keyof typeof NOTIFICATION_CONFIG.icons] || 
           NOTIFICATION_CONFIG.icons.default;
  },

  // Get appropriate color for notification type
  getNotificationColor: (type: string): string => {
    return NOTIFICATION_CONFIG.colors[type as keyof typeof NOTIFICATION_CONFIG.colors] || 
           NOTIFICATION_CONFIG.colors.default;
  },

  // Get vibration pattern for notification type
  getVibrationPattern: (type: string): number[] => {
    return NOTIFICATION_CONFIG.vibrationPatterns[type as keyof typeof NOTIFICATION_CONFIG.vibrationPatterns] || 
           [0, 200];
  },

  // Get action buttons for notification type
  getNotificationActions: (type: string): Array<{ id: string; title: string }> => {
    return NOTIFICATION_CONFIG.actions[type as keyof typeof NOTIFICATION_CONFIG.actions] || [];
  },

  // Check if notification should be sent based on frequency limits
  canSendNotification: (
    type: keyof typeof NOTIFICATION_CONFIG.frequencyLimits,
    lastSentTimes: Record<string, Date[]>
  ): boolean => {
    const limits = NOTIFICATION_CONFIG.frequencyLimits[type];
    if (!limits) return true;

    const now = new Date();
    const recentNotifications = lastSentTimes[type] || [];
    
    // Filter notifications within the time window
    const timeWindow = {
      maxPerDay: 24 * 60 * 60 * 1000,
      maxPerHour: 60 * 60 * 1000
    };

    if (limits.maxPerDay) {
      const dayAgo = new Date(now.getTime() - timeWindow.maxPerDay);
      const notificationsToday = recentNotifications.filter(time => time > dayAgo);
      if (notificationsToday.length >= limits.maxPerDay) return false;
    }

    if (limits.maxPerHour) {
      const hourAgo = new Date(now.getTime() - timeWindow.maxPerHour);
      const notificationsThisHour = recentNotifications.filter(time => time > hourAgo);
      if (notificationsThisHour.length >= (limits as any).maxPerHour) return false;
    }

    // Check cooldown
    if (limits.cooldownMinutes && recentNotifications.length > 0) {
      const lastNotification = recentNotifications[recentNotifications.length - 1];
      const cooldownMs = limits.cooldownMinutes * 60 * 1000;
      if (now.getTime() - lastNotification.getTime() < cooldownMs) return false;
    }

    return true;
  },

  // Record notification sent time
  recordNotificationSent: (
    type: string,
    lastSentTimes: Record<string, Date[]>
  ): Record<string, Date[]> => {
    const updated = { ...lastSentTimes };
    if (!updated[type]) updated[type] = [];
    
    updated[type].push(new Date());
    
    // Keep only recent notifications (last 24 hours)
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    updated[type] = updated[type].filter(time => time > dayAgo);
    
    return updated;
  },

  // Generate notification ID
  generateNotificationId: (type?: string): string => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return type ? `${type}_${timestamp}_${random}` : `notification_${timestamp}_${random}`;
  },

  // Validate notification data
  validateNotificationData: (data: any): boolean => {
    if (!data.title || typeof data.title !== 'string') return false;
    if (!data.message || typeof data.message !== 'string') return false;
    if (!data.type || typeof data.type !== 'string') return false;
    if (!data.userId || typeof data.userId !== 'string') return false;
    
    return true;
  },

  // Get human-readable time difference
  getTimeAgo: (date: Date): string => {
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
  },

  // Get Polish day/time text
  getPolishDaysText: (days: number): string => {
    if (days === 1) return 'dzień';
    if (days >= 2 && days <= 4) return 'dni';
    return 'dni';
  },

  getPolishItemsText: (count: number): string => {
    if (count === 1) return 'produkt';
    if (count >= 2 && count <= 4) return 'produkty';
    return 'produktów';
  }
};

// Export notification types for external use
export const NOTIFICATION_TYPES = {
  EXPIRY: 'expiry',
  FAMILY: 'family',
  ACHIEVEMENT: 'achievement',
  TIP: 'tip',
  UPDATE: 'update'
} as const;

export type NotificationConfigType = typeof NOTIFICATION_CONFIG;
