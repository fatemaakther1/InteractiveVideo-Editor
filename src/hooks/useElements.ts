import { useState, useCallback, useEffect } from 'react';
import type { InteractiveElement, ElementType } from '../types';
import { VIDEO_CONFIG } from '../constants';
import { storage, elementUtils, createElementWithDefaults } from '../utils';

export interface UseElementsReturn {
  elements: InteractiveElement[];
  selectedElement: InteractiveElement | null;
  addElement: (elementType: ElementType, position?: { x: number; y: number }) => void;
  updateElement: (updatedElement: InteractiveElement) => void;
  deleteElement: (elementId: string) => void;
  selectElement: (element: InteractiveElement | null) => void;
  bringToFront: (elementId: string) => void;
  getVisibleElements: (currentTime: number) => InteractiveElement[];
  loadProject: () => void;
  saveProject: () => void;
  clearProject: () => void;
}

export const useElements = (currentTime: number = 0): UseElementsReturn => {
  const [elements, setElements] = useState<InteractiveElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<InteractiveElement | null>(null);

  // Load project on mount
  useEffect(() => {
    loadProject();
  }, []);

  // Auto-save functionality
  useEffect(() => {
    const autoSave = () => {
      if (elements.length > 0) {
        const projectData = {
          elements,
          timestamp: new Date().toISOString(),
        };
        storage.save(projectData);
      }
    };

    const interval = setInterval(autoSave, 10000); // Auto-save every 10 seconds
    return () => clearInterval(interval);
  }, [elements]);

  const addElement = useCallback((elementType: ElementType, position = { x: 100, y: 100 }) => {
    const maxZIndex = elements.reduce((max, el) => Math.max(max, el.zIndex || 0), 0);
    const baseElement = {
      id: elementUtils.generateId(),
      type: elementType,
      content: `New ${elementType.replace('-', ' ')}`,
      x: position.x,
      y: position.y,
      timestamp: currentTime,
      endTime: currentTime + VIDEO_CONFIG.DEFAULT_ELEMENT_DURATION,
      zIndex: maxZIndex + 1, // Always add new elements on top
    };

    // Use helper to add default animation properties
    const newElement = createElementWithDefaults(baseElement);

    setElements(prev => [...prev, newElement]);
    setSelectedElement(newElement);
  }, [currentTime, elements]);

  const updateElement = useCallback((updatedElement: InteractiveElement) => {
    setElements(prev => {
      const newElements = prev.map(el => el.id === updatedElement.id ? updatedElement : el);
      // Immediate save when updating element timing or other properties
      const projectData = {
        elements: newElements,
        timestamp: new Date().toISOString(),
      };
      storage.save(projectData);
      return newElements;
    });
    setSelectedElement(updatedElement);
  }, []);

  const deleteElement = useCallback((elementId: string) => {
    setElements(prev => prev.filter(el => el.id !== elementId));
    if (selectedElement?.id === elementId) {
      setSelectedElement(null);
    }
  }, [selectedElement]);

  const selectElement = useCallback((element: InteractiveElement | null) => {
    setSelectedElement(element);
  }, []);

  const bringToFront = useCallback((elementId: string) => {
    setElements(prev => {
      const maxZIndex = prev.reduce((max, el) => Math.max(max, el.zIndex || 0), 0);
      const newElements = prev.map(el => 
        el.id === elementId 
          ? { ...el, zIndex: maxZIndex + 1 }
          : el
      );
      return newElements;
    });
  }, []);

  const getVisibleElements = useCallback((time: number) => {
    return elementUtils.getVisibleElements(elements, time);
  }, [elements]);

  const loadProject = useCallback(() => {
    const savedElements = storage.load();
    setElements(savedElements);
  }, []);

  const saveProject = useCallback(() => {
    const projectData = {
      elements,
      timestamp: new Date().toISOString(),
    };
    storage.save(projectData);
  }, [elements]);

  const clearProject = useCallback(() => {
    setElements([]);
    setSelectedElement(null);
    storage.clear();
  }, []);

  return {
    elements,
    selectedElement,
    addElement,
    updateElement,
    deleteElement,
    selectElement,
    bringToFront,
    getVisibleElements,
    loadProject,
    saveProject,
    clearProject,
  };
};
