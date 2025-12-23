import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';
import { spacing, fontSize } from '../src/utils/responsive';

export default function LearnScreen({ navigation }) {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    // Load lesson data
    setTimeout(() => setRefreshing(false), 1000);
  };

  const userName = user?.name?.split(' ')[0] || 'User';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Gradient Header */}
      <LinearGradient
        colors={['#1E88E5', '#6A1B9A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Lesson: À l'école</Text>
          <Text style={styles.headerSubtitle}>Dialogue + guided practice</Text>
          <View style={styles.cefrBadge}>
            <Text style={styles.cefrBadgeText}>A1-B2</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Audio Dialogue Section */}
        <LessonCard
          title="Audio dialogue (1:12)"
          description="Tap words for meaning • Slow mode • Shadowing"
          accentColor="#6A1B9A"
          colors={colors}
          onPress={() => navigation.navigate('Courses')}
        />

        {/* Transcript Section */}
        <LessonCard
          title="Transcript"
          description="Tap words for meaning • Slow mode • Shadowing"
          accentColor="#6A1B9A"
          colors={colors}
          onPress={() => navigation.navigate('Courses')}
        />

        {/* Quick Checks Section */}
        <LessonCard
          title="Quick checks"
          description="3 questions • 1 speaking prompt • instant feedback"
          accentColor="#FFD700"
          colors={colors}
          onPress={() => navigation.navigate('Courses')}
        />

        {/* Complete Lesson Button */}
        <TouchableOpacity
          style={[styles.completeButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('Courses')}
        >
          <Text style={styles.completeButtonText}>Complete lesson → Earn XP + badge</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function LessonCard({ title, description, accentColor, colors, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.lessonCard, { backgroundColor: colors.card }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
      <View style={styles.cardContent}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.cardDescription, { color: colors.secondaryText }]}>{description}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    paddingTop: spacing.xxxl + 10,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  headerContent: {
    width: '100%',
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: fontSize.md,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: spacing.md,
  },
  cefrBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFD700',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
  },
  cefrBadgeText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  lessonCard: {
    flexDirection: 'row',
    borderRadius: spacing.md,
    marginBottom: spacing.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  accentBar: {
    width: 4,
  },
  cardContent: {
    flex: 1,
    padding: spacing.lg,
  },
  cardTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  cardDescription: {
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  completeButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  completeButtonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

