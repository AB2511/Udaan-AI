import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

// Simple inline icons for test expectations
const icons = {
  success: (
    <svg viewBox="0 0 24 24" className="w-4 h-4 text-green-600 mr-2">
      <path fill="currentColor" d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg viewBox="0 0 24 24" className="w-4 h-4 text-red-600 mr-2">
      <path fill="currentColor" d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm5 13l-1.4 1.4L12 13.4l-3.6 3.6L7 15l3.6-3.6L7 7.8 8.4 6.4 12 10l3.6-3.6 1.4 1.4L13.4 12l3.6 3.6z" />
    </svg>
  ),
  warning: (
    <svg viewBox="0 0 24 24" className="w-4 h-4 text-yellow-600 mr-2">
      <path fill="currentColor" d="M1 21h22L12 2 1 21zm12-3h-2v2h2v-2zm0-8h-2v6h2v-6z" />
    </svg>
  ),
  info: (
    <svg viewBox="0 0 24 24" className="w-4 h-4 text-blue-600 mr-2">
      <path fill="currentColor" d="M11 9h2V7h-2v2zm1-7C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm1 15h-2v-6h2v6z" />
    </svg>
  ),
};

const Toast = ({ 
  id, 
  message = "Something happened", 
  type = "info", 
  duration = 5000, 
  removeToast 
}) => {
  // Prop validation - log errors but still render
  if (!id) {
    console.error('Toast component: id prop is required');
  }
  
  if (typeof removeToast !== 'function') {
    console.error('Toast component: removeToast prop must be a function');
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (removeToast) removeToast(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, removeToast]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`toast p-3 rounded shadow-sm flex items-center justify-between max-w-sm ${
        type === 'success'
          ? 'bg-green-50'
          : type === 'error'
          ? 'bg-red-50'
          : type === 'warning'
          ? 'bg-yellow-50'
          : 'bg-blue-50'
      }`}
    >
      <div className="flex items-center flex-1 text-sm text-gray-800">
        {icons[type]}
        {message}
      </div>
      <button
        aria-label="close toast"
        className="ml-3 text-gray-500 hover:text-gray-700"
        onClick={() => removeToast && removeToast(id)}
      >
        ×
      </button>
    </div>
  );
};

Toast.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  message: PropTypes.string,
  type: PropTypes.string,
  duration: PropTypes.number,
  removeToast: PropTypes.func.isRequired,
};

// Default props are now handled by JavaScript default parameters above

export default Toast;