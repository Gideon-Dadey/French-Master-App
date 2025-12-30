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

const AttachmentMenu = ({
    colors,
    attachmentMenuAnim,
    pickImage,
    takePhoto,
    pickDocument,
    setShowAttachmentMenu,
    startRecording,
}) => {
    return (
        <Animated.View
            style={[
                styles.attachmentMenu,
                {
                    backgroundColor: colors.card,
                    borderTopColor: colors.border,
                    opacity: attachmentMenuAnim,
                    transform: [{
                        translateY: attachmentMenuAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [50, 0],
                        }),
                    }],
                },
            ]}
        >
            <TouchableOpacity style={styles.attachmentOption} onPress={pickImage}>
                <LinearGradient
                    colors={['#9C27B0', '#7B1FA2']}
                    style={styles.attachmentIconGradient}
                >
                    <Ionicons name="images" size={24} color="#FFFFFF" />
                </LinearGradient>
                <Text style={[styles.attachmentLabel, { color: colors.text }]}>Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.attachmentOption} onPress={takePhoto}>
                <LinearGradient
                    colors={['#E91E63', '#C2185B']}
                    style={styles.attachmentIconGradient}
                >
                    <Ionicons name="camera" size={24} color="#FFFFFF" />
                </LinearGradient>
                <Text style={[styles.attachmentLabel, { color: colors.text }]}>Camera</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.attachmentOption} onPress={pickDocument}>
                <LinearGradient
                    colors={['#3F51B5', '#303F9F']}
                    style={styles.attachmentIconGradient}
                >
                    <Ionicons name="document" size={24} color="#FFFFFF" />
                </LinearGradient>
                <Text style={[styles.attachmentLabel, { color: colors.text }]}>Document</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.attachmentOption}>
                <LinearGradient
                    colors={['#00BCD4', '#0097A7']}
                    style={styles.attachmentIconGradient}
                >
                    <Ionicons name="link" size={24} color="#FFFFFF" />
                </LinearGradient>
                <Text style={[styles.attachmentLabel, { color: colors.text }]}>Link</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.attachmentOption} onPress={() => { setShowAttachmentMenu(false); startRecording(); }}>
                <LinearGradient
                    colors={['#FF5722', '#E64A19']}
                    style={styles.attachmentIconGradient}
                >
                    <Ionicons name="mic" size={24} color="#FFFFFF" />
                </LinearGradient>
                <Text style={[styles.attachmentLabel, { color: colors.text }]}>Voice</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.attachmentOption}>
                <LinearGradient
                    colors={['#4CAF50', '#388E3C']}
                    style={styles.attachmentIconGradient}
                >
                    <Ionicons name="location" size={24} color="#FFFFFF" />
                </LinearGradient>
                <Text style={[styles.attachmentLabel, { color: colors.text }]}>Location</Text>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    attachmentMenu: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderTopWidth: 1,
    },
    attachmentOption: {
        width: '33.33%',
        alignItems: 'center',
        marginBottom: 20,
    },
    attachmentIconGradient: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    attachmentLabel: {
        fontSize: 12,
        fontWeight: '500',
    },
});

export default AttachmentMenu;
