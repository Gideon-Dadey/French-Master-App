import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { spacing, fontSize, normalize } from '../utils/responsive';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Category Detail Modal
 * Displays category information and descriptions
 */
export default function CategoryDetailModal({ visible, category, onClose }) {
  const { colors } = useTheme();

  if (!category) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          {/* Header */}
          <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
            <View style={styles.headerContent}>
              <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name={category.icon} size={24} color={colors.primary} />
              </View>
              <View style={styles.headerText}>
                <Text style={[styles.categoryTitle, { color: colors.text }]}>
                  {category.name}
                </Text>
                <Text style={[styles.categorySubtitle, { color: colors.secondaryText }]}>
                  {category.descriptions?.length || 0} Learning Topics
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: colors.tertiaryBackground || colors.border }]}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Description */}
            {category.fullDescription && (
              <View style={[styles.descriptionSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.descriptionTitle, { color: colors.text }]}>
                  About {category.name}
                </Text>
                <Text style={[styles.descriptionText, { color: colors.secondaryText }]}>
                  {category.fullDescription}
                </Text>
              </View>
            )}

            {/* Descriptions List */}
            {category.descriptions && category.descriptions.length > 0 && (
              <View style={styles.descriptionsSection}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  What You'll Learn
                </Text>
                {category.descriptions.map((item, index) => (
                  <View
                    key={index}
                    style={[styles.descriptionItem, { backgroundColor: colors.card, borderColor: colors.border }]}
                  >
                    <View style={[styles.itemNumber, { backgroundColor: colors.primary + '20' }]}>
                      <Text style={[styles.itemNumberText, { color: colors.primary }]}>
                        {index + 1}
                      </Text>
                    </View>
                    <View style={styles.itemContent}>
                      <Text style={[styles.itemTitle, { color: colors.text }]}>
                        {item.title}
                      </Text>
                      {item.description && (
                        <Text style={[styles.itemDescription, { color: colors.secondaryText }]}>
                          {item.description}
                        </Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Footer Button */}
            <TouchableOpacity
              style={[styles.exploreButton, { backgroundColor: colors.primary }]}
              onPress={() => {
                if (onExplore) {
                  onExplore();
                }
                onClose();
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.exploreButtonText}>Explore {category.name} Courses</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    height: SCREEN_HEIGHT * 0.9,
    borderTopLeftRadius: normalize(24),
    borderTopRightRadius: normalize(24),
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: normalize(48),
    height: normalize(48),
    borderRadius: normalize(24),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  headerText: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    letterSpacing: -0.3,
    marginBottom: normalize(4),
  },
  categorySubtitle: {
    fontSize: fontSize.sm,
    fontWeight: '400',
  },
  closeButton: {
    width: normalize(40),
    height: normalize(40),
    borderRadius: normalize(20),
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.md,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  descriptionSection: {
    padding: spacing.lg,
    borderRadius: normalize(12),
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: spacing.lg,
  },
  descriptionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginBottom: spacing.md,
    letterSpacing: -0.2,
  },
  descriptionText: {
    fontSize: fontSize.md,
    lineHeight: normalize(24),
    letterSpacing: -0.1,
  },
  descriptionsSection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    marginBottom: spacing.md,
    letterSpacing: -0.3,
  },
  descriptionItem: {
    flexDirection: 'row',
    padding: spacing.md,
    borderRadius: normalize(12),
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: spacing.md,
  },
  itemNumber: {
    width: normalize(32),
    height: normalize(32),
    borderRadius: normalize(16),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    flexShrink: 0,
  },
  itemNumberText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    marginBottom: spacing.xs,
    letterSpacing: -0.2,
  },
  itemDescription: {
    fontSize: fontSize.sm,
    lineHeight: normalize(20),
    letterSpacing: -0.1,
  },
  exploreButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: normalize(12),
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontSize: fontSize.md,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
});

