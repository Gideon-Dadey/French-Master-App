import { useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';

export function useThemedStyles(styleFunction) {
  const { organicColors: colors } = useTheme();

  return useMemo(() => styleFunction(colors), [colors, styleFunction]);
}

