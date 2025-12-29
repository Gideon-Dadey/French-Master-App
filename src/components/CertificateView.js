import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Share,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { spacing, fontSize } from '../utils/responsive';

const { width } = Dimensions.get('window');

export default function CertificateView({ course, userName, completionDate, onClose }) {
  const { isDarkMode } = useTheme();

  // L'Alliance Theme
  const bgColor = '#0D1B2A';
  const textColor = '#F0EBE3';
  const subTextColor = '#A8B4C4';
  const goldColor = '#C9A227';
  const accentColor = '#1E3A5F';

  const certificateRef = React.useRef();

  const handleShare = async () => {
    try {
      const shareMessage = `I've completed the course "${course?.title || 'Course'}" on L'Alliance! 🎓`;
      await Share.share({
        message: shareMessage,
        title: 'Certificate of Completion',
      });
    } catch (error) {
      console.error('Error sharing certificate:', error);
      Alert.alert('Error', 'Unable to share certificate. Please try again.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={[styles.header, { borderBottomColor: accentColor + '40' }]}>
        <Text style={[styles.headerTitle, { color: textColor }]}>Course Completion</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={textColor} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View ref={certificateRef} collapsable={false} style={[styles.certificate, { shadowColor: goldColor }]}>
          <LinearGradient
            colors={['#102A43', '#0D1B2A', '#020D19']}
            style={styles.certificateGradient}
          >
            {/* Border */}
            <View style={[styles.innerBorder, { borderColor: goldColor + '40' }]} />

            <View style={styles.decorativeTop}>
              <Ionicons name="school" size={70} color={goldColor + '20'} />
            </View>

            <View style={styles.certificateContent}>
              <Text style={[styles.certificateTitle, { color: goldColor }]}>CERTIFICATE</Text>
              <Text style={[styles.certificateSubtitleText, { color: textColor }]}>OF COMPLETION</Text>

              <View style={[styles.divider, { backgroundColor: goldColor }]} />

              <Text style={[styles.presentedTo, { color: subTextColor }]}>This certificate is proudly presented to</Text>
              <Text style={[styles.userName, { color: textColor }]}>{userName}</Text>

              <Text style={[styles.hasCompleted, { color: subTextColor }]}>
                for successfully completing the masterclass
              </Text>
              <Text style={[styles.courseName, { color: goldColor }]}>{course?.title || 'French Masterclass'}</Text>

              <View style={[styles.dateArea, { borderTopColor: goldColor + '30' }]}>
                <Text style={[styles.dateText, { color: subTextColor }]}>
                  Issued on {completionDate ? new Date(completionDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Text>
              </View>
            </View>

            <View style={styles.decorativeBottom}>
              <Ionicons name="ribbon" size={60} color={goldColor + '20'} />
            </View>

            <View style={styles.sealContainer}>
              <View style={[styles.seal, { borderColor: goldColor }]}>
                <Ionicons name="shield-checkmark" size={32} color={goldColor} />
              </View>
              <Text style={[styles.certifiedText, { color: goldColor }]}>L'ALLIANCE CERTIFIED</Text>
            </View>
          </LinearGradient>
        </View>
      </ScrollView>

      <View style={[styles.actions, { backgroundColor: bgColor, borderTopColor: accentColor + '40' }]}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: goldColor }]}
          onPress={handleShare}
        >
          <Ionicons name="share-social" size={20} color="#1A2332" />
          <Text style={[styles.actionButtonText, { color: '#1A2332' }]}>Share with Friends</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.closeActionBtn, { borderColor: goldColor + '40' }]}
          onPress={onClose}
        >
          <Text style={[styles.closeActionText, { color: goldColor }]}>Back to Course</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  certificate: {
    width: width - 40,
    minHeight: width * 1.4,
    borderRadius: 24,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 15,
  },
  certificateGradient: {
    flex: 1,
    padding: 30,
    alignItems: 'center',
  },
  innerBorder: {
    position: 'absolute',
    top: 15,
    left: 15,
    right: 15,
    bottom: 15,
    borderWidth: 1,
    borderRadius: 15,
  },
  decorativeTop: {
    marginTop: 20,
    marginBottom: 40,
  },
  certificateContent: {
    flex: 1,
    alignItems: 'center',
    width: '100%',
  },
  certificateTitle: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 6,
  },
  certificateSubtitleText: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 3,
    marginTop: 4,
  },
  divider: {
    width: 60,
    height: 3,
    marginVertical: 40,
  },
  presentedTo: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  userName: {
    fontSize: 30,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 40,
  },
  hasCompleted: {
    fontSize: 14,
    marginBottom: 12,
  },
  courseName: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 10,
  },
  dateArea: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
  },
  dateText: {
    fontSize: 13,
  },
  decorativeBottom: {
    position: 'absolute',
    bottom: 80,
    right: 30,
  },
  sealContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  seal: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    backgroundColor: 'rgba(201, 162, 39, 0.1)',
  },
  certifiedText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  actions: {
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 10,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  closeActionBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  closeActionText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

