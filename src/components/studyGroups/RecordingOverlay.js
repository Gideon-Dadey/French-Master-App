import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { formatDuration } from '../../utils/chatUtils';

const RecordingOverlay = ({
    recordingDuration,
    cancelRecording,
    sendVoiceMessage,
    recordingAnimRef,
}) => {
    return (
        <View style={styles.recordingOverlay}>
            <LinearGradient
                colors={['rgba(255,59,48,0.95)', 'rgba(255,45,85,0.95)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.recordingOverlayGradient}
            >
                <TouchableOpacity
                    style={styles.recordingCancelBtn}
                    onPress={cancelRecording}
                >
                    <Ionicons name="trash-outline" size={22} color="#FFFFFF" />
                </TouchableOpacity>

                <View style={styles.recordingCenter}>
                    <View style={styles.recordingWaveform}>
                        {[...Array(12)].map((_, i) => (
                            <Animated.View
                                key={i}
                                style={[
                                    styles.recordingWaveBar,
                                    {
                                        height: Math.sin((i + recordingDuration) * 0.5) * 12 + 8,
                                        opacity: 0.6 + Math.sin((i + recordingDuration * 2) * 0.3) * 0.4,
                                    }
                                ]}
                            />
                        ))}
                    </View>

                    <View style={styles.recordingTimerContainer}>
                        <Animated.View style={[
                            styles.recordingPulseDot,
                            { transform: [{ scale: recordingAnimRef }] }
                        ]} />
                        <Text style={styles.recordingTimer}>
                            {formatDuration(recordingDuration)}
                        </Text>
                    </View>

                    <Text style={styles.recordingHint}>
                        Tap send to finish
                    </Text>
                </View>

                <TouchableOpacity
                    style={styles.recordingSendBtn}
                    onPress={sendVoiceMessage}
                >
                    <View style={styles.recordingSendBtnInner}>
                        <Ionicons name="arrow-up" size={22} color="#FF3B30" />
                    </View>
                </TouchableOpacity>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    recordingOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
    },
    recordingOverlayGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        minHeight: 80,
    },
    recordingCancelBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    recordingCenter: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
    },
    recordingWaveform: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 20,
        gap: 3,
        marginBottom: 4,
    },
    recordingWaveBar: {
        width: 3,
        backgroundColor: '#FFFFFF',
        borderRadius: 2,
    },
    recordingTimerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    recordingPulseDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FFFFFF',
    },
    recordingTimer: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    recordingHint: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 11,
        marginTop: 2,
    },
    recordingSendBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    recordingSendBtnInner: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default RecordingOverlay;
