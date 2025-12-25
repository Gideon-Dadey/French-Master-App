import { useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';

export function useThemedStyles(styleFunction) {
  const { colors } = useTheme();

  return useMemo(() => styleFunction(colors), [colors, styleFunction]);
}

