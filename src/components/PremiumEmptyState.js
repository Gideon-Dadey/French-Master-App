import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PremiumButton from './PremiumButton';
import { premiumColors, premiumSpacing, premiumTypography } from '../utils/premiumDesign';

export default function PremiumEmptyState({
  icon = 'document-outline',
  title,
  description,
  actionLabel,
  onAction,
  illustration,
}) {
  return (
    <View style={styles.container}>
      {illustration || (
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={64} color={premiumColors.neutral[300]} />
        </View>
      )}

      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}

      {actionLabel && onAction && (
        <View style={styles.actionContainer}>
          <PremiumButton
            title={actionLabel}
            onPress={onAction}
            variant="primary"
            size="md"
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: premiumSpacing['3xl'],
    minHeight: 300,
  },
  iconContainer: {
    marginBottom: premiumSpacing.xl,
    opacity: 0.5,
  },
  title: {
    fontSize: premiumTypography.sizes.xl,
    fontWeight: premiumTypography.weights.bold,
    color: premiumColors.neutral[900],
    textAlign: 'center',
    marginBottom: premiumSpacing.md,
  },
  description: {
    fontSize: premiumTypography.sizes.base,
    fontWeight: premiumTypography.weights.regular,
    color: premiumColors.neutral[600],
    textAlign: 'center',
    lineHeight: premiumTypography.lineHeights.relaxed * premiumTypography.sizes.base,
    marginBottom: premiumSpacing.xl,
    maxWidth: 300,
  },
  actionContainer: {
    marginTop: premiumSpacing.base,
  },
});

