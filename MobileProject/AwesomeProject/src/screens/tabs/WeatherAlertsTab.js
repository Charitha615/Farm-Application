import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Alert, RefreshControl } from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles from '../styles';

// API endpoints
const WEATHER_ALERTS_URL = 'https://api.weather.gov/alerts/active';

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
    <View style={[styles.weatherAlertCard, { borderLeftColor: getWeatherAlertColor(item.severity) }]}>
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

export default WeatherAlertsTab;