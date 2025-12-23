import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import PremiumCard from './PremiumCard';
import PremiumProgressBar from './PremiumProgressBar';
import PremiumBadge from './PremiumBadge';
import { premiumColors, premiumSpacing, premiumBorderRadius, premiumTypography } from '../utils/premiumDesign';

export default function DailyChallengeCard({ challenge, onPress, colors }) {
  const progress = challenge?.completed || 0;
  const target = challenge?.target || 100;

  return (
    <PremiumCard
      variant="gradient"
      gradient={['#6366F1', '#8B5CF6']}
      onPress={onPress}
      style={styles.card}
    >
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="trophy" size={32} color="#FFD700" />
        </View>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Daily Challenge</Text>
          <Text style={styles.subtitle}>{challenge?.title || 'Complete your daily goals'}</Text>
        </View>
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>
            {progress}/{target} {challenge?.unit || 'points'}
          </Text>
          <PremiumBadge
            label={progress >= target ? 'Completed!' : `${target - progress} left`}
            variant={progress >= target ? 'success' : 'outline'}
            size="sm"
          />
        </View>
        <PremiumProgressBar
          progress={(progress / target) * 100}
          variant="primary"
          height={8}
          animated={true}
        />
      </View>

      {challenge?.rewards && (
        <View style={styles.rewardsContainer}>
          <Text style={styles.rewardsLabel}>Rewards:</Text>
          <View style={styles.rewardsList}>
            {challenge.rewards.map((reward, index) => (
              <View key={index} style={styles.rewardItem}>
                <Ionicons name={reward.icon} size={16} color="#FFD700" />
                <Text style={styles.rewardText}>{reward.text}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </PremiumCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: premiumSpacing.base,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: premiumSpacing.md,
  },
  iconContainer: {
    marginRight: premiumSpacing.base,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: premiumTypography.sizes.lg,
    fontWeight: premiumTypography.weights.bold,
    color: '#FFFFFF',
    marginBottom: premiumSpacing.xs,
  },
  subtitle: {
    fontSize: premiumTypography.sizes.sm,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  progressSection: {
    marginTop: premiumSpacing.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: premiumSpacing.sm,
  },
  progressLabel: {
    fontSize: premiumTypography.sizes.base,
    fontWeight: premiumTypography.weights.semibold,
    color: '#FFFFFF',
  },
  rewardsContainer: {
    marginTop: premiumSpacing.md,
    paddingTop: premiumSpacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  rewardsLabel: {
    fontSize: premiumTypography.sizes.sm,
    fontWeight: premiumTypography.weights.medium,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: premiumSpacing.xs,
  },
  rewardsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: premiumSpacing.sm,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: premiumSpacing.xs,
  },
  rewardText: {
    fontSize: premiumTypography.sizes.xs,
    color: 'rgba(255, 255, 255, 0.9)',
  },
});

