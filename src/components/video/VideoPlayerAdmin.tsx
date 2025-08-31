import {
  forwardRef,
  useState,
  useRef,
  useImperativeHandle,
  useEffect,
} from "react";
import {
  MediaPlayer,
  MediaProvider,
  MediaPlayerInstance,
} from "@vidstack/react";
import {
  defaultLayoutIcons,
  DefaultVideoLayout,
} from "@vidstack/react/player/layouts/default";
import type {
  InteractiveElement,
  VideoPlayerAdminProps,
  VideoPlayerRef,
} from "../../types";
import { VIDEO_CONFIG } from "../../constants";
import { elementUtils } from "../../utils";
import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";

const VideoPlayerAdmin = forwardRef<VideoPlayerRef, VideoPlayerAdminProps>(
  ({ elements, onAddElement, onTimeUpdate }, ref) => {
    const [currentTime, setCurrentTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [isLoaded, setIsLoaded] = useState(false);
    const playerRef = useRef<MediaPlayerInstance>(null);

    useImperativeHandle(ref, () => ({
      get currentTime() {
        return currentTime;
      },
      seek: (time: number) => {
        const player = playerRef.current;
        if (player) {
          player.currentTime = time;
        }
      },
    }));

    useEffect(() => {
      const player = playerRef.current;
      if (player) {
        const handleLoadedData = () => {
          setIsLoaded(true);
        };
        
        const handleError = (error: any) => {
          console.error('Video loading error:', error);
        };
        
        player.addEventListener('loadeddata', handleLoadedData);
        player.addEventListener('error', handleError);
        
        return () => {
          player.removeEventListener('loadeddata', handleLoadedData);
          player.removeEventListener('error', handleError);
        };
      }
    }, []);

    const getVisibleElements = () => {
      return elementUtils.getVisibleElements(elements, currentTime);
    };

    const renderInteractiveElement = (element: InteractiveElement) => {
      return (
        <div
          key={element.id}
          className={`interactive-element ${element.type} admin-mode`}
          style={{
            left: `${element.x}px`,
            top: `${element.y}px`,
            minWidth:
              element.type === "interactive-question" ? "200px" : "auto",
          }}
          onClick={(e) => e.stopPropagation()}
          title={`${element.type}: ${element.content}`}
        >
          {element.type === "image" && element.url ? (
            <img
              src={element.url}
              alt={element.content}
              className="element-image max-w-full h-auto"
            />
          ) : (
            <div className="element-content">
              <span className="element-text">{element.content}</span>
              <span className="element-type-badge">{element.type}</span>
            </div>
          )}
        </div>
      );
    };

    return (
      <div className="relative w-full h-full bg-gradient-to-br from-secondary-900 to-secondary-800 rounded-2xl overflow-hidden border border-secondary-700/30">
        <MediaPlayer
          ref={playerRef}
          className="w-full h-full"
          src={VIDEO_CONFIG.URL}
          playsInline
          autoplay={false}
          controls
          onTimeUpdate={({ currentTime }) => {
            setCurrentTime(currentTime);
            onTimeUpdate?.(currentTime);
          }}
          onDurationChange={(event) => setDuration(event.duration)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onLoadedData={() => setIsLoaded(true)}
        >
          <MediaProvider className="w-full h-full rounded-2xl" />
          <DefaultVideoLayout 
            icons={defaultLayoutIcons} 
            thumbnails="" 
            className="w-full h-full"
          />
        </MediaPlayer>
        
        {/* Interactive Elements Overlay */}
        {isLoaded && (
          <div className="absolute inset-0 pointer-events-none">
            {getVisibleElements().map((element) => renderInteractiveElement(element))}
          </div>
        )}
        
        {!isLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-secondary-900/90 backdrop-blur-sm">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-600 mb-4"></div>
            <div className="text-white text-lg font-medium">Loading video...</div>
            <div className="text-primary-200 text-sm mt-1">Please wait a moment</div>
          </div>
        )}
      </div>
    );
  }
);

VideoPlayerAdmin.displayName = "VideoPlayerAdmin";

export default VideoPlayerAdmin;
