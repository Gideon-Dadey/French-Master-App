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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../src/context/ThemeContext';
import { useGamification } from '../src/context/GamificationContext';
import { useAuth } from '../src/context/AuthContext';
import { speakText, stopSpeech } from '../src/utils/textToSpeech';
import { themeShadows } from '../src/utils/organicTheme';
import { aiAPI, scenariosAPI } from '../src/services/api';

const CHAT_HISTORY_BASE_KEY = 'mirah_chat_history';
const MAX_SAVED_MESSAGES = 100; // Limit saved messages to prevent storage bloat

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
    }
];

export default function ConversationSimulatorScreen({ navigation }) {
    const { theme, isDarkMode } = useTheme();
    const { awardXP } = useGamification();
    const { user } = useAuth();

    // User-specific chat history key for privacy and "individual instances"
    const chatHistoryKey = user?._id ? `${CHAT_HISTORY_BASE_KEY}_${user._id}` : CHAT_HISTORY_BASE_KEY;

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

    // Chat history persistence state
    const [savedChatHistory, setSavedChatHistory] = useState([]);
    const [hasSavedHistory, setHasSavedHistory] = useState(false);

    useEffect(() => {
        loadScenarios();
        if (user) {
            loadSavedChatHistory();
        }
    }, [user]);

    // Save chat history whenever it changes (only for AI mode)
    useEffect(() => {
        if (selectedScenario?.isAi && chatHistory.length > 0) {
            saveChatHistory(chatHistory);
        }
    }, [chatHistory, selectedScenario]);

    const loadSavedChatHistory = async () => {
        try {
            const saved = await AsyncStorage.getItem(chatHistoryKey);
            if (saved) {
                const parsed = JSON.parse(saved);
                setSavedChatHistory(parsed);
                setHasSavedHistory(parsed.length > 0);
            } else {
                setSavedChatHistory([]);
                setHasSavedHistory(false);
            }
        } catch (error) {
            console.error('Failed to load chat history:', error);
        }
    };

    const saveChatHistory = async (history) => {
        try {
            // Keep only the last MAX_SAVED_MESSAGES messages
            const trimmedHistory = history.slice(-MAX_SAVED_MESSAGES);
            await AsyncStorage.setItem(chatHistoryKey, JSON.stringify(trimmedHistory));
            setSavedChatHistory(trimmedHistory);
            setHasSavedHistory(trimmedHistory.length > 0);
        } catch (error) {
            console.error('Failed to save chat history:', error);
        }
    };

    const clearChatHistory = async () => {
        try {
            await AsyncStorage.removeItem(chatHistoryKey);
            setSavedChatHistory([]);
            setHasSavedHistory(false);
            setChatHistory([]);
        } catch (error) {
            console.error('Failed to clear chat history:', error);
        }
    };

    const loadScenarios = async () => {
        try {
            setLoading(true);
            const response = await scenariosAPI.getAll();
            if (response.data.success) {
                // Only keep AI scenarios (Mirah)
                const filtered = response.data.data.filter(s => s.isAi);
                setScenarios(filtered);
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

    const startScenario = (scenario, continueSaved = false) => {
        setSelectedScenario(scenario);
        setCurrentStepId(1);
        setSessionXP(0);

        // For AI mode, optionally load saved history
        if (scenario.isAi && continueSaved && savedChatHistory.length > 0) {
            setChatHistory(savedChatHistory);
        } else {
            setChatHistory([]);
        }

        // Reset animations for the chat view
        fadeAnim.setValue(0);
        slideAnim.setValue(20);
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true })
        ]).start();
    };

    const startNewChat = (scenario) => {
        Alert.alert(
            'Start New Chat',
            'This will clear your previous conversation with Mirah. Continue?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Start Fresh',
                    style: 'destructive',
                    onPress: async () => {
                        await clearChatHistory();
                        startScenario(scenario, false);
                    }
                }
            ]
        );
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
            <View style={{ flex: 1, backgroundColor: theme.background }}>
                <KeyboardAvoidingView
                    style={[styles.container, { backgroundColor: theme.background }]}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
                >
                    <StatusBar style={isDarkMode ? 'light' : 'dark'} backgroundColor={theme.background} />

                    {/* Ultra-Premium Header */}
                    <View style={[styles.header, {
                        backgroundColor: isDarkMode ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.9)',
                        borderBottomColor: theme.border,
                        backdropFilter: 'blur(10px)',
                        zIndex: 10,
                        height: Platform.OS === 'ios' ? 110 : 100, // Increased for Android
                        paddingTop: Platform.OS === 'ios' ? 50 : 45, // Increased top padding
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingHorizontal: 16
                    }]}>
                        <TouchableOpacity
                            onPress={() => setSelectedScenario(null)}
                            style={{ padding: 8, justifyContent: 'center', alignItems: 'center' }}
                        >
                            <Ionicons name="chevron-back" size={24} color={theme.text} />
                        </TouchableOpacity>

                        <View style={{ flex: 1, alignItems: 'center' }}>
                            <Text style={{ fontSize: 17, fontWeight: '800', color: theme.text, letterSpacing: -0.2 }}>
                                {selectedScenario.isAi ? 'Mirah AI Studio' : selectedScenario.title}
                            </Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: theme.success, marginRight: 6 }} />
                                <Text style={{ fontSize: 13, color: theme.secondaryText, fontWeight: '600' }}>
                                    {selectedScenario.isAi ? 'Private Instance' : 'Active Now'}
                                </Text>
                            </View>
                        </View>

                        <TouchableOpacity style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center' }}>
                            <Ionicons name="ellipsis-horizontal" size={24} color={theme.textSecondary} />
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
                                        ? {
                                            backgroundColor: '#2563EB', // Always Vibrant Blue
                                            borderBottomRightRadius: 4,
                                            shadowColor: '#2563EB',
                                            shadowOffset: { width: 0, height: 4 },
                                            shadowOpacity: 0.2, // Reduced opacity
                                            shadowRadius: 8,
                                            elevation: 4
                                        }
                                        : {
                                            backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : '#FFFFFF',
                                            borderBottomLeftRadius: 4,
                                            borderWidth: 1,
                                            borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : '#E5E7EB',
                                            shadowColor: '#000',
                                            shadowOffset: { width: 0, height: 2 },
                                            shadowOpacity: 0.05,
                                            shadowRadius: 4,
                                            elevation: 2
                                        }
                                ]}>
                                    <Text style={[
                                        styles.bubbleText,
                                        {
                                            color: msg.type === 'outgoing'
                                                ? '#FFFFFF' // Force white text for outgoing (blue bubble)
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
                                <View style={[
                                    styles.bubble,
                                    {
                                        backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : '#FFF',
                                        borderWidth: 1,
                                        borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                                    }
                                ]}>
                                    <Text style={[styles.typingText, { color: theme.secondaryText, fontWeight: '600' }]}>
                                        Mirah is thinking...
                                    </Text>
                                </View>
                            </View>
                        )}
                        <View style={{ height: 40 }} />
                    </ScrollView>

                    {/* Apple/Gemini Style Input Wrapper */}
                    {selectedScenario.isAi ? (
                        <View style={[styles.aiInputWrapper, {
                            backgroundColor: isDarkMode ? theme.background : theme.surface,
                            paddingBottom: Platform.OS === 'ios' ? 40 : 20,
                            borderTopWidth: 1,
                            borderTopColor: theme.border
                        }]}>
                            <View style={[styles.aiInputContainer, {
                                backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#FFF',
                                borderColor: theme.border,
                                borderRadius: 30,
                                paddingHorizontal: 6,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.1,
                                shadowRadius: 10,
                                elevation: 5
                            }]}>
                                <TextInput
                                    style={[
                                        styles.aiInput,
                                        { color: theme.text, fontSize: 17 }
                                    ]}
                                    placeholder="Talk to Mirah..."
                                    placeholderTextColor={theme.secondaryText}
                                    value={freeMsg}
                                    onChangeText={setFreeMsg}
                                    onSubmitEditing={handleSendFreeMessage}
                                    returnKeyType="send"
                                    multiline
                                />
                                <TouchableOpacity
                                    style={[styles.aiSendBtn, {
                                        backgroundColor: freeMsg.trim()
                                            ? (isDarkMode ? theme.primary : '#2563EB')
                                            : (isDarkMode ? 'rgba(255,255,255,0.08)' : '#F0F2F5'),
                                        transform: [{ scale: freeMsg.trim() ? 1 : 0.95 }],
                                        borderWidth: freeMsg.trim() ? 0 : 1,
                                        borderColor: isDarkMode ? 'transparent' : 'rgba(0,0,0,0.05)'
                                    }]}
                                    onPress={handleSendFreeMessage}
                                    disabled={isSending || !freeMsg.trim()}
                                >
                                    {isSending ? (
                                        <ActivityIndicator size="small" color={isDarkMode ? '#000' : '#FFF'} />
                                    ) : (
                                        <Ionicons
                                            name="arrow-up"
                                            size={24}
                                            color={freeMsg.trim()
                                                ? (isDarkMode ? '#000' : '#FFF')
                                                : (isDarkMode ? 'rgba(255,255,255,0.4)' : theme.secondaryText)
                                            }
                                        />
                                    )}
                                </TouchableOpacity>
                            </View>
                            <Text style={{ fontSize: 11, color: theme.secondaryText, textAlign: 'center', marginTop: 12, fontWeight: '600', opacity: 1 }}>
                                Mirah's AI can make mistakes. Double-check important info.
                            </Text>
                        </View>
                    ) : showOptions && (
                        <View style={[styles.optionsContainer, {
                            backgroundColor: isDarkMode ? theme.secondaryBackground : '#F8F6F3',
                            borderTopColor: theme.border
                        }]}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 8 }}>
                                <Ionicons name="chatbubbles-outline" size={18} color={theme.secondary} />
                                <Text style={[styles.optionsTitle, { color: theme.secondaryText, marginBottom: 0 }]}>Select your response</Text>
                            </View>
                            {selectedScenario.steps.find(s => s.id === currentStepId)?.options.map((opt, i) => (
                                <TouchableOpacity
                                    key={i}
                                    style={[
                                        styles.optionBtn,
                                        {
                                            backgroundColor: theme.surface,
                                            borderColor: theme.border,
                                            shadowColor: '#000',
                                            shadowOffset: { width: 0, height: 4 },
                                            shadowOpacity: 0.05,
                                            shadowRadius: 8,
                                            elevation: 3
                                        }
                                    ]}
                                    onPress={() => handleOptionSelect(opt)}
                                    activeOpacity={0.7}
                                >
                                    <View style={{ flex: 1 }}>
                                        <Text style={[styles.optionText, { color: theme.text, fontWeight: '600' }]}>{opt.text}</Text>
                                        {opt.xp && (
                                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 }}>
                                                <Ionicons name="flash" size={12} color={theme.secondary} />
                                                <Text style={{ fontSize: 11, color: theme.secondary, fontWeight: '700' }}>+{opt.xp} XP</Text>
                                            </View>
                                        )}
                                    </View>
                                    <Ionicons name="chevron-forward" size={18} color={theme.border} />
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </KeyboardAvoidingView>
            </View >
        );
    }

    // Dashboard View for Selection
    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar style={isDarkMode ? 'light' : 'dark'} backgroundColor={theme.background} />

            {/* Background Decorative Elements */}
            <View style={{ position: 'absolute', top: -100, right: -50, width: 300, height: 300, borderRadius: 150, backgroundColor: theme.primary, opacity: isDarkMode ? 0.05 : 0.03 }} />
            <View style={{ position: 'absolute', bottom: 100, left: -100, width: 400, height: 400, borderRadius: 200, backgroundColor: theme.secondary, opacity: isDarkMode ? 0.03 : 0.02 }} />

            <Animated.ScrollView
                ref={scrollViewRef}
                style={[styles.scrollView, { opacity: fadeAnim }]}
                showsVerticalScrollIndicator={false}
            >
                {/* Modern Header */}
                <View style={{ paddingTop: Platform.OS === 'ios' ? 70 : 50, paddingHorizontal: 24, paddingBottom: 24 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <TouchableOpacity
                            style={{
                                padding: 8,
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}
                            onPress={() => navigation.goBack()}
                        >
                            <Ionicons name="arrow-back" size={24} color={theme.text} />
                        </TouchableOpacity>
                        <View style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: isDarkMode ? 'rgba(212,168,83,0.15)' : 'rgba(212,168,83,0.1)', borderWidth: 1, borderColor: isDarkMode ? 'rgba(212,168,83,0.3)' : 'rgba(212,168,83,0.2)' }}>
                            <Text style={{ fontSize: 11, fontWeight: '800', color: theme.secondary, letterSpacing: 1 }}>BETA ACCESS</Text>
                        </View>
                    </View>

                    <Text style={{ fontSize: 40, fontWeight: '900', color: theme.text, letterSpacing: -1.5, lineHeight: 44 }}>AI Studio</Text>
                    <Text style={{ fontSize: 18, color: theme.secondaryText, marginTop: 8, letterSpacing: -0.3, fontWeight: '500', lineHeight: 24 }}>
                        Interact with Mirah, your intelligent French companion.
                    </Text>

                    {/* Quick Stats/Actions */}
                    <View style={{ flexDirection: 'row', gap: 12, marginTop: 24 }}>
                        <View style={{ flex: 1, padding: 16, borderRadius: 20, backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#FFF', borderWidth: 1, borderColor: theme.border }}>
                            <Ionicons name="flash" size={20} color={theme.secondary} style={{ marginBottom: 8 }} />
                            <Text style={{ fontSize: 12, color: theme.secondaryText, fontWeight: '600' }}>Active Streak</Text>
                            <Text style={{ fontSize: 18, fontWeight: '800', color: theme.text }}>5 Days</Text>
                        </View>
                        <View style={{ flex: 1, padding: 16, borderRadius: 20, backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#FFF', borderWidth: 1, borderColor: theme.border }}>
                            <Ionicons name="ribbon" size={20} color={theme.primary} style={{ marginBottom: 8 }} />
                            <Text style={{ fontSize: 12, color: theme.secondaryText, fontWeight: '600' }}>Level</Text>
                            <Text style={{ fontSize: 18, fontWeight: '800', color: theme.text }}>Advanced</Text>
                        </View>
                    </View>
                </View>

                <View style={[styles.listContent, { paddingHorizontal: 24 }]}>

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
                                <View key={scenario.id} style={{ marginBottom: 36 }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16, paddingHorizontal: 4 }}>
                                        <Text style={{ fontSize: 15, fontWeight: '800', color: theme.text, textTransform: 'uppercase', letterSpacing: 1.5 }}>The Mirah Experience</Text>
                                        {hasSavedHistory && (
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                                <Ionicons name="time-outline" size={14} color={theme.secondary} />
                                                <Text style={{ fontSize: 12, fontWeight: '700', color: theme.secondary }}>{savedChatHistory.length} messages</Text>
                                            </View>
                                        )}
                                    </View>
                                    <TouchableOpacity
                                        style={[
                                            {
                                                height: hasSavedHistory ? 380 : 320,
                                                borderRadius: 32,
                                                overflow: 'hidden',
                                                backgroundColor: theme.surface,
                                                shadowColor: theme.secondary,
                                                shadowOffset: { width: 0, height: 12 },
                                                shadowOpacity: isDarkMode ? 0.4 : 0.15,
                                                shadowRadius: 32,
                                                elevation: 20,
                                            }
                                        ]}
                                        onPress={() => hasSavedHistory ? startScenario(scenario, true) : startScenario(scenario, false)}
                                        activeOpacity={0.97}
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
                                                        <Ionicons name="hardware-chip-outline" size={22} color={theme.secondary} />
                                                    </View>
                                                </View>

                                                <View>
                                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                                        <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: theme.success, shadowColor: theme.success, shadowRadius: 4, shadowOpacity: 0.5 }} />
                                                        <Text style={{ color: theme.success, fontWeight: '800', fontSize: 12, letterSpacing: 0.5 }}>PRIVATE INSTANCE ACTIVE</Text>
                                                    </View>
                                                    <Text style={{ fontSize: 42, fontWeight: '900', color: '#FFF', marginBottom: 8, letterSpacing: -1.5 }}>Mirah AI</Text>
                                                    <Text style={{ fontSize: 18, color: 'rgba(255,255,255,0.9)', lineHeight: 26, fontWeight: '500', maxWidth: '95%' }}>
                                                        Your individual AI Studio instance. Conversations are strictly private and tailored to your learning pace.
                                                    </Text>

                                                    {/* Chat History Actions */}
                                                    {hasSavedHistory ? (
                                                        <View style={{ marginTop: 16, gap: 10 }}>
                                                            <TouchableOpacity
                                                                style={{
                                                                    flexDirection: 'row',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    backgroundColor: theme.secondary,
                                                                    paddingVertical: 14,
                                                                    paddingHorizontal: 20,
                                                                    borderRadius: 16,
                                                                    gap: 8
                                                                }}
                                                                onPress={() => startScenario(scenario, true)}
                                                            >
                                                                <Ionicons name="chatbubbles" size={18} color="#FFF" />
                                                                <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 15 }}>Continue Conversation</Text>
                                                            </TouchableOpacity>
                                                            <TouchableOpacity
                                                                style={{
                                                                    flexDirection: 'row',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    backgroundColor: 'rgba(255,255,255,0.15)',
                                                                    paddingVertical: 12,
                                                                    paddingHorizontal: 16,
                                                                    borderRadius: 12,
                                                                    borderWidth: 1,
                                                                    borderColor: 'rgba(255,255,255,0.2)',
                                                                    gap: 6
                                                                }}
                                                                onPress={() => startNewChat(scenario)}
                                                            >
                                                                <Ionicons name="add-circle-outline" size={16} color="rgba(255,255,255,0.8)" />
                                                                <Text style={{ color: 'rgba(255,255,255,0.8)', fontWeight: '600', fontSize: 13 }}>Start Fresh</Text>
                                                            </TouchableOpacity>
                                                        </View>
                                                    ) : (
                                                        <TouchableOpacity
                                                            style={{
                                                                marginTop: 16,
                                                                flexDirection: 'row',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                backgroundColor: theme.secondary,
                                                                paddingVertical: 14,
                                                                paddingHorizontal: 20,
                                                                borderRadius: 16,
                                                                gap: 8
                                                            }}
                                                            onPress={() => startScenario(scenario, false)}
                                                        >
                                                            <Ionicons name="chatbubbles" size={18} color="#FFF" />
                                                            <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 15 }}>Start Chatting</Text>
                                                        </TouchableOpacity>
                                                    )}
                                                </View>
                                            </LinearGradient>
                                        </ImageBackground>
                                    </TouchableOpacity>
                                </View>
                            );
                        }

                        // Section Title for standard list
                        const isFirstStandard = index === scenarios.findIndex(s => !s.isAi);

                        return (
                            <View key={scenario.id}>
                                {isFirstStandard && (
                                    <Text style={{ fontSize: 15, fontWeight: '800', color: theme.text, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 16, marginTop: 8, paddingHorizontal: 4 }}>Practice Scenarios</Text>
                                )}
                                <TouchableOpacity
                                    style={{
                                        backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : '#FFF',
                                        borderRadius: 28,
                                        padding: 20,
                                        marginBottom: 20,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        borderWidth: 1,
                                        borderColor: theme.border,
                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 8 },
                                        shadowOpacity: isDarkMode ? 0.2 : 0.04,
                                        shadowRadius: 16,
                                        elevation: 8,
                                    }}
                                    onPress={() => startScenario(scenario)}
                                    activeOpacity={0.8}
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

                                    <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : theme.tertiaryBackground, justifyContent: 'center', alignItems: 'center', marginLeft: 8 }}>
                                        <Ionicons name="chevron-forward" size={20} color={theme.primary} />
                                    </View>
                                </TouchableOpacity>
                            </View>
                        );
                    })}
                    <View style={{ height: 60 }} />
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
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        borderBottomWidth: 1,
    },
    chatScroll: {
        flex: 1,
    },
    chatContent: {
        padding: 20,
        paddingTop: 16,
    },
    messageRow: {
        flexDirection: 'row',
        marginBottom: 26,
        alignItems: 'flex-end', // Bubbles look better aligned to bottom of avatar row
    },
    msgLeft: {
        justifyContent: 'flex-start',
    },
    msgRight: {
        justifyContent: 'flex-end',
    },
    avatar: {
        width: 34,
        height: 34,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    bubble: {
        maxWidth: '82%',
        paddingHorizontal: 18,
        paddingVertical: 14,
        borderRadius: 22,
    },
    bubbleText: {
        fontSize: 16,
        lineHeight: 24,
        letterSpacing: -0.2,
    },
    translationContainer: {
        marginTop: 12,
        paddingTop: 10,
        borderTopWidth: 1,
    },
    translationText: {
        fontSize: 14,
        lineHeight: 20,
        fontStyle: 'italic',
        opacity: 0.85,
    },
    typingText: {
        fontSize: 14,
        fontWeight: '600',
    },
    optionsContainer: {
        padding: 24,
        paddingBottom: Platform.OS === 'ios' ? 44 : 24,
        borderTopWidth: 1,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
    },
    optionsTitle: {
        fontSize: 14,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    optionBtn: {
        padding: 16,
        borderRadius: 18,
        marginBottom: 12,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    optionText: {
        fontSize: 16,
    },
    aiInputWrapper: {
        paddingHorizontal: 20,
        paddingTop: 16,
    },
    aiInputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderWidth: 1.5,
        minHeight: 56,
        gap: 12,
    },
    aiInput: {
        flex: 1,
        fontSize: 16,
        paddingTop: 8,
        paddingBottom: 8,
        maxHeight: 120,
    },
    aiSendBtn: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    }
});
