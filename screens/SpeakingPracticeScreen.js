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
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { useTheme } from '../src/context/ThemeContext';
import { useGamification } from '../src/context/GamificationContext';
import { speakText, stopSpeech } from '../src/utils/textToSpeech';
import { getThemeColors, themeShadows, themeRadius } from '../src/utils/organicTheme';
import { aiAPI } from '../src/services/api';

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

const SPEAKING_CATEGORIES = [
  { id: 'greetings', name: 'Greetings', icon: 'hand-right', color: '#1E3A5F', gradient: ['#1E3A5F', '#2D4A6F'], desc: 'Say hello & goodbye' },
  { id: 'introductions', name: 'Introductions', icon: 'person', color: '#8B5CF6', gradient: ['#8B5CF6', '#7C3AED'], desc: 'Introduce yourself' },
  { id: 'questions', name: 'Questions', icon: 'help-circle', color: '#5B8FB9', gradient: ['#5B8FB9', '#7AA8D4'], desc: 'Ask for help' },
  { id: 'directions', name: 'Directions', icon: 'navigate', color: '#2E7D5A', gradient: ['#2E7D5A', '#3A6BA7'], desc: 'Find your way' },
  { id: 'restaurant', name: 'Restaurant', icon: 'restaurant', color: '#C9A227', gradient: ['#C9A227', '#D4B445'], desc: 'Order food & drinks' },
  { id: 'shopping', name: 'Shopping', icon: 'cart', color: '#C94C4C', gradient: ['#C94C4C', '#E57373'], desc: 'Buy things' },
  { id: 'travel', name: 'Travel', icon: 'airplane', color: '#0EA5E9', gradient: ['#0EA5E9', '#0284C7'], desc: 'Airport & hotel' },
  { id: 'emergency', name: 'Emergency', icon: 'medkit', color: '#EF4444', gradient: ['#EF4444', '#B91C1C'], desc: 'Get help fast' },
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
  const { isDarkMode, toggleTheme } = useTheme();
  const theme = getThemeColors(isDarkMode);
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

  // New states for redesign
  const scrollY = useRef(new Animated.Value(0)).current;
  const [headerInteractable, setHeaderInteractable] = useState(false);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: false,
      listener: (event) => {
        const offset = event.nativeEvent.contentOffset.y;
        if (offset > 40 && !headerInteractable) setHeaderInteractable(true);
        else if (offset <= 40 && headerInteractable) setHeaderInteractable(false);
      }
    }
  );

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 60],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

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

  const [recording, setRecording] = useState(null);
  const [recordedUri, setRecordedUri] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const startSession = (categoryId) => {
    // ... same as before but ensure recording is reset
    setSelectedCategory(categoryId);
    setCurrentIndex(0);
    setPracticeAttempts([]);
    setIsRecording(false);
    setRecordedUri(null);
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

  const handleStartRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') return;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
      setShowTips(false);
      Animated.spring(micScaleAnim, { toValue: 1.1, tension: 100, friction: 5, useNativeDriver: true }).start();
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const handleStopRecording = async () => {
    setIsRecording(false);
    micScaleAnim.setValue(1);

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecordedUri(uri);
      setRecording(null);
      setIsEvaluating(true);

      // Convert audio to base64
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: 'base64',
      });

      // Call evaluation API
      const response = await aiAPI.evaluatePronunciation({
        targetText: currentExercise.phrase,
        audioBase64: base64,
        mimeType: Platform.OS === 'ios' ? 'audio/mpeg' : 'audio/m4a'
      });

      let evalData = null;
      if (response.data.success) {
        evalData = response.data.data;
        setEvaluation(evalData);

        // Award points based on score
        if (evalData.score >= 80) {
          addPoints(15, 'Excellent Pronunciation!');
        } else if (evalData.score >= 60) {
          addPoints(10, 'Good Job!');
        }
      }

      const attempt = {
        exerciseId: currentExercise.id,
        completed: true,
        uri: uri,
        evaluation: evalData,
        score: evalData?.score || 0,
        timestamp: Date.now(),
      };
      setPracticeAttempts([...practiceAttempts, attempt]);
    } catch (err) {
      console.error('Failed to stop/evaluate recording', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handlePlayRecorded = async () => {
    if (!recordedUri) return;
    try {
      const { sound } = await Audio.Sound.createAsync({ uri: recordedUri });
      await sound.playAsync();
    } catch (err) {
      console.error('Failed to play recording', err);
    }
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
      setEvaluation(null);
      setRecordedUri(null);
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
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

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
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.navBackBtn}
              >
                <Ionicons name="chevron-back" size={24} color={theme.text} />
              </TouchableOpacity>
              <Text style={[styles.navTitle, { color: theme.text }]}>Speaking</Text>
            </View>
            <TouchableOpacity
              onPress={toggleTheme}
              style={[styles.navIconBtn, { backgroundColor: theme.surfaceAlt }]}
            >
              <Ionicons name={isDarkMode ? 'sunny' : 'moon'} size={20} color={theme.text} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        <Animated.ScrollView
          style={styles.scrollView}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.heroSection}>
            <View style={styles.heroContent}>
              <BackgroundBlur style={styles.blurTop} color={theme.primary} />
              <View style={styles.heroHeader}>
                <TouchableOpacity
                  onPress={() => navigation.goBack()}
                  style={[styles.backCircle, { backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1 }]}
                >
                  <Ionicons name="chevron-back" size={24} color={theme.text} />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={toggleTheme}
                  style={[styles.themeToggle, { backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1 }]}
                >
                  <Ionicons name={isDarkMode ? 'sunny' : 'moon'} size={20} color={theme.text} />
                </TouchableOpacity>
              </View>

              <Animated.View style={[styles.greetingSection, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                <Text style={[styles.greetingSubtitle, { color: theme.secondary }]}>CONVERSATIONAL FLUENCY</Text>
                <Text style={[styles.greetingTitle, { color: theme.text }]}>Speaking</Text>
                <Text style={[styles.heroDescription, { color: theme.textSecondary }]}>
                  Master real-life French conversations with our voice-guided speaking exercises.
                </Text>
              </Animated.View>
            </View>
          </View>

          <View style={styles.contentBody}>
            <View style={[styles.statsOverview, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={styles.overviewItem}>
                <Text style={[styles.overviewValue, { color: theme.text }]}>48</Text>
                <Text style={[styles.overviewLabel, { color: theme.textSecondary }]}>Phrases</Text>
              </View>
              <View style={[styles.overviewDivider, { backgroundColor: theme.border }]} />
              <View style={styles.overviewItem}>
                <Text style={[styles.overviewValue, { color: theme.text }]}>8</Text>
                <Text style={[styles.overviewLabel, { color: theme.textSecondary }]}>Scenario</Text>
              </View>
              <View style={[styles.overviewDivider, { backgroundColor: theme.border }]} />
              <View style={styles.overviewItem}>
                <Text style={[styles.overviewValue, { color: theme.text }]}>Voice</Text>
                <Text style={[styles.overviewLabel, { color: theme.textSecondary }]}>Active</Text>
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <View style={[styles.titleAccent, { backgroundColor: theme.primary }]} />
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Choose a Scenario</Text>
              </View>
            </View>

            <View style={styles.categoryGrid}>
              {SPEAKING_CATEGORIES.map((category, index) => (
                <Animated.View
                  key={category.id}
                  style={[
                    styles.categoryWrapper,
                    {
                      opacity: fadeAnim,
                      transform: [
                        { translateY: Animated.multiply(slideAnim, new Animated.Value(1 + index * 0.1)) },
                        { scale: scaleAnim }
                      ],
                    }
                  ]}
                >
                  <TouchableOpacity
                    style={[styles.categoryCard, { backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1 }, themeShadows.sm]}
                    onPress={() => startSession(category.id)}
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
                      <Ionicons name="mic-outline" size={16} color={theme.primary} />
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

  if (sessionCompleted) {
    const completionRate = (practiceAttempts.length / exercises.length) * 100;
    const categoryInfo = getCategoryInfo();

    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <StatusBar barStyle="light-content" />

        <LinearGradient
          colors={completionRate >= 70 ? [theme.success, theme.primary] : [theme.primary, theme.primaryLight]}
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
          <View style={[styles.scoreCard, { backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1 }, themeShadows.md]}>
            <View style={styles.scoreRow}>
              <View style={styles.scoreItem}>
                <View style={[styles.scoreIcon, { backgroundColor: theme.primary + '15' }]}>
                  <Ionicons name="mic" size={24} color={theme.primary} />
                </View>
                <Text style={[styles.scoreValue, { color: theme.text }]}>{practiceAttempts.length}/{exercises.length}</Text>
                <Text style={[styles.scoreLabel, { color: theme.textSecondary }]}>Practiced</Text>
              </View>
              <View style={[styles.scoreDivider, { backgroundColor: theme.border }]} />
              <View style={styles.scoreItem}>
                <View style={[styles.scoreIcon, { backgroundColor: theme.success + '15' }]}>
                  <Ionicons name="trending-up" size={24} color={theme.success} />
                </View>
                <Text style={[styles.scoreValue, { color: completionRate >= 70 ? theme.success : theme.text }]}>
                  {completionRate.toFixed(0)}%
                </Text>
                <Text style={[styles.scoreLabel, { color: theme.textSecondary }]}>Rate</Text>
              </View>
              <View style={[styles.scoreDivider, { backgroundColor: theme.border }]} />
              <View style={styles.scoreItem}>
                <View style={[styles.scoreIcon, { backgroundColor: theme.secondary + '15' }]}>
                  <Ionicons name="time" size={24} color={theme.secondary} />
                </View>
                <Text style={[styles.scoreValue, { color: theme.text }]}>{formatTime(timeElapsed)}</Text>
                <Text style={[styles.scoreLabel, { color: theme.textSecondary }]}>Time</Text>
              </View>
            </View>
          </View>

          <View style={[styles.performanceCard, { backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1 }, themeShadows.sm]}>
            <View style={[
              styles.performanceBadge,
              { backgroundColor: completionRate >= 70 ? theme.success + '20' : theme.secondary + '20' }
            ]}>
              <Ionicons
                name={completionRate >= 70 ? 'star' : 'trending-up'}
                size={36}
                color={completionRate >= 70 ? theme.success : theme.secondary}
              />
            </View>
            <View style={styles.performanceInfo}>
              <Text style={[styles.performanceTitle, { color: theme.text }]}>Performance Insights</Text>
              <Text style={[styles.performanceDesc, { color: theme.textSecondary }]}>
                {completionRate >= 70 ? 'Your pronunciation is improving significantly. Keep practicing these scenarios to build fluency.' : 'Keep practicing! Regular speaking exercises will help you master the rhythm and intonation of French.'}
              </Text>
            </View>
          </View>

          <View style={styles.resultActions}>
            <TouchableOpacity
              style={[styles.retryBtn, { backgroundColor: theme.surfaceAlt, borderColor: theme.border, borderWidth: 1 }]}
              onPress={() => startSession(selectedCategory)}
            >
              <Ionicons name="refresh" size={22} color={theme.text} />
              <Text style={[styles.retryBtnText, { color: theme.text }]}>Practice Again</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.newDeckBtn}
              onPress={() => setSelectedCategory(null)}
            >
              <LinearGradient
                colors={[theme.primary, theme.primaryLight]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.newDeckGradient}
              >
                <Ionicons name="grid" size={22} color="#FFFFFF" />
                <Text style={styles.newDeckBtnText}>Back to Hub</Text>
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
      <StatusBar barStyle="light-content" />

      <LinearGradient
        colors={categoryInfo?.gradient || [theme.primary, theme.primaryLight]}
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
              backgroundColor: theme.surface,
              borderColor: theme.border,
              borderWidth: 1,
              transform: [{ scale: scaleAnim }]
            },
            themeShadows.md
          ]}
        >
          <View style={styles.phraseMeta}>
            <View style={[
              styles.difficultyBadge,
              { backgroundColor: currentExercise?.difficulty === 'beginner' ? theme.success + '20' : theme.secondary + '20' }
            ]}>
              <Text style={[
                styles.difficultyText,
                { color: currentExercise?.difficulty === 'beginner' ? theme.success : theme.secondary }
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

          <Text style={[styles.phraseText, { color: theme.text }]}>
            {currentExercise?.phrase}
          </Text>

          <View style={[styles.pronunciationBox, { backgroundColor: theme.surfaceAlt }]}>
            <Ionicons name="ear" size={18} color={categoryInfo?.color} />
            <Text style={[styles.pronunciationText, { color: theme.textSecondary }]}>
              {currentExercise?.pronunciation}
            </Text>
          </View>

          <View style={[styles.translationBox, { backgroundColor: categoryInfo?.color + '15', borderColor: categoryInfo?.color }]}>
            <Ionicons name="language" size={20} color={categoryInfo?.color} />
            <Text style={[styles.translationText, { color: theme.text }]}>
              {currentExercise?.translation}
            </Text>
          </View>
        </Animated.View>

        <View style={styles.recordingSection}>
          <Text style={[styles.recordingTitle, { color: theme.text }]}>
            {isRecording ? 'Recording...' : hasPracticed ? 'Try Again?' : 'Your Turn!'}
          </Text>
          <Text style={[styles.recordingSubtitle, { color: theme.textSecondary }]}>
            {isRecording ? 'Speak clearly into your microphone' : 'Tap the microphone to practice'}
          </Text>

          <View style={styles.micContainer}>
            {isRecording && (
              <>
                <Animated.View style={[styles.micWave1, { opacity: waveAnim, transform: [{ scale: pulseAnim }], backgroundColor: theme.error }]} />
                <Animated.View style={[styles.micWave2, { opacity: waveAnim, transform: [{ scale: Animated.add(pulseAnim, 0.2) }], backgroundColor: theme.error }]} />
              </>
            )}

            <Animated.View style={{ transform: [{ scale: micScaleAnim }] }}>
              <TouchableOpacity
                style={[
                  styles.micBtn,
                  { backgroundColor: isRecording ? theme.error : categoryInfo?.color },
                  themeShadows.md
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

          {isEvaluating && (
            <View style={styles.evaluatingContainer}>
              <ActivityIndicator size="small" color={categoryInfo?.color} />
              <Text style={[styles.evaluatingText, { color: theme.textSecondary }]}>
                Analyzing your pronunciation...
              </Text>
            </View>
          )}

          {evaluation && (
            <View style={[styles.evaluationResult, { backgroundColor: theme.surfaceAlt }]}>
              <View style={styles.evaluationHeader}>
                <View style={[styles.scoreBadge, { backgroundColor: evaluation.score >= 80 ? theme.success : evaluation.score >= 60 ? theme.warning : theme.error }]}>
                  <Text style={styles.scoreText}>{evaluation.score}</Text>
                  <Text style={styles.scoreLabel}>Score</Text>
                </View>
                <View style={styles.evaluationStats}>
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: theme.text }]}>{evaluation.accuracyScore}%</Text>
                    <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Accuracy</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: theme.text }]}>{evaluation.fluencyScore}%</Text>
                    <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Fluency</Text>
                  </View>
                </View>
              </View>

              <View style={styles.transcriptionBox}>
                <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>I HEARD:</Text>
                <Text style={[styles.transcriptionText, { color: theme.text }]}>"{evaluation.transcription}"</Text>
              </View>

              <View style={styles.feedbackBox}>
                <View style={styles.sectionLabelRow}>
                  <Ionicons name="chatbubble-ellipses" size={14} color={theme.textSecondary} />
                  <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>TUTOR FEEDBACK</Text>
                </View>
                <Text style={[styles.feedbackText, { color: theme.text }]}>{evaluation.feedback}</Text>
              </View>
            </View>
          )}

          {hasPracticed && !isEvaluating && (
            <View style={styles.practiceComplete}>
              <View style={styles.practiceFeedbackRow}>
                <Ionicons name="checkmark-circle" size={24} color={theme.success} />
                <Text style={[styles.practiceCompleteText, { color: theme.success }]}>
                  Recorded successfully!
                </Text>
              </View>
              {recordedUri && (
                <TouchableOpacity
                  style={[styles.playBackBtn, { backgroundColor: theme.surfaceAlt }]}
                  onPress={handlePlayRecorded}
                >
                  <Ionicons name="play-circle" size={20} color={categoryInfo?.color} />
                  <Text style={[styles.playBackText, { color: categoryInfo?.color }]}>Listen to yourself</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[styles.tipsToggle, { backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1 }]}
          onPress={() => setShowTips(!showTips)}
        >
          <View style={styles.tipsToggleLeft}>
            <Ionicons name="bulb" size={22} color={theme.secondary} />
            <Text style={[styles.tipsToggleText, { color: theme.text }]}>
              Pronunciation Tips
            </Text>
          </View>
          <Ionicons
            name={showTips ? 'chevron-up' : 'chevron-down'}
            size={22}
            color={theme.textSecondary}
          />
        </TouchableOpacity>

        {showTips && (
          <View style={[styles.tipsContent, { backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1 }]}>
            <Text style={[styles.tipsText, { color: theme.text }]}>
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
              colors={[theme.primary, theme.primaryLight]}
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
  scrollView: {
    flex: 1,
  },
  floatingNavBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 100 : 80,
    paddingTop: Platform.OS === 'ios' ? 44 : 24,
    zIndex: 100,
    borderBottomWidth: 1,
    justifyContent: 'center',
  },
  navBarContent: {
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
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  navIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroSection: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 24,
  },
  heroContent: {
    padding: 24,
    paddingTop: 40,
    overflow: 'hidden',
  },
  blurTop: {
    top: -100,
    right: -100,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  backCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeToggle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greetingSection: {
    marginBottom: 8,
  },
  greetingSubtitle: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 8,
  },
  greetingTitle: {
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: -1,
    marginBottom: 12,
  },
  heroDescription: {
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.8,
  },
  contentBody: {
    paddingHorizontal: 20,
  },
  statsOverview: {
    flexDirection: 'row',
    padding: 24,
    borderRadius: 24,
    marginBottom: 32,
    borderWidth: 1,
  },
  overviewItem: {
    flex: 1,
    alignItems: 'center',
  },
  overviewValue: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  overviewLabel: {
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.6,
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
    width: 6,
    height: 24,
    borderRadius: 3,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  categoryGrid: {
    gap: 12,
  },
  categoryWrapper: {
    marginBottom: 12,
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
    opacity: 0.7,
  },
  playCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
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
  },
  micWave2: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
  },
  micBtn: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  practiceComplete: {
    marginTop: 20,
    alignItems: 'center',
    gap: 12,
  },
  practiceFeedbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  practiceCompleteText: {
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 8,
  },
  evaluatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    gap: 10,
  },
  evaluatingText: {
    fontSize: 14,
    fontWeight: '500',
  },
  evaluationResult: {
    marginTop: 20,
    borderRadius: 20,
    padding: 20,
    width: '100%',
  },
  evaluationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 20,
  },
  scoreBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
  },
  scoreLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  evaluationStats: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  transcriptionBox: {
    marginBottom: 15,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 12,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  transcriptionText: {
    fontSize: 15,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  feedbackBox: {
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 12,
  },
  feedbackText: {
    fontSize: 14,
    lineHeight: 20,
  },
  playBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 8,
    marginTop: 10,
  },
  playBackText: {
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
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  scoreItem: {
    alignItems: 'center',
  },
  scoreIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  scoreLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: '800',
  },
  scoreDivider: {
    width: 1,
    height: 70,
  },
  performanceCard: {
    padding: 24,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 20,
  },
  performanceBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  performanceInfo: {
    flex: 1,
  },
  performanceTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  performanceDesc: {
    fontSize: 14,
    lineHeight: 20,
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
  newDeckBtn: {
    flex: 1,
    borderRadius: 18,
    overflow: 'hidden',
  },
  newDeckGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 10,
  },
  newDeckBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
