import { useState, useRef } from "react";
import {
  MediaPlayer,
  MediaProvider,
  MediaPlayerInstance,
} from "@vidstack/react";
import {
  defaultLayoutIcons,
  DefaultVideoLayout,
} from "@vidstack/react/player/layouts/default";
import type {
  InteractiveElement,
  VideoPlayerPreviewProps,
  AnswerState,
  ResultsState,
} from "../types";
import { VIDEO_CONFIG, UI_CONSTANTS } from "../constants";
import { elementUtils, getElementAnimationConfig, addBounceClickHandler, ensureElementAnimations } from "../utils";
import { createAnswerFeedbackHandler } from "../utils/animationUtils";
import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";

const VideoPlayerPreview: React.FC<VideoPlayerPreviewProps> = ({
  elements,
}) => {
  // Simple state variables - easy to understand
  const [currentTime, setCurrentTime] = useState(0); // Current video time in seconds
  const [selectedAnswer, setSelectedAnswer] = useState<AnswerState>({}); // User's answers to questions
  const [showResults, setShowResults] = useState<ResultsState>({}); // Show/hide question results

  // Reference to the video player - allows us to control the video
  const playerRef = useRef<MediaPlayerInstance>(null);

  // Function to handle clicks on different types of interactive elements
  // This is called when user clicks on buttons, images, etc.
  const handleElementClick = (element: InteractiveElement) => {
    // Check what type of element was clicked
    if (element.type === "image" && element.url) {
      // If it's an image, open the URL in a new tab
      window.open(element.url, "_blank");
    } else if (
      (element.type === "interactive-button" || element.type === "opener") &&
      element.action
    ) {
      // If it's a button or opener, show an alert with the action
      alert(`Action: ${element.action}`);
    }
    // Questions are handled separately in handleQuestionAnswer
  };

  // Function to handle when user answers a question
  // This saves their answer and shows the result
  const handleQuestionAnswer = (
    element: InteractiveElement,
    answer: string
  ) => {
    // Save the user's answer for this question
    setSelectedAnswer((prev) => ({ ...prev, [element.id]: answer }));
    // Show the result
    setShowResults((prev) => ({ ...prev, [element.id]: true }));

    // Hide the result after a few seconds
    setTimeout(() => {
      setShowResults((prev) => ({ ...prev, [element.id]: false }));
    }, UI_CONSTANTS.RESULT_AUTO_HIDE_DELAY);
  };

  // Function to get elements that should be visible at current time
  // Only shows elements when video time is between their start and end time
  const getVisibleElements = () => {
    return elementUtils.getVisibleElements(elements, currentTime);
  };

  // Function to render each interactive element on the video
  // This creates the visual representation of buttons, questions, etc.
  const renderInteractiveElement = (element: InteractiveElement) => {
    // Check if user answered correctly (only for questions)
    const isCorrect = selectedAnswer[element.id] === element.correctAnswer;
    // Check if we should show the result
    const showResult = showResults[element.id];
    
    // Ensure element has animation properties
    const elementWithAnimation = ensureElementAnimations(element);
    const animationConfig = getElementAnimationConfig(elementWithAnimation, 'entrance');

    // Element positioning and sizing - use all configured properties
    const elementStyle: React.CSSProperties = {
      left: `${element.x}px`, // Horizontal position
      top: `${element.y}px`, // Vertical position
      width: element.width ? `${element.width}px` : undefined, // Use configured width if available
      height: element.height ? `${element.height}px` : undefined, // Use configured height if available
      // Apply formatting styles
      fontWeight: element.bold ? 'bold' : 'normal',
      fontStyle: element.italic ? 'italic' : 'normal',
      textDecoration: [
        element.underline ? 'underline' : '',
        element.strikethrough ? 'line-through' : ''
      ].filter(Boolean).join(' ') || 'none',
      textAlign: element.textAlign || 'left',
      color: element.color || 'white',
      backgroundColor: element.backgroundColor || 'transparent',
      opacity: element.opacity !== undefined ? element.opacity / 100 : 1,
      ...animationConfig.style, // Add animation CSS variables
    };

    if (element.type === "interactive-question") {
      return (
        <div
          key={element.id}
          className={`absolute bg-white/95 backdrop-blur-md rounded-2xl shadow-large border border-primary-200/50 p-6 min-w-80 max-w-md ${animationConfig.className}`}
          style={{ ...elementStyle, pointerEvents: 'auto' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <h4 className="text-lg font-bold text-primary-900 leading-tight">{element.content}</h4>
              <div className="flex items-center space-x-1 px-2 py-1 bg-primary-100 rounded-full">
                <i className="fas fa-question-circle text-primary-600 text-sm"></i>
                <span className="text-xs font-semibold text-primary-700 uppercase tracking-wide">Question</span>
              </div>
            </div>
            
            {!showResult && (
              <div className="space-y-3">
                {element.questionType === "multiple-choice" && element.options && (
                  <div className="space-y-2">
                    {element.options.map((option, index) => {
                      const answerFeedbackHandler = createAnswerFeedbackHandler(handleQuestionAnswer, element);
                      return (
                        <button
                          key={index}
                          className="w-full text-left p-3 rounded-xl border-2 border-secondary-200 hover:border-primary-300 hover:bg-primary-50 transition-all duration-200 group"
                          onClick={(e) => answerFeedbackHandler(e, option)}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-5 h-5 rounded-full border-2 border-secondary-300 group-hover:border-primary-500 flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-primary-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </div>
                            <span className="text-secondary-800 group-hover:text-primary-800 font-medium">{option}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {element.questionType === "true-false" && (
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      className="p-4 rounded-xl bg-emerald-50 border-2 border-emerald-200 hover:border-emerald-400 hover:bg-emerald-100 text-emerald-800 font-bold transition-all duration-200 transform hover:scale-105"
                      onClick={(e) => {
                        const answerFeedbackHandler = createAnswerFeedbackHandler(handleQuestionAnswer, element);
                        answerFeedbackHandler(e, "True");
                      }}
                    >
                      <i className="fas fa-check mr-2"></i>
                      True
                    </button>
                    <button
                      className="p-4 rounded-xl bg-red-50 border-2 border-red-200 hover:border-red-400 hover:bg-red-100 text-red-800 font-bold transition-all duration-200 transform hover:scale-105"
                      onClick={(e) => {
                        const answerFeedbackHandler = createAnswerFeedbackHandler(handleQuestionAnswer, element);
                        answerFeedbackHandler(e, "False");
                      }}
                    >
                      <i className="fas fa-times mr-2"></i>
                      False
                    </button>
                  </div>
                )}

                {element.questionType === "text-input" && (
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Type your answer here..."
                      className="w-full p-3 border-2 border-secondary-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200 text-secondary-800 placeholder-secondary-500"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleQuestionAnswer(element, e.currentTarget.value);
                        }
                      }}
                    />
                    <button
                      className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-medium"
                      onClick={(e) => {
                        const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                        handleQuestionAnswer(element, input.value);
                      }}
                    >
                      <i className="fas fa-paper-plane mr-2"></i>
                      Submit Answer
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {showResult && (
              <div className={`p-4 rounded-xl border-2 animate-fade-in ${
                isCorrect 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                <div className="flex items-center space-x-2 mb-2">
                  <i className={`fas ${isCorrect ? 'fa-check-circle' : 'fa-times-circle'} text-xl`}></i>
                  <span className="font-bold text-lg">
                    {isCorrect ? 'Correct!' : 'Incorrect'}
                  </span>
                </div>
                <div className="space-y-1 text-sm">
                  <p><span className="font-semibold">Correct answer:</span> {element.correctAnswer}</p>
                  <p><span className="font-semibold">Your answer:</span> {selectedAnswer[element.id]}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Render other element types (text, button, image, pointer, opener)
    const getElementStyle = () => {
      const baseStyle: React.CSSProperties = {
        position: 'absolute',
        left: `${element.x}px`,
        top: `${element.y}px`,
        width: element.width ? `${element.width}px` : '120px',
        height: element.height ? `${element.height}px` : '50px',
        padding: '14px',
        borderRadius: '12px',
        fontSize: '14px',
        cursor: 'pointer',
        userSelect: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        wordBreak: 'break-word',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        backdropFilter: 'blur(8px)',
        // Apply formatting styles
        fontWeight: element.bold ? 'bold' : '600', // Keep some weight for visibility
        fontStyle: element.italic ? 'italic' : 'normal',
        textDecoration: [
          element.underline ? 'underline' : '',
          element.strikethrough ? 'line-through' : ''
        ].filter(Boolean).join(' ') || 'none',
        textAlign: element.textAlign || 'center',
        color: element.color || 'white',
        opacity: element.opacity !== undefined ? element.opacity / 100 : 1,
        ...animationConfig.style, // Add animation CSS variables
      };

      // Type-specific styling with blue theme variations
      switch (element.type) {
        case 'interactive-button':
          baseStyle.background = element.backgroundColor || 'rgba(14, 165, 233, 0.95)';
          baseStyle.border = '3px solid rgba(14, 165, 233, 0.8)';
          baseStyle.boxShadow = '0 8px 25px rgba(14, 165, 233, 0.4), 0 4px 12px rgba(0, 0, 0, 0.15)';
          break;
        case 'image':
          baseStyle.background = element.backgroundColor || 'transparent';
          baseStyle.border = 'none';
          baseStyle.padding = '0';
          baseStyle.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.3)';
          break;
        case 'pointer':
          baseStyle.background = element.backgroundColor || 'rgba(245, 158, 11, 0.95)';
          baseStyle.border = '3px solid rgba(245, 158, 11, 0.8)';
          baseStyle.borderRadius = '50%';
          baseStyle.width = '48px';
          baseStyle.height = '48px';
          baseStyle.fontSize = '22px';
          baseStyle.boxShadow = '0 8px 25px rgba(245, 158, 11, 0.4), 0 4px 12px rgba(0, 0, 0, 0.15)';
          break;
        case 'opener':
          baseStyle.background = element.backgroundColor || 'rgba(59, 130, 246, 0.95)';
          baseStyle.border = '3px solid rgba(59, 130, 246, 0.8)';
          baseStyle.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.4), 0 4px 12px rgba(0, 0, 0, 0.15)';
          break;
        default:
          // Default blue styling for 'text' and others
          baseStyle.background = element.backgroundColor || 'rgba(37, 99, 235, 0.95)';
          baseStyle.border = '3px solid rgba(37, 99, 235, 0.8)';
          baseStyle.boxShadow = '0 8px 25px rgba(37, 99, 235, 0.4), 0 4px 12px rgba(0, 0, 0, 0.15)';
          break;
      }

      return baseStyle;
    };

    return (
      <div
        key={element.id}
        className={animationConfig.className}
        style={{ ...getElementStyle(), pointerEvents: 'auto' }}
        onClick={addBounceClickHandler(handleElementClick, elementWithAnimation)}
      >
        {element.type === 'image' && element.url ? (
          <img
            src={element.url}
            alt={element.content}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
            draggable={false}
          />
        ) : element.type === 'pointer' ? (
          '👆'
        ) : (
          element.content
        )}
      </div>
    );
  };

  // Main render - this is what gets displayed on the page
  return (
    <div className="video-player-preview">
      <div className="video-wrapper" style={{ position: "relative" }}>
        {/* The actual video player */}
        <MediaPlayer
          ref={playerRef}
          className="video-player"
          src={VIDEO_CONFIG.URL}
          playsInline
          onTimeUpdate={({ currentTime }) => setCurrentTime(currentTime)}
          style={{
            width: "100%",
            height: "auto",
            display: "block",
          }}
        >
          <MediaProvider />
          <DefaultVideoLayout icons={defaultLayoutIcons} thumbnails="" />
        </MediaPlayer>

        {/* Layer that sits on top of the video to show interactive elements */}
        <div className="interactive-overlay" style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none'
        }}>
          {/* Show all elements that should be visible at current time */}
          {getVisibleElements().map((element) => renderInteractiveElement(element))}
        </div>
      </div>
    </div>
  );
};

export default VideoPlayerPreview;


