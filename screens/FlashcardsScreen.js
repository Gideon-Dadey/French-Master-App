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
  PanResponder,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../src/context/ThemeContext';
import { useGamification } from '../src/context/GamificationContext';
import { speakText, stopSpeech } from '../src/utils/textToSpeech';
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

const FLASHCARD_CATEGORIES = [
  { id: 'greetings', name: 'Greetings', icon: 'hand-right', color: '#1E3A5F', gradient: ['#1E3A5F', '#2D4A6F'], desc: 'Say hello & goodbye' },
  { id: 'essentials', name: 'Essentials', icon: 'star', color: '#C9A227', gradient: ['#C9A227', '#D4B445'], desc: 'Must-know words' },
  { id: 'food', name: 'Food & Drinks', icon: 'restaurant', color: '#C94C4C', gradient: ['#C94C4C', '#E57373'], desc: 'Delicious vocabulary' },
  { id: 'travel', name: 'Travel', icon: 'airplane', color: '#5B8FB9', gradient: ['#5B8FB9', '#7AA8D4'], desc: 'Explore France' },
  { id: 'family', name: 'Family', icon: 'people', color: '#8B5CF6', gradient: ['#8B5CF6', '#7C3AED'], desc: 'Family members' },
  { id: 'numbers', name: 'Numbers', icon: 'calculator', color: '#2E7D5A', gradient: ['#2E7D5A', '#3A6BA7'], desc: 'Count in French' },
  { id: 'time', name: 'Time & Days', icon: 'time', color: '#0EA5E9', gradient: ['#0EA5E9', '#0284C7'], desc: 'Schedules' },
  { id: 'adjectives', name: 'Adjectives', icon: 'color-palette', color: '#14B8A6', gradient: ['#14B8A6', '#0D9488'], desc: 'Describe things' },
];

const FLASHCARD_DATA = {
  greetings: [
    { id: 'g1', word: 'Bonjour', translation: 'Hello / Good morning', pronunciation: 'bohn-ZHOOR', example: 'Bonjour, comment allez-vous?', exampleEn: 'Hello, how are you?' },
    { id: 'g2', word: 'Bonsoir', translation: 'Good evening', pronunciation: 'bohn-SWAHR', example: 'Bonsoir, madame!', exampleEn: 'Good evening, madam!' },
    { id: 'g3', word: 'Au revoir', translation: 'Goodbye', pronunciation: 'oh ruh-VWAHR', example: 'Au revoir, à demain!', exampleEn: 'Goodbye, see you tomorrow!' },
    { id: 'g4', word: 'Salut', translation: 'Hi / Bye (informal)', pronunciation: 'sah-LOO', example: 'Salut, ça va?', exampleEn: 'Hi, how\'s it going?' },
    { id: 'g5', word: 'Enchanté', translation: 'Nice to meet you', pronunciation: 'ahn-shahn-TAY', example: 'Enchanté de vous rencontrer.', exampleEn: 'Nice to meet you.' },
    { id: 'g6', word: 'Bonne nuit', translation: 'Good night', pronunciation: 'bun NWEE', example: 'Bonne nuit, fais de beaux rêves!', exampleEn: 'Good night, sweet dreams!' },
  ],
  essentials: [
    { id: 'e1', word: 'Merci', translation: 'Thank you', pronunciation: 'mehr-SEE', example: 'Merci beaucoup!', exampleEn: 'Thank you very much!' },
    { id: 'e2', word: 'S\'il vous plaît', translation: 'Please (formal)', pronunciation: 'seel voo PLEH', example: 'Un café, s\'il vous plaît.', exampleEn: 'A coffee, please.' },
    { id: 'e3', word: 'Oui / Non', translation: 'Yes / No', pronunciation: 'WEE / NOH', example: 'Oui, je comprends.', exampleEn: 'Yes, I understand.' },
    { id: 'e4', word: 'Excusez-moi', translation: 'Excuse me', pronunciation: 'ex-koo-zay-MWAH', example: 'Excusez-moi, où est...?', exampleEn: 'Excuse me, where is...?' },
    { id: 'e5', word: 'Je ne comprends pas', translation: 'I don\'t understand', pronunciation: 'zhuh nuh kohm-PRAHN pah', example: 'Désolé, je ne comprends pas.', exampleEn: 'Sorry, I don\'t understand.' },
    { id: 'e6', word: 'Parlez-vous anglais?', translation: 'Do you speak English?', pronunciation: 'par-lay VOO ahn-GLEH', example: 'Parlez-vous anglais, s\'il vous plaît?', exampleEn: 'Do you speak English, please?' },
  ],
  food: [
    { id: 'f1', word: 'Le pain', translation: 'Bread', pronunciation: 'luh PAHN', example: 'Je voudrais du pain.', exampleEn: 'I would like some bread.' },
    { id: 'f2', word: 'L\'eau', translation: 'Water', pronunciation: 'LOH', example: 'Une bouteille d\'eau, s\'il vous plaît.', exampleEn: 'A bottle of water, please.' },
    { id: 'f3', word: 'Le vin', translation: 'Wine', pronunciation: 'luh VAHN', example: 'Un verre de vin rouge.', exampleEn: 'A glass of red wine.' },
    { id: 'f4', word: 'Le fromage', translation: 'Cheese', pronunciation: 'luh froh-MAHZH', example: 'J\'adore le fromage français!', exampleEn: 'I love French cheese!' },
    { id: 'f5', word: 'Le café', translation: 'Coffee', pronunciation: 'luh kah-FAY', example: 'Un café crème, s\'il vous plaît.', exampleEn: 'A coffee with cream, please.' },
    { id: 'f6', word: 'Le croissant', translation: 'Croissant', pronunciation: 'luh kwah-SAHN', example: 'Deux croissants au beurre.', exampleEn: 'Two butter croissants.' },
  ],
  travel: [
    { id: 't1', word: 'La gare', translation: 'Train station', pronunciation: 'lah GAHR', example: 'Où est la gare?', exampleEn: 'Where is the train station?' },
    { id: 't2', word: 'L\'aéroport', translation: 'Airport', pronunciation: 'lah-ay-roh-POHR', example: 'Je vais à l\'aéroport.', exampleEn: 'I\'m going to the airport.' },
    { id: 't3', word: 'L\'hôtel', translation: 'Hotel', pronunciation: 'loh-TELL', example: 'J\'ai réservé un hôtel.', exampleEn: 'I booked a hotel.' },
    { id: 't4', word: 'Le billet', translation: 'Ticket', pronunciation: 'luh bee-YAY', example: 'Un billet aller-retour.', exampleEn: 'A round-trip ticket.' },
    { id: 't5', word: 'La valise', translation: 'Suitcase', pronunciation: 'lah vah-LEEZ', example: 'Ma valise est lourde.', exampleEn: 'My suitcase is heavy.' },
    { id: 't6', word: 'Le passeport', translation: 'Passport', pronunciation: 'luh pass-POHR', example: 'Voici mon passeport.', exampleEn: 'Here is my passport.' },
  ],
  family: [
    { id: 'fa1', word: 'La mère', translation: 'Mother', pronunciation: 'lah MEHR', example: 'Ma mère est médecin.', exampleEn: 'My mother is a doctor.' },
    { id: 'fa2', word: 'Le père', translation: 'Father', pronunciation: 'luh PEHR', example: 'Mon père travaille à Paris.', exampleEn: 'My father works in Paris.' },
    { id: 'fa3', word: 'Le frère', translation: 'Brother', pronunciation: 'luh FREHR', example: 'J\'ai un grand frère.', exampleEn: 'I have an older brother.' },
    { id: 'fa4', word: 'La sœur', translation: 'Sister', pronunciation: 'lah SUHR', example: 'Ma sœur habite à Lyon.', exampleEn: 'My sister lives in Lyon.' },
    { id: 'fa5', word: 'Les enfants', translation: 'Children', pronunciation: 'lay zahn-FAHN', example: 'Ils ont trois enfants.', exampleEn: 'They have three children.' },
    { id: 'fa6', word: 'Les grands-parents', translation: 'Grandparents', pronunciation: 'lay grahn-pah-RAHN', example: 'Mes grands-parents sont adorables.', exampleEn: 'My grandparents are adorable.' },
  ],
  numbers: [
    { id: 'n1', word: 'Un, deux, trois', translation: '1, 2, 3', pronunciation: 'uhn, duh, twah', example: 'Comptez: un, deux, trois!', exampleEn: 'Count: one, two, three!' },
    { id: 'n2', word: 'Quatre, cinq, six', translation: '4, 5, 6', pronunciation: 'katr, sank, sees', example: 'J\'ai cinq frères.', exampleEn: 'I have five brothers.' },
    { id: 'n3', word: 'Sept, huit, neuf, dix', translation: '7, 8, 9, 10', pronunciation: 'set, weet, nuhf, dees', example: 'Il est dix heures.', exampleEn: 'It\'s ten o\'clock.' },
    { id: 'n4', word: 'Vingt', translation: '20', pronunciation: 'vahn', example: 'Ça coûte vingt euros.', exampleEn: 'It costs twenty euros.' },
    { id: 'n5', word: 'Cinquante', translation: '50', pronunciation: 'san-KAHNT', example: 'Il a cinquante ans.', exampleEn: 'He is fifty years old.' },
    { id: 'n6', word: 'Cent', translation: '100', pronunciation: 'sahn', example: 'Il y a cent personnes.', exampleEn: 'There are a hundred people.' },
  ],
  time: [
    { id: 'ti1', word: 'Aujourd\'hui', translation: 'Today', pronunciation: 'oh-zhoor-DWEE', example: 'Aujourd\'hui c\'est lundi.', exampleEn: 'Today is Monday.' },
    { id: 'ti2', word: 'Demain', translation: 'Tomorrow', pronunciation: 'duh-MAHN', example: 'À demain!', exampleEn: 'See you tomorrow!' },
    { id: 'ti3', word: 'Hier', translation: 'Yesterday', pronunciation: 'ee-EHR', example: 'Hier, j\'ai travaillé.', exampleEn: 'Yesterday, I worked.' },
    { id: 'ti4', word: 'Le matin', translation: 'Morning', pronunciation: 'luh mah-TAHN', example: 'Je travaille le matin.', exampleEn: 'I work in the morning.' },
    { id: 'ti5', word: 'Le soir', translation: 'Evening', pronunciation: 'luh SWAHR', example: 'On se voit ce soir.', exampleEn: 'See you this evening.' },
    { id: 'ti6', word: 'La semaine', translation: 'Week', pronunciation: 'lah suh-MEN', example: 'La semaine prochaine.', exampleEn: 'Next week.' },
  ],
  adjectives: [
    { id: 'a1', word: 'Grand / Grande', translation: 'Big / Tall', pronunciation: 'grahn / grahnd', example: 'C\'est une grande maison.', exampleEn: 'It\'s a big house.' },
    { id: 'a2', word: 'Petit / Petite', translation: 'Small / Short', pronunciation: 'puh-TEE / puh-TEET', example: 'Un petit café.', exampleEn: 'A small coffee.' },
    { id: 'a3', word: 'Beau / Belle', translation: 'Beautiful / Handsome', pronunciation: 'boh / bell', example: 'Quelle belle journée!', exampleEn: 'What a beautiful day!' },
    { id: 'a4', word: 'Bon / Bonne', translation: 'Good', pronunciation: 'bohn / bun', example: 'C\'est très bon!', exampleEn: 'It\'s very good!' },
    { id: 'a5', word: 'Nouveau / Nouvelle', translation: 'New', pronunciation: 'noo-VOH / noo-VEL', example: 'J\'ai une nouvelle voiture.', exampleEn: 'I have a new car.' },
    { id: 'a6', word: 'Heureux / Heureuse', translation: 'Happy', pronunciation: 'uh-RUH / uh-RUHZ', example: 'Je suis très heureux!', exampleEn: 'I am very happy!' },
  ],
};

export default function FlashcardsScreen({ navigation }) {
  const { isDarkMode, toggleTheme } = useTheme();
  const theme = getThemeColors(isDarkMode);
  const { awardXP } = useGamification();

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownCards, setKnownCards] = useState([]);
  const [reviewCards, setReviewCards] = useState([]);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [streak, setStreak] = useState(0);

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
  const flipAnim = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const cards = selectedCategory ? FLASHCARD_DATA[selectedCategory] : [];
  const currentCard = cards[currentIndex];
  const progress = cards.length > 0 ? ((currentIndex + 1) / cards.length) * 100 : 0;

  useEffect(() => {
    let timer;
    if (startTime && !sessionCompleted) {
      timer = setInterval(() => {
        setTimeElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [startTime, sessionCompleted]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true }),
    ]).start();
  }, []);

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
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 400, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [streak]);

  const startSession = (categoryId) => {
    setSelectedCategory(categoryId);
    setCurrentIndex(0);
    setIsFlipped(false);
    setKnownCards([]);
    setReviewCards([]);
    setSessionCompleted(false);
    setTimeElapsed(0);
    setStartTime(Date.now());
    setStreak(0);
    flipAnim.setValue(0);
  };

  const handleFlip = () => {
    Animated.spring(flipAnim, {
      toValue: isFlipped ? 0 : 1,
      friction: 8,
      tension: 100,
      useNativeDriver: true,
    }).start();
    setIsFlipped(!isFlipped);
  };

  const handlePlayAudio = async () => {
    if (currentCard) {
      try {
        await speakText(currentCard.word, 'fr-FR');
      } catch (error) {
        console.error('Audio error:', error);
      }
    }
  };

  const animateSwipe = (direction, callback) => {
    Animated.timing(cardSlide, {
      toValue: direction === 'right' ? width : -width,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      cardSlide.setValue(0);
      callback();
    });
  };

  const handleKnown = () => {
    if (!knownCards.includes(currentCard.id)) {
      setKnownCards([...knownCards, currentCard.id]);
      setStreak(streak + 1);
    }
    goToNext();
  };

  const handleReview = () => {
    if (!reviewCards.includes(currentCard.id)) {
      setReviewCards([...reviewCards, currentCard.id]);
    }
    setStreak(0);
    goToNext();
  };

  const goToNext = () => {
    setIsFlipped(false);
    flipAnim.setValue(0);

    if (currentIndex < cards.length - 1) {
      animateSwipe('right', () => {
        setCurrentIndex(currentIndex + 1);
      });
    } else {
      finishSession();
    }
  };

  const finishSession = () => {
    setSessionCompleted(true);
    const masteryRate = (knownCards.length / cards.length) * 100;

    if (masteryRate >= 90) {
      awardXP(100, 'Vocabulary Master! 📚');
    } else if (masteryRate >= 70) {
      awardXP(60, 'Great memorization! ⭐');
    } else if (masteryRate >= 50) {
      awardXP(30, 'Good flashcard practice!');
    } else {
      awardXP(15, 'Practice session completed!');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCategoryInfo = () => FLASHCARD_CATEGORIES.find(c => c.id === selectedCategory);

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

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
              <Text style={[styles.navTitle, { color: theme.text }]}>Flashcards</Text>
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
                <Text style={[styles.greetingSubtitle, { color: theme.secondary }]}>EXPAND YOUR VOCABULARY</Text>
                <Text style={[styles.greetingTitle, { color: theme.text }]}>Flashcards</Text>
                <Text style={[styles.heroDescription, { color: theme.textSecondary }]}>
                  Master essential French words and phrases with our interactive spaced-repetition decks.
                </Text>
              </Animated.View>
            </View>
          </View>

          <View style={styles.contentBody}>
            <View style={[styles.statsOverview, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={styles.overviewItem}>
                <Text style={[styles.overviewValue, { color: theme.text }]}>48</Text>
                <Text style={[styles.overviewLabel, { color: theme.textSecondary }]}>Cards</Text>
              </View>
              <View style={[styles.overviewDivider, { backgroundColor: theme.border }]} />
              <View style={styles.overviewItem}>
                <Text style={[styles.overviewValue, { color: theme.text }]}>8</Text>
                <Text style={[styles.overviewLabel, { color: theme.textSecondary }]}>Decks</Text>
              </View>
              <View style={[styles.overviewDivider, { backgroundColor: theme.border }]} />
              <View style={styles.overviewItem}>
                <Text style={[styles.overviewValue, { color: theme.text }]}>High</Text>
                <Text style={[styles.overviewLabel, { color: theme.textSecondary }]}>Quality</Text>
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <View style={[styles.titleAccent, { backgroundColor: theme.primary }]} />
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Choose a Deck</Text>
              </View>
            </View>

            <View style={styles.categoryGrid}>
              {FLASHCARD_CATEGORIES.map((category, index) => (
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

  if (sessionCompleted) {
    const masteryRate = (knownCards.length / cards.length) * 100;
    const categoryInfo = getCategoryInfo();

    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <StatusBar barStyle="light-content" />

        <LinearGradient
          colors={masteryRate >= 70 ? [theme.success, theme.primary] : [theme.primary, theme.primaryLight]}
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
              name={masteryRate >= 70 ? 'trophy' : 'albums'}
              size={56}
              color="#FFFFFF"
            />
          </View>

          <Text style={styles.resultTitle}>
            {masteryRate >= 90 ? 'Perfect!' : masteryRate >= 70 ? 'Excellent!' : masteryRate >= 50 ? 'Good Job!' : 'Keep Going!'}
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
                <View style={[styles.scoreIcon, { backgroundColor: theme.success + '15' }]}>
                  <Ionicons name="checkmark-circle" size={24} color={theme.success} />
                </View>
                <Text style={[styles.scoreValue, { color: theme.text }]}>{knownCards.length}</Text>
                <Text style={[styles.scoreLabel, { color: theme.textSecondary }]}>Known</Text>
              </View>
              <View style={[styles.scoreDivider, { backgroundColor: theme.border }]} />
              <View style={styles.scoreItem}>
                <View style={[styles.scoreIcon, { backgroundColor: theme.secondary + '15' }]}>
                  <Ionicons name="refresh" size={24} color={theme.secondary} />
                </View>
                <Text style={[styles.scoreValue, { color: theme.text }]}>{reviewCards.length}</Text>
                <Text style={[styles.scoreLabel, { color: theme.textSecondary }]}>Review</Text>
              </View>
              <View style={[styles.scoreDivider, { backgroundColor: theme.border }]} />
              <View style={styles.scoreItem}>
                <View style={[styles.scoreIcon, { backgroundColor: theme.primary + '15' }]}>
                  <Ionicons name="time" size={24} color={theme.primary} />
                </View>
                <Text style={[styles.scoreValue, { color: theme.text }]}>{formatTime(timeElapsed)}</Text>
                <Text style={[styles.scoreLabel, { color: theme.textSecondary }]}>Time</Text>
              </View>
            </View>
          </View>

          <View style={[styles.masteryCard, { backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1 }, themeShadows.sm]}>
            <Text style={[styles.masteryTitle, { color: theme.text }]}>Mastery Rate</Text>
            <View style={styles.masteryBar}>
              <View style={[styles.masteryBarBg, { backgroundColor: theme.surfaceAlt }]}>
                <LinearGradient
                  colors={masteryRate >= 70 ? [theme.success, theme.success + 'CC'] : masteryRate >= 50 ? [theme.secondary, theme.secondary + 'CC'] : [theme.error, theme.error + 'CC']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.masteryBarFill, { width: `${masteryRate}%` }]}
                />
              </View>
              <Text style={[styles.masteryPercent, { color: masteryRate >= 70 ? theme.success : masteryRate >= 50 ? theme.secondary : theme.error }]}>
                {masteryRate.toFixed(0)}%
              </Text>
            </View>
            <Text style={[styles.masteryDesc, { color: theme.textSecondary }]}>
              {masteryRate >= 90 ? 'You\'ve mastered this deck!' : masteryRate >= 70 ? 'Great progress! Keep reviewing.' : masteryRate >= 50 ? 'You\'re getting there!' : 'Practice makes perfect!'}
            </Text>
          </View>

          <Text style={[styles.reviewTitle, { color: theme.text }]}>Cards Summary</Text>
          {cards.map((card, index) => {
            const isKnown = knownCards.includes(card.id);
            const needsReview = reviewCards.includes(card.id);

            return (
              <View
                key={card.id}
                style={[
                  styles.reviewCard,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                    borderWidth: 1,
                    borderLeftColor: isKnown ? theme.success : needsReview ? theme.secondary : theme.border,
                    borderLeftWidth: 4,
                  }
                ]}
              >
                <View style={styles.reviewCardContent}>
                  <Text style={[styles.reviewWord, { color: theme.text }]}>{card.word}</Text>
                  <Text style={[styles.reviewTranslation, { color: theme.textSecondary }]}>{card.translation}</Text>
                </View>
                <View style={[
                  styles.reviewStatus,
                  { backgroundColor: isKnown ? theme.success + '20' : needsReview ? theme.secondary + '20' : theme.surfaceAlt }
                ]}>
                  <Ionicons
                    name={isKnown ? 'checkmark' : needsReview ? 'refresh' : 'remove'}
                    size={18}
                    color={isKnown ? theme.success : needsReview ? theme.secondary : theme.textSecondary}
                  />
                </View>
              </View>
            );
          })}

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
                <Text style={styles.newDeckBtnText}>New Deck</Text>
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
              {currentIndex + 1} of {cards.length}
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
          <Animated.View style={[styles.streakBadge, { transform: [{ scale: pulseAnim }], backgroundColor: theme.surface }]}>
            <Ionicons name="flame" size={18} color={theme.secondary} />
            <Text style={styles.streakText}>{streak} Streak!</Text>
          </Animated.View>
        )}
      </LinearGradient>

      <View style={styles.cardContainer}>
        <Animated.View style={{ transform: [{ translateX: cardSlide }] }}>
          <TouchableOpacity
            style={styles.flashcardTouchable}
            onPress={handleFlip}
            activeOpacity={0.98}
          >

            <Animated.View
              style={[
                styles.flashcard,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                  borderWidth: 1,
                  transform: [{ rotateY: frontInterpolate }],
                },
                themeShadows.md
              ]}
            >
              <View style={styles.cardTopRow}>
                <View style={[styles.cardCategoryBadge, { backgroundColor: categoryInfo?.color + '20' }]}>
                  <Ionicons name={categoryInfo?.icon} size={14} color={categoryInfo?.color} />
                  <Text style={[styles.cardCategoryText, { color: categoryInfo?.color }]}>
                    {categoryInfo?.name}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.audioBtn, { backgroundColor: categoryInfo?.color }]}
                  onPress={handlePlayAudio}
                >
                  <Ionicons name="volume-high" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <View style={styles.cardCenter}>
                <Text style={[styles.cardWord, { color: theme.text }]}>
                  {currentCard?.word}
                </Text>
                <Text style={[styles.cardPronunciation, { color: theme.textSecondary }]}>
                  [{currentCard?.pronunciation}]
                </Text>
              </View>

              <View style={styles.cardBottom}>
                <View style={styles.flipHint}>
                  <Ionicons name="sync" size={16} color={theme.textSecondary} />
                  <Text style={[styles.flipHintText, { color: theme.textSecondary }]}>
                    Tap to see translation
                  </Text>
                </View>
              </View>
            </Animated.View>

            <Animated.View
              style={[
                styles.flashcard,
                styles.flashcardBack,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                  borderWidth: 1,
                  transform: [{ rotateY: backInterpolate }],
                },
                themeShadows.md
              ]}
            >
              <View style={styles.cardTopRow}>
                <View style={[styles.cardCategoryBadge, { backgroundColor: theme.success + '20' }]}>
                  <Ionicons name="language" size={14} color={theme.success} />
                  <Text style={[styles.cardCategoryText, { color: theme.success }]}>
                    Translation
                  </Text>
                </View>
              </View>

              <View style={styles.cardCenter}>
                <Text style={[styles.cardTranslation, { color: theme.text }]}>
                  {currentCard?.translation}
                </Text>
              </View>

              <View style={[styles.exampleBox, { backgroundColor: theme.surfaceAlt }]}>
                <Text style={[styles.exampleLabel, { color: theme.textSecondary }]}>Example:</Text>
                <Text style={[styles.exampleFrench, { color: theme.text }]}>
                  {currentCard?.example}
                </Text>
                <Text style={[styles.exampleEnglish, { color: theme.textSecondary }]}>
                  {currentCard?.exampleEn}
                </Text>
              </View>

              <View style={styles.cardBottom}>
                <View style={styles.flipHint}>
                  <Ionicons name="sync" size={16} color={theme.textSecondary} />
                  <Text style={[styles.flipHintText, { color: theme.textSecondary }]}>
                    Tap to flip back
                  </Text>
                </View>
              </View>
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.actionBtns}>
          <TouchableOpacity
            style={styles.reviewBtn}
            onPress={handleReview}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={[theme.secondary, theme.secondary + 'CC']}
              style={styles.actionBtnGradient}
            >
              <Ionicons name="refresh" size={28} color="#FFFFFF" />
              <Text style={styles.actionBtnLabel}>Review</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.knownBtn}
            onPress={handleKnown}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={[theme.success, theme.success + 'CC']}
              style={styles.actionBtnGradient}
            >
              <Ionicons name="checkmark-circle" size={28} color="#FFFFFF" />
              <Text style={styles.actionBtnLabel}>Known</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <Text style={[styles.swipeHint, { color: theme.textSecondary }]}>
          Mark your knowledge to continue
        </Text>
      </View>
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
  streakBadge: {
    position: 'absolute',
    bottom: -16,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
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
  },

  cardContainer: {
    flex: 1,
    padding: 20,
    paddingTop: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flashcardTouchable: {
    width: width - 48,
    height: height * 0.48,
  },
  flashcard: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    padding: 24,
    position: 'absolute',
    backfaceVisibility: 'hidden',
  },
  flashcardBack: {
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardCategoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  cardCategoryText: {
    fontSize: 13,
    fontWeight: '700',
  },
  audioBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardWord: {
    fontSize: 38,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  cardPronunciation: {
    fontSize: 17,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  cardTranslation: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
  },
  exampleBox: {
    padding: 16,
    borderRadius: 16,
    marginTop: 'auto',
  },
  exampleLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  exampleFrench: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    fontStyle: 'italic',
  },
  exampleEnglish: {
    fontSize: 14,
  },
  cardBottom: {
    alignItems: 'center',
  },
  flipHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  flipHintText: {
    fontSize: 13,
  },

  actionBtns: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 24,
    width: '100%',
  },
  reviewBtn: {
    flex: 1,
    borderRadius: 18,
    overflow: 'hidden',
    elevation: 8,
  },
  knownBtn: {
    flex: 1,
    borderRadius: 18,
    overflow: 'hidden',
    elevation: 8,
  },
  actionBtnGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 6,
  },
  actionBtnLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  swipeHint: {
    fontSize: 13,
    marginTop: 16,
    textAlign: 'center',
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
    marginBottom: 20,
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
  scoreValue: {
    fontSize: 24,
    fontWeight: '800',
  },
  scoreLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  scoreDivider: {
    width: 1,
    height: 70,
  },
  masteryCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
  },
  masteryTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 14,
  },
  masteryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 12,
  },
  masteryBarBg: {
    flex: 1,
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
  },
  masteryBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  masteryPercent: {
    fontSize: 18,
    fontWeight: '800',
  },
  masteryDesc: {
    fontSize: 14,
    lineHeight: 20,
  },
  reviewTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 14,
    marginLeft: 4,
  },
  reviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    marginBottom: 10,
  },
  reviewCardContent: {
    flex: 1,
  },
  reviewWord: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  reviewTranslation: {
    fontSize: 13,
  },
  reviewStatus: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
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
