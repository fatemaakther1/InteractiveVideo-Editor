import React, { forwardRef, useState, useRef, useImperativeHandle } from 'react';
import { MediaPlayer, MediaProvider, MediaPlayerInstance } from '@vidstack/react';
import {
  defaultLayoutIcons,
  DefaultVideoLayout,
} from '@vidstack/react/player/layouts/default';
import type { InteractiveElement, VideoPlayerAdminProps, VideoPlayerRef, Position } from '../types';
import { VIDEO_CONFIG } from '../constants';
import { elementUtils } from '../utils';
import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';

const VideoPlayerAdmin = forwardRef<VideoPlayerRef, VideoPlayerAdminProps>(
  ({ elements, onAddElement }, ref) => {
    const [currentTime, setCurrentTime] = useState(0);
    const [showAddButton, setShowAddButton] = useState(false);
    const [addButtonPosition, setAddButtonPosition] = useState<Position>({ x: 0, y: 0 });
    const playerRef = useRef<MediaPlayerInstance>(null);

    useImperativeHandle(ref, () => ({
      get currentTime() {
        return currentTime;
      }
    }));

    const handleVideoClick = (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setAddButtonPosition({ x, y });
      setShowAddButton(true);
    };

    const handleAddClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onAddElement(addButtonPosition.x, addButtonPosition.y);
      setShowAddButton(false);
    };

    const getVisibleElements = () => {
      return elementUtils.getVisibleElements(elements, currentTime);
    };

    const renderInteractiveElement = (element: InteractiveElement) => {
      return (
        <div
          key={element.id}
          className={`interactive-element ${element.type} admin-mode`}
          style={{
            left: `${element.x}px`,
            top: `${element.y}px`,
            minWidth: element.type === 'interactive-question' ? '200px' : 'auto',
          }}
          onClick={(e) => e.stopPropagation()}
          title={`${element.type}: ${element.content}`}
        >
          {element.type === 'image' && element.url ? (
            <img src={element.url} alt={element.content} className="element-image" />
          ) : (
            <div className="element-content">
              <span className="element-text">{element.content}</span>
              <span className="element-type-badge">{element.type}</span>
            </div>
          )}
        </div>
      );
    };

    return (
      <div className="video-player-admin">
        <div
          className="video-wrapper"
          onClick={handleVideoClick}
        >
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

          {/* Interactive Elements Overlay */}
          <div className="interactive-overlay">
            {getVisibleElements().map(element => renderInteractiveElement(element))}
          </div>
        </div>
      </div>
    );
  }
);

VideoPlayerAdmin.displayName = 'VideoPlayerAdmin';

export default VideoPlayerAdmin;
