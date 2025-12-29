import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    ActivityIndicator,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../src/context/ThemeContext';
import { getThemeColors, themeShadows } from '../src/utils/organicTheme';
import { progressAPI } from '../src/services/api';
import { useAuth } from '../src/context/AuthContext';

const { width } = Dimensions.get('window');

export default function StreaksScreen({ navigation }) {
    const { isDarkMode } = useTheme();
    const theme = getThemeColors(isDarkMode);
    const { user } = useAuth();

    const [activeDays, setActiveDays] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentMonth, setCurrentMonth] = useState(new Date());

    useEffect(() => {
        loadActivity();
    }, []);

    const loadActivity = async () => {
        try {
            const res = await progressAPI.getActivity();
            setActiveDays(res.data.data);
        } catch (error) {
            console.error('Failed to load activity:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderCalendar = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const days = [];
        // Day labels
        const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

        // Add empty slots for the first week
        for (let i = 0; i < firstDay; i++) {
            days.push(<View key={`empty-${i}`} style={styles.calendarDay} />);
        }

        // Add actual days
        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
            const isActive = activeDays.includes(dateStr);

            days.push(
                <View key={d} style={styles.calendarDay}>
                    <View style={[
                        styles.dayCircle,
                        { backgroundColor: isActive ? theme.primary : 'transparent', borderColor: theme.border },
                        isActive && themeShadows.sm
                    ]}>
                        <Text style={[
                            styles.dayText,
                            { color: isActive ? '#FFF' : theme.text }
                        ]}>
                            {d}
                        </Text>
                    </View>
                    {isActive && <View style={[styles.activeDot, { backgroundColor: theme.primary }]} />}
                </View>
            );
        }

        return (
            <View style={styles.calendarContainer}>
                <View style={styles.dayLabelsRow}>
                    {dayLabels.map((l, i) => (
                        <Text key={i} style={[styles.dayLabel, { color: theme.textMuted }]}>{l}</Text>
                    ))}
                </View>
                <View style={styles.daysGrid}>
                    {days}
                </View>
            </View>
        );
    };

    const monthName = currentMonth.toLocaleString('default', { month: 'long' });

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Learning Streaks</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Streak Stats Card */}
                <View style={[styles.statsCard, { backgroundColor: theme.surface, borderColor: theme.border }, themeShadows.md]}>
                    <View style={styles.statItem}>
                        <Text style={[styles.statValue, { color: theme.primary }]}>{user?.streak?.current || 0}</Text>
                        <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Current Streak</Text>
                        <Ionicons name="flame" size={32} color={theme.primary} style={styles.statIcon} />
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={[styles.statValue, { color: theme.text }]}>{user?.streak?.longest || 0}</Text>
                        <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Best Streak</Text>
                        <Ionicons name="trophy-outline" size={32} color={theme.textMuted} style={styles.statIcon} />
                    </View>
                </View>

                {/* Calendar Section */}
                <View style={styles.section}>
                    <View style={styles.monthHeader}>
                        <Text style={[styles.monthTitle, { color: theme.text }]}>{monthName} {currentMonth.getFullYear()}</Text>
                    </View>

                    {loading ? (
                        <ActivityIndicator size="large" color={theme.primary} style={{ marginVertical: 40 }} />
                    ) : (
                        renderCalendar()
                    )}
                </View>

                {/* Info Section */}
                <View style={[styles.infoCard, { backgroundColor: theme.primary + '10' }]}>
                    <Ionicons name="information-circle-outline" size={24} color={theme.primary} />
                    <Text style={[styles.infoText, { color: theme.textSecondary }]}>
                        Practice every day to maintain your streak and earn extra XP! A streak is updated whenever you complete a lesson or quiz.
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    backBtn: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollContent: {
        padding: 20,
    },
    statsCard: {
        flexDirection: 'row',
        borderRadius: 24,
        padding: 24,
        marginBottom: 32,
        borderWidth: 1,
        alignItems: 'center',
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 32,
        fontWeight: '800',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 13,
        fontWeight: '600',
    },
    statIcon: {
        marginTop: 12,
    },
    statDivider: {
        width: 1,
        height: '60%',
        backgroundColor: 'rgba(0,0,0,0.1)',
        marginHorizontal: 10,
    },
    section: {
        marginBottom: 32,
    },
    monthHeader: {
        marginBottom: 20,
        alignItems: 'center',
    },
    monthTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    calendarContainer: {
        width: '100%',
    },
    dayLabelsRow: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    dayLabel: {
        flex: 1,
        textAlign: 'center',
        fontSize: 12,
        fontWeight: '700',
    },
    daysGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    calendarDay: {
        width: `${100 / 7}%`,
        aspectRatio: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    dayCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
    dayText: {
        fontSize: 14,
        fontWeight: '600',
    },
    activeDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        marginTop: 4,
    },
    infoCard: {
        flexDirection: 'row',
        padding: 20,
        borderRadius: 16,
        gap: 12,
        alignItems: 'flex-start',
    },
    infoText: {
        flex: 1,
        fontSize: 14,
        lineHeight: 20,
    },
});
