# Mobile App Setup & Troubleshooting Guide

## Issues Fixed

This guide addresses the following issues that occurred after mobile installation:
1. ❌ Login failing with "Login failed" message
2. ❌ "Connection lost" error on LearnScreen
3. ❌ Courses not displaying
4. ❌ Study Groups section showing no data

## Root Causes & Solutions

### 1. **API URL Configuration (PERMANENT FIX)**
**Problem:** Local IPs change when you switch networks (Hotspot vs WiFi), and random ngrok URLs change every time you restart.

**The Permanent Solution:**
1.  **Claim a Static Domain:** (COMPLETED) You are using `compulsively-unevincible-irwin.ngrok-free.dev`.
2.  **Update Code:** (COMPLETED) `src/services/api.js` and `src/services/socketService.js` are updated.
3.  **Run Command:** Always start ngrok with:
    ```bash
    npx ngrok http 5001 --domain=compulsively-unevincible-irwin.ngrok-free.dev
    ```

**Benefits:**
- Works on **WiFi**, **Hotspot**, and **Mobile Data** (4G/5G).
- No need to update the code ever again.
- Works for physical phones in any location.

### 2. **Network Error Handling**
**Problem:** API failures weren't properly caught and displayed to users, leaving them confused.

**Solution Applied:**
- Enhanced API interceptor to detect network errors and provide clear messages
- Updated `LoginScreen` with better error handling for connection issues
- Modified all data-fetching screens to use `Promise.allSettled()` instead of `Promise.all()`
- Added specific error messages for network, auth, and server errors

### 3. **Missing JWT Dependency**
**Problem:** `/backend/routes/auth.js` was missing the `jwt` import, causing token refresh to fail.

**Solution Applied:**
- Added `const jwt = require('jsonwebtoken');` to the top of auth.js

## Setup Instructions

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Ensure .env file exists and is configured:**
   ```bash
   # Check if .env exists
   cat .env
   
   # If not, copy from example
   cp .env.example .env
   ```

3. **Verify environment variables are set:**
   - `MONGODB_URI` - Should point to your MongoDB (currently configured)
   - `JWT_SECRET` - Change to a secure value in production
   - `JWT_REFRESH_SECRET` - Change to a secure value in production
   - `PORT` - Should be 5001

4. **Start the backend server:**
   ```bash
   npm install
   npm run dev
   # OR for production
   npm start
   ```

   You should see:
   ```
   ✅ MongoDB Connected: cluster0.litbhou.mongodb.net
   🚀 Server running on port 5001 in development mode
   📱 Accessible at: http://0.0.0.0:5001/api
   ```

### Mobile App Setup

1. **API Configuration (Automatic):**
   - Development (Expo Go): Uses local IP automatically
   - Production APK: Uses ngrok public URL automatically
   - No manual configuration needed - API URL is determined by `__DEV__` flag

2. **Build and install on mobile:**
   ```bash
   # For Android
   eas build --platform android
   
   # Then install the APK or use Expo Go
   expo run:android
   
   # For iOS
   eas build --platform ios
   
   expo run:ios
   ```

3. **If using Expo Go for testing:**
   ```bash
   expo start
   # Scan QR code with phone
   ```

## Testing Checklist

After deploying, verify the following:

### ✅ Login Test
- [ ] Open app and navigate to login screen
- [ ] Try logging in with valid credentials
- [ ] Should succeed and navigate to home screen
- [ ] If fails: Check backend is running and database is accessible

### ✅ Courses Display Test (LearnScreen)
- [ ] Go to "Learn" tab
- [ ] Should load and display featured courses
- [ ] Should show all courses in categories
- [ ] Should handle connection errors gracefully with retry option
- [ ] Pull to refresh should work

### ✅ Study Groups Test
- [ ] Go to "Community" tab (or Study Groups)
- [ ] Should display list of study groups
- [ ] Should handle no groups gracefully
- [ ] Search should work
- [ ] Filter should work

### ✅ LearnerHomeScreen Test
- [ ] Home tab should load without errors
- [ ] Should show featured courses
- [ ] Should show recent blog posts
- [ ] Should display user stats (Level, XP, Streak)
- [ ] Daily word of the day should appear

## Troubleshooting

### Issue: "Connection Lost" Error
**Solution:**
1. Check backend is running:
   ```bash
   curl http://localhost:5001/health
   # Should return: {"status":"OK"}
   ```

2. Check internet connectivity on mobile

3. For local development, temporarily update `/src/services/api.js`:
   ```javascript
   const USE_LOCAL = true; // Only for local development
   ```
   Then restart the app.

### Issue: Login Still Fails
**Solution:**
1. Check MongoDB connection:
   ```bash
   cd backend
   node test-connection.js
   ```

2. Verify JWT_SECRET is set in .env:
   ```bash
   grep JWT_SECRET backend/.env
   ```

3. Check logs for specific error:
   ```bash
   npm run dev
   # Look for error messages
   ```

### Issue: "Invalid credentials"
**Solution:**
1. Ensure user exists in database
2. Try registering a new account first
3. Verify password is correct
4. Check that User model is properly configured

### Issue: Database Connection Error
**Solution:**
1. Verify MongoDB is running:
   ```bash
   # If using local MongoDB
   mongosh
   
   # If using MongoDB Atlas, check connection string in .env
   ```

2. Run QUICK_MONGODB_SETUP.md for configuration help:
   ```bash
   cat backend/QUICK_MONGODB_SETUP.md
   ```

## Files Modified

1. ✅ `/src/services/api.js`
   - Fixed API URL configuration
   - Enhanced error handling in interceptors
   - Added network error detection

2. ✅ `/screens/Auth/LoginScreen.js`
   - Better error messages
   - Specific handling for connection errors

3. ✅ `/src/context/AuthContext.js`
   - Improved error handling in login/register
   - Network error detection

4. ✅ `/screens/LearnScreen.js`
   - Use Promise.allSettled() for better error handling
   - Show user-friendly error messages

5. ✅ `/screens/LearnerHomeScreen.js`
   - Promise.allSettled() for partial load success
   - Better error messages

6. ✅ `/screens/StudyGroupsScreen.js`
   - Enhanced error messages with specific error types

7. ✅ `/screens/CourseDetailScreen.js`
   - Better error handling for course loading
   - Specific error messages for different failure types

8. ✅ `/backend/routes/auth.js`
   - Added missing `jwt` import for token refresh

9. ✅ `/backend/.env.example`
   - Created comprehensive environment variable template

## Performance Optimization Tips

1. **Reduce API timeout:**
   In `/src/services/api.js`:
   ```javascript
   timeout: 10000, // 10 seconds
   ```

2. **Cache management:**
   The app uses `offlineService` to cache data. Clear cache if needed:
   ```bash
   # In app development console
   AsyncStorage.clear()
   ```

3. **Monitor network requests:**
   Use React Native Network Inspector or Charles Proxy to debug API calls

## Next Steps

1. Test thoroughly on actual mobile devices (iOS and Android)
2. Monitor backend logs for errors:
   ```bash
   npm run dev
   # Or save logs
   npm run dev > backend.log 2>&1
   ```

3. Set up proper error tracking (e.g., Sentry):
   ```bash
   npm install @sentry/react-native
   ```

4. For production, update JWT secrets to strong values:
   ```bash
   # Generate secure secrets
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

## Support

If issues persist:
1. Check network connectivity
2. Verify backend is running
3. Check MongoDB connection
4. Review backend logs
5. Ensure app has internet permission on mobile
6. Clear app cache and reinstall

---
**Last Updated:** December 30, 2025
**Status:** ✅ All critical issues resolved - Android APK tested with ngrok
