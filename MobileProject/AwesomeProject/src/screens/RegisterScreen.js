import React, { useState } from 'react';
import {
  View,
  Text,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import AuthForm from '../components/AuthForm';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const RegisterScreen = () => {
  const navigation = useNavigation();
  const [fullName, setFullName] = useState('');
  const [nic, setNic] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [language, setLanguage] = useState('en');

  const handleRegister = async () => {
    try {
      const response = await axios.post('http://192.168.1.5/firebase-auth/api/farmers/register', {
        full_name: fullName,
        nic,
        email,
        phone,
        password,
        address,
        language,
      });

      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));

      Alert.alert('Success', 'Registration successful!');
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Register</Text>

        <AuthForm
          fields={[
            {
              label: 'Full Name',
              value: fullName,
              onChangeText: setFullName,
              placeholder: 'Enter your full name',
            },
            {
              label: 'NIC',
              value: nic,
              onChangeText: setNic,
              placeholder: 'Enter your NIC',
            },
            {
              label: 'Email',
              value: email,
              onChangeText: setEmail,
              placeholder: 'Enter your email',
              keyboardType: 'email-address',
            },
            {
              label: 'Phone',
              value: phone,
              onChangeText: setPhone,
              placeholder: 'Enter your phone number',
              keyboardType: 'phone-pad',
            },
            {
              label: 'Password',
              value: password,
              onChangeText: setPassword,
              placeholder: 'Enter your password',
              secureTextEntry: true,
            },
            {
              label: 'Address',
              value: address,
              onChangeText: setAddress,
              placeholder: 'Enter your address',
            },
          ]}
          onSubmit={handleRegister}
          submitText="Register"
        />

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.link}>Already have an account? Login here</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  link: {
    marginTop: 20,
    color: 'blue',
    textAlign: 'center',
  },
});

export default RegisterScreen;