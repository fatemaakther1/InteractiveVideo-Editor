// Video Configuration
export const VIDEO_CONFIG = {
  URL: 'https://files.vidstack.io/sprite-fight/720p.mp4',
  DEFAULT_ELEMENT_DURATION: 5, // seconds
} as const;

// Element Types Configuration
export const ELEMENT_TYPES = [
  { type: 'text', label: 'Text', icon: '📝' },
  { type: 'pointer', label: 'Pointers', icon: '👆' },
  { type: 'image', label: 'Images', icon: '🖼️' },
  { type: 'opener', label: 'Openers', icon: '📂' },
  { type: 'interactive-button', label: 'Interactive Buttons', icon: '👆' },
] as const;

// Storage Keys
export const STORAGE_KEYS = {
  INTERACTIVE_VIDEO: 'interactiveVideo',
} as const;

// Default Positions
export const DEFAULT_POSITIONS = {
  ELEMENT_X: 100,
  ELEMENT_Y: 100,
} as const;

// UI Constants
export const UI_CONSTANTS = {
  // Reserved for future UI constants
} as const;
