# 📚 French Master GH - Commands Reference

Complete reference of all commands used to create, develop, and deploy the French Master GH application.

---

## 🏗 Project Creation Commands

### Create New Expo Project
```bash
npx create-expo-app@latest "FRENCH MASTER" --template blank
cd "FRENCH MASTER"
```

### Initialize Git Repository
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/french-master-gh.git
git push -u origin main
```

---

## 📦 Frontend Dependency Installation

### All-in-One Installation
```bash
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs react-native-screens react-native-safe-area-context react-native-gesture-handler react-native-reanimated expo-linear-gradient @expo/vector-icons react-native-svg axios expo-secure-store expo-image-picker expo-document-picker expo-file-system expo-media-library expo-sharing expo-clipboard expo-av expo-camera expo-haptics expo-status-bar
```

### Individual Package Installation

#### Navigation
```bash
npm install @react-navigation/native
npm install @react-navigation/stack
npm install @react-navigation/bottom-tabs
npm install react-native-screens
npm install react-native-safe-area-context
npm install react-native-gesture-handler
npm install react-native-reanimated
```

#### UI Components
```bash
npm install expo-linear-gradient
npm install @expo/vector-icons
npm install react-native-svg
```

#### Data & Storage
```bash
npm install axios
npm install expo-secure-store
npm install @react-native-async-storage/async-storage
```

#### Media & Files
```bash
npm install expo-image-picker
npm install expo-document-picker
npm install expo-file-system
npm install expo-media-library
npm install expo-sharing
npm install expo-clipboard
```

#### Audio & Video
```bash
npm install expo-av
npm install expo-camera
```

#### Utilities
```bash
npm install expo-haptics
npm install expo-status-bar
npm install expo-font
npm install expo-splash-screen
```

---

## 🖥 Backend Setup Commands

### Create Backend Directory
```bash
mkdir backend
cd backend
npm init -y
```

### Install Backend Dependencies
```bash
# All-in-one
npm install express mongoose dotenv cors bcryptjs jsonwebtoken multer cloudinary stripe socket.io
npm install nodemon --save-dev

# Individual packages
npm install express
npm install mongoose
npm install dotenv
npm install cors
npm install bcryptjs
npm install jsonwebtoken
npm install multer
npm install cloudinary
npm install stripe
npm install socket.io
npm install nodemon --save-dev
```

### Create Backend Folder Structure
```bash
# From backend directory
mkdir -p config models routes middleware controllers uploads

# Create files
touch server.js .env config/db.js

# Models
touch models/User.js models/Course.js models/Lesson.js models/Progress.js models/Payment.js models/Review.js models/StudyGroup.js models/Notification.js models/Blog.js models/Question.js models/Discussion.js

# Routes
touch routes/auth.js routes/courses.js routes/lessons.js routes/payments.js routes/progress.js routes/users.js routes/reviews.js routes/studyGroups.js routes/notifications.js routes/blog.js routes/questions.js routes/discussions.js routes/leaderboard.js routes/subscriptions.js

# Middleware
touch middleware/auth.js middleware/error.js middleware/upload.js
```

---

## 📂 Frontend Structure Commands

### Create Source Directories
```bash
mkdir -p src/components
mkdir -p src/context
mkdir -p src/services
mkdir -p src/hooks
mkdir -p src/utils
mkdir -p screens/Auth
mkdir -p assets/images
mkdir -p assets/fonts
mkdir -p components
```

### Create Source Files
```bash
# Context files
touch src/context/AuthContext.js
touch src/context/ThemeContext.js
touch src/context/GamificationContext.js
touch src/context/CurrencyContext.js
touch src/context/StudentContext.js

# Service files
touch src/services/api.js

# Utility files
touch src/utils/helpers.js
touch src/utils/responsive.js
touch src/utils/premiumDesign.js
touch src/utils/courseImages.js

# Component files
touch src/components/LoadingSpinner.js
touch src/components/ErrorMessage.js
touch src/components/CustomTabBar.js
touch src/components/TabBarIcon.js
touch src/components/Rating.js
touch src/components/WishlistButton.js

# Screen files
touch screens/LandingScreen.js
touch screens/HomeScreen.js
touch screens/LearnScreen.js
touch screens/PracticeScreen.js
touch screens/CommunityScreen.js
touch screens/ProfileScreen.js
touch screens/CourseDetailScreen.js
touch screens/LessonScreen.js
touch screens/StudyGroupsScreen.js
touch screens/StudyGroupDetailScreen.js
touch screens/BlogDetailScreen.js
touch screens/QuestionDetailScreen.js
touch screens/DiscussionDetailScreen.js
touch screens/TeachersScreen.js
touch screens/Auth/LoginScreen.js
touch screens/Auth/RegisterScreen.js
```

---

## 🚀 Running the Application

### Start MongoDB (Local)
```bash
# Start MongoDB service
mongod

# Windows Service
net start MongoDB

# Check MongoDB status
mongosh
```

### Start Backend Server
```bash
cd backend
npm run dev

# Or production mode
npm start
```

### Start Frontend (Expo)
```bash
# Standard start
npx expo start

# Clear cache and start
npx expo start --clear

# Start with tunnel (for network issues)
npx expo start --tunnel

# Start on specific port
npx expo start --port 8090

# Start for specific platform
npx expo start --ios
npx expo start --android
npx expo start --web
```

### Reload App
```bash
# In terminal, press:
r  # Reload app
m  # Toggle menu
j  # Open debugger
```

---

## 🔧 Troubleshooting Commands

### Clear Caches
```bash
# Clear Expo cache
rm -rf .expo
rm -rf node_modules/.cache

# Clear Metro bundler cache
npx expo start --clear

# Full cache clear
rm -rf node_modules/.cache .expo
rm -rf %TEMP%/metro-*      # Windows
rm -rf /tmp/metro-*        # Mac/Linux
```

### Reinstall Dependencies
```bash
# Frontend
rm -rf node_modules
rm package-lock.json
npm install

# Backend
cd backend
rm -rf node_modules
rm package-lock.json
npm install
```

### Kill Node Processes
```bash
# Windows
taskkill /F /IM node.exe

# Mac/Linux
pkill node
killall node
```

### Find Process Using Port
```bash
# Windows
netstat -ano | findstr :5001
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5001
kill -9 <PID>
```

### Check Network IP Address
```bash
# Windows
ipconfig | findstr IPv4

# Mac
ifconfig | grep inet

# Linux
ip addr show
```

---

## 🔒 Firewall Commands (Windows)

### Allow Port Through Firewall
```bash
# Open PowerShell as Administrator
netsh advfirewall firewall add rule name="French Master Backend" dir=in action=allow protocol=tcp localport=5001
```

### Check Firewall Rules
```bash
netsh advfirewall firewall show rule name="French Master Backend"
```

---

## 📱 Build & Deploy Commands

### Install EAS CLI
```bash
npm install -g eas-cli
```

### EAS Login & Setup
```bash
eas login
eas build:configure
```

### Build Android
```bash
# Development build (APK)
eas build --platform android --profile preview

# Production build (AAB)
eas build --platform android --profile production
```

### Build iOS
```bash
# Development build
eas build --platform ios --profile development

# Production build
eas build --platform ios --profile production
```

### Submit to Stores
```bash
# Google Play Store
eas submit --platform android

# Apple App Store
eas submit --platform ios
```

### Over-the-Air Updates
```bash
# Publish update
eas update --branch production --message "Bug fixes"
```

---

## 🗃 Git Commands

### Basic Git Workflow
```bash
# Check status
git status

# Add all changes
git add .

# Commit changes
git commit -m "Your commit message"

# Push to remote
git push origin main

# Pull latest changes
git pull origin main
```

### Branch Management
```bash
# Create and switch to new branch
git checkout -b feature/new-feature

# Switch branches
git checkout main

# Merge branch
git merge feature/new-feature

# Delete branch
git branch -d feature/new-feature
```

### Stash Changes
```bash
# Stash changes
git stash

# Apply stashed changes
git stash pop

# List stashes
git stash list
```

---

## 🗄 MongoDB Commands

### MongoDB Shell (mongosh)
```bash
# Connect to MongoDB
mongosh

# Show databases
show dbs

# Use database
use frenchmaster

# Show collections
show collections

# Find all documents
db.users.find()

# Find with query
db.courses.find({ category: 'french' })

# Insert document
db.courses.insertOne({ title: 'Basic French', category: 'french' })

# Update document
db.users.updateOne({ email: 'test@test.com' }, { $set: { name: 'New Name' } })

# Delete document
db.users.deleteOne({ email: 'test@test.com' })

# Drop collection
db.users.drop()

# Drop database
db.dropDatabase()
```

### MongoDB Export/Import
```bash
# Export collection
mongoexport --db frenchmaster --collection users --out users.json

# Import collection
mongoimport --db frenchmaster --collection users --file users.json

# Backup database
mongodump --db frenchmaster --out ./backup

# Restore database
mongorestore --db frenchmaster ./backup/frenchmaster
```

---

## 📋 NPM Scripts Reference

### Frontend (package.json)
```json
{
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "clear": "expo start --clear",
    "tunnel": "expo start --tunnel",
    "test": "jest",
    "lint": "eslint .",
    "eject": "expo eject"
  }
}
```

### Backend (package.json)
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "seed": "node seeder.js",
    "test": "jest",
    "lint": "eslint ."
  }
}
```

---

## 🔍 Debugging Commands

### View Logs
```bash
# Expo logs
npx expo start --verbose

# Backend logs (nodemon shows automatically)
npm run dev
```

### React Native Debugger
```bash
# In Expo, press 'j' to open debugger
# Or shake device and tap "Debug JS Remotely"
```

### Network Debugging
```bash
# Check if backend is reachable
curl http://192.168.0.135:5001/api/health

# Or in browser
http://192.168.0.135:5001/api/health
```

---

## 📊 Useful Utility Commands

### Check Package Versions
```bash
# Check installed packages
npm list --depth=0

# Check outdated packages
npm outdated

# Update packages
npm update
```

### Clean Install
```bash
# Remove and reinstall all dependencies
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Check Disk Usage
```bash
# Check node_modules size
du -sh node_modules/

# Windows
dir node_modules /s | findstr "bytes"
```

---

## 🎯 Quick Reference

| Command | Description |
|---------|-------------|
| `npx expo start` | Start development server |
| `npx expo start --clear` | Start with cache clear |
| `npm run dev` | Start backend (from /backend) |
| `mongod` | Start MongoDB |
| `git add . && git commit -m "msg" && git push` | Quick commit & push |
| `rm -rf node_modules && npm install` | Reinstall dependencies |
| `taskkill /F /IM node.exe` | Kill all Node (Windows) |
| `pkill node` | Kill all Node (Mac/Linux) |
| `ipconfig \| findstr IPv4` | Get IP (Windows) |
| `ifconfig \| grep inet` | Get IP (Mac/Linux) |

---

**Happy Coding! 🚀**

