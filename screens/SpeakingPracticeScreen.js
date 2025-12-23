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
import { speakText, stopSpeech } from '../src/utils/textToSpeech';

const { width } = Dimensions.get('window');

// French Speaking Practice Exercises
const SPEAKING_EXERCISES = [
  {
    id: 1,
    category: 'Greetings',
    phrase: 'Bonjour, comment allez-vous?',
    translation: 'Hello, how are you?',
    pronunciation: 'bohn-ZHOOR, koh-MAHN tah-LAY voo?',
    tips: 'Focus on the nasal sound in "bonjour" and the smooth flow of "comment allez-vous".',
    difficulty: 'beginner',
  },
  {
    id: 2,
    category: 'Greetings',
    phrase: 'Je m\'appelle Marie.',
    translation: 'My name is Marie.',
    pronunciation: 'zhuh mah-PELL mah-REE',
    tips: 'The "j" in "je" sounds like "zh". Practice the liaison between "m\'appelle".',
    difficulty: 'beginner',
  },
  {
    id: 3,
    category: 'Common Phrases',
    phrase: 'Merci beaucoup!',
    translation: 'Thank you very much!',
    pronunciation: 'mehr-SEE boh-KOO',
    tips: 'Emphasize the "beaucoup" with enthusiasm. The "ou" sound is like "oo" in "food".',
    difficulty: 'beginner',
  },
  {
    id: 4,
    category: 'Common Phrases',
    phrase: 'S\'il vous plaît, pouvez-vous m\'aider?',
    translation: 'Please, can you help me?',
    pronunciation: 'seel voo PLEH, poo-VAY voo may-DAY?',
    tips: 'Break it down: "s\'il vous plaît" first, then "pouvez-vous m\'aider". Practice the rhythm.',
    difficulty: 'intermediate',
  },
  {
    id: 5,
    category: 'Questions',
    phrase: 'Où est la gare?',
    translation: 'Where is the train station?',
    pronunciation: 'oo ay lah GAHR?',
    tips: 'The "où" sounds like "oo". The "est" is silent "t" - just "ay".',
    difficulty: 'beginner',
  },
  {
    id: 6,
    category: 'Questions',
    phrase: 'Combien ça coûte?',
    translation: 'How much does it cost?',
    pronunciation: 'kohm-BYEHN sah KOOT?',
    tips: 'The "en" in "combien" is nasal. "Coûte" rhymes with "boot".',
    difficulty: 'intermediate',
  },
  {
    id: 7,
    category: 'Expressions',
    phrase: 'Je ne comprends pas.',
    translation: 'I don\'t understand.',
    pronunciation: 'zhuh nuh kohm-PRAHN pah',
    tips: 'The "ne...pas" negation wraps around the verb. "Comprends" has a nasal "on" sound.',
    difficulty: 'beginner',
  },
  {
    id: 8,
    category: 'Expressions',
    phrase: 'Parlez-vous anglais?',
    translation: 'Do you speak English?',
    pronunciation: 'pahr-LAY voo ahn-GLAY?',
    tips: 'The "ez" in "parlez" is silent - just "ay". "Anglais" has a nasal "an" sound.',
    difficulty: 'intermediate',
  },
  {
    id: 9,
    category: 'Time',
    phrase: 'Quelle heure est-il?',
    translation: 'What time is it?',
    pronunciation: 'kell UHR ay-TEEL?',
    tips: 'The "quelle" sounds like "kell". "Heure" has a unique "uhr" sound. Practice the liaison.',
    difficulty: 'intermediate',
  },
  {
    id: 10,
    category: 'Directions',
    phrase: 'Excusez-moi, où sont les toilettes?',
    translation: 'Excuse me, where are the restrooms?',
    pronunciation: 'ex-koo-ZAY mwah, oo sohn lay twah-LET?',
    tips: 'Break into parts: "Excusez-moi" then "où sont les toilettes". The "oi" in "moi" is "wah".',
    difficulty: 'intermediate',
  },
  {
    id: 11,
    category: 'Restaurant',
    phrase: 'L\'addition, s\'il vous plaît.',
    translation: 'The check, please.',
    pronunciation: 'lah-dee-SYOHN, seel voo PLEH',
    tips: 'The "addition" has a nasal "on" sound. Keep "s\'il vous plaît" smooth and polite.',
    difficulty: 'intermediate',
  },
  {
    id: 12,
    category: 'Shopping',
    phrase: 'Je voudrais acheter ceci.',
    translation: 'I would like to buy this.',
    pronunciation: 'zhuh voo-DRAY ah-shuh-TAY suh-SEE',
    tips: 'The "voudrais" is conditional - practice the "dray" sound. "Acheter" has a soft "sh" sound.',
    difficulty: 'intermediate',
  },
];

export default function SpeakingPracticeScreen({ navigation }) {
  const { colors, isDarkMode } = useTheme();
  const { awardXP } = useGamification();
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [practiceAttempts, setPracticeAttempts] = useState([]);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [startTime] = useState(Date.now());
  const [showTips, setShowTips] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const currentExercise = SPEAKING_EXERCISES[currentExerciseIndex];
  const progress = ((currentExerciseIndex + 1) / SPEAKING_EXERCISES.length) * 100;
  const pulseAnim = useState(new Animated.Value(1))[0];
  const scaleAnim = useState(new Animated.Value(1))[0];

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => {
      clearInterval(timer);
      stopSpeech();
    };
  }, [startTime]);

  useEffect(() => {
    if (isRecording) {
      // Pulse animation for recording
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording]);

  const handleStartRecording = () => {
    setIsRecording(true);
    setShowTips(false);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    // Simulate practice attempt
    const attempt = {
      exerciseId: currentExercise.id,
      completed: true,
      timestamp: Date.now(),
    };
    setPracticeAttempts([...practiceAttempts, attempt]);
  };

  const handleNext = () => {
    if (currentExerciseIndex < SPEAKING_EXERCISES.length - 1) {
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
      setIsRecording(false);
      setShowTips(false);
    } else {
      finishSession();
    }
  };

  const finishSession = () => {
    setSessionCompleted(true);
    const completionRate = (practiceAttempts.length / SPEAKING_EXERCISES.length) * 100;
    
    // Award XP based on completion
    if (completionRate >= 80) {
      awardXP(45, 'Excellent speaking practice!');
    } else if (completionRate >= 60) {
      awardXP(30, 'Good speaking practice!');
    } else {
      awardXP(15, 'Speaking practice completed!');
    }
  };

  const handleRestart = () => {
    setCurrentExerciseIndex(0);
    setIsRecording(false);
    setPracticeAttempts([]);
    setSessionCompleted(false);
    setTimeElapsed(0);
    setShowTips(false);
    scaleAnim.setValue(1);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (sessionCompleted) {
    const completionRate = (practiceAttempts.length / SPEAKING_EXERCISES.length) * 100;

    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LinearGradient
          colors={[premiumColors.accent.rose, premiumColors.accent.rose + 'DD']}
          style={styles.resultHeader}
        >
          <View style={styles.resultIconContainer}>
            <Ionicons name="mic" size={64} color="#FFFFFF" />
          </View>
          <Text style={styles.resultTitle}>Practice Complete!</Text>
          <Text style={styles.resultSubtitle}>
            Great job practicing your pronunciation
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
                <View style={[styles.statIcon, { backgroundColor: premiumColors.accent.rose + '20' }]}>
                  <Ionicons name="mic" size={24} color={premiumColors.accent.rose} />
                </View>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {practiceAttempts.length}
                </Text>
                <Text style={[styles.statLabel, { color: colors.secondaryText }]}>
                  Practiced
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
                ? 'Pronunciation Pro!'
                : completionRate >= 60
                ? 'Well Done!'
                : 'Keep Practicing!'}
            </Text>
            <Text style={[styles.performanceText, { color: colors.secondaryText }]}>
              {completionRate >= 80
                ? 'You\'ve practiced most phrases! Keep working on your accent.'
                : completionRate >= 60
                ? 'You\'re making good progress with French pronunciation.'
                : 'Continue practicing to improve your speaking skills.'}
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.restartButton, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={handleRestart}
            >
              <Ionicons name="refresh" size={20} color={premiumColors.accent.rose} />
              <Text style={[styles.actionButtonText, { color: premiumColors.accent.rose }]}>
                Practice Again
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.continueButton, { backgroundColor: premiumColors.accent.rose }]}
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
              Speaking Practice
            </Text>
            <Text style={[styles.headerSubtitle, { color: isDarkMode ? '#FFFFFF' : '#424242' }]}>
              Improve your pronunciation
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
                backgroundColor: premiumColors.accent.rose,
              },
            ]}
          />
        </View>
        <Text style={[styles.progressText, { color: colors.secondaryText }]}>
          Exercise {currentExerciseIndex + 1} of {SPEAKING_EXERCISES.length}
        </Text>
      </View>

      {/* Exercise Card */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
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
                { backgroundColor: premiumColors.accent.rose + '20' },
              ]}
            >
              <Ionicons name="mic" size={16} color={premiumColors.accent.rose} />
              <Text style={[styles.categoryText, { color: premiumColors.accent.rose }]}>
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
                      : premiumColors.accent.gold + '20',
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
                        : premiumColors.accent.gold,
                  },
                ]}
              >
                {currentExercise.difficulty}
              </Text>
            </View>
          </View>

          {/* French Phrase */}
          <View style={styles.phraseContainer}>
            <View style={styles.phraseHeader}>
              <Text style={[styles.phrase, { color: colors.text }]}>
                {currentExercise.phrase}
              </Text>
              <TouchableOpacity
                style={[styles.playPhraseButton, { backgroundColor: premiumColors.accent.rose + '20' }]}
                onPress={async () => {
                  if (isPlayingAudio) {
                    stopSpeech();
                    setIsPlayingAudio(false);
                  } else {
                    setIsPlayingAudio(true);
                    try {
                      await speakText(currentExercise.phrase, 'fr-FR');
                    } catch (error) {
                      console.error('Error playing audio:', error);
                    } finally {
                      setIsPlayingAudio(false);
                    }
                  }
                }}
              >
                <Ionicons
                  name={isPlayingAudio ? 'pause' : 'volume-high'}
                  size={20}
                  color={premiumColors.accent.rose}
                />
              </TouchableOpacity>
            </View>
            <Text style={[styles.pronunciation, { color: colors.secondaryText }]}>
              [{currentExercise.pronunciation}]
            </Text>
          </View>

          {/* Translation */}
          <View style={styles.translationContainer}>
            <Ionicons name="language" size={20} color={premiumColors.accent.rose} />
            <Text style={[styles.translation, { color: colors.text }]}>
              {currentExercise.translation}
            </Text>
          </View>

          {/* Recording Button */}
          <View style={styles.recordingContainer}>
            {!isRecording ? (
              <TouchableOpacity
                style={[styles.recordButton, { backgroundColor: premiumColors.accent.rose }]}
                onPress={handleStartRecording}
              >
                <Ionicons name="mic" size={32} color="#FFFFFF" />
                <Text style={styles.recordButtonText}>Start Recording</Text>
              </TouchableOpacity>
            ) : (
              <Animated.View
                style={[
                  styles.recordingButton,
                  { backgroundColor: premiumColors.error },
                  { transform: [{ scale: pulseAnim }] },
                ]}
              >
                <View style={styles.recordingIndicator} />
                <Ionicons name="mic" size={32} color="#FFFFFF" />
                <Text style={styles.recordingButtonText}>Recording...</Text>
                <TouchableOpacity
                  style={styles.stopButton}
                  onPress={handleStopRecording}
                >
                  <Ionicons name="stop" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </Animated.View>
            )}
          </View>

          {/* Tips Toggle */}
          <TouchableOpacity
            style={styles.tipsToggle}
            onPress={() => setShowTips(!showTips)}
          >
            <Ionicons
              name={showTips ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={premiumColors.accent.rose}
            />
            <Text style={[styles.tipsToggleText, { color: premiumColors.accent.rose }]}>
              {showTips ? 'Hide Tips' : 'Show Pronunciation Tips'}
            </Text>
          </TouchableOpacity>

          {/* Tips Card */}
          {showTips && (
            <View
              style={[
                styles.tipsCard,
                {
                  backgroundColor: premiumColors.accent.rose + '10',
                  borderColor: premiumColors.accent.rose,
                },
              ]}
            >
              <View style={styles.tipsHeader}>
                <Ionicons name="bulb" size={20} color={premiumColors.accent.rose} />
                <Text style={[styles.tipsTitle, { color: premiumColors.accent.rose }]}>
                  Pronunciation Tips
                </Text>
              </View>
              <Text style={[styles.tipsText, { color: colors.text }]}>
                {currentExercise.tips}
              </Text>
            </View>
          )}

          {/* Next Button */}
          {practiceAttempts.some(a => a.exerciseId === currentExercise.id) && (
            <TouchableOpacity
              style={[styles.nextButton, { backgroundColor: premiumColors.accent.rose }]}
              onPress={handleNext}
            >
              <Text style={styles.nextButtonText}>
                {currentExerciseIndex < SPEAKING_EXERCISES.length - 1
                  ? 'Next Exercise'
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
  phraseContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingVertical: spacing.lg,
  },
  phraseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
    width: '100%',
  },
  phrase: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    textAlign: 'center',
    flex: 1,
    lineHeight: 36,
  },
  playPhraseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pronunciation: {
    fontSize: fontSize.md,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  translationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: premiumBorderRadius.lg,
    backgroundColor: 'rgba(156, 39, 176, 0.1)',
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  translation: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    textAlign: 'center',
  },
  recordingContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  recordButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  recordButtonText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  recordingButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    position: 'relative',
  },
  recordingIndicator: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
    borderColor: premiumColors.error,
    opacity: 0.3,
  },
  recordingButtonText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  stopButton: {
    position: 'absolute',
    bottom: -40,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: premiumColors.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  tipsToggleText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
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

