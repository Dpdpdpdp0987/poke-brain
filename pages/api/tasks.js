// pages/api/tasks.js
// Task management API endpoint for poke-brain

import { db } from '../../lib/db';

export default function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
      return getTasks(req, res);
    case 'POST':
      return createTask(req, res);
    case 'PUT':
      return updateTask(req, res);
    case 'DELETE':
      return deleteTask(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      return res.status(405).json({ error: `Method ${method} Not Allowed` });
  }
}

// GET /api/tasks - Retrieve all tasks
function getTasks(req, res) {
  try {
    const { priority, completed } = req.query;
    let tasks = db.getTasks();

    // Filter by priority if specified
    if (priority) {
      tasks = tasks.filter(task => task.priority === priority);
    }

    // Filter by completion status if specified
    if (completed !== undefined) {
      const isCompleted = completed === 'true';
      tasks = tasks.filter(task => task.completed === isCompleted);
    }

    return res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve tasks'
    });
  }
}

// POST /api/tasks - Create a new task
function createTask(req, res) {
  try {
    const { title, description, priority = 'medium' } = req.body;

    // Validation
    if (!title || title.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Task title is required'
      });
    }

    if (!['high', 'medium', 'low'].includes(priority)) {
      return res.status(400).json({
        success: false,
        error: 'Priority must be high, medium, or low'
      });
    }

    const task = db.createTask({
      title: title.trim(),
      description: description?.trim() || '',
      priority
    });

    return res.status(201).json({
      success: true,
      data: task
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to create task'
    });
  }
}

// PUT /api/tasks - Update a task
function updateTask(req, res) {
  try {
    const { id, title, description, priority, completed } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Task ID is required'
      });
    }

    const updates = {};
    if (title !== undefined) updates.title = title.trim();
    if (description !== undefined) updates.description = description.trim();
    if (priority !== undefined) {
      if (!['high', 'medium', 'low'].includes(priority)) {
        return res.status(400).json({
          success: false,
          error: 'Priority must be high, medium, or low'
        });
      }
      updates.priority = priority;
    }
    if (completed !== undefined) updates.completed = Boolean(completed);

    const task = db.updateTask(id, updates);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to update task'
    });
  }
}

// DELETE /api/tasks - Delete a task
function deleteTask(req, res) {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Task ID is required'
      });
    }

    const deleted = db.deleteTask(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to delete task'
    });
  }
}