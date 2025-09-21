import React from 'react';

const ResponsiveContainer = ({ 
  children, 
  className = '',
  maxWidth = '7xl', // 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl'
  padding = 'default', // 'none', 'sm', 'default', 'lg'
  center = true
}) => {
  const getMaxWidthClass = () => {
    const widths = {
      'sm': 'max-w-sm',
      'md': 'max-w-md',
      'lg': 'max-w-lg',
      'xl': 'max-w-xl',
      '2xl': 'max-w-2xl',
      '3xl': 'max-w-3xl',
      '4xl': 'max-w-4xl',
      '5xl': 'max-w-5xl',
      '6xl': 'max-w-6xl',
      '7xl': 'max-w-7xl'
    };
    return widths[maxWidth] || widths['7xl'];
  };

  const getPaddingClass = () => {
    const paddings = {
      'none': '',
      'sm': 'px-4 sm:px-6',
      'default': 'px-4 sm:px-6 lg:px-8',
      'lg': 'px-6 sm:px-8 lg:px-12'
    };
    return paddings[padding] || paddings['default'];
  };

  const centerClass = center ? 'mx-auto' : '';

  return (
    <div className={`${getMaxWidthClass()} ${centerClass} ${getPaddingClass()} ${className}`}>
      {children}
    </div>
  );
};

// Preset containers for common layouts
export const PageContainer = ({ children, className = '' }) => (
  <ResponsiveContainer maxWidth="7xl" padding="default" className={`min-h-screen ${className}`}>
    {children}
  </ResponsiveContainer>
);

export const ContentContainer = ({ children, className = '' }) => (
  <ResponsiveContainer maxWidth="4xl" padding="default" className={className}>
    {children}
  </ResponsiveContainer>
);

export const FormContainer = ({ children, className = '' }) => (
  <ResponsiveContainer maxWidth="md" padding="sm" className={className}>
    {children}
  </ResponsiveContainer>
);

export const WideContainer = ({ children, className = '' }) => (
  <ResponsiveContainer maxWidth="6xl" padding="lg" className={className}>
    {children}
  </ResponsiveContainer>
);

export default ResponsiveContainer;