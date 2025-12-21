// lib/never-forget.js
// "Never Forget" - Critical task tracking with ADHD-friendly features
// PERFORMANCE OPTIMIZED: Single-pass filtering and Map-based storage
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
    // PERFORMANCE: Use Map for O(1) lookups instead of Array with O(n) find
    this.criticalTasksMap = new Map();
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
      const now = Date.now();
      const deadline = new Date(task.deadline).getTime();
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
    const createdAt = new Date(task.createdAt).getTime();
    const hoursSinceCreation = (Date.now() - createdAt) / (1000 * 60 * 60);
    if (hoursSinceCreation < 1) {
      score += 30; // Boost for tasks less than 1 hour old
    } else if (hoursSinceCreation < 24) {
      score += 10; // Small boost for tasks less than 1 day old
    }

    // Snooze penalty - snoozed tasks get lower priority
    if (task.snoozedUntil) {
      const snoozeUntil = new Date(task.snoozedUntil).getTime();
      if (snoozeUntil > Date.now()) {
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

    const now = Date.now();
    const deadline = new Date(task.deadline).getTime();
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
   * Update cached metrics for a task
   * @private
   * @param {Object} task - Task object
   */
  _updateTaskMetrics(task) {
    task.priorityScore = this.calculatePriorityScore(task);
    task.escalationStage = this.determineEscalationStage(task);
    task.visualIndicators = this.generateVisualIndicators(task);
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
      this._updateTaskMetrics(task);

      // PERFORMANCE: Use Map.set for O(1) insertion
      this.criticalTasksMap.set(task.id, task);
      return task;
    } catch (error) {
      throw new Error(`Failed to add critical task: ${error.message}`);
    }
  }

  /**
   * Get all critical tasks, sorted by priority
   * PERFORMANCE OPTIMIZED: Single-pass filtering with early evaluation
   * @param {Object} options - Filter options
   * @returns {Array} Sorted array of critical tasks
   */
  getCriticalTasks(options = {}) {
    const now = Date.now();
    const results = [];

    // PERFORMANCE: Single-pass filtering and metric update
    for (const task of this.criticalTasksMap.values()) {
      // Filter completed tasks
      if (!options.includeCompleted && task.completed) {
        continue;
      }

      // Update metrics (they change over time)
      this._updateTaskMetrics(task);

      // Filter by escalation stage
      if (options.escalationStage && task.escalationStage !== options.escalationStage) {
        continue;
      }

      results.push(task);
    }

    // Sort by priority score (highest first)
    results.sort((a, b) => b.priorityScore - a.priorityScore);

    // Limit results if specified
    if (options.limit && options.limit > 0) {
      return results.slice(0, options.limit);
    }

    return results;
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
   * PERFORMANCE: O(1) lookup with Map
   * @param {string} taskId - Task ID
   * @param {Date|string} until - When to un-snooze
   * @param {string} reason - Optional reason for snoozing
   * @returns {Object} Updated task
   */
  snoozeTask(taskId, until, reason = '') {
    const task = this.criticalTasksMap.get(taskId);
    
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
      snoozedAt: new Date().toISOString(),
      snoozedUntil: snoozeUntil.toISOString(),
      reason: reason.trim()
    });
    task.updatedAt = new Date().toISOString();

    // Recalculate metrics
    this._updateTaskMetrics(task);

    return task;
  }

  /**
   * Mark a task as completed
   * PERFORMANCE: O(1) lookup with Map
   * @param {string} taskId - Task ID
   * @returns {Object} Updated task
   */
  completeTask(taskId) {
    const task = this.criticalTasksMap.get(taskId);
    
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
   * PERFORMANCE: O(1) task lookup, O(k) step lookup where k is number of steps
   * @param {string} taskId - Task ID
   * @param {string} stepId - Step ID
   * @param {boolean} completed - Completion status
   * @returns {Object} Updated task
   */
  updateMicroStep(taskId, stepId, completed) {
    const task = this.criticalTasksMap.get(taskId);
    
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
   * PERFORMANCE: O(1) lookup with Map
   * @param {string} taskId - Task ID
   * @param {string} noteText - Note content
   * @returns {Object} Updated task
   */
  addNote(taskId, noteText) {
    const task = this.criticalTasksMap.get(taskId);
    
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
   * PERFORMANCE: Single pass with early filtering
   * @returns {Array} Critical and emergency tasks
   */
  getUrgentAlerts() {
    const results = [];
    
    for (const task of this.criticalTasksMap.values()) {
      if (task.completed) continue;
      
      // Update metrics to ensure accuracy
      this._updateTaskMetrics(task);
      
      if (task.escalationStage === ESCALATION_STAGES.emergency ||
          task.escalationStage === ESCALATION_STAGES.critical) {
        results.push(task);
      }
    }
    
    return results.sort((a, b) => b.priorityScore - a.priorityScore);
  }

  /**
   * Get statistics about critical tasks
   * PERFORMANCE: Single-pass calculation
   * @returns {Object} Statistics
   */
  getStats() {
    const stats = {
      total: 0,
      active: 0,
      completed: 0,
      overdue: 0,
      snoozed: 0,
      emergency: 0,
      critical: 0,
      urgent: 0
    };

    const now = Date.now();

    // PERFORMANCE: Single pass through all tasks
    for (const task of this.criticalTasksMap.values()) {
      stats.total++;
      
      if (task.completed) {
        stats.completed++;
        continue;
      }
      
      stats.active++;
      
      // Update metrics for accurate stats
      this._updateTaskMetrics(task);
      
      // Check overdue
      if (task.deadline && new Date(task.deadline).getTime() < now) {
        stats.overdue++;
      }
      
      // Check snoozed
      if (task.snoozedUntil && new Date(task.snoozedUntil).getTime() > now) {
        stats.snoozed++;
      }
      
      // Count by escalation stage
      switch (task.escalationStage) {
        case ESCALATION_STAGES.emergency:
          stats.emergency++;
          break;
        case ESCALATION_STAGES.critical:
          stats.critical++;
          break;
        case ESCALATION_STAGES.urgent:
          stats.urgent++;
          break;
      }
    }
    
    return stats;
  }

  /**
   * Clear all completed tasks (archive functionality)
   * PERFORMANCE: O(n) but only called occasionally
   * @returns {number} Number of tasks cleared
   */
  clearCompleted() {
    let clearedCount = 0;
    
    for (const [id, task] of this.criticalTasksMap.entries()) {
      if (task.completed) {
        this.criticalTasksMap.delete(id);
        clearedCount++;
      }
    }
    
    return clearedCount;
  }
}

// Create singleton instance
const neverForget = new NeverForgetManager();

export { neverForget, ESCALATION_STAGES, PRIORITY_WEIGHTS };
