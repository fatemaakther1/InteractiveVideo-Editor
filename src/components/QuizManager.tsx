import { useState, useEffect, useCallback } from 'react';
import type { InteractiveElement, QuizState, QuizTimestamp } from '../types';

interface QuizManagerProps {
  elements: InteractiveElement[];
  currentTime: number;
  onPauseVideo: () => void;
  onResumeVideo: () => void;
  onQuizStateChange: (state: QuizState) => void;
  onQuizComplete?: (quizId: string) => void;
  onExposeComplete?: (completeFn: (quizId: string) => void) => void;
}

export const QuizManager: React.FC<QuizManagerProps> = ({
  elements,
  currentTime,
  onPauseVideo,
  onResumeVideo,
  onQuizStateChange,
  onQuizComplete,
  onExposeComplete,
}) => {
  const [quizState, setQuizState] = useState<QuizState>({
    isActive: false,
    currentQuizId: undefined,
    isPaused: false,
  });
  
  const [completedQuizzes, setCompletedQuizzes] = useState<Set<string>>(new Set());
  const [triggeredQuizzes, setTriggeredQuizzes] = useState<Set<string>>(new Set());
  const [previousQuizId, setPreviousQuizId] = useState<string | undefined>();

  // Get all quiz timestamps from elements
  const getQuizTimestamps = useCallback((): QuizTimestamp[] => {
    return elements
      .filter(element => element.type === 'interactive-question' || element.type === 'interactive-quiz')
      .map(element => {
        // For interactive-quiz, use the quiz's overallStartTime, for interactive-question use timestamp
        const timestamp = element.type === 'interactive-quiz' && element.quiz 
          ? element.quiz.overallStartTime 
          : element.timestamp;
        return {
          elementId: element.id,
          timestamp,
          element,
        };
      })
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [elements]);

  // Check if we should trigger a quiz at current time
  const checkForQuizTrigger = useCallback(() => {
    if (quizState.isActive) {
      // Don't trigger new quizzes while one is active to avoid confusion
      // But allow triggering if the current quiz is completed
      console.log('🔒 Quiz already active, skipping trigger check');
      return;
    }
    
    const quizTimestamps = getQuizTimestamps();
    console.log('🕒 Checking quiz triggers at time:', currentTime);
    console.log('📋 Available quizzes:', quizTimestamps.map(q => ({ id: q.elementId, timestamp: q.timestamp })));
    console.log('✅ Completed quizzes:', Array.from(completedQuizzes));
    console.log('🎯 Triggered quizzes:', Array.from(triggeredQuizzes));
    
    // Find all quizzes that could be triggered at current time
    const candidateQuizzes = quizTimestamps.filter(quiz => {
      const timeDiff = currentTime - quiz.timestamp;
      // Check if we're at or just past the quiz start time (within 0.5 seconds)
      // Reduced from 1.0 to 0.5 to be more precise
      const isAtStartTime = timeDiff >= -0.1 && timeDiff <= 0.5;
      const isNotCompleted = !completedQuizzes.has(quiz.elementId);
      const isNotTriggered = !triggeredQuizzes.has(quiz.elementId);
      
      console.log(`🔍 Quiz ${quiz.elementId}: time=${quiz.timestamp}, currentTime=${currentTime}, diff=${timeDiff.toFixed(2)}s, atStartTime=${isAtStartTime}, notCompleted=${isNotCompleted}, notTriggered=${isNotTriggered}`);
      
      return isAtStartTime && isNotCompleted && isNotTriggered;
    });
    
    console.log('🎯 Candidate quizzes to trigger:', candidateQuizzes.map(q => ({ id: q.elementId, timestamp: q.timestamp })));
    
    // Get the first candidate quiz (they're already filtered to not be triggered)
    const quizToTrigger = candidateQuizzes[0];
    
    if (quizToTrigger) {
      console.log(`🚀 Triggering quiz at time ${currentTime}, quiz timestamp: ${quizToTrigger.timestamp}`);
      
      const newQuizState: QuizState = {
        isActive: true,
        currentQuizId: quizToTrigger.elementId,
        isPaused: true,
      };
      
      setQuizState(newQuizState);
      onQuizStateChange(newQuizState);
      onPauseVideo();
      
      // Mark this quiz as triggered for this playthrough
      setTriggeredQuizzes(prev => {
        const newSet = new Set([...prev, quizToTrigger.elementId]);
        console.log('📝 Updated triggered quizzes:', Array.from(newSet));
        return newSet;
      });
    } else {
      console.log('❌ No quiz to trigger at current time');
    }
  }, [
    currentTime,
    getQuizTimestamps,
    completedQuizzes,
    triggeredQuizzes,
    quizState.isActive,
    onPauseVideo,
    onQuizStateChange,
  ]);

  // Handle quiz completion
  const handleQuizComplete = useCallback((quizId: string) => {
    console.log(`🎉 Quiz ${quizId} completed`);
    
    // Mark quiz as completed
    setCompletedQuizzes(prev => new Set([...prev, quizId]));
    
    const newQuizState: QuizState = {
      isActive: false,
      currentQuizId: undefined,
      isPaused: false,
    };
    
    setQuizState(newQuizState);
    onQuizStateChange(newQuizState);
    onResumeVideo();
    
    // Call external completion handler if provided
    if (onQuizComplete) {
      onQuizComplete(quizId);
    }
    
    // After a brief delay, check if there are any other quizzes to trigger at current time
    // This handles the case where multiple quizzes might have the same start time
    setTimeout(() => {
      checkForQuizTrigger();
    }, 100);
  }, [onResumeVideo, onQuizStateChange, onQuizComplete, checkForQuizTrigger]);
  
  // Expose the handleQuizComplete function so VideoPlayerPreview can call it
  useEffect(() => {
    if (onExposeComplete) {
      onExposeComplete(handleQuizComplete);
    }
  }, [handleQuizComplete, onExposeComplete]);

  // Reset quiz tracking when seeking backward
  useEffect(() => {
    const quizTimestamps = getQuizTimestamps();
    
    // When seeking backward, clear triggered/completed quizzes that are now in the future
    // This allows quizzes to be triggered again if user seeks back
    const futureQuizzes = quizTimestamps
      .filter(quiz => quiz.timestamp > currentTime + 1) // 1 second buffer
      .map(quiz => quiz.elementId);
    
    if (futureQuizzes.length > 0) {
      console.log('🔙 Resetting future quizzes at time', currentTime, 'future quizzes:', futureQuizzes);
      
      // Clear triggered status for future quizzes
      setTriggeredQuizzes(prev => {
        const newSet = new Set(prev);
        futureQuizzes.forEach(id => newSet.delete(id));
        console.log('📝 Cleared triggered status for future quizzes. New triggered set:', Array.from(newSet));
        return newSet;
      });
      
      // Clear completed status for future quizzes (allows retaking)
      setCompletedQuizzes(prev => {
        const newSet = new Set(prev);
        futureQuizzes.forEach(id => newSet.delete(id));
        console.log('✅ Cleared completed status for future quizzes. New completed set:', Array.from(newSet));
        return newSet;
      });
    }
  }, [currentTime, getQuizTimestamps]);

  // Check for quiz triggers on time update
  useEffect(() => {
    checkForQuizTrigger();
  }, [checkForQuizTrigger]);
  
  // Track quiz state changes to handle external completion
  useEffect(() => {
    if (previousQuizId && !quizState.isActive && previousQuizId !== quizState.currentQuizId) {
      // A quiz that was active is now completed externally
      setCompletedQuizzes(prev => new Set([...prev, previousQuizId]));
      console.log(`Quiz ${previousQuizId} marked as completed`);
    }
    
    // Update previous quiz ID
    setPreviousQuizId(quizState.currentQuizId);
  }, [quizState.isActive, quizState.currentQuizId, previousQuizId]);


  return null; // This component doesn't render anything
};

export default QuizManager;
