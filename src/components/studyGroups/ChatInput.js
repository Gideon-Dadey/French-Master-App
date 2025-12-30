import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Image,
    ActivityIndicator,
    Animated,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { premiumColors } from '../../utils/premiumDesign';

const ChatInput = ({
    discussionMessage,
    setDiscussionMessage,
    replyingTo,
    cancelReply,
    selectedImage,
    selectedDocument,
    cancelAttachment,
    isDarkMode,
    colors,
    insets,
    keyboardVisible,
    showEmojiPicker,
    setShowEmojiPicker,
    showAttachmentMenu,
    setShowAttachmentMenu,
    handleSendMessage,
    sendingMessage,
    isRecording,
    startRecording,
    sendVoiceMessage,
    recordingAnimRef,
}) => {
    return (
        <View style={styles.inputStickyContainer}>
            {replyingTo && (
                <View style={[
                    styles.proAttachmentContainer,
                    { backgroundColor: isDarkMode ? '#1E2C3A' : '#FFFFFF' }
                ]}>
                    <View style={[styles.proAttachmentThumb, { backgroundColor: 'rgba(16, 185, 129, 0.1)', justifyContent: 'center', alignItems: 'center' }]}>
                        <Ionicons name="arrow-undo" size={24} color="#10B981" />
                    </View>
                    <View style={styles.proAttachmentInfo}>
                        <Text style={[styles.proAttachmentTitle, { color: '#10B981', fontSize: 13 }]}>
                            Replying to {replyingTo.user?.name || 'Member'}
                        </Text>
                        <Text style={[styles.proAttachmentSubtitle, { color: isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }]} numberOfLines={1}>
                            {(() => {
                                try {
                                    const parsed = JSON.parse(replyingTo.message);
                                    return parsed.message || replyingTo.message;
                                } catch {
                                    return replyingTo.message;
                                }
                            })()}
                        </Text>
                    </View>
                    <TouchableOpacity onPress={cancelReply} style={styles.proAttachmentCloseBtn}>
                        <Ionicons name="close" size={18} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            )}

            {(selectedImage || selectedDocument) && (
                <View style={[
                    styles.proAttachmentContainer,
                    { backgroundColor: isDarkMode ? '#1E2C3A' : '#FFFFFF' }
                ]}>
                    {selectedImage ? (
                        <Image source={{ uri: selectedImage.uri }} style={styles.proAttachmentThumb} resizeMode="cover" />
                    ) : (
                        <View style={[styles.proAttachmentThumb, { backgroundColor: 'rgba(51, 144, 236, 0.1)', justifyContent: 'center', alignItems: 'center' }]}>
                            <Ionicons name="document-text" size={24} color={premiumColors.primary.main} />
                        </View>
                    )}
                    <View style={styles.proAttachmentInfo}>
                        <Text style={[styles.proAttachmentTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                            {selectedImage ? 'Photo attached' : 'Document attached'}
                        </Text>
                        <Text style={[styles.proAttachmentSubtitle, { color: isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)' }]} numberOfLines={1}>
                            {selectedImage ? 'Ready to send' : (selectedDocument.name || 'Ready to send')}
                        </Text>
                    </View>
                    <TouchableOpacity onPress={cancelAttachment} style={styles.proAttachmentCloseBtn}>
                        <Ionicons name="close" size={18} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            )}

            <View style={[
                styles.telegramInputContainer,
                {
                    paddingBottom: keyboardVisible ? 4 : Math.max(insets.bottom, 8),
                }
            ]}>
                <View style={[
                    styles.telegramInputPill,
                    {
                        backgroundColor: isDarkMode ? '#17212B' : '#FFFFFF',
                        borderColor: isDarkMode ? '#2B3945' : '#E8E8E8',
                    }
                ]}>
                    <TouchableOpacity
                        style={styles.telegramEmojiBtn}
                        onPress={() => setShowEmojiPicker(!showEmojiPicker)}
                    >
                        <Ionicons
                            name={showEmojiPicker ? "happy" : "happy-outline"}
                            size={26}
                            color={isDarkMode ? '#6C7883' : '#8E8E93'}
                        />
                    </TouchableOpacity>

                    <TextInput
                        style={[styles.telegramInput, { color: isDarkMode ? '#F5F5F5' : '#000000' }]}
                        placeholder="Message"
                        placeholderTextColor={isDarkMode ? '#6C7883' : '#8E8E93'}
                        value={discussionMessage}
                        onChangeText={setDiscussionMessage}
                        multiline
                        maxLength={1000}
                        selectionColor="#3390EC"
                    />

                    <TouchableOpacity
                        style={styles.telegramAttachBtn}
                        onPress={() => setShowAttachmentMenu(!showAttachmentMenu)}
                    >
                        <Ionicons
                            name="attach"
                            size={26}
                            color={isDarkMode ? '#6C7883' : '#8E8E93'}
                            style={{ transform: [{ rotate: '-45deg' }] }}
                        />
                    </TouchableOpacity>

                    {discussionMessage.trim() || selectedImage || selectedDocument ? (
                        <TouchableOpacity
                            style={styles.telegramSendBtn}
                            onPress={handleSendMessage}
                            disabled={sendingMessage}
                        >
                            {sendingMessage ? (
                                <ActivityIndicator size="small" color="#3390EC" />
                            ) : (
                                <Ionicons name="send" size={24} color="#3390EC" />
                            )}
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={styles.telegramMicBtn}
                            onPress={isRecording ? sendVoiceMessage : startRecording}
                            onLongPress={startRecording}
                        >
                            <Animated.View style={{ transform: [{ scale: isRecording ? recordingAnimRef : 1 }] }}>
                                <Ionicons
                                    name={isRecording ? "stop" : "mic-outline"}
                                    size={26}
                                    color={isRecording ? '#FF3B30' : (isDarkMode ? '#6C7883' : '#8E8E93')}
                                />
                            </Animated.View>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    inputStickyContainer: {
        width: '100%',
    },
    proAttachmentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
        gap: 12,
    },
    proAttachmentThumb: {
        width: 40,
        height: 40,
        borderRadius: 8,
    },
    proAttachmentInfo: {
        flex: 1,
    },
    proAttachmentTitle: {
        fontSize: 14,
        fontWeight: '700',
    },
    proAttachmentSubtitle: {
        fontSize: 12,
        marginTop: 2,
    },
    proAttachmentCloseBtn: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    telegramInputContainer: {
        flexDirection: 'row',
        paddingHorizontal: 8,
        paddingTop: 4,
        width: '100%',
    },
    telegramInputPill: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-end',
        borderRadius: 24,
        borderWidth: 1,
        paddingHorizontal: 4,
        paddingVertical: 4,
    },
    telegramEmojiBtn: {
        padding: 8,
    },
    telegramInput: {
        flex: 1,
        fontSize: 16,
        maxHeight: 120,
        paddingTop: 8,
        paddingBottom: 8,
        paddingHorizontal: 4,
    },
    telegramAttachBtn: {
        padding: 8,
    },
    telegramSendBtn: {
        padding: 8,
        justifyContent: 'center',
    },
    telegramMicBtn: {
        padding: 8,
        justifyContent: 'center',
    },
});

export default ChatInput;
