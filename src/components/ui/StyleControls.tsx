import React, { useState, useRef, useEffect, memo, useCallback } from 'react';
import { debounce, isValidHexColor, getContrastColor } from '../../utils/styleUtils';
import type { InteractiveElement } from '../../types';

// Enhanced Color Picker Component
interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  onPreview?: (color: string) => void;
  onPreviewEnd?: () => void;
  label: string;
  placeholder?: string;
}

export const ColorPicker = memo<ColorPickerProps>(({ 
  value, 
  onChange, 
  onPreview, 
  onPreviewEnd, 
  label, 
  placeholder = '#000000' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value || placeholder);
  const inputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Debounced change handler
  const debouncedOnChange = useCallback(debounce(onChange, 300), [onChange]);
  
  // Common colors palette
  const commonColors = [
    '#000000', '#ffffff', '#ef4444', '#f97316', '#eab308',
    '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899',
    '#64748b', '#dc2626', '#ea580c', '#ca8a04', '#16a34a',
    '#0891b2', '#2563eb', '#7c3aed', '#db2777', '#475569'
  ];

  useEffect(() => {
    setInputValue(value || placeholder);
  }, [value, placeholder]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        onPreviewEnd?.();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onPreviewEnd]);

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue);
    if (isValidHexColor(newValue)) {
      onPreview?.(newValue);
      debouncedOnChange(newValue);
    }
  };

  const handleColorSelect = (color: string) => {
    setInputValue(color);
    onChange(color);
    setIsOpen(false);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        <div className="flex items-center space-x-3">
          {/* Color preview button */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="w-12 h-10 border-2 border-gray-200 rounded-xl cursor-pointer shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden"
            style={{ backgroundColor: inputValue }}
          >
            <div 
              className="absolute inset-0" 
              style={{
                background: `linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)`,
                backgroundSize: '8px 8px',
                backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px'
              }}
            />
            <div 
              className="absolute inset-0" 
              style={{ backgroundColor: inputValue || placeholder }}
            />
          </button>

          {/* Hex input */}
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => onPreview?.(inputValue)}
            onBlur={onPreviewEnd}
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            placeholder={placeholder}
          />
        </div>

        {/* Color palette popover */}
        {isOpen && (
          <div 
            ref={popoverRef}
            className="absolute top-full mt-2 left-0 z-50 bg-white border border-gray-200 rounded-xl shadow-xl p-4 min-w-[280px]"
          >
            <div className="grid grid-cols-10 gap-2 mb-3">
              {commonColors.map((color) => (
                <button
                  key={color}
                  onClick={() => handleColorSelect(color)}
                  onMouseEnter={() => onPreview?.(color)}
                  className="w-6 h-6 rounded-md border-2 border-gray-200 hover:border-gray-400 transition-all duration-200 relative overflow-hidden"
                  style={{ backgroundColor: color }}
                >
                  {color === inputValue && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <i className={`fas fa-check text-xs ${getContrastColor(color) === '#ffffff' ? 'text-white' : 'text-black'}`} />
                    </div>
                  )}
                </button>
              ))}
            </div>
            
            {/* Native color picker */}
            <input
              type="color"
              value={inputValue}
              onChange={(e) => handleColorSelect(e.target.value)}
              className="w-full h-8 border border-gray-200 rounded-lg cursor-pointer"
            />
          </div>
        )}
      </div>
    </div>
  );
});

// Enhanced Range Slider Component
interface RangeSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
  onPreview?: (value: number) => void;
  onPreviewEnd?: () => void;
  className?: string;
  gradientTrack?: boolean;
}

export const RangeSlider = memo<RangeSliderProps>(({ 
  label, 
  value, 
  min, 
  max, 
  step = 1, 
  unit = '', 
  onChange, 
  onPreview,
  onPreviewEnd,
  className = '',
  gradientTrack = false
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  const debouncedOnChange = useCallback(debounce(onChange, 150), [onChange]);

  const handleChange = (newValue: number) => {
    setTempValue(newValue);
    onPreview?.(newValue);
    debouncedOnChange(newValue);
  };

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    onChange(tempValue);
    onPreviewEnd?.();
  };

  const progress = ((tempValue - min) / (max - min)) * 100;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className="text-sm font-mono text-gray-600 min-w-[4rem] text-right">
          {tempValue}{unit}
        </span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={tempValue}
          onChange={(e) => handleChange(parseFloat(e.target.value))}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchEnd={handleMouseUp}
          className={`w-full h-3 rounded-lg appearance-none cursor-pointer transition-all duration-200 ${
            gradientTrack ? 'bg-transparent' : 'bg-gray-200'
          }`}
          style={gradientTrack ? {
            background: `linear-gradient(to right, 
              rgba(59, 130, 246, 0.3) 0%, 
              rgba(59, 130, 246, 0.8) ${progress}%, 
              rgba(156, 163, 175, 0.3) ${progress}%, 
              rgba(156, 163, 175, 0.3) 100%)`
          } : {}}
        />
        
        {/* Custom thumb styles are handled by CSS */}
        <style dangerouslySetInnerHTML={{
          __html: `
            input[type="range"]::-webkit-slider-thumb {
              appearance: none;
              width: 20px;
              height: 20px;
              border-radius: 50%;
              background: ${isDragging ? '#1d4ed8' : '#3b82f6'};
              border: 3px solid white;
              box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
              cursor: pointer;
              transition: all 0.2s ease-in-out;
            }
            
            input[type="range"]::-webkit-slider-thumb:hover {
              background: #1d4ed8;
              transform: scale(1.1);
              box-shadow: 0 6px 16px rgba(59, 130, 246, 0.5);
            }
            
            input[type="range"]::-moz-range-thumb {
              width: 20px;
              height: 20px;
              border-radius: 50%;
              background: ${isDragging ? '#1d4ed8' : '#3b82f6'};
              border: 3px solid white;
              box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
              cursor: pointer;
              transition: all 0.2s ease-in-out;
            }
          `
        }} />
      </div>
    </div>
  );
});

// Toggle Button Group Component
interface ToggleGroupProps {
  label: string;
  value: string;
  options: Array<{
    value: string;
    label: string;
    icon?: string;
  }>;
  onChange: (value: string) => void;
  onPreview?: (value: string) => void;
  onPreviewEnd?: () => void;
  className?: string;
}

export const ToggleGroup = memo<ToggleGroupProps>(({ 
  label, 
  value, 
  options, 
  onChange, 
  onPreview,
  onPreviewEnd,
  className = '' 
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
        {options.map(({ value: optionValue, label: optionLabel, icon }) => (
          <button
            key={optionValue}
            onClick={() => onChange(optionValue)}
            onMouseEnter={() => onPreview?.(optionValue)}
            onMouseLeave={onPreviewEnd}
            className={`px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 flex items-center justify-center space-x-1 ${
              value === optionValue
                ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-300'
                : 'bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600'
            }`}
          >
            {icon && <i className={`fas ${icon}`} />}
            <span>{optionLabel}</span>
          </button>
        ))}
      </div>
    </div>
  );
});

// Enhanced Select Component
interface SelectProps {
  label: string;
  value: string;
  options: Array<{
    value: string;
    label: string;
    style?: React.CSSProperties;
  }>;
  onChange: (value: string) => void;
  onPreview?: (value: string) => void;
  onPreviewEnd?: () => void;
  className?: string;
}

export const Select = memo<SelectProps>(({ 
  label, 
  value, 
  options, 
  onChange, 
  onPreview,
  onPreviewEnd,
  className = '' 
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => onPreview?.(value)}
        onBlur={onPreviewEnd}
        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm transition-all duration-200 hover:border-gray-300"
      >
        {options.map((option) => (
          <option 
            key={option.value} 
            value={option.value} 
            style={option.style}
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
});

// Format Toggle Button Component
interface FormatButtonProps {
  isActive: boolean;
  onClick: () => void;
  onPreview?: () => void;
  onPreviewEnd?: () => void;
  icon: string;
  title: string;
  shortcut?: string;
}

export const FormatButton = memo<FormatButtonProps>(({ 
  isActive, 
  onClick, 
  onPreview,
  onPreviewEnd,
  icon, 
  title, 
  shortcut 
}) => {
  return (
    <button
      onClick={onClick}
      onMouseEnter={onPreview}
      onMouseLeave={onPreviewEnd}
      className={`group p-3 rounded-xl transition-all duration-200 transform hover:scale-105 relative ${
        isActive
          ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-300 shadow-sm'
          : 'bg-gray-50 text-gray-600 hover:bg-blue-50 hover:text-blue-600'
      }`}
      title={`${title}${shortcut ? ` (${shortcut})` : ''}`}
    >
      <i className={`fas ${icon}`} />
      
      {/* Tooltip */}
      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
        {title}
        {shortcut && <span className="text-gray-300 ml-1">({shortcut})</span>}
      </div>
    </button>
  );
});

// Preset Card Component
interface PresetCardProps {
  preset: {
    id: string;
    name: string;
    styles: Partial<InteractiveElement>;
  };
  onApply: () => void;
  onDelete: () => void;
  onPreview?: () => void;
  onPreviewEnd?: () => void;
}

export const PresetCard = memo<PresetCardProps>(({ 
  preset, 
  onApply, 
  onDelete, 
  onPreview,
  onPreviewEnd 
}) => {
  return (
    <div 
      className="group p-3 bg-gray-50 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
      onMouseEnter={onPreview}
      onMouseLeave={onPreviewEnd}
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-semibold text-gray-800 truncate">{preset.name}</h4>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 text-xs transition-all duration-200"
        >
          <i className="fas fa-trash" />
        </button>
      </div>
      
      {/* Style preview */}
      <div className="mb-3 p-2 bg-white rounded-lg border border-gray-100 text-xs">
        <div 
          className="truncate"
          style={{
            fontFamily: preset.styles.fontFamily || 'Inter',
            fontSize: `${Math.min(preset.styles.fontSize || 14, 12)}px`,
            color: preset.styles.color || '#000000',
            fontWeight: preset.styles.fontWeight || 'normal'
          }}
        >
          Sample Text
        </div>
      </div>
      
      <button
        onClick={onApply}
        className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-all duration-200"
      >
        Apply Preset
      </button>
    </div>
  );
});

// Collapsible Section with better performance
interface CollapsibleSectionProps {
  id: string;
  title: string;
  icon: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
}

export const CollapsibleSection = memo<CollapsibleSectionProps>(({ 
  id, 
  title, 
  icon, 
  children, 
  defaultOpen = false,
  onToggle 
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const handleToggle = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    onToggle?.(newIsOpen);
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-sm">
      <button
        onClick={handleToggle}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50/50 rounded-t-2xl transition-colors duration-200"
      >
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white">
            <i className={`fas ${icon} text-sm`} />
          </div>
          <span className="font-semibold text-gray-800">{title}</span>
        </div>
        <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'} text-gray-500 transition-transform duration-200`} />
      </button>
      
      {/* Animated content area */}
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="p-4 border-t border-gray-200 space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
});

// Quick Action Button Component
interface QuickActionButtonProps {
  onClick: () => void;
  icon: string;
  label: string;
  variant?: 'primary' | 'success' | 'danger';
  size?: 'sm' | 'md';
}

export const QuickActionButton = memo<QuickActionButtonProps>(({ 
  onClick, 
  icon, 
  label, 
  variant = 'primary',
  size = 'sm' 
}) => {
  const variantClasses = {
    primary: 'bg-blue-100 hover:bg-blue-200 text-blue-700',
    success: 'bg-green-100 hover:bg-green-200 text-green-700',
    danger: 'bg-red-100 hover:bg-red-200 text-red-700'
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-xs',
    md: 'px-4 py-3 text-sm'
  };

  return (
    <button
      onClick={onClick}
      className={`${variantClasses[variant]} ${sizeClasses[size]} font-medium rounded-lg transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md flex items-center space-x-1`}
    >
      <i className={`fas ${icon}`} />
      <span>{label}</span>
    </button>
  );
});
