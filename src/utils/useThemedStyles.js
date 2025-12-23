import { useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';

/**
 * Hook to create themed styles
 * @param {Function} styleFunction - Function that takes colors and returns StyleSheet
 * @returns {Object} - Themed StyleSheet
 */
export function useThemedStyles(styleFunction) {
  const { colors } = useTheme();
  
  return useMemo(() => styleFunction(colors), [colors, styleFunction]);
}

