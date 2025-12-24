import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useInstructorStudent } from '../src/context/InstructorStudentContext';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';
import LoadingSpinner from '../src/components/LoadingSpinner';
import { spacing, fontSize } from '../src/utils/responsive';
import { premiumColors, premiumShadows, premiumBorderRadius } from '../src/utils/premiumDesign';
import { formatDate } from '../src/utils/helpers';

const { width } = Dimensions.get('window');

export default function StudentManagementScreen({ navigation }) {
  const { students, loading, pagination, loadStudents, getStudentById } = useInstructorStudent();
  const { isAuthenticated, user } = useAuth();
  const { colors, isDarkMode } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTimeout, setSearchTimeout] = useState(null);

  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    const timeout = setTimeout(() => {
      loadStudents({ search: searchQuery, page: 1 });
    }, 500);
    setSearchTimeout(timeout);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStudents({ search: searchQuery });
    setRefreshing(false);
  };

  const handleStudentPress = async (student) => {
    navigation.navigate('StudentDetail', { studentId: student._id });
  };

  if (!isAuthenticated || (user?.role !== 'instructor' && user?.role !== 'admin')) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.emptyContainer}>
          <Ionicons name="school-outline" size={80} color={colors.secondaryText} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Access Restricted</Text>
          <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
            This feature is only available for instructors
          </Text>
          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: premiumColors.primary.main }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.loginButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (loading && !refreshing && students.length === 0) {
    return <LoadingSpinner message="Loading students..." />;
  }

  const totalStudents = pagination?.total || students.length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Student Management</Text>
            <Text style={[styles.headerSubtitle, { color: colors.secondaryText }]}>
              {totalStudents} {totalStudents === 1 ? 'student' : 'students'} enrolled
            </Text>
          </View>
        </View>
        <View style={[styles.searchContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <Ionicons name="search" size={20} color={colors.secondaryText} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search students by name or email..."
            placeholderTextColor={colors.secondaryText}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.secondaryText} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {students.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={80} color={colors.secondaryText} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No students found</Text>
            <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
              {searchQuery ? 'Try a different search term' : 'Students enrolled in your courses will appear here'}
            </Text>
          </View>
        ) : (
          <View style={styles.studentsList}>
            {students.map((student) => {
              const enrolledCourses = student.enrolledCourses?.filter(ec => ec.course) || [];
              const totalCourses = enrolledCourses.length;
              
              return (
                <TouchableOpacity
                  key={student._id}
                  style={[styles.studentCard, { backgroundColor: colors.card, borderColor: colors.border }, premiumShadows.sm]}
                  onPress={() => handleStudentPress(student)}
                  activeOpacity={0.7}
                >
                  <View style={styles.studentHeader}>
                    <View style={[styles.avatar, { backgroundColor: premiumColors.primary.main + '20' }]}>
                      <Text style={[styles.avatarText, { color: premiumColors.primary.main }]}>
                        {student.name?.charAt(0)?.toUpperCase() || 'S'}
                      </Text>
                    </View>
                    <View style={styles.studentInfo}>
                      <Text style={[styles.studentName, { color: colors.text }]}>{student.name}</Text>
                      <Text style={[styles.studentEmail, { color: colors.secondaryText }]}>{student.email}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
                  </View>

                  {totalCourses > 0 && (
                    <View style={[styles.studentDetails, { borderTopColor: colors.border }]}>
                      <View style={styles.detailRow}>
                        <Ionicons name="book-outline" size={16} color={colors.secondaryText} />
                        <Text style={[styles.detailText, { color: colors.secondaryText }]}>
                          {totalCourses} {totalCourses === 1 ? 'course' : 'courses'} enrolled
                        </Text>
                      </View>
                      {student.createdAt && (
                        <View style={styles.detailRow}>
                          <Ionicons name="calendar-outline" size={16} color={colors.secondaryText} />
                          <Text style={[styles.detailText, { color: colors.secondaryText }]}>
                            Joined {formatDate(student.createdAt)}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  backButton: {
    marginRight: spacing.md,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    marginBottom: spacing.xs / 2,
  },
  headerSubtitle: {
    fontSize: fontSize.sm,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: premiumBorderRadius.lg,
    borderWidth: 1,
    marginTop: spacing.sm,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.md,
    paddingVertical: spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  studentsList: {
    padding: spacing.lg,
  },
  studentCard: {
    borderRadius: premiumBorderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
  },
  studentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: fontSize.xl,
    fontWeight: '700',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: fontSize.md,
    fontWeight: '600',
    marginBottom: spacing.xs / 2,
  },
  studentEmail: {
    fontSize: fontSize.sm,
  },
  studentDetails: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  detailText: {
    fontSize: fontSize.sm,
    marginLeft: spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxxl,
    minHeight: 400,
  },
  emptyTitle: {
    fontSize: fontSize.xxl,
    fontWeight: '600',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: fontSize.md,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  loginButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: premiumBorderRadius.lg,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: fontSize.md,
    fontWeight: '600',
  },
});

