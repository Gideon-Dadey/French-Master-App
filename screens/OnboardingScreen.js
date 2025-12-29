import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Animated,
    FlatList,
    StatusBar,
    Platform,
    Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';
import { getThemeColors, themeShadows } from '../src/utils/organicTheme';
import { usersAPI } from '../src/services/api';
import LoadingSpinner from '../src/components/LoadingSpinner';

const { width, height } = Dimensions.get('window');

const TICK_SIZE = 40;

const ONBOARDING_DATA = [
    {
        id: '1',
        title: 'Immersion Mastery',
        description: 'Learn French naturally through real-world simulations and organic conversations.',
        icon: 'chatbubbles-outline',
        color: '#1E3A5F',
    },
    {
        id: '2',
        title: 'Certified Path',
        description: 'Follow a curriculum designed by experts to take you from A1 to C2 fluency.',
        icon: 'ribbon-outline',
        color: '#C9A227',
    },
    {
        id: '3',
        title: 'Gamified Experience',
        description: 'Earn XP, maintain streaks, and climb the leaderboard while mastering a new language.',
        icon: 'game-controller-outline',
        color: '#2E7D5A',
    },
];

const SKILL_LEVELS = [
    { id: 'A1', label: 'Beginner', sub: 'I am just starting' },
    { id: 'A2', label: 'Elementary', sub: 'I know some basics' },
    { id: 'B1', label: 'Intermediate', sub: 'I can have simple conversations' },
    { id: 'B2', label: 'Upper Intermediate', sub: 'I am mostly confident' },
    { id: 'C1', label: 'Advanced', sub: 'I communicate effectively' },
    { id: 'C2', label: 'Proficient', sub: 'I am near native level' },
];

const GOALS = [
    { id: 'casual', label: 'Casual', sub: '5 min / day', icon: 'cafe-outline' },
    { id: 'regular', label: 'Regular', sub: '15 min / day', icon: 'walk-outline' },
    { id: 'serious', label: 'Serious', sub: '30 min / day', icon: 'bicycle-outline' },
    { id: 'intense', label: 'Intense', sub: '60 min / day', icon: 'rocket-outline' },
];

export default function OnboardingScreen({ navigation }) {
    const { user, isAuthenticated, updateUser } = useAuth();
    const { isDarkMode } = useTheme();
    const theme = getThemeColors(isDarkMode);

    const [currentStep, setCurrentStep] = useState(0); // 0: Tutorial, 1: Level, 2: Goal, 3: Final
    const [selectedLevel, setSelectedLevel] = useState(null);
    const [selectedGoal, setSelectedGoal] = useState(null);
    const [saving, setSaving] = useState(false);

    const scrollX = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(0)).current;

    const handleNext = async () => {
        if (currentStep < 3) {
            Animated.timing(slideAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start(() => {
                setCurrentStep(currentStep + 1);
                slideAnim.setValue(0);
            });
        } else {
            if (isAuthenticated) {
                setSaving(true);
                try {
                    const preferences = {
                        level: selectedLevel,
                        dailyGoal: selectedGoal,
                        hasOnboarded: true,
                    };
                    await usersAPI.updateProfile({ preferences });
                    await updateUser({ preferences });
                    navigation.replace('Main');
                } catch (error) {
                    console.error('Failed to save onboarding data:', error);
                    navigation.replace('Main');
                } finally {
                    setSaving(false);
                }
            } else {
                navigation.replace('Main');
            }
        }
    };

    if (saving) return <LoadingSpinner />;

    const renderTutorial = () => (
        <View style={styles.stepContainer}>
            <FlatList
                data={ONBOARDING_DATA}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
                renderItem={({ item }) => (
                    <View style={[styles.slide, { width }]}>
                        <View style={[styles.iconCircle, { backgroundColor: item.color + '15' }]}>
                            <Ionicons name={item.icon} size={80} color={item.color} />
                        </View>
                        <Text style={[styles.slideTitle, { color: theme.text }]}>{item.title}</Text>
                        <Text style={[styles.slideDesc, { color: theme.textSecondary }]}>{item.description}</Text>
                    </View>
                )}
                keyExtractor={(item) => item.id}
            />

            <View style={styles.pagination}>
                {ONBOARDING_DATA.map((_, i) => {
                    const opacity = scrollX.interpolate({
                        inputRange: [(i - 1) * width, i * width, (i + 1) * width],
                        outputRange: [0.3, 1, 0.3],
                        extrapolate: 'clamp',
                    });
                    const scale = scrollX.interpolate({
                        inputRange: [(i - 1) * width, i * width, (i + 1) * width],
                        outputRange: [0.8, 1.2, 0.8],
                        extrapolate: 'clamp',
                    });
                    return <Animated.View key={i} style={[styles.dot, { backgroundColor: theme.primary, opacity, transform: [{ scale }] }]} />;
                })}
            </View>

            <TouchableOpacity
                style={[styles.primaryBtn, { backgroundColor: theme.primary, marginTop: 40 }, themeShadows.md]}
                onPress={() => setCurrentStep(1)}
            >
                <Text style={styles.primaryBtnText}>Continue</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFF" />
            </TouchableOpacity>
        </View>
    );

    const renderLevelSelection = () => (
        <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: theme.text }]}>What is your French level?</Text>
            <Text style={[styles.stepSub, { color: theme.textSecondary }]}>We'll adapt the lessons to match your skills.</Text>

            <View style={styles.optionsGrid}>
                {SKILL_LEVELS.map((level) => (
                    <TouchableOpacity
                        key={level.id}
                        style={[
                            styles.optionCard,
                            { backgroundColor: theme.surface, borderColor: selectedLevel === level.id ? theme.primary : theme.border },
                            selectedLevel === level.id && themeShadows.sm,
                        ]}
                        onPress={() => setSelectedLevel(level.id)}
                    >
                        <View style={styles.optionInfo}>
                            <Text style={[styles.optionLabel, { color: theme.text }]}>{level.id}: {level.label}</Text>
                            <Text style={[styles.optionSub, { color: theme.textSecondary }]}>{level.sub}</Text>
                        </View>
                        {selectedLevel === level.id && (
                            <Ionicons name="checkmark-circle" size={24} color={theme.primary} />
                        )}
                    </TouchableOpacity>
                ))}
            </View>

            <TouchableOpacity
                style={[styles.primaryBtn, { backgroundColor: selectedLevel ? theme.primary : theme.textMuted }, themeShadows.md]}
                onPress={handleNext}
                disabled={!selectedLevel}
            >
                <Text style={styles.primaryBtnText}>Select Level</Text>
            </TouchableOpacity>
        </View>
    );

    const renderGoalSelection = () => (
        <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: theme.text }]}>Set your learning goal</Text>
            <Text style={[styles.stepSub, { color: theme.textSecondary }]}>How many minutes a day do you want to practice?</Text>

            <View style={styles.optionsGrid}>
                {GOALS.map((goal) => (
                    <TouchableOpacity
                        key={goal.id}
                        style={[
                            styles.optionCard,
                            { backgroundColor: theme.surface, borderColor: selectedGoal === goal.id ? theme.primary : theme.border },
                            selectedGoal === goal.id && themeShadows.sm,
                        ]}
                        onPress={() => setSelectedGoal(goal.id)}
                    >
                        <View style={[styles.optionIcon, { backgroundColor: theme.primary + '10' }]}>
                            <Ionicons name={goal.icon} size={24} color={theme.primary} />
                        </View>
                        <View style={styles.optionInfo}>
                            <Text style={[styles.optionLabel, { color: theme.text }]}>{goal.label}</Text>
                            <Text style={[styles.optionSub, { color: theme.textSecondary }]}>{goal.sub}</Text>
                        </View>
                        {selectedGoal === goal.id && (
                            <Ionicons name="checkmark-circle" size={24} color={theme.primary} />
                        )}
                    </TouchableOpacity>
                ))}
            </View>

            <TouchableOpacity
                style={[styles.primaryBtn, { backgroundColor: selectedGoal ? theme.primary : theme.textMuted }, themeShadows.md]}
                onPress={handleNext}
                disabled={!selectedGoal}
            >
                <Text style={styles.primaryBtnText}>Set Goal</Text>
            </TouchableOpacity>
        </View>
    );

    const renderFinalStep = () => (
        <View style={styles.stepContainer}>
            <View style={[styles.successIcon, { backgroundColor: theme.success + '15' }]}>
                <Ionicons name="sparkles" size={60} color={theme.success} />
            </View>
            <Text style={[styles.stepTitle, { color: theme.text, textAlign: 'center' }]}>You're all set!</Text>
            <Text style={[styles.stepSub, { color: theme.textSecondary, textAlign: 'center' }]}>
                Your personalized path for {selectedLevel} level is ready. Let's start your journey to fluency.
            </Text>

            <View style={[styles.summaryCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <View style={styles.summaryItem}>
                    <Ionicons name="school-outline" size={20} color={theme.primary} />
                    <Text style={[styles.summaryText, { color: theme.text }]}>Level: {selectedLevel}</Text>
                </View>
                <View style={styles.summaryItem}>
                    <Ionicons name="timer-outline" size={20} color={theme.primary} />
                    <Text style={[styles.summaryText, { color: theme.text }]}>Goal: {GOALS.find(g => g.id === selectedGoal)?.sub}</Text>
                </View>
            </View>

            <TouchableOpacity
                style={[styles.primaryBtn, { backgroundColor: theme.primary, width: '100%' }, themeShadows.md]}
                onPress={() => navigation.replace('Main')}
            >
                <Text style={styles.primaryBtnText}>Start Learning</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

            {/* Progress Header */}
            <View style={styles.header}>
                <View style={styles.progressBar}>
                    {[0, 1, 2, 3].map((step) => (
                        <View
                            key={step}
                            style={[
                                styles.progressDot,
                                { backgroundColor: step <= currentStep ? theme.primary : theme.border }
                            ]}
                        />
                    ))}
                </View>
                {currentStep > 0 && currentStep < 3 && (
                    <TouchableOpacity onPress={() => setCurrentStep(currentStep - 1)} style={styles.backBtn}>
                        <Ionicons name="chevron-back" size={24} color={theme.text} />
                    </TouchableOpacity>
                )}
            </View>

            <Animated.View style={[
                styles.mainContent,
                {
                    opacity: slideAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
                    transform: [{ translateY: slideAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 20] }) }]
                }
            ]}>
                {currentStep === 0 && renderTutorial()}
                {currentStep === 1 && renderLevelSelection()}
                {currentStep === 2 && renderGoalSelection()}
                {currentStep === 3 && renderFinalStep()}
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingHorizontal: 20,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        height: 100,
    },
    progressBar: {
        flexDirection: 'row',
        gap: 8,
    },
    progressDot: {
        width: 20,
        height: 4,
        borderRadius: 2,
    },
    backBtn: {
        position: 'absolute',
        left: 20,
        top: Platform.OS === 'ios' ? 50 : 30,
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    mainContent: {
        flex: 1,
    },
    stepContainer: {
        flex: 1,
        paddingHorizontal: 28,
        paddingBottom: 40,
        justifyContent: 'center',
    },
    slide: {
        paddingHorizontal: 40,
        alignItems: 'center',
        justifyContent: 'center',
        height: height * 0.5,
    },
    iconCircle: {
        width: 160,
        height: 160,
        borderRadius: 80,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 40,
    },
    slideTitle: {
        fontSize: 28,
        fontWeight: '800',
        textAlign: 'center',
        marginBottom: 16,
    },
    slideDesc: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
        marginTop: 20,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    stepTitle: {
        fontSize: 26,
        fontWeight: '800',
        marginBottom: 12,
    },
    stepSub: {
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 32,
    },
    optionsGrid: {
        gap: 12,
    },
    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        borderWidth: 2,
        gap: 16,
    },
    optionIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    optionInfo: {
        flex: 1,
    },
    optionLabel: {
        fontSize: 17,
        fontWeight: '700',
    },
    optionSub: {
        fontSize: 13,
        marginTop: 2,
    },
    primaryBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        borderRadius: 16,
        gap: 10,
        width: '100%',
        marginTop: 32,
    },
    primaryBtnText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '700',
    },
    successIcon: {
        width: 120,
        height: 120,
        borderRadius: 60,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        marginBottom: 32,
    },
    summaryCard: {
        padding: 24,
        borderRadius: 20,
        borderWidth: 1,
        gap: 16,
        marginVertical: 32,
    },
    summaryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    summaryText: {
        fontSize: 16,
        fontWeight: '600',
    },
});
