// lib/never-forget.js
// "Never Forget" - Critical task tracking with ADHD-friendly features
// Persistent tracking system designed for executive function support

import { v4 as uuidv4 } from 'uuid';

/**
 * Priority scoring constants
 * Used to calculate task urgency and importance
 */
const PRIORITY_WEIGHTS = {
  critical: 100,
  high: 50,
  medium: 25,
  low: 10
};

const ESCALATION_STAGES = {
  normal: 'normal',          // Task is on track
  attention: 'attention',    // Task needs attention soon
  urgent: 'urgent',          // Task is becoming urgent
  critical: 'critical',      // Task is overdue or extremely urgent
  emergency: 'emergency'     // Task is dangerously overdue
};

class NeverForgetManager {
  constructor() {
    this.criticalTasks = [];
  }

  /**
   * Calculate priority score for a task
   * Considers deadline, importance level, and recency
   * @param {Object} task - Task object
   * @returns {number} Priority score (higher = more important)
   */
  calculatePriorityScore(task) {
    let score = 0;

    // Base importance score
    const importanceScore = PRIORITY_WEIGHTS[task.importance] || PRIORITY_WEIGHTS.medium;
    score += importanceScore;

    // Deadline urgency (exponential increase as deadline approaches)
    if (task.deadline) {
      const now = new Date();
      const deadline = new Date(task.deadline);
      const hoursUntilDeadline = (deadline - now) / (1000 * 60 * 60);

      if (hoursUntilDeadline < 0) {
        // Overdue - exponentially increase score
        const hoursOverdue = Math.abs(hoursUntilDeadline);
        score += 200 + (hoursOverdue * 10);
      } else if (hoursUntilDeadline < 24) {
        // Less than 24 hours - critical
        score += 150;
      } else if (hoursUntilDeadline < 72) {
        // Less than 3 days - urgent
        score += 100;
      } else if (hoursUntilDeadline < 168) {
        // Less than 1 week - attention needed
        score += 50;
      }
    }

    // Recency boost - newly added tasks get temporary visibility
    const createdAt = new Date(task.createdAt);
    const hoursSinceCreation = (new Date() - createdAt) / (1000 * 60 * 60);
    if (hoursSinceCreation < 1) {
      score += 30; // Boost for tasks less than 1 hour old
    } else if (hoursSinceCreation < 24) {
      score += 10; // Small boost for tasks less than 1 day old
    }

    // Snooze penalty - snoozed tasks get lower priority
    if (task.snoozedUntil) {
      const snoozeUntil = new Date(task.snoozedUntil);
      if (snoozeUntil > new Date()) {
        score = Math.max(0, score - 100); // Still in snooze period
      }
    }

    // Consecutive snooze penalty
    if (task.snoozeCount > 0) {
      // Tasks snoozed multiple times get escalated
      score += (task.snoozeCount * 20);
    }

    return Math.max(0, score);
  }

  /**
   * Determine escalation stage based on task status
   * @param {Object} task - Task object
   * @returns {string} Escalation stage
   */
  determineEscalationStage(task) {
    if (!task.deadline) {
      return task.snoozeCount >= 5 ? ESCALATION_STAGES.urgent : ESCALATION_STAGES.normal;
    }

    const now = new Date();
    const deadline = new Date(task.deadline);
    const hoursUntilDeadline = (deadline - now) / (1000 * 60 * 60);

    // Overdue tasks
    if (hoursUntilDeadline < 0) {
      const hoursOverdue = Math.abs(hoursUntilDeadline);
      if (hoursOverdue > 72) {
        return ESCALATION_STAGES.emergency; // More than 3 days overdue
      } else if (hoursOverdue > 24) {
        return ESCALATION_STAGES.critical; // More than 1 day overdue
      } else {
        return ESCALATION_STAGES.urgent; // Overdue
      }
    }

    // Approaching deadline
    if (hoursUntilDeadline < 6) {
      return ESCALATION_STAGES.critical; // Less than 6 hours
    } else if (hoursUntilDeadline < 24) {
      return ESCALATION_STAGES.urgent; // Less than 24 hours
    } else if (hoursUntilDeadline < 72) {
      return ESCALATION_STAGES.attention; // Less than 3 days
    }

    // Multiple snoozes indicate avoidance - escalate
    if (task.snoozeCount >= 5) {
      return ESCALATION_STAGES.urgent;
    } else if (task.snoozeCount >= 3) {
      return ESCALATION_STAGES.attention;
    }

    return ESCALATION_STAGES.normal;
  }

  /**
   * Generate visual indicators for ADHD-friendly display
   * @param {Object} task - Task object
   * @returns {Object} Visual indicators
   */
  generateVisualIndicators(task) {
    const escalation = this.determineEscalationStage(task);
    
    const indicators = {
      emoji: '📌',
      color: '#4A5568',
      urgencyBar: 0,
      pulseAnimation: false,
      soundAlert: false
    };

    switch (escalation) {
      case ESCALATION_STAGES.emergency:
        indicators.emoji = '🚨';
        indicators.color = '#E53E3E';
        indicators.urgencyBar = 100;
        indicators.pulseAnimation = true;
        indicators.soundAlert = true;
        break;
      case ESCALATION_STAGES.critical:
        indicators.emoji = '❗';
        indicators.color = '#DD6B20';
        indicators.urgencyBar = 85;
        indicators.pulseAnimation = true;
        indicators.soundAlert = false;
        break;
      case ESCALATION_STAGES.urgent:
        indicators.emoji = '⚠️';
        indicators.color = '#D69E2E';
        indicators.urgencyBar = 65;
        indicators.pulseAnimation = false;
        indicators.soundAlert = false;
        break;
      case ESCALATION_STAGES.attention:
        indicators.emoji = '🔔';
        indicators.color = '#3182CE';
        indicators.urgencyBar = 40;
        indicators.pulseAnimation = false;
        indicators.soundAlert = false;
        break;
      default:
        indicators.emoji = '📝';
        indicators.color = '#48BB78';
        indicators.urgencyBar = 20;
        indicators.pulseAnimation = false;
        indicators.soundAlert = false;
    }

    return indicators;
  }

  /**
   * Break down task into micro-steps
   * ADHD-friendly: smaller, manageable chunks
   * @param {string} taskDescription - Task description
   * @returns {Array} Array of micro-steps
   */
  generateMicroSteps(taskDescription) {
    // This is a simple implementation - can be enhanced with AI/NLP later
    const microSteps = [];
    
    // Default micro-steps for task initiation
    microSteps.push({
      id: uuidv4(),
      description: '📋 Review what needs to be done',
      completed: false,
      duration: '2 min'
    });

    microSteps.push({
      id: uuidv4(),
      description: '🧩 Break down into smaller parts',
      completed: false,
      duration: '5 min'
    });

    microSteps.push({
      id: uuidv4(),
      description: '🎯 Start with the easiest part',
      completed: false,
      duration: '10 min'
    });

    return microSteps;
  }

  /**
   * Add a critical task to the Never Forget system
   * @param {Object} taskData - Task data
   * @returns {Object} Created task with tracking metadata
   */
  addCriticalTask(taskData) {
    try {
      // Validation
      if (!taskData.title || taskData.title.trim() === '') {
        throw new Error('Task title is required');
      }

      // Create task with full tracking metadata
      const task = {
        id: uuidv4(),
        title: taskData.title.trim(),
        description: taskData.description?.trim() || '',
        importance: taskData.importance || 'high',
        deadline: taskData.deadline || null,
        
        // Tracking metadata
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        completed: false,
        completedAt: null,
        
        // Snooze tracking
        snoozedUntil: null,
        snoozeCount: 0,
        snoozeHistory: [],
        
        // ADHD support features
        microSteps: taskData.microSteps || this.generateMicroSteps(taskData.title),
        visualIndicators: null, // Calculated dynamically
        
        // Escalation tracking
        escalationStage: ESCALATION_STAGES.normal,
        priorityScore: 0, // Calculated dynamically
        
        // User notes
        notes: [],
        tags: taskData.tags || []
      };

      // Calculate initial metrics
      task.priorityScore = this.calculatePriorityScore(task);
      task.escalationStage = this.determineEscalationStage(task);
      task.visualIndicators = this.generateVisualIndicators(task);

      this.criticalTasks.push(task);
      return task;
    } catch (error) {
      throw new Error(`Failed to add critical task: ${error.message}`);
    }
  }

  /**
   * Get all critical tasks, sorted by priority
   * @param {Object} options - Filter options
   * @returns {Array} Sorted array of critical tasks
   */
  getCriticalTasks(options = {}) {
    let tasks = [...this.criticalTasks];

    // Filter out completed tasks unless requested
    if (!options.includeCompleted) {
      tasks = tasks.filter(task => !task.completed);
    }

    // Filter by escalation stage
    if (options.escalationStage) {
      tasks = tasks.filter(task => task.escalationStage === options.escalationStage);
    }

    // Recalculate scores and stages (they change over time)
    tasks = tasks.map(task => {
      const updatedTask = { ...task };
      updatedTask.priorityScore = this.calculatePriorityScore(updatedTask);
      updatedTask.escalationStage = this.determineEscalationStage(updatedTask);
      updatedTask.visualIndicators = this.generateVisualIndicators(updatedTask);
      return updatedTask;
    });

    // Sort by priority score (highest first)
    tasks.sort((a, b) => b.priorityScore - a.priorityScore);

    // Limit results if specified
    if (options.limit) {
      tasks = tasks.slice(0, options.limit);
    }

    return tasks;
  }

  /**
   * Get top priority tasks
   * @param {number} count - Number of tasks to return (default: 3)
   * @returns {Array} Top priority tasks
   */
  getTopPriorityTasks(count = 3) {
    return this.getCriticalTasks({ limit: count });
  }

  /**
   * Snooze a task until a specified time
   * @param {string} taskId - Task ID
   * @param {Date|string} until - When to un-snooze
   * @param {string} reason - Optional reason for snoozing
   * @returns {Object} Updated task
   */
  snoozeTask(taskId, until, reason = '') {
    const task = this.criticalTasks.find(t => t.id === taskId);
    
    if (!task) {
      throw new Error('Task not found');
    }

    if (task.completed) {
      throw new Error('Cannot snooze a completed task');
    }

    const snoozeUntil = new Date(until);
    
    if (isNaN(snoozeUntil.getTime())) {
      throw new Error('Invalid snooze date');
    }

    if (snoozeUntil <= new Date()) {
      throw new Error('Snooze time must be in the future');
    }

    // Update snooze tracking
    task.snoozedUntil = snoozeUntil.toISOString();
    task.snoozeCount += 1;
    task.snoozeHistory.push({
      snoozedat: new Date().toISOString(),
      snoozedUntil: snoozeUntil.toISOString(),
      reason: reason.trim()
    });
    task.updatedAt = new Date().toISOString();

    // Recalculate metrics
    task.priorityScore = this.calculatePriorityScore(task);
    task.escalationStage = this.determineEscalationStage(task);
    task.visualIndicators = this.generateVisualIndicators(task);

    return task;
  }

  /**
   * Mark a task as completed
   * @param {string} taskId - Task ID
   * @returns {Object} Updated task
   */
  completeTask(taskId) {
    const task = this.criticalTasks.find(t => t.id === taskId);
    
    if (!task) {
      throw new Error('Task not found');
    }

    if (task.completed) {
      throw new Error('Task is already completed');
    }

    task.completed = true;
    task.completedAt = new Date().toISOString();
    task.updatedAt = new Date().toISOString();

    return task;
  }

  /**
   * Update task micro-step completion
   * @param {string} taskId - Task ID
   * @param {string} stepId - Step ID
   * @param {boolean} completed - Completion status
   * @returns {Object} Updated task
   */
  updateMicroStep(taskId, stepId, completed) {
    const task = this.criticalTasks.find(t => t.id === taskId);
    
    if (!task) {
      throw new Error('Task not found');
    }

    const step = task.microSteps.find(s => s.id === stepId);
    
    if (!step) {
      throw new Error('Micro-step not found');
    }

    step.completed = Boolean(completed);
    task.updatedAt = new Date().toISOString();

    return task;
  }

  /**
   * Add a note to a task
   * @param {string} taskId - Task ID
   * @param {string} noteText - Note content
   * @returns {Object} Updated task
   */
  addNote(taskId, noteText) {
    const task = this.criticalTasks.find(t => t.id === taskId);
    
    if (!task) {
      throw new Error('Task not found');
    }

    task.notes.push({
      id: uuidv4(),
      text: noteText.trim(),
      createdAt: new Date().toISOString()
    });
    task.updatedAt = new Date().toISOString();

    return task;
  }

  /**
   * Get tasks requiring immediate attention
   * @returns {Array} Critical and emergency tasks
   */
  getUrgentAlerts() {
    const tasks = this.getCriticalTasks();
    return tasks.filter(task => 
      task.escalationStage === ESCALATION_STAGES.emergency ||
      task.escalationStage === ESCALATION_STAGES.critical
    );
  }

  /**
   * Get statistics about critical tasks
   * @returns {Object} Statistics
   */
  getStats() {
    const all = this.criticalTasks;
    const active = all.filter(t => !t.completed);
    
    return {
      total: all.length,
      active: active.length,
      completed: all.filter(t => t.completed).length,
      overdue: active.filter(t => {
        if (!t.deadline) return false;
        return new Date(t.deadline) < new Date();
      }).length,
      snoozed: active.filter(t => {
        if (!t.snoozedUntil) return false;
        return new Date(t.snoozedUntil) > new Date();
      }).length,
      emergency: active.filter(t => t.escalationStage === ESCALATION_STAGES.emergency).length,
      critical: active.filter(t => t.escalationStage === ESCALATION_STAGES.critical).length,
      urgent: active.filter(t => t.escalationStage === ESCALATION_STAGES.urgent).length
    };
  }

  /**
   * Clear all completed tasks (archive functionality)
   * @returns {number} Number of tasks cleared
   */
  clearCompleted() {
    const initialCount = this.criticalTasks.length;
    this.criticalTasks = this.criticalTasks.filter(t => !t.completed);
    return initialCount - this.criticalTasks.length;
  }
}

// Create singleton instance
const neverForget = new NeverForgetManager();

export { neverForget, ESCALATION_STAGES, PRIORITY_WEIGHTS };