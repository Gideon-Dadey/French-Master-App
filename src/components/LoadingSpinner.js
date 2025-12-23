import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';

export default function LoadingSpinner({ message = 'Loading...', size = 'large' }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color="#1E88E5" />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  message: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
  },
});

