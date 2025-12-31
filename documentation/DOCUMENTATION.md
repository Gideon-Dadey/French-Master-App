# French Master GH - Complete Technical Documentation

**Version:** 1.0.0  
**Last Updated:** December 2025  
**Platform:** React Native (Expo SDK 54)

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Setup Guide](#setup-guide)
5. [API Documentation](#api-documentation)
6. [Screens Reference](#screens-reference)
7. [Components Library](#components-library)
8. [Context Providers](#context-providers)
9. [Services](#services)
10. [Utilities](#utilities)
11. [Database Models](#database-models)
12. [Styling & Theming](#styling--theming)
13. [Security](#security)
14. [Deployment](#deployment)

---

## Overview

**French Master GH** is a comprehensive, production-ready mobile application for learning French and English. Built with React Native and Expo, it features a premium iOS-style interface, advanced gamification, secure community features, and real-time communication.

### Key Statistics
- **49 Screens** - Complete app navigation
- **40 Components** - Reusable UI library
- **24 API Routes** - RESTful backend
- **20 Database Models** - MongoDB schemas
- **7 Context Providers** - State management

### Core Features
- 🎓 Premium course catalog with video lessons
- 🎯 Gamification (XP, streaks, achievements, leaderboards)
- 👥 Secure study groups with real-time chat
- 💳 Payment integration (Stripe, Mobile Money)
- 📊 Analytics dashboard
- 🌙 Dark/Light mode support
- 📱 Offline capabilities

---

## Architecture

### System Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                     FRENCH MASTER APP                        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐    │
│  │              PRESENTATION LAYER                      │    │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌────────┐ │    │
│  │  │ Screens │  │Components│  │  Utils  │  │ Assets │ │    │
│  │  │  (49)   │  │   (40)   │  │   (9)   │  │        │ │    │
│  │  └─────────┘  └─────────┘  └─────────┘  └────────┘ │    │
│  └─────────────────────────────────────────────────────┘    │
│                            │                                 │
│  ┌─────────────────────────────────────────────────────┐    │
│  │               STATE MANAGEMENT                       │    │
│  │  ┌────────┐  ┌────────┐  ┌────────┐  ┌──────────┐  │    │
│  │  │  Auth  │  │ Theme  │  │Gamific.│  │ Wishlist │  │    │
│  │  │Context │  │Context │  │Context │  │ Context  │  │    │
│  │  └────────┘  └────────┘  └────────┘  └──────────┘  │    │
│  └─────────────────────────────────────────────────────┘    │
│                            │                                 │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                  SERVICES LAYER                      │    │
│  │  ┌──────────┐  ┌──────────┐  ┌───────────────────┐ │    │
│  │  │ API.js   │  │ Offline  │  │    Prefetch      │ │    │
│  │  │ (Axios)  │  │ Service  │  │    Service       │ │    │
│  │  └──────────┘  └──────────┘  └───────────────────┘ │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
                     HTTPS / WSS
                            │
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js)                         │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐    │
│  │                  EXPRESS SERVER                      │    │
│  │  ┌──────────┐  ┌──────────┐  ┌─────────────────┐   │    │
│  │  │  Routes  │  │Middleware│  │   Socket.io     │   │    │
│  │  │   (24)   │  │  (Auth)  │  │  (Real-time)    │   │    │
│  │  └──────────┘  └──────────┘  └─────────────────┘   │    │
│  └─────────────────────────────────────────────────────┘    │
│                            │                                 │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                   MONGODB                            │    │
│  │  ┌──────────────────────────────────────────────┐   │    │
│  │  │  Models: User, Course, Lesson, StudyGroup,   │   │    │
│  │  │  Quiz, Progress, Payment, Blog, Discussion... │   │    │
│  │  └──────────────────────────────────────────────┘   │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Directory Structure
```
FRENCH MASTER/
├── App.js                    # Main entry point
├── app.json                  # Expo configuration
├── package.json              # Dependencies
├── babel.config.js           # Babel config
│
├── assets/                   # Static assets
│   ├── logo.jpeg
│   ├── icon.png
│   ├── splash.png
│   ├── french/              # French course images (9)
│   ├── english/             # English course images (12)
│   └── posts/               # Blog post images
│
├── screens/                  # Screen components (49)
│   ├── Auth/
│   │   ├── LoginScreen.js
│   │   └── RegisterScreen.js
│   ├── LearnerHomeScreen.js
│   ├── LearnScreen.js
│   ├── PracticeScreen.js
│   ├── CommunityScreen.js
│   ├── ProfileScreen.js
│   └── ... (43 more)
│
├── src/
│   ├── components/          # UI components (40)
│   ├── context/             # Context providers (7)
│   ├── services/            # API services (3)
│   ├── hooks/               # Custom hooks (2)
│   └── utils/               # Utilities (9)
│
├── components/              # Legacy components
│   └── VideoPlayer.js
│
└── backend/
    ├── server.js            # Express entry point
    ├── package.json
    ├── .env
    ├── config/
    │   └── database.js      # MongoDB connection
    ├── models/              # Mongoose models (20)
    ├── routes/              # API routes (24)
    ├── middleware/
    │   └── auth.js          # JWT middleware
    ├── utils/
    │   └── logger.js
    └── scripts/
        ├── seed.js
        └── seedBlog.js
```

---

## Technology Stack

### Frontend Dependencies (package.json)

| Package | Version | Purpose |
|---------|---------|---------|
| react | 19.1.0 | UI library |
| react-native | 0.81.5 | Mobile framework |
| expo | ~54.0.0 | Development platform |
| @react-navigation/native | ^6.1.9 | Navigation |
| @react-navigation/stack | ^6.3.20 | Stack navigator |
| @react-navigation/bottom-tabs | ^6.5.11 | Tab navigator |
| @react-navigation/drawer | ^6.6.6 | Drawer navigator |
| axios | ^1.6.0 | HTTP client |
| socket.io-client | ^4.5.4 | WebSocket client |
| @react-native-async-storage/async-storage | 2.2.0 | Local storage |
| @react-native-community/netinfo | 11.4.1 | Network detection |
| expo-av | ~16.0.8 | Audio/Video |
| expo-camera | ~17.0.10 | Camera |
| expo-clipboard | ~8.0.8 | Clipboard |
| expo-document-picker | ~14.0.8 | File picker |
| expo-file-system | ~19.0.21 | File system |
| expo-haptics | ~15.0.8 | Haptic feedback |
| expo-image-picker | ^17.0.10 | Image picker |
| expo-linear-gradient | ~15.0.8 | Gradients |
| expo-media-library | ~18.2.1 | Media library |
| expo-notifications | ~0.32.15 | Push notifications |
| expo-secure-store | ~15.0.8 | Secure storage |
| expo-sharing | ~14.0.8 | Sharing |
| expo-speech | ~14.0.8 | Text-to-speech |
| react-native-gesture-handler | ~2.28.0 | Gestures |
| react-native-reanimated | ~4.1.1 | Animations |
| react-native-svg | 15.12.1 | SVG support |
| react-native-webview | 13.15.0 | WebView |
| react-hook-form | ^7.48.2 | Form handling |
| yup | ^1.3.3 | Validation |

### Backend Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| express | ^4.x | Web framework |
| mongoose | ^8.x | MongoDB ODM |
| bcryptjs | - | Password hashing |
| jsonwebtoken | - | JWT auth |
| cors | - | CORS handling |
| dotenv | - | Environment vars |
| multer | - | File uploads |
| cloudinary | - | Cloud storage |
| stripe | - | Payments |
| socket.io | - | Real-time |
| nodemon | - | Dev server |

---

## Setup Guide

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or Atlas)
- Expo Go app on device
- Git

### 1. Clone & Install

```bash
# Clone repository
git clone https://github.com/yourusername/french-master-gh.git
cd "FRENCH MASTER"

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend && npm install && cd ..
```

### 2. Configure Environment

Create `backend/.env`:
```env
NODE_ENV=development
PORT=5001
MONGODB_URI=mongodb://localhost:27017/frenchmaster
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=30d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Stripe
STRIPE_SECRET_KEY=sk_test_...
```

### 3. Configure API URL

Get your local IP address:
```bash
# Windows
ipconfig | findstr IPv4

# Mac/Linux
ifconfig | grep inet
```

Update `src/services/api.js`:
```javascript
const API_URL = 'http://YOUR_IP:5001/api';
```

### 4. Start Application

```bash
# Terminal 1: Start MongoDB (if local)
mongod

# Terminal 2: Start Backend
cd backend && npm run dev

# Terminal 3: Start Frontend
npx expo start --clear
```

### 5. Seed Data (Optional)

```bash
cd backend
node scripts/seed.js      # Seed courses
node scripts/seedBlog.js  # Seed blog posts
```

---

## API Documentation

### Base URL
- **Development:** `http://localhost:5001/api`
- **Production:** `https://api.frenchmastergh.com/api`

### Authentication Header
```
Authorization: Bearer <token>
```

---

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/register` | Register user | No |
| POST | `/login` | Login user | No |
| GET | `/me` | Get current user | Yes |
| POST | `/refresh` | Refresh token | No |
| POST | `/forgot-password` | Password reset | No |

**Register Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+233201234567"
}
```

**Login Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  }
}
```

---

### Courses Routes (`/api/courses`)

**Note:** All courses are now free. The `isFree` field defaults to `true` and `price` defaults to `0`.

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get all courses | No |
| GET | `/:id` | Get course details | No |
| GET | `/featured/list` | Get featured courses | No |
| POST | `/` | Create course | Yes (Instructor) |
| PUT | `/:id` | Update course | Yes (Instructor) |
| DELETE | `/:id` | Delete course | Yes (Instructor) |

**Query Parameters:**
- `?category=french` - Filter by category
- `?level=beginner` - Filter by level
- `?search=basics` - Search courses
- `?page=1&limit=10` - Pagination
- `?sort=rating` - Sort by field

**Course Model:**
- `isFree: Boolean` - Defaults to `true`
- `price: Number` - Defaults to `0`

---

### Lessons Routes (`/api/lessons`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/course/:courseId` | Get course lessons | No |
| GET | `/:id` | Get lesson details | Yes |
| POST | `/:id/progress` | Update progress | Yes |
| POST | `/` | Create lesson | Yes (Instructor) |

---

### Study Groups Routes (`/api/study-groups`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get all groups | No |
| GET | `/:id` | Get group details | No |
| POST | `/` | Create group | Yes |
| POST | `/:id/join` | Join group | Yes |
| POST | `/:id/leave` | Leave group | Yes |
| GET | `/:id/messages` | Get messages | Yes (Member) |
| POST | `/:id/messages` | Send message | Yes (Member) |
| POST | `/:id/messages/:msgId/react` | React to message | Yes (Member) |

---

### Payments Routes (`/api/payments`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/create-intent` | Create payment intent | Yes |
| POST | `/confirm` | Confirm payment | Yes |
| GET | `/history` | Get payment history | Yes |

---

### Progress Routes (`/api/progress`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/course/:courseId` | Get course progress | Yes |
| GET | `/dashboard` | Get dashboard stats | Yes |
| POST | `/update` | Update progress | Yes |

---

### Reviews Routes (`/api/reviews`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/course/:courseId` | Get course reviews | No |
| POST | `/` | Create review | Yes |
| PUT | `/:id` | Update review | Yes |
| DELETE | `/:id` | Delete review | Yes |

---

### Blog Routes (`/api/blog`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get all posts | No |
| GET | `/:id` | Get post details | No |
| POST | `/` | Create post | Yes (Admin) |

---

### Wishlist Routes (`/api/wishlist`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get wishlist | Yes |
| POST | `/:courseId` | Add to wishlist | Yes |
| DELETE | `/:courseId` | Remove from wishlist | Yes |

---

### Quizzes Routes (`/api/quizzes`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/lesson/:lessonId` | Get lesson quizzes | Yes |
| POST | `/submit` | Submit quiz answers | Yes |
| GET | `/attempts` | Get user attempts | Yes |

---

### Leaderboard Routes (`/api/leaderboard`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get leaderboard | No |
| GET | `/weekly` | Get weekly rankings | No |
| GET | `/monthly` | Get monthly rankings | No |

---

### Discussions Routes (`/api/discussions`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get discussions | No |
| GET | `/:id` | Get discussion | No |
| POST | `/` | Create discussion | Yes |
| POST | `/:id/reply` | Reply to discussion | Yes |

---

### Questions Routes (`/api/questions`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get Q&A questions | No |
| GET | `/:id` | Get question | No |
| POST | `/` | Ask question | Yes |
| POST | `/:id/answer` | Answer question | Yes |
| POST | `/:id/vote` | Vote on question | Yes |

---

### Notifications Routes (`/api/notifications`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get notifications | Yes |
| PUT | `/:id/read` | Mark as read | Yes |
| PUT | `/read-all` | Mark all as read | Yes |
| DELETE | `/:id` | Delete notification | Yes |

---

### Users Routes (`/api/users`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/profile` | Get profile | Yes |
| PUT | `/profile` | Update profile | Yes |
| GET | `/my-courses` | Get enrolled courses | Yes |
| PUT | `/avatar` | Update avatar | Yes |

---

### Subscriptions Routes (`/api/subscriptions`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/plans` | Get subscription plans | No |
| POST | `/subscribe` | Subscribe to plan | Yes |
| GET | `/my-subscription` | Get subscription | Yes |
| POST | `/cancel` | Cancel subscription | Yes |

---

### Admin Routes (`/api/admin`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/students` | Get all students | Yes (Admin) |
| GET | `/students/:id` | Get student | Yes (Admin) |
| PUT | `/students/:id` | Update student | Yes (Admin) |
| DELETE | `/students/:id` | Delete student | Yes (Admin) |
| GET | `/analytics` | Get analytics | Yes (Admin) |

---

## Screens Reference

### Authentication Screens

#### LoginScreen (`screens/Auth/LoginScreen.js`)
Premium login screen with social authentication options.

**Features:**
- Email/password login
- Social login (Google, Facebook)
- Password visibility toggle
- Remember me option
- Forgot password link
- Register redirect

#### RegisterScreen (`screens/Auth/RegisterScreen.js`)
User registration with validation.

**Features:**
- Name, email, phone fields
- Password confirmation
- Terms acceptance
- Validation feedback
- Premium styling

---

### Main Navigation Screens

#### LandingScreen
Welcome/onboarding screen shown on first app launch.

**Features:**
- App branding
- Feature highlights
- Statistics display
- Get Started / Login buttons
- Premium gradient background

#### LearnerHomeScreen
Main dashboard after login.

**Features:**
- User greeting with avatar
- Learning stats (XP, streak, level)
- Daily goal progress
- Featured courses carousel
- Quick actions
- Recent blog posts
- Theme toggle

#### LearnScreen
Course discovery and catalog with time-based greetings.

**Features:**
- **Time-Based French Greetings**
  - Dynamic greeting based on time of day
  - "Bonjour" (Morning: 5:00 - 11:59)
  - "Bon après-midi" (Afternoon: 12:00 - 17:59)
  - "Bonsoir" (Evening: 18:00 - 4:59)
- Search bar with autocomplete
- Category filters
- Featured courses section
- All courses grid (all courses are now free)
- Filter modal (level, rating)
- Pull to refresh
- **Unified Primary Color Theme** - Consistent primary color throughout

#### PracticeScreen
Training center hub.

**Features:**
- Practice statistics
- Daily challenge card
- Practice modes grid:
  - Quick Quiz
  - Grammar Drills
  - Speaking Practice
  - Listening Practice
  - Writing Practice
  - Flashcards
- Recent achievements
- Word of the Day preview

#### CommunityScreen
Community hub for social features.

**Features:**
- Community statistics
- Study Groups section
- Discussions section
- Q&A Forum section
- Blog/Articles section
- Progress sharing
- Quick actions

#### ProfileScreen
User profile and settings.

**Features:**
- Avatar with edit option
- XP and level display
- Statistics dashboard
- Progress charts
- Account settings
- Preferences (dark mode, notifications)
- Logout option

---

### Course Screens

#### CoursesScreen
Full course catalog with advanced filtering.

**Features:**
- Search with real-time results
- Category filter chips
- View toggle (grid/list)
- Advanced filters panel
- Sort options
- Course cards with ratings

#### CourseDetailScreen
Premium course detail page with modern design.

**Features:**
- **Hero Section**
  - Parallax image with gradient overlay
  - Smooth scroll animations
  - Category badge with icon
- **Quick Stats Card**
  - Duration, lessons, level, rating
  - Visual metrics display
- **Enrollment Card**
  - Prominent pricing display (all courses free)
  - "Enroll Free" CTA button
  - Sticky card on scroll
- **Tab Navigation**
  - Overview tab with course description
  - Curriculum tab with lesson cards
  - Reviews tab with rating overview
- **Enhanced Curriculum**
  - Lesson cards with lock/unlock states
  - Free preview badges
  - Progress indicators
- **Reviews Section**
  - Rating overview with distribution
  - Review cards with user avatars
  - Filter and sort options
- **Primary Color Theme** - Consistent branding throughout

#### CoursePaymentScreen
Payment flow for course purchase.

**Note:** Since all courses are now free, this screen is primarily used for teacher subscriptions and other premium features.

**Features:**
- Order summary
- Payment method selection
- Mobile Money integration
- Card payment (Stripe)
- Promo code input
- Payment confirmation

#### MyCoursesScreen
User's enrolled courses.

**Features:**
- Course list with progress
- Continue learning buttons
- Completion status
- Certificate download
- Empty state for new users

#### LessonScreen
Individual lesson player.

**Features:**
- Video player with controls
- Lesson content (text, images)
- Resources download
- Progress tracking
- Next/Previous navigation
- Mark as complete

#### ResourcesScreen
Learning resources and downloads.

**Features:**
- PDF documents
- Audio files
- Downloadable materials
- Category organization

---

### Practice Screens

#### FreeQuizScreen
Interactive quiz with multiple categories.

**Features:**
- 8 quiz categories
- 48+ questions
- Multiple choice format
- Instant feedback
- Explanations for answers
- Score tracking
- XP rewards

#### FlashcardsScreen
Vocabulary flashcard system.

**Features:**
- 8 vocabulary decks
- 3D flip animation
- Spaced repetition
- Know/Don't know tracking
- Progress per deck
- Pronunciation (TTS)

#### GrammarDrillsScreen
Grammar exercises.

**Features:**
- 8 grammar topics
- Fill-in-blank exercises
- Multiple choice
- Hint system
- Detailed explanations
- Progress tracking

#### SpeakingPracticeScreen
Speaking and pronunciation practice.

**Features:**
- 8 real-life scenarios
- Phonetic guides
- Audio playback
- Recording (simulated)
- Pronunciation tips

#### ListeningPracticeScreen
Listening comprehension exercises.

**Features:**
- 8 audio categories
- Audio playback controls
- Comprehension questions
- Speed adjustment
- Transcript toggle

#### WritingPracticeScreen
Writing exercises.

**Features:**
- Writing prompts
- Text input area
- Word count
- Grammar suggestions
- Submit for review

#### WordOfTheDayScreen
Daily vocabulary feature.

**Features:**
- Featured word
- Pronunciation (audio)
- Phonetic spelling
- Definition
- Example sentences
- Related words
- Daily streak tracking

---

### Community Screens

#### StudyGroupsScreen
Study groups listing.

**Features:**
- Group cards with member count
- Category filters
- Search groups
- Create group button
- Join group action

#### StudyGroupDetailScreen
Group chat and details (6500+ lines).

**Features:**
- Group header with info
- Member list
- Real-time chat (iMessage-style)
- Message reactions (double-tap)
- Voice messages
- Image/document sharing
- Voice/Video calls (FaceTime-style)
- Group settings (for admin)
- Member management
- Leave group option

#### CreateStudyGroupScreen
Create new study group.

**Features:**
- Group name input
- Description
- Category selection
- Privacy settings
- Cover image upload
- Create button

#### DiscussionsScreen
Community discussions.

**Features:**
- Discussion list
- Category filters
- Sort options
- Create discussion button
- Search discussions

#### DiscussionDetailScreen
Discussion thread.

**Features:**
- Original post
- Replies thread
- Like/reaction
- Reply input
- Share option

#### CreateDiscussionScreen
Create new discussion.

**Features:**
- Title input
- Content editor
- Category selection
- Tag selection
- Post button

#### QandAForumScreen
Question and answer forum.

**Features:**
- Questions list
- Category filters
- Sort by votes/recent
- Ask question button
- Search questions

#### QuestionDetailScreen
Question and answers thread.

**Features:**
- Question display
- Answers list
- Vote up/down
- Accept answer (author)
- Add answer input

#### CreateQuestionScreen
Ask a new question.

**Features:**
- Title input
- Question body
- Category selection
- Tags
- Submit button

#### ShareProgressScreen
Share learning progress.

**Features:**
- Progress visualization
- Achievement cards
- Share to social
- Custom message

---

### Profile & Settings Screens

#### AchievementsScreen
User achievements and badges.

**Features:**
- Badge grid
- Achievement progress
- Unlock conditions
- Statistics

#### LeaderboardScreen
Global rankings with premium design.

**Features:**
- Podium display (top 3)
- Rankings list
- Weekly/Monthly tabs
- User's rank highlight
- XP points display

#### NotificationsScreen
User notifications.

**Features:**
- Notification list
- Mark as read
- Filter by type
- Delete option

#### WishlistScreen
Saved courses.

**Features:**
- Wishlist courses
- Remove button
- Enroll action
- Empty state

---

### Content Screens

#### BlogListScreen
Learning articles.

**Features:**
- Article cards
- Category filters
- Featured articles
- Search

#### BlogDetailScreen
Premium article reader with enhanced reading experience.

**Features:**
- **Hero Section**
  - Parallax image with gradient overlay
  - Smooth scroll animations
  - Category badge with icon
- **Author Card**
  - Avatar with gradient placeholder
  - Author name and role
  - Follow button with primary color
- **Action Buttons**
  - Like, Save, and Download actions
  - Visual feedback for active states
  - Primary color theme
- **Content Formatting**
  - Typography with adjustable font size
  - Styled headings, paragraphs, quotes, and lists
  - French phrase highlighting
  - Text-to-speech for French phrases
- **Reading Features**
  - Progress bar at top
  - Reading progress card
  - Completion celebration
  - Font size adjustment panel
  - Text-to-speech controls
- **Additional Features**
  - Tags section with primary color
  - Share buttons with social icons
  - Offline download support
  - Completion tracking with XP rewards
- **Primary Color Theme** - Consistent branding throughout

#### BrowseTopicsScreen
Topic browser.

**Features:**
- Topic categories
- Topic cards
- Subtopics
- Course suggestions

#### ContactScreen
Contact form.

**Features:**
- Name input
- Email input
- Subject
- Message
- Submit button

---

### Instructor Screens

#### TeachersScreen
Teacher profiles.

**Features:**
- Teacher list
- Specializations
- Course count
- Rating

#### StudentManagementScreen
Manage enrolled students.

**Features:**
- Student list
- Search students
- Progress view
- Send message

#### AnalyticsDashboardScreen
Analytics and insights.

**Features:**
- Revenue charts
- Enrollment stats
- Course performance
- Student engagement

#### ManageSampleVideosScreen
Sample video management.

**Features:**
- Video list
- Upload new
- Edit/Delete
- Preview

#### AdvancedVideoHostingScreen
Video hosting features.

**Features:**
- Video library
- Upload management
- Quality settings
- Analytics

#### TeacherSubscriptionPaymentScreen
Instructor subscription.

**Features:**
- Plan options
- Payment flow
- Billing history

---

## Components Library

### Core UI Components

#### `CustomTabBar`
iOS-style bottom tab navigation.

```javascript
<CustomTabBar
  state={state}
  descriptors={descriptors}
  navigation={navigation}
/>
```

#### `PremiumButton`
Gradient-styled button.

```javascript
<PremiumButton
  title="Get Started"
  onPress={handlePress}
  variant="primary" // primary, secondary, outline
  loading={false}
  disabled={false}
  icon="arrow-right"
/>
```

#### `PremiumCard`
Premium card container.

```javascript
<PremiumCard
  style={customStyle}
  onPress={handlePress}
  shadow="md" // sm, md, lg
>
  {children}
</PremiumCard>
```

#### `LoadingSpinner`
Loading indicator.

```javascript
<LoadingSpinner
  message="Loading courses..."
  size="large" // small, large
/>
```

#### `ErrorMessage`
Error display with retry.

```javascript
<ErrorMessage
  message="Failed to load data"
  onRetry={handleRetry}
/>
```

#### `Rating`
Star rating display.

```javascript
<Rating
  rating={4.5}
  size={16}
  showRating={true}
  count={120}
/>
```

---

### Course Components

#### `CourseCard`
Standard course card.

```javascript
<CourseCard
  course={courseData}
  onPress={() => navigate('CourseDetail', { id })}
  isHorizontal={false}
/>
```

#### `FeaturedCourseCard`
Featured course with gradient.

```javascript
<FeaturedCourseCard
  course={courseData}
  onPress={handlePress}
  index={0}
/>
```

#### `HorizontalCourseCard`
Horizontal layout card.

```javascript
<HorizontalCourseCard
  course={courseData}
  onPress={handlePress}
/>
```

---

### Gamification Components

#### `GamificationSystem`
XP and level display.

```javascript
<GamificationSystem
  xp={1250}
  level={5}
  streak={7}
  showDetails={true}
/>
```

#### `AchievementBadge`
Achievement display.

```javascript
<AchievementBadge
  achievement={{
    title: "First Course",
    icon: "trophy",
    unlocked: true
  }}
  size="large"
/>
```

#### `LearningStreak`
Streak tracker.

```javascript
<LearningStreak
  currentStreak={7}
  longestStreak={14}
/>
```

---

### Premium Components

#### `PremiumBadge`
Premium indicator badge.

```javascript
<PremiumBadge
  type="pro" // pro, featured, new
/>
```

#### `PremiumProgressBar`
Animated progress bar.

```javascript
<PremiumProgressBar
  progress={0.75}
  color="#6366F1"
  height={8}
/>
```

#### `PremiumStatsCard`
Statistics card.

```javascript
<PremiumStatsCard
  title="Courses Completed"
  value={12}
  icon="book"
  trend="+3 this week"
/>
```

---

### Utility Components

#### `SearchBar`
Search input.

```javascript
<SearchBar
  value={searchText}
  onChangeText={setSearchText}
  placeholder="Search courses..."
  onSubmit={handleSearch}
/>
```

#### `NetworkStatus`
Connection status banner.

```javascript
<NetworkStatus />
```

#### `ToastNotification`
Toast messages.

```javascript
<ToastNotification
  message="Course enrolled successfully!"
  type="success" // success, error, info
  visible={showToast}
  onHide={() => setShowToast(false)}
/>
```

---

## Context Providers

### AuthContext
Manages authentication state.

```javascript
const { user, isAuthenticated, login, logout, register } = useAuth();
```

**State:**
- `user` - Current user object
- `isAuthenticated` - Boolean
- `loading` - Loading state

**Methods:**
- `login(email, password)` - Login user
- `register(data)` - Register user
- `logout()` - Logout user
- `updateUser(data)` - Update profile

---

### ThemeContext
Manages app theme.

```javascript
const { isDarkMode, toggleTheme, colors } = useTheme();
```

**State:**
- `isDarkMode` - Boolean
- `colors` - Theme colors object

**Methods:**
- `toggleTheme()` - Toggle dark/light mode

---

### GamificationContext
Manages XP, streaks, achievements.

```javascript
const { xp, level, streak, achievements } = useGamification();
```

**State:**
- `xp` - Experience points
- `level` - Current level
- `streak` - Day streak
- `achievements` - Unlocked achievements

---

### WishlistContext
Manages course wishlist.

```javascript
const { wishlist, addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
```

---

## Services

### API Service (`src/services/api.js`)

```javascript
import api from '../services/api';

// GET request
const courses = await api.get('/courses');

// POST request
const response = await api.post('/auth/login', { email, password });

// With auth token
api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
```

### Offline Service (`src/services/offlineService.js`)

```javascript
import offlineService from '../services/offlineService';

// Initialize cache
await offlineService.initializeCache();

// Get from cache
const data = await offlineService.getFromCache('courses', 3600000);

// Save to cache
await offlineService.saveToCache('courses', coursesData);

// Clear cache
await offlineService.clearCache();
```

### Prefetch Service (`src/services/prefetchService.js`)

```javascript
import prefetchService from '../services/prefetchService';

// Prefetch critical data during splash
await prefetchService.prefetchCriticalData();

// Warm up cache
prefetchService.warmUpCache();
```

---

## Utilities

### helpers.js
```javascript
formatCurrency(100) // "GH₵ 100.00"
formatDuration(3600) // "1h 0m"
formatDate(date) // "Jan 1, 2025"
getInitials("John Doe") // "JD"
truncateText(text, 50) // "Text..."
validateEmail(email) // true/false
validatePhone(phone) // true/false
```

### responsive.js
```javascript
import { scale, verticalScale, moderateScale, fontSizes } from './responsive';

const styles = StyleSheet.create({
  container: {
    padding: scale(16),
    marginTop: verticalScale(20),
  },
  text: {
    fontSize: fontSizes.md,
  }
});
```

### premiumDesign.js
```javascript
import { premiumColors, premiumShadows, borderRadius, spacing } from './premiumDesign';

const styles = StyleSheet.create({
  card: {
    backgroundColor: premiumColors.neutral[50],
    borderRadius: borderRadius.lg,
    ...premiumShadows.md,
    padding: spacing.lg,
  }
});
```

---

## Database Models

### User
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  avatar: String,
  role: 'student' | 'instructor' | 'admin',
  xp: Number,
  level: Number,
  streak: Number,
  enrolledCourses: [ObjectId],
  achievements: [String],
  createdAt: Date
}
```

### Course
```javascript
{
  title: String,
  description: String,
  instructor: ObjectId (ref: User),
  category: String,
  level: 'beginner' | 'intermediate' | 'advanced',
  language: String,
  price: Number,
  currency: 'GHS',
  thumbnail: String,
  previewVideo: String,
  rating: Number,
  reviewCount: Number,
  enrollmentCount: Number,
  lessons: [ObjectId],
  isFeatured: Boolean,
  isPublished: Boolean,
  createdAt: Date
}
```

### Lesson
```javascript
{
  title: String,
  description: String,
  course: ObjectId (ref: Course),
  videoUrl: String,
  duration: Number,
  order: Number,
  resources: [{ name, url, type }],
  quiz: ObjectId (ref: Quiz),
  isPreview: Boolean
}
```

### StudyGroup
```javascript
{
  name: String,
  description: String,
  creator: ObjectId (ref: User),
  category: String,
  coverImage: String,
  members: [ObjectId],
  isPrivate: Boolean,
  messages: [{
    user: ObjectId,
    text: String,
    type: 'text' | 'image' | 'voice',
    mediaUrl: String,
    reactions: [{ user, emoji }],
    createdAt: Date
  }],
  createdAt: Date
}
```

### Quiz
```javascript
{
  title: String,
  lesson: ObjectId (ref: Lesson),
  questions: [{
    question: String,
    options: [String],
    correctAnswer: Number,
    explanation: String
  }],
  passingScore: Number,
  xpReward: Number
}
```

### Progress
```javascript
{
  user: ObjectId (ref: User),
  course: ObjectId (ref: Course),
  completedLessons: [ObjectId],
  currentLesson: ObjectId,
  progressPercentage: Number,
  totalTimeSpent: Number,
  lastAccessedAt: Date,
  isCompleted: Boolean,
  certificateUrl: String
}
```

### Payment
```javascript
{
  user: ObjectId (ref: User),
  course: ObjectId (ref: Course),
  amount: Number,
  currency: 'GHS',
  paymentMethod: 'stripe' | 'momo' | 'paypal',
  transactionId: String,
  status: 'pending' | 'completed' | 'failed',
  createdAt: Date
}
```

---

## Styling & Theming

### Color Palette

**Light Mode:**
```javascript
{
  primary: '#6366F1',      // Indigo
  background: '#FFFFFF',
  card: '#F9FAFB',
  text: '#111827',
  secondaryText: '#6B7280',
  border: '#E5E7EB',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B'
}
```

**Dark Mode:**
```javascript
{
  primary: '#818CF8',
  background: '#0F172A',
  card: '#1E293B',
  text: '#F9FAFB',
  secondaryText: '#94A3B8',
  border: '#334155',
  success: '#34D399',
  error: '#F87171',
  warning: '#FBBF24'
}
```

### Typography
```javascript
{
  heading: 28,
  xxxl: 24,
  xxl: 22,
  xl: 20,
  lg: 18,
  md: 16,
  sm: 14,
  xs: 12
}
```

---

## Security

### Authentication Flow
1. User registers/logs in
2. Server validates credentials
3. JWT token generated
4. Token stored in SecureStore
5. Token attached to API requests
6. Token refreshed before expiry

### Data Protection
- Passwords hashed with bcrypt
- JWT tokens with expiration
- HTTPS in production
- Input validation
- XSS protection
- Rate limiting

### Study Group Security
- Members-only chat access
- Login required to view messages
- Creator admin privileges

---

## Deployment

### Backend Deployment

**Heroku:**
```bash
cd backend
heroku create french-master-api
heroku config:set MONGODB_URI=... JWT_SECRET=...
git push heroku main
```

**Docker:**
```bash
docker build -t french-master-api .
docker run -p 5001:5001 --env-file .env french-master-api
```

### Frontend Deployment

**EAS Build:**
```bash
npm install -g eas-cli
eas login
eas build --platform android --profile preview
eas build --platform ios
eas submit --platform android
eas submit --platform ios
```

---

## Support

- **Email:** info@frenchmastergh.com
- **Website:** https://frenchmastergh.com

---

© 2024-2025 THE FRENCH MASTER GH. All rights reserved.
