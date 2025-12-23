# Deployment Guide - French Master GH

Complete guide for deploying the French Master GH application to production.

## Table of Contents

1. [Backend Deployment](#backend-deployment)
2. [Frontend Deployment](#frontend-deployment)
3. [Database Setup](#database-setup)
4. [Environment Variables](#environment-variables)
5. [SSL/HTTPS Configuration](#sslhttps-configuration)
6. [Monitoring & Logging](#monitoring--logging)
7. [Scaling](#scaling)

---

## Backend Deployment

### Option 1: Heroku

#### Prerequisites
- Heroku account ([sign up](https://heroku.com))
- Heroku CLI installed: `npm install -g heroku-cli`

#### Steps

1. **Login to Heroku**
```bash
heroku login
```

2. **Create Heroku App**
```bash
cd backend
heroku create french-master-api
```

3. **Set Environment Variables**
```bash
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=mongodb+srv://...
heroku config:set JWT_SECRET=your-production-secret
heroku config:set JWT_EXPIRE=7d
heroku config:set STRIPE_SECRET_KEY=sk_live_...
# ... add all other variables
```

4. **Deploy**
```bash
git push heroku main
```

5. **View Logs**
```bash
heroku logs --tail
```

6. **Open App**
```bash
heroku open
```

**Note**: Heroku free tier is no longer available. Consider alternatives or paid plans.

---

### Option 2: AWS EC2

#### Prerequisites
- AWS account
- EC2 instance (Ubuntu 20.04+ recommended)

#### Steps

1. **Connect to EC2 Instance**
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

2. **Install Node.js**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

3. **Install MongoDB (or use Atlas)**
```bash
# Or use MongoDB Atlas (recommended)
```

4. **Install PM2**
```bash
sudo npm install -g pm2
```

5. **Clone Repository**
```bash
git clone <repository-url>
cd "FRENCH MASTER/backend"
```

6. **Install Dependencies**
```bash
npm install --production
```

7. **Configure Environment**
```bash
nano .env
# Add all production environment variables
```

8. **Start with PM2**
```bash
pm2 start server.js --name french-master-api
pm2 save
pm2 startup
```

9. **Configure Nginx (Reverse Proxy)**
```bash
sudo apt-get install nginx
sudo nano /etc/nginx/sites-available/french-master
```

Add configuration:
```nginx
server {
    listen 80;
    server_name api.frenchmastergh.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/french-master /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

### Option 3: DigitalOcean App Platform

1. **Create App**
   - Go to DigitalOcean dashboard
   - Create new app
   - Connect GitHub repository

2. **Configure**
   - Select `backend/` directory
   - Set build command: `npm install`
   - Set run command: `npm start`
   - Add environment variables

3. **Deploy**
   - App deploys automatically on git push

---

### Option 4: Docker

#### Build Image

```bash
cd backend
docker build -t french-master-api .
```

#### Run Container

```bash
docker run -d \
  --name french-master-api \
  -p 5000:5000 \
  --env-file .env \
  french-master-api
```

#### Docker Compose

Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=${MONGODB_URI}
      - JWT_SECRET=${JWT_SECRET}
    env_file:
      - .env
    restart: unless-stopped
```

Run:
```bash
docker-compose up -d
```

---

## Frontend Deployment

### Expo Application Services (EAS)

#### Prerequisites
- Expo account ([sign up](https://expo.dev))
- EAS CLI: `npm install -g eas-cli`

#### Steps

1. **Login to Expo**
```bash
eas login
```

2. **Configure EAS**
```bash
eas build:configure
```

3. **Update app.json**
```json
{
  "expo": {
    "name": "French Master GH",
    "slug": "french-master-gh",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#9C27B0"
    },
    "updates": {
      "fallbackToCacheTimeout": 0
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.frenchmastergh.app"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#9C27B0"
      },
      "package": "com.frenchmastergh.app"
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "extra": {
      "apiUrl": "https://api.frenchmastergh.com/api"
    }
  }
}
```

4. **Set EAS Secrets**
```bash
eas secret:create --scope project --name API_URL --value https://api.frenchmastergh.com/api
```

5. **Build for iOS**
```bash
eas build --platform ios
```

6. **Build for Android**
```bash
eas build --platform android
```

7. **Build for Both**
```bash
eas build --platform all
```

8. **Submit to App Stores**

**iOS:**
```bash
eas submit --platform ios
```

**Android:**
```bash
eas submit --platform android
```

#### Build Profiles

Create `eas.json`:
```json
{
  "build": {
    "production": {
      "env": {
        "API_URL": "https://api.frenchmastergh.com/api"
      },
      "ios": {
        "distribution": "store"
      },
      "android": {
        "buildType": "apk"
      }
    },
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-email@example.com",
        "ascAppId": "your-app-id"
      },
      "android": {
        "serviceAccountKeyPath": "./service-account-key.json"
      }
    }
  }
}
```

---

## Database Setup

### MongoDB Atlas (Recommended)

1. **Create Production Cluster**
   - Choose appropriate tier (M10+ for production)
   - Select region closest to your backend

2. **Configure Security**
   - Create database user with strong password
   - Whitelist only production server IPs
   - Enable encryption at rest

3. **Get Connection String**
   - Use connection string in backend `.env`
   - Format: `mongodb+srv://username:password@cluster.mongodb.net/frenchmaster?retryWrites=true&w=majority`

4. **Backup Strategy**
   - Enable automated backups
   - Set backup retention period
   - Test restore procedures

---

## Environment Variables

### Production Environment Variables

**Backend `.env`:**
```env
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb+srv://...

# JWT
JWT_SECRET=<strong-random-secret>
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=<strong-random-secret>
JWT_REFRESH_EXPIRE=30d

# Stripe (Production keys)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...

# AWS S3
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
AWS_BUCKET_NAME=french-master-uploads-prod

# CORS
CORS_ORIGIN=https://frenchmastergh.com,https://app.frenchmastergh.com

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@frenchmastergh.com
SMTP_PASS=...

# Logging
LOG_LEVEL=info
```

**Security Best Practices:**
- Use strong, random secrets (32+ characters)
- Never commit `.env` files
- Rotate secrets regularly
- Use different secrets for each environment
- Store secrets in secure vault (AWS Secrets Manager, etc.)

---

## SSL/HTTPS Configuration

### Using Let's Encrypt (Free SSL)

1. **Install Certbot**
```bash
sudo apt-get install certbot python3-certbot-nginx
```

2. **Obtain Certificate**
```bash
sudo certbot --nginx -d api.frenchmastergh.com
```

3. **Auto-renewal**
```bash
sudo certbot renew --dry-run
```

### Using Cloudflare (Recommended)

1. **Add Domain to Cloudflare**
2. **Update DNS Records**
3. **Enable SSL/TLS**
   - Set to "Full" or "Full (strict)"
4. **Enable Automatic HTTPS Rewrites**

---

## Monitoring & Logging

### Application Monitoring

**Option 1: PM2 Monitoring**
```bash
pm2 install pm2-logrotate
pm2 monit
```

**Option 2: Sentry**
```bash
npm install @sentry/node
```

Configure in `server.js`:
```javascript
const Sentry = require('@sentry/node');
Sentry.init({ dsn: 'your-sentry-dsn' });
```

**Option 3: New Relic / Datadog**
- Sign up for service
- Install agent
- Configure monitoring

### Logging

**Winston Logger** (already configured):
```javascript
// Logs are automatically saved
// Configure log levels in .env
LOG_LEVEL=info
```

**Log Rotation:**
```bash
# Install logrotate
sudo apt-get install logrotate

# Configure
sudo nano /etc/logrotate.d/french-master
```

---

## Scaling

### Horizontal Scaling

1. **Load Balancer**
   - Use AWS ELB, DigitalOcean Load Balancer, or Nginx
   - Distribute traffic across multiple instances

2. **Multiple Instances**
   - Run multiple backend instances
   - Use PM2 cluster mode:
   ```bash
   pm2 start server.js -i max
   ```

### Database Scaling

1. **Read Replicas**
   - Configure MongoDB read replicas
   - Route read queries to replicas

2. **Connection Pooling**
   - Configure Mongoose connection pool
   - Set appropriate pool size

### Caching

1. **Redis Cache**
   - Install Redis
   - Cache frequently accessed data
   - Use for session storage

2. **CDN**
   - Use Cloudflare or AWS CloudFront
   - Cache static assets
   - Reduce server load

---

## Deployment Checklist

### Pre-Deployment

- [ ] All environment variables configured
- [ ] Database backups enabled
- [ ] SSL certificates installed
- [ ] Domain DNS configured
- [ ] API endpoints tested
- [ ] Error tracking configured
- [ ] Logging configured
- [ ] Monitoring set up

### Deployment

- [ ] Backend deployed and running
- [ ] Frontend built and submitted
- [ ] Database migrations applied
- [ ] Health checks passing
- [ ] API endpoints accessible

### Post-Deployment

- [ ] Test all features
- [ ] Monitor error logs
- [ ] Check performance metrics
- [ ] Verify payment processing
- [ ] Test push notifications
- [ ] Verify analytics tracking

---

## Rollback Procedure

### Backend Rollback

**Heroku:**
```bash
heroku rollback
```

**PM2:**
```bash
# Revert to previous version
git checkout previous-commit
pm2 restart french-master-api
```

**Docker:**
```bash
docker-compose down
docker-compose up -d --scale api=0
# Deploy previous version
```

### Frontend Rollback

**EAS:**
```bash
eas update:rollback
```

---

## Maintenance

### Regular Tasks

1. **Update Dependencies**
   ```bash
   npm audit
   npm update
   ```

2. **Database Maintenance**
   - Regular backups
   - Index optimization
   - Query performance review

3. **Security Updates**
   - Update Node.js version
   - Patch vulnerabilities
   - Review access logs

4. **Performance Monitoring**
   - Review response times
   - Check error rates
   - Optimize slow queries

---

**Last Updated:** January 2025

