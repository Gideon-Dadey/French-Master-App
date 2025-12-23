import React, { createContext, useState, useContext, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useAuth } from './AuthContext';
import { usersAPI } from '../services/api';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

// Twitter-inspired dark mode colors
const lightTheme = {
  background: '#FFFFFF',
  secondaryBackground: '#F7F9FA',
  tertiaryBackground: '#EFF3F4',
  text: '#0F1419',
  secondaryText: '#536471',
  border: '#EFF3F4',
  primary: '#1E88E5',
  primaryHover: '#1565C0',
  success: '#4CAF50',
  error: '#E53935',
  warning: '#FF9800',
  card: '#FFFFFF',
  shadow: 'rgba(0, 0, 0, 0.1)',
};

const darkTheme = {
  background: '#000000',
  secondaryBackground: '#16181C',
  tertiaryBackground: '#202327',
  text: '#F7F9FA',
  secondaryText: '#71767A',
  border: '#2F3336',
  primary: '#1E88E5',
  primaryHover: '#42A5F5',
  success: '#4CAF50',
  error: '#E53935',
  warning: '#FF9800',
  card: '#16181C',
  shadow: 'rgba(255, 255, 255, 0.1)',
};

export const ThemeProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadThemePreference();
  }, [isAuthenticated]);

  const loadThemePreference = async () => {
    try {
      // Try to get from secure store first
      const savedTheme = await SecureStore.getItemAsync('theme');
      if (savedTheme) {
        setIsDarkMode(savedTheme === 'dark');
      } else if (isAuthenticated && user?.preferences?.theme) {
        // Fallback to user preferences
        setIsDarkMode(user.preferences.theme === 'dark');
      }
    } catch (error) {
      console.error('Failed to load theme preference:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = async () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    
    try {
      // Save to secure store
      await SecureStore.setItemAsync('theme', newTheme ? 'dark' : 'light');
      
      // Update user preferences if authenticated
      if (isAuthenticated) {
        try {
          await usersAPI.updateProfile({
            preferences: {
              ...user?.preferences,
              theme: newTheme ? 'dark' : 'light',
            },
          });
        } catch (error) {
          console.error('Failed to update theme preference on server:', error);
        }
      }
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };

  const theme = isDarkMode ? darkTheme : lightTheme;
  const colors = theme;

  const value = {
    isDarkMode,
    toggleTheme,
    theme,
    colors,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

