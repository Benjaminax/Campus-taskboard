const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Access token required' 
    });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user details from database
    const userResult = await query(
      'SELECT id, email, name FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token - user not found' 
      });
    }

    // Attach user info to request object
    req.user = userResult.rows[0];
    next();

  } catch (error) {
    console.error('Token verification error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired' 
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token' 
      });
    }
    
    return res.status(500).json({ 
      success: false, 
      message: 'Token verification failed' 
    });
  }
};

// Middleware to check if user is a team member
const checkTeamMembership = async (req, res, next) => {
  try {
    const teamId = req.params.teamId || req.body.team_id;
    const userId = req.user.id;

    // Validate teamId is a valid integer
    if (!teamId || isNaN(Number(teamId))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid team ID'
      });
    }

    const memberResult = await query(
      'SELECT id FROM team_members WHERE team_id = $1 AND user_id = $2',
      [teamId, userId]
    );

    if (memberResult.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Access denied - not a team member'
      });
    }

    next();
  } catch (error) {
    console.error('Team membership check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error checking team membership'
    });
  }
};

module.exports = {
  authenticateToken,
  checkTeamMembership
};