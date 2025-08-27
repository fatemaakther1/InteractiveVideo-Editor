import React from 'react';

export interface ToggleProps {
  id?: string;
  label?: string;
  description?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'danger';
  className?: string;
}

const Toggle: React.FC<ToggleProps> = ({
  id,
  label,
  description,
  checked = false,
  onChange,
  disabled = false,
  size = 'md',
  variant = 'default',
  className = '',
}) => {
  const toggleId = id || `toggle-${Math.random().toString(36).substr(2, 9)}`;

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return { container: 'w-8 h-5', thumb: 'w-3 h-3', translate: 'translate-x-3' };
      case 'md':
        return { container: 'w-12 h-6', thumb: 'w-4 h-4', translate: 'translate-x-6' };
      case 'lg':
        return { container: 'w-16 h-8', thumb: 'w-6 h-6', translate: 'translate-x-8' };
      default:
        return { container: 'w-12 h-6', thumb: 'w-4 h-4', translate: 'translate-x-6' };
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'success':
        return 'peer-checked:bg-green-600';
      case 'warning':
        return 'peer-checked:bg-amber-600';
      case 'danger':
        return 'peer-checked:bg-red-600';
      default:
        return 'peer-checked:bg-primary-600';
    }
  };

  const handleToggle = () => {
    if (!disabled && onChange) {
      onChange(!checked);
    }
  };

  const sizeClasses = getSizeClasses();
  const variantClasses = getVariantClasses();

  return (
    <div className={`flex items-start space-x-3 ${className}`}>
      <div className="relative">
        <input
          type="checkbox"
          id={toggleId}
          className="sr-only peer"
          checked={checked}
          onChange={handleToggle}
          disabled={disabled}
        />
        <label
          htmlFor={toggleId}
          className={`
            relative flex cursor-pointer items-center justify-center rounded-full 
            bg-secondary-300 p-1 text-secondary-600 transition-colors duration-300 
            ${variantClasses} peer-checked:text-white ${sizeClasses.container}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-secondary-400'}
          `}
        >
          <div
            className={`
              absolute left-1 ${sizeClasses.thumb} bg-white rounded-full 
              transition-transform duration-300 
              ${checked ? sizeClasses.translate : 'translate-x-0'}
            `}
          />
        </label>
      </div>
      
      {(label || description) && (
        <div className="flex-1">
          {label && (
            <label 
              htmlFor={toggleId} 
              className={`text-sm font-medium text-secondary-700 block cursor-pointer ${disabled ? 'opacity-50' : ''}`}
            >
              {label}
            </label>
          )}
          {description && (
            <p className={`text-xs text-secondary-500 mt-1 ${disabled ? 'opacity-50' : ''}`}>
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Toggle;
