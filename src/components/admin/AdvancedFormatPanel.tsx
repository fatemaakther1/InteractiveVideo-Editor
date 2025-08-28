import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { InteractiveElement, FontOption, BoxShadowPreset, StylePreset } from '../../types';

interface AdvancedFormatPanelProps {
  selectedElement: InteractiveElement;
  onUpdateElement: (element: InteractiveElement) => void;
}

// Constants for styling options
const FONT_OPTIONS: FontOption[] = [
  { value: 'Inter', label: 'Inter', category: 'sans-serif' },
  { value: 'System UI', label: 'System UI', category: 'sans-serif' },
  { value: 'Helvetica', label: 'Helvetica', category: 'sans-serif' },
  { value: 'Arial', label: 'Arial', category: 'sans-serif' },
  { value: 'Georgia', label: 'Georgia', category: 'serif' },
  { value: 'Times New Roman', label: 'Times New Roman', category: 'serif' },
  { value: 'JetBrains Mono', label: 'JetBrains Mono', category: 'monospace' },
  { value: 'Fira Code', label: 'Fira Code', category: 'monospace' },
  { value: 'Playfair Display', label: 'Playfair Display', category: 'display' },
];

const BOX_SHADOW_PRESETS: BoxShadowPreset[] = [
  { id: 'none', name: 'None', value: 'none', preview: 'shadow-none' },
  { id: 'sm', name: 'Small', value: '0 1px 2px 0 rgb(0 0 0 / 0.05)', preview: 'shadow-sm' },
  { id: 'md', name: 'Medium', value: '0 4px 6px -1px rgb(0 0 0 / 0.1)', preview: 'shadow-md' },
  { id: 'lg', name: 'Large', value: '0 10px 15px -3px rgb(0 0 0 / 0.1)', preview: 'shadow-lg' },
  { id: 'xl', name: 'Extra Large', value: '0 20px 25px -5px rgb(0 0 0 / 0.1)', preview: 'shadow-xl' },
  { id: 'inner', name: 'Inset', value: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)', preview: 'shadow-inner' },
];

const FONT_WEIGHT_OPTIONS = [
  { value: 'light', label: 'Light', weight: '300' },
  { value: 'normal', label: 'Normal', weight: '400' },
  { value: 'medium', label: 'Medium', weight: '500' },
  { value: 'semibold', label: 'Semibold', weight: '600' },
  { value: 'bold', label: 'Bold', weight: '700' },
  { value: 'extrabold', label: 'Extra Bold', weight: '800' },
];

const AdvancedFormatPanel: React.FC<AdvancedFormatPanelProps> = ({
  selectedElement,
  onUpdateElement,
}) => {
  // Advanced state management
  const [activeSection, setActiveSection] = useState<string>('text');
  const [responsiveMode, setResponsiveMode] = useState<'sm' | 'md' | 'lg' | 'all'>('all');
  const [presets, setPresets] = useState<StylePreset[]>([]);
  const [selectedText, setSelectedText] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);

  // Load presets from localStorage
  useEffect(() => {
    const savedPresets = localStorage.getItem('format-presets');
    if (savedPresets) {
      setPresets(JSON.parse(savedPresets));
    }
  }, []);

  // Save presets to localStorage
  const savePresets = useCallback((newPresets: StylePreset[]) => {
    setPresets(newPresets);
    localStorage.setItem('format-presets', JSON.stringify(newPresets));
  }, []);

  // Update element properties
  const updateProperty = useCallback((property: keyof InteractiveElement, value: any) => {
    onUpdateElement({
      ...selectedElement,
      [property]: value,
    });
  }, [selectedElement, onUpdateElement]);

  // Toggle text formatting
  const toggleFormat = useCallback((property: 'bold' | 'italic' | 'underline' | 'strikethrough' | 'superscript' | 'subscript') => {
    updateProperty(property, !selectedElement[property]);
  }, [selectedElement, updateProperty]);

  // Set text case
  const setTextCase = useCallback((textCase: 'none' | 'uppercase' | 'lowercase' | 'capitalize') => {
    updateProperty('textCase', textCase);
  }, [updateProperty]);

  // Apply formatting to selected text
  const applyToSelection = useCallback((property: string, value: any) => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && contentRef.current?.contains(selection.anchorNode)) {
      const range = selection.getRangeAt(0);
      if (!range.collapsed) {
        // Apply formatting to selection
        const span = document.createElement('span');
        span.style[property as any] = value;
        range.surroundContents(span);
        selection.removeAllRanges();
      }
    }
  }, []);

  // Save current styles as preset
  const saveAsPreset = useCallback(() => {
    const presetName = prompt('Enter preset name:');
    if (presetName) {
      const newPreset: StylePreset = {
        id: Date.now().toString(),
        name: presetName,
        styles: {
          fontFamily: selectedElement.fontFamily,
          fontSize: selectedElement.fontSize,
          fontWeight: selectedElement.fontWeight,
          color: selectedElement.color,
          backgroundColor: selectedElement.backgroundColor,
          textAlign: selectedElement.textAlign,
          letterSpacing: selectedElement.letterSpacing,
          lineHeight: selectedElement.lineHeight,
          borderRadius: selectedElement.borderRadius,
          padding: selectedElement.padding,
          margin: selectedElement.margin,
          boxShadow: selectedElement.boxShadow,
        },
        createdAt: new Date(),
      };
      savePresets([...presets, newPreset]);
    }
  }, [selectedElement, presets, savePresets]);

  // Apply preset
  const applyPreset = useCallback((preset: StylePreset) => {
    onUpdateElement({
      ...selectedElement,
      ...preset.styles,
    });
  }, [selectedElement, onUpdateElement]);

  // Reset all styles
  const resetStyles = useCallback(() => {
    if (confirm('Reset all styles to default?')) {
      onUpdateElement({
        ...selectedElement,
        // Reset text styles
        bold: false,
        italic: false,
        underline: false,
        strikethrough: false,
        superscript: false,
        subscript: false,
        textCase: 'none',
        fontFamily: undefined,
        fontSize: undefined,
        fontWeight: 'normal',
        letterSpacing: undefined,
        lineHeight: undefined,
        textAlign: 'left',
        color: undefined,
        highlightColor: undefined,
        // Reset element styles
        backgroundColor: undefined,
        opacity: undefined,
        borderRadius: undefined,
        padding: undefined,
        margin: undefined,
        boxShadow: undefined,
        // Reset effects
        blur: undefined,
        brightness: undefined,
        grayscale: undefined,
        // Reset layout
        display: undefined,
        flexDirection: undefined,
        alignItems: undefined,
        justifyContent: undefined,
      });
    }
  }, [selectedElement, onUpdateElement]);

  // Collapsible section component
  const CollapsibleSection: React.FC<{
    id: string;
    title: string;
    icon: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
  }> = ({ id, title, icon, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen || activeSection === id);

    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-sm">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50/50 rounded-t-2xl transition-colors duration-200"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white">
              <i className={`fas ${icon} text-sm`} />
            </div>
            <span className="font-semibold text-gray-800">{title}</span>
          </div>
          <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'} text-gray-500 transition-transform duration-200`} />
        </button>
        {isOpen && (
          <div className="p-4 border-t border-gray-200 space-y-4">
            {children}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
            <i className="fas fa-paint-brush" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900">Advanced Format & Style</h2>
            <p className="text-xs text-gray-500">Professional text and element styling</p>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={saveAsPreset}
            className="px-3 py-2 bg-green-100 hover:bg-green-200 text-green-700 text-xs font-medium rounded-lg transition-all duration-200"
            title="Save as Preset"
          >
            <i className="fas fa-save mr-1" />
            Save
          </button>
          <button
            onClick={resetStyles}
            className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-medium rounded-lg transition-all duration-200"
            title="Reset All Styles"
          >
            <i className="fas fa-undo mr-1" />
            Reset
          </button>
        </div>
      </div>

      {/* Responsive Mode Toggle */}
      <div className="flex items-center space-x-2 p-3 bg-gray-100 rounded-xl">
        <span className="text-sm font-medium text-gray-700">Responsive:</span>
        {(['all', 'sm', 'md', 'lg'] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setResponsiveMode(mode)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
              responsiveMode === mode
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {mode === 'all' ? 'All' : mode.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Smart Text Formatting */}
      <CollapsibleSection id="text" title="Smart Text Formatting" icon="fa-font" defaultOpen>
        {/* Text Style Buttons */}
        <div className="grid grid-cols-8 gap-2 mb-4">
          {[
            { key: 'bold', icon: 'fa-bold', title: 'Bold (Ctrl+B)' },
            { key: 'italic', icon: 'fa-italic', title: 'Italic (Ctrl+I)' },
            { key: 'underline', icon: 'fa-underline', title: 'Underline (Ctrl+U)' },
            { key: 'strikethrough', icon: 'fa-strikethrough', title: 'Strikethrough' },
            { key: 'superscript', icon: 'fa-superscript', title: 'Superscript' },
            { key: 'subscript', icon: 'fa-subscript', title: 'Subscript' },
          ].map(({ key, icon, title }) => (
            <button
              key={key}
              onClick={() => toggleFormat(key as any)}
              className={`p-3 rounded-xl transition-all duration-200 transform hover:scale-105 ${
                selectedElement[key as keyof InteractiveElement]
                  ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-300 shadow-sm'
                  : 'bg-gray-50 text-gray-600 hover:bg-blue-50 hover:text-blue-600'
              }`}
              title={title}
            >
              <i className={`fas ${icon}`} />
            </button>
          ))}
        </div>

        {/* Font Family */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Font Family</label>
          <select
            value={selectedElement.fontFamily || 'Inter'}
            onChange={(e) => updateProperty('fontFamily', e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
          >
            {FONT_OPTIONS.map((font) => (
              <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                {font.label}
              </option>
            ))}
          </select>
        </div>

        {/* Font Size & Weight */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Font Size</label>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="12"
                max="72"
                step="1"
                value={selectedElement.fontSize || 14}
                onChange={(e) => updateProperty('fontSize', parseInt(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <span className="text-sm font-mono text-gray-600 min-w-[3rem] text-center">
                {selectedElement.fontSize || 14}px
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Font Weight</label>
            <select
              value={selectedElement.fontWeight || 'normal'}
              onChange={(e) => updateProperty('fontWeight', e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
            >
              {FONT_WEIGHT_OPTIONS.map((weight) => (
                <option key={weight.value} value={weight.value}>
                  {weight.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Text Case Toggle */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Text Case</label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { value: 'none', label: 'None' },
              { value: 'uppercase', label: 'UPPER' },
              { value: 'lowercase', label: 'lower' },
              { value: 'capitalize', label: 'Title' },
            ].map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setTextCase(value as any)}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  (selectedElement.textCase || 'none') === value
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Text & Highlight Colors */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Text Color</label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={selectedElement.color || '#000000'}
                onChange={(e) => updateProperty('color', e.target.value)}
                className="w-12 h-10 border border-gray-200 rounded-lg cursor-pointer shadow-sm"
              />
              <input
                type="text"
                value={selectedElement.color || '#000000'}
                onChange={(e) => updateProperty('color', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg font-mono text-sm"
                placeholder="#000000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Highlight Color</label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={selectedElement.highlightColor || '#ffff00'}
                onChange={(e) => updateProperty('highlightColor', e.target.value)}
                className="w-12 h-10 border border-gray-200 rounded-lg cursor-pointer shadow-sm"
              />
              <input
                type="text"
                value={selectedElement.highlightColor || '#ffff00'}
                onChange={(e) => updateProperty('highlightColor', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg font-mono text-sm"
                placeholder="#ffff00"
              />
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* Live Content Editor */}
      <CollapsibleSection id="content" title="Live Content Editor" icon="fa-edit">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Rich Text Content</label>
            <div className="text-xs text-gray-500">
              Supports variables like <code className="bg-gray-100 px-1 rounded">{'{{school.url}}'}</code>
            </div>
          </div>
          <div
            ref={contentRef}
            contentEditable
            onInput={(e) => {
              const content = e.currentTarget.textContent || '';
              updateProperty('content', content);
            }}
            onMouseUp={() => {
              const selection = window.getSelection();
              if (selection && !selection.isCollapsed) {
                setSelectedText(selection.toString());
              }
            }}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-gray-900 min-h-[120px] focus:outline-none resize-none"
            style={{
              fontFamily: selectedElement.fontFamily || 'Inter',
              fontSize: `${selectedElement.fontSize || 14}px`,
              fontWeight: selectedElement.fontWeight || 'normal',
              textTransform: selectedElement.textCase || 'none',
              textAlign: selectedElement.textAlign || 'left',
              color: selectedElement.color || '#000000',
              letterSpacing: selectedElement.letterSpacing ? `${selectedElement.letterSpacing}px` : 'normal',
              lineHeight: selectedElement.lineHeight || 'normal',
            }}
            suppressContentEditableWarning={true}
            dangerouslySetInnerHTML={{ __html: selectedElement.content || 'Enter your content here...' }}
          />
          {selectedText && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-xs font-medium text-blue-800 mb-2">Selection: "{selectedText}"</div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => applyToSelection('fontWeight', 'bold')}
                  className="px-2 py-1 bg-blue-600 text-white text-xs rounded font-medium hover:bg-blue-700"
                >
                  Bold
                </button>
                <button
                  onClick={() => applyToSelection('fontStyle', 'italic')}
                  className="px-2 py-1 bg-blue-600 text-white text-xs rounded font-medium hover:bg-blue-700"
                >
                  Italic
                </button>
                <button
                  onClick={() => applyToSelection('color', selectedElement.color || '#ff0000')}
                  className="px-2 py-1 bg-blue-600 text-white text-xs rounded font-medium hover:bg-blue-700"
                >
                  Color
                </button>
              </div>
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* Advanced Element Styling */}
      <CollapsibleSection id="styling" title="Advanced Element Styling" icon="fa-magic">
        {/* Letter Spacing & Line Height */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Letter Spacing</label>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="-2"
                max="8"
                step="0.1"
                value={selectedElement.letterSpacing || 0}
                onChange={(e) => updateProperty('letterSpacing', parseFloat(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <span className="text-sm font-mono text-gray-600 min-w-[3rem] text-center">
                {selectedElement.letterSpacing || 0}px
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Line Height</label>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="1"
                max="3"
                step="0.1"
                value={selectedElement.lineHeight || 1.5}
                onChange={(e) => updateProperty('lineHeight', parseFloat(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <span className="text-sm font-mono text-gray-600 min-w-[3rem] text-center">
                {selectedElement.lineHeight || 1.5}
              </span>
            </div>
          </div>
        </div>

        {/* Text Alignment */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Text Alignment</label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { value: 'left', icon: 'fa-align-left', title: 'Left' },
              { value: 'center', icon: 'fa-align-center', title: 'Center' },
              { value: 'right', icon: 'fa-align-right', title: 'Right' },
              { value: 'justify', icon: 'fa-align-justify', title: 'Justify' },
            ].map(({ value, icon, title }) => (
              <button
                key={value}
                onClick={() => updateProperty('textAlign', value)}
                className={`p-3 rounded-xl transition-all duration-200 ${
                  (selectedElement.textAlign || 'left') === value
                    ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-300'
                    : 'bg-gray-50 text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                }`}
                title={title}
              >
                <i className={`fas ${icon}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Background Color & Border Radius */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Background Color</label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={selectedElement.backgroundColor || '#ffffff'}
                onChange={(e) => updateProperty('backgroundColor', e.target.value)}
                className="w-12 h-10 border border-gray-200 rounded-lg cursor-pointer shadow-sm"
              />
              <input
                type="text"
                value={selectedElement.backgroundColor || '#ffffff'}
                onChange={(e) => updateProperty('backgroundColor', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg font-mono text-sm"
                placeholder="#ffffff"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Border Radius</label>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="0"
                max="50"
                step="1"
                value={selectedElement.borderRadius || 0}
                onChange={(e) => updateProperty('borderRadius', parseInt(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <span className="text-sm font-mono text-gray-600 min-w-[3rem] text-center">
                {selectedElement.borderRadius || 0}px
              </span>
            </div>
          </div>
        </div>

        {/* Box Shadow Presets */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Box Shadow</label>
          <div className="grid grid-cols-3 gap-2">
            {BOX_SHADOW_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => updateProperty('boxShadow', preset.value)}
                className={`p-3 rounded-xl border-2 transition-all duration-200 text-sm font-medium ${
                  selectedElement.boxShadow === preset.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:bg-blue-50'
                }`}
                style={{ boxShadow: preset.value !== 'none' ? preset.value : 'none' }}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Visual Effects */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Blur</label>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="0"
                max="20"
                step="0.5"
                value={selectedElement.blur || 0}
                onChange={(e) => updateProperty('blur', parseFloat(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <span className="text-sm font-mono text-gray-600 min-w-[3rem] text-center">
                {selectedElement.blur || 0}px
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Brightness</label>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="0"
                max="200"
                step="5"
                value={selectedElement.brightness || 100}
                onChange={(e) => updateProperty('brightness', parseInt(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <span className="text-sm font-mono text-gray-600 min-w-[3rem] text-center">
                {selectedElement.brightness || 100}%
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Grayscale</label>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={selectedElement.grayscale || 0}
                onChange={(e) => updateProperty('grayscale', parseInt(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <span className="text-sm font-mono text-gray-600 min-w-[3rem] text-center">
                {selectedElement.grayscale || 0}%
              </span>
            </div>
          </div>
        </div>

        {/* Opacity Control */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Opacity</label>
          <div className="flex items-center space-x-3">
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={selectedElement.opacity || 100}
              onChange={(e) => updateProperty('opacity', parseInt(e.target.value))}
              className="flex-1 h-3 bg-gradient-to-r from-transparent to-blue-500 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, 
                  rgba(59, 130, 246, 0.2) 0%, 
                  rgba(59, 130, 246, 0.8) ${selectedElement.opacity || 100}%, 
                  rgba(156, 163, 175, 0.3) ${selectedElement.opacity || 100}%, 
                  rgba(156, 163, 175, 0.3) 100%)`
              }}
            />
            <span className="text-sm font-mono font-bold text-gray-700 min-w-[3.5rem] text-center">
              {selectedElement.opacity || 100}%
            </span>
          </div>
        </div>
      </CollapsibleSection>

      {/* Layout & Responsive Controls */}
      <CollapsibleSection id="layout" title="Layout & Responsive Controls" icon="fa-th-large">
        {/* Display Type */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Display Type</label>
          <div className="grid grid-cols-5 gap-2">
            {[
              { value: 'block', label: 'Block' },
              { value: 'inline', label: 'Inline' },
              { value: 'inline-block', label: 'Inline Block' },
              { value: 'flex', label: 'Flex' },
              { value: 'grid', label: 'Grid' },
            ].map(({ value, label }) => (
              <button
                key={value}
                onClick={() => updateProperty('display', value)}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  (selectedElement.display || 'block') === value
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Flex Settings (show when display is flex) */}
        {selectedElement.display === 'flex' && (
          <div className="space-y-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <h4 className="text-sm font-semibold text-blue-800">Flex Settings</h4>
            
            <div className="grid grid-cols-1 gap-4">
              {/* Flex Direction */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-blue-700">Direction</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { value: 'row', label: 'Row', icon: 'fa-arrow-right' },
                    { value: 'col', label: 'Column', icon: 'fa-arrow-down' },
                    { value: 'row-reverse', label: 'Row Rev', icon: 'fa-arrow-left' },
                    { value: 'col-reverse', label: 'Col Rev', icon: 'fa-arrow-up' },
                  ].map(({ value, label, icon }) => (
                    <button
                      key={value}
                      onClick={() => updateProperty('flexDirection', value)}
                      className={`px-2 py-2 text-xs font-medium rounded-lg transition-all duration-200 flex items-center justify-center space-x-1 ${
                        (selectedElement.flexDirection || 'row') === value
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-blue-600 hover:bg-blue-100'
                      }`}
                    >
                      <i className={`fas ${icon}`} />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Align Items & Justify Content */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-blue-700">Align Items</label>
                  <select
                    value={selectedElement.alignItems || 'start'}
                    onChange={(e) => updateProperty('alignItems', e.target.value)}
                    className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
                  >
                    <option value="start">Start</option>
                    <option value="center">Center</option>
                    <option value="end">End</option>
                    <option value="stretch">Stretch</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-blue-700">Justify Content</label>
                  <select
                    value={selectedElement.justifyContent || 'start'}
                    onChange={(e) => updateProperty('justifyContent', e.target.value)}
                    className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
                  >
                    <option value="start">Start</option>
                    <option value="center">Center</option>
                    <option value="end">End</option>
                    <option value="between">Space Between</option>
                    <option value="around">Space Around</option>
                    <option value="evenly">Space Evenly</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Width & Height */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Width</label>
            <input
              type="number"
              value={selectedElement.width || ''}
              onChange={(e) => updateProperty('width', parseInt(e.target.value) || undefined)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
              placeholder="Auto"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Height</label>
            <input
              type="number"
              value={selectedElement.height || ''}
              onChange={(e) => updateProperty('height', parseInt(e.target.value) || undefined)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
              placeholder="Auto"
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* Presets System */}
      {presets.length > 0 && (
        <CollapsibleSection id="presets" title="Saved Presets" icon="fa-bookmark">
          <div className="grid grid-cols-2 gap-3">
            {presets.map((preset) => (
              <div
                key={preset.id}
                className="p-3 bg-gray-50 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-gray-800">{preset.name}</h4>
                  <button
                    onClick={() => {
                      setPresets(presets.filter(p => p.id !== preset.id));
                      savePresets(presets.filter(p => p.id !== preset.id));
                    }}
                    className="text-red-500 hover:text-red-700 text-xs"
                  >
                    <i className="fas fa-trash" />
                  </button>
                </div>
                <button
                  onClick={() => applyPreset(preset)}
                  className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-all duration-200"
                >
                  Apply Preset
                </button>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}
    </div>
  );
};

export default AdvancedFormatPanel;
