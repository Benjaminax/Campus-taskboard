# Campus Task Collaboration Board

## Project Overview

The Campus Task Collaboration Board is a web-based platform designed to help students working on group projects collaborate effectively. The system allows teams to create, assign, and track project tasks in real-time. Students can form teams, assign tasks to team members, monitor progress through status updates, and view comprehensive dashboards with task statistics and team information.

This is a full-stack application built with modern web technologies and deployed on production servers for reliability and accessibility.

---

## Deployment Links

### Backend (API Server)
- **Render**: https://campus-taskboard.onrender.com
- **Health Check**: https://campus-taskboard.onrender.com/health
- **API Documentation**: https://campus-taskboard.onrender.com/api/docs

### Frontend (Web Application)
- **GitHub Pages**: https://benjaminax.github.io/Campus-taskboard/
- **Repository Branch**: gh-pages

---

## Login Details for Testing

You can use the following test credentials to access the application:

| Role | Email | Password |
|------|-------|----------|
| Student | testuser@example.com | password123 |
| Student | student2@example.com | secure456 |

**Note**: You can also create your own account by registering with a new email address and password (minimum 6 characters).

---

## Feature Checklist

### ✅ User Registration & Authentication (15 Marks)
- [x] Secure user registration form with email validation
- [x] Password confirmation and strength requirements (minimum 6 characters)
- [x] Secure login with JWT token-based authentication
- [x] Session persistence using localStorage
- [x] Logout functionality that clears session data
- [x] Protected routes that require authentication

### ✅ Task Management (15 Marks)
- [x] Create new tasks with title, description, due date, and assignment
- [x] Edit existing tasks and update status
- [x] Delete tasks with confirmation dialog
- [x] Display tasks filtered by status (Pending, In Progress, Completed)
- [x] Assign tasks to specific team members
- [x] Filter and search tasks by team and status
- [x] View task creation date and creator information

### ✅ Team Dashboard (15 Marks)
- [x] Display comprehensive dashboard with task statistics
- [x] Show total tasks, pending tasks, in-progress tasks, and completed tasks
- [x] Display overdue tasks count
- [x] Show all team members with roles and contact information
- [x] List recent tasks with status indicators
- [x] Visual stat cards with color-coded indicators
- [x] Team management (create, edit, delete teams)
- [x] Join and leave team functionality

### ✅ Deployment & Integration (15 Marks)
- [x] Backend hosted on Render (Node.js + PostgreSQL)
- [x] Frontend hosted on GitHub Pages
- [x] Full API integration with proper error handling
- [x] CORS properly configured for production
- [x] JWT authentication in API headers
- [x] Responsive design that works on all devices
- [x] Production-ready configuration and optimization

---

## Installation Instructions

### Prerequisites
Before you start, make sure you have the following installed on your machine:
- Node.js (version 14 or higher)
- npm (Node Package Manager)
- Git
- PostgreSQL (for local backend development)

### Frontend Installation (Local Development)

1. **Clone the repository:**
```bash
git clone https://github.com/Benjaminax/Campus-taskboard.git
cd Campus-taskboard
```

2. **Navigate to the frontend directory:**
```bash
cd frontend
```

3. **Install dependencies:**
```bash
npm install
```

4. **Start the development server:**
```bash
npm start
```

The application will open in your browser at `http://localhost:8000` (or check your terminal for the actual port).

### Backend Installation (Local Development)

1. **Navigate to the backend directory:**
```bash
cd backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create a `.env` file in the backend directory:**
```
JWT_SECRET=your_jwt_secret_key_here
DATABASE_URL=postgresql://username:password@localhost:5432/campus_taskboard
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:8000
```

4. **Set up the database:**
```bash
npm run seed
```

5. **Start the development server:**
```bash
npm run dev
```

The backend API will be available at `http://localhost:3001`

---

## How to Run the Project

### Running Both Frontend and Backend Locally

1. **Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend runs on: `http://localhost:3001`

2. **Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```
Frontend runs on: `http://localhost:8000`

3. **Access the application:**
Open your browser and navigate to `http://localhost:8000`

4. **Register or login:**
- Create a new account with your email and password
- Or use the test credentials provided above
- You'll be directed to the dashboard

### Accessing the Production Application

Simply visit: https://benjaminax.github.io/Campus-taskboard/

The frontend will automatically connect to the production backend API running on Render.

---

## Project Structure

```
Campus-taskboard/
├── frontend/
│   ├── index.html          # Main HTML file
│   ├── script.js           # Application logic and API calls
│   ├── styles.css          # Styling and responsive design
│   └── package.json        # Frontend dependencies
├── backend/
│   ├── server.js           # Express server setup
│   ├── package.json        # Backend dependencies
│   ├── config/
│   │   └── database.js     # PostgreSQL configuration
│   ├── middleware/
│   │   └── auth.js         # JWT authentication middleware
│   ├── routes/
│   │   ├── auth.js         # Authentication endpoints
│   │   ├── teams.js        # Team management endpoints
│   │   ├── tasks.js        # Task management endpoints
│   │   └── dashboard.js    # Dashboard data endpoints
│   └── seed.js             # Database seeding script
└── README.md               # This file
```

---

## Technology Stack

### Frontend
- **HTML5**: Semantic markup and structure
- **CSS3**: Modern styling with CSS variables and flexbox
- **JavaScript (ES6+)**: Client-side logic and API communication
- **Fetch API**: RESTful API requests to backend

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web application framework
- **PostgreSQL**: Relational database
- **JWT**: Token-based authentication
- **bcryptjs**: Password hashing and security

### Deployment
- **Render**: Backend hosting (Node.js + PostgreSQL)
- **GitHub Pages**: Frontend hosting (static files)

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (requires auth)
- `PUT /api/auth/profile` - Update user profile (requires auth)

### Teams
- `GET /api/teams` - Get all available teams
- `GET /api/teams/my-teams` - Get user's teams (requires auth)
- `POST /api/teams` - Create new team (requires auth)
- `GET /api/teams/:teamId` - Get team details
- `PUT /api/teams/:teamId` - Update team (requires permission)
- `DELETE /api/teams/:teamId` - Delete team (requires permission)
- `POST /api/teams/:teamId/join` - Join a team
- `POST /api/teams/:teamId/leave` - Leave a team

### Tasks
- `GET /api/tasks/team/:teamId` - Get team tasks (requires auth)
- `GET /api/tasks/my-tasks` - Get user's assigned tasks (requires auth)
- `POST /api/tasks` - Create new task (requires auth)
- `PUT /api/tasks/:taskId` - Update task (requires auth)
- `DELETE /api/tasks/:taskId` - Delete task (requires auth)
- `GET /api/tasks/team/:teamId/stats` - Get task statistics

### Dashboard
- `GET /api/dashboard/summary` - Get dashboard summary (requires auth)

---

## Features

### User Management
- Register with email validation
- Secure login with password hashing
- User profile viewing
- Session management with JWT tokens

### Team Management
- Create new teams
- Join existing teams
- Leave teams
- View team members and their details
- Edit team information (for team leaders)
- Delete teams (for team leaders)

### Task Management
- Create tasks with detailed information
- Assign tasks to team members
- Update task status (Pending, In Progress, Completed)
- Delete tasks
- Set due dates for tasks
- Filter tasks by team and status
- View task history and creator information

### Dashboard
- View overall task statistics
- See recent team activities
- Monitor task progress
- Track overdue tasks
- View team composition

---

## Security Features

- **Password Security**: Passwords are hashed using bcryptjs before storage
- **JWT Authentication**: Token-based authentication for API requests
- **CORS Protection**: Properly configured Cross-Origin Resource Sharing
- **Input Validation**: All user inputs are validated on both frontend and backend
- **Authorization**: Role-based access control for sensitive operations
- **Environment Variables**: Sensitive data stored in .env files (not committed)

---

## Troubleshooting

### Issue: Cannot connect to backend
**Solution**: Make sure the Render backend is running. Check the health endpoint at https://campus-taskboard.onrender.com/health

### Issue: Tasks not loading
**Solution**: Check your browser's console for errors. Ensure you're logged in and your token is valid.

### Issue: Cannot create a team
**Solution**: Make sure you're logged in and have filled in all required fields (team name is mandatory).

### Issue: Port 8000 is already in use
**Solution**: Change the port in your development server or kill the process using that port.

---

## Future Enhancements

- Real-time notifications for task updates
- File attachment support for tasks
- Team member activity logs
- Task prioritization system
- Email notifications for due tasks
- Advanced filtering and search
- Mobile application
- Dark/Light theme toggle
- Task comments and discussions

---

## Contribution Guidelines

This is an academic project, but if you'd like to contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a Pull Request

---

## License

This project is created for academic purposes as part of the CS3139: Web Technologies course at Academic City University.

---

## Support & Contact

For questions or issues, please reach out to:
- **Lecturer**: Kimkpe Arnold Sylvian
- **GitHub Repository**: https://github.com/Benjaminax/Campus-taskboard

---

## Acknowledgments

- Academic City University Faculty of Computational Sciences and Informatics
- Special thanks to the course instructor for the clear requirements and guidance
- Built using Node.js, Express, PostgreSQL, and modern web technologies

---

**Last Updated**: December 5, 2025
**Project Status**: ✅ Complete and Deployed
