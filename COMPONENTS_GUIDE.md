# Components Guide - French Master GH

Complete guide to all reusable components in the French Master GH application.

## Table of Contents

1. [UI Components](#ui-components)
2. [Course Components](#course-components)
3. [Navigation Components](#navigation-components)
4. [Form Components](#form-components)
5. [Utility Components](#utility-components)
6. [Premium Components](#premium-components)

---

## UI Components

### TabBarIcon

Custom tab bar icon component with avatar support for Profile tab.

**Location:** `src/components/TabBarIcon.js`

**Props:**
```typescript
{
  focused: boolean;          // Whether tab is active
  route: string;             // Route name ('Home', 'Learn', 'Practice', 'Community', 'Profile')
  color: string;             // Active icon color
  inactiveColor: string;     // Inactive icon color
}
```

**Usage:**
```javascript
<TabBarIcon
  focused={focused}
  route="Home"
  color="#9C27B0"
  inactiveColor="#9E9E9E"
/>
```

**Features:**
- Displays user avatar for Profile tab
- Animated transitions
- Theme-aware colors

---

### Rating

Star rating component with optional numeric display.

**Location:** `src/components/Rating.js`

**Props:**
```typescript
{
  rating: number;            // Rating value (0-5)
  size: number;              // Icon size (default: 16)
  showRating: boolean;       // Show numeric rating (default: false)
}
```

**Usage:**
```javascript
<Rating 
  rating={4.5} 
  size={18} 
  showRating={true} 
/>
```

---

### LoadingSpinner

Loading indicator with optional message.

**Location:** `src/components/LoadingSpinner.js`

**Props:**
```typescript
{
  message?: string;          // Loading message
  size?: 'small' | 'large';  // Spinner size
}
```

**Usage:**
```javascript
<LoadingSpinner message="Loading courses..." />
```

---

### ErrorMessage

Error display component with retry functionality.

**Location:** `src/components/ErrorMessage.js`

**Props:**
```typescript
{
  message: string;           // Error message
  onRetry?: () => void;      // Retry callback
}
```

**Usage:**
```javascript
<ErrorMessage 
  message="Failed to load courses" 
  onRetry={handleRetry} 
/>
```

---

### Divider

Horizontal divider component.

**Location:** `src/components/Divider.js`

**Props:**
```typescript
{
  color?: string;            // Divider color
  thickness?: number;        // Line thickness
  margin?: number;           // Vertical margin
}
```

**Usage:**
```javascript
<Divider color="#E0E0E0" thickness={1} margin={20} />
```

---

### Spacer

Flexible spacing component.

**Location:** `src/components/Spacer.js`

**Props:**
```typescript
{
  size?: number;             // Spacing size
  horizontal?: boolean;      // Horizontal spacing
}
```

**Usage:**
```javascript
<Spacer size={20} />
<Spacer size={10} horizontal />
```

---

## Course Components

### CourseCard

Premium course card component for displaying course information.

**Location:** `src/components/CourseCard.js`

**Props:**
```typescript
{
  course: {
    _id: string;
    title: string;
    description: string;
    thumbnail: string;
    price: number;
    currency: string;
    rating: { average: number; count: number };
    studentsEnrolled: number;
    level: string;
    category: string;
    isFree: boolean;
  };
  onPress: () => void;
  style?: object;
  isHorizontal?: boolean;
  index?: number;
}
```

**Usage:**
```javascript
<CourseCard
  course={course}
  onPress={() => navigation.navigate('CourseDetail', { courseId: course._id })}
  isHorizontal={false}
/>
```

**Features:**
- Premium card design
- Rating display
- Price formatting (GHS)
- Level badge
- Free course indicator
- Theme-aware styling

---

### FeaturedCourseCard

Enhanced course card for featured courses with gradient overlays.

**Location:** `src/components/FeaturedCourseCard.js`

**Props:**
```typescript
{
  course: Course;            // Course object
  onPress: () => void;       // Press handler
  index?: number;            // Index for animations
}
```

**Usage:**
```javascript
<FeaturedCourseCard
  course={featuredCourse}
  onPress={handlePress}
  index={0}
/>
```

**Features:**
- Gradient overlay
- Premium shadows
- Animated entrance
- Enhanced visual design

---

### HorizontalCourseCard

Horizontal layout course card.

**Location:** `src/components/HorizontalCourseCard.js`

**Props:**
```typescript
{
  course: Course;
  onPress: () => void;
  style?: object;
}
```

**Usage:**
```javascript
<HorizontalCourseCard
  course={course}
  onPress={handlePress}
/>
```

---

### WishlistButton

Button to add/remove courses from wishlist.

**Location:** `src/components/WishlistButton.js`

**Props:**
```typescript
{
  courseId: string;          // Course ID
  style?: object;            // Custom styles
}
```

**Usage:**
```javascript
<WishlistButton courseId={course._id} />
```

**Features:**
- Automatic wishlist state management
- Animated icon transitions
- Visual feedback

---

## Navigation Components

### SearchBar

Search input component with autocomplete.

**Location:** `src/components/SearchBar.js`

**Props:**
```typescript
{
  placeholder?: string;
  onSearch: (query: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  value?: string;
  autoFocus?: boolean;
}
```

**Usage:**
```javascript
<SearchBar
  placeholder="Search courses..."
  onSearch={handleSearch}
  value={searchQuery}
/>
```

---

### SearchAutocomplete

Autocomplete dropdown for search.

**Location:** `src/components/SearchAutocomplete.js`

**Props:**
```typescript
{
  suggestions: string[];
  onSelect: (suggestion: string) => void;
  visible: boolean;
}
```

**Usage:**
```javascript
<SearchAutocomplete
  suggestions={searchSuggestions}
  onSelect={handleSelect}
  visible={showAutocomplete}
/>
```

---

## Form Components

### PremiumButton

Premium styled button with gradient support.

**Location:** `src/components/PremiumButton.js`

**Props:**
```typescript
{
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  loading?: boolean;
  disabled?: boolean;
  icon?: string;
  style?: object;
}
```

**Usage:**
```javascript
<PremiumButton
  title="Enroll Now"
  onPress={handleEnroll}
  variant="primary"
  loading={isLoading}
  icon="card"
/>
```

**Features:**
- Gradient backgrounds
- Loading states
- Icon support
- Disabled states
- Premium shadows

---

## Utility Components

### NetworkStatus

Displays network connection status.

**Location:** `src/components/NetworkStatus.js`

**Props:**
```typescript
{
  showWhenConnected?: boolean;  // Show when connected
}
```

**Usage:**
```javascript
<NetworkStatus />
```

---

### ToastNotification

Toast notification container.

**Location:** `src/components/ToastNotification.js`

**Usage:**
```javascript
// Add to App.js
<ToastContainer />

// Use in components
import { useToast } from '../src/components/ToastNotification';

const { showToast } = useToast();
showToast('Success!', 'success');
```

**Types:**
- `success`
- `error`
- `warning`
- `info`

---

### SkeletonLoader

Loading skeleton for content placeholders.

**Location:** `src/components/SkeletonLoader.js`

**Props:**
```typescript
{
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: object;
}
```

**Usage:**
```javascript
<SkeletonLoader width="100%" height={200} borderRadius={12} />
```

---

## Premium Components

### PremiumCard

Premium card container with shadows and borders.

**Location:** `src/components/PremiumCard.js`

**Props:**
```typescript
{
  children: ReactNode;
  style?: object;
  shadow?: 'sm' | 'md' | 'lg';
  padding?: number;
}
```

**Usage:**
```javascript
<PremiumCard shadow="md" padding={20}>
  <Text>Content</Text>
</PremiumCard>
```

---

### PremiumBadge

Premium badge component.

**Location:** `src/components/PremiumBadge.js`

**Props:**
```typescript
{
  text: string;
  variant?: 'primary' | 'success' | 'warning' | 'error';
  icon?: string;
}
```

**Usage:**
```javascript
<PremiumBadge text="Featured" variant="primary" icon="star" />
```

---

### PremiumProgressBar

Animated progress bar component.

**Location:** `src/components/PremiumProgressBar.js`

**Props:**
```typescript
{
  progress: number;          // 0-100
  height?: number;
  color?: string;
  showLabel?: boolean;
  animated?: boolean;
}
```

**Usage:**
```javascript
<PremiumProgressBar
  progress={75}
  height={8}
  showLabel={true}
  animated={true}
/>
```

---

### PremiumStatsCard

Statistics card component.

**Location:** `src/components/PremiumStatsCard.js`

**Props:**
```typescript
{
  title: string;
  value: string | number;
  icon: string;
  color?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}
```

**Usage:**
```javascript
<PremiumStatsCard
  title="Total Courses"
  value={25}
  icon="book"
  color="#9C27B0"
  trend={{ value: 5, isPositive: true }}
/>
```

---

### PremiumEmptyState

Empty state component for empty lists.

**Location:** `src/components/PremiumEmptyState.js`

**Props:**
```typescript
{
  icon: string;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}
```

**Usage:**
```javascript
<PremiumEmptyState
  icon="book-outline"
  title="No Courses"
  message="Start exploring courses"
  actionLabel="Browse Courses"
  onAction={handleBrowse}
/>
```

---

## Gamification Components

### AchievementBadge

Achievement badge display.

**Location:** `src/components/AchievementBadge.js`

**Props:**
```typescript
{
  achievement: {
    id: string;
    name: string;
    description: string;
    icon: string;
    unlocked: boolean;
    unlockedAt?: Date;
  };
  size?: number;
}
```

**Usage:**
```javascript
<AchievementBadge achievement={achievement} size={64} />
```

---

### LearningStreak

Learning streak display component.

**Location:** `src/components/LearningStreak.js`

**Props:**
```typescript
{
  streak: number;
  longestStreak: number;
}
```

**Usage:**
```javascript
<LearningStreak streak={7} longestStreak={15} />
```

---

### DailyChallengeCard

Daily challenge card component.

**Location:** `src/components/DailyChallengeCard.js`

**Props:**
```typescript
{
  challenge: {
    id: string;
    title: string;
    description: string;
    points: number;
    completed: boolean;
  };
  onPress: () => void;
}
```

**Usage:**
```javascript
<DailyChallengeCard
  challenge={dailyChallenge}
  onPress={handleChallenge}
/>
```

---

## Chart Components

### AnalyticsChart

Chart component for analytics display.

**Location:** `src/components/AnalyticsChart.js`

**Props:**
```typescript
{
  data: number[];
  labels: string[];
  type?: 'line' | 'bar' | 'pie';
  color?: string;
}
```

**Usage:**
```javascript
<AnalyticsChart
  data={[10, 20, 30, 40]}
  labels={['Week 1', 'Week 2', 'Week 3', 'Week 4']}
  type="line"
/>
```

---

## Blog Components

### BlogCard

Blog post card component.

**Location:** `src/components/BlogCard.js`

**Props:**
```typescript
{
  post: {
    _id: string;
    title: string;
    excerpt: string;
    thumbnail: string;
    author: { name: string; avatar: string };
    publishedAt: Date;
    views: number;
  };
  onPress: () => void;
}
```

**Usage:**
```javascript
<BlogCard post={blogPost} onPress={handlePress} />
```

---

## Certificate Components

### CertificateView

Certificate display and download component.

**Location:** `src/components/CertificateView.js`

**Props:**
```typescript
{
  course: Course;
  userName: string;
  completionDate: Date;
  onClose: () => void;
}
```

**Usage:**
```javascript
<CertificateView
  course={completedCourse}
  userName="John Doe"
  completionDate={new Date()}
  onClose={() => setShowCertificate(false)}
/>
```

---

## Best Practices

### Component Usage

1. **Import from correct path:**
```javascript
import CourseCard from '../src/components/CourseCard';
```

2. **Use theme context:**
```javascript
const { colors, isDarkMode } = useTheme();
```

3. **Handle loading states:**
```javascript
{loading ? <LoadingSpinner /> : <Content />}
```

4. **Error handling:**
```javascript
{error ? <ErrorMessage message={error} onRetry={retry} /> : <Content />}
```

### Styling

- Use theme colors from `ThemeContext`
- Apply premium shadows from `premiumDesign.js`
- Use responsive spacing from `responsive.js`
- Support both light and dark modes

### Performance

- Use `React.memo` for expensive components
- Implement proper key props for lists
- Lazy load images
- Optimize re-renders with `useMemo` and `useCallback`

---

## Context Providers

### StudentContext

Context provider for admin student management.

**Location:** `src/context/StudentContext.js`

**Hook:** `useStudent()`

**Features:**
- Load and manage all students (admin only)
- View student details
- Update student information
- Delete students
- Pagination support
- Auto-clears when user logs out or is not admin

**State:**
```typescript
{
  students: Array<Student>;
  loading: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | null;
}
```

**Methods:**
```typescript
{
  loadStudents: (params?: { page?: number; limit?: number; search?: string }) => Promise<void>;
  getStudentById: (studentId: string) => Promise<{ success: boolean; data?: Student; message?: string }>;
  updateStudent: (studentId: string, data: Partial<Student>) => Promise<{ success: boolean; data?: Student; message?: string }>;
  deleteStudent: (studentId: string) => Promise<{ success: boolean; message?: string }>;
}
```

**Usage:**
```javascript
import { useStudent } from '../context/StudentContext';

function StudentManagementScreen() {
  const { students, loading, pagination, loadStudents, getStudentById, updateStudent, deleteStudent } = useStudent();

  useEffect(() => {
    loadStudents({ page: 1, limit: 20 });
  }, []);

  const handleUpdateStudent = async (studentId, updates) => {
    const result = await updateStudent(studentId, updates);
    if (result.success) {
      // Student updated successfully
    }
  };

  const handleDeleteStudent = async (studentId) => {
    const result = await deleteStudent(studentId);
    if (result.success) {
      // Student deleted successfully
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <View>
      {students.map(student => (
        <StudentCard key={student._id} student={student} />
      ))}
    </View>
  );
}
```

**Notes:**
- Only available to users with `admin` role
- Automatically clears data when user is not authenticated or not admin
- Silently handles 401 errors
- Auto-refreshes student list after updates/deletions

---

### InstructorStudentContext

Context provider for instructor student management.

**Location:** `src/context/InstructorStudentContext.js`

**Hook:** `useInstructorStudent()`

**Features:**
- Load students enrolled in instructor's courses
- View student details
- Filter by course
- Search functionality
- Pagination support
- Auto-clears when user logs out or is not instructor/admin

**State:**
```typescript
{
  students: Array<Student>;
  loading: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | null;
}
```

**Methods:**
```typescript
{
  loadStudents: (params?: { page?: number; limit?: number; search?: string; courseId?: string }) => Promise<void>;
  getStudentById: (studentId: string) => Promise<{ success: boolean; data?: Student; message?: string }>;
}
```

**Usage:**
```javascript
import { useInstructorStudent } from '../context/InstructorStudentContext';

function InstructorStudentsScreen() {
  const { students, loading, pagination, loadStudents, getStudentById } = useInstructorStudent();

  useEffect(() => {
    loadStudents({ page: 1, limit: 20 });
  }, []);

  const handleSearchStudents = (searchText) => {
    loadStudents({ search: searchText });
  };

  const handleFilterByCourse = (courseId) => {
    loadStudents({ courseId });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <View>
      <SearchBar onSearch={handleSearchStudents} />
      {students.map(student => (
        <StudentCard key={student._id} student={student} />
      ))}
    </View>
  );
}
```

**Notes:**
- Available to users with `instructor` or `admin` role
- Only shows students enrolled in instructor's courses
- Automatically clears data when user is not authenticated or not instructor
- Silently handles 401 errors
- Read-only access (instructors cannot modify student data)

---

**Last Updated:** January 2025

