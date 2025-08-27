import React from 'react';
import { Button, Input, TabContainer } from '../ui';
import type { InteractiveElement } from '../../types';
import ElementList from '../elements/ElementList';

export interface ElementSidebarProps {
  elements: InteractiveElement[];
  selectedElement: InteractiveElement | null;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  onAddElement: () => void;
  onSelectElement: (element: InteractiveElement) => void;
  onDeleteElement: (elementId: string) => void;
  onSeek?: (time: number) => void;
}

const ElementSidebar: React.FC<ElementSidebarProps> = ({
  elements,
  selectedElement,
  searchTerm = '',
  onSearchChange,
  onAddElement,
  onSelectElement,
  onDeleteElement,
  onSeek,
}) => {
  const filteredElements = elements.filter(element =>
    element.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    element.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const videoContent = (
    <div className="text-center py-12 text-secondary-500">
      <div className="w-16 h-16 mx-auto mb-4 bg-primary-100 rounded-full flex items-center justify-center">
        <i className="fas fa-video text-2xl text-primary-600" />
      </div>
      <p className="text-sm font-medium mb-1">Video Library</p>
      <p className="text-xs text-secondary-400">
        Manage your video sources here
      </p>
    </div>
  );

  const elementsContent = (
    <>
      <div className="flex items-center space-x-3 mb-6">
        <div className="flex-1 relative">
          <Input
            type="text"
            placeholder="Search elements..."
            value={searchTerm}
            onChange={(e) => onSearchChange?.(e.target.value)}
            icon="fas fa-search"
            className="bg-secondary-50 text-secondary-900 placeholder-secondary-500"
          />
        </div>
        <Button
          variant="primary"
          size="md"
          icon="fas fa-plus"
          onClick={onAddElement}
          className="w-11 h-11 bg-primary-600 hover:bg-primary-700 text-white rounded-xl flex items-center justify-center shadow-soft hover:shadow-medium"
          title="Add Element"
        />
      </div>

      <ElementList
        elements={filteredElements}
        selectedElement={selectedElement}
        onSelectElement={onSelectElement}
        onDeleteElement={onDeleteElement}
        onSeek={onSeek}
      />
    </>
  );

  const tabs = [
    {
      id: 'videos',
      label: 'Videos',
      icon: 'fas fa-video',
      content: videoContent,
    },
    {
      id: 'elements',
      label: 'Elements',
      icon: 'fas fa-layer-group',
      content: elementsContent,
    },
  ];

  return (
    <aside className="w-72 bg-white/95 backdrop-blur-sm border-r border-secondary-200 flex flex-col shadow-soft">
      <div className="p-4 border-b border-secondary-200">
        <TabContainer
          tabs={tabs}
          variant="pills"
          activeTab="elements"
          className="w-full"
        />
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto">
        {/* Content is handled by TabContainer */}
      </div>
    </aside>
  );
};

export default ElementSidebar;
