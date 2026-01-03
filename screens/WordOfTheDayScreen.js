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
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../src/context/ThemeContext';
import { useGamification } from '../src/context/GamificationContext';
import { getThemeColors, themeShadows, themeRadius } from '../src/utils/organicTheme';
import { speakText, stopSpeech } from '../src/utils/textToSpeech';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

const WORDS_COLLECTION = [
  {
    id: 1,
    word: 'Épanouissement',
    pronunciation: 'ay-pah-noo-ees-MAHN',
    partOfSpeech: 'noun (m)',
    translation: 'Flourishing / Blossoming',
    definition: 'The process of personal growth and fulfillment; blooming into one\'s full potential.',
    example: 'Son épanouissement personnel est remarquable.',
    exampleEn: 'His personal growth is remarkable.',
    usage: 'Used to describe someone\'s development, happiness, or a flower blooming.',
    synonyms: ['développement', 'croissance', 'évolution'],
    difficulty: 'Advanced',
    category: 'Personal Growth',
    funFact: 'Comes from "s\'épanouir" meaning to bloom or open up, like a flower.',
    gradient: ['#1E3A5F', '#2D4A6F'],
  },
  {
    id: 2,
    word: 'Retrouvailles',
    pronunciation: 'ruh-troo-VIE',
    partOfSpeech: 'noun (f, plural)',
    translation: 'Reunion / Reuniting',
    definition: 'The joy of reuniting with someone after a long time apart.',
    example: 'Les retrouvailles avec ma famille étaient émouvantes.',
    exampleEn: 'The reunion with my family was touching.',
    usage: 'Used when meeting loved ones after being separated.',
    synonyms: ['réunion', 'rencontre', 'regroupement'],
    difficulty: 'Intermediate',
    category: 'Emotions',
    funFact: 'One of those beautiful French words with no direct English translation!',
    gradient: ['#C9A227', '#D4B445'],
  },
  {
    id: 3,
    word: 'Dépaysement',
    pronunciation: 'day-pay-eez-MAHN',
    partOfSpeech: 'noun (m)',
    translation: 'Disorientation from change of scenery',
    definition: 'The feeling of being in a foreign place; a change of surroundings that creates wonder or confusion.',
    example: 'Le dépaysement était total lors de mon voyage au Japon.',
    exampleEn: 'The change of scenery was total during my trip to Japan.',
    usage: 'Perfect for describing that feeling when traveling somewhere completely different.',
    synonyms: ['changement', 'évasion', 'nouveauté'],
    difficulty: 'Advanced',
    category: 'Travel',
    funFact: 'From "pays" (country) - literally means "un-countrying" yourself!',
    gradient: ['#5B8FB9', '#7AA8D4'],
  },
  {
    id: 4,
    word: 'Flâner',
    pronunciation: 'flah-NAY',
    partOfSpeech: 'verb',
    translation: 'To stroll aimlessly',
    definition: 'To wander without any particular destination; leisurely strolling while taking in your surroundings.',
    example: 'J\'aime flâner dans les rues de Paris.',
    exampleEn: 'I love to stroll through the streets of Paris.',
    usage: 'Used when you\'re enjoying a relaxed walk with no rush.',
    synonyms: ['se promener', 'déambuler', 'errer'],
    difficulty: 'Beginner',
    category: 'Lifestyle',
    funFact: 'A "flâneur" is someone who strolls around observing society - a true Parisian art!',
    gradient: ['#8B5CF6', '#7C3AED'],
  },
  {
    id: 5,
    word: 'Terroir',
    pronunciation: 'teh-RWAHR',
    partOfSpeech: 'noun (m)',
    translation: 'Sense of place / Local character',
    definition: 'The complete natural environment in which a wine or food is produced, including soil, climate, and traditions.',
    example: 'Ce vin exprime bien le terroir de Bourgogne.',
    exampleEn: 'This wine expresses the terroir of Burgundy well.',
    usage: 'Common in discussions about wine, cheese, and regional foods.',
    synonyms: ['terre', 'région', 'territoire'],
    difficulty: 'Intermediate',
    category: 'Food & Wine',
    funFact: 'This word is now used worldwide in English, especially by wine enthusiasts!',
    gradient: ['#C94C4C', '#E57373'],
  },
  {
    id: 6,
    word: 'Coup de foudre',
    pronunciation: 'koo duh FOODR',
    partOfSpeech: 'expression',
    translation: 'Love at first sight',
    definition: 'A sudden, overwhelming feeling of love or passion; literally "lightning strike".',
    example: 'C\'était un vrai coup de foudre quand je l\'ai rencontré.',
    exampleEn: 'It was true love at first sight when I met him.',
    usage: 'Used for instant romantic attraction or falling in love with something.',
    synonyms: ['passion soudaine', 'amour instantané'],
    difficulty: 'Beginner',
    category: 'Love & Romance',
    funFact: 'Can also be used for non-romantic things - like falling in love with a house or city!',
    gradient: ['#EC4899', '#DB2777'],
  },
  {
    id: 7,
    word: 'Joie de vivre',
    pronunciation: 'zhwa duh VEEVR',
    partOfSpeech: 'expression',
    translation: 'Joy of living',
    definition: 'A cheerful enjoyment of life; exuberant enthusiasm for living.',
    example: 'Elle a une joie de vivre contagieuse.',
    exampleEn: 'She has a contagious joy of living.',
    usage: 'Describes someone who embraces life with enthusiasm and positivity.',
    synonyms: ['bonheur', 'gaieté', 'enthousiasme'],
    difficulty: 'Beginner',
    category: 'Emotions',
    funFact: 'This phrase is used in English worldwide as a symbol of French culture!',
    gradient: ['#2E7D5A', '#3A6BA7'],
  },
  {
    id: 8,
    word: 'Savoir-faire',
    pronunciation: 'sah-vwahr FEHR',
    partOfSpeech: 'noun (m)',
    translation: 'Know-how / Expertise',
    definition: 'The ability to act appropriately in social situations; skill and expertise in handling things.',
    example: 'Son savoir-faire en cuisine est impressionnant.',
    exampleEn: 'His expertise in cooking is impressive.',
    usage: 'Used to describe someone\'s competence or social grace.',
    synonyms: ['compétence', 'expertise', 'habileté'],
    difficulty: 'Beginner',
    category: 'Skills',
    funFact: 'Literally means "knowing how to do" - it\'s all about practical wisdom!',
    gradient: ['#14B8A6', '#0D9488'],
  },
];

const RELATED_WORDS = {
  1: ['développement', 'bonheur', 'croissance', 'réalisation'],
  2: ['rencontre', 'réunion', 'joie', 'famille'],
  3: ['voyage', 'aventure', 'découverte', 'étranger'],
  4: ['promenade', 'marche', 'balade', 'déambuler'],
  5: ['vin', 'fromage', 'tradition', 'région'],
  6: ['amour', 'passion', 'cœur', 'romantique'],
  7: ['bonheur', 'plaisir', 'enthousiasme', 'vie'],
  8: ['compétence', 'talent', 'expertise', 'habileté'],
};

export default function WordOfTheDayScreen({ navigation }) {
  const { isDarkMode, toggleTheme } = useTheme();
  const theme = getThemeColors(isDarkMode);
  const { awardXP } = useGamification();

  const [todayWord, setTodayWord] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [learned, setLearned] = useState(false);
  const [streak, setStreak] = useState(0);
  const [showMore, setShowMore] = useState(false);
  const [previousWords, setPreviousWords] = useState([]);
  const [headerInteractable, setHeaderInteractable] = useState(false);

  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const streakAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
    loadWordOfTheDay();

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

  const loadWordOfTheDay = async () => {
    try {
      const today = new Date();
      const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
      const wordIndex = dayOfYear % WORDS_COLLECTION.length;

      setTodayWord(WORDS_COLLECTION[wordIndex]);

      const savedData = await AsyncStorage.getItem('wordOfTheDayData');
      if (savedData) {
        const data = JSON.parse(savedData);
        const lastDate = new Date(data.lastDate);
        const todayDate = new Date();
        todayDate.setHours(0, 0, 0, 0);
        lastDate.setHours(0, 0, 0, 0);

        const diffDays = Math.floor((todayDate - lastDate) / 86400000);

        if (diffDays === 0) {
          setLearned(data.learned);
          setStreak(data.streak);
        } else if (diffDays === 1) {
          setStreak(data.streak);
        } else {
          setStreak(0);
        }

        setPreviousWords(data.previousWords || []);
      }
    } catch (error) {
      console.error('Error loading word of the day:', error);
      setTodayWord(WORDS_COLLECTION[0]);
    }
  };

  const handleLearnWord = async () => {
    if (learned) return;

    setLearned(true);
    const newStreak = streak + 1;
    setStreak(newStreak);

    Animated.sequence([
      Animated.spring(streakAnim, { toValue: 1, tension: 100, friction: 5, useNativeDriver: true }),
      Animated.timing(streakAnim, { toValue: 0, duration: 300, delay: 1500, useNativeDriver: true }),
    ]).start();

    if (newStreak >= 7) {
      awardXP(50, '7-day word streak! 🔥');
    } else if (newStreak >= 3) {
      awardXP(25, 'Word learning streak!');
    } else {
      awardXP(10, 'New word learned!');
    }

    try {
      const previousList = [todayWord.id, ...previousWords.slice(0, 9)];
      await AsyncStorage.setItem('wordOfTheDayData', JSON.stringify({
        lastDate: new Date().toISOString(),
        learned: true,
        streak: newStreak,
        previousWords: previousList,
      }));
      setPreviousWords(previousList);
    } catch (error) {
      console.error('Error saving word data:', error);
    }
  };

  const handlePlayAudio = async () => {
    if (isPlaying) {
      stopSpeech();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 300, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      ])
    ).start();

    try {
      await speakText(todayWord.word, 'fr-FR');
    } catch (error) {
      console.error('Audio error:', error);
    } finally {
      setIsPlaying(false);
      pulseAnim.setValue(1);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `📚 French Word of the Day!\n\n🇫🇷 ${todayWord.word}\n📖 ${todayWord.translation}\n\n"${todayWord.example}"\n"${todayWord.exampleEn}"\n\n#FrenchMaster #LearnFrench`,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  if (!todayWord) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      </View>
    );
  }

  const relatedWords = RELATED_WORDS[todayWord.id] || [];

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
            <Text style={[styles.navTitle, { color: theme.text }]}>Word of the Day</Text>
          </View>
          <View style={styles.navBarRight}>
            {streak > 0 && (
              <View style={[styles.navStreakBadge, { backgroundColor: theme.secondary + '20' }]}>
                <Ionicons name="flame" size={16} color={theme.secondary} />
                <Text style={[styles.navStreakText, { color: theme.secondary }]}>{streak}</Text>
              </View>
            )}
            <TouchableOpacity
              style={[styles.navIconBtn, { backgroundColor: theme.primary + '15' }]}
              onPress={toggleTheme}
            >
              <Ionicons name={isDarkMode ? "sunny" : "moon"} size={18} color={theme.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      {/* Streak Celebration */}
      <Animated.View
        style={[
          styles.streakCelebration,
          {
            opacity: streakAnim,
            transform: [{
              scale: streakAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.5, 1],
              })
            }]
          }
        ]}
        pointerEvents="none"
      >
        <Text style={styles.streakCelebrationText}>🔥 {streak} Day Streak!</Text>
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
            <BackgroundBlur style={styles.blurBottom} color={theme.secondary} size={200} />

            <View style={styles.heroHeader}>
              <TouchableOpacity
                style={[styles.backCircle, { backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1 }]}
                onPress={() => navigation.goBack()}
              >
                <Ionicons name="chevron-back" size={24} color={theme.text} />
              </TouchableOpacity>
              <View style={styles.heroHeaderRight}>
                {streak > 0 && (
                  <View style={[styles.streakBadge, { backgroundColor: theme.secondary + '20' }]}>
                    <Ionicons name="flame" size={18} color={theme.secondary} />
                    <Text style={[styles.streakText, { color: theme.secondary }]}>{streak}</Text>
                  </View>
                )}
                <TouchableOpacity
                  style={[styles.themeToggle, { backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1 }]}
                  onPress={toggleTheme}
                >
                  <Ionicons name={isDarkMode ? "sunny" : "moon"} size={20} color={theme.text} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.greetingSection}>
              <View style={styles.dateRow}>
                <Ionicons name="calendar-outline" size={16} color={theme.primary} />
                <Text style={[styles.dateText, { color: theme.primary }]}>
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </Text>
              </View>
              <Text style={[styles.greetingSubtitle, { color: theme.primary }]}>WORD OF THE DAY</Text>
              <Text style={[styles.greetingTitle, { color: theme.text }]}>{todayWord.word}</Text>

              <View style={styles.pronunciationRow}>
                <Text style={[styles.pronunciation, { color: theme.textSecondary }]}>
                  [{todayWord.pronunciation}]
                </Text>
                <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                  <TouchableOpacity
                    style={[styles.audioBtn, { backgroundColor: theme.primary }]}
                    onPress={handlePlayAudio}
                    activeOpacity={0.8}
                  >
                    <Ionicons name={isPlaying ? 'pause' : 'volume-high'} size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </Animated.View>
              </View>

              <Text style={[styles.partOfSpeech, { color: theme.textMuted }]}>{todayWord.partOfSpeech}</Text>
            </View>
          </View>
        </View>

        {/* Content Body */}
        <View style={styles.contentBody}>
          {/* Stats Overview */}
          <View style={[styles.statsOverview, { backgroundColor: theme.surface, borderColor: theme.border }, themeShadows.md]}>
            <View style={styles.overviewItem}>
              <Text style={[styles.overviewValue, { color: theme.text }]}>{todayWord.difficulty}</Text>
              <Text style={[styles.overviewLabel, { color: theme.textSecondary }]}>Level</Text>
            </View>
            <View style={[styles.overviewDivider, { backgroundColor: theme.border }]} />
            <View style={styles.overviewItem}>
              <Text style={[styles.overviewValue, { color: theme.text }]}>{todayWord.category}</Text>
              <Text style={[styles.overviewLabel, { color: theme.textSecondary }]}>Category</Text>
            </View>
            <View style={[styles.overviewDivider, { backgroundColor: theme.border }]} />
            <View style={styles.overviewItem}>
              <TouchableOpacity onPress={handleShare}>
                <Ionicons name="share-social" size={24} color={theme.primary} />
              </TouchableOpacity>
              <Text style={[styles.overviewLabel, { color: theme.textSecondary }]}>Share</Text>
            </View>
          </View>

          {/* Translation Card */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <View style={[styles.titleAccent, { backgroundColor: theme.primary }]} />
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Translation</Text>
            </View>
          </View>

          <View style={[styles.translationCard, { backgroundColor: theme.surface, borderColor: theme.border }, themeShadows.sm]}>
            <Text style={[styles.translation, { color: theme.text }]}>{todayWord.translation}</Text>
            <Text style={[styles.definition, { color: theme.textSecondary }]}>{todayWord.definition}</Text>
          </View>

          {/* Example Card */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <View style={[styles.titleAccent, { backgroundColor: theme.secondary }]} />
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Example</Text>
            </View>
          </View>

          <View style={[styles.exampleCard, { backgroundColor: theme.surface, borderColor: theme.border }, themeShadows.sm]}>
            <View style={styles.exampleRow}>
              <Ionicons name="chatbubble-outline" size={20} color={theme.primary} />
              <Text style={[styles.exampleFrench, { color: theme.text }]}>"{todayWord.example}"</Text>
            </View>
            <Text style={[styles.exampleEnglish, { color: theme.textSecondary }]}>"{todayWord.exampleEn}"</Text>
          </View>

          {/* Usage Tip */}
          <View style={[styles.tipCard, { backgroundColor: theme.secondary + '15', borderColor: theme.secondary + '30' }]}>
            <Ionicons name="bulb" size={22} color={theme.secondary} />
            <View style={styles.tipContent}>
              <Text style={[styles.tipTitle, { color: theme.secondary }]}>Usage Tip</Text>
              <Text style={[styles.tipText, { color: theme.text }]}>{todayWord.usage}</Text>
            </View>
          </View>

          {/* Fun Fact */}
          <TouchableOpacity
            style={[styles.funFactCard, { backgroundColor: theme.surface, borderColor: theme.border }, themeShadows.sm]}
            onPress={() => setShowMore(!showMore)}
            activeOpacity={0.8}
          >
            <View style={styles.funFactHeader}>
              <View style={styles.funFactLeft}>
                <Ionicons name="sparkles" size={20} color={theme.gold} />
                <Text style={[styles.funFactTitle, { color: theme.text }]}>Fun Fact</Text>
              </View>
              <Ionicons
                name={showMore ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={theme.textSecondary}
              />
            </View>
            {showMore && (
              <Text style={[styles.funFactText, { color: theme.textSecondary }]}>
                {todayWord.funFact}
              </Text>
            )}
          </TouchableOpacity>

          {/* Synonyms */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <View style={[styles.titleAccent, { backgroundColor: theme.info }]} />
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Similar Words</Text>
            </View>
          </View>

          <View style={styles.synonymsRow}>
            {todayWord.synonyms.map((synonym, index) => (
              <View
                key={index}
                style={[styles.synonymBadge, { backgroundColor: theme.surface, borderColor: theme.border }]}
              >
                <Text style={[styles.synonymText, { color: theme.text }]}>{synonym}</Text>
              </View>
            ))}
          </View>

          {/* Related Vocabulary */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <View style={[styles.titleAccent, { backgroundColor: theme.success }]} />
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Related Vocabulary</Text>
            </View>
          </View>

          <View style={styles.relatedGrid}>
            {relatedWords.map((word, index) => (
              <View
                key={index}
                style={[styles.relatedWord, { backgroundColor: theme.surface, borderColor: theme.border }]}
              >
                <Text style={[styles.relatedWordText, { color: theme.text }]}>{word}</Text>
              </View>
            ))}
          </View>

          {/* Learn Button */}
          <TouchableOpacity
            style={[styles.learnedBtn, learned && styles.learnedBtnDone]}
            onPress={handleLearnWord}
            activeOpacity={0.9}
            disabled={learned}
          >
            <LinearGradient
              colors={learned ? [theme.success, '#059669'] : [theme.primary, theme.primaryLight]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.learnedBtnGradient}
            >
              <Ionicons
                name={learned ? 'checkmark-circle' : 'bookmark'}
                size={24}
                color="#FFFFFF"
              />
              <Text style={styles.learnedBtnText}>
                {learned ? 'Word Learned!' : 'Mark as Learned'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Previous Words */}
          {previousWords.length > 0 && (
            <View style={styles.previousSection}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <View style={[styles.titleAccent, { backgroundColor: theme.textMuted }]} />
                  <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Words</Text>
                </View>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.previousScroll}
              >
                {previousWords.slice(0, 5).map((wordId, index) => {
                  const word = WORDS_COLLECTION.find(w => w.id === wordId);
                  if (!word || word.id === todayWord.id) return null;
                  return (
                    <View
                      key={index}
                      style={[styles.previousCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
                    >
                      <LinearGradient
                        colors={word.gradient}
                        style={styles.previousCardAccent}
                      />
                      <Text style={[styles.previousWord, { color: theme.text }]}>{word.word}</Text>
                      <Text style={[styles.previousTranslation, { color: theme.textSecondary }]} numberOfLines={1}>
                        {word.translation}
                      </Text>
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          )}

          <View style={{ height: 100 }} />
        </View>
      </Animated.ScrollView>
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
  navBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  navBackBtn: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  navStreakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  navStreakText: {
    fontSize: 14,
    fontWeight: '700',
  },
  navIconBtn: {
    padding: 8,
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
  blurBottom: {
    bottom: -50,
    left: -50,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  heroHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backCircle: {
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeToggle: {
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 6,
  },
  streakText: {
    fontSize: 16,
    fontWeight: '700',
  },
  greetingSection: {
    alignItems: 'flex-start',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
  },
  greetingSubtitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 8,
  },
  greetingTitle: {
    fontSize: 38,
    fontWeight: '800',
    letterSpacing: -1,
    marginBottom: 16,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  pronunciationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 8,
  },
  pronunciation: {
    fontSize: 17,
    fontStyle: 'italic',
  },
  audioBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  partOfSpeech: {
    fontSize: 14,
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
    fontSize: 16,
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
  // Translation Card
  translationCard: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 24,
  },
  translation: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  definition: {
    fontSize: 15,
    lineHeight: 24,
  },
  // Example Card
  exampleCard: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 24,
  },
  exampleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 10,
  },
  exampleFrench: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    fontStyle: 'italic',
    lineHeight: 26,
  },
  exampleEnglish: {
    fontSize: 15,
    lineHeight: 24,
    marginLeft: 32,
  },
  // Tip Card
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 24,
    gap: 14,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  tipText: {
    fontSize: 14,
    lineHeight: 22,
  },
  // Fun Fact Card
  funFactCard: {
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 24,
  },
  funFactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  funFactLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  funFactTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  funFactText: {
    fontSize: 14,
    lineHeight: 22,
    marginTop: 12,
  },
  // Synonyms
  synonymsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  synonymBadge: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  synonymText: {
    fontSize: 14,
    fontWeight: '600',
  },
  // Related Words
  relatedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 32,
  },
  relatedWord: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  relatedWordText: {
    fontSize: 14,
    fontWeight: '600',
  },
  // Learn Button
  learnedBtn: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 32,
  },
  learnedBtnDone: {},
  learnedBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 12,
  },
  learnedBtnText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // Previous Section
  previousSection: {
    marginBottom: 24,
  },
  previousScroll: {
    gap: 14,
    paddingRight: 24,
  },
  previousCard: {
    width: 150,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  previousCardAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  previousWord: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
    marginTop: 4,
  },
  previousTranslation: {
    fontSize: 12,
  },
  // Streak Celebration
  streakCelebration: {
    position: 'absolute',
    top: height * 0.35,
    alignSelf: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 24,
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  streakCelebrationText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
