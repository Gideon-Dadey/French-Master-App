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
    const { isDarkMode, organicColors: theme } = useTheme();
    const { user } = useAuth();

    // L'Alliance Premium Theme - derived from Organic Theme
    const navyColor = theme.primary;
    const goldColor = theme.secondary;
    const bgColor = theme.background;
    const surfaceColor = theme.surface;
    const mutedColor = theme.textSecondary;
    const lightBlue = theme.borderLight || theme.border;

    const [activeDays, setActiveDays] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());

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
            const dateToCheck = new Date(year, month, d);
            dateToCheck.setHours(0, 0, 0, 0);

            const isActive = user?.streak?.activeDates?.some(activeDate => {
                const date = new Date(activeDate);
                date.setHours(0, 0, 0, 0);
                return date.getTime() === dateToCheck.getTime();
            });

            days.push(
                <View key={d} style={styles.calendarDay}>
                    <View style={[
                        styles.dayCircle,
                        { backgroundColor: isActive ? goldColor : 'transparent', borderColor: isActive ? goldColor : lightBlue },
                        isActive && themeShadows.sm
                    ]}>
                        <Text style={[
                            styles.dayText,
                            { color: isActive ? '#FFF' : navyColor }
                        ]}>
                            {d}
                        </Text>
                    </View>
                    {isActive && <View style={[styles.activeDot, { backgroundColor: goldColor }]} />}
                </View>
            );
        }

        return (
            <View style={styles.calendarContainer}>
                <View style={styles.dayLabelsRow}>
                    {dayLabels.map((l, i) => (
                        <Text key={i} style={[styles.dayLabel, { color: mutedColor }]}>{l}</Text>
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
        <View style={[styles.container, { backgroundColor: bgColor }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="chevron-back-sharp" size={24} color={navyColor} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: navyColor }]}>Learning Streaks</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Streak Stats Card */}
                <View style={[styles.statsCard, { backgroundColor: surfaceColor, borderColor: lightBlue }, themeShadows.md]}>
                    <View style={styles.statItem}>
                        <Text style={[styles.statValue, { color: goldColor }]}>{user?.streak?.current || 0}</Text>
                        <Text style={[styles.statLabel, { color: mutedColor }]}>Current Streak</Text>
                        <Ionicons name="flash-sharp" size={32} color={goldColor} style={styles.statIcon} />
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={[styles.statValue, { color: navyColor }]}>{user?.streak?.longest || 0}</Text>
                        <Text style={[styles.statLabel, { color: mutedColor }]}>Best Streak</Text>
                        <Ionicons name="trophy-sharp" size={32} color={mutedColor} style={styles.statIcon} />
                    </View>
                </View>

                {/* Calendar Section */}
                <View style={styles.section}>
                    <View style={styles.monthHeader}>
                        <TouchableOpacity
                            onPress={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                            style={styles.navBtn}
                        >
                            <Ionicons name="chevron-back-sharp" size={24} color={navyColor} />
                        </TouchableOpacity>

                        <Text style={[styles.monthTitle, { color: navyColor }]}>
                            {monthName} {currentMonth.getFullYear()}
                        </Text>

                        <TouchableOpacity
                            onPress={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                            style={styles.navBtn}
                        >
                            <Ionicons name="chevron-forward-sharp" size={24} color={navyColor} />
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <ActivityIndicator size="large" color={goldColor} style={{ marginVertical: 40 }} />
                    ) : (
                        renderCalendar()
                    )}
                </View>

                {/* Info Section */}
                <View style={[styles.infoCard, { backgroundColor: goldColor + '10' }]}>
                    <Ionicons name="information-circle-sharp" size={24} color={goldColor} />
                    <Text style={[styles.infoText, { color: mutedColor }]}>
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    monthTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    navBtn: {
        padding: 5,
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
