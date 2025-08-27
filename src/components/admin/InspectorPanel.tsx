import React, { useState } from 'react';
import TimingInspector from '../inspector/TimingInspector';
import type { InteractiveElement } from '../../types';

export interface InspectorPanelProps {
  selectedElement: InteractiveElement | null;
  onUpdateElement: (element: InteractiveElement) => void;
  onDeleteElement: (elementId: string) => void;
}

type InspectorTab = 'timing' | 'format' | 'effects';

const InspectorPanel: React.FC<InspectorPanelProps> = ({
  selectedElement,
  onUpdateElement,
  onDeleteElement,
}) => {
  const [activeTab, setActiveTab] = useState<InspectorTab>('timing');
  if (!selectedElement) {
    return (
      <aside className="w-96 bg-white/95 backdrop-blur-sm border-l border-secondary-200 flex flex-col shadow-soft">
        <div className="flex-1 flex flex-col items-center justify-center h-64 text-gray-500 p-6">
          <i className="fas fa-mouse-pointer text-4xl mb-4 text-gray-300" />
          <p className="text-sm text-center">
            Select an element from the timeline or canvas to edit its properties
          </p>
        </div>
      </aside>
    );
  }

  const formatContent = (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white shadow-medium">
          <i className="fas fa-palette" />
        </div>
        <div>
          <h2 className="font-bold text-secondary-900">Format & Style</h2>
          <p className="text-xs text-secondary-500">Customize the appearance</p>
        </div>
      </div>

      {/* Text Styling */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-secondary-200 shadow-soft">
        <h3 className="text-sm font-bold text-secondary-800 mb-3 flex items-center">
          <i className="fas fa-font mr-2 text-primary-600" />
          Text Styling
        </h3>
        <div className="grid grid-cols-6 gap-2">
          {[
            { icon: 'fa-bold', title: 'Bold' },
            { icon: 'fa-italic', title: 'Italic' },
            { icon: 'fa-underline', title: 'Underline' },
            { icon: 'fa-strikethrough', title: 'Strikethrough' },
            { icon: 'fa-align-left', title: 'Align Left' },
            { icon: 'fa-align-center', title: 'Align Center' },
          ].map(({ icon, title }) => (
            <button
              key={icon}
              className="p-3 text-secondary-600 hover:text-white hover:bg-primary-600 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-soft hover:shadow-medium"
              title={title}
            >
              <i className={`fas ${icon}`} />
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-secondary-200 shadow-soft">
        <label className="block text-sm font-bold text-secondary-800 mb-3 flex items-center">
          <i className="fas fa-edit mr-2 text-primary-600" />
          Content
        </label>
        <textarea
          value={selectedElement.content}
          onChange={(e) => onUpdateElement({ ...selectedElement, content: e.target.value })}
          placeholder="Write your text content here..."
          rows={4}
          className="w-full px-4 py-3 border-2 border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 resize-none bg-secondary-50 text-secondary-900 placeholder-secondary-500"
        />
      </div>

      {/* Style Controls */}
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-secondary-200 shadow-soft">
          <label className="block text-sm font-bold text-secondary-800 mb-3 flex items-center">
            <i className="fas fa-palette mr-2 text-primary-600" />
            Background Color
          </label>
          <div className="flex items-center space-x-3">
            <input
              type="color"
              defaultValue="#2563eb"
              className="w-12 h-12 border-2 border-secondary-200 rounded-xl cursor-pointer shadow-soft"
            />
            <div className="flex-1">
              <span className="text-sm font-mono text-secondary-700 block">
                Primary Blue
              </span>
              <span className="text-xs text-secondary-500">#2563eb</span>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-secondary-200 shadow-soft">
          <label className="block text-sm font-bold text-secondary-800 mb-3 flex items-center">
            <i className="fas fa-adjust mr-2 text-primary-600" />
            Transparency
          </label>
          <div className="flex items-center space-x-3">
            <input
              type="range"
              min="0"
              max="100"
              defaultValue="100"
              className="flex-1 accent-primary-600"
            />
            <span className="text-sm font-mono text-secondary-700 min-w-12 text-center">
              100%
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const effectsContent = (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500 to-primary-600 flex items-center justify-center text-white shadow-medium">
          <i className="fas fa-magic" />
        </div>
        <div>
          <h2 className="font-bold text-secondary-900">Effects & Animation</h2>
          <p className="text-xs text-secondary-500">Add visual effects and animations</p>
        </div>
      </div>

      {/* Entrance Animation */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-secondary-200 shadow-soft">
        <h3 className="text-sm font-bold text-secondary-800 mb-4 flex items-center">
          <i className="fas fa-play mr-2 text-primary-600" />
          Entrance Animation
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-secondary-800 mb-3">
              Animation Type
            </label>
            <select className="w-full px-4 py-3 border-2 border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-secondary-50">
              <option>Fade in</option>
              <option>Slide in from left</option>
              <option>Slide in from right</option>
              <option>Scale in</option>
              <option>Bounce in</option>
            </select>
          </div>
        </div>
      </div>

      {/* Interactive Effects */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-secondary-200 shadow-soft">
        <h3 className="text-sm font-bold text-secondary-800 mb-4 flex items-center">
          <i className="fas fa-heartbeat mr-2 text-primary-600" />
          Interactive Effects
        </h3>
        <div className="space-y-3">
          {[
            { label: 'Pulse when visible', desc: 'Element pulses to draw attention' },
            { label: 'Bounce on interaction', desc: 'Element bounces when clicked' },
            { label: 'Scale on hover', desc: 'Element grows slightly on hover' },
          ].map(({ label, desc }, index) => (
            <div key={index} className="flex justify-between items-start p-3 bg-secondary-50 rounded-xl">
              <div className="flex-1">
                <span className="text-sm font-medium text-secondary-700 block">{label}</span>
                <span className="text-xs text-secondary-500">{desc}</span>
              </div>
              <div className="relative ml-3">
                <input type="checkbox" className="sr-only peer" />
                <label className="relative flex cursor-pointer items-center justify-center rounded-full bg-secondary-300 p-1 text-secondary-600 transition-colors duration-300 peer-checked:bg-primary-600 peer-checked:text-white w-12 h-6">
                  <div className="absolute left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 peer-checked:translate-x-6" />
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const tabs = [
    {
      id: 'timing',
      label: 'Timing',
      icon: 'fas fa-clock',
      content: (
        <TimingInspector
          element={selectedElement}
          onUpdate={onUpdateElement}
          onDelete={() => onDeleteElement(selectedElement.id)}
        />
      ),
    },
    {
      id: 'format',
      label: 'Format',
      icon: 'fas fa-palette',
      content: formatContent,
    },
    {
      id: 'effects',
      label: 'Effects',
      icon: 'fas fa-magic',
      content: effectsContent,
    },
  ];

  return (
    <aside className="w-96 bg-white/95 backdrop-blur-sm border-l border-secondary-200 flex flex-col shadow-soft">
      <div className="p-4 border-b border-secondary-200">
        <div className="grid grid-cols-3 gap-2 bg-secondary-100 rounded-xl p-1">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as InspectorTab)}
                className={`flex flex-col items-center px-3 py-3 text-xs font-bold rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-white text-primary-700 shadow-soft ring-2 ring-primary-200'
                    : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50'
                }`}
              >
                <i className={`${tab.icon} text-lg mb-1`} />
                <span className="uppercase tracking-wider">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-white to-secondary-50">
        {activeTab === 'timing' && (
          <TimingInspector
            element={selectedElement}
            onUpdate={onUpdateElement}
            onDelete={() => onDeleteElement(selectedElement.id)}
          />
        )}
        {activeTab === 'format' && formatContent}
        {activeTab === 'effects' && effectsContent}
      </div>
    </aside>
  );
};

export default InspectorPanel;
