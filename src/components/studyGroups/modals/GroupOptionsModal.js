import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, Animated, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { premiumColors } from '../../../utils/premiumDesign';

export default function GroupOptionsModal({
    visible,
    colors,
    isDarkMode,
    group,
    memberCount,
    isModerator,
    isMember,
    notificationSettings,
    groupOptionsAnim,
    closeGroupOptions,
    handleMuteGroup,
    handleShareGroup,
    handleCopyInviteCode,
    openGroupInfo,
    openEditGroup,
    openBackgroundPicker,
    setShowGroupOptions,
    setShowNotificationSettings,
    handleReportGroup,
    handleLeave,
    handleDeleteGroup
}) {
    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="none"
            onRequestClose={closeGroupOptions}
        >
            <TouchableOpacity
                style={styles.actionSheetOverlay}
                activeOpacity={1}
                onPress={closeGroupOptions}
            >
                <Animated.View
                    style={[
                        styles.actionSheetContainer,
                        {
                            transform: [{
                                translateY: groupOptionsAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [600, 0],
                                })
                            }]
                        }
                    ]}
                >
                    {/* Main Card */}
                    <View style={[styles.premiumActionSheet, { backgroundColor: colors.card }]}>
                        {/* Header Area with Gradient Background */}
                        <LinearGradient
                            colors={isDarkMode ? ['#1E293B', '#0F172A'] : ['#F8FAFC', '#F1F5F9']}
                            style={styles.actionSheetHeaderPremium}
                        >
                            <View style={styles.actionSheetGroupInfoPremium}>
                                <View style={styles.actionSheetAvatarWrapper}>
                                    {group?.image ? (
                                        <Image source={{ uri: group.image }} style={styles.actionSheetAvatarPremium} />
                                    ) : (
                                        <LinearGradient
                                            colors={[premiumColors.primary.main, premiumColors.primary.light]}
                                            style={styles.actionSheetAvatarPlaceholderPremium}
                                        >
                                            <Ionicons name="people" size={32} color="#FFFFFF" />
                                        </LinearGradient>
                                    )}
                                    {isModerator() && (
                                        <View style={styles.adminBadgeSmall}>
                                            <Ionicons name="shield-checkmark" size={12} color="#FFFFFF" />
                                        </View>
                                    )}
                                </View>
                                <View style={styles.actionSheetNameWrapper}>
                                    <Text style={[styles.actionSheetGroupNamePremium, { color: colors.text }]}>{group?.name}</Text>
                                    <Text style={[styles.actionSheetGroupMetaPremium, { color: colors.secondaryText }]}>
                                        {memberCount} members • {group?.isPrivate ? 'Private' : 'Public'}
                                    </Text>
                                </View>
                            </View>

                            {/* Quick Actions Grid */}
                            <View style={styles.quickActionsGrid}>
                                <TouchableOpacity
                                    style={styles.quickActionItem}
                                    onPress={() => handleMuteGroup(notificationSettings.muted ? null : '8 hours')}
                                >
                                    <View style={[styles.quickActionIconBox, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
                                        <Ionicons
                                            name={notificationSettings.muted ? "volume-off" : "volume-high"}
                                            size={20}
                                            color={notificationSettings.muted ? '#FF3B30' : premiumColors.primary.main}
                                        />
                                    </View>
                                    <Text style={[styles.quickActionLabel, { color: colors.secondaryText }]}>
                                        {notificationSettings.muted ? 'Unmute' : 'Mute'}
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.quickActionItem} onPress={handleShareGroup}>
                                    <View style={[styles.quickActionIconBox, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
                                        <Ionicons name="share-outline" size={20} color={premiumColors.primary.main} />
                                    </View>
                                    <Text style={[styles.quickActionLabel, { color: colors.secondaryText }]}>Share</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.quickActionItem} onPress={handleCopyInviteCode}>
                                    <View style={[styles.quickActionIconBox, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
                                        <Ionicons name="link" size={20} color={premiumColors.primary.main} />
                                    </View>
                                    <Text style={[styles.quickActionLabel, { color: colors.secondaryText }]}>Link</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.quickActionItem}
                                    onPress={() => { closeGroupOptions(); openGroupInfo(); }}
                                >
                                    <View style={[styles.quickActionIconBox, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
                                        <Ionicons name="information-circle-outline" size={20} color={premiumColors.primary.main} />
                                    </View>
                                    <Text style={[styles.quickActionLabel, { color: colors.secondaryText }]}>Info</Text>
                                </TouchableOpacity>
                            </View>
                        </LinearGradient>

                        <View style={styles.actionSheetContentPremium}>
                            {/* Settings Section */}
                            <View style={styles.actionSheetSectionPremium}>
                                {isModerator() && (
                                    <TouchableOpacity style={styles.actionSheetItemPremium} onPress={openEditGroup}>
                                        <View style={[styles.actionSheetIconPremium, { backgroundColor: '#3B82F620' }]}>
                                            <Ionicons name="settings-outline" size={18} color="#3B82F6" />
                                        </View>
                                        <Text style={[styles.actionSheetItemTextPremium, { color: colors.text }]}>Group Settings</Text>
                                        <Ionicons name="chevron-forward" size={16} color={colors.secondaryText} />
                                    </TouchableOpacity>
                                )}

                                <TouchableOpacity
                                    style={styles.actionSheetItemPremium}
                                    onPress={() => {
                                        setShowGroupOptions(false);
                                        setTimeout(() => openBackgroundPicker(), 300);
                                    }}
                                >
                                    <View style={[styles.actionSheetIconPremium, { backgroundColor: '#10B98120' }]}>
                                        <Ionicons name="image-outline" size={18} color="#10B981" />
                                    </View>
                                    <Text style={[styles.actionSheetItemTextPremium, { color: colors.text }]}>Chat Wallpaper</Text>
                                    <Ionicons name="chevron-forward" size={16} color={colors.secondaryText} />
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.actionSheetItemPremium} onPress={() => setShowNotificationSettings(true)}>
                                    <View style={[styles.actionSheetIconPremium, { backgroundColor: '#F59E0B20' }]}>
                                        <Ionicons name="notifications-outline" size={18} color="#F59E0B" />
                                    </View>
                                    <Text style={[styles.actionSheetItemTextPremium, { color: colors.text }]}>Notifications</Text>
                                    <Text style={[styles.actionSheetItemValuePremium, { color: colors.secondaryText }]}>
                                        {notificationSettings.muted ? 'Muted' : 'On'}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {/* Danger/Social Section */}
                            <View style={[styles.actionSheetSectionPremium, { marginTop: 12 }]}>
                                <TouchableOpacity style={styles.actionSheetItemPremium} onPress={handleReportGroup}>
                                    <View style={[styles.actionSheetIconPremium, { backgroundColor: '#64748B20' }]}>
                                        <Ionicons name="flag-outline" size={18} color="#64748B" />
                                    </View>
                                    <Text style={[styles.actionSheetItemTextPremium, { color: colors.text }]}>Report Group</Text>
                                </TouchableOpacity>

                                {isMember() && !isModerator() && (
                                    <TouchableOpacity style={styles.actionSheetItemPremium} onPress={handleLeave}>
                                        <View style={[styles.actionSheetIconPremium, { backgroundColor: '#EF444420' }]}>
                                            <Ionicons name="exit-outline" size={18} color="#EF4444" />
                                        </View>
                                        <Text style={[styles.actionSheetItemTextPremium, { color: '#EF4444' }]}>Leave Group</Text>
                                    </TouchableOpacity>
                                )}

                                {isModerator() && (
                                    <TouchableOpacity style={styles.actionSheetItemPremium} onPress={handleDeleteGroup}>
                                        <View style={[styles.actionSheetIconPremium, { backgroundColor: '#EF444420' }]}>
                                            <Ionicons name="trash-outline" size={18} color="#EF4444" />
                                        </View>
                                        <Text style={[styles.actionSheetItemTextPremium, { color: '#EF4444' }]}>Delete Group</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    </View>

                    {/* Cancel Button */}
                    <TouchableOpacity
                        style={[styles.premiumActionSheetCancel, { backgroundColor: colors.card }]}
                        onPress={closeGroupOptions}
                        activeOpacity={0.8}
                    >
                        <Text style={[styles.premiumActionSheetCancelText, { color: premiumColors.primary.main }]}>Close Menu</Text>
                    </TouchableOpacity>
                </Animated.View>
            </TouchableOpacity>
        </Modal>
    );
}

const styles = StyleSheet.create({
    actionSheetOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
    },
    actionSheetContainer: {
        paddingHorizontal: 12,
        paddingBottom: 34,
    },
    premiumActionSheet: {
        borderRadius: 20,
        marginBottom: 12,
        overflow: 'hidden',
    },
    actionSheetHeaderPremium: {
        padding: 24,
        paddingBottom: 20,
    },
    actionSheetGroupInfoPremium: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    actionSheetAvatarWrapper: {
        position: 'relative',
    },
    actionSheetAvatarPremium: {
        width: 64,
        height: 64,
        borderRadius: 32,
    },
    actionSheetAvatarPlaceholderPremium: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    adminBadgeSmall: {
        position: 'absolute',
        bottom: -4,
        right: -4,
        backgroundColor: '#3B82F6',
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    actionSheetNameWrapper: {
        marginLeft: 16,
        flex: 1,
    },
    actionSheetGroupNamePremium: {
        fontSize: 22,
        fontWeight: '800',
        letterSpacing: -0.5,
        marginBottom: 4,
    },
    actionSheetGroupMetaPremium: {
        fontSize: 14,
        fontWeight: '500',
    },
    quickActionsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 4,
    },
    quickActionItem: {
        alignItems: 'center',
        gap: 8,
        flex: 1,
    },
    quickActionIconBox: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    quickActionLabel: {
        fontSize: 12,
        fontWeight: '600',
    },
    actionSheetContentPremium: {
        padding: 16,
        paddingTop: 8,
    },
    actionSheetSectionPremium: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    actionSheetItemPremium: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 14,
    },
    actionSheetIconPremium: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionSheetItemTextPremium: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
    },
    actionSheetItemValuePremium: {
        fontSize: 14,
        marginRight: 4,
    },
    premiumActionSheetCancel: {
        borderRadius: 20,
        padding: 18,
        alignItems: 'center',
    },
    premiumActionSheetCancelText: {
        fontSize: 17,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
});
