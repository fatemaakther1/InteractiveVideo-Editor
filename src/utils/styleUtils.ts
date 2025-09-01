import type { InteractiveElement } from '../types';

// Debounce utility for performance optimization
export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Throttle utility for real-time updates
export const throttle = <T extends (...args: any[]) => void>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let lastCall = 0;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
};

// Compute inline styles from element properties
export const computeElementStyles = (element: InteractiveElement): React.CSSProperties => {
  const styles: React.CSSProperties = {};

  // Text styles
  if (element.fontFamily) styles.fontFamily = element.fontFamily;
  if (element.fontSize) styles.fontSize = `${element.fontSize}px`;
  if (element.fontWeight) styles.fontWeight = element.fontWeight;
  if (element.color) styles.color = element.color;
  if (element.textAlign) styles.textAlign = element.textAlign;
  if (element.letterSpacing) styles.letterSpacing = `${element.letterSpacing}px`;
  if (element.lineHeight) styles.lineHeight = element.lineHeight.toString();

  // Text decorations
  const textDecorations: string[] = [];
  if (element.underline) textDecorations.push('underline');
  if (element.strikethrough) textDecorations.push('line-through');
  if (textDecorations.length > 0) {
    styles.textDecoration = textDecorations.join(' ');
  }

  // Text case
  if (element.textCase && element.textCase !== 'none') {
    styles.textTransform = element.textCase as any;
  }

  // Font style and weight
  if (element.bold) styles.fontWeight = 'bold';
  if (element.italic) styles.fontStyle = 'italic';

  // Background and appearance
  if (element.backgroundColor) styles.backgroundColor = element.backgroundColor;
  if (element.borderRadius) styles.borderRadius = `${element.borderRadius}px`;
  if (element.opacity !== undefined) styles.opacity = element.opacity / 100;

  // Box shadow
  if (element.boxShadow) styles.boxShadow = element.boxShadow;

  // Visual effects
  const filters: string[] = [];
  if (element.blur) filters.push(`blur(${element.blur}px)`);
  if (element.brightness !== undefined && element.brightness !== 100) {
    filters.push(`brightness(${element.brightness}%)`);
  }
  if (element.grayscale) filters.push(`grayscale(${element.grayscale}%)`);
  if (filters.length > 0) {
    styles.filter = filters.join(' ');
  }

  // Layout properties
  if (element.display) styles.display = element.display;
  if (element.flexDirection) {
    styles.flexDirection = element.flexDirection === 'col' ? 'column' : 
                          element.flexDirection === 'col-reverse' ? 'column-reverse' :
                          element.flexDirection as any;
  }
  if (element.alignItems) styles.alignItems = element.alignItems === 'start' ? 'flex-start' :
                                              element.alignItems === 'end' ? 'flex-end' :
                                              element.alignItems;
  if (element.justifyContent) {
    styles.justifyContent = element.justifyContent === 'start' ? 'flex-start' :
                           element.justifyContent === 'end' ? 'flex-end' :
                           element.justifyContent === 'between' ? 'space-between' :
                           element.justifyContent === 'around' ? 'space-around' :
                           element.justifyContent === 'evenly' ? 'space-evenly' :
                           element.justifyContent;
  }

  // Dimensions
  if (element.width) styles.width = `${element.width}px`;
  if (element.height) styles.height = `${element.height}px`;

  // Padding and margin
  if (element.padding) {
    const { top, right, bottom, left } = element.padding;
    if (top !== undefined) styles.paddingTop = `${top}px`;
    if (right !== undefined) styles.paddingRight = `${right}px`;
    if (bottom !== undefined) styles.paddingBottom = `${bottom}px`;
    if (left !== undefined) styles.paddingLeft = `${left}px`;
  }

  if (element.margin) {
    const { top, right, bottom, left } = element.margin;
    if (top !== undefined) styles.marginTop = `${top}px`;
    if (right !== undefined) styles.marginRight = `${right}px`;
    if (bottom !== undefined) styles.marginBottom = `${bottom}px`;
    if (left !== undefined) styles.marginLeft = `${left}px`;
  }

  return styles;
};

// Generate CSS classes for complex styling
export const generateElementClasses = (element: InteractiveElement): string => {
  const classes: string[] = [];

  // Add responsive classes based on display type
  if (element.display === 'flex') {
    classes.push('flex');
    
    if (element.flexDirection) {
      const directionMap = {
        'row': 'flex-row',
        'col': 'flex-col',
        'row-reverse': 'flex-row-reverse',
        'col-reverse': 'flex-col-reverse'
      };
      classes.push(directionMap[element.flexDirection] || 'flex-row');
    }

    if (element.alignItems) {
      const alignMap = {
        'start': 'items-start',
        'center': 'items-center',
        'end': 'items-end',
        'stretch': 'items-stretch'
      };
      classes.push(alignMap[element.alignItems] || 'items-start');
    }

    if (element.justifyContent) {
      const justifyMap = {
        'start': 'justify-start',
        'center': 'justify-center',
        'end': 'justify-end',
        'between': 'justify-between',
        'around': 'justify-around',
        'evenly': 'justify-evenly'
      };
      classes.push(justifyMap[element.justifyContent] || 'justify-start');
    }
  }

  // Add transition classes for smooth updates
  classes.push('transition-all', 'duration-300', 'ease-in-out');

  return classes.join(' ');
};

// Validate hex color
export const isValidHexColor = (color: string): boolean => {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
};

// Convert hex to RGB
export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

// Convert RGB to hex
export const rgbToHex = (r: number, g: number, b: number): string => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

// Get contrasting color (for text on backgrounds)
export const getContrastColor = (backgroundColor: string): string => {
  const rgb = hexToRgb(backgroundColor);
  if (!rgb) return '#000000';
  
  // Calculate luminance
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5 ? '#000000' : '#ffffff';
};

// Apply real-time styles to DOM element
export const applyStylesToElement = (elementId: string, styles: React.CSSProperties): void => {
  const element = document.querySelector(`[data-element-id="${elementId}"]`) as HTMLElement;
  if (element) {
    Object.assign(element.style, styles);
  }
};

// Preview styles without updating the element state
export const previewStyles = (
  elementId: string, 
  property: keyof InteractiveElement, 
  value: any, 
  currentElement: InteractiveElement
): void => {
  const tempElement = { ...currentElement, [property]: value };
  const styles = computeElementStyles(tempElement);
  applyStylesToElement(elementId, styles);
};

// Reset preview styles
export const resetPreviewStyles = (elementId: string, originalElement: InteractiveElement): void => {
  const styles = computeElementStyles(originalElement);
  applyStylesToElement(elementId, styles);
};
