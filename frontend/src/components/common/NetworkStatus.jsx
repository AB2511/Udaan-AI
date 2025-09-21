import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { checkApiHealth } from '../../services/api';

/**
 * Network status indicator component
 * Shows connection status and API health
 */
const NetworkStatus = ({ showIndicator = true, showToasts = true }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [apiHealthy, setApiHealthy] = useState(true);
  const [lastChecked, setLastChecked] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (showToasts) {
        showToast('Connection restored', 'success', 3000);
      }
      checkHealth();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setApiHealthy(false);
      if (showToasts) {
        showToast('Connection lost', 'error', 5000);
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial health check
    checkHealth();

    // Periodic health checks
    const healthCheckInterval = setInterval(checkHealth, 30000); // Every 30 seconds

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(healthCheckInterval);
    };
  }, [showToasts]);

  const checkHealth = async () => {
    if (!isOnline) return;

    setIsChecking(true);
    try {
      const health = await checkApiHealth();
      setApiHealthy(health.healthy);
      setLastChecked(new Date());
      
      if (!health.healthy && showToasts) {
        showToast('API service unavailable', 'warning', 4000);
      }
    } catch (error) {
      setApiHealthy(false);
      console.warn('Health check failed:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const getStatusInfo = () => {
    if (!isOnline) {
      return {
        status: 'offline',
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        icon: WifiOff,
        message: 'No internet connection'
      };
    }

    if (!apiHealthy) {
      return {
        status: 'api-down',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        icon: AlertTriangle,
        message: 'API service unavailable'
      };
    }

    return {
      status: 'online',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      icon: Wifi,
      message: 'Connected'
    };
  };

  if (!showIndicator) {
    return null;
  }

  const statusInfo = getStatusInfo();
  const IconComponent = statusInfo.icon;

  // Only show indicator when there are issues
  if (statusInfo.status === 'online') {
    return null;
  }

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className={`flex items-center px-3 py-2 rounded-full shadow-lg border ${statusInfo.bgColor} border-opacity-50`}>
        <IconComponent className={`h-4 w-4 ${statusInfo.color} mr-2`} />
        <span className={`text-sm font-medium ${statusInfo.color}`}>
          {statusInfo.message}
        </span>
        {isChecking && (
          <div className="ml-2 w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin opacity-60"></div>
        )}
        {lastChecked && statusInfo.status !== 'offline' && (
          <span className="ml-2 text-xs opacity-60">
            Last checked: {lastChecked.toLocaleTimeString()}
          </span>
        )}
      </div>
    </div>
  );
};

/**
 * Hook for accessing network status
 */
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [apiHealthy, setApiHealthy] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const checkHealth = async () => {
    try {
      const health = await checkApiHealth();
      setApiHealthy(health.healthy);
      return health;
    } catch (error) {
      setApiHealthy(false);
      return { healthy: false, error: error.message };
    }
  };

  return {
    isOnline,
    apiHealthy,
    checkHealth,
    isConnected: isOnline && apiHealthy
  };
};

export default NetworkStatus;