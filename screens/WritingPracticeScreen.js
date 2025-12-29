import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../src/context/ThemeContext';
import { useGamification } from '../src/context/GamificationContext';
import { getThemeColors, themeShadows, themeRadius } from '../src/utils/organicTheme';

const { width, height } = Dimensions.get('window');

const BackgroundBlur = ({ style, color, size = 300 }) => (
  <View style={[style, {
    position: 'absolute',
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: color,
    opacity: 0.05,
    transform: [{ scale: 1.5 }],
  }]} />
);

const WRITING_EXERCISES = [
  {
    id: 1,
    category: 'Greetings',
    prompt: 'Write a greeting introducing yourself in French.',
    example: 'Bonjour, je m\'appelle [your name]. Comment allez-vous?',
    translation: 'Hello, my name is [your name]. How are you?',
    tips: 'Use "Bonjour" for hello, "Je m\'appelle" for "my name is", and "Comment allez-vous?" for "how are you?"',
    difficulty: 'beginner',
    minWords: 10,
  },
  {
    id: 2,
    category: 'Daily Routine',
    prompt: 'Describe your daily routine in French. What do you do in the morning?',
    example: 'Le matin, je me lève à sept heures. Je prends le petit déjeuner et je vais au travail.',
    translation: 'In the morning, I wake up at seven o\'clock. I have breakfast and go to work.',
    tips: 'Use "Le matin" for "in the morning", reflexive verbs like "je me lève" (I wake up), and time expressions.',
    difficulty: 'beginner',
    minWords: 20,
  },
  {
    id: 3,
    category: 'Family',
    prompt: 'Write about your family in French. Describe who they are.',
    example: 'J\'ai une grande famille. Ma mère s\'appelle Marie et mon père s\'appelle Pierre. J\'ai deux sœurs.',
    translation: 'I have a big family. My mother\'s name is Marie and my father\'s name is Pierre. I have two sisters.',
    tips: 'Use "J\'ai" for "I have", "Ma mère/Mon père" for "my mother/father", and "s\'appelle" for "is called".',
    difficulty: 'beginner',
    minWords: 25,
  },
  {
    id: 4,
    category: 'Food & Dining',
    prompt: 'Write about your favorite food and describe a meal in French.',
    example: 'Mon plat préféré est le poulet. J\'aime manger au restaurant avec mes amis.',
    translation: 'My favorite dish is chicken. I like to eat at restaurants with my friends.',
    tips: 'Use "Mon plat préféré" for "my favorite dish", "J\'aime" for "I like", and food vocabulary.',
    difficulty: 'intermediate',
    minWords: 30,
  },
  {
    id: 5,
    category: 'Travel',
    prompt: 'Write about a place you would like to visit in French.',
    example: 'Je voudrais visiter Paris. C\'est une belle ville avec beaucoup de monuments historiques.',
    translation: 'I would like to visit Paris. It is a beautiful city with many historical monuments.',
    tips: 'Use "Je voudrais" for "I would like", "visiter" for "to visit", and descriptive adjectives.',
    difficulty: 'intermediate',
    minWords: 30,
  },
  {
    id: 6,
    category: 'Hobbies',
    prompt: 'Describe your hobbies and what you like to do in your free time in French.',
    example: 'Pendant mon temps libre, j\'aime lire des livres et écouter de la musique. Je joue aussi au football.',
    translation: 'During my free time, I like to read books and listen to music. I also play football.',
    tips: 'Use "Pendant mon temps libre" for "during my free time", "J\'aime" + infinitive, and activity verbs.',
    difficulty: 'intermediate',
    minWords: 35,
  },
  {
    id: 7,
    category: 'Weather',
    prompt: 'Describe the weather today and what you like to do in different weather conditions.',
    example: 'Aujourd\'hui, il fait beau et ensoleillé. J\'aime sortir quand il fait beau temps.',
    translation: 'Today, it is nice and sunny. I like to go out when the weather is nice.',
    tips: 'Use "Il fait" for weather expressions, "beau" for nice weather, and weather-related vocabulary.',
    difficulty: 'intermediate',
    minWords: 30,
  },
  {
    id: 8,
    category: 'Shopping',
    prompt: 'Write about a shopping experience or what you need to buy in French.',
    example: 'Je dois acheter des vêtements. Je vais au magasin ce weekend pour chercher une nouvelle chemise.',
    translation: 'I need to buy clothes. I am going to the store this weekend to look for a new shirt.',
    tips: 'Use "Je dois" for "I must/need to", "acheter" for "to buy", and shopping vocabulary.',
    difficulty: 'intermediate',
    minWords: 35,
  },
  {
    id: 9,
    category: 'Future Plans',
    prompt: 'Write about your future plans or what you will do next week in French.',
    example: 'La semaine prochaine, je vais étudier le français et visiter un musée avec mes amis.',
    translation: 'Next week, I am going to study French and visit a museum with my friends.',
    tips: 'Use "La semaine prochaine" for "next week", "Je vais" + infinitive for future plans.',
    difficulty: 'intermediate',
    minWords: 30,
  },
  {
    id: 10,
    category: 'Opinions',
    prompt: 'Write your opinion about learning French and why it is important.',
    example: 'Je pense que apprendre le français est très important. C\'est une belle langue et utile pour voyager.',
    translation: 'I think that learning French is very important. It is a beautiful language and useful for traveling.',
    tips: 'Use "Je pense que" for "I think that", express opinions with "important", "utile", "belle".',
    difficulty: 'advanced',
    minWords: 40,
  },
];

export default function WritingPracticeScreen({ navigation }) {
  const { isDarkMode } = useTheme();
  const theme = getThemeColors(isDarkMode);
  const { awardXP } = useGamification();
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [userWriting, setUserWriting] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [submissions, setSubmissions] = useState([]);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [startTime] = useState(Date.now());
  const [showExample, setShowExample] = useState(false);

  const currentExercise = WRITING_EXERCISES[currentExerciseIndex];
  const progress = ((currentExerciseIndex + 1) / WRITING_EXERCISES.length) * 100;
  const scaleAnim = useState(new Animated.Value(1))[0];

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  useEffect(() => {

    const words = userWriting.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [userWriting]);

  const handleSubmit = () => {
    if (wordCount < currentExercise.minWords) {
      return;
    }

    const submission = {
      exerciseId: currentExercise.id,
      text: userWriting,
      wordCount: wordCount,
      timestamp: Date.now(),
    };
    setSubmissions([...submissions, submission]);
  };

  const handleNext = () => {
    if (currentExerciseIndex < WRITING_EXERCISES.length - 1) {
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

      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setUserWriting('');
      setWordCount(0);
      setShowExample(false);
    } else {
      finishSession();
    }
  };

  const finishSession = () => {
    setSessionCompleted(true);
    const completionRate = (submissions.length / WRITING_EXERCISES.length) * 100;

    if (completionRate >= 80) {
      awardXP(50, 'Excellent writing practice!');
    } else if (completionRate >= 60) {
      awardXP(35, 'Good writing practice!');
    } else {
      awardXP(15, 'Writing practice completed!');
    }
  };

  const handleRestart = () => {
    setCurrentExerciseIndex(0);
    setUserWriting('');
    setWordCount(0);
    setSubmissions([]);
    setSessionCompleted(false);
    setTimeElapsed(0);
    setShowExample(false);
    scaleAnim.setValue(1);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isSubmitted = submissions.some(s => s.exerciseId === currentExercise.id);
  const meetsWordCount = wordCount >= currentExercise.minWords;

  if (sessionCompleted) {
    const completionRate = (submissions.length / WRITING_EXERCISES.length) * 100;

    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <BackgroundBlur style={{ top: -100, left: -50 }} color={theme.secondary} size={400} />

        <LinearGradient
          colors={[theme.primary, theme.primaryLight]}
          style={styles.resultHeader}
        >
          <View style={styles.resultIconContainer}>
            <Ionicons name="create" size={64} color="#FFFFFF" />
          </View>
          <Text style={styles.resultTitle}>Writing Complete!</Text>
          <Text style={styles.resultSubtitle}>
            Great job practicing your French writing
          </Text>
        </LinearGradient>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.resultContent}
          showsVerticalScrollIndicator={false}
        >

          <View
            style={[
              styles.statsCard,
              { backgroundColor: theme.surface, borderColor: theme.border },
              themeShadows.lg,
            ]}
          >
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: theme.secondary + '20' }]}>
                  <Ionicons name="create" size={24} color={theme.secondary} />
                </View>
                <Text style={[styles.statValue, { color: theme.text }]}>
                  {submissions.length}
                </Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                  Completed
                </Text>
              </View>
              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: theme.success + '20' }]}>
                  <Ionicons name="checkmark-circle" size={24} color={theme.success} />
                </View>
                <Text style={[styles.statValue, { color: theme.text }]}>
                  {completionRate.toFixed(0)}%
                </Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                  Completion
                </Text>
              </View>
              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: theme.info + '20' }]}>
                  <Ionicons name="time" size={24} color={theme.info} />
                </View>
                <Text style={[styles.statValue, { color: theme.text }]}>
                  {formatTime(timeElapsed)}
                </Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                  Time
                </Text>
              </View>
            </View>
          </View>

          <View
            style={[
              styles.performanceCard,
              { backgroundColor: theme.surface, borderColor: theme.border },
              themeShadows.md,
            ]}
          >
            <View
              style={[
                styles.performanceBadge,
                {
                  backgroundColor:
                    completionRate >= 80
                      ? theme.success + '20'
                      : completionRate >= 60
                        ? theme.secondary + '20'
                        : theme.error + '20',
                },
              ]}
            >
              <Ionicons
                name={
                  completionRate >= 80
                    ? 'star'
                    : completionRate >= 60
                      ? 'checkmark-circle'
                      : 'alert-circle'
                }
                size={32}
                color={
                  completionRate >= 80
                    ? theme.success
                    : completionRate >= 60
                      ? theme.secondary
                      : theme.error
                }
              />
            </View>
            <Text style={[styles.performanceTitle, { color: theme.text }]}>
              {completionRate >= 80
                ? 'Writing Expert!'
                : completionRate >= 60
                  ? 'Well Done!'
                  : 'Keep Practicing!'}
            </Text>
            <Text style={[styles.performanceText, { color: theme.textSecondary }]}>
              {completionRate >= 80
                ? 'You\'ve completed most writing exercises! Keep practicing to improve.'
                : completionRate >= 60
                  ? 'You\'re making good progress with French writing.'
                  : 'Continue practicing to improve your writing skills.'}
            </Text>
          </View>

          <View style={styles.reviewSection}>
            <Text style={[styles.reviewTitle, { color: theme.text }]}>
              Your Writing Exercises
            </Text>
            {WRITING_EXERCISES.map((exercise, index) => {
              const submission = submissions.find(s => s.exerciseId === exercise.id);

              return (
                <View
                  key={exercise.id}
                  style={[
                    styles.reviewItem,
                    {
                      backgroundColor: theme.surface,
                      borderColor: submission
                        ? theme.success
                        : theme.border,
                    },
                    themeShadows.sm,
                  ]}
                >
                  <View style={styles.reviewItemHeader}>
                    <View
                      style={[
                        styles.reviewIcon,
                        {
                          backgroundColor: submission
                            ? theme.success + '20'
                            : theme.border + '20',
                        },
                      ]}
                    >
                      <Ionicons
                        name={submission ? 'checkmark-circle' : 'ellipse-outline'}
                        size={24}
                        color={submission ? theme.success : theme.textSecondary}
                      />
                    </View>
                    <View style={styles.reviewQuestionContainer}>
                      <Text style={[styles.reviewCategory, { color: theme.secondary }]}>
                        {exercise.category}
                      </Text>
                      <Text style={[styles.reviewQuestion, { color: theme.text }]}>
                        {exercise.prompt}
                      </Text>
                    </View>
                  </View>
                  {submission && (
                    <View style={[styles.submissionContainer, { borderTopColor: theme.border }]}>
                      <Text style={[styles.submissionLabel, { color: theme.textSecondary }]}>
                        Your writing ({submission.wordCount} words):
                      </Text>
                      <Text style={[styles.submissionText, { color: theme.text }]}>
                        {submission.text}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.restartButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={handleRestart}
            >
              <Ionicons name="refresh" size={20} color={theme.secondary} />
              <Text style={[styles.actionButtonText, { color: theme.secondary }]}>
                Practice Again
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.continueButton, { backgroundColor: theme.primary }]}
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
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <BackgroundBlur style={{ top: -50, right: -100 }} color={theme.primary} size={300} />

      <LinearGradient
        colors={[theme.primary, theme.primaryDark]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>
              Writing Practice
            </Text>
            <Text style={styles.headerSubtitle}>
              Improve your French expression
            </Text>
          </View>
          <View style={styles.timerContainer}>
            <Ionicons name="time-outline" size={18} color="#FFFFFF" />
            <Text style={styles.timerText}>
              {formatTime(timeElapsed)}
            </Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: `${progress}%`,
                backgroundColor: theme.secondary,
              },
            ]}
          />
        </View>
        <Text style={[styles.progressText, { color: theme.textSecondary }]}>
          Exercise {currentExerciseIndex + 1} of {WRITING_EXERCISES.length}
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View
          style={[
            styles.exerciseCard,
            { backgroundColor: theme.surface, borderColor: theme.border },
            themeShadows.lg,
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          <View style={styles.exerciseHeader}>
            <View
              style={[
                styles.categoryBadge,
                { backgroundColor: theme.secondary + '15' },
              ]}
            >
              <Ionicons name="create" size={16} color={theme.secondary} />
              <Text style={[styles.categoryText, { color: theme.secondary }]}>
                {currentExercise.category}
              </Text>
            </View>
            <View
              style={[
                styles.difficultyBadge,
                {
                  backgroundColor:
                    currentExercise.difficulty === 'beginner'
                      ? theme.success + '15'
                      : currentExercise.difficulty === 'intermediate'
                        ? theme.secondary + '15'
                        : theme.error + '15',
                },
              ]}
            >
              <Text
                style={[
                  styles.difficultyText,
                  {
                    color:
                      currentExercise.difficulty === 'beginner'
                        ? theme.success
                        : currentExercise.difficulty === 'intermediate'
                          ? theme.secondary
                          : theme.error,
                  },
                ]}
              >
                {currentExercise.difficulty}
              </Text>
            </View>
          </View>

          <View style={[styles.promptContainer, { backgroundColor: theme.primary + '08' }]}>
            <Text style={[styles.prompt, { color: theme.text }]}>
              {currentExercise.prompt}
            </Text>
          </View>

          <View style={[styles.requirementContainer, { backgroundColor: theme.secondary + '10' }]}>
            <Ionicons name="information-circle" size={16} color={theme.secondary} />
            <Text style={[styles.requirementText, { color: theme.textSecondary }]}>
              Minimum {currentExercise.minWords} words required
            </Text>
          </View>

          <View style={styles.writingContainer}>
            <TextInput
              style={[
                styles.writingInput,
                {
                  backgroundColor: theme.background,
                  color: theme.text,
                  borderColor: meetsWordCount && wordCount > 0
                    ? theme.success
                    : theme.border,
                },
              ]}
              placeholder="Write your response in French here..."
              placeholderTextColor={theme.textMuted}
              value={userWriting}
              onChangeText={setUserWriting}
              multiline
              numberOfLines={8}
              textAlignVertical="top"
              editable={!isSubmitted}
            />
            <View style={styles.wordCountContainer}>
              <Text
                style={[
                  styles.wordCount,
                  {
                    color: meetsWordCount
                      ? theme.success
                      : wordCount > 0
                        ? theme.secondary
                        : theme.textMuted,
                  },
                ]}
              >
                {wordCount} / {currentExercise.minWords} words
              </Text>
              {meetsWordCount && (
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color={theme.success}
                />
              )}
            </View>
          </View>

          <TouchableOpacity
            style={styles.exampleToggle}
            onPress={() => setShowExample(!showExample)}
          >
            <Ionicons
              name={showExample ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={theme.secondary}
            />
            <Text style={[styles.exampleToggleText, { color: theme.secondary }]}>
              {showExample ? 'Hide Example' : 'Show Example'}
            </Text>
          </TouchableOpacity>

          {showExample && (
            <View
              style={[
                styles.exampleCard,
                {
                  backgroundColor: theme.secondary + '05',
                  borderColor: theme.secondary + '40',
                },
              ]}
            >
              <View style={styles.exampleHeader}>
                <Ionicons name="bulb" size={20} color={theme.secondary} />
                <Text style={[styles.exampleTitle, { color: theme.secondary }]}>
                  Example Response
                </Text>
              </View>
              <Text style={[styles.exampleText, { color: theme.text }]}>
                {currentExercise.example}
              </Text>
              <Text style={[styles.exampleTranslation, { color: theme.textSecondary }]}>
                Translation: {currentExercise.translation}
              </Text>
            </View>
          )}

          <View
            style={[
              styles.tipsCard,
              {
                backgroundColor: theme.info + '10',
                borderColor: theme.info + '40',
              },
            ]}
          >
            <View style={styles.tipsHeader}>
              <Ionicons name="bulb" size={20} color={theme.info} />
              <Text style={[styles.tipsTitle, { color: theme.info }]}>
                Writing Tips
              </Text>
            </View>
            <Text style={[styles.tipsText, { color: theme.text }]}>
              {currentExercise.tips}
            </Text>
          </View>

          <View style={styles.actionButtons}>
            {!isSubmitted ? (
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  {
                    backgroundColor: meetsWordCount
                      ? theme.primary
                      : theme.border,
                    opacity: meetsWordCount ? 1 : 0.7,
                  },
                ]}
                onPress={handleSubmit}
                disabled={!meetsWordCount}
              >
                <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                <Text style={styles.submitButtonText}>Submit Writing</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.submittedContainer}>
                <View style={styles.submittedBadge}>
                  <Ionicons name="checkmark-circle" size={20} color={theme.success} />
                  <Text style={[styles.submittedText, { color: theme.success }]}>
                    Writing Submitted!
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.nextButton, { backgroundColor: theme.secondary }]}
                  onPress={handleNext}
                >
                  <Text style={styles.nextButtonText}>
                    {currentExerciseIndex < WRITING_EXERCISES.length - 1
                      ? 'Next Exercise'
                      : 'Finish Practice'}
                  </Text>
                  <Ionicons name="arrow-forward" size={20} color={theme.textOnSecondary} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: themeRadius.xxl,
    borderBottomRightRadius: themeRadius.xxl,
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
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  timerText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  progressContainer: {
    paddingHorizontal: 22,
    paddingVertical: 16,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 22,
    paddingBottom: 40,
  },
  exerciseCard: {
    borderRadius: themeRadius.xl,
    padding: 22,
    borderWidth: 1,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  promptContainer: {
    marginBottom: 20,
    padding: 16,
    borderRadius: 16,
  },
  prompt: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 26,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  requirementContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    padding: 10,
    borderRadius: 10,
  },
  requirementText: {
    fontSize: 13,
    fontWeight: '600',
  },
  writingContainer: {
    marginBottom: 20,
  },
  writingInput: {
    minHeight: 200,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 8,
    textAlignVertical: 'top',
  },
  wordCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
  },
  wordCount: {
    fontSize: 12,
    fontWeight: '700',
  },
  exampleToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 6,
    marginBottom: 12,
  },
  exampleToggleText: {
    fontSize: 13,
    fontWeight: '700',
  },
  exampleCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  exampleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  exampleTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  exampleText: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  exampleTranslation: {
    fontSize: 13,
    fontStyle: 'italic',
    opacity: 0.8,
  },
  tipsCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  tipsText: {
    fontSize: 13,
    lineHeight: 20,
  },
  actionButtons: {
    gap: 12,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  submittedContainer: {
    gap: 12,
  },
  submittedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  submittedText: {
    fontSize: 15,
    fontWeight: '800',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '800',
  },

  resultHeader: {
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 22,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  resultIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  resultSubtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  resultContent: {
    padding: 22,
  },
  statsCard: {
    borderRadius: themeRadius.xl,
    padding: 20,
    borderWidth: 1,
    marginBottom: 20,
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
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  performanceCard: {
    borderRadius: themeRadius.xl,
    padding: 24,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 28,
  },
  performanceBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  performanceTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 6,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  performanceText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    opacity: 0.8,
  },
  reviewSection: {
    marginBottom: 24,
  },
  reviewTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 16,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  reviewItem: {
    borderRadius: themeRadius.lg,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  reviewItemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  reviewIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  reviewQuestionContainer: {
    flex: 1,
  },
  reviewCategory: {
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  reviewQuestion: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 22,
  },
  submissionContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  submissionLabel: {
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  submissionText: {
    fontSize: 14,
    lineHeight: 22,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 10,
    borderWidth: 1.5,
  },
  restartButton: {
    marginBottom: 8,
  },
  continueButton: {
    borderWidth: 0,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '800',
  },
  actionButtonTextWhite: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

