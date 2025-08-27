import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import VideoPlayerPreview from "./VideoPlayerPreview";
import type { InteractiveElement } from "../types";
import { storage } from "../utils";

const PreviewPage = () => {
  const navigate = useNavigate();
  const [elements, setElements] = useState<InteractiveElement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadProject = () => {
    try {
      const savedElements = storage.load();

      setElements(savedElements);
    } catch (error) {
      console.error("Error loading project data:", error);
      setElements([]);
    } finally {
      setIsLoading(false);
    }
  };

  const goBackToAdmin = () => {
    navigate("/admin");
  };

  useEffect(() => {
    loadProject();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-secondary-900 to-secondary-800">
        <div className="animate-spin rounded-full h-32 w-32 border-4 border-primary-200 border-t-primary-600 mb-6"></div>
        <div className="text-white text-xl font-medium">Loading interactive video...</div>
        <div className="text-primary-200 text-sm mt-2">Preparing your immersive experience</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-secondary-900 to-secondary-800 text-white">
      {/* Top Navigation */}
      <header className="flex items-center justify-between px-6 py-4 bg-secondary-800/80 backdrop-blur-sm border-b border-secondary-700 shadow-soft">
        <div className="flex items-center">
          <button 
            className="flex items-center space-x-2 px-4 py-2.5 text-white bg-secondary-700 hover:bg-secondary-600 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-soft"
            onClick={goBackToAdmin}
          >
            <i className="fas fa-arrow-left"></i>
            <span>Back to Admin</span>
          </button>
        </div>
        <div className="flex-1 text-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">Interactive Video Preview</h1>
        </div>
        <div className="flex items-center">
          <span className="px-4 py-2 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-full text-sm font-bold shadow-medium">
            {elements.length} Element{elements.length !== 1 ? 's' : ''}
          </span>
        </div>
      </header>

      {/* Video Player */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-6xl">
          <div className="rounded-2xl overflow-hidden shadow-large border border-secondary-700/50">
            <VideoPlayerPreview elements={elements} />
          </div>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="px-6 py-4 bg-secondary-800/80 backdrop-blur-sm border-t border-secondary-700">
        <div className="text-center text-secondary-300">
          <p className="text-sm mb-1 font-medium">
            This is a preview of your interactive video with all configured elements.
          </p>
          <p className="text-xs text-secondary-400">
            Click on interactive elements when they appear to test their functionality.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PreviewPage;
