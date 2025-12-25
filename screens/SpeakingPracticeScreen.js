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
import { speakText, stopSpeech } from '../src/utils/textToSpeech';

const { width, height } = Dimensions.get('window');

const SPEAKING_CATEGORIES = [
  { id: 'greetings', name: 'Greetings', icon: 'hand-right', color: '#EC4899', gradient: ['#EC4899', '#DB2777'], desc: 'Say hello & goodbye' },
  { id: 'introductions', name: 'Introductions', icon: 'person', color: '#8B5CF6', gradient: ['#8B5CF6', '#7C3AED'], desc: 'Introduce yourself' },
  { id: 'questions', name: 'Questions', icon: 'help-circle', color: '#06B6D4', gradient: ['#06B6D4', '#0891B2'], desc: 'Ask for help' },
  { id: 'directions', name: 'Directions', icon: 'navigate', color: '#10B981', gradient: ['#10B981', '#059669'], desc: 'Find your way' },
  { id: 'restaurant', name: 'Restaurant', icon: 'restaurant', color: '#F59E0B', gradient: ['#F59E0B', '#D97706'], desc: 'Order food & drinks' },
  { id: 'shopping', name: 'Shopping', icon: 'cart', color: '#EF4444', gradient: ['#EF4444', '#DC2626'], desc: 'Buy things' },
  { id: 'travel', name: 'Travel', icon: 'airplane', color: '#3B82F6', gradient: ['#3B82F6', '#2563EB'], desc: 'Airport & hotel' },
  { id: 'emergency', name: 'Emergency', icon: 'medkit', color: '#F43F5E', gradient: ['#F43F5E', '#E11D48'], desc: 'Get help fast' },
];

const SPEAKING_EXERCISES = {
  greetings: [
    {
      id: 'g1',
      phrase: 'Bonjour, comment allez-vous?',
      translation: 'Hello, how are you?',
      pronunciation: 'bohn-ZHOOR, koh-MAHN tah-LAY voo?',
      tips: 'Focus on the nasal "on" in bonjour. Let the phrase flow smoothly.',
      difficulty: 'beginner',
    },
    {
      id: 'g2',
      phrase: 'Bonsoir, enchanté de vous rencontrer.',
      translation: 'Good evening, pleased to meet you.',
      pronunciation: 'bohn-SWAHR, ahn-shahn-TAY duh voo rahn-kohn-TRAY',
      tips: 'Bonsoir is used after 6 PM. Enchanté shows politeness.',
      difficulty: 'intermediate',
    },
    {
      id: 'g3',
      phrase: 'Salut! Ça va bien?',
      translation: 'Hi! How\'s it going?',
      pronunciation: 'sah-LÜ! sah vah BYEHN?',
      tips: 'This is informal. Use with friends and people your age.',
      difficulty: 'beginner',
    },
    {
      id: 'g4',
      phrase: 'Au revoir, bonne journée!',
      translation: 'Goodbye, have a nice day!',
      pronunciation: 'oh ruh-VWAHR, bun zhoor-NAY',
      tips: 'Au revoir is formal. Add bonne journée for extra politeness.',
      difficulty: 'beginner',
    },
    {
      id: 'g5',
      phrase: 'À bientôt, à la prochaine!',
      translation: 'See you soon, until next time!',
      pronunciation: 'ah byehn-TOH, ah lah proh-SHEHN',
      tips: 'Perfect for casual goodbyes when you\'ll see them again.',
      difficulty: 'intermediate',
    },
    {
      id: 'g6',
      phrase: 'Bonne nuit, dormez bien!',
      translation: 'Good night, sleep well!',
      pronunciation: 'bun NWEE, dor-MAY byehn',
      tips: 'Use only when someone is actually going to sleep.',
      difficulty: 'beginner',
    },
  ],
  introductions: [
    {
      id: 'i1',
      phrase: 'Je m\'appelle Marie, et vous?',
      translation: 'My name is Marie, and you?',
      pronunciation: 'zhuh mah-PELL mah-REE, ay VOO?',
      tips: 'The "j" sounds like "zh". Practice the liaison in m\'appelle.',
      difficulty: 'beginner',
    },
    {
      id: 'i2',
      phrase: 'Je suis américain(e). Et vous, d\'où venez-vous?',
      translation: 'I am American. And you, where are you from?',
      pronunciation: 'zhuh SWEE ah-may-ree-KEHN. ay VOO, doo vuh-NAY voo?',
      tips: 'Add "e" to américain if you\'re female. D\'où = from where.',
      difficulty: 'intermediate',
    },
    {
      id: 'i3',
      phrase: 'J\'habite à Paris depuis deux ans.',
      translation: 'I have lived in Paris for two years.',
      pronunciation: 'zhah-BEET ah pah-REE duh-PWEE duh ZAHN',
      tips: 'Depuis indicates duration. The liaison makes "deux ans" sound connected.',
      difficulty: 'intermediate',
    },
    {
      id: 'i4',
      phrase: 'Je travaille comme professeur.',
      translation: 'I work as a teacher.',
      pronunciation: 'zhuh trah-VY kohm proh-feh-SUHR',
      tips: 'Travaille has a soft "y" sound. Professeur is gender-neutral.',
      difficulty: 'beginner',
    },
    {
      id: 'i5',
      phrase: 'Ravi(e) de faire votre connaissance.',
      translation: 'Delighted to make your acquaintance.',
      pronunciation: 'rah-VEE duh FAIR votr koh-neh-SAHNS',
      tips: 'Very formal and polite. Great for professional settings.',
      difficulty: 'intermediate',
    },
    {
      id: 'i6',
      phrase: 'J\'ai vingt-cinq ans et j\'étudie le français.',
      translation: 'I am 25 years old and I study French.',
      pronunciation: 'zhay VEHN-SANK ahn ay zhay-tü-DEE luh frahn-SAY',
      tips: 'Remember: French uses "avoir" (to have) for age, not "être".',
      difficulty: 'intermediate',
    },
  ],
  questions: [
    {
      id: 'q1',
      phrase: 'Excusez-moi, où sont les toilettes?',
      translation: 'Excuse me, where are the restrooms?',
      pronunciation: 'ex-kü-ZAY mwah, oo SOHN lay twah-LET?',
      tips: 'Essential phrase! The "oi" in moi sounds like "wah".',
      difficulty: 'beginner',
    },
    {
      id: 'q2',
      phrase: 'Parlez-vous anglais, s\'il vous plaît?',
      translation: 'Do you speak English, please?',
      pronunciation: 'pahr-LAY voo ahn-GLAY, seel voo PLAY?',
      tips: 'Adding s\'il vous plaît makes any request more polite.',
      difficulty: 'beginner',
    },
    {
      id: 'q3',
      phrase: 'Pouvez-vous répéter plus lentement?',
      translation: 'Can you repeat more slowly?',
      pronunciation: 'poo-VAY voo ray-pay-TAY plü lahnt-MAHN?',
      tips: 'Very useful! Pouvez-vous is the polite way to ask "can you".',
      difficulty: 'intermediate',
    },
    {
      id: 'q4',
      phrase: 'Qu\'est-ce que ça veut dire?',
      translation: 'What does that mean?',
      pronunciation: 'kess-kuh sah vuh DEER?',
      tips: 'Qu\'est-ce que is a common question structure. Veut = wants.',
      difficulty: 'intermediate',
    },
    {
      id: 'q5',
      phrase: 'Comment dit-on "thank you" en français?',
      translation: 'How do you say "thank you" in French?',
      pronunciation: 'koh-MAHN dee-TOHN "thank you" ahn frahn-SAY?',
      tips: 'Great for learning new vocabulary! Dit-on = does one say.',
      difficulty: 'beginner',
    },
    {
      id: 'q6',
      phrase: 'Est-ce qu\'il y a un problème?',
      translation: 'Is there a problem?',
      pronunciation: 'ess-keel ee ah uhn proh-BLEM?',
      tips: 'Est-ce que turns any statement into a yes/no question.',
      difficulty: 'intermediate',
    },
  ],
  directions: [
    {
      id: 'd1',
      phrase: 'Où est la gare, s\'il vous plaît?',
      translation: 'Where is the train station, please?',
      pronunciation: 'oo ay lah GAHR, seel voo PLAY?',
      tips: 'Où = where. La gare = the train station (feminine).',
      difficulty: 'beginner',
    },
    {
      id: 'd2',
      phrase: 'C\'est à gauche ou à droite?',
      translation: 'Is it on the left or on the right?',
      pronunciation: 'say tah GOHSH oo ah DRWAHT?',
      tips: 'Gauche = left, Droite = right. Essential for directions!',
      difficulty: 'beginner',
    },
    {
      id: 'd3',
      phrase: 'C\'est loin d\'ici?',
      translation: 'Is it far from here?',
      pronunciation: 'say LWAHN dee-SEE?',
      tips: 'Loin = far. D\'ici = from here. Simple but very useful!',
      difficulty: 'beginner',
    },
    {
      id: 'd4',
      phrase: 'Tournez à gauche au feu rouge.',
      translation: 'Turn left at the red light.',
      pronunciation: 'toor-NAY ah GOHSH oh FUH roozh',
      tips: 'Feu rouge = red light (traffic signal).',
      difficulty: 'intermediate',
    },
    {
      id: 'd5',
      phrase: 'Continuez tout droit pendant deux cents mètres.',
      translation: 'Continue straight for 200 meters.',
      pronunciation: 'kohn-tee-nü-AY too DRWAH pahn-DAHN duh SAHN metr',
      tips: 'Tout droit = straight ahead. Pendant = for (duration).',
      difficulty: 'intermediate',
    },
    {
      id: 'd6',
      phrase: 'Le métro est à cinq minutes à pied.',
      translation: 'The metro is five minutes on foot.',
      pronunciation: 'luh may-TROH ay tah SANK mee-NÜT ah PYAY',
      tips: 'À pied = on foot. Great phrase for city navigation!',
      difficulty: 'intermediate',
    },
  ],
  restaurant: [
    {
      id: 'r1',
      phrase: 'Une table pour deux personnes, s\'il vous plaît.',
      translation: 'A table for two people, please.',
      pronunciation: 'ün TAHBL poor DUH pair-SON, seel voo PLAY',
      tips: 'Start every restaurant interaction politely!',
      difficulty: 'beginner',
    },
    {
      id: 'r2',
      phrase: 'Je voudrais le menu, s\'il vous plaît.',
      translation: 'I would like the menu, please.',
      pronunciation: 'zhuh voo-DRAY luh muh-NÜ, seel voo PLAY',
      tips: 'Je voudrais is the polite conditional form of "I want".',
      difficulty: 'beginner',
    },
    {
      id: 'r3',
      phrase: 'Qu\'est-ce que vous recommandez?',
      translation: 'What do you recommend?',
      pronunciation: 'kess-kuh voo ruh-koh-mahn-DAY?',
      tips: 'Perfect for trying local specialties!',
      difficulty: 'intermediate',
    },
    {
      id: 'r4',
      phrase: 'Je suis végétarien(ne). Y a-t-il des options?',
      translation: 'I am vegetarian. Are there options?',
      pronunciation: 'zhuh SWEE vay-zhay-tah-RYEHN. ee ah-TEEL day op-SYOHN?',
      tips: 'Add "ne" if female. Y a-t-il = is there.',
      difficulty: 'intermediate',
    },
    {
      id: 'r5',
      phrase: 'L\'addition, s\'il vous plaît.',
      translation: 'The check, please.',
      pronunciation: 'lah-dee-SYOHN, seel voo PLAY',
      tips: 'Essential! In France, you must ask for the check.',
      difficulty: 'beginner',
    },
    {
      id: 'r6',
      phrase: 'C\'était délicieux, merci beaucoup!',
      translation: 'It was delicious, thank you very much!',
      pronunciation: 'say-TAY day-lee-SYUH, mair-SEE boh-KOO',
      tips: 'Always compliment the food! It\'s very appreciated.',
      difficulty: 'beginner',
    },
  ],
  shopping: [
    {
      id: 's1',
      phrase: 'Je regarde seulement, merci.',
      translation: 'I\'m just looking, thank you.',
      pronunciation: 'zhuh ruh-GAHRD suhl-MAHN, mair-SEE',
      tips: 'Polite way to tell staff you don\'t need help yet.',
      difficulty: 'beginner',
    },
    {
      id: 's2',
      phrase: 'Combien ça coûte?',
      translation: 'How much does it cost?',
      pronunciation: 'kohm-BYEHN sah KOOT?',
      tips: 'Essential shopping phrase! Combien = how much.',
      difficulty: 'beginner',
    },
    {
      id: 's3',
      phrase: 'Avez-vous ceci en taille moyenne?',
      translation: 'Do you have this in medium size?',
      pronunciation: 'ah-VAY voo suh-SEE ahn TY mwah-YEN?',
      tips: 'Sizes: petit (S), moyen (M), grand (L).',
      difficulty: 'intermediate',
    },
    {
      id: 's4',
      phrase: 'Puis-je l\'essayer?',
      translation: 'Can I try it on?',
      pronunciation: 'pwee-zhuh lay-say-YAY?',
      tips: 'Puis-je is very polite. Essayer = to try (on).',
      difficulty: 'intermediate',
    },
    {
      id: 's5',
      phrase: 'Acceptez-vous les cartes de crédit?',
      translation: 'Do you accept credit cards?',
      pronunciation: 'ak-sep-TAY voo lay KAHRT duh kray-DEE?',
      tips: 'Some smaller shops in France are cash-only!',
      difficulty: 'intermediate',
    },
    {
      id: 's6',
      phrase: 'Je le prends, merci!',
      translation: 'I\'ll take it, thank you!',
      pronunciation: 'zhuh luh PRAHN, mair-SEE',
      tips: 'Le = it (masculine). Use "la" for feminine items.',
      difficulty: 'beginner',
    },
  ],
  travel: [
    {
      id: 't1',
      phrase: 'J\'ai une réservation au nom de Martin.',
      translation: 'I have a reservation under the name Martin.',
      pronunciation: 'zhay ün ray-zair-vah-SYOHN oh NOHM duh mahr-TAHN',
      tips: 'Au nom de = under the name of. Essential for hotels!',
      difficulty: 'intermediate',
    },
    {
      id: 't2',
      phrase: 'À quelle heure est le check-out?',
      translation: 'What time is checkout?',
      pronunciation: 'ah kell UHR ay luh "check-out"?',
      tips: 'French hotels often use English terms like check-out.',
      difficulty: 'beginner',
    },
    {
      id: 't3',
      phrase: 'Où est la porte d\'embarquement?',
      translation: 'Where is the boarding gate?',
      pronunciation: 'oo ay lah PORT dahm-bahr-kuh-MAHN?',
      tips: 'Porte = gate. Embarquement = boarding.',
      difficulty: 'intermediate',
    },
    {
      id: 't4',
      phrase: 'Mon vol a été retardé.',
      translation: 'My flight has been delayed.',
      pronunciation: 'mohn VOHL ah ay-TAY ruh-tahr-DAY',
      tips: 'Vol = flight. Retardé = delayed. Hopefully you won\'t need this!',
      difficulty: 'intermediate',
    },
    {
      id: 't5',
      phrase: 'Je voudrais un billet aller-retour.',
      translation: 'I would like a round-trip ticket.',
      pronunciation: 'zhuh voo-DRAY uhn bee-YAY ah-LAY ruh-TOOR',
      tips: 'Aller-retour = round-trip. Aller simple = one-way.',
      difficulty: 'intermediate',
    },
    {
      id: 't6',
      phrase: 'Y a-t-il le Wi-Fi gratuit?',
      translation: 'Is there free Wi-Fi?',
      pronunciation: 'ee ah-TEEL luh wee-fee grah-TWEE?',
      tips: 'Gratuit = free. Wi-Fi is pronounced like in English.',
      difficulty: 'beginner',
    },
  ],
  emergency: [
    {
      id: 'e1',
      phrase: 'Au secours! J\'ai besoin d\'aide!',
      translation: 'Help! I need help!',
      pronunciation: 'oh suh-KOOR! zhay buh-ZWAHN DED!',
      tips: 'Au secours is for emergencies. Loud and clear!',
      difficulty: 'beginner',
    },
    {
      id: 'e2',
      phrase: 'Appelez une ambulance, s\'il vous plaît!',
      translation: 'Call an ambulance, please!',
      pronunciation: 'ah-puh-LAY ün ahm-bü-LAHNS, seel voo PLAY!',
      tips: 'Emergency number in France is 15 (SAMU) or 112.',
      difficulty: 'intermediate',
    },
    {
      id: 'e3',
      phrase: 'J\'ai perdu mon passeport.',
      translation: 'I lost my passport.',
      pronunciation: 'zhay pair-DÜ mohn pahs-POR',
      tips: 'Contact your embassy immediately if this happens!',
      difficulty: 'beginner',
    },
    {
      id: 'e4',
      phrase: 'Je ne me sens pas bien.',
      translation: 'I don\'t feel well.',
      pronunciation: 'zhuh nuh muh SAHN pah BYEHN',
      tips: 'Se sentir = to feel. Important for describing illness.',
      difficulty: 'beginner',
    },
    {
      id: 'e5',
      phrase: 'Où est l\'hôpital le plus proche?',
      translation: 'Where is the nearest hospital?',
      pronunciation: 'oo ay loh-pee-TAHL luh plü PROSH?',
      tips: 'Le plus proche = the nearest. Critical in emergencies!',
      difficulty: 'intermediate',
    },
    {
      id: 'e6',
      phrase: 'Je suis allergique aux arachides.',
      translation: 'I am allergic to peanuts.',
      pronunciation: 'zhuh SWEE ah-lair-ZHEEK oh zah-rah-SHEED',
      tips: 'Replace "arachides" with your specific allergy!',
      difficulty: 'intermediate',
    },
  ],
};

export default function SpeakingPracticeScreen({ navigation }) {
  const { colors, isDarkMode } = useTheme();
  const { awardXP } = useGamification();

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [practiceAttempts, setPracticeAttempts] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [startTime, setStartTime] = useState(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const micScaleAnim = useRef(new Animated.Value(1)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;

  const exercises = selectedCategory ? SPEAKING_EXERCISES[selectedCategory] : [];
  const currentExercise = exercises[currentIndex];
  const progress = exercises.length > 0 ? ((currentIndex + 1) / exercises.length) * 100 : 0;

  useEffect(() => {
    let timer;
    if (startTime && !sessionCompleted) {
      timer = setInterval(() => {
        setTimeElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => {
      clearInterval(timer);
      stopSpeech();
    };
  }, [startTime, sessionCompleted]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(pulseAnim, { toValue: 1.15, duration: 600, useNativeDriver: true }),
            Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(waveAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
            Animated.timing(waveAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
          ]),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
      waveAnim.setValue(0);
    }
  }, [isRecording]);

  useEffect(() => {
    Animated.spring(progressAnim, {
      toValue: progress,
      tension: 50,
      friction: 8,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const startSession = (categoryId) => {
    setSelectedCategory(categoryId);
    setCurrentIndex(0);
    setPracticeAttempts([]);
    setIsRecording(false);
    setShowTips(false);
    setSessionCompleted(false);
    setTimeElapsed(0);
    setStartTime(Date.now());
  };

  const handlePlayAudio = async () => {
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
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    setShowTips(false);
    Animated.spring(micScaleAnim, { toValue: 1.1, tension: 100, friction: 5, useNativeDriver: true }).start();
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    micScaleAnim.setValue(1);

    const attempt = {
      exerciseId: currentExercise.id,
      completed: true,
      timestamp: Date.now(),
    };
    setPracticeAttempts([...practiceAttempts, attempt]);
  };

  const handleNext = () => {
    if (currentIndex < exercises.length - 1) {
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 0.9, duration: 150, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]).start();

      setCurrentIndex(currentIndex + 1);
      setIsRecording(false);
      setShowTips(false);
    } else {
      finishSession();
    }
  };

  const finishSession = () => {
    setSessionCompleted(true);
    stopSpeech();
    const completionRate = (practiceAttempts.length / exercises.length) * 100;

    if (completionRate >= 90) {
      awardXP(100, 'Speaking Champion! 🎤');
    } else if (completionRate >= 70) {
      awardXP(60, 'Great pronunciation! ⭐');
    } else if (completionRate >= 50) {
      awardXP(30, 'Good speaking practice!');
    } else {
      awardXP(15, 'Speaking practice completed!');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCategoryInfo = () => SPEAKING_CATEGORIES.find(c => c.id === selectedCategory);
  const hasPracticed = practiceAttempts.some(a => a.exerciseId === currentExercise?.id);

  if (!selectedCategory) {
    return (
      <View style={[styles.container, { backgroundColor: isDarkMode ? '#000000' : '#F8FAFC' }]}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

        <LinearGradient
          colors={isDarkMode ? ['#831843', '#500724'] : ['#EC4899', '#DB2777']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.categoryHeader}
        >
          <View style={styles.headerDecor1} />
          <View style={styles.headerDecor2} />
          <View style={styles.headerDecor3} />

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
              <LinearGradient
                colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
                style={styles.headerIconGradient}
              >
                <Ionicons name="mic" size={44} color="#FFFFFF" />
              </LinearGradient>
            </View>
            <Text style={styles.headerTitle}>Speaking Practice</Text>
            <Text style={styles.headerSubtitle}>
              Perfect your French pronunciation
            </Text>
          </Animated.View>
        </LinearGradient>

        <ScrollView
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Choose a Scenario
          </Text>
          <Text style={[styles.sectionSubtitle, { color: colors.secondaryText }]}>
            Practice real-life French conversations
          </Text>

          <View style={styles.categoryGrid}>
            {SPEAKING_CATEGORIES.map((category, index) => (
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
                    { backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF' }
                  ]}
                  onPress={() => startSession(category.id)}
                  activeOpacity={0.8}
                >
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
                    <View style={[styles.phraseBadge, { backgroundColor: category.color + '20' }]}>
                      <Text style={[styles.phraseBadgeText, { color: category.color }]}>6 phrases</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={colors.secondaryText} />
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>

          <View style={[styles.statsCard, { backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF' }]}>
            <LinearGradient
              colors={['#EC4899', '#DB2777']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.statsGradient}
            >
              <View style={styles.statItem}>
                <Text style={styles.statValue}>48</Text>
                <Text style={styles.statLabel}>Phrases</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>8</Text>
                <Text style={styles.statLabel}>Scenarios</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Ionicons name="volume-high" size={28} color="#FFFFFF" />
                <Text style={styles.statLabel}>Audio</Text>
              </View>
            </LinearGradient>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </View>
    );
  }

  if (sessionCompleted) {
    const completionRate = (practiceAttempts.length / exercises.length) * 100;
    const categoryInfo = getCategoryInfo();

    return (
      <View style={[styles.container, { backgroundColor: isDarkMode ? '#000000' : '#F8FAFC' }]}>
        <StatusBar barStyle="light-content" />

        <LinearGradient
          colors={completionRate >= 70 ? ['#10B981', '#059669'] : ['#EC4899', '#DB2777']}
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
              name={completionRate >= 70 ? 'mic' : 'mic-outline'}
              size={56}
              color="#FFFFFF"
            />
          </View>

          <Text style={styles.resultTitle}>
            {completionRate >= 90 ? 'Magnifique!' : completionRate >= 70 ? 'Très Bien!' : completionRate >= 50 ? 'Bon Travail!' : 'Continue!'}
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

          <View style={[styles.scoreCard, { backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF' }]}>
            <View style={styles.scoreRow}>
              <View style={styles.scoreItem}>
                <Text style={[styles.scoreLabel, { color: colors.secondaryText }]}>Practiced</Text>
                <Text style={[styles.scoreValue, { color: colors.text }]}>{practiceAttempts.length}/{exercises.length}</Text>
              </View>
              <View style={[styles.scoreDivider, { backgroundColor: colors.border }]} />
              <View style={styles.scoreItem}>
                <Text style={[styles.scoreLabel, { color: colors.secondaryText }]}>Completion</Text>
                <Text style={[styles.scoreValue, { color: completionRate >= 70 ? '#10B981' : colors.text }]}>
                  {completionRate.toFixed(0)}%
                </Text>
              </View>
              <View style={[styles.scoreDivider, { backgroundColor: colors.border }]} />
              <View style={styles.scoreItem}>
                <Text style={[styles.scoreLabel, { color: colors.secondaryText }]}>Time</Text>
                <Text style={[styles.scoreValue, { color: colors.text }]}>{formatTime(timeElapsed)}</Text>
              </View>
            </View>
          </View>

          <View style={[styles.performanceCard, { backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF' }]}>
            <View style={[
              styles.performanceBadge,
              { backgroundColor: completionRate >= 70 ? '#10B98120' : '#F59E0B20' }
            ]}>
              <Ionicons
                name={completionRate >= 70 ? 'star' : 'trending-up'}
                size={36}
                color={completionRate >= 70 ? '#10B981' : '#F59E0B'}
              />
            </View>
            <Text style={[styles.performanceTitle, { color: colors.text }]}>
              {completionRate >= 90 ? 'Pronunciation Pro!' : completionRate >= 70 ? 'Great Progress!' : 'Keep Practicing!'}
            </Text>
            <Text style={[styles.performanceText, { color: colors.secondaryText }]}>
              {completionRate >= 90
                ? 'Your French pronunciation is excellent! Native speakers will understand you easily.'
                : completionRate >= 70
                ? 'You\'re making great progress with French pronunciation. Keep it up!'
                : 'Practice makes perfect! Keep working on these phrases daily.'}
            </Text>
          </View>

          <View style={styles.resultActions}>
            <TouchableOpacity
              style={[styles.retryBtn, { backgroundColor: isDarkMode ? '#374151' : '#F1F5F9' }]}
              onPress={() => startSession(selectedCategory)}
            >
              <Ionicons name="refresh" size={22} color={colors.text} />
              <Text style={[styles.retryBtnText, { color: colors.text }]}>Retry</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.newSessionBtn}
              onPress={() => setSelectedCategory(null)}
            >
              <LinearGradient
                colors={['#EC4899', '#DB2777']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.newSessionGradient}
              >
                <Ionicons name="grid" size={22} color="#FFFFFF" />
                <Text style={styles.newSessionBtnText}>New Scenario</Text>
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
        colors={categoryInfo?.gradient || ['#EC4899', '#DB2777']}
        style={styles.practiceHeader}
      >
        <View style={styles.practiceHeaderTop}>
          <TouchableOpacity
            style={styles.practiceBackBtn}
            onPress={() => setSelectedCategory(null)}
          >
            <Ionicons name="close" size={26} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.practiceHeaderCenter}>
            <Text style={styles.practiceCategory}>{categoryInfo?.name}</Text>
            <Text style={styles.practiceProgress}>
              {currentIndex + 1} of {exercises.length}
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
      </LinearGradient>

      <ScrollView
        style={styles.practiceScroll}
        contentContainerStyle={styles.practiceContent}
        showsVerticalScrollIndicator={false}
      >

        <Animated.View
          style={[
            styles.phraseCard,
            {
              backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >

          <View style={styles.phraseMeta}>
            <View style={[
              styles.difficultyBadge,
              { backgroundColor: currentExercise?.difficulty === 'beginner' ? '#10B98120' : '#F59E0B20' }
            ]}>
              <Text style={[
                styles.difficultyText,
                { color: currentExercise?.difficulty === 'beginner' ? '#10B981' : '#F59E0B' }
              ]}>
                {currentExercise?.difficulty}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.playBtn, { backgroundColor: categoryInfo?.color + '20' }]}
              onPress={handlePlayAudio}
            >
              <Ionicons
                name={isPlayingAudio ? 'pause' : 'volume-high'}
                size={22}
                color={categoryInfo?.color}
              />
            </TouchableOpacity>
          </View>

          <Text style={[styles.phraseText, { color: colors.text }]}>
            {currentExercise?.phrase}
          </Text>

          <View style={[styles.pronunciationBox, { backgroundColor: isDarkMode ? '#334155' : '#F1F5F9' }]}>
            <Ionicons name="ear" size={18} color={categoryInfo?.color} />
            <Text style={[styles.pronunciationText, { color: colors.secondaryText }]}>
              {currentExercise?.pronunciation}
            </Text>
          </View>

          <View style={[styles.translationBox, { backgroundColor: categoryInfo?.color + '15', borderColor: categoryInfo?.color }]}>
            <Ionicons name="language" size={20} color={categoryInfo?.color} />
            <Text style={[styles.translationText, { color: colors.text }]}>
              {currentExercise?.translation}
            </Text>
          </View>
        </Animated.View>

        <View style={styles.recordingSection}>
          <Text style={[styles.recordingTitle, { color: colors.text }]}>
            {isRecording ? 'Recording...' : hasPracticed ? 'Try Again?' : 'Your Turn!'}
          </Text>
          <Text style={[styles.recordingSubtitle, { color: colors.secondaryText }]}>
            {isRecording ? 'Speak clearly into your microphone' : 'Tap the microphone to practice'}
          </Text>

          <View style={styles.micContainer}>
            {isRecording && (
              <>
                <Animated.View style={[styles.micWave1, { opacity: waveAnim, transform: [{ scale: pulseAnim }] }]} />
                <Animated.View style={[styles.micWave2, { opacity: waveAnim, transform: [{ scale: Animated.add(pulseAnim, 0.2) }] }]} />
              </>
            )}

            <Animated.View style={{ transform: [{ scale: micScaleAnim }] }}>
              <TouchableOpacity
                style={[
                  styles.micBtn,
                  { backgroundColor: isRecording ? '#EF4444' : categoryInfo?.color }
                ]}
                onPress={isRecording ? handleStopRecording : handleStartRecording}
                activeOpacity={0.9}
              >
                <Animated.View style={{ transform: [{ scale: isRecording ? pulseAnim : 1 }] }}>
                  <Ionicons
                    name={isRecording ? 'stop' : 'mic'}
                    size={40}
                    color="#FFFFFF"
                  />
                </Animated.View>
              </TouchableOpacity>
            </Animated.View>
          </View>

          {hasPracticed && (
            <View style={styles.practiceComplete}>
              <Ionicons name="checkmark-circle" size={24} color="#10B981" />
              <Text style={[styles.practiceCompleteText, { color: '#10B981' }]}>
                Great job! You practiced this phrase.
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[styles.tipsToggle, { backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF' }]}
          onPress={() => setShowTips(!showTips)}
        >
          <View style={styles.tipsToggleLeft}>
            <Ionicons name="bulb" size={22} color="#F59E0B" />
            <Text style={[styles.tipsToggleText, { color: colors.text }]}>
              Pronunciation Tips
            </Text>
          </View>
          <Ionicons
            name={showTips ? 'chevron-up' : 'chevron-down'}
            size={22}
            color={colors.secondaryText}
          />
        </TouchableOpacity>

        {showTips && (
          <View style={[styles.tipsContent, { backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF' }]}>
            <Text style={[styles.tipsText, { color: colors.text }]}>
              {currentExercise?.tips}
            </Text>
          </View>
        )}

        {hasPracticed && (
          <TouchableOpacity
            style={styles.nextBtn}
            onPress={handleNext}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={categoryInfo?.gradient || ['#EC4899', '#DB2777']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.nextBtnGradient}
            >
              <Text style={styles.nextBtnText}>
                {currentIndex < exercises.length - 1 ? 'Next Phrase' : 'Finish Session'}
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
    paddingBottom: 44,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    overflow: 'hidden',
  },
  headerDecor1: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  headerDecor2: {
    position: 'absolute',
    bottom: -40,
    left: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  headerDecor3: {
    position: 'absolute',
    top: 80,
    left: 60,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  backBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerIconWrap: {
    marginBottom: 16,
  },
  headerIconGradient: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
  },
  categoryScroll: {
    flex: 1,
  },
  categoryContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: -0.3,
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
    padding: 18,
    borderRadius: 22,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  categoryIcon: {
    width: 54,
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  categoryName: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  categoryDesc: {
    fontSize: 12,
    marginBottom: 12,
  },
  categoryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  phraseBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  phraseBadgeText: {
    fontSize: 11,
    fontWeight: '700',
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

  practiceHeader: {
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: 28,
    paddingHorizontal: 20,
  },
  practiceHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  practiceBackBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  practiceHeaderCenter: {
    alignItems: 'center',
  },
  practiceCategory: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  practiceProgress: {
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

  practiceScroll: {
    flex: 1,
  },
  practiceContent: {
    padding: 20,
  },
  phraseCard: {
    padding: 24,
    borderRadius: 26,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  phraseMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  difficultyBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  playBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phraseText: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: 16,
  },
  pronunciationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 14,
    gap: 10,
    marginBottom: 16,
  },
  pronunciationText: {
    fontSize: 15,
    fontStyle: 'italic',
    flex: 1,
    textAlign: 'center',
  },
  translationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  translationText: {
    fontSize: 17,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },

  recordingSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  recordingTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 6,
  },
  recordingSubtitle: {
    fontSize: 14,
    marginBottom: 28,
  },
  micContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 160,
    height: 160,
    marginBottom: 20,
  },
  micWave1: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: '#EF4444',
  },
  micWave2: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
    borderColor: '#EF444480',
  },
  micBtn: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  practiceComplete: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#10B98115',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 16,
  },
  practiceCompleteText: {
    fontSize: 14,
    fontWeight: '600',
  },

  tipsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    borderRadius: 18,
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  tipsToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tipsToggleText: {
    fontSize: 16,
    fontWeight: '600',
  },
  tipsContent: {
    padding: 18,
    borderRadius: 18,
    marginTop: 8,
    marginBottom: 24,
  },
  tipsText: {
    fontSize: 15,
    lineHeight: 24,
  },

  nextBtn: {
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#EC4899',
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
    paddingBottom: 56,
    alignItems: 'center',
    overflow: 'hidden',
  },
  resultDecor1: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  resultDecor2: {
    position: 'absolute',
    bottom: -60,
    left: -60,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  closeBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 50,
    right: 20,
    width: 46,
    height: 46,
    borderRadius: 23,
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
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  resultTitle: {
    fontSize: 38,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  resultSubtitle: {
    fontSize: 17,
    color: 'rgba(255,255,255,0.9)',
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
  performanceCard: {
    padding: 24,
    borderRadius: 22,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  performanceBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  performanceTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  performanceText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 24,
  },
  resultActions: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 8,
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
  newSessionBtn: {
    flex: 1,
    borderRadius: 18,
    overflow: 'hidden',
  },
  newSessionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 10,
  },
  newSessionBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
