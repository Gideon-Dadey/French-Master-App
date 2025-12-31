import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, ScrollView, Image, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { premiumColors } from '../../../utils/premiumDesign';
import { spacing, fontSize, screenHeight } from '../../../utils/responsive';

const height = screenHeight;

export default function GroupInfoModal({
    visible,
    colors,
    group,
    memberCount,
    groupInfoAnim,
    closeGroupInfo,
    isMember,
    handleLeave,
    handleJoin,
    setActiveTab,
    startCall,
    openGroupOptions
}) {
    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="none"
            onRequestClose={closeGroupInfo}
        >
            <View style={styles.groupInfoOverlay}>
                <TouchableOpacity style={styles.groupInfoBackdrop} activeOpacity={1} onPress={closeGroupInfo} />
                <Animated.View
                    style={[
                        styles.groupInfoContainer,
                        { backgroundColor: colors.card },
                        {
                            transform: [{
                                translateY: groupInfoAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [height, 0],
                                })
                            }]
                        }
                    ]}
                >

                    <View style={styles.groupInfoHandle}>
                        <View style={[styles.groupInfoHandleBar, { backgroundColor: colors.border }]} />
                    </View>

                    <View style={styles.groupInfoHeader}>
                        {group?.image ? (
                            <Image source={{ uri: group.image }} style={styles.groupInfoAvatarImage} />
                        ) : (
                            <View style={[styles.groupInfoAvatar, { backgroundColor: premiumColors.primary.main + '20' }]}>
                                <Ionicons name="people" size={40} color={premiumColors.primary.main} />
                            </View>
                        )}
                        <Text style={[styles.groupInfoName, { color: colors.text }]}>{group?.name}</Text>
                        <Text style={[styles.groupInfoDesc, { color: colors.secondaryText }]} numberOfLines={2}>
                            {group?.description}
                        </Text>

                        <View style={styles.groupInfoStats}>
                            <View style={styles.groupInfoStat}>
                                <Text style={[styles.groupInfoStatValue, { color: colors.text }]}>{memberCount}</Text>
                                <Text style={[styles.groupInfoStatLabel, { color: colors.secondaryText }]}>Members</Text>
                            </View>
                            <View style={[styles.groupInfoStatDivider, { backgroundColor: colors.border }]} />
                            <View style={styles.groupInfoStat}>
                                <Text style={[styles.groupInfoStatValue, { color: colors.text }]}>
                                    {group?.discussions?.length || 0}
                                </Text>
                                <Text style={[styles.groupInfoStatLabel, { color: colors.secondaryText }]}>Messages</Text>
                            </View>
                            <View style={[styles.groupInfoStatDivider, { backgroundColor: colors.border }]} />
                            <View style={styles.groupInfoStat}>
                                <Text style={[styles.groupInfoStatValue, { color: colors.text }]}>
                                    {group?.resources?.length || 0}
                                </Text>
                                <Text style={[styles.groupInfoStatLabel, { color: colors.secondaryText }]}>Resources</Text>
                            </View>
                        </View>
                    </View>

                    <ScrollView style={styles.groupInfoScroll} showsVerticalScrollIndicator={false}>

                        <View style={[styles.groupInfoSection, { backgroundColor: colors.background }]}>
                            <Text style={[styles.groupInfoSectionTitle, { color: colors.secondaryText }]}>DETAILS</Text>

                            <View style={styles.groupInfoRow}>
                                <View style={[styles.groupInfoRowIcon, { backgroundColor: '#007AFF20' }]}>
                                    <Ionicons name="school" size={18} color="#007AFF" />
                                </View>
                                <View style={styles.groupInfoRowContent}>
                                    <Text style={[styles.groupInfoRowLabel, { color: colors.secondaryText }]}>Level</Text>
                                    <Text style={[styles.groupInfoRowValue, { color: colors.text }]}>
                                        {group?.level ? group.level.charAt(0).toUpperCase() + group.level.slice(1) : 'All Levels'}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.groupInfoRow}>
                                <View style={[styles.groupInfoRowIcon, { backgroundColor: '#34C75920' }]}>
                                    <Ionicons name="bookmark" size={18} color="#34C759" />
                                </View>
                                <View style={styles.groupInfoRowContent}>
                                    <Text style={[styles.groupInfoRowLabel, { color: colors.secondaryText }]}>Focus</Text>
                                    <Text style={[styles.groupInfoRowValue, { color: colors.text }]}>
                                        {group?.focus ? group.focus.charAt(0).toUpperCase() + group.focus.slice(1) : 'General'}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.groupInfoRow}>
                                <View style={[styles.groupInfoRowIcon, { backgroundColor: '#FF950020' }]}>
                                    <Ionicons name={group?.isPrivate ? "lock-closed" : "globe"} size={18} color="#FF9500" />
                                </View>
                                <View style={styles.groupInfoRowContent}>
                                    <Text style={[styles.groupInfoRowLabel, { color: colors.secondaryText }]}>Privacy</Text>
                                    <Text style={[styles.groupInfoRowValue, { color: colors.text }]}>
                                        {group?.isPrivate ? 'Private Group' : 'Public Group'}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.groupInfoRow}>
                                <View style={[styles.groupInfoRowIcon, { backgroundColor: '#5856D620' }]}>
                                    <Ionicons name="calendar" size={18} color="#5856D6" />
                                </View>
                                <View style={styles.groupInfoRowContent}>
                                    <Text style={[styles.groupInfoRowLabel, { color: colors.secondaryText }]}>Created</Text>
                                    <Text style={[styles.groupInfoRowValue, { color: colors.text }]}>
                                        {group?.createdAt ? new Date(group.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric', month: 'long', day: 'numeric'
                                        }) : 'Unknown'}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <View style={[styles.groupInfoSection, { backgroundColor: colors.background }]}>
                            <View style={styles.groupInfoSectionHeader}>
                                <Text style={[styles.groupInfoSectionTitle, { color: colors.secondaryText }]}>MEMBERS</Text>
                                <TouchableOpacity onPress={() => { closeGroupInfo(); setActiveTab('members'); }}>
                                    <Text style={[styles.groupInfoSeeAll, { color: premiumColors.primary.main }]}>See All</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.groupInfoMembersList}>
                                {group?.members?.slice(0, 5).map((m, idx) => {
                                    const memberUser = typeof m.user === 'object' ? m.user : null;
                                    const isCreator = memberUser?._id === (typeof group.creator === 'object' ? group.creator?._id : group.creator);
                                    return (
                                        <View key={idx} style={styles.groupInfoMember}>
                                            {memberUser?.avatar ? (
                                                <Image source={{ uri: memberUser.avatar }} style={styles.groupInfoMemberAvatar} />
                                            ) : (
                                                <View style={[styles.groupInfoMemberAvatarPlaceholder, { backgroundColor: premiumColors.primary.main + '20' }]}>
                                                    <Ionicons name="person" size={16} color={premiumColors.primary.main} />
                                                </View>
                                            )}
                                            <View style={styles.groupInfoMemberInfo}>
                                                <Text style={[styles.groupInfoMemberName, { color: colors.text }]} numberOfLines={1}>
                                                    {memberUser?.name || 'Member'}
                                                </Text>
                                                {isCreator && (
                                                    <Text style={[styles.groupInfoMemberRole, { color: '#F59E0B' }]}>Creator</Text>
                                                )}
                                                {m.role === 'moderator' && !isCreator && (
                                                    <Text style={[styles.groupInfoMemberRole, { color: premiumColors.primary.main }]}>Moderator</Text>
                                                )}
                                            </View>
                                        </View>
                                    );
                                })}
                            </View>
                        </View>

                        <View style={[styles.groupInfoSection, { backgroundColor: colors.background }]}>
                            <Text style={[styles.groupInfoSectionTitle, { color: colors.secondaryText }]}>QUICK ACTIONS</Text>

                            <View style={styles.groupInfoActions}>
                                <TouchableOpacity
                                    style={[styles.groupInfoActionBtn, { backgroundColor: colors.card }]}
                                    onPress={() => { closeGroupInfo(); setActiveTab('resources'); }}
                                >
                                    <View style={[styles.groupInfoActionIcon, { backgroundColor: '#007AFF20' }]}>
                                        <Ionicons name="folder" size={22} color="#007AFF" />
                                    </View>
                                    <Text style={[styles.groupInfoActionLabel, { color: colors.text }]}>Resources</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.groupInfoActionBtn, { backgroundColor: colors.card }]}
                                    onPress={() => { closeGroupInfo(); setActiveTab('members'); }}
                                >
                                    <View style={[styles.groupInfoActionIcon, { backgroundColor: '#34C75920' }]}>
                                        <Ionicons name="people" size={22} color="#34C759" />
                                    </View>
                                    <Text style={[styles.groupInfoActionLabel, { color: colors.text }]}>Members</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.groupInfoActionBtn, { backgroundColor: colors.card }]}
                                    onPress={() => { closeGroupInfo(); startCall('voice'); }}
                                >
                                    <View style={[styles.groupInfoActionIcon, { backgroundColor: '#5856D620' }]}>
                                        <Ionicons name="call" size={22} color="#5856D6" />
                                    </View>
                                    <Text style={[styles.groupInfoActionLabel, { color: colors.text }]}>Call</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.groupInfoActionBtn, { backgroundColor: colors.card }]}
                                    onPress={() => { closeGroupInfo(); openGroupOptions(); }}
                                >
                                    <View style={[styles.groupInfoActionIcon, { backgroundColor: '#FF950020' }]}>
                                        <Ionicons name="settings" size={22} color="#FF9500" />
                                    </View>
                                    <Text style={[styles.groupInfoActionLabel, { color: colors.text }]}>Settings</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.groupInfoButtonSection}>
                            {isMember() ? (
                                <TouchableOpacity
                                    style={[styles.groupInfoLeaveBtn, { borderColor: '#FF3B30' }]}
                                    onPress={() => { closeGroupInfo(); handleLeave(); }}
                                >
                                    <Ionicons name="exit-outline" size={20} color="#FF3B30" />
                                    <Text style={styles.groupInfoLeaveBtnText}>Leave Group</Text>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity
                                    style={[styles.groupInfoJoinBtn, { backgroundColor: premiumColors.primary.main }]}
                                    onPress={() => { closeGroupInfo(); handleJoin(); }}
                                >
                                    <Ionicons name="person-add" size={20} color="#FFFFFF" />
                                    <Text style={styles.groupInfoJoinBtnText}>Join Group</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        <View style={{ height: 40 }} />
                    </ScrollView>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    groupInfoOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    groupInfoBackdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    groupInfoContainer: {
        maxHeight: height * 0.85,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: spacing.sm,
    },
    groupInfoHandle: {
        alignItems: 'center',
        paddingVertical: spacing.sm,
    },
    groupInfoHandleBar: {
        width: 40,
        height: 5,
        borderRadius: 3,
    },
    groupInfoHeader: {
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.lg,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    groupInfoAvatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    groupInfoAvatarImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: spacing.md,
    },
    groupInfoName: {
        fontSize: fontSize.xl,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: spacing.xs,
    },
    groupInfoDesc: {
        fontSize: fontSize.sm,
        textAlign: 'center',
        lineHeight: 20,
        paddingHorizontal: spacing.lg,
    },
    groupInfoStats: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing.lg,
        paddingHorizontal: spacing.md,
    },
    groupInfoStat: {
        flex: 1,
        alignItems: 'center',
    },
    groupInfoStatValue: {
        fontSize: fontSize.xl,
        fontWeight: '700',
    },
    groupInfoStatLabel: {
        fontSize: fontSize.xs,
        marginTop: 2,
    },
    groupInfoStatDivider: {
        width: 1,
        height: 30,
    },
    groupInfoScroll: {
        flex: 1,
    },
    groupInfoSection: {
        marginTop: spacing.md,
        marginHorizontal: spacing.md,
        borderRadius: spacing.md,
        padding: spacing.md,
    },
    groupInfoSectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    groupInfoSectionTitle: {
        fontSize: fontSize.xs,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: spacing.sm,
    },
    groupInfoSeeAll: {
        fontSize: fontSize.sm,
        fontWeight: '600',
    },
    groupInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.sm,
    },
    groupInfoRowIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    groupInfoRowContent: {
        flex: 1,
    },
    groupInfoRowLabel: {
        fontSize: fontSize.xs,
        marginBottom: 2,
    },
    groupInfoRowValue: {
        fontSize: fontSize.md,
        fontWeight: '500',
    },
    groupInfoMembersList: {
        gap: spacing.sm,
    },
    groupInfoMember: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.xs,
    },
    groupInfoMemberAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: spacing.md,
    },
    groupInfoMemberAvatarPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    groupInfoMemberInfo: {
        flex: 1,
    },
    groupInfoMemberName: {
        fontSize: fontSize.md,
        fontWeight: '500',
    },
    groupInfoMemberRole: {
        fontSize: fontSize.xs,
        fontWeight: '600',
        marginTop: 1,
    },
    groupInfoActions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    groupInfoActionBtn: {
        width: '48%',
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.sm,
        borderRadius: spacing.md,
    },
    groupInfoActionIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.sm,
    },
    groupInfoActionLabel: {
        fontSize: fontSize.sm,
        fontWeight: '500',
    },
    groupInfoButtonSection: {
        padding: spacing.lg,
        marginTop: spacing.md,
    },
    groupInfoLeaveBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.md,
        borderRadius: spacing.md,
        borderWidth: 1,
        gap: spacing.sm,
    },
    groupInfoLeaveBtnText: {
        color: '#FF3B30',
        fontSize: fontSize.md,
        fontWeight: '600',
    },
    groupInfoJoinBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.md,
        borderRadius: spacing.md,
        gap: spacing.sm,
    },
    groupInfoJoinBtnText: {
        color: '#FFFFFF',
        fontSize: fontSize.md,
        fontWeight: '600',
    },
});
