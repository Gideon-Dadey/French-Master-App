import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, ScrollView, TextInput, Image, ActivityIndicator, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { premiumColors, premiumBorderRadius } from '../../../utils/premiumDesign';
import { spacing, fontSize } from '../../../utils/responsive';

export default function EditGroupModal({
    visible,
    colors,
    editGroupData,
    setEditGroupData,
    editGroupImageLoading,
    setShowEditGroup,
    handleSaveGroupEdit,
    showGroupImageOptions,
    handleDeleteGroup
}) {
    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={() => setShowEditGroup(false)}
        >
            <View style={[styles.editGroupModal, { backgroundColor: colors.background }]}>

                <View style={[styles.editGroupHeader, { borderBottomColor: colors.border }]}>
                    <TouchableOpacity onPress={() => setShowEditGroup(false)}>
                        <Text style={[styles.editGroupCancelBtn, { color: '#007AFF' }]}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={[styles.editGroupTitle, { color: colors.text }]}>Edit Group</Text>
                    <TouchableOpacity onPress={handleSaveGroupEdit} disabled={editGroupImageLoading}>
                        {editGroupImageLoading ? (
                            <ActivityIndicator size="small" color="#007AFF" />
                        ) : (
                            <Text style={[styles.editGroupSaveBtn, { color: '#007AFF' }]}>Save</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.editGroupContent} showsVerticalScrollIndicator={false}>

                    <View style={styles.editGroupPhotoSection}>
                        <TouchableOpacity onPress={showGroupImageOptions} activeOpacity={0.8}>
                            {editGroupData.image ? (
                                <View style={styles.editGroupPhotoContainer}>
                                    <Image
                                        source={{ uri: editGroupData.image }}
                                        style={styles.editGroupPhotoImage}
                                    />
                                    <View style={styles.editGroupPhotoOverlay}>
                                        <Ionicons name="camera" size={24} color="#FFFFFF" />
                                    </View>
                                </View>
                            ) : (
                                <View style={[styles.editGroupPhoto, { backgroundColor: premiumColors.primary.main + '20' }]}>
                                    <Ionicons name="people" size={50} color={premiumColors.primary.main} />
                                    <View style={styles.editGroupPhotoOverlay}>
                                        <Ionicons name="camera" size={24} color="#FFFFFF" />
                                    </View>
                                </View>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.editGroupPhotoBtn} onPress={showGroupImageOptions}>
                            <Text style={[styles.editGroupPhotoBtnText, { color: '#007AFF' }]}>
                                {editGroupData.image ? 'Change Photo' : 'Add Photo'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={[styles.editGroupSection, { backgroundColor: colors.card }]}>
                        <Text style={[styles.editGroupSectionTitle, { color: colors.secondaryText }]}>GROUP INFO</Text>

                        <View style={[styles.editGroupField, { borderBottomColor: colors.border }]}>
                            <Text style={[styles.editGroupFieldLabel, { color: colors.secondaryText }]}>Name</Text>
                            <TextInput
                                style={[styles.editGroupFieldInput, { color: colors.text }]}
                                value={editGroupData.name}
                                onChangeText={(text) => setEditGroupData(prev => ({ ...prev, name: text }))}
                                placeholder="Group Name"
                                placeholderTextColor={colors.secondaryText}
                            />
                        </View>

                        <View style={styles.editGroupField}>
                            <Text style={[styles.editGroupFieldLabel, { color: colors.secondaryText }]}>Description</Text>
                            <TextInput
                                style={[styles.editGroupFieldInput, styles.editGroupFieldMultiline, { color: colors.text }]}
                                value={editGroupData.description}
                                onChangeText={(text) => setEditGroupData(prev => ({ ...prev, description: text }))}
                                placeholder="Describe your group"
                                placeholderTextColor={colors.secondaryText}
                                multiline
                                numberOfLines={3}
                            />
                        </View>
                    </View>

                    <View style={[styles.editGroupSection, { backgroundColor: colors.card }]}>
                        <Text style={[styles.editGroupSectionTitle, { color: colors.secondaryText }]}>SETTINGS</Text>

                        <View style={[styles.editGroupField, { borderBottomColor: colors.border }]}>
                            <Text style={[styles.editGroupFieldLabel, { color: colors.text }]}>Level</Text>
                            <View style={styles.editGroupOptionsRow}>
                                {['beginner', 'intermediate', 'advanced', 'all'].map((level) => (
                                    <TouchableOpacity
                                        key={level}
                                        style={[
                                            styles.editGroupOption,
                                            { borderColor: colors.border },
                                            editGroupData.level === level && { backgroundColor: premiumColors.primary.main, borderColor: premiumColors.primary.main }
                                        ]}
                                        onPress={() => setEditGroupData(prev => ({ ...prev, level }))}
                                    >
                                        <Text style={[
                                            styles.editGroupOptionText,
                                            { color: colors.secondaryText },
                                            editGroupData.level === level && { color: '#FFFFFF' }
                                        ]}>
                                            {level.charAt(0).toUpperCase() + level.slice(1)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View style={[styles.editGroupField, { borderBottomColor: colors.border }]}>
                            <Text style={[styles.editGroupFieldLabel, { color: colors.text }]}>Focus</Text>
                            <View style={styles.editGroupOptionsRow}>
                                {['grammar', 'conversation', 'vocabulary', 'general'].map((focus) => (
                                    <TouchableOpacity
                                        key={focus}
                                        style={[
                                            styles.editGroupOption,
                                            { borderColor: colors.border },
                                            editGroupData.focus === focus && { backgroundColor: premiumColors.primary.main, borderColor: premiumColors.primary.main }
                                        ]}
                                        onPress={() => setEditGroupData(prev => ({ ...prev, focus }))}
                                    >
                                        <Text style={[
                                            styles.editGroupOptionText,
                                            { color: colors.secondaryText },
                                            editGroupData.focus === focus && { color: '#FFFFFF' }
                                        ]}>
                                            {focus.charAt(0).toUpperCase() + focus.slice(1)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View style={[styles.editGroupField, { borderBottomColor: colors.border }]}>
                            <Text style={[styles.editGroupFieldLabel, { color: colors.text }]}>Max Members</Text>
                            <View style={styles.editGroupSliderRow}>
                                <TouchableOpacity
                                    style={[styles.editGroupSliderBtn, { backgroundColor: colors.border }]}
                                    onPress={() => setEditGroupData(prev => ({ ...prev, maxMembers: Math.max(5, prev.maxMembers - 5) }))}
                                >
                                    <Ionicons name="remove" size={20} color={colors.text} />
                                </TouchableOpacity>
                                <Text style={[styles.editGroupSliderValue, { color: colors.text }]}>{editGroupData.maxMembers}</Text>
                                <TouchableOpacity
                                    style={[styles.editGroupSliderBtn, { backgroundColor: colors.border }]}
                                    onPress={() => setEditGroupData(prev => ({ ...prev, maxMembers: Math.min(100, prev.maxMembers + 5) }))}
                                >
                                    <Ionicons name="add" size={20} color={colors.text} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.editGroupToggleField}>
                            <View style={styles.editGroupToggleInfo}>
                                <Ionicons name="lock-closed" size={22} color={colors.text} />
                                <View style={styles.editGroupToggleText}>
                                    <Text style={[styles.editGroupToggleLabel, { color: colors.text }]}>Private Group</Text>
                                    <Text style={[styles.editGroupToggleDesc, { color: colors.secondaryText }]}>
                                        Only invited members can join
                                    </Text>
                                </View>
                            </View>
                            <TouchableOpacity
                                style={[
                                    styles.editGroupToggle,
                                    { backgroundColor: editGroupData.isPrivate ? '#34C759' : colors.border }
                                ]}
                                onPress={() => setEditGroupData(prev => ({ ...prev, isPrivate: !prev.isPrivate }))}
                            >
                                <Animated.View style={[
                                    styles.editGroupToggleThumb,
                                    { marginLeft: editGroupData.isPrivate ? 22 : 2 }
                                ]} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={[styles.editGroupSection, { backgroundColor: colors.card }]}>
                        <Text style={[styles.editGroupSectionTitle, { color: '#FF3B30' }]}>DANGER ZONE</Text>

                        <TouchableOpacity style={styles.editGroupDangerBtn} onPress={handleDeleteGroup}>
                            <Ionicons name="trash-outline" size={22} color="#FF3B30" />
                            <Text style={styles.editGroupDangerBtnText}>Delete Group</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={{ height: 50 }} />
                </ScrollView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    editGroupModal: {
        flex: 1,
    },
    editGroupHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        paddingTop: 60,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    editGroupCancelBtn: {
        fontSize: fontSize.md,
        fontWeight: '400',
    },
    editGroupTitle: {
        fontSize: fontSize.lg,
        fontWeight: '600',
    },
    editGroupSaveBtn: {
        fontSize: fontSize.md,
        fontWeight: '600',
    },
    editGroupContent: {
        flex: 1,
    },
    editGroupPhotoSection: {
        alignItems: 'center',
        paddingVertical: spacing.xl,
    },
    editGroupPhoto: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
    },
    editGroupPhotoContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        overflow: 'hidden',
        position: 'relative',
    },
    editGroupPhotoImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    editGroupPhotoOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 36,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    editGroupPhotoBtn: {
        marginTop: spacing.md,
    },
    editGroupPhotoBtnText: {
        fontSize: fontSize.md,
        fontWeight: '500',
    },
    editGroupSection: {
        marginHorizontal: spacing.lg,
        marginBottom: spacing.lg,
        borderRadius: premiumBorderRadius.lg,
        overflow: 'hidden',
    },
    editGroupSectionTitle: {
        fontSize: fontSize.xs,
        fontWeight: '600',
        marginBottom: spacing.sm,
        marginLeft: spacing.md,
        marginTop: spacing.md,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    editGroupField: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    editGroupFieldLabel: {
        fontSize: fontSize.sm,
        fontWeight: '500',
        marginBottom: spacing.xs,
    },
    editGroupFieldInput: {
        fontSize: fontSize.md,
        fontWeight: '400',
        padding: 0,
    },
    editGroupFieldMultiline: {
        minHeight: 60,
        textAlignVertical: 'top',
    },
    editGroupOptionsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
        marginTop: spacing.sm,
    },
    editGroupOption: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: premiumBorderRadius.md,
        borderWidth: 1,
    },
    editGroupOptionText: {
        fontSize: fontSize.sm,
        fontWeight: '500',
    },
    editGroupSliderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing.sm,
        gap: spacing.lg,
    },
    editGroupSliderBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    editGroupSliderValue: {
        fontSize: fontSize.xl,
        fontWeight: '700',
        minWidth: 50,
        textAlign: 'center',
    },
    editGroupToggleField: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.md,
    },
    editGroupToggleInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    editGroupToggleText: {
        marginLeft: spacing.md,
    },
    editGroupToggleLabel: {
        fontSize: fontSize.md,
        fontWeight: '500',
    },
    editGroupToggleDesc: {
        fontSize: fontSize.xs,
        marginTop: 2,
    },
    editGroupToggle: {
        width: 50,
        height: 30,
        borderRadius: 15,
        padding: 2,
        justifyContent: 'center',
    },
    editGroupToggleThumb: {
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    editGroupDangerBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        gap: spacing.md,
    },
    editGroupDangerBtnText: {
        color: '#FF3B30',
        fontSize: fontSize.md,
        fontWeight: '500',
    },
});
