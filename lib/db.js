// lib/db.js
// Simple in-memory database for poke-brain
// PERFORMANCE OPTIMIZED: Map-based O(1) lookups
// This can be easily replaced with a real database (PostgreSQL, MongoDB, etc.)

import { v4 as uuidv4 } from 'uuid';

class InMemoryDB {
  constructor() {
    // PERFORMANCE: Use Map instead of Array for O(1) lookups
    this.tasksMap = new Map();
    this.remindersMap = new Map();
  }

  // ============ TASKS ============

  /**
   * Get all tasks
   * @returns {Array} Array of task objects
   * Performance: O(n) - Must iterate all entries
   */
  getTasks() {
    return Array.from(this.tasksMap.values());
  }

  /**
   * Get a single task by ID
   * @param {string} id - Task ID
   * @returns {Object|null} Task object or null if not found
   * Performance: O(1) - Direct Map lookup (Previously O(n) with Array.find)
   */
  getTaskById(id) {
    return this.tasksMap.get(id) || null;
  }

  /**
   * Create a new task
   * @param {Object} taskData - Task data (title, description, priority)
   * @returns {Object} Created task object
   * Performance: O(1) - Direct Map insertion
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

    this.tasksMap.set(task.id, task);
    return task;
  }

  /**
   * Update an existing task
   * @param {string} id - Task ID
   * @param {Object} updates - Object containing fields to update
   * @returns {Object|null} Updated task or null if not found
   * Performance: O(1) - Direct Map lookup and update (Previously O(n))
   */
  updateTask(id, updates) {
    const task = this.tasksMap.get(id);
    
    if (!task) {
      return null;
    }

    // Update allowed fields
    if (updates.title !== undefined) task.title = updates.title;
    if (updates.description !== undefined) task.description = updates.description;
    if (updates.priority !== undefined) task.priority = updates.priority;
    if (updates.completed !== undefined) task.completed = updates.completed;
    
    task.updatedAt = new Date().toISOString();
    
    this.tasksMap.set(id, task);
    return task;
  }

  /**
   * Delete a task
   * @param {string} id - Task ID
   * @returns {boolean} True if deleted, false if not found
   * Performance: O(1) - Direct Map deletion (Previously O(n) with filter)
   */
  deleteTask(id) {
    return this.tasksMap.delete(id);
  }

  // ============ REMINDERS ============

  /**
   * Get all reminders
   * @returns {Array} Array of reminder objects
   * Performance: O(n) - Must iterate all entries
   */
  getReminders() {
    return Array.from(this.remindersMap.values());
  }

  /**
   * Get a single reminder by ID
   * @param {string} id - Reminder ID
   * @returns {Object|null} Reminder object or null if not found
   * Performance: O(1) - Direct Map lookup (Previously O(n))
   */
  getReminderById(id) {
    return this.remindersMap.get(id) || null;
  }

  /**
   * Create a new reminder
   * @param {Object} reminderData - Reminder data (title, message, remindAt, type)
   * @returns {Object} Created reminder object
   * Performance: O(1) - Direct Map insertion
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

    this.remindersMap.set(reminder.id, reminder);
    return reminder;
  }

  /**
   * Delete a reminder
   * @param {string} id - Reminder ID
   * @returns {boolean} True if deleted, false if not found
   * Performance: O(1) - Direct Map deletion (Previously O(n))
   */
  deleteReminder(id) {
    return this.remindersMap.delete(id);
  }

  /**
   * Mark a reminder as triggered
   * @param {string} id - Reminder ID
   * @returns {Object|null} Updated reminder or null if not found
   * Performance: O(1) - Direct Map lookup and update (Previously O(n))
   */
  triggerReminder(id) {
    const reminder = this.remindersMap.get(id);
    if (!reminder) return null;
    
    reminder.triggered = true;
    reminder.triggeredAt = new Date().toISOString();
    this.remindersMap.set(id, reminder);
    return reminder;
  }

  // ============ UTILITIES ============

  /**
   * Clear all data (useful for testing)
   * Performance: O(1) - Map.clear() is constant time
   */
  clear() {
    this.tasksMap.clear();
    this.remindersMap.clear();
  }

  /**
   * Get database statistics
   * @returns {Object} Statistics object
   * Performance: O(n) - Must iterate to count filtered items
   */
  getStats() {
    const tasks = Array.from(this.tasksMap.values());
    const reminders = Array.from(this.remindersMap.values());
    
    return {
      totalTasks: this.tasksMap.size,
      completedTasks: tasks.filter(t => t.completed).length,
      pendingTasks: tasks.filter(t => !t.completed).length,
      totalReminders: this.remindersMap.size,
      activeReminders: reminders.filter(r => !r.triggered).length,
      triggeredReminders: reminders.filter(r => r.triggered).length
    };
  }
}

// Create a singleton instance
const db = new InMemoryDB();

export { db };
