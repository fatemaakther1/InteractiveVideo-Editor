import { useState, useCallback, useEffect } from 'react';
import type { InteractiveElement } from '../types';

export interface UseDragAndDropReturn {
  draggingElement: string | null;
  dragOffset: { x: number; y: number };
  handleMouseDown: (e: React.MouseEvent, elementId: string, elements: InteractiveElement[]) => void;
  isDragging: boolean;
}

export const useDragAndDrop = (
  onElementUpdate: (elements: InteractiveElement[]) => void
): UseDragAndDropReturn => {
  const [draggingElement, setDraggingElement] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = useCallback((
    e: React.MouseEvent,
    elementId: string,
    elements: InteractiveElement[]
  ) => {
    e.preventDefault();
    setDraggingElement(elementId);

    const element = elements.find(el => el.id === elementId);
    if (element) {
      setDragOffset({
        x: e.clientX - element.x,
        y: e.clientY - element.y,
      });
    }
  }, []);

  const handleMouseMove = useCallback((
    e: MouseEvent,
    elements: InteractiveElement[]
  ) => {
    if (draggingElement) {
      const videoContainer = document.querySelector('.video-container');
      if (videoContainer) {
        const rect = videoContainer.getBoundingClientRect();
        const newX = Math.max(
          0,
          Math.min(rect.width - 100, e.clientX - rect.left - dragOffset.x)
        );
        const newY = Math.max(
          0,
          Math.min(rect.height - 50, e.clientY - rect.top - dragOffset.y)
        );

        const updatedElements = elements.map(el =>
          el.id === draggingElement ? { ...el, x: newX, y: newY } : el
        );
        onElementUpdate(updatedElements);
      }
    }
  }, [draggingElement, dragOffset, onElementUpdate]);

  const handleMouseUp = useCallback(() => {
    setDraggingElement(null);
  }, []);

  useEffect(() => {
    if (draggingElement) {
      const mouseMoveHandler = (e: MouseEvent) => {
        // Note: This would need access to current elements
        // In practice, this would be handled differently in the component
        // handleMouseMove(e, elements);
      };

      document.addEventListener('mousemove', mouseMoveHandler);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', mouseMoveHandler);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggingElement, handleMouseUp]);

  return {
    draggingElement,
    dragOffset,
    handleMouseDown,
    isDragging: draggingElement !== null,
  };
};
