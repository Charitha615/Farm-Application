import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import AuthForm from '../components/AuthForm';
import { useAuth } from '../context/AuthContext';

const RegisterScreen: React.FC = () => {
  const { register } = useAuth();
  const [error, setError] = useState('');

  const handleRegister = async (userData: any) => {
    try {
      await register(userData);
    } catch (err) {
      setError('Registration failed. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Farmer Registration</Text>
      <AuthForm isLogin={false} onSubmit={handleRegister} error={error} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default RegisterScreen;