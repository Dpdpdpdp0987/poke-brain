// lib/single-pass-filter.js
// Universal single-pass filtering utility for performance optimization
// Eliminates multiple array iterations and intermediate allocations

/**
 * Single-pass filter, map, and reduce operations
 * Combines multiple operations into one iteration for maximum performance
 * 
 * Performance: O(n) single pass instead of O(k*n) for k operations
 * 
 * @template T Input type
 * @template U Output type
 */
class SinglePassProcessor {
  constructor(data) {
    this.data = data;
    this.operations = [];
  }

  /**
   * Add a filter operation
   * @param {Function} predicate - Filter predicate function
   * @returns {SinglePassProcessor} Chainable instance
   */
  filter(predicate) {
    this.operations.push({
      type: 'filter',
      fn: predicate
    });
    return this;
  }

  /**
   * Add a map operation
   * @param {Function} mapper - Map function
   * @returns {SinglePassProcessor} Chainable instance
   */
  map(mapper) {
    this.operations.push({
      type: 'map',
      fn: mapper
    });
    return this;
  }

  /**
   * Add a sort operation
   * @param {Function} compareFn - Compare function
   * @returns {SinglePassProcessor} Chainable instance
   */
  sort(compareFn) {
    this.operations.push({
      type: 'sort',
      fn: compareFn
    });
    return this;
  }

  /**
   * Add a limit operation
   * @param {number} count - Maximum number of items
   * @returns {SinglePassProcessor} Chainable instance
   */
  limit(count) {
    this.operations.push({
      type: 'limit',
      fn: count
    });
    return this;
  }

  /**
   * Execute all operations in a single pass
   * @returns {Array} Processed results
   * 
   * Performance: Single iteration regardless of operation count
   */
  execute() {
    let results = [];
    const hasLimit = this.operations.some(op => op.type === 'limit');
    const limitValue = hasLimit 
      ? this.operations.find(op => op.type === 'limit').fn 
      : Infinity;

    // PERFORMANCE: Single pass through data
    for (const item of this.data) {
      // Early termination if limit reached
      if (results.length >= limitValue) {
        break;
      }

      let currentItem = item;
      let shouldInclude = true;

      // Apply filter and map operations inline
      for (const operation of this.operations) {
        if (operation.type === 'filter') {
          if (!operation.fn(currentItem)) {
            shouldInclude = false;
            break;
          }
        } else if (operation.type === 'map') {
          currentItem = operation.fn(currentItem);
        }
      }

      if (shouldInclude) {
        results.push(currentItem);
      }
    }

    // Apply sort if needed (must be done after filtering)
    const sortOp = this.operations.find(op => op.type === 'sort');
    if (sortOp) {
      results.sort(sortOp.fn);
    }

    // Apply limit if needed and not already applied
    const limitOp = this.operations.find(op => op.type === 'limit');
    if (limitOp && results.length > limitOp.fn) {
      results = results.slice(0, limitOp.fn);
    }

    return results;
  }

  /**
   * Reduce to a single value
   * @param {Function} reducer - Reducer function
   * @param {*} initialValue - Initial accumulator value
   * @returns {*} Reduced value
   */
  reduce(reducer, initialValue) {
    let accumulator = initialValue;

    for (const item of this.data) {
      let currentItem = item;
      let shouldInclude = true;

      // Apply filters and maps first
      for (const operation of this.operations) {
        if (operation.type === 'filter') {
          if (!operation.fn(currentItem)) {
            shouldInclude = false;
            break;
          }
        } else if (operation.type === 'map') {
          currentItem = operation.fn(currentItem);
        }
      }

      if (shouldInclude) {
        accumulator = reducer(accumulator, currentItem);
      }
    }

    return accumulator;
  }

  /**
   * Count items matching criteria
   * @returns {number} Count of items
   */
  count() {
    return this.reduce((acc) => acc + 1, 0);
  }

  /**
   * Check if any item matches criteria
   * @returns {boolean} True if any match found
   */
  some() {
    for (const item of this.data) {
      let shouldInclude = true;

      for (const operation of this.operations) {
        if (operation.type === 'filter') {
          if (!operation.fn(item)) {
            shouldInclude = false;
            break;
          }
        }
      }

      if (shouldInclude) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if all items match criteria
   * @returns {boolean} True if all match
   */
  every() {
    for (const item of this.data) {
      let shouldInclude = true;

      for (const operation of this.operations) {
        if (operation.type === 'filter') {
          if (!operation.fn(item)) {
            return false;
          }
        }
      }
    }

    return true;
  }
}

/**
 * Create a single-pass processor
 * @param {Array|Map|Set} data - Data to process
 * @returns {SinglePassProcessor} Processor instance
 * 
 * @example
 * // Instead of:
 * const result = tasks
 *   .filter(t => !t.completed)
 *   .filter(t => t.priority === 'high')
 *   .map(t => ({ ...t, calculated: calculate(t) }))
 *   .sort((a, b) => b.score - a.score)
 *   .slice(0, 10);
 * 
 * // Use single-pass:
 * const result = singlePass(tasks)
 *   .filter(t => !t.completed)
 *   .filter(t => t.priority === 'high')
 *   .map(t => ({ ...t, calculated: calculate(t) }))
 *   .sort((a, b) => b.score - a.score)
 *   .limit(10)
 *   .execute();
 */
function singlePass(data) {
  // Convert Map/Set to array if needed
  const arrayData = data instanceof Map 
    ? Array.from(data.values())
    : data instanceof Set
    ? Array.from(data)
    : data;

  return new SinglePassProcessor(arrayData);
}

/**
 * Optimized filtering for common patterns
 */
const CommonFilters = {
  /**
   * Filter non-null/undefined values
   */
  notNull: (item) => item != null,

  /**
   * Filter truthy values
   */
  truthy: (item) => Boolean(item),

  /**
   * Filter by property value
   * @param {string} prop - Property name
   * @param {*} value - Expected value
   */
  propEquals: (prop, value) => (item) => item[prop] === value,

  /**
   * Filter by property existence
   * @param {string} prop - Property name
   */
  hasProp: (prop) => (item) => prop in item,

  /**
   * Combine multiple predicates with AND logic
   * @param {...Function} predicates - Predicates to combine
   */
  and: (...predicates) => (item) => predicates.every(p => p(item)),

  /**
   * Combine multiple predicates with OR logic
   * @param {...Function} predicates - Predicates to combine
   */
  or: (...predicates) => (item) => predicates.some(p => p(item)),

  /**
   * Negate a predicate
   * @param {Function} predicate - Predicate to negate
   */
  not: (predicate) => (item) => !predicate(item)
};

/**
 * Performance comparison utility
 * Benchmarks traditional vs single-pass approaches
 */
function benchmarkFiltering(data, operations) {
  const iterations = 100;

  // Traditional approach
  const traditionalStart = performance.now();
  for (let i = 0; i < iterations; i++) {
    let result = data;
    for (const op of operations) {
      if (op.type === 'filter') {
        result = result.filter(op.fn);
      } else if (op.type === 'map') {
        result = result.map(op.fn);
      } else if (op.type === 'sort') {
        result = result.sort(op.fn);
      }
    }
  }
  const traditionalTime = performance.now() - traditionalStart;

  // Single-pass approach
  const singlePassStart = performance.now();
  for (let i = 0; i < iterations; i++) {
    let processor = singlePass(data);
    for (const op of operations) {
      if (op.type === 'filter') {
        processor = processor.filter(op.fn);
      } else if (op.type === 'map') {
        processor = processor.map(op.fn);
      } else if (op.type === 'sort') {
        processor = processor.sort(op.fn);
      }
    }
    processor.execute();
  }
  const singlePassTime = performance.now() - singlePassStart;

  return {
    traditional: traditionalTime,
    singlePass: singlePassTime,
    speedup: (traditionalTime / singlePassTime).toFixed(2) + 'x',
    improvement: ((1 - singlePassTime / traditionalTime) * 100).toFixed(1) + '%'
  };
}

export { 
  singlePass, 
  SinglePassProcessor, 
  CommonFilters, 
  benchmarkFiltering 
};
