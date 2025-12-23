import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import PremiumCard from './PremiumCard';
import { premiumColors, premiumSpacing, premiumTypography } from '../utils/premiumDesign';

export default function PremiumStatsCard({
  title,
  value,
  subtitle,
  icon,
  iconColor,
  gradient,
  trend,
  onPress,
}) {
  const { colors, isDarkMode } = useTheme();
  
  const content = (
    <View style={styles.content}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          {gradient ? (
            <LinearGradient
              colors={gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconGradient}
            >
              <Ionicons name={icon} size={24} color="#FFFFFF" />
            </LinearGradient>
          ) : (
            <View style={[styles.iconCircle, { backgroundColor: iconColor || premiumColors.primary.main }]}>
              <Ionicons name={icon} size={24} color="#FFFFFF" />
            </View>
          )}
        </View>
        {trend != null && trend !== 0 && (
          <View style={[styles.trend, trend > 0 ? styles.trendUp : styles.trendDown]}>
            <Ionicons
              name={trend > 0 ? 'arrow-up' : 'arrow-down'}
              size={12}
              color={trend > 0 ? premiumColors.success : premiumColors.error}
            />
            <Text style={[styles.trendText, trend > 0 ? styles.trendUpText : styles.trendDownText]}>
              {String(Math.abs(trend))}%
            </Text>
          </View>
        )}
      </View>

      <View style={styles.body}>
        <Text 
          style={[
            styles.title, 
            { 
              color: isDarkMode 
                ? 'rgba(255, 255, 255, 0.75)' 
                : premiumColors.neutral[600],
              fontWeight: '600',
            }
          ]}
        >
          {title || ''}
        </Text>
        <Text 
          style={[
            styles.value, 
            { 
              color: isDarkMode 
                ? '#FFFFFF' 
                : premiumColors.neutral[900],
              fontWeight: '700',
            }
          ]}
        >
          {value != null ? String(value) : '0'}
        </Text>
        {subtitle && (
          <Text 
            style={[
              styles.subtitle, 
              { 
                color: isDarkMode 
                  ? 'rgba(255, 255, 255, 0.65)' 
                  : premiumColors.neutral[500],
                fontWeight: '500',
              }
            ]}
          >
            {subtitle}
          </Text>
        )}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        <PremiumCard variant={gradient ? 'gradient' : 'default'} gradient={gradient}>
          {content}
        </PremiumCard>
      </TouchableOpacity>
    );
  }

  return (
    <PremiumCard variant={gradient ? 'gradient' : 'default'} gradient={gradient}>
      {content}
    </PremiumCard>
  );
}

const styles = StyleSheet.create({
  content: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: premiumSpacing.base,
  },
  iconContainer: {
    marginBottom: premiumSpacing.sm,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trend: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: premiumSpacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: premiumColors.neutral[100],
  },
  trendUp: {
    backgroundColor: premiumColors.success + '20',
  },
  trendDown: {
    backgroundColor: premiumColors.error + '20',
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  trendUpText: {
    color: premiumColors.success,
  },
  trendDownText: {
    color: premiumColors.error,
  },
  body: {
    gap: premiumSpacing.xs,
  },
  title: {
    fontSize: premiumTypography.sizes.sm,
    fontWeight: premiumTypography.weights.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: premiumTypography.sizes['3xl'],
    fontWeight: premiumTypography.weights.bold,
  },
  subtitle: {
    fontSize: premiumTypography.sizes.sm,
    fontWeight: premiumTypography.weights.regular,
  },
});

