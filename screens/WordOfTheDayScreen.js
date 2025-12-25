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
import { speakText, stopSpeech } from '../src/utils/textToSpeech';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

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
    gradient: ['#10B981', '#059669'],
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
    gradient: ['#F59E0B', '#D97706'],
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
    gradient: ['#3B82F6', '#2563EB'],
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
    gradient: ['#EF4444', '#DC2626'],
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
    gradient: ['#06B6D4', '#0891B2'],
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
  {
    id: 9,
    word: 'L\'appel du vide',
    pronunciation: 'lah-PEL doo VEED',
    partOfSpeech: 'expression',
    translation: 'The call of the void',
    definition: 'The inexplicable urge to jump from high places; the intrusive thought to do something dangerous.',
    example: 'Au bord de la falaise, j\'ai ressenti l\'appel du vide.',
    exampleEn: 'At the edge of the cliff, I felt the call of the void.',
    usage: 'Describes that strange urge when standing at heights or other dangerous situations.',
    synonyms: ['vertige', 'tentation'],
    difficulty: 'Advanced',
    category: 'Psychology',
    funFact: 'A concept unique to French - psychologists worldwide now use this term!',
    gradient: ['#6366F1', '#4F46E5'],
  },
  {
    id: 10,
    word: 'Bricoleur',
    pronunciation: 'bree-koh-LUHR',
    partOfSpeech: 'noun (m)',
    translation: 'DIY enthusiast / Handyman',
    definition: 'Someone who enjoys making or fixing things themselves; a tinkerer or maker.',
    example: 'Mon père est un bricoleur extraordinaire.',
    exampleEn: 'My father is an extraordinary handyman.',
    usage: 'For anyone who loves DIY projects and fixing things around the house.',
    synonyms: ['amateur', 'artisan', 'réparateur'],
    difficulty: 'Intermediate',
    category: 'Hobbies',
    funFact: 'The verb "bricoler" literally means to fiddle around or tinker!',
    gradient: ['#F97316', '#EA580C'],
  },
  {
    id: 11,
    word: 'Chez-soi',
    pronunciation: 'shay-SWA',
    partOfSpeech: 'noun (m)',
    translation: 'Home / One\'s place',
    definition: 'The feeling of being at home; your personal space and sanctuary.',
    example: 'Il n\'y a rien de mieux que son chez-soi.',
    exampleEn: 'There\'s nothing better than one\'s own home.',
    usage: 'Expresses the comfort and security of being in your own space.',
    synonyms: ['maison', 'foyer', 'domicile'],
    difficulty: 'Beginner',
    category: 'Home & Life',
    funFact: 'Literally "at one\'s own place" - captures that cozy feeling of home!',
    gradient: ['#84CC16', '#65A30D'],
  },
  {
    id: 12,
    word: 'Pétillant',
    pronunciation: 'pay-tee-YAHN',
    partOfSpeech: 'adjective',
    translation: 'Sparkling / Bubbly',
    definition: 'Describes something sparkling like champagne, or a personality that\'s lively and effervescent.',
    example: 'Elle a une personnalité pétillante.',
    exampleEn: 'She has a sparkling personality.',
    usage: 'For drinks with bubbles or people with vibrant, energetic personalities.',
    synonyms: ['vif', 'brillant', 'effervescent'],
    difficulty: 'Intermediate',
    category: 'Personality',
    funFact: 'The same word for sparkling water (eau pétillante) and a bubbly person!',
    gradient: ['#A855F7', '#9333EA'],
  },
  {
    id: 13,
    word: 'Ennui',
    pronunciation: 'ahn-NWEE',
    partOfSpeech: 'noun (m)',
    translation: 'Boredom / Listlessness',
    definition: 'A feeling of weariness and dissatisfaction from lack of occupation or interest.',
    example: 'L\'ennui s\'est installé pendant le long voyage.',
    exampleEn: 'Boredom set in during the long journey.',
    usage: 'Describes existential boredom or a lack of stimulation.',
    synonyms: ['lassitude', 'désœuvrement', 'monotonie'],
    difficulty: 'Beginner',
    category: 'Emotions',
    funFact: 'Used in English to describe a deeper, more philosophical boredom!',
    gradient: ['#64748B', '#475569'],
  },
  {
    id: 14,
    word: 'Gourmand',
    pronunciation: 'goor-MAHN',
    partOfSpeech: 'noun/adjective',
    translation: 'Food lover / Greedy eater',
    definition: 'Someone who loves food and enjoys eating large quantities; can be positive or slightly negative.',
    example: 'Je suis gourmand de chocolat.',
    exampleEn: 'I\'m a chocolate lover.',
    usage: 'Use carefully - can mean food lover or someone who overeats!',
    synonyms: ['gourmet', 'amateur de bonne chère'],
    difficulty: 'Beginner',
    category: 'Food & Wine',
    funFact: 'Different from "gourmet" which means someone with refined taste!',
    gradient: ['#B45309', '#92400E'],
  },
  {
    id: 15,
    word: 'Rayonnant',
    pronunciation: 'ray-yo-NAHN',
    partOfSpeech: 'adjective',
    translation: 'Radiant / Beaming',
    definition: 'Shining with light, health, or happiness; someone who glows with joy.',
    example: 'Elle était rayonnante le jour de son mariage.',
    exampleEn: 'She was radiant on her wedding day.',
    usage: 'Perfect for describing someone who looks genuinely happy and glowing.',
    synonyms: ['radieux', 'brillant', 'resplendissant'],
    difficulty: 'Intermediate',
    category: 'Appearance',
    funFact: 'From "rayon" (ray of light) - someone who radiates happiness!',
    gradient: ['#FBBF24', '#F59E0B'],
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
  9: ['peur', 'vertige', 'hauteur', 'danger'],
  10: ['créer', 'réparer', 'construire', 'fabriquer'],
  11: ['maison', 'confort', 'refuge', 'intimité'],
  12: ['joyeux', 'vivant', 'énergique', 'champagne'],
  13: ['fatigue', 'monotonie', 'langueur', 'désintérêt'],
  14: ['manger', 'cuisine', 'délicieux', 'appétit'],
  15: ['lumineux', 'heureux', 'éclatant', 'joyeux'],
};

export default function WordOfTheDayScreen({ navigation }) {
  const { colors, isDarkMode } = useTheme();
  const { awardXP } = useGamification();

  const [todayWord, setTodayWord] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [learned, setLearned] = useState(false);
  const [streak, setStreak] = useState(0);
  const [showMore, setShowMore] = useState(false);
  const [previousWords, setPreviousWords] = useState([]);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const cardFlip = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const streakAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadWordOfTheDay();

    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true }),
    ]).start();
  }, []);

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
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      </View>
    );
  }

  const relatedWords = RELATED_WORDS[todayWord.id] || [];

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#000000' : '#F8FAFC' }]}>
      <StatusBar barStyle="light-content" />

      <LinearGradient
        colors={todayWord.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerDecor1} />
        <View style={styles.headerDecor2} />
        <View style={styles.headerDecor3} />

        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.headerBadges}>
            {streak > 0 && (
              <View style={styles.streakBadge}>
                <Ionicons name="flame" size={16} color="#FFFFFF" />
                <Text style={styles.streakText}>{streak}</Text>
              </View>
            )}
            <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
              <Ionicons name="share-outline" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        <Animated.View
          style={[
            styles.headerContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.dateContainer}>
            <Ionicons name="calendar" size={16} color="rgba(255,255,255,0.8)" />
            <Text style={styles.dateText}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </Text>
          </View>

          <Text style={styles.headerLabel}>Word of the Day</Text>

          <View style={styles.wordRow}>
            <Text style={styles.mainWord}>{todayWord.word}</Text>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <TouchableOpacity
                style={styles.audioBtn}
                onPress={handlePlayAudio}
                activeOpacity={0.8}
              >
                <Ionicons name={isPlaying ? 'pause' : 'volume-high'} size={26} color="#FFFFFF" />
              </TouchableOpacity>
            </Animated.View>
          </View>

          <Text style={styles.pronunciation}>[{todayWord.pronunciation}]</Text>
          <Text style={styles.partOfSpeech}>{todayWord.partOfSpeech}</Text>
        </Animated.View>
      </LinearGradient>

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

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >

        <Animated.View
          style={[
            styles.translationCard,
            {
              backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <View style={styles.translationHeader}>
            <View style={[styles.categoryBadge, { backgroundColor: todayWord.gradient[0] + '20' }]}>
              <Text style={[styles.categoryText, { color: todayWord.gradient[0] }]}>{todayWord.category}</Text>
            </View>
            <View style={[styles.difficultyBadge, {
              backgroundColor: todayWord.difficulty === 'Beginner' ? '#10B98120' :
                             todayWord.difficulty === 'Intermediate' ? '#F59E0B20' : '#EF444420'
            }]}>
              <Text style={[styles.difficultyText, {
                color: todayWord.difficulty === 'Beginner' ? '#10B981' :
                       todayWord.difficulty === 'Intermediate' ? '#F59E0B' : '#EF4444'
              }]}>{todayWord.difficulty}</Text>
            </View>
          </View>

          <Text style={[styles.translation, { color: colors.text }]}>
            {todayWord.translation}
          </Text>
          <Text style={[styles.definition, { color: colors.secondaryText }]}>
            {todayWord.definition}
          </Text>
        </Animated.View>

        <View style={[styles.exampleCard, { backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF' }]}>
          <View style={styles.exampleHeader}>
            <Ionicons name="chatbubble-outline" size={20} color={todayWord.gradient[0]} />
            <Text style={[styles.exampleTitle, { color: colors.text }]}>Example</Text>
          </View>
          <Text style={[styles.exampleFrench, { color: colors.text }]}>
            "{todayWord.example}"
          </Text>
          <Text style={[styles.exampleEnglish, { color: colors.secondaryText }]}>
            "{todayWord.exampleEn}"
          </Text>
        </View>

        <View style={[styles.tipCard, { backgroundColor: todayWord.gradient[0] + '15' }]}>
          <Ionicons name="bulb" size={22} color={todayWord.gradient[0]} />
          <View style={styles.tipContent}>
            <Text style={[styles.tipTitle, { color: todayWord.gradient[0] }]}>Usage Tip</Text>
            <Text style={[styles.tipText, { color: colors.text }]}>{todayWord.usage}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.funFactCard, { backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF' }]}
          onPress={() => setShowMore(!showMore)}
          activeOpacity={0.8}
        >
          <View style={styles.funFactHeader}>
            <View style={styles.funFactLeft}>
              <Ionicons name="sparkles" size={20} color="#F59E0B" />
              <Text style={[styles.funFactTitle, { color: colors.text }]}>Fun Fact</Text>
            </View>
            <Ionicons
              name={showMore ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={colors.secondaryText}
            />
          </View>
          {showMore && (
            <Text style={[styles.funFactText, { color: colors.secondaryText }]}>
              {todayWord.funFact}
            </Text>
          )}
        </TouchableOpacity>

        <View style={[styles.synonymsCard, { backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF' }]}>
          <Text style={[styles.synonymsTitle, { color: colors.text }]}>Similar Words</Text>
          <View style={styles.synonymsRow}>
            {todayWord.synonyms.map((synonym, index) => (
              <View
                key={index}
                style={[styles.synonymBadge, { backgroundColor: isDarkMode ? '#334155' : '#F1F5F9' }]}
              >
                <Text style={[styles.synonymText, { color: colors.text }]}>{synonym}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.relatedCard, { backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF' }]}>
          <Text style={[styles.relatedTitle, { color: colors.text }]}>Related Vocabulary</Text>
          <View style={styles.relatedGrid}>
            {relatedWords.map((word, index) => (
              <View
                key={index}
                style={[styles.relatedWord, { borderColor: isDarkMode ? '#334155' : '#E2E8F0' }]}
              >
                <Text style={[styles.relatedWordText, { color: colors.text }]}>{word}</Text>
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.learnedBtn,
            learned && styles.learnedBtnDone
          ]}
          onPress={handleLearnWord}
          activeOpacity={0.9}
          disabled={learned}
        >
          <LinearGradient
            colors={learned ? ['#10B981', '#059669'] : todayWord.gradient}
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

        {previousWords.length > 0 && (
          <View style={styles.previousSection}>
            <Text style={[styles.previousTitle, { color: colors.text }]}>
              Recent Words
            </Text>
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
                    style={[styles.previousCard, { backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF' }]}
                  >
                    <LinearGradient
                      colors={word.gradient}
                      style={styles.previousCardAccent}
                    />
                    <Text style={[styles.previousWord, { color: colors.text }]}>{word.word}</Text>
                    <Text style={[styles.previousTranslation, { color: colors.secondaryText }]} numberOfLines={1}>
                      {word.translation}
                    </Text>
                  </View>
                );
              })}
            </ScrollView>
          </View>
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
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: 40,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    overflow: 'hidden',
  },
  headerDecor1: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  headerDecor2: {
    position: 'absolute',
    bottom: -60,
    left: -60,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  headerDecor3: {
    position: 'absolute',
    top: 100,
    left: 80,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  streakText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  shareBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    alignItems: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  dateText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  headerLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  wordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  mainWord: {
    fontSize: 38,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  audioBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pronunciation: {
    fontSize: 17,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 10,
    fontStyle: 'italic',
  },
  partOfSpeech: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 6,
  },
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
  scroll: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 24,
  },
  translationCard: {
    padding: 22,
    borderRadius: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  translationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '700',
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '700',
  },
  translation: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  definition: {
    fontSize: 15,
    lineHeight: 24,
  },
  exampleCard: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  exampleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  exampleTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  exampleFrench: {
    fontSize: 17,
    fontWeight: '600',
    fontStyle: 'italic',
    marginBottom: 8,
    lineHeight: 26,
  },
  exampleEnglish: {
    fontSize: 15,
    lineHeight: 24,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 18,
    borderRadius: 18,
    marginBottom: 16,
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
  funFactCard: {
    padding: 18,
    borderRadius: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
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
  synonymsCard: {
    padding: 18,
    borderRadius: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  synonymsTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  synonymsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  synonymBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  synonymText: {
    fontSize: 14,
    fontWeight: '600',
  },
  relatedCard: {
    padding: 18,
    borderRadius: 18,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  relatedTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 14,
  },
  relatedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  relatedWord: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  relatedWordText: {
    fontSize: 14,
    fontWeight: '600',
  },
  learnedBtn: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 8,
  },
  learnedBtnDone: {
    shadowColor: '#10B981',
  },
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
  previousSection: {
    marginBottom: 24,
  },
  previousTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 14,
  },
  previousScroll: {
    gap: 14,
  },
  previousCard: {
    width: 140,
    padding: 14,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
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
});

