import React from 'react';
import { Excalidraw, ExcalidrawElement } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";

interface DrawingBoardProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  onClose?: () => void;
  initialData?: ExcalidrawElement[];
  prompt?: string;
}

const DrawingBoard: React.FC<DrawingBoardProps> = ({ 
  width = "100%", 
  height = "500px",
  className = "",
  onClose,
  initialData = [],
  prompt = ""
}) => {
  return (
    <div 
      className={`drawing-board custom-excalidraw-wrapper ${className}`}
      style={{ width, height }}
    >
      {prompt && (
        <div className="px-4 py-2 bg-gray-800 text-white text-sm">
          <strong>Prompt:</strong> {prompt}
        </div>
      )}
      
      <Excalidraw
        initialData={{
          elements: initialData,
          appState: { viewBackgroundColor: "#1a1a1a" }
        }}
      />
      
      {onClose && (
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 p-2 bg-gray-800 bg-opacity-70 rounded-full hover:bg-opacity-100 transition text-white"
          aria-label="Close drawing board"
        >
          <i className="fas fa-times"></i>
        </button>
      )}
    </div>
  );
};

export default DrawingBoard;