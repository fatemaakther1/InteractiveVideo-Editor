import React, { useState, useCallback } from 'react';
import type { QuizQuestion, QuizOption } from '../../types';

interface QuizQuestionProps {
  question: QuizQuestion;
  onUpdate: (updatedQuestion: QuizQuestion) => void;
  onDelete: () => void;
  questionIndex: number;
}

const QuizQuestion: React.FC<QuizQuestionProps> = ({
  question,
  onUpdate,
  onDelete,
  questionIndex
}) => {
  const [localQuestion, setLocalQuestion] = useState(question);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const handleQuestionTextChange = useCallback((text: string) => {
    const updated = { ...localQuestion, questionText: text };
    setLocalQuestion(updated);
    onUpdate(updated);
  }, [localQuestion, onUpdate]);

  const handleTypeChange = useCallback((type: 'mcq' | 'true-false') => {
    let newOptions: QuizOption[] = [];
    
    if (type === 'true-false') {
      newOptions = [
        { id: generateId(), text: 'True', isCorrect: false },
        { id: generateId(), text: 'False', isCorrect: false }
      ];
    } else {
      newOptions = [
        { id: generateId(), text: '', isCorrect: false },
        { id: generateId(), text: '', isCorrect: false }
      ];
    }

    const updated = { ...localQuestion, type, options: newOptions };
    setLocalQuestion(updated);
    onUpdate(updated);
  }, [localQuestion, onUpdate]);

  const handleStartTimeChange = useCallback((time: number) => {
    const updated = { ...localQuestion, startTime: time };
    setLocalQuestion(updated);
    onUpdate(updated);
  }, [localQuestion, onUpdate]);

  const handleEndTimeChange = useCallback((time: number) => {
    const updated = { ...localQuestion, endTime: time };
    setLocalQuestion(updated);
    onUpdate(updated);
  }, [localQuestion, onUpdate]);

  const handleAddOption = useCallback(() => {
    if (localQuestion.type === 'true-false') return; // Can't add options to true/false
    
    const newOption: QuizOption = {
      id: generateId(),
      text: '',
      isCorrect: false
    };
    
    const updated = {
      ...localQuestion,
      options: [...localQuestion.options, newOption]
    };
    setLocalQuestion(updated);
    onUpdate(updated);
  }, [localQuestion, onUpdate]);

  const handleOptionChange = useCallback((optionId: string, text: string) => {
    const updatedOptions = localQuestion.options.map(option =>
      option.id === optionId ? { ...option, text } : option
    );
    
    const updated = { ...localQuestion, options: updatedOptions };
    setLocalQuestion(updated);
    onUpdate(updated);
  }, [localQuestion, onUpdate]);

  const handleCorrectAnswerChange = useCallback((optionId: string) => {
    const updatedOptions = localQuestion.options.map(option => ({
      ...option,
      isCorrect: option.id === optionId
    }));
    
    const updated = { ...localQuestion, options: updatedOptions };
    setLocalQuestion(updated);
    onUpdate(updated);
  }, [localQuestion, onUpdate]);

  const handleDeleteOption = useCallback((optionId: string) => {
    if (localQuestion.options.length <= 2) return; // Keep minimum 2 options
    
    const updatedOptions = localQuestion.options.filter(option => option.id !== optionId);
    const updated = { ...localQuestion, options: updatedOptions };
    setLocalQuestion(updated);
    onUpdate(updated);
  }, [localQuestion, onUpdate]);

  return (
    <div className="border border-gray-300 rounded-lg p-6 bg-white shadow-sm mb-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Question {questionIndex + 1}
        </h3>
        <button
          onClick={onDelete}
          className="text-red-600 hover:text-red-800 font-medium"
        >
          Delete Question
        </button>
      </div>

      {/* Question Text Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Question Text
        </label>
        <textarea
          value={localQuestion.questionText}
          onChange={(e) => handleQuestionTextChange(e.target.value)}
          placeholder="Enter your question here..."
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={3}
        />
      </div>

      {/* Question Type Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Question Type
        </label>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              name={`type-${question.id}`}
              value="mcq"
              checked={localQuestion.type === 'mcq'}
              onChange={() => handleTypeChange('mcq')}
              className="mr-2"
            />
            Multiple Choice (MCQ)
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name={`type-${question.id}`}
              value="true-false"
              checked={localQuestion.type === 'true-false'}
              onChange={() => handleTypeChange('true-false')}
              className="mr-2"
            />
            True/False
          </label>
        </div>
      </div>

      {/* Timing Controls */}
      <div className="mb-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Time (seconds)
            </label>
            <input
              type="number"
              value={localQuestion.startTime}
              onChange={(e) => handleStartTimeChange(Number(e.target.value))}
              min="0"
              step="0.1"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Time (seconds)
            </label>
            <input
              type="number"
              value={localQuestion.endTime}
              onChange={(e) => handleEndTimeChange(Number(e.target.value))}
              min={localQuestion.startTime}
              step="0.1"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Options */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-3">
          <label className="block text-sm font-medium text-gray-700">
            Answer Options
          </label>
          {localQuestion.type === 'mcq' && (
            <button
              onClick={handleAddOption}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
            >
              Add Option
            </button>
          )}
        </div>

        <div className="space-y-3">
          {localQuestion.options.map((option, index) => (
            <div key={option.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-md">
              <div className="flex items-center">
                <input
                  type="radio"
                  name={`correct-${question.id}`}
                  checked={option.isCorrect}
                  onChange={() => handleCorrectAnswerChange(option.id)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-600">Correct</span>
              </div>
              
              <input
                type="text"
                value={option.text}
                onChange={(e) => handleOptionChange(option.id, e.target.value)}
                placeholder={`Option ${String.fromCharCode(65 + index)}`}
                className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                disabled={localQuestion.type === 'true-false'}
              />
              
              {localQuestion.type === 'mcq' && localQuestion.options.length > 2 && (
                <button
                  onClick={() => handleDeleteOption(option.id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuizQuestion;
