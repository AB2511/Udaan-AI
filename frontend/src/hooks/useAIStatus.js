/**
 * useAIStatus Hook
 * React hook for monitoring AI service status and handling errors
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import aiStatusService from '../services/aiStatusService';

export const useAIStatus = (options = {}) => {
  const {
    autoStart = true,
    monitoringInterval = 60000,
    onStatusChange = null
  } = options;

  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const unsubscribeRef = useRef(null);

  // Handle status updates from the service
  const handleStatusUpdate = useCallback((newStatus) => {
    setStatus(newStatus);
    setLastUpdated(new Date());
    setIsLoading(false);
    setError(null);
    
    if (onStatusChange) {
      onStatusChange(newStatus);
    }
  }, [onStatusChange]);

  // Initialize monitoring
  useEffect(() => {
    if (autoStart) {
      // Subscribe to status updates
      unsubscribeRef.current = aiStatusService.addStatusListener(handleStatusUpdate);
      
      // Start monitoring
      aiStatusService.startMonitoring(monitoringInterval);
      
      // Get initial status
      aiStatusService.getHealthStatus()
        .then(handleStatusUpdate)
        .catch((err) => {
          setError(err.message);
          setIsLoading(false);
        });
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      if (autoStart) {
        aiStatusService.stopMonitoring();
      }
    };
  }, [autoStart, monitoringInterval, handleStatusUpdate]);

  // Manual refresh function
  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newStatus = await aiStatusService.getHealthStatus(false);
      handleStatusUpdate(newStatus);
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  }, [handleStatusUpdate]);

  // Test AI connection
  const testConnection = useCallback(async () => {
    try {
      const result = await aiStatusService.testConnection();
      return result;
    } catch (err) {
      console.error('Connection test failed:', err);
      return null;
    }
  }, []);

  // Get user-friendly status message
  const getStatusMessage = useCallback(() => {
    return aiStatusService.getStatusMessage();
  }, []);

  // Check if AI service is healthy
  const isHealthy = useCallback(() => {
    return aiStatusService.isAIServiceHealthy();
  }, []);

  // Get degradation level
  const getDegradationLevel = useCallback(() => {
    return aiStatusService.getAIDegradationLevel();
  }, []);

  // Check if fallback should be suggested
  const shouldSuggestFallback = useCallback(() => {
    return aiStatusService.shouldSuggestFallback();
  }, []);

  // Handle AI operation errors
  const handleAIError = useCallback((error, context = {}) => {
    return aiStatusService.handleAIError(error, context);
  }, []);

  // Attempt recovery
  const attemptRecovery = useCallback(async () => {
    try {
      const result = await aiStatusService.attemptRecovery();
      if (result.success) {
        await refresh();
      }
      return result;
    } catch (err) {
      console.error('Recovery attempt failed:', err);
      return { success: false, error: err.message };
    }
  }, [refresh]);

  // Reset health monitor
  const resetHealthMonitor = useCallback(async () => {
    try {
      const result = await aiStatusService.resetHealthMonitor();
      if (result.success) {
        await refresh();
      }
      return result;
    } catch (err) {
      console.error('Health monitor reset failed:', err);
      return { success: false, error: err.message };
    }
  }, [refresh]);

  // Get diagnostics
  const getDiagnostics = useCallback(async () => {
    try {
      return await aiStatusService.getDiagnostics();
    } catch (err) {
      console.error('Failed to get diagnostics:', err);
      return null;
    }
  }, []);

  // Execute operation with fallback
  const executeWithFallback = useCallback(async (operation, context = {}) => {
    try {
      return await aiStatusService.executeWithFallback(operation, context);
    } catch (err) {
      return handleAIError(err, context);
    }
  }, [handleAIError]);

  return {
    // Status data
    status,
    isLoading,
    error,
    lastUpdated,
    
    // Status checks
    isHealthy: isHealthy(),
    degradationLevel: getDegradationLevel(),
    shouldSuggestFallback: shouldSuggestFallback(),
    statusMessage: getStatusMessage(),
    
    // Actions
    refresh,
    testConnection,
    handleAIError,
    attemptRecovery,
    resetHealthMonitor,
    getDiagnostics,
    executeWithFallback
  };
};

export default useAIStatus;