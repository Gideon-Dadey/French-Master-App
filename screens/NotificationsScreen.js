import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { notificationsAPI } from '../src/services/api';
import { useAuth } from '../src/context/AuthContext';
import LoadingSpinner from '../src/components/LoadingSpinner';
import ErrorMessage from '../src/components/ErrorMessage';
import { spacing, fontSize } from '../src/utils/responsive';

export default function NotificationsScreen({ navigation }) {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const loadNotifications = async () => {
    try {
      setError(null);
      const response = await notificationsAPI.getAll();
      setNotifications(response.data.data || []);
    } catch (error) {
      console.error('Failed to load notifications:', error);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadNotifications();
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationsAPI.markAsRead(id);
      setNotifications(notifications.map(n => 
        n._id === id ? { ...n, isRead: true } : n
      ));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'course':
        return 'book-outline';
      case 'lesson':
        return 'play-outline';
      case 'payment':
        return 'card-outline';
      case 'achievement':
        return 'trophy-outline';
      default:
        return 'notifications-outline';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'course':
        return '#1E88E5';
      case 'lesson':
        return '#4CAF50';
      case 'payment':
        return '#FF9800';
      case 'achievement':
        return '#9C27B0';
      default:
        return '#757575';
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <LoadingSpinner />
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-off-outline" size={80} color="#ccc" />
          <Text style={styles.emptyTitle}>No Notifications</Text>
          <Text style={styles.emptyText}>
            Please login to receive notifications
          </Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('Auth', { screen: 'Login' })}
          >
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (error && notifications.length === 0) {
    return (
      <View style={styles.container}>
        <ErrorMessage message={error} onRetry={loadNotifications} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-outline" size={80} color="#ccc" />
          <Text style={styles.emptyTitle}>No Notifications</Text>
          <Text style={styles.emptyText}>
            You're all caught up! New notifications will appear here.
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {notifications.map((notification) => (
            <TouchableOpacity
              key={notification._id}
              style={[
                styles.notificationItem,
                !notification.isRead && styles.unread,
              ]}
              onPress={() => {
                if (!notification.isRead) {
                  handleMarkAsRead(notification._id);
                }
                // Navigate based on notification type
                if (notification.type === 'course' && notification.courseId) {
                  navigation.navigate('CourseDetail', { 
                    courseId: notification.courseId 
                  });
                }
              }}
            >
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: `${getNotificationColor(notification.type)}15` },
                ]}
              >
                <Ionicons
                  name={getNotificationIcon(notification.type)}
                  size={24}
                  color={getNotificationColor(notification.type)}
                />
              </View>
              <View style={styles.content}>
                <Text style={styles.title}>{notification.title}</Text>
                <Text style={styles.message}>{notification.message}</Text>
                <Text style={styles.time}>
                  {new Date(notification.createdAt).toLocaleDateString()}
                </Text>
              </View>
              {!notification.isRead && <View style={styles.unreadDot} />}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxxl,
  },
  emptyTitle: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: '#333',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: fontSize.md,
    color: '#666',
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  loginButton: {
    backgroundColor: '#1E88E5',
    paddingHorizontal: spacing.xxxl,
    paddingVertical: spacing.md,
    borderRadius: 12,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  list: {
    padding: spacing.lg,
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  unread: {
    backgroundColor: '#E3F2FD',
    borderLeftWidth: 4,
    borderLeftColor: '#1E88E5',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: '#333',
    marginBottom: spacing.xs,
  },
  message: {
    fontSize: fontSize.md,
    color: '#666',
    marginBottom: spacing.xs,
    lineHeight: 20,
  },
  time: {
    fontSize: fontSize.sm,
    color: '#999',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1E88E5',
    marginLeft: spacing.sm,
    alignSelf: 'center',
  },
});

