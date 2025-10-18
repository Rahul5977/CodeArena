# 🔌 LeetLab API Documentation

## Base URL

```
Development: http://localhost:8080/api/v1
Production: https://your-domain.com/api/v1
```

---

## 🔐 Authentication Endpoints

### Register User

```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}

Response: 201
{
  "success": true,
  "message": "User registered successfully",
  "user": { ... },
  "token": "jwt_token"
}
```

### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}

Response: 200
{
  "success": true,
  "message": "Login successful",
  "user": { ... },
  "token": "jwt_token",
  "refreshToken": "refresh_token"
}
```

### Get Profile

```http
GET /auth/profile
Authorization: Bearer {token}

Response: 200
{
  "success": true,
  "user": { ... }
}
```

### Update Profile

```http
PUT /auth/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "John Updated",
  "image": "url_to_image"
}

Response: 200
{
  "success": true,
  "message": "Profile updated",
  "user": { ... }
}
```

### Logout

```http
POST /auth/logout
Authorization: Bearer {token}

Response: 200
{
  "success": true,
  "message": "Logged out successfully"
}
```

### Change Password

```http
POST /auth/change-password
Authorization: Bearer {token}
Content-Type: application/json

{
  "currentPassword": "oldPassword",
  "newPassword": "newPassword123"
}

Response: 200
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

## 📝 Problem Endpoints

### Get All Problems

```http
GET /problems
Authorization: Bearer {token}

Response: 200
{
  "success": true,
  "problems": [
    {
      "id": "uuid",
      "title": "Two Sum",
      "difficulty": "EASY",
      "tags": ["Array", "Hash Table"],
      "description": "...",
      "examples": [...],
      "constraints": "..."
    }
  ]
}
```

### Get Problem by ID

```http
GET /problems/:id
Authorization: Bearer {token}

Response: 200
{
  "success": true,
  "problem": {
    "id": "uuid",
    "title": "Two Sum",
    "difficulty": "EASY",
    "description": "...",
    "examples": [...],
    "constraints": "...",
    "testcases": [...],
    "codeSnippets": {
      "javascript": "function solution() {...}",
      "python": "def solution(): ...",
      "cpp": "..."
    }
  }
}
```

### Create Problem (Admin Only)

```http
POST /problems
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "New Problem",
  "description": "Problem description",
  "difficulty": "MEDIUM",
  "tags": ["Array", "DP"],
  "examples": [...],
  "constraints": "...",
  "testcases": [
    {
      "input": "...",
      "output": "..."
    }
  ],
  "codeSnippets": {...},
  "referenceSolutions": {...}
}

Response: 201
{
  "success": true,
  "message": "Problem created successfully",
  "problem": { ... }
}
```

### Update Problem (Admin Only)

```http
PUT /problems/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Updated Title",
  "description": "Updated description"
}

Response: 200
{
  "success": true,
  "message": "Problem updated successfully",
  "problem": { ... }
}
```

### Delete Problem (Admin Only)

```http
DELETE /problems/:id
Authorization: Bearer {token}

Response: 200
{
  "success": true,
  "message": "Problem deleted successfully"
}
```

---

## ⚡ Code Execution Endpoints

### Execute Code

```http
POST /execute-code
Authorization: Bearer {token}
Content-Type: application/json

{
  "problemId": "uuid",
  "sourceCode": "function solution() {...}",
  "language": "javascript",
  "stdin": "test input"
}

Response: 200
{
  "success": true,
  "stdout": "output",
  "stderr": "",
  "status": "Accepted",
  "time": "0.123s",
  "memory": "1024KB"
}
```

---

## 📤 Submission Endpoints

### Create Submission

```http
POST /submission
Authorization: Bearer {token}
Content-Type: application/json

{
  "problemId": "uuid",
  "sourceCode": {...},
  "language": "javascript"
}

Response: 201
{
  "success": true,
  "submission": {
    "id": "uuid",
    "status": "Accepted",
    "testCases": [...]
  }
}
```

### Get All Submissions

```http
GET /submission
Authorization: Bearer {token}

Response: 200
{
  "success": true,
  "submissions": [...]
}
```

### Get Submissions by Problem

```http
GET /submission/problem/:problemId
Authorization: Bearer {token}

Response: 200
{
  "success": true,
  "submissions": [...]
}
```

---

## 🏆 Contest Endpoints

### Get All Contests

```http
GET /contests
Authorization: Bearer {token}

Query Parameters:
- status: "UPCOMING" | "LIVE" | "COMPLETED"

Response: 200
{
  "success": true,
  "contests": [
    {
      "id": "uuid",
      "title": "Weekly Contest 123",
      "description": "...",
      "startTime": "2025-10-20T10:00:00Z",
      "endTime": "2025-10-20T12:00:00Z",
      "duration": 120,
      "status": "UPCOMING",
      "problemIds": [...],
      "participants": 150
    }
  ]
}
```

### Get Contest by ID

```http
GET /contests/:id
Authorization: Bearer {token}

Response: 200
{
  "success": true,
  "contest": {
    "id": "uuid",
    "title": "Weekly Contest 123",
    "problems": [...],
    "isRegistered": true,
    "mySubmissions": [...]
  }
}
```

### Register for Contest

```http
POST /contests/:id/register
Authorization: Bearer {token}

Response: 200
{
  "success": true,
  "message": "Registered successfully"
}
```

### Submit Contest Problem

```http
POST /contests/:id/submit
Authorization: Bearer {token}
Content-Type: application/json

{
  "problemId": "uuid",
  "sourceCode": {...},
  "language": "javascript"
}

Response: 201
{
  "success": true,
  "submission": {...},
  "score": 100,
  "penalty": 5
}
```

### Get Contest Leaderboard

```http
GET /contests/:id/leaderboard
Authorization: Bearer {token}

Response: 200
{
  "success": true,
  "leaderboard": [
    {
      "rank": 1,
      "userId": "uuid",
      "username": "user123",
      "totalScore": 300,
      "penalty": 15,
      "problemsSolved": 3,
      "lastSubmission": "2025-10-20T11:30:00Z"
    }
  ]
}
```

### Create Contest (Admin Only)

```http
POST /contests
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Weekly Contest",
  "description": "Contest description",
  "startTime": "2025-10-20T10:00:00Z",
  "endTime": "2025-10-20T12:00:00Z",
  "duration": 120,
  "problemIds": ["uuid1", "uuid2"],
  "maxParticipants": 500
}

Response: 201
{
  "success": true,
  "contest": {...}
}
```

---

## 📚 Sheet Endpoints

### Get All Sheets

```http
GET /sheets
Authorization: Bearer {token}

Query Parameters:
- type: "FREE" | "PREMIUM"
- difficulty: "EASY" | "MEDIUM" | "HARD"

Response: 200
{
  "success": true,
  "sheets": [
    {
      "id": "uuid",
      "title": "Striver SDE Sheet",
      "description": "...",
      "topic": "DSA",
      "difficulty": "MEDIUM",
      "price": 499,
      "type": "PREMIUM",
      "problemIds": [...],
      "estimatedHours": 100,
      "isPurchased": false
    }
  ]
}
```

### Get Sheet by ID

```http
GET /sheets/:id
Authorization: Bearer {token}

Response: 200
{
  "success": true,
  "sheet": {
    "id": "uuid",
    "title": "Striver SDE Sheet",
    "problems": [...],
    "progress": {
      "completed": 45,
      "total": 180,
      "percentage": 25
    }
  }
}
```

### Create Payment Order

```http
POST /sheets/:id/payment/create
Authorization: Bearer {token}

Response: 200
{
  "success": true,
  "orderId": "order_xyz",
  "amount": 49900,
  "currency": "INR"
}
```

### Verify Payment

```http
POST /sheets/:id/payment/verify
Authorization: Bearer {token}
Content-Type: application/json

{
  "orderId": "order_xyz",
  "paymentId": "pay_abc",
  "signature": "signature_hash"
}

Response: 200
{
  "success": true,
  "message": "Payment verified successfully",
  "userSheet": {...}
}
```

### Update Sheet Progress

```http
POST /sheets/:id/progress
Authorization: Bearer {token}
Content-Type: application/json

{
  "problemId": "uuid",
  "completed": true
}

Response: 200
{
  "success": true,
  "progress": {...}
}
```

### Get My Sheets

```http
GET /sheets/my-sheets
Authorization: Bearer {token}

Response: 200
{
  "success": true,
  "sheets": [...]
}
```

---

## 📋 Playlist Endpoints

### Get All Playlists

```http
GET /playlist
Authorization: Bearer {token}

Response: 200
{
  "success": true,
  "playlists": [
    {
      "id": "uuid",
      "name": "My Interview Prep",
      "description": "...",
      "problemCount": 50,
      "userId": "uuid",
      "createdAt": "..."
    }
  ]
}
```

### Get Playlist Details

```http
GET /playlist/:id
Authorization: Bearer {token}

Response: 200
{
  "success": true,
  "playlist": {
    "id": "uuid",
    "name": "My Interview Prep",
    "problems": [...],
    "description": "..."
  }
}
```

### Create Playlist

```http
POST /playlist
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Interview Prep",
  "description": "Important problems for interviews"
}

Response: 201
{
  "success": true,
  "playlist": {...}
}
```

### Add Problem to Playlist

```http
POST /playlist/:id/problem
Authorization: Bearer {token}
Content-Type: application/json

{
  "problemId": "uuid"
}

Response: 200
{
  "success": true,
  "message": "Problem added to playlist"
}
```

### Remove Problem from Playlist

```http
DELETE /playlist/:playlistId/problem/:problemId
Authorization: Bearer {token}

Response: 200
{
  "success": true,
  "message": "Problem removed from playlist"
}
```

### Delete Playlist

```http
DELETE /playlist/:id
Authorization: Bearer {token}

Response: 200
{
  "success": true,
  "message": "Playlist deleted successfully"
}
```

---

## 👥 User Management (Admin Only)

### Get All Users

```http
GET /admin/users
Authorization: Bearer {token}

Query Parameters:
- role: "SUPERADMIN" | "ADMIN" | "USER"
- isActive: true | false
- page: 1
- limit: 20

Response: 200
{
  "success": true,
  "users": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

### Get User by ID

```http
GET /admin/users/:id
Authorization: Bearer {token}

Response: 200
{
  "success": true,
  "user": {...}
}
```

### Promote User

```http
POST /admin/users/:id/promote
Authorization: Bearer {token}
Content-Type: application/json

{
  "newRole": "ADMIN",
  "reason": "Excellent contributions"
}

Response: 200
{
  "success": true,
  "message": "User promoted to ADMIN"
}
```

### Demote User

```http
POST /admin/users/:id/demote
Authorization: Bearer {token}
Content-Type: application/json

{
  "newRole": "USER",
  "reason": "Violation of rules"
}

Response: 200
{
  "success": true,
  "message": "User demoted to USER"
}
```

### Delete User

```http
DELETE /admin/users/:id
Authorization: Bearer {token}

Response: 200
{
  "success": true,
  "message": "User deleted successfully"
}
```

### Get System Stats

```http
GET /admin/users/stats
Authorization: Bearer {token}

Response: 200
{
  "success": true,
  "stats": {
    "totalUsers": 1000,
    "activeUsers": 850,
    "admins": 5,
    "totalProblems": 500,
    "totalContests": 50,
    "totalSubmissions": 10000
  }
}
```

---

## 🤖 AI Code Review

### Request Code Review

```http
POST /aiCodeReview
Authorization: Bearer {token}
Content-Type: application/json

{
  "code": "function solution() {...}",
  "language": "javascript",
  "problemId": "uuid"
}

Response: 200
{
  "success": true,
  "review": {
    "suggestions": [...],
    "timeComplexity": "O(n)",
    "spaceComplexity": "O(1)",
    "score": 85
  }
}
```

---

## 🔌 WebSocket Events

### Connect

```javascript
const socket = io("ws://localhost:8080");

socket.on("connect", () => {
  console.log("Connected to server");
});
```

### Contest Events

```javascript
// Join contest room
socket.emit("contest:join", { contestId: "uuid" });

// Listen for leaderboard updates
socket.on("leaderboard:update", (data) => {
  console.log("Leaderboard updated:", data);
});

// Listen for contest status changes
socket.on("contest:statusChange", (data) => {
  console.log("Contest status:", data.status);
});

// Listen for new submissions
socket.on("contest:newSubmission", (data) => {
  console.log("New submission:", data);
});
```

### Leave contest room

```javascript
socket.emit("contest:leave", { contestId: "uuid" });
```

---

## 📊 Error Responses

### Standard Error Format

```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error (only in development)"
}
```

### Common Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `429` - Too Many Requests
- `500` - Internal Server Error

---

## 🔐 Authentication Headers

All protected endpoints require:

```http
Authorization: Bearer {your_jwt_token}
```

---

## 📝 Notes

1. All timestamps are in ISO 8601 format (UTC)
2. All IDs are UUIDs
3. Pagination default: page=1, limit=20
4. Rate limiting: 100 requests per 15 minutes per IP
5. Maximum request body size: 10MB

---

**Last Updated: October 17, 2025**
