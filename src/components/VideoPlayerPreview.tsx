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
} from "../types";
import { VIDEO_CONFIG } from "../constants";
import { elementUtils, getElementAnimationConfig, addBounceClickHandler, ensureElementAnimations } from "../utils";
import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";

const VideoPlayerPreview: React.FC<VideoPlayerPreviewProps> = ({
  elements,
}) => {
  // Simple state variables - easy to understand
  const [currentTime, setCurrentTime] = useState(0); // Current video time in seconds

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
  };

  // Function to get elements that should be visible at current time
  // Only shows elements when video time is between their start and end time
  const getVisibleElements = () => {
    return elementUtils.getVisibleElements(elements, currentTime);
  };

  // Function to render each interactive element on the video
  // This creates the visual representation of buttons, images, etc.
  const renderInteractiveElement = (element: InteractiveElement) => {
    // Ensure element has animation properties
    const elementWithAnimation = ensureElementAnimations(element);
    const animationConfig = getElementAnimationConfig(elementWithAnimation, 'entrance');

    // Render other element types (text, button, image, pointer, opener)
    const getElementStyle = () => {
      const baseStyle: React.CSSProperties = {
        position: 'absolute',
        left: `${element.x}px`,
        top: `${element.y}px`,
        width: element.width ? `${element.width}px` : '120px',
        height: element.height ? `${element.height}px` : '50px',
        padding: '14px',
        cursor: 'pointer',
        userSelect: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        wordBreak: 'break-word',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        backdropFilter: 'blur(8px)',
        // Apply all Advanced Format & Style settings
        fontFamily: element.fontFamily || 'Inter',
        fontSize: element.fontSize ? `${element.fontSize}px` : '14px',
        fontWeight: element.bold ? 'bold' : (element.fontWeight || '600'),
        fontStyle: element.italic ? 'italic' : 'normal',
        textDecoration: [
          element.underline ? 'underline' : '',
          element.strikethrough ? 'line-through' : ''
        ].filter(Boolean).join(' ') || 'none',
        textTransform: element.textCase || 'none',
        textAlign: element.textAlign || 'center',
        color: element.color || 'white',
        letterSpacing: element.letterSpacing ? `${element.letterSpacing}px` : 'normal',
        lineHeight: element.lineHeight || 'normal',
        borderRadius: element.borderRadius ? `${element.borderRadius}px` : '12px',
        opacity: element.opacity !== undefined ? element.opacity / 100 : 1,
        // Apply visual effects
        filter: [
          element.blur ? `blur(${element.blur}px)` : '',
          element.brightness !== undefined && element.brightness !== 100 ? `brightness(${element.brightness}%)` : '',
          element.grayscale ? `grayscale(${element.grayscale}%)` : ''
        ].filter(Boolean).join(' ') || 'none',
        ...animationConfig.style, // Add animation CSS variables
      };
      
      // Apply custom box shadow if specified, otherwise use default
      if (element.boxShadow) {
        baseStyle.boxShadow = element.boxShadow;
      }

      // Type-specific styling with blue theme variations
      switch (element.type) {
        case 'interactive-button':
          baseStyle.background = element.backgroundColor || 'rgba(14, 165, 233, 0.95)';
          baseStyle.border = '3px solid rgba(14, 165, 233, 0.8)';
          baseStyle.boxShadow = '0 8px 25px rgba(14, 165, 233, 0.4), 0 4px 12px rgba(0, 0, 0, 0.15)';
          break;
        case 'image':
          baseStyle.background = element.url ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.95)';
          baseStyle.border = element.url ? 'none' : '2px solid rgba(16, 185, 129, 0.8)';
          baseStyle.padding = element.url ? '0' : '14px';
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
        {element.type === 'image' ? (
          element.url ? (
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
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/70">
              <div className="text-center">
                <i className="fas fa-plus text-4xl mb-2"></i>
                <div className="text-sm font-medium">No Image</div>
              </div>
            </div>
          )
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


