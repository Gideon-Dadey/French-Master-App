# 🇫🇷 French Master GH

> Premium French & English Language Learning Platform with iOS-Style Experience

[![React Native](https://img.shields.io/badge/React%20Native-0.81.5-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-SDK%2054-black.svg)](https://expo.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Latest-green.svg)](https://www.mongodb.com/)
[![Performance](https://img.shields.io/badge/Performance-Optimized-brightgreen.svg)]()

A comprehensive, production-ready mobile application for learning French and English, featuring premium iOS-style UI/UX, advanced gamification, secure community study groups, offline support, and lightning-fast performance.

---

## 📋 Table of Contents

- [Features](#-features)
- [Screenshots](#-screenshots)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [Technology Stack](#️-technology-stack)
- [API Endpoints](#-api-endpoints)
- [Screens Overview](#-screens-overview)
- [Components](#-components)
- [Context Providers](#-context-providers)
- [Security Features](#-security-features)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)
- [License](#-license)

---

## ✨ Features

### 🎓 Learning Features
- **Premium Course Catalog** - Extensive French & English courses with video lessons
- **Interactive Lessons** - Video-based lessons with progress tracking
- **Immersion Mode** - Real-time "Conversation Simulator" for lifelike verbal practice
- **Word of the Day** - Daily vocabulary with pronunciation, phonetics, examples, and streaks
- **Practice Exercises** - Multiple practice modes:
  - 📝 **Quick Quiz** - 8 categories, 48 questions with explanations
  - 📖 **Grammar Drills** - 8 grammar topics, hint system, detailed feedback
  - 🎤 **Speaking Practice** - 8 real-life scenarios, phonetic guides, audio playback
  - 👂 **Listening Practice** - 8 audio categories, comprehension questions
  - ✍️ **Writing Practice** - Writing exercises with feedback
  - 🃏 **Flashcards** - 8 vocabulary decks, 3D flip animation, spaced repetition
- **Progress Analytics** - Track learning progress with detailed insights
- **Certificates** - Earn certificates upon course completion

### 🎨 Premium iOS-Style Design
- **Beautiful UI/UX** - Professional native interface inspired by iOS
- **Unified "French Master" Theme** - Sophisticated Navy, Gold, and Cream palette (`organicTheme`)
- **Time-Based Greetings** - Dynamic French greetings in LearnScreen (Bonjour, Bon après-midi, Bonsoir)
- **Dark/Light Mode** - Full theme support with smooth transitions
- **Premium Animations** - Smooth entrance animations, staggered reveals, parallax effects
- **Responsive Design** - Optimized for all screen sizes
- **Glassmorphism** - Modern transparency effects in headers and cards
- **Custom Tab Bar** - iOS-style navigation with haptic feedback
- **Redesigned Screens** - Clean, minimal cards with consistent rounded corners (radius: 20)

### 🎯 Advanced Gamification
- **Achievements System** - Unlock badges and achievements
- **Learning Streaks** - Maintain daily learning streaks with visual tracking
- **XP Points & Levels** - Earn points and level up with progress bars
- **Daily Goals** - Complete daily learning goals
- **Leaderboards** - Premium golden-themed ranking with podium display

### 👥 Community Features
- **Study Groups** - Create and join community study groups
- **iOS-Style Security** - Login/membership required to view group chats
- **Group Discussions** - Real-time chat with iOS iMessage-style bubbles
- **Message Reactions** - Double-tap to like, swipe to reply
- **Voice Messages** - Record and send voice messages
- **Media Sharing** - Share images and documents
- **Voice & Video Calls** - FaceTime-style call interface
- **Q&A Forum** - Premium forum with categories and trending topics
- **Discussions** - Community discussions with tagging and filtering
- **Blog & Articles** - Read learning articles with text-to-speech
- **Progress Sharing** - Share your learning milestones

### 💳 Payment Integration
- **Multiple Payment Methods** - Stripe, PayPal, Mobile Money
- **Secure Transactions** - Industry-standard security
- **All Courses Free** - All courses are now completely free to access
- **Teacher Subscriptions** - Subscription plans for instructors

### 👨‍🏫 Instructor Features
- **Student Management** - View and manage enrolled students
- **Course Creation** - Create and publish courses
- **Analytics Dashboard** - Track student progress and course performance
- **Video Hosting** - Advanced video management
- **Subscription Plans** - Offer subscription-based access

---

## 📱 Screenshots

| Home Screen | Immersion Mode | Course Detail |
|-------------|----------------|---------------|
| Premium header with new layout | Conversation Simulator | Redesigned video player |

| Community Hub | Study Groups | Group Chat |
|---------------|--------------|------------|
| Premium community hub | Study group cards | iOS iMessage-style chat |

| Profile | Leaderboard | Word of the Day |
|---------|-------------|-----------------|
| Modern profile with stats | Golden rankings | Daily vocabulary |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **MongoDB** (local installation or MongoDB Atlas)
- **Expo CLI** (will be installed)
- **Expo Go** app on your phone (iOS/Android)
- **Git** for version control

### Quick Installation

```bash
# 1. Clone the repository
git clone https://github.com/Gideon-Dadey/French-Master-App.git
cd "FRENCH MASTER"

# 2. Install all dependencies
npm install
cd backend && npm install && cd ..

# 3. Start backend server (Terminal 1)
cd backend && npm run dev

# 4. Start frontend (Terminal 2)
npx expo start --clear

# 5. Scan QR code with Expo Go app
```

### Environment Setup

Create `backend/.env`:
```env
NODE_ENV=development
PORT=5001
MONGODB_URI=mongodb://localhost:27017/frenchmaster
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRE=30d

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Stripe (for payments)
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
```

Update `src/services/api.js` with your configuration:
```javascript
// For development (Expo Go) - local IP is used automatically
const LOCAL_TEST_URL = 'http://YOUR_IP_ADDRESS:5001/api';

// For production APK - ngrok or production URL
const NGROK_URL = 'https://your-ngrok-url.ngrok-free.app/api';
const PRODUCTION_URL = 'https://api.frenchmastergh.com/api';

// URL is selected automatically based on __DEV__ flag
```

---

## 📁 Project Structure

```
FRENCH MASTER/
├── App.js                          # Main app entry with navigation
├── app.json                        # Expo configuration
├── package.json                    # Frontend dependencies
├── babel.config.js                 # Babel configuration
│
├── assets/                         # Static assets
│   ├── logo.png                    # App logo
│   ├── french/                     # French course images
│   └── english/                    # English course images
│
├── screens/                        # 49 Screen components
│   ├── Auth/
│   │   ├── LoginScreen.js
│   │   └── RegisterScreen.js
│   ├── LearnerHomeScreen.js
│   ├── LearnScreen.js
│   ├── PracticeScreen.js
│   ├── CommunityScreen.js
│   ├── ProfileScreen.js
│   ├── StudyGroupsScreen.js
│   ├── StudyGroupDetailScreen.js
│   ├── CourseDetailScreen.js
│   ├── CoursePaymentScreen.js
│   ├── LeaderboardScreen.js
│   ├── AchievementsScreen.js
│   ├── FlashcardsScreen.js
│   ├── GrammarDrillsScreen.js
│   ├── SpeakingPracticeScreen.js
│   ├── ListeningPracticeScreen.js
│   ├── WritingPracticeScreen.js
│   ├── WordOfTheDayScreen.js
│   ├── QandAForumScreen.js
│   ├── DiscussionsScreen.js
│   ├── BlogListScreen.js
│   ├── BlogDetailScreen.js
│   └── ... (27 more screens)
│
├── src/
│   ├── components/                 # 40 Reusable UI components
│   │   ├── CustomTabBar.js
│   │   ├── CourseCard.js
│   │   ├── FeaturedCourseCard.js
│   │   ├── GamificationSystem.js
│   │   ├── LoadingSpinner.js
│   │   ├── PremiumButton.js
│   │   ├── PremiumCard.js
│   │   ├── Rating.js
│   │   └── ... (32 more components)
│   │
│   ├── context/                    # React Context providers
│   │   ├── AuthContext.js
│   │   ├── ThemeContext.js
│   │   ├── GamificationContext.js
│   │   ├── WishlistContext.js
│   │   └── ... (3 more contexts)
│   │
│   ├── services/
│   │   ├── api.js
│   │   ├── offlineService.js
│   │   └── prefetchService.js
│   │
│   ├── hooks/
│   │   └── useNetwork.js
│   │
│   └── utils/
│       ├── helpers.js
│       ├── responsive.js
│       ├── premiumDesign.js
│       └── ... (6 more utils)
│
└── backend/                        # Backend API
    ├── server.js
    ├── package.json
    ├── .env
    │
    ├── config/
    │   └── database.js
    │
    ├── models/                     # 20 Mongoose schemas
    │   ├── User.js
    │   ├── Course.js
    │   ├── Lesson.js
    │   ├── StudyGroup.js
    │   ├── Quiz.js
    │   ├── Progress.js
    │   └── ... (14 more models)
    │
    ├── routes/                     # 24 API route files
    │   ├── auth.js
    │   ├── courses.js
    │   ├── studyGroups.js
    │   ├── payments.js
    │   └── ... (20 more routes)
    │
    ├── middleware/
    │   └── auth.js
    │
    └── scripts/
        ├── seed.js
        └── seedBlog.js
```

---

## 🛠️ Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React Native | 0.81.5 | Mobile framework |
| Expo | SDK 54 | Development platform |
| React | 19.1.0 | UI library |
| React Navigation | 6.x | Navigation library |
| React Context API | - | State management |
| Axios | 1.6.0 | HTTP client |
| Expo Linear Gradient | 15.0.8 | Gradient effects |
| Expo AV | 16.0.8 | Audio/Video playback |
| Expo Speech | 14.0.8 | Text-to-speech |
| Expo Camera | 17.0.10 | Camera access |
| Expo File System | 19.0.21 | File operations |
| React Native Reanimated | 4.1.1 | Animations |
| Socket.io Client | 4.5.4 | Real-time communication |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18+ | Runtime environment |
| Express.js | 4.x | Web framework |
| MongoDB | Latest | Database |
| Mongoose | 8.x | ODM |
| JWT | - | Authentication |
| Bcrypt.js | - | Password hashing |
| Multer | - | File uploads |
| Cloudinary | - | Cloud storage |
| Stripe | - | Payment processing |
| Socket.io | - | Real-time features |

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/refresh` | Refresh token |

### Courses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/courses` | Get all courses |
| GET | `/api/courses/:id` | Get course details |
| GET | `/api/courses/featured/list` | Get featured courses |
| POST | `/api/courses` | Create course (instructor) |

### Study Groups
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/study-groups` | Get all groups |
| POST | `/api/study-groups` | Create group |
| GET | `/api/study-groups/:id` | Get group details |
| POST | `/api/study-groups/:id/join` | Join group |
| POST | `/api/study-groups/:id/messages` | Send message |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments/create-intent` | Create payment |
| POST | `/api/payments/confirm` | Confirm payment |
| GET | `/api/payments/history` | Payment history |

### More endpoints: `/api/lessons`, `/api/progress`, `/api/reviews`, `/api/blog`, `/api/notifications`, `/api/wishlist`, `/api/quizzes`, `/api/discussions`, `/api/questions`, `/api/leaderboard`, `/api/subscriptions`, `/api/resources`, `/api/categories`, `/api/tags`

---

## 📱 Screens Overview (~50 Screens)

### Authentication (2)
- `LoginScreen` - Premium login with social options
- `RegisterScreen` - User registration

### Main Navigation (5)
- `LandingScreen` - Welcome/onboarding
- `LearnerHomeScreen` - Main dashboard
- `LearnScreen` - Course discovery
- `PracticeScreen` - Training center
- `CommunityScreen` - Community hub

### Courses (6)
- `CoursesScreen` - Course catalog
- `CourseDetailScreen` - Course information
- `CoursePaymentScreen` - Payment flow
- `MyCoursesScreen` - Enrolled courses
- `LessonScreen` - Lesson player
- `ResourcesScreen` - Learning resources

### Practice (8)
- `FreeQuizScreen` - Quick quizzes
- `FlashcardsScreen` - Vocabulary cards
- `GrammarDrillsScreen` - Grammar exercises
- `SpeakingPracticeScreen` - Speaking practice
- `ListeningPracticeScreen` - Listening exercises
- `WritingPracticeScreen` - Writing practice
- `WordOfTheDayScreen` - Daily vocabulary
- `ConversationSimulatorScreen` - **New** Immersion Mode

### Community (10)
- `StudyGroupsScreen` - Group listing
- `StudyGroupDetailScreen` - Group chat & details
- `CreateStudyGroupScreen` - Create new group
- `DiscussionsScreen` - Discussions list
- `DiscussionDetailScreen` - Discussion thread
- `CreateDiscussionScreen` - New discussion
- `QandAForumScreen` - Q&A forum
- `QuestionDetailScreen` - Question thread
- `CreateQuestionScreen` - New question
- `ShareProgressScreen` - Share progress

### Profile & Settings (5)
- `ProfileScreen` - User profile
- `AchievementsScreen` - Badges & achievements
- `LeaderboardScreen` - Rankings
- `NotificationsScreen` - Notifications
- `WishlistScreen` - Saved courses

### Content (4)
- `BlogListScreen` - Articles list
- `BlogDetailScreen` - Article reader
- `BrowseTopicsScreen` - Topic browser
- `ContactScreen` - Contact form

### Instructor (6)
- `TeachersScreen` - Teacher profiles
- `StudentManagementScreen` - Manage students
- `AnalyticsDashboardScreen` - Analytics
- `ManageSampleVideosScreen` - Video management
- `AdvancedVideoHostingScreen` - Video hosting
- `TeacherSubscriptionPaymentScreen` - Subscription

### Other (4)
- `HomeScreen` - Alternative home
- `CreatePostScreen` - Create post
- `CreateProgressShareScreen` - Share milestone

---

## 🧩 Components (40 Components)

### Core UI
- `CustomTabBar` - iOS-style tab navigation
- `PremiumButton` - Gradient buttons
- `PremiumCard` - Card containers
- `LoadingSpinner` - Loading states
- `ErrorMessage` - Error displays
- `Rating` - Star ratings

### Course Components
- `CourseCard` - Course display
- `FeaturedCourseCard` - Featured courses
- `HorizontalCourseCard` - Horizontal layout
- `CourseRecommendations` - Recommendations
- `CourseDiscussion` - Course discussions

### Gamification
- `GamificationSystem` - XP & levels
- `AchievementBadge` - Achievement display
- `LearningStreak` - Streak tracking
- `DailyChallengeCard` - Daily challenges

### Analytics
- `AnalyticsChart` - Charts
- `LearningInsightCard` - Insights
- `QuickStatsGrid` - Statistics

### Media
- `PremiumVideoPlayer` - Video player
- `VideoUploader` - Video uploads

### Premium
- `PremiumBadge` - Premium indicators
- `PremiumEmptyState` - Empty states
- `PremiumErrorState` - Error states
- `PremiumProgressBar` - Progress bars
- `PremiumStatsCard` - Statistics cards

### Utility
- `SearchBar` - Search input
- `SearchAutocomplete` - Autocomplete
- `NetworkStatus` - Connection status
- `ToastNotification` - Toast messages
- `SkeletonLoader` - Loading skeletons
- `WishlistButton` - Wishlist toggle
- `BlogCard` - Blog posts
- `Chip` - Tag chips
- `Divider` - Dividers
- `Heading` - Section headings
- `Spacer` - Spacing
- `TabBarIcon` - Tab icons
- `CategoryDetailModal` - Category modal
- `CertificateView` - Certificates
- `RecommendedCourses` - Recommendations

---

## 🔐 Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - Bcrypt encryption
- **Study Group Security** - Members-only access
- **Input Validation** - Server-side validation
- **CORS Protection** - Cross-origin security
- **Rate Limiting** - Request throttling
- **Secure Storage** - Expo SecureStore

---

## 🚢 Deployment

### Backend (Heroku/Railway/Render)
```bash
cd backend
heroku create french-master-api
heroku config:set MONGODB_URI=... JWT_SECRET=...
git push heroku main
```

### Frontend (EAS Build)
```bash
npm install -g eas-cli
eas login
eas build --platform android --profile preview
eas build --platform ios
eas submit --platform android
eas submit --platform ios
```

---

## 🔧 Troubleshooting & Mobile Setup

### Quick Fixes for Common Issues

| Issue | Root Cause | Solution |
|-------|-----------|----------|
| **Login Failed** | Network/API connection error | Check backend is running: `npm run dev` in `/backend` |
| **"Connection Lost" on Learn** | Hardcoded local IP address | Update `USE_LOCAL = false` in `/src/services/api.js` |
| **Courses Not Showing** | API endpoint incorrect | Verify `api.frenchmastergh.com` is configured |
| **Study Groups Empty** | Network error or no data | Clear app cache and refresh |
| **Metro cache error** | Cache corruption | `npx expo start --clear` |
| **Port 5001 in use** | Another process using port | `taskkill /F /IM node.exe` (Windows) |

### Mobile Deployment Issues

If the app fails after mobile installation, read: **[MOBILE_SETUP_GUIDE.md](./MOBILE_SETUP_GUIDE.md)**

**Key Points:**
1. Backend must be running before starting the app
2. API URL must point to production server (not local IP)
3. Firebase/Notifications need proper configuration
4. Database must have initial data seeded

### Backend Diagnostics

Run diagnostic script to verify backend setup:
```bash
cd backend
node diagnose.js
```

This checks:
- ✅ Environment variables
- ✅ Node dependencies
- ✅ Server configuration
- ✅ Database connection
- ✅ Port availability

### Frontend Validation

Validate mobile configuration:
```bash
node validate-mobile.js
```

This checks:
- ✅ API configuration for mobile
- ✅ Error handling implementation
- ✅ Dependencies installed
- ✅ Production URL configured

### Recent Fixes (December 2025)

**v2.1.0 - December 30, 2025:**
- ❌ Android APK network issues → ✅ ngrok public URL integration
- ❌ Connection lost on LearnScreen → ✅ Smart API URL selection
- ❌ Login failing on APK → ✅ Production builds use public URL

**v2.0.0 - December 26, 2025:**
- ❌ Login failing → ✅ Improved error handling
- ❌ Connection lost errors → ✅ Production URL configured
- ❌ Courses not showing → ✅ Promise.allSettled() implementation
- ❌ Study groups empty → ✅ Better error messages

See detailed changes in: **[CHANGELOG.md](./CHANGELOG.md)** and **[FIX_SUMMARY.md](./FIX_SUMMARY.md)**

---

## 📊 App Statistics

| Metric | Count |
|--------|-------|
| Screens | ~50 |
| Components | 40+ |
| API Routes | 25 |
| Database Models | 22 |
| Context Providers | 7 |
| Lines of Code | ~72,275 |

---

## 📝 License

© 2024-2025 THE FRENCH MASTER GH. All rights reserved.

---

## 📞 Support

- **Email**: info@frenchmastergh.com
- **Website**: https://frenchmastergh.com

---

**Made with ❤️ for French learners in Ghana and beyond**

🇫🇷 **French Master** - *Master French, One Day at a Time*
