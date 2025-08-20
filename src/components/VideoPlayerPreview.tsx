import { useState, useRef } from 'react';
import { MediaPlayer, MediaProvider, MediaPlayerInstance } from '@vidstack/react';
import {
  defaultLayoutIcons,
  DefaultVideoLayout,
} from '@vidstack/react/player/layouts/default';
import type { InteractiveElement, VideoPlayerPreviewProps, AnswerState, ResultsState } from '../types';
import { VIDEO_CONFIG, UI_CONSTANTS } from '../constants';
import { elementUtils } from '../utils';
import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';

const VideoPlayerPreview: React.FC<VideoPlayerPreviewProps> = ({ elements }) => {
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
    if (element.type === 'image' && element.url) {
      // If it's an image, open the URL in a new tab
      window.open(element.url, '_blank');
    } else if ((element.type === 'interactive-button' || element.type === 'opener') && element.action) {
      // If it's a button or opener, show an alert with the action
      alert(`Action: ${element.action}`);
    }
    // Questions are handled separately in handleQuestionAnswer
  };

  // Function to handle when user answers a question
  // This saves their answer and shows the result
  const handleQuestionAnswer = (element: InteractiveElement, answer: string) => {
    // Save the user's answer for this question
    setSelectedAnswer(prev => ({ ...prev, [element.id]: answer }));
    // Show the result
    setShowResults(prev => ({ ...prev, [element.id]: true }));
    
    // Hide the result after a few seconds
    setTimeout(() => {
      setShowResults(prev => ({ ...prev, [element.id]: false }));
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
    
    // Simple positioning - just use the x,y coordinates from the element
    const elementStyle = {
      left: `${element.x}px`, // Horizontal position
      top: `${element.y}px`,  // Vertical position
    };
    
    if (element.type === 'interactive-question') {
      return (
        <div
          key={element.id}
          className={`interactive-element ${element.type} clickable preview-mode`}
          style={{
            ...elementStyle,
            minWidth: '250px',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="question-container">
            <h4 className="question-title">{element.content}</h4>
            
            {!showResult && (
              <div className="question-options">
                {element.questionType === 'multiple-choice' && element.options && (
                  <div className="multiple-choice-options">
                    {element.options.map((option, index) => (
                      <div
                        key={index}
                        className="individual-radio-option"
                        onClick={() => handleQuestionAnswer(element, option)}
                      >
                        <input
                          type="radio"
                          name={`question-${element.id}`}
                          value={option}
                          className="radio-input"
                          readOnly
                        />
                        <span className="radio-circle"></span>
                        <span className="option-text">{option}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                {element.questionType === 'true-false' && (
                  <div className="true-false">
                    <button
                      className="option-btn"
                      onClick={() => handleQuestionAnswer(element, 'True')}
                    >
                      True
                    </button>
                    <button
                      className="option-btn"
                      onClick={() => handleQuestionAnswer(element, 'False')}
                    >
                      False
                    </button>
                  </div>
                )}
                
                {element.questionType === 'text-input' && (
                  <div className="text-input">
                    <input
                      type="text"
                      placeholder="Type your answer..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleQuestionAnswer(element, e.currentTarget.value);
                        }
                      }}
                    />
                    <button
                      className="submit-btn"
                      onClick={(e) => {
                        const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                        handleQuestionAnswer(element, input.value);
                      }}
                    >
                      Submit
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {showResult && (
              <div className={`result ${isCorrect ? 'correct' : 'incorrect'}`}>
                <p className="result-text">
                  {isCorrect ? '✅ Correct!' : '❌ Incorrect'}
                </p>
                <p className="correct-answer">Correct answer: {element.correctAnswer}</p>
                <p className="your-answer">Your answer: {selectedAnswer[element.id]}</p>
              </div>
            )}
          </div>
        </div>
      );
    }
    
    // Render other element types
    return (
      <div
        key={element.id}
        className={`interactive-element ${element.type} clickable preview-mode`}
        style={elementStyle}
        onClick={(e) => {
          e.stopPropagation();
          handleElementClick(element);
        }}
        title={element.action || element.url}
      >
        {element.type === 'image' && element.url ? (
          <img src={element.url} alt={element.content} className="element-image" />
        ) : (
          <div className="element-content">
            <span className="element-text">{element.content}</span>
          </div>
        )}
      </div>
    );
  };

  // Main render - this is what gets displayed on the page
  return (
    <div className="video-player-preview">
      <div className="video-wrapper" style={{ position: 'relative' }}>
        {/* The actual video player */}
        <MediaPlayer
          ref={playerRef}
          className="video-player"
          src={VIDEO_CONFIG.URL}
          playsInline
          onTimeUpdate={({ currentTime }) => setCurrentTime(currentTime)}
          style={{
            width: '100%',
            height: 'auto',
            display: 'block'
          }}
        >
          <MediaProvider />
          <DefaultVideoLayout
            icons={defaultLayoutIcons}
            thumbnails=""
          />
        </MediaPlayer>

        {/* Layer that sits on top of the video to show interactive elements */}
        <div className="interactive-overlay">
          {/* Show all elements that should be visible at current time */}
          {getVisibleElements().map(element => renderInteractiveElement(element))}
        </div>
      </div>
    </div>
  );
};

export default VideoPlayerPreview;
