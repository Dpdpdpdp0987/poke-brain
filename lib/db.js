// lib/db.js
// Simple in-memory database for poke-brain
// This can be easily replaced with a real database (PostgreSQL, MongoDB, etc.)

import { v4 as uuidv4 } from 'uuid';

class InMemoryDB {
  constructor() {
    this.tasks = [];
    this.reminders = [];
  }

  // ============ TASKS ============

  /**
   * Get all tasks
   * @returns {Array} Array of task objects
   */
  getTasks() {
    return [...this.tasks];
  }

  /**
   * Get a single task by ID
   * @param {string} id - Task ID
   * @returns {Object|null} Task object or null if not found
   */
  getTaskById(id) {
    return this.tasks.find(task => task.id === id) || null;
  }

  /**
   * Create a new task
   * @param {Object} taskData - Task data (title, description, priority)
   * @returns {Object} Created task object
   */
  createTask(taskData) {
    const task = {
      id: uuidv4(),
      title: taskData.title,
      description: taskData.description || '',
      priority: taskData.priority || 'medium',
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.tasks.push(task);
    return task;
  }

  /**
   * Update an existing task
   * @param {string} id - Task ID
   * @param {Object} updates - Object containing fields to update
   * @returns {Object|null} Updated task or null if not found
   */
  updateTask(id, updates) {
    const taskIndex = this.tasks.findIndex(task => task.id === id);
    
    if (taskIndex === -1) {
      return null;
    }

    const task = this.tasks[taskIndex];
    
    // Update allowed fields
    if (updates.title !== undefined) task.title = updates.title;
    if (updates.description !== undefined) task.description = updates.description;
    if (updates.priority !== undefined) task.priority = updates.priority;
    if (updates.completed !== undefined) task.completed = updates.completed;
    
    task.updatedAt = new Date().toISOString();
    
    this.tasks[taskIndex] = task;
    return task;
  }

  /**
   * Delete a task
   * @param {string} id - Task ID
   * @returns {boolean} True if deleted, false if not found
   */
  deleteTask(id) {
    const initialLength = this.tasks.length;
    this.tasks = this.tasks.filter(task => task.id !== id);
    return this.tasks.length < initialLength;
  }

  // ============ REMINDERS ============

  /**
   * Get all reminders
   * @returns {Array} Array of reminder objects
   */
  getReminders() {
    return [...this.reminders];
  }

  /**
   * Get a single reminder by ID
   * @param {string} id - Reminder ID
   * @returns {Object|null} Reminder object or null if not found
   */
  getReminderById(id) {
    return this.reminders.find(reminder => reminder.id === id) || null;
  }

  /**
   * Create a new reminder
   * @param {Object} reminderData - Reminder data (title, message, remindAt, type)
   * @returns {Object} Created reminder object
   */
  createReminder(reminderData) {
    const reminder = {
      id: uuidv4(),
      title: reminderData.title,
      message: reminderData.message || '',
      remindAt: reminderData.remindAt,
      type: reminderData.type || 'gentle',
      triggered: false,
      createdAt: new Date().toISOString()
    };

    this.reminders.push(reminder);
    return reminder;
  }

  /**
   * Delete a reminder
   * @param {string} id - Reminder ID
   * @returns {boolean} True if deleted, false if not found
   */
  deleteReminder(id) {
    const initialLength = this.reminders.length;
    this.reminders = this.reminders.filter(reminder => reminder.id !== id);
    return this.reminders.length < initialLength;
  }

  /**
   * Mark a reminder as triggered
   * @param {string} id - Reminder ID
   * @returns {Object|null} Updated reminder or null if not found
   */
  triggerReminder(id) {
    const reminder = this.reminders.find(r => r.id === id);
    if (!reminder) return null;
    
    reminder.triggered = true;
    reminder.triggeredAt = new Date().toISOString();
    return reminder;
  }

  // ============ UTILITIES ============

  /**
   * Clear all data (useful for testing)
   */
  clear() {
    this.tasks = [];
    this.reminders = [];
  }

  /**
   * Get database statistics
   * @returns {Object} Statistics object
   */
  getStats() {
    return {
      totalTasks: this.tasks.length,
      completedTasks: this.tasks.filter(t => t.completed).length,
      pendingTasks: this.tasks.filter(t => !t.completed).length,
      totalReminders: this.reminders.length,
      activeReminders: this.reminders.filter(r => !r.triggered).length,
      triggeredReminders: this.reminders.filter(r => r.triggered).length
    };
  }
}

// Create a singleton instance
const db = new InMemoryDB();

export { db };