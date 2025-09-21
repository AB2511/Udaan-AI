/**
 * Data Processing Utilities with Defensive Programming
 * 
 * This module provides safe array processing and trend calculation functions
 * with comprehensive error handling to prevent runtime errors like "slice is not a function".
 * 
 * Requirements addressed:
 * - 5.1: Defensive programming for array operations
 * - 5.2: Fallback values for invalid data types
 * - 5.3: Error handling for data type mismatches
 * - 5.4: Logging for debugging data issues
 */

/**
 * Data processing error class for structured error handling
 */
class DataProcessingError extends Error {
  constructor(operation, input, expectedType, message = null) {
    const errorMessage = message ||
      `Data processing error in ${operation}: expected ${expectedType}, received ${typeof input}`;
    super(errorMessage);
    this.name = "DataProcessingError";
    this.operation = operation;
    this.input = input;
    this.expectedType = expectedType;
  }
}

/**
 * Logger utility for data processing operations
 */
const logger = {
  /**
   * Log data type mismatches for debugging
   * @param {string} operation - Operation name
   * @param {*} input - Input data
   * @param {string} expectedType - Expected data type
   * @param {*} fallbackValue - Fallback value used
   */
  logTypeMismatch(operation, input, expectedType, fallbackValue) {
    const logMessage = `[DataProcessing] Type mismatch in ${operation}: expected ${expectedType}, got ${typeof input} (${input}). Using fallback: ${JSON.stringify(fallbackValue)}`;
    console.warn(logMessage);

    // Also log to a structured format for potential monitoring
    if (typeof window !== 'undefined' && window.dataProcessingLogs) {
      window.dataProcessingLogs.push({
        timestamp: new Date().toISOString(),
        operation,
        input,
        inputType: typeof input,
        expectedType,
        fallbackValue,
        level: 'warning'
      });
    }
  },

  /**
   * Log successful operations for debugging
   * @param {string} operation - Operation name
   * @param {*} input - Input data
   * @param {*} result - Operation result
   */
  logSuccess(operation, input, result) {
    const logMessage = `[DataProcessing] ${operation} completed successfully. Input length: ${Array.isArray(input) ? input.length : 'N/A'}, Result: ${JSON.stringify(result)}`;
    console.debug(logMessage);
  },

  /**
   * Log errors for debugging
   * @param {string} operation - Operation name
   * @param {Error} error - Error object
   * @param {*} input - Input data that caused the error
   */
  logError(operation, error, input) {
    const logMessage = `[DataProcessing] Error in ${operation}: ${error.message}. Input: ${JSON.stringify(input)}`;
    console.error(logMessage, error);

    // Also log to structured format
    if (typeof window !== 'undefined' && window.dataProcessingLogs) {
      window.dataProcessingLogs.push({
        timestamp: new Date().toISOString(),
        operation,
        error: error.message,
        input,
        inputType: typeof input,
        level: 'error'
      });
    }
  }
};

/**
 * Safely process arrays with defensive programming to prevent "slice is not a function" errors
 * @param {*} data - Input data (should be an array)
 * @param {Object} options - Processing options
 * @param {number} options.start - Start index for slicing (default: 0)
 * @param {number} options.end - End index for slicing (default: array length)
 * @param {number} options.limit - Maximum number of items to return
 * @param {Function} options.transform - Transform function to apply to each item
 * @param {*} options.fallback - Fallback value if input is not an array (default: [])
 * @param {boolean} options.strict - Whether to throw errors or use fallbacks (default: false)
 * @returns {Array} Processed array or fallback value
 */
export function safeArrayProcess(data, options = {}) {
  const {
    start = 0,
    end = null,
    limit = null,
    transform = null,
    fallback = [],
    strict = false
  } = options;

  const operation = 'safeArrayProcess';

  try {
    // Step 1: Validate input is an array
    if (!Array.isArray(data)) {
      logger.logTypeMismatch(operation, data, 'array', fallback);

      if (strict) {
        throw new DataProcessingError(operation, data, 'array');
      }

      // Try to convert to array if possible
      if (data === null || data === undefined) {
        return Array.isArray(fallback) ? fallback : [];
      }

      // If it's an object with length property, try to convert
      if (typeof data === 'object' && typeof data.length === 'number') {
        try {
          const converted = Array.from(data);
          logger.logSuccess(operation, `Converted object with length ${data.length} to array`, converted);
          data = converted;
        } catch (conversionError) {
          logger.logError(operation, conversionError, data);
          return Array.isArray(fallback) ? fallback : [];
        }
      } else {
        // Single item - wrap in array
        data = [data];
        logger.logSuccess(operation, 'Wrapped single item in array', data);
      }
    }

    // Step 2: Validate array indices
    const arrayLength = data.length;
    let processedStart = Math.max(0, Math.min(start, arrayLength));
    let processedEnd = end !== null ? Math.max(processedStart, Math.min(end, arrayLength)) : arrayLength;

    // Step 3: Apply slicing safely
    let result;
    try {
      result = data.slice(processedStart, processedEnd);
    } catch (sliceError) {
      logger.logError(operation, sliceError, data);

      if (strict) {
        throw new DataProcessingError(operation, data, 'array with slice method', sliceError.message);
      }

      return Array.isArray(fallback) ? fallback : [];
    }

    // Step 4: Apply limit if specified
    if (limit !== null && typeof limit === 'number' && limit > 0) {
      result = result.slice(0, limit);
    }

    // Step 5: Apply transformation if provided
    if (transform && typeof transform === 'function') {
      try {
        result = result.map((item, index) => {
          try {
            return transform(item, index);
          } catch (transformError) {
            logger.logError(`${operation}.transform`, transformError, item);
            return item; // Return original item if transform fails
          }
        });
      } catch (mapError) {
        logger.logError(operation, mapError, result);

        if (strict) {
          throw new DataProcessingError(operation, result, 'array with map method', mapError.message);
        }

        // Return result without transformation
      }
    }

    logger.logSuccess(operation, data, result);
    return result;

  } catch (error) {
    logger.logError(operation, error, data);

    if (strict) {
      throw error;
    }

    return Array.isArray(fallback) ? fallback : [];
  }
}

/**
 * Calculate trend from array of numeric values with defensive programming
 * @param {*} data - Input data (should be an array of numbers)
 * @param {Object} options - Calculation options
 * @param {string} options.method - Trend calculation method ('linear', 'percentage', 'simple')
 * @param {number} options.period - Number of recent items to consider for trend
 * @param {*} options.fallback - Fallback value if calculation fails
 * @param {boolean} options.strict - Whether to throw errors or use fallbacks
 * @returns {Object} Trend calculation result
 */
export function calculateTrend(data, options = {}) {
  const {
    method = 'linear',
    period = null,
    fallback = { trend: 0, direction: 'stable', confidence: 0 },
    strict = false
  } = options;

  const operation = 'calculateTrend';

  try {
    // Step 1: Safely process the input array
    const processedData = safeArrayProcess(data, {
      fallback: [],
      strict: false
    });

    if (processedData.length === 0) {
      logger.logTypeMismatch(operation, data, 'non-empty array', fallback);
      return strict ? (() => { throw new DataProcessingError(operation, data, 'non-empty array'); })() : fallback;
    }

    // Step 2: Apply period limit if specified
    const workingData = period && typeof period === 'number' && period > 0
      ? processedData.slice(-period)
      : processedData;

    // Step 3: Convert to numbers and filter out invalid values
    const numericData = workingData
      .map((item, index) => {
        const num = parseFloat(item);
        if (isNaN(num)) {
          logger.logTypeMismatch(`${operation}.parseFloat`, item, 'number', null);
          return null;
        }
        return num;
      })
      .filter(item => item !== null);

    if (numericData.length < 2) {
      logger.logTypeMismatch(operation, numericData, 'array with at least 2 numeric values', fallback);
      return strict ? (() => { throw new DataProcessingError(operation, numericData, 'array with at least 2 numeric values'); })() : fallback;
    }

    // Step 4: Calculate trend based on method
    let trendResult;

    switch (method) {
      case 'linear':
        trendResult = calculateLinearTrend(numericData);
        break;
      case 'percentage':
        trendResult = calculatePercentageTrend(numericData);
        break;
      case 'simple':
      default:
        trendResult = calculateSimpleTrend(numericData);
        break;
    }

    logger.logSuccess(operation, data, trendResult);
    return trendResult;

  } catch (error) {
    logger.logError(operation, error, data);

    if (strict) {
      throw error;
    }

    return fallback;
  }
}

/**
 * Calculate simple trend (first vs last value)
 * @param {Array<number>} data - Numeric array
 * @returns {Object} Trend result
 */
function calculateSimpleTrend(data) {
  const first = data[0];
  const last = data[data.length - 1];
  const change = last - first;
  const trend = first !== 0 ? (change / Math.abs(first)) * 100 : 0;

  return {
    trend: Math.round(trend * 100) / 100, // Round to 2 decimal places
    direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
    confidence: data.length >= 5 ? 0.8 : 0.6,
    change,
    first,
    last,
    method: 'simple'
  };
}

/**
 * Calculate percentage trend (average percentage change)
 * @param {Array<number>} data - Numeric array
 * @returns {Object} Trend result
 */
function calculatePercentageTrend(data) {
  const changes = [];

  for (let i = 1; i < data.length; i++) {
    const prev = data[i - 1];
    const curr = data[i];

    if (prev !== 0) {
      const percentChange = ((curr - prev) / Math.abs(prev)) * 100;
      changes.push(percentChange);
    }
  }

  if (changes.length === 0) {
    return {
      trend: 0,
      direction: 'stable',
      confidence: 0,
      change: 0,
      method: 'percentage'
    };
  }

  const avgChange = changes.reduce((sum, change) => sum + change, 0) / changes.length;

  return {
    trend: Math.round(avgChange * 100) / 100,
    direction: avgChange > 0.5 ? 'up' : avgChange < -0.5 ? 'down' : 'stable',
    confidence: Math.min(0.9, 0.5 + (changes.length * 0.1)),
    change: avgChange,
    method: 'percentage'
  };
}

/**
 * Calculate linear trend using least squares regression
 * @param {Array<number>} data - Numeric array
 * @returns {Object} Trend result
 */
function calculateLinearTrend(data) {
  const n = data.length;
  const x = Array.from({ length: n }, (_, i) => i);
  const y = data;

  // Calculate means
  const xMean = x.reduce((sum, val) => sum + val, 0) / n;
  const yMean = y.reduce((sum, val) => sum + val, 0) / n;

  // Calculate slope (trend)
  let numerator = 0;
  let denominator = 0;

  for (let i = 0; i < n; i++) {
    numerator += (x[i] - xMean) * (y[i] - yMean);
    denominator += (x[i] - xMean) ** 2;
  }

  const slope = denominator !== 0 ? numerator / denominator : 0;

  // Calculate correlation coefficient for confidence
  let ssxy = 0, ssxx = 0, ssyy = 0;
  for (let i = 0; i < n; i++) {
    const dx = x[i] - xMean;
    const dy = y[i] - yMean;
    ssxy += dx * dy;
    ssxx += dx * dx;
    ssyy += dy * dy;
  }

  const correlation = (ssxx !== 0 && ssyy !== 0) ? ssxy / Math.sqrt(ssxx * ssyy) : 0;
  const confidence = Math.abs(correlation);

  return {
    trend: Math.round(slope * 100) / 100,
    direction: slope > 0.1 ? 'up' : slope < -0.1 ? 'down' : 'stable',
    confidence: Math.round(confidence * 100) / 100,
    change: slope,
    correlation: Math.round(correlation * 100) / 100,
    method: 'linear'
  };
}

/**
 * Safely get array length with fallback
 * @param {*} data - Input data
 * @param {number} fallback - Fallback length (default: 0)
 * @returns {number} Array length or fallback
 */
export function safeArrayLength(data, fallback = 0) {
  const operation = 'safeArrayLength';

  try {
    if (Array.isArray(data)) {
      return data.length;
    }

    if (data && typeof data === 'object' && typeof data.length === 'number') {
      return data.length;
    }

    logger.logTypeMismatch(operation, data, 'array or object with length', fallback);
    return fallback;

  } catch (error) {
    logger.logError(operation, error, data);
    return fallback;
  }
}

/**
 * Safely access array element with fallback
 * @param {*} data - Input data
 * @param {number} index - Array index
 * @param {*} fallback - Fallback value
 * @returns {*} Array element or fallback
 */
export function safeArrayAccess(data, index, fallback = null) {
  const operation = 'safeArrayAccess';

  try {
    if (!Array.isArray(data)) {
      logger.logTypeMismatch(operation, data, 'array', fallback);
      return fallback;
    }

    if (typeof index !== 'number' || index < 0 || index >= data.length) {
      logger.logTypeMismatch(operation, index, `valid array index (0-${data.length - 1})`, fallback);
      return fallback;
    }

    return data[index];

  } catch (error) {
    logger.logError(operation, error, { data, index });
    return fallback;
  }
}

/**
 * Safely find element in array with fallback
 * @param {*} data - Input data
 * @param {Function} predicate - Find predicate function
 * @param {*} fallback - Fallback value
 * @returns {*} Found element or fallback
 */
export function safeFindInArray(data, predicate, fallback = null) {
  const operation = 'safeFindInArray';

  try {
    if (!Array.isArray(data)) {
      logger.logTypeMismatch(operation, data, 'array', fallback);
      return fallback;
    }

    if (typeof predicate !== 'function') {
      logger.logTypeMismatch(operation, predicate, 'function', fallback);
      return fallback;
    }

    const result = data.find(predicate);
    return result !== undefined ? result : fallback;

  } catch (error) {
    logger.logError(operation, error, { data, predicate });
    return fallback;
  }
}

/**
 * Initialize data processing logging (call this in your app initialization)
 */
export function initializeDataProcessingLogging() {
  if (typeof window !== 'undefined') {
    window.dataProcessingLogs = window.dataProcessingLogs || [];

    // Optionally clear old logs periodically
    setInterval(() => {
      if (window.dataProcessingLogs && window.dataProcessingLogs.length > 1000) {
        window.dataProcessingLogs = window.dataProcessingLogs.slice(-500); // Keep last 500 logs
      }
    }, 60000); // Check every minute
  }
}

/**
 * Get data processing logs for debugging
 * @returns {Array} Array of log entries
 */
export function getDataProcessingLogs() {
  if (typeof window !== 'undefined' && window.dataProcessingLogs) {
    return [...window.dataProcessingLogs];
  }
  return [];
}

/**
 * Clear data processing logs
 */
export function clearDataProcessingLogs() {
  if (typeof window !== 'undefined') {
    window.dataProcessingLogs = [];
  }
}

// Export the logger for external use
export { logger as dataProcessingLogger };

// Export error class
export { DataProcessingError };

// Default export with all functions
export default {
  safeArrayProcess,
  calculateTrend,
  safeArrayLength,
  safeArrayAccess,
  safeFindInArray,
  initializeDataProcessingLogging,
  getDataProcessingLogs,
  clearDataProcessingLogs,
  logger,
  DataProcessingError
};