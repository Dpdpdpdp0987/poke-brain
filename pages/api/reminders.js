// pages/api/reminders.js
// ADHD-friendly reminders API endpoint for poke-brain

import { db } from '../../lib/db';

export default function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
      return getReminders(req, res);
    case 'POST':
      return createReminder(req, res);
    case 'DELETE':
      return deleteReminder(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      return res.status(405).json({ error: `Method ${method} Not Allowed` });
  }
}

// GET /api/reminders - Retrieve reminders
function getReminders(req, res) {
  try {
    const { type, upcoming } = req.query;
    let reminders = db.getReminders();

    // Filter by type if specified
    if (type) {
      reminders = reminders.filter(reminder => reminder.type === type);
    }

    // Filter upcoming reminders (within next 24 hours)
    if (upcoming === 'true') {
      const now = new Date();
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      reminders = reminders.filter(reminder => {
        const remindAt = new Date(reminder.remindAt);
        return remindAt >= now && remindAt <= tomorrow;
      });
    }

    // Sort by remindAt (earliest first)
    reminders.sort((a, b) => new Date(a.remindAt) - new Date(b.remindAt));

    return res.status(200).json({
      success: true,
      count: reminders.length,
      data: reminders
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve reminders'
    });
  }
}

// POST /api/reminders - Create a new reminder
function createReminder(req, res) {
  try {
    const { title, message, remindAt, type = 'gentle' } = req.body;

    // Validation
    if (!title || title.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Reminder title is required'
      });
    }

    if (!remindAt) {
      return res.status(400).json({
        success: false,
        error: 'Reminder time (remindAt) is required'
      });
    }

    // Validate date
    const reminderDate = new Date(remindAt);
    if (isNaN(reminderDate.getTime())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid date format for remindAt'
      });
    }

    // Check if date is in the past
    if (reminderDate < new Date()) {
      return res.status(400).json({
        success: false,
        error: 'Reminder time cannot be in the past'
      });
    }

    // Validate type
    if (!['gentle', 'persistent', 'urgent'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Type must be gentle, persistent, or urgent'
      });
    }

    const reminder = db.createReminder({
      title: title.trim(),
      message: message?.trim() || '',
      remindAt: reminderDate.toISOString(),
      type
    });

    return res.status(201).json({
      success: true,
      data: reminder,
      message: getReminderTypeMessage(type)
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to create reminder'
    });
  }
}

// DELETE /api/reminders - Delete a reminder
function deleteReminder(req, res) {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Reminder ID is required'
      });
    }

    const deleted = db.deleteReminder(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Reminder not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Reminder deleted successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to delete reminder'
    });
  }
}

// Helper function to provide friendly messages based on reminder type
function getReminderTypeMessage(type) {
  const messages = {
    gentle: '✨ Gentle reminder set - I\'ll give you a soft nudge',
    persistent: '🔔 Persistent reminder set - I\'ll keep poking until you acknowledge',
    urgent: '🚨 Urgent reminder set - This is important, won\'t let you miss it!'
  };
  return messages[type] || 'Reminder set successfully';
}