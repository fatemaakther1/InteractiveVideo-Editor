import React from 'react';
import { Button } from '../ui';
import type { InteractiveElement } from '../../types';

export interface ElementCardProps {
  element: InteractiveElement;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onSeek?: (time: number) => void;
}

const ElementCard: React.FC<ElementCardProps> = ({
  element,
  isSelected,
  onSelect,
  onDelete,
  onSeek,
}) => {
  const getTimeString = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
      .toString()
      .padStart(2, '0')}`;
  };

  const getElementTypeColor = (type: string) => {
    switch (type) {
      case 'text':
        return 'bg-primary-100 text-primary-800';
      case 'interactive-button':
        return 'bg-accent-100 text-accent-800';
      case 'interactive-question':
        return 'bg-blue-100 text-blue-800';
      case 'image':
        return 'bg-emerald-100 text-emerald-800';
      case 'pointer':
        return 'bg-amber-100 text-amber-800';
      case 'opener':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-secondary-100 text-secondary-800';
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  const handleClick = () => {
    onSelect();
    onSeek?.(element.timestamp);
  };

  return (
    <div
      onClick={handleClick}
      className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-soft animate-slide-in group ${
        isSelected
          ? 'border-primary-500 bg-primary-50/50 ring-2 ring-primary-200'
          : 'border-secondary-200 hover:border-primary-300 hover:bg-primary-50/30'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-xs font-mono text-secondary-600 bg-secondary-100 px-2.5 py-1 rounded-full">
            {getTimeString(element.timestamp)}
          </span>
          <span
            className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${getElementTypeColor(
              element.type
            )}`}
          >
            {element.type.replace('-', ' ')}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          icon="fas fa-trash"
          onClick={handleDeleteClick}
          className="p-1.5 text-secondary-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
          title="Delete element"
        />
      </div>
      <p className="text-sm text-secondary-700 mt-3 font-medium leading-relaxed">
        {element.content}
      </p>
    </div>
  );
};

export default ElementCard;
