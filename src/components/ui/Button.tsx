import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  loading?: boolean;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white shadow-medium hover:shadow-large';
      case 'secondary':
        return 'bg-secondary-100 hover:bg-secondary-200 text-secondary-700 border border-secondary-300 hover:border-secondary-400';
      case 'accent':
        return 'bg-gradient-to-r from-accent-600 to-accent-700 hover:from-accent-700 hover:to-accent-800 text-white shadow-medium hover:shadow-large';
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 text-white shadow-medium hover:shadow-large';
      case 'ghost':
        return 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50';
      default:
        return 'bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white shadow-medium hover:shadow-large';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-2 text-sm';
      case 'md':
        return 'px-4 py-2.5 text-sm';
      case 'lg':
        return 'px-6 py-3 text-base';
      default:
        return 'px-4 py-2.5 text-sm';
    }
  };

  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none';
  const variantClasses = getVariantClasses();
  const sizeClasses = getSizeClasses();
  const widthClasses = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${widthClasses} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
      )}
      {icon && !loading && (
        <i className={`${icon} mr-2`} />
      )}
      {children}
    </button>
  );
};

export default Button;
