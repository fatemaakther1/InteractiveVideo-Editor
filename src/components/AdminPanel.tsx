import React, { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import VideoPlayerAdmin from "./VideoPlayerAdmin";
import ResizableDraggableElement from "./ResizableDraggableElement";
import type { InteractiveElement, ElementType } from "../types";
import { ELEMENT_TYPES, VIDEO_CONFIG, DEFAULT_POSITIONS } from "../constants";
import { storage, elementUtils, validation, format } from "../utils";

type InspectorTab = "timing" | "format" | "effects";
type LeftSidebarTab = "videos" | "elements";

const AdminPanel = () => {
  const navigate = useNavigate();
  const [elements, setElements] = useState<InteractiveElement[]>([]);
  const [activeInspectorTab, setActiveInspectorTab] =
    useState<InspectorTab>("timing");
  const [activeLeftTab, setActiveLeftTab] =
    useState<LeftSidebarTab>("elements");
  const [selectedElement, setSelectedElement] =
    useState<InteractiveElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [showElementModal, setShowElementModal] = useState(false);
  const [draggingElement, setDraggingElement] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const videoRef = useRef<any>(null);

  // Auto-save functionality
  useEffect(() => {
    const autoSave = () => {
      if (elements.length > 0) {
        const projectData = {
          elements,
          timestamp: new Date().toISOString(),
        };
        storage.save(projectData);
      }
    };

    const interval = setInterval(autoSave, 10000); // Auto-save every 10 seconds
    return () => clearInterval(interval);
  }, [elements]);

  const loadProject = useCallback(() => {
    const savedElements = storage.load();
    setElements(savedElements);
  }, []);

  const handleSaveProject = useCallback(() => {
    const projectData = {
      elements,
      timestamp: new Date().toISOString(),
    };
    storage.save(projectData);
    // Show a brief success message
    const button = document.querySelector(".save-btn");
    if (button) {
      const originalText = button.innerHTML;
      button.innerHTML = '<i class="fas fa-check"></i> Saved!';
      setTimeout(() => {
        button.innerHTML = originalText;
      }, 2000);
    }
  }, [elements]);

  const goToPreview = useCallback(() => {
    handleSaveProject();
    navigate("/preview");
  }, [handleSaveProject, navigate]);

  const handleAddElementClick = useCallback(() => {
    setShowElementModal(true);
  }, []);

  const handleElementTypeSelect = useCallback(
    (elementType: ElementType) => {
      const newElement: InteractiveElement = {
        id: elementUtils.generateId(),
        type: elementType,
        content: `New ${elementType}`,
        x: 100,
        y: 100,
        timestamp: currentTime,
        endTime: currentTime + VIDEO_CONFIG.DEFAULT_ELEMENT_DURATION,
      };

      setElements((prev) => [...prev, newElement]);
      setSelectedElement(newElement);
      setShowElementModal(false);
    },
    [currentTime]
  );

  const onAddElement = useCallback((x: number, y: number) => {
    setShowElementModal(true);
  }, []);

  const handleElementSelect = useCallback((element: InteractiveElement) => {
    setSelectedElement(element);
  }, []);

  const handleElementUpdate = useCallback(
    (updatedElement: InteractiveElement) => {
      setElements((prev) =>
        prev.map((el) => (el.id === updatedElement.id ? updatedElement : el))
      );
      setSelectedElement(updatedElement);
    },
    []
  );

  const handleElementDelete = useCallback(
    (elementId: string) => {
      setElements((prev) => prev.filter((el) => el.id !== elementId));
      if (selectedElement?.id === elementId) {
        setSelectedElement(null);
      }
    },
    [selectedElement]
  );

  // Drag and drop functionality
  const handleMouseDown = useCallback(
    (e: React.MouseEvent, elementId: string) => {
      e.preventDefault();
      setDraggingElement(elementId);

      const element = elements.find((el) => el.id === elementId);
      if (element) {
        setDragOffset({
          x: e.clientX - element.x,
          y: e.clientY - element.y,
        });
      }
    },
    [elements]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (draggingElement) {
        const videoContainer = document.querySelector(".video-container");
        if (videoContainer) {
          const rect = videoContainer.getBoundingClientRect();
          const newX = Math.max(
            0,
            Math.min(rect.width - 100, e.clientX - rect.left - dragOffset.x)
          );
          const newY = Math.max(
            0,
            Math.min(rect.height - 50, e.clientY - rect.top - dragOffset.y)
          );

          setElements((prev) =>
            prev.map((el) =>
              el.id === draggingElement ? { ...el, x: newX, y: newY } : el
            )
          );
        }
      }
    },
    [draggingElement, dragOffset]
  );

  const handleMouseUp = useCallback(() => {
    setDraggingElement(null);
  }, []);

  useEffect(() => {
    if (draggingElement) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [draggingElement, handleMouseMove, handleMouseUp]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  const getTimeString = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  const getVisibleElements = (): InteractiveElement[] => {
    return elements.filter(
      (element) =>
        currentTime >= element.timestamp && currentTime <= element.endTime
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-secondary-50 to-secondary-100">
      {/* Top Toolbar */}
      <header className="flex items-center justify-between px-6 py-4 bg-white/95 backdrop-blur-sm border-b border-secondary-200 shadow-soft">
        <div className="flex items-center space-x-4">
          <div className="relative group">
            <button className="flex items-center px-4 py-2.5 text-sm font-medium text-secondary-700 bg-secondary-50 border border-secondary-200 rounded-xl hover:bg-secondary-100 hover:border-secondary-300 transition-all duration-200 shadow-soft">
              <i className="fas fa-bars mr-2 text-primary-600"></i>
              File
            </button>
            <div className="absolute left-0 top-full mt-2 w-56 bg-white border border-secondary-200 rounded-xl shadow-large opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 overflow-hidden">
              <button
                onClick={loadProject}
                className="flex items-center w-full px-4 py-3 text-sm text-secondary-700 hover:bg-primary-50 hover:text-primary-700 transition-all duration-200"
              >
                <i className="fas fa-folder-open mr-3 text-primary-500"></i>
                Open Project
              </button>
              <button
                onClick={handleSaveProject}
                className="flex items-center w-full px-4 py-3 text-sm text-secondary-700 hover:bg-primary-50 hover:text-primary-700 transition-all duration-200"
              >
                <i className="fas fa-save mr-3 text-primary-500"></i>
                Save Project
              </button>
              <button
                onClick={handleSaveProject}
                className="flex items-center w-full px-4 py-3 text-sm text-secondary-700 hover:bg-primary-50 hover:text-primary-700 transition-all duration-200"
              >
                <i className="fas fa-download mr-3 text-primary-500"></i>
                Export
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            className="p-2.5 text-secondary-500 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all duration-200 transform hover:scale-105"
            title="Undo"
          >
            <i className="fas fa-undo"></i>
          </button>
          <button
            className="p-2.5 text-secondary-500 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all duration-200 transform hover:scale-105"
            title="Redo"
          >
            <i className="fas fa-redo"></i>
          </button>
          <button
            onClick={goToPreview}
            className="btn-primary flex items-center space-x-2 shadow-medium"
            title="Preview"
          >
            <i className="fas fa-play"></i>
            <span>Preview</span>
          </button>
          <button
            onClick={handleSaveProject}
            className="btn-secondary save-btn flex items-center space-x-2"
            title="Save"
          >
            <i className="fas fa-save"></i>
            <span>Save</span>
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <button
            className="p-2.5 text-secondary-500 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all duration-200 transform hover:scale-105"
            title="Subtitles and Transcript"
          >
            <i className="fas fa-closed-captioning"></i>
          </button>
          <button
            className="px-4 py-2.5 text-white bg-gradient-to-r from-primary-600 to-accent-600 rounded-xl hover:from-primary-700 hover:to-accent-700 transition-all duration-200 transform hover:scale-105 shadow-medium font-medium"
            title="AI Assistant"
          >
            <i className="fas fa-robot mr-2"></i>
            AI Assistant
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Elements */}
        <aside className="w-72 bg-white/95 backdrop-blur-sm border-r border-secondary-200 flex flex-col shadow-soft">
          <div className="p-4 border-b border-secondary-200">
            <div className="flex bg-secondary-100 rounded-xl p-1">
              <button
                className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                  activeLeftTab === "videos"
                    ? "bg-white text-primary-700 shadow-soft"
                    : "text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50"
                }`}
                onClick={() => setActiveLeftTab("videos")}
              >
                <i className="fas fa-video mr-2"></i>
                Videos
              </button>
              <button
                className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                  activeLeftTab === "elements"
                    ? "bg-white text-primary-700 shadow-soft"
                    : "text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50"
                }`}
                onClick={() => setActiveLeftTab("elements")}
              >
                <i className="fas fa-layer-group mr-2"></i>
                Elements
              </button>
            </div>
          </div>

          <div className="flex-1 p-4 overflow-y-auto">
            <div className="flex items-center space-x-3 mb-6">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search elements..."
                  className="w-full px-4 py-2.5 pr-10 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-secondary-50 text-secondary-900 placeholder-secondary-500"
                />
                <i className="fas fa-search absolute right-3 top-3 text-secondary-400"></i>
              </div>
              <button
                onClick={handleAddElementClick}
                className="w-11 h-11 bg-primary-600 hover:bg-primary-700 text-white rounded-xl flex items-center justify-center transition-all duration-200 transform hover:scale-105 shadow-soft hover:shadow-medium"
                title="Add Element"
              >
                <i className="fas fa-plus"></i>
              </button>
            </div>

            <div className="space-y-3">
              {elements.map((element) => (
                <div
                  key={element.id}
                  onClick={() => handleElementSelect(element)}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-soft animate-slide-in group ${
                    selectedElement?.id === element.id
                      ? "border-primary-500 bg-primary-50/50 ring-2 ring-primary-200"
                      : "border-secondary-200 hover:border-primary-300 hover:bg-primary-50/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-xs font-mono text-secondary-600 bg-secondary-100 px-2.5 py-1 rounded-full">
                        {getTimeString(element.timestamp)}
                      </span>
                      <span
                        className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${
                          element.type === "text"
                            ? "bg-primary-100 text-primary-800"
                            : element.type === "interactive-button"
                            ? "bg-accent-100 text-accent-800"
                            : element.type === "interactive-question"
                            ? "bg-blue-100 text-blue-800"
                            : element.type === "image"
                            ? "bg-emerald-100 text-emerald-800"
                            : element.type === "pointer"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-secondary-100 text-secondary-800"
                        }`}
                      >
                        {element.type.replace("-", " ")}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleElementDelete(element.id);
                      }}
                      className="p-1.5 text-secondary-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                    >
                      <i className="fas fa-trash text-sm"></i>
                    </button>
                  </div>
                  <p className="text-sm text-secondary-700 mt-3 font-medium leading-relaxed">
                    {element.content}
                  </p>
                </div>
              ))}

              {elements.length === 0 && (
                <div className="text-center py-12 text-secondary-500">
                  <div className="w-16 h-16 mx-auto mb-4 bg-primary-100 rounded-full flex items-center justify-center">
                    <i className="fas fa-layer-group text-2xl text-primary-600"></i>
                  </div>
                  <p className="text-sm font-medium mb-1">
                    No elements added yet
                  </p>
                  <p className="text-xs text-secondary-400">
                    Click the + button to add your first interactive element
                  </p>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Main Canvas Area */}
        <section className="flex-1 flex flex-col bg-gradient-to-br from-secondary-100/50 to-secondary-200/30">
          <div className="flex-1 relative m-6 rounded-2xl overflow-hidden shadow-large border border-secondary-200/50 video-container bg-black">
            <VideoPlayerAdmin
              ref={videoRef}
              elements={elements}
              onAddElement={onAddElement}
              onTimeUpdate={setCurrentTime}
            />

            {/* Interactive Elements Overlay */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ zIndex: 10 }}
            >
              {getVisibleElements().map((element) => (
                <div key={element.id} className="pointer-events-auto">
                  <ResizableDraggableElement
                    element={element}
                    onUpdate={handleElementUpdate}
                    onSelect={handleElementSelect}
                    isSelected={selectedElement?.id === element.id}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Right Sidebar - Inspector */}
        <aside className="w-96 bg-white/95 backdrop-blur-sm border-l border-secondary-200 flex flex-col shadow-soft">
          <div className="p-4 border-b border-secondary-200">
            <div className="grid grid-cols-3 gap-2 bg-secondary-100 rounded-xl p-1">
              {(["timing", "format", "effects"] as const).map((tab) => (
                <button
                  key={tab}
                  className={`flex flex-col items-center px-3 py-3 text-xs font-bold rounded-lg transition-all duration-200 ${
                    activeInspectorTab === tab
                      ? "bg-white text-primary-700 shadow-soft ring-2 ring-primary-200"
                      : "text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50"
                  }`}
                  onClick={() => setActiveInspectorTab(tab)}
                >
                  <i
                    className={`text-lg mb-1 ${
                      tab === "timing"
                        ? "fas fa-clock"
                        : tab === "format"
                        ? "fas fa-palette"
                        : "fas fa-magic"
                    }`}
                  ></i>
                  <span className="uppercase tracking-wider">
                    {tab === "timing"
                      ? "Timing"
                      : tab === "format"
                      ? "Format"
                      : "Effects"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-white to-secondary-50">
            {activeInspectorTab === "timing" && selectedElement && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${
                        selectedElement.type === "text"
                          ? "from-primary-500 to-primary-600"
                          : selectedElement.type === "interactive-button"
                          ? "from-accent-500 to-accent-600"
                          : selectedElement.type === "interactive-question"
                          ? "from-blue-500 to-blue-600"
                          : selectedElement.type === "image"
                          ? "from-emerald-500 to-emerald-600"
                          : selectedElement.type === "pointer"
                          ? "from-amber-500 to-amber-600"
                          : "from-primary-500 to-primary-600"
                      } flex items-center justify-center text-white shadow-medium`}
                    >
                      <i className="fas fa-clock"></i>
                    </div>
                    <div>
                      <h2 className="font-bold text-secondary-900 capitalize">
                        {selectedElement.type.replace("-", " ")} Timing
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
                      <i className="fas fa-thumbtack"></i>
                    </button>
                    <button
                      className="p-2 text-secondary-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-soft"
                      title="Duplicate"
                    >
                      <i className="fas fa-copy"></i>
                    </button>
                    <button
                      onClick={() => handleElementDelete(selectedElement.id)}
                      className="p-2 text-secondary-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-soft"
                      title="Delete"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-secondary-200 shadow-soft">
                  <h3 className="text-sm font-bold text-secondary-800 mb-4 flex items-center">
                    <i className="fas fa-cog mr-2 text-primary-600"></i>
                    General Settings
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-secondary-50 rounded-xl">
                      <label className="text-sm font-medium text-secondary-700">
                        Keep it always visible
                      </label>
                      <div className="relative">
                        <input
                          type="checkbox"
                          id="always-visible"
                          className="sr-only peer"
                        />
                        <label
                          htmlFor="always-visible"
                          className="relative flex cursor-pointer items-center justify-center rounded-full bg-secondary-300 p-1 text-secondary-600 transition-colors duration-300 peer-checked:bg-primary-600 peer-checked:text-white w-12 h-6"
                        >
                          <div className="absolute left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 peer-checked:translate-x-6"></div>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-secondary-800 mb-3">
                        Duration
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="number"
                          placeholder="min"
                          className="px-3 py-3 border-2 border-secondary-200 rounded-xl text-center focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-secondary-50 font-mono"
                        />
                        <input
                          type="number"
                          placeholder="sec"
                          className="px-3 py-3 border-2 border-secondary-200 rounded-xl text-center focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-secondary-50 font-mono"
                        />
                        <input
                          type="number"
                          placeholder="ms"
                          className="px-3 py-3 border-2 border-secondary-200 rounded-xl text-center focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-secondary-50 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-secondary-200 shadow-soft">
                  <h3 className="text-sm font-bold text-secondary-800 mb-4 flex items-center">
                    <i className="fas fa-stopwatch mr-2 text-primary-600"></i>
                    Timing Control
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-secondary-800 mb-3">
                        Start Time
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="number"
                          value={Math.floor(selectedElement.timestamp / 60)}
                          onChange={(e) => {
                            const minutes = parseInt(e.target.value) || 0;
                            const seconds = selectedElement.timestamp % 60;
                            handleElementUpdate({
                              ...selectedElement,
                              timestamp: minutes * 60 + seconds,
                            });
                          }}
                          className="px-3 py-3 border-2 border-secondary-200 rounded-xl text-center focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-secondary-50 font-mono"
                          placeholder="min"
                        />
                        <input
                          type="number"
                          value={Math.floor(selectedElement.timestamp % 60)}
                          onChange={(e) => {
                            const minutes = Math.floor(
                              selectedElement.timestamp / 60
                            );
                            const seconds = parseInt(e.target.value) || 0;
                            handleElementUpdate({
                              ...selectedElement,
                              timestamp: minutes * 60 + seconds,
                            });
                          }}
                          className="px-3 py-3 border-2 border-secondary-200 rounded-xl text-center focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-secondary-50 font-mono"
                          placeholder="sec"
                        />
                        <input
                          type="number"
                          placeholder="ms"
                          className="px-3 py-3 border-2 border-secondary-200 rounded-xl text-center focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-secondary-50 font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-secondary-800 mb-3">
                        End Time
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="number"
                          value={Math.floor(selectedElement.endTime / 60)}
                          onChange={(e) => {
                            const minutes = parseInt(e.target.value) || 0;
                            const seconds = selectedElement.endTime % 60;
                            handleElementUpdate({
                              ...selectedElement,
                              endTime: minutes * 60 + seconds,
                            });
                          }}
                          className="px-3 py-3 border-2 border-secondary-200 rounded-xl text-center focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-secondary-50 font-mono"
                          placeholder="min"
                        />
                        <input
                          type="number"
                          value={Math.floor(selectedElement.endTime % 60)}
                          onChange={(e) => {
                            const minutes = Math.floor(
                              selectedElement.endTime / 60
                            );
                            const seconds = parseInt(e.target.value) || 0;
                            handleElementUpdate({
                              ...selectedElement,
                              endTime: minutes * 60 + seconds,
                            });
                          }}
                          className="px-3 py-3 border-2 border-secondary-200 rounded-xl text-center focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-secondary-50 font-mono"
                          placeholder="sec"
                        />
                        <input
                          type="number"
                          placeholder="ms"
                          className="px-3 py-3 border-2 border-secondary-200 rounded-xl text-center focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-secondary-50 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-secondary-200 shadow-soft">
                  <h3 className="text-sm font-bold text-secondary-800 mb-4 flex items-center">
                    <i className="fas fa-eye mr-2 text-primary-600"></i>
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

                    <div className="flex justify-between items-center p-3 bg-secondary-50 rounded-xl">
                      <label
                        htmlFor="set-timeframe"
                        className="text-sm font-medium text-secondary-700"
                      >
                        Set custom timeframe
                      </label>
                      <div className="relative">
                        <input
                          type="checkbox"
                          id="set-timeframe"
                          className="sr-only peer"
                        />
                        <label
                          htmlFor="set-timeframe"
                          className="relative flex cursor-pointer items-center justify-center rounded-full bg-secondary-300 p-1 text-secondary-600 transition-colors duration-300 peer-checked:bg-primary-600 peer-checked:text-white w-12 h-6"
                        >
                          <div className="absolute left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 peer-checked:translate-x-6"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-secondary-200 shadow-soft">
                  <h3 className="text-sm font-bold text-secondary-800 mb-4 flex items-center">
                    <i className="fas fa-play-circle mr-2 text-primary-600"></i>
                    Video Behavior
                  </h3>
                  <div className="space-y-3">
                    {[
                      {
                        id: "pause-on-show",
                        label: "Pause video when element appears",
                        desc: "Video will pause when this element becomes visible",
                      },
                      {
                        id: "sound-bell",
                        label: "Play notification sound",
                        desc: "Sound alert when element appears",
                      },
                      {
                        id: "pause-on-click",
                        label: "Pause video on interaction",
                        desc: "Video pauses when user interacts with element",
                      },
                      {
                        id: "interactivity-indication",
                        label: "Show interaction indicator",
                        desc: "Visual cue that element is interactive",
                      },
                    ].map(({ id, label, desc }) => (
                      <div
                        key={id}
                        className="flex justify-between items-start p-3 bg-secondary-50 rounded-xl"
                      >
                        <div className="flex-1">
                          <span className="text-sm font-medium text-secondary-700 block">
                            {label}
                          </span>
                          <span className="text-xs text-secondary-500">
                            {desc}
                          </span>
                        </div>
                        <div className="relative ml-3">
                          <input
                            type="checkbox"
                            id={id}
                            className="sr-only peer"
                          />
                          <label
                            htmlFor={id}
                            className="relative flex cursor-pointer items-center justify-center rounded-full bg-secondary-300 p-1 text-secondary-600 transition-colors duration-300 peer-checked:bg-primary-600 peer-checked:text-white w-12 h-6"
                          >
                            <div className="absolute left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 peer-checked:translate-x-6"></div>
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeInspectorTab === "format" && selectedElement && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white shadow-medium">
                    <i className="fas fa-palette"></i>
                  </div>
                  <div>
                    <h2 className="font-bold text-secondary-900">
                      Format & Style
                    </h2>
                    <p className="text-xs text-secondary-500">
                      Customize the appearance
                    </p>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-secondary-200 shadow-soft">
                  <h3 className="text-sm font-bold text-secondary-800 mb-3 flex items-center">
                    <i className="fas fa-font mr-2 text-primary-600"></i>
                    Text Styling
                  </h3>
                  <div className="grid grid-cols-6 gap-2">
                    {[
                      {
                        icon: "fa-bold",
                        title: "Bold",
                        action: () => console.log("Bold clicked"),
                      },
                      {
                        icon: "fa-italic",
                        title: "Italic",
                        action: () => console.log("Italic clicked"),
                      },
                      {
                        icon: "fa-underline",
                        title: "Underline",
                        action: () => console.log("Underline clicked"),
                      },
                      {
                        icon: "fa-strikethrough",
                        title: "Strikethrough",
                        action: () => console.log("Strikethrough clicked"),
                      },
                      {
                        icon: "fa-subscript",
                        title: "Subscript",
                        action: () => console.log("Subscript clicked"),
                      },
                      {
                        icon: "fa-superscript",
                        title: "Superscript",
                        action: () => console.log("Superscript clicked"),
                      },
                      {
                        icon: "fa-align-left",
                        title: "Align Left",
                        action: () => console.log("Align Left clicked"),
                      },
                      {
                        icon: "fa-align-center",
                        title: "Align Center",
                        action: () => console.log("Align Center clicked"),
                      },
                      {
                        icon: "fa-align-right",
                        title: "Align Right",
                        action: () => console.log("Align Right clicked"),
                      },
                      {
                        icon: "fa-list",
                        title: "List",
                        action: () => console.log("List clicked"),
                      },
                      {
                        icon: "fa-table",
                        title: "Table",
                        action: () => console.log("Table clicked"),
                      },
                      {
                        icon: "fa-link",
                        title: "Link",
                        action: () => console.log("Link clicked"),
                      },
                    ].map(({ icon, title, action }) => (
                      <button
                        key={icon}
                        className="p-3 text-secondary-600 hover:text-white hover:bg-primary-600 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-soft hover:shadow-medium"
                        title={title}
                        onClick={action}
                      >
                        <i className={`fas ${icon}`}></i>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-secondary-200 shadow-soft">
                  <label className="block text-sm font-bold text-secondary-800 mb-3 flex items-center">
                    <i className="fas fa-edit mr-2 text-primary-600"></i>
                    Content
                  </label>
                  <textarea
                    value={selectedElement.content}
                    onChange={(e) =>
                      handleElementUpdate({
                        ...selectedElement,
                        content: e.target.value,
                      })
                    }
                    placeholder="Write your text content here..."
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 resize-none bg-secondary-50 text-secondary-900 placeholder-secondary-500"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-secondary-200 shadow-soft">
                    <label className="block text-sm font-bold text-secondary-800 mb-3 flex items-center">
                      <i className="fas fa-palette mr-2 text-primary-600"></i>
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
                        <span className="text-xs text-secondary-500">
                          #2563eb
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-secondary-200 shadow-soft">
                    <label className="block text-sm font-bold text-secondary-800 mb-3 flex items-center">
                      <i className="fas fa-text-width mr-2 text-primary-600"></i>
                      Letter Spacing
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      defaultValue="0"
                      className="w-full accent-primary-600"
                    />
                  </div>

                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-secondary-200 shadow-soft">
                    <label className="block text-sm font-bold text-secondary-800 mb-3 flex items-center">
                      <i className="fas fa-text-height mr-2 text-primary-600"></i>
                      Line Height
                    </label>
                    <input
                      type="number"
                      defaultValue="42"
                      className="w-full px-4 py-3 border-2 border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-secondary-50"
                    />
                  </div>

                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-secondary-200 shadow-soft">
                    <label className="block text-sm font-bold text-secondary-800 mb-3 flex items-center">
                      <i className="fas fa-adjust mr-2 text-primary-600"></i>
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

                <button className="w-full px-4 py-3 text-white bg-secondary-600 hover:bg-secondary-700 rounded-xl transition-all duration-200 font-medium shadow-soft hover:shadow-medium transform hover:scale-105">
                  <i className="fas fa-undo mr-2"></i>
                  Reset All Styles
                </button>
              </div>
            )}

            {activeInspectorTab === "effects" && selectedElement && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500 to-primary-600 flex items-center justify-center text-white shadow-medium">
                    <i className="fas fa-magic"></i>
                  </div>
                  <div>
                    <h2 className="font-bold text-secondary-900">
                      Effects & Animation
                    </h2>
                    <p className="text-xs text-secondary-500">
                      Add visual effects and animations
                    </p>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-secondary-200 shadow-soft">
                  <h3 className="text-sm font-bold text-secondary-800 mb-4 flex items-center">
                    <i className="fas fa-play mr-2 text-primary-600"></i>
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
                        <option>Slide in from top</option>
                        <option>Slide in from bottom</option>
                        <option>Scale in</option>
                        <option>Bounce in</option>
                        <option>Rotate in</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-secondary-800 mb-3">
                        Duration (seconds)
                      </label>
                      <input
                        type="range"
                        min="0.1"
                        max="3"
                        step="0.1"
                        defaultValue="0.5"
                        className="w-full accent-primary-600"
                      />
                      <div className="flex justify-between text-xs text-secondary-500 mt-1">
                        <span>0.1s</span>
                        <span className="font-mono">0.5s</span>
                        <span>3.0s</span>
                      </div>
                    </div>

                    <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-white bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-medium hover:shadow-large font-medium">
                      <i className="fas fa-play"></i>
                      <span>Preview Animation</span>
                    </button>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-secondary-200 shadow-soft">
                  <h3 className="text-sm font-bold text-secondary-800 mb-4 flex items-center">
                    <i className="fas fa-eye-slash mr-2 text-primary-600"></i>
                    Exit Animation
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-secondary-800 mb-3">
                        Exit Effect
                      </label>
                      <select className="w-full px-4 py-3 border-2 border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-secondary-50">
                        <option>Fade out</option>
                        <option>Slide out left</option>
                        <option>Slide out right</option>
                        <option>Slide out up</option>
                        <option>Slide out down</option>
                        <option>Scale out</option>
                        <option>Bounce out</option>
                        <option>Rotate out</option>
                      </select>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-secondary-50 rounded-xl">
                      <label className="text-sm font-medium text-secondary-700">
                        Auto exit when time ends
                      </label>
                      <div className="relative">
                        <input
                          type="checkbox"
                          id="auto-exit"
                          className="sr-only peer"
                          defaultChecked
                        />
                        <label
                          htmlFor="auto-exit"
                          className="relative flex cursor-pointer items-center justify-center rounded-full bg-secondary-300 p-1 text-secondary-600 transition-colors duration-300 peer-checked:bg-primary-600 peer-checked:text-white w-12 h-6"
                        >
                          <div className="absolute left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 peer-checked:translate-x-6"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-secondary-200 shadow-soft">
                  <h3 className="text-sm font-bold text-secondary-800 mb-4 flex items-center">
                    <i className="fas fa-sparkles mr-2 text-primary-600"></i>
                    Visual Effects
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-secondary-800 mb-3">
                        Shadow Effect
                      </label>
                      <div className="flex items-center space-x-3">
                        <input
                          type="range"
                          min="0"
                          max="20"
                          defaultValue="4"
                          className="flex-1 accent-primary-600"
                        />
                        <span className="text-sm font-mono text-secondary-700 min-w-12 text-center">
                          4px
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-secondary-800 mb-3">
                        Border Radius
                      </label>
                      <div className="flex items-center space-x-3">
                        <input
                          type="range"
                          min="0"
                          max="50"
                          defaultValue="8"
                          className="flex-1 accent-primary-600"
                        />
                        <span className="text-sm font-mono text-secondary-700 min-w-12 text-center">
                          8px
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-secondary-50 rounded-xl">
                      <label className="text-sm font-medium text-secondary-700">
                        Glow effect on hover
                      </label>
                      <div className="relative">
                        <input
                          type="checkbox"
                          id="glow-effect"
                          className="sr-only peer"
                        />
                        <label
                          htmlFor="glow-effect"
                          className="relative flex cursor-pointer items-center justify-center rounded-full bg-secondary-300 p-1 text-secondary-600 transition-colors duration-300 peer-checked:bg-primary-600 peer-checked:text-white w-12 h-6"
                        >
                          <div className="absolute left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 peer-checked:translate-x-6"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-secondary-200 shadow-soft">
                  <h3 className="text-sm font-bold text-secondary-800 mb-4 flex items-center">
                    <i className="fas fa-heartbeat mr-2 text-primary-600"></i>
                    Interactive Effects
                  </h3>
                  <div className="space-y-3">
                    {[
                      {
                        id: "pulse-on-show",
                        label: "Pulse when visible",
                        desc: "Element pulses to draw attention",
                      },
                      {
                        id: "bounce-on-click",
                        label: "Bounce on interaction",
                        desc: "Element bounces when clicked",
                      },
                      {
                        id: "scale-on-hover",
                        label: "Scale on hover",
                        desc: "Element grows slightly on hover",
                      },
                      {
                        id: "highlight-border",
                        label: "Highlight border",
                        desc: "Animated border when active",
                      },
                    ].map(({ id, label, desc }) => (
                      <div
                        key={id}
                        className="flex justify-between items-start p-3 bg-secondary-50 rounded-xl"
                      >
                        <div className="flex-1">
                          <span className="text-sm font-medium text-secondary-700 block">
                            {label}
                          </span>
                          <span className="text-xs text-secondary-500">
                            {desc}
                          </span>
                        </div>
                        <div className="relative ml-3">
                          <input
                            type="checkbox"
                            id={id}
                            className="sr-only peer"
                          />
                          <label
                            htmlFor={id}
                            className="relative flex cursor-pointer items-center justify-center rounded-full bg-secondary-300 p-1 text-secondary-600 transition-colors duration-300 peer-checked:bg-primary-600 peer-checked:text-white w-12 h-6"
                          >
                            <div className="absolute left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 peer-checked:translate-x-6"></div>
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {!selectedElement && (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <i className="fas fa-mouse-pointer text-4xl mb-4 text-gray-300"></i>
                <p className="text-sm text-center">
                  Select an element from the timeline or canvas to edit its
                  properties
                </p>
              </div>
            )}
          </div>
        </aside>
      </main>

      {/* Modern Element Selection Modal */}
      {showElementModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-large max-w-4xl w-full max-h-[85vh] overflow-hidden animate-scale-in border border-primary-200/50">
            <div className="sticky top-0 bg-gradient-to-r from-primary-600 to-accent-600 px-8 py-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-1">
                    Add Interactive Element
                  </h2>
                  <p className="text-primary-100 text-sm">
                    Choose an element type to add to your video
                  </p>
                </div>
                <button
                  onClick={() => setShowElementModal(false)}
                  className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-all duration-200 transform hover:scale-110"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
            </div>

            <div className="p-8 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ELEMENT_TYPES.map((elementType) => {
                  const getElementColor = (type: string) => {
                    switch (type) {
                      case "text":
                        return "from-primary-500 to-primary-600";
                      case "interactive-button":
                        return "from-accent-500 to-accent-600";
                      case "interactive-question":
                        return "from-blue-500 to-blue-600";
                      case "image":
                        return "from-emerald-500 to-emerald-600";
                      case "pointer":
                        return "from-amber-500 to-amber-600";
                      case "opener":
                        return "from-purple-500 to-purple-600";
                      default:
                        return "from-primary-500 to-primary-600";
                    }
                  };

                  return (
                    <button
                      key={elementType.type}
                      onClick={() =>
                        handleElementTypeSelect(elementType.type as ElementType)
                      }
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
                            {elementType.type === "text" && "Add text overlays"}
                            {elementType.type === "interactive-button" &&
                              "Clickable buttons"}
                            {elementType.type === "interactive-question" &&
                              "Interactive quizzes"}
                            {elementType.type === "image" && "Image overlays"}
                            {elementType.type === "pointer" && "Point to areas"}
                            {elementType.type === "opener" && "Content openers"}
                          </p>
                        </div>
                      </div>

                      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-accent-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 p-4 bg-primary-50 rounded-2xl border border-primary-200">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                    <i className="fas fa-lightbulb text-white text-sm"></i>
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
