import React, { createContext, useState, useEffect, useContext } from 'react';
import * as SecureStore from 'expo-secure-store';
import { authAPI, usersAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (token) {
        const response = await authAPI.getMe();
        setUser(response.data.user);
        setIsAuthenticated(true);
        // Report activity to update streak
        reportActivity();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      await logout();
    } finally {
      setLoading(false);
    }
  };

  const reportActivity = async () => {
    try {
      const response = await usersAPI.reportActivity();
      if (response.data.success) {
        // Update local user state with new streak data
        const streakData = response.data.data;
        setUser(prev => {
          if (!prev) return null;
          return {
            ...prev,
            streak: streakData
          };
        });
      }
    } catch (error) {
      console.error('Failed to report activity:', error);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      const { token, refreshToken, user } = response.data;

      await SecureStore.setItemAsync('authToken', token);
      if (refreshToken) {
        await SecureStore.setItemAsync('refreshToken', refreshToken);
      }

      setUser(user);
      setIsAuthenticated(true);
      reportActivity();
      return { success: true };
    } catch (error) {
      let message = 'Login failed';

      if (error.message?.includes('Network') || error.isNetworkError) {
        message = 'Network connection failed. Please check your internet connection.';
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.message) {
        message = error.message;
      }

      return {
        success: false,
        message
      };
    }
  };

  const register = async (name, email, password, phone, role = 'student') => {
    try {
      const response = await authAPI.register({ name, email, password, phone, role });
      const { token, refreshToken, user } = response.data;

      await SecureStore.setItemAsync('authToken', token);
      if (refreshToken) {
        await SecureStore.setItemAsync('refreshToken', refreshToken);
      }

      setUser(user);
      setIsAuthenticated(true);
      reportActivity();
      return { success: true };
    } catch (error) {
      let message = 'Registration failed';

      if (error.message?.includes('Network') || error.isNetworkError) {
        message = 'Network connection failed. Please check your internet connection.';
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.message) {
        message = error.message;
      }

      return {
        success: false,
        message
      };
    }
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync('authToken');
      await SecureStore.deleteItemAsync('refreshToken');
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateUser = async (userData) => {
    try {
      if (userData) {

        setUser(prevUser => ({ ...prevUser, ...userData }));
      }

      const token = await SecureStore.getItemAsync('authToken');
      if (token) {
        try {
          const response = await authAPI.getMe();
          if (response?.data?.user) {
            setUser(response.data.user);
          }
        } catch (apiError) {

          console.warn('Failed to refresh user from API, using provided data:', apiError);
        }
      }
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  const loadUser = async () => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (token) {
        const response = await authAPI.getMe();
        if (response?.data?.user) {
          setUser(response.data.user);
          setIsAuthenticated(true);
        }
      }
    } catch (error) {
      console.error('Failed to load user:', error);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    checkAuth,
    updateUser,
    setUser,
    loadUser,
    reportActivity
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

