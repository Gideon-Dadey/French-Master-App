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

// French Listening Practice Exercises
const LISTENING_EXERCISES = [
  {
    id: 1,
    category: 'Greetings',
    audioText: 'Bonjour, je m\'appelle Sophie. Comment vous appelez-vous?',
    translation: 'Hello, my name is Sophie. What is your name?',
    question: 'What is the person\'s name?',
    options: [
      { text: 'Sophie', isCorrect: true },
      { text: 'Marie', isCorrect: false },
      { text: 'Julie', isCorrect: false },
      { text: 'Anne', isCorrect: false },
    ],
    explanation: 'The speaker says "je m\'appelle Sophie" which means "my name is Sophie".',
    difficulty: 'beginner',
  },
  {
    id: 2,
    category: 'Numbers',
    audioText: 'J\'ai trois pommes et deux bananes. Combien de fruits ai-je?',
    translation: 'I have three apples and two bananas. How many fruits do I have?',
    question: 'How many fruits does the person have?',
    options: [
      { text: 'Three', isCorrect: false },
      { text: 'Two', isCorrect: false },
      { text: 'Five', isCorrect: true },
      { text: 'Four', isCorrect: false },
    ],
    explanation: 'The speaker has "trois pommes" (3 apples) and "deux bananes" (2 bananas), which equals 5 fruits total.',
    difficulty: 'beginner',
  },
  {
    id: 3,
    category: 'Time',
    audioText: 'Il est deux heures et demie. Le train arrive à trois heures.',
    translation: 'It is two thirty. The train arrives at three o\'clock.',
    question: 'What time does the train arrive?',
    options: [
      { text: '2:30', isCorrect: false },
      { text: '3:00', isCorrect: true },
      { text: '2:00', isCorrect: false },
      { text: '3:30', isCorrect: false },
    ],
    explanation: 'The speaker says "Le train arrive à trois heures" which means "The train arrives at three o\'clock" (3:00).',
    difficulty: 'intermediate',
  },
  {
    id: 4,
    category: 'Directions',
    audioText: 'La bibliothèque est à droite de l\'école, près du parc.',
    translation: 'The library is to the right of the school, near the park.',
    question: 'Where is the library located?',
    options: [
      { text: 'To the left of the school', isCorrect: false },
      { text: 'To the right of the school', isCorrect: true },
      { text: 'Behind the school', isCorrect: false },
      { text: 'In front of the school', isCorrect: false },
    ],
    explanation: 'The speaker says "à droite de l\'école" which means "to the right of the school".',
    difficulty: 'intermediate',
  },
  {
    id: 5,
    category: 'Food',
    audioText: 'Je voudrais un café et un croissant, s\'il vous plaît.',
    translation: 'I would like a coffee and a croissant, please.',
    question: 'What does the person want to order?',
    options: [
      { text: 'Coffee only', isCorrect: false },
      { text: 'Croissant only', isCorrect: false },
      { text: 'Coffee and croissant', isCorrect: true },
      { text: 'Tea and croissant', isCorrect: false },
    ],
    explanation: 'The speaker says "un café et un croissant" which means "a coffee and a croissant".',
    difficulty: 'beginner',
  },
  {
    id: 6,
    category: 'Family',
    audioText: 'Ma mère s\'appelle Catherine et mon père s\'appelle Pierre.',
    translation: 'My mother\'s name is Catherine and my father\'s name is Pierre.',
    question: 'What is the father\'s name?',
    options: [
      { text: 'Catherine', isCorrect: false },
      { text: 'Pierre', isCorrect: true },
      { text: 'Marie', isCorrect: false },
      { text: 'Jean', isCorrect: false },
    ],
    explanation: 'The speaker says "mon père s\'appelle Pierre" which means "my father\'s name is Pierre".',
    difficulty: 'beginner',
  },
  {
    id: 7,
    category: 'Weather',
    audioText: 'Il fait beau aujourd\'hui, mais il va pleuvoir demain.',
    translation: 'It is nice today, but it will rain tomorrow.',
    question: 'What will the weather be like tomorrow?',
    options: [
      { text: 'Sunny', isCorrect: false },
      { text: 'Rainy', isCorrect: true },
      { text: 'Cloudy', isCorrect: false },
      { text: 'Windy', isCorrect: false },
    ],
    explanation: 'The speaker says "il va pleuvoir demain" which means "it will rain tomorrow".',
    difficulty: 'intermediate',
  },
  {
    id: 8,
    category: 'Activities',
    audioText: 'Je vais au cinéma ce soir avec mes amis.',
    translation: 'I am going to the cinema tonight with my friends.',
    question: 'Where is the person going tonight?',
    options: [
      { text: 'To the park', isCorrect: false },
      { text: 'To the cinema', isCorrect: true },
      { text: 'To the restaurant', isCorrect: false },
      { text: 'To the library', isCorrect: false },
    ],
    explanation: 'The speaker says "Je vais au cinéma" which means "I am going to the cinema".',
    difficulty: 'intermediate',
  },
  {
    id: 9,
    category: 'Shopping',
    audioText: 'Cette robe coûte cinquante euros. C\'est trop cher pour moi.',
    translation: 'This dress costs fifty euros. It\'s too expensive for me.',
    question: 'How much does the dress cost?',
    options: [
      { text: '40 euros', isCorrect: false },
      { text: '50 euros', isCorrect: true },
      { text: '60 euros', isCorrect: false },
      { text: '70 euros', isCorrect: false },
    ],
    explanation: 'The speaker says "Cette robe coûte cinquante euros" which means "This dress costs fifty euros".',
    difficulty: 'intermediate',
  },
  {
    id: 10,
    category: 'Transportation',
    audioText: 'Je prends le bus pour aller au travail tous les jours.',
    translation: 'I take the bus to go to work every day.',
    question: 'How does the person go to work?',
    options: [
      { text: 'By car', isCorrect: false },
      { text: 'By bus', isCorrect: true },
      { text: 'By train', isCorrect: false },
      { text: 'By bike', isCorrect: false },
    ],
    explanation: 'The speaker says "Je prends le bus" which means "I take the bus".',
    difficulty: 'intermediate',
  },
];

export default function ListeningPracticeScreen({ navigation }) {
  const { colors, isDarkMode } = useTheme();
  const { awardXP } = useGamification();
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [startTime] = useState(Date.now());
  const [playCount, setPlayCount] = useState(0);

  const currentExercise = LISTENING_EXERCISES[currentExerciseIndex];
  const progress = ((currentExerciseIndex + 1) / LISTENING_EXERCISES.length) * 100;
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
    if (isPlaying) {
      // Pulse animation for playing audio
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
  }, [isPlaying]);

  const handlePlayAudio = async () => {
    if (isPlaying) {
      stopSpeech();
      setIsPlaying(false);
      return;
    }
    
    setIsPlaying(true);
    setPlayCount(playCount + 1);
    
    try {
      // Use text-to-speech to play the French audio
      await speakText(currentExercise.audioText, 'fr-FR');
    } catch (error) {
      console.error('Error playing audio:', error);
    } finally {
      setIsPlaying(false);
    }
  };

  const handleAnswerSelect = (optionIndex) => {
    if (showExplanation) return;
    
    setSelectedAnswer(optionIndex);
    const isCorrect = currentExercise.options[optionIndex].isCorrect;
    
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
    newAnswers[currentExerciseIndex] = {
      exerciseId: currentExercise.id,
      answer: optionIndex,
      isCorrect,
    };
    setAnswers(newAnswers);

    // Show explanation after a brief delay
    setTimeout(() => {
      setShowExplanation(true);
      if (isCorrect) {
        setScore(score + 1);
      }
    }, 500);
  };

  const handleNext = () => {
    if (currentExerciseIndex < LISTENING_EXERCISES.length - 1) {
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
      setSelectedAnswer(null);
      setShowExplanation(false);
      setIsPlaying(false);
      setPlayCount(0);
    } else {
      finishSession();
    }
  };

  const finishSession = () => {
    const totalScore = answers.reduce((sum, ans) => sum + (ans?.isCorrect ? 1 : 0), 0);
    const finalScore = totalScore + (answers[LISTENING_EXERCISES.length - 1]?.isCorrect ? 1 : 0);
    const finalPercentage = (finalScore / LISTENING_EXERCISES.length) * 100;

    setScore(finalScore);
    setSessionCompleted(true);

    // Award XP based on performance
    if (finalPercentage >= 80) {
      awardXP(50, 'Excellent listening comprehension!');
    } else if (finalPercentage >= 60) {
      awardXP(35, 'Good listening practice!');
    } else {
      awardXP(15, 'Listening practice completed!');
    }
  };

  const handleRestart = () => {
    setCurrentExerciseIndex(0);
    setSelectedAnswer(null);
    setAnswers([]);
    setShowExplanation(false);
    setSessionCompleted(false);
    setScore(0);
    setTimeElapsed(0);
    setIsPlaying(false);
    setPlayCount(0);
    scaleAnim.setValue(1);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (sessionCompleted) {
    const percentage = (score / LISTENING_EXERCISES.length) * 100;
    const passed = percentage >= 70;

    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LinearGradient
          colors={
            passed
              ? [premiumColors.accent.sky, premiumColors.accent.sky + 'DD']
              : [premiumColors.info, premiumColors.info + 'DD']
          }
          style={styles.resultHeader}
        >
          <View style={styles.resultIconContainer}>
            <Ionicons name="headset" size={64} color="#FFFFFF" />
          </View>
          <Text style={styles.resultTitle}>
            {passed ? 'Great Listening!' : 'Keep Practicing!'}
          </Text>
          <Text style={styles.resultSubtitle}>
            {passed
              ? 'You have good listening comprehension!'
              : 'Continue practicing to improve your listening skills.'}
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
                  {score}/{LISTENING_EXERCISES.length}
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
                      ? premiumColors.accent.sky + '20'
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
                    ? premiumColors.accent.sky
                    : premiumColors.accent.rose
                }
              />
            </View>
            <Text style={[styles.performanceTitle, { color: colors.text }]}>
              {percentage >= 90
                ? 'Listening Expert!'
                : percentage >= 70
                ? 'Well Done!'
                : 'Good Effort!'}
            </Text>
            <Text style={[styles.performanceText, { color: colors.secondaryText }]}>
              {percentage >= 90
                ? 'You have excellent French listening comprehension!'
                : percentage >= 70
                ? 'You have a good understanding of spoken French.'
                : 'Keep practicing to improve your listening skills.'}
            </Text>
          </View>

          {/* Review Answers */}
          <View style={styles.reviewSection}>
            <Text style={[styles.reviewTitle, { color: colors.text }]}>
              Review Your Answers
            </Text>
            {LISTENING_EXERCISES.map((exercise, index) => {
              const userAnswer = answers[index];
              const isCorrect = userAnswer?.isCorrect;
              const selectedOption = exercise.options[userAnswer?.answer];

              return (
                <View
                  key={exercise.id}
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
                      <Text style={[styles.reviewCategory, { color: premiumColors.accent.sky }]}>
                        {exercise.category}
                      </Text>
                      <Text style={[styles.reviewQuestion, { color: colors.text }]}>
                        {exercise.question}
                      </Text>
                      <Text style={[styles.reviewAudio, { color: colors.secondaryText }]}>
                        Audio: "{exercise.audioText}"
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.reviewAnswer, { color: colors.secondaryText }]}>
                    Your answer: {selectedOption?.text || 'Not answered'}
                  </Text>
                  {exercise.explanation && (
                    <Text style={[styles.reviewExplanation, { color: colors.secondaryText }]}>
                      {exercise.explanation}
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
              <Ionicons name="refresh" size={20} color={premiumColors.accent.sky} />
              <Text style={[styles.actionButtonText, { color: premiumColors.accent.sky }]}>
                Retake Practice
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.continueButton, { backgroundColor: premiumColors.accent.sky }]}
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
              Listening Practice
            </Text>
            <Text style={[styles.headerSubtitle, { color: isDarkMode ? '#FFFFFF' : '#424242' }]}>
              Improve your comprehension
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
                backgroundColor: premiumColors.accent.sky,
              },
            ]}
          />
        </View>
        <Text style={[styles.progressText, { color: colors.secondaryText }]}>
          Exercise {currentExerciseIndex + 1} of {LISTENING_EXERCISES.length}
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
                { backgroundColor: premiumColors.accent.sky + '20' },
              ]}
            >
              <Ionicons name="headset" size={16} color={premiumColors.accent.sky} />
              <Text style={[styles.categoryText, { color: premiumColors.accent.sky }]}>
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

          {/* Audio Player */}
          <View style={styles.audioContainer}>
            <Animated.View
              style={[
                styles.playButton,
                { backgroundColor: premiumColors.accent.sky },
                { transform: [{ scale: pulseAnim }] },
              ]}
            >
              <TouchableOpacity
                style={styles.playButtonInner}
                onPress={handlePlayAudio}
              >
                <Ionicons
                  name={isPlaying ? 'pause' : 'play'}
                  size={40}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            </Animated.View>
            <Text style={[styles.playHint, { color: colors.secondaryText }]}>
              {isPlaying ? 'Playing audio...' : playCount > 0 ? 'Tap to replay' : 'Tap to play audio'}
            </Text>
            <Text style={[styles.audioTextHint, { color: colors.secondaryText }]}>
              "{currentExercise.audioText}"
            </Text>
            {playCount > 0 && (
              <Text style={[styles.playCount, { color: colors.secondaryText }]}>
                Played {playCount} time{playCount > 1 ? 's' : ''}
              </Text>
            )}
          </View>

          {/* Question */}
          <View style={styles.questionContainer}>
            <Text style={[styles.question, { color: colors.text }]}>
              {currentExercise.question}
            </Text>
          </View>

          {/* Options */}
          <View style={styles.optionsContainer}>
            {currentExercise.options.map((option, index) => {
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
                  backgroundColor: premiumColors.accent.sky + '20',
                  borderColor: premiumColors.accent.sky,
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
                            ? premiumColors.accent.sky
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
          {showExplanation && currentExercise.explanation && (
            <View
              style={[
                styles.explanationCard,
                {
                  backgroundColor:
                    selectedAnswer !== null &&
                    currentExercise.options[selectedAnswer].isCorrect
                      ? premiumColors.accent.emerald + '10'
                      : premiumColors.error + '10',
                  borderColor:
                    selectedAnswer !== null &&
                    currentExercise.options[selectedAnswer].isCorrect
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
                  currentExercise.options[selectedAnswer].isCorrect
                    ? premiumColors.accent.emerald
                    : premiumColors.error
                }
              />
              <View style={styles.explanationContent}>
                <Text
                  style={[
                    styles.explanationText,
                    {
                      color:
                        selectedAnswer !== null &&
                        currentExercise.options[selectedAnswer].isCorrect
                          ? premiumColors.accent.emerald
                          : premiumColors.error,
                    },
                  ]}
                >
                  {currentExercise.explanation}
                </Text>
                <Text style={[styles.translationText, { color: colors.secondaryText }]}>
                  Translation: "{currentExercise.translation}"
                </Text>
              </View>
            </View>
          )}

          {/* Next Button */}
          {showExplanation && (
            <TouchableOpacity
              style={[styles.nextButton, { backgroundColor: premiumColors.accent.sky }]}
              onPress={handleNext}
            >
              <Text style={styles.nextButtonText}>
                {currentExerciseIndex < LISTENING_EXERCISES.length - 1
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
    marginBottom: spacing.xl,
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
  audioContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingVertical: spacing.lg,
  },
  playButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  playButtonInner: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playHint: {
    fontSize: fontSize.sm,
    marginBottom: spacing.xs,
  },
  playCount: {
    fontSize: fontSize.xs,
    fontStyle: 'italic',
  },
  audioTextHint: {
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
    fontStyle: 'italic',
    textAlign: 'center',
    opacity: 0.7,
  },
  questionContainer: {
    marginBottom: spacing.xl,
    padding: spacing.md,
    borderRadius: premiumBorderRadius.lg,
    backgroundColor: 'rgba(156, 39, 176, 0.1)',
  },
  question: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 28,
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
  explanationContent: {
    flex: 1,
  },
  explanationText: {
    fontSize: fontSize.sm,
    lineHeight: 20,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  translationText: {
    fontSize: fontSize.xs,
    fontStyle: 'italic',
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
    marginBottom: spacing.xs / 2,
  },
  reviewAudio: {
    fontSize: fontSize.xs,
    fontStyle: 'italic',
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

