import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNetwork } from '../hooks/useNetwork';

export default function NetworkStatus() {
  const { isConnected, isInternetReachable } = useNetwork();
  const [show, setShow] = React.useState(false);
  const slideAnim = React.useRef(new Animated.Value(-100)).current;

  React.useEffect(() => {
    if (!isConnected || !isInternetReachable) {
      setShow(true);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setShow(false));
    }
  }, [isConnected, isInternetReachable]);

  if (!show) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Ionicons name="cloud-offline-outline" size={20} color="#fff" />
      <Text style={styles.text}>No Internet Connection</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#E53935',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    zIndex: 9999,
    gap: 8,
  },
  text: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

