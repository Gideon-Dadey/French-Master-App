import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { premiumColors } from '../../../utils/premiumDesign';
import { spacing, fontSize, screenWidth } from '../../../utils/responsive';

export default function BackgroundPickerModal({
    visible,
    colors,
    isDarkMode,
    chatBackground,
    closeBackgroundPicker,
    resetBackground,
    pickBackgroundImage,
    setChatBackground,
    setBackgroundColor,
}) {

    const premiumGradients = [
        ['#6366F1', '#8B5CF6'],
        ['#F59E0B', '#EF4444'],
        ['#3B82F6', '#2DD4BF'],
        ['#8B5CF6', '#EC4899'],
        ['#000000', '#434343'],
        ['#00c6ff', '#0072ff'],
        ['#f953c6', '#b91d73'],
        ['#ae085c', '#2e0656'],
        ['#11998e', '#38ef7d'],
        ['#fc4a1a', '#f7b733'],
        ['#74ebd5', '#9FACE6'],
        ['#667eea', '#764ba2'],
    ];

    const backgroundColors = [
        '#E4DDD6', '#D4E4E6', '#F6E4D6', '#E6D6E4', '#D6E6D6', '#E6E6D6',
        '#0B141A', '#1C1C1C', '#121212', '#1E1E1E', '#2C2C2C', '#383838',
        '#001F3F', '#0074D9', '#7FDBFF', '#39CCCC', '#3D9970', '#2ECC40',
        '#01FF70', '#FFDC00', '#FF851B', '#FF4136', '#85144b', '#F012BE'
    ];
    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            transparent={false}
            animationType="slide"
            onRequestClose={closeBackgroundPicker}
        >
            <View style={[styles.wallpaperModalContainer, { backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff' }]}>
                {/* Telegram-style Header */}
                <View style={[styles.wallpaperHeaderTelegram, { borderBottomColor: colors.border }]}>
                    <TouchableOpacity onPress={closeBackgroundPicker} style={styles.wallpaperBackBtnTelegram}>
                        <Ionicons name="close" size={26} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.wallpaperHeaderTitleTelegram, { color: colors.text }]}>Chat Wallpaper</Text>
                    <TouchableOpacity onPress={resetBackground} style={styles.wallpaperResetBtnTelegram}>
                        <Text style={{ color: premiumColors.primary.main, fontSize: 16, fontWeight: '600' }}>Reset</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView
                    style={styles.wallpaperScrollViewTelegram}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 40 }}
                >
                    {/* Main Preview */}
                    <View style={styles.wallpaperPreviewContainerTelegram}>
                        <View style={[styles.wallpaperPreviewFrameTelegram, { borderColor: colors.border }]}>
                            {/* Dynamic Background */}
                            <View style={[
                                styles.wallpaperPreviewBox,
                                chatBackground?.type === 'color' && { backgroundColor: chatBackground.value },
                                !chatBackground && { backgroundColor: isDarkMode ? '#0B141A' : '#E4DDD6' },
                            ]}>
                                {chatBackground?.type === 'image' && (
                                    <Image
                                        source={{ uri: chatBackground.value }}
                                        style={styles.wallpaperPreviewImage}
                                        resizeMode="cover"
                                    />
                                )}
                                {chatBackground?.type === 'gradient' && (
                                    <LinearGradient
                                        colors={chatBackground.value}
                                        style={styles.wallpaperPreviewImage}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                    />
                                )}

                                {/* Telegram-like Bubbles */}
                                <View style={styles.wallpaperPreviewChat}>
                                    <View style={[styles.wallpaperBubbleStart, { backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF' }]}>
                                        <Text style={[styles.wallpaperText, { color: colors.text }]}>Check out this new wallpaper! 🎨</Text>
                                        <Text style={[styles.wallpaperTime, { color: colors.secondaryText }]}>10:41</Text>
                                    </View>
                                    <View style={[styles.wallpaperBubbleEnd, { backgroundColor: premiumColors.primary.main }]}>
                                        <Text style={[styles.wallpaperText, { color: '#ffffff' }]}>Looks amazing! 😍</Text>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-end', marginTop: 4 }}>
                                            <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)' }}>10:42</Text>
                                            <Ionicons name="checkmark-done" size={14} color="#fff" />
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Gallery Button */}
                    <TouchableOpacity
                        style={[styles.wallpaperGalleryBtn, { backgroundColor: colors.card }]}
                        onPress={pickBackgroundImage}
                    >
                        <View style={styles.wallpaperGalleryIcon}>
                            <Ionicons name="camera-outline" size={24} color={premiumColors.primary.main} />
                        </View>
                        <Text style={[styles.wallpaperGalleryText, { color: premiumColors.primary.main }]}>Set from Gallery</Text>
                    </TouchableOpacity>

                    {/* Gradients Section */}
                    <View style={styles.wallpaperSectionTelegram}>
                        <Text style={[styles.wallpaperSectionTitleTelegram, { color: colors.secondaryText }]}>MOTION & GRADIENTS</Text>
                        <View style={styles.wallpaperGridTelegram}>
                            {premiumGradients.map((gradient, index) => (
                                <TouchableOpacity
                                    key={`grad-${index}`}
                                    style={[
                                        styles.wallpaperThumbTelegram,
                                        chatBackground?.type === 'gradient' && chatBackground.value[0] === gradient[0] && styles.wallpaperThumbActive
                                    ]}
                                    onPress={() => setChatBackground({ type: 'gradient', value: gradient })}
                                >
                                    <LinearGradient
                                        colors={gradient}
                                        style={{ flex: 1, borderRadius: 12 }}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                    />
                                    {chatBackground?.type === 'gradient' && chatBackground.value[0] === gradient[0] && (
                                        <View style={styles.wallpaperCheckOverlay}>
                                            <Ionicons name="checkmark-circle" size={24} color="#fff" />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Colors Section */}
                    <View style={styles.wallpaperSectionTelegram}>
                        <Text style={[styles.wallpaperSectionTitleTelegram, { color: colors.secondaryText }]}>SOLID COLORS</Text>
                        <View style={styles.wallpaperGridTelegram}>
                            {backgroundColors.map((color, index) => (
                                <TouchableOpacity
                                    key={`col-${index}`}
                                    style={[
                                        styles.wallpaperThumbTelegram,
                                        chatBackground?.type === 'color' && chatBackground.value === color && styles.wallpaperThumbActive,
                                        { backgroundColor: color }
                                    ]}
                                    onPress={() => setBackgroundColor(color)}
                                >
                                    {chatBackground?.type === 'color' && chatBackground.value === color && (
                                        <View style={styles.wallpaperCheckOverlay}>
                                            <Ionicons name="checkmark-circle" size={24} color="#fff" />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                </ScrollView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    wallpaperModalContainer: {
        flex: 1,
    },
    wallpaperHeaderTelegram: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        height: 60,
        borderBottomWidth: StyleSheet.hairlineWidth,
        marginTop: 40,
    },
    wallpaperBackBtnTelegram: {
        padding: spacing.xs,
    },
    wallpaperHeaderTitleTelegram: {
        fontSize: fontSize.lg,
        fontWeight: '700',
    },
    wallpaperResetBtnTelegram: {
        padding: spacing.xs,
    },
    wallpaperScrollViewTelegram: {
        flex: 1,
    },
    wallpaperPreviewContainerTelegram: {
        padding: spacing.xl,
        alignItems: 'center',
    },
    wallpaperPreviewFrameTelegram: {
        width: '100%',
        aspectRatio: 9 / 16,
        borderRadius: 30,
        borderWidth: 8,
        overflow: 'hidden',
    },
    wallpaperPreviewBox: {
        flex: 1,
    },
    wallpaperPreviewImage: {
        ...StyleSheet.absoluteFillObject,
    },
    wallpaperPreviewChat: {
        flex: 1,
        padding: spacing.md,
        justifyContent: 'flex-end',
        gap: spacing.md,
        paddingBottom: 40,
    },
    wallpaperBubbleStart: {
        alignSelf: 'flex-start',
        padding: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: 18,
        borderBottomLeftRadius: 4,
        maxWidth: '85%',
    },
    wallpaperBubbleEnd: {
        alignSelf: 'flex-end',
        padding: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: 18,
        borderBottomRightRadius: 4,
        maxWidth: '85%',
    },
    wallpaperText: {
        fontSize: 15,
        lineHeight: 20,
    },
    wallpaperTime: {
        fontSize: 11,
        alignSelf: 'flex-end',
        marginTop: 4,
    },
    wallpaperGalleryBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: spacing.xl,
        padding: spacing.md,
        borderRadius: 20,
        marginBottom: spacing.xl,
    },
    wallpaperGalleryIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: premiumColors.primary.main + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    wallpaperGalleryText: {
        fontSize: 16,
        fontWeight: '600',
    },
    wallpaperSectionTelegram: {
        marginBottom: spacing.xl,
        paddingHorizontal: spacing.md,
    },
    wallpaperSectionTitleTelegram: {
        fontSize: 13,
        fontWeight: '700',
        marginBottom: spacing.md,
        marginLeft: spacing.sm,
        letterSpacing: 0.5,
    },
    wallpaperGridTelegram: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    wallpaperThumbTelegram: {
        width: (screenWidth - spacing.md * 2 - 24) / 3,
        aspectRatio: 1,
        borderRadius: 16,
        overflow: 'hidden',
    },
    wallpaperThumbActive: {
        borderWidth: 3,
        borderColor: premiumColors.primary.main,
    },
    wallpaperCheckOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
