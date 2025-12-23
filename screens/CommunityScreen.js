import React, { useState } from 'react';
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

export default function CommunityScreen({ navigation }) {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

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
          <Text style={styles.headerTitle}>Community</Text>
          <Text style={styles.headerSubtitle}>Connect with learners and teachers</Text>
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
        <View style={[styles.comingSoonCard, { backgroundColor: colors.card }]}>
          <Ionicons name="people-outline" size={64} color={colors.secondaryText} />
          <Text style={[styles.comingSoonTitle, { color: colors.text }]}>Community Features</Text>
          <Text style={[styles.comingSoonText, { color: colors.secondaryText }]}>
            Community features are coming soon! Connect with other learners, share your progress, and get feedback on your writing.
          </Text>
        </View>
      </ScrollView>
    </View>
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
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 400,
  },
  comingSoonCard: {
    width: '100%',
    padding: spacing.xl,
    borderRadius: spacing.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  comingSoonTitle: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  comingSoonText: {
    fontSize: fontSize.md,
    textAlign: 'center',
    lineHeight: 24,
  },
});

