import axios from 'axios';
import { BASE_URL } from '@/api/api';
import { User, AuthResponse } from '@/types';
import { toast } from 'sonner';

// Login function
export const login = async (email: string, password: string): Promise<User> => {
  try {
    const formData = new URLSearchParams();
    formData.append('email', email);
    formData.append('password', password);

    // Check if it's admin login
    const isAdmin = email.toLowerCase() === 'admin@jokroup.com' && password === 'admin123';
    // Check if it's demo user login
    const isUser = email.toLowerCase() === 'john@example.com' && password === 'password123';
    
    // For demo purposes, handle admin login separately
    // For demo admin login
    if (isAdmin) {
      const adminUser: User = {
        id: 'admin-1',
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@jokroup.com',
        password: '',
        role: 'admin',
        addresses: [],
        createdAt: new Date().toISOString(),
        token: 'admin-token-123'
      };
      
      // Store admin user in localStorage
      localStorage.setItem('currentUser', JSON.stringify(adminUser));
      
      // Set the authorization header for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${adminUser.token}`;
      
      return adminUser;
    }
    
    // For demo purposes, handle regular user login separately
    if (isUser) {
      const regularUser: User = {
        id: 'user-1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: '',
        role: 'user',
        addresses: [],
        createdAt: new Date().toISOString(),
        token: 'user-token-123'
      };
      
      // Store user in localStorage
      localStorage.setItem('currentUser', JSON.stringify(regularUser));
      
      // Set the authorization header for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${regularUser.token}`;
      
      return regularUser;
    }
    
    const response = await axios.post<AuthResponse>(
      `http://localhost:8000/login`,
      formData,
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    );

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
    // Check if the error is due to invalid credentials
    if (email && password) {
      // If the user tried to login with credentials that don't match our demo accounts
      throw new Error('Invalid credentials. For demo, use admin@jokroup.com/admin123 or john@example.com/password123');
    } else {
      const message = error?.response?.data?.message || 'Login failed';
      throw new Error(message);
    }
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
): Promise<User> => {
  try {
    // For demo purposes, create a mock user without making an actual API call
    const newUser: User = {
      id: `user-${Date.now()}`,
      firstName: first_name,
      lastName: last_name,
      email: email,
      password: '',
      role: 'user',
      addresses: [],
      createdAt: new Date().toISOString(),
      token: `user-token-${Date.now()}`
    };
    
    // Store user in localStorage
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    
    // Set the authorization header for future requests
    axios.defaults.headers.common['Authorization'] = `Bearer ${newUser.token}`;
    
    toast.success('Registration successful!');
    return newUser;
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
