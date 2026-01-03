import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Switch,
    Platform,
    Alert,
    StatusBar,
    Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';
import { getThemeColors, themeShadows } from '../src/utils/organicTheme';

export default function SettingsScreen({ navigation }) {
    const { user, logout, updateUser } = useAuth();
    const { isDarkMode, toggleTheme, organicColors: theme } = useTheme();

    const [notifications, setNotifications] = useState(true);
    const [soundEffects, setSoundEffects] = useState(true);
    const [marketingEmails, setMarketingEmails] = useState(false);
    const [autoPlay, setAutoPlay] = useState(true);

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to sign out?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Sign Out',
                style: 'destructive',
                onPress: async () => {
                    await logout();
                    navigation.reset({ index: 0, routes: [{ name: 'Landing' }] });
                }
            },
        ]);
    };

    const Section = ({ title, children }) => (
        <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>{title}</Text>
            <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }, themeShadows.sm]}>
                {children}
            </View>
        </View>
    );

    const SettingItem = ({ icon, title, subtitle, value, onValueChange, onPress, isSwitch, isLast, color }) => (
        <TouchableOpacity
            style={[styles.item, !isLast && { borderBottomWidth: 1, borderBottomColor: theme.border }]}
            onPress={onPress}
            disabled={isSwitch}
        >
            <View style={[styles.iconWrap, { backgroundColor: (color || theme.primary) + '15' }]}>
                <Ionicons name={icon} size={20} color={color || theme.primary} />
            </View>
            <View style={styles.content}>
                <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
                {subtitle && <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{subtitle}</Text>}
            </View>
            {isSwitch ? (
                <Switch
                    value={value}
                    onValueChange={onValueChange}
                    trackColor={{ false: theme.border, true: theme.primary }}
                    thumbColor={Platform.OS === 'ios' ? '#FFFFFF' : value ? theme.primary : '#F4F3F4'}
                />
            ) : (
                <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
            )}
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

            {/* Header */}
            <View style={[styles.header, { borderBottomColor: theme.border }]}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Settings</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

                <Section title="APPEARANCE">
                    <SettingItem
                        icon="moon-outline"
                        title="Dark Mode"
                        subtitle="Switch between light and dark themes"
                        isSwitch
                        value={isDarkMode}
                        onValueChange={toggleTheme}
                    />
                    <SettingItem
                        icon="play-circle-outline"
                        title="Auto-play Videos"
                        subtitle="Start videos automatically"
                        isSwitch
                        value={autoPlay}
                        onValueChange={setAutoPlay}
                        isLast
                    />
                </Section>

                <Section title="NOTIFICATIONS">
                    <SettingItem
                        icon="notifications-outline"
                        title="Push Notifications"
                        subtitle="Daily reminders and study alerts"
                        isSwitch
                        value={notifications}
                        onValueChange={setNotifications}
                    />
                    <SettingItem
                        icon="mail-outline"
                        title="Marketing Emails"
                        subtitle="New courses and special offers"
                        isSwitch
                        value={marketingEmails}
                        onValueChange={setMarketingEmails}
                        isLast
                    />
                </Section>

                <Section title="ACCOUNT">
                    <SettingItem
                        icon="person-outline"
                        title="Edit Profile"
                        onPress={() => navigation.navigate('Profile')}
                    />
                    <SettingItem
                        icon="lock-closed-outline"
                        title="Change Password"
                        onPress={() => Alert.alert('Coming Soon', 'Password reset is available via email.')}
                    />
                    <SettingItem
                        icon="language-outline"
                        title="Preferred Language"
                        subtitle="English (US)"
                        onPress={() => { }}
                        isLast
                    />
                </Section>

                <Section title="SUPPORT & LEGAL">
                    <SettingItem
                        icon="help-circle-outline"
                        title="Help Center"
                        onPress={() => navigation.navigate('Resources')}
                    />
                    <SettingItem
                        icon="document-text-outline"
                        title="Terms of Service"
                        onPress={() => Linking.openURL('https://frenchmastergh.com/terms')}
                    />
                    <SettingItem
                        icon="shield-outline"
                        title="Privacy Policy"
                        onPress={() => Linking.openURL('https://frenchmastergh.com/privacy')}
                        isLast
                    />
                </Section>

                <TouchableOpacity style={[styles.logoutBtn, { borderColor: theme.error + '40' }]} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={20} color={theme.error} />
                    <Text style={[styles.logoutText, { color: theme.error }]}>Sign Out</Text>
                </TouchableOpacity>

                <View style={styles.footer}>
                    <Text style={[styles.version, { color: theme.textMuted }]}>French Master</Text>
                    <Text style={[styles.version, { color: theme.textMuted }]}>Version 2.0.0 (Build 42)</Text>
                </View>

                <View style={{ height: 40 }} />
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
        paddingTop: Platform.OS === 'ios' ? 50 : 20,
        paddingBottom: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    backBtn: {
        padding: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scroll: {
        paddingBottom: 40,
    },
    section: {
        marginTop: 25,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '700',
        marginBottom: 10,
        marginLeft: 5,
        letterSpacing: 1,
    },
    card: {
        borderRadius: 20,
        borderWidth: 1,
        overflow: 'hidden',
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    iconWrap: {
        width: 32,
        height: 32,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15,
    },
    content: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
    },
    subtitle: {
        fontSize: 12,
        marginTop: 2,
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 20,
        marginTop: 40,
        paddingVertical: 16,
        borderRadius: 16,
        borderWidth: 1.5,
        gap: 10,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '700',
    },
    footer: {
        alignItems: 'center',
        marginTop: 40,
    },
    version: {
        fontSize: 12,
        fontWeight: '500',
        marginBottom: 4,
    },
});
