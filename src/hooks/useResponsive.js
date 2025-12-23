import { useState, useEffect } from 'react';
import { Dimensions } from 'react-native';
import { 
  screenWidth, 
  screenHeight, 
  isSmallDevice, 
  isMediumDevice, 
  isLargeDevice, 
  isTablet 
} from '../utils/responsive';

export const useResponsive = () => {
  const [dimensions, setDimensions] = useState({
    width: screenWidth,
    height: screenHeight,
  });

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions({
        width: window.width,
        height: window.height,
      });
    });

    return () => subscription?.remove();
  }, []);

  return {
    width: dimensions.width,
    height: dimensions.height,
    isSmallDevice,
    isMediumDevice,
    isLargeDevice,
    isTablet,
    isLandscape: dimensions.width > dimensions.height,
  };
};

