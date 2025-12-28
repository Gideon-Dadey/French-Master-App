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

const QUIZ_CATEGORIES = [
  { id: 'greetings', name: 'Greetings', icon: 'hand-left', color: '#1E3A5F', gradient: ['#1E3A5F', '#2D4A6F'] },
  { id: 'numbers', name: 'Numbers', icon: 'calculator', color: '#2E7D5A', gradient: ['#2E7D5A', '#3A6BA7'] },
  { id: 'colors', name: 'Colors', icon: 'color-palette', color: '#C94C4C', gradient: ['#C94C4C', '#E57373'] },
  { id: 'food', name: 'Food & Drinks', icon: 'restaurant', color: '#C9A227', gradient: ['#C9A227', '#D4B445'] },
  { id: 'time', name: 'Time & Days', icon: 'time', color: '#5B8FB9', gradient: ['#5B8FB9', '#7AA8D4'] },
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
  const { isDarkMode, toggleTheme } = useTheme();
  const theme = getThemeColors(isDarkMode);
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
  const [headerInteractable, setHeaderInteractable] = useState(false);

  const scrollY = useRef(new Animated.Value(0)).current;

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
    navigation.setOptions({ headerShown: false });
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: true,
      listener: (event) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        setHeaderInteractable(offsetY > 100);
      }
    }
  );

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 80, 120],
    outputRange: [0, 0, 1],
    extrapolate: 'clamp',
  });

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
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

        {/* Floating Navigation Bar */}
        <Animated.View
          pointerEvents={headerInteractable ? 'auto' : 'none'}
          style={[
            styles.floatingNavBar,
            {
              backgroundColor: theme.surface + 'F8',
              opacity: headerOpacity,
              borderBottomColor: theme.border,
            }
          ]}
        >
          <View style={styles.navBarContent}>
            <View style={styles.navBarLeft}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.navBackBtn}>
                <Ionicons name="arrow-back" size={24} color={theme.text} />
              </TouchableOpacity>
              <Text style={[styles.navTitle, { color: theme.text }]}>Quick Quiz</Text>
            </View>
            <TouchableOpacity
              style={[styles.navIconBtn, { backgroundColor: theme.primary + '15' }]}
              onPress={toggleTheme}
            >
              <Ionicons name={isDarkMode ? "sunny" : "moon"} size={18} color={theme.primary} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        <Animated.ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <View style={[styles.heroContent, { backgroundColor: theme.background }]}>
              <BackgroundBlur style={styles.blurTop} color={theme.primary} />

              <View style={styles.heroHeader}>
                <TouchableOpacity
                  style={[styles.backCircle, { backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1 }]}
                  onPress={() => navigation.goBack()}
                >
                  <Ionicons name="chevron-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.themeToggle, { backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1 }]}
                  onPress={toggleTheme}
                >
                  <Ionicons name={isDarkMode ? "sunny" : "moon"} size={20} color={theme.text} />
                </TouchableOpacity>
              </View>

              <View style={styles.greetingSection}>
                <Text style={[styles.greetingSubtitle, { color: theme.primary }]}>CHALLENGE YOURSELF</Text>
                <Text style={[styles.greetingTitle, { color: theme.text }]}>Quick Quiz</Text>
                <Text style={[styles.heroDescription, { color: theme.textSecondary }]}>
                  Test your French skills across various topics and earn XP to level up!
                </Text>
              </View>
            </View>
          </View>

          {/* Stats Summary */}
          <View style={styles.contentBody}>
            <View style={[styles.statsOverview, { backgroundColor: theme.surface, borderColor: theme.border }, themeShadows.md]}>
              <View style={styles.overviewItem}>
                <Text style={[styles.overviewValue, { color: theme.text }]}>48</Text>
                <Text style={[styles.overviewLabel, { color: theme.textSecondary }]}>Questions</Text>
              </View>
              <View style={[styles.overviewDivider, { backgroundColor: theme.border }]} />
              <View style={styles.overviewItem}>
                <Text style={[styles.overviewValue, { color: theme.text }]}>8</Text>
                <Text style={[styles.overviewLabel, { color: theme.textSecondary }]}>Levels</Text>
              </View>
              <View style={[styles.overviewDivider, { backgroundColor: theme.border }]} />
              <View style={styles.overviewItem}>
                <Text style={[styles.overviewValue, { color: theme.text }]}>100%</Text>
                <Text style={[styles.overviewLabel, { color: theme.textSecondary }]}>Free</Text>
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <View style={[styles.titleAccent, { backgroundColor: theme.primary }]} />
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Choose a Category</Text>
              </View>
            </View>

            <View style={styles.categoryGrid}>
              {QUIZ_CATEGORIES.map((category, index) => (
                <Animated.View
                  key={category.id}
                  style={[
                    styles.categoryWrapper,
                    {
                      opacity: fadeAnim,
                      transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
                    }
                  ]}
                >
                  <TouchableOpacity
                    style={[styles.categoryCard, { backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1 }, themeShadows.sm]}
                    onPress={() => startQuiz(category.id)}
                    activeOpacity={0.9}
                  >
                    <LinearGradient
                      colors={category.gradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.categoryIconWrap}
                    >
                      <Ionicons name={category.icon} size={28} color="#FFFFFF" />
                    </LinearGradient>
                    <View style={styles.categoryInfo}>
                      <Text style={[styles.categoryName, { color: theme.text }]}>{category.name}</Text>
                      <Text style={[styles.categoryDetails, { color: theme.textSecondary }]}>6 Questions</Text>
                    </View>
                    <View style={[styles.playCircle, { backgroundColor: theme.primary + '10' }]}>
                      <Ionicons name="play" size={16} color={theme.primary} />
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>

            <View style={{ height: 100 }} />
          </View>
        </Animated.ScrollView>
      </View>
    );
  }

  if (quizCompleted) {
    const percentage = (score / questions.length) * 100;
    const categoryInfo = getCategoryInfo();

    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <StatusBar barStyle="light-content" />

        <LinearGradient
          colors={percentage >= 70 ? [theme.success, theme.primary] : [theme.primary, theme.primaryLight]}
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

          <View style={[styles.scoreCard, { backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1 }, themeShadows.md]}>
            <View style={styles.scoreRow}>
              <View style={styles.scoreItem}>
                <Text style={[styles.scoreLabel, { color: theme.textSecondary }]}>Score</Text>
                <Text style={[styles.scoreValue, { color: theme.text }]}>{score}/{questions.length}</Text>
              </View>
              <View style={[styles.scoreDivider, { backgroundColor: theme.border }]} />
              <View style={styles.scoreItem}>
                <Text style={[styles.scoreLabel, { color: theme.textSecondary }]}>Accuracy</Text>
                <Text style={[styles.scoreValue, { color: percentage >= 70 ? theme.success : theme.text }]}>
                  {percentage.toFixed(0)}%
                </Text>
              </View>
              <View style={[styles.scoreDivider, { backgroundColor: theme.border }]} />
              <View style={styles.scoreItem}>
                <Text style={[styles.scoreLabel, { color: theme.textSecondary }]}>Time</Text>
                <Text style={[styles.scoreValue, { color: theme.text }]}>{formatTime(timeElapsed)}</Text>
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
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                    borderWidth: 1,
                    borderLeftColor: isCorrect ? theme.success : theme.error,
                    borderLeftWidth: 4,
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
                      color={isCorrect ? theme.success : theme.error}
                    />
                  </View>
                  <Text style={[styles.reviewQuestion, { color: theme.text }]} numberOfLines={2}>
                    {question.question}
                  </Text>
                </View>
                <Text style={[styles.reviewAnswer, { color: theme.textSecondary }]}>
                  Your answer: {question.options[userAnswer?.answer]}
                </Text>
                {!isCorrect && (
                  <Text style={[styles.reviewCorrect, { color: theme.success }]}>
                    Correct: {question.options[question.correct]}
                  </Text>
                )}
              </View>
            );
          })}

          <View style={styles.resultActions}>
            <TouchableOpacity
              style={[styles.retryBtn, { backgroundColor: theme.surfaceAlt, borderColor: theme.border, borderWidth: 1 }]}
              onPress={() => startQuiz(selectedCategory)}
            >
              <Ionicons name="refresh" size={22} color={theme.text} />
              <Text style={[styles.retryBtnText, { color: theme.text }]}>Retry Quiz</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.newQuizBtn}
              onPress={() => setSelectedCategory(null)}
            >
              <LinearGradient
                colors={[theme.primary, theme.primaryLight]}
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
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" />

      <LinearGradient
        colors={categoryInfo?.gradient || [theme.primary, theme.primaryLight]}
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
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', '100%'],
                  })
                }
              ]}
            />
          </View>
        </View>

        {streak >= 2 && (
          <View style={styles.streakBadge}>
            <Ionicons name="flame" size={18} color={theme.secondary} />
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
              backgroundColor: theme.surface,
              borderColor: theme.border,
              borderWidth: 1,
              transform: [{ translateX: shakeAnim }]
            },
            themeShadows.md
          ]}
        >
          <View style={styles.questionNumber}>
            <Text style={styles.questionNumberText}>Q{currentQuestionIndex + 1}</Text>
          </View>
          <Text style={[styles.questionText, { color: theme.text }]}>
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
                      backgroundColor: theme.surface,
                      borderColor: showCorrect ? theme.success : showWrong ? theme.error : isSelected ? theme.primary : theme.border,
                      borderWidth: showCorrect || showWrong || isSelected ? 2 : 1,
                    },
                    isSelected && !showResult ? themeShadows.md : themeShadows.sm
                  ]}
                  onPress={() => handleAnswer(index)}
                  disabled={showResult}
                  activeOpacity={0.8}
                >
                  <View style={[
                    styles.optionLetter,
                    {
                      backgroundColor: showCorrect ? theme.success : showWrong ? theme.error : isSelected ? theme.primary : theme.surfaceAlt,
                    }
                  ]}>
                    <Text style={[
                      styles.optionLetterText,
                      { color: showCorrect || showWrong || isSelected ? '#FFFFFF' : theme.text }
                    ]}>
                      {String.fromCharCode(65 + index)}
                    </Text>
                  </View>
                  <Text style={[styles.optionText, { color: theme.text }]}>
                    {option}
                  </Text>
                  {showCorrect && (
                    <Ionicons name="checkmark-circle" size={24} color={theme.success} />
                  )}
                  {showWrong && (
                    <Ionicons name="close-circle" size={24} color={theme.error} />
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
                backgroundColor: theme.surface,
                borderColor: theme.border,
                borderWidth: 1,
                borderLeftColor: selectedAnswer === currentQuestion.correct ? theme.success : theme.error,
                borderLeftWidth: 4,
              },
              themeShadows.md
            ]}
          >
            <View style={styles.explanationHeader}>
              <Ionicons
                name={selectedAnswer === currentQuestion.correct ? 'bulb' : 'information-circle'}
                size={22}
                color={selectedAnswer === currentQuestion.correct ? theme.success : theme.secondary}
              />
              <Text style={[styles.explanationTitle, { color: theme.text }]}>
                {selectedAnswer === currentQuestion.correct ? 'Correct!' : 'Explanation'}
              </Text>
            </View>
            <Text style={[styles.explanationText, { color: theme.textSecondary }]}>
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
              colors={[theme.primary, theme.primaryLight]}
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
  floatingNavBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 100 : 80,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    zIndex: 1000,
    borderBottomWidth: 1,
  },
  navBarContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  navBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  navBackBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  navIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  heroSection: {
    overflow: 'hidden',
  },
  heroContent: {
    paddingTop: Platform.OS === 'ios' ? 70 : 55,
    paddingBottom: 20,
    paddingHorizontal: 24,
  },
  blurTop: {
    top: -150,
    right: -100,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 26,
  },
  backCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeToggle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greetingSection: {
    marginBottom: 20,
  },
  greetingSubtitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  greetingTitle: {
    fontSize: 32,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    marginBottom: 12,
  },
  heroDescription: {
    fontSize: 16,
    lineHeight: 24,
  },
  contentBody: {
    paddingHorizontal: 20,
  },
  statsOverview: {
    flexDirection: 'row',
    padding: 20,
    borderRadius: 24,
    marginBottom: 32,
    marginTop: 10,
    borderWidth: 1,
  },
  overviewItem: {
    flex: 1,
    alignItems: 'center',
  },
  overviewValue: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  overviewLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  overviewDivider: {
    width: 1,
    height: '60%',
    alignSelf: 'center',
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  titleAccent: {
    width: 4,
    height: 24,
    borderRadius: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  categoryGrid: {
    flexDirection: 'column',
    gap: 16,
  },
  categoryWrapper: {
    width: '100%',
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
  },
  categoryIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryInfo: {
    flex: 1,
    marginLeft: 16,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  categoryDetails: {
    fontSize: 14,
  },
  playCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quizHeader: {
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  quizHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  quizBackBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    borderRadius: 12,
    gap: 6,
  },
  timerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
  },
  streakBadge: {
    position: 'absolute',
    bottom: -16,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  streakText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FF9500',
  },
  quizScroll: {
    flex: 1,
  },
  quizContent: {
    padding: 24,
    paddingTop: 40,
  },
  questionCard: {
    padding: 24,
    borderRadius: 24,
    marginBottom: 32,
  },
  questionNumber: {
    marginBottom: 12,
  },
  questionNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8A94A6',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  questionText: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 32,
  },
  optionsContainer: {
    gap: 16,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    gap: 16,
  },
  optionLetter: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLetterText: {
    fontSize: 18,
    fontWeight: '700',
  },
  optionText: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
  },
  explanationCard: {
    padding: 20,
    borderRadius: 24,
    marginTop: 32,
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  explanationTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  explanationText: {
    fontSize: 16,
    lineHeight: 24,
  },
  resultHeader: {
    paddingTop: Platform.OS === 'ios' ? 70 : 60,
    paddingBottom: 60,
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
    marginBottom: 24,
  },
  resultIconGlow: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  resultTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    marginBottom: 8,
  },
  resultSubtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
  },
  resultScroll: {
    flex: 1,
  },
  resultContent: {
    padding: 24,
    paddingTop: 0,
    marginTop: -30,
  },
  scoreCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 32,
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
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 28,
    fontWeight: '800',
  },
  scoreDivider: {
    width: 1,
    height: 50,
  },
  reviewTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  reviewCard: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  reviewBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewQuestion: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 24,
  },
  reviewAnswer: {
    fontSize: 15,
    marginLeft: 44,
  },
  reviewCorrect: {
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 44,
    marginTop: 6,
  },
  resultActions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 40,
    marginBottom: 40,
  },
  retryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 20,
    gap: 8,
  },
  retryBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },
  newQuizBtn: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  newQuizGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 8,
  },
  newQuizBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  nextBtn: {
    marginTop: 24,
    borderRadius: 16,
    overflow: 'hidden',
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
});
