// pages/api/never-forget.js
// API endpoint for "Never Forget" critical task tracking
// ADHD-friendly persistent task management with escalation

import { neverForget } from '../../lib/never-forget';

/**
 * Main API handler for Never Forget endpoints
 * 
 * Endpoints:
 * - GET    /api/never-forget          - Get all critical tasks (sorted by priority)
 * - GET    /api/never-forget?top=N    - Get top N priority tasks
 * - GET    /api/never-forget?alerts=true - Get urgent alerts only
 * - GET    /api/never-forget?stats=true  - Get statistics
 * - POST   /api/never-forget          - Add a new critical task
 * - PUT    /api/never-forget          - Update task (complete, snooze, add note, update step)
 * - DELETE /api/never-forget?id=ID    - Delete a task (use sparingly - tasks should be completed)
 * 
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export default function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        return handleGet(req, res);
      case 'POST':
        return handlePost(req, res);
      case 'PUT':
        return handlePut(req, res);
      case 'DELETE':
        return handleDelete(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({
          success: false,
          error: `Method ${method} Not Allowed`
        });
    }
  } catch (error) {
    console.error('Never Forget API Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}

/**
 * GET - Retrieve critical tasks
 * Query parameters:
 * - top: Number of top priority tasks to return
 * - alerts: Return only urgent alerts (true/false)
 * - stats: Return statistics instead of tasks (true/false)
 * - includeCompleted: Include completed tasks (true/false)
 * - escalationStage: Filter by escalation stage
 */
function handleGet(req, res) {
  try {
    const { top, alerts, stats, includeCompleted, escalationStage } = req.query;

    // Return statistics
    if (stats === 'true') {
      const statistics = neverForget.getStats();
      return res.status(200).json({
        success: true,
        data: statistics
      });
    }

    // Return urgent alerts only
    if (alerts === 'true') {
      const urgentTasks = neverForget.getUrgentAlerts();
      return res.status(200).json({
        success: true,
        count: urgentTasks.length,
        data: urgentTasks,
        message: urgentTasks.length > 0 
          ? `⚠️ You have ${urgentTasks.length} urgent task(s) requiring immediate attention!`
          : '✅ No urgent alerts at this time'
      });
    }

    // Return top N priority tasks
    if (top) {
      const topN = parseInt(top, 10);
      if (isNaN(topN) || topN < 1) {
        return res.status(400).json({
          success: false,
          error: 'Invalid top parameter - must be a positive number'
        });
      }

      const topTasks = neverForget.getTopPriorityTasks(topN);
      return res.status(200).json({
        success: true,
        count: topTasks.length,
        data: topTasks,
        message: topTasks.length > 0
          ? `📌 Your top ${topN} priority task(s)`
          : '✨ No critical tasks at the moment!'
      });
    }

    // Return all tasks with optional filters
    const options = {
      includeCompleted: includeCompleted === 'true',
      escalationStage: escalationStage || null
    };

    const tasks = neverForget.getCriticalTasks(options);
    
    return res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve critical tasks'
    });
  }
}

/**
 * POST - Add a new critical task
 * Body parameters:
 * - title: Task title (required)
 * - description: Task description (optional)
 * - importance: critical|high|medium|low (default: high)
 * - deadline: ISO date string (optional)
 * - tags: Array of tag strings (optional)
 */
function handlePost(req, res) {
  try {
    const { title, description, importance, deadline, tags } = req.body;

    // Validation
    if (!title || title.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Task title is required'
      });
    }

    // Validate importance level
    if (importance && !['critical', 'high', 'medium', 'low'].includes(importance)) {
      return res.status(400).json({
        success: false,
        error: 'Importance must be: critical, high, medium, or low'
      });
    }

    // Validate deadline if provided
    if (deadline) {
      const deadlineDate = new Date(deadline);
      if (isNaN(deadlineDate.getTime())) {
        return res.status(400).json({
          success: false,
          error: 'Invalid deadline format - use ISO date string'
        });
      }
    }

    // Create the task
    const task = neverForget.addCriticalTask({
      title: title.trim(),
      description: description?.trim() || '',
      importance: importance || 'high',
      deadline: deadline || null,
      tags: Array.isArray(tags) ? tags : []
    });

    return res.status(201).json({
      success: true,
      data: task,
      message: getTaskCreationMessage(task)
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to create critical task'
    });
  }
}

/**
 * PUT - Update a task
 * Supported operations (specify in body.action):
 * - complete: Mark task as completed
 * - snooze: Snooze task until specified time
 * - note: Add a note to the task
 * - step: Update micro-step completion status
 */
function handlePut(req, res) {
  try {
    const { action, taskId } = req.body;

    if (!taskId) {
      return res.status(400).json({
        success: false,
        error: 'taskId is required'
      });
    }

    if (!action) {
      return res.status(400).json({
        success: false,
        error: 'action is required (complete|snooze|note|step)'
      });
    }

    let task;

    switch (action) {
      case 'complete':
        task = neverForget.completeTask(taskId);
        return res.status(200).json({
          success: true,
          data: task,
          message: '🎉 Task completed! Great job!'
        });

      case 'snooze':
        const { until, reason } = req.body;
        
        if (!until) {
          return res.status(400).json({
            success: false,
            error: 'Snooze time (until) is required'
          });
        }

        task = neverForget.snoozeTask(taskId, until, reason || '');
        
        return res.status(200).json({
          success: true,
          data: task,
          message: `💤 Task snoozed until ${new Date(until).toLocaleString()}`,
          warning: task.snoozeCount >= 3 
            ? '⚠️ This task has been snoozed multiple times - consider if it\'s time to tackle it!'
            : null
        });

      case 'note':
        const { note } = req.body;
        
        if (!note || note.trim() === '') {
          return res.status(400).json({
            success: false,
            error: 'Note text is required'
          });
        }

        task = neverForget.addNote(taskId, note);
        
        return res.status(200).json({
          success: true,
          data: task,
          message: '📝 Note added to task'
        });

      case 'step':
        const { stepId, completed } = req.body;
        
        if (!stepId) {
          return res.status(400).json({
            success: false,
            error: 'stepId is required'
          });
        }

        if (completed === undefined) {
          return res.status(400).json({
            success: false,
            error: 'completed status is required (true/false)'
          });
        }

        task = neverForget.updateMicroStep(taskId, stepId, completed);
        
        return res.status(200).json({
          success: true,
          data: task,
          message: completed 
            ? '✅ Step completed - keep up the momentum!'
            : '⬜ Step marked as incomplete'
        });

      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid action - must be: complete, snooze, note, or step'
        });
    }
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error.message || 'Failed to update task'
    });
  }
}

/**
 * DELETE - Remove a task
 * Use sparingly - tasks should generally be marked as completed
 * Query parameters:
 * - id: Task ID (required)
 * - clearCompleted: Clear all completed tasks (true/false)
 */
function handleDelete(req, res) {
  try {
    const { id, clearCompleted } = req.query;

    // Clear all completed tasks
    if (clearCompleted === 'true') {
      const count = neverForget.clearCompleted();
      return res.status(200).json({
        success: true,
        message: `🗑️ Cleared ${count} completed task(s)`
      });
    }

    // Delete specific task
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Task ID is required'
      });
    }

    // Note: This is a destructive operation
    // In a real implementation, you might want to archive instead
    const taskIndex = neverForget.criticalTasks.findIndex(t => t.id === id);
    
    if (taskIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    neverForget.criticalTasks.splice(taskIndex, 1);

    return res.status(200).json({
      success: true,
      message: '🗑️ Task deleted',
      warning: 'Consider marking tasks as complete instead of deleting them for better tracking'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to delete task'
    });
  }
}

/**
 * Helper function - Generate friendly message based on task properties
 */
function getTaskCreationMessage(task) {
  const messages = {
    critical: '🚨 Critical task added - This is super important!',
    high: '⚠️ High priority task added - Don\'t forget this!',
    medium: '📌 Task added to Never Forget list',
    low: '📝 Task added - I\'ll keep track of it'
  };

  let message = messages[task.importance] || messages.medium;

  if (task.deadline) {
    const deadline = new Date(task.deadline);
    const now = new Date();
    const hoursUntil = (deadline - now) / (1000 * 60 * 60);

    if (hoursUntil < 24) {
      message += ' ⏰ Deadline is soon!';
    } else if (hoursUntil < 72) {
      message += ' 📅 Deadline is coming up';
    }
  }

  return message;
}