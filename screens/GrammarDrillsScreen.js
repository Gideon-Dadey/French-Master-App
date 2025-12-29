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
  Easing,
  Vibration,
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
    zIndex: -1,
  }]} />
);

const GRAMMAR_CATEGORIES = [
  { id: 'articles', name: 'Articles', icon: 'newspaper', color: '#3B82F6', gradient: ['#3B82F6', '#1D4ED8'], desc: 'Le, La, Les, Un, Une' },
  { id: 'verbs_present', name: 'Present Tense', icon: 'time', color: '#10B981', gradient: ['#10B981', '#059669'], desc: 'Être, Avoir, Aller...' },
  { id: 'verbs_past', name: 'Past Tense', icon: 'hourglass', color: '#8B5CF6', gradient: ['#8B5CF6', '#7C3AED'], desc: 'Passé Composé' },
  { id: 'adjectives', name: 'Adjectives', icon: 'color-palette', color: '#F43F5E', gradient: ['#F43F5E', '#E11D48'], desc: 'Agreement & Position' },
  { id: 'pronouns', name: 'Pronouns', icon: 'person', color: '#F59E0B', gradient: ['#F59E0B', '#D97706'], desc: 'Subject & Object' },
  { id: 'negation', name: 'Negation', icon: 'close-circle', color: '#EF4444', gradient: ['#EF4444', '#DC2626'], desc: 'Ne...pas, Ne...jamais' },
  { id: 'questions', name: 'Questions', icon: 'help-circle', color: '#06B6D4', gradient: ['#06B6D4', '#0891B2'], desc: 'Question Formation' },
  { id: 'prepositions', name: 'Prepositions', icon: 'navigate', color: '#EC4899', gradient: ['#EC4899', '#DB2777'], desc: 'À, De, En, Dans...' },
];

const GRAMMAR_DRILLS = {
  articles: [
    {
      id: 'a1',
      question: 'Complete: "___ livre est sur la table."',
      hint: 'The book is on the table.',
      options: ['Le', 'La', 'Les', 'Un'],
      correct: 0,
      explanation: '"Le" is the masculine singular definite article. "Livre" (book) is masculine.',
    },
    {
      id: 'a2',
      question: 'Complete: "J\'achète ___ pommes."',
      hint: 'I\'m buying some apples.',
      options: ['le', 'la', 'des', 'du'],
      correct: 2,
      explanation: '"Des" is used for plural indefinite articles - "some apples".',
    },
    {
      id: 'a3',
      question: 'Complete: "___ eau est froide."',
      hint: 'The water is cold.',
      options: ['Le', 'La', 'L\'', 'Les'],
      correct: 2,
      explanation: '"L\'" is used before vowels. "Eau" (water) is feminine and starts with a vowel.',
    },
    {
      id: 'a4',
      question: 'Complete: "Je veux ___ café."',
      hint: 'I want some coffee.',
      options: ['le', 'la', 'du', 'de la'],
      correct: 2,
      explanation: '"Du" is the partitive article for masculine nouns - "some coffee".',
    },
    {
      id: 'a5',
      question: 'Complete: "___ fille est intelligente."',
      hint: 'The girl is intelligent.',
      options: ['Le', 'La', 'Les', 'Un'],
      correct: 1,
      explanation: '"La" is the feminine singular definite article. "Fille" (girl) is feminine.',
    },
    {
      id: 'a6',
      question: 'Complete: "Il n\'a pas ___ argent."',
      hint: 'He doesn\'t have any money.',
      options: ['de l\'', 'd\'', 'du', 'le'],
      correct: 1,
      explanation: 'After negation, partitive articles become "de" or "d\'" before vowels.',
    },
  ],
  verbs_present: [
    {
      id: 'vp1',
      question: 'Complete: "Nous ___ français."',
      hint: 'We speak French.',
      options: ['parle', 'parles', 'parlons', 'parlez'],
      correct: 2,
      explanation: '"Parlons" is the "nous" (we) form of "parler" - first person plural.',
    },
    {
      id: 'vp2',
      question: 'Complete: "Tu ___ à l\'école."',
      hint: 'You go to school.',
      options: ['va', 'vas', 'vais', 'allez'],
      correct: 1,
      explanation: '"Vas" is the "tu" (you informal) form of "aller" - second person singular.',
    },
    {
      id: 'vp3',
      question: 'Complete: "Ils ___ la télévision."',
      hint: 'They watch television.',
      options: ['regarde', 'regardes', 'regardons', 'regardent'],
      correct: 3,
      explanation: '"Regardent" is the "ils/elles" (they) form of "regarder" - third person plural.',
    },
    {
      id: 'vp4',
      question: 'Complete: "Je ___ un étudiant."',
      hint: 'I am a student.',
      options: ['suis', 'es', 'est', 'sommes'],
      correct: 0,
      explanation: '"Suis" is the "je" (I) form of "être" - first person singular.',
    },
    {
      id: 'vp5',
      question: 'Complete: "Elle ___ 20 ans."',
      hint: 'She is 20 years old.',
      options: ['est', 'a', 'as', 'ai'],
      correct: 1,
      explanation: 'In French, we use "avoir" (to have) for age. "Elle a 20 ans" = She has 20 years.',
    },
    {
      id: 'vp6',
      question: 'Complete: "Vous ___ très gentils."',
      hint: 'You are very kind.',
      options: ['es', 'est', 'sommes', 'êtes'],
      correct: 3,
      explanation: '"Êtes" is the "vous" (you formal/plural) form of "être".',
    },
  ],
  verbs_past: [
    {
      id: 'vpa1',
      question: 'Complete: "J\' ___ mangé."',
      hint: 'I ate.',
      options: ['ai', 'suis', 'as', 'a'],
      correct: 0,
      explanation: '"Manger" uses "avoir" in passé composé. "J\'ai mangé" = I ate.',
    },
    {
      id: 'vpa2',
      question: 'Complete: "Elle ___ allée à Paris."',
      hint: 'She went to Paris.',
      options: ['a', 'est', 'ai', 'as'],
      correct: 1,
      explanation: '"Aller" uses "être" in passé composé. The past participle agrees with the subject.',
    },
    {
      id: 'vpa3',
      question: 'Complete: "Nous avons ___ le film."',
      hint: 'We watched the film.',
      options: ['regardé', 'regardée', 'regardés', 'regarder'],
      correct: 0,
      explanation: 'With "avoir", the past participle doesn\'t agree with the subject (no -s/-e).',
    },
    {
      id: 'vpa4',
      question: 'Complete: "Ils sont ___ tôt."',
      hint: 'They arrived early.',
      options: ['arrivé', 'arrivée', 'arrivés', 'arriver'],
      correct: 2,
      explanation: 'With "être", the past participle agrees. "Ils" (masculine plural) = "arrivés".',
    },
    {
      id: 'vpa5',
      question: 'Complete: "Elle s\'est ___."',
      hint: 'She woke up.',
      options: ['réveillé', 'réveillée', 'réveillés', 'réveiller'],
      correct: 1,
      explanation: 'Reflexive verbs use "être". Feminine singular agreement = "réveillée".',
    },
    {
      id: 'vpa6',
      question: 'Complete: "Tu as ___ la vérité."',
      hint: 'You told the truth.',
      options: ['dit', 'dis', 'dire', 'dites'],
      correct: 0,
      explanation: '"Dit" is the past participle of "dire" (to say/tell).',
    },
  ],
  adjectives: [
    {
      id: 'adj1',
      question: 'Complete: "La maison est ___."',
      hint: 'The house is big.',
      options: ['grand', 'grande', 'grands', 'grandes'],
      correct: 1,
      explanation: '"Maison" is feminine, so the adjective agrees: "grande".',
    },
    {
      id: 'adj2',
      question: 'Complete: "Les filles sont ___."',
      hint: 'The girls are happy.',
      options: ['heureux', 'heureuse', 'heureux', 'heureuses'],
      correct: 3,
      explanation: '"Filles" is feminine plural, so the adjective is "heureuses".',
    },
    {
      id: 'adj3',
      question: 'Complete: "C\'est une ___ idée."',
      hint: 'It\'s a good idea.',
      options: ['bon', 'bonne', 'bons', 'bien'],
      correct: 1,
      explanation: '"Idée" is feminine. "Bon" becomes "bonne" in feminine form.',
    },
    {
      id: 'adj4',
      question: 'Complete: "J\'ai un ___ ami."',
      hint: 'I have a good friend.',
      options: ['bon', 'bonne', 'bien', 'beau'],
      correct: 0,
      explanation: '"Ami" is masculine. "Bon" stays as "bon" in masculine singular.',
    },
    {
      id: 'adj5',
      question: 'Where does the adjective go? "une ___ voiture ___"',
      hint: 'A red car.',
      options: ['rouge / --', '-- / rouge', 'rouges / --', '-- / rouges'],
      correct: 1,
      explanation: 'Most adjectives in French come AFTER the noun: "une voiture rouge".',
    },
    {
      id: 'adj6',
      question: 'Complete: "C\'est un ___ homme."',
      hint: 'He\'s a handsome man.',
      options: ['beau', 'bel', 'belle', 'beaux'],
      correct: 1,
      explanation: 'Before a masculine noun starting with a vowel or silent h, "beau" becomes "bel".',
    },
  ],
  pronouns: [
    {
      id: 'pr1',
      question: 'Complete: "Je ___ aime."',
      hint: 'I love him/her/it.',
      options: ['le', 'la', 'l\'', 'les'],
      correct: 2,
      explanation: 'Before a vowel (aime), "le" or "la" becomes "l\'".',
    },
    {
      id: 'pr2',
      question: 'Complete: "Il ___ parle."',
      hint: 'He talks to me.',
      options: ['me', 'te', 'lui', 'leur'],
      correct: 0,
      explanation: '"Me" is the first person indirect object pronoun - "to me".',
    },
    {
      id: 'pr3',
      question: 'Complete: "Je ___ donne le livre."',
      hint: 'I give them the book.',
      options: ['les', 'leur', 'lui', 'eux'],
      correct: 1,
      explanation: '"Leur" is the indirect object pronoun for "to them".',
    },
    {
      id: 'pr4',
      question: 'Complete: "Tu ___ connais?"',
      hint: 'Do you know them?',
      options: ['leur', 'les', 'lui', 'le'],
      correct: 1,
      explanation: '"Les" is the direct object pronoun for "them" (connaître takes direct object).',
    },
    {
      id: 'pr5',
      question: 'Complete: "___ sommes français."',
      hint: 'We are French.',
      options: ['Je', 'Tu', 'Nous', 'Ils'],
      correct: 2,
      explanation: '"Nous" means "we" and uses "sommes" from être.',
    },
    {
      id: 'pr6',
      question: 'Complete: "C\'est pour ___."',
      hint: 'It\'s for you.',
      options: ['tu', 'te', 'toi', 'vous'],
      correct: 2,
      explanation: 'After prepositions, use stressed pronouns: "toi" (informal you).',
    },
  ],
  negation: [
    {
      id: 'n1',
      question: 'Complete: "Je ___ parle ___ français."',
      hint: 'I don\'t speak French.',
      options: ['ne...pas', 'pas...ne', 'ne...plus', 'ne...rien'],
      correct: 0,
      explanation: '"Ne...pas" is the basic negation structure - "ne" before verb, "pas" after.',
    },
    {
      id: 'n2',
      question: 'Complete: "Il ___ mange ___ viande."',
      hint: 'He never eats meat.',
      options: ['ne...pas', 'ne...plus', 'ne...jamais', 'ne...rien'],
      correct: 2,
      explanation: '"Ne...jamais" means "never". It replaces "pas" in the negation.',
    },
    {
      id: 'n3',
      question: 'Complete: "Elle ___ travaille ___."',
      hint: 'She no longer works.',
      options: ['ne...pas', 'ne...plus', 'ne...jamais', 'ne...rien'],
      correct: 1,
      explanation: '"Ne...plus" means "no longer" or "no more".',
    },
    {
      id: 'n4',
      question: 'Complete: "Je ___ vois ___."',
      hint: 'I don\'t see anything.',
      options: ['ne...pas', 'ne...plus', 'ne...jamais', 'ne...rien'],
      correct: 3,
      explanation: '"Ne...rien" means "nothing" or "not anything".',
    },
    {
      id: 'n5',
      question: 'Complete: "Il n\'y a ___ ici."',
      hint: 'There\'s nobody here.',
      options: ['pas', 'personne', 'rien', 'plus'],
      correct: 1,
      explanation: '"Ne...personne" means "nobody" or "no one".',
    },
    {
      id: 'n6',
      question: 'Complete: "Je n\'ai ___ argent ___ temps."',
      hint: 'I have neither money nor time.',
      options: ['pas...pas', 'ni...ni', 'ne...ne', 'plus...plus'],
      correct: 1,
      explanation: '"Ne...ni...ni" means "neither...nor".',
    },
  ],
  questions: [
    {
      id: 'q1',
      question: 'Form: "You speak French?" (formal)',
      hint: 'Est-ce que structure',
      options: ['Tu parles français?', 'Est-ce que tu parles français?', 'Parles-tu français?', 'Français tu parles?'],
      correct: 1,
      explanation: '"Est-ce que" is a common way to form yes/no questions.',
    },
    {
      id: 'q2',
      question: 'Complete: "___ est ton nom?"',
      hint: 'What is your name?',
      options: ['Qui', 'Quoi', 'Quel', 'Où'],
      correct: 2,
      explanation: '"Quel" means "what" when asking about specific things. It agrees with the noun.',
    },
    {
      id: 'q3',
      question: 'Complete: "___ habites-tu?"',
      hint: 'Where do you live?',
      options: ['Qui', 'Quand', 'Où', 'Comment'],
      correct: 2,
      explanation: '"Où" means "where" in French.',
    },
    {
      id: 'q4',
      question: 'Complete: "___ tu fais?"',
      hint: 'What are you doing?',
      options: ['Qu\'est-ce que', 'Est-ce que', 'Qui est-ce que', 'Où est-ce que'],
      correct: 0,
      explanation: '"Qu\'est-ce que" means "what" (as object of the sentence).',
    },
    {
      id: 'q5',
      question: 'Complete: "___ vient ce soir?"',
      hint: 'Who is coming tonight?',
      options: ['Que', 'Qui', 'Quoi', 'Quel'],
      correct: 1,
      explanation: '"Qui" means "who" when asking about people.',
    },
    {
      id: 'q6',
      question: 'Complete: "___ coûte ce livre?"',
      hint: 'How much does this book cost?',
      options: ['Comment', 'Combien', 'Pourquoi', 'Quand'],
      correct: 1,
      explanation: '"Combien" means "how much" or "how many".',
    },
  ],
  prepositions: [
    {
      id: 'pp1',
      question: 'Complete: "Je vais ___ Paris."',
      hint: 'I\'m going to Paris.',
      options: ['à', 'en', 'dans', 'au'],
      correct: 0,
      explanation: '"À" is used for cities. "Je vais à Paris".',
    },
    {
      id: 'pp2',
      question: 'Complete: "Elle habite ___ France."',
      hint: 'She lives in France.',
      options: ['à', 'en', 'au', 'dans'],
      correct: 1,
      explanation: '"En" is used for feminine countries. France is feminine.',
    },
    {
      id: 'pp3',
      question: 'Complete: "Il travaille ___ Canada."',
      hint: 'He works in Canada.',
      options: ['en', 'à', 'au', 'dans'],
      correct: 2,
      explanation: '"Au" (à + le) is used for masculine countries. Canada is masculine.',
    },
    {
      id: 'pp4',
      question: 'Complete: "Le livre est ___ la table."',
      hint: 'The book is on the table.',
      options: ['à', 'sur', 'dans', 'sous'],
      correct: 1,
      explanation: '"Sur" means "on" (on top of something).',
    },
    {
      id: 'pp5',
      question: 'Complete: "Je viens ___ Japon."',
      hint: 'I come from Japan.',
      options: ['de', 'du', 'de la', 'des'],
      correct: 1,
      explanation: '"Du" (de + le) is used with masculine countries. Japan is masculine.',
    },
    {
      id: 'pp6',
      question: 'Complete: "C\'est le livre ___ Marie."',
      hint: 'It\'s Marie\'s book.',
      options: ['à', 'de', 'pour', 'avec'],
      correct: 1,
      explanation: '"De" shows possession in French - "the book of Marie".',
    },
  ],
};

export default function GrammarDrillsScreen({ navigation }) {
  const { colors, isDarkMode } = useTheme();
  const { awardXP } = useGamification();

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [drillCompleted, setDrillCompleted] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [startTime, setStartTime] = useState(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const optionAnims = useRef([...Array(4)].map(() => new Animated.Value(0))).current;
  const correctAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const theme = getThemeColors(isDarkMode);

  const questions = selectedCategory ? GRAMMAR_DRILLS[selectedCategory] : [];
  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  useEffect(() => {
    let timer;
    if (startTime && !drillCompleted) {
      timer = setInterval(() => {
        setTimeElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [startTime, drillCompleted]);

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
          delay: index * 80,
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

  useEffect(() => {
    if (streak >= 2) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.1, duration: 500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [streak]);

  const startDrill = (categoryId) => {
    setSelectedCategory(categoryId);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setAnswers([]);
    setStreak(0);
    setMaxStreak(0);
    setDrillCompleted(false);
    setTimeElapsed(0);
    setStartTime(Date.now());
  };

  const handleAnswer = (index) => {
    if (showResult) return;

    setSelectedAnswer(index);
    const isCorrect = index === currentQuestion.correct;

    if (isCorrect) {
      Animated.sequence([
        Animated.timing(correctAnim, { toValue: 1.2, duration: 150, useNativeDriver: true }),
        Animated.timing(correctAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]).start();
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > maxStreak) setMaxStreak(newStreak);
      setScore(score + 1);
    } else {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 15, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -15, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
      setStreak(0);
    }

    setAnswers([...answers, { questionIndex: currentQuestionIndex, answer: index, isCorrect }]);
    setTimeout(() => setShowResult(true), 400);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      finishDrill();
    }
  };

  const finishDrill = () => {
    setDrillCompleted(true);
    const percentage = (score / questions.length) * 100;

    if (percentage >= 90) {
      awardXP(120, 'Grammar Master! 🏆');
    } else if (percentage >= 70) {
      awardXP(60, 'Excellent grammar skills! ⭐');
    } else if (percentage >= 50) {
      awardXP(30, 'Good grammar practice!');
    } else {
      awardXP(15, 'Grammar drill completed!');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCategoryInfo = () => GRAMMAR_CATEGORIES.find(c => c.id === selectedCategory);

  if (!selectedCategory) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <StatusBar style={isDarkMode ? 'light' : 'dark'} />
        <BackgroundBlur style={{ top: -100, right: -100 }} color={theme.primary} size={400} />
        <BackgroundBlur style={{ bottom: -50, left: -50 }} color={theme.secondary} size={300} />

        <LinearGradient
          colors={[theme.primary, theme.primaryDark]}
          style={styles.categoryHeader}
        >
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <Animated.View
            style={[
              styles.headerContent,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}
          >
            <View style={[styles.headerIconWrap, { backgroundColor: theme.secondary + '20' }]}>
              <Ionicons name="school" size={42} color={theme.secondary} />
            </View>
            <Text style={styles.headerTitle}>Grammar Drills</Text>
            <Text style={styles.headerSubtitle}>
              Master French grammar with interactive exercises
            </Text>

            <View style={styles.quickStatsRow}>
              <View style={styles.quickStat}>
                <Text style={styles.quickStatValue}>48</Text>
                <Text style={styles.quickStatLabel}>Exercises</Text>
              </View>
              <View style={styles.quickStatDivider} />
              <View style={styles.quickStat}>
                <Text style={styles.quickStatValue}>8</Text>
                <Text style={styles.quickStatLabel}>Topics</Text>
              </View>
              <View style={styles.quickStatDivider} />
              <View style={styles.quickStat}>
                <Ionicons name="infinite" size={22} color="#FFFFFF" />
                <Text style={styles.quickStatLabel}>Practice</Text>
              </View>
            </View>
          </Animated.View>
        </LinearGradient>

        <ScrollView
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Choose a Topic</Text>
          <View style={styles.categoryGrid}>
            {GRAMMAR_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryCard,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                  themeShadows.sm
                ]}
                onPress={() => startDrill(category.id)}
              >
                <LinearGradient
                  colors={[category.gradient[0], category.gradient[1]]}
                  style={styles.categoryIconWrap}
                >
                  <Ionicons name={category.icon} size={28} color="#FFFFFF" />
                </LinearGradient>
                <View style={styles.categoryInfo}>
                  <Text style={[styles.categoryName, { color: theme.text }]}>{category.name}</Text>
                  <Text style={[styles.categoryDesc, { color: theme.textSecondary }]}>{category.desc}</Text>
                </View>
                <View style={[styles.categoryAction, { backgroundColor: theme.background }]}>
                  <Ionicons name="chevron-forward" size={18} color={theme.secondary} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    );
  }

  if (drillCompleted) {
    const percentage = (score / questions.length) * 100;
    const categoryInfo = getCategoryInfo();

    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <StatusBar style="light" />
        <BackgroundBlur style={{ top: -100, left: -50 }} color={theme.secondary} size={400} />

        <LinearGradient
          colors={percentage >= 70 ? [theme.primary, theme.primaryDark] : [theme.primary, '#2C3E50']}
          style={styles.resultHeader}
        >
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => setSelectedCategory(null)}
          >
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.resultIconContainer}>
            <View style={[styles.resultIconInner, { backgroundColor: theme.secondary + '20' }]}>
              <Text style={styles.resultEmoji}>
                {percentage >= 90 ? '🏆' : percentage >= 70 ? '⭐' : percentage >= 50 ? '📚' : '💪'}
              </Text>
            </View>
          </View>

          <Text style={[styles.resultTitle, { color: '#FFFFFF' }]}>
            {percentage >= 90 ? 'Parfait!' : percentage >= 70 ? 'Très Bien!' : percentage >= 50 ? 'Bon Effort!' : 'Keep Going!'}
          </Text>
          <Text style={[styles.resultSubtitle, { color: 'rgba(255,255,255,0.8)' }]}>
            {categoryInfo?.name} Complete
          </Text>

          <View style={[styles.xpEarnedBadge, { backgroundColor: theme.secondary }]}>
            <Ionicons name="star" size={16} color="#FFFFFF" />
            <Text style={styles.xpEarnedText}>
              +{percentage >= 90 ? 120 : percentage >= 70 ? 60 : percentage >= 50 ? 30 : 15} XP
            </Text>
          </View>
        </LinearGradient>

        <ScrollView
          style={styles.resultScroll}
          contentContainerStyle={styles.resultContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.scoreCard, { backgroundColor: theme.surface, borderColor: theme.border }, themeShadows.md]}>
            <View style={styles.scoreCircle}>
              <Text style={[styles.scoreValue, { color: theme.primary }]}>{score}/{questions.length}</Text>
              <Text style={[styles.scoreLabel, { color: theme.textSecondary }]}>Correct</Text>
            </View>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.text }]}>{percentage.toFixed(0)}%</Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Accuracy</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.text }]}>{maxStreak}</Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Best Streak</Text>
              </View>
            </View>
          </View>

          <Text style={[styles.reviewTitle, { color: theme.text }]}>Question Review</Text>
          {questions.map((question, index) => {
            const userAnswer = answers.find(ua => ua.questionIndex === index);
            const isCorrect = userAnswer?.isCorrect;

            return (
              <View
                key={index}
                style={[
                  styles.reviewCard,
                  {
                    backgroundColor: theme.surface,
                    borderColor: isCorrect ? theme.success + '40' : theme.error + '40',
                    borderLeftColor: isCorrect ? theme.success : theme.error
                  },
                  themeShadows.sm
                ]}
              >
                <Text style={[styles.reviewQuestion, { color: theme.text }]}>{question.question}</Text>
                <Text style={[styles.reviewAnswer, { color: isCorrect ? theme.success : theme.error }]}>
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
              style={[styles.retryBtn, { backgroundColor: theme.background, borderColor: theme.border }]}
              onPress={() => startDrill(selectedCategory)}
            >
              <Ionicons name="refresh" size={22} color={theme.text} />
              <Text style={[styles.retryBtnText, { color: theme.text }]}>Retry</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.newDrillBtn}
              onPress={() => setSelectedCategory(null)}
            >
              <LinearGradient
                colors={[theme.secondary, '#B8860B']}
                style={styles.newDrillGradient}
              >
                <Ionicons name="grid" size={22} color="#FFFFFF" />
                <Text style={styles.newDrillBtnText}>New Topic</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    );
  }
  const categoryInfo = getCategoryInfo();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <BackgroundBlur style={{ top: -50, left: -100 }} color={theme.primary} size={400} />

      <LinearGradient
        colors={[theme.primary, theme.primaryDark]}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => setSelectedCategory(null)}
          >
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.drillHeaderTitle}>{categoryInfo.name}</Text>
            <View style={styles.drillHeaderRow}>
              <View style={styles.timerChip}>
                <Ionicons name="time-outline" size={14} color="#FFFFFF" />
                <Text style={styles.timerText}>{formatTime(timeElapsed)}</Text>
              </View>
              <View style={styles.scoreChip}>
                <Ionicons name="star" size={14} color={theme.secondary} />
                <Text style={styles.scoreText}>{score} / {questions.length}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', '100%'],
                  }),
                  backgroundColor: theme.secondary,
                },
              ]}
            />
          </View>
          <Text style={styles.progressCounter}>
            Question {currentQuestionIndex + 1} of {questions.length}
          </Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.drillScrollView}
        contentContainerStyle={styles.drillContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.questionCard,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
              transform: [{ scale: scaleAnim }, { translateX: shakeAnim }],
            },
            themeShadows.lg,
          ]}
        >
          <View style={styles.questionHeader}>
            <View style={[styles.typeBadge, { backgroundColor: theme.primary + '10' }]}>
              <Text style={[styles.typeText, { color: theme.primary }]}>Grammar Rule</Text>
            </View>
            <TouchableOpacity onPress={() => {/* Show hint */ }}>
              <Ionicons name="bulb-outline" size={22} color={theme.secondary} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.questionText, { color: theme.text }]}>
            {currentQuestion.question}
          </Text>

          {currentQuestion.hint && (
            <View style={[styles.hintContainer, { backgroundColor: theme.background }]}>
              <Ionicons name="language-outline" size={16} color={theme.textSecondary} />
              <Text style={[styles.hintText, { color: theme.textSecondary }]}>
                {currentQuestion.hint}
              </Text>
            </View>
          )}

          <View style={styles.optionsGrid}>
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = index === currentQuestion.correct;
              const showCheck = showResult && isCorrect;
              const showError = showResult && isSelected && !isCorrect;

              return (
                <Animated.View
                  key={index}
                  style={{ opacity: optionAnims[index], transform: [{ scale: optionAnims[index] }] }}
                >
                  <TouchableOpacity
                    style={[
                      styles.optionButton,
                      {
                        backgroundColor: showCheck
                          ? theme.success + '15'
                          : showError
                            ? theme.error + '15'
                            : isSelected
                              ? theme.primary
                              : theme.background,
                        borderColor: showCheck
                          ? theme.success
                          : showError
                            ? theme.error
                            : isSelected
                              ? theme.primary
                              : theme.border,
                      },
                    ]}
                    onPress={() => handleAnswer(index)}
                    disabled={showResult}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        {
                          color: isSelected && !showResult
                            ? '#FFFFFF'
                            : (showCheck ? theme.success : (showError ? theme.error : theme.text)),
                          fontWeight: isSelected || showCheck || showError ? '700' : '500',
                        },
                      ]}
                    >
                      {option}
                    </Text>
                    {showCheck && <Ionicons name="checkmark-circle" size={20} color={theme.success} />}
                    {showError && <Ionicons name="close-circle" size={20} color={theme.error} />}
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>

          {showResult && (
            <Animated.View style={[styles.feedbackLabel, { borderTopColor: theme.border }]}>
              <View style={styles.feedbackIconWrap}>
                <Ionicons
                  name={selectedAnswer === currentQuestion.correct ? "happy-outline" : "sad-outline"}
                  size={24}
                  color={selectedAnswer === currentQuestion.correct ? theme.success : theme.error}
                />
              </View>
              <Text style={[styles.explanationText, { color: theme.textSecondary }]}>
                {currentQuestion.explanation}
              </Text>
            </Animated.View>
          )}
        </Animated.View>

        {showResult && (
          <TouchableOpacity
            style={[styles.nextButtonAction, { backgroundColor: theme.primary }]}
            onPress={nextQuestion}
          >
            <Text style={styles.nextButtonTextAction}>
              {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Drill'}
            </Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  categoryHeader: {
    paddingTop: 50,
    paddingBottom: 32,
    paddingHorizontal: 22,
    borderBottomLeftRadius: themeRadius.xxl,
    borderBottomRightRadius: themeRadius.xxl,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  quickStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  quickStat: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  quickStatValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  quickStatLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  quickStatDivider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 15,
  },
  categoryScroll: {
    flex: 1,
  },
  categoryContent: {
    padding: 22,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 20,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  categoryGrid: {
    gap: 16,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: themeRadius.xl,
    borderWidth: 1,
  },
  categoryIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
  },
  categoryDesc: {
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.8,
  },
  categoryAction: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: 22,
    borderBottomLeftRadius: themeRadius.xxl,
    borderBottomRightRadius: themeRadius.xxl,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  drillHeaderTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  drillHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 6,
  },
  timerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scoreChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 6,
  },
  scoreText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressCounter: {
    fontSize: 11,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  drillScrollView: {
    flex: 1,
  },
  drillContent: {
    padding: 22,
    paddingBottom: 60,
  },
  questionCard: {
    borderRadius: themeRadius.xl,
    padding: 24,
    borderWidth: 1,
    marginBottom: 20,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  questionText: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 28,
    marginBottom: 20,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  hintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 10,
    marginBottom: 24,
  },
  hintText: {
    fontSize: 14,
    fontWeight: '600',
    fontStyle: 'italic',
  },
  optionsGrid: {
    gap: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  optionText: {
    fontSize: 16,
    flex: 1,
  },
  feedbackLabel: {
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  feedbackIconWrap: {
    marginRight: 12,
    marginTop: 2,
  },
  explanationText: {
    fontSize: 14,
    lineHeight: 22,
    flex: 1,
  },
  nextButtonAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  nextButtonTextAction: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  resultHeader: {
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 22,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  closeBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
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
  resultIconInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultEmoji: {
    fontSize: 42,
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  resultSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  xpEarnedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  xpEarnedText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  resultScroll: {
    flex: 1,
  },
  resultContent: {
    padding: 22,
  },
  scoreCard: {
    borderRadius: themeRadius.xl,
    padding: 24,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 24,
  },
  scoreCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 8,
    borderColor: 'rgba(201, 162, 39, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: '800',
  },
  scoreLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingTop: 20,
    borderTopWidth: 1,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  statDivider: {
    width: 1,
    height: 30,
    marginHorizontal: 10,
  },
  reviewTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 16,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  reviewCard: {
    borderRadius: themeRadius.lg,
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
    borderLeftWidth: 6,
  },
  reviewQuestion: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
  },
  reviewAnswer: {
    fontSize: 14,
    marginBottom: 4,
  },
  reviewCorrect: {
    fontSize: 14,
    fontWeight: '600',
  },
  resultActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  retryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 10,
    borderWidth: 1.5,
  },
  retryBtnText: {
    fontSize: 16,
    fontWeight: '800',
  },
  newDrillBtn: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  newDrillGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  newDrillBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
