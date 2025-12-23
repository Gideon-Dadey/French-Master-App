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

export default function PracticeScreen({ navigation }) {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [currentFlashcard, setCurrentFlashcard] = useState({
    word: 'un cahier',
    translation: 'a notebook',
  });

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
          <Text style={styles.headerTitle}>Practice</Text>
          <Text style={styles.headerSubtitle}>Spaced repetition + speaking</Text>
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
        {/* Flashcards Section */}
        <PracticeCard
          title="Flashcards"
          description="Review saved words • daily queue • mastery score"
          accentColor="#1E88E5"
          colors={colors}
        />

        {/* Current Flashcard */}
        <View style={[styles.flashcard, { backgroundColor: colors.card }]}>
          <Text style={[styles.flashcardWord, { color: colors.text }]}>{currentFlashcard.word}</Text>
          <Text style={[styles.flashcardTranslation, { color: colors.secondaryText }]}>
            {currentFlashcard.translation}
          </Text>
          <View style={styles.flashcardActions}>
            <TouchableOpacity
              style={[styles.flashcardButton, { backgroundColor: '#4CAF50' }]}
              onPress={() => {}}
            >
              <Text style={styles.flashcardButtonText}>Known</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.flashcardButton, { backgroundColor: '#6A1B9A' }]}
              onPress={() => {}}
            >
              <Text style={styles.flashcardButtonText}>Again</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Speaking Drill Section */}
        <PracticeCard
          title="Speaking drill"
          description="Record → compare → tips (pronunciation & fluency)"
          accentColor="#FFD700"
          colors={colors}
        />
      </ScrollView>
    </View>
  );
}

function PracticeCard({ title, description, accentColor, colors }) {
  return (
    <View style={[styles.practiceCard, { backgroundColor: colors.card }]}>
      <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
      <View style={styles.cardContent}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.cardDescription, { color: colors.secondaryText }]}>{description}</Text>
      </View>
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
  practiceCard: {
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
  flashcard: {
    borderRadius: spacing.md,
    padding: spacing.xl,
    marginBottom: spacing.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  flashcardWord: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  flashcardTranslation: {
    fontSize: fontSize.lg,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  flashcardActions: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  flashcardButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: spacing.md,
    alignItems: 'center',
  },
  flashcardButtonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

