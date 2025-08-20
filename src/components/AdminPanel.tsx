import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import VideoPlayerAdmin from './VideoPlayerAdmin';
import type { InteractiveElement, TabType, ElementType } from '../types';
import { ELEMENT_TYPES, VIDEO_CONFIG, DEFAULT_POSITIONS } from '../constants';
import { storage, elementUtils, validation, format } from '../utils';
import '../styles/AdminPanel.css';

const AdminPanel = () => {
  const navigate = useNavigate();
  const [elements, setElements] = useState<InteractiveElement[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('element-list');
  const [showModal, setShowModal] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedElementType, setSelectedElementType] = useState<ElementType | ''>('');
  const [currentElement, setCurrentElement] = useState<Partial<InteractiveElement> | null>(null);
  const [optionsText, setOptionsText] = useState(''); // Separate state for options input
  const videoRef = useRef<any>(null);

  const handleAddElement = useCallback((_x: number, _y: number) => {
    // This will be called when clicking on the video in admin mode
    // Parameters prefixed with _ to indicate they're unused but required
  }, []);

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  const handleElementTypeSelect = (type: string) => {
    setSelectedElementType(type as ElementType);
    setShowModal(true);
    setOptionsText(''); // Reset options text
    const currentTime = videoRef.current?.currentTime || 0;
    setCurrentElement({
      type: type as ElementType,
      x: DEFAULT_POSITIONS.ELEMENT_X,
      y: DEFAULT_POSITIONS.ELEMENT_Y,
      timestamp: currentTime,
      endTime: currentTime + VIDEO_CONFIG.DEFAULT_ELEMENT_DURATION,
      content: '',
    });
  };

  const handleSaveElement = () => {
    if (!currentElement || !validation.isValidElement(currentElement)) {
      return;
    }

    // Process options from the text input
    let processedOptions = currentElement.options;
    if (currentElement.questionType === 'multiple-choice' && optionsText) {
      processedOptions = optionsText
        .split(',')
        .map(option => option.trim())
        .filter(option => option.length > 0);
    }

    const newElement: InteractiveElement = {
      id: elementUtils.generateId(),
      type: currentElement.type!,
      content: currentElement.content!,
      x: currentElement.x!,
      y: currentElement.y!,
      timestamp: currentElement.timestamp!,
      endTime: currentElement.endTime!,
      url: currentElement.url,
      action: currentElement.action,
      questionType: currentElement.questionType,
      options: processedOptions,
      correctAnswer: currentElement.correctAnswer,
    };

    setElements(prev => [...prev, newElement]);
    setCurrentElement(null);
    setOptionsText(''); // Reset options text
    setShowModal(false);
  };

  const handleSaveProject = () => {
    const projectData = {
      elements,
      timestamp: new Date().toISOString(),
    };
    storage.save(projectData);
    alert('Project saved successfully!');
  };

  // Remove unused function - can be re-added if needed later
  // const handleDeleteAllElements = () => {
  //   if (confirm('Are you sure you want to delete all elements?')) {
  //     setElements([]);
  //     storage.clear();
  //   }
  // };

  const loadProject = () => {
    const savedElements = storage.load();
    setElements(savedElements);
  };

  const goToPreview = () => {
    const projectData = {
      elements,
      timestamp: new Date().toISOString(),
    };
    storage.save(projectData);
    navigate('/preview');
  };

  
  React.useEffect(() => {
    loadProject();
  }, []);

  return (
    <div className="admin-panel">
      {/* Top Navigation Bar */}
      <div className="top-navbar">
        <div className="nav-left">
          <div className="nav-icon">🎬</div>
          <span className="nav-title">Interactive Video Admin</span>
        </div>
        <div className="nav-center">
          <button
            className="nav-btn preview-btn"
            onClick={goToPreview}
          >
            👁 Preview
          </button>
        </div>
        <div className="nav-right">
          <button className="nav-btn save-btn" onClick={handleSaveProject}>💾 Save</button>
          <button className="nav-btn add-btn" onClick={toggleSidebar}>+</button>
        </div>
      </div>

      {/* Main Container */}
      <div className="main-container">
        {/* Video Player Area */}
        <div className="video-area">
          <VideoPlayerAdmin
            ref={videoRef}
            elements={elements}
            onAddElement={handleAddElement}
          />
        </div>

        {/* Right Sidebar */}
        {showSidebar && (
          <div className="right-sidebar">
            {/* Tab Navigation */}
            <div className="tab-navigation">
              <button
                className={`tab-btn ${activeTab === 'element-list' ? 'active' : ''}`}
                onClick={() => setActiveTab('element-list')}
              >
                Element list
              </button>
              <button
                className={`tab-btn ${activeTab === 'contents' ? 'active' : ''}`}
                onClick={() => setActiveTab('contents')}
              >
                Contents
              </button>
            </div>

            {/* Tab Content */}
            <div className="tab-content">
              {activeTab === 'element-list' && (
                <div className="element-list-tab">
                  <div className="elements-section">
                    <h4>ELEMENTS</h4>
                    <div className="element-types">
                      {ELEMENT_TYPES.map((elementType) => (
                        <div
                          key={elementType.type}
                          className="element-type-item"
                          onClick={
                            
                            () => handleElementTypeSelect(elementType.type)

                          }
                        >
                          <span className="element-icon">{elementType.icon}</span>
                          <span className="element-label">{elementType.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'contents' && (
                <div className="contents-tab">
                  <div className="contents-list">
                    <h4>ADDED ELEMENTS ({elements.length})</h4>
                    {elements.length === 0 ? (
                      <div className="empty-state">
                        <p>No elements added yet</p>
                        <p>Click on an element type to add your first element</p>
                      </div>
                    ) : (
                      elements.map((element) => (
                        <div key={element.id} className="content-item">
                          <div className="content-info">
                            <span className="content-type">{ELEMENT_TYPES.find(t => t.type === element.type)?.icon}</span>
                            <div className="content-details">
                              <div className="content-title">{element.content}</div>
                              <div className="content-meta">Type: {element.type} | Time: {format.timeToFixed(element.timestamp)}s</div>
                            </div>
                          </div>
                          <button
                            className="delete-element-btn"
                            onClick={() => setElements(prev => prev.filter(el => el.id !== element.id))}
                          >
                            ×
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Configuration Modal */}
      {showModal && currentElement && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <div className="modal-header">
              <h3>Configure {
              selectedElementType.charAt(0).toUpperCase() + selectedElementType.slice(1)
              }</h3>
              <button
                className="modal-close-btn"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-field">
                <label>Content : </label>
                <input
                  type="text"
                  value={currentElement.content || ''}
                  onChange={
                    (e) => setCurrentElement(prev => 
                    ({ ...prev, content: e.target.value }))
                  }
                  placeholder={`Enter ${selectedElementType} content`}
                />
              </div>

              {selectedElementType === 'interactive-question' && (
                <>
                  <div className="form-field">
                    <label>Question Type : </label>
                    <select
                      value={currentElement.questionType || 'multiple-choice'}
                      onChange={(e) => setCurrentElement(prev => ({ ...prev, questionType: e.target.value as any }))}
                    >
                      <option value="multiple-choice">Multiple Choice</option>
                      <option value="text-input">Text Input</option>
                      <option value="true-false">True/False</option>
                    </select>
                  </div>

                  {currentElement.questionType === 'multiple-choice' && (
                    <div className="form-field">
                      <label>Options (comma-separated):</label>
                      <input
                        type="text"
                        value={optionsText}
                        onChange={(e) => setOptionsText(e.target.value)}
                        placeholder="Option 1, Option 2, Option 3"
                      />
                    </div>
                  )}

                  <div className="form-field">
                    <label>Correct Answer : </label>
                    <input
                      type="text"
                      value={currentElement.correctAnswer || ''}
                      onChange={(e) => setCurrentElement(prev => ({ ...prev, correctAnswer: e.target.value }))}
                      placeholder="Enter correct answer"
                    />
                  </div>
                </>
              )}

              {(selectedElementType === 'image') && (
                <div className="form-field">
                  <label>Image URL:</label>
                  <input
                    type="url"
                    value={currentElement.url || ''}
                    onChange={(e) => setCurrentElement(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              )}

              {(selectedElementType === 'interactive-button' || selectedElementType === 'opener') && (
                <div className="form-field">
                  <label>Action:</label>
                  <input
                    type="text"
                    value={currentElement.action || ''}
                    onChange={(e) => setCurrentElement(prev => ({ ...prev, action: e.target.value }))}
                    placeholder="Describe what happens when clicked"
                  />
                </div>
              )}

              <div className="form-field">
                <label>Start Time (seconds):</label>
                <input
                  type="number"
                  step="0.1"
                  value={currentElement.timestamp || 0}
                  onChange={(e) => setCurrentElement(prev => ({ ...prev, timestamp: parseFloat(e.target.value) }))}
                />
              </div>

              <div className="form-field">
                <label>End Time (seconds):</label>
                <input
                  type="number"
                  step="0.1"
                  value={currentElement.endTime || 0}
                  onChange={(e) => setCurrentElement(prev => ({ ...prev, endTime: parseFloat(e.target.value) }))}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleSaveElement}
                disabled={!currentElement.content}
              >
                Add Element
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
