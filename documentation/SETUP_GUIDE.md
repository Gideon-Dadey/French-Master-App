# 🛠 French Master GH - Complete Setup Guide

This guide will walk you through setting up the French Master GH application from scratch.

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

### Required Software

| Software | Version | Download Link |
|----------|---------|---------------|
| Node.js | 18+ | [nodejs.org](https://nodejs.org/) |
| npm | 9+ | Comes with Node.js |
| Git | Latest | [git-scm.com](https://git-scm.com/) |
| MongoDB | 6+ | [mongodb.com](https://www.mongodb.com/try/download/community) |
| VS Code | Latest | [code.visualstudio.com](https://code.visualstudio.com/) |

### Mobile Development

| Platform | Requirement |
|----------|-------------|
| iOS | Mac with Xcode, or Expo Go app |
| Android | Android Studio, or Expo Go app |

### Verify Installation

```bash
# Check Node.js
node --version
# Should output: v18.x.x or higher

# Check npm
npm --version
# Should output: 9.x.x or higher

# Check Git
git --version
# Should output: git version 2.x.x

# Check MongoDB
mongod --version
# Should output: db version v6.x.x or higher
```

---

## 🚀 Step-by-Step Setup

### Step 1: Clone or Create Project

**Option A: Clone existing repository**
```bash
git clone https://github.com/yourusername/french-master-gh.git
cd "FRENCH MASTER"
```

**Option B: Create new project**
```bash
# Create new Expo project
npx create-expo-app@latest "FRENCH MASTER" --template blank

# Navigate to project
cd "FRENCH MASTER"
```

---

### Step 2: Install Frontend Dependencies

```bash
# Install all frontend dependencies at once
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs react-native-screens react-native-safe-area-context react-native-gesture-handler react-native-reanimated expo-linear-gradient @expo/vector-icons react-native-svg axios expo-secure-store expo-image-picker expo-document-picker expo-file-system expo-media-library expo-sharing expo-clipboard expo-av expo-camera expo-haptics expo-status-bar
```

**Or install one by one:**

```bash
# Navigation
npm install @react-navigation/native
npm install @react-navigation/stack
npm install @react-navigation/bottom-tabs
npm install react-native-screens
npm install react-native-safe-area-context
npm install react-native-gesture-handler
npm install react-native-reanimated

# UI
npm install expo-linear-gradient
npm install @expo/vector-icons
npm install react-native-svg

# Data & State
npm install axios
npm install expo-secure-store

# Media
npm install expo-image-picker
npm install expo-document-picker
npm install expo-file-system
npm install expo-media-library
npm install expo-sharing
npm install expo-clipboard

# Audio/Video
npm install expo-av
npm install expo-camera

# Utilities
npm install expo-haptics
npm install expo-status-bar
```

---

### Step 3: Setup Backend

```bash
# Create backend directory
mkdir backend
cd backend

# Initialize package.json
npm init -y

# Install backend dependencies
npm install express mongoose dotenv cors bcryptjs jsonwebtoken multer cloudinary stripe socket.io

# Install dev dependencies
npm install nodemon --save-dev
```

**Update `backend/package.json`:**

```json
{
  "name": "french-master-backend",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "seed": "node seeder.js"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cloudinary": "^1.41.0",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.0.3",
    "multer": "^1.4.5-lts.1",
    "socket.io": "^4.7.2",
    "stripe": "^14.10.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
```

---

### Step 4: Create Backend Structure

```bash
# From backend directory
cd backend

# Create directories
mkdir -p config models routes middleware controllers uploads

# Create main files
touch server.js .env config/db.js

# Create models
touch models/User.js models/Course.js models/Lesson.js models/Progress.js models/Payment.js models/Review.js models/StudyGroup.js models/Notification.js models/Blog.js models/Question.js models/Discussion.js

# Create routes
touch routes/auth.js routes/courses.js routes/lessons.js routes/payments.js routes/progress.js routes/users.js routes/reviews.js routes/studyGroups.js routes/notifications.js routes/blog.js routes/questions.js routes/discussions.js routes/leaderboard.js routes/subscriptions.js

# Create middleware
touch middleware/auth.js middleware/error.js middleware/upload.js
```

---

### Step 5: Configure Environment Variables

**Create `backend/.env`:**

```env
# Server
NODE_ENV=development
PORT=5001

# Database
MONGODB_URI=mongodb://localhost:27017/frenchmaster

# JWT
JWT_SECRET=your-super-secret-jwt-key-make-it-long-and-random
JWT_EXPIRE=30d

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Stripe (for payments)
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:19006
```

---

### Step 6: Configure API URL in Frontend

**Find your computer's IP address:**

```bash
# Windows
ipconfig | findstr IPv4

# Mac/Linux
ifconfig | grep inet
```

**Update `src/services/api.js`:**

```javascript
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Replace with your IP address
const API_URL = 'http://192.168.0.135:5001/api';

console.log('API URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Add auth token to requests
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
```

---

### Step 7: Start MongoDB

**Option A: Local MongoDB**
```bash
# Start MongoDB service
mongod

# Or on Windows
net start MongoDB
```

**Option B: MongoDB Atlas (Cloud)**
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create free cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

---

### Step 8: Start Backend Server

```bash
# From backend directory
cd backend

# Start in development mode
npm run dev
```

You should see:
```
Server running on port 5001
MongoDB Connected: localhost
```

---

### Step 9: Start Frontend

```bash
# From project root
cd "FRENCH MASTER"

# Start Expo
npx expo start

# Or with cache clear
npx expo start --clear
```

---

### Step 10: Run on Device

**Option A: Expo Go (Recommended for development)**
1. Install "Expo Go" from App Store / Play Store
2. Scan QR code from terminal
3. App will load on your phone

**Option B: iOS Simulator (Mac only)**
```bash
npx expo start --ios
```

**Option C: Android Emulator**
```bash
npx expo start --android
```

---

## 🔧 Configuration Files

### `app.json`

```json
{
  "expo": {
    "name": "French Master GH",
    "slug": "french-master-gh",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/logo.jpeg",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/logo.jpeg",
      "resizeMode": "contain",
      "backgroundColor": "#0F172A"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.frenchmastergh.app"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/logo.jpeg",
        "backgroundColor": "#0F172A"
      },
      "package": "com.frenchmastergh.app"
    },
    "plugins": [
      "expo-secure-store",
      [
        "expo-image-picker",
        {
          "photosPermission": "Allow French Master to access your photos",
          "cameraPermission": "Allow French Master to access your camera"
        }
      ],
      [
        "expo-av",
        {
          "microphonePermission": "Allow French Master to access your microphone"
        }
      ],
      [
        "expo-camera",
        {
          "cameraPermission": "Allow French Master to access your camera"
        }
      ]
    ]
  }
}
```

### `babel.config.js`

```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-reanimated/plugin'],
  };
};
```

---

## 🐛 Troubleshooting

### Issue: "Unable to resolve module"
```bash
# Clear cache and reinstall
rm -rf node_modules
rm package-lock.json
npm install
npx expo start --clear
```

### Issue: "Network Error" on API calls
1. Ensure backend is running: `cd backend && npm run dev`
2. Check IP address is correct in `api.js`
3. Ensure phone and computer on same WiFi
4. Check firewall allows port 5001

### Issue: "Metro bundler cache"
```bash
# Clear all caches
rm -rf node_modules/.cache
rm -rf .expo
npx expo start --clear
```

### Issue: Port already in use
```bash
# Find and kill process on port
# Windows
netstat -ano | findstr :5001
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5001
kill -9 <PID>
```

### Issue: MongoDB connection failed
```bash
# Check MongoDB is running
mongosh

# Check connection string
echo $MONGODB_URI
```

---

## 📱 Testing on Physical Device

### Android
1. Enable USB debugging on phone
2. Connect via USB
3. Run `npx expo start --android`

### iOS
1. Install Expo Go from App Store
2. Scan QR code with camera
3. App opens in Expo Go

### Tunnel Mode (for network issues)
```bash
npx expo start --tunnel
```

---

## 🚀 Building for Production

### Android APK
```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Build APK
eas build --platform android --profile preview
```

### iOS Build
```bash
# Build for iOS (requires Apple Developer account)
eas build --platform ios
```

---

## 📞 Getting Help

- **Expo Documentation**: https://docs.expo.dev/
- **React Native Docs**: https://reactnative.dev/docs/getting-started
- **MongoDB Manual**: https://docs.mongodb.com/manual/

---

**Happy Coding! 🎉**
