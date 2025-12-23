import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PremiumCard from './PremiumCard';
import { premiumColors, premiumSpacing, premiumTypography } from '../utils/premiumDesign';

export default function LearningInsightCard({ insight, onPress, colors }) {
  const insightTypes = {
    improvement: {
      icon: 'trending-up',
      color: premiumColors.success,
      bgColor: premiumColors.success + '20',
    },
    focus: {
      icon: 'target',
      color: premiumColors.warning,
      bgColor: premiumColors.warning + '20',
    },
    achievement: {
      icon: 'trophy',
      color: premiumColors.accent.gold,
      bgColor: premiumColors.accent.gold + '20',
    },
    tip: {
      icon: 'bulb',
      color: premiumColors.info,
      bgColor: premiumColors.info + '20',
    },
  };

  const typeConfig = insightTypes[insight?.type] || insightTypes.tip;

  return (
    <PremiumCard onPress={onPress} style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: typeConfig.bgColor }]}>
          <Ionicons name={typeConfig.icon} size={24} color={typeConfig.color} />
        </View>
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors?.text || premiumColors.neutral[900] }]}>
            {insight?.title || 'Learning Insight'}
          </Text>
          <Text style={[styles.description, { color: colors?.secondaryText || premiumColors.neutral[600] }]}>
            {insight?.description || 'Keep up the great work!'}
          </Text>
          {insight?.actionText && (
            <TouchableOpacity
              style={[styles.actionButton, { borderColor: typeConfig.color }]}
              onPress={onPress}
            >
              <Text style={[styles.actionText, { color: typeConfig.color }]}>
                {insight.actionText}
              </Text>
              <Ionicons name="arrow-forward" size={16} color={typeConfig.color} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </PremiumCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: premiumSpacing.base,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: premiumSpacing.base,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: premiumTypography.sizes.base,
    fontWeight: premiumTypography.weights.bold,
    marginBottom: premiumSpacing.xs,
  },
  description: {
    fontSize: premiumTypography.sizes.sm,
    lineHeight: 20,
    marginBottom: premiumSpacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: premiumSpacing.xs,
    paddingHorizontal: premiumSpacing.sm,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: premiumSpacing.xs,
    gap: premiumSpacing.xs,
  },
  actionText: {
    fontSize: premiumTypography.sizes.sm,
    fontWeight: premiumTypography.weights.semibold,
  },
});

