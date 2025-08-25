import React, { useRef } from 'react';
import VideoPlayerAdmin from '../video/VideoPlayerAdmin';
import ResizableDraggableElement from '../elements/ResizableDraggableElement';
import type { InteractiveElement, VideoPlayerRef } from '../../types';

export interface VideoCanvasProps {
  elements: InteractiveElement[];
  selectedElement: InteractiveElement | null;
  currentTime: number;
  onAddElement: (x: number, y: number) => void;
  onUpdateElement: (element: InteractiveElement) => void;
  onSelectElement: (element: InteractiveElement) => void;
  onTimeUpdate: (time: number) => void;
}

const VideoCanvas: React.FC<VideoCanvasProps> = ({
  elements,
  selectedElement,
  currentTime,
  onAddElement,
  onUpdateElement,
  onSelectElement,
  onTimeUpdate,
}) => {
  const videoRef = useRef<VideoPlayerRef>(null);

  const getVisibleElements = (): InteractiveElement[] => {
    return elements.filter(
      (element) =>
        currentTime >= element.timestamp && currentTime <= element.endTime
    );
  };

  return (
    <section className="flex-1 flex flex-col bg-gradient-to-br from-secondary-100/50 to-secondary-200/30">
      <div className="flex-1 relative m-6 rounded-2xl shadow-large border border-secondary-200/50 video-container bg-black overflow-hidden" style={{ minHeight: '500px' }}>
        {/* Video Player */}
        <VideoPlayerAdmin
          ref={videoRef}
          elements={elements}
          onAddElement={onAddElement}
          onTimeUpdate={onTimeUpdate}
        />

        {/* Interactive Elements Overlay Container with proper bounds */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ 
            zIndex: 10,
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0
          }}
          id="elements-container"
        >
          {getVisibleElements().map((element) => (
            <div key={element.id} className="pointer-events-auto">
              <ResizableDraggableElement
                element={element}
                onUpdate={onUpdateElement}
                onSelect={onSelectElement}
                isSelected={selectedElement?.id === element.id}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default VideoCanvas;
