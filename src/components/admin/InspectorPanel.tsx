import React, { useState } from 'react';
import TimingInspector from '../inspector/TimingInspector';
import AdvancedFormatPanel from './AdvancedFormatPanel';
import type { InteractiveElement } from '../../types';
import { ensureElementAnimations } from '../../utils';
import { triggerAnimationPreview, triggerInteractiveEffectsPreview } from '../../utils/animationUtils';

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
  // All hooks must be called before any early returns
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


  // Replace the formatContent with AdvancedFormatPanel
  const formatContent = (
    <AdvancedFormatPanel
      selectedElement={selectedElement}
      onUpdateElement={onUpdateElement}
    />
  );

  // Ensure element has animation properties with defaults
  const elementWithAnimation = ensureElementAnimations(selectedElement);
  const animation = elementWithAnimation.animation!;

  // Helper to update animation properties
  const updateAnimation = (updates: Partial<typeof animation>) => {
    const updatedElement = {
      ...selectedElement,
      animation: {
        ...animation,
        ...updates,
      },
    };
    onUpdateElement(updatedElement);

    // Auto-preview when animation settings change (with a small delay to allow DOM to update)
    setTimeout(() => {
      if (updates.entrance || updates.exit) {
        // Preview entrance animation when entrance is changed
        if (updates.entrance) {
          triggerAnimationPreview(selectedElement.id, 'entrance', updatedElement);
        }
        // Preview exit animation when exit is changed
        if (updates.exit) {
          triggerAnimationPreview(selectedElement.id, 'exit', updatedElement);
        }
      }
      
      // Preview interactive effects when they change
      if (updates.interactiveEffects) {
        triggerInteractiveEffectsPreview(selectedElement.id, updatedElement.animation?.interactiveEffects);
      }
    }, 100);
  };

  // Helper to manually trigger animation preview
  const handlePreviewAnimation = (type: 'entrance' | 'exit') => {
    triggerAnimationPreview(selectedElement.id, type, elementWithAnimation);
  };

  // Helper to manually trigger interactive effects preview
  const handlePreviewEffects = () => {
    triggerInteractiveEffectsPreview(selectedElement.id, animation.interactiveEffects);
  };

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
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-secondary-800 flex items-center">
            <i className="fas fa-play mr-2 text-primary-600" />
            Entrance Animation
          </h3>
          <button
            onClick={() => handlePreviewAnimation('entrance')}
            className="px-3 py-1.5 bg-primary-100 hover:bg-primary-200 text-primary-700 text-xs font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-soft hover:shadow-medium flex items-center space-x-1"
            title="Preview entrance animation"
          >
            <i className="fas fa-eye text-xs" />
            <span>Preview</span>
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-secondary-800 mb-3">
              Animation Type
            </label>
            <select 
              value={animation.entrance || 'fadeIn'}
              onChange={(e) => updateAnimation({ entrance: e.target.value as any })}
              className="w-full px-4 py-3 border-2 border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-secondary-50"
            >
              <option value="none">None</option>
              <option value="fadeIn">Fade in</option>
              <option value="slideInLeft">Slide in from left</option>
              <option value="slideInRight">Slide in from right</option>
              <option value="scaleIn">Scale in</option>
              <option value="bounceIn">Bounce in</option>
            </select>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-bold text-secondary-800">
                Exit Animation
              </label>
              <button
                onClick={() => handlePreviewAnimation('exit')}
                className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-soft hover:shadow-medium flex items-center space-x-1"
                title="Preview exit animation"
              >
                <i className="fas fa-eye text-xs" />
                <span>Preview</span>
              </button>
            </div>
            <select 
              value={animation.exit || 'fadeOut'}
              onChange={(e) => updateAnimation({ exit: e.target.value as any })}
              className="w-full px-4 py-3 border-2 border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-secondary-50"
            >
              <option value="none">None</option>
              <option value="fadeOut">Fade out</option>
              <option value="slideOutLeft">Slide out to left</option>
              <option value="slideOutRight">Slide out to right</option>
              <option value="scaleOut">Scale out</option>
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-secondary-800 mb-2">
                Duration (ms)
              </label>
              <input
                type="number"
                value={animation.duration || 300}
                onChange={(e) => updateAnimation({ duration: parseInt(e.target.value) || 300 })}
                min="100"
                max="2000"
                step="50"
                className="w-full px-3 py-2 border-2 border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-secondary-50"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-secondary-800 mb-2">
                Delay (ms)
              </label>
              <input
                type="number"
                value={animation.delay || 0}
                onChange={(e) => updateAnimation({ delay: parseInt(e.target.value) || 0 })}
                min="0"
                max="5000"
                step="100"
                className="w-full px-3 py-2 border-2 border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-secondary-50"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-secondary-800 mb-3">
              Easing
            </label>
            <select 
              value={animation.easing || 'ease-in-out'}
              onChange={(e) => updateAnimation({ easing: e.target.value as any })}
              className="w-full px-4 py-3 border-2 border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-secondary-50"
            >
              <option value="ease">Ease</option>
              <option value="ease-in">Ease In</option>
              <option value="ease-out">Ease Out</option>
              <option value="ease-in-out">Ease In-Out</option>
            </select>
          </div>
        </div>
      </div>

      {/* Interactive Effects */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-secondary-200 shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-secondary-800 flex items-center">
            <i className="fas fa-heartbeat mr-2 text-primary-600" />
            Interactive Effects
          </h3>
          <button
            onClick={handlePreviewEffects}
            className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-700 text-xs font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-soft hover:shadow-medium flex items-center space-x-1"
            title="Preview all interactive effects"
          >
            <i className="fas fa-magic text-xs" />
            <span>Preview</span>
          </button>
        </div>
        <div className="space-y-3">
          {[
            { 
              key: 'pulseWhenVisible', 
              label: 'Pulse when visible', 
              desc: 'Element pulses to draw attention',
              checked: animation.interactiveEffects?.pulseWhenVisible || false
            },
            { 
              key: 'bounceOnClick', 
              label: 'Bounce on interaction', 
              desc: 'Element bounces when clicked',
              checked: animation.interactiveEffects?.bounceOnClick || false
            },
            { 
              key: 'scaleOnHover', 
              label: 'Scale on hover', 
              desc: 'Element grows slightly on hover',
              checked: animation.interactiveEffects?.scaleOnHover || false
            },
          ].map(({ key, label, desc, checked }) => (
            <div key={key} className="flex justify-between items-start p-3 bg-secondary-50 rounded-xl">
              <div className="flex-1">
                <span className="text-sm font-medium text-secondary-700 block">{label}</span>
                <span className="text-xs text-secondary-500">{desc}</span>
              </div>
              <div className="relative ml-3">
                <input 
                  type="checkbox" 
                  id={`effect-${key}`}
                  checked={checked}
                  onChange={(e) => updateAnimation({ 
                    interactiveEffects: {
                      ...animation.interactiveEffects,
                      [key]: e.target.checked
                    }
                  })}
                  className="sr-only peer" 
                />
                <label 
                  htmlFor={`effect-${key}`}
                  className={`relative flex cursor-pointer items-center justify-center rounded-full p-1 transition-colors duration-300 w-12 h-6 ${
                    checked ? 'bg-primary-600 text-white' : 'bg-secondary-300 text-secondary-600'
                  }`}
                >
                  <div className={`absolute left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
                    checked ? 'translate-x-6' : ''
                  }`} />
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
