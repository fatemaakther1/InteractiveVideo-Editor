import React from 'react';
import type { InteractiveElement } from '../../types';
import ElementCard from './ElementCard';

export interface ElementListProps {
  elements: InteractiveElement[];
  selectedElement: InteractiveElement | null;
  onSelectElement: (element: InteractiveElement) => void;
  onDeleteElement: (elementId: string) => void;
}

const ElementList: React.FC<ElementListProps> = ({
  elements,
  selectedElement,
  onSelectElement,
  onDeleteElement,
}) => {
  if (elements.length === 0) {
    return (
      <div className="text-center py-12 text-secondary-500">
        <div className="w-16 h-16 mx-auto mb-4 bg-primary-100 rounded-full flex items-center justify-center">
          <i className="fas fa-layer-group text-2xl text-primary-600" />
        </div>
        <p className="text-sm font-medium mb-1">
          No elements added yet
        </p>
        <p className="text-xs text-secondary-400">
          Click the + button to add your first interactive element
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {elements.map((element) => (
        <ElementCard
          key={element.id}
          element={element}
          isSelected={selectedElement?.id === element.id}
          onSelect={() => onSelectElement(element)}
          onDelete={() => onDeleteElement(element.id)}
        />
      ))}
    </div>
  );
};

export default ElementList;
