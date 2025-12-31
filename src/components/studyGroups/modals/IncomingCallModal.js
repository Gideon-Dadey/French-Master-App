import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { premiumShadows } from '../../../utils/premiumDesign';

export default function IncomingCallModal({
    visible,
    incomingCall,
    group,
    onAccept,
    onReject
}) {
    if (!visible || !incomingCall) return null;

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.incomingCallOverlay}>
                <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
                <View style={styles.incomingCallContent}>
                    <LinearGradient
                        colors={['#667eea', '#764ba2']}
                        style={styles.incomingCallAvatar}
                    >
                        <Ionicons name="call" size={40} color="#FFF" />
                    </LinearGradient>

                    <Text style={styles.incomingCallTitle}>Incoming {incomingCall?.type} Call</Text>
                    <Text style={styles.incomingCallName}>{incomingCall?.callerName}</Text>
                    <Text style={styles.incomingCallGroup}>{group?.name}</Text>

                    <View style={styles.incomingCallActions}>
                        <TouchableOpacity
                            style={[styles.callActionBtn, { backgroundColor: '#FF3B30' }]}
                            onPress={onReject}
                        >
                            <Ionicons name="close" size={30} color="#FFF" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.callActionBtn, { backgroundColor: '#4CD964' }]}
                            onPress={onAccept}
                        >
                            <Ionicons name="checkmark" size={30} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    incomingCallOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    incomingCallContent: {
        width: '80%',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 30,
        padding: 30,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    incomingCallAvatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    incomingCallTitle: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 14,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 10,
    },
    incomingCallName: {
        color: '#FFF',
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 5,
    },
    incomingCallGroup: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 16,
        marginBottom: 30,
    },
    incomingCallActions: {
        flexDirection: 'row',
        gap: 40,
    },
    callActionBtn: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        ...premiumShadows.md,
    },
});
