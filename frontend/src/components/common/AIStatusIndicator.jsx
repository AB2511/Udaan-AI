/**
 * AI Status Indicator Component
 * Shows current AI service health status and provides recovery options
 */

import React, { useState } from 'react';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  Zap, 
  Settings,
  ChevronDown,
  ChevronUp,
  Brain,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useAIStatus } from '../../hooks/useAIStatus';
import { useToast } from '../../context/ToastContext';
import aiStatusService from '../../services/aiStatusService';

const AIStatusIndicator = ({ 
  showDetails = false, 
  showRecoveryOptions = true,
  className = '' 
}) => {
  const { 
    status, 
    isLoading, 
    isHealthy, 
    degradationLevel, 
    statusMessage, 
    refresh 
  } = useAIStatus();
  
  const { showToast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const getStatusIcon = () => {
    if (isLoading) {
      return <RefreshCw className="h-4 w-4 animate-spin text-gray-500" />;
    }

    if (isHealthy) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }

    if (degradationLevel === 'partial') {
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }

    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getStatusColor = () => {
    if (isLoading) return 'text-gray-500';
    if (isHealthy) return 'text-green-600';
    if (degradationLevel === 'partial') return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusText = () => {
    if (isLoading) return 'Checking...';
    if (isHealthy) return 'AI Service Healthy';
    if (degradationLevel === 'partial') return 'AI Service Degraded';
    return 'AI Service Unavailable';
  };

  const handleRecovery = async () => {
    setIsRecovering(true);
    
    try {
      const result = await aiStatusService.attemptRecovery();
      
      if (result.success) {
        showToast('AI service recovery successful', 'success');
        await refresh();
      } else {
        showToast(`Recovery failed: ${result.error}`, 'error');
      }
    } catch (error) {
      showToast('Recovery attempt failed', 'error');
    } finally {
      setIsRecovering(false);
    }
  };

  const handleReset = async () => {
    setIsResetting(true);
    
    try {
      const result = await aiStatusService.resetHealthMonitor();
      
      if (result.success) {
        showToast('Health monitor reset successfully', 'success');
        await refresh();
      } else {
        showToast(`Reset failed: ${result.error}`, 'error');
      }
    } catch (error) {
      showToast('Reset attempt failed', 'error');
    } finally {
      setIsResetting(false);
    }
  };

  const handleRefresh = async () => {
    try {
      await refresh();
      showToast('Status refreshed', 'info');
    } catch (error) {
      showToast('Failed to refresh status', 'error');
    }
  };

  if (!showDetails && isHealthy) {
    // Minimal indicator when healthy
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        {getStatusIcon()}
        <span className="text-sm text-green-600">AI Ready</span>
      </div>
    );
  }

  return (
    <div className={`bg-white border rounded-lg shadow-sm ${className}`}>
      <div 
        className="flex items-center justify-between p-3 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          {getStatusIcon()}
          <div>
            <div className={`text-sm font-medium ${getStatusColor()}`}>
              {getStatusText()}
            </div>
            {statusMessage && (
              <div className="text-xs text-gray-500">
                {statusMessage.message}
              </div>
            )}
          </div>
        </div>
        
        {showDetails && (
          <div className="flex items-center space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRefresh();
              }}
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
              title="Refresh status"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            )}
          </div>
        )}
      </div>

      {isExpanded && showDetails && (
        <div className="border-t px-3 py-3 space-y-3">
          {/* Status Details */}
          {status && (
            <div className="text-xs text-gray-600 space-y-1">
              <div>Last Updated: {new Date(status.timestamp).toLocaleTimeString()}</div>
              {status.services?.aiService && (
                <>
                  <div>Success Rate: {status.services.aiService.successRate?.toFixed(1) || 0}%</div>
                  <div>Response Time: {status.services.aiService.averageResponseTime?.toFixed(0) || 0}ms</div>
                  {status.services.aiService.consecutiveFailures > 0 && (
                    <div className="text-red-600">
                      Consecutive Failures: {status.services.aiService.consecutiveFailures}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Recovery Options */}
          {showRecoveryOptions && !isHealthy && (
            <div className="space-y-2">
              <div className="text-xs font-medium text-gray-700 mb-2">
                Recovery Options:
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={handleRecovery}
                  disabled={isRecovering}
                  className="flex-1 flex items-center justify-center px-3 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRecovering ? (
                    <>
                      <RefreshCw className="animate-spin mr-1 h-3 w-3" />
                      Recovering...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-1 h-3 w-3" />
                      Recover
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleReset}
                  disabled={isResetting}
                  className="flex-1 flex items-center justify-center px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isResetting ? (
                    <>
                      <RefreshCw className="animate-spin mr-1 h-3 w-3" />
                      Resetting...
                    </>
                  ) : (
                    <>
                      <Settings className="mr-1 h-3 w-3" />
                      Reset
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Recommendations */}
          {statusMessage?.details && (
            <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
              <div className="font-medium mb-1">Details:</div>
              <div>{statusMessage.details}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIStatusIndicator;