

# Campus Task Collaboration Board – Backend

Welcome! This is the backend API for the Campus Task Collaboration Board, powering all team and task management features for students working together.

## Deployment

Live API: [https://campus-taskboard.onrender.com](https://campus-taskboard.onrender.com)

## Local Development

1. Clone this repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the backend folder. Example:
   ```env
   DATABASE_URL=your_database_url
   PORT=3001
   FRONTEND_URL=http://localhost:3000
   NODE_ENV=development
   JWT_SECRET=your_jwt_secret
   ```
4. Seed the database:
   ```bash
   npm run seed
   ```
5. Start the server:
   ```bash
   npm run dev
   ```

The backend will run on [http://localhost:3001](http://localhost:3001).

## Test Credentials

Use these to log in quickly:
- Email: testuser@example.com
- Password: password123

Or register with any email and a password (at least 6 characters).

## Technologies

- Node.js & Express
- PostgreSQL
- bcryptjs (password hashing)
- JWT (authentication)
- CORS

## Deployment Details

The backend is deployed on Render with PostgreSQL. All sensitive data is stored in environment variables and never committed to the repository.

---

Frontend: [https://benjaminax.github.io/Campus-taskboard/](https://benjaminax.github.io/Campus-taskboard/)
