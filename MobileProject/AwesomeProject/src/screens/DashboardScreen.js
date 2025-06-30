import React, { useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Text } from 'react-native';
import ClaimsTab from './tabs/ClaimsTab.js';
import NotificationsTab from './tabs/NotificationsTab';
import WeatherAlertsTab from './tabs/WeatherAlertsTab';
import ProfileTab from './tabs/ProfileTab';
import UnreadNotificationBadge from './components/UnreadNotificationBadge';

// Tab Icons
const TabIcons = {
  claims: require('./assets/claims-icon.png'),
  notifications: require('./assets/notifications-icon.png'),
  weather: require('./assets/weather-icon.png'),
  profile: require('./assets/profile-icon.png'),
};

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
          <Image 
            source={TabIcons.claims} 
            style={[styles.tabIcon, activeTab === 'claims' && styles.activeTabIcon]} 
          />
          <Text style={[styles.tabText, activeTab === 'claims' && styles.activeTabText]}>Claims</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'notifications' && styles.activeTab]}
          onPress={() => setActiveTab('notifications')}
        >
          <Image 
            source={TabIcons.notifications} 
            style={[styles.tabIcon, activeTab === 'notifications' && styles.activeTabIcon]} 
          />
          <Text style={[styles.tabText, activeTab === 'notifications' && styles.activeTabText]}>Alerts</Text>
          <UnreadNotificationBadge tab={activeTab} />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'weather' && styles.activeTab]}
          onPress={() => setActiveTab('weather')}
        >
          <Image 
            source={TabIcons.weather} 
            style={[styles.tabIcon, activeTab === 'weather' && styles.activeTabIcon]} 
          />
          <Text style={[styles.tabText, activeTab === 'weather' && styles.activeTabText]}>Weather</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'profile' && styles.activeTab]}
          onPress={() => setActiveTab('profile')}
        >
          <Image 
            source={TabIcons.profile} 
            style={[styles.tabIcon, activeTab === 'profile' && styles.activeTabIcon]} 
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  tabButton: {
    alignItems: 'center',
    padding: 8,
    position: 'relative',
  },
  activeTab: {
    borderTopWidth: 2,
    borderTopColor: '#4CAF50',
  },
  tabIcon: {
    width: 24,
    height: 24,
    tintColor: '#666',
    marginBottom: 4,
  },
  activeTabIcon: {
    tintColor: '#4CAF50',
  },
  tabText: {
    fontSize: 12,
    color: '#666',
  },
  activeTabText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  tabContent: {
    flex: 1,
  },
});

export default DashboardScreen;