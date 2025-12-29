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

const GRAMMAR_CATEGORIES = [
  { id: 'articles', name: 'Articles', icon: 'newspaper', color: '#1E3A5F', gradient: ['#1E3A5F', '#2D4A6F'], desc: 'Le, La, Les, Un, Une' },
  { id: 'verbs_present', name: 'Present Tense', icon: 'time', color: '#2E7D5A', gradient: ['#2E7D5A', '#3A6BA7'], desc: 'Être, Avoir, Aller...' },
  { id: 'verbs_past', name: 'Past Tense', icon: 'hourglass', color: '#8B5CF6', gradient: ['#8B5CF6', '#7C3AED'], desc: 'Passé Composé' },
  { id: 'adjectives', name: 'Adjectives', icon: 'color-palette', color: '#C94C4C', gradient: ['#C94C4C', '#E57373'], desc: 'Agreement & Position' },
  { id: 'pronouns', name: 'Pronouns', icon: 'person', color: '#C9A227', gradient: ['#C9A227', '#D4B445'], desc: 'Subject & Object' },
  { id: 'negation', name: 'Negation', icon: 'close-circle', color: '#EF4444', gradient: ['#EF4444', '#DC2626'], desc: 'Ne...pas, Ne...jamais' },
  { id: 'questions', name: 'Questions', icon: 'help-circle', color: '#5B8FB9', gradient: ['#5B8FB9', '#7AA8D4'], desc: 'Question Formation' },
  { id: 'prepositions', name: 'Prepositions', icon: 'navigate', color: '#EC4899', gradient: ['#EC4899', '#DB2777'], desc: 'À, De, En, Dans...' },
];

const GRAMMAR_DRILLS = {
  articles: [
    { id: 'a1', question: 'Complete: "___ livre est sur la table."', hint: 'The book is on the table.', options: ['Le', 'La', 'Les', 'Un'], correct: 0, explanation: '"Le" is the masculine singular definite article. "Livre" (book) is masculine.' },
    { id: 'a2', question: 'Complete: "J\'achète ___ pommes."', hint: 'I\'m buying some apples.', options: ['le', 'la', 'des', 'du'], correct: 2, explanation: '"Des" is used for plural indefinite articles - "some apples".' },
    { id: 'a3', question: 'Complete: "___ eau est froide."', hint: 'The water is cold.', options: ['Le', 'La', 'L\'', 'Les'], correct: 2, explanation: '"L\'" is used before vowels. "Eau" (water) is feminine and starts with a vowel.' },
    { id: 'a4', question: 'Complete: "Je veux ___ café."', hint: 'I want some coffee.', options: ['le', 'la', 'du', 'de la'], correct: 2, explanation: '"Du" is the partitive article for masculine nouns - "some coffee".' },
    { id: 'a5', question: 'Complete: "___ fille est intelligente."', hint: 'The girl is intelligent.', options: ['Le', 'La', 'Les', 'Un'], correct: 1, explanation: '"La" is the feminine singular definite article. "Fille" (girl) is feminine.' },
    { id: 'a6', question: 'Complete: "Il n\'a pas ___ argent."', hint: 'He doesn\'t have any money.', options: ['de l\'', 'd\'', 'du', 'le'], correct: 1, explanation: 'After negation, partitive articles become "de" or "d\'" before vowels.' },
  ],
  verbs_present: [
    { id: 'vp1', question: 'Complete: "Nous ___ français."', hint: 'We speak French.', options: ['parle', 'parles', 'parlons', 'parlez'], correct: 2, explanation: '"Parlons" is the "nous" (we) form of "parler" - first person plural.' },
    { id: 'vp2', question: 'Complete: "Tu ___ à l\'école."', hint: 'You go to school.', options: ['va', 'vas', 'vais', 'allez'], correct: 1, explanation: '"Vas" is the "tu" (you informal) form of "aller" - second person singular.' },
    { id: 'vp3', question: 'Complete: "Ils ___ la télévision."', hint: 'They watch television.', options: ['regarde', 'regardes', 'regardons', 'regardent'], correct: 3, explanation: '"Regardent" is the "ils/elles" (they) form of "regarder" - third person plural.' },
    { id: 'vp4', question: 'Complete: "Je ___ un étudiant."', hint: 'I am a student.', options: ['suis', 'es', 'est', 'sommes'], correct: 0, explanation: '"Suis" is the "je" (I) form of "être" - first person singular.' },
    { id: 'vp5', question: 'Complete: "Elle ___ 20 ans."', hint: 'She is 20 years old.', options: ['est', 'a', 'as', 'ai'], correct: 1, explanation: 'In French, we use "avoir" (to have) for age. "Elle a 20 ans" = She has 20 years.' },
    { id: 'vp6', question: 'Complete: "Vous ___ très gentils."', hint: 'You are very kind.', options: ['es', 'est', 'sommes', 'êtes'], correct: 3, explanation: '"Êtes" is the "vous" (you formal/plural) form of "être".' },
  ],
  verbs_past: [
    { id: 'vpa1', question: 'Complete: "J\' ___ mangé."', hint: 'I ate.', options: ['ai', 'suis', 'as', 'a'], correct: 0, explanation: '"Manger" uses "avoir" in passé composé. "J\'ai mangé" = I ate.' },
    { id: 'vpa2', question: 'Complete: "Elle ___ allée à Paris."', hint: 'She went to Paris.', options: ['a', 'est', 'ai', 'as'], correct: 1, explanation: '"Aller" uses "être" in passé composé. The past participle agrees with the subject.' },
    { id: 'vpa3', question: 'Complete: "Nous avons ___ le film."', hint: 'We watched the film.', options: ['regardé', 'regardée', 'regardés', 'regarder'], correct: 0, explanation: 'With "avoir", the past participle doesn\'t agree with the subject (no -s/-e).' },
    { id: 'vpa4', question: 'Complete: "Ils sont ___ tôt."', hint: 'They arrived early.', options: ['arrivé', 'arrivée', 'arrivés', 'arriver'], correct: 2, explanation: 'With "être", the past participle agrees. "Ils" (masculine plural) = "arrivés".' },
    { id: 'vpa5', question: 'Complete: "Elle s\'est ___."', hint: 'She woke up.', options: ['réveillé', 'réveillée', 'réveillés', 'réveiller'], correct: 1, explanation: 'Reflexive verbs use "être". Feminine singular agreement = "réveillée".' },
    { id: 'vpa6', question: 'Complete: "Tu as ___ la vérité."', hint: 'You told the truth.', options: ['dit', 'dis', 'dire', 'dites'], correct: 0, explanation: '"Dit" is the past participle of "dire" (to say/tell).' },
  ],
  adjectives: [
    { id: 'adj1', question: 'Complete: "La maison est ___."', hint: 'The house is big.', options: ['grand', 'grande', 'grands', 'grandes'], correct: 1, explanation: '"Maison" is feminine, so the adjective agrees: "grande".' },
    { id: 'adj2', question: 'Complete: "Les filles sont ___."', hint: 'The girls are happy.', options: ['heureux', 'heureuse', 'heureux', 'heureuses'], correct: 3, explanation: '"Filles" is feminine plural, so the adjective is "heureuses".' },
    { id: 'adj3', question: 'Complete: "C\'est une ___ idée."', hint: 'It\'s a good idea.', options: ['bon', 'bonne', 'bons', 'bien'], correct: 1, explanation: '"Idée" is feminine. "Bon" becomes "bonne" in feminine form.' },
    { id: 'adj4', question: 'Complete: "J\'ai un ___ ami."', hint: 'I have a good friend.', options: ['bon', 'bonne', 'bien', 'beau'], correct: 0, explanation: '"Ami" is masculine. "Bon" stays as "bon" in masculine singular.' },
    { id: 'adj5', question: 'Where does the adjective go? "une ___ voiture ___"', hint: 'A red car.', options: ['rouge / --', '-- / rouge', 'rouges / --', '-- / rouges'], correct: 1, explanation: 'Most adjectives in French come AFTER the noun: "une voiture rouge".' },
    { id: 'adj6', question: 'Complete: "C\'est un ___ homme."', hint: 'He\'s a handsome man.', options: ['beau', 'bel', 'belle', 'beaux'], correct: 1, explanation: 'Before a masculine noun starting with a vowel or silent h, "beau" becomes "bel".' },
  ],
  pronouns: [
    { id: 'pr1', question: 'Complete: "Je ___ aime."', hint: 'I love him/her/it.', options: ['le', 'la', 'l\'', 'les'], correct: 2, explanation: 'Before a vowel (aime), "le" or "la" becomes "l\'".' },
    { id: 'pr2', question: 'Complete: "Il ___ parle."', hint: 'He talks to me.', options: ['me', 'te', 'lui', 'leur'], correct: 0, explanation: '"Me" is the first person indirect object pronoun - "to me".' },
    { id: 'pr3', question: 'Complete: "Je ___ donne le livre."', hint: 'I give them the book.', options: ['les', 'leur', 'lui', 'eux'], correct: 1, explanation: '"Leur" is the indirect object pronoun for "to them".' },
    { id: 'pr4', question: 'Complete: "Tu ___ connais?"', hint: 'Do you know them?', options: ['leur', 'les', 'lui', 'le'], correct: 1, explanation: '"Les" is the direct object pronoun for "them" (connaître takes direct object).' },
    { id: 'pr5', question: 'Complete: "___ sommes français."', hint: 'We are French.', options: ['Je', 'Tu', 'Nous', 'Ils'], correct: 2, explanation: '"Nous" means "we" and uses "sommes" from être.' },
    { id: 'pr6', question: 'Complete: "C\'est pour ___."', hint: 'It\'s for you.', options: ['tu', 'te', 'toi', 'vous'], correct: 2, explanation: 'After prepositions, use stressed pronouns: "toi" (informal you).' },
  ],
  negation: [
    { id: 'n1', question: 'Complete: "Je ___ parle ___ français."', hint: 'I don\'t speak French.', options: ['ne...pas', 'pas...ne', 'ne...plus', 'ne...rien'], correct: 0, explanation: '"Ne...pas" is the basic negation structure - "ne" before verb, "pas" after.' },
    { id: 'n2', question: 'Complete: "Il ___ mange ___ viande."', hint: 'He never eats meat.', options: ['ne...pas', 'ne...plus', 'ne...jamais', 'ne...rien'], correct: 2, explanation: '"Ne...jamais" means "never". It replaces "pas" in the negation.' },
    { id: 'n3', question: 'Complete: "Elle ___ travaille ___."', hint: 'She no longer works.', options: ['ne...pas', 'ne...plus', 'ne...jamais', 'ne...rien'], correct: 1, explanation: '"Ne...plus" means "no longer" or "no more".' },
    { id: 'n4', question: 'Complete: "Je ___ vois ___."', hint: 'I don\'t see anything.', options: ['ne...pas', 'ne...plus', 'ne...jamais', 'ne...rien'], correct: 3, explanation: '"Ne...rien" means "nothing" or "not anything".' },
    { id: 'n5', question: 'Complete: "Il n\'y a ___ ici."', hint: 'There\'s nobody here.', options: ['pas', 'personne', 'rien', 'plus'], correct: 1, explanation: '"Ne...personne" means "nobody" or "no one".' },
    { id: 'n6', question: 'Complete: "Je n\'ai ___ argent ___ temps."', hint: 'I have neither money nor time.', options: ['pas...pas', 'ni...ni', 'ne...ne', 'plus...plus'], correct: 1, explanation: '"Ne...ni...ni" means "neither...nor".' },
  ],
  questions: [
    { id: 'q1', question: 'Form: "You speak French?" (formal)', hint: 'Est-ce que structure', options: ['Tu parles français?', 'Est-ce que tu parles français?', 'Parles-tu français?', 'Français tu parles?'], correct: 1, explanation: '"Est-ce que" is a common way to form yes/no questions.' },
    { id: 'q2', question: 'Complete: "___ est ton nom?"', hint: 'What is your name?', options: ['Qui', 'Quoi', 'Quel', 'Où'], correct: 2, explanation: '"Quel" means "what" when asking about specific things. It agrees with the noun.' },
    { id: 'q3', question: 'Complete: "___ habites-tu?"', hint: 'Where do you live?', options: ['Qui', 'Quand', 'Où', 'Comment'], correct: 2, explanation: '"Où" means "where" in French.' },
    { id: 'q4', question: 'Complete: "___ tu fais?"', hint: 'What are you doing?', options: ['Qu\'est-ce que', 'Est-ce que', 'Qui est-ce que', 'Où est-ce que'], correct: 0, explanation: '"Qu\'est-ce que" means "what" (as object of the sentence).' },
    { id: 'q5', question: 'Complete: "___ vient ce soir?"', hint: 'Who is coming tonight?', options: ['Que', 'Qui', 'Quoi', 'Quel'], correct: 1, explanation: '"Qui" means "who" when asking about people.' },
    { id: 'q6', question: 'Complete: "___ coûte ce livre?"', hint: 'How much does this book cost?', options: ['Comment', 'Combien', 'Pourquoi', 'Quand'], correct: 1, explanation: '"Combien" means "how much" or "how many".' },
  ],
  prepositions: [
    { id: 'pp1', question: 'Complete: "Je vais ___ Paris."', hint: 'I\'m going to Paris.', options: ['à', 'en', 'dans', 'au'], correct: 0, explanation: '"À" is used for cities. "Je vais à Paris".' },
    { id: 'pp2', question: 'Complete: "Elle habite ___ France."', hint: 'She lives in France.', options: ['à', 'en', 'au', 'dans'], correct: 1, explanation: '"En" is used for feminine countries. France is feminine.' },
    { id: 'pp3', question: 'Complete: "Il travaille ___ Canada."', hint: 'He works in Canada.', options: ['en', 'à', 'au', 'dans'], correct: 2, explanation: '"Au" (à + le) is used for masculine countries. Canada is masculine.' },
    { id: 'pp4', question: 'Complete: "Le livre est ___ la table."', hint: 'The book is on the table.', options: ['à', 'sur', 'dans', 'sous'], correct: 1, explanation: '"Sur" means "on" (on top of something).' },
    { id: 'pp5', question: 'Complete: "Je viens ___ Japon."', hint: 'I come from Japan.', options: ['de', 'du', 'de la', 'des'], correct: 1, explanation: '"Du" (de + le) is used with masculine countries. Japan is masculine.' },
    { id: 'pp6', question: 'Complete: "C\'est le livre ___ Marie."', hint: 'It\'s Marie\'s book.', options: ['à', 'de', 'pour', 'avec'], correct: 1, explanation: '"De" shows possession in French - "the book of Marie".' },
  ],
};

export default function GrammarDrillsScreen({ navigation }) {
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
  const [maxStreak, setMaxStreak] = useState(0);
  const [drillCompleted, setDrillCompleted] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [headerInteractable, setHeaderInteractable] = useState(false);

  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const optionAnims = useRef([...Array(4)].map(() => new Animated.Value(0))).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

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

  // Category Selection Screen
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
              <Text style={[styles.navTitle, { color: theme.text }]}>Grammar Drills</Text>
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
                <Text style={[styles.greetingSubtitle, { color: theme.primary }]}>MASTER THE RULES</Text>
                <Text style={[styles.greetingTitle, { color: theme.text }]}>Grammar Drills</Text>
                <Text style={[styles.heroDescription, { color: theme.textSecondary }]}>
                  Master French grammar with interactive exercises and instant feedback
                </Text>
              </View>
            </View>
          </View>

          {/* Content Body */}
          <View style={styles.contentBody}>
            {/* Stats Overview */}
            <View style={[styles.statsOverview, { backgroundColor: theme.surface, borderColor: theme.border }, themeShadows.md]}>
              <View style={styles.overviewItem}>
                <Text style={[styles.overviewValue, { color: theme.text }]}>48</Text>
                <Text style={[styles.overviewLabel, { color: theme.textSecondary }]}>Exercises</Text>
              </View>
              <View style={[styles.overviewDivider, { backgroundColor: theme.border }]} />
              <View style={styles.overviewItem}>
                <Text style={[styles.overviewValue, { color: theme.text }]}>8</Text>
                <Text style={[styles.overviewLabel, { color: theme.textSecondary }]}>Topics</Text>
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
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Choose a Topic</Text>
              </View>
            </View>

            <View style={styles.categoryGrid}>
              {GRAMMAR_CATEGORIES.map((category, index) => (
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
                    onPress={() => startDrill(category.id)}
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
                      <Text style={[styles.categoryDetails, { color: theme.textSecondary }]}>{category.desc}</Text>
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

  // Results Screen
  if (drillCompleted) {
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
            {percentage >= 90 ? 'Parfait!' : percentage >= 70 ? 'Très Bien!' : percentage >= 50 ? 'Bon Effort!' : 'Keep Practicing!'}
          </Text>
          <Text style={styles.resultSubtitle}>
            {categoryInfo?.name} Complete
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
                <Text style={[styles.scoreLabel, { color: theme.textSecondary }]}>Best Streak</Text>
                <Text style={[styles.scoreValue, { color: theme.text }]}>{maxStreak}</Text>
              </View>
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <View style={[styles.titleAccent, { backgroundColor: theme.secondary }]} />
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Review Answers</Text>
            </View>
          </View>

          {questions.map((question, index) => {
            const userAnswer = answers.find(ua => ua.questionIndex === index);
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
                  <Text style={[styles.reviewQuestion, { color: theme.text }]}>{question.question}</Text>
                </View>
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
              style={[styles.retryBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={() => startDrill(selectedCategory)}
            >
              <Ionicons name="refresh" size={20} color={theme.text} />
              <Text style={[styles.retryBtnText, { color: theme.text }]}>Retry</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.newQuizBtn} onPress={() => setSelectedCategory(null)}>
              <LinearGradient colors={[theme.primary, theme.primaryLight]} style={styles.newQuizGradient}>
                <Ionicons name="grid" size={20} color="#FFFFFF" />
                <Text style={styles.newQuizBtnText}>New Topic</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={{ height: 60 }} />
        </ScrollView>
      </View>
    );
  }

  // Quiz Screen
  const categoryInfo = getCategoryInfo();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" />

      <LinearGradient
        colors={categoryInfo.gradient}
        style={styles.quizHeader}
      >
        <View style={styles.quizHeaderTop}>
          <TouchableOpacity
            style={styles.quizBackBtn}
            onPress={() => setSelectedCategory(null)}
          >
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.quizHeaderCenter}>
            <Text style={styles.quizCategory}>{categoryInfo.name}</Text>
            <Text style={styles.quizProgress}>Question {currentQuestionIndex + 1} of {questions.length}</Text>
          </View>

          <View style={styles.timerBadge}>
            <Ionicons name="time-outline" size={16} color="#FFFFFF" />
            <Text style={styles.timerText}>{formatTime(timeElapsed)}</Text>
          </View>
        </View>

        <View style={styles.progressBarContainer}>
          <Animated.View
            style={[
              styles.progressBarFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>

        {streak >= 2 && (
          <View style={styles.streakBadge}>
            <Ionicons name="flame" size={18} color="#FF9500" />
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
              transform: [{ translateX: shakeAnim }],
            },
            themeShadows.md
          ]}
        >
          <View style={styles.questionNumber}>
            <Text style={[styles.questionNumberText, { color: theme.textSecondary }]}>
              QUESTION {currentQuestionIndex + 1}
            </Text>
          </View>

          <Text style={[styles.questionText, { color: theme.text }]}>
            {currentQuestion.question}
          </Text>

          {currentQuestion.hint && (
            <View style={[styles.hintBox, { backgroundColor: theme.primary + '10' }]}>
              <Ionicons name="language-outline" size={16} color={theme.primary} />
              <Text style={[styles.hintText, { color: theme.primary }]}>{currentQuestion.hint}</Text>
            </View>
          )}
        </Animated.View>

        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrect = index === currentQuestion.correct;
            const showCorrectHighlight = showResult && isCorrect;
            const showErrorHighlight = showResult && isSelected && !isCorrect;

            return (
              <Animated.View
                key={index}
                style={{
                  opacity: optionAnims[index],
                  transform: [{ scale: optionAnims[index] }],
                }}
              >
                <TouchableOpacity
                  style={[
                    styles.optionBtn,
                    {
                      backgroundColor: showCorrectHighlight
                        ? theme.success + '15'
                        : showErrorHighlight
                          ? theme.error + '15'
                          : isSelected && !showResult
                            ? theme.primary
                            : theme.surface,
                      borderColor: showCorrectHighlight
                        ? theme.success
                        : showErrorHighlight
                          ? theme.error
                          : isSelected && !showResult
                            ? theme.primary
                            : theme.border,
                    },
                    themeShadows.sm
                  ]}
                  onPress={() => handleAnswer(index)}
                  disabled={showResult}
                  activeOpacity={0.9}
                >
                  <View style={[
                    styles.optionLetter,
                    {
                      backgroundColor: showCorrectHighlight
                        ? theme.success
                        : showErrorHighlight
                          ? theme.error
                          : isSelected && !showResult
                            ? '#FFFFFF'
                            : theme.background,
                    }
                  ]}>
                    <Text style={[
                      styles.optionLetterText,
                      {
                        color: isSelected && !showResult
                          ? theme.primary
                          : showCorrectHighlight
                            ? '#FFFFFF'
                            : showErrorHighlight
                              ? '#FFFFFF'
                              : theme.text,
                      }
                    ]}>
                      {String.fromCharCode(65 + index)}
                    </Text>
                  </View>
                  <Text style={[
                    styles.optionText,
                    {
                      color: isSelected && !showResult
                        ? '#FFFFFF'
                        : showCorrectHighlight
                          ? theme.success
                          : showErrorHighlight
                            ? theme.error
                            : theme.text,
                    }
                  ]}>
                    {option}
                  </Text>
                  {showCorrectHighlight && <Ionicons name="checkmark-circle" size={22} color={theme.success} />}
                  {showErrorHighlight && <Ionicons name="close-circle" size={22} color={theme.error} />}
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        {showResult && (
          <View style={[styles.explanationCard, { backgroundColor: theme.surface, borderColor: theme.border }, themeShadows.sm]}>
            <View style={styles.explanationHeader}>
              <Ionicons
                name={selectedAnswer === currentQuestion.correct ? "happy-outline" : "sad-outline"}
                size={24}
                color={selectedAnswer === currentQuestion.correct ? theme.success : theme.error}
              />
              <Text style={[styles.explanationTitle, { color: selectedAnswer === currentQuestion.correct ? theme.success : theme.error }]}>
                {selectedAnswer === currentQuestion.correct ? 'Correct!' : 'Incorrect'}
              </Text>
            </View>
            <Text style={[styles.explanationText, { color: theme.textSecondary }]}>
              {currentQuestion.explanation}
            </Text>
          </View>
        )}

        {showResult && (
          <TouchableOpacity style={styles.nextBtn} onPress={nextQuestion}>
            <LinearGradient colors={[theme.primary, theme.primaryLight]} style={styles.nextBtnGradient}>
              <Text style={styles.nextBtnText}>
                {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'See Results'}
              </Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  // Floating Nav Bar
  floatingNavBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 10,
    paddingBottom: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  navBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  navBackBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  navIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Hero Section
  heroSection: {
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
  },
  heroContent: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    position: 'relative',
    overflow: 'hidden',
  },
  blurTop: {
    top: -100,
    right: -100,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
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
    alignItems: 'flex-start',
  },
  greetingSubtitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 8,
  },
  greetingTitle: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 12,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  heroDescription: {
    fontSize: 15,
    lineHeight: 22,
  },
  // Content Body
  contentBody: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  // Stats Overview
  statsOverview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 28,
  },
  overviewItem: {
    alignItems: 'center',
  },
  overviewValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  overviewLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  overviewDivider: {
    width: 1,
    height: 40,
  },
  // Section Headers
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  titleAccent: {
    width: 4,
    height: 20,
    borderRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  // Category Grid
  categoryGrid: {
    gap: 12,
  },
  categoryWrapper: {},
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
  // Quiz Header
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
    borderWidth: 1,
    marginBottom: 24,
  },
  questionNumber: {
    marginBottom: 12,
  },
  questionNumberText: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  questionText: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 32,
    marginBottom: 16,
  },
  hintBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 10,
  },
  hintText: {
    fontSize: 14,
    fontWeight: '600',
    fontStyle: 'italic',
    flex: 1,
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
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
    fontSize: 16,
    fontWeight: '600',
  },
  explanationCard: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 24,
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
    fontSize: 15,
    lineHeight: 24,
  },
  nextBtn: {
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
  // Results
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
    marginBottom: 28,
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
  reviewCard: {
    padding: 18,
    borderRadius: 16,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 10,
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
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
  },
  reviewAnswer: {
    fontSize: 14,
    marginLeft: 44,
  },
  reviewCorrect: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 44,
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
    borderWidth: 1.5,
  },
  retryBtnText: {
    fontSize: 16,
    fontWeight: '700',
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
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
