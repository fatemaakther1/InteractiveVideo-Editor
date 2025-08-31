// Animation Types
export type AnimationType = 
  | 'none'
  | 'fadeIn' | 'fadeOut'
  | 'slideInLeft' | 'slideInRight' | 'slideOutLeft' | 'slideOutRight'
  | 'scaleIn' | 'scaleOut'
  | 'bounceIn' | 'bounceOut'
  | 'pulse' | 'shake' | 'glow' | 'flash'
  | 'zoomIn' | 'zoomOut'
  | 'flipIn' | 'flipOut'
  | 'rotateIn' | 'rotateOut';

export type EasingType = 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';

export interface InteractiveEffects {
  pulseWhenVisible?: boolean;
  bounceOnClick?: boolean;
  scaleOnHover?: boolean;
}

export interface AnimationConfig {
  entrance?: AnimationType;
  exit?: AnimationType;
  interactiveEffects?: InteractiveEffects;
  duration?: number;
  delay?: number;
  easing?: EasingType;
}

// Element Types
export type ElementType = 
  | 'text' 
  | 'interactive-button' 
  | 'image' 
  | 'pointer' 
  | 'opener';

// Main Interactive Element Interface
export interface InteractiveElement {
  id: string;
  type: ElementType;
  content: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  timestamp: number;
  endTime: number;
  zIndex?: number;
  
  // Image-specific properties
  url?: string;
  
  // Button-specific properties
  action?: string;
  
  // Advanced Text styling properties
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  superscript?: boolean;
  subscript?: boolean;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  textCase?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  letterSpacing?: number;
  lineHeight?: number;
  color?: string;
  highlightColor?: string;
  
  // Element styling properties
  backgroundColor?: string;
  opacity?: number;
  borderRadius?: number;
  padding?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
  margin?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
  boxShadow?: string;
  
  // Visual effects
  blur?: number;
  brightness?: number;
  grayscale?: number;
  
  // Layout properties
  display?: 'block' | 'inline' | 'flex' | 'grid' | 'inline-block';
  flexDirection?: 'row' | 'col' | 'row-reverse' | 'col-reverse';
  alignItems?: 'start' | 'center' | 'end' | 'stretch';
  justifyContent?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  
  // Responsive breakpoints
  responsive?: {
    sm?: Partial<InteractiveElement>;
    md?: Partial<InteractiveElement>;
    lg?: Partial<InteractiveElement>;
  };
  
  // Animation configuration
  animation?: AnimationConfig;
}


// Project data structure
export interface ProjectData {
  elements: InteractiveElement[];
  version?: string;
}

// Component props interfaces
export interface VideoPlayerPreviewProps {
  elements: InteractiveElement[];
}


// Video Player related types
export interface VideoPlayerRef {
  seekTo: (time: number) => void;
  getCurrentTime: () => number;
  play: () => void;
  pause: () => void;
}

export interface VideoPlayerAdminProps {
  elements: InteractiveElement[];
  onAddElement: (element: Omit<InteractiveElement, 'id'>) => void;
  onTimeUpdate: (time: number) => void;
}

// Advanced Format & Style Types
export interface StylePreset {
  id: string;
  name: string;
  description?: string;
  styles: Partial<InteractiveElement>;
  createdAt: Date;
}

export interface FormatState {
  activeStyles: Set<string>;
  selectedText: string;
  selectedRange?: Range;
  presets: StylePreset[];
  history: Partial<InteractiveElement>[];
  historyIndex: number;
  responsiveMode: 'sm' | 'md' | 'lg' | 'all';
}

export interface BoxShadowPreset {
  id: string;
  name: string;
  value: string;
  preview: string;
}

export interface FontOption {
  value: string;
  label: string;
  category: 'serif' | 'sans-serif' | 'monospace' | 'display';
}
