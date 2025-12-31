import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function VoiceCallModal({
    visible,
    group,
    callDuration,
    memberCount,
    isMuted,
    isSpeakerOn,
    toggleMute,
    toggleSpeaker,
    endCall,
    formatCallDuration,
    callPulseAnim
}) {
    if (!visible) return null;

    return (
        <Modal visible={visible} animationType="fade" statusBarTranslucent>
            <LinearGradient
                colors={['#667eea', '#764ba2', '#6B8DD6']}
                style={styles.callBackground}
            >
                <View style={styles.voiceCallContainer}>
                    <Animated.View style={[styles.callAvatarContainer, { transform: [{ scale: callPulseAnim }] }]}>
                        <LinearGradient colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']} style={styles.callAvatarRing}>
                            <View style={styles.callAvatar}>
                                <Ionicons name="people" size={50} color="#FFFFFF" />
                            </View>
                        </LinearGradient>
                    </Animated.View>
                    <Text style={styles.callGroupName}>{group?.name}</Text>
                    <Text style={styles.callStatus}>
                        {callDuration > 0 ? formatCallDuration(callDuration) : 'Connecting...'}
                    </Text>
                    <View style={styles.callParticipants}>
                        <Text style={styles.callParticipantsText}>{memberCount} participants</Text>
                    </View>
                </View>

                <View style={styles.callControls}>
                    <View style={styles.callControlsRow}>
                        <TouchableOpacity style={[styles.callControlBtn, isMuted && styles.callControlBtnActive]} onPress={toggleMute}>
                            <Ionicons name={isMuted ? "mic-off" : "mic"} size={26} color="#FFFFFF" />
                            <Text style={styles.callControlLabel}>{isMuted ? 'Unmute' : 'Mute'}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.callControlBtn, isSpeakerOn && styles.callControlBtnActive]} onPress={toggleSpeaker}>
                            <Ionicons name={isSpeakerOn ? "volume-high" : "volume-medium"} size={26} color="#FFFFFF" />
                            <Text style={styles.callControlLabel}>{isSpeakerOn ? 'Speaker' : 'Phone'}</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.endCallBtn} onPress={endCall}>
                        <LinearGradient colors={['#FF3B30', '#FF453A']} style={styles.endCallBtnGradient}>
                            <Ionicons name="call" size={30} color="#FFFFFF" style={{ transform: [{ rotate: '135deg' }] }} />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        </Modal>
    );
}

const styles = StyleSheet.create({
    callBackground: {
        flex: 1,
        paddingTop: 60,
    },
    voiceCallContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 100,
    },
    callAvatarContainer: {
        marginBottom: 24,
    },
    callAvatarRing: {
        width: 150,
        height: 150,
        borderRadius: 75,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 6,
    },
    callAvatar: {
        width: 130,
        height: 130,
        borderRadius: 65,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    callGroupName: {
        fontSize: 28,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 8,
        textAlign: 'center',
    },
    callStatus: {
        fontSize: 18,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 16,
    },
    callParticipants: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    callParticipantsText: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
    },
    callControls: {
        paddingHorizontal: 20,
        paddingBottom: 50,
    },
    callControlsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 30,
        gap: 20,
    },
    callControlBtn: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'rgba(255,255,255,0.15)',
    },
    callControlBtnActive: {
        backgroundColor: 'rgba(255,255,255,0.3)',
    },
    callControlLabel: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.9)',
        marginTop: 4,
    },
    endCallBtn: {
        alignSelf: 'center',
    },
    endCallBtnGradient: {
        width: 70,
        height: 70,
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#FF3B30',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 8,
    },
});
