# Backend Setup Guide

## Quick Start

1. **Install Dependencies**
```bash
cd backend
npm install
```

2. **Set Up Environment Variables**
```bash
cp .env.example .env
```

Edit `.env` and add:
- MongoDB connection string
- JWT secrets
- Other API keys

3. **Start MongoDB**
- Local: Make sure MongoDB is running
- Or use MongoDB Atlas (cloud)

4. **Seed Sample Data (Optional)**
```bash
node scripts/seed.js
```

This will create:
- Sample instructor account
- Sample courses
- Test data

5. **Start Server**
```bash
npm run dev
```

Server will run on `http://localhost:5000`

## Testing API

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

### Get Featured Courses
```bash
curl http://localhost:5000/api/courses/featured/list
```

## Default Accounts

After seeding:
- **Instructor**: instructor@frenchmaster.com / password123
- Create your own student account via registration

## API Endpoints

See `backend/README.md` for full API documentation.

