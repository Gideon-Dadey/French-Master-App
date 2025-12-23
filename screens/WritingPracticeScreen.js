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
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../src/context/ThemeContext';
import { useGamification } from '../src/context/GamificationContext';
import { spacing, fontSize } from '../src/utils/responsive';
import { premiumShadows, premiumColors, premiumBorderRadius } from '../src/utils/premiumDesign';

const { width } = Dimensions.get('window');

// French Writing Practice Exercises
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
  const { colors, isDarkMode } = useTheme();
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
    // Count words in user writing
    const words = userWriting.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [userWriting]);

  const handleSubmit = () => {
    if (wordCount < currentExercise.minWords) {
      return; // Don't submit if minimum word count not met
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
    
    // Award XP based on completion
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
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LinearGradient
          colors={[premiumColors.accent.gold, premiumColors.accent.gold + 'DD']}
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
                <View style={[styles.statIcon, { backgroundColor: premiumColors.accent.gold + '20' }]}>
                  <Ionicons name="create" size={24} color={premiumColors.accent.gold} />
                </View>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {submissions.length}
                </Text>
                <Text style={[styles.statLabel, { color: colors.secondaryText }]}>
                  Completed
                </Text>
              </View>
              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: premiumColors.accent.emerald + '20' }]}>
                  <Ionicons name="checkmark-circle" size={24} color={premiumColors.accent.emerald} />
                </View>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {completionRate.toFixed(0)}%
                </Text>
                <Text style={[styles.statLabel, { color: colors.secondaryText }]}>
                  Completion
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

          {/* Performance Card */}
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
                    completionRate >= 80
                      ? premiumColors.accent.emerald + '20'
                      : completionRate >= 60
                      ? premiumColors.accent.gold + '20'
                      : premiumColors.accent.rose + '20',
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
                    ? premiumColors.accent.emerald
                    : completionRate >= 60
                    ? premiumColors.accent.gold
                    : premiumColors.accent.rose
                }
              />
            </View>
            <Text style={[styles.performanceTitle, { color: colors.text }]}>
              {completionRate >= 80
                ? 'Writing Expert!'
                : completionRate >= 60
                ? 'Well Done!'
                : 'Keep Practicing!'}
            </Text>
            <Text style={[styles.performanceText, { color: colors.secondaryText }]}>
              {completionRate >= 80
                ? 'You\'ve completed most writing exercises! Keep practicing to improve.'
                : completionRate >= 60
                ? 'You\'re making good progress with French writing.'
                : 'Continue practicing to improve your writing skills.'}
            </Text>
          </View>

          {/* Review Submissions */}
          <View style={styles.reviewSection}>
            <Text style={[styles.reviewTitle, { color: colors.text }]}>
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
                      backgroundColor: colors.card,
                      borderColor: submission
                        ? premiumColors.accent.emerald
                        : colors.border,
                    },
                    premiumShadows.sm,
                  ]}
                >
                  <View style={styles.reviewItemHeader}>
                    <View
                      style={[
                        styles.reviewIcon,
                        {
                          backgroundColor: submission
                            ? premiumColors.accent.emerald + '20'
                            : colors.border + '20',
                        },
                      ]}
                    >
                      <Ionicons
                        name={submission ? 'checkmark-circle' : 'ellipse-outline'}
                        size={24}
                        color={submission ? premiumColors.accent.emerald : colors.secondaryText}
                      />
                    </View>
                    <View style={styles.reviewQuestionContainer}>
                      <Text style={[styles.reviewCategory, { color: premiumColors.accent.gold }]}>
                        {exercise.category}
                      </Text>
                      <Text style={[styles.reviewQuestion, { color: colors.text }]}>
                        {exercise.prompt}
                      </Text>
                    </View>
                  </View>
                  {submission && (
                    <View style={styles.submissionContainer}>
                      <Text style={[styles.submissionLabel, { color: colors.secondaryText }]}>
                        Your writing ({submission.wordCount} words):
                      </Text>
                      <Text style={[styles.submissionText, { color: colors.text }]}>
                        {submission.text}
                      </Text>
                    </View>
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
              <Ionicons name="refresh" size={20} color={premiumColors.accent.gold} />
              <Text style={[styles.actionButtonText, { color: premiumColors.accent.gold }]}>
                Practice Again
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.continueButton, { backgroundColor: premiumColors.accent.gold }]}
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
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
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
              Writing Practice
            </Text>
            <Text style={[styles.headerSubtitle, { color: isDarkMode ? '#FFFFFF' : '#424242' }]}>
              Improve your French writing
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
                backgroundColor: premiumColors.accent.gold,
              },
            ]}
          />
        </View>
        <Text style={[styles.progressText, { color: colors.secondaryText }]}>
          Exercise {currentExerciseIndex + 1} of {WRITING_EXERCISES.length}
        </Text>
      </View>

      {/* Exercise Card */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View
          style={[
            styles.exerciseCard,
            { backgroundColor: colors.card, borderColor: colors.border },
            premiumShadows.lg,
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          <View style={styles.exerciseHeader}>
            <View
              style={[
                styles.categoryBadge,
                { backgroundColor: premiumColors.accent.gold + '20' },
              ]}
            >
              <Ionicons name="create" size={16} color={premiumColors.accent.gold} />
              <Text style={[styles.categoryText, { color: premiumColors.accent.gold }]}>
                {currentExercise.category}
              </Text>
            </View>
            <View
              style={[
                styles.difficultyBadge,
                {
                  backgroundColor:
                    currentExercise.difficulty === 'beginner'
                      ? premiumColors.accent.emerald + '20'
                      : currentExercise.difficulty === 'intermediate'
                      ? premiumColors.accent.gold + '20'
                      : premiumColors.accent.rose + '20',
                },
              ]}
            >
              <Text
                style={[
                  styles.difficultyText,
                  {
                    color:
                      currentExercise.difficulty === 'beginner'
                        ? premiumColors.accent.emerald
                        : currentExercise.difficulty === 'intermediate'
                        ? premiumColors.accent.gold
                        : premiumColors.accent.rose,
                  },
                ]}
              >
                {currentExercise.difficulty}
              </Text>
            </View>
          </View>

          {/* Prompt */}
          <View style={styles.promptContainer}>
            <Text style={[styles.prompt, { color: colors.text }]}>
              {currentExercise.prompt}
            </Text>
          </View>

          {/* Word Count Requirement */}
          <View style={styles.requirementContainer}>
            <Ionicons name="information-circle" size={16} color={premiumColors.accent.gold} />
            <Text style={[styles.requirementText, { color: colors.secondaryText }]}>
              Minimum {currentExercise.minWords} words required
            </Text>
          </View>

          {/* Writing Area */}
          <View style={styles.writingContainer}>
            <TextInput
              style={[
                styles.writingInput,
                {
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderColor: meetsWordCount && wordCount > 0
                    ? premiumColors.accent.emerald
                    : colors.border,
                },
              ]}
              placeholder="Write your response in French here..."
              placeholderTextColor={colors.secondaryText}
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
                      ? premiumColors.accent.emerald
                      : wordCount > 0
                      ? premiumColors.accent.gold
                      : colors.secondaryText,
                  },
                ]}
              >
                {wordCount} / {currentExercise.minWords} words
              </Text>
              {meetsWordCount && (
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color={premiumColors.accent.emerald}
                />
              )}
            </View>
          </View>

          {/* Example Toggle */}
          <TouchableOpacity
            style={styles.exampleToggle}
            onPress={() => setShowExample(!showExample)}
          >
            <Ionicons
              name={showExample ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={premiumColors.accent.gold}
            />
            <Text style={[styles.exampleToggleText, { color: premiumColors.accent.gold }]}>
              {showExample ? 'Hide Example' : 'Show Example'}
            </Text>
          </TouchableOpacity>

          {/* Example Card */}
          {showExample && (
            <View
              style={[
                styles.exampleCard,
                {
                  backgroundColor: premiumColors.accent.gold + '10',
                  borderColor: premiumColors.accent.gold,
                },
              ]}
            >
              <View style={styles.exampleHeader}>
                <Ionicons name="bulb" size={20} color={premiumColors.accent.gold} />
                <Text style={[styles.exampleTitle, { color: premiumColors.accent.gold }]}>
                  Example Response
                </Text>
              </View>
              <Text style={[styles.exampleText, { color: colors.text }]}>
                {currentExercise.example}
              </Text>
              <Text style={[styles.exampleTranslation, { color: colors.secondaryText }]}>
                Translation: {currentExercise.translation}
              </Text>
            </View>
          )}

          {/* Tips Card */}
          <View
            style={[
              styles.tipsCard,
              {
                backgroundColor: premiumColors.info + '10',
                borderColor: premiumColors.info,
              },
            ]}
          >
            <View style={styles.tipsHeader}>
              <Ionicons name="bulb" size={20} color={premiumColors.info} />
              <Text style={[styles.tipsTitle, { color: premiumColors.info }]}>
                Writing Tips
              </Text>
            </View>
            <Text style={[styles.tipsText, { color: colors.text }]}>
              {currentExercise.tips}
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {!isSubmitted ? (
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  {
                    backgroundColor: meetsWordCount
                      ? premiumColors.accent.gold
                      : colors.border,
                    opacity: meetsWordCount ? 1 : 0.5,
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
                  <Ionicons name="checkmark-circle" size={20} color={premiumColors.accent.emerald} />
                  <Text style={[styles.submittedText, { color: premiumColors.accent.emerald }]}>
                    Writing Submitted!
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.nextButton, { backgroundColor: premiumColors.accent.gold }]}
                  onPress={handleNext}
                >
                  <Text style={styles.nextButtonText}>
                    {currentExerciseIndex < WRITING_EXERCISES.length - 1
                      ? 'Next Exercise'
                      : 'Finish Practice'}
                  </Text>
                  <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
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
  exerciseCard: {
    borderRadius: premiumBorderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
  },
  exerciseHeader: {
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
  difficultyBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: premiumBorderRadius.base,
  },
  difficultyText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  promptContainer: {
    marginBottom: spacing.lg,
    padding: spacing.md,
    borderRadius: premiumBorderRadius.lg,
    backgroundColor: 'rgba(156, 39, 176, 0.1)',
  },
  prompt: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    lineHeight: 28,
  },
  requirementContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
    padding: spacing.sm,
    borderRadius: premiumBorderRadius.base,
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
  },
  requirementText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  writingContainer: {
    marginBottom: spacing.lg,
  },
  writingInput: {
    minHeight: 200,
    padding: spacing.md,
    borderRadius: premiumBorderRadius.lg,
    borderWidth: 2,
    fontSize: fontSize.md,
    lineHeight: 24,
    marginBottom: spacing.sm,
  },
  wordCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.xs,
  },
  wordCount: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  exampleToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  exampleToggleText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  exampleCard: {
    padding: spacing.md,
    borderRadius: premiumBorderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.lg,
  },
  exampleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  exampleTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  exampleText: {
    fontSize: fontSize.md,
    lineHeight: 24,
    marginBottom: spacing.sm,
    fontStyle: 'italic',
  },
  exampleTranslation: {
    fontSize: fontSize.sm,
    fontStyle: 'italic',
  },
  tipsCard: {
    padding: spacing.md,
    borderRadius: premiumBorderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.lg,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  tipsTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  tipsText: {
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  actionButtons: {
    gap: spacing.md,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: premiumBorderRadius.lg,
    gap: spacing.sm,
  },
  submitButtonText: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  submittedContainer: {
    gap: spacing.md,
  },
  submittedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  submittedText: {
    fontSize: fontSize.md,
    fontWeight: '700',
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
  submissionContainer: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  submissionLabel: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  submissionText: {
    fontSize: fontSize.sm,
    lineHeight: 20,
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

