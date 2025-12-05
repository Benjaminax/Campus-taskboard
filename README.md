# Campus Task Collaboration Board

Campus Task Collaboration Board is a team collaboration platform designed for students working on group projects together. It lets teams create, assign, and track tasks with real-time updates. Students can join teams, manage their assigned tasks, and view a dashboard showing team progress and statistics.

## Getting Started

You can access the application at https://benjaminax.github.io/Campus-taskboard/. The backend API runs on Render at https://campus-taskboard.onrender.com.

If you want to test it quickly, use these credentials:
- Email: testuser@example.com
- Password: password123

You can also create your own account by registering with any email and a password that's at least 6 characters long.

## Features

The application includes user registration and login with password hashing and JWT tokens. Once logged in, you can create teams and invite other users to join. Teams have leaders who can manage team settings and add or remove members.

Task management lets you create new tasks and assign them to team members. Each task can have a title, description, due date, and current status. You can update the status as tasks progress from pending to in progress to completed.

The dashboard shows an overview of all tasks and statistics including how many tasks are pending, in progress, completed, or overdue. You can see team member information and recent activity.

## Local Development

To run this locally, first clone the repository and navigate to the frontend directory. Install dependencies with npm install and start the development server with npm start.

For the backend, navigate to the backend directory and install dependencies. Create a .env file with your database configuration and JWT secret. Run npm run seed to set up the database, then npm run dev to start the server.

The frontend will be on http://localhost:8000 and backend on http://localhost:3001.

## Technologies

The frontend uses HTML, CSS, and vanilla JavaScript. The backend is built with Node.js and Express, with PostgreSQL as the database. Passwords are hashed with bcryptjs and authentication uses JWT tokens. Both frontend and backend use CORS to handle cross-origin requests.

## Deployment

The backend is deployed on Render with PostgreSQL. The frontend is hosted on GitHub Pages. All sensitive data is stored in environment variables and never committed to the repository.

## What You Can Do

Create and manage teams with team leaders controlling access. Create tasks with descriptions and due dates, and assign them to specific team members. Update task status as you work through them. View task statistics and team progress on your dashboard. See all team members and their assigned tasks. Search and filter tasks by team and status.
