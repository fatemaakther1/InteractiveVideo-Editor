import React, { useRef, forwardRef, useImperativeHandle } from "react";
import VideoPlayerAdmin from "../video/VideoPlayerAdmin";
import ResizableDraggableElement from "../elements/ResizableDraggableElement";
import type { InteractiveElement, VideoPlayerRef } from "../../types";

export interface VideoCanvasProps {
  elements: InteractiveElement[];
  selectedElement: InteractiveElement | null;
  currentTime: number;
  onAddElement: (x: number, y: number) => void;
  onUpdateElement: (element: InteractiveElement) => void;
  onSelectElement: (element: InteractiveElement | null) => void;
  onTimeUpdate: (time: number) => void;
  onSeekVideo?: (time: number) => void;
}

const VideoCanvas = forwardRef<VideoPlayerRef, VideoCanvasProps>((
  {
    elements,
    selectedElement,
    currentTime,
    onAddElement,
    onUpdateElement,
    onSelectElement,
    onTimeUpdate,
  },
  ref
) => {
  const videoRef = useRef<VideoPlayerRef>(null);

  // Forward the video player ref
  useImperativeHandle(ref, () => ({
    get currentTime() {
      return videoRef.current?.currentTime || 0;
    },
    seek: (time: number) => {
      videoRef.current?.seek(time);
    },
  }));

  const getVisibleElements = (): InteractiveElement[] => {
    const visibleElements = elements.filter(
      (element) => {
        const isVisible = currentTime >= element.timestamp && currentTime <= element.endTime;
        // Debug logging for timing issues
        if (selectedElement?.id === element.id) {
          console.log(`Element ${element.id}: currentTime=${currentTime}, start=${element.timestamp}, end=${element.endTime}, visible=${isVisible}`);
        }
        return isVisible;
      }
    );
    return visibleElements;
  };

  // Sort visible elements by their zIndex for proper layering
  // Lower z-index elements are rendered first (behind), higher z-index elements last (on top)
  const getSortedVisibleElements = (): InteractiveElement[] => {
    const visibleElements = getVisibleElements();
    return visibleElements.sort((a, b) => {
      const aZIndex = a.zIndex || 0;
      const bZIndex = b.zIndex || 0;
      return aZIndex - bZIndex; // Lower z-index elements first, higher z-index elements last
    });
  };

  // Calculate z-index for rendering - use element's actual zIndex
  const getElementZIndex = (element: InteractiveElement): number => {
    const baseZIndex = element.zIndex || 0;
    if (selectedElement?.id === element.id) {
      // Selected element gets additional boost
      return baseZIndex + 10000;
    }
    return baseZIndex;
  };

  // Hit detection for overlapping elements
  const isPointInElement = (x: number, y: number, element: InteractiveElement): boolean => {
    const elementWidth = element.width || 120;
    const elementHeight = element.height || 50;
    
    return (
      x >= element.x &&
      x <= element.x + elementWidth &&
      y >= element.y &&
      y <= element.y + elementHeight
    );
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    // Get click coordinates relative to the container
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Find all visible elements at this point
    const visibleElements = getSortedVisibleElements();
    const elementsAtPoint = visibleElements.filter(element => isPointInElement(x, y, element));
    
    if (elementsAtPoint.length > 0) {
      // Select the element with highest z-index (last in sorted array)
      const topElement = elementsAtPoint[elementsAtPoint.length - 1];
      onSelectElement(topElement);
    } else {
      // Clicked on background
      onSelectElement(null);
    }
  };

  return (
    <section className="flex-1 flex flex-col bg-gradient-to-br from-secondary-100/50 to-secondary-200/30">
      <div
        className="flex-1 relative m-6 rounded-2xl shadow-large border border-secondary-200/50 video-container bg-black overflow-hidden"
        style={{ minHeight: "500px" }}
      >
        {/* Video Player */}
        <VideoPlayerAdmin
          ref={videoRef}
          elements={elements}
          onAddElement={onAddElement}
          onTimeUpdate={onTimeUpdate}
        />

        {/* Interactive Elements Overlay Container with proper bounds */}
        <div
          className="absolute inset-0 pointer-events-auto"
          style={{
            zIndex: 10,
            width: "100%",
            height: "90%",
            position: "absolute",
            top: 0,
            left: 0,
          }}
          id="elements-container"
          onClick={handleContainerClick}
        >
          {getSortedVisibleElements().map((element) => (
            <div
              key={element.id}
              className={selectedElement?.id === element.id ? "pointer-events-auto" : "pointer-events-none"}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                zIndex: getElementZIndex(element),
              }}
            >
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
});

VideoCanvas.displayName = "VideoCanvas";

export default VideoCanvas;
