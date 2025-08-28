import React, { useState, useCallback, useEffect } from 'react';
import QuizResultDisplay from './QuizResultDisplay';
import type { InteractiveQuiz, QuizQuestion, QuizResponse, QuizResult } from '../../types';

interface QuizOverlayProps {
  quiz: InteractiveQuiz;
  currentTime: number;
  onQuizComplete: (result: QuizResult) => void;
  onClose: () => void;
}

const QuizOverlay: React.FC<QuizOverlayProps> = ({
  quiz,
  currentTime,
  onQuizComplete,
  onClose
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
  const hasAnsweredCurrent = responses[currentQuestion?.id] !== undefined;

  // Auto-advance to next question based on timing
  useEffect(() => {
    if (!currentQuestion || isSubmitted) return;

    if (currentTime >= currentQuestion.endTime && hasAnsweredCurrent) {
      if (isLastQuestion) {
        handleSubmitQuiz();
      } else {
        setCurrentQuestionIndex(prev => prev + 1);
      }
    }
  }, [currentTime, currentQuestion, hasAnsweredCurrent, isLastQuestion, isSubmitted]);

  const handleAnswerSelect = useCallback((optionId: string) => {
    if (!currentQuestion) return;
    
    setResponses(prev => ({
      ...prev,
      [currentQuestion.id]: optionId
    }));
  }, [currentQuestion]);

  const handleNextQuestion = useCallback(() => {
    if (!hasAnsweredCurrent) return;

    if (isLastQuestion) {
      handleSubmitQuiz();
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  }, [hasAnsweredCurrent, isLastQuestion]);

  const handlePreviousQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  }, [currentQuestionIndex]);

  const calculateResult = useCallback((): QuizResult => {
    const quizResponses: QuizResponse[] = quiz.questions.map(question => {
      const selectedOptionId = responses[question.id] || '';
      const selectedOption = question.options.find(opt => opt.id === selectedOptionId);
      const isCorrect = selectedOption?.isCorrect || false;

      return {
        questionId: question.id,
        selectedOptionId,
        isCorrect
      };
    });

    const correctAnswers = quizResponses.filter(r => r.isCorrect).length;
    const score = Math.round((correctAnswers / quiz.questions.length) * 100);

    return {
      quizId: quiz.id,
      responses: quizResponses,
      totalQuestions: quiz.questions.length,
      correctAnswers,
      score
    };
  }, [quiz, responses]);

  const handleSubmitQuiz = useCallback(() => {
    if (isSubmitted) return;
    
    const result = calculateResult();
    setQuizResult(result);
    setIsSubmitted(true);
    setShowResult(true);
  }, [isSubmitted, calculateResult]);

  const handleContinueVideo = useCallback(() => {
    if (quizResult) {
      onQuizComplete(quizResult);
    }
    onClose();
  }, [quizResult, onQuizComplete, onClose]);

  const getQuestionProgress = () => {
    return `${currentQuestionIndex + 1} / ${quiz.questions.length}`;
  };

  const getTimeRemaining = () => {
    if (!currentQuestion) return 0;
    return Math.max(0, currentQuestion.endTime - currentTime);
  };

  if (showResult && quizResult) {
    return (
      <QuizResultDisplay
        quiz={quiz}
        result={quizResult}
        onContinue={handleContinueVideo}
      />
    );
  }

  if (!currentQuestion) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-blue-50">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-gray-800">{quiz.title}</h2>
            <div className="text-right">
              <div className="text-sm text-gray-600">Question {getQuestionProgress()}</div>
              <div className="text-sm text-orange-600 font-medium">
                Time remaining: {getTimeRemaining().toFixed(1)}s
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Content */}
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              {currentQuestion.questionText}
            </h3>
            
            <div className="text-sm text-gray-500 mb-4">
              Question active: {currentQuestion.startTime}s - {currentQuestion.endTime}s
            </div>
          </div>

          {/* Answer Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              const isSelected = responses[currentQuestion.id] === option.id;
              const optionLetter = String.fromCharCode(65 + index); // A, B, C, D...
              
              return (
                <button
                  key={option.id}
                  onClick={() => handleAnswerSelect(option.id)}
                  className={`w-full p-4 text-left border rounded-lg transition-all duration-200 ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 text-blue-900'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {optionLetter}
                    </span>
                    <span className="flex-1 font-medium">{option.text}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Answer requirement notice */}
          {!hasAnsweredCurrent && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                ⚠️ Please select an answer to continue to the next question.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <button
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Progress:</span>
              {quiz.questions.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full ${
                    index < currentQuestionIndex
                      ? 'bg-green-500'
                      : index === currentQuestionIndex
                      ? 'bg-blue-500'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={handleNextQuestion}
              disabled={!hasAnsweredCurrent}
              className={`px-6 py-2 font-medium rounded-md transition-colors ${
                hasAnsweredCurrent
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isLastQuestion ? 'Submit Quiz' : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizOverlay;
