import React from 'react';
import { Toggle, Input } from '../ui';
import type { InteractiveElement } from '../../types';

export interface TimingInspectorProps {
  element: InteractiveElement;
  onUpdate: (element: InteractiveElement) => void;
  onDelete: () => void;
}

const TimingInspector: React.FC<TimingInspectorProps> = ({
  element,
  onUpdate,
  onDelete,
}) => {
  const handleTimestampChange = (field: 'start' | 'end', timeType: 'minutes' | 'seconds', value: number) => {
    const currentTime = field === 'start' ? element.timestamp : element.endTime;
    const minutes = Math.floor(currentTime / 60);
    const seconds = currentTime % 60;

    let newTime: number;
    if (timeType === 'minutes') {
      newTime = value * 60 + seconds;
    } else {
      newTime = minutes * 60 + value;
    }

    // Ensure end time is always after start time
    if (field === 'start' && newTime >= element.endTime) {
      onUpdate({
        ...element,
        timestamp: newTime,
        endTime: newTime + 1, // Add 1 second buffer
      });
    } else if (field === 'end' && newTime <= element.timestamp) {
      onUpdate({
        ...element,
        endTime: element.timestamp + 1, // Add 1 second buffer
      });
    } else {
      onUpdate({
        ...element,
        [field === 'start' ? 'timestamp' : 'endTime']: newTime,
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white shadow-medium">
            <i className="fas fa-clock" />
          </div>
          <div>
            <h2 className="font-bold text-secondary-900 capitalize">
              {element.type.replace('-', ' ')} Timing
            </h2>
            <p className="text-xs text-secondary-500">
              Configure timing and behavior
            </p>
          </div>
        </div>

        <div className="flex space-x-1">
          <button
            className="p-2 text-secondary-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-soft"
            title="Pin"
          >
            <i className="fas fa-thumbtack" />
          </button>
          <button
            className="p-2 text-secondary-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-soft"
            title="Duplicate"
          >
            <i className="fas fa-copy" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-secondary-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-soft"
            title="Delete"
          >
            <i className="fas fa-trash" />
          </button>
        </div>
      </div>

      {/* Image Settings - Show only for image elements */}
      {element.type === 'image' && (
        <div className=" rounded-2xl p-4 border border-emerald-200 shadow-soft">
          <div className="flex items-center space-x-3 mb-4">
              <i className="fas fa-link mr-2 text-primary-600" />
            <div>
              <h3 className="font-bold text-secondary-900 text-sm">Image URL</h3>
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              
              <div className="relative">
                <input
                  type="url"
                  value={element.url || ''}
                  onChange={(e) => onUpdate({ ...element, url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2.5 pr-10 border-2 border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 text-sm"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <i className="fas fa-link text-secondary-400" />
                </div>
              </div>
              {element.url && (
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="text-emerald-600 flex items-center">
                    <i className="fas fa-check-circle mr-1" />
                    Image URL provided
                  </span>
                  <button
                    onClick={() => onUpdate({ ...element, url: '' })}
                    className="text-red-500 hover:text-red-700 flex items-center transition-colors"
                  >
                    <i className="fas fa-times mr-1" />
                    Clear
                  </button>
                </div>
              )}
              {!element.url && (
                <p className="mt-2 text-xs text-secondary-500">
                  Add an image URL to display instead of the + icon
                </p>
              )}
            </div>
            
             
          </div>
        </div>
      )}

      {/* General Settings */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-secondary-200 shadow-soft">
        <h3 className="text-sm font-bold text-secondary-800 mb-4 flex items-center">
          <i className="fas fa-cog mr-2 text-primary-600" />
          General Settings
        </h3>
        <div className="space-y-4">
          <Toggle
            label="Keep it always visible"
            description="Element remains visible throughout the video"
          />

          <div>
            <label className="block text-sm font-bold text-secondary-800 mb-3">
              Duration
            </label>
            <div className="grid grid-cols-3 gap-2">
              <Input
                type="number"
                placeholder="min"
                className="text-center font-mono"
              />
              <Input
                type="number"
                placeholder="sec"
                className="text-center font-mono"
              />
              <Input
                type="number"
                placeholder="ms"
                className="text-center font-mono"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Timing Control */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-secondary-200 shadow-soft">
        <h3 className="text-sm font-bold text-secondary-800 mb-4 flex items-center">
          <i className="fas fa-stopwatch mr-2 text-primary-600" />
          Timing Control
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-secondary-800 mb-3">
              Start Time
            </label>
            <div className="grid grid-cols-3 gap-2">
              <Input
                type="number"
                value={Math.floor(element.timestamp / 60)}
                onChange={(e) => handleTimestampChange('start', 'minutes', parseInt(e.target.value) || 0)}
                className="text-center font-mono"
                placeholder="min"
              />
              <Input
                type="number"
                value={Math.floor(element.timestamp % 60)}
                onChange={(e) => handleTimestampChange('start', 'seconds', parseInt(e.target.value) || 0)}
                className="text-center font-mono"
                placeholder="sec"
              />
              <Input
                type="number"
                placeholder="ms"
                className="text-center font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-secondary-800 mb-3">
              End Time
            </label>
            <div className="grid grid-cols-3 gap-2">
              <Input
                type="number"
                value={Math.floor(element.endTime / 60)}
                onChange={(e) => handleTimestampChange('end', 'minutes', parseInt(e.target.value) || 0)}
                className="text-center font-mono"
                placeholder="min"
              />
              <Input
                type="number"
                value={Math.floor(element.endTime % 60)}
                onChange={(e) => handleTimestampChange('end', 'seconds', parseInt(e.target.value) || 0)}
                className="text-center font-mono"
                placeholder="sec"
              />
              <Input
                type="number"
                placeholder="ms"
                className="text-center font-mono"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Visibility Settings */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-secondary-200 shadow-soft">
        <h3 className="text-sm font-bold text-secondary-800 mb-4 flex items-center">
          <i className="fas fa-eye mr-2 text-primary-600" />
          Visibility Settings
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-secondary-800 mb-3">
              Element is visible to
            </label>
            <select className="w-full px-4 py-3 border-2 border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-secondary-50">
              <option>All users</option>
              <option>Logged in users</option>
              <option>Specific groups</option>
            </select>
          </div>

          <Toggle
            label="Set custom timeframe"
            description="Override default timing behavior"
          />
        </div>
      </div>

      {/* Video Behavior */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-secondary-200 shadow-soft">
        <h3 className="text-sm font-bold text-secondary-800 mb-4 flex items-center">
          <i className="fas fa-play-circle mr-2 text-primary-600" />
          Video Behavior
        </h3>
        <div className="space-y-3">
          <Toggle
            label="Pause video when element appears"
            description="Video will pause when this element becomes visible"
          />
          <Toggle
            label="Play notification sound"
            description="Sound alert when element appears"
          />
          <Toggle
            label="Pause video on interaction"
            description="Video pauses when user interacts with element"
          />
          <Toggle
            label="Show interaction indicator"
            description="Visual cue that element is interactive"
          />
        </div>
      </div>
    </div>
  );
};

export default TimingInspector;
