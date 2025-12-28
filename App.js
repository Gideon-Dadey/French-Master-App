import React, { useEffect, useRef } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Platform } from 'react-native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { WishlistProvider } from './src/context/WishlistContext';
import { StudentProvider } from './src/context/StudentContext';
import { InstructorStudentProvider } from './src/context/InstructorStudentContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { GamificationProvider } from './src/context/GamificationContext';
import { CurrencyProvider } from './src/context/CurrencyContext';
import NetworkStatus from './src/components/NetworkStatus';
import TabBarIcon from './src/components/TabBarIcon';
import CustomTabBar from './src/components/CustomTabBar';
import ToastContainer from './src/components/ToastNotification';

// Screens
import LandingScreen from './screens/LandingScreen';
import LearnerHomeScreen from './screens/LearnerHomeScreen';
import LearnScreen from './screens/LearnScreen';
import PracticeScreen from './screens/PracticeScreen';
import CommunityScreen from './screens/CommunityScreen';
// Legacy screens - kept for backward compatibility
import HomeScreen from './screens/HomeScreen';
import CoursesScreen from './screens/CoursesScreen';
import ResourcesScreen from './screens/ResourcesScreen';
import LoginScreen from './screens/Auth/LoginScreen';
import RegisterScreen from './screens/Auth/RegisterScreen';
import CourseDetailScreen from './screens/CourseDetailScreen';
import MyCoursesScreen from './screens/MyCoursesScreen';
import LessonScreen from './screens/LessonScreen';
import ProfileScreen from './screens/ProfileScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import WishlistScreen from './screens/WishlistScreen';
import AchievementsScreen from './screens/AchievementsScreen';
import BlogListScreen from './screens/BlogListScreen';
import BlogDetailScreen from './screens/BlogDetailScreen';
import FreeQuizScreen from './screens/FreeQuizScreen';
import GrammarDrillsScreen from './screens/GrammarDrillsScreen';
import FlashcardsScreen from './screens/FlashcardsScreen';
import SpeakingPracticeScreen from './screens/SpeakingPracticeScreen';
import ListeningPracticeScreen from './screens/ListeningPracticeScreen';
import WritingPracticeScreen from './screens/WritingPracticeScreen';
import StudyGroupsScreen from './screens/StudyGroupsScreen';
import StudyGroupDetailScreen from './screens/StudyGroupDetailScreen';
import CreateStudyGroupScreen from './screens/CreateStudyGroupScreen';
import LeaderboardScreen from './screens/LeaderboardScreen';
import QandAForumScreen from './screens/QandAForumScreen';
import QuestionDetailScreen from './screens/QuestionDetailScreen';
import CreateQuestionScreen from './screens/CreateQuestionScreen';
import ShareProgressScreen from './screens/ShareProgressScreen';
import CreateProgressShareScreen from './screens/CreateProgressShareScreen';
import DiscussionsScreen from './screens/DiscussionsScreen';
import DiscussionDetailScreen from './screens/DiscussionDetailScreen';
import CreateDiscussionScreen from './screens/CreateDiscussionScreen';
import BrowseTopicsScreen from './screens/BrowseTopicsScreen';
import TeachersScreen from './screens/TeachersScreen';
import AdvancedVideoHostingScreen from './screens/AdvancedVideoHostingScreen';
import AnalyticsDashboardScreen from './screens/AnalyticsDashboardScreen';
import StudentManagementScreen from './screens/StudentManagementScreen';
import TeacherSubscriptionPaymentScreen from './screens/TeacherSubscriptionPaymentScreen';
import CoursePaymentScreen from './screens/CoursePaymentScreen';
import ManageSampleVideosScreen from './screens/ManageSampleVideosScreen';
import CreatePostScreen from './screens/CreatePostScreen';
import WordOfTheDayScreen from './screens/WordOfTheDayScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

function MainTabs() {
  const { colors, isDarkMode } = useTheme();

  return (
    <Tab.Navigator
      initialRouteName="Home"
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tab.Screen
        name="Home"
        component={LearnerHomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarAccessibilityLabel: 'Home',
        }}
      />
      <Tab.Screen
        name="Learn"
        component={LearnScreen}
        options={{
          tabBarLabel: 'Learn',
          tabBarAccessibilityLabel: 'Learn',
        }}
      />
      <Tab.Screen
        name="Practice"
        component={PracticeScreen}
        options={{
          tabBarLabel: 'Practice',
          tabBarAccessibilityLabel: 'Practice',
        }}
      />
      <Tab.Screen
        name="Community"
        component={CommunityScreen}
        options={{
          tabBarLabel: 'Community',
          tabBarAccessibilityLabel: 'Community',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarAccessibilityLabel: 'User Profile',
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({});

function AppNavigator() {
  const { isAuthenticated, loading } = useAuth();
  const { colors } = useTheme();
  const navigationRef = React.useRef(null);

  useEffect(() => {
    // When authentication state changes, ensure navigation is updated
    if (!loading && navigationRef.current) {
      // Navigation state will be updated automatically by React Navigation
      // But we can force a refresh if needed
    }
  }, [isAuthenticated, loading]);

  if (loading) {
    return null; // Or a loading screen
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName="Main"
      >
        <Stack.Screen name="Landing" component={LandingScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="Auth" component={AuthStack} />
        <Stack.Screen
          name="CourseDetail"
          component={CourseDetailScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Lesson"
          component={LessonScreen}
          options={{
            headerShown: true,
            title: 'Lesson',
            headerStyle: {
              backgroundColor: colors.primary,
              elevation: 4,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: '600',
              fontSize: 18,
            },
          }}
        />
        <Stack.Screen
          name="Resources"
          component={ResourcesScreen}
          options={{
            headerShown: true,
            title: 'Learning Resources',
            headerStyle: {
              backgroundColor: colors.primary,
              elevation: 4,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: '600',
              fontSize: 18,
            },
          }}
        />
        <Stack.Screen
          name="Notifications"
          component={NotificationsScreen}
          options={{
            headerShown: true,
            title: 'Notifications',
            headerStyle: {
              backgroundColor: colors.primary,
              elevation: 4,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: '600',
              fontSize: 18,
            },
          }}
        />
        <Stack.Screen
          name="Wishlist"
          component={WishlistScreen}
          options={{
            headerShown: true,
            title: 'My Wishlist',
            headerStyle: {
              backgroundColor: colors.primary,
              elevation: 4,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: '600',
              fontSize: 18,
            },
          }}
        />
        <Stack.Screen
          name="BlogList"
          component={BlogListScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="BlogDetail"
          component={BlogDetailScreen}
          options={{
            headerShown: true,
            title: 'Article',
            headerStyle: {
              backgroundColor: colors.primary,
              elevation: 4,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: '600',
              fontSize: 18,
            },
          }}
        />
        <Stack.Screen
          name="Courses"
          component={CoursesScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="MyCourses"
          component={MyCoursesScreen}
          options={{
            headerShown: true,
            title: 'My Courses',
            headerStyle: {
              backgroundColor: colors.primary,
              elevation: 4,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: '600',
              fontSize: 18,
            },
          }}
        />
        <Stack.Screen
          name="FreeQuiz"
          component={FreeQuizScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="GrammarDrills"
          component={GrammarDrillsScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Flashcards"
          component={FlashcardsScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="SpeakingPractice"
          component={SpeakingPracticeScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="ListeningPractice"
          component={ListeningPracticeScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="WritingPractice"
          component={WritingPracticeScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="WordOfTheDay"
          component={WordOfTheDayScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="StudyGroups"
          component={StudyGroupsScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="StudyGroupDetail"
          component={StudyGroupDetailScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="CreateStudyGroup"
          component={CreateStudyGroupScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="CreatePost"
          component={CreatePostScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Leaderboard"
          component={LeaderboardScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="QandAForum"
          component={QandAForumScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="QuestionDetail"
          component={QuestionDetailScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="CreateQuestion"
          component={CreateQuestionScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="ShareProgress"
          component={ShareProgressScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="CreateProgressShare"
          component={CreateProgressShareScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Discussions"
          component={DiscussionsScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="DiscussionDetail"
          component={DiscussionDetailScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="CreateDiscussion"
          component={CreateDiscussionScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="BrowseTopics"
          component={BrowseTopicsScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Teachers"
          component={TeachersScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="AdvancedVideoHosting"
          component={AdvancedVideoHostingScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="AnalyticsDashboard"
          component={AnalyticsDashboardScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="StudentManagement"
          component={StudentManagementScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="TeacherSubscriptionPayment"
          component={TeacherSubscriptionPaymentScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="CoursePayment"
          component={CoursePaymentScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="ManageSampleVideos"
          component={ManageSampleVideosScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Achievements"
          component={AchievementsScreen}
          options={{
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <ThemeProvider>
          <CurrencyProvider>
            <GamificationProvider>
              <WishlistProvider>
                <StudentProvider>
                  <InstructorStudentProvider>
                    <ThemedApp />
                  </InstructorStudentProvider>
                </StudentProvider>
              </WishlistProvider>
            </GamificationProvider>
          </CurrencyProvider>
        </ThemeProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

function ThemedApp() {
  const { isDarkMode } = useTheme();

  return (
    <>
      <StatusBar style={isDarkMode ? 'light' : 'auto'} />
      <NetworkStatus />
      <AppNavigator />
      <ToastContainer />
    </>
  );
}
