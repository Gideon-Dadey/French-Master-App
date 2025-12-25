import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../src/context/ThemeContext';
import { useGamification } from '../src/context/GamificationContext';

const { width, height } = Dimensions.get('window');

const premiumColors = {
  primary: { main: '#6366F1', light: '#818CF8', dark: '#4F46E5' },
  accent: {
    emerald: '#10B981',
    gold: '#F59E0B',
    rose: '#F43F5E',
    sky: '#0EA5E9',
    violet: '#8B5CF6',
    amber: '#F59E0B',
  },
  gradients: {
    primary: ['#6366F1', '#8B5CF6'],
    success: ['#10B981', '#059669'],
    warning: ['#F59E0B', '#D97706'],
    error: ['#F43F5E', '#E11D48'],
    cool: ['#06B6D4', '#3B82F6'],
    warm: ['#F97316', '#F43F5E'],
  }
};

const QUIZ_CATEGORIES = [
  { id: 'greetings', name: 'Greetings', icon: 'hand-left', color: '#6366F1', gradient: ['#6366F1', '#8B5CF6'] },
  { id: 'numbers', name: 'Numbers', icon: 'calculator', color: '#10B981', gradient: ['#10B981', '#059669'] },
  { id: 'colors', name: 'Colors', icon: 'color-palette', color: '#F43F5E', gradient: ['#F43F5E', '#E11D48'] },
  { id: 'food', name: 'Food & Drinks', icon: 'restaurant', color: '#F59E0B', gradient: ['#F59E0B', '#D97706'] },
  { id: 'time', name: 'Time & Days', icon: 'time', color: '#0EA5E9', gradient: ['#0EA5E9', '#0284C7'] },
  { id: 'family', name: 'Family', icon: 'people', color: '#8B5CF6', gradient: ['#8B5CF6', '#7C3AED'] },
  { id: 'verbs', name: 'Common Verbs', icon: 'flash', color: '#EC4899', gradient: ['#EC4899', '#DB2777'] },
  { id: 'phrases', name: 'Useful Phrases', icon: 'chatbubbles', color: '#14B8A6', gradient: ['#14B8A6', '#0D9488'] },
];

const QUIZ_QUESTIONS = {
  greetings: [
    {
      id: 'g1',
      question: 'What does "Bonjour" mean?',
      options: ['Goodbye', 'Hello / Good morning', 'Thank you', 'Please'],
      correct: 1,
      explanation: '"Bonjour" is a common French greeting meaning "Hello" or "Good morning".',
    },
    {
      id: 'g2',
      question: 'How do you say "Good evening" in French?',
      options: ['Bonjour', 'Bonsoir', 'Bonne nuit', 'Salut'],
      correct: 1,
      explanation: '"Bonsoir" means "Good evening". Use it after 6 PM.',
    },
    {
      id: 'g3',
      question: 'What does "Au revoir" mean?',
      options: ['Hello', 'See you later', 'Goodbye', 'Good night'],
      correct: 2,
      explanation: '"Au revoir" is a formal way to say "Goodbye" in French.',
    },
    {
      id: 'g4',
      question: 'How do you say "How are you?" formally?',
      options: ['Ça va?', 'Comment allez-vous?', 'Quoi de neuf?', 'Tu vas bien?'],
      correct: 1,
      explanation: '"Comment allez-vous?" is the formal way to ask "How are you?"',
    },
    {
      id: 'g5',
      question: 'What is the informal greeting for "Hi"?',
      options: ['Bonjour', 'Salut', 'Bonsoir', 'Coucou'],
      correct: 1,
      explanation: '"Salut" is an informal greeting similar to "Hi" in English.',
    },
    {
      id: 'g6',
      question: 'What does "Enchanté(e)" mean?',
      options: ['Excuse me', 'Nice to meet you', 'Thank you', 'Welcome'],
      correct: 1,
      explanation: '"Enchanté(e)" means "Nice to meet you" or "Pleased to meet you".',
    },
  ],
  numbers: [
    {
      id: 'n1',
      question: 'What is "un, deux, trois" in English?',
      options: ['4, 5, 6', '1, 2, 3', '7, 8, 9', '10, 11, 12'],
      correct: 1,
      explanation: '"Un, deux, trois" means "one, two, three" in French.',
    },
    {
      id: 'n2',
      question: 'How do you say "ten" in French?',
      options: ['Huit', 'Neuf', 'Dix', 'Sept'],
      correct: 2,
      explanation: '"Dix" means "ten" in French.',
    },
    {
      id: 'n3',
      question: 'What number is "vingt"?',
      options: ['12', '15', '20', '25'],
      correct: 2,
      explanation: '"Vingt" means "twenty" in French.',
    },
    {
      id: 'n4',
      question: 'How do you say "100" in French?',
      options: ['Mille', 'Cent', 'Cinquante', 'Soixante'],
      correct: 1,
      explanation: '"Cent" means "one hundred" in French.',
    },
    {
      id: 'n5',
      question: 'What is "quinze"?',
      options: ['14', '15', '16', '17'],
      correct: 1,
      explanation: '"Quinze" means "fifteen" in French.',
    },
    {
      id: 'n6',
      question: 'How do you say "first" in French?',
      options: ['Deuxième', 'Premier', 'Troisième', 'Dernier'],
      correct: 1,
      explanation: '"Premier/Première" means "first" in French.',
    },
  ],
  colors: [
    {
      id: 'c1',
      question: 'What color is "rouge"?',
      options: ['Blue', 'Red', 'Green', 'Yellow'],
      correct: 1,
      explanation: '"Rouge" means "red" in French.',
    },
    {
      id: 'c2',
      question: 'How do you say "blue" in French?',
      options: ['Blanc', 'Noir', 'Bleu', 'Vert'],
      correct: 2,
      explanation: '"Bleu" means "blue" in French.',
    },
    {
      id: 'c3',
      question: 'What does "noir" mean?',
      options: ['White', 'Black', 'Gray', 'Brown'],
      correct: 1,
      explanation: '"Noir" means "black" in French.',
    },
    {
      id: 'c4',
      question: 'What is the French word for "white"?',
      options: ['Blanc', 'Noir', 'Gris', 'Beige'],
      correct: 0,
      explanation: '"Blanc" means "white" in French.',
    },
    {
      id: 'c5',
      question: 'How do you say "green" in French?',
      options: ['Jaune', 'Orange', 'Vert', 'Violet'],
      correct: 2,
      explanation: '"Vert" means "green" in French.',
    },
    {
      id: 'c6',
      question: 'What color is "jaune"?',
      options: ['Orange', 'Yellow', 'Gold', 'Cream'],
      correct: 1,
      explanation: '"Jaune" means "yellow" in French.',
    },
  ],
  food: [
    {
      id: 'f1',
      question: 'What does "pain" mean?',
      options: ['Water', 'Bread', 'Butter', 'Cheese'],
      correct: 1,
      explanation: '"Pain" means "bread" in French.',
    },
    {
      id: 'f2',
      question: 'How do you say "water" in French?',
      options: ['Vin', 'Lait', 'Eau', 'Jus'],
      correct: 2,
      explanation: '"Eau" means "water" in French.',
    },
    {
      id: 'f3',
      question: 'What is "fromage"?',
      options: ['Cheese', 'Meat', 'Fish', 'Vegetables'],
      correct: 0,
      explanation: '"Fromage" means "cheese" in French.',
    },
    {
      id: 'f4',
      question: 'How do you say "coffee" in French?',
      options: ['Thé', 'Café', 'Chocolat', 'Lait'],
      correct: 1,
      explanation: '"Café" means "coffee" in French.',
    },
    {
      id: 'f5',
      question: 'What does "poulet" mean?',
      options: ['Pork', 'Beef', 'Chicken', 'Fish'],
      correct: 2,
      explanation: '"Poulet" means "chicken" in French.',
    },
    {
      id: 'f6',
      question: 'What is the French word for "apple"?',
      options: ['Banane', 'Orange', 'Pomme', 'Fraise'],
      correct: 2,
      explanation: '"Pomme" means "apple" in French.',
    },
  ],
  time: [
    {
      id: 't1',
      question: 'What does "aujourd\'hui" mean?',
      options: ['Yesterday', 'Today', 'Tomorrow', 'Now'],
      correct: 1,
      explanation: '"Aujourd\'hui" means "today" in French.',
    },
    {
      id: 't2',
      question: 'How do you say "Monday" in French?',
      options: ['Mardi', 'Lundi', 'Mercredi', 'Jeudi'],
      correct: 1,
      explanation: '"Lundi" means "Monday" in French.',
    },
    {
      id: 't3',
      question: 'What is "semaine"?',
      options: ['Day', 'Week', 'Month', 'Year'],
      correct: 1,
      explanation: '"Semaine" means "week" in French.',
    },
    {
      id: 't4',
      question: 'How do you say "hour" in French?',
      options: ['Minute', 'Heure', 'Seconde', 'Temps'],
      correct: 1,
      explanation: '"Heure" means "hour" in French.',
    },
    {
      id: 't5',
      question: 'What does "demain" mean?',
      options: ['Yesterday', 'Today', 'Tomorrow', 'Later'],
      correct: 2,
      explanation: '"Demain" means "tomorrow" in French.',
    },
    {
      id: 't6',
      question: 'What is the French word for "year"?',
      options: ['Mois', 'Jour', 'An/Année', 'Heure'],
      correct: 2,
      explanation: '"An" or "Année" means "year" in French.',
    },
  ],
  family: [
    {
      id: 'fam1',
      question: 'What does "mère" mean?',
      options: ['Father', 'Mother', 'Sister', 'Grandmother'],
      correct: 1,
      explanation: '"Mère" means "mother" in French.',
    },
    {
      id: 'fam2',
      question: 'How do you say "father" in French?',
      options: ['Mère', 'Père', 'Frère', 'Oncle'],
      correct: 1,
      explanation: '"Père" means "father" in French.',
    },
    {
      id: 'fam3',
      question: 'What is "frère"?',
      options: ['Sister', 'Brother', 'Cousin', 'Uncle'],
      correct: 1,
      explanation: '"Frère" means "brother" in French.',
    },
    {
      id: 'fam4',
      question: 'How do you say "grandmother" in French?',
      options: ['Grand-mère', 'Grand-père', 'Tante', 'Nièce'],
      correct: 0,
      explanation: '"Grand-mère" means "grandmother" in French.',
    },
    {
      id: 'fam5',
      question: 'What does "enfant" mean?',
      options: ['Adult', 'Child', 'Baby', 'Teenager'],
      correct: 1,
      explanation: '"Enfant" means "child" in French.',
    },
    {
      id: 'fam6',
      question: 'What is the French word for "husband"?',
      options: ['Femme', 'Mari', 'Fils', 'Neveu'],
      correct: 1,
      explanation: '"Mari" means "husband" in French.',
    },
  ],
  verbs: [
    {
      id: 'v1',
      question: 'What does "être" mean?',
      options: ['To have', 'To be', 'To go', 'To do'],
      correct: 1,
      explanation: '"Être" means "to be" in French - one of the most important verbs.',
    },
    {
      id: 'v2',
      question: 'How do you say "I have" in French?',
      options: ['Je suis', 'J\'ai', 'Je vais', 'Je fais'],
      correct: 1,
      explanation: '"J\'ai" means "I have" in French (from "avoir").',
    },
    {
      id: 'v3',
      question: 'What is "aller"?',
      options: ['To be', 'To have', 'To go', 'To eat'],
      correct: 2,
      explanation: '"Aller" means "to go" in French.',
    },
    {
      id: 'v4',
      question: 'How do you say "to eat" in French?',
      options: ['Boire', 'Manger', 'Dormir', 'Parler'],
      correct: 1,
      explanation: '"Manger" means "to eat" in French.',
    },
    {
      id: 'v5',
      question: 'What does "parler" mean?',
      options: ['To listen', 'To read', 'To speak', 'To write'],
      correct: 2,
      explanation: '"Parler" means "to speak" or "to talk" in French.',
    },
    {
      id: 'v6',
      question: 'What is the French word for "to want"?',
      options: ['Pouvoir', 'Vouloir', 'Devoir', 'Savoir'],
      correct: 1,
      explanation: '"Vouloir" means "to want" in French.',
    },
  ],
  phrases: [
    {
      id: 'p1',
      question: 'What does "Je ne comprends pas" mean?',
      options: ['I understand', 'I don\'t understand', 'I know', 'I forgot'],
      correct: 1,
      explanation: '"Je ne comprends pas" means "I don\'t understand" in French.',
    },
    {
      id: 'p2',
      question: 'How do you say "Excuse me" in French?',
      options: ['Merci', 'S\'il vous plaît', 'Excusez-moi', 'De rien'],
      correct: 2,
      explanation: '"Excusez-moi" means "Excuse me" in French.',
    },
    {
      id: 'p3',
      question: 'What does "S\'il vous plaît" mean?',
      options: ['Thank you', 'Please', 'Sorry', 'Goodbye'],
      correct: 1,
      explanation: '"S\'il vous plaît" means "Please" in French (formal).',
    },
    {
      id: 'p4',
      question: 'How do you say "I love you" in French?',
      options: ['Je t\'aime', 'Je t\'adore', 'Je te veux', 'Je te plais'],
      correct: 0,
      explanation: '"Je t\'aime" means "I love you" in French.',
    },
    {
      id: 'p5',
      question: 'What does "Ça va?" mean?',
      options: ['What\'s that?', 'How are you?', 'Where are you?', 'Who is it?'],
      correct: 1,
      explanation: '"Ça va?" is an informal way to ask "How are you?" or "How\'s it going?"',
    },
    {
      id: 'p6',
      question: 'How do you say "I don\'t know" in French?',
      options: ['Je sais', 'Je ne sais pas', 'Je comprends', 'Je pense'],
      correct: 1,
      explanation: '"Je ne sais pas" means "I don\'t know" in French.',
    },
  ],
};

export default function FreeQuizScreen({ navigation }) {
  const { colors, isDarkMode } = useTheme();
  const { awardXP } = useGamification();

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [streak, setStreak] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [startTime, setStartTime] = useState(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const optionAnims = useRef([...Array(4)].map(() => new Animated.Value(0))).current;
  const correctAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const questions = selectedCategory ? QUIZ_QUESTIONS[selectedCategory] : [];
  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  useEffect(() => {
    let timer;
    if (startTime && !quizCompleted) {
      timer = setInterval(() => {
        setTimeElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [startTime, quizCompleted]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    if (currentQuestion) {
      optionAnims.forEach((anim, index) => {
        anim.setValue(0);
        Animated.spring(anim, {
          toValue: 1,
          delay: index * 100,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }).start();
      });
    }
  }, [currentQuestionIndex, selectedCategory]);

  useEffect(() => {
    Animated.spring(progressAnim, {
      toValue: progress,
      tension: 50,
      friction: 8,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const startQuiz = (categoryId) => {
    setSelectedCategory(categoryId);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setAnswers([]);
    setStreak(0);
    setQuizCompleted(false);
    setTimeElapsed(0);
    setStartTime(Date.now());
  };

  const handleAnswer = (index) => {
    if (showResult) return;

    setSelectedAnswer(index);
    const isCorrect = index === currentQuestion.correct;

    if (isCorrect) {
      Animated.sequence([
        Animated.timing(correctAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(correctAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();
      setStreak(streak + 1);
      setScore(score + 1);
    } else {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
      setStreak(0);
    }

    setAnswers([...answers, { questionId: currentQuestion.id, answer: index, isCorrect }]);

    setTimeout(() => setShowResult(true), 300);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    setQuizCompleted(true);
    const percentage = (score / questions.length) * 100;

    if (percentage >= 90) {
      awardXP(100, 'Perfect quiz score! 🏆');
    } else if (percentage >= 70) {
      awardXP(50, 'Great quiz performance! ⭐');
    } else if (percentage >= 50) {
      awardXP(25, 'Good effort on the quiz!');
    } else {
      awardXP(10, 'Quiz completed!');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCategoryInfo = () => QUIZ_CATEGORIES.find(c => c.id === selectedCategory);

  if (!selectedCategory) {
    return (
      <View style={[styles.container, { backgroundColor: isDarkMode ? '#000000' : '#F8FAFC' }]}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

        <LinearGradient
          colors={isDarkMode ? ['#1E1B4B', '#312E81'] : ['#6366F1', '#8B5CF6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.categoryHeader}
        >
          <View style={styles.headerDecor1} />
          <View style={styles.headerDecor2} />

          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
          </TouchableOpacity>

          <Animated.View
            style={[
              styles.headerContent,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}
          >
            <View style={styles.headerIconWrap}>
              <Ionicons name="school" size={40} color="#FFFFFF" />
            </View>
            <Text style={styles.headerTitle}>Quick Quiz</Text>
            <Text style={styles.headerSubtitle}>
              Test your French knowledge with fun quizzes
            </Text>
          </Animated.View>
        </LinearGradient>

        <ScrollView
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Choose a Category
          </Text>
          <Text style={[styles.sectionSubtitle, { color: colors.secondaryText }]}>
            Each category has 6 questions to test your skills
          </Text>

          <View style={styles.categoryGrid}>
            {QUIZ_CATEGORIES.map((category, index) => (
              <Animated.View
                key={category.id}
                style={{
                  opacity: fadeAnim,
                  transform: [
                    { translateY: slideAnim },
                    { scale: scaleAnim }
                  ],
                }}
              >
                <TouchableOpacity
                  style={[
                    styles.categoryCard,
                    { backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF' }
                  ]}
                  onPress={() => startQuiz(category.id)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={category.gradient}
                    style={styles.categoryIcon}
                  >
                    <Ionicons name={category.icon} size={28} color="#FFFFFF" />
                  </LinearGradient>
                  <Text style={[styles.categoryName, { color: colors.text }]}>
                    {category.name}
                  </Text>
                  <View style={styles.categoryMeta}>
                    <Text style={[styles.categoryCount, { color: colors.secondaryText }]}>
                      6 Questions
                    </Text>
                    <Ionicons name="chevron-forward" size={16} color={colors.secondaryText} />
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>

          <View style={[styles.statsCard, { backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF' }]}>
            <LinearGradient
              colors={['#6366F1', '#8B5CF6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.statsGradient}
            >
              <View style={styles.statItem}>
                <Text style={styles.statValue}>48</Text>
                <Text style={styles.statLabel}>Questions</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>8</Text>
                <Text style={styles.statLabel}>Categories</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>∞</Text>
                <Text style={styles.statLabel}>Attempts</Text>
              </View>
            </LinearGradient>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </View>
    );
  }

  if (quizCompleted) {
    const percentage = (score / questions.length) * 100;
    const categoryInfo = getCategoryInfo();

    return (
      <View style={[styles.container, { backgroundColor: isDarkMode ? '#000000' : '#F8FAFC' }]}>
        <StatusBar barStyle="light-content" />

        <LinearGradient
          colors={percentage >= 70 ? ['#10B981', '#059669'] : ['#6366F1', '#8B5CF6']}
          style={styles.resultHeader}
        >
          <View style={styles.resultDecor1} />
          <View style={styles.resultDecor2} />

          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => setSelectedCategory(null)}
          >
            <Ionicons name="close" size={28} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.resultIconContainer}>
            <View style={styles.resultIconGlow} />
            <Ionicons
              name={percentage >= 70 ? 'trophy' : 'ribbon'}
              size={60}
              color="#FFFFFF"
            />
          </View>

          <Text style={styles.resultTitle}>
            {percentage >= 90 ? 'Perfect!' : percentage >= 70 ? 'Excellent!' : percentage >= 50 ? 'Good Job!' : 'Keep Practicing!'}
          </Text>
          <Text style={styles.resultSubtitle}>
            {categoryInfo?.name} Quiz Completed
          </Text>
        </LinearGradient>

        <ScrollView
          style={styles.resultScroll}
          contentContainerStyle={styles.resultContent}
          showsVerticalScrollIndicator={false}
        >

          <View style={[styles.scoreCard, { backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF' }]}>
            <View style={styles.scoreRow}>
              <View style={styles.scoreItem}>
                <Text style={[styles.scoreLabel, { color: colors.secondaryText }]}>Score</Text>
                <Text style={[styles.scoreValue, { color: colors.text }]}>{score}/{questions.length}</Text>
              </View>
              <View style={[styles.scoreDivider, { backgroundColor: colors.border }]} />
              <View style={styles.scoreItem}>
                <Text style={[styles.scoreLabel, { color: colors.secondaryText }]}>Accuracy</Text>
                <Text style={[styles.scoreValue, { color: percentage >= 70 ? '#10B981' : colors.text }]}>
                  {percentage.toFixed(0)}%
                </Text>
              </View>
              <View style={[styles.scoreDivider, { backgroundColor: colors.border }]} />
              <View style={styles.scoreItem}>
                <Text style={[styles.scoreLabel, { color: colors.secondaryText }]}>Time</Text>
                <Text style={[styles.scoreValue, { color: colors.text }]}>{formatTime(timeElapsed)}</Text>
              </View>
            </View>
          </View>

          <Text style={[styles.reviewTitle, { color: colors.text }]}>Review Answers</Text>

          {questions.map((question, index) => {
            const userAnswer = answers[index];
            const isCorrect = userAnswer?.isCorrect;

            return (
              <View
                key={question.id}
                style={[
                  styles.reviewCard,
                  {
                    backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
                    borderLeftColor: isCorrect ? '#10B981' : '#F43F5E',
                  }
                ]}
              >
                <View style={styles.reviewHeader}>
                  <View style={[
                    styles.reviewBadge,
                    { backgroundColor: isCorrect ? '#10B98120' : '#F43F5E20' }
                  ]}>
                    <Ionicons
                      name={isCorrect ? 'checkmark-circle' : 'close-circle'}
                      size={20}
                      color={isCorrect ? '#10B981' : '#F43F5E'}
                    />
                  </View>
                  <Text style={[styles.reviewQuestion, { color: colors.text }]} numberOfLines={2}>
                    {question.question}
                  </Text>
                </View>
                <Text style={[styles.reviewAnswer, { color: colors.secondaryText }]}>
                  Your answer: {question.options[userAnswer?.answer]}
                </Text>
                {!isCorrect && (
                  <Text style={[styles.reviewCorrect, { color: '#10B981' }]}>
                    Correct: {question.options[question.correct]}
                  </Text>
                )}
              </View>
            );
          })}

          <View style={styles.resultActions}>
            <TouchableOpacity
              style={[styles.retryBtn, { backgroundColor: isDarkMode ? '#374151' : '#F1F5F9' }]}
              onPress={() => startQuiz(selectedCategory)}
            >
              <Ionicons name="refresh" size={22} color={colors.text} />
              <Text style={[styles.retryBtnText, { color: colors.text }]}>Retry Quiz</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.newQuizBtn}
              onPress={() => setSelectedCategory(null)}
            >
              <LinearGradient
                colors={['#6366F1', '#8B5CF6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.newQuizGradient}
              >
                <Ionicons name="grid" size={22} color="#FFFFFF" />
                <Text style={styles.newQuizBtnText}>New Category</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </View>
    );
  }

  const categoryInfo = getCategoryInfo();

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#000000' : '#F8FAFC' }]}>
      <StatusBar barStyle="light-content" />

      <LinearGradient
        colors={categoryInfo?.gradient || ['#6366F1', '#8B5CF6']}
        style={styles.quizHeader}
      >
        <View style={styles.quizHeaderTop}>
          <TouchableOpacity
            style={styles.quizBackBtn}
            onPress={() => setSelectedCategory(null)}
          >
            <Ionicons name="close" size={26} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.quizHeaderCenter}>
            <Text style={styles.quizCategory}>{categoryInfo?.name}</Text>
            <Text style={styles.quizProgress}>
              {currentQuestionIndex + 1} of {questions.length}
            </Text>
          </View>

          <View style={styles.timerBadge}>
            <Ionicons name="time-outline" size={16} color="#FFFFFF" />
            <Text style={styles.timerText}>{formatTime(timeElapsed)}</Text>
          </View>
        </View>

        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBg}>
            <Animated.View
              style={[
                styles.progressBarFill,
                { width: progressAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                }) }
              ]}
            />
          </View>
        </View>

        {streak >= 2 && (
          <View style={styles.streakBadge}>
            <Ionicons name="flame" size={18} color="#F59E0B" />
            <Text style={styles.streakText}>{streak} Streak!</Text>
          </View>
        )}
      </LinearGradient>

      <ScrollView
        style={styles.quizScroll}
        contentContainerStyle={styles.quizContent}
        showsVerticalScrollIndicator={false}
      >

        <Animated.View
          style={[
            styles.questionCard,
            {
              backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
              transform: [{ translateX: shakeAnim }]
            }
          ]}
        >
          <View style={styles.questionNumber}>
            <Text style={styles.questionNumberText}>Q{currentQuestionIndex + 1}</Text>
          </View>
          <Text style={[styles.questionText, { color: colors.text }]}>
            {currentQuestion?.question}
          </Text>
        </Animated.View>

        <View style={styles.optionsContainer}>
          {currentQuestion?.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrect = index === currentQuestion.correct;
            const showCorrect = showResult && isCorrect;
            const showWrong = showResult && isSelected && !isCorrect;

            return (
              <Animated.View
                key={index}
                style={{
                  opacity: optionAnims[index],
                  transform: [{
                    translateX: optionAnims[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    })
                  }]
                }}
              >
                <TouchableOpacity
                  style={[
                    styles.optionBtn,
                    {
                      backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
                      borderColor: showCorrect ? '#10B981' : showWrong ? '#F43F5E' : isSelected ? '#6366F1' : isDarkMode ? '#334155' : '#E2E8F0',
                      borderWidth: showCorrect || showWrong || isSelected ? 2 : 1,
                    }
                  ]}
                  onPress={() => handleAnswer(index)}
                  disabled={showResult}
                  activeOpacity={0.8}
                >
                  <View style={[
                    styles.optionLetter,
                    {
                      backgroundColor: showCorrect ? '#10B981' : showWrong ? '#F43F5E' : isSelected ? '#6366F1' : isDarkMode ? '#374151' : '#F1F5F9',
                    }
                  ]}>
                    <Text style={[
                      styles.optionLetterText,
                      { color: showCorrect || showWrong || isSelected ? '#FFFFFF' : colors.text }
                    ]}>
                      {String.fromCharCode(65 + index)}
                    </Text>
                  </View>
                  <Text style={[styles.optionText, { color: colors.text }]}>
                    {option}
                  </Text>
                  {showCorrect && (
                    <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                  )}
                  {showWrong && (
                    <Ionicons name="close-circle" size={24} color="#F43F5E" />
                  )}
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        {showResult && (
          <Animated.View
            style={[
              styles.explanationCard,
              {
                backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
                borderLeftColor: selectedAnswer === currentQuestion.correct ? '#10B981' : '#F43F5E',
              }
            ]}
          >
            <View style={styles.explanationHeader}>
              <Ionicons
                name={selectedAnswer === currentQuestion.correct ? 'bulb' : 'information-circle'}
                size={22}
                color={selectedAnswer === currentQuestion.correct ? '#10B981' : '#F59E0B'}
              />
              <Text style={[styles.explanationTitle, { color: colors.text }]}>
                {selectedAnswer === currentQuestion.correct ? 'Correct!' : 'Explanation'}
              </Text>
            </View>
            <Text style={[styles.explanationText, { color: colors.secondaryText }]}>
              {currentQuestion?.explanation}
            </Text>
          </Animated.View>
        )}

        {showResult && (
          <TouchableOpacity
            style={styles.nextBtn}
            onPress={nextQuestion}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#6366F1', '#8B5CF6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.nextBtnGradient}
            >
              <Text style={styles.nextBtnText}>
                {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'See Results'}
              </Text>
              <Ionicons name="arrow-forward" size={22} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  categoryHeader: {
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: 40,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  headerDecor1: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  headerDecor2: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  categoryScroll: {
    flex: 1,
  },
  categoryContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 15,
    marginBottom: 24,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: (width - 52) / 2,
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  categoryName: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 8,
  },
  categoryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryCount: {
    fontSize: 13,
  },
  statsCard: {
    borderRadius: 20,
    marginTop: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  statsGradient: {
    flexDirection: 'row',
    padding: 24,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },

  quizHeader: {
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  quizHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  quizBackBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quizHeaderCenter: {
    alignItems: 'center',
  },
  quizCategory: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  quizProgress: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  timerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  progressBarContainer: {
    paddingHorizontal: 4,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  streakBadge: {
    position: 'absolute',
    bottom: -16,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  streakText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F59E0B',
  },

  quizScroll: {
    flex: 1,
  },
  quizContent: {
    padding: 20,
    paddingTop: 32,
  },
  questionCard: {
    padding: 24,
    borderRadius: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  questionNumber: {
    position: 'absolute',
    top: -12,
    left: 20,
    backgroundColor: '#6366F1',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
  },
  questionNumberText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  questionText: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 30,
    marginTop: 8,
  },
  optionsContainer: {
    gap: 12,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 16,
    gap: 14,
  },
  optionLetter: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLetterText: {
    fontSize: 16,
    fontWeight: '700',
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  explanationCard: {
    padding: 20,
    borderRadius: 16,
    marginTop: 24,
    borderLeftWidth: 4,
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  explanationTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  explanationText: {
    fontSize: 15,
    lineHeight: 24,
  },
  nextBtn: {
    marginTop: 24,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  nextBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 10,
  },
  nextBtnText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  resultHeader: {
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: 50,
    alignItems: 'center',
    overflow: 'hidden',
  },
  resultDecor1: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  resultDecor2: {
    position: 'absolute',
    bottom: -60,
    left: -60,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  closeBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 50,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  resultIconGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  resultTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  resultSubtitle: {
    fontSize: 17,
    color: 'rgba(255,255,255,0.85)',
  },
  resultScroll: {
    flex: 1,
  },
  resultContent: {
    padding: 20,
    paddingTop: 0,
    marginTop: -24,
  },
  scoreCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  scoreItem: {
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 13,
    marginBottom: 6,
  },
  scoreValue: {
    fontSize: 26,
    fontWeight: '800',
  },
  scoreDivider: {
    width: 1,
    height: 50,
  },
  reviewTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  reviewCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 8,
  },
  reviewBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewQuestion: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
  },
  reviewAnswer: {
    fontSize: 14,
    marginLeft: 48,
  },
  reviewCorrect: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 48,
    marginTop: 4,
  },
  resultActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  retryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  retryBtnText: {
    fontSize: 16,
    fontWeight: '600',
  },
  newQuizBtn: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  newQuizGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  newQuizBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
