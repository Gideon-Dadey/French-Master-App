import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';

export default function AppSplashScreen() {
    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color="#1A355E" style={styles.loader} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loader: {
        marginTop: 30,
    },
});
