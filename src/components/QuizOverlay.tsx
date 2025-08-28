import { useState } from 'react';
import type { InteractiveElement, QuizState } from '../types';

interface QuizOverlayProps {
  quizState: QuizState;
  elements: InteractiveElement[];
  onQuizAnswer: (elementId: string, answer: string) => void;
}

export const QuizOverlay: React.FC<QuizOverlayProps> = ({
  quizState,
  elements,
  onQuizAnswer,
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showResult, setShowResult] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);

  // Get the current quiz element
  const currentQuizElement = elements.find(
    element => element.id === quizState.currentQuizId
  );

  if (!quizState.isActive || !currentQuizElement) {
    return null;
  }

  const handleAnswerSubmit = (answer: string) => {
    setSelectedAnswer(answer);
    const correct = answer === currentQuizElement.correctAnswer;
    setIsCorrect(correct);
    setShowResult(true);

    // Auto-hide result and resume video after 3 seconds
    setTimeout(() => {
      setShowResult(false);
      setSelectedAnswer('');
      onQuizAnswer(currentQuizElement.id, answer);
    }, 3000);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const target = e.target as HTMLInputElement;
      handleAnswerSubmit(target.value);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full mx-4 transform animate-scale-in">
        {/* Pause indicator */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center space-x-3 px-4 py-2 bg-blue-100 rounded-full">
            <i className="fas fa-pause text-blue-600"></i>
            <span className="text-blue-800 font-semibold">Video Paused for Quiz</span>
          </div>
        </div>

        {!showResult ? (
          <div className="space-y-6">
            {/* Question header */}
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {currentQuizElement.content}
              </h2>
              <p className="text-gray-600">
                Please select your answer to continue watching
              </p>
            </div>

            {/* Answer options based on question type */}
            {currentQuizElement.questionType === 'multiple-choice' && currentQuizElement.options && (
              <div className="space-y-3">
                {currentQuizElement.options.map((option, index) => (
                  <button
                    key={index}
                    className="w-full text-left p-4 rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 group"
                    onClick={() => handleAnswerSubmit(option)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 rounded-full border-2 border-gray-300 group-hover:border-blue-500 flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </div>
                      <span className="text-gray-800 group-hover:text-blue-800 font-medium text-lg">
                        {option}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {currentQuizElement.questionType === 'true-false' && (
              <div className="grid grid-cols-2 gap-4">
                <button
                  className="p-6 rounded-xl bg-green-50 border-2 border-green-200 hover:border-green-400 hover:bg-green-100 text-green-800 font-bold text-xl transition-all duration-200 transform hover:scale-105"
                  onClick={() => handleAnswerSubmit('True')}
                >
                  <i className="fas fa-check mr-3 text-2xl"></i>
                  True
                </button>
                <button
                  className="p-6 rounded-xl bg-red-50 border-2 border-red-200 hover:border-red-400 hover:bg-red-100 text-red-800 font-bold text-xl transition-all duration-200 transform hover:scale-105"
                  onClick={() => handleAnswerSubmit('False')}
                >
                  <i className="fas fa-times mr-3 text-2xl"></i>
                  False
                </button>
              </div>
            )}

            {currentQuizElement.questionType === 'text-input' && (
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Type your answer here..."
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-gray-800 placeholder-gray-500 text-lg"
                  onKeyDown={handleInputKeyDown}
                  autoFocus
                />
                <button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg text-lg"
                  onClick={(e) => {
                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                    handleAnswerSubmit(input.value);
                  }}
                >
                  <i className="fas fa-paper-plane mr-2"></i>
                  Submit Answer
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Results display */
          <div className="text-center space-y-6">
            <div className={`p-6 rounded-2xl border-2 ${
              isCorrect 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              <div className="flex items-center justify-center space-x-3 mb-4">
                <i className={`fas ${isCorrect ? 'fa-check-circle' : 'fa-times-circle'} text-4xl`}></i>
                <span className="font-bold text-3xl">
                  {isCorrect ? 'Correct!' : 'Incorrect'}
                </span>
              </div>
              <div className="space-y-2 text-lg">
                <p><span className="font-semibold">Correct answer:</span> {currentQuizElement.correctAnswer}</p>
                <p><span className="font-semibold">Your answer:</span> {selectedAnswer}</p>
              </div>
            </div>
            <p className="text-gray-600 text-lg">
              Video will resume automatically in a moment...
            </p>
            <div className="flex justify-center">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizOverlay;
