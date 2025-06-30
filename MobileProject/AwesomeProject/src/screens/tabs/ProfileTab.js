import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles from '../styles';

const ProfileTab = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userString = await AsyncStorage.getItem('user');
        if (!userString) {
          navigation.replace('Login');
          return;
        }

        const userData = JSON.parse(userString);
        setUser(userData);

        const response = await axios.get(
          `http://10.0.2.2/firebase-auth/api/farmers/get_farmer_by_id.php?id=${userData.uid}`,
          { timeout: 10000 }
        );

        setProfile(response.data);
      } catch (error) {
        console.error('Profile error:', error);
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
        <TouchableOpacity style={styles.retryButton} onPress={() => navigation.replace('Login')}>
          <Text style={styles.retryButtonText}>Return to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.profileContainer}>
      <View style={styles.profileHeader}>
        <View style={styles.profileAvatar}>
          <Icon name="person" size={60} color="#FFF" />
        </View>
        <Text style={styles.profileName}>{profile.full_name}</Text>
        <Text style={styles.profileRole}>{profile.role?.toUpperCase() || 'FARMER'}</Text>
      </View>

      <View style={styles.profileDetails}>
        <View style={styles.detailSection}>
          <Text style={styles.sectionTitle}>Personal Information</Text>

          <View style={styles.detailRow}>
            <Icon name="email" size={20} color="#4CAF50" style={styles.icon} />
            <Text style={styles.detailText}>{profile.email}</Text>
          </View>

          <View style={styles.detailRow}>
            <Icon name="phone" size={20} color="#4CAF50" style={styles.icon} />
            <Text style={styles.detailText}>{profile.phone}</Text>
          </View>

          <View style={styles.detailRow}>
            <Icon name="credit-card" size={20} color="#4CAF50" style={styles.icon} />
            <Text style={styles.detailText}>{profile.nic}</Text>
          </View>

          <View style={styles.detailRow}>
            <Icon name="location-on" size={20} color="#4CAF50" style={styles.icon} />
            <Text style={styles.detailText}>{profile.address}</Text>
          </View>
        </View>

        <View style={styles.detailSection}>
          <Text style={styles.sectionTitle}>Account Information</Text>

          <View style={styles.detailRow}>
            <Icon name="language" size={20} color="#4CAF50" style={styles.icon} />
            <Text style={styles.detailText}>{profile.language?.toUpperCase() || 'EN'}</Text>
          </View>

          <View style={styles.detailRow}>
            <Icon name="account-circle" size={20} color="#4CAF50" style={styles.icon} />
            <Text style={styles.detailText}>{profile.status?.toUpperCase() || 'ACTIVE'}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Icon name="exit-to-app" size={20} color="#FFF" style={styles.icon} />
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default ProfileTab;