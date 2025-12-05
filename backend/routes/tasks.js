const express = require('express');
const { query } = require('../config/database');
const { authenticateToken, checkTeamMembership } = require('../middleware/auth');

const router = express.Router();

// Get all tasks for a team
router.get('/team/:teamId', authenticateToken, checkTeamMembership, async (req, res) => {
  try {
    const teamId = req.params.teamId;
    const { status } = req.query;

    let queryText = `
      SELECT 
        t.id,
        t.title,
        t.description,
        t.status,
        t.due_date,
        t.created_at,
        t.updated_at,
        assigned_user.name as assigned_to_name,
        assigned_user.email as assigned_to_email,
        created_user.name as created_by_name
      FROM tasks t
      LEFT JOIN users assigned_user ON t.assigned_to = assigned_user.id
      LEFT JOIN users created_user ON t.created_by = created_user.id
      WHERE t.team_id = $1
    `;

    const queryParams = [teamId];

    if (status) {
      queryText += ' AND t.status = $2';
      queryParams.push(status);
    }

    queryText += ' ORDER BY t.created_at DESC';

    const tasks = await query(queryText, queryParams);

    res.json({
      success: true,
      tasks: tasks.rows
    });

  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tasks'
    });
  }
});

// Get tasks assigned to current user
router.get('/my-tasks', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;

    let queryText = `
      SELECT 
        t.id,
        t.title,
        t.description,
        t.status,
        t.due_date,
        t.created_at,
        t.updated_at,
        team.name as team_name,
        created_user.name as created_by_name
      FROM tasks t
      LEFT JOIN teams team ON t.team_id = team.id
      LEFT JOIN users created_user ON t.created_by = created_user.id
      WHERE t.assigned_to = $1
    `;

    const queryParams = [userId];

    if (status) {
      queryText += ' AND t.status = $2';
      queryParams.push(status);
    }

    queryText += ' ORDER BY t.created_at DESC';

    const tasks = await query(queryText, queryParams);

    res.json({
      success: true,
      tasks: tasks.rows
    });

  } catch (error) {
    console.error('Get user tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user tasks'
    });
  }
});

// Create a new task
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description, assigned_to, team_id, due_date } = req.body;
    const userId = req.user.id;

    if (!title || !team_id) {
      return res.status(400).json({
        success: false,
        message: 'Title and team_id are required'
      });
    }

    // Check if user is a team member
    const memberResult = await query(
      'SELECT id FROM team_members WHERE team_id = $1 AND user_id = $2',
      [team_id, userId]
    );

    if (memberResult.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'You must be a team member to create tasks'
      });
    }

    // If assigned_to is provided, check if they are a team member
    if (assigned_to) {
      const assignedMemberResult = await query(
        'SELECT id FROM team_members WHERE team_id = $1 AND user_id = $2',
        [team_id, assigned_to]
      );

      if (assignedMemberResult.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot assign task to non-team member'
        });
      }
    }

    const newTask = await query(`
      INSERT INTO tasks (title, description, assigned_to, team_id, created_by, due_date)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [title, description || '', assigned_to || null, team_id, userId, due_date || null]);

    // Get the created task with user names
    const taskWithNames = await query(`
      SELECT 
        t.id,
        t.title,
        t.description,
        t.status,
        t.due_date,
        t.created_at,
        t.updated_at,
        assigned_user.name as assigned_to_name,
        created_user.name as created_by_name
      FROM tasks t
      LEFT JOIN users assigned_user ON t.assigned_to = assigned_user.id
      LEFT JOIN users created_user ON t.created_by = created_user.id
      WHERE t.id = $1
    `, [newTask.rows[0].id]);

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      task: taskWithNames.rows[0]
    });

  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating task'
    });
  }
});

// Update a task
router.put('/:taskId', authenticateToken, async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const userId = req.user.id;
    const { title, description, status, assigned_to, due_date } = req.body;

    // Get task and verify team membership
    const taskResult = await query(`
      SELECT t.*, tm.user_id as is_member
      FROM tasks t
      LEFT JOIN team_members tm ON t.team_id = tm.team_id AND tm.user_id = $2
      WHERE t.id = $1
    `, [taskId, userId]);

    if (taskResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    const task = taskResult.rows[0];

    if (!task.is_member) {
      return res.status(403).json({
        success: false,
        message: 'You must be a team member to update tasks'
      });
    }

    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramCounter = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramCounter++}`);
      values.push(title);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCounter++}`);
      values.push(description);
    }
    if (status !== undefined) {
      const validStatuses = ['pending', 'in_progress', 'completed'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status. Must be: pending, in_progress, or completed'
        });
      }
      updates.push(`status = $${paramCounter++}`);
      values.push(status);
    }
    if (assigned_to !== undefined) {
      if (assigned_to) {
        // Check if assigned user is a team member
        const assignedMemberResult = await query(
          'SELECT id FROM team_members WHERE team_id = $1 AND user_id = $2',
          [task.team_id, assigned_to]
        );

        if (assignedMemberResult.rows.length === 0) {
          return res.status(400).json({
            success: false,
            message: 'Cannot assign task to non-team member'
          });
        }
      }
      updates.push(`assigned_to = $${paramCounter++}`);
      values.push(assigned_to || null);
    }
    if (due_date !== undefined) {
      updates.push(`due_date = $${paramCounter++}`);
      values.push(due_date || null);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(taskId);

    const updateQuery = `
      UPDATE tasks 
      SET ${updates.join(', ')}
      WHERE id = $${paramCounter}
      RETURNING *
    `;

    await query(updateQuery, values);

    // Get updated task with user names
    const updatedTaskResult = await query(`
      SELECT 
        t.id,
        t.title,
        t.description,
        t.status,
        t.due_date,
        t.created_at,
        t.updated_at,
        assigned_user.name as assigned_to_name,
        created_user.name as created_by_name
      FROM tasks t
      LEFT JOIN users assigned_user ON t.assigned_to = assigned_user.id
      LEFT JOIN users created_user ON t.created_by = created_user.id
      WHERE t.id = $1
    `, [taskId]);

    res.json({
      success: true,
      message: 'Task updated successfully',
      task: updatedTaskResult.rows[0]
    });

  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating task'
    });
  }
});

// Delete a task
router.delete('/:taskId', authenticateToken, async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const userId = req.user.id;

    // Check if task exists and user is a team member
    const taskResult = await query(`
      SELECT t.created_by, tm.user_id as is_member, tm.role
      FROM tasks t
      LEFT JOIN team_members tm ON t.team_id = tm.team_id AND tm.user_id = $2
      WHERE t.id = $1
    `, [taskId, userId]);

    if (taskResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    const task = taskResult.rows[0];

    if (!task.is_member) {
      return res.status(403).json({
        success: false,
        message: 'You must be a team member to delete tasks'
      });
    }

    // Only task creator or team leader can delete tasks
    if (task.created_by !== userId && task.role !== 'leader') {
      return res.status(403).json({
        success: false,
        message: 'Only task creator or team leader can delete tasks'
      });
    }

    await query('DELETE FROM tasks WHERE id = $1', [taskId]);

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });

  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting task'
    });
  }
});

// Get task statistics for dashboard
router.get('/team/:teamId/stats', authenticateToken, checkTeamMembership, async (req, res) => {
  try {
    const teamId = req.params.teamId;

    const statsResult = await query(`
      SELECT 
        COUNT(*) as total_tasks,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_tasks,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_tasks,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tasks,
        COUNT(CASE WHEN due_date < CURRENT_DATE AND status != 'completed' THEN 1 END) as overdue_tasks
      FROM tasks 
      WHERE team_id = $1
    `, [teamId]);

    res.json({
      success: true,
      stats: statsResult.rows[0]
    });

  } catch (error) {
    console.error('Get task stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching task statistics'
    });
  }
});

module.exports = router;