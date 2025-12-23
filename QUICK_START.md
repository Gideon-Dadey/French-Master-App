# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### 1. Clone and Install

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 2. Set Up Backend

```bash
cd backend

# Copy environment file
cp .env.example .env

# Edit .env - Minimum required:
# MONGODB_URI=mongodb://localhost:27017/frenchmaster
# JWT_SECRET=your-secret-key-here
# JWT_REFRESH_SECRET=your-refresh-secret-here
```

### 3. Start MongoDB

**Option A: Local MongoDB**
```bash
# Install MongoDB locally or use Docker
docker run -d -p 27017:27017 mongo:6
```

**Option B: MongoDB Atlas (Cloud)**
- Sign up at https://www.mongodb.com/cloud/atlas
- Create a free cluster
- Get connection string
- Update `MONGODB_URI` in `.env`

### 4. Start Backend Server

```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

### 5. Start Frontend App

```bash
# In project root
npm start

# Then:
# - Press 'i' for iOS simulator
# - Press 'a' for Android emulator
# - Scan QR code with Expo Go app
```

### 6. Test the App

1. **Register a new account:**
   - Open app → Register
   - Fill in name, email, password
   - Submit

2. **Browse courses:**
   - Navigate to Courses tab
   - Search and filter courses

3. **View course details:**
   - Tap any course
   - See course information

## 🧪 Test API Endpoints

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Get Courses
```bash
curl http://localhost:5000/api/courses
```

## 📱 App Features to Test

1. ✅ Authentication (Login/Register)
2. ✅ Browse Courses
3. ✅ View Course Details
4. ✅ My Courses (after enrollment)
5. ✅ Profile & Settings

## 🔧 Common Issues

### Backend won't start
- Check MongoDB is running
- Verify `.env` file exists and has correct values
- Check port 5000 is not in use

### Frontend can't connect to API
- Verify backend is running on port 5000
- Check `src/services/api.js` has correct API_URL
- For Android emulator, use `10.0.2.2` instead of `localhost`

### MongoDB connection error
- Verify MongoDB is running
- Check connection string in `.env`
- For Atlas, ensure IP is whitelisted

## 📚 Next Steps

1. **Add Sample Data:**
   - Create courses via API or admin panel
   - Add lessons to courses
   - Upload course thumbnails

2. **Configure Payments:**
   - Get Stripe test keys
   - Add to `.env`
   - Test payment flow

3. **Set Up File Storage:**
   - Create AWS S3 bucket
   - Add credentials to `.env`
   - Test file uploads

4. **Deploy:**
   - Set up production database
   - Configure production `.env`
   - Deploy backend to cloud
   - Build and submit mobile app

## 🆘 Need Help?

- Check `README.md` for detailed documentation
- See `PROJECT_SUMMARY.md` for feature overview
- Review `backend/README.md` for API docs

Happy coding! 🎉

