import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function Heading({ title, onSeeAll, seeAllText = 'See all' }) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text
          numberOfLines={1}
          style={[
            styles.title,
            { color: colors.text },
          ]}
        >
          {title}
        </Text>
      </View>
      {onSeeAll && (
        <TouchableOpacity activeOpacity={0.6} onPress={onSeeAll}>
          <Text
            style={[
              styles.seeAll,
              { color: colors.primary },
            ]}
          >
            {seeAllText}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  titleContainer: {
    flex: 1,
    marginRight: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
  },
});

