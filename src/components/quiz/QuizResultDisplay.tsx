import React from 'react';
import type { QuizResult, QuizResponse, InteractiveQuiz } from '../../types';

interface QuizResultDisplayProps {
  quiz: InteractiveQuiz;
  result: QuizResult;
  onContinue: () => void;
}

const QuizResultDisplay: React.FC<QuizResultDisplayProps> = ({
  quiz,
  result,
  onContinue
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getQuestionById = (questionId: string) => {
    return quiz.questions.find(q => q.id === questionId);
  };

  const getOptionById = (questionId: string, optionId: string) => {
    const question = getQuestionById(questionId);
    return question?.options.find(opt => opt.id === optionId);
  };

  const getCorrectOption = (questionId: string) => {
    const question = getQuestionById(questionId);
    return question?.options.find(opt => opt.isCorrect);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Quiz Results: {quiz.title}
          </h2>
          
          {/* Score Display */}
          <div className="flex items-center gap-4">
            <div className={`px-4 py-2 rounded-lg ${getScoreColor(result.score)}`}>
              <span className="font-bold text-lg">
                Score: {result.score}%
              </span>
            </div>
            <div className="text-gray-600">
              {result.correctAnswers} out of {result.totalQuestions} correct
            </div>
          </div>
        </div>

        {/* Detailed Results */}
        <div className="p-6 space-y-6">
          {result.responses.map((response, index) => {
            const question = getQuestionById(response.questionId);
            const selectedOption = getOptionById(response.questionId, response.selectedOptionId);
            const correctOption = getCorrectOption(response.questionId);

            if (!question) return null;

            return (
              <div key={response.questionId} className="border border-gray-200 rounded-lg p-4">
                {/* Question */}
                <div className="mb-3">
                  <h3 className="font-semibold text-gray-800 mb-2">
                    Question {index + 1}: {question.questionText}
                  </h3>
                  
                  {/* Result Indicator */}
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    response.isCorrect 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {response.isCorrect ? '✅ Correct' : '❌ Incorrect'}
                  </div>
                </div>

                {/* Answer Details */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Your answer:</span>
                    <span className={`font-medium ${
                      response.isCorrect ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {selectedOption?.text || 'No answer selected'}
                    </span>
                  </div>
                  
                  {!response.isCorrect && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Correct answer:</span>
                      <span className="font-medium text-green-700">
                        {correctOption?.text || 'Not found'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {result.score >= 70 ? 
                "🎉 Great job! You've done well on this quiz." :
                result.score >= 50 ?
                "👍 Good effort! Consider reviewing the material." :
                "📚 Keep practicing! Review the content and try again."
              }
            </div>
            
            <button
              onClick={onContinue}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              Continue Video
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizResultDisplay;
