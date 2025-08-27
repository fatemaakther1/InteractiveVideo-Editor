import React from 'react';
import { Button } from '../ui';

export interface AdminToolbarProps {
  onLoadProject: () => void;
  onSaveProject: () => void;
  onPreview: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  isSaving?: boolean;
}

const AdminToolbar: React.FC<AdminToolbarProps> = ({
  onLoadProject,
  onSaveProject,
  onPreview,
  onUndo,
  onRedo,
  isSaving = false,
}) => {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white/95 backdrop-blur-sm border-b border-secondary-200 shadow-soft">
      <div className="flex items-center space-x-4">
        <div className="relative group">
          <Button
            variant="secondary"
            size="md"
            icon="fas fa-bars"
            className="text-secondary-700 bg-secondary-50 border border-secondary-200 hover:bg-secondary-100 hover:border-secondary-300"
          >
            File
          </Button>
          
          <div className="absolute left-0 top-full mt-2 w-56 bg-white border border-secondary-200 rounded-xl shadow-large opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 overflow-hidden">
            <button
              onClick={onLoadProject}
              className="flex items-center w-full px-4 py-3 text-sm text-secondary-700 hover:bg-primary-50 hover:text-primary-700 transition-all duration-200"
            >
              <i className="fas fa-folder-open mr-3 text-primary-500"></i>
              Open Project
            </button>
            
            <button
              onClick={onSaveProject}
              className="flex items-center w-full px-4 py-3 text-sm text-secondary-700 hover:bg-primary-50 hover:text-primary-700 transition-all duration-200"
            >
              <i className="fas fa-save mr-3 text-primary-500"></i>
              Save Project
            </button>
            
            <button
              onClick={onSaveProject}
              className="flex items-center w-full px-4 py-3 text-sm text-secondary-700 hover:bg-primary-50 hover:text-primary-700 transition-all duration-200"
            >
              <i className="fas fa-download mr-3 text-primary-500"></i>
              Export
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {onUndo && (
          <Button
            variant="ghost"
            size="sm"
            icon="fas fa-undo"
            className="p-2.5 text-secondary-500 hover:text-primary-600 hover:bg-primary-50 rounded-xl"
            title="Undo"
            onClick={onUndo}
          />
        )}
        
        {onRedo && (
          <Button
            variant="ghost"
            size="sm"
            icon="fas fa-redo"
            className="p-2.5 text-secondary-500 hover:text-primary-600 hover:bg-primary-50 rounded-xl"
            title="Redo"
            onClick={onRedo}
          />
        )}
        
        <Button
          variant="primary"
          size="md"
          icon="fas fa-play"
          onClick={onPreview}
          className="shadow-medium"
          title="Preview"
        >
          Preview
        </Button>
        
        <Button
          variant="secondary"
          size="md"
          icon={isSaving ? "fas fa-spinner animate-spin" : "fas fa-save"}
          onClick={onSaveProject}
          loading={isSaving}
          title="Save"
        >
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
      </div>

      <div className="flex items-center space-x-3">
        <Button
          variant="ghost"
          size="sm"
          icon="fas fa-closed-captioning"
          className="p-2.5 text-secondary-500 hover:text-primary-600 hover:bg-primary-50 rounded-xl"
          title="Subtitles and Transcript"
        />
        
        <Button
          variant="accent"
          size="md"
          icon="fas fa-robot"
          className="px-4 py-2.5 font-medium"
          title="AI Assistant"
        >
          AI Assistant
        </Button>
      </div>
    </header>
  );
};

export default AdminToolbar;
