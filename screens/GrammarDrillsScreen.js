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

// French Grammar Drills
const GRAMMAR_DRILLS = [
  {
    id: 1,
    category: 'Articles',
    question: 'Complete: "___ livre est sur la table." (The book is on the table.)',
    type: 'fill_blank',
    options: [
      { text: 'Le', isCorrect: true },
      { text: 'La', isCorrect: false },
      { text: 'Les', isCorrect: false },
      { text: 'Un', isCorrect: false },
    ],
    explanation: '"Le" is the masculine singular definite article. "Livre" (book) is masculine, so we use "le".',
    points: 1,
  },
  {
    id: 2,
    category: 'Verbs - Être',
    question: 'Complete: "Nous ___ étudiants." (We are students.)',
    type: 'fill_blank',
    options: [
      { text: 'sommes', isCorrect: true },
      { text: 'êtes', isCorrect: false },
      { text: 'sont', isCorrect: false },
      { text: 'est', isCorrect: false },
    ],
    explanation: '"Sommes" is the first person plural form of "être" (to be). "Nous sommes" means "we are".',
    points: 1,
  },
  {
    id: 3,
    category: 'Verbs - Avoir',
    question: 'Complete: "Tu ___ un chat." (You have a cat.)',
    type: 'fill_blank',
    options: [
      { text: 'as', isCorrect: true },
      { text: 'a', isCorrect: false },
      { text: 'avez', isCorrect: false },
      { text: 'ont', isCorrect: false },
    ],
    explanation: '"As" is the second person singular form of "avoir" (to have). "Tu as" means "you have".',
    points: 1,
  },
  {
    id: 4,
    category: 'Adjectives',
    question: 'Complete: "La maison est ___." (The house is big.)',
    type: 'fill_blank',
    options: [
      { text: 'grande', isCorrect: true },
      { text: 'grand', isCorrect: false },
      { text: 'grands', isCorrect: false },
      { text: 'grandes', isCorrect: false },
    ],
    explanation: '"Grande" is the feminine singular form. "Maison" (house) is feminine, so the adjective must agree: "grande".',
    points: 1,
  },
  {
    id: 5,
    category: 'Pronouns',
    question: 'Complete: "Je ___ aime." (I like it/him/her.)',
    type: 'fill_blank',
    options: [
      { text: "l'", isCorrect: true },
      { text: 'le', isCorrect: false },
      { text: 'la', isCorrect: false },
      { text: 'les', isCorrect: false },
    ],
    explanation: '"L\'" is used before a vowel. "J\'aime" + "l\'" = "Je l\'aime" (I like it/him/her).',
    points: 1,
  },
  {
    id: 6,
    category: 'Negation',
    question: 'Complete: "Je ___ ___ français." (I don\'t speak French.)',
    type: 'fill_blank',
    options: [
      { text: 'ne parle pas', isCorrect: true },
      { text: 'parle ne pas', isCorrect: false },
      { text: 'ne pas parle', isCorrect: false },
      { text: 'pas ne parle', isCorrect: false },
    ],
    explanation: 'French negation uses "ne...pas" around the verb. "Je ne parle pas" means "I don\'t speak".',
    points: 1,
  },
  {
    id: 7,
    category: 'Prepositions',
    question: 'Complete: "Je vais ___ Paris." (I am going to Paris.)',
    type: 'fill_blank',
    options: [
      { text: 'à', isCorrect: true },
      { text: 'en', isCorrect: false },
      { text: 'dans', isCorrect: false },
      { text: 'sur', isCorrect: false },
    ],
    explanation: '"À" is used for cities. "Je vais à Paris" means "I am going to Paris". "En" is used for countries.',
    points: 1,
  },
  {
    id: 8,
    category: 'Verbs - Present Tense',
    question: 'Complete: "Ils ___ le français." (They learn French.)',
    type: 'fill_blank',
    options: [
      { text: 'apprennent', isCorrect: true },
      { text: 'apprend', isCorrect: false },
      { text: 'apprends', isCorrect: false },
      { text: 'apprenez', isCorrect: false },
    ],
    explanation: '"Apprennent" is the third person plural form of "apprendre" (to learn). "Ils apprennent" means "they learn".',
    points: 1,
  },
  {
    id: 9,
    category: 'Possessive Adjectives',
    question: 'Complete: "C\'est ___ voiture." (It\'s my car.)',
    type: 'fill_blank',
    options: [
      { text: 'ma', isCorrect: true },
      { text: 'mon', isCorrect: false },
      { text: 'mes', isCorrect: false },
      { text: 'ton', isCorrect: false },
    ],
    explanation: '"Ma" is the feminine singular possessive adjective for "my". "Voiture" (car) is feminine, so "ma voiture" means "my car".',
    points: 1,
  },
  {
    id: 10,
    category: 'Question Formation',
    question: 'Complete: "___ tu parles français?" (Do you speak French?)',
    type: 'fill_blank',
    options: [
      { text: 'Est-ce que', isCorrect: true },
      { text: 'Qu\'est-ce que', isCorrect: false },
      { text: 'Comment', isCorrect: false },
      { text: 'Pourquoi', isCorrect: false },
    ],
    explanation: '"Est-ce que" is used to form yes/no questions. "Est-ce que tu parles français?" means "Do you speak French?"',
    points: 1,
  },
  {
    id: 11,
    category: 'Verbs - Reflexive',
    question: 'Complete: "Je ___ lève tôt." (I wake up early.)',
    type: 'fill_blank',
    options: [
      { text: 'me', isCorrect: true },
      { text: 'te', isCorrect: false },
      { text: 'se', isCorrect: false },
      { text: 'nous', isCorrect: false },
    ],
    explanation: '"Me" is the first person singular reflexive pronoun. "Je me lève" means "I wake up" (literally "I raise myself").',
    points: 1,
  },
  {
    id: 12,
    category: 'Adverbs',
    question: 'Complete: "Il parle français ___." (He speaks French well.)',
    type: 'fill_blank',
    options: [
      { text: 'bien', isCorrect: true },
      { text: 'bon', isCorrect: false },
      { text: 'bonne', isCorrect: false },
      { text: 'bons', isCorrect: false },
    ],
    explanation: '"Bien" is an adverb meaning "well". "Bon/bonne" are adjectives meaning "good". Adverbs modify verbs, so "parle bien" (speaks well).',
    points: 1,
  },
];

export default function GrammarDrillsScreen({ navigation }) {
  const { colors, isDarkMode } = useTheme();
  const { awardXP } = useGamification();
  const [currentDrillIndex, setCurrentDrillIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [drillCompleted, setDrillCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [startTime] = useState(Date.now());

  const currentDrill = GRAMMAR_DRILLS[currentDrillIndex];
  const progress = ((currentDrillIndex + 1) / GRAMMAR_DRILLS.length) * 100;
  const fadeAnim = useState(new Animated.Value(1))[0];
  const scaleAnim = useState(new Animated.Value(1))[0];

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  const handleAnswerSelect = (optionIndex) => {
    if (showExplanation) return;
    
    setSelectedAnswer(optionIndex);
    const isCorrect = currentDrill.options[optionIndex].isCorrect;
    
    // Animate selection
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Save answer
    const newAnswers = [...answers];
    newAnswers[currentDrillIndex] = {
      drillId: currentDrill.id,
      answer: optionIndex,
      isCorrect,
    };
    setAnswers(newAnswers);

    // Show explanation after a brief delay
    setTimeout(() => {
      setShowExplanation(true);
      if (isCorrect) {
        setScore(score + currentDrill.points);
      }
    }, 500);
  };

  const handleNext = () => {
    if (currentDrillIndex < GRAMMAR_DRILLS.length - 1) {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      setCurrentDrillIndex(currentDrillIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      finishDrill();
    }
  };

  const finishDrill = () => {
    const totalScore = answers.reduce((sum, ans) => sum + (ans?.isCorrect ? 1 : 0), 0);
    const finalScore = totalScore + (answers[GRAMMAR_DRILLS.length - 1]?.isCorrect ? 1 : 0);
    const finalPercentage = (finalScore / GRAMMAR_DRILLS.length) * 100;

    setScore(finalScore);
    setDrillCompleted(true);

    // Award XP based on performance
    if (finalPercentage >= 80) {
      awardXP(60, 'Excellent grammar mastery!');
    } else if (finalPercentage >= 60) {
      awardXP(40, 'Good grammar practice!');
    } else {
      awardXP(15, 'Grammar drill completed!');
    }
  };

  const handleRestart = () => {
    setCurrentDrillIndex(0);
    setSelectedAnswer(null);
    setAnswers([]);
    setShowExplanation(false);
    setDrillCompleted(false);
    setScore(0);
    setTimeElapsed(0);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (drillCompleted) {
    const percentage = (score / GRAMMAR_DRILLS.length) * 100;
    const passed = percentage >= 70;

    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LinearGradient
          colors={
            passed
              ? [premiumColors.accent.emerald, premiumColors.accent.emerald + 'DD']
              : [premiumColors.info, premiumColors.info + 'DD']
          }
          style={styles.resultHeader}
        >
          <View style={styles.resultIconContainer}>
            <Ionicons
              name={passed ? 'school' : 'book'}
              size={64}
              color="#FFFFFF"
            />
          </View>
          <Text style={styles.resultTitle}>
            {passed ? 'Grammar Master!' : 'Keep Practicing!'}
          </Text>
          <Text style={styles.resultSubtitle}>
            {passed
              ? 'You\'ve mastered French grammar!'
              : 'Practice makes perfect!'}
          </Text>
        </LinearGradient>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.resultContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Score Card */}
          <View
            style={[
              styles.scoreCard,
              { backgroundColor: colors.card, borderColor: colors.border },
              premiumShadows.lg,
            ]}
          >
            <View style={styles.scoreRow}>
              <View style={styles.scoreItem}>
                <Text style={[styles.scoreLabel, { color: colors.secondaryText }]}>
                  Score
                </Text>
                <Text style={[styles.scoreValue, { color: colors.text }]}>
                  {score}/{GRAMMAR_DRILLS.length}
                </Text>
              </View>
              <View style={styles.scoreDivider} />
              <View style={styles.scoreItem}>
                <Text style={[styles.scoreLabel, { color: colors.secondaryText }]}>
                  Percentage
                </Text>
                <Text style={[styles.scoreValue, { color: colors.text }]}>
                  {percentage.toFixed(0)}%
                </Text>
              </View>
              <View style={styles.scoreDivider} />
              <View style={styles.scoreItem}>
                <Text style={[styles.scoreLabel, { color: colors.secondaryText }]}>
                  Time
                </Text>
                <Text style={[styles.scoreValue, { color: colors.text }]}>
                  {formatTime(timeElapsed)}
                </Text>
              </View>
            </View>
          </View>

          {/* Performance Badge */}
          <View
            style={[
              styles.performanceCard,
              { backgroundColor: colors.card, borderColor: colors.border },
              premiumShadows.md,
            ]}
          >
            <View
              style={[
                styles.performanceBadge,
                {
                  backgroundColor:
                    percentage >= 90
                      ? premiumColors.accent.emerald + '20'
                      : percentage >= 70
                      ? premiumColors.info + '20'
                      : premiumColors.accent.rose + '20',
                },
              ]}
            >
              <Ionicons
                name={
                  percentage >= 90
                    ? 'star'
                    : percentage >= 70
                    ? 'checkmark-circle'
                    : 'alert-circle'
                }
                size={32}
                color={
                  percentage >= 90
                    ? premiumColors.accent.emerald
                    : percentage >= 70
                    ? premiumColors.info
                    : premiumColors.accent.rose
                }
              />
            </View>
            <Text style={[styles.performanceTitle, { color: colors.text }]}>
              {percentage >= 90
                ? 'Grammar Expert!'
                : percentage >= 70
                ? 'Well Done!'
                : 'Good Effort!'}
            </Text>
            <Text style={[styles.performanceText, { color: colors.secondaryText }]}>
              {percentage >= 90
                ? 'You have excellent French grammar skills!'
                : percentage >= 70
                ? 'You have a solid understanding of French grammar.'
                : 'Keep practicing to improve your grammar skills.'}
            </Text>
          </View>

          {/* Review Answers */}
          <View style={styles.reviewSection}>
            <Text style={[styles.reviewTitle, { color: colors.text }]}>
              Review Your Answers
            </Text>
            {GRAMMAR_DRILLS.map((drill, index) => {
              const userAnswer = answers[index];
              const isCorrect = userAnswer?.isCorrect;
              const selectedOption = drill.options[userAnswer?.answer];

              return (
                <View
                  key={drill.id}
                  style={[
                    styles.reviewItem,
                    {
                      backgroundColor: colors.card,
                      borderColor: isCorrect
                        ? premiumColors.accent.emerald
                        : premiumColors.error,
                    },
                    premiumShadows.sm,
                  ]}
                >
                  <View style={styles.reviewItemHeader}>
                    <View
                      style={[
                        styles.reviewIcon,
                        {
                          backgroundColor: isCorrect
                            ? premiumColors.accent.emerald + '20'
                            : premiumColors.error + '20',
                        },
                      ]}
                    >
                      <Ionicons
                        name={isCorrect ? 'checkmark-circle' : 'close-circle'}
                        size={24}
                        color={isCorrect ? premiumColors.accent.emerald : premiumColors.error}
                      />
                    </View>
                    <View style={styles.reviewQuestionContainer}>
                      <Text style={[styles.reviewCategory, { color: premiumColors.info }]}>
                        {drill.category}
                      </Text>
                      <Text style={[styles.reviewQuestion, { color: colors.text }]}>
                        {drill.question}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.reviewAnswer, { color: colors.secondaryText }]}>
                    Your answer: {selectedOption?.text || 'Not answered'}
                  </Text>
                  {drill.explanation && (
                    <Text style={[styles.reviewExplanation, { color: colors.secondaryText }]}>
                      {drill.explanation}
                    </Text>
                  )}
                </View>
              );
            })}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.restartButton, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={handleRestart}
            >
              <Ionicons name="refresh" size={20} color={premiumColors.info} />
              <Text style={[styles.actionButtonText, { color: premiumColors.info }]}>
                Retake Drill
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.continueButton, { backgroundColor: premiumColors.info }]}
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
              Grammar Drills
            </Text>
            <Text style={[styles.headerSubtitle, { color: isDarkMode ? '#FFFFFF' : '#424242' }]}>
              Master French grammar
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
                backgroundColor: premiumColors.info,
              },
            ]}
          />
        </View>
        <Text style={[styles.progressText, { color: colors.secondaryText }]}>
          Drill {currentDrillIndex + 1} of {GRAMMAR_DRILLS.length}
        </Text>
      </View>

      {/* Drill Card */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.drillCard,
            { backgroundColor: colors.card, borderColor: colors.border },
            premiumShadows.lg,
            { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
          ]}
        >
          <View style={styles.drillHeader}>
            <View
              style={[
                styles.categoryBadge,
                { backgroundColor: premiumColors.info + '20' },
              ]}
            >
              <Ionicons name="school" size={16} color={premiumColors.info} />
              <Text style={[styles.categoryText, { color: premiumColors.info }]}>
                {currentDrill.category}
              </Text>
            </View>
            <View
              style={[
                styles.drillNumber,
                { backgroundColor: premiumColors.info + '20' },
              ]}
            >
              <Text style={[styles.drillNumberText, { color: premiumColors.info }]}>
                {currentDrillIndex + 1}
              </Text>
            </View>
          </View>

          <Text style={[styles.drillQuestion, { color: colors.text }]}>
            {currentDrill.question}
          </Text>

          {/* Options */}
          <View style={styles.optionsContainer}>
            {currentDrill.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = option.isCorrect;
              const showResult = showExplanation && isSelected;

              let optionStyle = { backgroundColor: colors.card, borderColor: colors.border };
              if (showResult) {
                optionStyle = {
                  backgroundColor: isCorrect
                    ? premiumColors.accent.emerald + '20'
                    : premiumColors.error + '20',
                  borderColor: isCorrect
                    ? premiumColors.accent.emerald
                    : premiumColors.error,
                };
              } else if (isSelected) {
                optionStyle = {
                  backgroundColor: premiumColors.info + '20',
                  borderColor: premiumColors.info,
                };
              }

              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.option, optionStyle, premiumShadows.sm]}
                  onPress={() => handleAnswerSelect(index)}
                  disabled={showExplanation}
                  activeOpacity={0.7}
                >
                  <View style={styles.optionContent}>
                    <View
                      style={[
                        styles.optionIndicator,
                        {
                          backgroundColor: isSelected
                            ? premiumColors.info
                            : colors.border,
                        },
                      ]}
                    >
                      {showResult && (
                        <Ionicons
                          name={isCorrect ? 'checkmark' : 'close'}
                          size={16}
                          color="#FFFFFF"
                        />
                      )}
                    </View>
                    <Text style={[styles.optionText, { color: colors.text }]}>
                      {option.text}
                    </Text>
                  </View>
                  {showResult && (
                    <Ionicons
                      name={isCorrect ? 'checkmark-circle' : 'close-circle'}
                      size={24}
                      color={isCorrect ? premiumColors.accent.emerald : premiumColors.error}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Explanation */}
          {showExplanation && currentDrill.explanation && (
            <View
              style={[
                styles.explanationCard,
                {
                  backgroundColor:
                    selectedAnswer !== null &&
                    currentDrill.options[selectedAnswer].isCorrect
                      ? premiumColors.accent.emerald + '10'
                      : premiumColors.error + '10',
                  borderColor:
                    selectedAnswer !== null &&
                    currentDrill.options[selectedAnswer].isCorrect
                      ? premiumColors.accent.emerald
                      : premiumColors.error,
                },
              ]}
            >
              <Ionicons
                name="bulb"
                size={20}
                color={
                  selectedAnswer !== null &&
                  currentDrill.options[selectedAnswer].isCorrect
                    ? premiumColors.accent.emerald
                    : premiumColors.error
                }
              />
              <Text
                style={[
                  styles.explanationText,
                  {
                    color:
                      selectedAnswer !== null &&
                      currentDrill.options[selectedAnswer].isCorrect
                        ? premiumColors.accent.emerald
                        : premiumColors.error,
                  },
                ]}
              >
                {currentDrill.explanation}
              </Text>
            </View>
          )}

          {/* Next Button */}
          {showExplanation && (
            <TouchableOpacity
              style={[styles.nextButton, { backgroundColor: premiumColors.info }]}
              onPress={handleNext}
            >
              <Text style={styles.nextButtonText}>
                {currentDrillIndex < GRAMMAR_DRILLS.length - 1
                  ? 'Next Drill'
                  : 'Finish Practice'}
              </Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </Animated.View>
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  drillCard: {
    borderRadius: premiumBorderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
  },
  drillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: premiumBorderRadius.base,
    gap: spacing.xs / 2,
  },
  categoryText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  drillNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  drillNumberText: {
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  drillQuestion: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    lineHeight: 28,
    marginBottom: spacing.xl,
  },
  optionsContainer: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: premiumBorderRadius.lg,
    borderWidth: 2,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  optionText: {
    fontSize: fontSize.md,
    flex: 1,
    fontWeight: '500',
  },
  explanationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    borderRadius: premiumBorderRadius.lg,
    borderWidth: 1,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  explanationText: {
    flex: 1,
    fontSize: fontSize.sm,
    lineHeight: 20,
    fontWeight: '500',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: premiumBorderRadius.lg,
    gap: spacing.sm,
  },
  nextButtonText: {
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
  resultContent: {
    padding: spacing.lg,
  },
  scoreCard: {
    borderRadius: premiumBorderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    marginBottom: spacing.lg,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  scoreItem: {
    alignItems: 'center',
    flex: 1,
  },
  scoreDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E0E0E0',
    marginHorizontal: spacing.md,
  },
  scoreLabel: {
    fontSize: fontSize.xs,
    marginBottom: spacing.xs,
  },
  scoreValue: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
  },
  performanceCard: {
    borderRadius: premiumBorderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  performanceBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  performanceTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  performanceText: {
    fontSize: fontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
  reviewSection: {
    marginBottom: spacing.xl,
  },
  reviewTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  reviewItem: {
    borderRadius: premiumBorderRadius.lg,
    padding: spacing.md,
    borderWidth: 2,
    marginBottom: spacing.md,
  },
  reviewItemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  reviewIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  reviewQuestionContainer: {
    flex: 1,
  },
  reviewCategory: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    marginBottom: spacing.xs / 2,
  },
  reviewQuestion: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  reviewAnswer: {
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  reviewExplanation: {
    fontSize: fontSize.xs,
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
  actionButtons: {
    gap: spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: premiumBorderRadius.lg,
    gap: spacing.sm,
    borderWidth: 1,
  },
  restartButton: {},
  continueButton: {},
  actionButtonText: {
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  actionButtonTextWhite: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

