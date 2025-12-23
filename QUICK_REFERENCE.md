# Quick Reference Guide - French Master GH

Quick reference for common tasks and information.

## 📚 Documentation Index

- **[README.md](./README.md)** - Project overview and quick start
- **[DOCUMENTATION.md](./DOCUMENTATION.md)** - Complete documentation
- **[API_REFERENCE.md](./API_REFERENCE.md)** - API endpoints reference
- **[COMPONENTS_GUIDE.md](./COMPONENTS_GUIDE.md)** - Component documentation
- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Detailed setup instructions
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Deployment guide
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Contribution guidelines

---

## 🚀 Quick Commands

### Development

```bash
# Start frontend
npm start

# Start backend
cd backend && npm run dev

# Run on iOS
npm run ios

# Run on Android
npm run android
```

### Database

```bash
# Seed courses
cd backend && npm run seed

# Seed blog posts
cd backend && npm run seed:blog
```

### Testing

```bash
# Frontend tests
npm test

# Backend tests
cd backend && npm test
```

---

## 🔑 Key Files

### Frontend

- `App.js` - Main navigation setup
- `src/services/api.js` - API configuration
- `src/context/ThemeContext.js` - Theme management
- `src/context/AuthContext.js` - Authentication

### Backend

- `backend/server.js` - Express server
- `backend/.env` - Environment variables
- `backend/models/` - Database models
- `backend/routes/` - API routes

---

## 🎨 Theme Colors

### Light Mode
- Primary: `#9C27B0` (Purple)
- Background: `#FFFFFF`
- Text: `#0F1419`

### Dark Mode
- Primary: `#BB86FC` (Light Purple)
- Background: `#000000`
- Text: `#F7F9FA`

---

## 📱 Main Screens

1. **LandingScreen** - Welcome screen
2. **LearnerHomeScreen** - Main home
3. **LearnScreen** - Course discovery
4. **PracticeScreen** - Practice exercises
5. **CommunityScreen** - Community features
6. **ProfileScreen** - User profile
7. **CoursesScreen** - Course catalog
8. **CourseDetailScreen** - Course details

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Courses
- `GET /api/courses`
- `GET /api/courses/:id`
- `GET /api/courses/featured/list`

### Payments
- `POST /api/payments/create-intent`
- `POST /api/payments/confirm`

See [API_REFERENCE.md](./API_REFERENCE.md) for complete list.

---

## 🛠️ Common Tasks

### Add New Screen

1. Create file in `screens/`
2. Add to navigation in `App.js`
3. Update documentation

### Add New Component

1. Create file in `src/components/`
2. Export component
3. Add to [COMPONENTS_GUIDE.md](./COMPONENTS_GUIDE.md)

### Update API

1. Add route in `backend/routes/`
2. Update model if needed
3. Update [API_REFERENCE.md](./API_REFERENCE.md)

---

## 🐛 Troubleshooting

### Backend won't start
- Check MongoDB connection
- Verify `.env` file
- Check port 5000 is available

### Frontend can't connect
- Verify backend is running
- Check API_URL in `src/services/api.js`
- Use IP address for physical device

### Build errors
- Clear cache: `npm start -- --clear`
- Delete `node_modules` and reinstall
- Check Node.js version (18+)

---

## 📞 Support

- **Email**: info@frenchmastergh.com
- **Documentation**: See [DOCUMENTATION.md](./DOCUMENTATION.md)
- **Issues**: GitHub Issues

---

**Last Updated:** January 2025

