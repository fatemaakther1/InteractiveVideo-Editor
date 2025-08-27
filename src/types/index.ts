// Animation Types
export type AnimationType = 
  | 'fadeIn' | 'fadeOut'
  | 'slideInLeft' | 'slideInRight' | 'slideOutLeft' | 'slideOutRight'
  | 'scaleIn' | 'scaleOut'
  | 'bounceIn' | 'bounceOut'
  | 'pulse' | 'shake' | 'glow' | 'flash'
  | 'zoomIn' | 'zoomOut'
  | 'flipIn' | 'flipOut'
  | 'rotateIn' | 'rotateOut';

export type EasingType = 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';

// Interactive Effect Types for Answer Selection
export interface AnswerEffects {
  correct?: AnimationType; // Effect for correct answers
  incorrect?: AnimationType; // Effect for incorrect answers  
  neutral?: AnimationType; // Effect for neutral selections
}

export interface InteractiveEffects {
  pulseWhenVisible?: boolean;
  bounceOnClick?: boolean;
  scaleOnHover?: boolean;
}

export interface AnimationConfig {
  entrance?: AnimationType;
  exit?: AnimationType;
  interactiveEffects?: InteractiveEffects;
  answerEffects?: AnswerEffects; // New property for answer feedback
  duration?: number;
  delay?: number;
  easing?: EasingType;
}

// Element Types
export type ElementType = 
  | 'text' 
  | 'interactive-button' 
  | 'interactive-question' 
  | 'image' 
  | 'pointer' 
  | 'opener';

export type QuestionType = 'multiple-choice' | 'true-false' | 'text-input';

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
  
  // Question-specific properties
  questionType?: QuestionType;
  options?: string[];
  correctAnswer?: string;
  
  // Image-specific properties
  url?: string;
  
  // Button-specific properties
  action?: string;
  
  // Text styling properties
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  fontSize?: number;
  color?: string;
  
  // Animation configuration
  animation?: AnimationConfig;
}

// State interfaces for VideoPlayer
export interface AnswerState {
  [elementId: string]: string;
}

export interface ResultsState {
  [elementId: string]: boolean;
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

// Answer feedback specific types
export interface AnswerFeedbackConfig {
  showImmediate: boolean; // Show feedback immediately on selection
  duration: number; // How long to show the effect
  correctEffect: AnimationType;
  incorrectEffect: AnimationType;
  neutralEffect?: AnimationType;
}

// Enhanced question element with answer effects
export interface QuestionElementWithEffects extends InteractiveElement {
  answerFeedback?: AnswerFeedbackConfig;
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
