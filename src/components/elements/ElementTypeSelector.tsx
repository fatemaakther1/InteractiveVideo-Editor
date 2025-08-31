import React from 'react';
import { Modal } from '../ui';
import type { ElementType } from '../../types';
import { ELEMENT_TYPES } from '../../constants';

export interface ElementTypeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectType: (type: ElementType) => void;
}

const ElementTypeSelector: React.FC<ElementTypeSelectorProps> = ({
  isOpen,
  onClose,
  onSelectType,
}) => {
  const getElementColor = (type: string) => {
    switch (type) {
      case 'text':
        return 'from-primary-500 to-primary-600';
      case 'interactive-button':
        return 'from-accent-500 to-accent-600';
      case 'image':
        return 'from-emerald-500 to-emerald-600';
      case 'pointer':
        return 'from-amber-500 to-amber-600';
      case 'opener':
        return 'from-purple-500 to-purple-600';
      default:
        return 'from-primary-500 to-primary-600';
    }
  };

  const getElementDescription = (type: string) => {
    switch (type) {
      case 'text':
        return 'Add text overlays';
      case 'interactive-button':
        return 'Clickable buttons';
      case 'image':
        return 'Image overlays';
      case 'pointer':
        return 'Point to areas';
      case 'opener':
        return 'Content openers';
      default:
        return 'Interactive element';
    }
  };

  const handleTypeSelect = (type: ElementType) => {
    onSelectType(type);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Interactive Element"
      subtitle="Choose an element type to add to your video"
      size="xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ELEMENT_TYPES.map((elementType) => (
          <button
            key={elementType.type}
            onClick={() => handleTypeSelect(elementType.type as ElementType)}
            className="group relative overflow-hidden bg-white border-2 border-secondary-200 rounded-2xl p-6 hover:border-primary-300 transition-all duration-300 transform hover:scale-105 hover:shadow-large"
          >
            <div className="flex flex-col items-center space-y-4">
              <div
                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getElementColor(
                  elementType.type
                )} flex items-center justify-center text-white text-2xl shadow-medium group-hover:shadow-large transition-all duration-300 transform group-hover:scale-110`}
              >
                {elementType.icon}
              </div>
              <div className="text-center">
                <h3 className="font-bold text-secondary-900 mb-1 group-hover:text-primary-700 transition-colors">
                  {elementType.label}
                </h3>
                <p className="text-xs text-secondary-500 group-hover:text-secondary-600">
                  {getElementDescription(elementType.type)}
                </p>
              </div>
            </div>

            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-accent-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
          </button>
        ))}
      </div>

      <div className="mt-8 p-4 bg-primary-50 rounded-2xl border border-primary-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
            <i className="fas fa-lightbulb text-white text-sm" />
          </div>
          <div>
            <h4 className="font-semibold text-primary-900 text-sm">
              Pro Tip
            </h4>
            <p className="text-primary-700 text-xs">
              You can drag and resize elements after adding them to the
              timeline
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ElementTypeSelector;
