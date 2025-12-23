import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PremiumStatsCard from './PremiumStatsCard';
import { premiumSpacing } from '../utils/premiumDesign';
import { spacing } from '../utils/responsive';

export default function QuickStatsGrid({ stats, colors, onStatPress }) {
  const statItems = [
    {
      title: 'Study Time',
      value: String(stats?.studyTime || '0h'),
      subtitle: 'Today',
      icon: 'time-outline',
      iconColor: '#6366F1',
      gradient: ['#6366F1', '#8B5CF6'],
      trend: stats?.studyTimeTrend,
    },
    {
      title: 'Lessons',
      value: String(stats?.lessonsCompleted || '0'),
      subtitle: 'This week',
      icon: 'book-outline',
      iconColor: '#10B981',
      gradient: ['#10B981', '#059669'],
      trend: stats?.lessonsTrend,
    },
    {
      title: 'Streak',
      value: `${stats?.streak || 0} days`,
      subtitle: 'Keep it up!',
      icon: 'flame',
      iconColor: '#F59E0B',
      gradient: ['#F59E0B', '#D97706'],
      trend: stats?.streak > 0 ? 1 : 0,
    },
    {
      title: 'XP Earned',
      value: String(stats?.xpToday || '0'),
      subtitle: 'Today',
      icon: 'star',
      iconColor: '#EC4899',
      gradient: ['#EC4899', '#BE185D'],
      trend: stats?.xpTrend,
    },
  ];

  return (
    <View style={styles.container}>
      {statItems.map((stat, index) => (
        <View key={index} style={styles.statItem}>
          <PremiumStatsCard
            title={stat.title}
            value={stat.value}
            subtitle={stat.subtitle}
            icon={stat.icon}
            iconColor={stat.iconColor}
            gradient={stat.gradient}
            trend={stat.trend}
            onPress={onStatPress ? () => onStatPress(stat.title) : undefined}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.base,
  },
  statItem: {
    width: '48%',
  },
});

