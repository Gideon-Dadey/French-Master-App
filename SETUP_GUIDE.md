# Setup Guide - French Master GH

Complete step-by-step guide to set up the French Master GH application for development.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Frontend Setup](#frontend-setup)
3. [Backend Setup](#backend-setup)
4. [Database Setup](#database-setup)
5. [Environment Configuration](#environment-configuration)
6. [Running the Application](#running-the-application)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

1. **Node.js** (v18 or higher)
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify: `node --version`

2. **npm** (comes with Node.js)
   - Verify: `npm --version`

3. **MongoDB**
   - **Option A**: Local MongoDB
     - Download from [mongodb.com](https://www.mongodb.com/try/download/community)
   - **Option B**: MongoDB Atlas (Cloud - Recommended)
     - Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
     - Free tier available

4. **Git**
   - Download from [git-scm.com](https://git-scm.com/)
   - Verify: `git --version`

5. **Expo CLI** (for mobile development)
   ```bash
   npm install -g expo-cli
   ```

6. **Development Tools**
   - **iOS**: Xcode (macOS only)
   - **Android**: Android Studio
   - **Physical Device**: Expo Go app ([iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))

---

## Frontend Setup

### Step 1: Clone Repository

```bash
git clone <repository-url>
cd "FRENCH MASTER"
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all React Native and Expo dependencies.

### Step 3: Configure API Endpoint

Edit `src/services/api.js`:

```javascript
// For local development
const API_URL = __DEV__ 
  ? 'http://localhost:5000/api' 
  : 'https://api.frenchmastergh.com/api';

// For Android emulator, use:
// const API_URL = 'http://10.0.2.2:5000/api';

// For iOS simulator, use:
// const API_URL = 'http://localhost:5000/api';

// For physical device, use your computer's IP:
// const API_URL = 'http://192.168.1.100:5000/api';
```

**Finding your IP address:**
- **Windows**: `ipconfig` (look for IPv4 Address)
- **macOS/Linux**: `ifconfig` or `ip addr`

### Step 4: Start Development Server

```bash
npm start
```

This will:
- Start Metro bundler
- Open Expo DevTools in browser
- Display QR code for Expo Go app

### Step 5: Run on Device/Emulator

**Option A: Physical Device (Recommended for testing)**
1. Install Expo Go app on your phone
2. Scan QR code from terminal/browser
3. App will load on your device

**Option B: iOS Simulator (macOS only)**
```bash
npm run ios
```

**Option C: Android Emulator**
```bash
npm run android
```

**Note**: Make sure emulator/simulator is running before executing these commands.

---

## Backend Setup

### Step 1: Navigate to Backend Directory

```bash
cd backend
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Create Environment File

Create a `.env` file in the `backend/` directory:

```bash
# On Windows
copy .env.example .env

# On macOS/Linux
cp .env.example .env
```

### Step 4: Configure Environment Variables

Edit `backend/.env` with your configuration:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/frenchmaster
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/frenchmaster?retryWrites=true&w=majority

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your-refresh-token-secret-change-this
JWT_REFRESH_EXPIRE=30d

# Stripe Payment (Optional - for payment features)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# AWS S3 (Optional - for file uploads)
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
AWS_BUCKET_NAME=french-master-uploads

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# CORS (Optional)
CORS_ORIGIN=http://localhost:19006,http://localhost:3000
```

**Important**: 
- Never commit `.env` file to version control
- Use strong, random strings for JWT secrets
- Keep production secrets secure

### Step 5: Start Backend Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

You should see:
```
Server running on port 5000
MongoDB connected successfully
```

---

## Database Setup

### Option A: Local MongoDB

1. **Install MongoDB**
   - Follow [MongoDB installation guide](https://docs.mongodb.com/manual/installation/)

2. **Start MongoDB**
   ```bash
   # macOS (using Homebrew)
   brew services start mongodb-community

   # Linux
   sudo systemctl start mongod

   # Windows
   # MongoDB runs as a service automatically
   ```

3. **Verify MongoDB is running**
   ```bash
   mongosh
   # Or
   mongo
   ```

4. **Update `.env`**
   ```env
   MONGODB_URI=mongodb://localhost:27017/frenchmaster
   ```

### Option B: MongoDB Atlas (Cloud - Recommended)

1. **Create Account**
   - Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for free account

2. **Create Cluster**
   - Click "Build a Database"
   - Choose free tier (M0)
   - Select region closest to you
   - Click "Create"

3. **Create Database User**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Create username and password
   - Save credentials securely

4. **Whitelist IP Address**
   - Go to "Network Access"
   - Click "Add IP Address"
   - For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
   - For production: Add specific IPs

5. **Get Connection String**
   - Go to "Database" → "Connect"
   - Choose "Connect your application"
   - Copy connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `frenchmaster`

6. **Update `.env`**
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/frenchmaster?retryWrites=true&w=majority
   ```

### Seed Database (Optional)

Populate database with sample data:

```bash
cd backend

# Seed courses
npm run seed

# Seed blog posts
npm run seed:blog
```

---

## Environment Configuration

### Frontend Environment

The frontend uses `__DEV__` flag to determine environment:

```javascript
// Development
const API_URL = 'http://localhost:5000/api';

// Production
const API_URL = 'https://api.frenchmastergh.com/api';
```

### Backend Environment

Backend uses `.env` file for configuration. See [Backend Setup](#backend-setup) for details.

---

## Running the Application

### Complete Setup Checklist

- [ ] Node.js installed
- [ ] MongoDB running (local or Atlas)
- [ ] Frontend dependencies installed
- [ ] Backend dependencies installed
- [ ] `.env` file configured
- [ ] API endpoint configured in `src/services/api.js`
- [ ] Database seeded (optional)

### Start Both Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm start
```

### Verify Setup

1. **Backend is running**
   - Check terminal: `Server running on port 5000`
   - Visit: `http://localhost:5000/api/courses` (should return JSON)

2. **Frontend connects to backend**
   - Check Expo DevTools for network requests
   - Verify no connection errors in console

3. **Database connected**
   - Check backend terminal: `MongoDB connected successfully`

---

## Troubleshooting

### Common Issues

#### 1. "Cannot connect to backend"

**Problem**: Frontend can't reach backend API

**Solutions**:
- Verify backend is running on port 5000
- Check API_URL in `src/services/api.js`
- For physical device: Use computer's IP address, not `localhost`
- For Android emulator: Use `10.0.2.2` instead of `localhost`
- Check firewall settings
- Verify CORS configuration in backend

#### 2. "MongoDB connection failed"

**Problem**: Backend can't connect to MongoDB

**Solutions**:
- Verify MongoDB is running (local) or cluster is active (Atlas)
- Check MONGODB_URI in `.env` file
- For Atlas: Verify IP is whitelisted
- For Atlas: Check username/password are correct
- Test connection: `mongosh "your-connection-string"`

#### 3. "Module not found" errors

**Problem**: Missing dependencies

**Solutions**:
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear npm cache
npm cache clean --force
```

#### 4. "Port already in use"

**Problem**: Port 5000 or 19000 is already in use

**Solutions**:
```bash
# Find process using port (macOS/Linux)
lsof -i :5000
kill -9 <PID>

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or change port in .env
PORT=5001
```

#### 5. "Expo Go can't load app"

**Problem**: App won't load on physical device

**Solutions**:
- Ensure phone and computer are on same WiFi network
- Check firewall isn't blocking connections
- Try restarting Expo server: `npm start -- --clear`
- Clear Expo cache: `expo start -c`

#### 6. "JWT token errors"

**Problem**: Authentication not working

**Solutions**:
- Verify JWT_SECRET is set in `.env`
- Check token expiration settings
- Clear app data and re-login
- Verify token is being sent in Authorization header

#### 7. "Payment integration not working"

**Problem**: Stripe payments failing

**Solutions**:
- Verify Stripe keys are set in `.env`
- Use test keys for development
- Check Stripe dashboard for errors
- Verify webhook endpoints (if configured)

### Getting Help

1. **Check Logs**
   - Frontend: Expo DevTools console
   - Backend: Terminal output
   - Database: MongoDB logs

2. **Common Commands**
   ```bash
   # Clear all caches
   npm start -- --clear
   expo start -c
   npm cache clean --force

   # Reset Metro bundler
   watchman watch-del-all
   rm -rf node_modules
   npm install
   ```

3. **Resources**
   - [Expo Documentation](https://docs.expo.dev/)
   - [React Native Documentation](https://reactnative.dev/)
   - [MongoDB Documentation](https://docs.mongodb.com/)
   - [Express.js Documentation](https://expressjs.com/)

---

## Next Steps

After successful setup:

1. ✅ Explore the app interface
2. ✅ Test authentication (register/login)
3. ✅ Browse courses
4. ✅ Test course enrollment
5. ✅ Review code structure
6. ✅ Read [DOCUMENTATION.md](./DOCUMENTATION.md) for detailed information
7. ✅ Check [API_REFERENCE.md](./API_REFERENCE.md) for API usage

---

**Last Updated:** January 2025

