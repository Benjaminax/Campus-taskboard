const express = require('express');
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get dashboard summary for a user
router.get('/summary', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's team count
    const teamCountResult = await query(
      'SELECT COUNT(*) as team_count FROM team_members WHERE user_id = $1',
      [userId]
    );

    // Get user's task statistics
    const taskStatsResult = await query(`
      SELECT 
        COUNT(*) as total_assigned_tasks,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_tasks,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_tasks,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tasks,
        COUNT(CASE WHEN due_date < CURRENT_DATE AND status != 'completed' THEN 1 END) as overdue_tasks
      FROM tasks 
      WHERE assigned_to = $1
    `, [userId]);

    // Get user's recent tasks
    const recentTasksResult = await query(`
      SELECT 
        t.id,
        t.title,
        t.status,
        t.due_date,
        team.name as team_name
      FROM tasks t
      LEFT JOIN teams team ON t.team_id = team.id
      WHERE t.assigned_to = $1
      ORDER BY t.updated_at DESC
      LIMIT 5
    `, [userId]);

    // Get user's teams with member counts
    const userTeamsResult = await query(`
      SELECT 
        t.id,
        t.name,
        tm.role,
        COUNT(DISTINCT tm2.user_id) as member_count
      FROM teams t
      JOIN team_members tm ON t.id = tm.team_id
      LEFT JOIN team_members tm2 ON t.id = tm2.team_id
      WHERE tm.user_id = $1
      GROUP BY t.id, t.name, tm.role
      ORDER BY t.created_at DESC
    `, [userId]);

    const summary = {
      teams: {
        count: parseInt(teamCountResult.rows[0].team_count),
        list: userTeamsResult.rows
      },
      tasks: {
        ...taskStatsResult.rows[0],
        recent: recentTasksResult.rows
      }
    };

    // Convert string numbers to integers
    Object.keys(summary.tasks).forEach(key => {
      if (key !== 'recent' && summary.tasks[key]) {
        summary.tasks[key] = parseInt(summary.tasks[key]);
      }
    });

    res.json({
      success: true,
      summary
    });

  } catch (error) {
    console.error('Dashboard summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard summary'
    });
  }
});

module.exports = router;