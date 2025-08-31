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
  | 'interactive-quiz' 
  | 'image' 
  | 'pointer' 
  | 'opener';

export type QuestionType = 'single-choice' | 'multiple-choice' | 'true-false' | 'text-input';

// Quiz System Types
export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  id: string;
  questionText: string;
  type: 'mcq' | 'true-false';
  options: QuizOption[];
}

export interface InteractiveQuiz {
  id: string;
  title: string;
  questions: QuizQuestion[];
  overallStartTime: number;
  overallEndTime: number;
}

export interface QuizResponse {
  questionId: string;
  selectedOptionId: string;
  isCorrect: boolean;
}

export interface QuizResult {
  quizId: string;
  responses: QuizResponse[];
  totalQuestions: number;
  correctAnswers: number;
  score: number; // percentage
}

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
  // Quiz-specific properties
  quiz?: InteractiveQuiz;
  
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
// Component Props
export interface VideoPlayerRef {
  currentTime: number;
}

export interface VideoPlayerAdminProps {
  elements: InteractiveElement[];
  onAddElement: (x: number, y: number) => void;
  onTimeUpdate?: (time: number) => void;
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

// Quiz Pause Types
export interface QuizState {
  isActive: boolean;
  currentQuizId?: string;
  isPaused: boolean;
}

export interface QuizTimestamp {
  elementId: string;
  timestamp: number;
  element: InteractiveElement;
}

export interface VideoPlayerPreviewProps {
  elements: InteractiveElement[];
  enableQuizPause?: boolean;
}

// Quiz Pause Types
export interface QuizState {
  isActive: boolean;
  currentQuizId?: string;
  isPaused: boolean;
}

export interface QuizTimestamp {
  elementId: string;
  timestamp: number;
  element: InteractiveElement;
}

export interface VideoPlayerPreviewProps {
  elements: InteractiveElement[];
  enableQuizPause?: boolean;
}
