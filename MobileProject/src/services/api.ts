import axios from 'axios';

const API_BASE_URL = 'http://localhost/firebase-auth/api';

export const login = async (email: string, password: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/farmers/login`, {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const register = async (userData: {
  full_name: string;
  nic: string;
  email: string;
  phone: string;
  password: string;
  address: string;
  language: string;
}) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/farmers/register`, userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};