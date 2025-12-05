const express = require('express');
const { query } = require('../config/database');
const { authenticateToken, checkTeamMembership } = require('../middleware/auth');

const router = express.Router();

// Get all teams (public - for joining)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const teams = await query(`
      SELECT 
        t.id,
        t.name,
        t.description,
        t.created_at,
        u.name as created_by_name,
        COUNT(tm.user_id) as member_count
      FROM teams t
      LEFT JOIN users u ON t.created_by = u.id
      LEFT JOIN team_members tm ON t.id = tm.team_id
      GROUP BY t.id, t.name, t.description, t.created_at, u.name
      ORDER BY t.created_at DESC
    `);

    res.json({
      success: true,
      teams: teams.rows
    });

  } catch (error) {
    console.error('Get teams error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching teams'
    });
  }
});

// Get user's teams
router.get('/my-teams', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const userTeams = await query(`
      SELECT 
        t.id,
        t.name,
        t.description,
        t.created_at,
        tm.role,
        u.name as created_by_name,
        COUNT(DISTINCT tm2.user_id) as member_count
      FROM teams t
      JOIN team_members tm ON t.id = tm.team_id
      LEFT JOIN users u ON t.created_by = u.id
      LEFT JOIN team_members tm2 ON t.id = tm2.team_id
      WHERE tm.user_id = $1
      GROUP BY t.id, t.name, t.description, t.created_at, tm.role, u.name
      ORDER BY t.created_at DESC
    `, [userId]);

    res.json({
      success: true,
      teams: userTeams.rows
    });

  } catch (error) {
    console.error('Get user teams error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user teams'
    });
  }
});

// Create a new team
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, description } = req.body;
    const userId = req.user.id;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Team name is required'
      });
    }

    // Create the team
    const newTeam = await query(
      'INSERT INTO teams (name, description, created_by) VALUES ($1, $2, $3) RETURNING *',
      [name, description || '', userId]
    );

    // Add creator as team leader
    await query(
      'INSERT INTO team_members (team_id, user_id, role) VALUES ($1, $2, $3)',
      [newTeam.rows[0].id, userId, 'leader']
    );

    res.status(201).json({
      success: true,
      message: 'Team created successfully',
      team: newTeam.rows[0]
    });

  } catch (error) {
    console.error('Create team error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating team'
    });
  }
});

// Get team details with members
router.get('/:teamId', authenticateToken, checkTeamMembership, async (req, res) => {
  try {
    const teamId = req.params.teamId;

    // Get team info
    const teamResult = await query(`
      SELECT 
        t.*,
        u.name as created_by_name
      FROM teams t
      LEFT JOIN users u ON t.created_by = u.id
      WHERE t.id = $1
    `, [teamId]);

    if (teamResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Get team members
    const membersResult = await query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        tm.role,
        tm.joined_at
      FROM team_members tm
      JOIN users u ON tm.user_id = u.id
      WHERE tm.team_id = $1
      ORDER BY tm.joined_at ASC
    `, [teamId]);

    const team = teamResult.rows[0];
    team.members = membersResult.rows;

    res.json({
      success: true,
      team
    });

  } catch (error) {
    console.error('Get team details error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching team details'
    });
  }
});

// Join a team
router.post('/:teamId/join', authenticateToken, async (req, res) => {
  try {
    const teamId = req.params.teamId;
    const userId = req.user.id;

    // Check if team exists
    const teamResult = await query('SELECT id FROM teams WHERE id = $1', [teamId]);
    if (teamResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Check if user is already a member
    const memberResult = await query(
      'SELECT id FROM team_members WHERE team_id = $1 AND user_id = $2',
      [teamId, userId]
    );

    if (memberResult.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'You are already a member of this team'
      });
    }

    // Add user to team
    await query(
      'INSERT INTO team_members (team_id, user_id, role) VALUES ($1, $2, $3)',
      [teamId, userId, 'member']
    );

    res.json({
      success: true,
      message: 'Successfully joined the team'
    });

  } catch (error) {
    console.error('Join team error:', error);
    res.status(500).json({
      success: false,
      message: 'Error joining team'
    });
  }
});

// Leave a team
router.post('/:teamId/leave', authenticateToken, checkTeamMembership, async (req, res) => {
  try {
    const teamId = req.params.teamId;
    const userId = req.user.id;

    // Check if user is the team leader
    const memberResult = await query(
      'SELECT role FROM team_members WHERE team_id = $1 AND user_id = $2',
      [teamId, userId]
    );

    if (memberResult.rows[0].role === 'leader') {
      // Check if there are other members
      const otherMembersResult = await query(
        'SELECT COUNT(*) FROM team_members WHERE team_id = $1 AND user_id != $2',
        [teamId, userId]
      );

      if (parseInt(otherMembersResult.rows[0].count) > 0) {
        return res.status(400).json({
          success: false,
          message: 'Team leaders cannot leave while other members exist. Transfer leadership first.'
        });
      }
    }

    // Remove user from team
    await query(
      'DELETE FROM team_members WHERE team_id = $1 AND user_id = $2',
      [teamId, userId]
    );

    res.json({
      success: true,
      message: 'Successfully left the team'
    });

  } catch (error) {
    console.error('Leave team error:', error);
    res.status(500).json({
      success: false,
      message: 'Error leaving team'
    });
  }
});

// Update team (leader only)
router.put('/:teamId', authenticateToken, checkTeamMembership, async (req, res) => {
  try {
    const teamId = req.params.teamId;
    const userId = req.user.id;
    const { name, description } = req.body;

    // Check if user is a team leader
    const memberResult = await query(
      'SELECT role FROM team_members WHERE team_id = $1 AND user_id = $2',
      [teamId, userId]
    );

    if (memberResult.rows.length === 0 || memberResult.rows[0].role !== 'leader') {
      return res.status(403).json({
        success: false,
        message: 'Only team leaders can edit teams'
      });
    }

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Team name is required'
      });
    }

    const updateResult = await query(
      'UPDATE teams SET name = $1, description = $2 WHERE id = $3 RETURNING *',
      [name, description || '', teamId]
    );

    res.json({
      success: true,
      message: 'Team updated successfully',
      team: updateResult.rows[0]
    });

  } catch (error) {
    console.error('Update team error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating team'
    });
  }
});

// Delete team (leader only)
router.delete('/:teamId', authenticateToken, checkTeamMembership, async (req, res) => {
  try {
    const teamId = req.params.teamId;
    const userId = req.user.id;

    // Check if user is a team leader
    const memberResult = await query(
      'SELECT role FROM team_members WHERE team_id = $1 AND user_id = $2',
      [teamId, userId]
    );

    if (memberResult.rows.length === 0 || memberResult.rows[0].role !== 'leader') {
      return res.status(403).json({
        success: false,
        message: 'Only team leaders can delete teams'
      });
    }

    // Delete all team members
    await query('DELETE FROM team_members WHERE team_id = $1', [teamId]);

    // Delete all tasks in team
    await query('DELETE FROM tasks WHERE team_id = $1', [teamId]);

    // Delete the team
    await query('DELETE FROM teams WHERE id = $1', [teamId]);

    res.json({
      success: true,
      message: 'Team deleted successfully'
    });

  } catch (error) {
    console.error('Delete team error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting team'
    });
  }
});

module.exports = router;