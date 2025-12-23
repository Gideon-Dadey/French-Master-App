# 🇫🇷 French Master GH

> Premium French Language Learning Platform

[![React Native](https://img.shields.io/badge/React%20Native-0.81.5-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-54.0.0-black.svg)](https://expo.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Latest-green.svg)](https://www.mongodb.com/)

A comprehensive, production-ready mobile application for learning French, featuring premium UI/UX, gamification, progress tracking, and a full-stack architecture.

---

## ✨ Features

### 🎓 Learning Features
- **Premium Course Catalog** - Extensive French courses with detailed descriptions
- **Interactive Lessons** - Video-based lessons with progress tracking
- **Practice Exercises** - Flashcards, quizzes, and speaking exercises
- **Progress Analytics** - Track learning progress with detailed insights
- **Certificates** - Earn certificates upon course completion

### 🎨 Premium Design
- **Modern UI/UX** - Beautiful, professional interface
- **Dark/Light Mode** - Full theme support
- **Premium Animations** - Smooth transitions and interactions
- **Responsive Design** - Optimized for all screen sizes
- **Gradient Backgrounds** - Premium visual effects

### 🎯 Gamification
- **Achievements System** - Unlock badges and achievements
- **Learning Streaks** - Maintain daily learning streaks
- **Points & Levels** - Earn points and level up
- **Daily Challenges** - Complete daily challenges
- **Leaderboards** - Compete with other learners

### 💳 Payment Integration
- **Multiple Payment Methods** - Stripe, PayPal, Mobile Money
- **Secure Transactions** - Industry-standard security
- **Free Courses** - Access free courses
- **Course Pricing** - Flexible pricing in GHS (Ghana Cedis)

### 👥 Community Features
- **Reviews & Ratings** - Rate and review courses
- **Discussions** - Engage in course discussions
- **Blog & Articles** - Read learning articles and tips
- **Social Learning** - Learn with the community

### 🔔 Notifications
- **Push Notifications** - Stay updated with course updates
- **Progress Reminders** - Get reminded to continue learning
- **Achievement Alerts** - Celebrate your achievements

### 🌐 Multi-language Support
- **English Interface** - Full English support
- **French Interface** - French language option
- **Localization Ready** - Easy to add more languages

---

## 📱 Screenshots

*Add screenshots here*

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- MongoDB (local or Atlas)
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator / Android Emulator / Physical device

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd "FRENCH MASTER"
```

2. **Install frontend dependencies**
```bash
npm install
```

3. **Install backend dependencies**
```bash
cd backend
npm install
```

4. **Set up environment variables**

Create `backend/.env`:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/frenchmaster
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
```

5. **Start backend server**
```bash
cd backend
npm run dev
```

6. **Start frontend**
```bash
npm start
```

7. **Run on device**
```bash
# iOS
npm run ios

# Android
npm run android
```

For detailed setup instructions, see [SETUP_GUIDE.md](./SETUP_GUIDE.md)

---

## 📁 Project Structure

```
FRENCH MASTER/
├── App.js                    # Main app entry with navigation
├── screens/                  # Screen components
│   ├── Auth/                # Authentication screens
│   ├── LandingScreen.js     # Welcome screen
│   ├── LearnerHomeScreen.js # Main home screen
│   ├── LearnScreen.js       # Course discovery
│   ├── PracticeScreen.js    # Practice exercises
│   ├── CommunityScreen.js   # Community features
│   ├── ProfileScreen.js     # User profile
│   └── ...
├── src/
│   ├── components/          # Reusable UI components
│   ├── context/             # React Context providers
│   ├── services/            # API services
│   ├── hooks/               # Custom React hooks
│   └── utils/               # Utility functions
├── backend/                 # Backend API
│   ├── server.js            # Express server
│   ├── models/              # Mongoose models
│   ├── routes/              # API routes
│   └── middleware/          # Auth & validation
└── assets/                  # Images and media
```

---

## 🛠️ Technology Stack

### Frontend
- **React Native** 0.81.5 - Mobile framework
- **Expo** SDK 54 - Development platform
- **React Navigation** 6 - Navigation library
- **React Context API** - State management
- **Axios** - HTTP client
- **Expo Linear Gradient** - Gradient effects
- **React Native Reanimated** - Animations

### Backend
- **Node.js** 18+ - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Stripe** - Payment processing
- **Socket.io** - Real-time features

---

## 📚 Documentation

- **[Complete Documentation](./DOCUMENTATION.md)** - Full project documentation
- **[API Reference](./API_REFERENCE.md)** - Complete API documentation
- **[Components Guide](./COMPONENTS_GUIDE.md)** - Component documentation
- **[Setup Guide](./SETUP_GUIDE.md)** - Detailed setup instructions

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh token

### Courses
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get course details
- `GET /api/courses/featured/list` - Get featured courses

### Payments
- `POST /api/payments/create-intent` - Create payment intent
- `POST /api/payments/confirm` - Confirm payment
- `GET /api/payments/history` - Get payment history

For complete API documentation, see [API_REFERENCE.md](./API_REFERENCE.md)

---

## 🎨 Theming

The app supports light and dark themes with a premium purple color scheme:

- **Primary Color (Light)**: `#9C27B0`
- **Primary Color (Dark)**: `#BB86FC`
- **Currency**: GHS (Ghana Cedis)

Theme can be toggled from the Profile screen.

---

## 🧪 Testing

```bash
# Frontend tests
npm test

# Backend tests
cd backend
npm test
```

---

## 🚢 Deployment

### Backend

Deploy to Heroku, AWS, DigitalOcean, or any Node.js hosting:

```bash
# Heroku
heroku create french-master-api
git push heroku main

# Docker
docker build -t french-master-api .
docker run -p 5000:5000 french-master-api
```

### Frontend

Build and deploy with Expo Application Services (EAS):

```bash
# Install EAS CLI
npm install -g eas-cli

# Build
eas build --platform ios
eas build --platform android

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines.

---

## 📝 License

© 2025 THE FRENCH MASTER GH. All rights reserved.

---

## 📞 Support

- **Email**: info@frenchmastergh.com
- **Website**: https://frenchmastergh.com
- **GitHub Issues**: [Repository Issues]

---

## 🙏 Acknowledgments

- React Native community
- Expo team
- All contributors and testers

---

**Made with ❤️ for French learners in Ghana and beyond**
