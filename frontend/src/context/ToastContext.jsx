import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import Toast from '../components/Toast';
import { registerToastCallback } from '../services/api';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((messageOrToast, type, duration) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    
    // Handle both object and individual parameters
    const toast = typeof messageOrToast === 'object' 
      ? messageOrToast 
      : { message: messageOrToast, type, duration };
    
    setToasts((prev) => {
      const newToasts = [...prev, { id, ...toast }];
      // Limit to maximum of 5 toasts
      return newToasts.slice(-5);
    });
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Convenience methods for common toast types
  const showSuccess = useCallback((message, duration = 5000) => {
    return addToast({ message, type: 'success', duration });
  }, [addToast]);

  const showError = useCallback((message, duration = 5000) => {
    return addToast({ message, type: 'error', duration });
  }, [addToast]);

  // Generic showToast method for backward compatibility
  const showToast = useCallback((message, type = 'info', duration = 5000) => {
    return addToast({ message, type, duration });
  }, [addToast]);

  // Register global callback once (addToast is stable via useCallback)
  useEffect(() => {
    registerToastCallback((toast) => {
      // accept toast object {message, type, duration}
      addToast(toast);
    });
    // unregister not necessary for this simple module-level callback, but could be implemented
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast, toasts, showSuccess, showError, showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <Toast
            key={t.id}
            id={t.id}
            message={t.message || "Notification"}
            type={t.type}
            duration={t.duration}
            removeToast={removeToast}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};