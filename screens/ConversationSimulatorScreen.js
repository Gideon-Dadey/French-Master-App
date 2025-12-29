import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Animated,
    Platform,
    StatusBar,
    ImageBackground,
    Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../src/context/ThemeContext';
import { useGamification } from '../src/context/GamificationContext';
import { speakText, stopSpeech } from '../src/utils/textToSpeech';
import { getThemeColors, themeShadows } from '../src/utils/organicTheme';

// Mock Data for Scenarios
const SCENARIOS = [
    {
        id: 'cafe_morning',
        title: 'Morning Coffee',
        category: 'Daily Life',
        difficulty: 'Beginner',
        location: 'Le Café Flore',
        description: 'Order your morning coffee and a pastry like a local.',
        icon: 'cafe',
        gradient: ['#FB923C', '#EA580C'],
        steps: [
            {
                id: 1,
                speaker: 'Waiter',
                text: 'Bonjour! Bienvenue au Café Flore. Installez-vous.',
                translation: 'Hello! Welcome to Café Flore. Please have a seat.',
                options: [
                    { id: 'a', text: 'Bonjour, merci.', nextStep: 2, xp: 10, feedback: 'Simple and polite!' },
                    { id: 'b', text: 'Salut!', nextStep: 2, xp: 5, feedback: 'A bit informal for a waiter, but okay.' }
                ]
            },
            {
                id: 2,
                speaker: 'Waiter',
                text: 'Que désirez-vous boire ce matin?',
                translation: 'What would you like to drink this morning?',
                options: [
                    { id: 'a', text: 'Un café, s\'il vous plaît.', nextStep: 3, xp: 20, feedback: 'Perfect usage of politeness.' },
                    { id: 'b', text: 'Je veux un café.', nextStep: 3, xp: 5, feedback: 'Correct, but "Je voudrais" is more polite.' },
                    { id: 'c', text: 'Donne-moi un café.', nextStep: 3, xp: 0, feedback: 'Too rude/direct!' }
                ]
            },
            {
                id: 3,
                speaker: 'Waiter',
                text: 'Un café noir ou avec du lait?',
                translation: 'Black coffee or with milk?',
                options: [
                    { id: 'a', text: 'Un café crème, s\'il vous plaît.', nextStep: 4, xp: 15, feedback: 'Excellent choice.' },
                    { id: 'b', text: 'Noir, juste noir.', nextStep: 4, xp: 10, feedback: 'Clear and direct.' }
                ]
            },
            {
                id: 4,
                speaker: 'Waiter',
                text: 'Très bien. Et pour manger?',
                translation: 'Very good. And to eat?',
                options: [
                    { id: 'a', text: 'Un croissant, s\'il vous plaît.', nextStep: 5, xp: 20, feedback: 'A classic French breakfast!' },
                    { id: 'b', text: 'Rien, merci.', nextStep: 5, xp: 10, feedback: 'Polite refusal.' }
                ]
            },
            {
                id: 5,
                speaker: 'Waiter',
                text: 'Parfait. Je vous apporte ça tout de suite.',
                translation: 'Perfect. I\'ll bring that to you right away.',
                options: [
                    { id: 'a', text: 'Merci beaucoup!', nextStep: 'end', xp: 10, feedback: 'Great conclusion.' }
                ]
            }
        ]
    },
    {
        id: 'market_fresh',
        title: 'At the Market',
        category: 'Shopping',
        difficulty: 'Intermediate',
        location: 'Marché Bastille',
        description: 'Buy fresh fruits and vegetables from a vendor.',
        icon: 'basket',
        gradient: ['#4ADE80', '#16A34A'],
        steps: [
            {
                id: 1,
                speaker: 'Vendor',
                text: 'Bonjour! Ils sont beaux mes fruits aujourd\'hui!',
                translation: 'Hello! My fruits are beautiful today!',
                options: [
                    { id: 'a', text: 'Bonjour, je voudrais des pommes.', nextStep: 2, xp: 15, feedback: 'Direct and polite.' },
                    { id: 'b', text: 'C\'est combien?', nextStep: 2, xp: 10, feedback: 'Okay, but maybe greet them back first.' }
                ]
            },
            {
                id: 2,
                speaker: 'Vendor',
                text: 'Combien en voulez-vous? Un kilo?',
                translation: 'How many do you want? A kilo?',
                options: [
                    { id: 'a', text: 'Oui, un kilo s\'il vous plaît.', nextStep: 3, xp: 20, feedback: 'Perfect quantity expression.' },
                    { id: 'b', text: 'Non, juste deux ou trois.', nextStep: 3, xp: 15, feedback: 'Good conversational adaptation.' }
                ]
            },
            {
                id: 3,
                speaker: 'Vendor',
                text: 'Et avec ça? Des fraises peut-être?',
                translation: 'And with that? Some strawberries maybe?',
                options: [
                    { id: 'a', text: 'Non, ce sera tout, merci.', nextStep: 'end', xp: 15, feedback: 'Standard phrase to end shopping.' },
                    { id: 'b', text: 'Oui, une barquette de fraises.', nextStep: 'end', xp: 20, feedback: 'Great vocabulary.' }
                ]
            }
        ]
    },
    {
        id: 'directions_tourist',
        title: 'Lost in the City',
        category: 'Travel',
        difficulty: 'Advanced',
        location: 'Rue de Rivoli',
        description: 'Ask a local for directions to the museum.',
        icon: 'map',
        gradient: ['#60A5FA', '#2563EB'],
        steps: [
            {
                id: 1,
                speaker: 'Local',
                text: 'Pardon, vous cherchez quelque chose?',
                translation: 'Sorry, are you looking for something?',
                options: [
                    { id: 'a', text: 'Oui, je cherche le Louvre.', nextStep: 2, xp: 15, feedback: 'Clear explanation.' },
                    { id: 'b', text: 'Je suis perdu.', nextStep: 2, xp: 10, feedback: 'Honest and helpful.' }
                ]
            },
            {
                id: 2,
                speaker: 'Local',
                text: 'Ah, le Louvre n\'est pas loin. Vous voyez le feu rouge?',
                translation: 'Ah, the Louvre isn\'t far. Do you see the red light?',
                options: [
                    { id: 'a', text: 'Oui, je le vois.', nextStep: 3, xp: 10, feedback: 'Simple confirmation.' },
                    { id: 'b', text: 'Lequel?', nextStep: 3, xp: 5, feedback: 'Clarification question.' }
                ]
            },
            {
                id: 3,
                speaker: 'Local',
                text: 'Tournez à gauche après le feu, c\'est tout droit.',
                translation: 'Turn left after the light, it\'s straight ahead.',
                options: [
                    { id: 'a', text: 'Merci beaucoup pour votre aide!', nextStep: 'end', xp: 20, feedback: 'Very grateful and polite.' }
                ]
            }
        ]
    }
];

export default function ConversationSimulatorScreen({ navigation }) {
    const { isDarkMode, toggleTheme } = useTheme();
    const theme = getThemeColors(isDarkMode);
    const { awardXP } = useGamification();

    const [selectedScenario, setSelectedScenario] = useState(null);
    const [currentStepId, setCurrentStepId] = useState(1);
    const [chatHistory, setChatHistory] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const [sessionXP, setSessionXP] = useState(0);

    const scrollViewRef = useRef();

    // Animation Refs
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true })
        ]).start();
    }, []);

    useEffect(() => {
        if (selectedScenario && currentStepId !== 'end') {
            const step = selectedScenario.steps.find(s => s.id === currentStepId);
            if (step) {
                setIsTyping(true);
                setShowOptions(false);
                // Simulate "typing" delay or speaking delay
                speakText(step.text, 'fr-FR');

                const delay = 1500;
                const timer = setTimeout(() => {
                    setIsTyping(false);
                    setChatHistory(prev => [...prev, { type: 'incoming', ...step }]);
                    setShowOptions(true);
                    // Scroll to bottom
                    scrollViewRef.current?.scrollToEnd({ animated: true });
                }, delay);
                return () => clearTimeout(timer);
            }
        } else if (currentStepId === 'end' && selectedScenario) {
            finishSession();
        }
    }, [currentStepId, selectedScenario]);

    const startScenario = (scenario) => {
        setSelectedScenario(scenario);
        setCurrentStepId(1);
        setChatHistory([]);
        setSessionXP(0);
        // Reset animations for the chat view
        fadeAnim.setValue(0);
        slideAnim.setValue(20);
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true })
        ]).start();
    };

    const handleOptionSelect = (option) => {
        // Add user response to chat
        setChatHistory(prev => [...prev, { type: 'outgoing', text: option.text }]);
        setSessionXP(prev => prev + option.xp);

        // Slight delay before next step
        setTimeout(() => {
            if (option.feedback) {
                // Optional: Show simplified toast/feedback or just move on
            }
            setCurrentStepId(option.nextStep);
        }, 500);
    };

    const finishSession = () => {
        Alert.alert(
            'Conversation Complete!',
            `You completed the scenario "${selectedScenario.title}" and earned ${sessionXP} XP!`,
            [
                {
                    text: 'Awesome',
                    onPress: () => {
                        awardXP(sessionXP, `Completed ${selectedScenario.title}`);
                        setSelectedScenario(null);
                    }
                }
            ]
        );
    };

    if (selectedScenario) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

                {/* Chat Header */}
                <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
                    <TouchableOpacity onPress={() => setSelectedScenario(null)} style={styles.backBtn}>
                        <Ionicons name="chevron-back" size={24} color={theme.text} />
                    </TouchableOpacity>
                    <View>
                        <Text style={[styles.headerTitle, { color: theme.text }]}>{selectedScenario.title}</Text>
                        <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>{selectedScenario.location}</Text>
                    </View>
                    <View style={{ width: 40 }} />
                </View>

                {/* Chat Area */}
                <ScrollView
                    ref={scrollViewRef}
                    style={styles.chatScroll}
                    contentContainerStyle={styles.chatContent}
                >
                    {chatHistory.map((msg, index) => (
                        <Animated.View
                            key={index}
                            style={[
                                styles.messageRow,
                                msg.type === 'outgoing' ? styles.msgRight : styles.msgLeft,
                                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] } // Apply loosely to all, ideal would be individual anims
                            ]}
                        >
                            {msg.type === 'incoming' && (
                                <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
                                    <Text style={styles.avatarText}>{msg.speaker[0]}</Text>
                                </View>
                            )}
                            <View style={[
                                styles.bubble,
                                msg.type === 'outgoing'
                                    ? { backgroundColor: theme.primary, borderBottomRightRadius: 2 }
                                    : { backgroundColor: theme.surface, borderBottomLeftRadius: 2, borderWidth: 1, borderColor: theme.border }
                            ]}>
                                <Text style={[
                                    styles.bubbleText,
                                    msg.type === 'outgoing' ? { color: '#FFF' } : { color: theme.text }
                                ]}>{msg.text}</Text>
                                {msg.type === 'incoming' && (
                                    <Text style={[styles.translationText, { color: theme.textSecondary }]}>{msg.translation}</Text>
                                )}
                            </View>
                        </Animated.View>
                    ))}
                    {isTyping && (
                        <View style={styles.messageRow}>
                            <View style={[styles.avatar, { backgroundColor: theme.textMuted }]}>
                                <Ionicons name="ellipsis-horizontal" size={16} color="#FFF" />
                            </View>
                            <Text style={[styles.typingText, { color: theme.textSecondary }]}>{selectedScenario.steps.find(s => s.id === currentStepId)?.speaker} is speaking...</Text>
                        </View>
                    )}
                    <View style={{ height: 20 }} />
                </ScrollView>

                {/* Options Area */}
                {showOptions && (
                    <View style={[styles.optionsContainer, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
                        <Text style={[styles.optionsTitle, { color: theme.textSecondary }]}>Choose your reply:</Text>
                        {selectedScenario.steps.find(s => s.id === currentStepId)?.options.map((opt, i) => (
                            <TouchableOpacity
                                key={i}
                                style={[styles.optionBtn, { backgroundColor: theme.background, borderColor: theme.border }]}
                                onPress={() => handleOptionSelect(opt)}
                            >
                                <Text style={[styles.optionText, { color: theme.text }]}>{opt.text}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </View>
        );
    }

    // Dashboard View for Selection
    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
            <Animated.ScrollView style={[styles.scrollView, { opacity: fadeAnim }]}>
                <View style={styles.hero}>
                    <LinearGradient
                        colors={['#4F46E5', '#7C3AED']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.heroGradient}
                    >
                        <TouchableOpacity style={styles.backAbsBtn} onPress={() => navigation.goBack()}>
                            <Ionicons name="arrow-back" size={24} color="#FFF" />
                        </TouchableOpacity>
                        <Text style={styles.heroTitle}>Immersion Mode</Text>
                        <Text style={styles.heroDesc}>Practice real-world conversations in simulated environments.</Text>
                    </LinearGradient>
                </View>

                <View style={styles.listContent}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Available Scenarios</Text>
                    {SCENARIOS.map((scenario, index) => (
                        <TouchableOpacity
                            key={scenario.id}
                            style={[styles.scenarioCard, { backgroundColor: theme.surface, borderColor: theme.border }, themeShadows.md]}
                            onPress={() => startScenario(scenario)}
                            activeOpacity={0.9}
                        >
                            <LinearGradient
                                colors={scenario.gradient}
                                style={styles.cardHeader}
                            >
                                <Ionicons name={scenario.icon} size={32} color="#FFF" />
                            </LinearGradient>
                            <View style={styles.cardBody}>
                                <View style={styles.cardTop}>
                                    <Text style={[styles.cardTitle, { color: theme.text }]}>{scenario.title}</Text>
                                    <View style={[styles.badge, { backgroundColor: theme.surfaceAlt }]}>
                                        <Text style={[styles.badgeText, { color: theme.textSecondary }]}>{scenario.difficulty}</Text>
                                    </View>
                                </View>
                                <Text style={[styles.cardLoc, { color: theme.primary }]}>
                                    <Ionicons name="location-sharp" size={14} /> {scenario.location}
                                </Text>
                                <Text style={[styles.cardDesc, { color: theme.textSecondary }]}>{scenario.description}</Text>
                                <View style={[styles.startBtn, { borderColor: theme.border }]}>
                                    <Text style={[styles.startBtnText, { color: theme.primary }]}>Start Conversation</Text>
                                    <Ionicons name="chatbubble-ellipses-outline" size={16} color={theme.primary} />
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
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
    hero: {
        height: 200,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        overflow: 'hidden',
        marginBottom: 20,
    },
    heroGradient: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
    },
    backAbsBtn: {
        position: 'absolute',
        top: 50,
        left: 20,
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)'
    },
    heroTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 8,
        marginTop: 20
    },
    heroDesc: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.9)',
        lineHeight: 22
    },
    listContent: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 16,
    },
    scenarioCard: {
        borderRadius: 16,
        marginBottom: 20,
        overflow: 'hidden',
        borderWidth: 1,
    },
    cardHeader: {
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardBody: {
        padding: 16,
    },
    cardTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
        flex: 1,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '600',
    },
    cardLoc: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
    },
    cardDesc: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 16,
    },
    startBtn: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 12,
        borderTopWidth: 1,
        gap: 8,
        marginTop: 4,
    },
    startBtnText: {
        fontWeight: '600',
        fontSize: 14,
    },

    // Chat Styles
    header: {
        height: Platform.OS === 'ios' ? 100 : 80,
        paddingTop: Platform.OS === 'ios' ? 50 : 30,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        borderBottomWidth: 1,
    },
    backBtn: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '700',
        textAlign: 'center',
    },
    headerSubtitle: {
        fontSize: 12,
        textAlign: 'center',
    },
    chatScroll: {
        flex: 1,
    },
    chatContent: {
        padding: 16,
    },
    messageRow: {
        flexDirection: 'row',
        marginBottom: 20,
        alignItems: 'flex-end',
    },
    msgLeft: {
        justifyContent: 'flex-start',
    },
    msgRight: {
        justifyContent: 'flex-end',
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    avatarText: {
        color: '#FFF',
        fontWeight: '700',
        fontSize: 14,
    },
    bubble: {
        maxWidth: '75%',
        padding: 12,
        borderRadius: 16,
    },
    bubbleText: {
        fontSize: 16,
        lineHeight: 22,
    },
    translationText: {
        fontSize: 13,
        marginTop: 6,
        fontStyle: 'italic',
    },
    typingText: {
        fontSize: 12,
        fontStyle: 'italic',
        marginLeft: 40,
    },
    optionsContainer: {
        padding: 20,
        paddingBottom: 40,
        borderTopWidth: 1,
    },
    optionsTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 12,
    },
    optionBtn: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 1,
    },
    optionText: {
        fontSize: 16,
    }
});
