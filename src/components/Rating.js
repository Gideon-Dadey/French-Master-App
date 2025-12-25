import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export default function Rating({ rating = 0, size = 16, showRating = false }) {
  const { colors } = useTheme();

  const stars = [1, 2, 3, 4, 5];
  const activeColor = '#FFB703';
  const inactiveColor = colors.border || '#E0E0E0';

  return (
    <View style={styles.container}>
      {stars.map((starValue, index) => {
        if (rating >= starValue) {

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

          const fillPercentage = 1 - partialFill;
          return (
            <View key={index} style={{ position: 'relative', width: size, height: size }}>

              <Ionicons
                name="star-outline"
                size={size}
                color={inactiveColor}
                style={{ position: 'absolute' }}
              />

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

