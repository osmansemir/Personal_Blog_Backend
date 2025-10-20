# Postman Testing Guide for Blog Backend API

This guide will help you test the Blog Backend API using Postman with the pre-configured collection and environment files.

## Files Included

1. **Blog_Backend_API.postman_collection.json** - Complete API collection with 25+ requests
2. **Blog_Backend_Environment.postman_environment.json** - Environment with automatic variable management
3. **POSTMAN_TESTING_GUIDE.md** - This guide

---

## Step 1: Start the Server

Before testing, start the development server:

```bash
cd /home/osmansemir/projects/blog-backend
pnpm run dev
```

You should see:
```
🚀 Server running on port 5000
🌍 Environment: development
✅ Connected to MongoDB
```

The API will be available at: **http://localhost:5000**

---

## Step 2: Import into Postman

### Import Collection

1. Open Postman
2. Click **Import** button (top-left corner)
3. Drag and drop `Blog_Backend_API.postman_collection.json` or click "Choose Files"
4. Click **Import**
5. You'll see "Blog Backend API" collection appear in the left sidebar

### Import Environment

1. Click **Import** again
2. Drag and drop `Blog_Backend_Environment.postman_environment.json`
3. Click **Import**
4. Select the environment from the dropdown (top-right corner): **Blog Backend - Development**

---

## Step 3: Collection Structure

The collection is organized into 5 folders:

```
Blog Backend API
├── 1. Authentication (4 requests)
│   ├── Register User
│   ├── Register Author
│   ├── Login User/Author
│   └── Login Admin
├── 2. Users (4 requests)
│   ├── Get All Users (Admin)
│   ├── Get User by ID (Admin)
│   ├── Upgrade to Author
│   └── Delete User (Admin)
├── 3. Articles - Public (6 requests)
│   ├── Get All Articles (Public)
│   ├── Get Article by Slug
│   ├── Get Articles by Author ID
│   ├── Get Featured Articles
│   ├── Search Articles
│   └── Filter by Date Range
├── 4. Articles - Author (5 requests)
│   ├── Create Article
│   ├── Get My Articles
│   ├── Update Article
│   ├── Delete Article
│   └── Submit Article for Review
└── 5. Articles - Admin Workflow (3 requests)
    ├── Get Pending Articles
    ├── Approve Article
    └── Reject Article
```

---

## Step 4: Environment Variables

The environment automatically manages these variables:

| Variable | Purpose | Auto-Set |
|----------|---------|----------|
| `baseUrl` | API base URL | No (default: http://localhost:5000) |
| `token` | JWT auth token | Yes (after login) |
| `userId` | Current user ID | Yes (after login) |
| `articleId` | Current article ID | Yes (after create article) |
| `articleSlug` | Current article slug | Yes (after create article) |

**How it works:**
- When you login, the `token` and `userId` are automatically saved
- When you create an article, the `articleId` and `articleSlug` are automatically saved
- All subsequent requests use these variables automatically

---

## Step 5: Complete Testing Workflow

### Scenario 1: Author Creates and Publishes Article

**Execute in this order:**

#### 1. Register Author
**Folder:** 1. Authentication → Register Author

Click **Send**. You should see:
```json
{
  "message": "User registered successfully"
}
```

---

#### 2. Login as Author
**Folder:** 1. Authentication → Login User/Author

Update the body to match your registration:
```json
{
  "email": "author@test.com",
  "password": "password123"
}
```

Click **Send**.

**What happens:**
- ✅ Token is automatically saved to environment
- ✅ User ID is automatically saved
- Check the Postman Console (View → Show Postman Console) to see logs

---

#### 3. Create Article
**Folder:** 4. Articles - Author → Create Article

The request body is pre-filled with a sample article. Click **Send**.

**What happens:**
- ✅ Article ID is automatically saved
- ✅ Article Slug is automatically saved
- Article status is "draft"

Response:
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "Getting Started with Node.js and Express",
  "slug": "getting-started-with-nodejs-and-express",
  "status": "draft",
  "author": {
    "_id": "...",
    "name": "Test Author",
    "email": "author@test.com",
    "role": "author"
  },
  ...
}
```

---

#### 4. Get My Articles
**Folder:** 4. Articles - Author → Get My Articles

Click **Send** to see all your articles (including drafts).

---

#### 5. Update Article
**Folder:** 4. Articles - Author → Update Article

The request already uses `{{articleId}}` from the previous step. Modify the body if you want:
```json
{
  "title": "Updated Title Here",
  "description": "Updated description"
}
```

Click **Send**.

---

#### 6. Submit Article for Review
**Folder:** 4. Articles - Author → Submit Article for Review

Click **Send**. Article status changes from "draft" → "pending".

---

#### 7. Login as Admin
**Folder:** 1. Authentication → Login Admin

**IMPORTANT:** First, you need to have an admin user in your database. If you don't have one, you need to create it directly in MongoDB.

Update the body:
```json
{
  "email": "admin@test.com",
  "password": "admin123"
}
```

Click **Send**. Admin token is now saved.

---

#### 8. Get Pending Articles
**Folder:** 5. Articles - Admin Workflow → Get Pending Articles

Click **Send**. You'll see all articles awaiting review, including the one you just submitted.

---

#### 9. Approve Article
**Folder:** 5. Articles - Admin Workflow → Approve Article

Click **Send**. Article status changes from "pending" → "approved".

---

#### 10. Verify Public Visibility
**Folder:** 3. Articles - Public → Get All Articles (Public)

Click **Send** (no authentication needed). You should now see your approved article in the public list!

---

### Scenario 2: Article Rejection and Resubmission

#### 1. Login as Author and Create Another Article
Use the same steps as above (login, create article, submit for review).

---

#### 2. Login as Admin
**Folder:** 1. Authentication → Login Admin

---

#### 3. Reject Article
**Folder:** 5. Articles - Admin Workflow → Reject Article

The body includes a sample rejection reason:
```json
{
  "reason": "The article needs more technical depth in the implementation section. Please add more code examples demonstrating error handling and edge cases."
}
```

Click **Send**. Article status changes to "rejected".

---

#### 4. Login as Author Again
**Folder:** 1. Authentication → Login User/Author

---

#### 5. Get My Articles with Status Filter
**Folder:** 4. Articles - Author → Get My Articles

Modify the URL to filter rejected articles:
```
{{baseUrl}}/api/articles/my/articles?status=rejected&page=1&limit=10
```

You'll see your rejected article with the rejection reason.

---

#### 6. Update Article Based on Feedback
**Folder:** 4. Articles - Author → Update Article

Improve the article based on admin feedback.

---

#### 7. Resubmit for Review
**Folder:** 4. Articles - Author → Submit Article for Review

The rejection reason is cleared, and status changes back to "pending".

---

#### 8. Admin Approves
Login as admin and approve the article.

---

### Scenario 3: Testing Pagination and Filtering

#### 1. Create Multiple Articles
Use **4. Articles - Author → Create Article** multiple times with different data:
- Change the title, slug, description
- Use different tags
- Mark some as featured

---

#### 2. Test Pagination
**Folder:** 3. Articles - Public → Get All Articles (Public)

Try different pagination parameters:
```
{{baseUrl}}/api/articles?page=1&limit=5
{{baseUrl}}/api/articles?page=2&limit=5
```

Response includes pagination metadata:
```json
{
  "data": [ ... ],
  "pagination": {
    "currentPage": 2,
    "totalPages": 5,
    "totalItems": 23,
    "itemsPerPage": 5,
    "hasNextPage": true,
    "hasPrevPage": true,
    "nextPage": 3,
    "prevPage": 1
  }
}
```

---

#### 3. Test Search
**Folder:** 3. Articles - Public → Search Articles

Modify the query parameters:
```
{{baseUrl}}/api/articles?search=nodejs&tags=javascript,backend&sortBy=createdAt&order=desc
```

---

#### 4. Test Featured Filter
**Folder:** 3. Articles - Public → Get Featured Articles

```
{{baseUrl}}/api/articles?featured=true
```

---

#### 5. Test Date Range Filter
**Folder:** 3. Articles - Public → Filter by Date Range

```
{{baseUrl}}/api/articles?startDate=2025-01-01&endDate=2025-12-31
```

---

### Scenario 4: Testing Rate Limiting

#### 1. Test Auth Rate Limiter (5 requests per 15 minutes)
**Folder:** 1. Authentication → Login User/Author

Click **Send** rapidly 6 times.

**Expected:**
- Requests 1-5: Normal response (200 or 400)
- Request 6: Rate limit error (429)

```json
{
  "success": false,
  "statusCode": 429,
  "message": "Too many authentication attempts. Please try again after 15 minutes."
}
```

---

#### 2. Test Article Creation Rate Limiter (10 per hour)
**Folder:** 4. Articles - Author → Create Article

Create 11 articles rapidly.

**Expected:**
- Articles 1-10: Success (201)
- Article 11: Rate limit error (429)

```json
{
  "success": false,
  "statusCode": 429,
  "message": "Too many articles created. Please try again after an hour."
}
```

---

### Scenario 5: Testing Validation

#### 1. Invalid Email Format
**Folder:** 1. Authentication → Register User

Modify body with invalid email:
```json
{
  "name": "Test",
  "email": "invalid-email",
  "password": "password123"
}
```

**Expected response (400):**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

---

#### 2. Short Password
Modify body:
```json
{
  "name": "Test",
  "email": "test@example.com",
  "password": "123"
}
```

**Expected:**
```json
{
  "errors": [
    {
      "field": "password",
      "message": "Password must be at least 8 characters"
    }
  ]
}
```

---

#### 3. Invalid Article Data
**Folder:** 4. Articles - Author → Create Article

Modify body with invalid slug:
```json
{
  "title": "Test",
  "slug": "INVALID SLUG WITH SPACES",
  "description": "Short",
  "markdown": "Too short"
}
```

**Expected:**
```json
{
  "errors": [
    {
      "field": "slug",
      "message": "Slug must be lowercase, alphanumeric, and can contain hyphens"
    },
    {
      "field": "description",
      "message": "Description must be at least 10 characters"
    },
    {
      "field": "markdown",
      "message": "Markdown content must be at least 10 characters"
    }
  ]
}
```

---

#### 4. Rejection Reason Too Short
**Folder:** 5. Articles - Admin Workflow → Reject Article

Modify body:
```json
{
  "reason": "Bad"
}
```

**Expected:**
```json
{
  "errors": [
    {
      "field": "reason",
      "message": "Rejection reason must be at least 10 characters"
    }
  ]
}
```

---

### Scenario 6: Testing Authorization

#### 1. Access Admin Endpoint Without Token
**Folder:** 5. Articles - Admin Workflow → Get Pending Articles

Remove the `Authorization` header and click **Send**.

**Expected (401):**
```json
{
  "success": false,
  "statusCode": 401,
  "message": "Not authorized, invalid token"
}
```

---

#### 2. Access Admin Endpoint as Author
Login as author first, then:

**Folder:** 5. Articles - Admin Workflow → Get Pending Articles

**Expected (403):**
```json
{
  "success": false,
  "statusCode": 403,
  "message": "Access denied"
}
```

---

#### 3. Update Someone Else's Article
1. Login as Author A and create an article (save articleId)
2. Login as Author B (different author)
3. Try to update Author A's article using the saved articleId

**Expected (403):**
```json
{
  "success": false,
  "statusCode": 403,
  "message": "You are not allowed to modify this article"
}
```

---

## Step 6: Viewing Results

### Console Logs
The test scripts log important information. To view:
1. Open **View → Show Postman Console** (or Alt+Ctrl+C)
2. Execute requests
3. See logs like:
```
✅ Token saved: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
✅ User ID saved: 507f1f77bcf86cd799439011
✅ Role: author
✅ Article ID saved: 507f1f77bcf86cd799439012
✅ Article Slug saved: my-first-article
```

---

### Test Results
After executing a request, check the **Test Results** tab to see:
- ✅ Login successful
- ✅ Article created successfully
- ✅ Response has pagination data

---

### Environment Variables
To view current variable values:
1. Click the environment dropdown (top-right)
2. Click the eye icon 👁️
3. See current values for token, userId, articleId, etc.

---

## Step 7: Pro Tips

### Tip 1: Collection Runner
Run multiple requests in sequence automatically:
1. Right-click on a folder (e.g., "1. Authentication")
2. Select **Run collection**
3. Choose which requests to run
4. Set iterations and delay
5. Click **Run**

---

### Tip 2: Pre-request Scripts
Add to any request to check token existence:
```javascript
if (!pm.environment.get("token")) {
    console.log("⚠️ No token found! Please login first.");
}
```

---

### Tip 3: Global Search
Press **Ctrl+K** (Cmd+K on Mac) to search for any request quickly.

---

### Tip 4: Duplicate Requests
Right-click any request → **Duplicate** to create variations for testing.

---

### Tip 5: Export Results
After running tests, export results:
1. Click **Runner** tab
2. Run your collection
3. Click **Export Results**

---

## Step 8: Troubleshooting

### Issue 1: "Could not get response"
**Solution:** Make sure the server is running on port 5000
```bash
pnpm run dev
```

---

### Issue 2: "401 Unauthorized"
**Solution:**
1. Login first to get a token
2. Verify the token is saved: Check environment variables
3. Ensure the Authorization header is set: `Bearer {{token}}`

---

### Issue 3: "404 Not Found"
**Solution:**
1. Check the URL path
2. For article operations, ensure `{{articleId}}` or `{{articleSlug}}` is set
3. Create an article first if needed

---

### Issue 4: "403 Access Denied"
**Solution:**
1. Login with the correct role (admin for admin endpoints)
2. Make sure you're the owner of the resource
3. Check that you have the required role

---

### Issue 5: Environment variables not saving
**Solution:**
1. Ensure you've selected the environment (top-right dropdown)
2. Check the test scripts are included
3. View Postman Console for any errors

---

### Issue 6: "429 Too Many Requests"
**Solution:**
This is expected! You've hit the rate limit:
- Auth: Wait 15 minutes
- Article creation: Wait 1 hour
- Or restart the server to reset rate limiters

---

## Step 9: Quick Reference

### Rate Limits

| Endpoint Type | Window | Max Requests |
|--------------|--------|--------------|
| Auth (login/register) | 15 min | 5 |
| Create Article | 1 hour | 10 |
| General API | 15 min | 100 |
| Sensitive Operations | 1 hour | 3 |

---

### Article Status Flow

```
draft → pending → approved ✅
              ↓
           rejected → (update) → pending → approved ✅
```

---

### Required Roles

| Endpoint | Roles Allowed |
|----------|---------------|
| Register, Login | None (public) |
| Create Article | Author, Admin |
| Update Own Article | Author (owner), Admin |
| Get My Articles | Author, Admin |
| Submit for Review | Author (owner), Admin |
| Get Pending Articles | Admin only |
| Approve/Reject | Admin only |
| Get All Users | Admin only |

---

## Step 10: Sample Test Data

### Sample Article 1: Tutorial
```json
{
  "title": "Building a REST API with Express and MongoDB",
  "slug": "building-rest-api-express-mongodb",
  "description": "Learn how to build a production-ready REST API using Express.js and MongoDB with proper authentication and validation.",
  "markdown": "# Building a REST API\n\n## Introduction\n\nIn this tutorial...",
  "tags": ["express", "mongodb", "nodejs", "api", "tutorial"],
  "featured": true
}
```

---

### Sample Article 2: Opinion Piece
```json
{
  "title": "Why TypeScript is Essential for Modern Backend Development",
  "slug": "why-typescript-essential-backend",
  "description": "An exploration of how TypeScript improves code quality, developer experience, and maintainability in backend projects.",
  "markdown": "# TypeScript in Backend\n\n## The Case for Type Safety...",
  "tags": ["typescript", "backend", "javascript", "opinion"],
  "featured": false
}
```

---

### Sample Article 3: Technical Deep-Dive
```json
{
  "title": "Understanding JWT Authentication: A Complete Guide",
  "slug": "understanding-jwt-authentication-complete-guide",
  "description": "Deep dive into JSON Web Tokens: how they work, security considerations, implementation patterns, and best practices for modern applications.",
  "markdown": "# JWT Authentication\n\n## What are JWTs?\n\nJSON Web Tokens...",
  "tags": ["jwt", "authentication", "security", "nodejs"],
  "featured": true
}
```

---

## Summary

You now have:
- ✅ Complete Postman collection with 25+ pre-configured requests
- ✅ Environment with automatic token and ID management
- ✅ 6 comprehensive testing scenarios
- ✅ Test scripts that validate responses
- ✅ Console logging for debugging
- ✅ All endpoints organized by functionality

**Start testing:**
1. Start the server: `pnpm run dev`
2. Import both JSON files into Postman
3. Select the environment
4. Follow Scenario 1 to test the complete workflow

Happy testing! 🚀