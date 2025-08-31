import React, { useState, useCallback } from 'react';
import QuizQuestion from './QuizQuestion';
import type { InteractiveQuiz, QuizQuestion as QuizQuestionType, QuizOption } from '../../types';

interface InteractiveQuizAdminProps {
  quiz?: InteractiveQuiz;
  onUpdate: (quiz: InteractiveQuiz) => void;
  currentTime: number;
}

const InteractiveQuizAdmin: React.FC<InteractiveQuizAdminProps> = ({
  quiz,
  onUpdate,
  currentTime
}) => {
  const generateId = () => Math.random().toString(36).substr(2, 9);

  const createDefaultQuiz = (): InteractiveQuiz => ({
    id: generateId(),
    title: 'New Quiz',
    questions: [],
    overallStartTime: currentTime,
    overallEndTime: currentTime + 30
  });

  const [localQuiz, setLocalQuiz] = useState<InteractiveQuiz>(quiz || createDefaultQuiz());

  const updateQuiz = useCallback((updatedQuiz: InteractiveQuiz) => {
    setLocalQuiz(updatedQuiz);
    onUpdate(updatedQuiz);
  }, [onUpdate]);

  const handleTitleChange = useCallback((title: string) => {
    const updated = { ...localQuiz, title };
    updateQuiz(updated);
  }, [localQuiz, updateQuiz]);

  const handleOverallStartTimeChange = useCallback((time: number) => {
    const updated = { ...localQuiz, overallStartTime: time };
    updateQuiz(updated);
  }, [localQuiz, updateQuiz]);


  const createNewQuestion = useCallback((): QuizQuestionType => {
    const defaultOptions: QuizOption[] = [
      { id: generateId(), text: '', isCorrect: false },
      { id: generateId(), text: '', isCorrect: false }
    ];

    return {
      id: generateId(),
      questionText: '',
      type: 'mcq',
      options: defaultOptions
    };
  }, []);

  const handleAddQuestion = useCallback(() => {
    const newQuestion = createNewQuestion();
    const updated = {
      ...localQuiz,
      questions: [...localQuiz.questions, newQuestion]
    };
    updateQuiz(updated);
  }, [localQuiz, createNewQuestion, updateQuiz]);

  const handleUpdateQuestion = useCallback((questionId: string, updatedQuestion: QuizQuestionType) => {
    const updatedQuestions = localQuiz.questions.map(q =>
      q.id === questionId ? updatedQuestion : q
    );
    const updated = { ...localQuiz, questions: updatedQuestions };
    updateQuiz(updated);
  }, [localQuiz, updateQuiz]);

  const handleDeleteQuestion = useCallback((questionId: string) => {
    const updatedQuestions = localQuiz.questions.filter(q => q.id !== questionId);
    const updated = { ...localQuiz, questions: updatedQuestions };
    updateQuiz(updated);
  }, [localQuiz, updateQuiz]);

  return (
    <div className="space-y-6 p-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Interactive Quiz Configuration</h2>
        
        {/* Quiz Title */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quiz Title
          </label>
          <input
            type="text"
            value={localQuiz.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Enter quiz title..."
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Overall Timing */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quiz Start Time (seconds)
          </label>
          <input
            type="number"
            value={localQuiz.overallStartTime}
            onChange={(e) => handleOverallStartTimeChange(Number(e.target.value))}
            min="0"
            step="0.1"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Quiz Description */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
          <p className="text-sm text-yellow-800">
            <strong>How it works:</strong> At {localQuiz.overallStartTime}s, the video will pause and the quiz will appear. 
            Users must answer all questions to continue watching the video.
          </p>
        </div>

        {/* Add Question Button */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Questions ({localQuiz.questions.length})
          </h3>
          <button
            onClick={handleAddQuestion}
            className="px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 focus:ring-2 focus:ring-green-500"
          >
            + Add Question
          </button>
        </div>
      </div>

      {/* Questions List */}
      {localQuiz.questions.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-gray-500 mb-4">No questions added yet</p>
          <button
            onClick={handleAddQuestion}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700"
          >
            Add Your First Question
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {localQuiz.questions.map((question, index) => (
            <QuizQuestion
              key={question.id}
              question={question}
              questionIndex={index}
              onUpdate={(updatedQuestion) => handleUpdateQuestion(question.id, updatedQuestion)}
              onDelete={() => handleDeleteQuestion(question.id)}
            />
          ))}
        </div>
      )}

      {/* Summary Information */}
      {localQuiz.questions.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-2">Quiz Summary</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>Total Questions: {localQuiz.questions.length}</li>
            <li>Start Time: {localQuiz.overallStartTime} seconds</li>
            <li>MCQ Questions: {localQuiz.questions.filter(q => q.type === 'mcq').length}</li>
            <li>True/False Questions: {localQuiz.questions.filter(q => q.type === 'true-false').length}</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default InteractiveQuizAdmin;
