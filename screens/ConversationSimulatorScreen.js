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
    Alert,
    TextInput,
    ActivityIndicator,
    KeyboardAvoidingView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../src/context/ThemeContext';
import { useGamification } from '../src/context/GamificationContext';
import { speakText, stopSpeech } from '../src/utils/textToSpeech';
import { themeShadows } from '../src/utils/organicTheme';
import { aiAPI, scenariosAPI } from '../src/services/api';

// Mock Data for Scenarios (Fallback if API fails)
const DEFAULT_SCENARIOS = [
    {
        id: 'ai_tutor',
        title: 'Free AI Tutor',
        category: 'Experimental',
        difficulty: 'All Levels',
        location: 'Personal Tutor "Mirah"',
        description: 'Talk about anything with your personal AI French tutor.',
        icon: 'sparkles',
        isAi: true,
        steps: []
    },
    {
        id: 'cafe_morning',
        title: 'Morning Coffee',
        category: 'Daily Life',
        difficulty: 'Beginner',
        location: 'Le Café Flore',
        description: 'Order your morning coffee and a pastry like a local.',
        icon: 'cafe',
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
    },

];

export default function ConversationSimulatorScreen({ navigation }) {
    const { theme, isDarkMode } = useTheme();
    const { awardXP } = useGamification();

    const [scenarios, setScenarios] = useState(DEFAULT_SCENARIOS);
    const [loading, setLoading] = useState(false);
    const [selectedScenario, setSelectedScenario] = useState(null);
    const [currentStepId, setCurrentStepId] = useState(1);
    const [chatHistory, setChatHistory] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const [sessionXP, setSessionXP] = useState(0);
    const [freeMsg, setFreeMsg] = useState('');
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        loadScenarios();
    }, []);

    const loadScenarios = async () => {
        try {
            setLoading(true);
            const response = await scenariosAPI.getAll();
            if (response.data.success) {
                setScenarios(response.data.data);
            }
        } catch (error) {
            console.error('Failed to load scenarios:', error);
            // Fallback is already DEFAULT_SCENARIOS in state init
        } finally {
            setLoading(false);
        }
    };

    // Initial message for AI mode
    useEffect(() => {
        if (selectedScenario?.isAi && chatHistory.length === 0) {
            const initialMsg = "Bonjour ! Je suis Mirah, votre tuteur de français. De quoi voulez-vous discuter aujourd'hui ?";
            setChatHistory([{
                type: 'incoming',
                speaker: 'Mirah',
                text: initialMsg,
                translation: 'Hello! I am Mirah, your French tutor. What would you like to discuss today?'
            }]);
            speakText(initialMsg, 'fr-FR');
        }
    }, [selectedScenario]);

    const handleSendFreeMessage = async () => {
        if (!freeMsg.trim() || isSending) return;

        const userMsg = freeMsg.trim();
        setFreeMsg('');
        setIsSending(true);

        // Add user msg
        setChatHistory(prev => [...prev, { type: 'outgoing', text: userMsg }]);

        try {
            setIsTyping(true);
            // Prepare history for API (Gemini format: role/parts)
            // But our aiService uses a simpler history usually, let's see.
            // aiService expects history array of objects with role: 'user'|'model' and parts: [{text: '...'}]

            const history = chatHistory.map(msg => ({
                role: msg.type === 'outgoing' ? 'user' : 'model',
                parts: [{ text: msg.text }]
            }));

            const response = await aiAPI.chat({
                message: userMsg,
                history: history
            });

            if (response.data.success) {
                const aiText = response.data.data;
                setIsTyping(false);
                setChatHistory(prev => [...prev, {
                    type: 'incoming',
                    speaker: 'Mirah',
                    text: aiText
                }]);
                setSessionXP(prev => prev + 10);
                speakText(aiText, 'fr-FR');
            }
        } catch (error) {
            console.error('AI Simulator Error:', error);
            const errorMsg = error.response?.data?.message || error.message || 'Failed to get AI response';
            console.error('Error details:', errorMsg);
            setChatHistory(prev => [...prev, {
                type: 'incoming',
                speaker: 'Mirah',
                text: "Désolé, j'ai eu un petit problème technique."
            }]);
        } finally {
            setIsSending(false);
            setIsTyping(false);
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }
    };

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
            <KeyboardAvoidingView
                style={[styles.container, { backgroundColor: theme.background }]}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                <StatusBar style={isDarkMode ? 'light' : 'dark'} backgroundColor={theme.background} />

                {/* Chat Header */}
                <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
                    <TouchableOpacity onPress={() => setSelectedScenario(null)} style={styles.backBtn}>
                        <Ionicons name="chevron-back" size={28} color={theme.text} />
                    </TouchableOpacity>
                    <View style={styles.headerTitleContainer}>
                        <Text style={[styles.headerTitle, { color: theme.text }]}>{selectedScenario.title}</Text>
                        <View style={styles.headerStatus}>
                            <View style={[styles.statusDot, { backgroundColor: theme.success }]} />
                            <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>Online</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.headerInfoBtn}>
                        <Ionicons name="information-circle-outline" size={24} color={theme.textSecondary} />
                    </TouchableOpacity>
                </View>

                {/* Chat Area */}
                <ScrollView
                    ref={scrollViewRef}
                    style={styles.chatScroll}
                    contentContainerStyle={styles.chatContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {chatHistory.map((msg, index) => (
                        <Animated.View
                            key={index}
                            style={[
                                styles.messageRow,
                                msg.type === 'outgoing' ? styles.msgRight : styles.msgLeft,
                                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
                            ]}
                        >
                            {msg.type === 'incoming' && (
                                <View style={[styles.avatar, { backgroundColor: theme.tertiaryBackground, overflow: 'hidden', borderWidth: 1, borderColor: theme.border }]}>
                                    <ImageBackground
                                        source={require('../assets/mirah_tutor.png')}
                                        style={{ width: '100%', height: '100%' }}
                                    />
                                </View>
                            )}
                            <View style={[
                                styles.bubble,
                                msg.type === 'outgoing'
                                    ? { backgroundColor: theme.primary, borderBottomRightRadius: 4 }
                                    : {
                                        backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                                        borderBottomLeftRadius: 4,
                                    }
                            ]}>
                                <Text style={[
                                    styles.bubbleText,
                                    {
                                        color: msg.type === 'outgoing'
                                            ? '#FFFFFF'
                                            : theme.text,
                                        fontWeight: '500'
                                    }
                                ]}>{msg.text.replace(/\*\*/g, '').replace(/\*/g, '')}</Text>

                                {msg.type === 'incoming' && msg.translation && (
                                    <View style={[styles.translationContainer, { borderTopColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                                        <Text style={[
                                            styles.translationText,
                                            { color: theme.secondaryText }
                                        ]}>{msg.translation}</Text>
                                    </View>
                                )}
                            </View>
                        </Animated.View>
                    ))}
                    {isTyping && (
                        <View style={styles.messageRow}>
                            <View style={[styles.avatar, { backgroundColor: theme.tertiaryBackground }]}>
                                <ActivityIndicator size="small" color={theme.secondary} />
                            </View>
                            <View style={[styles.bubble, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
                                <Text style={[styles.typingText, { color: theme.secondaryText }]}>
                                    Mirah is thinking...
                                </Text>
                            </View>
                        </View>
                    )}
                    <View style={{ height: 40 }} />
                </ScrollView>

                {/* Options Area or AI Input */}
                {selectedScenario.isAi ? (
                    <View style={[styles.aiInputWrapper, { backgroundColor: theme.background }]}>
                        <View style={[styles.aiInputContainer, { backgroundColor: theme.surface, borderColor: theme.border, shadowColor: isDarkMode ? '#000' : theme.primary, shadowOpacity: isDarkMode ? 0 : 0.05 }]}>
                            <TextInput
                                style={[
                                    styles.aiInput,
                                    { color: theme.text }
                                ]}
                                placeholder="Message Mirah..."
                                placeholderTextColor={theme.secondaryText}
                                value={freeMsg}
                                onChangeText={setFreeMsg}
                                onSubmitEditing={handleSendFreeMessage}
                                returnKeyType="send"
                                multiline
                            />
                            <TouchableOpacity
                                style={[styles.aiSendBtn, { backgroundColor: freeMsg.trim() ? theme.primary : theme.tertiaryBackground }]}
                                onPress={handleSendFreeMessage}
                                disabled={isSending || !freeMsg.trim()}
                            >
                                {isSending ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                    <Ionicons name="arrow-up" size={24} color={freeMsg.trim() ? "#FFFFFF" : theme.secondaryText} />
                                )}
                            </TouchableOpacity>
                        </View>
                        <Text style={[styles.aiInputFooter, { color: theme.secondaryText }]}>
                            Mirah can make mistakes. Consider checking important info.
                        </Text>
                    </View>
                ) : showOptions && (
                    <View style={[styles.optionsContainer, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
                        <Text style={[styles.optionsTitle, { color: theme.secondaryText }]}>Choose your reply:</Text>
                        {selectedScenario.steps.find(s => s.id === currentStepId)?.options.map((opt, i) => (
                            <TouchableOpacity
                                key={i}
                                style={[styles.optionBtn, { backgroundColor: theme.surface, borderColor: theme.border }, themeShadows.sm]}
                                onPress={() => handleOptionSelect(opt)}
                            >
                                <Text style={[styles.optionText, { color: theme.text }]}>{opt.text}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </KeyboardAvoidingView>
        );
    }

    // Dashboard View for Selection
    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar style={isDarkMode ? 'light' : 'dark'} backgroundColor={theme.background} />
            <Animated.ScrollView style={[styles.scrollView, { opacity: fadeAnim }]}>
                {/* Apple-style Large Header */}
                <View style={{ paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingHorizontal: 20, paddingBottom: 10 }}>
                    <TouchableOpacity
                        style={{ marginBottom: 15, width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-start' }}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={28} color={theme.text} />
                    </TouchableOpacity>
                    <Text style={{ fontSize: 34, fontWeight: '800', color: theme.text, letterSpacing: -0.5 }}>AI Studio</Text>
                    <Text style={{ fontSize: 17, color: theme.secondaryText, marginTop: 4, letterSpacing: -0.2 }}>Master fluency with simulated conversations.</Text>
                </View>

                <View style={[styles.listContent, { paddingTop: 10 }]}>

                    {loading && (
                        <ActivityIndicator size="large" color={theme.primary} style={{ marginVertical: 20 }} />
                    )}

                    {scenarios.map((scenario, index) => {
                        // Semantic colors based on difficulty
                        let diffColor = theme.secondary;
                        if (scenario.difficulty === 'Beginner') diffColor = theme.success;
                        if (scenario.difficulty === 'Intermediate') diffColor = theme.warning;
                        if (scenario.difficulty === 'Advanced') diffColor = theme.error;

                        if (scenario.isAi) {
                            return (
                                <View key={scenario.id} style={{ marginBottom: 30 }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12, paddingHorizontal: 4 }}>
                                        <Text style={{ fontSize: 14, fontWeight: '700', color: theme.text, textTransform: 'uppercase', letterSpacing: 1 }}>Featured Experience</Text>
                                        <Text style={{ fontSize: 12, fontWeight: '600', color: theme.secondary }}>NEW</Text>
                                    </View>
                                    <TouchableOpacity
                                        style={[
                                            {
                                                height: 280,
                                                borderRadius: 28,
                                                overflow: 'hidden',
                                                backgroundColor: theme.surface,
                                                shadowColor: theme.primary,
                                                shadowOffset: { width: 0, height: 12 },
                                                shadowOpacity: isDarkMode ? 0.3 : 0.1,
                                                shadowRadius: 24,
                                                elevation: 15,
                                            }
                                        ]}
                                        onPress={() => startScenario(scenario)}
                                        activeOpacity={0.95}
                                    >
                                        <ImageBackground
                                            source={require('../assets/mirah_tutor.png')}
                                            style={{ flex: 1 }}
                                            resizeMode="cover"
                                        >
                                            <LinearGradient
                                                colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.95)']}
                                                style={{ flex: 1, padding: 24, justifyContent: 'space-between' }}
                                            >
                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                    <View style={{ backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }}>
                                                        <Text style={{ color: '#FFF', fontWeight: '800', fontSize: 11, letterSpacing: 0.5 }}>ULTRA • AI</Text>
                                                    </View>
                                                    <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }}>
                                                        <Ionicons name="sparkles" size={22} color={theme.secondary} />
                                                    </View>
                                                </View>

                                                <View>
                                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                                        <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: theme.success }} />
                                                        <Text style={{ color: theme.success, fontWeight: '700', fontSize: 12 }}>ADAPTIVE LEARNING ACTIVE</Text>
                                                    </View>
                                                    <Text style={{ fontSize: 36, fontWeight: '900', color: '#FFF', marginBottom: 8, letterSpacing: -1 }}>Mirah AI</Text>
                                                    <Text style={{ fontSize: 17, color: 'rgba(255,255,255,0.85)', lineHeight: 24, fontWeight: '500', maxWidth: '90%' }}>
                                                        Master French with your personal AI mentor. Dynamic, real-time conversations.
                                                    </Text>
                                                </View>
                                            </LinearGradient>
                                        </ImageBackground>
                                    </TouchableOpacity>
                                </View>
                            );
                        }

                        // Premium Card for Standard Scenarios
                        return (
                            <TouchableOpacity
                                key={scenario.id}
                                style={{
                                    backgroundColor: theme.surface,
                                    borderRadius: 24,
                                    padding: 16,
                                    marginBottom: 16,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    borderWidth: 1,
                                    borderColor: theme.border,
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 4 },
                                    shadowOpacity: isDarkMode ? 0.2 : 0.05,
                                    shadowRadius: 10,
                                    elevation: 5,
                                }}
                                onPress={() => startScenario(scenario)}
                                activeOpacity={0.7}
                            >
                                <View style={{
                                    width: 60,
                                    height: 60,
                                    borderRadius: 18,
                                    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#F0F4F8',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    marginRight: 16
                                }}>
                                    <Ionicons name={scenario.icon} size={28} color={theme.primary} />
                                </View>

                                <View style={{ flex: 1 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                                        <Text style={{ fontSize: 11, fontWeight: '800', color: theme.secondary, textTransform: 'uppercase' }}>{scenario.category || 'SCENARIO'}</Text>
                                        <Text style={{ fontSize: 10, color: theme.secondaryText }}>•</Text>
                                        <Text style={{ fontSize: 11, fontWeight: '700', color: diffColor }}>{scenario.difficulty}</Text>
                                    </View>
                                    <Text style={{ fontSize: 18, fontWeight: '700', color: theme.text, marginBottom: 2 }}>{scenario.title}</Text>
                                    <Text style={{ fontSize: 14, color: theme.secondaryText }} numberOfLines={2}>{scenario.description}</Text>
                                </View>

                                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: theme.tertiaryBackground, justifyContent: 'center', alignItems: 'center', marginLeft: 8 }}>
                                    <Ionicons name="chevron-forward" size={18} color={theme.primary} />
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                    <View style={{ height: 40 }} />
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
        height: 240,
        overflow: 'hidden',
        marginBottom: 24,
    },
    heroGradient: {
        flex: 1,
        padding: 24,
        paddingTop: 60,
    },
    heroDecor1: {
        position: 'absolute',
        width: 300,
        height: 300,
        borderRadius: 150,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        top: -100,
        right: -100,
    },
    heroDecor2: {
        position: 'absolute',
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        bottom: -40,
        left: -40,
    },
    heroDecor3: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        top: -50,
        left: '20%',
    },
    backAbsBtn: {
        position: 'absolute',
        top: 50,
        left: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    heroContent: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 40,
        gap: 16,
    },
    heroIconCircle: {
        width: 64,
        height: 64,
        borderRadius: 20,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
        transform: [{ rotate: '-5deg' }],
    },
    heroTitle: {
        fontSize: 30,
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
        fontWeight: '700',
        color: '#FFF',
        marginBottom: 8,
        textShadowColor: 'rgba(0,0,0,0.2)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    heroDesc: {
        fontSize: 15,
        color: 'rgba(255,255,255,0.9)',
        lineHeight: 22,
        fontWeight: '500',
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
        height: Platform.OS === 'ios' ? 110 : 90,
        paddingTop: Platform.OS === 'ios' ? 50 : 30,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        borderBottomWidth: 1,
    },
    backBtn: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitleContainer: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '700',
        letterSpacing: -0.3,
    },
    headerStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 2,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    headerSubtitle: {
        fontSize: 12,
        fontWeight: '500',
    },
    headerInfoBtn: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    chatScroll: {
        flex: 1,
    },
    chatContent: {
        padding: 16,
        paddingTop: 8,
    },
    messageRow: {
        flexDirection: 'row',
        marginBottom: 24,
        alignItems: 'flex-start',
    },
    msgLeft: {
        justifyContent: 'flex-start',
    },
    msgRight: {
        justifyContent: 'flex-end',
    },
    avatar: {
        width: 30,
        height: 30,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
        marginTop: 4,
    },
    avatarText: {
        color: '#FFF',
        fontWeight: '700',
        fontSize: 12,
    },
    bubble: {
        maxWidth: '82%',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 20,
    },
    bubbleText: {
        fontSize: 16,
        lineHeight: 24,
        letterSpacing: -0.1,
    },
    translationContainer: {
        marginTop: 10,
        paddingTop: 8,
        borderTopWidth: 1,
    },
    translationText: {
        fontSize: 13,
        lineHeight: 18,
        fontStyle: 'italic',
    },
    typingText: {
        fontSize: 14,
        fontWeight: '500',
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
    },
    aiInputWrapper: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    },
    aiInputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        padding: 6,
        paddingLeft: 16,
        borderRadius: 28,
        borderWidth: 1.5,
        minHeight: 52,
        gap: 8,
    },
    aiInput: {
        flex: 1,
        fontSize: 16,
        paddingTop: 10,
        paddingBottom: 10,
        maxHeight: 120,
    },
    aiSendBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 0,
    },
    aiInputFooter: {
        fontSize: 10,
        textAlign: 'center',
        marginTop: 8,
        fontWeight: '500',
    }
});
