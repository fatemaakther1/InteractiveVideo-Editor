// Core Types
export type ElementType = 
  | 'text' 
  | 'pointer' 
  | 'image' 
  | 'opener' 
  | 'interactive-button' 
  | 'interactive-question'
  | 'interactive-quiz';

export type QuestionType = 
  | 'multiple-choice' 
  | 'text-input' 
  | 'true-false';

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
  startTime: number;
  endTime: number;
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
  url?: string;
  action?: string;
  questionType?: QuestionType;
  options?: string[];
  correctAnswer?: string;
  // Quiz-specific properties
  quiz?: InteractiveQuiz;
}

export interface ElementTypeConfig {
  type: ElementType;
  label: string;
  icon: string;
}

export interface ProjectData {
  elements: InteractiveElement[];
  timestamp: string;
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

// UI State Types
export type TabType = 'element-list' | 'contents';

export interface Position {
  x: number;
  y: number;
}

export interface AnswerState {
  [key: string]: string;
}

export interface ResultsState {
  [key: string]: boolean;
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
