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
  const { colors } = useTheme();
  const certificateRef = React.useRef();

  const handleShare = async () => {
    try {
      const shareMessage = `I've completed the course "${course?.title || 'Course'}" on French Master GH! 🎓`;
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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Certificate of Completion</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View ref={certificateRef} collapsable={false} style={styles.certificate}>
          <LinearGradient
            colors={['#1E88E5', '#1565C0', '#0D47A1']}
            style={styles.certificateGradient}
          >
            {/* Decorative Elements */}
            <View style={styles.decorativeTop}>
              <Ionicons name="school" size={60} color="rgba(255, 255, 255, 0.2)" />
            </View>

            {/* Certificate Content */}
            <View style={styles.certificateContent}>
              <Text style={styles.certificateTitle}>CERTIFICATE OF COMPLETION</Text>
              <View style={styles.divider} />
              <Text style={styles.certificateSubtitle}>This is to certify that</Text>
              <Text style={styles.userName}>{userName}</Text>
              <Text style={styles.certificateSubtitle}>
                has successfully completed the course
              </Text>
              <Text style={styles.courseName}>{course?.title || 'Course Name'}</Text>
              <View style={styles.divider} />
              <Text style={styles.dateText}>
                {completionDate ? new Date(completionDate).toLocaleDateString('en-US', {
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

            {/* Decorative Bottom */}
            <View style={styles.decorativeBottom}>
              <Ionicons name="trophy" size={40} color="rgba(255, 255, 255, 0.2)" />
            </View>

            {/* Signature Area */}
            <View style={styles.signatureArea}>
              <View style={styles.signature}>
                <View style={styles.signatureLine} />
                <Text style={styles.signatureLabel}>Instructor Signature</Text>
              </View>
              <View style={styles.signature}>
                <View style={styles.signatureLine} />
                <Text style={styles.signatureLabel}>Date</Text>
              </View>
            </View>
          </LinearGradient>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={[styles.actions, { backgroundColor: colors.card }]}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={handleShare}
        >
          <Ionicons name="share-outline" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Share Certificate</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.secondaryBackground, borderColor: colors.border }]}
          onPress={onClose}
        >
          <Text style={[styles.actionButtonText, { color: colors.text }]}>Close</Text>
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
    padding: spacing.lg,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
  },
  closeButton: {
    padding: spacing.xs,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  certificate: {
    width: width - spacing.xl * 2,
    minHeight: 600,
    borderRadius: spacing.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  certificateGradient: {
    flex: 1,
    padding: spacing.xxxl,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  decorativeTop: {
    position: 'absolute',
    top: spacing.xl,
    right: spacing.xl,
    opacity: 0.3,
  },
  decorativeBottom: {
    position: 'absolute',
    bottom: spacing.xl,
    left: spacing.xl,
    opacity: 0.3,
  },
  certificateContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl,
  },
  certificateTitle: {
    fontSize: fontSize.heading,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 4,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  divider: {
    width: '60%',
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginVertical: spacing.xl,
  },
  certificateSubtitle: {
    fontSize: fontSize.lg,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  userName: {
    fontSize: fontSize.heading,
    fontWeight: '700',
    color: '#FFD700',
    textAlign: 'center',
    marginVertical: spacing.lg,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  courseName: {
    fontSize: fontSize.xxl,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  dateText: {
    fontSize: fontSize.md,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: spacing.lg,
  },
  signatureArea: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: spacing.xl,
    paddingTop: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.3)',
  },
  signature: {
    alignItems: 'center',
    width: '40%',
  },
  signatureLine: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginBottom: spacing.sm,
  },
  signatureLabel: {
    fontSize: fontSize.sm,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  actions: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
    borderTopWidth: 1,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: fontSize.md,
    fontWeight: '600',
  },
});

