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

const LISTENING_CATEGORIES = [
  { id: 'conversations', name: 'Conversations', icon: 'chatbubbles', color: '#6366F1', gradient: ['#6366F1', '#4F46E5'], desc: 'Daily dialogues' },
  { id: 'numbers', name: 'Numbers & Math', icon: 'calculator', color: '#8B5CF6', gradient: ['#8B5CF6', '#7C3AED'], desc: 'Counting & prices' },
  { id: 'time_dates', name: 'Time & Dates', icon: 'calendar', color: '#EC4899', gradient: ['#EC4899', '#DB2777'], desc: 'Schedules & plans' },
  { id: 'directions', name: 'Directions', icon: 'navigate', color: '#10B981', gradient: ['#10B981', '#059669'], desc: 'Finding places' },
  { id: 'food_restaurant', name: 'Restaurant', icon: 'restaurant', color: '#F59E0B', gradient: ['#F59E0B', '#D97706'], desc: 'Ordering food' },
  { id: 'travel', name: 'Travel', icon: 'airplane', color: '#3B82F6', gradient: ['#3B82F6', '#2563EB'], desc: 'Airport & hotel' },
  { id: 'shopping', name: 'Shopping', icon: 'cart', color: '#F43F5E', gradient: ['#F43F5E', '#E11D48'], desc: 'Buying things' },
  { id: 'weather', name: 'Weather', icon: 'cloudy', color: '#06B6D4', gradient: ['#06B6D4', '#0891B2'], desc: 'Forecasts' },
];

const LISTENING_EXERCISES = {
  conversations: [
    {
      id: 'c1',
      audioText: 'Bonjour, je m\'appelle Sophie. Et vous, comment vous appelez-vous?',
      translation: 'Hello, my name is Sophie. And you, what is your name?',
      question: 'What is the speaker\'s name?',
      options: ['Marie', 'Sophie', 'Julie', 'Anne'],
      correct: 1,
      explanation: 'She says "je m\'appelle Sophie" which means "my name is Sophie".',
      difficulty: 'beginner',
    },
    {
      id: 'c2',
      audioText: 'J\'habite à Lyon depuis cinq ans. C\'est une très belle ville.',
      translation: 'I have lived in Lyon for five years. It\'s a very beautiful city.',
      question: 'How long has the speaker lived in Lyon?',
      options: ['3 years', '4 years', '5 years', '6 years'],
      correct: 2,
      explanation: '"Depuis cinq ans" means "for five years".',
      difficulty: 'intermediate',
    },
    {
      id: 'c3',
      audioText: 'Mon frère est médecin et ma sœur est professeur.',
      translation: 'My brother is a doctor and my sister is a teacher.',
      question: 'What is the sister\'s profession?',
      options: ['Doctor', 'Lawyer', 'Teacher', 'Engineer'],
      correct: 2,
      explanation: '"Ma sœur est professeur" means "my sister is a teacher".',
      difficulty: 'beginner',
    },
    {
      id: 'c4',
      audioText: 'Je me lève à sept heures et je prends le petit-déjeuner à sept heures et demie.',
      translation: 'I wake up at seven o\'clock and have breakfast at seven thirty.',
      question: 'When does the speaker have breakfast?',
      options: ['7:00', '7:15', '7:30', '8:00'],
      correct: 2,
      explanation: '"Sept heures et demie" means "seven thirty" (7:30).',
      difficulty: 'intermediate',
    },
    {
      id: 'c5',
      audioText: 'Enchanté de faire votre connaissance. Vous êtes français?',
      translation: 'Pleased to meet you. Are you French?',
      question: 'What does "Enchanté" express?',
      options: ['Goodbye', 'Nice to meet you', 'Thank you', 'Excuse me'],
      correct: 1,
      explanation: '"Enchanté" means "pleased/delighted" - used when meeting someone.',
      difficulty: 'beginner',
    },
    {
      id: 'c6',
      audioText: 'Nous avons trois enfants: deux fils et une fille.',
      translation: 'We have three children: two sons and one daughter.',
      question: 'How many daughters does the speaker have?',
      options: ['None', 'One', 'Two', 'Three'],
      correct: 1,
      explanation: '"Une fille" means "one daughter".',
      difficulty: 'beginner',
    },
  ],
  numbers: [
    {
      id: 'n1',
      audioText: 'J\'ai trois pommes et deux oranges. Ça fait cinq fruits.',
      translation: 'I have three apples and two oranges. That makes five fruits.',
      question: 'How many fruits in total?',
      options: ['Four', 'Five', 'Six', 'Seven'],
      correct: 1,
      explanation: 'Trois (3) + deux (2) = cinq (5) fruits.',
      difficulty: 'beginner',
    },
    {
      id: 'n2',
      audioText: 'Ce livre coûte vingt-cinq euros et ce stylo coûte trois euros.',
      translation: 'This book costs 25 euros and this pen costs 3 euros.',
      question: 'How much is the book?',
      options: ['€15', '€23', '€25', '€35'],
      correct: 2,
      explanation: '"Vingt-cinq euros" = 25 euros.',
      difficulty: 'beginner',
    },
    {
      id: 'n3',
      audioText: 'Mon numéro de téléphone est le zéro six, quarante-deux, quinze, trente-trois.',
      translation: 'My phone number is 06 42 15 33.',
      question: 'What is the second pair of digits?',
      options: ['15', '33', '42', '06'],
      correct: 2,
      explanation: '"Quarante-deux" = 42, which is the second pair.',
      difficulty: 'intermediate',
    },
    {
      id: 'n4',
      audioText: 'Il y a quatre-vingts élèves dans l\'école et trente professeurs.',
      translation: 'There are 80 students in the school and 30 teachers.',
      question: 'How many students are there?',
      options: ['40', '60', '80', '100'],
      correct: 2,
      explanation: '"Quatre-vingts" = 80 (literally "four twenties").',
      difficulty: 'intermediate',
    },
    {
      id: 'n5',
      audioText: 'L\'addition, s\'il vous plaît. Ça fait soixante-quinze euros.',
      translation: 'The check, please. That\'s 75 euros.',
      question: 'What is the total bill?',
      options: ['€55', '€65', '€75', '€85'],
      correct: 2,
      explanation: '"Soixante-quinze" = 75 (sixty-fifteen).',
      difficulty: 'intermediate',
    },
    {
      id: 'n6',
      audioText: 'Ma grand-mère a quatre-vingt-dix ans cette année.',
      translation: 'My grandmother is 90 years old this year.',
      question: 'How old is the grandmother?',
      options: ['80', '85', '90', '95'],
      correct: 2,
      explanation: '"Quatre-vingt-dix" = 90 (four-twenty-ten).',
      difficulty: 'advanced',
    },
  ],
  time_dates: [
    {
      id: 't1',
      audioText: 'Le train part à neuf heures et arrive à onze heures.',
      translation: 'The train leaves at 9 o\'clock and arrives at 11 o\'clock.',
      question: 'What time does the train arrive?',
      options: ['9:00', '10:00', '11:00', '12:00'],
      correct: 2,
      explanation: '"Onze heures" = 11 o\'clock.',
      difficulty: 'beginner',
    },
    {
      id: 't2',
      audioText: 'Nous sommes le quinze mars. Mon anniversaire est dans une semaine.',
      translation: 'It is March 15th. My birthday is in one week.',
      question: 'When is the speaker\'s birthday?',
      options: ['March 15', 'March 22', 'March 8', 'March 30'],
      correct: 1,
      explanation: 'March 15 + one week = March 22.',
      difficulty: 'intermediate',
    },
    {
      id: 't3',
      audioText: 'Le magasin ouvre à dix heures et ferme à dix-neuf heures.',
      translation: 'The store opens at 10 and closes at 7 PM (19:00).',
      question: 'What time does the store close?',
      options: ['5 PM', '6 PM', '7 PM', '8 PM'],
      correct: 2,
      explanation: '"Dix-neuf heures" = 19:00 = 7 PM.',
      difficulty: 'intermediate',
    },
    {
      id: 't4',
      audioText: 'Le rendez-vous est mercredi prochain à quatorze heures trente.',
      translation: 'The appointment is next Wednesday at 2:30 PM.',
      question: 'What day is the appointment?',
      options: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'],
      correct: 2,
      explanation: '"Mercredi" = Wednesday.',
      difficulty: 'beginner',
    },
    {
      id: 't5',
      audioText: 'L\'été dernier, nous sommes allés en Espagne pendant deux semaines.',
      translation: 'Last summer, we went to Spain for two weeks.',
      question: 'How long was the trip?',
      options: ['1 week', '2 weeks', '3 weeks', '1 month'],
      correct: 1,
      explanation: '"Deux semaines" = two weeks.',
      difficulty: 'intermediate',
    },
    {
      id: 't6',
      audioText: 'Je travaille du lundi au vendredi. Le weekend, je me repose.',
      translation: 'I work from Monday to Friday. On the weekend, I rest.',
      question: 'When does the speaker rest?',
      options: ['Monday', 'Friday', 'Weekend', 'Every day'],
      correct: 2,
      explanation: '"Le weekend, je me repose" = I rest on the weekend.',
      difficulty: 'beginner',
    },
  ],
  directions: [
    {
      id: 'd1',
      audioText: 'La bibliothèque est à droite de l\'école, près du parc.',
      translation: 'The library is to the right of the school, near the park.',
      question: 'Where is the library?',
      options: ['Left of school', 'Right of school', 'Behind school', 'In front of school'],
      correct: 1,
      explanation: '"À droite" means "to the right".',
      difficulty: 'beginner',
    },
    {
      id: 'd2',
      audioText: 'Pour aller à la gare, tournez à gauche puis continuez tout droit.',
      translation: 'To go to the station, turn left then continue straight.',
      question: 'What direction first?',
      options: ['Right', 'Left', 'Straight', 'Back'],
      correct: 1,
      explanation: '"Tournez à gauche" = turn left.',
      difficulty: 'beginner',
    },
    {
      id: 'd3',
      audioText: 'Le restaurant est au coin de la rue, à côté de la banque.',
      translation: 'The restaurant is on the corner, next to the bank.',
      question: 'Where exactly is the restaurant?',
      options: ['Behind the bank', 'Next to the bank', 'Far from the bank', 'In the bank'],
      correct: 1,
      explanation: '"À côté de" means "next to".',
      difficulty: 'intermediate',
    },
    {
      id: 'd4',
      audioText: 'C\'est loin? Non, c\'est à cinq minutes à pied.',
      translation: 'Is it far? No, it\'s five minutes on foot.',
      question: 'How far is the destination?',
      options: ['Very far', '5 mins walk', '15 mins walk', '5 mins by car'],
      correct: 1,
      explanation: '"Cinq minutes à pied" = five minutes on foot.',
      difficulty: 'beginner',
    },
    {
      id: 'd5',
      audioText: 'Le musée est situé entre l\'église et la mairie.',
      translation: 'The museum is located between the church and the town hall.',
      question: 'What is the museum between?',
      options: ['Bank & school', 'Church & town hall', 'Park & library', 'Hotel & station'],
      correct: 1,
      explanation: '"Entre l\'église et la mairie" = between the church and town hall.',
      difficulty: 'intermediate',
    },
    {
      id: 'd6',
      audioText: 'Prenez la deuxième rue à droite, puis la première à gauche.',
      translation: 'Take the second street on the right, then the first on the left.',
      question: 'Which street to take first?',
      options: ['First right', 'Second right', 'First left', 'Second left'],
      correct: 1,
      explanation: '"La deuxième rue à droite" = the second street on the right.',
      difficulty: 'intermediate',
    },
  ],
  food_restaurant: [
    {
      id: 'f1',
      audioText: 'Je voudrais un café et un croissant, s\'il vous plaît.',
      translation: 'I would like a coffee and a croissant, please.',
      question: 'What is being ordered?',
      options: ['Tea & bread', 'Coffee & cake', 'Coffee & croissant', 'Juice & croissant'],
      correct: 2,
      explanation: '"Un café et un croissant" = a coffee and a croissant.',
      difficulty: 'beginner',
    },
    {
      id: 'f2',
      audioText: 'Comme entrée, je prends la soupe. Et comme plat principal, le poisson.',
      translation: 'As a starter, I\'ll have the soup. And for the main course, the fish.',
      question: 'What is the main course?',
      options: ['Soup', 'Meat', 'Fish', 'Salad'],
      correct: 2,
      explanation: '"Le plat principal, le poisson" = the main course is fish.',
      difficulty: 'intermediate',
    },
    {
      id: 'f3',
      audioText: 'Avez-vous des plats végétariens? Oui, nous avons une salade et des pâtes.',
      translation: 'Do you have vegetarian dishes? Yes, we have a salad and pasta.',
      question: 'What vegetarian options are offered?',
      options: ['Soup & rice', 'Salad & pasta', 'Bread & cheese', 'Fish & vegetables'],
      correct: 1,
      explanation: '"Une salade et des pâtes" = salad and pasta.',
      difficulty: 'beginner',
    },
    {
      id: 'f4',
      audioText: 'L\'addition fait quarante-cinq euros. Vous payez par carte?',
      translation: 'The bill is 45 euros. Are you paying by card?',
      question: 'How much is the bill?',
      options: ['€35', '€40', '€45', '€50'],
      correct: 2,
      explanation: '"Quarante-cinq euros" = 45 euros.',
      difficulty: 'intermediate',
    },
    {
      id: 'f5',
      audioText: 'Je suis allergique aux noix. Ce plat en contient?',
      translation: 'I am allergic to nuts. Does this dish contain any?',
      question: 'What is the speaker allergic to?',
      options: ['Dairy', 'Gluten', 'Nuts', 'Shellfish'],
      correct: 2,
      explanation: '"Allergique aux noix" = allergic to nuts.',
      difficulty: 'intermediate',
    },
    {
      id: 'f6',
      audioText: 'Le steak est très bon ici. Je le recommande saignant.',
      translation: 'The steak is very good here. I recommend it rare.',
      question: 'How is the steak recommended?',
      options: ['Well done', 'Medium', 'Rare', 'Raw'],
      correct: 2,
      explanation: '"Saignant" = rare (for meat).',
      difficulty: 'advanced',
    },
  ],
  travel: [
    {
      id: 'tr1',
      audioText: 'Le vol pour Paris part de la porte numéro douze.',
      translation: 'The flight to Paris departs from gate number 12.',
      question: 'Which gate is the Paris flight?',
      options: ['Gate 2', 'Gate 10', 'Gate 12', 'Gate 20'],
      correct: 2,
      explanation: '"La porte numéro douze" = gate number 12.',
      difficulty: 'beginner',
    },
    {
      id: 'tr2',
      audioText: 'J\'ai une réservation pour deux nuits au nom de Martin.',
      translation: 'I have a reservation for two nights under the name Martin.',
      question: 'How many nights is the reservation?',
      options: ['One', 'Two', 'Three', 'Four'],
      correct: 1,
      explanation: '"Deux nuits" = two nights.',
      difficulty: 'beginner',
    },
    {
      id: 'tr3',
      audioText: 'Le train a du retard. Il arrivera avec vingt minutes de retard.',
      translation: 'The train is delayed. It will arrive 20 minutes late.',
      question: 'How late is the train?',
      options: ['10 minutes', '15 minutes', '20 minutes', '30 minutes'],
      correct: 2,
      explanation: '"Vingt minutes de retard" = 20 minutes late.',
      difficulty: 'intermediate',
    },
    {
      id: 'tr4',
      audioText: 'Votre chambre est au troisième étage, avec vue sur la mer.',
      translation: 'Your room is on the third floor, with a sea view.',
      question: 'What floor is the room on?',
      options: ['First', 'Second', 'Third', 'Fourth'],
      correct: 2,
      explanation: '"Le troisième étage" = the third floor.',
      difficulty: 'beginner',
    },
    {
      id: 'tr5',
      audioText: 'Je voudrais un billet aller-retour pour Nice, s\'il vous plaît.',
      translation: 'I would like a round-trip ticket to Nice, please.',
      question: 'What type of ticket?',
      options: ['One-way', 'Round-trip', 'First class', 'Student'],
      correct: 1,
      explanation: '"Aller-retour" = round-trip.',
      difficulty: 'intermediate',
    },
    {
      id: 'tr6',
      audioText: 'L\'embarquement commence dans quinze minutes. Préparez vos passeports.',
      translation: 'Boarding begins in 15 minutes. Prepare your passports.',
      question: 'When does boarding start?',
      options: ['5 minutes', '10 minutes', '15 minutes', '20 minutes'],
      correct: 2,
      explanation: '"Dans quinze minutes" = in 15 minutes.',
      difficulty: 'beginner',
    },
  ],
  shopping: [
    {
      id: 's1',
      audioText: 'Cette robe coûte cinquante euros. C\'est trop cher pour moi.',
      translation: 'This dress costs 50 euros. It\'s too expensive for me.',
      question: 'What does the speaker think of the price?',
      options: ['Cheap', 'Fair', 'Too expensive', 'On sale'],
      correct: 2,
      explanation: '"Trop cher" = too expensive.',
      difficulty: 'beginner',
    },
    {
      id: 's2',
      audioText: 'Avez-vous cette chemise en taille moyenne? Oui, voilà.',
      translation: 'Do you have this shirt in medium? Yes, here it is.',
      question: 'What size is requested?',
      options: ['Small', 'Medium', 'Large', 'Extra large'],
      correct: 1,
      explanation: '"Taille moyenne" = medium size.',
      difficulty: 'beginner',
    },
    {
      id: 's3',
      audioText: 'Il y a des soldes. Tout est à moins trente pour cent.',
      translation: 'There are sales. Everything is 30% off.',
      question: 'What is the discount?',
      options: ['20%', '25%', '30%', '40%'],
      correct: 2,
      explanation: '"Moins trente pour cent" = 30% off.',
      difficulty: 'intermediate',
    },
    {
      id: 's4',
      audioText: 'Je peux essayer ces chaussures? Quelle pointure faites-vous?',
      translation: 'Can I try these shoes? What shoe size are you?',
      question: 'What does the salesperson ask about?',
      options: ['Color', 'Style', 'Shoe size', 'Brand'],
      correct: 2,
      explanation: '"Quelle pointure" asks about shoe size.',
      difficulty: 'intermediate',
    },
    {
      id: 's5',
      audioText: 'Vous payez en espèces ou par carte? Par carte, s\'il vous plaît.',
      translation: 'Cash or card? Card, please.',
      question: 'How will the customer pay?',
      options: ['Cash', 'Card', 'Check', 'Gift card'],
      correct: 1,
      explanation: '"Par carte" = by card.',
      difficulty: 'beginner',
    },
    {
      id: 's6',
      audioText: 'Ce sac est en cuir véritable. C\'est de la qualité.',
      translation: 'This bag is genuine leather. It\'s quality.',
      question: 'What is the bag made of?',
      options: ['Plastic', 'Fabric', 'Leather', 'Paper'],
      correct: 2,
      explanation: '"En cuir véritable" = genuine leather.',
      difficulty: 'intermediate',
    },
  ],
  weather: [
    {
      id: 'w1',
      audioText: 'Il fait beau aujourd\'hui, mais il va pleuvoir demain.',
      translation: 'It\'s nice today, but it will rain tomorrow.',
      question: 'What will the weather be tomorrow?',
      options: ['Sunny', 'Cloudy', 'Rainy', 'Snowy'],
      correct: 2,
      explanation: '"Il va pleuvoir" = it will rain.',
      difficulty: 'beginner',
    },
    {
      id: 'w2',
      audioText: 'La température est de quinze degrés ce matin.',
      translation: 'The temperature is 15 degrees this morning.',
      question: 'What is the temperature?',
      options: ['10°', '15°', '20°', '25°'],
      correct: 1,
      explanation: '"Quinze degrés" = 15 degrees.',
      difficulty: 'beginner',
    },
    {
      id: 'w3',
      audioText: 'Prenez un parapluie. Il y a des risques d\'orages cet après-midi.',
      translation: 'Take an umbrella. There\'s a risk of thunderstorms this afternoon.',
      question: 'Why take an umbrella?',
      options: ['Hot sun', 'Strong wind', 'Thunderstorms', 'Snow'],
      correct: 2,
      explanation: '"Risques d\'orages" = risk of thunderstorms.',
      difficulty: 'intermediate',
    },
    {
      id: 'w4',
      audioText: 'Il neige depuis hier soir. Les routes sont glissantes.',
      translation: 'It has been snowing since last night. The roads are slippery.',
      question: 'Since when has it been snowing?',
      options: ['This morning', 'Last night', 'Yesterday noon', 'This afternoon'],
      correct: 1,
      explanation: '"Depuis hier soir" = since last night.',
      difficulty: 'intermediate',
    },
    {
      id: 'w5',
      audioText: 'L\'été sera chaud cette année avec des températures de trente-cinq degrés.',
      translation: 'The summer will be hot this year with temperatures of 35 degrees.',
      question: 'What will summer temperatures be?',
      options: ['25°', '30°', '35°', '40°'],
      correct: 2,
      explanation: '"Trente-cinq degrés" = 35 degrees.',
      difficulty: 'intermediate',
    },
    {
      id: 'w6',
      audioText: 'Le brouillard se lèvera en fin de matinée.',
      translation: 'The fog will lift by late morning.',
      question: 'When will the fog clear?',
      options: ['Morning', 'Late morning', 'Afternoon', 'Evening'],
      correct: 1,
      explanation: '"En fin de matinée" = late morning.',
      difficulty: 'advanced',
    },
  ],
};

export default function ListeningPracticeScreen({ navigation }) {
  const { isDarkMode, toggleTheme } = useTheme();
  const theme = getThemeColors(isDarkMode);
  const { awardXP } = useGamification();

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playCount, setPlayCount] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
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
  const waveAnims = useRef([...Array(5)].map(() => new Animated.Value(0.3))).current;
  const optionAnims = useRef([...Array(4)].map(() => new Animated.Value(0))).current;

  const exercises = selectedCategory ? LISTENING_EXERCISES[selectedCategory] : [];
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
    if (isPlaying) {
      waveAnims.forEach((anim, i) => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, { toValue: 1, duration: 300 + i * 100, useNativeDriver: true }),
            Animated.timing(anim, { toValue: 0.3, duration: 300 + i * 100, useNativeDriver: true }),
          ])
        ).start();
      });
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.1, duration: 500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        ])
      ).start();
    } else {
      waveAnims.forEach(anim => anim.setValue(0.3));
      pulseAnim.setValue(1);
    }
  }, [isPlaying]);

  useEffect(() => {
    if (currentExercise) {
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
  }, [currentIndex, selectedCategory]);

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
    setSelectedAnswer(null);
    setShowResult(false);
    setAnswers([]);
    setScore(0);
    setStreak(0);
    setPlayCount(0);
    setSessionCompleted(false);
    setTimeElapsed(0);
    setStartTime(Date.now());
  };

  const handlePlayAudio = async () => {
    if (isPlaying) {
      stopSpeech();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
    setPlayCount(playCount + 1);

    try {
      await speakText(currentExercise.audioText, 'fr-FR');
    } catch (error) {
      console.error('Error playing audio:', error);
    } finally {
      setIsPlaying(false);
    }
  };

  const handleAnswer = (index) => {
    if (showResult) return;

    setSelectedAnswer(index);
    const isCorrect = index === currentExercise.correct;

    if (isCorrect) {
      setScore(score + 1);
      setStreak(streak + 1);
    } else {
      setStreak(0);
    }

    setAnswers([...answers, { exerciseId: currentExercise.id, answer: index, isCorrect }]);

    setTimeout(() => setShowResult(true), 400);
  };

  const handleNext = () => {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setPlayCount(0);
      stopSpeech();
      setIsPlaying(false);
    } else {
      finishSession();
    }
  };

  const finishSession = () => {
    setSessionCompleted(true);
    stopSpeech();
    const percentage = (score / exercises.length) * 100;

    if (percentage >= 90) {
      awardXP(100, 'Listening Master! 🎧');
    } else if (percentage >= 70) {
      awardXP(60, 'Great comprehension! ⭐');
    } else if (percentage >= 50) {
      awardXP(30, 'Good listening practice!');
    } else {
      awardXP(15, 'Listening practice completed!');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCategoryInfo = () => LISTENING_CATEGORIES.find(c => c.id === selectedCategory);

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
              <Text style={[styles.navTitle, { color: theme.text }]}>Listening</Text>
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
                <Text style={[styles.greetingSubtitle, { color: theme.secondary }]}>IMMERSIVE COMPREHENSION</Text>
                <Text style={[styles.greetingTitle, { color: theme.text }]}>Listening</Text>
                <Text style={[styles.heroDescription, { color: theme.textSecondary }]}>
                  Master French listening with immersive exercises and real-world conversations.
                </Text>
              </Animated.View>
            </View>
          </View>

          <View style={styles.contentBody}>
            <View style={[styles.statsOverview, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={styles.overviewItem}>
                <Text style={[styles.overviewValue, { color: theme.text }]}>54</Text>
                <Text style={[styles.overviewLabel, { color: theme.textSecondary }]}>Clips</Text>
              </View>
              <View style={[styles.overviewDivider, { backgroundColor: theme.border }]} />
              <View style={styles.overviewItem}>
                <Text style={[styles.overviewValue, { color: theme.text }]}>8</Text>
                <Text style={[styles.overviewLabel, { color: theme.textSecondary }]}>Topics</Text>
              </View>
              <View style={[styles.overviewDivider, { backgroundColor: theme.border }]} />
              <View style={styles.overviewItem}>
                <Text style={[styles.overviewValue, { color: theme.text }]}>Studio</Text>
                <Text style={[styles.overviewLabel, { color: theme.textSecondary }]}>Quality</Text>
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <View style={[styles.titleAccent, { backgroundColor: theme.primary }]} />
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Choose a Topic</Text>
              </View>
            </View>

            <View style={styles.categoryGrid}>
              {LISTENING_CATEGORIES.map((category, index) => (
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
                      <Ionicons name="headset-outline" size={16} color={theme.primary} />
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
    const percentage = (score / exercises.length) * 100;
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
              name={percentage >= 70 ? 'musical-notes' : 'headset'}
              size={56}
              color="#FFFFFF"
            />
          </View>

          <Text style={styles.resultTitle}>
            {percentage >= 90 ? 'Incroyable!' : percentage >= 70 ? 'Excellent!' : percentage >= 50 ? 'Bien joué!' : 'Continue!'}
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
                  <Ionicons name="stats-chart" size={24} color={theme.primary} />
                </View>
                <Text style={[styles.scoreValue, { color: theme.text }]}>{score}/{exercises.length}</Text>
                <Text style={[styles.scoreLabel, { color: theme.textSecondary }]}>Correct</Text>
              </View>

              <View style={[styles.scoreDivider, { backgroundColor: theme.border }]} />

              <View style={styles.scoreItem}>
                <View style={[styles.scoreIcon, { backgroundColor: theme.success + '15' }]}>
                  <Ionicons name="checkmark-done" size={24} color={theme.success} />
                </View>
                <Text style={[styles.scoreValue, { color: theme.success }]}>{percentage.toFixed(0)}%</Text>
                <Text style={[styles.scoreLabel, { color: theme.textSecondary }]}>Accuracy</Text>
              </View>

              <View style={[styles.scoreDivider, { backgroundColor: theme.border }]} />

              <View style={styles.scoreItem}>
                <View style={[styles.scoreIcon, { backgroundColor: theme.secondary + '15' }]}>
                  <Ionicons name="time" size={24} color={theme.secondary} />
                </View>
                <Text style={[styles.scoreValue, { color: theme.text }]}>{formatTime(timeElapsed)}</Text>
                <Text style={[styles.scoreLabel, { color: theme.textSecondary }]}>Duration</Text>
              </View>
            </View>
          </View>

          <View style={[styles.performanceCard, { backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1 }, themeShadows.sm]}>
            <View style={[styles.performanceBadge, { backgroundColor: percentage >= 70 ? theme.success + '15' : theme.secondary + '15' }]}>
              <Ionicons
                name={percentage >= 70 ? "trophy" : "bulb"}
                size={32}
                color={percentage >= 70 ? theme.success : theme.secondary}
              />
            </View>
            <View style={styles.performanceInfo}>
              <Text style={[styles.performanceTitle, { color: theme.text }]}>Performance Insights</Text>
              <Text style={[styles.performanceDesc, { color: theme.textSecondary }]}>
                {percentage >= 90
                  ? "Flawless! Your French listening skills are exceptional."
                  : percentage >= 70
                    ? "Great work! You understood most of the audio clearly."
                    : "Good effort. Try listening to the clips multiple times to catch every word."}
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

        <View style={[styles.audioCard, { backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1 }, themeShadows.md]}>
          <View style={styles.audioMeta}>
            <View style={[
              styles.difficultyBadge,
              { backgroundColor: currentExercise?.difficulty === 'beginner' ? theme.success + '20' : currentExercise?.difficulty === 'intermediate' ? theme.secondary + '20' : theme.error + '20' }
            ]}>
              <Text style={[
                styles.difficultyText,
                { color: currentExercise?.difficulty === 'beginner' ? theme.success : currentExercise?.difficulty === 'intermediate' ? theme.secondary : theme.error }
              ]}>
                {currentExercise?.difficulty}
              </Text>
            </View>
            {playCount > 0 && (
              <Text style={[styles.playCountText, { color: theme.textSecondary }]}>
                Played {playCount}×
              </Text>
            )}
          </View>

          <View style={styles.waveformContainer}>
            <View style={styles.waveform}>
              {waveAnims.map((anim, i) => (
                <Animated.View
                  key={i}
                  style={[
                    styles.waveBar,
                    {
                      backgroundColor: categoryInfo?.color,
                      transform: [{ scaleY: anim }]
                    }
                  ]}
                />
              ))}
            </View>
          </View>

          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity
              style={[styles.playBtn, { backgroundColor: categoryInfo?.color }, themeShadows.md]}
              onPress={handlePlayAudio}
              activeOpacity={0.9}
            >
              <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={36}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </Animated.View>

          <Text style={[styles.playHint, { color: theme.textSecondary }]}>
            {isPlaying ? 'Playing audio...' : 'Tap to listen'}
          </Text>
        </View>

        <View style={[styles.phraseCard, { backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1 }, themeShadows.md]}>
          <View style={styles.phraseMeta}>
            <View style={[styles.difficultyBadge, { backgroundColor: theme.primary + '15' }]}>
              <Ionicons name="help-circle" size={16} color={theme.primary} />
            </View>
            <Text style={[styles.difficultyText, { color: theme.primary }]}>QUESTION</Text>
          </View>
          <Text style={[styles.phraseText, { color: theme.text }]}>
            {currentExercise?.question}
          </Text>
        </View>

        <View style={styles.optionsGrid}>
          {currentExercise?.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrect = index === currentExercise.correct;
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
                  }]
                }}
              >
                <TouchableOpacity
                  style={[
                    styles.optionBtn,
                    {
                      backgroundColor: theme.surface,
                      borderColor: showCorrect ? theme.success : showWrong ? theme.error : isSelected ? categoryInfo?.color : theme.border,
                      borderWidth: showCorrect || showWrong || isSelected ? 2.5 : 1,
                    },
                    (showCorrect || showWrong || isSelected) ? themeShadows.sm : {}
                  ]}
                  onPress={() => handleAnswer(index)}
                  disabled={showResult}
                  activeOpacity={0.8}
                >
                  <View style={[
                    styles.optionLetter,
                    {
                      backgroundColor: showCorrect ? theme.success : showWrong ? theme.error : isSelected ? categoryInfo?.color : theme.surfaceAlt,
                    }
                  ]}>
                    <Text style={[
                      styles.optionLetterText,
                      { color: (showCorrect || showWrong || isSelected) ? '#FFFFFF' : theme.text }
                    ]}>
                      {String.fromCharCode(65 + index)}
                    </Text>
                  </View>
                  <Text style={[styles.optionText, { color: theme.text }]}>
                    {option}
                  </Text>
                  {showCorrect && (
                    <Ionicons name="checkmark-circle" size={26} color={theme.success} />
                  )}
                  {showWrong && (
                    <Ionicons name="close-circle" size={26} color={theme.error} />
                  )}
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        {showResult && (
          <View style={[
            styles.explanationCard,
            {
              backgroundColor: theme.surface,
              borderLeftColor: selectedAnswer === currentExercise.correct ? theme.success : theme.secondary,
              borderWidth: 1,
              borderColor: theme.border,
            },
            themeShadows.sm
          ]}>
            <View style={styles.explanationHeader}>
              <Ionicons
                name={selectedAnswer === currentExercise.correct ? 'checkmark-circle' : 'bulb'}
                size={24}
                color={selectedAnswer === currentExercise.correct ? theme.success : theme.secondary}
              />
              <Text style={[styles.explanationTitle, { color: theme.text }]}>
                {selectedAnswer === currentExercise.correct ? 'Correct!' : 'Explanation'}
              </Text>
            </View>
            <Text style={[styles.explanationText, { color: theme.textSecondary }]}>
              {currentExercise?.explanation}
            </Text>
            <View style={[styles.translationBox, { backgroundColor: theme.surfaceAlt, borderColor: theme.border, borderWidth: 1 }]}>
              <Ionicons name="language" size={16} color={theme.textSecondary} />
              <Text style={[styles.translationText, { color: theme.textSecondary }]}>
                {currentExercise?.translation}
              </Text>
            </View>
          </View>
        )}

        {showResult && (
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
                {currentIndex < exercises.length - 1 ? 'Next Exercise' : 'See Results'}
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
    zIndex: 100,
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 15,
    borderBottomWidth: 1,
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
    gap: 15,
  },
  navBackBtn: {
    padding: 5,
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
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: 20,
    overflow: 'hidden',
  },
  heroContent: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  blurTop: {
    position: 'absolute',
    top: -50,
    right: -20,
    width: 250,
    height: 250,
    opacity: 0.15,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
    zIndex: 10,
  },
  backCircle: {
    width: 45,
    height: 45,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeToggle: {
    width: 45,
    height: 45,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greetingSection: {
    marginBottom: 20,
  },
  greetingSubtitle: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  greetingTitle: {
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: -1,
    marginBottom: 12,
  },
  heroDescription: {
    fontSize: 16,
    lineHeight: 24,
    maxWidth: '85%',
  },
  contentBody: {
    paddingHorizontal: 24,
  },
  statsOverview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 20,
    borderRadius: 24,
    marginBottom: 32,
    borderWidth: 1,
  },
  overviewItem: {
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
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  overviewDivider: {
    width: 1,
    height: 30,
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleAccent: {
    width: 4,
    height: 24,
    borderRadius: 2,
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  categoryGrid: {
    gap: 16,
  },
  categoryWrapper: {
    marginBottom: 4,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 24,
  },
  categoryIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
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
    fontSize: 13,
    fontWeight: '500',
  },
  playCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  practiceHeader: {
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: 28,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
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
    paddingTop: 36,
  },
  audioCard: {
    padding: 24,
    borderRadius: 28,
    marginBottom: 24,
    alignItems: 'center',
  },
  audioMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 24,
  },
  difficultyBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  playCountText: {
    fontSize: 13,
    fontWeight: '600',
  },
  waveformContainer: {
    marginBottom: 30,
    width: '100%',
    alignItems: 'center',
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
    gap: 5,
  },
  waveBar: {
    width: 6,
    height: 60,
    borderRadius: 3,
  },
  playBtn: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  playHint: {
    fontSize: 14,
    fontWeight: '700',
  },
  phraseCard: {
    padding: 24,
    borderRadius: 28,
    marginBottom: 24,
  },
  phraseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  phraseText: {
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 32,
    letterSpacing: -0.5,
  },
  optionsGrid: {
    gap: 16,
    marginBottom: 24,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
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
    fontWeight: '800',
  },
  optionText: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
  },
  explanationCard: {
    padding: 24,
    borderRadius: 24,
    marginBottom: 24,
    borderLeftWidth: 6,
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  explanationTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  explanationText: {
    fontSize: 16,
    lineHeight: 26,
    marginBottom: 20,
  },
  translationBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  translationText: {
    flex: 1,
    fontSize: 15,
    fontStyle: 'italic',
    lineHeight: 24,
  },
  nextBtn: {
    borderRadius: 22,
    overflow: 'hidden',
  },
  nextBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 12,
  },
  nextBtnText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  resultHeader: {
    paddingTop: Platform.OS === 'ios' ? 70 : 60,
    paddingBottom: 60,
    alignItems: 'center',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    overflow: 'hidden',
  },
  resultDecor1: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  resultDecor2: {
    position: 'absolute',
    bottom: -60,
    left: -60,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  closeBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 50,
    right: 25,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  resultIconContainer: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  resultIconGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  resultTitle: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 10,
    letterSpacing: -1,
  },
  resultSubtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.95)',
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
    borderRadius: 32,
    padding: 24,
    marginBottom: 24,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scoreItem: {
    alignItems: 'center',
    flex: 1,
  },
  scoreIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 4,
  },
  scoreLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scoreDivider: {
    width: 1,
    height: 60,
    marginHorizontal: 10,
  },
  performanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 28,
    marginBottom: 32,
  },
  performanceBadge: {
    width: 64,
    height: 64,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
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
    gap: 15,
  },
  retryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 22,
    gap: 10,
  },
  retryBtnText: {
    fontSize: 16,
    fontWeight: '800',
  },
  newDeckBtn: {
    flex: 1,
    borderRadius: 22,
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
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
