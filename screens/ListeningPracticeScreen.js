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

const LISTENING_CATEGORIES = [
  { id: 'conversations', name: 'Conversations', icon: 'chatbubbles', color: '#3B82F6', gradient: ['#3B82F6', '#2563EB'], desc: 'Daily dialogues' },
  { id: 'numbers', name: 'Numbers & Math', icon: 'calculator', color: '#10B981', gradient: ['#10B981', '#059669'], desc: 'Counting & prices' },
  { id: 'time_dates', name: 'Time & Dates', icon: 'calendar', color: '#8B5CF6', gradient: ['#8B5CF6', '#7C3AED'], desc: 'Schedules & plans' },
  { id: 'directions', name: 'Directions', icon: 'navigate', color: '#F59E0B', gradient: ['#F59E0B', '#D97706'], desc: 'Finding places' },
  { id: 'food_restaurant', name: 'Restaurant', icon: 'restaurant', color: '#EF4444', gradient: ['#EF4444', '#DC2626'], desc: 'Ordering food' },
  { id: 'travel', name: 'Travel', icon: 'airplane', color: '#06B6D4', gradient: ['#06B6D4', '#0891B2'], desc: 'Airport & hotel' },
  { id: 'shopping', name: 'Shopping', icon: 'cart', color: '#EC4899', gradient: ['#EC4899', '#DB2777'], desc: 'Buying things' },
  { id: 'weather', name: 'Weather', icon: 'cloudy', color: '#14B8A6', gradient: ['#14B8A6', '#0D9488'], desc: 'Forecasts' },
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
  const { colors, isDarkMode } = useTheme();
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
      <View style={[styles.container, { backgroundColor: isDarkMode ? '#000000' : '#F8FAFC' }]}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

        <LinearGradient
          colors={isDarkMode ? ['#1E3A8A', '#1E40AF'] : ['#3B82F6', '#2563EB']}
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
                <Ionicons name="headset" size={44} color="#FFFFFF" />
              </LinearGradient>
            </View>
            <Text style={styles.headerTitle}>Listening Practice</Text>
            <Text style={styles.headerSubtitle}>
              Train your ear for French conversations
            </Text>
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
            Listen and understand real French
          </Text>

          <View style={styles.categoryGrid}>
            {LISTENING_CATEGORIES.map((category, index) => (
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
                    <View style={[styles.exerciseBadge, { backgroundColor: category.color + '20' }]}>
                      <Text style={[styles.exerciseBadgeText, { color: category.color }]}>6 audio</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={colors.secondaryText} />
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>

          <View style={[styles.statsCard, { backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF' }]}>
            <LinearGradient
              colors={['#3B82F6', '#2563EB']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.statsGradient}
            >
              <View style={styles.statItem}>
                <Text style={styles.statValue}>48</Text>
                <Text style={styles.statLabel}>Audio Clips</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>8</Text>
                <Text style={styles.statLabel}>Topics</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Ionicons name="ear" size={28} color="#FFFFFF" />
                <Text style={styles.statLabel}>Native Audio</Text>
              </View>
            </LinearGradient>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </View>
    );
  }

  if (sessionCompleted) {
    const percentage = (score / exercises.length) * 100;
    const categoryInfo = getCategoryInfo();

    return (
      <View style={[styles.container, { backgroundColor: isDarkMode ? '#000000' : '#F8FAFC' }]}>
        <StatusBar barStyle="light-content" />

        <LinearGradient
          colors={percentage >= 70 ? ['#10B981', '#059669'] : ['#3B82F6', '#2563EB']}
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
              name={percentage >= 70 ? 'headset' : 'ear'}
              size={56}
              color="#FFFFFF"
            />
          </View>

          <Text style={styles.resultTitle}>
            {percentage >= 90 ? 'Parfait!' : percentage >= 70 ? 'Excellent!' : percentage >= 50 ? 'Bien!' : 'Continue!'}
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
                <Text style={[styles.scoreLabel, { color: colors.secondaryText }]}>Score</Text>
                <Text style={[styles.scoreValue, { color: colors.text }]}>{score}/{exercises.length}</Text>
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
                <Text style={[styles.scoreLabel, { color: colors.secondaryText }]}>Time</Text>
                <Text style={[styles.scoreValue, { color: colors.text }]}>{formatTime(timeElapsed)}</Text>
              </View>
            </View>
          </View>

          <Text style={[styles.reviewTitle, { color: colors.text }]}>Review Answers</Text>

          {exercises.map((exercise, index) => {
            const userAnswer = answers[index];
            const isCorrect = userAnswer?.isCorrect;

            return (
              <View
                key={exercise.id}
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
                    {exercise.question}
                  </Text>
                </View>
                <Text style={[styles.reviewAudio, { color: colors.secondaryText }]} numberOfLines={1}>
                  "{exercise.audioText}"
                </Text>
                <Text style={[styles.reviewAnswer, { color: colors.secondaryText }]}>
                  Your answer: <Text style={{ fontWeight: '600', color: isCorrect ? '#10B981' : '#F43F5E' }}>
                    {exercise.options[userAnswer?.answer]}
                  </Text>
                </Text>
              </View>
            );
          })}

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
                colors={['#3B82F6', '#2563EB']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.newSessionGradient}
              >
                <Ionicons name="grid" size={22} color="#FFFFFF" />
                <Text style={styles.newSessionBtnText}>New Topic</Text>
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
        colors={categoryInfo?.gradient || ['#3B82F6', '#2563EB']}
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

        {streak >= 2 && (
          <View style={styles.streakBadge}>
            <Ionicons name="flame" size={18} color="#F59E0B" />
            <Text style={styles.streakText}>{streak} Streak!</Text>
          </View>
        )}
      </LinearGradient>

      <ScrollView
        style={styles.practiceScroll}
        contentContainerStyle={styles.practiceContent}
        showsVerticalScrollIndicator={false}
      >

        <View style={[styles.audioCard, { backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF' }]}>
          <View style={styles.audioMeta}>
            <View style={[
              styles.difficultyBadge,
              { backgroundColor: currentExercise?.difficulty === 'beginner' ? '#10B98120' : currentExercise?.difficulty === 'intermediate' ? '#F59E0B20' : '#EF444420' }
            ]}>
              <Text style={[
                styles.difficultyText,
                { color: currentExercise?.difficulty === 'beginner' ? '#10B981' : currentExercise?.difficulty === 'intermediate' ? '#F59E0B' : '#EF4444' }
              ]}>
                {currentExercise?.difficulty}
              </Text>
            </View>
            {playCount > 0 && (
              <Text style={[styles.playCountText, { color: colors.secondaryText }]}>
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
              style={[styles.playBtn, { backgroundColor: categoryInfo?.color }]}
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

          <Text style={[styles.playHint, { color: colors.secondaryText }]}>
            {isPlaying ? 'Playing audio...' : 'Tap to listen'}
          </Text>
        </View>

        <View style={[styles.questionCard, { backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF' }]}>
          <View style={styles.questionIcon}>
            <Ionicons name="help-circle" size={24} color={categoryInfo?.color} />
          </View>
          <Text style={[styles.questionText, { color: colors.text }]}>
            {currentExercise?.question}
          </Text>
        </View>

        <View style={styles.optionsContainer}>
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
                    <Ionicons name="checkmark-circle" size={26} color="#10B981" />
                  )}
                  {showWrong && (
                    <Ionicons name="close-circle" size={26} color="#F43F5E" />
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
              backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
              borderLeftColor: selectedAnswer === currentExercise.correct ? '#10B981' : '#F59E0B',
            }
          ]}>
            <View style={styles.explanationHeader}>
              <Ionicons
                name={selectedAnswer === currentExercise.correct ? 'checkmark-circle' : 'bulb'}
                size={24}
                color={selectedAnswer === currentExercise.correct ? '#10B981' : '#F59E0B'}
              />
              <Text style={[styles.explanationTitle, { color: colors.text }]}>
                {selectedAnswer === currentExercise.correct ? 'Correct!' : 'Explanation'}
              </Text>
            </View>
            <Text style={[styles.explanationText, { color: colors.secondaryText }]}>
              {currentExercise?.explanation}
            </Text>
            <View style={[styles.translationBox, { backgroundColor: isDarkMode ? '#334155' : '#F1F5F9' }]}>
              <Ionicons name="language" size={16} color={colors.secondaryText} />
              <Text style={[styles.translationText, { color: colors.secondaryText }]}>
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
              colors={categoryInfo?.gradient || ['#3B82F6', '#2563EB']}
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
  exerciseBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  exerciseBadgeText: {
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

  practiceScroll: {
    flex: 1,
  },
  practiceContent: {
    padding: 20,
    paddingTop: 36,
  },
  audioCard: {
    padding: 24,
    borderRadius: 26,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  audioMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
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
  playCountText: {
    fontSize: 13,
    fontWeight: '500',
  },
  waveformContainer: {
    marginBottom: 20,
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    gap: 6,
  },
  waveBar: {
    width: 8,
    height: 50,
    borderRadius: 4,
  },
  playBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 16,
  },
  playHint: {
    fontSize: 14,
    fontWeight: '500',
  },
  questionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  questionIcon: {
    marginTop: 2,
  },
  questionText: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 26,
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
    fontSize: 16,
    fontWeight: '600',
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
    marginBottom: 16,
  },
  translationBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    borderRadius: 12,
    gap: 10,
  },
  translationText: {
    flex: 1,
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 22,
  },
  nextBtn: {
    marginTop: 24,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#3B82F6',
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
    marginBottom: 24,
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
  reviewAudio: {
    fontSize: 13,
    fontStyle: 'italic',
    marginLeft: 48,
    marginBottom: 6,
  },
  reviewAnswer: {
    fontSize: 14,
    marginLeft: 48,
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
