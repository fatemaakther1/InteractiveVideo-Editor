import { useState, useEffect, useCallback } from 'react';
import type { InteractiveElement, QuizState, QuizTimestamp } from '../types';

interface QuizManagerProps {
  elements: InteractiveElement[];
  currentTime: number;
  onPauseVideo: () => void;
  onResumeVideo: () => void;
  onQuizStateChange: (state: QuizState) => void;
}

export const QuizManager: React.FC<QuizManagerProps> = ({
  elements,
  currentTime,
  onPauseVideo,
  onResumeVideo,
  onQuizStateChange,
}) => {
  const [quizState, setQuizState] = useState<QuizState>({
    isActive: false,
    currentQuizId: undefined,
    isPaused: false,
  });
  
  const [processedQuizzes, setProcessedQuizzes] = useState<Set<string>>(new Set());

  // Get all quiz timestamps from elements
  const getQuizTimestamps = useCallback((): QuizTimestamp[] => {
    return elements
      .filter(element => element.type === 'interactive-question')
      .map(element => ({
        elementId: element.id,
        timestamp: element.timestamp,
        element,
      }))
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [elements]);

  // Check if we should trigger a quiz at current time
  const checkForQuizTrigger = useCallback(() => {
    const quizTimestamps = getQuizTimestamps();
    
    for (const quiz of quizTimestamps) {
      // Check if we've reached a quiz timestamp (within 0.5 seconds)
      if (
        Math.abs(currentTime - quiz.timestamp) <= 0.5 &&
        !processedQuizzes.has(quiz.elementId) &&
        !quizState.isActive
      ) {
        // Trigger quiz
        const newQuizState: QuizState = {
          isActive: true,
          currentQuizId: quiz.elementId,
          isPaused: true,
        };
        
        setQuizState(newQuizState);
        onQuizStateChange(newQuizState);
        onPauseVideo();
        
        // Mark this quiz as processed
        setProcessedQuizzes(prev => new Set([...prev, quiz.elementId]));
        
        break;
      }
    }
  }, [
    currentTime,
    getQuizTimestamps,
    processedQuizzes,
    quizState.isActive,
    onPauseVideo,
    onQuizStateChange,
  ]);

  // Handle quiz completion
  const handleQuizComplete = useCallback((quizId: string) => {
    const newQuizState: QuizState = {
      isActive: false,
      currentQuizId: undefined,
      isPaused: false,
    };
    
    setQuizState(newQuizState);
    onQuizStateChange(newQuizState);
    onResumeVideo();
  }, [onResumeVideo, onQuizStateChange]);

  // Reset processed quizzes when video restarts or seeks backward
  useEffect(() => {
    const quizTimestamps = getQuizTimestamps();
    const passedQuizzes = quizTimestamps
      .filter(quiz => quiz.timestamp < currentTime - 1) // 1 second buffer
      .map(quiz => quiz.elementId);
    
    setProcessedQuizzes(new Set(passedQuizzes));
  }, [currentTime, getQuizTimestamps]);

  // Check for quiz triggers on time update
  useEffect(() => {
    checkForQuizTrigger();
  }, [checkForQuizTrigger]);

  return null; // This component doesn't render anything
};

export default QuizManager;
