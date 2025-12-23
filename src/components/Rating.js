import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

/**
 * Rating component with star display
 * Adapted from HEYY app, showing partial stars for fractional ratings
 * 
 * @param {number} rating - Rating value (0-5)
 * @param {number} size - Icon size (default: 16)
 * @param {boolean} showRating - Whether to show numeric rating
 */
export default function Rating({ rating = 0, size = 16, showRating = false }) {
  const { colors } = useTheme();
  
  const stars = [1, 2, 3, 4, 5];
  const activeColor = '#FFB703'; // Gold color
  const inactiveColor = colors.border || '#E0E0E0';

  return (
    <View style={styles.container}>
      {stars.map((starValue, index) => {
        if (rating >= starValue) {
          // Fully filled star
          return (
            <Ionicons
              key={index}
              name="star"
              size={size}
              color={activeColor}
            />
          );
        }

        const partialFill = starValue - rating;
        if (partialFill < 1 && partialFill > 0) {
          // Partially filled star
          const fillPercentage = 1 - partialFill;
          return (
            <View key={index} style={{ position: 'relative', width: size, height: size }}>
              {/* Background star (empty) */}
              <Ionicons
                name="star-outline"
                size={size}
                color={inactiveColor}
                style={{ position: 'absolute' }}
              />
              {/* Foreground star (filled portion) */}
              <View
                style={{
                  width: size * fillPercentage,
                  overflow: 'hidden',
                  position: 'absolute',
                }}
              >
                <Ionicons
                  name="star"
                  size={size}
                  color={activeColor}
                />
              </View>
            </View>
          );
        }

        // Empty star
        return (
          <Ionicons
            key={index}
            name="star-outline"
            size={size}
            color={inactiveColor}
          />
        );
      })}
      {showRating && (
        <View style={{ marginLeft: 6 }}>
          <Text style={{ fontSize: size - 2, color: colors.text }}>
            {rating.toFixed(1)}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
});

