import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../src/context/ThemeContext';
import { useGamification } from '../src/context/GamificationContext';
import { spacing, fontSize } from '../src/utils/responsive';
import { premiumShadows, premiumColors, premiumBorderRadius } from '../src/utils/premiumDesign';

const { width } = Dimensions.get('window');

// Free French Quiz Questions
const FREE_QUIZ_QUESTIONS = [
  {
    id: 1,
    question: 'What does "Bonjour" mean in English?',
    type: 'single_choice',
    options: [
      { text: 'Goodbye', isCorrect: false },
      { text: 'Hello / Good morning', isCorrect: true },
      { text: 'Thank you', isCorrect: false },
      { text: 'Please', isCorrect: false },
    ],
    explanation: '"Bonjour" is a common French greeting meaning "Hello" or "Good morning".',
    points: 1,
  },
  {
    id: 2,
    question: 'Which of the following is the correct way to say "I am" in French?',
    type: 'single_choice',
    options: [
      { text: 'Je suis', isCorrect: true },
      { text: 'Je es', isCorrect: false },
      { text: 'Je am', isCorrect: false },
      { text: 'Je être', isCorrect: false },
    ],
    explanation: '"Je suis" means "I am" in French. "Suis" is the first person singular form of "être" (to be).',
    points: 1,
  },
  {
    id: 3,
    question: 'What is the French word for "book"?',
    type: 'single_choice',
    options: [
      { text: 'livre', isCorrect: true },
      { text: 'bibliothèque', isCorrect: false },
      { text: 'cahier', isCorrect: false },
      { text: 'papier', isCorrect: false },
    ],
    explanation: '"Livre" means "book" in French. "Bibliothèque" means "library", "cahier" means "notebook", and "papier" means "paper".',
    points: 1,
  },
  {
    id: 4,
    question: 'How do you say "Thank you" in French?',
    type: 'single_choice',
    options: [
      { text: 'Merci', isCorrect: true },
      { text: 'S\'il vous plaît', isCorrect: false },
      { text: 'Excusez-moi', isCorrect: false },
      { text: 'De rien', isCorrect: false },
    ],
    explanation: '"Merci" means "Thank you" in French. "De rien" means "You\'re welcome".',
    points: 1,
  },
  {
    id: 5,
    question: 'Which article is used with masculine nouns in French?',
    type: 'single_choice',
    options: [
      { text: 'la', isCorrect: false },
      { text: 'le', isCorrect: true },
      { text: 'les', isCorrect: false },
      { text: 'un', isCorrect: false },
    ],
    explanation: '"Le" is the definite article for masculine singular nouns. "La" is for feminine, "les" is plural.',
    points: 1,
  },
  {
    id: 6,
    question: 'What does "Comment allez-vous?" mean?',
    type: 'single_choice',
    options: [
      { text: 'How are you?', isCorrect: true },
      { text: 'What is your name?', isCorrect: false },
      { text: 'Where are you from?', isCorrect: false },
      { text: 'Nice to meet you', isCorrect: false },
    ],
    explanation: '"Comment allez-vous?" is the formal way to ask "How are you?" in French.',
    points: 1,
  },
  {
    id: 7,
    question: 'Which of these is a French number?',
    type: 'single_choice',
    options: [
      { text: 'un, deux, trois', isCorrect: true },
      { text: 'uno, dos, tres', isCorrect: false },
      { text: 'eins, zwei, drei', isCorrect: false },
      { text: 'uno, due, tre', isCorrect: false },
    ],
    explanation: '"Un, deux, trois" means "one, two, three" in French.',
    points: 1,
  },
  {
    id: 8,
    question: 'What is the correct French word for "water"?',
    type: 'single_choice',
    options: [
      { text: 'eau', isCorrect: true },
      { text: 'vin', isCorrect: false },
      { text: 'lait', isCorrect: false },
      { text: 'jus', isCorrect: false },
    ],
    explanation: '"Eau" means "water" in French. "Vin" means "wine", "lait" means "milk", and "jus" means "juice".',
    points: 1,
  },
  {
    id: 9,
    question: 'How do you say "Good night" in French?',
    type: 'single_choice',
    options: [
      { text: 'Bonne nuit', isCorrect: true },
      { text: 'Bonjour', isCorrect: false },
      { text: 'Bonsoir', isCorrect: false },
      { text: 'Au revoir', isCorrect: false },
    ],
    explanation: '"Bonne nuit" means "Good night" (when going to sleep). "Bonsoir" is "Good evening".',
    points: 1,
  },
  {
    id: 10,
    question: 'What is the French word for "friend" (masculine)?',
    type: 'single_choice',
    options: [
      { text: 'ami', isCorrect: true },
      { text: 'amie', isCorrect: false },
      { text: 'copain', isCorrect: false },
      { text: 'famille', isCorrect: false },
    ],
    explanation: '"Ami" is the masculine form of "friend". "Amie" is the feminine form. "Copain" also means friend (informal), and "famille" means "family".',
    points: 1,
  },
];

export default function FreeQuizScreen({ navigation }) {
  const { colors, isDarkMode } = useTheme();
  const { awardXP } = useGamification();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [startTime] = useState(Date.now());

  const currentQuestion = FREE_QUIZ_QUESTIONS[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / FREE_QUIZ_QUESTIONS.length) * 100;
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
    const isCorrect = currentQuestion.options[optionIndex].isCorrect;
    
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
    newAnswers[currentQuestionIndex] = {
      questionId: currentQuestion.id,
      answer: optionIndex,
      isCorrect,
    };
    setAnswers(newAnswers);

    // Show explanation after a brief delay
    setTimeout(() => {
      setShowExplanation(true);
      if (isCorrect) {
        setScore(score + currentQuestion.points);
      }
    }, 500);
  };

  const handleNext = () => {
    if (currentQuestionIndex < FREE_QUIZ_QUESTIONS.length - 1) {
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

      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    const totalScore = answers.reduce((sum, ans) => sum + (ans?.isCorrect ? 1 : 0), 0);
    const percentage = (totalScore / FREE_QUIZ_QUESTIONS.length) * 100;
    const finalScore = totalScore + (answers[FREE_QUIZ_QUESTIONS.length - 1]?.isCorrect ? 1 : 0);
    const finalPercentage = (finalScore / FREE_QUIZ_QUESTIONS.length) * 100;

    setScore(finalScore);
    setQuizCompleted(true);

    // Award XP based on performance
    if (finalPercentage >= 80) {
      awardXP(50, 'Excellent quiz performance!');
    } else if (finalPercentage >= 60) {
      awardXP(30, 'Good quiz performance!');
    } else {
      awardXP(10, 'Quiz completed!');
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setAnswers([]);
    setShowExplanation(false);
    setQuizCompleted(false);
    setScore(0);
    setTimeElapsed(0);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (quizCompleted) {
    const percentage = (score / FREE_QUIZ_QUESTIONS.length) * 100;
    const passed = percentage >= 70;

    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LinearGradient
          colors={
            passed
              ? [premiumColors.accent.emerald, premiumColors.accent.emerald + 'DD']
              : [premiumColors.primary.main, premiumColors.primary.main + 'DD']
          }
          style={styles.resultHeader}
        >
          <View style={styles.resultIconContainer}>
            <Ionicons
              name={passed ? 'trophy' : 'school'}
              size={64}
              color="#FFFFFF"
            />
          </View>
          <Text style={styles.resultTitle}>
            {passed ? 'Excellent Work!' : 'Keep Practicing!'}
          </Text>
          <Text style={styles.resultSubtitle}>
            {passed
              ? 'You passed the quiz!'
              : 'You can do better next time!'}
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
                  {score}/{FREE_QUIZ_QUESTIONS.length}
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
                      ? premiumColors.accent.gold + '20'
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
                    ? premiumColors.accent.gold
                    : premiumColors.accent.rose
                }
              />
            </View>
            <Text style={[styles.performanceTitle, { color: colors.text }]}>
              {percentage >= 90
                ? 'Outstanding!'
                : percentage >= 70
                ? 'Well Done!'
                : 'Good Effort!'}
            </Text>
            <Text style={[styles.performanceText, { color: colors.secondaryText }]}>
              {percentage >= 90
                ? 'You have excellent French knowledge!'
                : percentage >= 70
                ? 'You have a good understanding of French basics.'
                : 'Keep practicing to improve your French skills.'}
            </Text>
          </View>

          {/* Review Answers */}
          <View style={styles.reviewSection}>
            <Text style={[styles.reviewTitle, { color: colors.text }]}>
              Review Your Answers
            </Text>
            {FREE_QUIZ_QUESTIONS.map((question, index) => {
              const userAnswer = answers[index];
              const isCorrect = userAnswer?.isCorrect;
              const selectedOption = question.options[userAnswer?.answer];

              return (
                <View
                  key={question.id}
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
                    <Text style={[styles.reviewQuestion, { color: colors.text }]}>
                      {question.question}
                    </Text>
                  </View>
                  <Text style={[styles.reviewAnswer, { color: colors.secondaryText }]}>
                    Your answer: {selectedOption?.text || 'Not answered'}
                  </Text>
                  {question.explanation && (
                    <Text style={[styles.reviewExplanation, { color: colors.secondaryText }]}>
                      {question.explanation}
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
              <Ionicons name="refresh" size={20} color={premiumColors.primary.main} />
              <Text style={[styles.actionButtonText, { color: premiumColors.primary.main }]}>
                Retake Quiz
              </Text>
            </TouchableOpacity>
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
              Free French Quiz
            </Text>
            <Text style={[styles.headerSubtitle, { color: isDarkMode ? '#FFFFFF' : '#424242' }]}>
              Test your French knowledge
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
          Question {currentQuestionIndex + 1} of {FREE_QUIZ_QUESTIONS.length}
        </Text>
      </View>

      {/* Question Card */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.questionCard,
            { backgroundColor: colors.card, borderColor: colors.border },
            premiumShadows.lg,
            { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
          ]}
        >
          <View style={styles.questionHeader}>
            <View
              style={[
                styles.questionNumber,
                { backgroundColor: premiumColors.primary.main + '20' },
              ]}
            >
              <Text style={[styles.questionNumberText, { color: premiumColors.primary.main }]}>
                {currentQuestionIndex + 1}
              </Text>
            </View>
            <Text style={[styles.questionText, { color: colors.text }]}>
              {currentQuestion.question}
            </Text>
          </View>

          {/* Options */}
          <View style={styles.optionsContainer}>
            {currentQuestion.options.map((option, index) => {
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
                  backgroundColor: premiumColors.primary.main + '20',
                  borderColor: premiumColors.primary.main,
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
                            ? premiumColors.primary.main
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
          {showExplanation && currentQuestion.explanation && (
            <View
              style={[
                styles.explanationCard,
                {
                  backgroundColor:
                    selectedAnswer !== null &&
                    currentQuestion.options[selectedAnswer].isCorrect
                      ? premiumColors.accent.emerald + '10'
                      : premiumColors.error + '10',
                  borderColor:
                    selectedAnswer !== null &&
                    currentQuestion.options[selectedAnswer].isCorrect
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
                  currentQuestion.options[selectedAnswer].isCorrect
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
                      currentQuestion.options[selectedAnswer].isCorrect
                        ? premiumColors.accent.emerald
                        : premiumColors.error,
                  },
                ]}
              >
                {currentQuestion.explanation}
              </Text>
            </View>
          )}

          {/* Next Button */}
          {showExplanation && (
            <TouchableOpacity
              style={[styles.nextButton, { backgroundColor: premiumColors.primary.main }]}
              onPress={handleNext}
            >
              <Text style={styles.nextButtonText}>
                {currentQuestionIndex < FREE_QUIZ_QUESTIONS.length - 1
                  ? 'Next Question'
                  : 'Finish Quiz'}
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
  questionCard: {
    borderRadius: premiumBorderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
  },
  questionHeader: {
    marginBottom: spacing.xl,
  },
  questionNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  questionNumberText: {
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  questionText: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    lineHeight: 32,
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
  reviewQuestion: {
    flex: 1,
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

