import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  Modal,
  ScrollView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';

// API endpoints
const NOTIFICATIONS_URL = 'http://10.0.2.2/firebase-auth/api/notifications/notification.php';
const WEATHER_ALERTS_URL = 'https://api.weather.gov/alerts/active';
const CLAIMS_URL = 'http://10.0.2.2/firebase-auth/api/farmers/claims/claims.php';
const PROFILE_URL = 'http://localhost/firebase-auth/api/farmers/profile';

const DashboardScreen = () => {
  const [activeTab, setActiveTab] = useState('claims');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'claims':
        return <ClaimsTab />;
      case 'notifications':
        return <NotificationsTab />;
      case 'weather':
        return <WeatherAlertsTab />;
      case 'profile':
        return <ProfileTab />;
      default:
        return <ClaimsTab />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Custom Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'claims' && styles.activeTab]}
          onPress={() => setActiveTab('claims')}
        >
          <Icon 
            name="list-alt" 
            size={24} 
            color={activeTab === 'claims' ? '#4CAF50' : '#666'} 
          />
          <Text style={[styles.tabText, activeTab === 'claims' && styles.activeTabText]}>Claims</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'notifications' && styles.activeTab]}
          onPress={() => setActiveTab('notifications')}
        >
          <Icon 
            name="notifications" 
            size={24} 
            color={activeTab === 'notifications' ? '#4CAF50' : '#666'} 
          />
          <Text style={[styles.tabText, activeTab === 'notifications' && styles.activeTabText]}>Notifications</Text>
          <UnreadNotificationBadge tab={activeTab} />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'weather' && styles.activeTab]}
          onPress={() => setActiveTab('weather')}
        >
          <Icon 
            name="wb-sunny" 
            size={24} 
            color={activeTab === 'weather' ? '#4CAF50' : '#666'} 
          />
          <Text style={[styles.tabText, activeTab === 'weather' && styles.activeTabText]}>Weather</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'profile' && styles.activeTab]}
          onPress={() => setActiveTab('profile')}
        >
          <Icon 
            name="person" 
            size={24} 
            color={activeTab === 'profile' ? '#4CAF50' : '#666'} 
          />
          <Text style={[styles.tabText, activeTab === 'profile' && styles.activeTabText]}>Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <View style={styles.tabContent}>
        {renderTabContent()}
      </View>
    </View>
  );
};

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
  }, [tab]); // Refresh when tab changes

  if (unreadCount <= 0) return null;

  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{unreadCount}</Text>
    </View>
  );
};

// Claims Tab Component
const ClaimsTab = () => {
  const navigation = useNavigation();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userString = await AsyncStorage.getItem('user');
        if (userString) {
          const userData = JSON.parse(userString);
          setUser(userData);
          fetchClaims(userData.uid);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const fetchClaims = async (farmerId) => {
    try {
      setRefreshing(true);
      const response = await axios.get(`${CLAIMS_URL}?farmer_id=${farmerId}`, { timeout: 10000 });

      const claimsArray = Object.entries(response.data).map(([key, value]) => ({
        id: key,
        ...value
      }));

      claimsArray.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setClaims(claimsArray);
    } catch (error) {
      console.error('Error fetching claims:', error);
      Alert.alert('Error', 'Failed to fetch claims. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('token');
              await AsyncStorage.removeItem('user');
              navigation.replace('Login');
            } catch (error) {
              console.error('Logout error:', error);
            }
          }
        }
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'approved': return '#4CAF50';
      case 'rejected': return '#F44336';
      case 'pending': return '#FFC107';
      default: return '#9E9E9E';
    }
  };

  const handleRefresh = async () => {
    if (user) fetchClaims(user.uid);
  };

  const handleClaimPress = (claim) => {
    setSelectedClaim(claim);
    setModalVisible(true);
  };

  const renderClaimItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleClaimPress(item)}>
      <View style={[styles.claimCard, { borderLeftColor: getStatusColor(item.status) }]}>
        <View style={styles.claimHeader}>
          <Text style={styles.claimType}>{item.damage_type.toUpperCase()}</Text>
          <Text style={[styles.claimStatus, { color: getStatusColor(item.status) }]}>
            {item.status.toUpperCase()}
          </Text>
        </View>
        <Text style={styles.claimDate}>Damage Date: {item.damage_date}</Text>
        <Text style={styles.claimDescription}>{item.description}</Text>
        <Text style={styles.claimSubmissionDate}>
          Submitted on: {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading your claims...</Text>
      </View>
    );
  }

  return (
    <View style={styles.tabContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Claims</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={claims}
        renderItem={renderClaimItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#4CAF50']}
            tintColor="#4CAF50"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="info-outline" size={48} color="#9E9E9E" />
            <Text style={styles.emptyText}>No claims found</Text>
          </View>
        }
      />

      {/* Claim Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedClaim && (
              <ScrollView>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Claim Details</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Icon name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Damage Type:</Text>
                  <Text style={styles.detailValue}>{selectedClaim.damage_type}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Status:</Text>
                  <Text style={[styles.detailValue, { color: getStatusColor(selectedClaim.status) }]}>
                    {selectedClaim.status}
                  </Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Damage Date:</Text>
                  <Text style={styles.detailValue}>{selectedClaim.damage_date}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Description:</Text>
                  <Text style={styles.detailValue}>{selectedClaim.description}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Submitted On:</Text>
                  <Text style={styles.detailValue}>
                    {new Date(selectedClaim.created_at).toLocaleString()}
                  </Text>
                </View>
                
                {selectedClaim.updated_at && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Last Updated:</Text>
                    <Text style={styles.detailValue}>
                      {new Date(selectedClaim.updated_at).toLocaleString()}
                    </Text>
                  </View>
                )}
              </ScrollView>
            )}
            
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Notifications Tab Component
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

  const getNotificationTag = (relatedEntity) => {
    switch (relatedEntity) {
      case 'claim': return { text: 'CLAIM', color: 'blue' };
      case 'policy': return { text: 'POLICY', color: 'green' };
      default: return { text: 'SYSTEM', color: 'orange' };
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const renderNotificationItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.notificationCard, { backgroundColor: item.is_read ? '#fff' : '#f6ffed' }]}
      onPress={() => !item.is_read && markAsRead(item.id)}
    >
      <View style={styles.notificationHeader}>
        <Icon 
          name={getNotificationIcon(item.related_entity)} 
          size={24} 
          color={getNotificationColor(item.related_entity)} 
        />
        <Text style={styles.notificationTitle}>{item.title}</Text>
        {!item.is_read && <View style={styles.unreadBadge} />}
      </View>
      <Text style={styles.notificationMessage}>{item.message}</Text>
      <View style={styles.notificationFooter}>
        <Text style={styles.notificationDate}>{item.created_at}</Text>
        <View style={[styles.notificationTag, { backgroundColor: getNotificationTag(item.related_entity).color }]}>
          <Text style={styles.notificationTagText}>
            {getNotificationTag(item.related_entity).text}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.tabContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount}</Text>
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

// Weather Alerts Tab Component
const WeatherAlertsTab = () => {
  const [weatherAlerts, setWeatherAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchWeatherAlerts();
  }, []);

  const fetchWeatherAlerts = async () => {
    try {
      setLoading(true);
      setRefreshing(true);
      const response = await axios.get(WEATHER_ALERTS_URL, {
        headers: {
          'User-Agent': 'FarmersApp (support@farmersapp.com)',
          'Accept': 'application/geo+json'
        }
      });
      
      const alerts = response.data.features.map(alert => ({
        id: alert.id,
        title: alert.properties.headline,
        message: alert.properties.description,
        severity: alert.properties.severity,
        type: alert.properties.event,
        area: alert.properties.areaDesc,
        effective: new Date(alert.properties.effective).toLocaleString(),
        expires: new Date(alert.properties.expires).toLocaleString(),
        source: 'weather'
      }));
      
      setWeatherAlerts(alerts);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch weather alerts');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getWeatherAlertIcon = (alertType) => {
    const lowerType = alertType.toLowerCase();
    if (lowerType.includes('thunderstorm')) return 'flash-on';
    if (lowerType.includes('flood')) return 'water';
    if (lowerType.includes('fire')) return 'whatshot';
    if (lowerType.includes('tornado')) return 'warning';
    return 'warning';
  };

  const getWeatherAlertColor = (severity) => {
    switch (severity.toLowerCase()) {
      case 'extreme': return '#f44336';
      case 'severe': return '#ff5722';
      case 'moderate': return '#ff9800';
      case 'minor': return '#ffc107';
      default: return '#9e9e9e';
    }
  };

  const renderWeatherAlertItem = ({ item }) => (
    <View style={styles.weatherAlertCard}>
      <View style={styles.weatherAlertHeader}>
        <Icon 
          name={getWeatherAlertIcon(item.type)} 
          size={24} 
          color={getWeatherAlertColor(item.severity)} 
        />
        <Text style={styles.weatherAlertTitle}>{item.title}</Text>
      </View>
      <View style={styles.weatherAlertArea}>
        <Icon name="location-on" size={16} color="#666" />
        <Text style={styles.weatherAlertAreaText}>{item.area}</Text>
      </View>
      <Text style={styles.weatherAlertMessage}>{item.message}</Text>
      <View style={styles.weatherAlertFooter}>
        <View style={styles.weatherAlertTime}>
          <Icon name="access-time" size={14} color="#666" />
          <Text style={styles.weatherAlertTimeText}>Effective: {item.effective}</Text>
        </View>
        <View style={styles.weatherAlertTime}>
          <Icon name="access-time" size={14} color="#666" />
          <Text style={styles.weatherAlertTimeText}>Expires: {item.expires}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.tabContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Weather Alerts</Text>
        <Text style={styles.headerSubtitle}>National Weather Service</Text>
      </View>

      <FlatList
        data={weatherAlerts}
        renderItem={renderWeatherAlertItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchWeatherAlerts}
            colors={['#4CAF50']}
            tintColor="#4CAF50"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="wb-sunny" size={48} color="#9E9E9E" />
            <Text style={styles.emptyText}>No active weather alerts</Text>
          </View>
        }
      />
    </View>
  );
};

// Profile Tab Component
const ProfileTab = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          navigation.replace('Login');
          return;
        }

        const response = await axios.get(PROFILE_URL, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        setProfile(response.data);
      } catch (error) {
        console.error('Error fetching profile:', error);
        Alert.alert('Error', 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('token');
              await AsyncStorage.removeItem('user');
              navigation.replace('Login');
            } catch (error) {
              console.error('Logout error:', error);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.emptyContainer}>
        <Icon name="error-outline" size={48} color="#9E9E9E" />
        <Text style={styles.emptyText}>Failed to load profile</Text>
      </View>
    );
  }

  return (
    <View style={styles.profileContainer}>
      <View style={styles.profileHeader}>
        <View style={styles.profileAvatar}>
          <Icon name="person" size={60} color="#FFF" />
        </View>
        <Text style={styles.profileName}>{profile.full_name}</Text>
        <Text style={styles.profileRole}>{profile.role.toUpperCase()}</Text>
      </View>

      <View style={styles.profileDetails}>
        <View style={styles.detailRow}>
          <Icon name="email" size={20} color="#4CAF50" />
          <Text style={styles.detailText}>{profile.email}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Icon name="phone" size={20} color="#4CAF50" />
          <Text style={styles.detailText}>{profile.phone}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Icon name="credit-card" size={20} color="#4CAF50" />
          <Text style={styles.detailText}>{profile.nic}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Icon name="location-on" size={20} color="#4CAF50" />
          <Text style={styles.detailText}>{profile.address}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Icon name="language" size={20} color="#4CAF50" />
          <Text style={styles.detailText}>{profile.language.toUpperCase()}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Icon name="account-circle" size={20} color="#4CAF50" />
          <Text style={styles.detailText}>{profile.status.toUpperCase()}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 10,
  },
  tabButton: {
    alignItems: 'center',
    padding: 8,
    position: 'relative',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#4CAF50',
  },
  tabText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  activeTabText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  tabContent: {
    flex: 1,
  },
  tabContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  logoutText: {
    color: '#F44336',
    fontWeight: 'bold',
  },
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
  listContent: {
    padding: 10,
  },
  claimCard: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 5,
    elevation: 2,
  },
  claimHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  claimType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  claimStatus: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  claimDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  claimDescription: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  claimSubmissionDate: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    marginBottom: 20,
  },
  notificationCard: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginLeft: 10,
  },
  unreadBadge: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#f44336',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  notificationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationDate: {
    fontSize: 12,
    color: '#999',
  },
  notificationTag: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  notificationTagText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  weatherAlertCard: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
  },
  weatherAlertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  weatherAlertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginLeft: 10,
  },
  weatherAlertArea: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  weatherAlertAreaText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
  },
  weatherAlertMessage: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  weatherAlertFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weatherAlertTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weatherAlertTimeText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
  },
  profileContainer: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  profileRole: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  profileDetails: {
    marginBottom: 30,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  detailText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
  },
  logoutButton: {
    backgroundColor: '#F44336',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 5,
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
  },
  modalCloseButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  modalCloseButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DashboardScreen;