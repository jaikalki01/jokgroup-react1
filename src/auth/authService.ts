import axios from 'axios';
import { BASE_URL } from '@/api/api';
import { User, AuthResponse } from '@/types';
import { toast } from 'sonner';

// Login function
export const login = async (email: string, password: string): Promise<User> => {
  try {
    const response = await axios.post<AuthResponse>(`http://localhost:8000/api/auth/login`, {
      email,
      password
    });

    // Store token in localStorage
    localStorage.setItem('currentUser', JSON.stringify(response.data.user));

    // Set the authorization header for future requests
    if (response.data.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
    }

    return {
      ...response.data.user,
      token: response.data.token
    };
  } catch (error: any) {
    const message = error?.response?.data?.message || 'Login failed';
    throw new Error(message);
  }
};
type RegisterResponse = {
  message: string;
};
// Register function
export const register = async (
  first_name: string,
  last_name: string,
  email: string,
  password: string
): Promise<void> => {
  try {
    const response = await axios.post<RegisterResponse>(`${BASE_URL}/users/signUp`, {
      first_name,
      last_name,
      email,
      password
    });

    toast.success(response.data.message);
  } catch (error: any) {
    const message = error?.response?.data?.detail || 'Registration failed';
    toast.error(message);
    throw new Error(message);
  }
};
// Logout function
export const logout = (): void => {
  // Clear current user from localStorage
  localStorage.removeItem('currentUser');
  
  // Remove the authorization header
  delete axios.defaults.headers.common['Authorization'];
};
