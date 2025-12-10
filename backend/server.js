const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// Load environment variables before anything else
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const teamRoutes = require('./routes/teams');
const taskRoutes = require('./routes/tasks');
const dashboardRoutes = require('./routes/dashboard');

// Import database config to test connection
const { pool } = require('./config/database');

const app = express();

// Get PORT from environment or use default
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? [
        process.env.FRONTEND_URL,
        'https://benjaminax.github.io',
        'https://benjaminax.github.io/Campus-taskboard/'
      ]
    : [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:5173',
        'http://localhost:5500',
        'http://localhost:8000',
        'http://127.0.0.1:8000'
      ],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from the root directory
app.use(express.static(require('path').join(__dirname, '..')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Campus Taskboard API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Campus Taskboard API',
    version: '1.0.0',
    documentation: '/api/docs',
    endpoints: {
      auth: '/api/auth',
      teams: '/api/teams',
      tasks: '/api/tasks',
      dashboard: '/api/dashboard'
    }
  });
});

// API documentation endpoint
app.get('/api/docs', (req, res) => {
  res.json({
    success: true,
    title: 'Campus Taskboard API Documentation',
    version: '1.0.0',
    endpoints: {
      authentication: {
        'POST /api/auth/register': 'Register a new user',
        'POST /api/auth/login': 'Login user',
        'GET /api/auth/profile': 'Get user profile (requires auth)',
        'PUT /api/auth/profile': 'Update user profile (requires auth)'
      },
      teams: {
        'GET /api/teams': 'Get all teams (requires auth)',
        'GET /api/teams/my-teams': 'Get user teams (requires auth)',
        'POST /api/teams': 'Create new team (requires auth)',
        'GET /api/teams/:teamId': 'Get team details (requires team membership)',
        'POST /api/teams/:teamId/join': 'Join team (requires auth)',
        'POST /api/teams/:teamId/leave': 'Leave team (requires team membership)'
      },
      tasks: {
        'GET /api/tasks/team/:teamId': 'Get team tasks (requires team membership)',
        'GET /api/tasks/my-tasks': 'Get user assigned tasks (requires auth)',
        'POST /api/tasks': 'Create new task (requires auth)',
        'PUT /api/tasks/:taskId': 'Update task (requires team membership)',
        'DELETE /api/tasks/:taskId': 'Delete task (requires permission)',
        'GET /api/tasks/team/:teamId/stats': 'Get task statistics (requires team membership)'
      },
      dashboard: {
        'GET /api/dashboard/summary': 'Get user dashboard summary (requires auth)'
      }
    },
    authentication: 'Bearer token required in Authorization header for protected endpoints'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message
  });
});

// Handle 404 errors
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    availableEndpoints: {
      root: '/',
      health: '/health',
      docs: '/api/docs',
      auth: '/api/auth/*',
      teams: '/api/teams/*',
      tasks: '/api/tasks/*',
      dashboard: '/api/dashboard/*'
    }
  });
});

// Test database connection on startup
const testDatabaseConnection = async () => {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Database connected successfully at:', result.rows[0].now);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Please check your DATABASE_URL in .env file');
  }
};

// Start server
const startServer = async () => {
  try {
    await testDatabaseConnection();
    
    app.listen(PORT, () => {
      console.log(`🚀 Campus Taskboard API Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health Check: http://localhost:${PORT}/health`);
      console.log(`📖 API Docs: http://localhost:${PORT}/api/docs`);
      console.log(`🎯 Ready to accept requests!`);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🔄 Received SIGTERM, shutting down gracefully...');
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🔄 Received SIGINT, shutting down gracefully...');
  await pool.end();
  process.exit(0);
});

// Start the server
startServer();

module.exports = app;