import React, { useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Animated,
    Platform,
} from 'react-native';
import { Swipeable, TapGestureHandler, State } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { spacing, fontSize, screenWidth } from '../../utils/responsive';
import { premiumShadows, premiumColors, premiumBorderRadius } from '../../utils/premiumDesign';
import { formatTimeAgo, getFileIcon, formatDuration, MESSAGE_TYPES, REACTIONS } from '../../utils/chatUtils';

const width = screenWidth;

const MessageBubble = ({
    discussion,
    index,
    user,
    isDarkMode,
    colors,
    messageReactions,
    isModerator,
    onSwipeDelete,
    onDoubleTapLike,
    onLongPress,
    onImagePreview,
    onDownloadDocument,
    onReply,
    onPlayVoice,
    playingVoice,
    voiceProgress,
    showReactionPicker,
    reactionPickerAnim,
    handleReaction,
    setShowReactionPicker,
    doubleTapHeartIndex,
    doubleTapHeartAnim,
    swipeableRefs,
    groupDiscussions,
}) => {
    const discussionUser = typeof discussion.user === 'object' ? discussion.user : null;
    const currentUserId = user?._id ? String(user._id) : (user?.id ? String(user.id) : null);

    let messageUserId = null;
    if (discussionUser) {
        messageUserId = discussionUser._id ? String(discussionUser._id) : (discussionUser.id ? String(discussionUser.id) : null);
    } else if (discussion.user) {
        messageUserId = String(discussion.user);
    }

    const isOwnMessage = currentUserId && messageUserId && currentUserId === messageUserId;
    const reactions = messageReactions[discussion._id?.toString()] || [];

    let messageData;
    try {
        messageData = JSON.parse(discussion.message);
    } catch {
        messageData = { message: discussion.message, type: MESSAGE_TYPES.TEXT };
    }

    const renderDateSeparator = () => {
        if (index === 0 || new Date(discussion.createdAt).toDateString() !==
            new Date(groupDiscussions[index - 1]?.createdAt).toDateString()) {
            return (
                <View style={styles.whatsappDateSeparator}>
                    <View style={[styles.whatsappDateBubble, { backgroundColor: isDarkMode ? '#182229' : '#FFFFFF' }]}>
                        <Text style={[styles.whatsappDateText, { color: isDarkMode ? '#8696A0' : '#54656F' }]}>
                            {new Date(discussion.createdAt).toLocaleDateString('en-US', {
                                weekday: 'long',
                                month: 'short',
                                day: 'numeric'
                            })}
                        </Text>
                    </View>
                </View>
            );
        }
        return null;
    };

    return (
        <View style={styles.messageWrapper}>
            {renderDateSeparator()}

            <Swipeable
                ref={ref => {
                    if (ref) {
                        swipeableRefs.current.set(discussion._id, ref);
                    } else {
                        swipeableRefs.current.delete(discussion._id);
                    }
                }}
                renderLeftActions={(progress, dragX) => {
                    const translateX = dragX.interpolate({
                        inputRange: [0, 60, 80, 100],
                        outputRange: [-40, 0, 8, 16],
                        extrapolate: 'clamp',
                    });
                    const scale = dragX.interpolate({
                        inputRange: [0, 40, 80],
                        outputRange: [0.3, 0.8, 1],
                        extrapolate: 'clamp',
                    });
                    const opacity = dragX.interpolate({
                        inputRange: [0, 30, 60],
                        outputRange: [0, 0.5, 1],
                        extrapolate: 'clamp',
                    });
                    const rotate = dragX.interpolate({
                        inputRange: [0, 80],
                        outputRange: ['-45deg', '0deg'],
                        extrapolate: 'clamp',
                    });
                    return (
                        <Animated.View
                            style={[
                                styles.swipeReplyContainer,
                                {
                                    opacity,
                                    transform: [{ translateX }, { scale }],
                                }
                            ]}
                        >
                            <View style={[
                                styles.swipeReplyIcon,
                                { backgroundColor: isDarkMode ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.1)' }
                            ]}>
                                <Animated.View style={{ transform: [{ rotate }] }}>
                                    <Ionicons name="arrow-undo" size={22} color={premiumColors.primary.main} />
                                </Animated.View>
                            </View>
                        </Animated.View>
                    );
                }}
                renderRightActions={(progress, dragX) => {
                    if (!isOwnMessage && !isModerator) return null;

                    const translateX = dragX.interpolate({
                        inputRange: [-100, -80, -60, 0],
                        outputRange: [0, 8, 20, 80],
                        extrapolate: 'clamp',
                    });
                    const scale = dragX.interpolate({
                        inputRange: [-80, -40, 0],
                        outputRange: [1, 0.8, 0.3],
                        extrapolate: 'clamp',
                    });
                    const opacity = dragX.interpolate({
                        inputRange: [-60, -30, 0],
                        outputRange: [1, 0.5, 0],
                        extrapolate: 'clamp',
                    });
                    return (
                        <TouchableOpacity
                            onPress={() => {
                                const ref = swipeableRefs.current.get(discussion._id);
                                if (ref) ref.close();
                                onSwipeDelete(discussion, isOwnMessage);
                            }}
                            activeOpacity={0.8}
                        >
                            <Animated.View
                                style={[
                                    styles.swipeDeleteContainer,
                                    {
                                        opacity,
                                        transform: [{ translateX }, { scale }],
                                    }
                                ]}
                            >
                                <View style={styles.swipeDeleteIcon}>
                                    <Ionicons name="trash" size={22} color="#FFFFFF" />
                                </View>
                            </Animated.View>
                        </TouchableOpacity>
                    );
                }}
                onSwipeableLeftOpen={() => {
                    onReply({ ...discussion, user: discussionUser });
                    const ref = swipeableRefs.current.get(discussion._id);
                    if (ref) ref.close();
                }}
                overshootLeft={false}
                overshootRight={false}
                friction={1.5}
                leftThreshold={50}
                rightThreshold={50}
            >
                <TapGestureHandler
                    numberOfTaps={2}
                    onHandlerStateChange={({ nativeEvent }) => {
                        if (nativeEvent.state === State.ACTIVE) {
                            onDoubleTapLike(index, { emoji: '❤️', name: 'love' });
                        }
                    }}
                >
                    <View style={styles.messageWrapperInside}>
                        {doubleTapHeartIndex === index && (
                            <Animated.View
                                style={[
                                    styles.doubleTapHeart,
                                    {
                                        opacity: doubleTapHeartAnim,
                                        transform: [
                                            {
                                                scale: doubleTapHeartAnim.interpolate({
                                                    inputRange: [0, 0.5, 1],
                                                    outputRange: [0, 1.3, 1],
                                                })
                                            },
                                        ],
                                    },
                                ]}
                            >
                                <Text style={styles.doubleTapHeartEmoji}>❤️</Text>
                            </Animated.View>
                        )}
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onLongPress={() => onLongPress({ ...discussion, content: discussion.message }, index, isOwnMessage)}
                            style={[
                                styles.messageContainer,
                                isOwnMessage ? styles.ownMessageContainer : styles.otherMessageContainer,
                            ]}
                        >
                            {!isOwnMessage && (
                                discussionUser?.avatar ? (
                                    <Image
                                        source={{ uri: discussionUser.avatar }}
                                        style={styles.messageAvatar}
                                    />
                                ) : (
                                    <View style={[styles.messageAvatarPlaceholder, { backgroundColor: isDarkMode ? '#2A3942' : '#DFE5E7' }]}>
                                        <Ionicons name="person" size={16} color={isDarkMode ? '#8696A0' : '#667781'} />
                                    </View>
                                )
                            )}

                            <View style={[
                                styles.messageBubble,
                                isOwnMessage ? styles.ownMessageBubble : styles.otherMessageBubble,
                                messageData.type === MESSAGE_TYPES.IMAGE && styles.imageBubble,
                                messageData.type === MESSAGE_TYPES.IMAGE && (isOwnMessage ? styles.ownImageBubble : styles.otherImageBubble),
                                messageData.type !== MESSAGE_TYPES.IMAGE && {
                                    backgroundColor: isOwnMessage
                                        ? (isDarkMode ? '#2B5278' : '#EEFFDE')
                                        : (isDarkMode ? '#182533' : '#FFFFFF')
                                },
                            ]}>
                                {isOwnMessage && messageData.type !== MESSAGE_TYPES.IMAGE && (
                                    <LinearGradient
                                        colors={isDarkMode
                                            ? ['rgba(43, 82, 120, 0)', 'rgba(43, 82, 120, 0.3)']
                                            : ['rgba(200, 255, 200, 0)', 'rgba(180, 240, 180, 0.2)']
                                        }
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={StyleSheet.absoluteFill}
                                    />
                                )}

                                {!isOwnMessage && messageData.type !== MESSAGE_TYPES.IMAGE && (
                                    <Text style={[styles.messageAuthor, {
                                        color: [
                                            '#E17076', '#7BC862', '#65AADD', '#EE7AE6',
                                            '#FAA05A', '#6EC9CB', '#E47FBD', '#7B88FF'
                                        ][Math.abs((discussionUser?.name?.charCodeAt(0) || 0) % 8)]
                                    }]}>
                                        {discussionUser?.name || 'Member'}
                                    </Text>
                                )}

                                {messageData.replyTo && (
                                    <View style={[styles.replyPreview, {
                                        backgroundColor: isOwnMessage
                                            ? (isDarkMode ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)')
                                            : (isDarkMode ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)'),
                                        borderLeftColor: '#6EB545',
                                    }]}>
                                        <Text style={[styles.replyAuthor, { color: '#6EB545' }]}>
                                            {messageData.replyTo.userName}
                                        </Text>
                                        <Text style={[styles.replyText, { color: isOwnMessage ? (isDarkMode ? 'rgba(255,255,255,0.7)' : '#2E7D32') : colors.secondaryText }]} numberOfLines={1}>
                                            {messageData.replyTo.message}
                                        </Text>
                                    </View>
                                )}

                                {messageData.type === MESSAGE_TYPES.IMAGE && messageData.attachment?.uri && (
                                    <TouchableOpacity
                                        onPress={() => onImagePreview(messageData.attachment.uri)}
                                        style={[
                                            styles.imageAttachment,
                                            isOwnMessage ? styles.ownImageBubble : styles.otherImageBubble
                                        ]}
                                        activeOpacity={0.95}
                                    >
                                        <Image
                                            source={{ uri: messageData.attachment.uri }}
                                            style={[
                                                styles.attachedImage,
                                                isOwnMessage ? styles.ownImageBubble : styles.otherImageBubble
                                            ]}
                                            resizeMode="cover"
                                        />
                                        <View style={styles.telegramImageTimePill}>
                                            <Text style={styles.telegramImageTimeText}>{formatTimeAgo(discussion.createdAt)}</Text>
                                            {isOwnMessage && (
                                                <Ionicons
                                                    name="checkmark-done"
                                                    size={13}
                                                    color="#FFFFFF"
                                                    style={{ marginLeft: 4 }}
                                                />
                                            )}
                                        </View>
                                    </TouchableOpacity>
                                )}

                                {messageData.type === MESSAGE_TYPES.DOCUMENT && messageData.attachment && (
                                    <TouchableOpacity
                                        activeOpacity={0.8}
                                        onPress={() => onDownloadDocument(messageData.attachment.uri, messageData.attachment.name)}
                                        style={styles.whatsappDocContainer}
                                    >
                                        <View style={[
                                            styles.whatsappDocCard,
                                            {
                                                backgroundColor: isDarkMode
                                                    ? (isOwnMessage ? 'rgba(0,0,0,0.15)' : '#1D2A32')
                                                    : (isOwnMessage ? 'rgba(0,0,0,0.08)' : '#F0F2F5')
                                            }
                                        ]}>
                                            <View style={[
                                                styles.whatsappDocIconWrapper,
                                                { backgroundColor: getFileIcon(messageData.attachment.name).color }
                                            ]}>
                                                <Ionicons
                                                    name={getFileIcon(messageData.attachment.name).icon}
                                                    size={28}
                                                    color="#FFFFFF"
                                                />
                                                <View style={styles.whatsappDocExtBadge}>
                                                    <Text style={styles.whatsappDocExtText}>
                                                        {messageData.attachment.name?.split('.').pop()?.toUpperCase() || 'FILE'}
                                                    </Text>
                                                </View>
                                            </View>

                                            <View style={styles.whatsappDocInfo}>
                                                <Text
                                                    style={[styles.whatsappDocName, { color: isOwnMessage ? '#FFFFFF' : (isDarkMode ? '#E9EDEF' : colors.text) }]}
                                                    numberOfLines={2}
                                                >
                                                    {messageData.attachment.name}
                                                </Text>
                                                <View style={styles.whatsappDocMeta}>
                                                    <Text style={styles.whatsappDocSize}>
                                                        {messageData.attachment.size
                                                            ? messageData.attachment.size > 1024 * 1024
                                                                ? `${(messageData.attachment.size / (1024 * 1024)).toFixed(1)} MB`
                                                                : `${(messageData.attachment.size / 1024).toFixed(1)} KB`
                                                            : 'Document'
                                                        }
                                                    </Text>
                                                    <Text style={styles.whatsappDocDot}>•</Text>
                                                    <Text style={styles.whatsappDocType}>
                                                        {messageData.attachment.name?.split('.').pop()?.toUpperCase() || 'FILE'}
                                                    </Text>
                                                </View>
                                            </View>

                                            <View style={styles.whatsappDocDownload}>
                                                <Ionicons name="download-outline" size={22} color="#8696A0" />
                                            </View>
                                        </View>

                                        {messageData.message && (
                                            <Text style={[styles.whatsappDocCaption, { color: isOwnMessage ? '#FFFFFF' : (isDarkMode ? '#E9EDEF' : colors.text) }]}>
                                                {messageData.message}
                                            </Text>
                                        )}
                                    </TouchableOpacity>
                                )}

                                {messageData.type === MESSAGE_TYPES.VOICE && messageData.attachment && (
                                    <TouchableOpacity
                                        style={[styles.voiceMessage, {
                                            backgroundColor: isOwnMessage ? 'rgba(255,255,255,0.15)' : colors.background
                                        }]}
                                        onPress={() => onPlayVoice(messageData.attachment.uri, discussion._id)}
                                        activeOpacity={0.8}
                                    >
                                        <View style={[
                                            styles.voicePlayButton,
                                            { backgroundColor: isOwnMessage ? 'rgba(255,255,255,0.25)' : premiumColors.primary.main + '20' }
                                        ]}>
                                            <Ionicons
                                                name={playingVoice === discussion._id ? "pause" : "play"}
                                                size={20}
                                                color={isOwnMessage ? '#FFFFFF' : premiumColors.primary.main}
                                            />
                                        </View>
                                        <View style={styles.voiceWaveform}>
                                            {[...Array(20)].map((_, i) => (
                                                <Animated.View
                                                    key={i}
                                                    style={[
                                                        styles.voiceBar,
                                                        {
                                                            height: Math.random() * 16 + 6, // In real app, this would be based on actual audio peaks
                                                            backgroundColor: isOwnMessage ?
                                                                (i / 20 <= (voiceProgress[discussion._id] || 0) ? '#FFFFFF' : 'rgba(255,255,255,0.4)') :
                                                                (i / 20 <= (voiceProgress[discussion._id] || 0) ? premiumColors.primary.main : colors.border),
                                                        }
                                                    ]}
                                                />
                                            ))}
                                        </View>
                                        <Text style={[styles.voiceDuration, { color: isOwnMessage ? 'rgba(255,255,255,0.8)' : (isDarkMode ? '#E9EDEF' : colors.text) }]}>
                                            {formatDuration(messageData.attachment.duration || 0)}
                                        </Text>
                                    </TouchableOpacity>
                                )}

                                {messageData.type === MESSAGE_TYPES.LINK && messageData.links && (
                                    <TouchableOpacity
                                        style={[styles.linkPreview, {
                                            backgroundColor: isOwnMessage ? 'rgba(255,255,255,0.15)' : colors.background
                                        }]}
                                        onPress={() => Linking.openURL(messageData.links[0])}
                                    >
                                        <View style={[styles.linkIcon, { backgroundColor: premiumColors.accent.sky + '20' }]}>
                                            <Ionicons name="link" size={20} color={premiumColors.accent.sky} />
                                        </View>
                                        <View style={styles.linkInfo}>
                                            <Text style={[styles.linkUrl, { color: isOwnMessage ? '#FFFFFF' : premiumColors.accent.sky }]} numberOfLines={1}>
                                                {messageData.links[0]}
                                            </Text>
                                            <Text style={[styles.linkHint, { color: isOwnMessage ? 'rgba(255,255,255,0.7)' : colors.secondaryText }]}>
                                                Tap to open
                                            </Text>
                                        </View>
                                        <Ionicons name="open-outline" size={18} color={isOwnMessage ? '#FFFFFF' : colors.secondaryText} />
                                    </TouchableOpacity>
                                )}

                                {messageData.message && messageData.type !== MESSAGE_TYPES.VOICE && (
                                    <Text style={[
                                        styles.messageText,
                                        {
                                            color: isDarkMode
                                                ? (isOwnMessage ? '#E9EDEF' : '#E9EDEF')
                                                : (isOwnMessage ? '#111B21' : '#111B21')
                                        }
                                    ]}>
                                        {messageData.message}
                                    </Text>
                                )}

                                {(messageData.type !== MESSAGE_TYPES.IMAGE || messageData.message) && (
                                    <View style={styles.messageFooter}>
                                        <Text style={[styles.messageTime, {
                                            color: isDarkMode
                                                ? (isOwnMessage ? 'rgba(255,255,255,0.6)' : '#8696A0')
                                                : (isOwnMessage ? '#667781' : '#667781')
                                        }]}>
                                            {formatTimeAgo(discussion.createdAt)}
                                        </Text>
                                        {isOwnMessage && (
                                            <Ionicons name="checkmark-done" size={14} color="#53BDEB" style={{ marginLeft: 4 }} />
                                        )}
                                    </View>
                                )}
                            </View>
                        </TouchableOpacity>
                    </View>
                </TapGestureHandler>
            </Swipeable>

            {reactions.length > 0 && (
                <View style={[
                    styles.reactionsContainer,
                    isOwnMessage ? styles.ownReactions : styles.otherReactions,
                ]}>
                    {reactions.map((reaction, rIndex) => (
                        <View
                            key={rIndex}
                            style={[
                                styles.reactionBubble,
                                {
                                    backgroundColor: isDarkMode ? 'rgba(30, 30, 40, 0.95)' : 'rgba(255, 255, 255, 0.98)',
                                    borderColor: isDarkMode ? 'rgba(99, 102, 241, 0.3)' : 'rgba(99, 102, 241, 0.15)',
                                    shadowColor: isDarkMode ? '#6366F1' : '#000',
                                }
                            ]}
                        >
                            <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
                        </View>
                    ))}
                </View>
            )}

            {showReactionPicker === index && (
                <Animated.View
                    style={[
                        styles.reactionPicker,
                        {
                            backgroundColor: colors.card,
                            borderColor: colors.border,
                            opacity: reactionPickerAnim,
                            transform: [{ scale: reactionPickerAnim }],
                        },
                        premiumShadows.lg,
                        isOwnMessage ? styles.ownReactionPicker : styles.otherReactionPicker,
                    ]}
                >
                    {REACTIONS.map((reaction) => (
                        <TouchableOpacity
                            key={reaction.name}
                            style={styles.reactionOption}
                            onPress={() => handleReaction(index, reaction)}
                        >
                            <Text style={styles.reactionOptionEmoji}>{reaction.emoji}</Text>
                        </TouchableOpacity>
                    ))}
                    <TouchableOpacity
                        style={styles.reactionCloseButton}
                        onPress={() => setShowReactionPicker(null)}
                    >
                        <Ionicons name="close" size={16} color={colors.secondaryText} />
                    </TouchableOpacity>
                </Animated.View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    messageWrapper: {
        marginBottom: spacing.sm,
    },
    messageWrapperInside: {
        // Used for TapGestureHandler wrapper
    },
    messageContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginVertical: 1,
    },
    ownMessageContainer: {
        justifyContent: 'flex-end',
        paddingLeft: 60,
    },
    otherMessageContainer: {
        justifyContent: 'flex-start',
        paddingRight: 60,
    },
    messageAvatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
        marginRight: 6,
    },
    messageAvatarPlaceholder: {
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 6,
    },
    messageBubble: {
        maxWidth: width * 0.75,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 18,
        position: 'relative',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    imageBubble: {
        padding: 0,
        backgroundColor: 'transparent',
        borderWidth: 0,
        shadowColor: 'transparent',
        shadowOpacity: 0,
        elevation: 0,
        overflow: 'visible',
    },
    ownMessageBubble: {
        borderTopLeftRadius: 18,
        borderTopRightRadius: 18,
        borderBottomLeftRadius: 18,
        borderBottomRightRadius: 6,
    },
    otherMessageBubble: {
        borderTopLeftRadius: 18,
        borderTopRightRadius: 18,
        borderBottomLeftRadius: 6,
        borderBottomRightRadius: 18,
    },
    messageAuthor: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 4,
    },
    messageText: {
        fontSize: 16,
        lineHeight: 21,
        letterSpacing: -0.3,
    },
    messageFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginTop: 4,
    },
    messageTime: {
        fontSize: 11,
        fontWeight: '400',
    },
    replyPreview: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 4,
        borderLeftWidth: 4,
        marginBottom: 6,
    },
    replyAuthor: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 2,
    },
    replyText: {
        fontSize: 13,
    },
    imageAttachment: {
        borderRadius: 16,
        overflow: 'hidden',
        position: 'relative',
        minWidth: width * 0.5,
        maxWidth: width * 0.7,
    },
    attachedImage: {
        width: width * 0.65,
        height: width * 0.85,
        borderRadius: 16,
    },
    telegramImageTimePill: {
        position: 'absolute',
        bottom: 6,
        right: 6,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
        minWidth: 40,
        justifyContent: 'center',
    },
    telegramImageTimeText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '500',
    },
    whatsappDateSeparator: {
        alignItems: 'center',
        marginVertical: 16,
    },
    whatsappDateBubble: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 10,
        overflow: 'hidden',
    },
    whatsappDateText: {
        fontSize: 12,
        fontWeight: '500',
    },
    whatsappDocContainer: {
        width: width * 0.7,
    },
    whatsappDocCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderRadius: 10,
        gap: 12,
    },
    whatsappDocIconWrapper: {
        width: 48,
        height: 48,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    whatsappDocExtBadge: {
        position: 'absolute',
        bottom: -4,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 4,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
    },
    whatsappDocExtText: {
        fontSize: 8,
        fontWeight: '800',
        color: '#000000',
    },
    whatsappDocInfo: {
        flex: 1,
    },
    whatsappDocName: {
        fontSize: 14,
        fontWeight: '500',
    },
    whatsappDocMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        gap: 4,
    },
    whatsappDocSize: {
        fontSize: 11,
        color: '#8696A0',
    },
    whatsappDocDot: {
        fontSize: 11,
        color: '#8696A0',
    },
    whatsappDocType: {
        fontSize: 11,
        color: '#8696A0',
    },
    whatsappDocDownload: {
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    whatsappDocCaption: {
        fontSize: 14,
        marginTop: 6,
        paddingHorizontal: 4,
    },
    voiceMessage: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderRadius: 16,
        minWidth: width * 0.55,
        gap: 10,
    },
    voicePlayButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    voiceWaveform: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        height: 28,
        gap: 2,
    },
    voiceBar: {
        width: 3,
        borderRadius: 2,
    },
    voiceDuration: {
        fontSize: 12,
        fontWeight: '500',
        minWidth: 35,
        textAlign: 'right',
    },
    linkPreview: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderRadius: 10,
        gap: 10,
        marginVertical: 4,
    },
    linkIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    linkInfo: {
        flex: 1,
    },
    linkUrl: {
        fontSize: 14,
        fontWeight: '500',
    },
    linkHint: {
        fontSize: 12,
    },
    reactionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: -8,
        zIndex: 10,
    },
    ownReactions: {
        justifyContent: 'flex-end',
        marginRight: 6,
    },
    otherReactions: {
        justifyContent: 'flex-start',
        marginLeft: 34,
    },
    reactionBubble: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        marginRight: 4,
        marginBottom: 4,
        elevation: 2,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
    },
    reactionEmoji: {
        fontSize: 14,
    },
    reactionPicker: {
        position: 'absolute',
        top: -50,
        flexDirection: 'row',
        padding: 8,
        borderRadius: 30,
        borderWidth: 1,
        alignItems: 'center',
        zIndex: 1000,
    },
    ownReactionPicker: {
        right: 20,
    },
    otherReactionPicker: {
        left: 20,
    },
    reactionOption: {
        paddingHorizontal: 8,
    },
    reactionOptionEmoji: {
        fontSize: 22,
    },
    reactionCloseButton: {
        marginLeft: 8,
        padding: 4,
    },
    doubleTapHeart: {
        position: 'absolute',
        alignSelf: 'center',
        top: '30%',
        zIndex: 1000,
    },
    doubleTapHeartEmoji: {
        fontSize: 60,
    },
    swipeReplyContainer: {
        width: 80,
        justifyContent: 'center',
        alignItems: 'flex-end',
        paddingRight: 20,
    },
    swipeReplyIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    swipeDeleteContainer: {
        width: 80,
        justifyContent: 'center',
        alignItems: 'flex-start',
        paddingLeft: 20,
        height: '100%',
    },
    swipeDeleteIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FF3B30',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default MessageBubble;
