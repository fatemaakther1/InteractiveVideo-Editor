import type { InteractiveElement, AnimationType, InteractiveEffects } from '../types';

// Import CSS animations
import '../styles/animations.css';

// Helper to generate animation CSS classes based on element animation config
export const getAnimationClasses = (
  element: InteractiveElement,
  phase: 'entrance' | 'exit' = 'entrance'
): string => {
  const { animation } = element;
  if (!animation) return '';

  const animationType = phase === 'entrance' ? animation.entrance : animation.exit;
  if (!animationType) return '';

  return `animate-${animationType}`;
};

// Helper to generate interactive effect classes
export const getInteractiveEffectClasses = (
  element: InteractiveElement
): string[] => {
  const classes: string[] = [];
  const effects = element.animation?.interactiveEffects;
  
  if (!effects) return classes;

  if (effects.pulseWhenVisible) {
    classes.push('effect-pulse-visible');
  }
  
  if (effects.scaleOnHover) {
    classes.push('effect-scale-hover');
  }

  return classes;
};

// Helper to generate CSS custom properties for animation timing
export const getAnimationStyle = (
  element: InteractiveElement
): React.CSSProperties => {
  const { animation } = element;
  if (!animation) return {};

  return {
    '--animation-duration': `${animation.duration || 300}ms`,
    '--animation-delay': `${animation.delay || 0}ms`,
    '--animation-easing': animation.easing || 'ease-in-out',
  } as React.CSSProperties;
};

// Helper to combine all animation-related classes and styles
export const getElementAnimationConfig = (
  element: InteractiveElement,
  phase: 'entrance' | 'exit' = 'entrance'
) => {
  const animationClass = getAnimationClasses(element, phase);
  const effectClasses = getInteractiveEffectClasses(element);
  const animationStyle = getAnimationStyle(element);

  return {
    className: [animationClass, ...effectClasses].filter(Boolean).join(' '),
    style: animationStyle,
  };
};

// Helper for managing bounce click effect
export const addBounceClickHandler = (
  originalHandler?: (element: InteractiveElement) => void,
  element?: InteractiveElement
) => {
  return (e: React.MouseEvent<HTMLElement>) => {
    if (!element?.animation?.interactiveEffects?.bounceOnClick) {
      originalHandler?.(element!);
      return;
    }

    const target = e.currentTarget;
    
    // Add bounce class
    target.classList.add('effect-bounce-click');
    
    // Remove bounce class after animation completes
    const handleAnimationEnd = () => {
      target.classList.remove('effect-bounce-click');
      target.removeEventListener('animationend', handleAnimationEnd);
    };
    
    target.addEventListener('animationend', handleAnimationEnd);
    
    // Call original handler
    originalHandler?.(element!);
  };
};

// Helper to trigger animation preview on an element
export const triggerAnimationPreview = (
  elementId: string,
  animationType: 'entrance' | 'exit',
  element: InteractiveElement
) => {
  const domElement = document.querySelector(`[data-element-id="${elementId}"]`);
  if (!domElement) {
    console.warn(`Element with ID ${elementId} not found for animation preview`);
    return;
  }

  const { animation } = element;
  if (!animation) return;

  const animationClass = animationType === 'entrance' 
    ? `animate-${animation.entrance || 'fadeIn'}` 
    : `animate-${animation.exit || 'fadeOut'}`;

  // Remove any existing animation classes
  const existingClasses = Array.from(domElement.classList).filter(cls => cls.startsWith('animate-'));
  domElement.classList.remove(...existingClasses);

  // Add the preview animation class
  domElement.classList.add(animationClass, 'animation-preview');

  // Set animation properties
  const style = domElement as HTMLElement;
  style.style.setProperty('--animation-duration', `${animation.duration || 300}ms`);
  style.style.setProperty('--animation-delay', `${animation.delay || 0}ms`);
  style.style.setProperty('--animation-easing', animation.easing || 'ease-in-out');

  // Remove preview class after animation completes
  const handleAnimationEnd = () => {
    domElement.classList.remove(animationClass, 'animation-preview');
    domElement.removeEventListener('animationend', handleAnimationEnd);
    
    // Reset animation properties
    style.style.removeProperty('--animation-duration');
    style.style.removeProperty('--animation-delay');
    style.style.removeProperty('--animation-easing');
  };

  domElement.addEventListener('animationend', handleAnimationEnd);

  // Also set a timeout as a fallback in case animationend doesn't fire
  const duration = (animation.duration || 300) + (animation.delay || 0);
  setTimeout(handleAnimationEnd, duration + 100);
};

// Helper to trigger all interactive effects preview
export const triggerInteractiveEffectsPreview = (
  elementId: string,
  effects?: InteractiveEffects
) => {
  const domElement = document.querySelector(`[data-element-id="${elementId}"]`);
  if (!domElement || !effects) return;

  // Remove existing effect classes
  const effectClasses = ['effect-pulse-visible', 'effect-scale-hover', 'effect-bounce-click'];
  domElement.classList.remove(...effectClasses);

  // Add preview classes based on enabled effects
  if (effects.pulseWhenVisible) {
    domElement.classList.add('effect-pulse-visible');
  }
  if (effects.scaleOnHover) {
    domElement.classList.add('effect-scale-hover');
  }
  if (effects.bounceOnClick) {
    // Trigger bounce effect immediately for preview
    domElement.classList.add('effect-bounce-click');
    
    // Remove bounce after animation
    setTimeout(() => {
      domElement.classList.remove('effect-bounce-click');
    }, 600);
  }

  // Auto-remove pulse and hover effects after a few seconds for preview
  setTimeout(() => {
    domElement.classList.remove('effect-pulse-visible');
  }, 4000); // Let pulse effect show for 4 seconds
};

// Helper to reset element to its default animation state
export const resetElementAnimation = (elementId: string) => {
  const domElement = document.querySelector(`[data-element-id="${elementId}"]`);
  if (!domElement) return;

  // Remove all animation and effect classes
  const allAnimationClasses = [
    ...Array.from(domElement.classList).filter(cls => cls.startsWith('animate-')),
    'effect-pulse-visible', 'effect-scale-hover', 'effect-bounce-click', 'animation-preview',
    ...Array.from(domElement.classList).filter(cls => cls.startsWith('answer-effect-')),
    'answer-feedback-correct', 'answer-feedback-incorrect', 'answer-feedback-neutral'
  ];
  
  domElement.classList.remove(...allAnimationClasses);
  
  // Reset animation properties
  const style = domElement as HTMLElement;
  style.style.removeProperty('--animation-duration');
  style.style.removeProperty('--animation-delay');
  style.style.removeProperty('--animation-easing');
};

// NEW: Answer feedback animation system
export type AnswerFeedbackType = 'correct' | 'incorrect' | 'neutral';

// Helper to get default answer effects based on correctness
export const getDefaultAnswerEffect = (type: AnswerFeedbackType): AnimationType => {
  switch (type) {
    case 'correct':
      return 'pulse'; // Green pulse for correct
    case 'incorrect':
      return 'shake'; // Red shake for incorrect
    case 'neutral':
    default:
      return 'pulse'; // Blue pulse for neutral
  }
};

// Helper to trigger immediate answer feedback animation
export const triggerAnswerFeedback = (
  element: HTMLElement,
  feedbackType: AnswerFeedbackType,
  customEffect?: AnimationType,
  duration: number = 1000
) => {
  // Get the effect to use (custom or default)
  const effect = customEffect || getDefaultAnswerEffect(feedbackType);
  
  // Remove any existing answer feedback classes
  const existingFeedbackClasses = Array.from(element.classList)
    .filter(cls => cls.startsWith('answer-effect-') || cls.startsWith('answer-feedback-'));
  element.classList.remove(...existingFeedbackClasses);
  
  // Add immediate background color feedback
  element.classList.add(`answer-feedback-${feedbackType}`);
  
  // Add the animation effect
  const effectClass = `answer-effect-${feedbackType}-${effect}`;
  element.classList.add(effectClass);
  
  // Remove effects after duration
  setTimeout(() => {
    element.classList.remove(`answer-feedback-${feedbackType}`, effectClass);
  }, duration);
};

// Helper to trigger answer feedback by element ID
export const triggerAnswerFeedbackById = (
  elementId: string,
  feedbackType: AnswerFeedbackType,
  customEffect?: AnimationType,
  duration: number = 1000
) => {
  const element = document.querySelector(`[data-element-id="${elementId}"]`) as HTMLElement;
  if (!element) {
    console.warn(`Element with ID ${elementId} not found for answer feedback`);
    return;
  }
  
  triggerAnswerFeedback(element, feedbackType, customEffect, duration);
};

// Helper to trigger answer feedback on option buttons
export const triggerOptionFeedback = (
  optionElement: HTMLElement,
  isCorrect: boolean,
  element?: InteractiveElement
) => {
  const feedbackType: AnswerFeedbackType = isCorrect ? 'correct' : 'incorrect';
  
  // Check if element has custom answer effects configured
  const customEffect = element?.animation?.answerEffects?.[feedbackType];
  
  triggerAnswerFeedback(optionElement, feedbackType, customEffect, 1200);
};

// Helper to get answer effect animation class name
export const getAnswerEffectClass = (
  feedbackType: AnswerFeedbackType,
  effect: AnimationType
): string => {
  return `answer-effect-${feedbackType}-${effect}`;
};

// Helper to create answer feedback handler
export const createAnswerFeedbackHandler = (
  originalHandler: (element: InteractiveElement, answer: string) => void,
  element: InteractiveElement
) => {
  return (e: React.MouseEvent<HTMLButtonElement>, answer: string) => {
    // Trigger immediate visual feedback
    const isCorrect = answer === element.correctAnswer;
    triggerOptionFeedback(e.currentTarget, isCorrect, element);
    
    // Small delay before calling original handler to let animation start
    setTimeout(() => {
      originalHandler(element, answer);
    }, 100);
  };
};

// Helper to preview answer feedback effects in admin mode
export const previewAnswerFeedbackEffects = (
  elementId: string,
  element: InteractiveElement
) => {
  const domElement = document.querySelector(`[data-element-id="${elementId}"]`);
  if (!domElement || element.type !== 'interactive-question') {
    console.warn('Answer feedback preview requires a question element');
    return;
  }

  const effects = element.animation?.answerEffects;
  if (!effects) return;

  // Simulate different answer scenarios with delays
  setTimeout(() => {
    // Preview correct answer effect
    triggerAnswerFeedback(
      domElement as HTMLElement,
      'correct',
      effects.correct,
      1000
    );
  }, 100);

  setTimeout(() => {
    // Preview incorrect answer effect  
    triggerAnswerFeedback(
      domElement as HTMLElement,
      'incorrect',
      effects.incorrect,
      1000
    );
  }, 1500);

  setTimeout(() => {
    // Preview neutral effect
    if (effects.neutral) {
      triggerAnswerFeedback(
        domElement as HTMLElement,
        'neutral',
        effects.neutral,
        1000
      );
    }
  }, 3000);
};
