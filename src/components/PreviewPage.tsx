import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import VideoPlayerPreview from './VideoPlayerPreview';
import type { InteractiveElement } from '../types';
import { storage } from '../utils';
import '../styles/PreviewPage.css';

const PreviewPage = () => {
  const navigate = useNavigate();
  const [elements, setElements] = useState<InteractiveElement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadProject = () => {
    try {
      const savedElements = storage.load();
      setElements(savedElements);
    } catch (error) {
      console.error('Error loading project data:', error);
      setElements([]);
    } finally {
      setIsLoading(false);
    }
  };

  const goBackToAdmin = () => {
    navigate('/admin');
  };

  useEffect(() => {
    loadProject();
  }, []);

  if (isLoading) {
    return (
      <div className="preview-page loading">
        <div className="loading-message">Loading interactive video...</div>
      </div>
    );
  }

  return (
    <div className="preview-page">
      {/* Top Navigation */}
      <div className="preview-navbar">
        <div className="nav-left">
          <button className="back-btn" onClick={goBackToAdmin}>
            ← Back to Admin
          </button>
        </div>
        <div className="nav-center">
          <h1 className="preview-title">Interactive Video Preview</h1>
        </div>
        <div className="nav-right">
          <span className="element-count">{elements.length} Elements</span>
        </div>
      </div>

      {/* Video Player */}
      <div className="preview-content">
        <VideoPlayerPreview elements={elements} />
      </div>

      {/* Footer Info */}
      <div className="preview-footer">
        <div className="footer-info">
          <p>This is a preview of your interactive video with all configured elements.</p>
          <p>Click on interactive elements when they appear to test their functionality.</p>
        </div>
      </div>
    </div>
  );
};

export default PreviewPage;
