# French Master GH - Complete Language Learning Platform

A production-ready, full-stack mobile application for language education with React Native frontend and Node.js/Express backend.

## 🚀 Features

### Frontend (React Native)
- ✅ User Authentication (Email/Phone, OAuth - Google, Facebook)
- ✅ JWT-based secure authentication with refresh tokens
- ✅ Course Catalog with advanced filters and search
- ✅ Course Detail & Purchase Flow
- ✅ Video Player with offline download support
- ✅ Progress Tracking & Analytics Dashboard
- ✅ Quizzes and Assignments
- ✅ Reviews & Ratings
- ✅ Push Notifications
- ✅ Dark/Light Mode
- ✅ Multi-language Support (English, French)

### Backend (Node.js/Express)
- ✅ RESTful API with Express
- ✅ MongoDB database with Mongoose
- ✅ JWT Authentication & Authorization
- ✅ Payment Integration (Stripe, PayPal, Mobile Money)
- ✅ File Upload to AWS S3
- ✅ WebSocket support for real-time features
- ✅ Rate Limiting & Security (Helmet, CORS)
- ✅ Error Handling & Logging
- ✅ Admin APIs

### Database Models
- Users (Students, Instructors, Admins)
- Courses & Lessons
- Progress Tracking
- Payments & Subscriptions
- Reviews & Ratings
- Notifications

## 📁 Project Structure

```
FRENCH MASTER/
├── App.js                    # Main app entry with navigation
├── package.json              # Frontend dependencies
├── screens/
│   ├── Auth/                # Authentication screens
│   ├── HomeScreen.js
│   ├── CoursesScreen.js
│   ├── CourseDetailScreen.js
│   ├── MyCoursesScreen.js
│   ├── LessonScreen.js
│   ├── ProfileScreen.js
│   └── ContactScreen.js
├── src/
│   ├── context/             # React Context providers
│   │   └── AuthContext.js
│   └── services/            # API services
│       └── api.js
├── components/
│   └── VideoPlayer.js
└── backend/
    ├── server.js            # Express server
    ├── models/              # Mongoose models
    ├── routes/              # API routes
    ├── middleware/          # Auth & validation
    ├── utils/               # Utilities
    └── config/              # Configuration
```

## 🛠️ Installation

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Expo CLI
- iOS Simulator / Android Emulator / Physical device

### Frontend Setup

```bash
# Install dependencies
npm install

# Start Expo development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
# Add MongoDB URI, JWT secrets, API keys, etc.

# Start development server
npm run dev

# Or start production server
npm start
```

## 🔧 Configuration

### Backend Environment Variables

Create a `.env` file in the `backend/` directory:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/frenchmaster
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
STRIPE_SECRET_KEY=sk_test_...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
```

### Frontend API Configuration

Update `src/services/api.js` with your backend URL:

```javascript
const API_URL = __DEV__ 
  ? 'http://localhost:5000/api' 
  : 'https://api.frenchmastergh.com/api';
```

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/forgot-password` - Request password reset

### Courses
- `GET /api/courses` - Get all courses (with filters)
- `GET /api/courses/:id` - Get course details
- `GET /api/courses/featured/list` - Get featured courses

### Lessons
- `GET /api/lessons/course/:courseId` - Get course lessons
- `GET /api/lessons/:id` - Get lesson details
- `POST /api/lessons/:id/progress` - Update lesson progress

### Payments
- `POST /api/payments/create-intent` - Create payment intent
- `POST /api/payments/confirm` - Confirm payment
- `GET /api/payments/history` - Get payment history

### Progress
- `GET /api/progress/course/:courseId` - Get course progress
- `GET /api/progress/dashboard` - Get user dashboard stats

## 🐳 Docker Deployment

### Backend

```bash
cd backend
docker-compose up -d
```

### Build Docker Image

```bash
docker build -t french-master-api .
docker run -p 5000:5000 french-master-api
```

## 🚢 Deployment

### Backend (AWS/DigitalOcean/Azure)

1. Set up MongoDB Atlas or managed database
2. Configure environment variables
3. Deploy using:
   - AWS Elastic Beanstalk
   - DigitalOcean App Platform
   - Azure App Service
   - Or Docker containers

### Frontend

1. Build with EAS Build:
```bash
eas build --platform ios
eas build --platform android
```

2. Submit to app stores:
```bash
eas submit --platform ios
eas submit --platform android
```

## 🧪 Testing

### Frontend
```bash
npm test
```

### Backend
```bash
cd backend
npm test
```

## 📊 Admin Panel

A separate React web application for admin dashboard (to be implemented):
- User management
- Course management
- Analytics & Reports
- Payment management

## 🔐 Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- Rate limiting
- CORS configuration
- Input validation & sanitization
- XSS protection
- Secure file uploads

## 📝 License

© 2025 THE FRENCH MASTER GH

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📞 Support

For support, email info@frenchmastergh.com or visit our website.
