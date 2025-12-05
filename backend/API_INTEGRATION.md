# API Integration Guide

This document explains how the frontend communicates with the backend API.

## 🔗 API Base URL

```javascript
const API_URL = 'http://localhost:3001/api'; // Development
const API_URL = 'https://campus-taskboard-backend.onrender.com/api'; // Production
```

## 📡 Authentication

All requests (except login/register) require an Authorization header:

```javascript
const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`
};
```

## 🔐 Auth Endpoints

### Register User
```javascript
POST /api/auth/register
Content-Type: application/json

{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
}

Response (201):
{
    "success": true,
    "message": "User registered successfully",
    "user": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "created_at": "2025-12-05T10:00:00Z"
    }
}
```

### Login User
```javascript
POST /api/auth/login
Content-Type: application/json

{
    "email": "john@example.com",
    "password": "password123"
}

Response (200):
{
    "success": true,
    "message": "Login successful",
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com"
    }
}
```

### Get User Profile
```javascript
GET /api/auth/profile
Authorization: Bearer {token}

Response (200):
{
    "success": true,
    "user": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "created_at": "2025-12-05T10:00:00Z"
    }
}
```

### Update User Profile
```javascript
PUT /api/auth/profile
Authorization: Bearer {token}
Content-Type: application/json

{
    "name": "Jane Doe",
    "email": "jane@example.com"
}

Response (200):
{
    "success": true,
    "message": "Profile updated successfully",
    "user": {
        "id": 1,
        "name": "Jane Doe",
        "email": "jane@example.com"
    }
}
```

## 👥 Team Endpoints

### Get All Teams
```javascript
GET /api/teams
Authorization: Bearer {token}

Response (200):
{
    "success": true,
    "teams": [
        {
            "id": 1,
            "name": "Web Development",
            "description": "Building web apps",
            "created_by_name": "John Doe",
            "member_count": 5,
            "created_at": "2025-12-05T10:00:00Z"
        }
    ]
}
```

### Get User's Teams
```javascript
GET /api/teams/my-teams
Authorization: Bearer {token}

Response (200):
{
    "success": true,
    "teams": [
        {
            "id": 1,
            "name": "Web Development",
            "description": "Building web apps",
            "role": "member",
            "member_count": 5,
            "created_at": "2025-12-05T10:00:00Z"
        }
    ]
}
```

### Create Team
```javascript
POST /api/teams
Authorization: Bearer {token}
Content-Type: application/json

{
    "name": "Mobile Development",
    "description": "Building mobile apps"
}

Response (201):
{
    "success": true,
    "message": "Team created successfully",
    "team": {
        "id": 2,
        "name": "Mobile Development",
        "description": "Building mobile apps",
        "created_by": 1,
        "created_at": "2025-12-05T10:00:00Z"
    }
}
```

### Get Team Details
```javascript
GET /api/teams/{teamId}
Authorization: Bearer {token}

Response (200):
{
    "success": true,
    "team": {
        "id": 1,
        "name": "Web Development",
        "description": "Building web apps",
        "created_by": 1,
        "members": [
            {
                "id": 1,
                "name": "John Doe",
                "email": "john@example.com",
                "role": "owner"
            }
        ],
        "tasks": [
            {
                "id": 1,
                "title": "Design UI",
                "status": "In Progress"
            }
        ]
    }
}
```

### Join Team
```javascript
POST /api/teams/{teamId}/join
Authorization: Bearer {token}

Response (200):
{
    "success": true,
    "message": "Successfully joined team"
}
```

### Leave Team
```javascript
POST /api/teams/{teamId}/leave
Authorization: Bearer {token}

Response (200):
{
    "success": true,
    "message": "Successfully left team"
}
```

## ✅ Task Endpoints

### Get Team Tasks
```javascript
GET /api/tasks/team/{teamId}?status={status}
Authorization: Bearer {token}

Query Parameters:
- status (optional): "Pending", "In Progress", "Completed"

Response (200):
{
    "success": true,
    "tasks": [
        {
            "id": 1,
            "title": "Design Homepage",
            "description": "Create homepage mockup",
            "status": "In Progress",
            "due_date": "2025-12-10T00:00:00Z",
            "assigned_to_name": "John Doe",
            "assigned_to_email": "john@example.com",
            "created_by_name": "Jane Doe",
            "created_at": "2025-12-05T10:00:00Z"
        }
    ]
}
```

### Get User's Tasks
```javascript
GET /api/tasks/my-tasks
Authorization: Bearer {token}

Response (200):
{
    "success": true,
    "tasks": [
        {
            "id": 1,
            "title": "Design Homepage",
            "description": "Create homepage mockup",
            "status": "In Progress",
            "due_date": "2025-12-10T00:00:00Z",
            "team_id": 1
        }
    ]
}
```

### Create Task
```javascript
POST /api/tasks
Authorization: Bearer {token}
Content-Type: application/json

{
    "team_id": 1,
    "title": "Design Footer",
    "description": "Create footer design",
    "assigned_to": 1,
    "due_date": "2025-12-12"
}

Response (201):
{
    "success": true,
    "message": "Task created successfully",
    "task": {
        "id": 2,
        "title": "Design Footer",
        "description": "Create footer design",
        "status": "Pending",
        "assigned_to": 1,
        "team_id": 1
    }
}
```

### Update Task
```javascript
PUT /api/tasks/{taskId}
Authorization: Bearer {token}
Content-Type: application/json

{
    "title": "Design Header",
    "description": "Updated header design",
    "status": "Completed",
    "assigned_to": 2,
    "due_date": "2025-12-15"
}

Response (200):
{
    "success": true,
    "message": "Task updated successfully",
    "task": {
        "id": 1,
        "title": "Design Header",
        "status": "Completed"
    }
}
```

### Delete Task
```javascript
DELETE /api/tasks/{taskId}
Authorization: Bearer {token}

Response (200):
{
    "success": true,
    "message": "Task deleted successfully"
}
```

### Get Task Statistics
```javascript
GET /api/tasks/team/{teamId}/stats
Authorization: Bearer {token}

Response (200):
{
    "success": true,
    "stats": {
        "total": 10,
        "pending": 3,
        "in_progress": 4,
        "completed": 3
    }
}
```

## 📊 Dashboard Endpoints

### Get Dashboard Summary
```javascript
GET /api/dashboard/summary
Authorization: Bearer {token}

Response (200):
{
    "success": true,
    "summary": {
        "total_teams": 3,
        "total_tasks": 15,
        "active_projects": 2
    },
    "stats": {
        "total": 15,
        "pending": 5,
        "inProgress": 6,
        "completed": 4
    }
}
```

## 🚨 Error Responses

All endpoints return consistent error responses:

```javascript
Response (400, 401, 403, 404, 500):
{
    "success": false,
    "message": "Error description here"
}
```

### Common Error Status Codes

- **400 Bad Request**: Invalid input data
- **401 Unauthorized**: Missing or invalid token
- **403 Forbidden**: Don't have permission
- **404 Not Found**: Resource doesn't exist
- **500 Internal Server Error**: Server error

## 📝 Example JavaScript Calls

### Fetch with Error Handling
```javascript
async function apiCall(endpoint, method = 'GET', body = null) {
    const token = localStorage.getItem(TOKEN_KEY);
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    try {
        const options = {
            method,
            headers
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(`${API_URL}${endpoint}`, options);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'API Error');
        }

        return data;
    } catch (error) {
        console.error(`API Error (${endpoint}):`, error);
        throw error;
    }
}
```

### Usage Examples
```javascript
// Get all teams
const teams = await apiCall('/teams');

// Create a team
const newTeam = await apiCall('/teams', 'POST', {
    name: 'New Team',
    description: 'Team description'
});

// Update a task
const updatedTask = await apiCall(`/tasks/1`, 'PUT', {
    status: 'Completed'
});

// Delete a task
await apiCall(`/tasks/1`, 'DELETE');
```

## 🔄 Rate Limiting

No specific rate limits are enforced, but please avoid excessive requests.

## 📡 WebSocket (Future)

Future versions may include WebSocket support for real-time updates.

## 🔒 Security Notes

1. **Always use HTTPS in production**
2. **Never hardcode sensitive data**
3. **Validate all user inputs**
4. **Store tokens securely**
5. **Use CORS properly**
6. **Implement request timeout**

## 📚 Additional Resources

- Backend API Documentation: `/api/docs`
- Health Check: `/health`
- Root Endpoint: `/`

---

**Last Updated**: December 2025
