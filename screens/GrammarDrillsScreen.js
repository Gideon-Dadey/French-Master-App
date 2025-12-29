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

const { width, height } = Dimensions.get('window');

const FloatingOrb = ({ delay, size, color, startX, startY }) => {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: 800,
      delay,
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 3000 + Math.random() * 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3000 + Math.random() * 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: startX,
        top: startY,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        opacity: opacityAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 0.6],
        }),
        transform: [
          {
            translateY: floatAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, -20],
            }),
          },
          {
            scale: floatAnim.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [1, 1.1, 1],
            }),
          },
        ],
      }}
    />
  );
};

const ConfettiPiece = ({ delay, color }) => {
  const fallAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const startX = Math.random() * width;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fallAnim, {
        toValue: 1,
        duration: 2500,
        delay,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2500,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: startX,
        top: -20,
        width: 10,
        height: 10,
        borderRadius: 2,
        backgroundColor: color,
        opacity: fallAnim.interpolate({
          inputRange: [0, 0.8, 1],
          outputRange: [1, 1, 0],
        }),
        transform: [
          {
            translateY: fallAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, height * 0.7],
            }),
          },
          {
            translateX: fallAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, (Math.random() - 0.5) * 100],
            }),
          },
          {
            rotate: rotateAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['0deg', `${Math.random() * 720}deg`],
            }),
          },
        ],
      }}
    />
  );
};

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

    setAnswers([...answers, { questionId: currentQuestion.id, answer: index, isCorrect }]);

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
      <View style={[styles.container, { backgroundColor: isDarkMode ? '#0A0A0F' : '#F0F9FF' }]}>
        <StatusBar style="light" />

        <LinearGradient
          colors={isDarkMode ? ['#0C4A6E', '#0F172A', '#020617'] : ['#0EA5E9', '#0284C7', '#0369A1']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.categoryHeader}
        >

          <FloatingOrb delay={0} size={80} color="rgba(56, 189, 248, 0.3)" startX={width * 0.1} startY={40} />
          <FloatingOrb delay={200} size={60} color="rgba(14, 165, 233, 0.25)" startX={width * 0.7} startY={80} />
          <FloatingOrb delay={400} size={100} color="rgba(2, 132, 199, 0.2)" startX={width * 0.5} startY={20} />
          <FloatingOrb delay={600} size={40} color="rgba(56, 189, 248, 0.35)" startX={width * 0.85} startY={120} />
          <FloatingOrb delay={800} size={50} color="rgba(125, 211, 252, 0.3)" startX={width * 0.2} startY={140} />

          <View style={styles.headerDecor1} />
          <View style={styles.headerDecor2} />
          <View style={styles.headerDecor3} />

          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <View style={styles.backBtnInner}>
              <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          <Animated.View
            style={[
              styles.headerContent,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}
          >

            <View style={styles.premiumBadge}>
              <LinearGradient
                colors={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.1)']}
                style={styles.premiumBadgeGradient}
              >
                <Ionicons name="diamond" size={12} color="#FFFFFF" />
                <Text style={styles.premiumBadgeText}>PREMIUM DRILLS</Text>
              </LinearGradient>
            </View>

            <View style={styles.headerIconWrap}>
              <LinearGradient
                colors={['rgba(255,255,255,0.35)', 'rgba(255,255,255,0.1)']}
                style={styles.headerIconGradient}
              >
                <View style={styles.headerIconPulse} />
                <Ionicons name="school" size={48} color="#FFFFFF" />
              </LinearGradient>
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
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Choose a Topic
          </Text>
          <Text style={[styles.sectionSubtitle, { color: colors.secondaryText }]}>
            Each topic has 6 exercises to master
          </Text>

          <View style={styles.categoryGrid}>
            {GRAMMAR_CATEGORIES.map((category, index) => (
              <Animated.View
                key={category.id}
                style={{
                  opacity: fadeAnim,
                  transform: [
                    { translateY: Animated.multiply(slideAnim, new Animated.Value(1 + index * 0.1)) },
                    { scale: scaleAnim }
                  ],
                }}
              >
                <TouchableOpacity
                  style={[
                    styles.categoryCard,
                    {
                      backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
                      borderColor: isDarkMode ? 'rgba(56, 189, 248, 0.1)' : 'rgba(14, 165, 233, 0.08)',
                    }
                  ]}
                  onPress={() => {
                    Vibration.vibrate(10);
                    startDrill(category.id);
                  }}
                  activeOpacity={0.85}
                >

                  <View style={[styles.categoryAccent, { backgroundColor: category.color }]} />

                  <LinearGradient
                    colors={category.gradient}
                    style={styles.categoryIcon}
                  >
                    <Ionicons name={category.icon} size={26} color="#FFFFFF" />
                  </LinearGradient>

                  <Text style={[styles.categoryName, { color: colors.text }]}>
                    {category.name}
                  </Text>
                  <Text style={[styles.categoryDesc, { color: colors.secondaryText }]} numberOfLines={1}>
                    {category.desc}
                  </Text>

                  <View style={styles.categoryMeta}>
                    <View style={[styles.questionBadge, { backgroundColor: category.color + '15' }]}>
                      <Ionicons name="document-text" size={12} color={category.color} />
                      <Text style={[styles.questionBadgeText, { color: category.color }]}>6 drills</Text>
                    </View>
                    <View style={[styles.playBtnMini, { backgroundColor: category.color + '20' }]}>
                      <Ionicons name="play" size={14} color={category.color} />
                    </View>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>

          <View style={[styles.motivationCard, { backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF' }]}>
            <LinearGradient
              colors={isDarkMode ? ['#10B981', '#059669'] : ['#10B981', '#34D399']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.motivationGradient}
            >
              <View style={styles.motivationContent}>
                <View style={styles.motivationIconWrap}>
                  <Ionicons name="rocket" size={32} color="#FFFFFF" />
                </View>
                <View style={styles.motivationText}>
                  <Text style={styles.motivationTitle}>Ready to Master Grammar?</Text>
                  <Text style={styles.motivationSubtitle}>Complete all topics to earn up to 960 XP!</Text>
                </View>
              </View>
              <View style={styles.motivationProgress}>
                <View style={styles.motivationProgressBar}>
                  <View style={[styles.motivationProgressFill, { width: '0%' }]} />
                </View>
                <Text style={styles.motivationProgressText}>0/8 topics completed</Text>
              </View>
            </LinearGradient>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </View>
    );
  }

  const confettiColors = ['#F43F5E', '#8B5CF6', '#0EA5E9', '#10B981', '#F59E0B', '#EC4899'];

  if (drillCompleted) {
    const percentage = (score / questions.length) * 100;
    const categoryInfo = getCategoryInfo();
    const showConfetti = percentage >= 70;

    return (
      <View style={[styles.container, { backgroundColor: isDarkMode ? '#0A0A0F' : '#F0F9FF' }]}>
        <StatusBar barStyle="light-content" />

        {showConfetti && (
          <View style={styles.confettiContainer}>
            {[...Array(30)].map((_, i) => (
              <ConfettiPiece
                key={i}
                delay={i * 50}
                color={confettiColors[i % confettiColors.length]}
              />
            ))}
          </View>
        )}

        <LinearGradient
          colors={percentage >= 70
            ? (isDarkMode ? ['#047857', '#064E3B', '#022C22'] : ['#10B981', '#059669', '#047857'])
            : (isDarkMode ? ['#0C4A6E', '#0F172A'] : ['#0EA5E9', '#0284C7'])
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.resultHeader}
        >

          <FloatingOrb delay={0} size={80} color="rgba(255,255,255,0.15)" startX={width * 0.1} startY={40} />
          <FloatingOrb delay={300} size={60} color="rgba(255,255,255,0.1)" startX={width * 0.75} startY={100} />
          <FloatingOrb delay={600} size={50} color="rgba(255,255,255,0.12)" startX={width * 0.4} startY={30} />

          <View style={styles.resultDecor1} />
          <View style={styles.resultDecor2} />

          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => setSelectedCategory(null)}
          >
            <View style={styles.closeBtnInner}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          <View style={styles.resultIconContainer}>
            <View style={[styles.resultIconGlow, { backgroundColor: percentage >= 70 ? 'rgba(16, 185, 129, 0.5)' : 'rgba(14, 165, 233, 0.5)' }]} />
            <View style={styles.resultIconInner}>
              {percentage >= 90 ? (
                <Text style={styles.resultEmoji}>🏆</Text>
              ) : percentage >= 70 ? (
                <Text style={styles.resultEmoji}>⭐</Text>
              ) : percentage >= 50 ? (
                <Text style={styles.resultEmoji}>📚</Text>
              ) : (
                <Text style={styles.resultEmoji}>💪</Text>
              )}
            </View>
          </View>

          <Text style={styles.resultTitle}>
            {percentage >= 90 ? 'Parfait!' : percentage >= 70 ? 'Très Bien!' : percentage >= 50 ? 'Bon Effort!' : 'Keep Going!'}
          </Text>
          <Text style={styles.resultSubtitle}>
            {categoryInfo?.name} Complete
          </Text>

          <View style={styles.xpEarnedBadge}>
            <Ionicons name="star" size={16} color="#F59E0B" />
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
                <Text style={[styles.scoreLabel, { color: colors.secondaryText }]}>Best Streak</Text>
                <Text style={[styles.scoreValue, { color: '#F59E0B' }]}>{maxStreak}🔥</Text>
              </View>
            </View>
          </View>

          <View style={[styles.timeCard, { backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF' }]}>
            <Ionicons name="time-outline" size={24} color="#0EA5E9" />
            <Text style={[styles.timeText, { color: colors.text }]}>Completed in {formatTime(timeElapsed)}</Text>
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
                <Text style={[styles.reviewHint, { color: colors.secondaryText }]}>
                  {question.hint}
                </Text>
                <Text style={[styles.reviewAnswer, { color: colors.secondaryText }]}>
                  Your answer: <Text style={{ fontWeight: '600', color: isCorrect ? '#10B981' : '#F43F5E' }}>
                    {question.options[userAnswer?.answer]}
                  </Text>
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
              onPress={() => startDrill(selectedCategory)}
            >
              <Ionicons name="refresh" size={22} color={colors.text} />
              <Text style={[styles.retryBtnText, { color: colors.text }]}>Retry</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.newDrillBtn}
              onPress={() => setSelectedCategory(null)}
            >
              <LinearGradient
                colors={['#0EA5E9', '#0284C7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.newDrillGradient}
              >
                <Ionicons name="grid" size={22} color="#FFFFFF" />
                <Text style={styles.newDrillBtnText}>New Topic</Text>
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
      <StatusBar style="light" />

      <LinearGradient
        colors={categoryInfo?.gradient || ['#0EA5E9', '#0284C7']}
        style={styles.drillHeader}
      >
        <View style={styles.drillHeaderTop}>
          <TouchableOpacity
            style={styles.drillBackBtn}
            onPress={() => setSelectedCategory(null)}
          >
            <Ionicons name="close" size={26} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.drillHeaderCenter}>
            <Text style={styles.drillCategory}>{categoryInfo?.name}</Text>
            <Text style={styles.drillProgress}>
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
          <Animated.View style={[styles.streakBadge, { transform: [{ scale: pulseAnim }] }]}>
            <Ionicons name="flame" size={20} color="#F59E0B" />
            <Text style={styles.streakText}>{streak} Streak!</Text>
          </Animated.View>
        )}
      </LinearGradient>

      <ScrollView
        style={styles.drillScroll}
        contentContainerStyle={styles.drillContent}
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
          <View style={[styles.questionNumber, { backgroundColor: categoryInfo?.color }]}>
            <Text style={styles.questionNumberText}>{currentQuestionIndex + 1}</Text>
          </View>
          <Text style={[styles.questionText, { color: colors.text }]}>
            {currentQuestion?.question}
          </Text>
          <View style={[styles.hintContainer, { backgroundColor: isDarkMode ? '#334155' : '#F1F5F9' }]}>
            <Ionicons name="language" size={16} color={colors.secondaryText} />
            <Text style={[styles.hintText, { color: colors.secondaryText }]}>
              {currentQuestion?.hint}
            </Text>
          </View>
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
                      outputRange: [60, 0],
                    })
                  }, {
                    scale: isSelected && showResult && isCorrect ? correctAnim : 1
                  }]
                }}
              >
                <TouchableOpacity
                  style={[
                    styles.optionBtn,
                    {
                      backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
                      borderColor: showCorrect ? '#10B981' : showWrong ? '#F43F5E' : isSelected ? categoryInfo?.color : isDarkMode ? '#334155' : '#E2E8F0',
                      borderWidth: showCorrect || showWrong || isSelected ? 2.5 : 1.5,
                    }
                  ]}
                  onPress={() => handleAnswer(index)}
                  disabled={showResult}
                  activeOpacity={0.8}
                >
                  <View style={[
                    styles.optionLetter,
                    {
                      backgroundColor: showCorrect ? '#10B981' : showWrong ? '#F43F5E' : isSelected ? categoryInfo?.color : isDarkMode ? '#374151' : '#F1F5F9',
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
                    <View style={styles.resultIcon}>
                      <Ionicons name="checkmark-circle" size={26} color="#10B981" />
                    </View>
                  )}
                  {showWrong && (
                    <View style={styles.resultIcon}>
                      <Ionicons name="close-circle" size={26} color="#F43F5E" />
                    </View>
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
                borderLeftColor: selectedAnswer === currentQuestion.correct ? '#10B981' : '#F59E0B',
              }
            ]}
          >
            <View style={styles.explanationHeader}>
              <Ionicons
                name={selectedAnswer === currentQuestion.correct ? 'checkmark-circle' : 'bulb'}
                size={24}
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
              colors={categoryInfo?.gradient || ['#0EA5E9', '#0284C7']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.nextBtnGradient}
            >
              <Text style={styles.nextBtnText}>
                {currentQuestionIndex < questions.length - 1 ? 'Next Exercise' : 'See Results'}
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

  confettiContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    pointerEvents: 'none',
  },

  categoryHeader: {
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: 32,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    overflow: 'hidden',
  },
  headerDecor1: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  headerDecor2: {
    position: 'absolute',
    bottom: -50,
    left: -50,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  headerDecor3: {
    position: 'absolute',
    top: 80,
    left: 50,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  backBtn: {
    marginBottom: 20,
  },
  backBtnInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  premiumBadge: {
    marginBottom: 16,
  },
  premiumBadgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  premiumBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerIconWrap: {
    marginBottom: 16,
  },
  headerIconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIconPulse: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    marginBottom: 20,
  },
  quickStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 20,
    gap: 20,
  },
  quickStat: {
    alignItems: 'center',
  },
  quickStatValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  quickStatLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  quickStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  categoryScroll: {
    flex: 1,
  },
  categoryContent: {
    padding: 20,
    paddingTop: 28,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  sectionSubtitle: {
    fontSize: 15,
    marginBottom: 24,
    opacity: 0.8,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: (width - 52) / 2,
    padding: 18,
    paddingTop: 22,
    borderRadius: 24,
    marginBottom: 16,
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  categoryAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  categoryName: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  categoryDesc: {
    fontSize: 12,
    marginBottom: 14,
    opacity: 0.7,
  },
  categoryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  questionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
  },
  questionBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  playBtnMini: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  motivationCard: {
    borderRadius: 24,
    marginTop: 8,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  motivationGradient: {
    padding: 22,
  },
  motivationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  motivationIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  motivationText: {
    flex: 1,
  },
  motivationTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  motivationSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
  },
  motivationProgress: {
    gap: 8,
  },
  motivationProgressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  motivationProgressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
  },
  motivationProgressText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'right',
  },
  statsCard: {
    borderRadius: 22,
    marginTop: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  statsGradient: {
    flexDirection: 'row',
    padding: 26,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 30,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 44,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },

  drillHeader: {
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: 28,
    paddingHorizontal: 20,
  },
  drillHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  drillBackBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  drillHeaderCenter: {
    alignItems: 'center',
  },
  drillCategory: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  drillProgress: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14,
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
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 22,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  streakText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F59E0B',
  },

  drillScroll: {
    flex: 1,
  },
  drillContent: {
    padding: 20,
    paddingTop: 36,
  },
  questionCard: {
    padding: 24,
    borderRadius: 26,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  questionNumber: {
    position: 'absolute',
    top: -14,
    left: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  questionNumberText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  questionText: {
    fontSize: 21,
    fontWeight: '700',
    lineHeight: 32,
    marginTop: 8,
    marginBottom: 16,
  },
  hintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    gap: 10,
  },
  hintText: {
    fontSize: 14,
    fontStyle: 'italic',
    flex: 1,
  },
  optionsContainer: {
    gap: 14,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 18,
    gap: 14,
  },
  optionLetter: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLetterText: {
    fontSize: 17,
    fontWeight: '700',
  },
  optionText: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
  },
  resultIcon: {
    marginLeft: 'auto',
  },
  explanationCard: {
    padding: 20,
    borderRadius: 18,
    marginTop: 24,
    borderLeftWidth: 5,
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
    marginTop: 24,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
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
    fontWeight: '700',
    color: '#FFFFFF',
  },

  resultHeader: {
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: 60,
    alignItems: 'center',
    overflow: 'hidden',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  resultDecor1: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  resultDecor2: {
    position: 'absolute',
    bottom: -80,
    left: -80,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  closeBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 50,
    right: 20,
  },
  closeBtnInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  resultIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    marginTop: 20,
  },
  resultIconGlow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  resultIconInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  resultEmoji: {
    fontSize: 52,
  },
  resultTitle: {
    fontSize: 42,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: -1,
  },
  resultSubtitle: {
    fontSize: 17,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 16,
  },
  xpEarnedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  xpEarnedText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F59E0B',
  },
  resultScroll: {
    flex: 1,
  },
  resultContent: {
    padding: 20,
    paddingTop: 0,
    marginTop: -28,
  },
  scoreCard: {
    borderRadius: 22,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
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
    fontSize: 28,
    fontWeight: '800',
  },
  scoreDivider: {
    width: 1,
    height: 54,
  },
  timeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    gap: 10,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  reviewTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
  },
  reviewCard: {
    padding: 18,
    borderRadius: 18,
    marginBottom: 14,
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
  reviewHint: {
    fontSize: 13,
    fontStyle: 'italic',
    marginLeft: 48,
    marginBottom: 6,
  },
  reviewAnswer: {
    fontSize: 14,
    marginLeft: 48,
  },
  reviewCorrect: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 48,
    marginTop: 6,
  },
  resultActions: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 24,
  },
  retryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 18,
    gap: 10,
  },
  retryBtnText: {
    fontSize: 16,
    fontWeight: '600',
  },
  newDrillBtn: {
    flex: 1,
    borderRadius: 18,
    overflow: 'hidden',
  },
  newDrillGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 10,
  },
  newDrillBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
