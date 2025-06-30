import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// API endpoints
const NOTIFICATIONS_URL = 'http://10.0.2.2/firebase-auth/api/notifications/notification.php';

const UnreadNotificationBadge = ({ tab }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const userString = await AsyncStorage.getItem('user');
        if (userString) {
          const userData = JSON.parse(userString);
          const response = await axios.get(`${NOTIFICATIONS_URL}?user_id=${userData.uid}`);
          
          if (response.data && typeof response.data === 'object') {
            const notifications = Object.values(response.data);
            const unread = notifications.filter(n => !n.is_read).length;
            setUnreadCount(unread);
          }
        }
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };

    fetchUnreadCount();
  }, [tab]);

  if (unreadCount <= 0) return null;

  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{unreadCount}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    backgroundColor: '#f44336',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    position: 'absolute',
    top: -5,
    right: -5,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default UnreadNotificationBadge;