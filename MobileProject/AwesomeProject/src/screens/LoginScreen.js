import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  ActivityIndicator,
  Switch
} from 'react-native';
import AuthForm from '../components/AuthForm';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const LoginScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [networkError, setNetworkError] = useState(null);
  const [rememberMe, setRememberMe] = useState(false);

  // Load saved credentials when component mounts
  useEffect(() => {
    const loadSavedCredentials = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem('rememberedEmail');
        const savedPassword = await AsyncStorage.getItem('rememberedPassword');
        
        if (savedEmail && savedPassword) {
          setEmail(savedEmail);
          setPassword(savedPassword);
          setRememberMe(true);
        }
      } catch (error) {
        console.error('Error loading saved credentials:', error);
      }
    };
    
    loadSavedCredentials();
  }, []);

  const handleLogin = async () => {
    console.log('Login attempt started');
    
    // Reset errors
    setNetworkError(null);
    setStatusMessage('');

    // Basic validation
    if (!email.trim() || !password.trim()) {
      setStatusMessage('Please fill in all fields');
      console.warn('Validation failed: Empty fields');
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setStatusMessage('Please enter a valid email');
      console.warn('Validation failed: Invalid email format');
      return;
    }

    setIsLoading(true);
    console.log('Making API request to login endpoint...');

    try {
      const response = await axios.post('http://10.0.2.2/firebase-auth/api/farmers/login', {
        email,
        password,
      }, {
        timeout: 10000, // 10 seconds timeout
      });

      console.log('API Response:', response.data);

      if (response.data?.token && response.data?.user) {
        await AsyncStorage.setItem('token', response.data.token);
        await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Save credentials if rememberMe is true
        if (rememberMe) {
          await AsyncStorage.setItem('rememberedEmail', email);
          await AsyncStorage.setItem('rememberedPassword', password);
        } else {
          // Clear saved credentials if rememberMe is false
          await AsyncStorage.removeItem('rememberedEmail');
          await AsyncStorage.removeItem('rememberedPassword');
        }
        
        console.log('Login successful, token stored');
        setStatusMessage('Login successful! Redirecting...');
        
        setTimeout(() => {
          navigation.navigate('Home');
        }, 1500);
      } else {
        const errorMsg = 'Invalid response from server';
        console.error(errorMsg, response.data);
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Network errors (no response)
      if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
        const networkErrorMsg = 'Network error - Please check your connection';
        setNetworkError(networkErrorMsg);
        console.error('Network error:', error);
        Alert.alert('Network Error', networkErrorMsg);
        return;
      }

      // Server responded with error status
      if (error.response) {
        const serverError = error.response.data?.message || 
                         `Server error: ${error.response.status}`;
        console.error('Server error:', error.response.data);
        setStatusMessage(serverError);
      } 
      // Request made but no response
      else if (error.request) {
        const noResponseMsg = 'No response from server - Please try again';
        console.error('No response:', error.request);
        setStatusMessage(noResponseMsg);
      } 
      // Other errors
      else {
        console.error('Unexpected error:', error.message);
        setStatusMessage(error.message || 'Login failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView 
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>
        </View>

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4A90E2" />
            <Text style={styles.loadingText}>Authenticating...</Text>
          </View>
        )}

        {/* Network error banner */}
        {networkError && (
          <View style={styles.networkErrorBanner}>
            <Text style={styles.networkErrorText}>{networkError}</Text>
          </View>
        )}

        {/* Status message */}
        {statusMessage ? (
          <Text style={[
            styles.statusText,
            statusMessage.includes('success') ? styles.successText : styles.errorText
          ]}>
            {statusMessage}
          </Text>
        ) : null}

        <View style={styles.formContainer}>
          <AuthForm
            fields={[
              {
                label: 'Email',
                value: email,
                onChangeText: (text) => {
                  setEmail(text);
                  setStatusMessage('');
                  setNetworkError(null);
                },
                placeholder: 'Enter your email',
                keyboardType: 'email-address',
                autoCapitalize: 'none',
              },
              {
                label: 'Password',
                value: password,
                onChangeText: (text) => {
                  setPassword(text);
                  setStatusMessage('');
                  setNetworkError(null);
                },
                placeholder: 'Enter your password',
                secureTextEntry: true,
              },
            ]}
            onSubmit={handleLogin}
            submitText={isLoading ? "Processing..." : "Login"}
            disabled={isLoading}
          />

          <View style={styles.rememberMeContainer}>
            <View style={styles.switchContainer}>
              <Switch
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={rememberMe ? "#4A90E2" : "#f4f3f4"}
                ios_backgroundColor="#3e3e3e"
                onValueChange={setRememberMe}
                value={rememberMe}
              />
              <Text style={styles.rememberMeText}>Remember me</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Secure login for authorized users only</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 30,
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  loadingContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
    fontSize: 14,
  },
  networkErrorBanner: {
    backgroundColor: '#ffebee',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  networkErrorText: {
    color: '#d32f2f',
    fontWeight: '500',
  },
  statusText: {
    marginVertical: 15,
    textAlign: 'center',
    fontSize: 15,
    paddingHorizontal: 20,
  },
  successText: {
    color: '#2e7d32',
    fontWeight: '500',
  },
  errorText: {
    color: '#d32f2f',
    fontWeight: '500',
  },
  rememberMeContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 5,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rememberMeText: {
    marginLeft: 10,
    color: '#555',
    fontSize: 15,
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
  },
  footerText: {
    color: '#888',
    fontSize: 12,
    textAlign: 'center',
  },
});

export default LoginScreen;