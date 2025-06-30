import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Modal,
  ScrollView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles from '../styles';

// API endpoints
const CLAIMS_URL = 'http://10.0.2.2/firebase-auth/api/farmers/claims/claims.php';

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
    <TouchableOpacity 
      style={styles.claimCard} 
      onPress={() => handleClaimPress(item)}
      activeOpacity={0.8}
    >
      <View style={styles.claimHeader}>
        <View style={styles.claimTypeContainer}>
          <Text style={styles.claimType}>{item.damage_type}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      
      <View style={styles.claimDetails}>
        <View style={styles.detailRow}>
          <Icon name="event" size={18} color="#666" />
          <Text style={styles.detailText}>{item.damage_date}</Text>
        </View>
        <Text style={styles.claimDescription} numberOfLines={2} ellipsizeMode="tail">
          {item.description}
        </Text>
      </View>
      
      <View style={styles.claimFooter}>
        <Text style={styles.dateText}>
          Submitted: {new Date(item.created_at).toLocaleDateString()}
        </Text>
        <TouchableOpacity 
          style={styles.viewButton}
          onPress={() => handleClaimPress(item)}
        >
          <Text style={styles.viewButtonText}>View Details</Text>
        </TouchableOpacity>
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
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Icon name="exit-to-app" size={24} color="#F44336" />
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
            <TouchableOpacity style={styles.addButton}>
              <Text style={styles.addButtonText}>+ Add New Claim</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Claim Details Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {selectedClaim && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Claim Details</Text>
                  <TouchableOpacity 
                    onPress={() => setModalVisible(false)}
                    style={styles.closeButton}
                  >
                    <Icon name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>
                
                <ScrollView style={styles.modalBody}>
                  <View style={styles.detailSection}>
                    <Text style={styles.sectionTitle}>Basic Information</Text>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Damage Type:</Text>
                      <Text style={styles.detailValue}>{selectedClaim.damage_type}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Status:</Text>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedClaim.status) }]}>
                        <Text style={styles.statusText}>{selectedClaim.status}</Text>
                      </View>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Damage Date:</Text>
                      <Text style={styles.detailValue}>{selectedClaim.damage_date}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.detailSection}>
                    <Text style={styles.sectionTitle}>Description</Text>
                    <Text style={styles.descriptionText}>{selectedClaim.description}</Text>
                  </View>
                  
                  <View style={styles.detailSection}>
                    <Text style={styles.sectionTitle}>Timeline</Text>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Submitted:</Text>
                      <Text style={styles.detailValue}>
                        {new Date(selectedClaim.created_at).toLocaleString()}
                      </Text>
                    </View>
                    {selectedClaim.updated_at && (
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Last Updated:</Text>
                        <Text style={styles.detailValue}>
                          {new Date(selectedClaim.updated_at).toLocaleString()}
                        </Text>
                      </View>
                    )}
                  </View>
                </ScrollView>
                
                <View style={styles.modalFooter}>
                  <TouchableOpacity 
                    style={styles.modalButton}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.modalButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ClaimsTab;