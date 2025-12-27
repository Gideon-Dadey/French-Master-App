import React, { createContext, useState, useContext, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useAuth } from './AuthContext';
import { usersAPI } from '../services/api';
import { getThemeColors } from '../utils/organicTheme';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

// Updated light theme with unified Midnight Blue & Gold colors
const lightTheme = {
  background: '#F8F6F3',
  secondaryBackground: '#FFFFFF',
  tertiaryBackground: '#F3F1ED',
  text: '#1B365D',
  secondaryText: '#4A5568',
  border: '#E8E4DE',
  primary: '#1B365D',        // Midnight Blue
  primaryHover: '#2D4A7C',
  secondary: '#D4A853',      // Gold
  accent: '#C17F59',         // Terracotta
  success: '#2D5A3D',
  error: '#C53030',
  warning: '#D4A853',
  card: '#FFFFFF',
  surface: '#FFFFFF',
  shadow: 'rgba(27, 54, 93, 0.1)',
};

// Updated dark theme with unified Midnight Blue & Gold colors
const darkTheme = {
  background: '#0D1B2A',
  secondaryBackground: '#1B2838',
  tertiaryBackground: '#243447',
  text: '#F5F3EF',
  secondaryText: '#A0AEC0',
  border: '#2D3E50',
  primary: '#4A7AB0',        // Lighter blue for dark mode
  primaryHover: '#5B8BC1',
  secondary: '#D4A853',      // Gold (same)
  accent: '#D49A6A',         // Lighter terracotta
  success: '#48BB78',
  error: '#FC8181',
  warning: '#D4A853',
  card: '#1B2838',
  surface: '#1B2838',
  shadow: 'rgba(0, 0, 0, 0.3)',
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
      const savedTheme = await SecureStore.getItemAsync('theme');
      if (savedTheme) {
        setIsDarkMode(savedTheme === 'dark');
      } else if (isAuthenticated && user?.preferences?.theme) {
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
      await SecureStore.setItemAsync('theme', newTheme ? 'dark' : 'light');

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
  
  // Also provide the full organic theme colors
  const organicColors = getThemeColors(isDarkMode);

  const value = {
    isDarkMode,
    toggleTheme,
    theme,
    colors,
    organicColors,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
