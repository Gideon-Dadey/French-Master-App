# 🔧 API Connection Fix

## Issues Fixed

1. ✅ **CourseCard Import Error** - Added missing import in `HomeScreen.js`
2. ⚠️ **Network Error** - Need to configure correct API URL

## API URL Configuration

The app is currently set to use your physical device IP: `192.168.0.135`

### If Using Android Emulator:
1. Open `src/services/api.js`
2. Find the Android section (around line 15)
3. Change from:
   ```javascript
   return 'http://192.168.0.135:5000/api';
   ```
   To:
   ```javascript
   return 'http://10.0.2.2:5000/api';
   ```

### If Using Physical Android Device:
1. Make sure your phone and computer are on the same WiFi network
2. Verify your computer's IP is `192.168.0.135` (it's already set)
3. Make sure Windows Firewall allows port 5000
4. The backend should be accessible at `http://192.168.0.135:5000`

### Test Backend Connection

From your computer, test:
```bash
curl http://localhost:5000/api/courses/featured/list
```

Should return JSON with courses.

### Allow Firewall (Windows)

If using physical device, allow port 5000 in Windows Firewall:

1. Open Windows Defender Firewall
2. Click "Advanced settings"
3. Click "Inbound Rules" → "New Rule"
4. Select "Port" → Next
5. TCP, Specific local ports: `5000`
6. Allow the connection
7. Apply to all profiles
8. Name: "Backend API"

### Quick Fix

**For Android Emulator:**
- Edit `src/services/api.js` line 18
- Change to: `return 'http://10.0.2.2:5000/api';`

**For Physical Device:**
- Keep current setting: `http://192.168.0.135:5000/api`
- Make sure both devices on same WiFi
- Allow firewall port 5000

---

## After Fixing

1. Reload the app (shake device → Reload)
2. Check console logs - should see: `API URL: http://...`
3. Courses should load from backend

