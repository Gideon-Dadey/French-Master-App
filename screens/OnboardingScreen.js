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
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';
import { getThemeColors, themeShadows } from '../src/utils/organicTheme';
import { usersAPI } from '../src/services/api';
import LoadingSpinner from '../src/components/LoadingSpinner';

const { width, height } = Dimensions.get('window');

const ONBOARDING_DATA = [
    {
        id: '1',
        title: 'Immersion Mastery',
        description: 'Learn French naturally through real-world simulations and organic conversations.',
        icon: 'chatbubbles-sharp',
        color: '#1A355E',
    },
    {
        id: '2',
        title: 'Certified Path',
        description: 'Follow a curriculum designed by experts to take you from A1 to C2 fluency.',
        icon: 'ribbon-sharp',
        color: '#C9A227',
    },
    {
        id: '3',
        title: 'Gamified Experience',
        description: 'Earn XP, maintain streaks, and climb the leaderboard while mastering a new language.',
        icon: 'flash-sharp',
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
        <View style={styles.fullScreen}>
            <FlatList
                data={ONBOARDING_DATA}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
                renderItem={({ item }) => (
                    <View style={[styles.slide, { width }]}>
                        <View style={styles.imageWrapper}>
                            <View style={styles.circleBg} />
                            <Ionicons name={item.icon} size={80} color="#1A355E" />
                        </View>
                        <View style={styles.textWrapper}>
                            <Text style={[styles.slideTitle, { color: '#1A355E' }]}>{item.title}</Text>
                            <Text style={[styles.slideDesc, { color: '#6A7E91' }]}>{item.description}</Text>
                        </View>
                    </View>
                )}
                keyExtractor={(item) => item.id}
            />

            <View style={styles.footer}>
                <View style={styles.paginationDots}>
                    {ONBOARDING_DATA.map((_, i) => {
                        const widthAnim = scrollX.interpolate({
                            inputRange: [(i - 1) * width, i * width, (i + 1) * width],
                            outputRange: [8, 12, 8],
                            extrapolate: 'clamp',
                        });
                        const opacity = scrollX.interpolate({
                            inputRange: [(i - 1) * width, i * width, (i + 1) * width],
                            outputRange: [0.3, 1, 0.3],
                            extrapolate: 'clamp',
                        });
                        return (
                            <Animated.View
                                key={i}
                                style={[
                                    styles.dot,
                                    { backgroundColor: '#1A355E', opacity, width: widthAnim }
                                ]}
                            />
                        );
                    })}
                </View>

                <TouchableOpacity
                    style={[styles.continueBtn, { backgroundColor: '#1A355E' }]}
                    onPress={() => setCurrentStep(1)}
                >
                    <Text style={styles.continueBtnText}>Continue</Text>
                    <Ionicons name="arrow-forward" size={20} color="#FFF" />
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderLevelSelection = () => (
        <View style={styles.stepContainer}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                <Text style={[styles.stepTitle, { color: '#1A355E' }]}>What is your French level?</Text>
                <Text style={[styles.stepSub, { color: '#6A7E91' }]}>We'll adapt the lessons to match your skills.</Text>

                <View style={styles.optionsGrid}>
                    {SKILL_LEVELS.map((level) => (
                        <TouchableOpacity
                            key={level.id}
                            style={[
                                styles.optionCard,
                                { backgroundColor: '#F8F9FA', borderColor: selectedLevel === level.id ? '#1A355E' : 'transparent' },
                                selectedLevel === level.id && themeShadows.sm,
                            ]}
                            onPress={() => setSelectedLevel(level.id)}
                        >
                            <View style={styles.optionInfo}>
                                <Text style={[styles.optionLabel, { color: '#1A355E' }]}>{level.id}: {level.label}</Text>
                                <Text style={[styles.optionSub, { color: '#6A7E91' }]}>{level.sub}</Text>
                            </View>
                            {selectedLevel === level.id && (
                                <Ionicons name="checkmark-circle" size={24} color="#1A355E" />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            <TouchableOpacity
                style={[styles.continueBtn, { backgroundColor: selectedLevel ? '#1A355E' : '#D1D9E0', marginTop: 10 }]}
                onPress={handleNext}
                disabled={!selectedLevel}
            >
                <Text style={styles.continueBtnText}>Next Step</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFF" />
            </TouchableOpacity>
        </View>
    );

    const renderGoalSelection = () => (
        <View style={styles.stepContainer}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                <Text style={[styles.stepTitle, { color: '#1A355E' }]}>Set your learning goal</Text>
                <Text style={[styles.stepSub, { color: '#6A7E91' }]}>How many minutes a day do you want to practice?</Text>

                <View style={styles.optionsGrid}>
                    {GOALS.map((goal) => (
                        <TouchableOpacity
                            key={goal.id}
                            style={[
                                styles.optionCard,
                                { backgroundColor: '#F8F9FA', borderColor: selectedGoal === goal.id ? '#1A355E' : 'transparent' },
                                selectedGoal === goal.id && themeShadows.sm,
                            ]}
                            onPress={() => setSelectedGoal(goal.id)}
                        >
                            <View style={[styles.optionIcon, { backgroundColor: '#1A355E10' }]}>
                                <Ionicons name={goal.icon} size={24} color="#1A355E" />
                            </View>
                            <View style={styles.optionInfo}>
                                <Text style={[styles.optionLabel, { color: '#1A355E' }]}>{goal.label}</Text>
                                <Text style={[styles.optionSub, { color: '#6A7E91' }]}>{goal.sub}</Text>
                            </View>
                            {selectedGoal === goal.id && (
                                <Ionicons name="checkmark-circle" size={24} color="#1A355E" />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            <TouchableOpacity
                style={[styles.continueBtn, { backgroundColor: selectedGoal ? '#1A355E' : '#D1D9E0', marginTop: 10 }]}
                onPress={handleNext}
                disabled={!selectedGoal}
            >
                <Text style={styles.continueBtnText}>Set Goal</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFF" />
            </TouchableOpacity>
        </View>
    );

    const renderFinalStep = () => (
        <View style={styles.stepContainer}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                <View style={[styles.successIcon, { backgroundColor: '#2E7D5A15' }]}>
                    <Ionicons name="sparkles" size={60} color="#2E7D5A" />
                </View>
                <Text style={[styles.stepTitle, { color: '#1A355E', textAlign: 'center' }]}>You're all set!</Text>
                <Text style={[styles.stepSub, { color: '#6A7E91', textAlign: 'center' }]}>
                    Your personalized path for {selectedLevel} level is ready. Let's start your journey to fluency.
                </Text>

                <View style={[styles.summaryCard, { backgroundColor: '#F8F9FA' }]}>
                    <View style={styles.summaryItem}>
                        <Ionicons name="school-outline" size={20} color="#1A355E" />
                        <Text style={[styles.summaryText, { color: '#1A355E' }]}>Level: {selectedLevel}</Text>
                    </View>
                    <View style={styles.summaryItem}>
                        <Ionicons name="timer-outline" size={20} color="#1A355E" />
                        <Text style={[styles.summaryText, { color: '#1A355E' }]}>Goal: {GOALS.find(g => g.id === selectedGoal)?.sub}</Text>
                    </View>
                </View>
            </ScrollView>

            <TouchableOpacity
                style={[styles.continueBtn, { backgroundColor: '#1A355E', width: '100%', marginTop: 10 }]}
                onPress={() => navigation.replace('Main')}
            >
                <Text style={styles.continueBtnText}>Start Learning</Text>
                <Ionicons name="rocket-sharp" size={20} color="#FFF" />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Progress Bar Header */}
            <View style={styles.progressHeader}>
                {[0, 1, 2, 3].map((step) => (
                    <View
                        key={step}
                        style={[
                            styles.progressItem,
                            { backgroundColor: step === currentStep ? '#1A355E' : '#E8EDF1' }
                        ]}
                    />
                ))}
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
        backgroundColor: '#FCFCFC',
    },
    fullScreen: {
        flex: 1,
    },
    progressHeader: {
        flexDirection: 'row',
        paddingHorizontal: 60,
        gap: 8,
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        justifyContent: 'center',
        marginBottom: 20,
    },
    progressItem: {
        flex: 1,
        height: 4,
        borderRadius: 2,
    },
    mainContent: {
        flex: 1,
    },
    stepContainer: {
        flex: 1,
        paddingHorizontal: 30,
        paddingTop: 40,
        paddingBottom: 40,
    },
    slide: {
        alignItems: 'center',
        paddingTop: height * 0.08,
    },
    imageWrapper: {
        width: 260,
        height: 260,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 60,
    },
    circleBg: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#E8EDF1',
        borderRadius: 130,
        opacity: 0.8,
    },
    textWrapper: {
        paddingHorizontal: 40,
    },
    slideTitle: {
        fontSize: 32,
        fontWeight: '800',
        textAlign: 'center',
        marginBottom: 20,
    },
    slideDesc: {
        fontSize: 17,
        textAlign: 'center',
        lineHeight: 26,
    },
    footer: {
        paddingHorizontal: 30,
        paddingBottom: 50,
        alignItems: 'center',
    },
    paginationDots: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 40,
    },
    dot: {
        height: 8,
        borderRadius: 4,
    },
    continueBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        paddingVertical: 18,
        borderRadius: 18,
        gap: 12,
        shadowColor: '#1A355E',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 10,
    },
    continueBtnText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '700',
    },
    stepTitle: {
        fontSize: 28,
        fontWeight: '800',
        marginBottom: 12,
        textAlign: 'center',
    },
    stepSub: {
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 40,
        textAlign: 'center',
    },
    optionsGrid: {
        gap: 16,
    },
    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 20,
        borderWidth: 2,
        gap: 16,
    },
    optionIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    optionInfo: {
        flex: 1,
    },
    optionLabel: {
        fontSize: 18,
        fontWeight: '700',
    },
    optionSub: {
        fontSize: 14,
        marginTop: 2,
    },
    successIcon: {
        width: 120,
        height: 120,
        borderRadius: 60,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        marginVertical: 40,
    },
    summaryCard: {
        padding: 24,
        borderRadius: 24,
        gap: 20,
        marginVertical: 10,
    },
    summaryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    summaryText: {
        fontSize: 17,
        fontWeight: '700',
    },
});
