import type { InteractiveElement, ProjectData } from '../types';
import { STORAGE_KEYS } from '../constants';

// Storage utilities
export const storage = {
  save: (data: ProjectData): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.INTERACTIVE_VIDEO, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save project data:', error);
    }
  },

  load: (): InteractiveElement[] => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.INTERACTIVE_VIDEO);
      if (saved) {
        const projectData: ProjectData = JSON.parse(saved);
        return projectData.elements || [];
      }
    } catch (error) {
      console.error('Failed to load project data:', error);
    }
    return [];
  },

  clear: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEYS.INTERACTIVE_VIDEO);
    } catch (error) {
      console.error('Failed to clear project data:', error);
    }
  }
};

// Element utilities
export const elementUtils = {
  generateId: (): string => Date.now().toString(),

  isVisible: (element: InteractiveElement, currentTime: number): boolean => {
    return currentTime >= element.timestamp && currentTime <= element.endTime;
  },

  getVisibleElements: (elements: InteractiveElement[], currentTime: number): InteractiveElement[] => {
    return elements.filter(element => elementUtils.isVisible(element, currentTime));
  },

};

// Validation utilities
export const validation = {
  isValidElement: (element: Partial<InteractiveElement>): boolean => {
    return !!(
      element.content &&
      element.timestamp !== undefined &&
      element.endTime !== undefined &&
      element.type
    );
  },

  isValidPosition: (x: number, y: number): boolean => {
    return x >= 0 && y >= 0;
  }
};

// Format utilities
export const format = {
  timeToFixed: (time: number, decimals: number = 1): string => {
    if (time == null) {
      return '0.0';
    }
    return time.toFixed(decimals);
  },

  capitalize: (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
};
