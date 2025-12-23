# API Reference - French Master GH

Complete API documentation for the French Master GH backend.

## Base URL

```
Development: http://localhost:5000/api
Production: https://api.frenchmastergh.com/api
```

## Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-token>
```

---

## Authentication Endpoints

### Register User

**POST** `/api/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+233123456789" // Optional
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "User already exists"
}
```

---

### Login

**POST** `/api/auth/login`

Authenticate user and get tokens.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "avatar": "https://..."
  }
}
```

---

### Get Current User

**GET** `/api/auth/me`

Get authenticated user's profile. **Protected**

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "avatar": "https://...",
    "enrolledCourses": [...],
    "preferences": {
      "theme": "light",
      "notifications": true
    }
  }
}
```

---

### Refresh Token

**POST** `/api/auth/refresh`

Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## Course Endpoints

### Get All Courses

**GET** `/api/courses`

Get paginated list of courses with optional filters.

**Query Parameters:**
- `category` (string): Filter by category (french, english, exam-prep, business, conversation, grammar)
- `level` (string): Filter by level (beginner, intermediate, advanced, all-levels)
- `search` (string): Search in title and description
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `sort` (string): Sort by (price, rating, date, students)
- `minPrice` (number): Minimum price
- `maxPrice` (number): Maximum price

**Example:**
```
GET /api/courses?category=french&level=beginner&page=1&limit=10
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Complete French for Beginners",
      "description": "Learn French from scratch...",
      "thumbnail": "https://...",
      "price": 99.99,
      "currency": "GHS",
      "level": "beginner",
      "category": "french",
      "rating": {
        "average": 4.5,
        "count": 120
      },
      "studentsEnrolled": 500,
      "duration": 20,
      "totalLessons": 45
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

---

### Get Course by ID

**GET** `/api/courses/:id`

Get detailed course information.

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Complete French for Beginners",
    "description": "Comprehensive French course...",
    "shortDescription": "Learn French from scratch",
    "thumbnail": "https://...",
    "previewVideo": "https://...",
    "price": 99.99,
    "originalPrice": 149.99,
    "currency": "GHS",
    "isFree": false,
    "level": "beginner",
    "category": "french",
    "duration": 20,
    "totalLessons": 45,
    "studentsEnrolled": 500,
    "rating": {
      "average": 4.5,
      "count": 120
    },
    "instructor": {
      "_id": "...",
      "name": "Marie Dubois",
      "avatar": "https://...",
      "bio": "Experienced French teacher..."
    },
    "whatYouWillLearn": [
      "Basic French vocabulary",
      "Grammar fundamentals",
      "Conversation skills"
    ],
    "requirements": [
      "No prior knowledge required",
      "Internet connection"
    ],
    "lessons": [...],
    "tags": ["beginner", "french", "grammar"],
    "certificate": {
      "enabled": true
    },
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

---

### Get Featured Courses

**GET** `/api/courses/featured/list`

Get featured/popular courses.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "title": "...",
      "thumbnail": "...",
      "price": 99.99,
      "rating": {...},
      "featured": true
    }
  ]
}
```

---

## Lesson Endpoints

### Get Course Lessons

**GET** `/api/lessons/course/:courseId`

Get all lessons for a specific course.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Introduction to French",
      "description": "Learn the basics...",
      "videoUrl": "https://...",
      "videoDuration": 1200,
      "order": 1,
      "resources": [...],
      "quiz": {...}
    }
  ]
}
```

---

### Get Lesson by ID

**GET** `/api/lessons/:id`

Get detailed lesson information.

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Introduction to French",
    "description": "Learn the basics...",
    "videoUrl": "https://...",
    "videoDuration": 1200,
    "content": "Full lesson content...",
    "order": 1,
    "course": {
      "_id": "...",
      "title": "..."
    },
    "resources": [
      {
        "type": "pdf",
        "url": "https://...",
        "title": "Lesson Notes"
      }
    ],
    "quiz": {
      "_id": "...",
      "questions": [...]
    }
  }
}
```

---

### Update Lesson Progress

**POST** `/api/lessons/:id/progress` **Protected**

Update user's progress for a lesson.

**Request Body:**
```json
{
  "completed": true,
  "progress": 100,
  "timeSpent": 1200
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "lesson": "...",
    "user": "...",
    "completed": true,
    "progress": 100,
    "timeSpent": 1200,
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

---

## Payment Endpoints

### Create Payment Intent

**POST** `/api/payments/create-intent` **Protected**

Create a payment intent for course purchase.

**Request Body:**
```json
{
  "courseId": "507f1f77bcf86cd799439011",
  "paymentMethod": "stripe"
}
```

**Response (Stripe):**
```json
{
  "success": true,
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_xxx"
}
```

**Response (Other methods):**
```json
{
  "success": true,
  "paymentId": "507f1f77bcf86cd799439011",
  "transactionId": "TXN-1234567890-abc123"
}
```

---

### Confirm Payment

**POST** `/api/payments/confirm` **Protected**

Confirm payment and enroll user in course.

**Request Body:**
```json
{
  "paymentId": "507f1f77bcf86cd799439011",
  "transactionId": "TXN-1234567890-abc123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment confirmed and enrollment successful",
  "payment": {
    "_id": "...",
    "status": "completed",
    "amount": 99.99,
    "paidAt": "2025-01-01T00:00:00.000Z"
  }
}
```

---

### Get Payment History

**GET** `/api/payments/history` **Protected**

Get user's payment history.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "course": {
        "_id": "...",
        "title": "...",
        "thumbnail": "..."
      },
      "amount": 99.99,
      "currency": "GHS",
      "status": "completed",
      "paymentMethod": "stripe",
      "paidAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

---

## Progress Endpoints

### Get Course Progress

**GET** `/api/progress/course/:courseId` **Protected**

Get user's progress for a specific course.

**Response:**
```json
{
  "success": true,
  "data": {
    "course": "...",
    "user": "...",
    "completedLessons": 30,
    "totalLessons": 45,
    "progress": 66.67,
    "timeSpent": 3600,
    "lastAccessed": "2025-01-01T00:00:00.000Z",
    "lessons": [
      {
        "lesson": "...",
        "completed": true,
        "progress": 100,
        "timeSpent": 120
      }
    ]
  }
}
```

---

### Get Dashboard Stats

**GET** `/api/progress/dashboard` **Protected**

Get user's learning dashboard statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalCourses": 5,
      "completedCourses": 2,
      "inProgressCourses": 3,
      "totalLessons": 150,
      "completedLessons": 75,
      "totalTimeSpent": 7200,
      "currentStreak": 7,
      "longestStreak": 15,
      "points": 1250,
      "level": 5
    },
    "courses": [...],
    "achievements": [...],
    "recentActivity": [...]
  }
}
```

---

## Review Endpoints

### Get Course Reviews

**GET** `/api/reviews/course/:courseId`

Get all reviews for a course.

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `rating` (number): Filter by rating (1-5)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "user": {
        "_id": "...",
        "name": "John Doe",
        "avatar": "https://..."
      },
      "course": "...",
      "rating": 5,
      "comment": "Excellent course!",
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {...}
}
```

---

### Create Review

**POST** `/api/reviews` **Protected**

Create a review for a course.

**Request Body:**
```json
{
  "courseId": "507f1f77bcf86cd799439011",
  "rating": 5,
  "comment": "Excellent course! Very comprehensive."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "user": "...",
    "course": "...",
    "rating": 5,
    "comment": "Excellent course!",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

---

## Blog Endpoints

### Get All Blog Posts

**GET** `/api/blog`

Get paginated list of blog posts.

**Query Parameters:**
- `category` (string): Filter by category
- `tag` (string): Filter by tag
- `search` (string): Search in title and content
- `page` (number): Page number
- `limit` (number): Items per page

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "10 Tips for Learning French",
      "excerpt": "Learn French faster with these tips...",
      "content": "Full article content...",
      "thumbnail": "https://...",
      "author": {
        "name": "Marie Dubois",
        "avatar": "https://..."
      },
      "category": "tips",
      "tags": ["learning", "french"],
      "views": 500,
      "publishedAt": "2025-01-01T00:00:00.000Z",
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {...}
}
```

---

### Get Blog Post by ID

**GET** `/api/blog/:id`

Get detailed blog post.

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "10 Tips for Learning French",
    "excerpt": "Learn French faster...",
    "content": "Full article content...",
    "thumbnail": "https://...",
    "author": {...},
    "category": "tips",
    "tags": ["learning", "french"],
    "views": 500,
    "relatedPosts": [...],
    "publishedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

---

## Wishlist Endpoints

### Get Wishlist

**GET** `/api/wishlist` **Protected**

Get user's wishlist.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "course": {
        "_id": "...",
        "title": "...",
        "thumbnail": "...",
        "price": 99.99
      },
      "addedAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### Add to Wishlist

**POST** `/api/wishlist/:courseId` **Protected**

Add course to wishlist.

**Response:**
```json
{
  "success": true,
  "message": "Course added to wishlist"
}
```

---

### Remove from Wishlist

**DELETE** `/api/wishlist/:courseId` **Protected**

Remove course from wishlist.

**Response:**
```json
{
  "success": true,
  "message": "Course removed from wishlist"
}
```

---

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error information" // Optional
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limiting

API requests are rate-limited to prevent abuse:
- **Authentication endpoints**: 5 requests per 15 minutes per IP
- **Other endpoints**: 100 requests per 15 minutes per IP

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1609459200
```

---

## Pagination

Paginated endpoints return pagination metadata:

```json
{
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

**Last Updated:** January 2025

