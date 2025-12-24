# French Master GH - Complete Documentation

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Setup Guide](#setup-guide)
4. [API Documentation](#api-documentation)
5. [Components](#components)
6. [Screens](#screens)
7. [Styling & Theming](#styling--theming)
8. [Deployment](#deployment)
9. [Contributing](#contributing)

---

## Overview

**French Master GH** is a premium, full-stack mobile application for learning French. It features a modern React Native frontend with a Node.js/Express backend, providing a comprehensive language learning experience.

### Key Features

- 🎓 **Premium Course Catalog** - Extensive French courses with detailed descriptions
- 📱 **Modern UI/UX** - Premium design with dark/light mode support
- 🎯 **Gamification** - Achievements, streaks, and progress tracking
- 💳 **Payment Integration** - Stripe, PayPal, and Mobile Money support
- 📊 **Analytics Dashboard** - Track learning progress and insights
- 👥 **Community Features** - Discussions, reviews, and social learning
- 🔔 **Push Notifications** - Stay updated with course updates
- 🌐 **Multi-language** - Support for English and French interfaces
- 📚 **Blog & Resources** - Learning articles and educational content

---

## Architecture

### Frontend Architecture

```
FRENCH MASTER/
├── App.js                    # Main navigation setup
├── screens/                  # Screen components
│   ├── Auth/                # Authentication screens
│   ├── LandingScreen.js        # Welcome/landing page
│   ├── LearnerHomeScreen.js   # Main home screen
│   ├── LearnScreen.js         # Course discovery
│   ├── PracticeScreen.js      # Practice exercises
│   ├── CommunityScreen.js     # Community features
│   ├── ProfileScreen.js       # User profile
│   └── ...
├── src/
│   ├── components/           # Reusable UI components
│   ├── context/              # React Context providers
│   │   ├── AuthContext.js
│   │   ├── ThemeContext.js
│   │   ├── GamificationContext.js
│   │   └── WishlistContext.js
│   ├── services/            # API services
│   │   └── api.js
│   ├── hooks/               # Custom React hooks
│   └── utils/               # Utility functions
└── backend/                 # Backend API
    ├── server.js
    ├── models/              # Mongoose models
    ├── routes/              # API routes
    └── middleware/         # Auth & validation
```

### Technology Stack

**Frontend:**
- React Native 0.81.5
- Expo SDK 54
- React Navigation 6
- React Context API
- Axios for API calls
- Expo Linear Gradient
- React Native Reanimated

**Backend:**
- Node.js 18+
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Stripe Payment Integration
- Socket.io for real-time features
- AWS S3 for file storage

---

## Setup Guide

### Prerequisites

- Node.js 18+ and npm
- MongoDB (local or Atlas)
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator / Android Emulator / Physical device
- Git

### Frontend Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd "FRENCH MASTER"
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure API endpoint**
Edit `src/services/api.js`:
```javascript
const API_URL = __DEV__ 
  ? 'http://localhost:5000/api' 
  : 'https://your-api-url.com/api';
```

4. **Start development server**
```bash
npm start
# Or
expo start
```

5. **Run on device**
```bash
# iOS
npm run ios

# Android
npm run android
```

### Backend Setup

1. **Navigate to backend directory**
```bash
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Create environment file**
```bash
cp .env.example .env
```

4. **Configure environment variables**
Edit `.env`:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/frenchmaster
# Or MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/frenchmaster

JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your-refresh-token-secret
JWT_REFRESH_EXPIRE=30d

# Stripe (optional)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# AWS S3 (optional)
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
AWS_BUCKET_NAME=french-master-uploads

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-password
```

5. **Start MongoDB**
```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas (cloud)
```

6. **Seed database (optional)**
```bash
npm run seed        # Seed courses
npm run seed:blog    # Seed blog posts
```

7. **Start backend server**
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

### Verify Setup

1. **Backend is running**: Visit `http://localhost:5000/api/health` (if implemented)
2. **Frontend connects**: Check Expo DevTools for API connection
3. **Database connected**: Check backend console for MongoDB connection message

---

## API Documentation

### Base URL
```
Development: http://localhost:5000/api
Production: https://api.frenchmastergh.com/api
```

### Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

### Endpoints

#### Authentication

**POST** `/api/auth/register`
- Register a new user
- Body: `{ name, email, password, phone? }`
- Returns: `{ success, token, refreshToken, user }`

**POST** `/api/auth/login`
- Login user
- Body: `{ email, password }`
- Returns: `{ success, token, refreshToken, user }`

**GET** `/api/auth/me`
- Get current user (Protected)
- Returns: `{ success, user }`

**POST** `/api/auth/refresh`
- Refresh access token
- Body: `{ refreshToken }`
- Returns: `{ success, token }`

#### Courses

**GET** `/api/courses`
- Get all courses with filters
- Query params: `?category=`, `?level=`, `?search=`, `?page=`, `?limit=`
- Returns: `{ success, data: [courses], pagination }`

**GET** `/api/courses/:id`
- Get course details
- Returns: `{ success, data: course }`

**GET** `/api/courses/featured/list`
- Get featured courses
- Returns: `{ success, data: [courses] }`

#### Lessons

**GET** `/api/lessons/course/:courseId`
- Get all lessons for a course
- Returns: `{ success, data: [lessons] }`

**GET** `/api/lessons/:id`
- Get lesson details
- Returns: `{ success, data: lesson }`

**POST** `/api/lessons/:id/progress`
- Update lesson progress (Protected)
- Body: `{ completed: boolean, progress: number }`
- Returns: `{ success, data: progress }`

#### Payments

**POST** `/api/payments/create-intent`
- Create payment intent (Protected)
- Body: `{ courseId, paymentMethod }`
- Returns: `{ success, clientSecret, paymentIntentId }`

**POST** `/api/payments/confirm`
- Confirm payment and enroll (Protected)
- Body: `{ paymentId, transactionId }`
- Returns: `{ success, message, payment }`

**GET** `/api/payments/history`
- Get payment history (Protected)
- Returns: `{ success, data: [payments] }`

#### Progress

**GET** `/api/progress/course/:courseId`
- Get course progress (Protected)
- Returns: `{ success, data: progress }`

**GET** `/api/progress/dashboard`
- Get dashboard stats (Protected)
- Returns: `{ success, data: { stats, courses, achievements } }`

#### Reviews

**GET** `/api/reviews/course/:courseId`
- Get course reviews
- Returns: `{ success, data: [reviews] }`

**POST** `/api/reviews`
- Create review (Protected)
- Body: `{ courseId, rating, comment }`
- Returns: `{ success, data: review }`

#### Blog

**GET** `/api/blog`
- Get all blog posts
- Query params: `?category=`, `?page=`, `?limit=`
- Returns: `{ success, data: [posts], pagination }`

**GET** `/api/blog/:id`
- Get blog post details
- Returns: `{ success, data: post }`

#### Wishlist

**GET** `/api/wishlist`
- Get user wishlist (Protected)
- Returns: `{ success, data: [courses] }`

**POST** `/api/wishlist/:courseId`
- Add to wishlist (Protected)
- Returns: `{ success, message }`

**DELETE** `/api/wishlist/:courseId`
- Remove from wishlist (Protected)
- Returns: `{ success, message }`

#### Admin Student Management

**GET** `/api/admin/students`
- Get all students (Protected - Admin Only)
- Query params: `?page=`, `?limit=`, `?search=`
- Returns: `{ success, data: [students], pagination }`

**GET** `/api/admin/students/:id`
- Get student by ID (Protected - Admin Only)
- Returns: `{ success, data: student }`

**PUT** `/api/admin/students/:id`
- Update student (Protected - Admin Only)
- Body: `{ name?, email?, phone?, role? }`
- Returns: `{ success, data: student, message }`

**DELETE** `/api/admin/students/:id`
- Delete student (Protected - Admin Only)
- Returns: `{ success, message }`

#### Instructor Students

**GET** `/api/users/instructor/students`
- Get students enrolled in instructor's courses (Protected - Instructor/Admin)
- Query params: `?page=`, `?limit=`, `?search=`, `?courseId=`
- Returns: `{ success, data: [students], pagination }`

**GET** `/api/users/instructor/students/:id`
- Get student details (Protected - Instructor/Admin)
- Returns: `{ success, data: student }`
- Note: Only returns if student is enrolled in instructor's courses

---

## Components

### Core Components

#### `TabBarIcon`
Custom tab bar icon component with avatar support for Profile tab.

**Props:**
- `focused`: boolean
- `route`: string (route name)
- `color`: string
- `inactiveColor`: string

#### `CourseCard`
Premium course card component with ratings, badges, and pricing.

**Props:**
- `course`: object (course data)
- `onPress`: function
- `style`: object
- `isHorizontal`: boolean

#### `FeaturedCourseCard`
Enhanced course card for featured courses with gradient overlays.

**Props:**
- `course`: object
- `onPress`: function
- `index`: number

#### `Rating`
Star rating component.

**Props:**
- `rating`: number (0-5)
- `size`: number
- `showRating`: boolean

#### `PremiumButton`
Premium styled button with gradient support.

**Props:**
- `title`: string
- `onPress`: function
- `variant`: 'primary' | 'secondary' | 'outline'
- `loading`: boolean

#### `LoadingSpinner`
Loading indicator component.

**Props:**
- `message`: string

#### `ErrorMessage`
Error display component with retry option.

**Props:**
- `message`: string
- `onRetry`: function

### Context Providers

#### `AuthContext`
Manages user authentication state.

**Methods:**
- `login(email, password)`
- `register(name, email, password, phone)`
- `logout()`
- `updateUser(data)`
- `refreshToken()`

**State:**
- `user`: object | null
- `isAuthenticated`: boolean
- `loading`: boolean

#### `ThemeContext`
Manages theme (light/dark mode).

**Methods:**
- `toggleTheme()`

**State:**
- `isDarkMode`: boolean
- `colors`: object (theme colors)
- `theme`: object

#### `GamificationContext`
Manages gamification features (achievements, streaks, points).

**State:**
- `points`: number
- `streak`: number
- `achievements`: array
- `level`: number

#### `WishlistContext`
Manages user wishlist.

**Methods:**
- `addToWishlist(courseId)`
- `removeFromWishlist(courseId)`
- `isInWishlist(courseId)`: boolean

**State:**
- `wishlist`: array

#### `StudentContext`
Manages admin student management (admin only).

**Methods:**
- `loadStudents(params)`: Load students with pagination
- `getStudentById(studentId)`: Get student details
- `updateStudent(studentId, data)`: Update student information
- `deleteStudent(studentId)`: Delete student account

**State:**
- `students`: array
- `loading`: boolean
- `pagination`: object

**Notes:**
- Only available to users with `admin` role
- Auto-refreshes after updates/deletions
- Silently handles authentication errors

#### `InstructorStudentContext`
Manages instructor student viewing (instructor/admin only).

**Methods:**
- `loadStudents(params)`: Load students enrolled in instructor's courses
- `getStudentById(studentId)`: Get student details

**State:**
- `students`: array
- `loading`: boolean
- `pagination`: object

**Notes:**
- Available to users with `instructor` or `admin` role
- Only shows students enrolled in instructor's courses
- Read-only access for instructors

---

## Screens

### Authentication Screens

#### `LandingScreen`
Welcome screen with app introduction, stats, features, and call-to-action buttons.

**Features:**
- Premium gradient background
- App statistics
- Feature cards
- Login/Register buttons

#### `LoginScreen`
User login screen with email/password and social login options.

**Features:**
- Premium form design
- Focus states
- Password visibility toggle
- Social login (Google, Facebook)
- Forgot password link

#### `RegisterScreen`
User registration screen.

**Features:**
- Multi-field form
- Password confirmation
- Validation
- Premium styling

### Main Screens

#### `LearnerHomeScreen`
Main home screen with categories, courses, and blog posts.

**Features:**
- Premium header with gradient
- Search bar
- Category filters
- Top courses section
- Recent blog posts
- Theme toggle
- Notifications

#### `LearnScreen`
Course discovery and learning hub.

**Features:**
- Learning statistics dashboard
- Quick actions
- Category filters
- Featured courses
- All courses with search
- Premium card designs

#### `PracticeScreen`
Practice and exercise hub.

**Features:**
- Practice statistics
- Interactive flashcards (3D flip)
- Practice modes grid
- Daily challenges
- Quick practice sessions
- Recent achievements

#### `CommunityScreen`
Community and social features.

**Features:**
- Community statistics
- Category filters
- Trending topics
- Recent discussions
- Community features grid

#### `ProfileScreen`
User profile and settings.

**Features:**
- Premium avatar with edit
- Statistics dashboard
- Progress visualization
- Quick actions
- Account settings
- Dark mode toggle
- More options

### Course Screens

#### `CoursesScreen`
Course catalog with filters and search.

**Features:**
- Premium header
- Search bar
- Filter button with badge
- View mode toggle (list/grid)
- Advanced filters panel
- Premium course cards

#### `CourseDetailScreen`
Detailed course information page.

**Features:**
- Premium video/image header
- Enhanced description
- What you'll learn section
- Course highlights
- Requirements
- Course curriculum (expandable)
- Instructor section
- Reviews section
- Premium enrollment button

#### `MyCoursesScreen`
User's enrolled courses.

**Features:**
- Course list
- Progress tracking
- Continue learning buttons

#### `LessonScreen`
Individual lesson player.

**Features:**
- Video player
- Lesson content
- Progress tracking
- Navigation between lessons

### Other Screens

#### `BlogListScreen`
Blog posts listing.

**Features:**
- Blog post cards
- Category filters
- Search functionality

#### `BlogDetailScreen`
Individual blog post view.

**Features:**
- Full article content
- Related posts
- Share functionality

#### `WishlistScreen`
User's wishlist.

**Features:**
- Wishlist courses
- Remove functionality

#### `NotificationsScreen`
User notifications.

**Features:**
- Notification list
- Mark as read
- Filter options

#### `AchievementsScreen`
User achievements and badges.

**Features:**
- Achievement badges
- Progress tracking
- Statistics

---

## Styling & Theming

### Theme System

The app uses a comprehensive theme system with light and dark mode support.

**Primary Colors:**
- Light Mode: `#9C27B0` (Premium Purple)
- Dark Mode: `#BB86FC` (Light Purple)

**Theme Structure:**
```javascript
{
  background: string,
  secondaryBackground: string,
  tertiaryBackground: string,
  text: string,
  secondaryText: string,
  border: string,
  primary: string,
  primaryHover: string,
  success: string,
  error: string,
  warning: string,
  card: string,
  shadow: string
}
```

### Premium Design System

Located in `src/utils/premiumDesign.js`:

**Colors:**
- Primary: Indigo/Purple gradient
- Accent: Gold, Emerald, Rose, Sky
- Neutral: 50-900 scale

**Shadows:**
- `sm`, `md`, `lg`, `xl`, `premium`

**Border Radius:**
- `sm`, `base`, `md`, `lg`, `xl`, `2xl`, `3xl`, `full`

**Spacing:**
- `xs`, `sm`, `md`, `base`, `lg`, `xl`, `2xl`, `3xl`, `4xl`, `5xl`

### Responsive Design

Located in `src/utils/responsive.js`:

**Breakpoints:**
- Small: < 375px
- Medium: 375px - 768px
- Large: > 768px

**Font Sizes:**
- `xs`, `sm`, `md`, `lg`, `xl`, `xxl`, `xxxl`, `heading`

**Spacing:**
- Responsive spacing based on screen size

---

## Deployment

### Backend Deployment

#### Option 1: Heroku

1. **Install Heroku CLI**
```bash
npm install -g heroku
```

2. **Login to Heroku**
```bash
heroku login
```

3. **Create app**
```bash
cd backend
heroku create french-master-api
```

4. **Set environment variables**
```bash
heroku config:set MONGODB_URI=...
heroku config:set JWT_SECRET=...
# ... other variables
```

5. **Deploy**
```bash
git push heroku main
```

#### Option 2: AWS EC2

1. **Launch EC2 instance**
2. **Install Node.js and MongoDB**
3. **Clone repository**
4. **Set up PM2**
```bash
npm install -g pm2
pm2 start server.js
pm2 save
pm2 startup
```

#### Option 3: Docker

1. **Build image**
```bash
cd backend
docker build -t french-master-api .
```

2. **Run container**
```bash
docker run -p 5000:5000 --env-file .env french-master-api
```

3. **Docker Compose**
```bash
docker-compose up -d
```

### Frontend Deployment

#### Expo Application Services (EAS)

1. **Install EAS CLI**
```bash
npm install -g eas-cli
```

2. **Login**
```bash
eas login
```

3. **Configure**
```bash
eas build:configure
```

4. **Build**
```bash
# iOS
eas build --platform ios

# Android
eas build --platform android

# Both
eas build --platform all
```

5. **Submit to stores**
```bash
eas submit --platform ios
eas submit --platform android
```

#### Environment Variables

Update `app.json` or use EAS secrets:
```bash
eas secret:create --scope project --name API_URL --value https://api.frenchmastergh.com/api
```

### MongoDB Atlas Setup

1. **Create cluster** on MongoDB Atlas
2. **Get connection string**
3. **Update `.env`** with connection string
4. **Whitelist IP addresses** in Atlas dashboard

---

## Contributing

### Development Workflow

1. **Fork the repository**
2. **Create feature branch**
```bash
git checkout -b feature/amazing-feature
```

3. **Make changes**
4. **Commit changes**
```bash
git commit -m "Add amazing feature"
```

5. **Push to branch**
```bash
git push origin feature/amazing-feature
```

6. **Open Pull Request**

### Code Style

- Use ES6+ JavaScript
- Follow React Native best practices
- Use functional components with hooks
- Keep components small and focused
- Add comments for complex logic
- Use meaningful variable names

### Testing

Before submitting PR:
- Test on iOS and Android
- Test in light and dark mode
- Verify API integration
- Check for console errors
- Test edge cases

### Commit Messages

Use clear, descriptive commit messages:
```
feat: Add premium course card component
fix: Resolve navigation issue in dark mode
docs: Update API documentation
style: Improve button styling
refactor: Simplify authentication flow
```

---

## Support

For support:
- Email: info@frenchmastergh.com
- Website: https://frenchmastergh.com
- GitHub Issues: [Repository Issues]

---

## License

© 2025 THE FRENCH MASTER GH. All rights reserved.

---

**Last Updated:** January 2025
**Version:** 1.0.0

