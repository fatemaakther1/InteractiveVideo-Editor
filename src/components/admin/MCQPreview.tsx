import React from 'react';
import type { InteractiveElement } from '../../types';
import { getElementAnimationConfig, addBounceClickHandler,
   ensureElementAnimations } from '../../utils';

interface MCQPreviewProps {
  element: InteractiveElement;
  isSelected?: boolean;
  onSelect?: () => void;
}

const MCQPreview: React.FC<MCQPreviewProps> = ({ 
  element, 
  isSelected = false,
  onSelect 
}) => {
  // Ensure element has animation properties with defaults
  const elementWithAnimation = ensureElementAnimations(element);
  const animationConfig = getElementAnimationConfig(elementWithAnimation, 'entrance');

  const handleClick = addBounceClickHandler(() => {
    onSelect?.();
  }, elementWithAnimation);

  const renderQuestionContent = () => {
    switch (element.questionType) {
      case 'single-choice':
        return (
          <div className="space-y-2">
            {(element.options || ['Option 1', 'Option 2']).map((option, index) => (
              <div
                key={index}
                className="w-full text-left p-3 rounded-xl border-2 border-secondary-200 bg-secondary-50 transition-all duration-200 cursor-pointer"
                onClick={(e) => e.preventDefault()}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 rounded-full border-2 border-secondary-300 flex items-center justify-center">
                    {element.correctAnswer === option && (
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    )}
                  </div>
                  <span className="text-secondary-800 font-medium">{option}</span>
                  {element.correctAnswer === option && (
                    <i className="fas fa-check-circle text-green-500 ml-auto" />
                  )}
                </div>
              </div>
            ))}
          </div>
        );

      case 'multiple-choice':
        return (
          <div className="space-y-2">
            {(element.options || ['Option 1', 'Option 2']).map((option, index) => (
              <div
                key={index}
                className="w-full text-left p-3 rounded-xl border-2 border-secondary-200 bg-secondary-50 transition-all duration-200 cursor-pointer"
                onClick={(e) => e.preventDefault()}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 rounded border-2 border-secondary-300 flex items-center justify-center">
                    {element.correctAnswer === option && (
                      <i className="fas fa-check text-xs text-green-500" />
                    )}
                  </div>
                  <span className="text-secondary-800 font-medium">{option}</span>
                  {element.correctAnswer === option && (
                    <i className="fas fa-check-circle text-green-500 ml-auto" />
                  )}
                </div>
              </div>
            ))}
          </div>
        );

      case 'true-false':
        return (
          <div className="grid grid-cols-2 gap-3">
            <div
              className={`p-4 rounded-xl border-2 font-bold transition-all duration-200 cursor-pointer ${
                element.correctAnswer === 'True'
                  ? 'bg-emerald-100 border-emerald-400 text-emerald-800'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-600'
              }`}
              onClick={(e) => e.preventDefault()}
            >
              <i className="fas fa-check mr-2"></i>
              True
              {element.correctAnswer === 'True' && (
                <i className="fas fa-check-circle text-emerald-600 float-right" />
              )}
            </div>
            <div
              className={`p-4 rounded-xl border-2 font-bold transition-all duration-200 cursor-pointer ${
                element.correctAnswer === 'False'
                  ? 'bg-red-100 border-red-400 text-red-800'
                  : 'bg-red-50 border-red-200 text-red-600'
              }`}
              onClick={(e) => e.preventDefault()}
            >
              <i className="fas fa-times mr-2"></i>
              False
              {element.correctAnswer === 'False' && (
                <i className="fas fa-check-circle text-red-600 float-right" />
              )}
            </div>
          </div>
        );

      case 'text-input':
        return (
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Type your answer here..."
              value={element.correctAnswer || ''}
              readOnly
              className="w-full p-3 border-2 border-secondary-200 rounded-xl bg-secondary-50 text-secondary-600 placeholder-secondary-400"
            />
            <button
              className="w-full bg-primary-500 text-white font-semibold py-3 rounded-xl transition-all duration-200 cursor-default"
              onClick={(e) => e.preventDefault()}
            >
              <i className="fas fa-paper-plane mr-2"></i>
              Submit Answer
            </button>
            {element.correctAnswer && (
              <div className="text-xs text-secondary-600 bg-green-50 p-2 rounded-lg border border-green-200">
                <i className="fas fa-info-circle text-green-600 mr-1"></i>
                Correct answer: <span className="font-semibold">{element.correctAnswer}</span>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="p-4 border-2 border-dashed border-secondary-300 rounded-xl text-center text-secondary-500">
            <i className="fas fa-question-circle text-2xl mb-2"></i>
            <p>Select question type in inspector</p>
          </div>
        );
    }
  };

  return (
    <div
      className={`drag-handle bg-white/95 backdrop-blur-md rounded-2xl shadow-large border-2 p-6 min-w-80 max-w-md transition-all duration-200 ${
        isSelected 
          ? 'border-primary-400 ring-2 ring-primary-200' 
          : 'border-primary-200/50 hover:border-primary-300'
      } ${animationConfig.className}`}
      onClick={handleClick}
      style={{ 
        pointerEvents: 'auto',
        width: '100%',
        height: '100%',
        cursor: 'grab',
        ...animationConfig.style
      }}
      data-element-id={element.id}
    >
      <div className="space-y-4">
        {/* Question Header */}
        <div className="flex items-start justify-between">
          <h4 className="text-lg font-bold text-primary-900 leading-tight pr-2">
            {element.content || 'Question content'}
          </h4>
          <div className="flex items-center space-x-1 px-2 py-1 bg-primary-100 rounded-full shrink-0">
            <i className="fas fa-question-circle text-primary-600 text-sm"></i>
            <span className="text-xs font-semibold text-primary-700 uppercase tracking-wide">
              {element.questionType?.replace('-', ' ') || 'Question'}
            </span>
          </div>
        </div>
        
        {/* Admin Selection Indicator */}
        {isSelected && (
          <div className="text-xs text-primary-600 bg-primary-50 p-2 rounded-lg border border-primary-200">
            <i className="fas fa-edit mr-1"></i>
            Admin Mode - Edit in inspector panel
          </div>
        )}

        {/* Question Content */}
        {renderQuestionContent()}
        
        {/* Admin Preview Notice */}
        <div className="text-xs text-secondary-500 bg-secondary-50 p-2 rounded-lg border border-secondary-200">
          <i className="fas fa-eye mr-1"></i>
          Preview mode - Use inspector to modify options
        </div>
      </div>
    </div>
  );
};

export default MCQPreview;
