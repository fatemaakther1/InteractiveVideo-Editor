import React, { useState, useRef, useEffect, useCallback, useMemo, memo } from 'react';
import type { InteractiveElement, FontOption, BoxShadowPreset, StylePreset } from '../../types';
import { 
  ColorPicker, 
  RangeSlider, 
  ToggleGroup, 
  Select, 
  FormatButton, 
  PresetCard, 
  CollapsibleSection 
} from '../ui/StyleControls';
import { 
  previewStyles, 
  resetPreviewStyles 
} from '../../utils/styleUtils';

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

// Memoized components for performance
const TextFormattingSection = memo<{ 
  selectedElement: InteractiveElement;
  onUpdate: (property: keyof InteractiveElement, value: any) => void;
  onPreview: (property: keyof InteractiveElement, value: any) => void;
  onPreviewEnd: () => void;
}>(({ selectedElement, onUpdate, onPreview, onPreviewEnd }) => {
  const formatButtons = useMemo(() => [
    { key: 'bold', icon: 'fa-bold', title: 'Bold', shortcut: 'Ctrl+B' },
    { key: 'italic', icon: 'fa-italic', title: 'Italic', shortcut: 'Ctrl+I' },
    { key: 'underline', icon: 'fa-underline', title: 'Underline', shortcut: 'Ctrl+U' },
    { key: 'strikethrough', icon: 'fa-strikethrough', title: 'Strikethrough' },
    { key: 'superscript', icon: 'fa-superscript', title: 'Superscript' },
    { key: 'subscript', icon: 'fa-subscript', title: 'Subscript' },
  ], []);

  const fontOptions = useMemo(() => FONT_OPTIONS.map(font => ({
    value: font.value,
    label: font.label,
    style: { fontFamily: font.value }
  })), []);

  const weightOptions = useMemo(() => FONT_WEIGHT_OPTIONS.map(weight => ({
    value: weight.value,
    label: weight.label
  })), []);

  const textCaseOptions = useMemo(() => [
    { value: 'none', label: 'None' },
    { value: 'uppercase', label: 'UPPER' },
    { value: 'lowercase', label: 'lower' },
    { value: 'capitalize', label: 'Title' },
  ], []);

  const textAlignOptions = useMemo(() => [
    { value: 'left', label: 'Left', icon: 'fa-align-left' },
    { value: 'center', label: 'Center', icon: 'fa-align-center' },
    { value: 'right', label: 'Right', icon: 'fa-align-right' },
    { value: 'justify', label: 'Justify', icon: 'fa-align-justify' },
  ], []);

  return (
    <div className="space-y-4">
      {/* Format Buttons */}
      <div className="grid grid-cols-6 gap-3">
        {formatButtons.map(({ key, icon, title, shortcut }) => (
          <FormatButton
            key={key}
            isActive={!!selectedElement[key as keyof InteractiveElement]}
            onClick={() => onUpdate(key as keyof InteractiveElement, !selectedElement[key as keyof InteractiveElement])}
            onPreview={() => onPreview(key as keyof InteractiveElement, !selectedElement[key as keyof InteractiveElement])}
            onPreviewEnd={onPreviewEnd}
            icon={icon}
            title={title}
            shortcut={shortcut}
          />
        ))}
      </div>

      {/* Font Family */}
      <Select
        label="Font Family"
        value={selectedElement.fontFamily || 'Inter'}
        options={fontOptions}
        onChange={(value) => onUpdate('fontFamily', value)}
        onPreview={(value) => onPreview('fontFamily', value)}
        onPreviewEnd={onPreviewEnd}
      />

      {/* Font Size & Weight */}
      <div className="grid grid-cols-2 gap-4">
        <RangeSlider
          label="Font Size"
          value={selectedElement.fontSize || 14}
          min={12}
          max={72}
          step={1}
          unit="px"
          onChange={(value) => onUpdate('fontSize', value)}
          onPreview={(value) => onPreview('fontSize', value)}
          onPreviewEnd={onPreviewEnd}
        />

        <Select
          label="Font Weight"
          value={selectedElement.fontWeight || 'normal'}
          options={weightOptions}
          onChange={(value) => onUpdate('fontWeight', value)}
          onPreview={(value) => onPreview('fontWeight', value)}
          onPreviewEnd={onPreviewEnd}
        />
      </div>

      {/* Text Case */}
      <ToggleGroup
        label="Text Case"
        value={selectedElement.textCase || 'none'}
        options={textCaseOptions}
        onChange={(value) => onUpdate('textCase', value)}
        onPreview={(value) => onPreview('textCase', value)}
        onPreviewEnd={onPreviewEnd}
      />

      {/* Colors */}
      <div className="grid grid-cols-2 gap-4">
        <ColorPicker
          label="Text Color"
          value={selectedElement.color || '#000000'}
          onChange={(value) => onUpdate('color', value)}
          onPreview={(value) => onPreview('color', value)}
          onPreviewEnd={onPreviewEnd}
        />
        
        <ColorPicker
          label="Highlight Color"
          value={selectedElement.highlightColor || '#ffff00'}
          onChange={(value) => onUpdate('highlightColor', value)}
          onPreview={(value) => onPreview('highlightColor', value)}
          onPreviewEnd={onPreviewEnd}
        />
      </div>

      {/* Text Alignment */}
      <ToggleGroup
        label="Text Alignment"
        value={selectedElement.textAlign || 'left'}
        options={textAlignOptions}
        onChange={(value) => onUpdate('textAlign', value)}
        onPreview={(value) => onPreview('textAlign', value)}
        onPreviewEnd={onPreviewEnd}
      />
    </div>
  );
});

const ElementStylingSection = memo<{ 
  selectedElement: InteractiveElement;
  onUpdate: (property: keyof InteractiveElement, value: any) => void;
  onPreview: (property: keyof InteractiveElement, value: any) => void;
  onPreviewEnd: () => void;
}>(({ selectedElement, onUpdate, onPreview, onPreviewEnd }) => {
  const shadowPresets = useMemo(() => BOX_SHADOW_PRESETS, []);

  return (
    <div className="space-y-4">
      {/* Letter Spacing & Line Height */}
      <div className="grid grid-cols-2 gap-4">
        <RangeSlider
          label="Letter Spacing"
          value={selectedElement.letterSpacing || 0}
          min={-2}
          max={8}
          step={0.1}
          unit="px"
          onChange={(value) => onUpdate('letterSpacing', value)}
          onPreview={(value) => onPreview('letterSpacing', value)}
          onPreviewEnd={onPreviewEnd}
        />

        <RangeSlider
          label="Line Height"
          value={selectedElement.lineHeight || 1.5}
          min={1}
          max={3}
          step={0.1}
          onChange={(value) => onUpdate('lineHeight', value)}
          onPreview={(value) => onPreview('lineHeight', value)}
          onPreviewEnd={onPreviewEnd}
        />
      </div>

      {/* Background & Border */}
      <div className="grid grid-cols-2 gap-4">
        <ColorPicker
          label="Background Color"
          value={selectedElement.backgroundColor || '#ffffff'}
          onChange={(value) => onUpdate('backgroundColor', value)}
          onPreview={(value) => onPreview('backgroundColor', value)}
          onPreviewEnd={onPreviewEnd}
        />
        
        <RangeSlider
          label="Border Radius"
          value={selectedElement.borderRadius || 0}
          min={0}
          max={50}
          step={1}
          unit="px"
          onChange={(value) => onUpdate('borderRadius', value)}
          onPreview={(value) => onPreview('borderRadius', value)}
          onPreviewEnd={onPreviewEnd}
        />
      </div>

      {/* Box Shadow */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Box Shadow</label>
        <div className="grid grid-cols-3 gap-2">
          {shadowPresets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => onUpdate('boxShadow', preset.value)}
              onMouseEnter={() => onPreview('boxShadow', preset.value)}
              onMouseLeave={onPreviewEnd}
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
        <RangeSlider
          label="Blur"
          value={selectedElement.blur || 0}
          min={0}
          max={20}
          step={0.5}
          unit="px"
          onChange={(value) => onUpdate('blur', value)}
          onPreview={(value) => onPreview('blur', value)}
          onPreviewEnd={onPreviewEnd}
        />

        <RangeSlider
          label="Brightness"
          value={selectedElement.brightness || 100}
          min={0}
          max={200}
          step={5}
          unit="%"
          onChange={(value) => onUpdate('brightness', value)}
          onPreview={(value) => onPreview('brightness', value)}
          onPreviewEnd={onPreviewEnd}
        />

        <RangeSlider
          label="Grayscale"
          value={selectedElement.grayscale || 0}
          min={0}
          max={100}
          step={5}
          unit="%"
          onChange={(value) => onUpdate('grayscale', value)}
          onPreview={(value) => onPreview('grayscale', value)}
          onPreviewEnd={onPreviewEnd}
        />
      </div>

      {/* Opacity */}
      <RangeSlider
        label="Opacity"
        value={selectedElement.opacity || 100}
        min={0}
        max={100}
        step={1}
        unit="%"
        gradientTrack
        onChange={(value) => onUpdate('opacity', value)}
        onPreview={(value) => onPreview('opacity', value)}
        onPreviewEnd={onPreviewEnd}
      />
    </div>
  );
});

const LayoutSection = memo<{ 
  selectedElement: InteractiveElement;
  onUpdate: (property: keyof InteractiveElement, value: any) => void;
  onPreview: (property: keyof InteractiveElement, value: any) => void;
  onPreviewEnd: () => void;
}>(({ selectedElement, onUpdate, onPreview, onPreviewEnd }) => {
  const displayOptions = useMemo(() => [
    { value: 'block', label: 'Block' },
    { value: 'inline', label: 'Inline' },
    { value: 'inline-block', label: 'Inline Block' },
    { value: 'flex', label: 'Flex' },
    { value: 'grid', label: 'Grid' },
  ], []);

  const flexDirectionOptions = useMemo(() => [
    { value: 'row', label: 'Row', icon: 'fa-arrow-right' },
    { value: 'col', label: 'Column', icon: 'fa-arrow-down' },
    { value: 'row-reverse', label: 'Row Rev', icon: 'fa-arrow-left' },
    { value: 'col-reverse', label: 'Col Rev', icon: 'fa-arrow-up' },
  ], []);

  const alignOptions = useMemo(() => [
    { value: 'start', label: 'Start' },
    { value: 'center', label: 'Center' },
    { value: 'end', label: 'End' },
    { value: 'stretch', label: 'Stretch' },
  ], []);

  const justifyOptions = useMemo(() => [
    { value: 'start', label: 'Start' },
    { value: 'center', label: 'Center' },
    { value: 'end', label: 'End' },
    { value: 'between', label: 'Space Between' },
    { value: 'around', label: 'Space Around' },
    { value: 'evenly', label: 'Space Evenly' },
  ], []);

  return (
    <div className="space-y-4">
      {/* Display Type */}
      <ToggleGroup
        label="Display Type"
        value={selectedElement.display || 'block'}
        options={displayOptions}
        onChange={(value) => onUpdate('display', value)}
        onPreview={(value) => onPreview('display', value)}
        onPreviewEnd={onPreviewEnd}
      />

      {/* Flex Settings */}
      {selectedElement.display === 'flex' && (
        <div className="space-y-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <h4 className="text-sm font-semibold text-blue-800">Flex Settings</h4>
          
          <ToggleGroup
            label="Direction"
            value={selectedElement.flexDirection || 'row'}
            options={flexDirectionOptions}
            onChange={(value) => onUpdate('flexDirection', value)}
            onPreview={(value) => onPreview('flexDirection', value)}
            onPreviewEnd={onPreviewEnd}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Align Items"
              value={selectedElement.alignItems || 'start'}
              options={alignOptions}
              onChange={(value) => onUpdate('alignItems', value)}
              onPreview={(value) => onPreview('alignItems', value)}
              onPreviewEnd={onPreviewEnd}
            />
            
            <Select
              label="Justify Content"
              value={selectedElement.justifyContent || 'start'}
              options={justifyOptions}
              onChange={(value) => onUpdate('justifyContent', value)}
              onPreview={(value) => onPreview('justifyContent', value)}
              onPreviewEnd={onPreviewEnd}
            />
          </div>
        </div>
      )}

      {/* Dimensions */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Width</label>
          <input
            type="number"
            value={selectedElement.width || ''}
            onChange={(e) => onUpdate('width', parseInt(e.target.value) || undefined)}
            onFocus={() => onPreview('width', selectedElement.width)}
            onBlur={onPreviewEnd}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm transition-all duration-200"
            placeholder="Auto"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Height</label>
          <input
            type="number"
            value={selectedElement.height || ''}
            onChange={(e) => onUpdate('height', parseInt(e.target.value) || undefined)}
            onFocus={() => onPreview('height', selectedElement.height)}
            onBlur={onPreviewEnd}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm transition-all duration-200"
            placeholder="Auto"
          />
        </div>
      </div>
    </div>
  );
});

const AdvancedFormatPanel: React.FC<AdvancedFormatPanelProps> = memo(({
  selectedElement,
  onUpdateElement,
}) => {
  // State management
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

  // Note: toggleFormat and setTextCase are handled directly in the FormattingSection component

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

  // Real-time preview handlers
  const handlePreview = useCallback((property: keyof InteractiveElement, value: any) => {
    previewStyles(selectedElement.id, property, value, selectedElement);
  }, [selectedElement]);

  const handlePreviewEnd = useCallback(() => {
    resetPreviewStyles(selectedElement.id, selectedElement);
  }, [selectedElement]);

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
        <TextFormattingSection
          selectedElement={selectedElement}
          onUpdate={updateProperty}
          onPreview={handlePreview}
          onPreviewEnd={handlePreviewEnd}
        />
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
              textAlign: selectedElement.textAlign || 'right', // Fix: Default to right for better RTL support
              color: selectedElement.color || '#000000',
              letterSpacing: selectedElement.letterSpacing ? `${selectedElement.letterSpacing}px` : 'normal',
              lineHeight: selectedElement.lineHeight || 'normal',
              // Apply formatting styles
              fontStyle: selectedElement.italic ? 'italic' : 'normal',
              textDecoration: [
                selectedElement.underline ? 'underline' : '',
                selectedElement.strikethrough ? 'line-through' : ''
              ].filter(Boolean).join(' ') || 'none',
              backgroundColor: selectedElement.backgroundColor || 'transparent',
              opacity: selectedElement.opacity !== undefined ? selectedElement.opacity / 100 : 1,
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
        <ElementStylingSection
          selectedElement={selectedElement}
          onUpdate={updateProperty}
          onPreview={handlePreview}
          onPreviewEnd={handlePreviewEnd}
        />
      </CollapsibleSection>

      {/* Layout & Responsive Controls */}
      <CollapsibleSection id="layout" title="Layout & Responsive Controls" icon="fa-th-large">
        <LayoutSection
          selectedElement={selectedElement}
          onUpdate={updateProperty}
          onPreview={handlePreview}
          onPreviewEnd={handlePreviewEnd}
        />
      </CollapsibleSection>

      {/* Presets System */}
      {presets.length > 0 && (
        <CollapsibleSection id="presets" title="Saved Presets" icon="fa-bookmark">
          <div className="grid grid-cols-2 gap-3">
            {presets.map((preset) => (
              <PresetCard
                key={preset.id}
                preset={preset}
                onApply={() => applyPreset(preset)}
                onDelete={() => {
                  const newPresets = presets.filter(p => p.id !== preset.id);
                  savePresets(newPresets);
                }}
                onPreview={() => {
                  // Apply all preset styles as preview
                  Object.entries(preset.styles).forEach(([property, value]) => {
                    if (value !== undefined) {
                      handlePreview(property as keyof InteractiveElement, value);
                    }
                  });
                }}
                onPreviewEnd={handlePreviewEnd}
              />
            ))}
          </div>
        </CollapsibleSection>
      )}
      </div>

  )}
)

export default AdvancedFormatPanel;
