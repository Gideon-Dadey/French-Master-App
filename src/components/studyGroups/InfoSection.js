import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { spacing, fontSize } from '../../utils/responsive';

export default function InfoSection({ title, value, colors }) {
    return (
        <View style={styles.infoSection}>
            <Text style={[styles.infoLabel, { color: colors.secondaryText }]}>{title}</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{value}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    infoSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    infoLabel: {
        fontSize: fontSize.md,
        fontWeight: '500',
    },
    infoValue: {
        fontSize: fontSize.md,
    },
});
