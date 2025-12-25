# 🇫🇷 French Master GH

> Premium French & English Language Learning Platform with iOS-Style Experience

[![React Native](https://img.shields.io/badge/React%20Native-0.76.5-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-SDK%2052-black.svg)](https://expo.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Latest-green.svg)](https://www.mongodb.com/)
[![Performance](https://img.shields.io/badge/Performance-Optimized-brightgreen.svg)]()

A comprehensive, production-ready mobile application for learning French and English, featuring premium iOS-style UI/UX, advanced gamification, secure community study groups, offline support, and lightning-fast performance.

---

## 📋 Table of Contents

- [Features](#-features)
- [Screenshots](#-screenshots)
- [Quick Start](#-quick-start)
- [Complete Setup Commands](#-complete-setup-commands)
- [Project Structure](#-project-structure)
- [Technology Stack](#️-technology-stack)
- [API Endpoints](#-api-endpoints)
- [Screens Overview](#-screens-overview)
- [Components](#-components)
- [Services](#-services)
- [Context Providers](#-context-providers)
- [Security Features](#-security-features)
- [Theming](#-theming)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🎓 Learning Features
- **Premium Course Catalog** - Extensive French & English courses with video lessons
- **Interactive Lessons** - Video-based lessons with progress tracking
- **Word of the Day** - Daily vocabulary with pronunciation, phonetics, examples, and streaks
- **Practice Exercises** - Multiple practice modes:
  - 📝 **Quick Quiz** - 8 categories, 48 questions with explanations
  - 📖 **Grammar Drills** - 8 grammar topics, hint system, detailed feedback
  - 🎤 **Speaking Practice** - 8 real-life scenarios, phonetic guides, audio playback
  - 👂 **Listening Practice** - 8 audio categories, comprehension questions
  - 🃏 **Flashcards** - 8 vocabulary decks, 3D flip animation, spaced repetition
- **Progress Analytics** - Track learning progress with detailed insights
- **Certificates** - Earn certificates upon course completion

### 🎨 Premium iOS-Style Design
- **Beautiful UI/UX** - Professional native interface inspired by iOS
- **Dark/Light Mode** - Full theme support with smooth transitions
- **Premium Animations** - Smooth entrance animations, staggered reveals, parallax effects
- **Responsive Design** - Optimized for all screen sizes
- **Gradient Backgrounds** - Premium visual effects with floating orbs
- **Custom Tab Bar** - iOS-style navigation with haptic feedback

### 🎯 Advanced Gamification
- **Achievements System** - Unlock badges and achievements
- **Learning Streaks** - Maintain daily learning streaks with visual tracking
- **XP Points & Levels** - Earn points and level up with progress bars
- **Daily Goals** - Complete daily learning goals
- **Leaderboards** - Premium golden-themed ranking with podium display

### 👥 Secure Community Features
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

### 💳 Payment Integration
- **Multiple Payment Methods** - Stripe, PayPal, Mobile Money
- **Secure Transactions** - Industry-standard security
- **Free Courses** - Access free courses
- **Course Pricing** - Flexible pricing in GHS (Ghana Cedis)

### 👨‍🏫 Instructor Features
- **Student Management** - View and manage enrolled students
- **Course Creation** - Create and publish courses
- **Analytics Dashboard** - Track student progress
- **Subscription Plans** - Offer subscription-based access

---

## 📱 Screenshots

| Home Screen | Learn Screen | Practice Screen |
|-------------|--------------|-----------------|
| Premium header with stats | Course catalog | Training center |

| Community Hub | Study Groups | Group Chat |
|---------------|--------------|------------|
| Premium community hub | Study group cards | iOS iMessage-style chat |

| Profile | Login | Word of the Day |
|---------|-------|-----------------|
| Premium profile with XP | Modern login screen | Daily vocabulary |

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
git clone https://github.com/yourusername/french-master-gh.git
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

---

## 🛠 Complete Setup Commands

### Step 1: Create Project from Scratch

```bash
# Create new Expo project
npx create-expo-app@latest "FRENCH MASTER" --template blank
cd "FRENCH MASTER"

# Initialize git
git init
git add .
git commit -m "Initial commit"
```

### Step 2: Install Frontend Dependencies

```bash
# Core dependencies
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context
npm install react-native-gesture-handler react-native-reanimated

# UI Components
npm install expo-linear-gradient
npm install @expo/vector-icons
npm install react-native-svg

# API & State
npm install axios
npm install @react-native-async-storage/async-storage

# Media & Files
npm install expo-image-picker
npm install expo-document-picker
npm install expo-file-system
npm install expo-media-library
npm install expo-sharing
npm install expo-clipboard
npm install expo-speech

# Audio & Video
npm install expo-av
npm install expo-camera

# Utilities
npm install expo-haptics
npm install expo-status-bar

# All in one command:
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs react-native-screens react-native-safe-area-context react-native-gesture-handler react-native-reanimated expo-linear-gradient @expo/vector-icons react-native-svg axios @react-native-async-storage/async-storage expo-image-picker expo-document-picker expo-file-system expo-media-library expo-sharing expo-clipboard expo-av expo-camera expo-haptics expo-status-bar expo-speech
```

### Step 3: Create Backend

```bash
# Create backend folder
mkdir backend
cd backend

# Initialize Node.js project
npm init -y

# Install backend dependencies
npm install express mongoose dotenv cors bcryptjs jsonwebtoken
npm install multer cloudinary
npm install stripe
npm install socket.io
npm install nodemon --save-dev

# All in one command:
npm install express mongoose dotenv cors bcryptjs jsonwebtoken multer cloudinary stripe socket.io && npm install nodemon --save-dev
```

### Step 4: Configure Environment Variables

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

# Frontend URL
FRONTEND_URL=http://localhost:19006
```

### Step 5: Configure API URL

Update `src/services/api.js` with your IP:
```javascript
// Get your IP address
// Windows: ipconfig | findstr IPv4
// Mac/Linux: ifconfig | grep inet

const API_URL = 'http://YOUR_IP_ADDRESS:5001/api';
```

### Step 6: Running the Application

```bash
# Terminal 1: Start MongoDB (if local)
mongod

# Terminal 2: Start Backend
cd backend
npm run dev

# Terminal 3: Start Frontend
npx expo start --clear
```

---

## 📁 Project Structure

```
FRENCH MASTER/
├── App.js                          # Main app entry with navigation & splash
├── app.json                        # Expo configuration
├── package.json                    # Frontend dependencies
├── babel.config.js                 # Babel configuration
│
├── assets/                         # Static assets
│   ├── logo.jpeg                   # App logo
│   ├── french/                     # French course images
│   └── images/                     # Other images
│
├── screens/                        # Screen components
│   ├── Auth/
│   │   ├── LoginScreen.js          # Premium login screen
│   │   └── RegisterScreen.js       # Premium registration screen
│   ├── LearnerHomeScreen.js        # Optimized home with caching
│   ├── LearnScreen.js              # Course discovery
│   ├── PracticeScreen.js           # Training center hub
│   ├── CommunityScreen.js          # Community hub
│   ├── ProfileScreen.js            # User profile with XP
│   ├── WordOfTheDayScreen.js       # Daily vocabulary
│   ├── FreeQuizScreen.js           # Premium quiz (48 questions)
│   ├── GrammarDrillsScreen.js      # Grammar exercises (48)
│   ├── SpeakingPracticeScreen.js   # Speaking practice (48 phrases)
│   ├── ListeningPracticeScreen.js  # Listening exercises (48)
│   ├── FlashcardsScreen.js         # Vocabulary flashcards (48)
│   ├── StudyGroupsScreen.js        # Study groups list
│   ├── StudyGroupDetailScreen.js   # Secure group chat
│   ├── QandAForumScreen.js         # Q&A forum
│   ├── DiscussionsScreen.js        # Discussions
│   ├── LeaderboardScreen.js        # Premium leaderboard
│   ├── BlogListScreen.js           # Articles list
│   ├── BlogDetailScreen.js         # Article reader with TTS
│   └── ...
│
├── src/
│   ├── components/                 # Reusable UI components
│   │   ├── PremiumSplashScreen.js  # Animated splash screen
│   │   ├── SkeletonHome.js         # Home skeleton loader
│   │   ├── FastImage.js            # Cached image component
│   │   ├── CustomTabBar.js         # iOS-style tab bar
│   │   ├── LoadingSpinner.js       # Loading indicator
│   │   ├── PremiumErrorState.js    # Error display
│   │   └── ...
│   │
│   ├── context/                    # React Context providers
│   │   ├── AuthContext.js          # Authentication state
│   │   ├── ThemeContext.js         # Theme (dark/light)
│   │   ├── GamificationContext.js  # XP, streaks, levels
│   │   └── ...
│   │
│   ├── services/
│   │   ├── api.js                  # Axios API client
│   │   ├── offlineService.js       # Dual-layer caching
│   │   ├── prefetchService.js      # Data prefetching
│   │   └── gamificationService.js  # XP & streak logic
│   │
│   └── utils/
│       ├── helpers.js              # Utility functions
│       ├── responsive.js           # Responsive sizing
│       ├── premiumDesign.js        # Design tokens
│       └── courseImages.js         # Course image mapping
│
└── backend/                        # Backend API
    ├── server.js                   # Express server entry
    ├── package.json                # Backend dependencies
    ├── .env                        # Environment variables
    │
    ├── config/
    │   └── db.js                   # MongoDB connection
    │
    ├── models/                     # Mongoose schemas
    │   ├── User.js
    │   ├── Course.js
    │   ├── StudyGroup.js           # With reactions support
    │   └── ...
    │
    ├── routes/                     # API routes
    │   ├── auth.js
    │   ├── courses.js
    │   ├── studyGroups.js          # With reaction endpoints
    │   └── ...
    │
    └── middleware/
        ├── auth.js                 # JWT authentication
        └── ...
```

---

## 🛠️ Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React Native | 0.76.5 | Mobile framework |
| Expo | SDK 52 | Development platform |
| React Navigation | 6.x | Navigation library |
| React Context API | - | State management |
| Axios | 1.x | HTTP client |
| Expo Linear Gradient | - | Gradient effects |
| Expo AV | - | Audio/Video playback |
| Expo Speech | - | Text-to-speech |
| Expo Camera | - | Camera access |
| Expo File System | - | File operations & caching |
| react-native-gesture-handler | - | Swipe & tap gestures |

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

---

## 🧩 Services

### Offline Service (`src/services/offlineService.js`)
```javascript
// Initialize cache on app start
await offlineService.initializeCache();

// Memory cache (instant)
const data = offlineService.getFromMemoryCache('key');

// Persistent cache with expiry
const cached = await offlineService.getFromCache('key', maxAge);

// Save to both caches
await offlineService.saveToCache('key', data);

// Prefetch multiple resources
await offlineService.prefetchResources([...]);
```

### Prefetch Service (`src/services/prefetchService.js`)
```javascript
// Prefetch critical data during splash
await prefetchService.prefetchCriticalData();

// Warm up cache in background
prefetchService.warmUpCache();

// Prefetch user-specific data after login
await prefetchService.prefetchUserData(userId);
```

### Gamification Service (`src/services/gamificationService.js`)
```javascript
// Award XP for activities
await gamificationService.awardXP(user, amount, activity);

// Check and update streak
await gamificationService.checkAndUpdateStreak(user);

// Calculate level from XP
const level = gamificationService.calculateLevel(xp);
```

---

## 🔒 Security Features

### Study Group Security
Groups are protected with iOS-style security:

1. **Non-Authenticated Users**
   - See "Login Required" screen
   - Beautiful gradient overlay with lock icon
   - Security features explained
   - Sign in / Create account buttons

2. **Authenticated Non-Members**
   - See "Members Only" screen
   - Group preview with details
   - Features they'll unlock
   - Join button

3. **Members**
   - Full access to discussions
   - Send messages, reactions
   - Share media
   - Voice/video calls

### Membership Detection
Robust ID comparison handling all formats:
- ObjectId objects
- String IDs
- Nested user objects
- Creator vs member distinction

---

## 🎨 Theming

### Colors
```javascript
// Light Mode
primary: '#6366F1'      // Indigo
background: '#FFFFFF'   // White
card: '#F9FAFB'        // Light gray
text: '#111827'        // Dark gray

// Dark Mode
primary: '#818CF8'      // Light indigo
background: '#0F172A'   // Dark blue
card: '#1E293B'        // Slate
text: '#F9FAFB'        // White
```

### Premium Design Tokens
```javascript
premiumColors: {
  primary: { main: '#6366F1', light: '#818CF8' },
  accent: { orange: '#F59E0B', green: '#10B981' },
}

premiumShadows: {
  sm: { shadowColor, shadowOffset, shadowOpacity, shadowRadius },
  md: { ... },
  lg: { ... },
}
```

---

## 🧪 Testing

```bash
# Frontend tests
npm test

# Backend tests
cd backend
npm test

# Run with coverage
npm test -- --coverage
```

---

## 🚢 Deployment

### Backend Deployment (Heroku)

```bash
# Login to Heroku
heroku login

# Create app
heroku create french-master-api

# Set environment variables
heroku config:set JWT_SECRET=your-secret
heroku config:set NODE_ENV=production

# Deploy
git subtree push --prefix backend heroku main
```

### Frontend Deployment (EAS)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Build Android APK
eas build --platform android --profile preview

# Build iOS
eas build --platform ios

# Submit to stores
eas submit --platform android
eas submit --platform ios
```

---

## 🔧 Troubleshooting

### Common Issues

**1. Metro Bundler Cache**
```bash
npx expo start --clear
```

**2. Port Already in Use**
```bash
taskkill /F /IM node.exe  # Windows
pkill node                 # Mac/Linux
npx expo start --port 8090
```

**3. Network Error (Backend Connection)**
- Check backend is running: `cd backend && npm run dev`
- Verify IP address in `api.js`
- Check firewall allows port 5001

**4. Study Group Member Not Recognized**
- Logout and login again
- The enhanced `isMember` function handles all ID formats

**5. Slow Loading**
- Check if cache is working: Data should be instant after first load
- Clear cache if corrupted: `offlineService.clearCache()`

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

---

## 📝 License

© 2024-2025 THE FRENCH MASTER GH. All rights reserved.

---

## 📞 Support

- **Email**: info@frenchmastergh.com
- **Website**: https://frenchmastergh.com
- **GitHub Issues**: [Open an issue](https://github.com/yourusername/french-master-gh/issues)

---

## 🙏 Acknowledgments

- React Native community
- Expo team
- All contributors and testers
- French learners in Ghana and beyond

---

## 📊 App Statistics

| Metric | Value |
|--------|-------|
| Screens | 40+ |
| Components | 30+ |
| API Endpoints | 50+ |
| Practice Questions | 240+ |
| Vocabulary Words | 100+ |

---

**Made with ❤️ for French learners in Ghana and beyond**

🇫🇷 **French Master** - *Master French, One Day at a Time*
