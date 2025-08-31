import React, { useState, useCallback } from 'react';
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

  const handleAnswerSelect = useCallback((optionId: string) => {
    if (!currentQuestion) return;
    
    setResponses(prev => ({
      ...prev,
      [currentQuestion.id]: optionId
    }));
  }, [currentQuestion]);

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
    
    // Notify parent that quiz is complete
    onQuizComplete(result);
  }, [isSubmitted, calculateResult, onQuizComplete]);

  const handleNextQuestion = useCallback(() => {
    if (!hasAnsweredCurrent) return;

    if (isLastQuestion) {
      handleSubmitQuiz();
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  }, [hasAnsweredCurrent, isLastQuestion, handleSubmitQuiz]);

  const handlePreviousQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  }, [currentQuestionIndex]);

  const handleContinueVideo = useCallback(() => {
    console.log('Continue video button clicked');
    // Don't call onQuizComplete again, just close the overlay
    onClose();
  }, [onClose]);

  const getQuestionProgress = () => {
    return `${currentQuestionIndex + 1} / ${quiz.questions.length}`;
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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50">
      <div className="flex h-full">
        {/* Left Panel */}
        <div className="w-1/4 bg-gradient-to-br from-blue-600 to-blue-800 p-6 flex flex-col justify-center">
          <div className="text-white">
            <h2 className="text-2xl font-bold mb-4">{quiz.title}</h2>
            <div className="mb-6">
              <div className="text-blue-200 text-sm mb-2">Progress</div>
              <div className="text-xl font-bold">{getQuestionProgress()}</div>
            </div>
            <div className="space-y-3">
              {quiz.questions.map((_, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    index < currentQuestionIndex
                      ? 'bg-green-500 text-white'
                      : index === currentQuestionIndex
                      ? 'bg-white text-blue-800'
                      : 'bg-blue-400/50 text-blue-200'
                  }`}>
                    {index + 1}
                  </div>
                  <span className={`text-sm ${
                    index <= currentQuestionIndex ? 'text-white' : 'text-blue-200'
                  }`}>
                    Question {index + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-white flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">Question {getQuestionProgress()}</div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                ×
              </button>
            </div>
          </div>

          {/* Question Content - Scrollable */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">
                {currentQuestion.questionText}
              </h3>
            </div>

            {/* Answer Options */}
            <div className="grid gap-3 max-w-3xl">
              {currentQuestion.options.map((option, index) => {
                const isSelected = responses[currentQuestion.id] === option.id;
                const optionLetter = String.fromCharCode(65 + index); // A, B, C, D...
                
                return (
                  <button
                    key={option.id}
                    onClick={() => handleAnswerSelect(option.id)}
                    className={`p-4 text-left border-2 rounded-xl transition-all duration-200 hover:shadow-md ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 text-blue-900 shadow-md'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {optionLetter}
                      </span>
                      <span className="flex-1 font-medium text-lg leading-relaxed">{option.text}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Answer requirement notice */}
            {!hasAnsweredCurrent && (
              <div className="mt-6 p-4 bg-amber-50 border-2 border-amber-200 rounded-xl">
                <p className="text-amber-800 font-medium flex items-center">
                  <span className="text-xl mr-2">⚠️</span>
                  Please select an answer to continue to the next question.
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
                className="px-6 py-3 text-gray-600 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
              >
                ← Previous
              </button>

              <div className="text-sm text-gray-600 font-medium">
                {currentQuestionIndex + 1} of {quiz.questions.length} questions
              </div>

              <button
                onClick={handleNextQuestion}
                disabled={!hasAnsweredCurrent}
                className={`px-8 py-3 font-bold rounded-lg transition-all ${
                  hasAnsweredCurrent
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isLastQuestion ? 'Submit Quiz' : 'Next →'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-1/4 bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex flex-col justify-center">
          <div className="text-center">
            <div className="mb-6">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Quiz in Progress</h3>
              <p className="text-sm text-gray-600">Answer all questions to continue watching the video.</p>
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-4">
              <div className="text-2xl font-bold text-blue-600 mb-1">{quiz.questions.length - currentQuestionIndex}</div>
              <div className="text-sm text-gray-600">questions remaining</div>
            </div>

            <div className="text-xs text-gray-500">
              Video will resume after completing the quiz
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizOverlay;
