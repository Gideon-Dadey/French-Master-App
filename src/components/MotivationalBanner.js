import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Text,
  TouchableOpacity,
  Platform,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { getThemeColors, themeShadows } from '../utils/organicTheme';

const { width } = Dimensions.get('window');

// Inspirational quotes for French learners
const MOTIVATIONAL_QUOTES = [
  {
    quote: "Chaque jour est une nouvelle chance d'apprendre.",
    translation: "Every day is a new chance to learn.",
    author: null,
    icon: "sunny",
  },
  {
    quote: "Petit à petit, l'oiseau fait son nid.",
    translation: "Little by little, the bird builds its nest.",
    author: "French Proverb",
    icon: "leaf",
  },
  {
    quote: "La pratique rend parfait.",
    translation: "Practice makes perfect.",
    author: null,
    icon: "star",
  },
  {
    quote: "Une langue différente est une vision différente de la vie.",
    translation: "A different language is a different vision of life.",
    author: "Federico Fellini",
    icon: "eye",
  },
  {
    quote: "C'est en forgeant qu'on devient forgeron.",
    translation: "Practice makes perfect (lit: It's by forging that one becomes a blacksmith).",
    author: "French Proverb",
    icon: "hammer",
  },
  {
    quote: "Le courage n'est pas l'absence de peur, mais la capacité de vaincre ce qui fait peur.",
    translation: "Courage is not the absence of fear, but the ability to overcome what scares you.",
    author: null,
    icon: "shield-checkmark",
  },
  {
    quote: "Rome ne s'est pas faite en un jour.",
    translation: "Rome wasn't built in a day.",
    author: "French Proverb",
    icon: "time",
  },
  {
    quote: "Qui vivra verra.",
    translation: "Time will tell (lit: Who lives will see).",
    author: "French Proverb",
    icon: "hourglass",
  },
  {
    quote: "Le savoir est une arme.",
    translation: "Knowledge is a weapon.",
    author: null,
    icon: "library",
  },
  {
    quote: "Après la pluie, le beau temps.",
    translation: "After the rain comes sunshine.",
    author: "French Proverb",
    icon: "partly-sunny",
  },
];

// Get a quote based on the day (changes daily)
const getDailyQuote = () => {
  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
  return MOTIVATIONAL_QUOTES[dayOfYear % MOTIVATIONAL_QUOTES.length];
};

// Get a random quote
const getRandomQuote = () => {
  return MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
};

/**
 * MotivationalBanner - Inspiring quotes in French with translations
 * 
 * @param {boolean} isDarkMode - Theme mode
 * @param {boolean} daily - Use daily quote (true) or random (false)
 * @param {function} onPress - Optional callback when banner is pressed
 * @param {string} style - Additional styles
 * @param {boolean} compact - Show compact version
 */
export default function MotivationalBanner({
  isDarkMode = false,
  daily = true,
  onPress,
  style,
  compact = false,
}) {
  const theme = getThemeColors(isDarkMode);
  const [quote, setQuote] = useState(daily ? getDailyQuote() : getRandomQuote());
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const iconPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();

    // Icon pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(iconPulse, {
          toValue: 1.15,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(iconPulse, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const refreshQuote = () => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 20,
        duration: 0,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setQuote(getRandomQuote());
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 10,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      refreshQuote();
    }
  };

  if (compact) {
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handlePress}
        style={[styles.compactContainer, style]}
      >
        <LinearGradient
          colors={[theme.primary + '12', theme.secondary + '08']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.compactCard, { borderColor: theme.border }]}
        >
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <View style={[styles.compactIcon, { backgroundColor: theme.secondary + '20' }]}>
              <Ionicons name={quote.icon} size={18} color={theme.secondary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.compactQuote, { color: theme.text }]} numberOfLines={1}>
                "{quote.quote}"
              </Text>
              <Text style={[styles.compactTranslation, { color: theme.textMuted }]} numberOfLines={1}>
                {quote.translation}
              </Text>
            </View>
            <Ionicons name="refresh" size={16} color={theme.textMuted} />
          </Animated.View>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.95}
      onPress={handlePress}
      style={[styles.container, style]}
    >
      <LinearGradient
        colors={[theme.primary, theme.primaryLight || theme.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {/* Decorative elements */}
        <View style={styles.decorTop}>
          <View style={[styles.decorCircle, styles.decorCircle1]} />
          <View style={[styles.decorCircle, styles.decorCircle2]} />
        </View>

        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {/* Icon */}
          <Animated.View
            style={[
              styles.iconWrapper,
              { transform: [{ scale: iconPulse }] }
            ]}
          >
            <View style={styles.iconCircle}>
              <Ionicons name={quote.icon} size={24} color={theme.secondary} />
            </View>
          </Animated.View>

          {/* Quote in French */}
          <Text style={styles.quoteText}>
            "{quote.quote}"
          </Text>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Ionicons name="language" size={14} color="rgba(255,255,255,0.5)" />
            <View style={styles.dividerLine} />
          </View>

          {/* Translation */}
          <Text style={styles.translationText}>
            {quote.translation}
          </Text>

          {/* Author if exists */}
          {quote.author && (
            <Text style={styles.authorText}>
              — {quote.author}
            </Text>
          )}

          {/* Tap hint */}
          <View style={styles.hintRow}>
            <Ionicons name="refresh" size={12} color="rgba(255,255,255,0.5)" />
            <Text style={styles.hintText}>Tap for new inspiration</Text>
          </View>
        </Animated.View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginVertical: 16,
    borderRadius: 20,
    overflow: 'hidden',
    ...themeShadows.md,
  },
  card: {
    padding: 24,
    paddingTop: 28,
    alignItems: 'center',
  },
  decorTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    overflow: 'hidden',
  },
  decorCircle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  decorCircle1: {
    width: 100,
    height: 100,
    top: -50,
    right: -20,
  },
  decorCircle2: {
    width: 60,
    height: 60,
    top: -20,
    left: 20,
  },
  iconWrapper: {
    marginBottom: 16,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quoteText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 12,
    fontStyle: 'italic',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  dividerLine: {
    height: 1,
    width: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  translationText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 8,
  },
  authorText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    fontStyle: 'italic',
    marginBottom: 16,
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  hintText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
  },

  // Compact styles
  compactContainer: {
    marginHorizontal: 20,
    marginVertical: 8,
  },
  compactCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  compactIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactQuote: {
    fontSize: 13,
    fontWeight: '600',
    fontStyle: 'italic',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  compactTranslation: {
    fontSize: 11,
    marginTop: 2,
  },
});

