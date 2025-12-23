# French Master GH - Backend API

Node.js/Express REST API for the French Master GH language learning platform.

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev

# Start production server
npm start
```

## API Documentation

### Base URL
- Development: `http://localhost:5000/api`
- Production: `https://api.frenchmastergh.com/api`

### Authentication
All protected routes require a Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

## Models

- **User**: Students, Instructors, Admins
- **Course**: Course information and metadata
- **Lesson**: Individual lessons within courses
- **Progress**: User progress tracking
- **Payment**: Payment transactions
- **Review**: Course reviews and ratings
- **Notification**: User notifications

## Routes

See individual route files in `/routes` directory for detailed endpoint documentation.

## Environment Variables

Required environment variables (see `.env.example`):
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `JWT_REFRESH_SECRET` - Refresh token secret
- `STRIPE_SECRET_KEY` - Stripe API key
- `AWS_ACCESS_KEY_ID` - AWS credentials
- `AWS_SECRET_ACCESS_KEY` - AWS credentials

## Testing

```bash
npm test
```

## Deployment

See `Dockerfile` and `docker-compose.yml` for containerized deployment.

