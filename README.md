# Blog Backend API

A comprehensive RESTful API for a blog platform with authentication, role-based access control, and a complete draft/approval workflow system.

## 🚀 Features

- **Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (User, Author, Admin)
  - Self-service role upgrade (User → Author)
  - Admin-managed role assignments

- **Article Management**
  - CRUD operations for articles
  - Draft and approval workflow
  - Full-text search
  - Advanced filtering and sorting
  - Pagination support
  - Tag-based categorization

- **Security**
  - Input validation with Zod
  - Rate limiting (brute-force protection)
  - CORS configuration
  - Helmet security headers
  - Protected field filtering
  - XSS prevention

- **Logging & Monitoring**
  - Winston logger with colored output
  - File logging in production
  - Request logging with Morgan

## 📋 Table of Contents

- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
  - [Authentication](#authentication)
  - [Articles](#articles)
  - [Article Workflow](#article-workflow)
  - [Users](#users)
- [Article Status Workflow](#article-status-workflow)
- [Rate Limits](#rate-limits)
- [Error Responses](#error-responses)

## 🛠️ Tech Stack

- **Runtime:** Node.js v24.9.0
- **Framework:** Express.js 5.1.0
- **Database:** MongoDB (Mongoose 8.19.1)
- **Authentication:** JWT (jsonwebtoken 9.0.2)
- **Validation:** Zod 4.1.12
- **Security:** Helmet 8.1.0, express-rate-limit 8.1.0
- **Logging:** Winston 3.18.3, Morgan 1.10.1
- **Password Hashing:** bcryptjs 3.0.2

## 🏁 Getting Started

### Prerequisites

- Node.js v24.9.0 or higher
- MongoDB database (local or Atlas)
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd blog-backend

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Edit .env with your configuration
nano .env

# Start development server
pnpm dev
```

### Available Scripts

```bash
pnpm dev      # Start development server with nodemon
```

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# CORS Configuration (comma-separated)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

## 📚 API Endpoints

Base URL: `http://localhost:5000/api`

### Authentication

#### Register User

```http
POST /api/auth/register
```

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user"  // Optional: "user" or "author" (default: "user")
}
```

**Response (201):**
```json
{
  "message": "User registered successfully"
}
```

**Rate Limit:** 5 requests per 15 minutes

---

#### Login

```http
POST /api/auth/login
```

**Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "author"
  }
}
```

**Rate Limit:** 5 requests per 15 minutes

---

### Articles

#### Get All Articles (Public)

```http
GET /api/articles
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)
- `search` - Search in title and description
- `tags` - Filter by tags (comma-separated)
- `featured` - Filter featured articles (true/false)
- `author` - Filter by author ID
- `startDate` - Filter by creation date (YYYY-MM-DD)
- `endDate` - Filter by creation date (YYYY-MM-DD)
- `sortBy` - Sort field (default: createdAt)
- `order` - Sort order: asc/desc (default: desc)
- `status` - Filter by status (admin only)

**Examples:**
```bash
# Basic pagination
GET /api/articles?page=2&limit=20

# Search articles
GET /api/articles?search=nodejs

# Filter by tags
GET /api/articles?tags=javascript,react

# Featured articles only
GET /api/articles?featured=true

# Date range
GET /api/articles?startDate=2025-01-01&endDate=2025-12-31

# Combined filters
GET /api/articles?search=tutorial&tags=nodejs&featured=true&page=1&limit=10&sortBy=createdAt&order=desc
```

**Response (200):**
```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Getting Started with Node.js",
      "slug": "getting-started-with-nodejs",
      "description": "A comprehensive guide to Node.js",
      "markdown": "# Getting Started...",
      "tags": ["nodejs", "javascript", "tutorial"],
      "featured": false,
      "status": "approved",
      "author": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "author"
      },
      "createdAt": "2025-10-18T10:00:00.000Z",
      "updatedAt": "2025-10-18T10:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 47,
    "itemsPerPage": 10,
    "hasNextPage": true,
    "hasPrevPage": false,
    "nextPage": 2,
    "prevPage": null
  }
}
```

**Note:** Public users only see approved articles. Admins can filter by status.

---

#### Get Article by Slug

```http
GET /api/articles/:slug
```

**Example:**
```bash
GET /api/articles/getting-started-with-nodejs
```

**Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "Getting Started with Node.js",
  "slug": "getting-started-with-nodejs",
  "description": "A comprehensive guide to Node.js",
  "markdown": "# Getting Started\n\nNode.js is...",
  "tags": ["nodejs", "javascript"],
  "featured": false,
  "status": "approved",
  "author": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "author"
  },
  "createdAt": "2025-10-18T10:00:00.000Z",
  "updatedAt": "2025-10-18T10:00:00.000Z"
}
```

---

#### Get User's Articles

```http
GET /api/articles/user/:userId
```

**Query Parameters:** Same as Get All Articles

**Example:**
```bash
GET /api/articles/user/507f1f77bcf86cd799439012?page=1&limit=10
```

---

#### Create Article (Author/Admin)

```http
POST /api/articles
Authorization: Bearer <token>
```

**Body:**
```json
{
  "title": "My New Article",
  "slug": "my-new-article",
  "description": "Article description here",
  "markdown": "# Article Content\n\nYour markdown content...",
  "tags": ["nodejs", "javascript"],
  "featured": false
}
```

**Response (201):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "My New Article",
  "slug": "my-new-article",
  "status": "draft",
  "author": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "author"
  },
  "createdAt": "2025-10-18T10:00:00.000Z",
  "updatedAt": "2025-10-18T10:00:00.000Z"
}
```

**Rate Limit:** 10 articles per hour

**Note:** New articles are created with `status: "draft"` by default.

---

#### Update Article (Author/Admin)

```http
PUT /api/articles/:id
Authorization: Bearer <token>
```

**Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "tags": ["nodejs", "express"]
}
```

**Response (200):** Updated article object

**Note:** Authors can only update their own articles. Admins can update any article.

**Protected Fields:** Cannot update `author`, `status`, `createdAt`, `updatedAt`, `_id`, `reviewedBy`, `reviewedAt`, `submittedAt`, `rejectionReason`

---

#### Delete Article (Author/Admin)

```http
DELETE /api/articles/:id
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Article deleted successfully"
}
```

---

### Article Workflow

#### Get My Articles (Author)

```http
GET /api/articles/my/articles
Authorization: Bearer <token>
```

**Query Parameters:**
- `status` - Filter by status (draft, pending, approved, rejected)
- `page`, `limit` - Pagination
- `sortBy`, `order` - Sorting

**Examples:**
```bash
# Get all my articles
GET /api/articles/my/articles

# Get only drafts
GET /api/articles/my/articles?status=draft

# Get rejected articles with feedback
GET /api/articles/my/articles?status=rejected
```

**Response (200):**
```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "My Article",
      "status": "rejected",
      "rejectionReason": "Please fix the typos in paragraph 3",
      "reviewedBy": {
        "_id": "507f1f77bcf86cd799439013",
        "name": "Admin User",
        "email": "admin@example.com"
      },
      "reviewedAt": "2025-10-18T11:00:00.000Z"
    }
  ],
  "pagination": { ... }
}
```

---

#### Submit Article for Review (Author)

```http
POST /api/articles/:id/submit
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Article submitted for review",
  "article": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "My Article",
    "status": "pending",
    "submittedAt": "2025-10-18T10:30:00.000Z"
  }
}
```

**Requirements:**
- Can only submit articles with status `draft` or `rejected`
- Must be the article owner

---

#### Get Pending Articles (Admin)

```http
GET /api/articles/admin/pending
Authorization: Bearer <token>
```

**Query Parameters:** page, limit, sortBy, order

**Response (200):**
```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Article Title",
      "status": "pending",
      "submittedAt": "2025-10-18T10:00:00.000Z",
      "author": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "author"
      }
    }
  ],
  "pagination": { ... }
}
```

**Note:** Sorted by `submittedAt` (oldest first) by default for review queue.

---

#### Approve Article (Admin)

```http
POST /api/articles/:id/approve
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Article approved successfully",
  "article": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Article Title",
    "status": "approved",
    "reviewedAt": "2025-10-18T11:00:00.000Z",
    "reviewedBy": {
      "_id": "507f1f77bcf86cd799439013",
      "name": "Admin User",
      "email": "admin@example.com"
    }
  }
}
```

**Requirements:**
- Article must have status `pending`
- Admin role required

---

#### Reject Article (Admin)

```http
POST /api/articles/:id/reject
Authorization: Bearer <token>
```

**Body:**
```json
{
  "reason": "Please fix the following issues: 1) Grammar errors in intro, 2) Need more references, 3) Add code examples"
}
```

**Response (200):**
```json
{
  "message": "Article rejected",
  "article": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Article Title",
    "status": "rejected",
    "rejectionReason": "Please fix the following issues...",
    "reviewedAt": "2025-10-18T11:00:00.000Z",
    "reviewedBy": {
      "_id": "507f1f77bcf86cd799439013",
      "name": "Admin User",
      "email": "admin@example.com"
    }
  }
}
```

**Requirements:**
- Article must have status `pending`
- Rejection reason required (10-500 characters)
- Admin role required

---

### Users

#### Get All Users (Admin)

```http
GET /api/users
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "author",
    "createdAt": "2025-10-18T10:00:00.000Z",
    "updatedAt": "2025-10-18T10:00:00.000Z"
  }
]
```

---

#### Get User by ID (Admin)

```http
GET /api/users/:id
Authorization: Bearer <token>
```

---

#### Delete User (Admin)

```http
DELETE /api/users/:id
Authorization: Bearer <token>
```

**Rate Limit:** 3 requests per hour

---

#### Upgrade to Author (User)

```http
PUT /api/users/me/upgrade-to-author
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Successfully upgraded to author",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "author"
  }
}
```

**Rate Limit:** 3 requests per hour

---

#### Update User Role (Admin)

```http
PUT /api/users/:id/role
Authorization: Bearer <token>
```

**Body:**
```json
{
  "role": "admin"
}
```

**Response (200):**
```json
{
  "message": "User role updated to admin",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "admin"
  }
}
```

**Rate Limit:** 3 requests per hour

**Note:** Admins cannot change their own role.

---

## 🔄 Article Status Workflow

```
┌─────────┐
│  draft  │ ← Initial state when article is created
└────┬────┘
     │ Author submits
     ↓
┌──────────┐
│ pending  │ ← Awaiting admin review
└────┬─────┘
     │
     ├──→ Admin approves ──→ ┌──────────┐
     │                       │ approved │ ← Public article
     │                       └──────────┘
     │
     └──→ Admin rejects ──→ ┌──────────┐
                            │ rejected │ ← Author can revise
                            └────┬─────┘
                                 │ Author revises & resubmits
                                 ↓
                            ┌──────────┐
                            │ pending  │
                            └──────────┘
```

### Status Descriptions

| Status | Visible To | Actions Available |
|--------|-----------|-------------------|
| **draft** | Author only | Edit, Submit, Delete |
| **pending** | Author + Admin | Admin: Approve/Reject |
| **approved** | Everyone | Edit (author/admin), Delete |
| **rejected** | Author only | View feedback, Edit, Resubmit |

---

## ⚡ Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| Authentication (`/auth/*`) | 5 requests | 15 minutes |
| Article Creation | 10 articles | 1 hour |
| Role Changes | 3 requests | 1 hour |
| User Deletion | 3 requests | 1 hour |
| General API | 100 requests | 15 minutes |

---

## ❌ Error Responses

All errors follow this format:

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Error message here",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### Common Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (no token or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

---

## 🔒 Security Features

- **JWT Authentication** - Token-based auth with 1-day expiration
- **Password Hashing** - bcryptjs with 10 salt rounds
- **Rate Limiting** - Protection against brute-force attacks
- **CORS** - Configurable allowed origins
- **Helmet** - Security headers (XSS, clickjacking, etc.)
- **Input Validation** - Zod schemas for all inputs
- **Protected Fields** - Prevent modification of sensitive data
- **Role-Based Access Control** - Fine-grained permissions

---

## 📝 Example Usage Flow

### Complete Author Workflow

```bash
# 1. Register as author
POST /api/auth/register
{ "name": "Jane Doe", "email": "jane@example.com", "password": "secure123", "role": "author" }

# 2. Login
POST /api/auth/login
{ "email": "jane@example.com", "password": "secure123" }
# Save the token from response

# 3. Create draft article
POST /api/articles
Authorization: Bearer <token>
{ "title": "My First Post", "slug": "my-first-post", ... }

# 4. View my drafts
GET /api/articles/my/articles?status=draft
Authorization: Bearer <token>

# 5. Submit for review
POST /api/articles/:id/submit
Authorization: Bearer <token>

# 6. Check status
GET /api/articles/my/articles
Authorization: Bearer <token>
# Status will be "pending"

# 7. If rejected, view feedback
GET /api/articles/my/articles?status=rejected
Authorization: Bearer <token>
# See rejectionReason

# 8. Revise and resubmit
PUT /api/articles/:id
Authorization: Bearer <token>
{ "markdown": "Updated content..." }

POST /api/articles/:id/submit
Authorization: Bearer <token>
```

### Admin Review Workflow

```bash
# 1. Login as admin
POST /api/auth/login
{ "email": "admin@example.com", "password": "admin123" }

# 2. View pending articles
GET /api/articles/admin/pending
Authorization: Bearer <token>

# 3. Approve article
POST /api/articles/:id/approve
Authorization: Bearer <token>

# OR reject with feedback
POST /api/articles/:id/reject
Authorization: Bearer <token>
{ "reason": "Please add more details in section 2" }
```

---

## 🤝 Contributing

This project was built with assistance from Claude Code.

---

## 📄 License

ISC

---

## 🙋 Support

For issues or questions, please create an issue in the repository.
