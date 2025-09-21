import React from 'react';

const Button = ({
  children,
  variant = 'primary', // 'primary', 'secondary', 'ghost', 'danger'
  size = 'medium', // 'small', 'medium', 'large'
  fullWidth = false,
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left', // 'left', 'right'
  className = '',
  onClick,
  type = 'button',
  ...props
}) => {
  const getVariantClasses = () => {
    const variants = {
      primary: 'btn-primary',
      secondary: 'btn-secondary',
      ghost: 'btn-ghost',
      danger: 'bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700'
    };
    return variants[variant] || variants.primary;
  };

  const getSizeClasses = () => {
    const sizes = {
      small: 'px-3 py-2 text-sm',
      medium: 'px-4 py-2.5 text-sm',
      large: 'px-6 py-3 text-base'
    };
    return sizes[size] || sizes.medium;
  };

  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  const variantClasses = getVariantClasses();
  const sizeClasses = getSizeClasses();
  const widthClasses = fullWidth ? 'w-full mobile-full' : '';
  const disabledClasses = (disabled || loading) ? 'opacity-50 cursor-not-allowed' : '';

  const renderIcon = () => {
    if (loading) {
      return (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      );
    }
    return icon;
  };

  const renderContent = () => {
    if (loading) {
      return (
        <>
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
          {typeof children === 'string' ? 'Loading...' : children}
        </>
      );
    }

    if (icon && iconPosition === 'left') {
      return (
        <>
          <span className="mr-2">{icon}</span>
          {children}
        </>
      );
    }

    if (icon && iconPosition === 'right') {
      return (
        <>
          {children}
          <span className="ml-2">{icon}</span>
        </>
      );
    }

    return children;
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${widthClasses} ${disabledClasses} ${className}`}
      {...props}
    >
      {renderContent()}
    </button>
  );
};

// Preset button components
export const PrimaryButton = ({ children, ...props }) => (
  <Button variant="primary" {...props}>
    {children}
  </Button>
);

export const SecondaryButton = ({ children, ...props }) => (
  <Button variant="secondary" {...props}>
    {children}
  </Button>
);

export const GhostButton = ({ children, ...props }) => (
  <Button variant="ghost" {...props}>
    {children}
  </Button>
);

export const DangerButton = ({ children, ...props }) => (
  <Button variant="danger" {...props}>
    {children}
  </Button>
);

export const LoadingButton = ({ children, loading = true, ...props }) => (
  <Button loading={loading} {...props}>
    {children}
  </Button>
);

export default Button;