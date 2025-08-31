import React, { useState } from 'react';
import TimingInspector from '../inspector/TimingInspector';
import InteractiveQuizAdmin from '../quiz/InteractiveQuizAdmin';
import type { InteractiveElement, InteractiveQuiz } from '../../types';
import { ensureElementAnimations } from '../../utils';
import { triggerAnimationPreview, triggerInteractiveEffectsPreview, previewAnswerFeedbackEffects } from '../../utils/animationUtils';

export interface InspectorPanelProps {
  selectedElement: InteractiveElement | null;
  onUpdateElement: (element: InteractiveElement) => void;
  onDeleteElement: (elementId: string) => void;
}

type InspectorTab = 'timing' | 'format' | 'effects' | 'quiz';

const InspectorPanel: React.FC<InspectorPanelProps> = ({
  selectedElement,
  onUpdateElement,
  onDeleteElement,
}) => {
  const [activeTab, setActiveTab] = useState<InspectorTab>(
    selectedElement?.type === 'interactive-quiz' ? 'quiz' : 'timing'
  );
  
  const handleQuizUpdate = (quiz: InteractiveQuiz) => {
    if (!selectedElement) return;
    const updatedElement = { ...selectedElement, quiz };
    onUpdateElement(updatedElement);
  };
  
  if (!selectedElement) {
    return (
      <aside className="bg-white/95 backdrop-blur-sm border-l border-secondary-200 flex flex-col shadow-soft" style={{width: '480px'}}>
        <div className="flex-1 flex flex-col items-center justify-center h-64 text-gray-500 p-6">
          <i className="fas fa-mouse-pointer text-4xl mb-4 text-gray-300" />
          <p className="text-sm text-center">
            Select an element from the timeline or canvas to edit its properties
          </p>
        </div>
      </aside>
    );
  }

  const formatContent = (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white shadow-medium">
          <i className="fas fa-palette" />
        </div>
        <div>
          <h2 className="font-bold text-secondary-900">Format & Style</h2>
          <p className="text-xs text-secondary-500">Customize the appearance</p>
        </div>
      </div>

      {/* Text Styling */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-secondary-200 shadow-soft">
        <h3 className="text-sm font-bold text-secondary-800 mb-3 flex items-center">
          <i className="fas fa-font mr-2 text-primary-600" />
          Text Styling
        </h3>
        <div className="grid grid-cols-6 gap-2">
          {[
            { icon: 'fa-bold', title: 'Bold' },
            { icon: 'fa-italic', title: 'Italic' },
            { icon: 'fa-underline', title: 'Underline' },
            { icon: 'fa-strikethrough', title: 'Strikethrough' },
            { icon: 'fa-align-left', title: 'Align Left' },
            { icon: 'fa-align-center', title: 'Align Center' },
          ].map(({ icon, title }) => (
            <button
              key={icon}
              className="p-3 text-secondary-600 hover:text-white hover:bg-primary-600 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-soft hover:shadow-medium"
              title={title}
            >
              <i className={`fas ${icon}`} />
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-secondary-200 shadow-soft">
        <label className="block text-sm font-bold text-secondary-800 mb-3 flex items-center">
          <i className="fas fa-edit mr-2 text-primary-600" />
          Content
        </label>
        <textarea
          value={selectedElement.content}
          onChange={(e) => onUpdateElement({ ...selectedElement, content: e.target.value })}
          placeholder="Write your text content here..."
          rows={4}
          className="w-full px-4 py-3 border-2 border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 resize-none bg-secondary-50 text-secondary-900 placeholder-secondary-500"
        />
      </div>

      {/* Question Configuration - Only show for question elements */}
      {selectedElement.type === 'interactive-question' && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-secondary-200 shadow-soft">
          <h3 className="text-sm font-bold text-secondary-800 mb-4 flex items-center">
            <i className="fas fa-question-circle mr-2 text-blue-600" />
            Question Configuration
          </h3>
          
          <div className="space-y-4">
            {/* Question Type */}
            <div>
              <label className="block text-sm font-bold text-secondary-800 mb-2">
                Question Type
              </label>
              <select 
                value={selectedElement.questionType || 'single-choice'}
                onChange={(e) => onUpdateElement({ 
                  ...selectedElement, 
                  questionType: e.target.value as any,
                  // Reset options and correctAnswer when changing question type
                  options: (e.target.value === 'single-choice' || e.target.value === 'multiple-choice') ? ['Option 1', 'Option 2'] : undefined,
                  correctAnswer: e.target.value === 'true-false' ? 'True' : ((e.target.value === 'single-choice' || e.target.value === 'multiple-choice') ? 'Option 1' : '')
                })}
                className="w-full px-4 py-3 border-2 border-secondary-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-secondary-50"
              >
                <option value="single-choice">Single Choice (Radio)</option>
                <option value="multiple-choice">Multiple Choice (Checkbox)</option>
                <option value="true-false">True/False</option>
                <option value="text-input">Text Input</option>
              </select>
            </div>

            {/* Single Choice and Multiple Choice Options */}
            {(selectedElement.questionType === 'single-choice' || selectedElement.questionType === 'multiple-choice') && (
              <div>
                <label className="block text-sm font-bold text-secondary-800 mb-3">
                  Answer Options
                </label>
                <div className="space-y-2">
                  {(selectedElement.options || ['Option 1', 'Option 2']).map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id={`correct-${index}`}
                        name="correctAnswer"
                        checked={selectedElement.correctAnswer === option}
                        onChange={() => onUpdateElement({ ...selectedElement, correctAnswer: option })}
                        className="w-4 h-4 text-green-600 border-secondary-300 focus:ring-green-500"
                      />
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...(selectedElement.options || [])];
                          const oldOption = newOptions[index];
                          newOptions[index] = e.target.value;
                          // Update correctAnswer if this was the correct option
                          const newCorrectAnswer = selectedElement.correctAnswer === oldOption ? e.target.value : selectedElement.correctAnswer;
                          onUpdateElement({ 
                            ...selectedElement, 
                            options: newOptions,
                            correctAnswer: newCorrectAnswer
                          });
                        }}
                        placeholder={`Option ${index + 1}`}
                        className="flex-1 px-3 py-2 border-2 border-secondary-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-secondary-50"
                      />
                      <button
                        onClick={() => {
                          const newOptions = selectedElement.options?.filter((_, i) => i !== index) || [];
                          // If we're removing the correct answer, set the first remaining option as correct
                          const newCorrectAnswer = selectedElement.correctAnswer === option 
                            ? (newOptions[0] || '') 
                            : selectedElement.correctAnswer;
                          onUpdateElement({ 
                            ...selectedElement, 
                            options: newOptions.length > 0 ? newOptions : undefined,
                            correctAnswer: newCorrectAnswer
                          });
                        }}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                        title="Remove option"
                      >
                        <i className="fas fa-trash text-sm" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const currentOptions = selectedElement.options || [];
                      const newOption = `Option ${currentOptions.length + 1}`;
                      const newOptions = [...currentOptions, newOption];
                      onUpdateElement({ 
                        ...selectedElement, 
                        options: newOptions,
                        // Set as correct answer if it's the first option
                        correctAnswer: selectedElement.correctAnswer || newOption
                      });
                    }}
                    className="w-full p-2 border-2 border-dashed border-secondary-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 text-secondary-600 hover:text-blue-700 transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <i className="fas fa-plus text-sm" />
                    <span className="text-sm font-medium">Add Option</span>
                  </button>
                </div>
                <p className="text-xs text-secondary-500 mt-2">
                  <i className="fas fa-info-circle mr-1" />
                  Select the radio button to mark an option as correct
                </p>
              </div>
            )}

            {/* True/False Correct Answer */}
            {selectedElement.questionType === 'true-false' && (
              <div>
                <label className="block text-sm font-bold text-secondary-800 mb-3">
                  Correct Answer
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => onUpdateElement({ ...selectedElement, correctAnswer: 'True' })}
                    className={`p-3 rounded-xl border-2 font-bold transition-all duration-200 ${
                      selectedElement.correctAnswer === 'True'
                        ? 'bg-emerald-100 border-emerald-400 text-emerald-800'
                        : 'bg-secondary-50 border-secondary-200 text-secondary-600 hover:border-emerald-300'
                    }`}
                  >
                    <i className="fas fa-check mr-2" />
                    True
                  </button>
                  <button
                    onClick={() => onUpdateElement({ ...selectedElement, correctAnswer: 'False' })}
                    className={`p-3 rounded-xl border-2 font-bold transition-all duration-200 ${
                      selectedElement.correctAnswer === 'False'
                        ? 'bg-red-100 border-red-400 text-red-800'
                        : 'bg-secondary-50 border-secondary-200 text-secondary-600 hover:border-red-300'
                    }`}
                  >
                    <i className="fas fa-times mr-2" />
                    False
                  </button>
                </div>
              </div>
            )}

            {/* Text Input Correct Answer */}
            {selectedElement.questionType === 'text-input' && (
              <div>
                <label className="block text-sm font-bold text-secondary-800 mb-2">
                  Correct Answer
                </label>
                <input
                  type="text"
                  value={selectedElement.correctAnswer || ''}
                  onChange={(e) => onUpdateElement({ ...selectedElement, correctAnswer: e.target.value })}
                  placeholder="Enter the correct answer..."
                  className="w-full px-4 py-3 border-2 border-secondary-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-secondary-50"
                />
                <p className="text-xs text-secondary-500 mt-1">
                  Text input answers are case-sensitive
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Style Controls */}
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-secondary-200 shadow-soft">
          <label className="block text-sm font-bold text-secondary-800 mb-3 flex items-center">
            <i className="fas fa-palette mr-2 text-primary-600" />
            Background Color
          </label>
          <div className="flex items-center space-x-3">
            <input
              type="color"
              defaultValue="#2563eb"
              className="w-12 h-12 border-2 border-secondary-200 rounded-xl cursor-pointer shadow-soft"
            />
            <div className="flex-1">
              <span className="text-sm font-mono text-secondary-700 block">
                Primary Blue
              </span>
              <span className="text-xs text-secondary-500">#2563eb</span>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-secondary-200 shadow-soft">
          <label className="block text-sm font-bold text-secondary-800 mb-3 flex items-center">
            <i className="fas fa-adjust mr-2 text-primary-600" />
            Transparency
          </label>
          <div className="flex items-center space-x-3">
            <input
              type="range"
              min="0"
              max="100"
              defaultValue="100"
              className="flex-1 accent-primary-600"
            />
            <span className="text-sm font-mono text-secondary-700 min-w-12 text-center">
              100%
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  // Ensure element has animation properties with defaults
  const elementWithAnimation = ensureElementAnimations(selectedElement);
  const animation = elementWithAnimation.animation!;

  // Helper to update animation properties
  const updateAnimation = (updates: Partial<typeof animation>) => {
    const updatedElement = {
      ...selectedElement,
      animation: {
        ...animation,
        ...updates,
      },
    };
    onUpdateElement(updatedElement);

    // Auto-preview when animation settings change (with a small delay to allow DOM to update)
    setTimeout(() => {
      if (updates.entrance || updates.exit) {
        // Preview entrance animation when entrance is changed
        if (updates.entrance) {
          triggerAnimationPreview(selectedElement.id, 'entrance', updatedElement);
        }
        // Preview exit animation when exit is changed
        if (updates.exit) {
          triggerAnimationPreview(selectedElement.id, 'exit', updatedElement);
        }
      }
      
      // Preview interactive effects when they change
      if (updates.interactiveEffects) {
        triggerInteractiveEffectsPreview(selectedElement.id, updatedElement.animation?.interactiveEffects);
      }
    }, 100);
  };

  // Helper to manually trigger animation preview
  const handlePreviewAnimation = (type: 'entrance' | 'exit') => {
    triggerAnimationPreview(selectedElement.id, type, elementWithAnimation);
  };

  // Helper to manually trigger interactive effects preview
  const handlePreviewEffects = () => {
    triggerInteractiveEffectsPreview(selectedElement.id, animation.interactiveEffects);
  };

  const effectsContent = (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500 to-primary-600 flex items-center justify-center text-white shadow-medium">
          <i className="fas fa-magic" />
        </div>
        <div>
          <h2 className="font-bold text-secondary-900">Effects & Animation</h2>
          <p className="text-xs text-secondary-500">Add visual effects and animations</p>
        </div>
      </div>

      {/* Entrance Animation */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-secondary-200 shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-secondary-800 flex items-center">
            <i className="fas fa-play mr-2 text-primary-600" />
            Entrance Animation
          </h3>
          <button
            onClick={() => handlePreviewAnimation('entrance')}
            className="px-3 py-1.5 bg-primary-100 hover:bg-primary-200 text-primary-700 text-xs font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-soft hover:shadow-medium flex items-center space-x-1"
            title="Preview entrance animation"
          >
            <i className="fas fa-eye text-xs" />
            <span>Preview</span>
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-secondary-800 mb-3">
              Animation Type
            </label>
            <select 
              value={animation.entrance || 'fadeIn'}
              onChange={(e) => updateAnimation({ entrance: e.target.value as any })}
              className="w-full px-4 py-3 border-2 border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-secondary-50"
            >
              <option value="none">None</option>
              <option value="fadeIn">Fade in</option>
              <option value="slideInLeft">Slide in from left</option>
              <option value="slideInRight">Slide in from right</option>
              <option value="scaleIn">Scale in</option>
              <option value="bounceIn">Bounce in</option>
            </select>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-bold text-secondary-800">
                Exit Animation
              </label>
              <button
                onClick={() => handlePreviewAnimation('exit')}
                className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-soft hover:shadow-medium flex items-center space-x-1"
                title="Preview exit animation"
              >
                <i className="fas fa-eye text-xs" />
                <span>Preview</span>
              </button>
            </div>
            <select 
              value={animation.exit || 'fadeOut'}
              onChange={(e) => updateAnimation({ exit: e.target.value as any })}
              className="w-full px-4 py-3 border-2 border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-secondary-50"
            >
              <option value="none">None</option>
              <option value="fadeOut">Fade out</option>
              <option value="slideOutLeft">Slide out to left</option>
              <option value="slideOutRight">Slide out to right</option>
              <option value="scaleOut">Scale out</option>
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-secondary-800 mb-2">
                Duration (ms)
              </label>
              <input
                type="number"
                value={animation.duration || 300}
                onChange={(e) => updateAnimation({ duration: parseInt(e.target.value) || 300 })}
                min="100"
                max="2000"
                step="50"
                className="w-full px-3 py-2 border-2 border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-secondary-50"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-secondary-800 mb-2">
                Delay (ms)
              </label>
              <input
                type="number"
                value={animation.delay || 0}
                onChange={(e) => updateAnimation({ delay: parseInt(e.target.value) || 0 })}
                min="0"
                max="5000"
                step="100"
                className="w-full px-3 py-2 border-2 border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-secondary-50"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-secondary-800 mb-3">
              Easing
            </label>
            <select 
              value={animation.easing || 'ease-in-out'}
              onChange={(e) => updateAnimation({ easing: e.target.value as any })}
              className="w-full px-4 py-3 border-2 border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-secondary-50"
            >
              <option value="ease">Ease</option>
              <option value="ease-in">Ease In</option>
              <option value="ease-out">Ease Out</option>
              <option value="ease-in-out">Ease In-Out</option>
            </select>
          </div>
        </div>
      </div>

      {/* Interactive Effects */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-secondary-200 shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-secondary-800 flex items-center">
            <i className="fas fa-heartbeat mr-2 text-primary-600" />
            Interactive Effects
          </h3>
          <button
            onClick={handlePreviewEffects}
            className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-700 text-xs font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-soft hover:shadow-medium flex items-center space-x-1"
            title="Preview all interactive effects"
          >
            <i className="fas fa-magic text-xs" />
            <span>Preview</span>
          </button>
        </div>
        <div className="space-y-3">
          {[
            { 
              key: 'pulseWhenVisible', 
              label: 'Pulse when visible', 
              desc: 'Element pulses to draw attention',
              checked: animation.interactiveEffects?.pulseWhenVisible || false
            },
            { 
              key: 'bounceOnClick', 
              label: 'Bounce on interaction', 
              desc: 'Element bounces when clicked',
              checked: animation.interactiveEffects?.bounceOnClick || false
            },
            { 
              key: 'scaleOnHover', 
              label: 'Scale on hover', 
              desc: 'Element grows slightly on hover',
              checked: animation.interactiveEffects?.scaleOnHover || false
            },
          ].map(({ key, label, desc, checked }) => (
            <div key={key} className="flex justify-between items-start p-3 bg-secondary-50 rounded-xl">
              <div className="flex-1">
                <span className="text-sm font-medium text-secondary-700 block">{label}</span>
                <span className="text-xs text-secondary-500">{desc}</span>
              </div>
              <div className="relative ml-3">
                <input 
                  type="checkbox" 
                  id={`effect-${key}`}
                  checked={checked}
                  onChange={(e) => updateAnimation({ 
                    interactiveEffects: {
                      ...animation.interactiveEffects,
                      [key]: e.target.checked
                    }
                  })}
                  className="sr-only peer" 
                />
                <label 
                  htmlFor={`effect-${key}`}
                  className={`relative flex cursor-pointer items-center justify-center rounded-full p-1 transition-colors duration-300 w-12 h-6 ${
                    checked ? 'bg-primary-600 text-white' : 'bg-secondary-300 text-secondary-600'
                  }`}
                >
                  <div className={`absolute left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
                    checked ? 'translate-x-6' : ''
                  }`} />
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );

  // Base tabs for all elements
  const baseTabs = [
    {
      id: 'timing',
      label: 'Timing',
      icon: 'fas fa-clock',
    },
    {
      id: 'format',
      label: 'Format',
      icon: 'fas fa-palette',
    },
    {
      id: 'effects',
      label: 'Effects',
      icon: 'fas fa-magic',
    },
  ];
  
  // Add quiz tab for interactive quiz elements
  const tabs = selectedElement.type === 'interactive-quiz' 
    ? [{
        id: 'quiz',
        label: 'Quiz',
        icon: 'fas fa-question-circle',
      }, ...baseTabs]
    : baseTabs;

  return (
    <aside className="bg-white/95 backdrop-blur-sm border-l border-secondary-200 flex flex-col shadow-soft" style={{width: '480px'}}>
      <div className="p-4 border-b border-secondary-200">
        <div className={`grid gap-2 bg-secondary-100 rounded-xl p-1 ${
          selectedElement.type === 'interactive-quiz' ? 'grid-cols-4' : 'grid-cols-3'
        }`}>
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as InspectorTab)}
                className={`flex flex-col items-center px-3 py-3 text-xs font-bold rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-white text-primary-700 shadow-soft ring-2 ring-primary-200'
                    : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50'
                }`}
              >
                <i className={`${tab.icon} text-lg mb-1`} />
                <span className="uppercase tracking-wider">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-white to-secondary-50">
        {activeTab === 'quiz' && selectedElement.type === 'interactive-quiz' && (
          <InteractiveQuizAdmin
            quiz={selectedElement.quiz}
            onUpdate={handleQuizUpdate}
            currentTime={selectedElement.timestamp}
          />
        )}
        {activeTab === 'timing' && (
          <TimingInspector
            element={selectedElement}
            onUpdate={onUpdateElement}
            onDelete={() => onDeleteElement(selectedElement.id)}
          />
        )}
        {activeTab === 'format' && formatContent}
        {activeTab === 'effects' && effectsContent}
      </div>
    </aside>
  );
};

export default InspectorPanel;
