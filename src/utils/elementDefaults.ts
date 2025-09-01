import type { InteractiveElement } from '../types';

// Default animation settings for new elements
export const getDefaultAnimation = () => ({
  entrance: 'fadeIn' as const,
  exit: 'fadeOut' as const,
  interactiveEffects: {
    pulseWhenVisible: false,
    bounceOnClick: false,
    scaleOnHover: true, // Enable scale on hover by default for better UX
  },
  duration: 300, // 300ms default
  delay: 0,
  easing: 'ease-in-out' as const,
});

// Helper to ensure element has complete animation object
export const ensureElementAnimations = (element: InteractiveElement): InteractiveElement => ({
  ...element,
  animation: {
    ...getDefaultAnimation(),
    ...element.animation, // Override with existing values if present
  },
});

// Helper for creating new elements with defaults
export const createElementWithDefaults = (baseElement: Omit<InteractiveElement, 'animation'>): InteractiveElement => ({
  ...baseElement,
  animation: getDefaultAnimation(),
});
