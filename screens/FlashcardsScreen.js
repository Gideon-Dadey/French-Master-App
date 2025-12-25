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

const { width, height } = Dimensions.get('window');

const FLASHCARD_CATEGORIES = [
  { id: 'greetings', name: 'Greetings', icon: 'hand-right', color: '#10B981', gradient: ['#10B981', '#059669'], desc: 'Say hello & goodbye' },
  { id: 'essentials', name: 'Essentials', icon: 'star', color: '#F59E0B', gradient: ['#F59E0B', '#D97706'], desc: 'Must-know words' },
  { id: 'food', name: 'Food & Drinks', icon: 'restaurant', color: '#EF4444', gradient: ['#EF4444', '#DC2626'], desc: 'Delicious vocabulary' },
  { id: 'travel', name: 'Travel', icon: 'airplane', color: '#3B82F6', gradient: ['#3B82F6', '#2563EB'], desc: 'Explore France' },
  { id: 'family', name: 'Family', icon: 'people', color: '#8B5CF6', gradient: ['#8B5CF6', '#7C3AED'], desc: 'Family members' },
  { id: 'numbers', name: 'Numbers', icon: 'calculator', color: '#06B6D4', gradient: ['#06B6D4', '#0891B2'], desc: 'Count in French' },
  { id: 'time', name: 'Time & Days', icon: 'calendar', color: '#EC4899', gradient: ['#EC4899', '#DB2777'], desc: 'Schedules' },
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
  const { colors, isDarkMode } = useTheme();
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
      <View style={[styles.container, { backgroundColor: isDarkMode ? '#000000' : '#F8FAFC' }]}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

        <LinearGradient
          colors={isDarkMode ? ['#4C1D95', '#5B21B6'] : ['#8B5CF6', '#7C3AED']}
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
                <Ionicons name="albums" size={44} color="#FFFFFF" />
              </LinearGradient>
            </View>
            <Text style={styles.headerTitle}>Flashcards</Text>
            <Text style={styles.headerSubtitle}>
              Master French vocabulary with spaced repetition
            </Text>
          </Animated.View>
        </LinearGradient>

        <ScrollView
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Choose a Deck
          </Text>
          <Text style={[styles.sectionSubtitle, { color: colors.secondaryText }]}>
            Swipe through cards to learn new words
          </Text>

          <View style={styles.categoryGrid}>
            {FLASHCARD_CATEGORIES.map((category, index) => (
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
                    <View style={[styles.cardsBadge, { backgroundColor: category.color + '20' }]}>
                      <Ionicons name="layers" size={12} color={category.color} />
                      <Text style={[styles.cardsBadgeText, { color: category.color }]}>6 cards</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={colors.secondaryText} />
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>

          <View style={[styles.statsCard, { backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF' }]}>
            <LinearGradient
              colors={['#8B5CF6', '#7C3AED']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.statsGradient}
            >
              <View style={styles.statItem}>
                <Text style={styles.statValue}>48</Text>
                <Text style={styles.statLabel}>Cards</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>8</Text>
                <Text style={styles.statLabel}>Decks</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Ionicons name="musical-notes" size={28} color="#FFFFFF" />
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
    const masteryRate = (knownCards.length / cards.length) * 100;
    const categoryInfo = getCategoryInfo();

    return (
      <View style={[styles.container, { backgroundColor: isDarkMode ? '#000000' : '#F8FAFC' }]}>
        <StatusBar barStyle="light-content" />

        <LinearGradient
          colors={masteryRate >= 70 ? ['#10B981', '#059669'] : ['#8B5CF6', '#7C3AED']}
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

          <View style={[styles.scoreCard, { backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF' }]}>
            <View style={styles.scoreRow}>
              <View style={styles.scoreItem}>
                <View style={[styles.scoreIcon, { backgroundColor: '#10B98120' }]}>
                  <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                </View>
                <Text style={[styles.scoreValue, { color: colors.text }]}>{knownCards.length}</Text>
                <Text style={[styles.scoreLabel, { color: colors.secondaryText }]}>Known</Text>
              </View>
              <View style={[styles.scoreDivider, { backgroundColor: colors.border }]} />
              <View style={styles.scoreItem}>
                <View style={[styles.scoreIcon, { backgroundColor: '#F59E0B20' }]}>
                  <Ionicons name="refresh" size={24} color="#F59E0B" />
                </View>
                <Text style={[styles.scoreValue, { color: colors.text }]}>{reviewCards.length}</Text>
                <Text style={[styles.scoreLabel, { color: colors.secondaryText }]}>Review</Text>
              </View>
              <View style={[styles.scoreDivider, { backgroundColor: colors.border }]} />
              <View style={styles.scoreItem}>
                <View style={[styles.scoreIcon, { backgroundColor: '#3B82F620' }]}>
                  <Ionicons name="time" size={24} color="#3B82F6" />
                </View>
                <Text style={[styles.scoreValue, { color: colors.text }]}>{formatTime(timeElapsed)}</Text>
                <Text style={[styles.scoreLabel, { color: colors.secondaryText }]}>Time</Text>
              </View>
            </View>
          </View>

          <View style={[styles.masteryCard, { backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF' }]}>
            <Text style={[styles.masteryTitle, { color: colors.text }]}>Mastery Rate</Text>
            <View style={styles.masteryBar}>
              <View style={[styles.masteryBarBg, { backgroundColor: isDarkMode ? '#334155' : '#E2E8F0' }]}>
                <LinearGradient
                  colors={masteryRate >= 70 ? ['#10B981', '#059669'] : masteryRate >= 50 ? ['#F59E0B', '#D97706'] : ['#EF4444', '#DC2626']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.masteryBarFill, { width: `${masteryRate}%` }]}
                />
              </View>
              <Text style={[styles.masteryPercent, { color: masteryRate >= 70 ? '#10B981' : masteryRate >= 50 ? '#F59E0B' : '#EF4444' }]}>
                {masteryRate.toFixed(0)}%
              </Text>
            </View>
            <Text style={[styles.masteryDesc, { color: colors.secondaryText }]}>
              {masteryRate >= 90 ? 'You\'ve mastered this deck!' : masteryRate >= 70 ? 'Great progress! Keep reviewing.' : masteryRate >= 50 ? 'You\'re getting there!' : 'Practice makes perfect!'}
            </Text>
          </View>

          <Text style={[styles.reviewTitle, { color: colors.text }]}>Cards Summary</Text>
          {cards.map((card, index) => {
            const isKnown = knownCards.includes(card.id);
            const needsReview = reviewCards.includes(card.id);

            return (
              <View
                key={card.id}
                style={[
                  styles.reviewCard,
                  {
                    backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
                    borderLeftColor: isKnown ? '#10B981' : needsReview ? '#F59E0B' : colors.border,
                  }
                ]}
              >
                <View style={styles.reviewCardContent}>
                  <Text style={[styles.reviewWord, { color: colors.text }]}>{card.word}</Text>
                  <Text style={[styles.reviewTranslation, { color: colors.secondaryText }]}>{card.translation}</Text>
                </View>
                <View style={[
                  styles.reviewStatus,
                  { backgroundColor: isKnown ? '#10B98120' : needsReview ? '#F59E0B20' : '#6B728020' }
                ]}>
                  <Ionicons
                    name={isKnown ? 'checkmark' : needsReview ? 'refresh' : 'remove'}
                    size={18}
                    color={isKnown ? '#10B981' : needsReview ? '#F59E0B' : '#6B7280'}
                  />
                </View>
              </View>
            );
          })}

          <View style={styles.resultActions}>
            <TouchableOpacity
              style={[styles.retryBtn, { backgroundColor: isDarkMode ? '#374151' : '#F1F5F9' }]}
              onPress={() => startSession(selectedCategory)}
            >
              <Ionicons name="refresh" size={22} color={colors.text} />
              <Text style={[styles.retryBtnText, { color: colors.text }]}>Practice Again</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.newDeckBtn}
              onPress={() => setSelectedCategory(null)}
            >
              <LinearGradient
                colors={['#8B5CF6', '#7C3AED']}
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
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#000000' : '#F8FAFC' }]}>
      <StatusBar barStyle="light-content" />

      <LinearGradient
        colors={categoryInfo?.gradient || ['#8B5CF6', '#7C3AED']}
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
                { width: progressAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                }) }
              ]}
            />
          </View>
        </View>

        {streak >= 2 && (
          <Animated.View style={[styles.streakBadge, { transform: [{ scale: pulseAnim }] }]}>
            <Ionicons name="flame" size={18} color="#F59E0B" />
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
                  backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
                  transform: [{ rotateY: frontInterpolate }],
                }
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
                <Text style={[styles.cardWord, { color: colors.text }]}>
                  {currentCard?.word}
                </Text>
                <Text style={[styles.cardPronunciation, { color: colors.secondaryText }]}>
                  [{currentCard?.pronunciation}]
                </Text>
              </View>

              <View style={styles.cardBottom}>
                <View style={styles.flipHint}>
                  <Ionicons name="sync" size={16} color={colors.secondaryText} />
                  <Text style={[styles.flipHintText, { color: colors.secondaryText }]}>
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
                  backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
                  transform: [{ rotateY: backInterpolate }],
                }
              ]}
            >
              <View style={styles.cardTopRow}>
                <View style={[styles.cardCategoryBadge, { backgroundColor: '#10B98120' }]}>
                  <Ionicons name="language" size={14} color="#10B981" />
                  <Text style={[styles.cardCategoryText, { color: '#10B981' }]}>
                    Translation
                  </Text>
                </View>
              </View>

              <View style={styles.cardCenter}>
                <Text style={[styles.cardTranslation, { color: colors.text }]}>
                  {currentCard?.translation}
                </Text>
              </View>

              <View style={[styles.exampleBox, { backgroundColor: isDarkMode ? '#334155' : '#F1F5F9' }]}>
                <Text style={[styles.exampleLabel, { color: colors.secondaryText }]}>Example:</Text>
                <Text style={[styles.exampleFrench, { color: colors.text }]}>
                  {currentCard?.example}
                </Text>
                <Text style={[styles.exampleEnglish, { color: colors.secondaryText }]}>
                  {currentCard?.exampleEn}
                </Text>
              </View>

              <View style={styles.cardBottom}>
                <View style={styles.flipHint}>
                  <Ionicons name="sync" size={16} color={colors.secondaryText} />
                  <Text style={[styles.flipHintText, { color: colors.secondaryText }]}>
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
              colors={['#F59E0B', '#D97706']}
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
              colors={['#10B981', '#059669']}
              style={styles.actionBtnGradient}
            >
              <Ionicons name="checkmark-circle" size={28} color="#FFFFFF" />
              <Text style={styles.actionBtnLabel}>Known</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <Text style={[styles.swipeHint, { color: colors.secondaryText }]}>
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
  cardsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },
  cardsBadgeText: {
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
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
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  knownBtn: {
    flex: 1,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
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
    borderRadius: 22,
    padding: 24,
    marginBottom: 20,
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
    borderRadius: 22,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
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
    fontWeight: '700',
    marginBottom: 14,
  },
  reviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
    borderLeftWidth: 4,
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
