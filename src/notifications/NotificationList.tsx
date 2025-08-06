import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Modal,
  Alert
} from 'react-native';
import type { Notification } from '../types';
import NotificationManager from './NotificationManager';

// Individual notification item component
interface NotificationItemProps {
  notification: Notification;
  onPress: (notification: Notification) => void;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onPress,
  onMarkAsRead,
  onDelete
}) => {
  const handlePress = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
    onPress(notification);
  };

  const handleLongPress = () => {
    Alert.alert(
      'Opcje powiadomienia',
      notification.title,
      [
        {
          text: 'Anuluj',
          style: 'cancel'
        },
        {
          text: notification.read ? 'Oznacz jako nieprzeczytane' : 'Oznacz jako przeczytane',
          onPress: () => onMarkAsRead(notification.id)
        },
        {
          text: 'Usuń',
          style: 'destructive',
          onPress: () => onDelete(notification.id)
        }
      ]
    );
  };

  const getTypeIcon = (type: string): string => {
    switch (type) {
      case 'expiry': return '⏰';
      case 'family': return '👨‍👩‍👧‍👦';
      case 'achievement': return '🏆';
      case 'tip': return '💡';
      case 'update': return '📢';
      default: return '📋';
    }
  };

  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'expiry': return '#FF6B6B';
      case 'family': return '#4ECDC4';
      case 'achievement': return '#FFE66D';
      case 'tip': return '#A8E6CF';
      case 'update': return '#88D8C0';
      default: return '#DDD';
    }
  };

  const formatTime = (date: Date): string => {
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
  };

  return (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        !notification.read && styles.unreadItem
      ]}
      onPress={handlePress}
      onLongPress={handleLongPress}
      activeOpacity={0.7}
    >
      <View style={styles.notificationHeader}>
        <View style={[styles.typeIndicator, { backgroundColor: getTypeColor(notification.type) }]}>
          <Text style={styles.typeIcon}>{getTypeIcon(notification.type)}</Text>
        </View>
        <View style={styles.notificationContent}>
          <Text style={[styles.notificationTitle, !notification.read && styles.unreadTitle]}>
            {notification.title}
          </Text>
          <Text style={styles.notificationTime}>
            {formatTime(notification.createdAt)}
          </Text>
        </View>
        {!notification.read && <View style={styles.unreadDot} />}
      </View>
      <Text style={styles.notificationMessage}>
        {notification.message}
      </Text>
    </TouchableOpacity>
  );
};

// Main notification list component
interface NotificationListProps {
  visible: boolean;
  onClose: () => void;
  onNotificationPress?: (notification: Notification) => void;
}

const NotificationList: React.FC<NotificationListProps> = ({
  visible,
  onClose,
  onNotificationPress
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    if (visible) {
      loadNotifications();
      
      // Subscribe to notification changes
      const unsubscribe = NotificationManager.subscribe(setNotifications);
      return unsubscribe;
    }
  }, [visible]);

  const loadNotifications = useCallback(() => {
    const allNotifications = NotificationManager.getNotifications();
    setNotifications(allNotifications);
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    loadNotifications();
    setRefreshing(false);
  }, [loadNotifications]);

  const handleNotificationPress = useCallback((notification: Notification) => {
    onNotificationPress?.(notification);
    if (notification.actionUrl) {
      // Navigate to the specified URL
      // In a real app, you would use navigation here
      console.log('Navigate to:', notification.actionUrl);
    }
  }, [onNotificationPress]);

  const handleMarkAsRead = useCallback(async (id: string) => {
    await NotificationManager.markAsRead(id);
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    await NotificationManager.deleteNotification(id);
  }, []);

  const handleMarkAllAsRead = useCallback(async () => {
    await NotificationManager.markAllAsRead();
  }, []);

  const handleClearAll = useCallback(() => {
    Alert.alert(
      'Wyczyść wszystkie powiadomienia',
      'Czy na pewno chcesz usunąć wszystkie powiadomienia?',
      [
        { text: 'Anuluj', style: 'cancel' },
        { 
          text: 'Usuń wszystkie', 
          style: 'destructive',
          onPress: async () => {
            await NotificationManager.clearAllNotifications();
          }
        }
      ]
    );
  }, []);

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications;

  const unreadCount = notifications.filter(n => !n.read).length;

  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <NotificationItem
      notification={item}
      onPress={handleNotificationPress}
      onMarkAsRead={handleMarkAsRead}
      onDelete={handleDelete}
    />
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <Text style={styles.headerTitle}>Powiadomienia</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.headerActions}>
        <View style={styles.filterButtons}>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'all' && styles.activeFilter]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterText, filter === 'all' && styles.activeFilterText]}>
              Wszystkie ({notifications.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'unread' && styles.activeFilter]}
            onPress={() => setFilter('unread')}
          >
            <Text style={[styles.filterText, filter === 'unread' && styles.activeFilterText]}>
              Nieprzeczytane ({unreadCount})
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.actionButtons}>
          {unreadCount > 0 && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleMarkAllAsRead}
            >
              <Text style={styles.actionButtonText}>Oznacz wszystkie</Text>
            </TouchableOpacity>
          )}
          {notifications.length > 0 && (
            <TouchableOpacity
              style={[styles.actionButton, styles.dangerButton]}
              onPress={handleClearAll}
            >
              <Text style={[styles.actionButtonText, styles.dangerButtonText]}>Wyczyść</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🔔</Text>
      <Text style={styles.emptyTitle}>Brak powiadomień</Text>
      <Text style={styles.emptyMessage}>
        {filter === 'unread' 
          ? 'Wszystkie powiadomienia zostały przeczytane'
          : 'Nie masz jeszcze żadnych powiadomień'
        }
      </Text>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {renderHeader()}
        <FlatList
          data={filteredNotifications}
          renderItem={renderNotificationItem}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#007AFF"
            />
          }
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={
            filteredNotifications.length === 0 ? styles.emptyList : undefined
          }
          showsVerticalScrollIndicator={false}
        />
      </View>
    </Modal>
  );
};

// Notification badge component
interface NotificationBadgeProps {
  count: number;
  onPress: () => void;
  size?: 'small' | 'medium' | 'large';
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count,
  onPress,
  size = 'medium'
}) => {
  const badgeSize = {
    small: 20,
    medium: 24,
    large: 28
  }[size];

  const fontSize = {
    small: 10,
    medium: 12,
    large: 14
  }[size];

  if (count === 0) return null;

  return (
    <TouchableOpacity
      style={[
        styles.badge,
        { width: badgeSize, height: badgeSize }
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.badgeText, { fontSize }]}>
        {count > 99 ? '99+' : count}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5'
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0'
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333'
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center'
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666'
  },
  headerActions: {
    paddingHorizontal: 16
  },
  filterButtons: {
    flexDirection: 'row',
    marginBottom: 12
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
    marginRight: 8
  },
  activeFilter: {
    backgroundColor: '#007AFF'
  },
  filterText: {
    fontSize: 14,
    color: '#666'
  },
  activeFilterText: {
    color: '#FFFFFF'
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#E0E0E0'
  },
  dangerButton: {
    backgroundColor: '#FF3B30'
  },
  actionButtonText: {
    fontSize: 12,
    color: '#666'
  },
  dangerButtonText: {
    color: '#FFFFFF'
  },
  notificationItem: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  unreadItem: {
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF'
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  typeIndicator: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  typeIcon: {
    fontSize: 16
  },
  notificationContent: {
    flex: 1
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2
  },
  unreadTitle: {
    fontWeight: 'bold'
  },
  notificationTime: {
    fontSize: 12,
    color: '#999'
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF'
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20
  },
  emptyList: {
    flex: 1
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8
  },
  emptyMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24
  },
  badge: {
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: -6,
    right: -6
  },
  badgeText: {
    color: '#FFFFFF',
    fontWeight: 'bold'
  }
});

export default NotificationList;
