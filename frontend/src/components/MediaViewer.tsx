import React, { useState, useRef, useEffect } from 'react';

interface MediaViewerProps {
  type: 'video' | 'image' | 'desmos' | 'pdf';
  src: string;
  title?: string;
  onDownload?: () => void;
  interactive?: boolean;
  width?: string | number;
  height?: string | number;
  className?: string;
}

const MediaViewer: React.FC<MediaViewerProps> = ({
  type,
  src,
  title,
  onDownload,
  interactive = false,
  width = '100%',
  height = 'auto',
  className = '',
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const mediaRef = useRef<HTMLVideoElement | HTMLImageElement | HTMLIFrameElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Handle click interactions on the media
  const handleMediaClick = () => {
    if (type === 'video' && mediaRef.current) {
      const videoElement = mediaRef.current as HTMLVideoElement;
      if (videoElement.paused) {
        videoElement.play();
        setIsPlaying(true);
      } else {
        videoElement.pause();
        setIsPlaying(false);
      }
    }
    
    if (interactive) {
      // Additional interactive behavior could be added here
      console.log('Interactive click on media');
    }
  };
  
  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };
  
  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === containerRef.current);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);
  
  // Handle download
  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else {
      // Default download behavior
      const link = document.createElement('a');
      link.href = src;
      link.download = title || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const renderMedia = () => {
    switch (type) {
      case 'video':
        return (
          <video
            ref={mediaRef as React.RefObject<HTMLVideoElement>}
            src={src}
            controls={!interactive} // Hide controls if interactive mode
            onClick={interactive ? handleMediaClick : undefined}
            style={{ width, height }}
            className="rounded-lg"
          />
        );
        
      case 'image':
        return (
          <img
            ref={mediaRef as React.RefObject<HTMLImageElement>}
            src={src}
            alt={title || 'Image'}
            onClick={interactive ? handleMediaClick : undefined}
            style={{ width, height }}
            className="rounded-lg"
          />
        );
        
      case 'desmos':
        return (
          <iframe
            ref={mediaRef as React.RefObject<HTMLIFrameElement>}
            src={src.startsWith('http') ? src : `https://www.desmos.com/calculator/${src}`}
            title={title || 'Desmos Graph'}
            style={{ width, height: height || '400px' }}
            className="rounded-lg border-0"
            allowFullScreen
          />
        );
        
      case 'pdf':
        return (
          <iframe
            ref={mediaRef as React.RefObject<HTMLIFrameElement>}
            src={src}
            title={title || 'PDF Document'}
            style={{ width, height: height || '600px' }}
            className="rounded-lg border-0"
          />
        );
        
      default:
        return <div>Unsupported media type</div>;
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`media-viewer relative group ${className}`}
      style={{ width }}
    >
      {renderMedia()}
      
      {/* Overlay controls that appear on hover */}
      <div className="absolute inset-0 flex items-start justify-end opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-20 rounded-lg">
        <div className="flex space-x-2 p-3">
          {type === 'video' && interactive && (
            <button 
              onClick={handleMediaClick}
              className="p-2 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100 transition"
            >
              <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
            </button>
          )}
          
          <button 
            onClick={toggleFullscreen}
            className="p-2 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100 transition"
          >
            <i className={`fas ${isFullscreen ? 'fa-compress' : 'fa-expand'}`}></i>
          </button>
          
          <button 
            onClick={handleDownload}
            className="p-2 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100 transition"
          >
            <i className="fas fa-download"></i>
          </button>
        </div>
      </div>
      
      {/* Caption/title */}
      {title && (
        <div className="mt-2 text-sm text-center text-gray-300">
          {title}
        </div>
      )}
    </div>
  );
};

export default MediaViewer;