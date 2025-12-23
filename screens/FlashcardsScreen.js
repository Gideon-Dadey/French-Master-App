import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../src/context/ThemeContext';
import { useGamification } from '../src/context/GamificationContext';
import { spacing, fontSize } from '../src/utils/responsive';
import { premiumShadows, premiumColors, premiumBorderRadius } from '../src/utils/premiumDesign';

const { width } = Dimensions.get('window');

// French Vocabulary Flashcards
const FLASHCARDS = [
  {
    id: 1,
    category: 'Greetings',
    word: 'Bonjour',
    translation: 'Hello / Good morning',
    pronunciation: 'bohn-ZHOOR',
    example: 'Bonjour, comment allez-vous?',
    exampleTranslation: 'Hello, how are you?',
    difficulty: 'beginner',
  },
  {
    id: 2,
    category: 'Greetings',
    word: 'Bonsoir',
    translation: 'Good evening',
    pronunciation: 'bohn-SWAHR',
    example: 'Bonsoir, je suis content de vous voir.',
    exampleTranslation: 'Good evening, I am happy to see you.',
    difficulty: 'beginner',
  },
  {
    id: 3,
    category: 'Common Phrases',
    word: 'Merci',
    translation: 'Thank you',
    pronunciation: 'mehr-SEE',
    example: 'Merci beaucoup pour votre aide.',
    exampleTranslation: 'Thank you very much for your help.',
    difficulty: 'beginner',
  },
  {
    id: 4,
    category: 'Common Phrases',
    word: 'S\'il vous plaît',
    translation: 'Please',
    pronunciation: 'seel voo PLEH',
    example: 'Un café, s\'il vous plaît.',
    exampleTranslation: 'A coffee, please.',
    difficulty: 'beginner',
  },
  {
    id: 5,
    category: 'Numbers',
    word: 'Un, deux, trois',
    translation: 'One, two, three',
    pronunciation: 'uhn, duh, twah',
    example: 'J\'ai un, deux, trois pommes.',
    exampleTranslation: 'I have one, two, three apples.',
    difficulty: 'beginner',
  },
  {
    id: 6,
    category: 'Family',
    word: 'Famille',
    translation: 'Family',
    pronunciation: 'fah-MEE',
    example: 'Ma famille est très importante pour moi.',
    exampleTranslation: 'My family is very important to me.',
    difficulty: 'beginner',
  },
  {
    id: 7,
    category: 'Food',
    word: 'Pain',
    translation: 'Bread',
    pronunciation: 'pahn',
    example: 'Je mange du pain au petit déjeuner.',
    exampleTranslation: 'I eat bread for breakfast.',
    difficulty: 'beginner',
  },
  {
    id: 8,
    category: 'Food',
    word: 'Eau',
    translation: 'Water',
    pronunciation: 'oh',
    example: 'Je bois de l\'eau tous les jours.',
    exampleTranslation: 'I drink water every day.',
    difficulty: 'beginner',
  },
  {
    id: 9,
    category: 'Time',
    word: 'Aujourd\'hui',
    translation: 'Today',
    pronunciation: 'oh-ZHOOR-DWEE',
    example: 'Aujourd\'hui est un beau jour.',
    exampleTranslation: 'Today is a beautiful day.',
    difficulty: 'intermediate',
  },
  {
    id: 10,
    category: 'Time',
    word: 'Demain',
    translation: 'Tomorrow',
    pronunciation: 'duh-MAHN',
    example: 'Je vais au marché demain.',
    exampleTranslation: 'I am going to the market tomorrow.',
    difficulty: 'intermediate',
  },
  {
    id: 11,
    category: 'Actions',
    word: 'Apprendre',
    translation: 'To learn',
    pronunciation: 'ah-PRAHN-druh',
    example: 'J\'apprends le français depuis un an.',
    exampleTranslation: 'I have been learning French for a year.',
    difficulty: 'intermediate',
  },
  {
    id: 12,
    category: 'Actions',
    word: 'Parler',
    translation: 'To speak',
    pronunciation: 'pahr-LAY',
    example: 'Je parle français couramment.',
    exampleTranslation: 'I speak French fluently.',
    difficulty: 'intermediate',
  },
  {
    id: 13,
    category: 'Places',
    word: 'École',
    translation: 'School',
    pronunciation: 'ay-KOHL',
    example: 'Mon enfant va à l\'école tous les jours.',
    exampleTranslation: 'My child goes to school every day.',
    difficulty: 'beginner',
  },
  {
    id: 14,
    category: 'Places',
    word: 'Maison',
    translation: 'House / Home',
    pronunciation: 'may-ZOHN',
    example: 'Ma maison est près de la plage.',
    exampleTranslation: 'My house is near the beach.',
    difficulty: 'beginner',
  },
  {
    id: 15,
    category: 'Emotions',
    word: 'Heureux',
    translation: 'Happy',
    pronunciation: 'uh-RUH',
    example: 'Je suis très heureux aujourd\'hui.',
    exampleTranslation: 'I am very happy today.',
    difficulty: 'intermediate',
  },
];

export default function FlashcardsScreen({ navigation }) {
  const { colors, isDarkMode } = useTheme();
  const { awardXP } = useGamification();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownCards, setKnownCards] = useState([]);
  const [reviewCards, setReviewCards] = useState([]);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [startTime] = useState(Date.now());

  const currentCard = FLASHCARDS[currentCardIndex];
  const progress = ((currentCardIndex + 1) / FLASHCARDS.length) * 100;
  const flipAnimation = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(1))[0];

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  const handleFlip = () => {
    if (isFlipped) {
      // Flip back to front
      Animated.spring(flipAnimation, {
        toValue: 0,
        friction: 8,
        tension: 100,
        useNativeDriver: true,
      }).start();
    } else {
      // Flip to back
      Animated.spring(flipAnimation, {
        toValue: 1,
        friction: 8,
        tension: 100,
        useNativeDriver: true,
      }).start();
    }
    setIsFlipped(!isFlipped);
  };

  const handleKnown = () => {
    if (!knownCards.includes(currentCard.id)) {
      setKnownCards([...knownCards, currentCard.id]);
    }
    handleNext();
  };

  const handleReview = () => {
    if (!reviewCards.includes(currentCard.id)) {
      setReviewCards([...reviewCards, currentCard.id]);
    }
    handleNext();
  };

  const handleNext = () => {
    if (currentCardIndex < FLASHCARDS.length - 1) {
      // Reset flip state
      setIsFlipped(false);
      flipAnimation.setValue(0);
      
      // Animate transition
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();

      setCurrentCardIndex(currentCardIndex + 1);
    } else {
      finishSession();
    }
  };

  const finishSession = () => {
    setSessionCompleted(true);
    const masteryRate = (knownCards.length / FLASHCARDS.length) * 100;
    
    // Award XP based on mastery
    if (masteryRate >= 80) {
      awardXP(40, 'Excellent flashcard mastery!');
    } else if (masteryRate >= 60) {
      awardXP(25, 'Good flashcard practice!');
    } else {
      awardXP(10, 'Flashcard session completed!');
    }
  };

  const handleRestart = () => {
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setKnownCards([]);
    setReviewCards([]);
    setSessionCompleted(false);
    setTimeElapsed(0);
    flipAnimation.setValue(0);
    scaleAnim.setValue(1);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const frontInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  if (sessionCompleted) {
    const masteryRate = (knownCards.length / FLASHCARDS.length) * 100;
    const needsReview = reviewCards.length;

    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LinearGradient
          colors={[premiumColors.primary.main, premiumColors.primary.main + 'DD']}
          style={styles.resultHeader}
        >
          <View style={styles.resultIconContainer}>
            <Ionicons name="albums" size={64} color="#FFFFFF" />
          </View>
          <Text style={styles.resultTitle}>Session Complete!</Text>
          <Text style={styles.resultSubtitle}>
            Great job practicing your vocabulary
          </Text>
        </LinearGradient>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.resultContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Stats Card */}
          <View
            style={[
              styles.statsCard,
              { backgroundColor: colors.card, borderColor: colors.border },
              premiumShadows.lg,
            ]}
          >
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: premiumColors.accent.emerald + '20' }]}>
                  <Ionicons name="checkmark-circle" size={24} color={premiumColors.accent.emerald} />
                </View>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {knownCards.length}
                </Text>
                <Text style={[styles.statLabel, { color: colors.secondaryText }]}>
                  Known
                </Text>
              </View>
              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: premiumColors.accent.gold + '20' }]}>
                  <Ionicons name="refresh" size={24} color={premiumColors.accent.gold} />
                </View>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {needsReview}
                </Text>
                <Text style={[styles.statLabel, { color: colors.secondaryText }]}>
                  Review
                </Text>
              </View>
              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: premiumColors.info + '20' }]}>
                  <Ionicons name="time" size={24} color={premiumColors.info} />
                </View>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {formatTime(timeElapsed)}
                </Text>
                <Text style={[styles.statLabel, { color: colors.secondaryText }]}>
                  Time
                </Text>
              </View>
            </View>
          </View>

          {/* Mastery Card */}
          <View
            style={[
              styles.masteryCard,
              { backgroundColor: colors.card, borderColor: colors.border },
              premiumShadows.md,
            ]}
          >
            <View
              style={[
                styles.masteryBadge,
                {
                  backgroundColor:
                    masteryRate >= 80
                      ? premiumColors.accent.emerald + '20'
                      : masteryRate >= 60
                      ? premiumColors.accent.gold + '20'
                      : premiumColors.accent.rose + '20',
                },
              ]}
            >
              <Ionicons
                name={masteryRate >= 80 ? 'star' : masteryRate >= 60 ? 'checkmark-circle' : 'alert-circle'}
                size={32}
                color={
                  masteryRate >= 80
                    ? premiumColors.accent.emerald
                    : masteryRate >= 60
                    ? premiumColors.accent.gold
                    : premiumColors.accent.rose
                }
              />
            </View>
            <Text style={[styles.masteryTitle, { color: colors.text }]}>
              {masteryRate >= 80
                ? 'Excellent Mastery!'
                : masteryRate >= 60
                ? 'Good Progress!'
                : 'Keep Practicing!'}
            </Text>
            <Text style={[styles.masteryPercentage, { color: colors.text }]}>
              {masteryRate.toFixed(0)}% Mastery
            </Text>
            <Text style={[styles.masteryText, { color: colors.secondaryText }]}>
              {masteryRate >= 80
                ? 'You\'ve mastered most of these flashcards!'
                : masteryRate >= 60
                ? 'You\'re making great progress with these words.'
                : 'Continue practicing to improve your vocabulary.'}
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.restartButton, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={handleRestart}
            >
              <Ionicons name="refresh" size={20} color={premiumColors.primary.main} />
              <Text style={[styles.actionButtonText, { color: premiumColors.primary.main }]}>
                Practice Again
              </Text>
            </TouchableOpacity>
            {needsReview > 0 && (
              <TouchableOpacity
                style={[styles.actionButton, styles.reviewButton, { backgroundColor: premiumColors.accent.gold }]}
                onPress={() => {
                  // Filter to only review cards
                  const reviewOnly = FLASHCARDS.filter(card => reviewCards.includes(card.id));
                  handleRestart();
                  // Could implement review mode here
                }}
              >
                <Ionicons name="refresh-circle" size={20} color="#FFFFFF" />
                <Text style={styles.actionButtonTextWhite}>
                  Review ({needsReview})
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.actionButton, styles.continueButton, { backgroundColor: premiumColors.primary.main }]}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonTextWhite}>Continue Learning</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={
          isDarkMode
            ? ['#1a0a2e', '#16213e', '#0f3460']
            : ['#E8EAF6', '#F3E5F5', '#E1BEE7']
        }
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={isDarkMode ? '#BB86FC' : '#9C27B0'} />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={[styles.headerTitle, { color: isDarkMode ? '#BB86FC' : '#9C27B0' }]}>
              Flashcards
            </Text>
            <Text style={[styles.headerSubtitle, { color: isDarkMode ? '#FFFFFF' : '#424242' }]}>
              Learn French vocabulary
            </Text>
          </View>
          <View style={styles.timerContainer}>
            <Ionicons name="time-outline" size={20} color={isDarkMode ? '#BB86FC' : '#9C27B0'} />
            <Text style={[styles.timerText, { color: isDarkMode ? '#FFFFFF' : '#424242' }]}>
              {formatTime(timeElapsed)}
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: `${progress}%`,
                backgroundColor: premiumColors.primary.main,
              },
            ]}
          />
        </View>
        <Text style={[styles.progressText, { color: colors.secondaryText }]}>
          Card {currentCardIndex + 1} of {FLASHCARDS.length}
        </Text>
      </View>

      {/* Flashcard */}
      <View style={styles.flashcardContainer}>
        <TouchableOpacity
          style={styles.flashcardTouchable}
          onPress={handleFlip}
          activeOpacity={0.9}
        >
          <Animated.View
            style={[
              styles.flashcard,
              styles.flashcardFront,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                transform: [{ rotateY: frontInterpolate }, { scale: scaleAnim }],
              },
              premiumShadows.xl,
            ]}
          >
            <View style={styles.flashcardContent}>
              <View style={styles.categoryBadge}>
                <Ionicons name="pricetag" size={14} color={premiumColors.primary.main} />
                <Text style={[styles.categoryText, { color: premiumColors.primary.main }]}>
                  {currentCard.category}
                </Text>
              </View>
              <View style={styles.wordContainer}>
                <Text style={[styles.word, { color: colors.text }]}>
                  {currentCard.word}
                </Text>
                <Text style={[styles.pronunciation, { color: colors.secondaryText }]}>
                  [{currentCard.pronunciation}]
                </Text>
              </View>
              <View style={styles.flipHint}>
                <Ionicons name="repeat" size={16} color={colors.secondaryText} />
                <Text style={[styles.flipHintText, { color: colors.secondaryText }]}>
                  Tap to flip
                </Text>
              </View>
            </View>
          </Animated.View>

          <Animated.View
            style={[
              styles.flashcard,
              styles.flashcardBack,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                transform: [{ rotateY: backInterpolate }, { scale: scaleAnim }],
              },
              premiumShadows.xl,
            ]}
          >
            <View style={styles.flashcardContent}>
              <View style={styles.categoryBadge}>
                <Ionicons name="pricetag" size={14} color={premiumColors.accent.emerald} />
                <Text style={[styles.categoryText, { color: premiumColors.accent.emerald }]}>
                  {currentCard.category}
                </Text>
              </View>
              <View style={styles.translationContainer}>
                <Text style={[styles.translation, { color: colors.text }]}>
                  {currentCard.translation}
                </Text>
              </View>
              <View style={styles.exampleContainer}>
                <Text style={[styles.exampleLabel, { color: colors.secondaryText }]}>
                  Example:
                </Text>
                <Text style={[styles.example, { color: colors.text }]}>
                  {currentCard.example}
                </Text>
                <Text style={[styles.exampleTranslation, { color: colors.secondaryText }]}>
                  {currentCard.exampleTranslation}
                </Text>
              </View>
              <View style={styles.flipHint}>
                <Ionicons name="repeat" size={16} color={colors.secondaryText} />
                <Text style={[styles.flipHintText, { color: colors.secondaryText }]}>
                  Tap to flip back
                </Text>
              </View>
            </View>
          </Animated.View>
        </TouchableOpacity>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.reviewButton, { backgroundColor: premiumColors.primary.main }]}
            onPress={handleReview}
          >
            <Ionicons name="refresh" size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonTextWhite}>Review</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.knownButton, { backgroundColor: premiumColors.accent.emerald }]}
            onPress={handleKnown}
          >
            <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonTextWhite}>Known</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    marginBottom: spacing.xs / 2,
  },
  headerSubtitle: {
    fontSize: fontSize.sm,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: premiumBorderRadius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  timerText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  progressContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: spacing.xs,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    textAlign: 'center',
  },
  flashcardContainer: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flashcardTouchable: {
    width: width - spacing.lg * 2,
    height: 400,
    marginBottom: spacing.xl,
  },
  flashcard: {
    width: '100%',
    height: '100%',
    borderRadius: premiumBorderRadius.xl,
    borderWidth: 1,
    position: 'absolute',
    backfaceVisibility: 'hidden',
  },
  flashcardFront: {},
  flashcardBack: {},
  flashcardContent: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'space-between',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: premiumBorderRadius.base,
    backgroundColor: 'rgba(156, 39, 176, 0.1)',
    gap: spacing.xs / 2,
  },
  categoryText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  wordContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  word: {
    fontSize: fontSize.xxxl,
    fontWeight: '700',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  pronunciation: {
    fontSize: fontSize.md,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  translationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  translation: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  exampleContainer: {
    marginTop: spacing.lg,
  },
  exampleLabel: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  example: {
    fontSize: fontSize.md,
    fontStyle: 'italic',
    marginBottom: spacing.xs,
    lineHeight: 24,
  },
  exampleTranslation: {
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  flipHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs / 2,
    marginTop: spacing.md,
  },
  flipHintText: {
    fontSize: fontSize.xs,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: premiumBorderRadius.lg,
    gap: spacing.sm,
    borderWidth: 1,
  },
  reviewButton: {},
  knownButton: {},
  actionButtonText: {
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  actionButtonTextWhite: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // Results Screen Styles
  resultHeader: {
    paddingTop: 60,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  resultIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  resultTitle: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },
  resultSubtitle: {
    fontSize: fontSize.md,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  scrollView: {
    flex: 1,
  },
  resultContent: {
    padding: spacing.lg,
  },
  statsCard: {
    borderRadius: premiumBorderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    marginBottom: spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: fontSize.xs,
  },
  masteryCard: {
    borderRadius: premiumBorderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  masteryBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  masteryTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  masteryPercentage: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  masteryText: {
    fontSize: fontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
  restartButton: {},
  continueButton: {},
});

