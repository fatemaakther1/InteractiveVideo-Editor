import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: string;
  variant?: 'default' | 'filled' | 'bordered';
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  variant = 'default',
  className = '',
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  const getVariantClasses = () => {
    switch (variant) {
      case 'filled':
        return 'bg-secondary-50 border-secondary-200 focus:bg-white focus:border-primary-500';
      case 'bordered':
        return 'bg-white border-2 border-secondary-300 focus:border-primary-500';
      default:
        return 'bg-secondary-50 border border-secondary-200 focus:border-primary-500';
    }
  };

  const baseClasses = 'w-full px-4 py-3 rounded-xl focus:ring-2 focus:ring-primary-500 transition-all duration-200 text-secondary-900 placeholder-secondary-500';
  const variantClasses = getVariantClasses();
  const errorClasses = error ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : '';
  const iconClasses = icon ? 'pl-10' : '';

  return (
    <div className="relative">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-bold text-secondary-800 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400">
            <i className={icon} />
          </div>
        )}
        <input
          id={inputId}
          className={`${baseClasses} ${variantClasses} ${errorClasses} ${iconClasses} ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p className="text-red-600 text-sm mt-1 flex items-center">
          <i className="fas fa-exclamation-circle mr-1" />
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
