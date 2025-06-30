import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Alert, TouchableOpacity, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles from '../styles';

// API endpoints
const NOTIFICATIONS_URL = 'http://10.0.2.2/firebase-auth/api/notifications/notification.php';

const NotificationsTab = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userString = await AsyncStorage.getItem('user');
        if (userString) {
          const userData = JSON.parse(userString);
          setUser(userData);
          fetchNotifications(userData.uid);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  const fetchNotifications = async (userId) => {
    try {
      setLoading(true);
      setRefreshing(true);
      const response = await axios.get(`${NOTIFICATIONS_URL}?user_id=${userId}`);
      
      const notificationsData = response.data && typeof response.data === 'object' 
        ? Object.entries(response.data).map(([id, notification]) => ({ 
            id,
            ...notification,
            created_at: new Date(notification.created_at).toLocaleString(),
            is_read: notification.is_read || false
          }))
        : [];
      
      notificationsData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setNotifications(notificationsData);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch notifications');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.post(`${NOTIFICATIONS_URL}?id=${notificationId}`);
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, is_read: true } : n
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getNotificationIcon = (relatedEntity) => {
    switch (relatedEntity) {
      case 'claim': return 'description';
      case 'policy': return 'verified';
      default: return 'notifications';
    }
  };

  const getNotificationColor = (relatedEntity) => {
    switch (relatedEntity) {
      case 'claim': return '#1890ff';
      case 'policy': return '#52c41a';
      default: return '#faad14';
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const renderNotificationItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.notificationCard, { 
        backgroundColor: item.is_read ? '#fff' : '#f6ffed',
        borderLeftWidth: 4,
        borderLeftColor: getNotificationColor(item.related_entity)
      }]}
      onPress={() => !item.is_read && markAsRead(item.id)}
      activeOpacity={0.8}
    >
      <View style={styles.notificationHeader}>
        <Icon 
          name={getNotificationIcon(item.related_entity)} 
          size={24} 
          color={getNotificationColor(item.related_entity)} 
        />
        <View style={styles.notificationTextContainer}>
          <Text style={styles.notificationTitle}>{item.title}</Text>
          <Text style={styles.notificationMessage}>{item.message}</Text>
        </View>
        {!item.is_read && <View style={styles.unreadDot} />}
      </View>
      <View style={styles.notificationFooter}>
        <Text style={styles.notificationDate}>{item.created_at}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.tabContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount} unread</Text>
          </View>
        )}
      </View>

      <FlatList
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => user && fetchNotifications(user.uid)}
            colors={['#4CAF50']}
            tintColor="#4CAF50"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="notifications-off" size={48} color="#9E9E9E" />
            <Text style={styles.emptyText}>No notifications found</Text>
          </View>
        }
      />
    </View>
  );
};

export default NotificationsTab;