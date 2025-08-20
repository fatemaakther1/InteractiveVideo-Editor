// Core Types
export type ElementType = 
  | 'text' 
  | 'pointer' 
  | 'image' 
  | 'opener' 
  | 'interactive-button' 
  | 'interactive-question';

export type QuestionType = 
  | 'multiple-choice' 
  | 'text-input' 
  | 'true-false';

export interface InteractiveElement {
  id: string;
  type: ElementType;
  content: string;
  x: number;
  y: number;
  timestamp: number;
  endTime: number;
  url?: string;
  action?: string;
  questionType?: QuestionType;
  options?: string[];
  correctAnswer?: string;
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
}

export interface VideoPlayerPreviewProps {
  elements: InteractiveElement[];
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
